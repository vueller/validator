/**
 * Vue 3 Plugin - Simplified validation plugin
 * Clean, intuitive plugin for form validation
 */

import { Validator } from '../core/validator.js';
import { registerDirectives } from './directives.js';
import ValidationForm from './ValidationForm.vue';

// Global validator instance
let globalValidator = null;

/**
 * Create Vue 3 validation plugin
 * @param {Object} options - Plugin options
 * @returns {Object} Plugin object
 */
export function createValidationPlugin(options = {}) {
  return {
    install(app, pluginOptions = {}) {
      const config = {
        // Default options
        validateOnBlur: true,
        validateOnInput: false,
        locale: 'en',
        globalValidator: true,
        
        // Merge with plugin options
        ...options,
        ...pluginOptions
      };

      // Create global validator instance
      if (config.globalValidator) {
        globalValidator = new Validator(config);
        
        // Add to global properties
        app.config.globalProperties.$validator = globalValidator;
        app.provide('$validator', globalValidator);
      }

      // Register directives
      registerDirectives(app);

      // Register components
      app.component('ValidationForm', ValidationForm);

      // Add custom rules if provided
      if (config.rules) {
        Object.entries(config.rules).forEach(([name, rule]) => {
          try {
            globalValidator?.extend(name, rule);
          } catch (error) {
            console.warn(`Failed to register rule '${name}':`, error);
          }
        });
      }

      // Add custom messages if provided
      if (config.messages) {
        Object.entries(config.messages).forEach(([locale, messages]) => {
          try {
            globalValidator?.addMessages(locale, messages);
          } catch (error) {
            console.warn(`Failed to add messages for '${locale}':`, error);
          }
        });
      }

      // Store config for later access
      app._validationConfig = config;
    }
  };
}

/**
 * Get the global validator instance
 * @returns {Validator|null} Global validator instance
 */
export function getGlobalValidator() {
  return globalValidator;
}

/**
 * Set global locale for all validators
 * @param {string} locale - Locale code
 */
export function setGlobalLocale(locale) {
  if (globalValidator) {
    globalValidator.i18nManager.setLocale(locale);
  }
}

/**
 * Get current global locale
 * @returns {string} Current locale
 */
export function getGlobalLocale() {
  return globalValidator?.i18nManager.getLocale() || 'en';
}

/**
 * Default plugin instance
 */
export default createValidationPlugin();
