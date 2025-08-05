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

  const handleReturn = async (equipmentId: string) => {
    if (!window.confirm('Tem certeza que deseja devolver este equipamento ao estoque?')) {
      return;
    }

    try {
      await usedEquipmentService.return(equipmentId);
      await loadUsedEquipments();
      alert('Equipamento devolvido ao estoque com sucesso!');
    } catch (error) {
      console.error('Erro ao devolver equipamento:', error);
      alert('Erro ao devolver equipamento');
    }
  };

  const handleEdit = (equipmentId: string) => {
    // Encontrar o equipamento pelo ID
    const equipamento = equipamentosUtilizados.find(eq => eq.id === equipmentId);
    if (!equipamento) {
      alert('Equipamento não encontrado');
      return;
    }

    // Por enquanto, mostrar um alert com as informações
    // Futuramente pode ser implementado um modal de edição
    alert(`Editar equipamento:\n\nNome: ${equipamento.nome}\nCódigo: ${equipamento.codigo}\nLocal: ${equipamento.local}\nResponsável: ${equipamento.responsavel}\n\nFuncionalidade de edição será implementada em breve.`);
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

        <div className="bg-blue-800 rounded-xl shadow-lg p-6 mb-6 border border-blue-600">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white mb-2">
                <i className="ri-search-line mr-2"></i>
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, código, local ou responsável..."
                  className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="flex items-end">
              <Link
                href="/listar"
                className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <i className="ri-arrow-left-line"></i>
                Voltar ao Estoque
              </Link>
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
                            onClick={() => handleEdit(equipamento.id)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                            title="Editar equipamento"
                          >
                            <i className="ri-edit-line mr-1"></i>
                            Editar
                          </button>
                          {equipamento.observacoes && (
                            <button
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
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


      </main>
    </div>
  );
}