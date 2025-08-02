'use client';

import { useState, useEffect } from 'react';
import { authService, userService } from '../../lib/supabase';

export default function TestAdminPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testAdmin();
  }, []);

  const testAdmin = async () => {
    try {
      console.log('🔍 Testando admin...');
      
      // Verificar sessão
      const sessionData = await authService.getSession();
      console.log('📋 Sessão:', sessionData);
      setSession(sessionData);
      
      if (!sessionData?.user) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
      
      // Verificar perfil
      const profileData = await userService.getUserProfile(sessionData.user.id);
      console.log('👤 Perfil:', profileData);
      setProfile(profileData);
      
      if (!profileData) {
        setError('Perfil não encontrado');
        setLoading(false);
        return;
      }
      
      // Tentar buscar usuários
      const usersData = await userService.getAllUsers();
      console.log('👥 Usuários:', usersData);
      setUsers(usersData);
      
    } catch (err: any) {
      console.error('❌ Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forceLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fazer logout primeiro
      await authService.signOut();
      
      // Fazer login
      const loginResult = await authService.signIn('entregasobral@gmail.com', 'tenderbr0');
      console.log('✅ Login forçado:', loginResult);
      
      // Recarregar dados
      await testAdmin();
      
    } catch (err: any) {
      console.error('❌ Erro no login forçado:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Teste Admin - Carregando...</h1>
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Teste Admin</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        <div className="space-y-6">
          {/* Botões de Ação */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Ações</h2>
            <div className="space-x-3">
              <button
                onClick={testAdmin}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Recarregar Teste
              </button>
              <button
                onClick={forceLogin}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Forçar Login Admin
              </button>
            </div>
          </div>
          
          {/* Informações da Sessão */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">📋 Sessão</h2>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p><strong>Autenticado:</strong> {session?.user ? 'Sim' : 'Não'}</p>
              {session?.user && (
                <>
                  <p><strong>Email:</strong> {session.user.email}</p>
                  <p><strong>ID:</strong> {session.user.id}</p>
                </>
              )}
            </div>
          </div>

          {/* Informações do Perfil */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">👤 Perfil</h2>
            <div className="bg-gray-100 p-3 rounded text-sm">
              {profile ? (
                <>
                  <p><strong>Nome:</strong> {profile.nome}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Role:</strong> {profile.role}</p>
                  <p><strong>Status:</strong> {profile.status}</p>
                  <p><strong>É Admin:</strong> {profile.role === 'admin' ? 'Sim' : 'Não'}</p>
                  <p><strong>Está Aprovado:</strong> {profile.status === 'approved' ? 'Sim' : 'Não'}</p>
                </>
              ) : (
                <p>Perfil não encontrado</p>
              )}
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">👥 Usuários ({users.length})</h2>
            {users.length === 0 ? (
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="border rounded p-3 bg-gray-50">
                    <p><strong>{user.nome}</strong> ({user.email})</p>
                    <p className="text-sm text-gray-600">
                      Status: {user.status} | Role: {user.role}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}