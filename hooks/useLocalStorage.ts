import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar dados no localStorage
 * @param key Chave do localStorage
 * @param initialValue Valor inicial se não houver dados salvos
 * @returns [value, setValue] - Valor atual e função para atualizar
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value seja uma função para que tenhamos a mesma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salvar no estado
      setStoredValue(valueToStore);
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook para gerenciar múltiplas chaves do localStorage
 * @param keys Array de chaves do localStorage
 * @param initialValues Valores iniciais correspondentes
 * @returns Objeto com valores e funções de atualização
 */
export function useMultipleLocalStorage<T extends Record<string, any>>(
  keys: (keyof T)[],
  initialValues: T
): {
  values: T;
  setValues: (updates: Partial<T>) => void;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
} {
  const [values, setValues] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValues;
    }

    const loadedValues = { ...initialValues };
    
    keys.forEach(key => {
      try {
        const item = window.localStorage.getItem(key as string);
        if (item) {
          loadedValues[key] = JSON.parse(item);
        }
      } catch (error) {
        console.error(`Erro ao ler localStorage key "${String(key)}":`, error);
      }
    });

    return loadedValues;
  });

  const updateValues = (updates: Partial<T>) => {
    setValues(prev => {
      const newValues = { ...prev, ...updates };
      
      // Salvar cada chave atualizada no localStorage
      if (typeof window !== 'undefined') {
        Object.entries(updates).forEach(([key, value]) => {
          try {
            window.localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.error(`Erro ao salvar no localStorage key "${key}":`, error);
          }
        });
      }
      
      return newValues;
    });
  };

  const updateSingleValue = <K extends keyof T>(key: K, value: T[K]) => {
    updateValues({ [key]: value } as Partial<T>);
  };

  return {
    values,
    setValues: updateValues,
    setValue: updateSingleValue,
  };
}

/**
 * Hook para limpar dados do localStorage
 * @param keys Chaves a serem limpas (opcional, limpa tudo se não especificado)
 */
export function useClearLocalStorage(keys?: string[]) {
  const clearStorage = () => {
    if (typeof window === 'undefined') return;

    try {
      if (keys && keys.length > 0) {
        keys.forEach(key => window.localStorage.removeItem(key));
      } else {
        window.localStorage.clear();
      }
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  };

  return clearStorage;
}

/**
 * Hook para verificar se o localStorage está disponível
 */
export function useLocalStorageAvailable(): boolean {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    try {
      const testKey = '__localStorage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      setIsAvailable(true);
    } catch {
      setIsAvailable(false);
    }
  }, []);

  return isAvailable;
}