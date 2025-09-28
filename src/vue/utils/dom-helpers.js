/**
 * DOM helper utilities for Vue directives
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
