
export interface Equipment {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  categoria: string;
  dataAdicao: string;
  valorUnitario?: number;
}

export interface EquipmentUsed {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  local: string;
  responsavel: string;
  dataUso: string;
  observacoes: string;
  status: 'em_uso' | 'devolvido';
}

export const mockEquipments: Equipment[] = [
  {
    id: '1',
    codigo: 'ATT-X200304',
    nome: 'Notebook Dell Inspiron 15',
    quantidade: 5,
    categoria: 'Informatica',
    dataAdicao: '2024-01-10',
    valorUnitario: 2500
  },
  {
    id: '2',
    codigo: 'ATT-X200305',
    nome: 'Monitor Samsung 24" Full HD',
    quantidade: 8,
    categoria: 'Informatica',
    dataAdicao: '2024-01-12',
    valorUnitario: 800
  },
  {
    id: '3',
    codigo: 'ATT-X200306',
    nome: 'Mouse Logitech MX Master',
    quantidade: 12,
    categoria: 'Perifericos',
    dataAdicao: '2024-01-15',
    valorUnitario: 150
  },
  {
    id: '4',
    codigo: 'ATT-X200307',
    nome: 'Teclado Mecânico Corsair',
    quantidade: 7,
    categoria: 'Perifericos',
    dataAdicao: '2024-01-18',
    valorUnitario: 300
  },
  {
    id: '5',
    codigo: 'ATT-X200308',
    nome: 'Impressora HP LaserJet Pro',
    quantidade: 3,
    categoria: 'Impressao',
    dataAdicao: '2024-01-20',
    valorUnitario: 1200
  },
  {
    id: '6',
    codigo: 'ATT-X200309',
    nome: 'Webcam Logitech C920',
    quantidade: 6,
    categoria: 'Perifericos',
    dataAdicao: '2024-01-22',
    valorUnitario: 200
  },
  {
    id: '7',
    codigo: 'ATT-X200310',
    nome: 'Mesa de Escritório Ajustável',
    quantidade: 4,
    categoria: 'Mobiliario',
    dataAdicao: '2024-01-25',
    valorUnitario: 800
  },
  {
    id: '8',
    codigo: 'ATT-X200311',
    nome: 'Cadeira Ergonômica Herman Miller',
    quantidade: 10,
    categoria: 'Mobiliario',
    dataAdicao: '2024-01-28',
    valorUnitario: 1500
  }
];

export const mockUsedEquipments: EquipmentUsed[] = [
  {
    id: '1',
    codigo: 'ATT-X200301',
    nome: 'Notebook Dell XPS 13',
    quantidade: 1,
    local: 'Sala de Reunião A - 3º Andar',
    responsavel: 'João Silva',
    dataUso: '2024-01-15',
    observacoes: 'Para apresentação cliente importante - Projeto Alpha',
    status: 'em_uso'
  },
  {
    id: '2',
    codigo: 'ATT-X200302',
    nome: 'Projetor Epson PowerLite',
    quantidade: 1,
    local: 'Auditório Principal',
    responsavel: 'Maria Santos',
    dataUso: '2024-01-14',
    observacoes: 'Evento corporativo anual da empresa',
    status: 'em_uso'
  },
  {
    id: '3',
    codigo: 'ATT-X200303',
    nome: 'Tablet iPad Pro 12.9"',
    quantidade: 2,
    local: 'Área Comercial',
    responsavel: 'Carlos Oliveira',
    dataUso: '2024-01-12',
    observacoes: 'Demonstrações para clientes externos',
    status: 'em_uso'
  },
  {
    id: '4',
    codigo: 'ATT-X200320',
    nome: 'Camera DSLR Canon EOS',
    quantidade: 1,
    local: 'Departamento Marketing',
    responsavel: 'Ana Costa',
    dataUso: '2024-01-16',
    observacoes: 'Sessão de fotos produtos novos',
    status: 'em_uso'
  },
  {
    id: '5',
    codigo: 'ATT-X200321',
    nome: 'Smartphone Samsung Galaxy S23',
    quantidade: 3,
    local: 'Equipe de Campo',
    responsavel: 'Roberto Lima',
    dataUso: '2024-01-10',
    observacoes: 'Pesquisa de mercado região sul',
    status: 'em_uso'
  }
];

export const categories = [
  'Informatica',
  'Perifericos',
  'Impressao', 
  'Mobiliario',
  'Eletronicos',
  'Outros'
];

export const locations = [
  'Sala de Reunião A',
  'Sala de Reunião B',
  'Auditório Principal',
  'Área Comercial',
  'Departamento Marketing',
  'Departamento RH',
  'Recepção',
  'Almoxarifado',
  'Laboratório',
  'Equipe de Campo'
];

export const responsaveis = [
  'João Silva',
  'Maria Santos', 
  'Carlos Oliveira',
  'Ana Costa',
  'Roberto Lima',
  'Patricia Souza',
  'Fernando Alves',
  'Luciana Pereira',
  'Gabriel Rocha',
  'Camila Ferreira'
];
