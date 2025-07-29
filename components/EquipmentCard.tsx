
'use client';

interface Equipment {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  categoria: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onUse?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function EquipmentCard({ equipment, onUse, onEdit }: EquipmentCardProps) {
  const getCategoryIcon = (categoria: string) => {
    const icons: { [key: string]: string } = {
      'Informatica': 'ri-computer-line',
      'Perifericos': 'ri-mouse-line', 
      'Impressao': 'ri-printer-line',
      'Mobiliario': 'ri-table-line',
      'Eletronicos': 'ri-smartphone-line',
      'Outros': 'ri-box-3-line'
    };
    return icons[categoria] || 'ri-box-3-line';
  };

  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Informatica': 'bg-blue-100 text-blue-500',
      'Perifericos': 'bg-green-100 text-green-500',
      'Impressao': 'bg-purple-100 text-purple-500', 
      'Mobiliario': 'bg-orange-100 text-orange-500',
      'Eletronicos': 'bg-pink-100 text-pink-500',
      'Outros': 'bg-gray-100 text-gray-500'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(equipment.categoria)}`}>
            <i className={`${getCategoryIcon(equipment.categoria)} text-xl`}></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{equipment.nome}</h3>
            <p className="text-xs text-gray-500">{equipment.codigo}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-blue-500">{equipment.quantidade}</p>
          <p className="text-xs text-gray-400">unidades</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
          {equipment.categoria}
        </span>
        <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
          Disponível
        </span>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {onUse && (
          <button
            onClick={() => onUse(equipment.id)}
            className="flex-1 py-2 px-3 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors !rounded-button"
          >
            <i className="ri-share-forward-line mr-1"></i>
            Usar
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(equipment.id)}
            className="flex-1 py-2 px-3 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors !rounded-button"
          >
            <i className="ri-edit-line mr-1"></i>
            Editar
          </button>
        )}
      </div>
    </div>
  );
}
