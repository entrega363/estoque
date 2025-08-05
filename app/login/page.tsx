'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authService } from '../../lib/supabase';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginSuccess, setLoginSuccess] = useState(false);

  // Verificar se já está logado (sem loop)
  useEffect(() => {
    let isMounted = true;
    
    const checkExistingSession = async () => {
      try {
        const session = await authService.getSession();
        
        if (session?.user && isMounted) {
          console.log('✅ Usuário já está logado:', session.user.email);
          setLoginSuccess(true);
        }
      } catch (error) {
        console.log('ℹ️ Nenhuma sessão ativa, permanecendo na página de login');
      }
    };
    
    checkExistingSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.signIn(formData.email, formData.password);
      console.log('✅ Login realizado com sucesso!', result.user?.email);
      setLoginSuccess(true);
      
      // Aguardar um pouco para garantir que a sessão foi estabelecida
      setTimeout(() => {
        goToHome();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToHome = () => {
    console.log('🏠 Redirecionando para o sistema...');
    window.location.href = '/sistema'; // Redirecionar para a página do sistema
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-blue-500 text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Fazer Login
            </h1>
            <p className="text-gray-600">
              Acesse o Sistema de Controle de Estoque
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="ri-error-warning-line text-red-500 text-xl"></i>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {loginSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <i className="ri-check-circle-line text-green-500 text-xl"></i>
                <p className="text-green-800 text-sm">Login realizado com sucesso!</p>
              </div>
              <button
                onClick={goToHome}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-home-line"></i>
                Ir para o Sistema
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium shadow-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <i className="ri-login-circle-line text-xl"></i>
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="text-blue-500 hover:text-blue-600 font-medium">
                Cadastre-se
              </Link>
            </p>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Sistema de Controle de Estoque
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}