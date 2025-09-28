/**
 * Exemplo de uso do sistema de tradução estilo VeeValidate 3
 * Demonstra como criar e usar traduções personalizadas
 */

import { validator } from '@vueller/validator';
import { ptBR, en } from '@vueller/validator/locales';

// ===== EXEMPLO 1: Carregar arquivo de tradução original =====

// Definir locale primeiro
validator.setLocale('pt-BR');

// Carregar arquivo de tradução pt-BR original
validator.loadTranslations(ptBR);

// Trocar para inglês e carregar
validator.setLocale('en');
validator.loadTranslations(en);

// ===== EXEMPLO 2: Tradução customizada (apenas mensagens customizadas) =====

const customMessages = {
  required: 'Este campo é obrigatório!',
  email: 'Digite um email válido!',
  min: 'Muito curto! Mínimo {min} caracteres',
  max: 'Muito longo! Máximo {max} caracteres'
};

// Definir locale e carregar apenas mensagens customizadas
validator.setLocale('pt-BR');
validator.loadTranslations(customMessages);

// ===== EXEMPLO 3: Arquivo original + mensagens customizadas =====

const customOverrides = {
  required: 'Campo obrigatório!', // Sobrescreve a mensagem padrão
  'email.required': 'Por favor, digite seu email', // Específico para campo email
  'email.email': 'Email inválido. Exemplo: user@domain.com',
  'password.required': 'A senha é obrigatória',
  'password.min': 'A senha deve ter pelo menos {min} caracteres',
  'name.required': 'Seu nome é necessário para continuar'
};

// Definir locale e carregar arquivo pt-BR original + mensagens customizadas
validator.setLocale('pt-BR');
validator.loadTranslations(ptBR, customOverrides);

// ===== EXEMPLO 4: Uso prático =====

async function exemploUso() {
  // Definir regras para um escopo
  validator.setMultipleRules({
    email: { required: true, email: true },
    password: { required: true, min: 8 },
    name: { required: true, min: 2 }
  }, {}, 'loginForm');

  // Dados de teste
  const formData = {
    email: '',
    password: '123',
    name: ''
  };

  // Validar
  const isValid = await validator.validate('loginForm', formData);
  
  console.log('Formulário válido:', isValid);
  console.log('Erros:', validator.getErrors());
  
  // Exemplo de saída esperada:
  // {
  //   'loginForm.email': ['Por favor, digite seu email'],
  //   'loginForm.password': ['A senha deve ter pelo menos 8 caracteres'],
  //   'loginForm.name': ['Seu nome é necessário para continuar']
  // }
}

// ===== EXEMPLO 5: Múltiplos idiomas =====

// Espanhol customizado (sem arquivo base)
const esTranslations = {
  required: 'El campo {field} es obligatorio',
  email: 'El campo {field} debe ser un email válido',
  min: 'El campo {field} debe tener al menos {min} caracteres'
};

// Carregar múltiplos idiomas
validator.setLocale('en');
validator.loadTranslations(en); // Arquivo original inglês

validator.setLocale('es');
validator.loadTranslations(esTranslations); // Apenas custom

// Função para trocar idioma
function changeLanguage(locale) {
  validator.setLocale(locale);
  console.log(`Idioma alterado para: ${locale}`);
}

// ===== EXEMPLO 6: Regras customizadas com tradução =====

// Criar regra customizada
validator.extend('cpf', (value) => {
  // Validação simplificada de CPF
  const cpf = value.replace(/\D/g, '');
  return cpf.length === 11 && cpf !== '00000000000';
}, 'O campo {field} deve ser um CPF válido');

// Adicionar tradução para a regra customizada
validator.setLocale('pt-BR');
validator.loadTranslations(ptBR, {
  cpf: 'O {field} deve ser um CPF válido (11 dígitos)'
});

// Uso da regra customizada
validator.setRules('document', { required: true, cpf: true }, {}, 'userForm');

// Executar exemplos
exemploUso();

export {
  customMessages,
  customOverrides,
  esTranslations,
  changeLanguage
};
