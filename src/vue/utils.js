/**
 * Vue utilities for form validation
 * Centralized utilities to avoid code duplication
 */

/**
 * Get field name from element or vnode
 * @param {HTMLElement} el - The DOM element
 * @param {Object} vnode - The Vue vnode
 * @returns {string|null} Field name
 */
export function getFieldName(el, vnode) {
  // Try name attribute first (most explicit)
  if (el.name) {
    return el.name;
  }

  // Try to get from v-model directive
  if (vnode?.props) {
    for (const prop in vnode.props) {
      if (prop.startsWith('onUpdate:')) {
        return prop.replace('onUpdate:', '');
      }
    }
  }

  // Try id attribute as fallback
  if (el.id) {
    return el.id;
  }

  return null;
}

/**
 * Get form data from element's form
 * @param {HTMLElement} el - The DOM element
 * @returns {Object} Form data object
 */
export function getFormData(el) {
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
 * @param {string} scope - Optional scope identifier
 */
export function updateFieldClasses(el, validator, fieldName, scope = 'default') {
  const errors = validator.errors();
  const scopedFieldName = scope === 'default' ? fieldName : `${scope}.${fieldName}`;
  
  // Remove existing validation classes
  el.classList.remove('v-valid', 'v-invalid', 'v-has-error');
  
  if (errors.has(scopedFieldName)) {
    el.classList.add('v-invalid', 'v-has-error');
  } else {
    el.classList.add('v-valid');
  }
}

/**
 * Clean up validation event listeners from element
 * @param {HTMLElement} el - The DOM element
 */
export function cleanupValidationListeners(el) {
  if (el._blurHandler) {
    el.removeEventListener('blur', el._blurHandler);
    delete el._blurHandler;
  }
  
  if (el._inputHandler) {
    el.removeEventListener('input', el._inputHandler);
    delete el._inputHandler;
  }
}

/**
 * Create debounced function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

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
