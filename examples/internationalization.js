/**
 * Internationalization (i18n) Examples
 * Demonstrates translation and multi-language support
 */

import { validator } from '@vueller/validator';
import { ptBR, en } from '@vueller/validator/locales';

// ===== LOADING BUILT-IN TRANSLATIONS =====

function loadBuiltInTranslations() {
  console.log('=== Loading Built-in Translations ===');
  
  // Portuguese (Brazil)
  validator.setLocale('pt-BR');
  validator.loadTranslations(ptBR);
  console.log('Portuguese translations loaded');
  
  // English
  validator.setLocale('en');
  validator.loadTranslations(en);
  console.log('English translations loaded');
}

// ===== CUSTOM TRANSLATIONS =====

function loadCustomTranslations() {
  console.log('\n=== Custom Translations ===');
  
  // Spanish - completely custom
  validator.setLocale('es');
  validator.loadTranslations({
    required: 'El campo {field} es obligatorio',
    email: 'El campo {field} debe ser un email válido',
    min: 'El campo {field} debe tener al menos {min} caracteres',
    max: 'El campo {field} no puede tener más de {max} caracteres',
    numeric: 'El campo {field} debe ser un número'
  });
  console.log('Spanish custom translations loaded');
  
  // French - custom translations
  validator.setLocale('fr');
  validator.loadTranslations({
    required: 'Le champ {field} est requis',
    email: 'Le champ {field} doit être un email valide',
    min: 'Le champ {field} doit avoir au moins {min} caractères',
    max: 'Le champ {field} ne peut pas dépasser {max} caractères'
  });
  console.log('French custom translations loaded');
}

// ===== OVERRIDING TRANSLATIONS =====

function overrideTranslations() {
  console.log('\n=== Overriding Built-in Translations ===');
  
  // Load Portuguese base + custom overrides
  validator.setLocale('pt-BR');
  validator.loadTranslations(ptBR, {
    required: 'Campo obrigatório!', // Override general message
    'email.required': 'Por favor, digite seu email', // Field-specific message
    'email.email': 'Email inválido',
    'password.min': 'Senha deve ter pelo menos {min} caracteres',
    'password.required': 'Senha é obrigatória'
  });
  console.log('Portuguese translations with custom overrides loaded');
}

// ===== DYNAMIC LANGUAGE SWITCHING =====

class LanguageManager {
  constructor() {
    this.supportedLanguages = {
      'pt-BR': {
        name: 'Português (Brasil)',
        loader: () => {
          validator.setLocale('pt-BR');
          validator.loadTranslations(ptBR, {
            'email.required': 'Email é obrigatório',
            'password.min': 'Senha muito curta'
          });
        }
      },
      'en': {
        name: 'English',
        loader: () => {
          validator.setLocale('en');
          validator.loadTranslations(en, {
            'email.required': 'Email is required',
            'password.min': 'Password too short'
          });
        }
      },
      'es': {
        name: 'Español',
        loader: () => {
          validator.setLocale('es');
          validator.loadTranslations({
            required: 'El campo {field} es obligatorio',
            email: 'Email inválido',
            min: 'Muy corto - mínimo {min} caracteres'
          });
        }
      },
      'fr': {
        name: 'Français',
        loader: () => {
          validator.setLocale('fr');
          validator.loadTranslations({
            required: 'Le champ {field} est requis',
            email: 'Email invalide',
            min: 'Trop court - minimum {min} caractères'
          });
        }
      }
    };
    
    this.currentLanguage = 'pt-BR';
    this.loadLanguage('pt-BR');
  }
  
  loadLanguage(languageCode) {
    if (this.supportedLanguages[languageCode]) {
      this.supportedLanguages[languageCode].loader();
      this.currentLanguage = languageCode;
      console.log(`Language switched to: ${this.supportedLanguages[languageCode].name}`);
      return true;
    }
    
    console.warn(`Language '${languageCode}' not supported`);
    return false;
  }
  
  getSupportedLanguages() {
    return Object.keys(this.supportedLanguages).map(code => ({
      code,
      name: this.supportedLanguages[code].name
    }));
  }
  
  getCurrentLanguage() {
    return {
      code: this.currentLanguage,
      name: this.supportedLanguages[this.currentLanguage].name
    };
  }
}

// ===== TESTING TRANSLATIONS =====

async function testTranslations() {
  console.log('\n=== Testing Translations ===');
  
  const languageManager = new LanguageManager();
  
  // Set up validation rules
  validator.setMultipleRules({
    email: { required: true, email: true },
    password: { required: true, min: 8 }
  }, {}, 'testForm');
  
  const testData = { email: '', password: '123' };
  
  // Test each language
  for (const { code, name } of languageManager.getSupportedLanguages()) {
    languageManager.loadLanguage(code);
    
    await validator.validate('testForm', testData);
    const errors = validator.getErrors();
    
    console.log(`\n${name} (${code}):`);
    Object.entries(errors).forEach(([field, messages]) => {
      console.log(`  ${field}: ${messages[0]}`);
    });
  }
}

// ===== APPLICATION INTEGRATION EXAMPLE =====

class I18nFormValidator {
  constructor(defaultLanguage = 'pt-BR') {
    this.languageManager = new LanguageManager();
    this.languageManager.loadLanguage(defaultLanguage);
  }
  
  async validateForm(formId, data, rules, customMessages = {}) {
    // Set rules with custom messages for current language
    validator.setMultipleRules(rules, customMessages, formId);
    
    // Validate
    const isValid = await validator.validate(formId, data);
    const errors = validator.getErrors();
    
    return {
      isValid,
      errors: this.formatErrors(errors, formId),
      language: this.languageManager.getCurrentLanguage()
    };
  }
  
  formatErrors(errors, formScope) {
    const formatted = {};
    
    Object.entries(errors).forEach(([fieldKey, messages]) => {
      if (fieldKey.startsWith(`${formScope}.`)) {
        const fieldName = fieldKey.replace(`${formScope}.`, '');
        formatted[fieldName] = messages;
      }
    });
    
    return formatted;
  }
  
  changeLanguage(languageCode) {
    return this.languageManager.loadLanguage(languageCode);
  }
  
  getSupportedLanguages() {
    return this.languageManager.getSupportedLanguages();
  }
}

// ===== USAGE EXAMPLE =====

async function demonstrateI18nValidator() {
  console.log('\n=== I18n Form Validator Demo ===');
  
  const formValidator = new I18nFormValidator('pt-BR');
  
  const loginRules = {
    email: { required: true, email: true },
    password: { required: true, min: 8 }
  };
  
  const customMessages = {
    'email.required': 'Digite seu email para continuar',
    'password.min': 'Senha deve ter no mínimo {min} caracteres'
  };
  
  // Test in Portuguese
  let result = await formValidator.validateForm(
    'loginForm', 
    { email: '', password: '123' }, 
    loginRules, 
    customMessages
  );
  
  console.log('Portuguese result:', result);
  
  // Switch to English and test again
  formValidator.changeLanguage('en');
  
  result = await formValidator.validateForm(
    'loginForm', 
    { email: '', password: '123' }, 
    loginRules,
    {
      'email.required': 'Please enter your email',
      'password.min': 'Password must be at least {min} characters'
    }
  );
  
  console.log('English result:', result);
}

// ===== EXECUTION =====

async function runInternationalizationExamples() {
  console.log('=== Internationalization Examples ===');
  
  loadBuiltInTranslations();
  loadCustomTranslations();
  overrideTranslations();
  await testTranslations();
  await demonstrateI18nValidator();
}

// Export for use in other modules
export {
  LanguageManager,
  I18nFormValidator,
  loadBuiltInTranslations,
  loadCustomTranslations,
  overrideTranslations,
  testTranslations,
  demonstrateI18nValidator,
  runInternationalizationExamples
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runInternationalizationExamples();
}
