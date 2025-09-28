/**
 * Vue 3 directive for field validation with auto-validation
 * Usage: <input v-rules="{ required: true, min: 5 }" v-model="value" />
 */

import { inject } from 'vue';
import { ValidatorSymbol } from '../composables.js';
import { getFieldName, cleanupValidationListeners } from '../utils/dom-helpers.js';
import { setupValidationEvents } from '../utils/validation-helpers.js';

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
