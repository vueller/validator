/**
 * Main entry point for the Validator library
 * Clean, modular validation with reactive i18n support
 */

// Core classes (reactive by default)
export { Validator, ErrorBag, I18nManager } from './core/index.js';
import { Validator } from './core/index.js';

// Rule registry and validation rules
export { RuleRegistry } from './RuleRegistry.js';
export * from './rules/index.js';

// Locales
export { locales } from './locales/index.js';

// Convenience function
export function createValidator(options = {}) {
  return new Validator(options);
}

// Default export (reactive validator)
export { Validator as default } from './core/index.js';
