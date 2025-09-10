/**
 * Vue 3 extension for the Validator library
 * Provides directives and composables for seamless form validation
 */

import { ref, reactive, computed, inject, provide } from 'vue';
import { Validator } from '../core/index.js';
import ValidatorForm from './ValidatorForm.vue';
import ValidatorField from './ValidatorField.vue';

// Symbol for providing validator instance
export const ValidatorSymbol = Symbol('validator');

/**
 * Vue 3 directive for field validation
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
  },

  updated(el, binding) {
    const validator = inject(ValidatorSymbol);
    if (!validator || !el._validatorField) return;

    // Update rules if they changed
    if (JSON.stringify(binding.value) !== JSON.stringify(el._validatorRules)) {
      validator.setRules(el._validatorField, binding.value);
      el._validatorRules = binding.value;
    }
  },

  unmounted(el) {
    const validator = inject(ValidatorSymbol);
    if (validator && el._validatorField) {
      validator.removeRules(el._validatorField);
    }
  }
};

/**
 * Composable for using reactive validator in Vue components
 * @param {Object} options - Validator options
 * @returns {Object} Reactive validator utilities
 */
export function useValidator(options = {}) {
  const validator = new Validator(options);
  
  // Get all reactive state from validator
  const reactiveState = validator.getReactiveState();

  // Provide validator instance for child components
  provide(ValidatorSymbol, validator);

  return {
    validator,
    ...reactiveState
  };
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
 */
export function install(app, options = {}) {
  // Register directive
  app.directive('rules', rulesDirective);

  // Register components
  app.component('ValidatorForm', ValidatorForm);
  app.component('ValidatorField', ValidatorField);

  // Provide global validator if requested
  if (options.globalValidator) {
    const globalValidator = new Validator(options);
    app.provide(ValidatorSymbol, globalValidator);
  }

  // Add global properties if requested
  if (options.globalProperties) {
    app.config.globalProperties.$validator = useValidator;
  }
}

// Export components
export { ValidatorForm, ValidatorField };

// Default export for plugin installation
export default {
  install,
  ValidatorForm,
  ValidatorField
};
