/**
 * Modern Vue 3 directives for validation
 * Following Vue.js source code patterns and modern practices
 */

import { 
  ref, 
  computed, 
  watchEffect, 
  watch, 
  nextTick,
  getCurrentInstance,
  unref
} from 'vue';
import { VALIDATOR_INJECTION_KEY } from './plugin.js';

/**
 * v-label directive - Set custom label for field in validation messages
 * Following Vue directive patterns
 */
export const labelDirective = {
  mounted(el, binding, vnode) {
    const label = unref(binding.value);
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
  updated(el, binding, vnode) {
    const label = unref(binding.value);
    const fieldName = el.name || el.id;
    
    if (fieldName && label) {
      el.setAttribute('data-label', label);
      
      const form = el.closest('form.validation-form');
      if (form?.__validator__) {
        form.__validator__.setFieldLabel(fieldName, label);
      }
    }
  },
  unmounted(el) {
    // Cleanup if needed
    el.removeAttribute('data-label');
  }
};

/**
 * v-rules directive - Set validation rules for a field
 * Following Vue directive patterns
 */
export const rulesDirective = {
  mounted(el, binding, vnode) {
    const validator = el.__validator__ = el.closest('[data-validator]')?.__validator__;
    if (!validator) return;

    const field = binding.arg || el.name || el.id;
    if (!field) return;

    const rules = unref(binding.value);
    validator.setRules(field, rules);
    el.__validationField__ = field;
  },
  updated(el, binding, vnode) {
    if (el.__validator__ && el.__validationField__) {
      const rules = unref(binding.value);
      el.__validator__.setRules(el.__validationField__, rules);
    }
  },
  unmounted(el) {
    // Cleanup
    delete el.__validator__;
    delete el.__validationField__;
  }
};

/**
 * v-validate directive - Enable validation on input events
 * Following Vue directive patterns
 */
export const validateDirective = {
  mounted(el, binding, vnode) {
    const validator = el.__validator__ = el.closest('[data-validator]')?.__validator__;
    if (!validator) return;

    const field = binding.arg || el.name || el.id;
    if (!field) return;

    // Validation options
    const options = unref(binding.value) || {};
    const validateOnBlur = options.validateOnBlur !== false;
    const validateOnInput = options.validateOnInput === true;

    // Event handlers
    const handleBlur = () => {
      validator.validateField(field);
    };

    const handleInput = () => {
      validator.setValue(field, el.value);
      validator.validateField(field);
    };

    // Add event listeners
    if (validateOnBlur) {
      el.addEventListener('blur', handleBlur);
    }

    if (validateOnInput) {
      el.addEventListener('input', handleInput);
    }

    // Store references for cleanup
    el.__validationField__ = field;
    el.__handleBlur__ = handleBlur;
    el.__handleInput__ = handleInput;
  },
  updated(el, binding, vnode) {
    // Update validation options if needed
    const options = unref(binding.value) || {};
    const validateOnBlur = options.validateOnBlur !== false;
    const validateOnInput = options.validateOnInput === true;

    // Remove old listeners
    if (el.__handleBlur__) {
      el.removeEventListener('blur', el.__handleBlur__);
    }
    if (el.__handleInput__) {
      el.removeEventListener('input', el.__handleInput__);
    }

    // Add new listeners
    if (validateOnBlur) {
      el.addEventListener('blur', el.__handleBlur__);
    }
    if (validateOnInput) {
      el.addEventListener('input', el.__handleInput__);
    }
  },
  unmounted(el) {
    // Cleanup event listeners
    if (el.__handleBlur__) {
      el.removeEventListener('blur', el.__handleBlur__);
    }
    if (el.__handleInput__) {
      el.removeEventListener('input', el.__handleInput__);
    }
    
    // Cleanup references
    delete el.__validator__;
    delete el.__validationField__;
    delete el.__handleBlur__;
    delete el.__handleInput__;
  }
};

/**
 * v-error directive - Display field errors
 * Following Vue directive patterns
 */
export const errorDirective = {
  mounted(el, binding, vnode) {
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
    const unsubscribe = validator.subscribe(updateError);
    updateError(); // Initial update

    // Store references for cleanup
    el.__errorElement__ = errorEl;
    el.__errorUnsubscribe__ = unsubscribe;
    el.__validationField__ = field;
  },
  updated(el, binding, vnode) {
    // Update error display if field changes
    const field = binding.arg || el.name || el.id;
    if (field !== el.__validationField__) {
      el.__validationField__ = field;
      // Re-subscribe with new field
      if (el.__errorUnsubscribe__) {
        el.__errorUnsubscribe__();
      }
      const validator = el.__validator__;
      if (validator) {
        const updateError = () => {
          const error = validator.errors().first(field);
          if (error) {
            el.__errorElement__.textContent = error;
            el.__errorElement__.style.display = 'block';
            el.classList.add('has-error');
          } else {
            el.__errorElement__.style.display = 'none';
            el.classList.remove('has-error');
          }
        };
        el.__errorUnsubscribe__ = validator.subscribe(updateError);
        updateError();
      }
    }
  },
  unmounted(el) {
    // Cleanup
    if (el.__errorElement__ && el.__errorElement__.parentNode) {
      el.__errorElement__.parentNode.removeChild(el.__errorElement__);
    }
    if (el.__errorUnsubscribe__) {
      el.__errorUnsubscribe__();
    }
    
    // Cleanup references
    delete el.__validator__;
    delete el.__errorElement__;
    delete el.__errorUnsubscribe__;
    delete el.__validationField__;
  }
};

/**
 * Register all directives with Vue app following modern patterns
 * @param {Object} app - Vue app instance
 */
export function registerDirectives(app) {
  // Register directives - Vue automatically adds 'v-' prefix in templates
  app.directive('label', labelDirective);
  app.directive('rules', rulesDirective);
  app.directive('validate', validateDirective);
  app.directive('error', errorDirective);
}
