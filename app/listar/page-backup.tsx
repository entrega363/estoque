'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { equipmentServiceAuth, authService, userService, usedEquipmentService } from '../../lib/supabase';

interface Equipment {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  categoria: string;
  foto?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function ListarPage() {
  const router = useRouter();
  const [equipamentos, setEquipamentos] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadEquipments();
  }, []);

  const checkAuthAndLoadEquipments = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const profile = await userService.getUserProfile(user.id);
      if (!profile) {
        router.push('/aguardando-aprovacao');
        return;
      }
      
      if (profile.status === 'suspended') {
        router.push('/conta-suspensa');
        return;
      }
      
      if (profile.status !== 'approved') {
        router.push('/aguardando-aprovacao');
        return;
      }

      setCurrentUser(user);
      await loadEquipments(user.id);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadEquipments = async (userId: string) => {
    try {
      const data = await equipmentServiceAuth.getByUser(userId, true);
      setEquipamentos(data);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      try {
        const localData = JSON.parse(localStorage.getItem('estoque-equipamentos') || '[]');
        const userEquipments = localData.filter((eq: any) => eq.user_id === userId);
        setEquipamentos(userEquipments);
      } catch (localError) {
        console.error('Erro ao carregar do localStorage:', localError);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando equipamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/sistema" className="text-gray-500 hover:text-gray-700">
                <i className="ri-arrow-left-line text-xl"></i>
              </Link>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="ri-list-check text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                Lista de Produtos (Otimizada)
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {equipamentos.length} {equipamentos.length === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Sistema Otimizado</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Cache Implementado</h3>
              <p className="text-sm text-blue-600">Dados em cache por 5 minutos</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">Compressão de Imagem</h3>
              <p className="text-sm text-green-600">Imagens otimizadas automaticamente</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-800">Paginação</h3>
              <p className="text-sm text-orange-600">Carregamento otimizado</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800">Limpeza Automática</h3>
              <p className="text-sm text-purple-600">Dados antigos removidos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipamentos.map((equipamento) => (
            <div key={equipamento.id} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800">{equipamento.nome}</h3>
              <p className="text-sm text-gray-500">{equipamento.codigo}</p>
              <p className="text-lg font-bold text-blue-500 mt-2">
                {equipamento.quantidade} unidades
              </p>
            </div>
          ))}
        </div>

        {equipamentos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum equipamento encontrado</p>
          </div>
        )}
      </main>
    </div>
  );
}