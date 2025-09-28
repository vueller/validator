/**
 * Simple validation directive inspired by VeeValidate
 * Usage: <input v-validate="'required|email'" name="email" />
 */

import { inject } from 'vue';
import { ValidatorSymbol } from '../composables.js';
import { getFieldName, cleanupValidationListeners } from '../utils/dom-helpers.js';
import { parseRules, setupValidationEvents } from '../utils/validation-helpers.js';

// Global validator instance for simple usage
let globalValidator = null;

/**
 * Get global validator instance
 * @returns {Validator|null} Global validator instance
 */
export const getGlobalValidator = () => globalValidator;

/**
 * Set global validator instance
 * @param {Validator} validator - Validator instance to set as global
 */
export const setGlobalValidator = (validator) => {
  globalValidator = validator;
};

/**
 * Simple validation directive
 */
export const validateDirective = {
  async mounted(el, binding, vnode) {
    // Get field name
    const fieldName = getFieldName(el, vnode);
    if (!fieldName) {
      console.warn('v-validate directive requires a field name. Use name attribute.');
      return;
    }

    // Get validator (injected or global)
    let validator = inject(ValidatorSymbol, null);
    
    if (!validator) {
      // Use global validator if no injected one
      if (!globalValidator) {
        const { Validator } = await import('../../core/Validator.js');
        globalValidator = new Validator();
      }
      validator = globalValidator;
    }

    // Store validator reference
    el._validator = validator;
    el._fieldName = fieldName;

    // Parse rules from binding value
    const rules = parseRules(binding.value);
    validator.setRules(fieldName, rules);

    // Setup error display
    setupErrorDisplay(el, validator, fieldName);

    // Setup validation events
    setupValidationEvents(el, validator, fieldName);
  },

  updated(el, binding, vnode) {
    if (!el._validator || !el._fieldName) return;

    // Update rules if they changed
    const newRules = parseRules(binding.value);
    el._validator.setRules(el._fieldName, newRules);
  },

  unmounted(el) {
    if (el._validator && el._fieldName) {
      el._validator.removeRules(el._fieldName);
    }
    
    // Clean up error display
    if (el._errorElement) {
      el._errorElement.remove();
      delete el._errorElement;
    }
    
    // Clean up event listeners
    cleanupValidationListeners(el);
    
    // Clean up stored references
    delete el._validator;
    delete el._fieldName;
    delete el._updateErrors;
  }
};

/**
 * Setup automatic error display
 * @param {HTMLElement} el - The DOM element
 * @param {Validator} validator - The validator instance
 * @param {string} fieldName - The field name
 */
function setupErrorDisplay(el, validator, fieldName) {
  // Create error element
  const errorElement = document.createElement('div');
  errorElement.className = 'v-validate-error';
  errorElement.style.cssText = 'color: #f44336; font-size: 14px; margin-top: 4px;';
  
  // Insert after the input
  el.parentNode.insertBefore(errorElement, el.nextSibling);
  el._errorElement = errorElement;

  // Update error display when errors change
  const updateErrors = () => {
    const errors = validator.errors().get(fieldName);
    if (errors && errors.length > 0) {
      errorElement.textContent = errors[0];
      errorElement.style.display = 'block';
    } else {
      errorElement.style.display = 'none';
    }
  };

  // Initial update
  updateErrors();
  
  // Store update function for cleanup
  el._updateErrors = updateErrors;
}
