/**
 * Vue 3 directives for form validation
 * Provides v-rules and v-validate directives for seamless form validation
 */

import { inject } from 'vue';
import { ValidatorSymbol } from './composables.js';
import { getFieldName, cleanupValidationListeners, parseRules, setupValidationEvents } from './utils.js';

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
 * Vue 3 directive for field validation with auto-validation
 * Usage: <input v-rules="{ required: true, min: 5 }" v-model="value" />
 */
export const rulesDirective = {
  created(el, binding, vnode) {
    const validator = inject(ValidatorSymbol);
    if (!validator) {
      console.warn('v-rules directive requires a validator instance. Use useValidator() or provide ValidatorSymbol.');
      return;
    }

    // Get field name from v-model or name attribute
    const fieldName = getFieldName(el, vnode);
    if (!fieldName) {
      console.warn('v-rules directive requires a field name. Use name attribute or v-model.');
      return;
    }

    // Set rules for the field
    validator.setRules(fieldName, binding.value);

    // Store field info on element for later use
    el._validatorField = fieldName;
    el._validatorRules = binding.value;
    el._validatorInstance = validator;

    // Setup validation events if enabled globally
    setupValidationEvents(el, validator, fieldName);
  },

  updated(el, binding, vnode) {
    const validator = inject(ValidatorSymbol);
    if (!validator || !el._validatorField) return;

    // Update rules if they changed
    if (JSON.stringify(binding.value) !== JSON.stringify(el._validatorRules)) {
      validator.setRules(el._validatorField, binding.value);
      el._validatorRules = binding.value;
    }

    // Re-setup validation events in case global config changed
    setupValidationEvents(el, validator, el._validatorField);
  },

  unmounted(el) {
    const validator = inject(ValidatorSymbol);
    if (validator && el._validatorField) {
      validator.removeRules(el._validatorField);
    }
    
    // Clean up validation event listeners
    cleanupValidationListeners(el);
    
    // Clean up stored references
    delete el._validatorField;
    delete el._validatorRules;
    delete el._validatorInstance;
  }
};

/**
 * Simple validation directive inspired by VeeValidate
 * Usage: <input v-validate="'required|email'" name="email" />
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
        const { Validator } = await import('../core/Validator.js');
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
