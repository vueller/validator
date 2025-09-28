/**
 * Universal validator API
 * Provides a simple, framework-agnostic validation interface
 * Updated to work with scope-based validation
 */

import { Validator } from './core/index.js';

// Global validator instance
let globalValidator = null;

/**
 * Get or create global validator instance
 * @returns {Validator} Global validator instance
 */
export function getGlobalValidator() {
  if (!globalValidator) {
    globalValidator = new Validator();
  }
  return globalValidator;
}

/**
 * Set global validator instance
 * @param {Validator} validator - Validator instance to set as global
 */
export function setGlobalValidator(validator) {
  globalValidator = validator;
}

/**
 * Universal validator API
 * Simple interface for validation without framework dependencies
 */
export const validator = {
  /**
   * Validate using new scope-based API
   * @param {string|Object} scopeOrData - Scope identifier or data object
   * @param {Object} data - Optional data object (when first param is scope)
   * @returns {Object|Promise<boolean>} Validation result or fluent API object
   */
  validate(scopeOrData = null, data = null) {
    const instance = getGlobalValidator();
    return instance.validate(scopeOrData, data);
  },


  /**
   * Set validation rules for a field in a scope
   * @param {string} fieldName - Field name
   * @param {Object} rules - Validation rules
   * @param {Object} messages - Optional custom messages
   * @param {string} scope - Optional scope identifier
   */
  setRules(fieldName, rules, messages = {}, scope = 'default') {
    const instance = getGlobalValidator();
    instance.setRules(fieldName, rules, messages, scope);
  },

  /**
   * Set multiple validation rules for a scope
   * @param {Object} rules - Rules object
   * @param {Object} messages - Optional custom messages object
   * @param {string} scope - Optional scope identifier
   */
  setMultipleRules(rules, messages = {}, scope = 'default') {
    const instance = getGlobalValidator();
    instance.setMultipleRules(rules, messages, scope);
  },


  /**
   * Get form data for a scope
   * @param {string} scope - Optional scope identifier
   * @returns {Object} Form data
   */
  getData(scope = 'default') {
    const instance = getGlobalValidator();
    return instance.getData(scope);
  },

  /**
   * Get validation errors
   * @returns {Object} Errors object
   */
  getErrors() {
    const instance = getGlobalValidator();
    const errors = instance.errors();
    return errors.allByField();
  },

  /**
   * Check if validation is valid
   * @returns {boolean} True if valid
   */
  isValid() {
    const instance = getGlobalValidator();
    return instance.isValid();
  },

  /**
   * Reset validation state
   * @param {string} scope - Optional scope to reset
   */
  reset(scope = null) {
    const instance = getGlobalValidator();
    if (scope) {
      // Reset specific scope
      instance.setData({}, scope);
      const scopeData = instance.getScopeData(scope);
      for (const field in scopeData.formData) {
        const scopedFieldName = instance.getScopedFieldName(field, scope);
        instance.errors().remove(scopedFieldName);
      }
    } else {
      // Reset everything
      instance.reset();
    }
  },

  /**
   * Set locale for validation messages
   * @param {string} locale - Locale code
   */
  setLocale(locale) {
    const instance = getGlobalValidator();
    instance.setLocale(locale);
  },

  /**
   * Load translations with optional custom messages
   * @param {Object} translations - Translation file object or custom messages object
   * @param {Object} customMessages - Optional custom messages to override or extend
   */
  loadTranslations(translations, customMessages = {}) {
    const instance = getGlobalValidator();
    instance.i18nManager.loadTranslations(translations, customMessages);
  },

  /**
   * Set messages for a locale
   * @param {string} locale - Locale code
   * @param {Object} messages - Messages object
   * @param {boolean} mergeWithDefaults - Whether to merge with default messages
   */
  setMessages(locale, messages, mergeWithDefaults = true) {
    const instance = getGlobalValidator();
    instance.i18nManager.setMessages(locale, messages, mergeWithDefaults);
  },

  /**
   * Extend validator with custom rule (global)
   * @param {string} name - Rule name
   * @param {Function|Class} rule - Rule implementation
   * @param {string} message - Optional default error message
   */
  extend(name, rule, message = null) {
    const instance = getGlobalValidator();
    instance.extend(name, rule, message);
  }
};