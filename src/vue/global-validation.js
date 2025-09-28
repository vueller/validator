/**
 * Global validation API for form submission
 * Provides simple methods for validating forms without Vue context
 * Updated to work with scope-based validation
 */

import { getFormData } from './utils/dom-helpers.js';
import { getGlobalValidator } from './directives/validate-directive.js';

/**
 * Global validation methods for form submission
 */
export const globalValidation = {
  /**
   * Validate using new scope-based API
   * @param {string|Object} scopeOrData - Scope name or data object
   * @param {Object} data - Optional data object (when first param is scope)
   * @returns {Promise<boolean>|Object} Validation result or fluent API object
   */
  validate(scopeOrData = null, data = null) {
    const globalValidator = getGlobalValidator();
    if (!globalValidator) {
      return Promise.resolve(true);
    }

    // If no data provided, extract from DOM
    if (!data && (typeof scopeOrData === 'string' || scopeOrData === null)) {
      const formData = getFormData(document.activeElement || document.body);
      if (Object.keys(formData).length > 0) {
        return globalValidator.validate(scopeOrData, formData);
      }
    }

    // Use new validation API (data is handled automatically)
    return globalValidator.validate(scopeOrData, data);
  },



  /**
   * Set validation rules
   * @param {string|Object} field - Field name or rules object
   * @param {Object} rules - Validation rules (if field is string)
   */
  setRules(field, rules = null) {
    const globalValidator = getGlobalValidator();
    if (!globalValidator) return;
    
    if (typeof field === 'string') {
      globalValidator.setRules(field, rules);
    } else {
      globalValidator.setMultipleRules(field);
    }
  },

  /**
   * Get all errors
   * @returns {Object} All errors by field
   */
  getErrors() {
    const globalValidator = getGlobalValidator();
    if (!globalValidator) return {};
    
    const errors = globalValidator.errors();
    return errors.allByField();
  },

  /**
   * Check if form is valid
   * @returns {boolean} True if valid
   */
  isValid() {
    const globalValidator = getGlobalValidator();
    if (!globalValidator) return true;
    
    return globalValidator.isValid();
  },

  /**
   * Reset validation
   * @param {string} scope - Optional scope to reset
   */
  reset(scope = null) {
    const globalValidator = getGlobalValidator();
    if (!globalValidator) return;
    
    if (scope) {
      // Reset specific scope
      globalValidator.setData({}, scope);
    } else {
      // Reset everything
      globalValidator.reset();
    }
  }
};