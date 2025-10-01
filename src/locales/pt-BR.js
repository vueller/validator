/**
 * Portuguese (Brazil) validation messages
 * Todas as mensagens suportam substituição de parâmetros com {field}, {min}, {max}, etc.
 */
export default {
  // ============================================
  // Regras Básicas
  // ============================================
  required: 'O campo {field} é obrigatório.',
  email: 'O campo {field} deve ser um endereço de email válido.',
  confirmed: 'A confirmação do campo {field} não confere.',
  
  // ============================================
  // Regras de Tamanho/Comprimento
  // ============================================
  min: 'O campo {field} deve ter pelo menos {min} caracteres.',
  max: 'O campo {field} não pode exceder {max} caracteres.',
  between: 'O campo {field} deve estar entre {min} e {max}.',
  
  // ============================================
  // Regras Numéricas
  // ============================================
  numeric: 'O campo {field} deve ser um número.',
  integer: 'O campo {field} deve ser um número inteiro.',
  decimal: 'O campo {field} deve ser um número decimal válido.',
  minValue: 'O campo {field} deve ser pelo menos {minValue}.',
  maxValue: 'O campo {field} não pode exceder {maxValue}.',
  
  // ============================================
  // Regras de Formato
  // ============================================
  pattern: 'O formato do campo {field} é inválido.',
  alpha: 'O campo {field} pode conter apenas letras.',
  digits: 'O campo {field} deve ter {length} dígitos.',
  url: 'O campo {field} deve ser uma URL válida.'
};
