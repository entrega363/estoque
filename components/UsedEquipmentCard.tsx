
'use client';

interface EquipmentUsed {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  local: string;
  responsavel: string;
  dataUso: string;
  observacoes: string;
}

interface UsedEquipmentCardProps {
  equipment: EquipmentUsed;
  onReturn?: (id: string) => void;
}

export default function UsedEquipmentCard({ equipment, onReturn }: UsedEquipmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUsed = (dateString: string) => {
    const useDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - useDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUsed = getDaysUsed(equipment.dataUso);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i className="ri-computer-line text-red-500 text-xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{equipment.nome}</h3>
            <p className="text-xs text-gray-500">{equipment.codigo}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
            Utilizado
          </span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2">
          <i className="ri-map-pin-line text-gray-400 w-4"></i>
          <span className="text-gray-600">{equipment.local}</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ri-user-line text-gray-400 w-4"></i>
          <span className="text-gray-600">{equipment.responsavel}</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ri-calendar-line text-gray-400 w-4"></i>
          <span className="text-gray-600">{formatDate(equipment.dataUso)}</span>
          <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
            {daysUsed} dia{daysUsed !== 1 ? 's' : ''}
          </span>
        </div>
        {equipment.observacoes && (
          <div className="flex items-start gap-2">
            <i className="ri-file-text-line text-gray-400 w-4 mt-0.5"></i>
            <span className="text-gray-600 text-xs">{equipment.observacoes}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-700">
          Qtd: {equipment.quantidade} unidade{equipment.quantidade > 1 ? 's' : ''}
        </span>
        {onReturn && (
          <button
            onClick={() => onReturn(equipment.id)}
            className="py-2 px-4 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors !rounded-button"
          >
            <i className="ri-arrow-go-back-line mr-1"></i>
            Devolver
          </button>
        )}
      </div>
    </div>
  );
}
