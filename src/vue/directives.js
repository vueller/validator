/**
 * Simplified Vue 3 directives for validation
 * Clean, intuitive directives for form validation
 */

import { ValidatorSymbol } from './use-validation.js';

/**
 * v-label directive - Set custom label for field in validation messages
 * Works with ValidationForm component
 */
export const labelDirective = {
  mounted(el, binding) {
    const label = binding.value;
    const fieldName = el.name || el.id;
    
    if (fieldName && label) {
      // Store as data attribute
      el.setAttribute('data-label', label);
      
      // Try to set label on validator immediately if form is already mounted
      const form = el.closest('form.validation-form');
      if (form?.__validator__) {
        form.__validator__.setFieldLabel(fieldName, label);
      }
    }
  },
  updated(el, binding) {
    const label = binding.value;
    const fieldName = el.name || el.id;
    
    if (fieldName && label) {
      el.setAttribute('data-label', label);
      
      const form = el.closest('form.validation-form');
      if (form?.__validator__) {
        form.__validator__.setFieldLabel(fieldName, label);
      }
    }
  }
};

/**
 * v-rules directive - Set validation rules for a field
 */
export const rulesDirective = {
  mounted(el, binding) {
    const validator = el.__validator__ = el.closest('[data-validator]')?.__validator__;
    if (!validator) return;

    const field = binding.arg || el.name || el.id;
    if (!field) return;

    validator.setRules(field, binding.value);
    el.__validationField__ = field;
  },
  updated(el, binding) {
    if (el.__validator__ && el.__validationField__) {
      el.__validator__.setRules(el.__validationField__, binding.value);
    }
  }
};

/**
 * v-validate directive - Enable validation on input events
 */
export const validateDirective = {
  mounted(el, binding) {
    const validator = el.__validator__ = el.closest('[data-validator]')?.__validator__;
    if (!validator) return;

    const field = binding.arg || el.name || el.id;
    if (!field) return;

    // Validation options
    const options = binding.value || {};
    const validateOnBlur = options.validateOnBlur !== false;
    const validateOnInput = options.validateOnInput === true;

    // Add event listeners
    if (validateOnBlur) {
      el.addEventListener('blur', () => {
        validator.validateField(field);
      });
    }

    if (validateOnInput) {
      el.addEventListener('input', () => {
        validator.setValue(field, el.value);
        validator.validateField(field);
      });
    }

    // Store field reference
    el.__validationField__ = field;
  }
};

/**
 * v-error directive - Display field errors
 */
export const errorDirective = {
  mounted(el, binding) {
    const validator = el.__validator__ = el.closest('[data-validator]')?.__validator__;
    if (!validator) return;

    const field = binding.arg || el.name || el.id;
    if (!field) return;

    // Create error element
    const errorEl = document.createElement('div');
    errorEl.className = 'validation-error';
    errorEl.style.display = 'none';
    
    // Insert after the element
    el.parentNode.insertBefore(errorEl, el.nextSibling);

    // Update error display
    const updateError = () => {
      const error = validator.errors().first(field);
      if (error) {
        errorEl.textContent = error;
        errorEl.style.display = 'block';
        el.classList.add('has-error');
      } else {
        errorEl.style.display = 'none';
        el.classList.remove('has-error');
      }
    };

    // Subscribe to validator changes
    validator.subscribe(updateError);
    updateError(); // Initial update

    // Store cleanup function
    el.__errorCleanup__ = () => {
      if (errorEl.parentNode) {
        errorEl.parentNode.removeChild(errorEl);
      }
    };
  },
  unmounted(el) {
    if (el.__errorCleanup__) {
      el.__errorCleanup__();
    }
  }
};

/**
 * Register all directives with Vue app
 * @param {Object} app - Vue app instance
 */
export function registerDirectives(app) {
  app.directive('label', labelDirective);
  app.directive('rules', rulesDirective);
  app.directive('validate', validateDirective);
  app.directive('error', errorDirective);
}
