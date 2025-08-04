// Tipos e interfaces para o sistema de equipamentos

export interface Equipment {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  quantidadeMinima: number;
  categoria: string;
  subcategoria?: string;
  valorUnitario?: number;
  fornecedor?: string;
  dataAdicao: string;
  dataUltimaAtualizacao: string;
  localizacao?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo' | 'manutencao';
  tags: string[];
  imagem?: string;
}

export interface EquipmentUsed {
  id: string;
  equipmentId: string;
  codigo: string;
  nome: string;
  quantidade: number;
  local: string;
  responsavel: string;
  contato?: string;
  dataUso: string;
  dataPrevistaDevolucao?: string;
  dataEfetivaDevolucao?: string;
  observacoes: string;
  status: 'em_uso' | 'devolvido' | 'atrasado';
  aprovadoPor?: string;
  condicaoUso?: 'excelente' | 'boa' | 'regular' | 'ruim';
}

export interface UseEquipmentData {
  quantidade: number;
  local: string;
  responsavel: string;
  contato?: string;
  dataPrevistaDevolucao?: string;
  observacoes: string;
  aprovadoPor?: string;
}

export interface EquipmentStatistics {
  totalEquipments: number;
  totalInUse: number;
  totalAvailable: number;
  totalValue: number;
  categoryDistribution: { [category: string]: number };
  usageByMonth: { month: string; count: number }[];
  topUsedEquipments: { equipment: Equipment; usageCount: number }[];
  lowStockAlerts: Equipment[];
  overdueReturns: EquipmentUsed[];
}

export interface UsageHistoryItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  action: 'added' | 'used' | 'returned' | 'edited' | 'deleted';
  timestamp: string;
  user: string;
  details?: string;
}

export type StatusFilter = 'all' | 'available' | 'in_use';