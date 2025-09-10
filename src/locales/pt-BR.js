/**
 * Portuguese (Brazil) validation messages
 * Todas as mensagens suportam substituição de parâmetros com {field}, {min}, {max}, etc.
 */
export default {
  required: 'O campo {field} é obrigatório.',
  min: 'O campo {field} deve ter pelo menos {min} caracteres.',
  max: 'O campo {field} não pode exceder {max} caracteres.',
  email: 'O campo {field} deve ser um endereço de email válido.',
  numeric: 'O campo {field} deve ser um número.',
  pattern: 'O formato do campo {field} é inválido.',
  confirmed: 'A confirmação do campo {field} não confere.',
  
  // Mensagens adicionais comuns de validação
  alpha: 'O campo {field} pode conter apenas letras.',
  alphaNum: 'O campo {field} pode conter apenas letras e números.',
  alphaSpaces: 'O campo {field} pode conter apenas letras e espaços.',
  alphaDash: 'O campo {field} pode conter apenas letras, números, traços e underscores.',
  between: 'O campo {field} deve estar entre {min} e {max}.',
  decimal: 'O campo {field} deve ser um número decimal válido.',
  digits: 'O campo {field} deve ter {length} dígitos.',
  dimensions: 'O campo {field} deve ter dimensões válidas.',
  excluded: 'O campo {field} deve ser excluído.',
  ext: 'O campo {field} deve ser um arquivo válido.',
  image: 'O campo {field} deve ser uma imagem.',
  included: 'O campo {field} deve ser um valor válido.',
  integer: 'O campo {field} deve ser um número inteiro.',
  ip: 'O campo {field} deve ser um endereço IP válido.',
  json: 'O campo {field} deve ser uma string JSON válida.',
  length: 'O campo {field} deve ter {length} caracteres.',
  mimes: 'O campo {field} deve ser um tipo de arquivo válido.',
  oneOf: 'O campo {field} deve ser um dos seguintes valores: {list}.',
  regex: 'O formato do campo {field} é inválido.',
  size: 'O tamanho do campo {field} deve ser menor que {size}KB.',
  url: 'O campo {field} deve ser uma URL válida.'
};
