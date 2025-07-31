'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, userService, UserProfile } from '../../lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'inactive'>('pending');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const isAdmin = await userService.isAdmin(user.id);
      if (!isAdmin) {
        router.push('/');
        return;
      }

      setCurrentUser(user);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/login');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await userService.approveUser(userId, currentUser.id);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      alert('Erro ao aprovar usuário');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await userService.deactivateUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      alert('Erro ao desativar usuário');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await userService.activateUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      alert('Erro ao ativar usuário');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const filteredUsers = users.filter(user => user.status === activeTab);
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const approvedCount = users.filter(u => u.status === 'approved').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="ri-admin-line text-purple-500 text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Painel Administrativo
                </h1>
                <p className="text-gray-600">
                  Gerenciar usuários do sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <i className="ri-home-line"></i>
                  Sistema
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <i className="ri-logout-circle-line"></i>
                Sair
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <i className="ri-time-line text-yellow-500 text-2xl"></i>
                <div>
                  <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
                  <p className="text-sm text-yellow-600">Aguardando Aprovação</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <i className="ri-check-circle-line text-green-500 text-2xl"></i>
                <div>
                  <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
                  <p className="text-sm text-green-600">Usuários Aprovados</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <i className="ri-close-circle-line text-red-500 text-2xl"></i>
                <div>
                  <p className="text-2xl font-bold text-red-700">{inactiveCount}</p>
                  <p className="text-sm text-red-600">Usuários Inativos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'pending'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-yellow-500'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'approved'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-green-500'
              }`}
            >
              Aprovados ({approvedCount})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'inactive'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              Inativos ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500">
                Nenhum usuário {activeTab === 'pending' ? 'pendente' : activeTab === 'approved' ? 'aprovado' : 'inativo'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <i className={`text-2xl ${
                        user.role === 'admin' ? 'ri-admin-line text-purple-500' : 'ri-user-line text-blue-500'
                      }`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        {user.nome}
                        {user.role === 'admin' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                            Admin
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      {user.approved_at && (
                        <p className="text-xs text-gray-400">
                          Aprovado em: {new Date(user.approved_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {user.role !== 'admin' && (
                    <div className="flex items-center gap-2">
                      {user.status === 'pending' && (
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <i className="ri-check-line"></i>
                          Aprovar
                        </button>
                      )}
                      {user.status === 'approved' && (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <i className="ri-close-line"></i>
                          Desativar
                        </button>
                      )}
                      {user.status === 'inactive' && (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <i className="ri-check-line"></i>
                          Ativar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}