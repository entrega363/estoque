'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UniversalPWAInstaller from '../components/UniversalPWAInstaller';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UniversalPWAInstaller />
      <div className="p-4">
        <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sistema de Controle de Estoque
          </h1>
          
          <div className="space-y-4">
            <Link href="/login">
              <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                Fazer Login
              </button>
            </Link>
            
            <Link href="/cadastro">
              <button className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors">
                Criar Conta
              </button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">
            Sistema funcionando no Vercel! 🎉
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}