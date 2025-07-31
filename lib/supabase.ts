import { createClient } from '@supabase/supabase-js'

// Estas são chaves públicas de exemplo - você precisará substituir pelas suas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Equipment {
  id: string
  codigo: string
  nome: string
  quantidade: number
  categoria: string
  foto?: string
  created_at?: string
  updated_at?: string
}

export interface EquipmentUsed {
  id: string
  codigo: string
  nome: string
  quantidade: number
  local: string
  responsavel: string
  data_uso: string
  observacoes: string
  created_at?: string
  updated_at?: string
}

// Funções para interagir com o banco
export const equipmentService = {
  // Buscar todos os equipamentos
  async getAll() {
    const { data, error } = await supabase
      .from('equipamentos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Adicionar novo equipamento
  async create(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('equipamentos')
      .insert([equipment])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Atualizar equipamento
  async update(id: string, updates: Partial<Equipment>) {
    const { data, error } = await supabase
      .from('equipamentos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Deletar equipamento
  async delete(id: string) {
    const { error } = await supabase
      .from('equipamentos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Verificar se código já existe
  async checkCodeExists(codigo: string) {
    const { data, error } = await supabase
      .from('equipamentos')
      .select('id')
      .eq('codigo', codigo)
      .limit(1)
    
    if (error) throw error
    return (data?.length || 0) > 0
  }
}

export const usedEquipmentService = {
  // Buscar todos os equipamentos utilizados
  async getAll() {
    const { data, error } = await supabase
      .from('equipamentos_utilizados')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Adicionar equipamento utilizado
  async create(equipment: Omit<EquipmentUsed, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('equipamentos_utilizados')
      .insert([equipment])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Devolver equipamento (remover da lista de utilizados)
  async return(id: string) {
    const { error } = await supabase
      .from('equipamentos_utilizados')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}