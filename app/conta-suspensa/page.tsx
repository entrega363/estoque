'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/supabase';

export default function ContaSuspensaPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const getCurrentUserEmail = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Erro ao obter email do usuário:', error);
      }
    };

    getCurrentUserEmail();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      router.push('/login');
    }
  };

  const handleCheckAgain = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        // Recarregar a página para verificar novamente o status
        window.location.reload();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Ícone de Alerta */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-red-500 text-3xl"></i>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Conta Suspensa
          </h1>

          {/* Mensagem Principal */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Sua conta foi temporariamente suspensa pelo administrador. 
            Há pendências que precisam ser resolvidas antes de você poder acessar o sistema novamente.
          </p>

          {/* Caixa de Informação */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <i className="ri-information-line text-amber-600 text-lg mt-0.5 flex-shrink-0"></i>
              <div className="text-left">
                <p className="text-amber-800 font-medium text-sm mb-1">
                  Para reativar sua conta:
                </p>
                <p className="text-amber-700 text-sm">
                  Entre em contato com o administrador do sistema para resolver as pendências identificadas.
                </p>
              </div>
            </div>
          </div>

          {/* Email do usuário */}
          {userEmail && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">
                Conta: <span className="font-medium text-gray-800">{userEmail}</span>
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="space-y-3">
            <button
              onClick={handleCheckAgain}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <i className="ri-refresh-line"></i>
              Verificar Novamente
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <i className="ri-logout-box-line"></i>
              Sair
            </button>
          </div>

          {/* Informações de Contato */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">
              Precisa de ajuda?
            </p>
            <p className="text-sm text-gray-600">
              Entre em contato com o administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}