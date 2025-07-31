'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService, supabase } from '../lib/supabase';

export default function DebugPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugAuth();
  }, []);

  const debugAuth = async () => {
    const info: any = {};
    
    try {
      // 1. Verificar sessão
      info.step1 = 'Verificando sessão...';
      const session = await authService.getSession();
      info.session = session ? {
        user_id: session.user?.id,
        email: session.user?.email,
        expires_at: session.expires_at
      } : null;

      if (!session?.user) {
        info.error = 'Nenhuma sessão encontrada';
        setDebugInfo(info);
        setLoading(false);
        return;
      }

      // 2. Verificar usuário atual
      info.step2 = 'Verificando usuário atual...';
      const currentUser = await authService.getCurrentUser();
      info.currentUser = currentUser ? {
        id: currentUser.id,
        email: currentUser.email,
        created_at: currentUser.created_at
      } : null;

      // 3. Tentar buscar perfil
      info.step3 = 'Buscando perfil...';
      try {
        const profile = await userService.getProfile(session.user.id);
        info.profile = profile;
      } catch (profileError: any) {
        info.profileError = {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint
        };
      }

      // 4. Verificar diretamente no Supabase
      info.step4 = 'Verificação direta no Supabase...';
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        info.directQuery = { data, error };
      } catch (directError) {
        info.directQueryError = directError;
      }

    } catch (error: any) {
      info.generalError = {
        message: error.message,
        stack: error.stack
      };
    }

    setDebugInfo(info);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug de Autenticação</h1>
          <p>Carregando informações de debug...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug de Autenticação</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <button
            onClick={() => router.push('/')}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Voltar para Home
          </button>
          
          <button
            onClick={debugAuth}
            className="mb-4 ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Executar Debug Novamente
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informações de Debug</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}