/**
 * Utilitários para formatação de valores monetários em Real brasileiro
 */

/**
 * Formata um número para o formato de moeda brasileira (R$)
 * @param value - Valor numérico a ser formatado
 * @param options - Opções de formatação
 * @returns String formatada como moeda brasileira
 */
export const formatCurrency = (
  value: number | string,
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) : value;
  
  if (isNaN(numericValue) || !isFinite(numericValue)) {
    return showSymbol ? 'R$ 0,00' : '0,00';
  }

  // Validar e limitar os valores de fractionDigits para evitar erros
  const validMinFractionDigits = Math.max(0, Math.min(20, isNaN(minimumFractionDigits) ? 2 : minimumFractionDigits));
  const validMaxFractionDigits = Math.max(0, Math.min(20, isNaN(maximumFractionDigits) ? 2 : maximumFractionDigits));

  try {
     const formatted = numericValue.toLocaleString('pt-BR', {
       minimumFractionDigits: validMinFractionDigits,
       maximumFractionDigits: validMaxFractionDigits,
     });
     return showSymbol ? `R$ ${formatted}` : formatted;
   } catch (error) {
     console.warn('Error formatting currency:', error, 'value:', numericValue, 'options:', { minimumFractionDigits, maximumFractionDigits });
     return showSymbol ? 'R$ 0,00' : '0,00';
   }
};

/**
 * Remove a formatação de moeda e retorna apenas o valor numérico
 * @param value - String formatada como moeda
 * @returns Valor numérico
 */
export const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

/**
 * Aplica máscara de moeda em tempo real durante a digitação
 * @param value - Valor atual do input
 * @returns Valor formatado com máscara
 */
export const applyCurrencyMask = (value: string): string => {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '');
  
  if (!digits) {
    return '';
  }

  // Converte para centavos
  const cents = parseInt(digits, 10);
  const reais = cents / 100;

  return formatCurrency(reais);
};

/**
 * Hook personalizado para input de moeda
 * @param initialValue - Valor inicial
 * @returns Objeto com valor formatado e função de mudança
 */
export const useCurrencyInput = (initialValue: number = 0) => {
  const [value, setValue] = React.useState(formatCurrency(initialValue));
  const [numericValue, setNumericValue] = React.useState(initialValue);

  const handleChange = (inputValue: string) => {
    const formatted = applyCurrencyMask(inputValue);
    setValue(formatted);
    setNumericValue(parseCurrency(formatted));
  };

  return {
    value,
    numericValue,
    onChange: handleChange,
    setValue: (newValue: number) => {
      const formatted = formatCurrency(newValue);
      setValue(formatted);
      setNumericValue(newValue);
    }
  };
};

// Importar React para o hook
import React from 'react';