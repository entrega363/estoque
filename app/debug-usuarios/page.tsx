'use client';

import { useState, useEffect } from 'react';
import { authService, userService } from '../../lib/supabase';
import Link from 'next/link';

export default function DebugUsuariosPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugAuth();
  }, []);

  const debugAuth = async () => {
    try {
      console.log('🔍 Iniciando debug...');
      
      // 1. Verificar sessão
      const sessionData = await authService.getSession();
      console.log('📋 Sessão:', sessionData);
      setSession(sessionData);
      
      if (!sessionData?.user) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      // 2. Verificar perfil
      const profileData = await userService.getUserProfile(sessionData.user.id);
      console.log('👤 Perfil:', profileData);
      setProfile(profileData);
      
      if (!profileData) {
        setError('Perfil não encontrado');
        setLoading(false);
        return;
      }

      // 3. Verificar se é admin
      if (profileData.role !== 'admin') {
        setError(`Usuário não é admin. Role atual: ${profileData.role}`);
        setLoading(false);
        return;
      }

      // 4. Tentar carregar usuários
      const usersData = await userService.getAllUsers();
      console.log('👥 Usuários:', usersData);
      setUsers(usersData);
      
    } catch (err: any) {
      console.error('❌ Erro no debug:', err);
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateUser = async (userId: string) => {
    try {
      console.log('🧪 Testando atualização do usuário:', userId);
      const result = await userService.updateUserStatus(userId, 'approved');
      console.log('✅ Resultado:', result);
      alert('Teste de atualização bem-sucedido!');
      await debugAuth(); // Recarregar dados
    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
      alert(`Erro no teste: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug - Carregando...</h1>
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/sistema" className="text-blue-600 hover:text-blue-800">
            ← Voltar ao Sistema
          </Link>
          <h1 className="text-2xl font-bold">Debug - Gerenciar Usuários</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Informações da Sessão */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">📋 Sessão</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {/* Informações do Perfil */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">👤 Perfil do Usuário</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">👥 Usuários ({users.length})</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{user.nome}</strong> ({user.email})
                      <br />
                      <span className="text-sm text-gray-600">
                        Status: {user.status} | Role: {user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => testUpdateUser(user.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Testar Atualização
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões de Teste */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">🧪 Testes</h2>
          <div className="space-x-3">
            <button
              onClick={debugAuth}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Recarregar Debug
            </button>
            <Link
              href="/gerenciar-usuarios"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
            >
              Ir para Página Real
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}