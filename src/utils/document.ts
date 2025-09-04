/**
 * Utilitários para formatação e validação de documentos (CPF e CNPJ)
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function cleanDocument(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function applyCpfMask(value: string): string {
  const cleaned = cleanDocument(value);
  
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  } else if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  } else {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  }
}

/**
 * Aplica máscara de CNPJ (00.000.000/0000-00)
 */
export function applyCnpjMask(value: string): string {
  const cleaned = cleanDocument(value);
  
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 5) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  } else if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  } else if (cleaned.length <= 12) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  } else {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  }
}

/**
 * Aplica máscara automática baseada no tamanho do documento
 * CPF: 11 dígitos, CNPJ: 14 dígitos
 */
export function applyDocumentMask(value: string): string {
  const cleaned = cleanDocument(value);
  
  if (cleaned.length <= 11) {
    return applyCpfMask(value);
  } else {
    return applyCnpjMask(value);
  }
}

/**
 * Valida CPF usando algoritmo oficial
 */
export function validateCpf(cpf: string): boolean {
  const cleaned = cleanDocument(cpf);
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ usando algoritmo oficial
 */
export function validateCnpj(cnpj: string): boolean {
  const cleaned = cleanDocument(cnpj);
  
  // Verifica se tem 14 dígitos
  if (cleaned.length !== 14) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleaned.charAt(13))) return false;
  
  return true;
}

/**
 * Valida documento automaticamente (CPF ou CNPJ)
 */
export function validateDocument(document: string): boolean {
  const cleaned = cleanDocument(document);
  
  if (cleaned.length === 11) {
    return validateCpf(document);
  } else if (cleaned.length === 14) {
    return validateCnpj(document);
  }
  
  return false;
}

/**
 * Identifica o tipo de documento
 */
export function getDocumentType(document: string): 'cpf' | 'cnpj' | 'invalid' {
  const cleaned = cleanDocument(document);
  
  if (cleaned.length === 11) {
    return 'cpf';
  } else if (cleaned.length === 14) {
    return 'cnpj';
  }
  
  return 'invalid';
}

/**
 * Formata documento para exibição
 */
export function formatDocument(document: string): string {
  const cleaned = cleanDocument(document);
  
  if (cleaned.length === 11) {
    return applyCpfMask(document);
  } else if (cleaned.length === 14) {
    return applyCnpjMask(document);
  }
  
  return document;
}

/**
 * Hook personalizado para gerenciar input de documento
 */
export function useDocumentInput(initialValue: string = '') {
  const [value, setValue] = React.useState(initialValue);
  const [displayValue, setDisplayValue] = React.useState(formatDocument(initialValue));
  
  const handleChange = (newValue: string) => {
    const cleaned = cleanDocument(newValue);
    const masked = applyDocumentMask(newValue);
    
    setValue(cleaned);
    setDisplayValue(masked);
  };
  
  const isValid = validateDocument(value);
  const documentType = getDocumentType(value);
  
  return {
    value,
    displayValue,
    handleChange,
    isValid,
    documentType,
    setValue: (newValue: string) => {
      setValue(cleanDocument(newValue));
      setDisplayValue(formatDocument(newValue));
    }
  };
}

// Importação do React para o hook
import React from 'react';