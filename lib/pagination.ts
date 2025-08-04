// Sistema de paginação para otimizar carregamento de dados

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class PaginationHelper {
  static paginate<T>(
    data: T[],
    options: PaginationOptions
  ): PaginationResult<T> {
    const { page, limit, search, sortBy, sortOrder = 'asc' } = options;
    
    let filteredData = [...data];

    // Aplicar busca se fornecida
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter((item: any) => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchLower)
        );
      });
    }

    // Aplicar ordenação se fornecida
    if (sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  static generatePageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): number[] {
    const pages: number[] = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}

// Hook para paginação
export const usePagination = <T>(
  data: T[],
  initialLimit: number = 20
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const result = useMemo(() => {
    return PaginationHelper.paginate(data, {
      page: currentPage,
      limit,
      search,
      sortBy,
      sortOrder
    });
  }, [data, currentPage, limit, search, sortBy, sortOrder]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= result.pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (result.pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (result.pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset para primeira página
  };

  const updateSearch = (newSearch: string) => {
    setSearch(newSearch);
    setCurrentPage(1); // Reset para primeira página
  };

  const updateSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset para primeira página
  };

  return {
    ...result,
    currentPage,
    limit,
    search,
    sortBy,
    sortOrder,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    updateSearch,
    updateSort,
    pageNumbers: PaginationHelper.generatePageNumbers(
      currentPage,
      result.pagination.totalPages
    )
  };
};

// Componente de paginação reutilizável
import { useState, useMemo } from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limit?: number;
  showLimitSelector?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onLimitChange,
  limit = 20,
  showLimitSelector = true
}) => {
  const pageNumbers = PaginationHelper.generatePageNumbers(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex items-center justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            Página <span className="font-medium">{currentPage}</span> de{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
          
          {showLimitSelector && onLimitChange && (
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          )}
        </div>

        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                pageNum === currentPage
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </nav>
      </div>
    </div>
  );
};