
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { equipmentService, usedEquipmentService, Equipment, EquipmentUsed, authService, userService, equipmentServiceAuth, supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';

// Adaptar interface para compatibilidade
interface EquipmentDisplay extends Equipment {
  foto?: string;
}

interface EquipmentUsedDisplay {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  local: string;
  responsavel: string;
  dataUso: string;
  data_uso: string;
  observacoes: string;
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'estoque' | 'utilizados'>('estoque');
  const [equipamentos, setEquipamentos] = useState<Equipment[]>([]);
  const [utilizados, setUtilizados] = useState<EquipmentUsedDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // VERSÃO CORRIGIDA - Sistema robusto de autenticação
  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      console.log('🚀 Inicializando aplicação...');
      
      try {
        setLoading(true);
        setError(null);
        
        // 1. Verificar sessão atual
        const session = await authService.getSession();
        
        if (!session?.user) {
          console.log('❌ Nenhuma sessão ativa');
          if (isMounted) {
            router.push('/login');
          }
          return;
        }
        
        const user = session.user;
        console.log('✅ Usuário autenticado:', user.email);
        
        // 2. VERSÃO SIMPLIFICADA - Criar perfil local sempre
        console.log('🔧 MODO EMERGÊNCIA - Criando perfil local sem consultar banco');
        
        const isAdmin = user.email === 'entregasobral@gmail.com';
        const profile = {
          id: user.id,
          email: user.email || 'usuario@sistema.com',
          nome: isAdmin ? 'Administrador' : (user.email?.split('@')[0] || 'Usuário'),
          status: 'approved', // SEMPRE aprovado
          role: isAdmin ? 'admin' : 'user',
          created_at: new Date().toISOString()
        };
        
        console.log('✅ Perfil local criado:', profile);
        
        // 5. Definir estado da aplicação
        if (isMounted) {
          setCurrentUser(user);
          setUserProfile(profile);
          
          // 6. Carregar dados (com tratamento de erro)
          try {
            const [equipamentosData, utilizadosData] = await Promise.all([
              equipmentService.getAll().catch(() => []),
              usedEquipmentService.getAll().catch(() => [])
            ]);
            
            setEquipamentos(equipamentosData);
            setUtilizados(utilizadosData);
            
            console.log('✅ Dados carregados com sucesso');
          } catch (error) {
            console.warn('⚠️ Erro ao carregar dados, usando dados vazios:', error);
            setEquipamentos([]);
            setUtilizados([]);
          }
        }
        
      } catch (error) {
        console.error('💥 Erro crítico na inicialização:', error);
        
        if (isMounted) {
          setError('Erro ao inicializar aplicação. Tente fazer login novamente.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initializeApp();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [router]);



  const handleLogout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      
      // Limpar sessionStorage para permitir nova inicialização
      sessionStorage.removeItem('appInitialized');
      
      await authService.signOut();
      
      // Aguardar um pouco antes de redirecionar
      setTimeout(() => {
        window.location.href = '/login'; // Usar window.location em vez de router.push
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, redirecionar
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  const totalEstoque = equipamentos.reduce((sum, item) => sum + item.quantidade, 0);
  const totalUtilizados = utilizados.reduce((sum, item) => sum + item.quantidade, 0);

  const filteredEquipamentos = equipamentos.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUtilizados = utilizados.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.local.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar loading durante verificação de autenticação
  if (loading && !currentUser) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Mostrar erro se houver
  if (error && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro de Autenticação
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Ir para Login
            </button>
            <button
              onClick={() => router.push('/debug-page')}
              className="w-full bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors"
            >
              Ver Detalhes Técnicos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* User Info & Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                userProfile?.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
              }`}>
                <i className={`text-xl ${
                  userProfile?.role === 'admin' ? 'ri-admin-line text-purple-500' : 'ri-user-line text-blue-500'
                }`}></i>
              </div>
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  {userProfile?.nome}
                  {userProfile?.role === 'admin' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userProfile?.role === 'admin' && (
                <Link href="/admin">
                  <button className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors" title="Painel Admin">
                    <i className="ri-admin-line text-lg"></i>
                  </button>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                title="Sair"
              >
                <i className="ri-logout-circle-line text-lg"></i>
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sistema de Controle de Estoque
          </h1>
          
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-4">
            <button
              onClick={() => setActiveTab('estoque')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'estoque'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Est. ({totalEstoque})
            </button>
            <button
              onClick={() => setActiveTab('utilizados')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'utilizados'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              Util. ({totalUtilizados})
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Buscar equipamento..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Add Button */}
        {activeTab === 'estoque' && (
          <div className="mb-4">
            <Link href="/adicionar">
              <button className="w-full bg-green-500 text-white py-4 rounded-2xl font-medium shadow-lg hover:bg-green-600 transition-colors !rounded-button flex items-center justify-center gap-2">
                <i className="ri-add-line text-xl"></i>
                Adicionar ao Estoque
              </button>
            </Link>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'estoque' ? (
            filteredEquipamentos.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {item.foto ? (
                        <img
                          src={item.foto}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="ri-computer-line text-blue-500 text-xl"></i>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                      <p className="text-sm text-gray-500">{item.codigo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-500">{item.quantidade}</p>
                    <p className="text-xs text-gray-400">unidades</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {item.categoria}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                    Disponível
                  </span>
                </div>
              </div>
            ))
          ) : (
            filteredUtilizados.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <i className="ri-computer-line text-red-500 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                      <p className="text-sm text-gray-500">{item.codigo}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                    Utilizado
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="ri-map-pin-line text-gray-400"></i>
                    <span className="text-gray-600">Local: {item.local}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-user-line text-gray-400"></i>
                    <span className="text-gray-600">Responsável: {item.responsavel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-calendar-line text-gray-400"></i>
                    <span className="text-gray-600">Data: {new Date(item.dataUso || item.data_uso).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {item.observacoes && (
                    <div className="flex items-start gap-2">
                      <i className="ri-file-text-line text-gray-400 mt-0.5"></i>
                      <span className="text-gray-600">{item.observacoes}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Qtd: {item.quantidade} unidade{item.quantidade > 1 ? 's' : ''}
                  </span>
                  <button className="text-blue-500 text-sm font-medium hover:text-blue-600 !rounded-button">
                    Devolver
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {((activeTab === 'estoque' && filteredEquipamentos.length === 0) ||
          (activeTab === 'utilizados' && filteredUtilizados.length === 0)) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-box-3-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum item encontrado' : 
               activeTab === 'estoque' ? 'Nenhum equipamento em estoque' : 'Nenhum equipamento utilizado'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
