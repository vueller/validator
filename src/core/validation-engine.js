/**
 * ValidationEngine - Core validation logic
 * Handles the execution of validation rules and manages validation state
 */

import { normalizeValue, shouldValidate } from '../utils/validation-helpers.js';

export class ValidationEngine {
  constructor(options = {}) {
    this.options = {
      stopOnFirstFailure: false,
      validateEmptyFields: false,
      ...options
    };
    
    this.ruleRegistry = null;
    this.i18nManager = null;
  }

  /**
   * Set dependencies
   * @param {Object} ruleRegistry - Rule registry instance
   * @param {Object} i18nManager - I18n manager instance
   */
  setDependencies(ruleRegistry, i18nManager) {
    this.ruleRegistry = ruleRegistry;
    this.i18nManager = i18nManager;
  }

  /**
   * Validate a single field
   * @param {string} fieldName - Field name
   * @param {any} value - Field value
   * @param {Array} rules - Array of rule instances
   * @param {Object} allValues - All form values for cross-field validation
   * @returns {Promise<Object>} Validation result
   */
  async validateField(fieldName, value, rules, allValues = {}) {
    if (!rules || rules.length === 0) {
      return { isValid: true, errors: [] };
    }

    const normalizedValue = normalizeValue(value);
    const errors = [];
    const hasRequiredRule = this.hasRequiredRule(rules);

    for (const rule of rules) {
      if (!this.shouldApplyRule(rule, normalizedValue, hasRequiredRule)) {
        continue;
      }

      try {
        const isValid = await rule.validate(normalizedValue, fieldName, allValues);
        
        if (!isValid) {
          const errorMessage = this.getErrorMessage(rule, fieldName);
          errors.push({
            field: fieldName,
            message: errorMessage,
            rule: rule.getRuleName?.() || 'unknown'
          });

          if (this.options.stopOnFirstFailure || rule.getRuleName?.() === 'required') {
            break;
          }
        }
      } catch (error) {
        errors.push({
          field: fieldName,
          message: this.getErrorMessage(rule, fieldName),
          rule: 'error',
          originalError: error
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if rules contain a required rule
   * @param {Array} rules - Array of rule instances
   * @returns {boolean} True if has required rule
   */
  hasRequiredRule(rules) {
    return rules.some(rule => 
      rule.getRuleName?.() === 'required'
    );
  }

  /**
   * Check if rule should be applied
   * @param {Object} rule - Rule instance
   * @param {any} value - Normalized value
   * @param {boolean} hasRequiredRule - Whether field has required rule
   * @returns {boolean} True if rule should be applied
   */
  shouldApplyRule(rule, value, hasRequiredRule) {
    // Check rule's own shouldApply method
    if (rule.shouldApply && !rule.shouldApply(value)) {
      return false;
    }

    // For non-required rules, skip if value is empty and field is not required
    const isRequiredRule = rule.getRuleName?.() === 'required';
    if (!isRequiredRule && !hasRequiredRule) {
      return shouldValidate(value, this.options.validateEmptyFields);
    }

    return true;
  }

  /**
   * Get error message for a rule
   * @param {Object} rule - Rule instance
   * @param {string} fieldName - Field name
   * @returns {string} Error message
   */
  getErrorMessage(rule, fieldName) {
    const ruleName = rule.getRuleName?.() || 'invalid';
    const params = { ...(rule.params || {}) };
    const ruleFallbackMessage = rule.message || null;
    
    return this.i18nManager.getMessage(ruleName, fieldName, params, null, ruleFallbackMessage);
  }
}
