
'use client';

interface StockStatsProps {
  totalEstoque: number;
  totalUtilizados: number;
  categorias: { [key: string]: number };
}

export default function StockStats({ totalEstoque, totalUtilizados, categorias }: StockStatsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{totalEstoque}</div>
          <div className="text-sm text-blue-500">Em Estoque</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">{totalUtilizados}</div>
          <div className="text-sm text-red-500">Utilizados</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Por Categoria</h3>
        <div className="space-y-2">
          {Object.entries(categorias).map(([categoria, quantidade]) => (
            <div key={categoria} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{categoria}</span>
              <span className="text-sm font-medium text-gray-800">{quantidade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
