
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Equipment {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  categoria: string;
}

interface EquipmentUsed {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  local: string;
  responsavel: string;
  dataUso: string;
  observacoes: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'estoque' | 'utilizados'>('estoque');
  const [equipamentos, setEquipamentos] = useState<Equipment[]>([]);
  const [utilizados, setUtilizados] = useState<EquipmentUsed[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dados iniciais
  useEffect(() => {
    setEquipamentos([
      { id: '1', codigo: 'ATT-X200304', nome: 'Notebook Dell Inspiron', quantidade: 5, categoria: 'Informatica' },
      { id: '2', codigo: 'ATT-X200305', nome: 'Monitor Samsung 24"', quantidade: 8, categoria: 'Informatica' },
      { id: '3', codigo: 'ATT-X200306', nome: 'Mouse Logitech', quantidade: 12, categoria: 'Perifericos' },
      { id: '4', codigo: 'ATT-X200307', nome: 'Teclado Mecânico', quantidade: 7, categoria: 'Perifericos' },
      { id: '5', codigo: 'ATT-X200308', nome: 'Impressora HP LaserJet', quantidade: 3, categoria: 'Impressao' },
    ]);

    setUtilizados([
      {
        id: '1',
        codigo: 'ATT-X200301',
        nome: 'Notebook Dell XPS',
        quantidade: 1,
        local: 'Sala de Reunião A',
        responsavel: 'João Silva',
        dataUso: '2024-01-15',
        observacoes: 'Para apresentação cliente'
      },
      {
        id: '2',
        codigo: 'ATT-X200302',
        nome: 'Projetor Epson',
        quantidade: 1,
        local: 'Auditório Principal',
        responsavel: 'Maria Santos',
        dataUso: '2024-01-14',
        observacoes: 'Evento corporativo'
      },
    ]);
  }, []);

  const totalEstoque = equipamentos.reduce((sum, item) => sum + item.quantidade, 0);
  const totalUtilizados = utilizados.reduce((sum, item) => sum + item.quantidade, 0);

  const filteredEquipamentos = equipamentos.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUtilizados = utilizados.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.local.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sistema de Controle de Estoque
          </h1>
          
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-4">
            <button
              onClick={() => setActiveTab('estoque')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'estoque'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Est. ({totalEstoque})
            </button>
            <button
              onClick={() => setActiveTab('utilizados')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'utilizados'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              Util. ({totalUtilizados})
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Buscar equipamento..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Add Button */}
        {activeTab === 'estoque' && (
          <div className="mb-4">
            <Link href="/adicionar">
              <button className="w-full bg-green-500 text-white py-4 rounded-2xl font-medium shadow-lg hover:bg-green-600 transition-colors !rounded-button flex items-center justify-center gap-2">
                <i className="ri-add-line text-xl"></i>
                Adicionar ao Estoque
              </button>
            </Link>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'estoque' ? (
            filteredEquipamentos.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <i className="ri-computer-line text-blue-500 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                      <p className="text-sm text-gray-500">{item.codigo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-500">{item.quantidade}</p>
                    <p className="text-xs text-gray-400">unidades</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {item.categoria}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                    Disponível
                  </span>
                </div>
              </div>
            ))
          ) : (
            filteredUtilizados.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <i className="ri-computer-line text-red-500 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                      <p className="text-sm text-gray-500">{item.codigo}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                    Utilizado
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="ri-map-pin-line text-gray-400"></i>
                    <span className="text-gray-600">Local: {item.local}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-user-line text-gray-400"></i>
                    <span className="text-gray-600">Responsável: {item.responsavel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-calendar-line text-gray-400"></i>
                    <span className="text-gray-600">Data: {new Date(item.dataUso).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {item.observacoes && (
                    <div className="flex items-start gap-2">
                      <i className="ri-file-text-line text-gray-400 mt-0.5"></i>
                      <span className="text-gray-600">{item.observacoes}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Qtd: {item.quantidade} unidade{item.quantidade > 1 ? 's' : ''}
                  </span>
                  <button className="text-blue-500 text-sm font-medium hover:text-blue-600 !rounded-button">
                    Devolver
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {((activeTab === 'estoque' && filteredEquipamentos.length === 0) ||
          (activeTab === 'utilizados' && filteredUtilizados.length === 0)) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-box-3-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum item encontrado' : 
               activeTab === 'estoque' ? 'Nenhum equipamento em estoque' : 'Nenhum equipamento utilizado'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
