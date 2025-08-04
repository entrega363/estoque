'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService } from '../../lib/supabase';
import { usePWA } from '../../lib/usePWA';
import UniversalInstallGuide from '../../components/UniversalInstallGuide';
import Link from 'next/link';

export default function SistemaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // PWA hook
  const { canInstall, isInstalled, isStandalone, setShowInstallPrompt, installPWA, isIOS, isAndroid, forceInstallCheck, getBrowserName, getDeviceInfo } = usePWA();
  const [showUniversalGuide, setShowUniversalGuide] = useState(false);

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

      if (profile.status === 'suspended') {
        router.push('/conta-suspensa');
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

  const handleInstallApp = async () => {
    try {
      // Tentar instalação automática primeiro
      const result = await installPWA();
      
      if (result === true) {
        alert('🎉 Aplicativo instalado com sucesso!');
        return;
      }
      
      // Se não funcionou automaticamente, mostrar guia universal
      setShowUniversalGuide(true);
      
    } catch (error) {
      console.error('Erro ao instalar app:', error);
      // Em caso de erro, também mostrar o guia
      setShowUniversalGuide(true);
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
          <Link href="/listar">
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
          </Link>

          {/* Card: Equipamentos Utilizados */}
          <Link href="/utilizados">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="ri-tools-line text-orange-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Equipamentos Utilizados
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ver itens em uso e localizações
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Card: Relatórios (apenas admin) */}
          {userProfile?.role === 'admin' && (
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
          )}

          {/* Card: Configurações (apenas admin) */}
          {userProfile?.role === 'admin' && (
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
          )}

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

        {/* PWA Install Test (apenas para teste) */}
        {!isInstalled && !isStandalone && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="ri-smartphone-line text-blue-500"></i>
              Instalar App (PWA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Status PWA</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Pode instalar: {canInstall ? '✅ Sim' : '❌ Não'}</li>
                  <li>• Já instalado: {isInstalled ? '✅ Sim' : '❌ Não'}</li>
                  <li>• Modo standalone: {isStandalone ? '✅ Sim' : '❌ Não'}</li>
                  <li>• Plataforma: {isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}</li>
                  <li>• Navegador: {getBrowserName()}</li>
                  <li>• Dispositivo: {getDeviceInfo().device} {getDeviceInfo().os && `(${getDeviceInfo().os})`}</li>
                  <li>• Marca: {getDeviceInfo().brand || 'Desconhecida'}</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Ações</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleInstallApp}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-lg"
                  >
                    📱 Instalar Aplicativo
                  </button>
                  
                  {isIOS && (
                    <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      <strong>iOS:</strong> Toque no botão Compartilhar <i className="ri-share-line"></i> e selecione "Adicionar à Tela de Início"
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowInstallPrompt(true)}
                      className="bg-gray-500 text-white py-2 px-2 rounded-lg hover:bg-gray-600 transition-colors text-xs"
                    >
                      🔧 Popup
                    </button>
                    <button
                      onClick={forceInstallCheck}
                      className="bg-orange-500 text-white py-2 px-2 rounded-lg hover:bg-orange-600 transition-colors text-xs"
                    >
                      🔄 Forçar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status do Sistema (apenas admin) */}
        {userProfile?.role === 'admin' && (
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
        )}

        <UniversalInstallGuide
          isOpen={showUniversalGuide}
          onClose={() => setShowUniversalGuide(false)}
        />
      </main>
    </div>
  );
}