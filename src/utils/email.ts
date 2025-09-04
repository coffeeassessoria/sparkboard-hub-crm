/**
 * Utilitários para validação e formatação de email
 */

/**
 * Valida se um email tem formato válido
 * @param email - O email a ser validado
 * @returns true se o email for válido, false caso contrário
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Normaliza um email removendo espaços e convertendo para lowercase
 * @param email - O email a ser normalizado
 * @returns O email normalizado
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Valida e normaliza um email
 * @param email - O email a ser processado
 * @returns Objeto com email normalizado e status de validação
 */
export const processEmail = (email: string): { email: string; isValid: boolean } => {
  const normalizedEmail = normalizeEmail(email);
  const isValid = validateEmail(normalizedEmail);
  
  return {
    email: normalizedEmail,
    isValid
  };
};

/**
 * Hook personalizado para gerenciar input de email com validação em tempo real
 * @param initialValue - Valor inicial do email
 * @returns Objeto com valor, setter, validação e erro
 */
export const useEmailInput = (initialValue: string = '') => {
  const [email, setEmail] = React.useState(initialValue);
  const [error, setError] = React.useState('');
  
  const handleEmailChange = (value: string) => {
    const processed = processEmail(value);
    setEmail(processed.email);
    
    if (value && !processed.isValid) {
      setError('Por favor, insira um email válido');
    } else {
      setError('');
    }
  };
  
  const isValid = validateEmail(email);
  
  return {
    email,
    setEmail: handleEmailChange,
    isValid,
    error,
    clearError: () => setError('')
  };
};

// Importar React para o hook
import React from 'react';

/**
 * Obtém o domínio de um email
 * @param email - O email
 * @returns O domínio do email ou string vazia se inválido
 */
export const getEmailDomain = (email: string): string => {
  if (!validateEmail(email)) return '';
  return email.split('@')[1];
};

/**
 * Verifica se um email é de um domínio específico
 * @param email - O email a ser verificado
 * @param domain - O domínio a ser comparado
 * @returns true se o email for do domínio especificado
 */
export const isEmailFromDomain = (email: string, domain: string): boolean => {
  const emailDomain = getEmailDomain(email);
  return emailDomain.toLowerCase() === domain.toLowerCase();
};

/**
 * Lista de domínios de email comuns para sugestões
 */
export const commonEmailDomains = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'uol.com.br',
  'terra.com.br',
  'bol.com.br',
  'ig.com.br'
];

/**
 * Sugere correções para emails com domínios similares
 * @param email - O email a ser verificado
 * @returns Sugestão de correção ou null se não houver
 */
export const suggestEmailCorrection = (email: string): string | null => {
  if (!email.includes('@')) return null;
  
  const [localPart, domain] = email.split('@');
  if (!domain) return null;
  
  // Verifica se o domínio é muito similar a algum comum
  for (const commonDomain of commonEmailDomains) {
    if (domain.toLowerCase() !== commonDomain && 
        isStringSimilar(domain.toLowerCase(), commonDomain)) {
      return `${localPart}@${commonDomain}`;
    }
  }
  
  return null;
};

/**
 * Verifica se duas strings são similares (algoritmo simples de distância)
 * @param str1 - Primeira string
 * @param str2 - Segunda string
 * @returns true se as strings forem similares
 */
const isStringSimilar = (str1: string, str2: string): boolean => {
  if (Math.abs(str1.length - str2.length) > 2) return false;
  
  let differences = 0;
  const maxLength = Math.max(str1.length, str2.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (str1[i] !== str2[i]) {
      differences++;
      if (differences > 2) return false;
    }
  }
  
  return differences <= 2;
};