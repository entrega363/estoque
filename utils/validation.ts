// Utilitários para validação de dados

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationUtils {
  /**
   * Valida se um valor não está vazio
   */
  static required(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} é obrigatório`;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldName} é obrigatório`;
    }
    return null;
  }

  /**
   * Valida se um valor é um número válido
   */
  static isNumber(value: any, fieldName: string): string | null {
    if (isNaN(Number(value))) {
      return `${fieldName} deve ser um número válido`;
    }
    return null;
  }

  /**
   * Valida se um número é positivo
   */
  static isPositive(value: number, fieldName: string): string | null {
    if (value <= 0) {
      return `${fieldName} deve ser um número positivo`;
    }
    return null;
  }

  /**
   * Valida se um número é não negativo
   */
  static isNonNegative(value: number, fieldName: string): string | null {
    if (value < 0) {
      return `${fieldName} não pode ser negativo`;
    }
    return null;
  }

  /**
   * Valida se um valor tem um comprimento mínimo
   */
  static minLength(value: string, minLength: number, fieldName: string): string | null {
    if (value.length < minLength) {
      return `${fieldName} deve ter pelo menos ${minLength} caracteres`;
    }
    return null;
  }

  /**
   * Valida se um valor tem um comprimento máximo
   */
  static maxLength(value: string, maxLength: number, fieldName: string): string | null {
    if (value.length > maxLength) {
      return `${fieldName} deve ter no máximo ${maxLength} caracteres`;
    }
    return null;
  }

  /**
   * Valida se um email é válido
   */
  static isEmail(value: string, fieldName: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName} deve ser um email válido`;
    }
    return null;
  }

  /**
   * Valida se um telefone é válido (formato brasileiro)
   */
  static isPhone(value: string, fieldName: string): string | null {
    const phoneRegex = /^(\(?\d{2}\)?\s?)?(\d{4,5})-?(\d{4})$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return `${fieldName} deve ser um telefone válido`;
    }
    return null;
  }

  /**
   * Valida se uma data é válida
   */
  static isValidDate(value: string, fieldName: string): string | null {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} deve ser uma data válida`;
    }
    return null;
  }

  /**
   * Valida se uma data é futura
   */
  static isFutureDate(value: string, fieldName: string): string | null {
    const date = new Date(value);
    const now = new Date();
    if (date <= now) {
      return `${fieldName} deve ser uma data futura`;
    }
    return null;
  }

  /**
   * Valida se um código é único em uma lista
   */
  static isUniqueCode(code: string, existingCodes: string[], fieldName: string): string | null {
    if (existingCodes.includes(code)) {
      return `${fieldName} já existe no sistema`;
    }
    return null;
  }

  /**
   * Executa múltiplas validações em um campo
   */
  static validateField(value: any, validators: Array<(value: any) => string | null>): string[] {
    const errors: string[] = [];
    
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors.push(error);
      }
    }
    
    return errors;
  }

  /**
   * Valida um objeto completo usando um schema de validação
   */
  static validateObject<T extends Record<string, any>>(
    obj: T,
    schema: Record<keyof T, Array<(value: any) => string | null>>
  ): ValidationResult {
    const errors: string[] = [];

    for (const [field, validators] of Object.entries(schema)) {
      const fieldErrors = this.validateField(obj[field], validators);
      errors.push(...fieldErrors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Validadores específicos para equipamentos
export class EquipmentValidators {
  static validateEquipmentCode(code: string, existingCodes: string[] = []): string[] {
    return ValidationUtils.validateField(code, [
      (value) => ValidationUtils.required(value, 'Código'),
      (value) => ValidationUtils.minLength(value, 2, 'Código'),
      (value) => ValidationUtils.maxLength(value, 20, 'Código'),
      (value) => ValidationUtils.isUniqueCode(value, existingCodes, 'Código'),
    ]);
  }

  static validateEquipmentName(name: string): string[] {
    return ValidationUtils.validateField(name, [
      (value) => ValidationUtils.required(value, 'Nome'),
      (value) => ValidationUtils.minLength(value, 2, 'Nome'),
      (value) => ValidationUtils.maxLength(value, 100, 'Nome'),
    ]);
  }

  static validateQuantity(quantity: number): string[] {
    return ValidationUtils.validateField(quantity, [
      (value) => ValidationUtils.required(value, 'Quantidade'),
      (value) => ValidationUtils.isNumber(value, 'Quantidade'),
      (value) => ValidationUtils.isNonNegative(Number(value), 'Quantidade'),
    ]);
  }

  static validateMinimumQuantity(minQuantity: number): string[] {
    return ValidationUtils.validateField(minQuantity, [
      (value) => ValidationUtils.required(value, 'Quantidade mínima'),
      (value) => ValidationUtils.isNumber(value, 'Quantidade mínima'),
      (value) => ValidationUtils.isNonNegative(Number(value), 'Quantidade mínima'),
    ]);
  }

  static validateCategory(category: string): string[] {
    return ValidationUtils.validateField(category, [
      (value) => ValidationUtils.required(value, 'Categoria'),
      (value) => ValidationUtils.minLength(value, 2, 'Categoria'),
      (value) => ValidationUtils.maxLength(value, 50, 'Categoria'),
    ]);
  }

  static validateUnitValue(value: number): string[] {
    if (value === undefined || value === null) return []; // Campo opcional
    
    return ValidationUtils.validateField(value, [
      (value) => ValidationUtils.isNumber(value, 'Valor unitário'),
      (value) => ValidationUtils.isNonNegative(Number(value), 'Valor unitário'),
    ]);
  }

  static validateDescription(description: string): string[] {
    if (!description || description.trim() === '') return []; // Campo opcional
    
    return ValidationUtils.validateField(description, [
      (value) => ValidationUtils.maxLength(value, 500, 'Descrição'),
    ]);
  }

  static validateSupplier(supplier: string): string[] {
    if (!supplier || supplier.trim() === '') return []; // Campo opcional
    
    return ValidationUtils.validateField(supplier, [
      (value) => ValidationUtils.maxLength(value, 100, 'Fornecedor'),
    ]);
  }

  static validateLocation(location: string): string[] {
    if (!location || location.trim() === '') return []; // Campo opcional
    
    return ValidationUtils.validateField(location, [
      (value) => ValidationUtils.maxLength(value, 100, 'Localização'),
    ]);
  }

  static validateNotes(notes: string): string[] {
    if (!notes || notes.trim() === '') return []; // Campo opcional
    
    return ValidationUtils.validateField(notes, [
      (value) => ValidationUtils.maxLength(value, 1000, 'Observações'),
    ]);
  }
}

// Validadores para uso de equipamentos
export class UsageValidators {
  static validateResponsible(responsible: string): string[] {
    return ValidationUtils.validateField(responsible, [
      (value) => ValidationUtils.required(value, 'Responsável'),
      (value) => ValidationUtils.minLength(value, 2, 'Responsável'),
      (value) => ValidationUtils.maxLength(value, 100, 'Responsável'),
    ]);
  }

  static validateLocation(location: string): string[] {
    return ValidationUtils.validateField(location, [
      (value) => ValidationUtils.required(value, 'Local'),
      (value) => ValidationUtils.minLength(value, 2, 'Local'),
      (value) => ValidationUtils.maxLength(value, 100, 'Local'),
    ]);
  }

  static validateUsageQuantity(quantity: number, availableQuantity: number): string[] {
    const basicErrors = ValidationUtils.validateField(quantity, [
      (value) => ValidationUtils.required(value, 'Quantidade'),
      (value) => ValidationUtils.isNumber(value, 'Quantidade'),
      (value) => ValidationUtils.isPositive(Number(value), 'Quantidade'),
    ]);

    if (basicErrors.length === 0 && quantity > availableQuantity) {
      basicErrors.push(`Quantidade solicitada (${quantity}) é maior que a disponível (${availableQuantity})`);
    }

    return basicErrors;
  }

  static validateContact(contact: string): string[] {
    if (!contact || contact.trim() === '') return []; // Campo opcional
    
    return ValidationUtils.validateField(contact, [
      (value) => ValidationUtils.maxLength(value, 50, 'Contato'),
    ]);
  }

  static validateExpectedReturnDate(date: string): string[] {
    if (!date || date.trim() === '') return []; // Campo opcional
    
    return ValidationUtils.validateField(date, [
      (value) => ValidationUtils.isValidDate(value, 'Data prevista de devolução'),
      (value) => ValidationUtils.isFutureDate(value, 'Data prevista de devolução'),
    ]);
  }

  static validateUsageNotes(notes: string): string[] {
    return ValidationUtils.validateField(notes, [
      (value) => ValidationUtils.required(value, 'Observações'),
      (value) => ValidationUtils.minLength(value, 5, 'Observações'),
      (value) => ValidationUtils.maxLength(value, 500, 'Observações'),
    ]);
  }
}