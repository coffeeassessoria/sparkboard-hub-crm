/**
 * Utilitários para formatação e validação de telefones brasileiros
 */

/**
 * Remove todos os caracteres não numéricos do telefone
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formata um número de telefone brasileiro
 * Aceita números com 10 ou 11 dígitos
 * Formato: (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX
 */
export function formatPhone(phone: string): string {
  const cleaned = cleanPhone(phone);
  
  if (cleaned.length === 0) return '';
  
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  }
  
  if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }
  
  if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  // Para números com 11 dígitos (celular com 9)
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

/**
 * Aplica máscara de telefone em tempo real durante a digitação
 */
export function applyPhoneMask(value: string): string {
  const cleaned = cleanPhone(value);
  
  // Limita a 11 dígitos
  const limited = cleaned.slice(0, 11);
  
  return formatPhone(limited);
}

/**
 * Valida se um telefone brasileiro está no formato correto
 */
export function validatePhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  
  // Telefone fixo: 10 dígitos (XX XXXX-XXXX)
  // Celular: 11 dígitos (XX 9XXXX-XXXX)
  if (cleaned.length === 10) {
    // Telefone fixo: não pode começar com 9 no terceiro dígito
    return cleaned[2] !== '9';
  }
  
  if (cleaned.length === 11) {
    // Celular: deve começar com 9 no terceiro dígito
    return cleaned[2] === '9';
  }
  
  return false;
}

/**
 * Hook personalizado para input de telefone com máscara
 */
import { useState } from 'react';

export function usePhoneInput(initialValue: string = '') {
  const [value, setValue] = useState(formatPhone(initialValue));
  
  const handleChange = (newValue: string) => {
    const masked = applyPhoneMask(newValue);
    setValue(masked);
  };
  
  const getRawValue = () => cleanPhone(value);
  
  const isValid = () => validatePhone(value);
  
  return {
    value,
    onChange: handleChange,
    getRawValue,
    isValid
  };
}