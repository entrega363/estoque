// Utilitários para formatação de dados

export class DateFormatter {
  /**
   * Formata uma data para o formato brasileiro (dd/mm/aaaa)
   */
  static toBrazilianDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    return dateObj.toLocaleDateString('pt-BR');
  }

  /**
   * Formata uma data para o formato brasileiro com hora (dd/mm/aaaa hh:mm)
   */
  static toBrazilianDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    return dateObj.toLocaleString('pt-BR');
  }

  /**
   * Formata uma data para o formato ISO (aaaa-mm-dd) para inputs
   */
  static toInputDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().split('T')[0];
  }

  /**
   * Calcula a diferença em dias entre duas datas
   */
  static daysDifference(date1: string | Date, date2: string | Date): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Formata uma duração em dias para texto legível
   */
  static formatDuration(days: number): string {
    if (days === 0) return 'Hoje';
    if (days === 1) return '1 dia';
    if (days < 30) return `${days} dias`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? '1 mês' : `${months} meses`;
    }
    const years = Math.floor(days / 365);
    return years === 1 ? '1 ano' : `${years} anos`;
  }

  /**
   * Verifica se uma data está em atraso
   */
  static isOverdue(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj < new Date();
  }

  /**
   * Formata tempo relativo (há X dias, em X dias)
   */
  static formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    if (diffDays > 0) return `Em ${diffDays} dias`;
    return `Há ${Math.abs(diffDays)} dias`;
  }
}

export class NumberFormatter {
  /**
   * Formata um número como moeda brasileira
   */
  static toCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Formata um número com separadores de milhares
   */
  static toNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  /**
   * Formata um número como porcentagem
   */
  static toPercentage(value: number, decimals: number = 1): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  /**
   * Formata um número com unidade
   */
  static withUnit(value: number, unit: string): string {
    return `${this.toNumber(value)} ${unit}`;
  }

  /**
   * Converte string para número, removendo formatação
   */
  static fromString(value: string): number {
    return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
  }
}

export class StringFormatter {
  /**
   * Capitaliza a primeira letra de cada palavra
   */
  static toTitleCase(text: string): string {
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Converte para maiúsculas
   */
  static toUpperCase(text: string): string {
    return text.toUpperCase();
  }

  /**
   * Converte para minúsculas
   */
  static toLowerCase(text: string): string {
    return text.toLowerCase();
  }

  /**
   * Remove acentos e caracteres especiais
   */
  static removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Gera um slug a partir de um texto
   */
  static toSlug(text: string): string {
    return this.removeAccents(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Trunca um texto com reticências
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Formata um telefone brasileiro
   */
  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  /**
   * Formata um CPF
   */
  static formatCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
  }

  /**
   * Formata um CNPJ
   */
  static formatCNPJ(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cnpj;
  }

  /**
   * Gera iniciais de um nome
   */
  static getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }
}

export class StatusFormatter {
  /**
   * Formata status de equipamento
   */
  static equipmentStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'manutencao': 'Em Manutenção',
    };
    
    return statusMap[status] || status;
  }

  /**
   * Formata status de uso
   */
  static usageStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'em_uso': 'Em Uso',
      'devolvido': 'Devolvido',
      'atrasado': 'Em Atraso',
    };
    
    return statusMap[status] || status;
  }

  /**
   * Formata condição de uso
   */
  static usageCondition(condition: string): string {
    const conditionMap: Record<string, string> = {
      'excelente': 'Excelente',
      'boa': 'Boa',
      'regular': 'Regular',
      'ruim': 'Ruim',
    };
    
    return conditionMap[condition] || condition;
  }

  /**
   * Retorna cor baseada no status
   */
  static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'ativo': 'green',
      'inativo': 'gray',
      'manutencao': 'yellow',
      'em_uso': 'blue',
      'devolvido': 'green',
      'atrasado': 'red',
    };
    
    return colorMap[status] || 'gray';
  }
}

export class SearchFormatter {
  /**
   * Normaliza texto para busca (remove acentos, converte para minúsculas)
   */
  static normalizeForSearch(text: string): string {
    return StringFormatter.removeAccents(text).toLowerCase().trim();
  }

  /**
   * Verifica se um texto contém um termo de busca
   */
  static matchesSearch(text: string, searchTerm: string): boolean {
    if (!searchTerm.trim()) return true;
    
    const normalizedText = this.normalizeForSearch(text);
    const normalizedSearch = this.normalizeForSearch(searchTerm);
    
    return normalizedText.includes(normalizedSearch);
  }

  /**
   * Destaca termos de busca em um texto
   */
  static highlightSearch(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}