/**
 * Vue 3 Integration - Simplified validation for Vue
 * Clean, intuitive API for Vue 3 applications
 */

// Core exports
export { Validator } from '../core/validator.js';
export { ErrorBag } from '../core/ErrorBag.js';
export { I18nManager } from '../core/I18nManager.js';

// Vue composables
export { useValidation, useValidationFromParent, useFieldValidation } from './use-validation.js';

// Vue components
export { default as ValidationForm } from './ValidationForm.vue';

// Vue directives
export { registerDirectives } from './directives.js';
export { rulesDirective, validateDirective, errorDirective, labelDirective } from './directives.js';

// Vue plugin
export { createValidationPlugin, getGlobalValidator, setGlobalLocale, getGlobalLocale, useValidator } from './plugin.js';

// Default plugin
export { default as ValidationPlugin } from './plugin.js';

// Export install function for plugin usage
import ValidationPlugin from './plugin.js';
export const install = ValidationPlugin.install.bind(ValidationPlugin);

// Simplified plugin export for easy usage
export const validator = ValidationPlugin;

// Default export for plugin usage
export default ValidationPlugin;
