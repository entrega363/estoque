'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function TestConnection() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testando conexão...');
    
    try {
      // Teste 1: Verificar se o Supabase está conectado
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      
      if (error) {
        setResult(`Erro na conexão: ${error.message}`);
        return;
      }
      
      setResult('✅ Conexão com Supabase funcionando!');
      
      // Teste 2: Tentar criar um usuário de teste
      const testEmail = 'teste@exemplo.com';
      const testPassword = '123456';
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            nome: 'Usuário Teste'
          }
        }
      });
      
      if (signUpError) {
        setResult(prev => prev + `\n❌ Erro no signup: ${signUpError.message}`);
      } else {
        setResult(prev => prev + '\n✅ Signup funcionando!');
      }
      
    } catch (err: any) {
      setResult(`❌ Erro geral: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h1>
        
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Testando...' : 'Testar Conexão'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-white rounded border">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-bold mb-2">Informações de Debug:</h2>
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
        </div>
      </div>
    </div>
  );
}