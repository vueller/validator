# 🚀 Advanced Guide

Advanced patterns, techniques, and best practices for @vueller/validator.

## 📋 Table of Contents

- [Scope Management](#scope-management)
- [Custom Rules](#custom-rules)
- [Async Validation](#async-validation)
- [Conditional Validation](#conditional-validation)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [Internationalization](#internationalization)
- [Testing Strategies](#testing-strategies)

## 🎯 Scope Management

### Understanding Scopes

Scopes allow you to manage multiple forms independently on the same page.

```javascript
import { Validator } from '@vueller/validator';

const validator = new Validator();

// Set global rules (shared across all scopes)
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  name: { required: true, min: 2 }
});

// Validate different forms with isolated data
const loginData = { email: 'user@test.com', password: '123456' };
const registerData = { name: 'John', email: 'john@test.com', password: '123456' };

// Each scope maintains its own validation state
const isLoginValid = await validator.validate('login', loginData);
const isRegisterValid = await validator.validate('register', registerData);

// Scoped errors are isolated
console.log('Login errors:', validator.errors().get('login.email'));
console.log('Register errors:', validator.errors().get('register.email'));
```

### Scope Best Practices

```javascript
// Use descriptive scope names
await validator.validate('userProfileForm', profileData);
await validator.validate('passwordChangeForm', passwordData);
await validator.validate('billingAddressForm', addressData);

// Reset specific scopes
validator.reset('userProfileForm');

// Check scope-specific validation state
const profileErrors = validator.errors().allByField();
const hasProfileErrors = Object.keys(profileErrors).some(key => key.startsWith('userProfileForm.'));
```

## 🔧 Custom Rules

### Simple Custom Rules

```javascript
// Basic custom rule
validator.extend(
  'positiveNumber',
  value => {
    return Number(value) > 0;
  },
  'The {field} must be a positive number'
);

// Rule with parameters
validator.extend(
  'divisibleBy',
  (value, divisor) => {
    return Number(value) % divisor === 0;
  },
  'The {field} must be divisible by {parameter}'
);

// Multiple parameters
validator.extend(
  'between',
  (value, min, max) => {
    const num = Number(value);
    return num >= min && num <= max;
  },
  'The {field} must be between {parameter} and {parameter2}'
);
```

### Advanced Custom Rules

```javascript
// Rule with complex validation logic
validator.extend(
  'strongPassword',
  value => {
    if (!value) return false;

    const checks = {
      minLength: value.length >= 8,
      hasUpper: /[A-Z]/.test(value),
      hasLower: /[a-z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      noCommonWords: !['password', '123456', 'qwerty'].includes(value.toLowerCase())
    };

    return Object.values(checks).every(check => check);
  },
  'Password must be at least 8 characters with uppercase, lowercase, number, special character, and no common words'
);

// Rule that depends on other fields
validator.extend(
  'requiredIf',
  function (value, targetField, targetValue) {
    const otherValue = this.getValue(targetField);

    if (otherValue === targetValue) {
      return value !== null && value !== undefined && value !== '';
    }

    return true;
  },
  'The {field} is required when {parameter} is {parameter2}'
);

// Usage
validator.setRules('billingAddress', {
  requiredIf: ['sameAsShipping', false]
});
```

### Rule Factories

```javascript
// Create reusable rule factories
function createRangeRule(min, max) {
  return {
    [`range_${min}_${max}`]: {
      validator: value => {
        const num = Number(value);
        return num >= min && num <= max;
      },
      message: `The {field} must be between ${min} and ${max}`
    }
  };
}

// Register multiple range rules
const ageRange = createRangeRule(18, 120);
const scoreRange = createRangeRule(0, 100);

validator.extend('ageRange', ageRange.range_18_120.validator, ageRange.range_18_120.message);
validator.extend('scoreRange', scoreRange.range_0_100.validator, scoreRange.range_0_100.message);
```

## ⚡ Async Validation

### Basic Async Rules

```javascript
// Simple async validation
validator.extend(
  'uniqueEmail',
  async value => {
    if (!value) return true;

    try {
      const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`);
      const result = await response.json();
      return result.isUnique;
    } catch (error) {
      console.error('Email validation error:', error);
      return false; // Fail validation on error
    }
  },
  'This email is already registered'
);

// Async rule with caching
const usernameCache = new Map();

validator.extend(
  'uniqueUsername',
  async value => {
    if (!value) return true;

    // Check cache first
    if (usernameCache.has(value)) {
      return usernameCache.get(value);
    }

    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`);
      const result = await response.json();

      // Cache result for 5 minutes
      usernameCache.set(value, result.isUnique);
      setTimeout(() => usernameCache.delete(value), 5 * 60 * 1000);

      return result.isUnique;
    } catch (error) {
      console.error('Username validation error:', error);
      return false;
    }
  },
  'This username is already taken'
);
```

### Debounced Async Validation

```javascript
// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced validation in forms
const debouncedValidation = debounce(async (fieldName, scope) => {
  await validator.validateField(fieldName, scope);
  updateFieldUI(fieldName, scope);
}, 500);

// Usage in event handlers
document.addEventListener('input', e => {
  if (e.target.name) {
    const scope = e.target.dataset.scope || 'default';
    debouncedValidation(e.target.name, scope);
  }
});
```

## 🔀 Conditional Validation

### Field Dependencies

```javascript
// Validate based on other field values
validator.extend(
  'requiredIfChecked',
  function (value, checkboxField) {
    const isChecked = this.getValue(checkboxField);

    if (isChecked) {
      return value !== null && value !== undefined && value !== '';
    }

    return true;
  },
  'The {field} is required when {parameter} is checked'
);

// Complex conditional logic
validator.extend(
  'validCreditCard',
  function (value, cardTypeField) {
    if (!value) return true;

    const cardType = this.getValue(cardTypeField);
    const cleanValue = value.replace(/\s/g, '');

    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/
    };

    if (cardType && patterns[cardType]) {
      return patterns[cardType].test(cleanValue);
    }

    // If no card type selected, check against all patterns
    return Object.values(patterns).some(pattern => pattern.test(cleanValue));
  },
  'Please enter a valid credit card number'
);
```

### Dynamic Rule Application

```javascript
// Apply rules based on form state
class DynamicValidator {
  constructor() {
    this.validator = new Validator();
    this.currentRules = {};
  }

  updateRules(formData) {
    const newRules = this.calculateRules(formData);

    // Only update if rules have changed
    if (JSON.stringify(newRules) !== JSON.stringify(this.currentRules)) {
      this.validator.setMultipleRules(newRules);
      this.currentRules = newRules;
    }
  }

  calculateRules(formData) {
    const rules = {
      email: { required: true, email: true }
    };

    // Add password confirmation if password exists
    if (formData.password) {
      rules.confirmPassword = { required: true, confirmed: 'password' };
    }

    // Require phone if user type is business
    if (formData.userType === 'business') {
      rules.phone = { required: true, pattern: /^\(\d{3}\) \d{3}-\d{4}$/ };
      rules.companyName = { required: true, min: 2 };
    }

    return rules;
  }

  async validate(scope) {
    return await this.validator.validate(scope);
  }
}

// Usage
const dynamicValidator = new DynamicValidator();
await dynamicValidator.validate('registration', formData);
```

## ⚡ Performance Optimization

### Validation Caching

```javascript
class CachedValidator {
  constructor() {
    this.validator = new Validator();
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds
  }

  getCacheKey(field, value, rules) {
    return `${field}:${value}:${JSON.stringify(rules)}`;
  }

  async validateField(field, value, rules) {
    const cacheKey = this.getCacheKey(field, value, rules);

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }
      this.cache.delete(cacheKey);
    }

    // Validate and cache result
    this.validator.setRules(field, rules);
    const result = await this.validator.validate().field(field, value);

    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  clearCache() {
    this.cache.clear();
  }
}
```

### Batch Validation

```javascript
// Validate multiple fields efficiently
class BatchValidator {
  constructor() {
    this.validator = new Validator();
    this.pendingValidations = new Map();
  }

  async batchValidate(validations, scope = 'default') {
    // Group validations by scope
    const scopedValidations = validations.reduce((acc, { field, value, rules }) => {
      if (!acc[scope]) acc[scope] = {};
      acc[scope][field] = value;

      // Set rules if provided
      if (rules) {
        this.validator.setRules(field, rules);
      }

      return acc;
    }, {});

    // Validate all scopes
    const results = {};
    for (const [scopeName, data] of Object.entries(scopedValidations)) {
      results[scopeName] = await this.validator.validate(scopeName, data);
    }

    return results;
  }
}

// Usage
const batchValidator = new BatchValidator();

const validations = [
  { field: 'email', value: 'user@test.com', rules: { required: true, email: true } },
  { field: 'password', value: '123456', rules: { required: true, min: 8 } },
  { field: 'name', value: 'John', rules: { required: true, min: 2 } }
];

const results = await batchValidator.batchValidate(validations, 'registration');
```

## 🚨 Error Handling

### Custom Error Management

```javascript
class ValidationErrorManager {
  constructor(validator) {
    this.validator = validator;
    this.errorHistory = [];
    this.maxHistorySize = 100;
  }

  logError(field, error, context = {}) {
    const errorEntry = {
      field,
      error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    this.errorHistory.push(errorEntry);

    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Send to analytics/logging service
    this.sendToAnalytics(errorEntry);
  }

  sendToAnalytics(errorEntry) {
    // Example: Send to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'validation_error', {
        field_name: errorEntry.field,
        error_message: errorEntry.error,
        custom_context: JSON.stringify(errorEntry.context)
      });
    }
  }

  getErrorStats() {
    const stats = this.errorHistory.reduce((acc, entry) => {
      acc[entry.field] = (acc[entry.field] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .map(([field, count]) => ({ field, count }));
  }

  async validateWithLogging(scope) {
    try {
      const isValid = await this.validator.validate(scope);

      if (!isValid) {
        const errors = this.validator.errors().allByField();
        Object.entries(errors).forEach(([field, fieldErrors]) => {
          fieldErrors.forEach(error => {
            this.logError(field, error, { scope });
          });
        });
      }

      return isValid;
    } catch (error) {
      this.logError('system', error.message, { scope, stack: error.stack });
      throw error;
    }
  }
}
```

### Graceful Degradation

```javascript
// Fallback validation when main validator fails
class FallbackValidator {
  constructor() {
    this.primaryValidator = new Validator();
    this.fallbackRules = new Map();
  }

  setFallbackRule(field, validator) {
    this.fallbackRules.set(field, validator);
  }

  async validate(scope) {
    try {
      // Try primary validation
      return await this.primaryValidator.validate(scope);
    } catch (error) {
      console.warn('Primary validation failed, using fallback:', error);

      // Use fallback validation
      return this.fallbackValidate(data);
    }
  }

  fallbackValidate(data) {
    const errors = [];

    for (const [field, value] of Object.entries(data)) {
      const fallbackRule = this.fallbackRules.get(field);

      if (fallbackRule && !fallbackRule(value)) {
        errors.push(`${field} is invalid`);
      }
    }

    return errors.length === 0;
  }
}

// Setup fallback rules
const fallbackValidator = new FallbackValidator();

fallbackValidator.setFallbackRule('email', value => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
});

fallbackValidator.setFallbackRule('password', value => {
  return value && value.length >= 8;
});
```

## 🌍 Internationalization

### Advanced i18n Patterns

```javascript
// Dynamic locale loading
class I18nValidator {
  constructor() {
    this.validator = new Validator();
    this.loadedLocales = new Set(['en']);
  }

  async setLocale(locale) {
    // Load locale if not already loaded
    if (!this.loadedLocales.has(locale)) {
      await this.loadLocale(locale);
    }

    this.validator.setLocale(locale);
  }

  async loadLocale(locale) {
    try {
      // Dynamic import of locale files
      const messages = await import(`../locales/${locale}.js`);
      this.validator.addMessages(locale, messages.default);
      this.loadedLocales.add(locale);
    } catch (error) {
      console.warn(`Failed to load locale ${locale}:`, error);
      // Fallback to English
      this.validator.setLocale('en');
    }
  }

  // Context-aware messages
  getContextualMessage(rule, field, context = {}) {
    const baseMessage = this.validator.getMessage(rule, field);

    // Apply context-specific modifications
    if (context.formType === 'registration') {
      return baseMessage.replace('field', 'registration field');
    }

    if (context.isRequired && rule !== 'required') {
      return `${baseMessage} (This field is required)`;
    }

    return baseMessage;
  }
}

// Usage with context
const i18nValidator = new I18nValidator();

// Set locale based on user preference
const userLocale = localStorage.getItem('locale') || navigator.language.split('-')[0];
await i18nValidator.setLocale(userLocale);
```

### Pluralization Support

```javascript
// Advanced message formatting with pluralization
validator.extend(
  'arrayLength',
  (value, min, max) => {
    if (!Array.isArray(value)) return false;
    return value.length >= min && value.length <= max;
  },
  (field, min, max, value) => {
    const count = Array.isArray(value) ? value.length : 0;
    const minText = min === 1 ? '1 item' : `${min} items`;
    const maxText = max === 1 ? '1 item' : `${max} items`;

    if (count < min) {
      return `${field} must have at least ${minText}`;
    }

    if (count > max) {
      return `${field} can have at most ${maxText}`;
    }

    return `${field} must have between ${minText} and ${maxText}`;
  }
);
```

## 🧪 Testing Strategies

### Unit Testing Validators

```javascript
// Testing custom rules
describe('Custom Validation Rules', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
  });

  describe('evenNumber rule', () => {
    beforeEach(() => {
      validator.extend(
        'evenNumber',
        value => {
          return Number(value) % 2 === 0;
        },
        'Must be even'
      );

      validator.setRules('number', { evenNumber: true });
    });

    test('should pass for even numbers', async () => {
      const result = await validator.validate().field('number', 4);
      expect(result).toBe(true);
    });

    test('should fail for odd numbers', async () => {
      const result = await validator.validate().field('number', 3);
      expect(result).toBe(false);
      expect(validator.errors().first('number')).toBe('Must be even');
    });
  });

  describe('async validation', () => {
    beforeEach(() => {
      validator.extend(
        'uniqueEmail',
        async value => {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 100));
          return value !== 'taken@test.com';
        },
        'Email is taken'
      );

      validator.setRules('email', { uniqueEmail: true });
    });

    test('should validate unique email', async () => {
      const result = await validator.validate().field('email', 'unique@test.com');
      expect(result).toBe(true);
    });

    test('should reject taken email', async () => {
      const result = await validator.validate().field('email', 'taken@test.com');
      expect(result).toBe(false);
    });
  });
});

// Testing form validation scenarios
describe('Form Validation Scenarios', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
    validator.setMultipleRules({
      email: { required: true, email: true },
      password: { required: true, min: 8 },
      confirmPassword: { required: true, confirmed: 'password' }
    });
  });

  test('should validate complete valid form', async () => {
    const formData = {
      email: 'user@test.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    const result = await validator.validate('registration', formData);
    expect(result).toBe(true);
  });

  test('should handle multiple validation errors', async () => {
    const formData = {
      email: 'invalid-email',
      password: '123',
      confirmPassword: 'different'
    };

    const result = await validator.validate('registration', formData);
    expect(result).toBe(false);

    const errors = validator.errors().allByField();
    expect(errors['registration.email']).toBeDefined();
    expect(errors['registration.password']).toBeDefined();
    expect(errors['registration.confirmPassword']).toBeDefined();
  });
});
```

### Integration Testing

```javascript
// Testing with DOM interactions
describe('DOM Integration', () => {
  let validator;
  let form;

  beforeEach(() => {
    validator = new Validator();

    // Setup DOM
    document.body.innerHTML = `
      <form id="testForm">
        <input type="email" name="email" id="email">
        <input type="password" name="password" id="password">
        <button type="submit">Submit</button>
      </form>
    `;

    form = document.getElementById('testForm');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should validate form on submission', async () => {
    validator.setMultipleRules({
      email: { required: true, email: true },
      password: { required: true, min: 8 }
    });

    // Fill form
    document.getElementById('email').value = 'test@test.com';
    document.getElementById('password').value = 'password123';

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const result = await validator.validate('test', data);
    expect(result).toBe(true);
  });

  test('should handle real-time validation', async () => {
    validator.setRules('email', { required: true, email: true });

    const emailInput = document.getElementById('email');

    // Simulate user input
    emailInput.value = 'invalid';
    emailInput.dispatchEvent(new Event('blur'));

    // Validate
    const result = await validator.validate().field('email', emailInput.value);
    expect(result).toBe(false);
  });
});
```

## 🎯 Best Practices Summary

### Performance

- Use debouncing for real-time validation
- Cache validation results when appropriate
- Batch multiple validations together
- Avoid unnecessary re-validation

### Error Handling

- Provide clear, actionable error messages
- Log validation errors for analytics
- Implement graceful degradation
- Handle async validation failures

### User Experience

- Validate on appropriate events (blur, submit)
- Show validation feedback immediately
- Use progressive enhancement
- Provide contextual help

### Code Organization

- Use descriptive scope names
- Group related validation rules
- Create reusable custom rules
- Write comprehensive tests

### Security

- Always validate on the server side
- Sanitize user input before validation
- Use HTTPS for async validation requests
- Implement rate limiting for API validations

## Next Steps

- [JavaScript Examples](../examples/javascript.md) - Practical implementation examples
- [Vue Examples](../examples/vue.md) - Vue.js specific patterns
- [API Reference](../api/core.md) - Complete API documentation
