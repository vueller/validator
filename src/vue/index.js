/**
 * Vue 3 extension for the Validator library
 * Provides directives and composables for seamless form validation
 */

import { Validator } from '../core/index.js';
import ValidatorForm from './ValidatorForm.vue';
import ValidatorField from './ValidatorField.vue';
import { ValidatorSymbol, useValidator } from './composables.js';
import { rulesDirective, validateDirective, setGlobalValidator } from './directives/index.js';
import { globalValidation } from './global-validation.js';
import { validator as universalValidator, setGlobalValidator as setUniversalValidator } from '../universal-validator.js';

/**
 * Plugin installation function
 * @param {Object} app - Vue app instance
 * @param {Object} options - Plugin options
 * @param {boolean} options.globalValidator - Create global validator instance
 * @param {boolean} options.globalProperties - Add $validator to global properties
 * @param {boolean} options.validateOnBlur - Enable blur validation globally (default: true)
 * @param {boolean} options.validateOnInput - Enable input validation globally (default: false)
 * @param {string} options.locale - Default locale
 */
export function install(app, options = {}) {
  // Default options
  const config = {
    validateOnBlur: true,
    validateOnInput: false,
    locale: 'en',
    ...options
  };

  // Register directives
  app.directive('rules', rulesDirective);
  app.directive('validate', validateDirective);

  // Register components
  app.component('ValidatorForm', ValidatorForm);
  app.component('ValidatorField', ValidatorField);

  // Provide global validator if requested
  if (config.globalValidator) {
    const globalValidator = createGlobalValidator(config);
    
    app.provide(ValidatorSymbol, globalValidator);
    setGlobalValidator(globalValidator);
    setUniversalValidator(globalValidator);
    
    // Make config available globally
    app.config.globalProperties.$validatorConfig = config;
  }

  // Add global properties if requested
  if (config.globalProperties) {
    addGlobalProperties(app, config);
  }

  // Store config for directive access
  app._validatorConfig = config;
}

/**
 * Create global validator instance with configuration
 * @param {Object} config - Configuration options
 * @returns {Validator} Configured validator instance
 */
function createGlobalValidator(config) {
  const globalValidator = new Validator(config);
  
  // Add global configuration methods
  globalValidator.getGlobalConfig = () => config;
  globalValidator.setGlobalConfig = (newConfig) => {
    Object.assign(config, newConfig);
  };
  
  return globalValidator;
}

/**
 * Add global properties to Vue app
 * @param {Object} app - Vue app instance
 * @param {Object} config - Configuration options
 */
function addGlobalProperties(app, config) {
  app.config.globalProperties.$validator = useValidator;
  app.config.globalProperties.$validatorConfig = config;
  app.config.globalProperties.$validate = globalValidation;
  app.config.globalProperties.$validatorUniversal = universalValidator;
}

// Export components and composables
export { 
  ValidatorForm, 
  ValidatorField, 
  useValidator, 
  ValidatorSymbol, 
  globalValidation, 
  universalValidator 
};

// Export directives
export { rulesDirective, validateDirective };

// Default export for plugin installation
export default {
  install,
  ValidatorForm,
  ValidatorField
};