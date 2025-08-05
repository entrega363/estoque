'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { equipmentServiceAuth, authService, userService, usedEquipmentService } from '../../lib/supabase';

interface Equipment {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  categoria: string;
  foto?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function ListarPage() {
  const router = useRouter();
  const [equipamentos, setEquipamentos] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [withdrawForm, setWithdrawForm] = useState({
    quantidade: 1,
    local: '',
    responsavel: '',
    observacoes: ''
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    quantidade: 0,
    categoria: '',
    foto: ''
  });
  const [equipamentosUtilizados, setEquipamentosUtilizados] = useState<any[]>([]);

  const categorias = ['Infraestrutura', 'Redes', 'B2B', 'B2C', 'Outros'];

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

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

      setCurrentUser(user);
      await loadEquipments(user.id);
      await loadUsedEquipments();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadEquipments = async (userId: string) => {
    try {
      const data = await equipmentServiceAuth.getByUser(userId, true);
      setEquipamentos(data);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      try {
        const localData = JSON.parse(localStorage.getItem('estoque-equipamentos') || '[]');
        const userEquipments = localData.filter((eq: any) => eq.user_id === userId);
        setEquipamentos(userEquipments);
      } catch (localError) {
        console.error('Erro ao carregar do localStorage:', localError);
      }
    }
  };

  const loadUsedEquipments = async () => {
    try {
      const data = await usedEquipmentService.getAll();
      setEquipamentosUtilizados(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos utilizados:', error);
      try {
        const localData = JSON.parse(localStorage.getItem('estoque-utilizados') || '[]');
        setEquipamentosUtilizados(localData);
      } catch (localError) {
        console.error('Erro ao carregar do localStorage:', localError);
        setEquipamentosUtilizados([]);
      }
    }
  };

  // Filtrar equipamentos
  const filteredEquipamentos = useMemo(() => {
    return equipamentos.filter(eq => {
      const matchesSearch = eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.descricao && eq.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || eq.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [equipamentos, searchTerm, selectedCategory]);

  const handleWithdraw = (equipamento: Equipment) => {
    setSelectedEquipment(equipamento);
    setWithdrawForm({
      quantidade: 1,
      local: '',
      responsavel: '',
      observacoes: ''
    });
    setShowWithdrawModal(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleEdit = (equipamento: Equipment) => {
    setSelectedEquipment(equipamento);
    setEditForm({
      nome: equipamento.nome,
      codigo: equipamento.codigo,
      descricao: equipamento.descricao || '',
      quantidade: equipamento.quantidade,
      categoria: equipamento.categoria,
      foto: equipamento.foto || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedEquipment || !currentUser) return;

    if (!editForm.nome || !editForm.codigo || !editForm.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (editForm.quantidade < 0) {
      alert('A quantidade não pode ser negativa');
      return;
    }

    try {
      await equipmentServiceAuth.update(selectedEquipment.id, {
        nome: editForm.nome,
        codigo: editForm.codigo,
        descricao: editForm.descricao,
        quantidade: editForm.quantidade,
        categoria: editForm.categoria,
        foto: editForm.foto
      });

      await loadEquipments(currentUser.id);
      setShowEditModal(false);
      setSelectedEquipment(null);
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      alert('Erro ao atualizar produto. Tente novamente.');
    }
  };

  const handleDelete = async (equipamento: Equipment) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o produto "${equipamento.nome}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await equipmentServiceAuth.delete(equipamento.id);
      if (currentUser) {
        await loadEquipments(currentUser.id);
      }
      alert('Produto deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar equipamento:', error);
      alert('Erro ao deletar produto. Tente novamente.');
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!selectedEquipment || !currentUser) return;

    if (!withdrawForm.local || !withdrawForm.responsavel) {
      alert('Por favor, preencha o local e o responsável');
      return;
    }

    if (withdrawForm.quantidade > selectedEquipment.quantidade) {
      alert('Quantidade solicitada maior que disponível em estoque');
      return;
    }

    try {
      await usedEquipmentService.create({
        codigo: selectedEquipment.codigo,
        nome: selectedEquipment.nome,
        quantidade: withdrawForm.quantidade,
        local: withdrawForm.local,
        responsavel: withdrawForm.responsavel,
        data_uso: new Date().toISOString().split('T')[0],
        observacoes: withdrawForm.observacoes
      });

      const novaQuantidade = selectedEquipment.quantidade - withdrawForm.quantidade;
      await equipmentServiceAuth.update(selectedEquipment.id, {
        quantidade: novaQuantidade
      });

      setShowWithdrawModal(false);
      setSelectedEquipment(null);
      await loadEquipments(currentUser.id);
      alert('Equipamento retirado do estoque com sucesso!');
    } catch (error) {
      console.error('Erro ao retirar equipamento:', error);
      alert('Erro ao retirar equipamento do estoque');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando equipamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/sistema" className="text-gray-500 hover:text-gray-700">
                <i className="ri-arrow-left-line text-xl"></i>
              </Link>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="ri-list-check text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                Lista de Produtos
              </h1>
            </div>

            <div className="text-sm text-gray-600">
              {equipamentos.length} {equipamentos.length === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-list-check text-blue-500 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredEquipamentos.length}
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
                  {equipamentos.reduce((total, eq) => total + eq.quantidade, 0)}
                </p>
                <p className="text-xs text-gray-400">unidades em estoque</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-line text-orange-500 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Retirado (Mês)</p>
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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-search-2-line text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Buscar Produtos
            </h2>
            <p className="text-blue-100">
              Encontre rapidamente os equipamentos que você precisa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campo de Busca Principal */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-blue-100 mb-3">
                <i className="ri-search-line mr-2"></i>
                Busca Geral
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, código ou descrição..."
                  className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur border-0 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 shadow-lg"
                />
                <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors"></i>
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
                <div className="mt-2 text-sm text-blue-100">
                  <i className="ri-information-line mr-1"></i>
                  Mostrando resultados para "{searchTerm}"
                </div>
              )}
            </div>

            {/* Filtro de Categoria */}
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-3">
                <i className="ri-folder-line mr-2"></i>
                Categoria
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 bg-white/95 backdrop-blur border-0 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 text-gray-800 appearance-none shadow-lg cursor-pointer"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          {/* Filtros Ativos */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-blue-100 font-medium">
                  <i className="ri-filter-line mr-2"></i>
                  Filtros ativos:
                </span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur text-white text-sm rounded-full">
                    <i className="ri-search-line text-xs"></i>
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="hover:text-red-200 transition-colors"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur text-white text-sm rounded-full">
                    <i className="ri-folder-line text-xs"></i>
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="hover:text-red-200 transition-colors"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="text-sm text-blue-100 hover:text-white underline transition-colors"
                >
                  Limpar todos
                </button>
              </div>
            </div>
          )}

          {/* Resultados da Busca */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between text-blue-100">
              <div className="flex items-center gap-2">
                <i className="ri-list-check text-lg"></i>
                <span className="font-medium">
                  {filteredEquipamentos.length} {filteredEquipamentos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </span>
              </div>
              {filteredEquipamentos.length > 0 && (
                <div className="text-sm">
                  Total: {filteredEquipamentos.reduce((total, eq) => total + eq.quantidade, 0)} unidades
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Equipamentos */}
        {filteredEquipamentos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-inbox-line text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm || selectedCategory ? 'Nenhum item encontrado' : 'Nenhum equipamento cadastrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro equipamento ao estoque'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <Link
                href="/adicionar"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                <i className="ri-add-line"></i>
                Adicionar Primeiro Equipamento
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipamentos.map((equipamento) => (
              <div key={equipamento.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                {/* Informações */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                      onClick={() => equipamento.foto && handleImageClick(equipamento.foto)}
                    >
                      {equipamento.foto ? (
                        <img
                          src={equipamento.foto}
                          alt={equipamento.nome}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <i className="ri-computer-line text-blue-500"></i>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {equipamento.nome}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {equipamento.codigo}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">
                        <i className="ri-user-line mr-1"></i>
                        José dos Santos Silva
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-blue-500">
                      {equipamento.quantidade}
                    </p>
                    <p className="text-xs text-gray-400">unidades</p>
                  </div>
                </div>

                {/* Descrição */}
                {equipamento.descricao && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {equipamento.descricao}
                  </p>
                )}

                {/* Data de Criação */}
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-calendar-line text-gray-400 text-sm"></i>
                  <span className="text-xs text-gray-500">
                    Adicionado em {formatDate(equipamento.created_at)}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {equipamento.categoria}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleWithdraw(equipamento)}
                      disabled={equipamento.quantidade === 0}
                      className="group relative px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200 hover:border-orange-300"
                      title="Retirar do Estoque"
                    >
                      <i className="ri-subtract-line mr-1"></i>
                      Retirar
                    </button>
                    <button
                      onClick={() => handleEdit(equipamento)}
                      className="group relative px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                      title="Editar Produto"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(equipamento)}
                      className="group relative px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                      title="Excluir Produto"
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Retirar Equipamento */}
        {showWithdrawModal && selectedEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Retirar do Estoque
                  </h3>
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="ri-computer-line text-blue-500"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{selectedEquipment.nome}</h4>
                      <p className="text-sm text-gray-500">{selectedEquipment.codigo}</p>
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        <i className="ri-user-line mr-1"></i>
                        José dos Santos Silva
                      </p>
                      <p className="text-sm text-green-600">
                        Disponível: {selectedEquipment.quantidade} unidades
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade a Retirar
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedEquipment.quantidade}
                      value={withdrawForm.quantidade}
                      onChange={(e) => setWithdrawForm(prev => ({
                        ...prev,
                        quantidade: parseInt(e.target.value) || 1
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
                      value={withdrawForm.local}
                      onChange={(e) => setWithdrawForm(prev => ({
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
                      value={withdrawForm.responsavel}
                      onChange={(e) => setWithdrawForm(prev => ({
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
                      value={withdrawForm.observacoes}
                      onChange={(e) => setWithdrawForm(prev => ({
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
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleWithdrawSubmit}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Retirar do Estoque
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Editar Equipamento */}
        {showEditModal && selectedEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Editar Produto
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proprietário *
                    </label>
                    <input
                      type="text"
                      value="José dos Santos Silva"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={editForm.codigo}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        codigo: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={editForm.categoria}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        categoria: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.quantidade}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        quantidade: parseInt(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={editForm.descricao}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        descricao: e.target.value
                      }))}
                      placeholder="Descrição do produto (opcional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL da Foto
                    </label>
                    <input
                      type="url"
                      value={editForm.foto}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        foto: e.target.value
                      }))}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Imagem */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors z-10"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
              <img
                src={selectedImage}
                alt="Equipamento"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}