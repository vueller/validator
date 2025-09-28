/**
 * Validation helper utilities for Vue directives
 * Centralized validation logic to avoid duplication
 */

import { debounce, updateFieldClasses, getFormData } from './dom-helpers.js';

/**
 * Parse rules from string or object format
 * @param {string|Object} rules - Rules to parse
 * @returns {Object} Parsed rules object
 */
export function parseRules(rules) {
  if (typeof rules === 'string') {
    // Parse string rules like "required|email|min:3"
    const ruleArray = rules.split('|').map(rule => {
      const [name, ...params] = rule.split(':');
      return { [name]: params.length > 0 ? params.join(':') : true };
    });
    
    return ruleArray.reduce((acc, rule) => ({ ...acc, ...rule }), {});
  }
  
  return rules || {};
}

/**
 * Create validation handler for field events
 * @param {HTMLElement} el - The DOM element
 * @param {Validator} validator - The validator instance
 * @param {string} fieldName - The field name
 * @param {string} eventType - Event type (blur, input)
 * @returns {Function} Validation handler
 */
export function createValidationHandler(el, validator, fieldName, eventType, scope = 'default') {
  return async function(event) {
    const value = event.target.value;
    const formData = getFormData(el);
    
    try {
      // Set form data and field value for the scope
      validator.setData(formData, scope);
      validator.setValue(fieldName, value, scope);
      
      // Validate using new API
      await validator.validate(scope).field(fieldName);
      updateFieldClasses(el, validator, fieldName, scope);
    } catch (error) {
      console.error(`Validation error for field ${fieldName} on ${eventType}:`, error);
    }
  };
}

/**
 * Setup validation events for an element
 * @param {HTMLElement} el - The DOM element
 * @param {Validator} validator - The validator instance
 * @param {string} fieldName - The field name
 * @param {Object} config - Configuration options
 */
export function setupValidationEvents(el, validator, fieldName, config = {}) {
  // Clean up existing handlers
  if (el._blurHandler) {
    el.removeEventListener('blur', el._blurHandler);
    delete el._blurHandler;
  }
  if (el._inputHandler) {
    el.removeEventListener('input', el._inputHandler);
    delete el._inputHandler;
  }

  // Get configuration
  const globalConfig = validator.getGlobalConfig ? validator.getGlobalConfig() : {};
  const formElement = el.closest('form[data-validator-form]');
  
  // Determine validation settings
  const validateOnBlur = getValidationSetting('validateOnBlur', globalConfig, formElement, true);
  const validateOnInput = getValidationSetting('validateOnInput', globalConfig, formElement, false);

  // Setup blur validation
  if (validateOnBlur) {
    el._blurHandler = createValidationHandler(el, validator, fieldName, 'blur');
    el.addEventListener('blur', el._blurHandler);
  }

  // Setup input validation with debouncing
  if (validateOnInput) {
    const inputHandler = createValidationHandler(el, validator, fieldName, 'input');
    el._inputHandler = debounce(inputHandler, config.inputDebounce || 300);
    el.addEventListener('input', el._inputHandler);
  }
}

/**
 * Get validation setting from global config or form-level config
 * @param {string} setting - Setting name
 * @param {Object} globalConfig - Global configuration
 * @param {HTMLElement} formElement - Form element
 * @param {boolean} defaultValue - Default value
 * @returns {boolean} Setting value
 */
function getValidationSetting(setting, globalConfig, formElement, defaultValue) {
  let value = globalConfig[setting] !== undefined ? globalConfig[setting] : defaultValue;
  
  if (formElement) {
    const formSetting = formElement.dataset[`validator${setting.charAt(0).toUpperCase() + setting.slice(1)}Disabled`];
    if (formSetting === 'true') {
      value = false;
    } else if (formSetting === 'false') {
      value = true;
    }
  }
  
  return value;
}
