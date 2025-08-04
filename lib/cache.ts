// Sistema de cache local para otimizar performance
interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

class LocalCache {
  private cache: Map<string, CacheItem> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any, ttl?: number): void {
    const expiry = ttl || this.defaultTTL;
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    };
    
    this.cache.set(key, item);
    
    // Salvar no localStorage para persistência
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
    }
  }

  get(key: string): any | null {
    // Tentar buscar na memória primeiro
    let item = this.cache.get(key);
    
    // Se não estiver na memória, tentar localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          if (item) {
            this.cache.set(key, item);
          }
        }
      } catch (error) {
        console.warn('Erro ao ler cache do localStorage:', error);
        return null;
      }
    }

    if (!item) return null;

    // Verificar se expirou
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Erro ao remover cache do localStorage:', error);
    }
  }

  clear(): void {
    this.cache.clear();
    
    // Limpar cache do localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar cache do localStorage:', error);
    }
  }

  // Limpar cache expirado
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.delete(key);
      }
    }
  }

  // Obter estatísticas do cache
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância singleton do cache
export const cache = new LocalCache();

// Executar limpeza automática a cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}