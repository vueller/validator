/**
 * Basic Usage Examples
 * Demonstrates core validation functionality
 */

import { validator } from '@vueller/validator';
import { ptBR, en } from '@vueller/validator/locales';

// ===== BASIC VALIDATION =====

// 1. Set up locale and translations
validator.setLocale('pt-BR');
validator.loadTranslations(ptBR);

// 2. Define validation rules for a form scope
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  name: { required: true, min: 2 }
}, {}, 'loginForm');

// 3. Validate form data
async function validateLogin() {
  const formData = {
    email: 'user@example.com',
    password: 'mypassword123',
    name: 'John Doe'
  };

  const isValid = await validator.validate('loginForm', formData);
  const errors = validator.getErrors();
  
  console.log('Login form validation:', { isValid, errors });
  return { isValid, errors };
}

// ===== FIELD-SPECIFIC VALIDATION =====

async function validateField() {
  // Validate a single field
  const isEmailValid = await validator.validate('loginForm').field('email', 'test@example.com');
  console.log('Email is valid:', isEmailValid);
  
  // Validate with invalid data
  const isPasswordValid = await validator.validate('loginForm').field('password', '123');
  console.log('Password is valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    const passwordErrors = validator.getErrors()['loginForm.password'];
    console.log('Password errors:', passwordErrors);
  }
}

// ===== CUSTOM RULES =====

function setupCustomRules() {
  // Add a custom CPF validation rule
  validator.extend('cpf', (value) => {
    if (!value) return true; // Let required handle empty values
    const cpf = value.replace(/\D/g, '');
    return cpf.length === 11 && cpf !== '00000000000';
  });
  
  // Use the custom rule
  validator.setRules('document', { required: true, cpf: true }, {}, 'userForm');
}

// ===== MULTIPLE SCOPES =====

async function validateMultipleForms() {
  // Login form
  validator.setMultipleRules({
    email: { required: true, email: true },
    password: { required: true, min: 8 }
  }, {}, 'loginForm');
  
  // Registration form (different scope)
  validator.setMultipleRules({
    email: { required: true, email: true },
    password: { required: true, min: 8 },
    confirmPassword: { required: true, confirmed: 'password' },
    name: { required: true, min: 2 }
  }, {}, 'registerForm');
  
  // Validate both forms independently
  const loginResult = await validator.validate('loginForm', {
    email: 'user@test.com',
    password: 'password123'
  });
  
  const registerResult = await validator.validate('registerForm', {
    email: 'user@test.com',
    password: 'password123',
    confirmPassword: 'password123',
    name: 'John'
  });
  
  console.log('Login validation:', loginResult);
  console.log('Register validation:', registerResult);
}

// ===== EXECUTION =====

async function runExamples() {
  console.log('=== Basic Usage Examples ===\n');
  
  await validateLogin();
  console.log('');
  
  await validateField();
  console.log('');
  
  setupCustomRules();
  console.log('Custom rules configured');
  console.log('');
  
  await validateMultipleForms();
}

// Export for use in other modules
export {
  validateLogin,
  validateField,
  setupCustomRules,
  validateMultipleForms,
  runExamples
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}
