# Internationalization

@vueller/validator provides comprehensive internationalization support with built-in locale management, custom message overrides, and dynamic language switching.

## Overview

The i18n system in @vueller/validator follows a hierarchical message resolution order:

1. **Field-specific message** (`field.rule`) - Highest priority
2. **Rule-specific message** (`rule`) - Medium priority  
3. **Rule fallback message** (from rule registration) - Low priority
4. **Default fallback** (generic message) - Lowest priority

## Built-in Locales

### English (en)

```javascript
{
  required: 'The {field} field is required.',
  email: 'The {field} field must be a valid email address.',
  min: 'The {field} field must be at least {min} characters.',
  max: 'The {field} field may not be greater than {max} characters.',
  numeric: 'The {field} field must be numeric.',
  integer: 'The {field} field must be an integer.',
  url: 'The {field} field must be a valid URL.',
  alpha: 'The {field} field may only contain letters.',
  digits: 'The {field} field must be {digits} digits.',
  between: 'The {field} field must be between {min} and {max}.',
  confirmed: 'The {field} field confirmation does not match.',
  decimal: 'The {field} field must be a decimal number.',
  'max-value': 'The {field} field must not be greater than {max}.',
  'min-value': 'The {field} field must be at least {min}.',
  pattern: 'The {field} field format is invalid.'
}
```

### Portuguese (pt-BR)

```javascript
{
  required: 'O campo {field} é obrigatório.',
  email: 'O campo {field} deve ser um endereço de email válido.',
  min: 'O campo {field} deve ter pelo menos {min} caracteres.',
  max: 'O campo {field} não pode ter mais que {max} caracteres.',
  numeric: 'O campo {field} deve ser numérico.',
  integer: 'O campo {field} deve ser um número inteiro.',
  url: 'O campo {field} deve ser uma URL válida.',
  alpha: 'O campo {field} deve conter apenas letras.',
  digits: 'O campo {field} deve ter {digits} dígitos.',
  between: 'O campo {field} deve estar entre {min} e {max}.',
  confirmed: 'A confirmação do campo {field} não confere.',
  decimal: 'O campo {field} deve ser um número decimal.',
  'max-value': 'O campo {field} não pode ser maior que {max}.',
  'min-value': 'O campo {field} deve ser pelo menos {min}.',
  pattern: 'O formato do campo {field} é inválido.'
}
```

## Global Locale Management

### Setting Default Locale

```javascript
// main.js
import { validator } from '@vueller/validator/vue';

app.use(validator, {
  locale: 'pt-BR' // Default locale
});
```

### Changing Locale Programmatically

```vue
<template>
  <div>
    <button @click="changeLanguage('en')">English</button>
    <button @click="changeLanguage('pt-BR')">Português</button>
    
    <ValidationForm :rules="rules">
      <!-- Form will automatically use current locale -->
    </ValidationForm>
  </div>
</template>

<script setup>
import { useValidator } from '@vueller/validator/vue';

const { setLocale, getLocale } = useValidator();

const changeLanguage = (locale) => {
  setLocale(locale);
  console.log('Current locale:', getLocale());
};
</script>
```

### Reactive Locale Changes

```vue
<script setup>
import { watch } from 'vue';
import { useValidator } from '@vueller/validator/vue';

const { getLocale } = useValidator();

// Watch for locale changes
watch(getLocale, (newLocale, oldLocale) => {
  console.log(`Language changed from ${oldLocale} to ${newLocale}`);
  // Update UI elements, re-validate forms, etc.
});
</script>
```

## Custom Messages

### Adding Single Messages

```javascript
import { useValidator } from '@vueller/validator/vue';

const { addMessage } = useValidator();

// Add custom message for specific rule and locale
addMessage('en', 'email', 'Please enter a valid email address');
addMessage('pt-BR', 'email', 'Por favor, insira um endereço de email válido');
```

### Adding Multiple Messages

```javascript
const { addMessages } = useValidator();

// Add multiple messages at once
addMessages('en', {
  email: 'Please enter a valid email address',
  required: 'This field is required',
  min: 'Must be at least {min} characters'
});

addMessages('pt-BR', {
  email: 'Por favor, insira um endereço de email válido',
  required: 'Este campo é obrigatório',
  min: 'Deve ter pelo menos {min} caracteres'
});
```

### Field-Specific Messages

```javascript
// Override messages for specific fields
addMessage('en', 'user.email', 'Please enter your email address');
addMessage('pt-BR', 'user.email', 'Por favor, insira seu endereço de email');

addMessage('en', 'profile.name', 'Please enter your full name');
addMessage('pt-BR', 'profile.name', 'Por favor, insira seu nome completo');
```

## Custom Rule Messages

### Rule Registration with Fallback Messages

```javascript
import { useValidator } from '@vueller/validator/vue';
import CpfRule from './rules/CpfRule.js';

const { addRule } = useValidator();

// Register rule with fallback message
addRule('cpf', CpfRule, 'Invalid CPF format');
```

### Locale-Specific Rule Messages

```javascript
// Override fallback message with locale-specific ones
addMessage('en', 'cpf', 'The CPF field must contain a valid CPF');
addMessage('pt-BR', 'cpf', 'O campo CPF deve conter um CPF válido');
```

### Parameterized Messages

```javascript
// Messages with parameters
addMessage('en', 'minAge', 'Must be at least {minAge} years old');
addMessage('pt-BR', 'minAge', 'Deve ter pelo menos {minAge} anos de idade');

// Usage in validation
validator.setRules('birthDate', { required: true, minAge: 18 });
```

## Message Interpolation

### Field Names

Field names are automatically interpolated in messages:

```javascript
// Rule: { required: 'The {field} field is required.' }
// Field: 'email'
// Result: 'The email field is required.'
```

### Custom Parameters

```javascript
// Rule with parameters
class MinAgeRule {
  validate(value, params) {
    const minAge = params.minAge || 18;
    // ... validation logic
  }
  
  message(field, value, params) {
    const minAge = params.minAge || 18;
    return `The ${field} field must be at least ${minAge} years old`;
  }
}

// Usage
validator.setRules('birthDate', { required: true, minAge: 21 });
// Message: "The birthDate field must be at least 21 years old"
```

### Custom Field Labels

```vue
<template>
  <input 
    name="email" 
    v-label="'E-mail Address'"
    v-rules="{ required: true, email: true }"
  />
  <!-- Error: "The E-mail Address field must be a valid email address" -->
</template>
```

## Advanced Patterns

### Dynamic Message Loading

```javascript
// Load messages dynamically based on user preference
const loadMessages = async (locale) => {
  try {
    const messages = await import(`./locales/${locale}.js`);
    addMessages(locale, messages.default);
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}`);
  }
};

// Usage
await loadMessages('fr'); // Load French messages
setLocale('fr');
```

### Message Caching

```javascript
// Cache loaded messages to avoid reloading
const messageCache = new Map();

const loadMessagesCached = async (locale) => {
  if (messageCache.has(locale)) {
    return messageCache.get(locale);
  }
  
  const messages = await import(`./locales/${locale}.js`);
  messageCache.set(locale, messages.default);
  return messages.default;
};
```

### Conditional Messages

```javascript
// Different messages based on context
const getContextualMessage = (rule, field, context) => {
  const baseMessages = {
    'en': {
      'email': 'Please enter a valid email address',
      'email.login': 'Enter your login email',
      'email.register': 'Enter your registration email'
    }
  };
  
  const contextKey = `${field}.${context}`;
  return baseMessages['en'][contextKey] || baseMessages['en'][rule];
};
```

## Locale Detection

### Browser Language Detection

```javascript
// Detect browser language
const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const supportedLocales = ['en', 'pt-BR', 'es', 'fr'];
  
  // Extract language code (e.g., 'pt-BR' from 'pt-BR')
  const langCode = browserLang.split('-')[0];
  const fullLang = browserLang;
  
  // Check if full locale is supported
  if (supportedLocales.includes(fullLang)) {
    return fullLang;
  }
  
  // Fallback to language code
  if (supportedLocales.includes(langCode)) {
    return langCode;
  }
  
  // Default fallback
  return 'en';
};

// Usage
const { setLocale } = useValidator();
setLocale(detectBrowserLanguage());
```

### User Preference Storage

```javascript
// Save user language preference
const saveLanguagePreference = (locale) => {
  localStorage.setItem('preferred-language', locale);
};

const loadLanguagePreference = () => {
  return localStorage.getItem('preferred-language') || 'en';
};

// Usage
const { setLocale } = useValidator();
const savedLocale = loadLanguagePreference();
setLocale(savedLocale);

// Save when user changes language
const changeLanguage = (locale) => {
  setLocale(locale);
  saveLanguagePreference(locale);
};
```

## Testing Internationalization

### Unit Tests

```javascript
// tests/i18n.test.js
import { I18nManager } from '@vueller/validator/core';

describe('I18nManager', () => {
  let i18n;

  beforeEach(() => {
    i18n = new I18nManager();
  });

  test('should return English message by default', () => {
    const message = i18n.getMessage('required', 'email');
    expect(message).toBe('The email field is required.');
  });

  test('should return Portuguese message when locale is set', () => {
    i18n.setLocale('pt-BR');
    const message = i18n.getMessage('required', 'email');
    expect(message).toBe('O campo email é obrigatório.');
  });

  test('should use custom message when provided', () => {
    i18n.addMessage('en', 'email', 'Custom email message');
    const message = i18n.getMessage('email', 'email');
    expect(message).toBe('Custom email message');
  });

  test('should interpolate parameters correctly', () => {
    const message = i18n.getMessage('min', 'password', { min: 8 });
    expect(message).toBe('The password field must be at least 8 characters.');
  });
});
```

### Integration Tests

```javascript
// tests/integration/i18n.test.js
import { Validator } from '@vueller/validator';

describe('Internationalization Integration', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator({ locale: 'en' });
  });

  test('should validate with English messages', async () => {
    validator.setRules('email', { required: true, email: true });
    validator.setData({ email: 'invalid-email' });
    
    await validator.validate();
    const errors = validator.errors();
    expect(errors.first('email')).toBe('The email field must be a valid email address.');
  });

  test('should validate with Portuguese messages', async () => {
    validator.setLocale('pt-BR');
    validator.setRules('email', { required: true, email: true });
    validator.setData({ email: 'invalid-email' });
    
    await validator.validate();
    const errors = validator.errors();
    expect(errors.first('email')).toBe('O campo email deve ser um endereço de email válido.');
  });

  test('should use custom messages', async () => {
    validator.addMessage('en', 'email', 'Custom email message');
    validator.setRules('email', { required: true, email: true });
    validator.setData({ email: 'invalid-email' });
    
    await validator.validate();
    const errors = validator.errors();
    expect(errors.first('email')).toBe('Custom email message');
  });
});
```

## Best Practices

### 1. Consistent Message Structure

```javascript
// ✅ Good: Consistent structure
const messages = {
  'en': {
    required: 'The {field} field is required.',
    email: 'The {field} field must be a valid email address.',
    min: 'The {field} field must be at least {min} characters.'
  },
  'pt-BR': {
    required: 'O campo {field} é obrigatório.',
    email: 'O campo {field} deve ser um endereço de email válido.',
    min: 'O campo {field} deve ter pelo menos {min} caracteres.'
  }
};
```

### 2. Meaningful Field Labels

```vue
<!-- ✅ Good: Descriptive labels -->
<input v-label="'E-mail Address'" name="email" />
<input v-label="'Full Name'" name="name" />
<input v-label="'Phone Number'" name="phone" />

<!-- ❌ Avoid: Generic labels -->
<input v-label="'Email'" name="email" />
<input v-label="'Name'" name="name" />
<input v-label="'Phone'" name="phone" />
```

### 3. Context-Aware Messages

```javascript
// ✅ Good: Context-specific messages
addMessage('en', 'user.email', 'Please enter your email address');
addMessage('en', 'admin.email', 'Please enter the administrator email');

// ❌ Avoid: Generic messages for all contexts
addMessage('en', 'email', 'Please enter an email address');
```

### 4. Fallback Strategy

```javascript
// ✅ Good: Always provide fallbacks
const getMessage = (rule, field, locale) => {
  // Try field-specific message
  let message = getFieldMessage(field, rule, locale);
  if (message) return message;
  
  // Try rule-specific message
  message = getRuleMessage(rule, locale);
  if (message) return message;
  
  // Use fallback message
  return getFallbackMessage(rule);
};
```

This comprehensive internationalization guide should help you create multilingual applications with @vueller/validator.
