/**
 * Vue 3 extension for the Validator library
 * Provides directives and composables for seamless form validation
 */

import { inject } from 'vue';
import { Validator } from '../core/index.js';
import ValidatorForm from './ValidatorForm.vue';
import ValidatorField from './ValidatorField.vue';
import { ValidatorSymbol, useValidator } from './composables.js';

/**
 * Vue 3 directive for field validation with auto-validation on blur
 * Usage: <input v-rules="{ required: true, min: 5 }" v-model="value" />
 * Global config controls blur validation behavior
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
    
    // Remove validation event listeners
    if (el._blurHandler) {
      el.removeEventListener('blur', el._blurHandler);
      delete el._blurHandler;
    }
    if (el._inputHandler) {
      el.removeEventListener('input', el._inputHandler);
      delete el._inputHandler;
    }
  }
};

/**
 * Setup validation events for an element (blur and input)
 * @param {HTMLElement} el - The DOM element
 * @param {Validator} validator - The validator instance
 * @param {string} fieldName - The field name
 */
function setupValidationEvents(el, validator, fieldName) {
  // Remove existing handlers if any
  if (el._blurHandler) {
    el.removeEventListener('blur', el._blurHandler);
    delete el._blurHandler;
  }
  if (el._inputHandler) {
    el.removeEventListener('input', el._inputHandler);
    delete el._inputHandler;
  }

  // Get global config
  const globalConfig = validator.getGlobalConfig ? validator.getGlobalConfig() : {};
  
  // Check form-level configuration
  const formElement = el.closest('form[data-validator-form]');
  
  // Determine blur validation setting
  let validateOnBlur = globalConfig.validateOnBlur !== false; // Default to true
  if (formElement) {
    const formBlurSetting = formElement.dataset.validatorBlurDisabled;
    if (formBlurSetting === 'true') {
      validateOnBlur = false;
    } else if (formBlurSetting === 'false') {
      validateOnBlur = true;
    }
  }
  
  // Determine input validation setting  
  let validateOnInput = globalConfig.validateOnInput === true; // Default to false
  if (formElement) {
    const formInputSetting = formElement.dataset.validatorInputDisabled;
    if (formInputSetting === 'true') {
      validateOnInput = false;
    } else if (formInputSetting === 'false') {
      validateOnInput = true;
    }
  }

  // Create validation handler function
  const createValidationHandler = (eventType) => {
    return async function(event) {
      const value = event.target.value;
      
      // Get all form data for cross-field validation
      const formData = getFormData(el);
      
      try {
        await validator.validateField(fieldName, value, formData);
        
        // Add visual feedback classes
        updateFieldClasses(el, validator, fieldName);
      } catch (error) {
        console.error(`Validation error for field ${fieldName} on ${eventType}:`, error);
      }
    };
  };

  // Setup blur validation
  if (validateOnBlur) {
    el._blurHandler = createValidationHandler('blur');
    el.addEventListener('blur', el._blurHandler);
  }

  // Setup input validation
  if (validateOnInput) {
    // Debounce input validation to avoid excessive API calls
    let inputTimeout;
    el._inputHandler = function(event) {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        createValidationHandler('input')(event);
      }, 300); // 300ms debounce
    };
    el.addEventListener('input', el._inputHandler);
  }
}

/**
 * Get form data from the element's form
 * @param {HTMLElement} el - The DOM element
 * @returns {Object} Form data object
 */
function getFormData(el) {
  const form = el.closest('form');
  if (!form) return {};

  const formData = {};
  const formElements = form.querySelectorAll('input, select, textarea');
  
  formElements.forEach(element => {
    if (element.name || element.id) {
      const fieldName = element.name || element.id;
      
      if (element.type === 'checkbox') {
        formData[fieldName] = element.checked;
      } else if (element.type === 'radio') {
        if (element.checked) {
          formData[fieldName] = element.value;
        }
      } else {
        formData[fieldName] = element.value;
      }
    }
  });

  return formData;
}

/**
 * Update field CSS classes based on validation state
 * @param {HTMLElement} el - The DOM element
 * @param {Validator} validator - The validator instance
 * @param {string} fieldName - The field name
 */
function updateFieldClasses(el, validator, fieldName) {
  const errors = validator.errors();
  
  // Remove existing validation classes
  el.classList.remove('valid', 'invalid', 'has-error');
  
  if (errors.has(fieldName)) {
    el.classList.add('invalid', 'has-error');
  } else {
    el.classList.add('valid');
  }
}


/**
 * Helper function to get field name from element
 * @param {HTMLElement} el - The DOM element
 * @param {Object} vnode - The Vue vnode
 * @returns {string|null} Field name
 */
function getFieldName(el, vnode) {
  // Try to get from name attribute
  if (el.name) {
    return el.name;
  }

  // Try to get from v-model directive
  if (vnode.props) {
    // Look for v-model in props
    for (const prop in vnode.props) {
      if (prop.startsWith('onUpdate:')) {
        return prop.replace('onUpdate:', '');
      }
    }
  }

  // Try to get from id attribute
  if (el.id) {
    return el.id;
  }

  return null;
}

/**
 * Plugin installation function
 * @param {Object} app - Vue app instance
 * @param {Object} options - Plugin options
 * @param {boolean} options.globalValidator - Create global validator instance
 * @param {boolean} options.globalProperties - Add $validator to global properties
 * @param {boolean} options.validateOnBlur - Enable blur validation globally (default: true)
 * @param {boolean} options.validateOnInput - Enable input validation globally (default: false)
 * @param {string} options.locale - Default locale
 */
export function install(app, options = {}) {
  // Default options
  const config = {
    validateOnBlur: true,
    validateOnInput: false,
    locale: 'en',
    ...options
  };

  // Register directive
  app.directive('rules', rulesDirective);

  // Register components
  app.component('ValidatorForm', ValidatorForm);
  app.component('ValidatorField', ValidatorField);

  // Provide global validator if requested
  if (config.globalValidator) {
    const globalValidator = new Validator(config);
    
    // Add global configuration method
    globalValidator.getGlobalConfig = () => config;
    globalValidator.setGlobalConfig = (newConfig) => {
      Object.assign(config, newConfig);
    };
    
    app.provide(ValidatorSymbol, globalValidator);
    
    // Make config available globally
    app.config.globalProperties.$validatorConfig = config;
  }

  // Add global properties if requested
  if (config.globalProperties) {
    app.config.globalProperties.$validator = useValidator;
    app.config.globalProperties.$validatorConfig = config;
  }

  // Store config for directive access
  app._validatorConfig = config;
}

// Export components and composables
export { ValidatorForm, ValidatorField, useValidator, ValidatorSymbol };

// Default export for plugin installation
export default {
  install,
  ValidatorForm,
  ValidatorField
};
