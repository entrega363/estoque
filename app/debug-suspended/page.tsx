'use client';

import { useState } from 'react';
import { userService } from '../../lib/supabase';

export default function DebugSuspendedPage() {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testUpdateStatus = async () => {
    if (!userId || !status) {
      setResult('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const result = await userService.updateUserStatus(userId, status as any);
      setResult(`Sucesso: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      setResult(`Erro: ${error.message}`);
      console.error('Erro completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const users = await userService.getAllUsers();
      setResult(`Usuários: ${JSON.stringify(users, null, 2)}`);
    } catch (error: any) {
      setResult(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug - Status Suspended</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Testar Atualização de Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ID do usuário"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Novo Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um status</option>
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="suspended">suspended</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={testUpdateStatus}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar Atualização'}
            </button>
            
            <button
              onClick={getAllUsers}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Listar Usuários'}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Resultado</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {result || 'Nenhum teste executado ainda'}
          </pre>
        </div>
        
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Instruções para corrigir o problema:
          </h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Acesse o Supabase Dashboard</li>
            <li>Vá para SQL Editor</li>
            <li>Execute o seguinte comando:</li>
          </ol>
          <pre className="bg-yellow-100 p-3 rounded mt-2 text-sm">
{`-- Remover constraint existente
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_status_check;

-- Adicionar nova constraint
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));`}
          </pre>
        </div>
      </div>
    </div>
  );
}