/**
 * Exemplos simples de uso do sistema de tradução
 * Demonstra os 3 casos de uso principais
 */

import { validator } from '@vueller/validator';
import { ptBR, en } from '@vueller/validator/locales';

// ===== CASO 1: Arquivo de locale original =====

console.log('=== CASO 1: Arquivo de locale original ===');

// Definir idioma
validator.setLocale('pt-BR');

// Carregar arquivo original
validator.loadTranslations(ptBR);

// Testar
validator.setMultipleRules({
  email: { required: true, email: true }
}, {}, 'form1');

await validator.validate('form1', { email: '' });
console.log('Erro com arquivo original:', validator.getErrors());
// Saída: { 'form1.email': ['O campo email é obrigatório.'] }

// ===== CASO 2: Apenas mensagens customizadas =====

console.log('\n=== CASO 2: Apenas mensagens customizadas ===');

// Definir idioma
validator.setLocale('pt-BR');

// Carregar apenas mensagens customizadas
validator.loadTranslations({
  required: 'Este campo é obrigatório!',
  email: 'Digite um email válido!',
  min: 'Muito curto! Mínimo {min} caracteres'
});

// Testar
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}, {}, 'form2');

await validator.validate('form2', { email: '', password: '123' });
console.log('Erro com mensagens customizadas:', validator.getErrors());
// Saída: { 
//   'form2.email': ['Este campo é obrigatório!'],
//   'form2.password': ['Muito curto! Mínimo 8 caracteres']
// }

// ===== CASO 3: Arquivo original + override customizado =====

console.log('\n=== CASO 3: Arquivo original + override ===');

// Definir idioma
validator.setLocale('pt-BR');

// Carregar arquivo original + customizações
validator.loadTranslations(ptBR, {
  required: 'Campo obrigatório!', // Sobrescreve a mensagem padrão
  'email.required': 'Por favor, digite seu email', // Específico para campo email
  'email.email': 'Email inválido',
  'password.min': 'Senha deve ter pelo menos {min} caracteres'
});

// Testar
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  name: { required: true } // Usará a mensagem padrão do arquivo original
}, {}, 'form3');

await validator.validate('form3', { email: '', password: '123', name: '' });
console.log('Erro com arquivo + override:', validator.getErrors());
// Saída: { 
//   'form3.email': ['Por favor, digite seu email'],
//   'form3.password': ['Senha deve ter pelo menos 8 caracteres'],
//   'form3.name': ['Campo obrigatório!'] // Mensagem customizada geral
// }

// ===== EXEMPLO PRÁTICO: Múltiplos idiomas =====

console.log('\n=== EXEMPLO PRÁTICO: Múltiplos idiomas ===');

const setupLanguage = (locale) => {
  validator.setLocale(locale);
  
  switch (locale) {
    case 'pt-BR':
      // Arquivo original + customizações
      validator.loadTranslations(ptBR, {
        'email.required': 'Email é obrigatório',
        'password.min': 'Senha muito curta'
      });
      break;
      
    case 'en':
      // Arquivo original + customizações
      validator.loadTranslations(en, {
        'email.required': 'Email is required',
        'password.min': 'Password too short'
      });
      break;
      
    case 'es':
      // Apenas mensagens customizadas
      validator.loadTranslations({
        required: 'El campo {field} es obligatorio',
        email: 'El campo {field} debe ser un email válido',
        min: 'El campo {field} debe tener al menos {min} caracteres'
      });
      break;
  }
};

// Testar em português
setupLanguage('pt-BR');
validator.setMultipleRules({
  email: { required: true, email: true }
}, {}, 'multiForm');

await validator.validate('multiForm', { email: '' });
console.log('Português:', validator.getErrors());

// Testar em inglês
setupLanguage('en');
await validator.validate('multiForm', { email: '' });
console.log('Inglês:', validator.getErrors());

// Testar em espanhol
setupLanguage('es');
await validator.validate('multiForm', { email: '' });
console.log('Espanhol:', validator.getErrors());

// ===== RESUMO DOS CASOS DE USO =====

console.log('\n=== RESUMO DOS CASOS DE USO ===');
console.log(`
1. Arquivo original:
   validator.loadTranslations(ptBR);

2. Apenas custom:
   validator.loadTranslations({
     required: 'Campo obrigatório!',
     email: 'Email inválido'
   });

3. Arquivo + override:
   validator.loadTranslations(ptBR, {
     required: 'Campo obrigatório!',
     'email.required': 'Digite seu email'
   });
`);

export { setupLanguage };
