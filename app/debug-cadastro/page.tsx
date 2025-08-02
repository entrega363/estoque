'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DebugCadastro() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDirectSignup = async () => {
    setLoading(true);
    setResult('Testando cadastro direto...\n');
    
    try {
      const testEmail = `teste-${Date.now()}@exemplo.com`;
      const testPassword = '123456';
      const testNome = 'Usuário Teste';
      
      console.log('Tentando cadastro com:', { testEmail, testPassword, testNome });
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            nome: testNome
          }
        }
      });
      
      if (error) {
        console.error('Erro no signup:', error);
        setResult(prev => prev + `❌ Erro: ${error.message}\n`);
        setResult(prev => prev + `Código: ${error.status}\n`);
        setResult(prev => prev + `Detalhes: ${JSON.stringify(error, null, 2)}\n`);
      } else {
        console.log('Signup bem-sucedido:', data);
        setResult(prev => prev + `✅ Cadastro realizado com sucesso!\n`);
        setResult(prev => prev + `Usuário: ${data.user?.email}\n`);
        setResult(prev => prev + `ID: ${data.user?.id}\n`);
      }
      
    } catch (err: any) {
      console.error('Erro geral:', err);
      setResult(prev => prev + `❌ Erro geral: ${err.message}\n`);
      setResult(prev => prev + `Stack: ${err.stack}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testViaAPI = async () => {
    setLoading(true);
    setResult('Testando cadastro via API...\n');
    
    try {
      const testEmail = `teste-api-${Date.now()}@exemplo.com`;
      const testPassword = '123456';
      const testNome = 'Usuário Teste API';
      
      const response = await fetch('/api/test-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          nome: testNome
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setResult(prev => prev + `❌ Erro na API: ${data.error}\n`);
        setResult(prev => prev + `Status: ${response.status}\n`);
      } else {
        setResult(prev => prev + `✅ Cadastro via API realizado com sucesso!\n`);
        setResult(prev => prev + `Dados: ${JSON.stringify(data, null, 2)}\n`);
      }
      
    } catch (err: any) {
      setResult(prev => prev + `❌ Erro na requisição: ${err.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug - Cadastro de Usuário</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={testDirectSignup}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testando...' : 'Testar Cadastro Direto'}
          </button>
          
          <button
            onClick={testViaAPI}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'Testando...' : 'Testar Cadastro via API'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white rounded border p-4">
            <h2 className="font-bold mb-2">Resultado:</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-bold mb-2">Informações do Ambiente:</h2>
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
          <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}