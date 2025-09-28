/**
 * Vue 3 composables for the Validator library
 */

import { provide } from 'vue';
import { Validator } from '../core/index.js';

// Symbol for providing validator instance
export const ValidatorSymbol = Symbol('validator');

/**
 * Composable for using reactive validator in Vue components
 * @param {Object} options - Validator options
 * @returns {Object} Reactive validator utilities
 */
export function useValidator(options = {}) {
  const validator = new Validator(options);
  
  // Get all reactive state from validator
  const reactiveState = validator.getState();

  // Provide validator instance for child components
  provide(ValidatorSymbol, validator);

  return {
    validator,
    ...reactiveState
  };
}
