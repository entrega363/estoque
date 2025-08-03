
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { equipmentServiceAuth, authService, userService } from '../../lib/supabase';

interface NewEquipment {
  codigo: string;
  nome: string;
  descricao: string;
  quantidade: number;
  categoria: string;
  foto?: string;
}

export default function AdicionarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewEquipment>({
    codigo: '',
    nome: '',
    descricao: '',
    quantidade: 1,
    categoria: 'Infraestrutura'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      console.log('🔍 Usuário atual:', user);
      
      if (!user) {
        console.log('❌ Usuário não encontrado, redirecionando para login');
        router.push('/login');
        return;
      }

      try {
        const profile = await userService.getUserProfile(user.id);
        console.log('👤 Perfil do usuário:', profile);
        
        if (!profile) {
          console.log('❌ Perfil não encontrado');
          router.push('/login');
          return;
        }

        if (profile.status !== 'approved') {
          console.log('⏳ Usuário não aprovado, status:', profile.status);
          router.push('/aguardando-aprovacao');
          return;
        }

        console.log('✅ Usuário autenticado e aprovado');
        setCurrentUser(user);
      } catch (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('❌ Erro geral na verificação de autenticação:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    'Infraestrutura',
    'Redes',
    'B2B',
    'B2C',
    'Outros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('🚀 Iniciando submit do formulário');
    console.log('📋 Dados do formulário:', formData);
    console.log('👤 Usuário atual:', currentUser);

    if (!currentUser) {
      console.error('❌ Usuário não autenticado');
      alert('Usuário não autenticado');
      setIsSubmitting(false);
      return;
    }

    try {
      // Verificar se o código já existe para este usuário
      console.log('🔍 Verificando se código já existe...');
      const codeExists = await equipmentServiceAuth.checkCodeExistsForUser(formData.codigo, currentUser.id);
      if (codeExists) {
        console.log('⚠️ Código já existe');
        alert('Já existe um equipamento com este código!');
        setIsSubmitting(false);
        return;
      }

      // Criar novo equipamento com user_id
      console.log('💾 Criando equipamento no Supabase...');
      const equipmentData = {
        codigo: formData.codigo,
        nome: formData.nome,
        descricao: formData.descricao,
        quantidade: formData.quantidade,
        categoria: formData.categoria,
        foto: formData.foto,
        user_id: currentUser.id
      };
      console.log('📦 Dados do equipamento:', equipmentData);
      
      await equipmentServiceAuth.create(equipmentData);

      console.log('✅ Equipamento criado com sucesso!');
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/sistema');
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao salvar equipamento:', error);
      console.error('📋 Detalhes do erro:', error);
      
      // Fallback para localStorage se Supabase falhar
      try {
        const newEquipment = {
          id: Date.now().toString(),
          codigo: formData.codigo,
          nome: formData.nome,
          descricao: formData.descricao,
          quantidade: formData.quantidade,
          categoria: formData.categoria,
          foto: formData.foto,
          user_id: currentUser.id
        };

        const existingEquipamentos = JSON.parse(localStorage.getItem('estoque-equipamentos') || '[]');
        const codeExists = existingEquipamentos.some((eq: any) => eq.codigo === formData.codigo && eq.user_id === currentUser.id);
        
        if (codeExists) {
          alert('Já existe um equipamento com este código!');
          setIsSubmitting(false);
          return;
        }

        const updatedEquipamentos = [...existingEquipamentos, newEquipment];
        localStorage.setItem('estoque-equipamentos', JSON.stringify(updatedEquipamentos));

        setShowSuccess(true);
        setTimeout(() => {
          router.push('/sistema');
        }, 2000);

      } catch (localError) {
        console.error('Erro ao salvar no localStorage:', localError);
        alert('Erro ao salvar equipamento. Tente novamente.');
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({
          ...prev,
          foto: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData(prev => ({
      ...prev,
      foto: undefined
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

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

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Ex: Notebook para desenvolvimento, 8GB RAM, SSD 256GB"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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

            {/* Foto do Equipamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto do Equipamento (Opcional)
              </label>
              
              {!photoPreview ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
                  >
                    <i className="ri-camera-line text-3xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-600 font-medium">Clique para adicionar foto</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={photoPreview}
                      alt="Preview do equipamento"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors !rounded-button"
                    title="Remover foto"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('photo-upload-replace')?.click()}
                    className="absolute bottom-2 right-2 px-3 py-1 bg-white bg-opacity-90 text-gray-700 text-xs rounded-full hover:bg-opacity-100 transition-colors !rounded-button"
                  >
                    Alterar
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload-replace"
                  />
                </div>
              )}
            </div>

            {/* Preview Card */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Pré-visualização:</p>
              <div className="bg-white rounded-xl shadow-sm p-4">
                {/* Foto na pré-visualização */}
                {photoPreview && (
                  <div className="mb-3">
                    <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photoPreview}
                        alt="Preview do equipamento"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Ícone do equipamento"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <i className="ri-computer-line text-green-500"></i>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{formData.nome || 'Nome do equipamento'}</h3>
                      <p className="text-sm text-gray-500">{formData.codigo || 'Código do item'}</p>
                      {formData.descricao && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{formData.descricao}</p>
                      )}
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
