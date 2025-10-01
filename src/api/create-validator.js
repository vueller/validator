/**
 * createValidator - High-level API for creating validators
 * Provides a simple, intuitive API for common validation scenarios
 */

import { Validator } from '../core/validator.js';

/**
 * Create a validator with a simple API
 * @param {Object} options - Configuration options
 * @returns {Object} Validator instance with simplified API
 */
export function createValidator(options = {}) {
  const validator = new Validator(options);

  const api = {
    // Core validation
    validate: (scope = 'default') => validator.validate(scope),
    validateField: (field, scope = 'default') => validator.validateField(field, scope),
    
    // Rules management
    rules: (field, rules, scope = 'default') => {
      validator.setRules(field, rules, scope);
      return api;
    },
    
    // Data management
    data: (data, scope = 'default') => {
      validator.setData(data, scope);
      return api;
    },
    
    set: (field, value, scope = 'default') => {
      validator.setValue(field, value, scope);
      return api;
    },
    
    get: (field, scope = 'default') => validator.getValue(field, scope),
    getData: (scope = 'default') => validator.getData(scope),
    
    // Labels
    label: (field, label, scope = 'default') => {
      validator.setFieldLabel(field, label, scope);
      return api;
    },
    
    // Validation state
    isValid: () => validator.isValid(),
    hasErrors: () => validator.hasErrors(),
    errors: () => validator.errors(),
    
    // I18n
    locale: (locale) => {
      validator.setLocale(locale);
      return api;
    },
    
    messages: (locale, messages) => {
      validator.addMessages(locale, messages);
      return api;
    },
    
    // Custom rules
    extend: (name, rule, message) => {
      validator.extend(name, rule, message);
      return api;
    },
    
    // Reset
    reset: (scope = 'all') => {
      validator.reset(scope);
      return api;
    },
    
    // Get raw validator instance
    instance: validator
  };

  return api;
}

/**
 * Create a form validator with common patterns
 * @param {Object} config - Form configuration
 * @returns {Object} Form validator
 */
export function createFormValidator(config = {}) {
  const { rules = {}, initialData = {}, options = {} } = config;
  
  const validator = createValidator(options);
  
  // Set initial rules
  if (Object.keys(rules).length > 0) {
    validator.data(initialData);
    
    // Set rules with chaining
    Object.entries(rules).forEach(([field, fieldRules]) => {
      validator.rules(field, fieldRules);
    });
  }
  
  return {
    ...validator,
    
    // Form-specific methods
    submit: async (onSuccess, onError) => {
      const isValid = await validator.validate();
      
      if (isValid) {
        if (onSuccess) onSuccess(validator.getData());
        return true;
      } else {
        if (onError) onError(validator.errors().allByField());
        return false;
      }
    },
    
    // Quick field validation
    field: (fieldName) => ({
      validate: () => validator.validateField(fieldName),
      setValue: (value) => validator.set(fieldName, value),
      getValue: () => validator.get(fieldName),
      hasError: () => validator.errors().has(fieldName),
      getError: () => validator.errors().first(fieldName),
      setLabel: (label) => validator.label(fieldName, label)
    })
  };
}

/**
 * Create a simple validator for quick validation
 * @param {string|Object|Array} rules - Validation rules
 * @param {Object} options - Options
 * @returns {Function} Validation function
 */
export function createSimpleValidator(rules, options = {}) {
  const validator = createValidator(options);
  
  return {
    validate: async (data) => {
      validator.data(data);
      
      // If rules is a string/array, apply to a default field
      if (typeof rules === 'string' || Array.isArray(rules)) {
        validator.rules('value', rules);
        return await validator.validateField('value');
      }
      
      // If rules is an object with field mappings
      if (typeof rules === 'object') {
        Object.entries(rules).forEach(([field, fieldRules]) => {
          validator.rules(field, fieldRules);
        });
        return await validator.validate();
      }
      
      return true;
    },
    
    errors: () => validator.errors(),
    isValid: () => validator.isValid()
  };
}
