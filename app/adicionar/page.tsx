
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NewEquipment {
  codigo: string;
  nome: string;
  quantidade: number;
  categoria: string;
}

export default function AdicionarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewEquipment>({
    codigo: '',
    nome: '',
    quantidade: 1,
    categoria: 'Informatica'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categorias = [
    'Informatica',
    'Perifericos', 
    'Impressao',
    'Mobiliario',
    'Eletronicos',
    'Outros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantidade' ? parseInt(value) || 1 : value
    }));
  };

  const generateCode = () => {
    const prefix = 'ATT-X';
    const timestamp = Date.now().toString().slice(-6);
    setFormData(prev => ({
      ...prev,
      codigo: `${prefix}${timestamp}`
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors !rounded-button">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              Adicionar Equipamento
            </h1>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="ri-check-circle-fill text-green-500 text-xl"></i>
                <div>
                  <p className="font-medium text-green-800">Sucesso!</p>
                  <p className="text-sm text-green-600">Equipamento adicionado ao estoque</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Código do Item */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código do Item
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ex: ATT-X200304"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors !rounded-button"
                  title="Gerar código automático"
                >
                  <i className="ri-refresh-line"></i>
                </button>
              </div>
            </div>

            {/* Nome do Equipamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Equipamento
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Notebook Dell Inspiron"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, quantidade: Math.max(1, prev.quantidade - 1) }))}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors !rounded-button"
                >
                  <i className="ri-subtract-line text-gray-600"></i>
                </button>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleChange}
                  min="1"
                  className="flex-1 text-center px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, quantidade: prev.quantidade + 1 }))}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors !rounded-button"
                >
                  <i className="ri-add-line text-gray-600"></i>
                </button>
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <div className="relative">
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  required
                >
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Pré-visualização:</p>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <i className="ri-computer-line text-green-500"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{formData.nome || 'Nome do equipamento'}</h3>
                      <p className="text-sm text-gray-500">{formData.codigo || 'Código do item'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-500">{formData.quantidade}</p>
                    <p className="text-xs text-gray-400">unidades</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                    {formData.categoria}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                    Disponível
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || showSuccess}
              className="w-full bg-green-500 text-white py-4 rounded-2xl font-medium shadow-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed !rounded-button flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adicionando...
                </>
              ) : showSuccess ? (
                <>
                  <i className="ri-check-line text-xl"></i>
                  Adicionado com Sucesso!
                </>
              ) : (
                <>
                  <i className="ri-add-line text-xl"></i>
                  Adicionar ao Estoque
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors !rounded-button">
              <i className="ri-scan-line text-lg mb-1 block"></i>
              Escanear QR
            </button>
            <button className="p-3 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors !rounded-button">
              <i className="ri-file-excel-line text-lg mb-1 block"></i>
              Importar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
