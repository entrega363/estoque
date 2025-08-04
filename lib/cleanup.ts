// Sistema de limpeza automática de dados antigos

import { supabase } from './supabase';

export interface CleanupOptions {
  daysToKeep: number;
  batchSize: number;
  dryRun: boolean;
}

export class DataCleanup {
  // Limpar equipamentos utilizados antigos
  static async cleanupUsedEquipments(options: CleanupOptions = {
    daysToKeep: 365, // 1 ano
    batchSize: 100,
    dryRun: false
  }): Promise<{ deleted: number; errors: string[] }> {
    const { daysToKeep, batchSize, dryRun } = options;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deleted = 0;
    const errors: string[] = [];

    try {
      // Primeiro, contar quantos registros serão afetados
      const { count } = await supabase
        .from('equipamentos_utilizados')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cutoffDate.toISOString());

      console.log(`Encontrados ${count} registros para limpeza`);

      if (dryRun) {
        return { deleted: count || 0, errors: [] };
      }

      // Deletar em lotes
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from('equipamentos_utilizados')
          .delete()
          .lt('created_at', cutoffDate.toISOString())
          .limit(batchSize);

        if (error) {
          errors.push(`Erro ao deletar lote: ${error.message}`);
          break;
        }

        const deletedCount = data?.length || 0;
        deleted += deletedCount;
        hasMore = deletedCount === batchSize;

        // Pequena pausa entre lotes para não sobrecarregar
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

    } catch (error: any) {
      errors.push(`Erro geral na limpeza: ${error.message}`);
    }

    return { deleted, errors };
  }

  // Limpar cache local expirado
  static cleanupLocalCache(): { cleared: number } {
    let cleared = 0;

    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (item.expiry && now > item.expiry) {
              localStorage.removeItem(key);
              cleared++;
            }
          } catch (error) {
            // Se não conseguir parsear, remove o item corrompido
            localStorage.removeItem(key);
            cleared++;
          }
        }
      });

    } catch (error) {
      console.warn('Erro na limpeza do cache local:', error);
    }

    return { cleared };
  }

  // Limpar dados temporários antigos
  static cleanupTempData(): { cleared: number } {
    let cleared = 0;

    try {
      const keys = Object.keys(localStorage);
      const prefixesToClean = ['temp_', 'draft_', 'backup_'];

      keys.forEach(key => {
        const shouldClean = prefixesToClean.some(prefix => key.startsWith(prefix));
        if (shouldClean) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            const itemDate = new Date(item.timestamp || 0);
            const daysDiff = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);

            // Remover dados temporários com mais de 7 dias
            if (daysDiff > 7) {
              localStorage.removeItem(key);
              cleared++;
            }
          } catch (error) {
            // Remove item corrompido
            localStorage.removeItem(key);
            cleared++;
          }
        }
      });

    } catch (error) {
      console.warn('Erro na limpeza de dados temporários:', error);
    }

    return { cleared };
  }

  // Otimizar imagens grandes no localStorage
  static async optimizeStoredImages(): Promise<{ optimized: number; spaceSaved: number }> {
    let optimized = 0;
    let spaceSaved = 0;

    try {
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.includes('foto') || key.includes('image')) {
          try {
            const value = localStorage.getItem(key);
            if (value && value.startsWith('data:image/')) {
              const originalSize = value.length;
              
              // Se a imagem for maior que 100KB, comprimir
              if (originalSize > 100 * 1024) {
                const { ImageCompressor } = await import('./imageUtils');
                const compressed = await ImageCompressor.compressBase64(value, {
                  maxWidth: 600,
                  maxHeight: 400,
                  quality: 0.7
                });

                const newSize = compressed.length;
                if (newSize < originalSize) {
                  localStorage.setItem(key, compressed);
                  spaceSaved += originalSize - newSize;
                  optimized++;
                }
              }
            }
          } catch (error) {
            console.warn(`Erro ao otimizar imagem ${key}:`, error);
          }
        }
      }

    } catch (error) {
      console.warn('Erro na otimização de imagens:', error);
    }

    return { optimized, spaceSaved };
  }

  // Executar limpeza completa
  static async runFullCleanup(options?: Partial<CleanupOptions>): Promise<{
    usedEquipments: { deleted: number; errors: string[] };
    localCache: { cleared: number };
    tempData: { cleared: number };
    images: { optimized: number; spaceSaved: number };
  }> {
    const defaultOptions: CleanupOptions = {
      daysToKeep: 365,
      batchSize: 100,
      dryRun: false,
      ...options
    };

    console.log('Iniciando limpeza completa do sistema...');

    const results = {
      usedEquipments: await this.cleanupUsedEquipments(defaultOptions),
      localCache: this.cleanupLocalCache(),
      tempData: this.cleanupTempData(),
      images: await this.optimizeStoredImages()
    };

    console.log('Limpeza completa finalizada:', results);
    return results;
  }
}

// Hook para limpeza automática
export const useAutoCleanup = (intervalHours: number = 24) => {
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runCleanup = async (dryRun: boolean = false) => {
    if (isRunning) return;

    setIsRunning(true);
    try {
      const results = await DataCleanup.runFullCleanup({ dryRun });
      setLastCleanup(new Date());
      return results;
    } finally {
      setIsRunning(false);
    }
  };

  // Executar limpeza automática
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const shouldRun = !lastCleanup || 
        (now.getTime() - lastCleanup.getTime()) > (intervalHours * 60 * 60 * 1000);

      if (shouldRun) {
        await runCleanup();
      }
    }, 60 * 60 * 1000); // Verificar a cada hora

    return () => clearInterval(interval);
  }, [lastCleanup, intervalHours]);

  return {
    runCleanup,
    lastCleanup,
    isRunning
  };
};

// Executar limpeza na inicialização (apenas no cliente)
if (typeof window !== 'undefined') {
  // Executar limpeza leve na inicialização
  setTimeout(() => {
    DataCleanup.cleanupLocalCache();
    DataCleanup.cleanupTempData();
  }, 5000); // 5 segundos após carregar

  // Executar limpeza completa uma vez por dia
  const lastFullCleanup = localStorage.getItem('lastFullCleanup');
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (!lastFullCleanup || (now - parseInt(lastFullCleanup)) > oneDayMs) {
    setTimeout(async () => {
      await DataCleanup.runFullCleanup({ dryRun: false });
      localStorage.setItem('lastFullCleanup', now.toString());
    }, 30000); // 30 segundos após carregar
  }
}