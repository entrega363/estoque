'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService } from '../../lib/supabase';
import Link from 'next/link';

export default function SistemaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authService.getSession();
      
      if (!session?.user) {
        console.log('❌ Usuário não autenticado, redirecionando para login');
        router.push('/login');
        return;
      }

      setUser(session.user);
      
      // Verificar se o usuário está aprovado
      const profile = await userService.getUserProfile(session.user.id);
      
      if (!profile) {
        console.log('❌ Perfil não encontrado');
        router.push('/login');
        return;
      }

      if (profile.status !== 'approved') {
        console.log('⏳ Usuário não aprovado ainda');
        router.push('/aguardando-aprovacao');
        return;
      }

      setUserProfile(profile);
      console.log('✅ Usuário autenticado e aprovado:', profile);
      console.log('🔍 Role do usuário:', profile.role);
      console.log('🔍 Status do usuário:', profile.status);
      console.log('🔍 É admin?', profile.role === 'admin');
      
    } catch (error) {
      console.error('❌ Erro na verificação de autenticação:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
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
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="ri-store-line text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                Sistema de Estoque
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Olá, <span className="font-medium">{userProfile?.nome || user?.email}</span>
                {userProfile && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    {userProfile.role} - {userProfile.status}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Sair"
              >
                <i className="ri-logout-box-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card: Adicionar Produto */}
          <Link href="/adicionar">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-add-circle-line text-green-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Adicionar Produto
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Cadastrar novo item no estoque
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Card: Listar Produtos */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-list-check text-blue-600 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Listar Produtos
                </h3>
                <p className="text-gray-600 text-sm">
                  Ver todos os itens do estoque
                </p>
              </div>
            </div>
          </div>

          {/* Card: Relatórios */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-bar-chart-line text-purple-600 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Relatórios
                </h3>
                <p className="text-gray-600 text-sm">
                  Análises e estatísticas
                </p>
              </div>
            </div>
          </div>

          {/* Card: Configurações */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className="ri-settings-line text-gray-600 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Configurações
                </h3>
                <p className="text-gray-600 text-sm">
                  Ajustes do sistema
                </p>
              </div>
            </div>
          </div>

          {/* Card: Usuários (apenas admin) */}
          {userProfile?.role === 'admin' && (
            <Link href="/gerenciar-usuarios">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="ri-team-line text-orange-600 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Gerenciar Usuários
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Aprovar e gerenciar usuários
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Card: Debug (apenas admin) */}
          {userProfile?.role === 'admin' && (
            <Link href="/debug-usuarios">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100 border-dashed">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="ri-bug-line text-red-600 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Debug Usuários
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Diagnosticar problemas
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}

        </div>

        {/* Debug Info (temporário) */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🔍 Debug Info (Temporário)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Usuário:</strong> {userProfile?.nome || 'N/A'}</p>
              <p><strong>Email:</strong> {userProfile?.email || 'N/A'}</p>
              <p><strong>Role:</strong> {userProfile?.role || 'N/A'}</p>
              <p><strong>Status:</strong> {userProfile?.status || 'N/A'}</p>
            </div>
            <div>
              <p><strong>É Admin:</strong> {userProfile?.role === 'admin' ? 'SIM' : 'NÃO'}</p>
              <p><strong>Está Aprovado:</strong> {userProfile?.status === 'approved' ? 'SIM' : 'NÃO'}</p>
              <p><strong>Deve mostrar card:</strong> {userProfile?.role === 'admin' ? 'SIM' : 'NÃO'}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔄 Recarregar Página
          </button>
        </div>

        {/* Status do Sistema */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Status do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <div className="text-sm text-gray-600">Sistema</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Produtos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <div className="text-sm text-gray-600">Usuários</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}