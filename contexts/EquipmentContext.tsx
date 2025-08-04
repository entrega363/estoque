'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Equipment, EquipmentUsed, UseEquipmentData, EquipmentStatistics, UsageHistoryItem, StatusFilter } from '@/types/equipment';
import { EquipmentService } from '@/services/equipmentService';

// Tipos para o contexto
interface EquipmentState {
  equipments: Equipment[];
  usedEquipments: EquipmentUsed[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  categoryFilter: string;
  statusFilter: StatusFilter;
}

interface EquipmentContextType extends EquipmentState {
  // Ações CRUD
  addEquipment: (equipment: Omit<Equipment, 'id' | 'dataAdicao' | 'dataUltimaAtualizacao'>) => Promise<void>;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  
  // Ações de Uso/Devolução
  useEquipment: (id: string, useData: UseEquipmentData) => Promise<void>;
  returnEquipment: (id: string) => Promise<void>;
  
  // Filtros e Busca
  setSearchTerm: (term: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  
  // Estatísticas e Histórico
  getStatistics: () => EquipmentStatistics;
  getUsageHistory: () => UsageHistoryItem[];
  
  // Utilitários
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// Tipos para as ações do reducer
type EquipmentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EQUIPMENTS'; payload: Equipment[] }
  | { type: 'SET_USED_EQUIPMENTS'; payload: EquipmentUsed[] }
  | { type: 'ADD_EQUIPMENT'; payload: Equipment }
  | { type: 'UPDATE_EQUIPMENT'; payload: Equipment }
  | { type: 'DELETE_EQUIPMENT'; payload: string }
  | { type: 'ADD_USED_EQUIPMENT'; payload: EquipmentUsed }
  | { type: 'UPDATE_USED_EQUIPMENT'; payload: EquipmentUsed }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_CATEGORY_FILTER'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: StatusFilter };

// Estado inicial
const initialState: EquipmentState = {
  equipments: [],
  usedEquipments: [],
  loading: false,
  error: null,
  searchTerm: '',
  categoryFilter: '',
  statusFilter: 'all',
};

// Reducer
function equipmentReducer(state: EquipmentState, action: EquipmentAction): EquipmentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_EQUIPMENTS':
      return { ...state, equipments: action.payload };
    
    case 'SET_USED_EQUIPMENTS':
      return { ...state, usedEquipments: action.payload };
    
    case 'ADD_EQUIPMENT':
      return { ...state, equipments: [...state.equipments, action.payload] };
    
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        equipments: state.equipments.map(eq => 
          eq.id === action.payload.id ? action.payload : eq
        ),
      };
    
    case 'DELETE_EQUIPMENT':
      return {
        ...state,
        equipments: state.equipments.filter(eq => eq.id !== action.payload),
      };
    
    case 'ADD_USED_EQUIPMENT':
      return { ...state, usedEquipments: [...state.usedEquipments, action.payload] };
    
    case 'UPDATE_USED_EQUIPMENT':
      return {
        ...state,
        usedEquipments: state.usedEquipments.map(used => 
          used.id === action.payload.id ? action.payload : used
        ),
      };
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    
    case 'SET_CATEGORY_FILTER':
      return { ...state, categoryFilter: action.payload };
    
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
    
    default:
      return state;
  }
}

// Contexto
const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

// Provider
interface EquipmentProviderProps {
  children: ReactNode;
}

export function EquipmentProvider({ children }: EquipmentProviderProps) {
  const [state, dispatch] = useReducer(equipmentReducer, initialState);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const equipments = EquipmentService.getEquipments();
      const usedEquipments = EquipmentService.getUsedEquipments();
      
      dispatch({ type: 'SET_EQUIPMENTS', payload: equipments });
      dispatch({ type: 'SET_USED_EQUIPMENTS', payload: usedEquipments });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados' });
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Implementação das ações
  const addEquipment = async (equipmentData: Omit<Equipment, 'id' | 'dataAdicao' | 'dataUltimaAtualizacao'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Validar dados
      const errors = EquipmentService.validateEquipment(equipmentData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const newEquipment = EquipmentService.addEquipment(equipmentData);
      dispatch({ type: 'ADD_EQUIPMENT', payload: newEquipment });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar equipamento';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Validar dados
      const errors = EquipmentService.validateEquipment(updates);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const updatedEquipment = EquipmentService.updateEquipment(id, updates);
      dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar equipamento';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      EquipmentService.deleteEquipment(id);
      dispatch({ type: 'DELETE_EQUIPMENT', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir equipamento';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const useEquipment = async (id: string, useData: UseEquipmentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Validar dados de uso
      const errors = EquipmentService.validateUseData(useData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const usedEquipment = EquipmentService.useEquipment(id, useData);
      
      // Atualizar estado local
      const updatedEquipments = EquipmentService.getEquipments();
      dispatch({ type: 'SET_EQUIPMENTS', payload: updatedEquipments });
      dispatch({ type: 'ADD_USED_EQUIPMENT', payload: usedEquipment });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao usar equipamento';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const returnEquipment = async (usedEquipmentId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      EquipmentService.returnEquipment(usedEquipmentId);
      
      // Atualizar estado local
      const updatedEquipments = EquipmentService.getEquipments();
      const updatedUsedEquipments = EquipmentService.getUsedEquipments();
      
      dispatch({ type: 'SET_EQUIPMENTS', payload: updatedEquipments });
      dispatch({ type: 'SET_USED_EQUIPMENTS', payload: updatedUsedEquipments });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao devolver equipamento';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Filtros e busca
  const setSearchTerm = (term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  const setCategoryFilter = (category: string) => {
    dispatch({ type: 'SET_CATEGORY_FILTER', payload: category });
  };

  const setStatusFilter = (status: StatusFilter) => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  };

  // Estatísticas
  const getStatistics = (): EquipmentStatistics => {
    const totalEquipments = state.equipments.length;
    const totalInUse = state.usedEquipments.filter(used => used.status === 'em_uso').length;
    const totalAvailable = state.equipments.reduce((sum, eq) => sum + eq.quantidade, 0);
    const totalValue = state.equipments.reduce((sum, eq) => sum + (eq.valorUnitario || 0) * eq.quantidade, 0);

    // Distribuição por categoria
    const categoryDistribution: { [category: string]: number } = {};
    state.equipments.forEach(eq => {
      categoryDistribution[eq.categoria] = (categoryDistribution[eq.categoria] || 0) + 1;
    });

    // Alertas de estoque baixo
    const lowStockAlerts = state.equipments.filter(eq => eq.quantidade <= eq.quantidadeMinima);

    // Devoluções em atraso
    const now = new Date();
    const overdueReturns = state.usedEquipments.filter(used => {
      if (used.status !== 'em_uso' || !used.dataPrevistaDevolucao) return false;
      return new Date(used.dataPrevistaDevolucao) < now;
    });

    return {
      totalEquipments,
      totalInUse,
      totalAvailable,
      totalValue,
      categoryDistribution,
      usageByMonth: [], // TODO: Implementar cálculo por mês
      topUsedEquipments: [], // TODO: Implementar equipamentos mais usados
      lowStockAlerts,
      overdueReturns,
    };
  };

  const getUsageHistory = (): UsageHistoryItem[] => {
    return EquipmentService.getUsageHistory();
  };

  // Utilitários
  const refreshData = async () => {
    await loadInitialData();
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: EquipmentContextType = {
    ...state,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    useEquipment,
    returnEquipment,
    setSearchTerm,
    setCategoryFilter,
    setStatusFilter,
    getStatistics,
    getUsageHistory,
    refreshData,
    clearError,
  };

  return (
    <EquipmentContext.Provider value={contextValue}>
      {children}
    </EquipmentContext.Provider>
  );
}

// Hook para usar o contexto
export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error('useEquipment deve ser usado dentro de um EquipmentProvider');
  }
  return context;
}