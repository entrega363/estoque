'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService } from '../../lib/supabase';
import Link from 'next/link';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function GerenciarUsuariosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadUsers();
  }, []);

  const checkAuthAndLoadUsers = async () => {
    try {
      const session = await authService.getSession();
      
      if (!session?.user) {
        router.push('/login');
        return;
      }

      const profile = await userService.getUserProfile(session.user.id);
      
      if (!profile || profile.role !== 'admin') {
        router.push('/sistema');
        return;
      }

      setCurrentUser(profile);
      await loadUsers();
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'approved' | 'inactive' | 'pending') => {
    setUpdating(userId);
    try {
      await userService.updateUserStatus(userId, newStatus);
      await loadUsers(); // Recarregar lista
      alert(`Usuário ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    } finally {
      setUpdating(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    setUpdating(userId);
    try {
      await userService.updateUserRole(userId, newRole);
      await loadUsers(); // Recarregar lista
      alert(`Role do usuário atualizada para ${newRole}!`);
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      alert('Erro ao atualizar role do usuário');
    } finally {
      setUpdating(null);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    setUpdating(userId);
    try {
      if (currentStatus === 'approved') {
        await userService.deactivateUser(userId);
        alert('Usuário desativado com sucesso!');
      } else {
        await userService.activateUser(userId);
        alert('Usuário ativado com sucesso!');
      }
      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do usuário');
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    // Confirmação antes de excluir
    const confirmDelete = window.confirm(
      `Tem certeza que deseja EXCLUIR permanentemente o usuário "${userName}"?\n\nEsta ação não pode ser desfeita!`
    );
    
    if (!confirmDelete) return;

    setUpdating(userId);
    try {
      await userService.deleteUser(userId);
      await loadUsers(); // Recarregar lista
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
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
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <i className="ri-team-line text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                Gerenciar Usuários
              </h1>
            </div>
            
            <div className="text-sm text-gray-600">
              Admin: <span className="font-medium">{currentUser?.nome}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
            <div className="text-sm text-gray-600">Total de Usuários</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Aprovados</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.status === 'inactive').length}
            </div>
            <div className="text-sm text-gray-600">Inativos</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Administradores</div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Lista de Usuários
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastrado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'approved' ? 'Aprovado' : 
                         user.status === 'pending' ? 'Pendente' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        {/* Botões para usuários pendentes */}
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateUserStatus(user.id, 'approved')}
                              disabled={updating === user.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 p-1 rounded hover:bg-green-50"
                              title="Aprovar usuário"
                            >
                              {updating === user.id ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : (
                                <i className="ri-check-line"></i>
                              )}
                            </button>
                            <button
                              onClick={() => updateUserStatus(user.id, 'inactive')}
                              disabled={updating === user.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                              title="Rejeitar usuário"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </>
                        )}
                        
                        {/* Botões para usuários aprovados (não admin atual) */}
                        {user.id !== currentUser?.id && (
                          <>
                            {/* Botão de alterar role */}
                            {user.status === 'approved' && (
                              <button
                                onClick={() => updateUserRole(
                                  user.id, 
                                  user.role === 'admin' ? 'user' : 'admin'
                                )}
                                disabled={updating === user.id}
                                className="text-purple-600 hover:text-purple-900 disabled:opacity-50 p-1 rounded hover:bg-purple-50"
                                title={user.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                              >
                                {updating === user.id ? (
                                  <i className="ri-loader-4-line animate-spin"></i>
                                ) : (
                                  <i className="ri-admin-line"></i>
                                )}
                              </button>
                            )}
                            
                            {/* Botão de ativar/desativar */}
                            <button
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              disabled={updating === user.id}
                              className={`disabled:opacity-50 p-1 rounded ${
                                user.status === 'approved' 
                                  ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                                  : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                              }`}
                              title={user.status === 'approved' ? 'Desativar usuário' : 'Ativar usuário'}
                            >
                              {updating === user.id ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : user.status === 'approved' ? (
                                <i className="ri-pause-circle-line"></i>
                              ) : (
                                <i className="ri-play-circle-line"></i>
                              )}
                            </button>
                            
                            {/* Botão de excluir */}
                            <button
                              onClick={() => deleteUser(user.id, user.nome)}
                              disabled={updating === user.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                              title="Excluir usuário permanentemente"
                            >
                              {updating === user.id ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : (
                                <i className="ri-delete-bin-line"></i>
                              )}
                            </button>
                          </>
                        )}
                        
                        {/* Indicador para o usuário atual */}
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      </main>
    </div>
  );
}