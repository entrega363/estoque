import { createClient } from '@supabase/supabase-js'

// Configurações hardcoded para GitHub Pages
const supabaseUrl = 'https://rtajuzunzkoamruejtim.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWp1enVuemtvYW1ydWVqdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDA0MTMsImV4cCI6MjA2OTcxNjQxM30.dlestmqzHPy-zMeJubohj13dvPaZ7MEUeoRti5OF0uU'

export const supabaseStatic = createClient(supabaseUrl, supabaseAnonKey)

// Funções de autenticação para GitHub Pages
export const authServiceStatic = {
  // Fazer cadastro
  async signUp(email: string, password: string, nome: string) {
    try {
      console.log('🚀 Iniciando signup estático para:', email)
      console.log('📍 URL:', supabaseUrl)
      console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...')
      
      const { data, error } = await supabaseStatic.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome
          }
        }
      })
      
      if (error) {
        console.error('❌ Erro no signUp:', error)
        throw new Error(error.message || 'Erro ao criar conta')
      }
      
      console.log('✅ SignUp bem-sucedido:', data)
      return data
    } catch (err: any) {
      console.error('💥 Erro geral no signUp:', err)
      throw err
    }
  },

  // Fazer login
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabaseStatic.auth.signInWithPassword({
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

  // Fazer logout
  async signOut() {
    const { error } = await supabaseStatic.auth.signOut()
    if (error) throw error
  },

  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user } } = await supabaseStatic.auth.getUser()
    return user
  },

  // Obter sessão atual
  async getSession() {
    const { data: { session } } = await supabaseStatic.auth.getSession()
    return session
  }
}