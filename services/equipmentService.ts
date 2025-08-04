// Serviço para gerenciamento de dados de equipamentos no localStorage

import { Equipment, EquipmentUsed, UseEquipmentData, UsageHistoryItem } from '@/types/equipment';
import { EquipmentValidators, UsageValidators } from '@/utils/validation';

const STORAGE_KEYS = {
  EQUIPMENTS: 'equipments',
  USED_EQUIPMENTS: 'used_equipments',
  USAGE_HISTORY: 'usage_history',
} as const;

export class EquipmentService {
  // Métodos para equipamentos
  static getEquipments(): Equipment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      return [];
    }
  }

  static saveEquipments(equipments: Equipment[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(equipments));
    } catch (error) {
      console.error('Erro ao salvar equipamentos:', error);
      throw new Error('Falha ao salvar dados no armazenamento local');
    }
  }

  static addEquipment(equipment: Omit<Equipment, 'id' | 'dataAdicao' | 'dataUltimaAtualizacao'>): Equipment {
    const equipments = this.getEquipments();
    const existingCodes = equipments.map(eq => eq.codigo);
    
    // Validar dados antes de adicionar
    const errors = this.validateEquipment(equipment, existingCodes);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const now = new Date().toISOString();
    
    const newEquipment: Equipment = {
      ...equipment,
      id: this.generateId(),
      dataAdicao: now,
      dataUltimaAtualizacao: now,
    };

    equipments.push(newEquipment);
    this.saveEquipments(equipments);
    
    // Registrar no histórico
    this.addToHistory({
      id: this.generateId(),
      equipmentId: newEquipment.id,
      equipmentName: newEquipment.nome,
      action: 'added',
      timestamp: now,
      user: 'Sistema', // TODO: Implementar usuário logado
      details: `Equipamento ${newEquipment.nome} adicionado ao estoque`,
    });

    return newEquipment;
  }

  static updateEquipment(id: string, updates: Partial<Equipment>): Equipment {
    const equipments = this.getEquipments();
    const index = equipments.findIndex(eq => eq.id === id);
    
    if (index === -1) {
      throw new Error('Equipamento não encontrado');
    }

    // Validar dados antes de atualizar
    const existingCodes = equipments.map(eq => eq.codigo).filter((_, i) => i !== index);
    const errors = this.validateEquipment(updates, existingCodes);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const updatedEquipment = {
      ...equipments[index],
      ...updates,
      dataUltimaAtualizacao: new Date().toISOString(),
    };

    equipments[index] = updatedEquipment;
    this.saveEquipments(equipments);

    // Registrar no histórico
    this.addToHistory({
      id: this.generateId(),
      equipmentId: id,
      equipmentName: updatedEquipment.nome,
      action: 'edited',
      timestamp: new Date().toISOString(),
      user: 'Sistema',
      details: `Equipamento ${updatedEquipment.nome} foi atualizado`,
    });

    return updatedEquipment;
  }

  static deleteEquipment(id: string): boolean {
    const equipments = this.getEquipments();
    const equipment = equipments.find(eq => eq.id === id);
    
    if (!equipment) {
      throw new Error('Equipamento não encontrado');
    }

    // Verificar se o equipamento está em uso
    const usedEquipments = this.getUsedEquipments();
    const isInUse = usedEquipments.some(used => used.equipmentId === id && used.status === 'em_uso');
    
    if (isInUse) {
      throw new Error('Não é possível excluir um equipamento que está em uso');
    }

    const filteredEquipments = equipments.filter(eq => eq.id !== id);
    this.saveEquipments(filteredEquipments);

    // Registrar no histórico
    this.addToHistory({
      id: this.generateId(),
      equipmentId: id,
      equipmentName: equipment.nome,
      action: 'deleted',
      timestamp: new Date().toISOString(),
      user: 'Sistema',
      details: `Equipamento ${equipment.nome} foi removido do estoque`,
    });

    return true;
  }

  // Métodos para equipamentos em uso
  static getUsedEquipments(): EquipmentUsed[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USED_EQUIPMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar equipamentos em uso:', error);
      return [];
    }
  }

  static saveUsedEquipments(usedEquipments: EquipmentUsed[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USED_EQUIPMENTS, JSON.stringify(usedEquipments));
    } catch (error) {
      console.error('Erro ao salvar equipamentos em uso:', error);
      throw new Error('Falha ao salvar dados no armazenamento local');
    }
  }

  static useEquipment(equipmentId: string, useData: UseEquipmentData): EquipmentUsed {
    const equipments = this.getEquipments();
    const equipment = equipments.find(eq => eq.id === equipmentId);
    
    if (!equipment) {
      throw new Error('Equipamento não encontrado');
    }

    // Validar dados de uso
    const errors = this.validateUseData(useData, equipment.quantidade);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    if (equipment.quantidade < useData.quantidade) {
      throw new Error('Quantidade insuficiente no estoque');
    }

    // Atualizar quantidade no estoque
    equipment.quantidade -= useData.quantidade;
    equipment.dataUltimaAtualizacao = new Date().toISOString();
    this.saveEquipments(equipments);

    // Criar registro de uso
    const now = new Date().toISOString();
    const usedEquipment: EquipmentUsed = {
      id: this.generateId(),
      equipmentId: equipment.id,
      codigo: equipment.codigo,
      nome: equipment.nome,
      quantidade: useData.quantidade,
      local: useData.local,
      responsavel: useData.responsavel,
      contato: useData.contato,
      dataUso: now,
      dataPrevistaDevolucao: useData.dataPrevistaDevolucao,
      observacoes: useData.observacoes,
      status: 'em_uso',
      aprovadoPor: useData.aprovadoPor,
    };

    const usedEquipments = this.getUsedEquipments();
    usedEquipments.push(usedEquipment);
    this.saveUsedEquipments(usedEquipments);

    // Registrar no histórico
    this.addToHistory({
      id: this.generateId(),
      equipmentId: equipment.id,
      equipmentName: equipment.nome,
      action: 'used',
      timestamp: now,
      user: 'Sistema',
      details: `${useData.quantidade} unidade(s) de ${equipment.nome} retirada(s) por ${useData.responsavel}`,
    });

    return usedEquipment;
  }

  static returnEquipment(usedEquipmentId: string): boolean {
    const usedEquipments = this.getUsedEquipments();
    const usedEquipment = usedEquipments.find(used => used.id === usedEquipmentId);
    
    if (!usedEquipment) {
      throw new Error('Registro de uso não encontrado');
    }

    if (usedEquipment.status !== 'em_uso') {
      throw new Error('Este equipamento já foi devolvido');
    }

    // Atualizar quantidade no estoque
    const equipments = this.getEquipments();
    const equipment = equipments.find(eq => eq.id === usedEquipment.equipmentId);
    
    if (equipment) {
      equipment.quantidade += usedEquipment.quantidade;
      equipment.dataUltimaAtualizacao = new Date().toISOString();
      this.saveEquipments(equipments);
    }

    // Atualizar status do equipamento usado
    usedEquipment.status = 'devolvido';
    usedEquipment.dataEfetivaDevolucao = new Date().toISOString();
    this.saveUsedEquipments(usedEquipments);

    // Registrar no histórico
    this.addToHistory({
      id: this.generateId(),
      equipmentId: usedEquipment.equipmentId,
      equipmentName: usedEquipment.nome,
      action: 'returned',
      timestamp: new Date().toISOString(),
      user: 'Sistema',
      details: `${usedEquipment.quantidade} unidade(s) de ${usedEquipment.nome} devolvida(s) por ${usedEquipment.responsavel}`,
    });

    return true;
  }

  // Métodos para histórico
  static getUsageHistory(): UsageHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USAGE_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  }

  static addToHistory(historyItem: UsageHistoryItem): void {
    try {
      const history = this.getUsageHistory();
      history.unshift(historyItem); // Adicionar no início para ordem cronológica reversa
      
      // Manter apenas os últimos 1000 registros
      if (history.length > 1000) {
        history.splice(1000);
      }
      
      localStorage.setItem(STORAGE_KEYS.USAGE_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  // Métodos utilitários
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static validateEquipment(equipment: Partial<Equipment>, existingCodes: string[] = []): string[] {
    const errors: string[] = [];

    // Validar nome
    if (equipment.nome !== undefined) {
      errors.push(...EquipmentValidators.validateEquipmentName(equipment.nome));
    }

    // Validar código
    if (equipment.codigo !== undefined) {
      const filteredCodes = existingCodes.filter(code => code !== equipment.codigo);
      errors.push(...EquipmentValidators.validateEquipmentCode(equipment.codigo, filteredCodes));
    }

    // Validar categoria
    if (equipment.categoria !== undefined) {
      errors.push(...EquipmentValidators.validateCategory(equipment.categoria));
    }

    // Validar quantidade
    if (equipment.quantidade !== undefined) {
      errors.push(...EquipmentValidators.validateQuantity(equipment.quantidade));
    }

    // Validar quantidade mínima
    if (equipment.quantidadeMinima !== undefined) {
      errors.push(...EquipmentValidators.validateMinimumQuantity(equipment.quantidadeMinima));
    }

    // Validar campos opcionais
    if (equipment.descricao !== undefined) {
      errors.push(...EquipmentValidators.validateDescription(equipment.descricao));
    }

    if (equipment.fornecedor !== undefined) {
      errors.push(...EquipmentValidators.validateSupplier(equipment.fornecedor));
    }

    if (equipment.localizacao !== undefined) {
      errors.push(...EquipmentValidators.validateLocation(equipment.localizacao));
    }

    if (equipment.observacoes !== undefined) {
      errors.push(...EquipmentValidators.validateNotes(equipment.observacoes));
    }

    if (equipment.valorUnitario !== undefined) {
      errors.push(...EquipmentValidators.validateUnitValue(equipment.valorUnitario));
    }

    return errors;
  }

  static validateUseData(useData: UseEquipmentData, availableQuantity: number = Infinity): string[] {
    const errors: string[] = [];

    errors.push(...UsageValidators.validateResponsible(useData.responsavel));
    errors.push(...UsageValidators.validateLocation(useData.local));
    errors.push(...UsageValidators.validateUsageQuantity(useData.quantidade, availableQuantity));
    errors.push(...UsageValidators.validateUsageNotes(useData.observacoes));

    if (useData.contato) {
      errors.push(...UsageValidators.validateContact(useData.contato));
    }

    if (useData.dataPrevistaDevolucao) {
      errors.push(...UsageValidators.validateExpectedReturnDate(useData.dataPrevistaDevolucao));
    }

    return errors;
  }
}