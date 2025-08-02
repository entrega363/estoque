import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rtajuzunzkoamruejtim.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWp1enVuemtvYW1ydWVqdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDA0MTMsImV4cCI6MjA2OTcxNjQxM30.dlestmqzHPy-zMeJubohj13dvPaZ7MEUeoRti5OF0uU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para autenticação
export interface UserProfile {
  id: string
  email: string
  nome: string
  status: 'pending' | 'approved' | 'inactive'
  role: 'admin' | 'user'
  created_at: string
  approved_at?: string
  approved_by?: string
}

// Tipos para o banco de dados
export interface Equipment {
  id: string
  codigo: string
  nome: string
  quantidade: number
  categoria: string
  foto?: string
  user_id: string
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

// Funções de autenticação
export const authService = {
  // Fazer login
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Erro no signIn:', error)
        throw new Error(error.message || 'Erro ao fazer login')
      }
      
      return data
    } catch (err: any) {
      console.error('Erro geral no signIn:', err)
      throw err
    }
  },

  // Fazer cadastro
  async signUp(email: string, password: string, nome: string) {
    try {
      console.log('Iniciando signup para:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome
          }
        }
      })
      
      if (error) {
        console.error('Erro no signUp:', error)
        throw new Error(error.message || 'Erro ao criar conta')
      }
      
      console.log('SignUp bem-sucedido:', data)
      return data
    } catch (err: any) {
      console.error('Erro geral no signUp:', err)
      throw err
    }
  },

  // Fazer logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Obter sessão atual
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// Funções de gerenciamento de usuários
export const userService = {
  // Criar perfil de usuário
  async createProfile(profile: UserProfile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Buscar perfil por ID
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar perfil por ID (alias para compatibilidade)
  async getProfile(userId: string) {
    return this.getUserProfile(userId)
  },

  // Buscar todos os usuários (apenas admin)
  async getAllUsers() {
    console.log('🔍 Tentando buscar todos os usuários...');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('📊 Resultado da consulta:', { data, error });
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      throw error;
    }
    
    console.log('✅ Usuários encontrados:', data?.length || 0);
    return data || []
  },

  // Aprovar usuário
  async approveUser(userId: string, adminId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Verificar se é admin
  async isAdmin(userId: string) {
    const profile = await this.getProfile(userId)
    return profile?.role === 'admin' && profile?.status === 'approved'
  },

  // Atualizar status do usuário
  async updateUserStatus(userId: string, status: 'approved' | 'inactive' | 'pending') {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Atualizar role do usuário
  async updateUserRole(userId: string, role: 'admin' | 'user') {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Desativar usuário
  async deactivateUser(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ status: 'inactive' })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Ativar usuário
  async activateUser(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ status: 'approved' })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Excluir usuário (soft delete - marca como deletado)
  async deleteUser(userId: string) {
    // Primeiro, marcar como inativo
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError) throw profileError

    // Opcional: também deletar da tabela auth.users (requer privilégios especiais)
    // Por segurança, vamos apenas deletar o perfil
    return { success: true }
  }
}

// Atualizar equipmentService para filtrar por usuário
export const equipmentServiceAuth = {
  // Buscar equipamentos do usuário atual
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('equipamentos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Buscar todos os equipamentos (apenas admin)
  async getAllForAdmin() {
    const { data, error } = await supabase
      .from('equipamentos')
      .select(`
        *,
        user_profiles!equipamentos_user_id_fkey(nome, email)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Criar equipamento com user_id
  async create(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('equipamentos')
      .insert([equipment])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Verificar se código já existe para o usuário
  async checkCodeExistsForUser(codigo: string, userId: string) {
    const { data, error } = await supabase
      .from('equipamentos')
      .select('id')
      .eq('codigo', codigo)
      .eq('user_id', userId)
      .limit(1)
    
    if (error) throw error
    return (data?.length || 0) > 0
  }
}