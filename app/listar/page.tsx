'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { equipmentServiceAuth, authService, userService } from '../../lib/supabase';

interface Equipment {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  categoria: string;
  foto?: string;
  created_at: string;
}

export default function ListarPage() {
  const router = useRouter();
  const [equipamentos, setEquipamentos] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categorias = ['Infraestrutura', 'Redes', 'B2B', 'B2C', 'Outros'];

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
      if (!profile || profile.status !== 'approved') {
        router.push('/aguardando-aprovacao');
        return;
      }

      setCurrentUser(user);
      await loadEquipments(user.id);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadEquipments = async (userId: string) => {
    try {
      const data = await equipmentServiceAuth.getByUser(userId);
      setEquipamentos(data);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      // Fallback para localStorage
      try {
        const localData = JSON.parse(localStorage.getItem('estoque-equipamentos') || '[]');
        const userEquipments = localData.filter((eq: any) => eq.user_id === userId);
        setEquipamentos(userEquipments);
      } catch (localError) {
        console.error('Erro ao carregar do localStorage:', localError);
      }
    }
  };

  const filteredEquipamentos = equipamentos.filter(eq => {
    const matchesSearch = eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (eq.descricao && eq.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || eq.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, código ou descrição..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
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
                {/* Foto */}
                {equipamento.foto && (
                  <div className="mb-4">
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={equipamento.foto}
                        alt={equipamento.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Informações */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
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

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {equipamento.categoria}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão Flutuante */}
        <Link
          href="/adicionar"
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          title="Adicionar Equipamento"
        >
          <i className="ri-add-line text-2xl"></i>
        </Link>
      </main>
    </div>
  );
}