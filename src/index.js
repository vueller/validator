/**
 * Validator - Modern, simple validation library
 * Clean, modular validation with reactive support
 * Framework-agnostic with Vue 3 integration
 */

// Core classes
export { Validator, ErrorBag, I18nManager } from './core/index.js';

// Rule registry and validation rules
export { RuleRegistry } from './RuleRegistry.js';
export * from './rules/index.js';

// High-level API
export * from './api/index.js';

// Utilities
export * from './utils/index.js';

// Vue 3 integration
export { validator, ValidationPlugin, createValidationPlugin } from './vue/index.js';

// Default export
export { Validator as default } from './core/index.js';