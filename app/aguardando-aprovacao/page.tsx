'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/supabase';
import Link from 'next/link';

export default function AguardandoAprovacaoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authService.getSession();
      
      if (!session?.user) {
        router.push('/login');
        return;
      }

      setUser(session.user);
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      router.push('/login');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-time-line text-yellow-600 text-3xl"></i>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Aguardando Aprovação
          </h1>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Sua conta foi criada com sucesso! Aguarde a aprovação do administrador para acessar o sistema.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <i className="ri-information-line text-yellow-600 text-xl"></i>
                <div className="text-left">
                  <p className="text-yellow-800 text-sm font-medium">
                    O administrador será notificado e aprovará sua conta em breve.
                  </p>
                </div>
              </div>
            </div>

            {user && (
              <p className="text-sm text-gray-500">
                Conta: {user.email}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-refresh-line"></i>
              Verificar Novamente
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-500 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-logout-box-line"></i>
              Sair
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              Precisa de ajuda?
            </p>
            <p className="text-xs text-gray-400">
              Entre em contato com o administrador
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}