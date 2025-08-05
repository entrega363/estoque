'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usedEquipmentService, authService, userService } from '../../lib/supabase';

interface EquipmentUsed {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  local: string;
  responsavel: string;
  data_uso: string;
  observacoes: string;
  created_at: string;
}

export default function UtilizadosPage() {
  const router = useRouter();
  const [equipamentosUtilizados, setEquipamentosUtilizados] = useState<EquipmentUsed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentUsed | null>(null);
  const [editForm, setEditForm] = useState({
    quantidade: 0,
    local: '',
    responsavel: '',
    observacoes: ''
  });

  useEffect(() => {
    checkAuthAndLoadEquipments();
  }, []);

  const checkAuthAndLoadEquipments = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const profile = await userService.getUserProfile(user.id);
      if (!profile) {
        router.push('/aguardando-aprovacao');
        return;
      }
      
      if (profile.status === 'suspended') {
        router.push('/conta-suspensa');
        return;
      }
      
      if (profile.status !== 'approved') {
        router.push('/aguardando-aprovacao');
        return;
      }

      await loadUsedEquipments();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setError('Erro ao carregar dados. Tentando carregar do cache local...');
      // Em caso de erro, ainda tenta carregar do localStorage
      try {
        const localData = JSON.parse(localStorage.getItem('estoque-utilizados') || '[]');
        setEquipamentosUtilizados(localData);
        setError(null);
      } catch (localError) {
        console.error('Erro ao carregar do localStorage:', localError);
        setEquipamentosUtilizados([]);
        setError('Não foi possível carregar os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsedEquipments = async () => {
    try {
      const data = await usedEquipmentService.getAll();
      setEquipamentosUtilizados(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos utilizados:', error);
      // Fallback para localStorage
      try {
        const localData = JSON.parse(localStorage.getItem('estoque-utilizados') || '[]');
        setEquipamentosUtilizados(localData);
      } catch (localError) {
        console.error('Erro ao carregar do localStorage:', localError);
        setEquipamentosUtilizados([]);
      }
    }
  };

  const handleEdit = (equipamento: EquipmentUsed) => {
    setSelectedEquipment(equipamento);
    setEditForm({
      quantidade: equipamento.quantidade || 0,
      local: equipamento.local || '',
      responsavel: equipamento.responsavel || '',
      observacoes: equipamento.observacoes || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedEquipment) return;

    if (!editForm.local || !editForm.responsavel) {
      alert('Por favor, preencha o local e o responsável');
      return;
    }

    if (editForm.quantidade <= 0) {
      alert('A quantidade deve ser maior que zero');
      return;
    }

    try {
      await usedEquipmentService.update(selectedEquipment.id, {
        quantidade: editForm.quantidade,
        local: editForm.local,
        responsavel: editForm.responsavel,
        observacoes: editForm.observacoes
      });

      await loadUsedEquipments();
      setShowEditModal(false);
      setSelectedEquipment(null);
      alert('Equipamento utilizado atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar equipamento utilizado:', error);
      alert('Erro ao atualizar equipamento utilizado. Tente novamente.');
    }
  };

  const filteredEquipamentos = equipamentosUtilizados.filter(eq => {
    if (!eq) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (eq.nome && eq.nome.toLowerCase().includes(searchLower)) ||
      (eq.codigo && eq.codigo.toLowerCase().includes(searchLower)) ||
      (eq.local && eq.local.toLowerCase().includes(searchLower)) ||
      (eq.responsavel && eq.responsavel.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando equipamentos utilizados...</p>
          {error && (
            <p className="text-red-600 mt-2 text-sm">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/sistema" className="text-gray-500 hover:text-gray-700">
                <i className="ri-arrow-left-line text-xl"></i>
              </Link>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <i className="ri-tools-line text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                Equipamentos Utilizados
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {equipamentosUtilizados.length} {equipamentosUtilizados.length === 1 ? 'item' : 'itens'} em uso
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-list-check text-blue-500 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos Utilizados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(equipamentosUtilizados.map(eq => eq.codigo)).size}
                </p>
                <p className="text-xs text-gray-400">códigos diferentes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-stack-line text-green-500 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Unidades</p>
                <p className="text-2xl font-bold text-green-600">
                  {equipamentosUtilizados.reduce((total, eq) => total + (eq.quantidade || 0), 0)}
                </p>
                <p className="text-xs text-gray-400">unidades em uso</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-line text-orange-500 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mês Atual</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(() => {
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    const monthlyUsed = equipamentosUtilizados.filter(eq => {
                      const useDate = new Date(eq.data_uso);
                      return useDate.getMonth() === currentMonth && useDate.getFullYear() === currentYear;
                    });
                    return monthlyUsed.reduce((total, eq) => total + (eq.quantidade || 0), 0);
                  })()}
                </p>
                <p className="text-xs text-gray-400">unidades retiradas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-2-line text-purple-500 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mês Anterior</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(() => {
                    const lastMonth = new Date().getMonth() - 1;
                    const lastMonthYear = lastMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
                    const adjustedLastMonth = lastMonth < 0 ? 11 : lastMonth;
                    const lastMonthUsed = equipamentosUtilizados.filter(eq => {
                      const useDate = new Date(eq.data_uso);
                      return useDate.getMonth() === adjustedLastMonth && useDate.getFullYear() === lastMonthYear;
                    });
                    return lastMonthUsed.reduce((total, eq) => total + (eq.quantidade || 0), 0);
                  })()}
                </p>
                <p className="text-xs text-gray-400">unidades retiradas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Área de Busca Melhorada */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-search-2-line text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Buscar Equipamentos Utilizados
            </h2>
            <p className="text-orange-100">
              Encontre rapidamente os equipamentos que foram retirados do estoque
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-end">
            {/* Campo de Busca Principal */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-orange-100 mb-3">
                <i className="ri-search-line mr-2"></i>
                Busca Geral
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, código, local ou responsável..."
                  className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur border-0 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 shadow-lg"
                />
                <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-orange-500 transition-colors"></i>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <i className="ri-close-circle-line text-lg"></i>
                  </button>
                )}
              </div>
              {searchTerm && (
                <div className="mt-2 text-sm text-orange-100">
                  <i className="ri-information-line mr-1"></i>
                  Mostrando resultados para "{searchTerm}"
                </div>
              )}
            </div>

            {/* Botão Voltar */}
            <div className="w-full lg:w-auto">
              <Link
                href="/listar"
                className="w-full lg:w-auto bg-white/20 backdrop-blur text-white px-6 py-4 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg border border-white/20"
              >
                <i className="ri-arrow-left-line text-lg"></i>
                Voltar ao Estoque
              </Link>
            </div>
          </div>

          {/* Informações de Resultado */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between text-orange-100">
              <div className="flex items-center gap-2">
                <i className="ri-list-check text-lg"></i>
                <span className="font-medium">
                  {filteredEquipamentos.length} {filteredEquipamentos.length === 1 ? 'equipamento encontrado' : 'equipamentos encontrados'}
                </span>
              </div>
              {filteredEquipamentos.length > 0 && (
                <div className="text-sm">
                  Total retirado: {filteredEquipamentos.reduce((total, eq) => total + (eq.quantidade || 0), 0)} unidades
                </div>
              )}
            </div>
          </div>
        </div>
          </div>
        </div>

        {filteredEquipamentos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-tools-line text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? 'Nenhum item encontrado' : 'Nenhum equipamento em uso'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Quando equipamentos forem retirados do estoque, eles aparecerão aqui'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/listar"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
              >
                <i className="ri-list-check"></i>
                Ver Estoque Disponível
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local de Uso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Uso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEquipamentos.map((equipamento) => (
                    <tr key={equipamento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ri-tools-line text-orange-500"></i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {equipamento.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {equipamento.codigo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {equipamento.quantidade}
                        </div>
                        <div className="text-sm text-gray-500">
                          unidades
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {equipamento.local}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {equipamento.responsavel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(equipamento.data_uso).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.floor((Date.now() - new Date(equipamento.data_uso).getTime()) / (1000 * 60 * 60 * 24))} dias
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(equipamento)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                            title="Editar equipamento utilizado"
                          >
                            <i className="ri-edit-line mr-1"></i>
                            Editar
                          </button>
                          {equipamento.observacoes && (
                            <button
                              className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                              title={equipamento.observacoes}
                            >
                              <i className="ri-information-line"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Editar Equipamento Utilizado */}
        {showEditModal && selectedEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Editar Equipamento Utilizado
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <i className="ri-computer-line text-orange-500"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{selectedEquipment.nome}</h4>
                      <p className="text-sm text-gray-500">{selectedEquipment.codigo}</p>
                      <p className="text-xs text-blue-600 font-medium">
                        <i className="ri-user-line mr-1"></i>
                        José dos Santos Silva
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade Utilizada
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.quantidade}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        quantidade: parseInt(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local de Uso *
                    </label>
                    <input
                      type="text"
                      value={editForm.local}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        local: e.target.value
                      }))}
                      placeholder="Ex: Sala 101, Laboratório A"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsável *
                    </label>
                    <input
                      type="text"
                      value={editForm.responsavel}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        responsavel: e.target.value
                      }))}
                      placeholder="Nome do responsável"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={editForm.observacoes}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        observacoes: e.target.value
                      }))}
                      placeholder="Observações adicionais (opcional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}