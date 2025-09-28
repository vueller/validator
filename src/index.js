/**
 * Main entry point for the Validator library
 * Clean, modular validation with reactive i18n support
 * Refactored to follow clean code principles and remove redundancy
 */

// Core classes (reactive by default)
export { Validator, ErrorBag, I18nManager } from './core/index.js';

// Rule registry and validation rules
export { RuleRegistry } from './RuleRegistry.js';
export * from './rules/index.js';

// Locales (available at '@vueller/validator/locales')
// export { locales, en, ptBR } from './locales/index.js';

// Utilities (for advanced usage)
export * from './utils/index.js';

// Universal validator API
export { validator, setGlobalValidator, getGlobalValidator } from './universal-validator.js';

// Convenience functions
import { Validator } from './core/index.js';

/**
 * Create a new validator instance with options
 * @param {Object} options - Validator configuration options
 * @returns {Validator} New validator instance
 */
export function createValidator(options = {}) {
  return new Validator(options);
}

/**
 * Create a validator with predefined common rules
 * @param {Object} options - Validator configuration options
 * @returns {Validator} Configured validator instance
 */
export function createFormValidator(options = {}) {
  const validator = new Validator({
    stopOnFirstFailure: false,
    validateOnBlur: true,
    validateOnInput: false,
    ...options
  });

  // Pre-configure common validation scenarios
  return validator;
}

// Default export (main Validator class)
export { Validator as default } from './core/index.js';