/**
 * Vue 3 Plugin - Modern validation plugin
 * Following Vue.js source code patterns and modern practices
 */

import { ref, computed, inject, provide, getCurrentInstance, unref } from 'vue';
import { Validator } from '../core/validator.js';
import { registerDirectives } from './directives.js';
import ValidationForm from './ValidationForm.vue';

// Plugin state
const PLUGIN_STATE = {
  globalValidator: null,
  app: null,
  config: null
};

// Injection keys following Vue patterns
export const VALIDATOR_INJECTION_KEY = Symbol('validator');
export const VALIDATOR_CONFIG_KEY = Symbol('validator-config');

/**
 * Create Vue 3 validation plugin with modern patterns
 * @param {Object} options - Plugin options
 * @returns {Object} Plugin object
 */
export function createValidationPlugin(options = {}) {
  return {
    install(app, pluginOptions = {}) {
      // Store app reference
      PLUGIN_STATE.app = app;
      
      // Merge configuration following Vue patterns
      const config = {
        // Default options
        validateOnBlur: true,
        validateOnInput: false,
        locale: 'en',
        globalValidator: true,
        strict: false,
        devtools: process.env.NODE_ENV === 'development',
        
        // Merge with plugin options
        ...options,
        ...pluginOptions
      };

      // Store config
      PLUGIN_STATE.config = config;

      // Create global validator instance
      if (config.globalValidator) {
        PLUGIN_STATE.globalValidator = new Validator(config);
        
        // Create enhanced validator with modern API
        const enhancedValidator = createEnhancedValidator(PLUGIN_STATE.globalValidator);
        
        // Add to global properties (Vue 2 compatibility)
        app.config.globalProperties.$validator = enhancedValidator;
        
        // Provide for composition API
        app.provide(VALIDATOR_INJECTION_KEY, enhancedValidator);
        app.provide(VALIDATOR_CONFIG_KEY, config);
      }

      // Register directives
      registerDirectives(app);

      // Register components
      app.component('ValidationForm', ValidationForm);

      // Initialize custom rules and messages
      initializePluginFeatures(config);

      // Devtools support
      if (config.devtools && app.config.devtools) {
        setupDevtools(app, enhancedValidator);
      }

      // Store config for later access
      app._validationConfig = config;
    }
  };
}

/**
 * Initialize plugin features (rules, messages, etc.)
 * @param {Object} config - Plugin configuration
 */
function initializePluginFeatures(config) {
  const validator = PLUGIN_STATE.globalValidator;
  if (!validator) return;

  // Add custom rules if provided
  if (config.rules) {
    Object.entries(config.rules).forEach(([name, rule]) => {
      try {
        validator.extend(name, rule);
      } catch (error) {
        console.warn(`[Vue Validator] Failed to register rule '${name}':`, error);
      }
    });
  }

  // Add custom messages if provided
  if (config.messages) {
    Object.entries(config.messages).forEach(([locale, messages]) => {
      try {
        validator.addMessages(locale, messages);
      } catch (error) {
        console.warn(`[Vue Validator] Failed to add messages for '${locale}':`, error);
      }
    });
  }
}

/**
 * Setup Vue DevTools integration
 * @param {Object} app - Vue app instance
 * @param {Object} validator - Enhanced validator instance
 */
function setupDevtools(app, validator) {
  if (app.config.devtools) {
    // Add validator to devtools
    app.config.globalProperties.$validator = validator;
    
    // Add devtools hook with error handling
    try {
      if (typeof window !== 'undefined' && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('vue-validator:init', validator);
      }
    } catch (error) {
      console.warn('Vue DevTools integration failed:', error);
    }
  }
}

/**
 * Create enhanced validator with modern API following Vue patterns
 * @param {Validator} validator - Base validator instance
 * @returns {Object} Enhanced validator with modern methods
 */
function createEnhancedValidator(validator) {
  // Create reactive state following Vue patterns
  const state = ref({
    isValid: validator.isValid(),
    hasErrors: validator.hasErrors(),
    locale: validator.getLocale(),
    isValidating: false
  });

  // Subscribe to validator changes
  validator.subscribe(() => {
    state.value = {
      isValid: validator.isValid(),
      hasErrors: validator.hasErrors(),
      locale: validator.getLocale(),
      isValidating: state.value.isValidating
    };
  });

  return {
    // Expose all original validator methods
    ...validator,
    
    // Explicitly expose subscribe method
    subscribe: validator.subscribe.bind(validator),
    
    // Explicitly expose notifyListeners method
    notifyListeners: validator.notifyListeners.bind(validator),
    
    // Reactive state
    state: computed(() => state.value),
    
    // Modern API methods following Vue patterns
    setLocale: (locale) => {
      validator.setLocale(locale);
      return validator;
    },
    
    addRule: (name, rule, message) => {
      validator.extend(name, rule, message);
      return validator;
    },
    
    addMessage: (locale, rule, message) => {
      validator.addMessages(locale, { [rule]: message });
      return validator;
    },
    
    // Convenience methods for common operations
    getLocale: () => validator.getLocale(),
    
    // Keep all original methods available with proper binding
    setRules: validator.setRules.bind(validator),
    setMultipleRules: validator.setMultipleRules.bind(validator),
    setData: validator.setData.bind(validator),
    setValue: validator.setValue.bind(validator),
    getValue: validator.getValue.bind(validator),
    getData: validator.getData.bind(validator),
    setFieldLabel: validator.setFieldLabel.bind(validator),
    validate: validator.validate.bind(validator),
    validateField: validator.validateField.bind(validator),
    isValid: validator.isValid.bind(validator),
    hasErrors: validator.hasErrors.bind(validator),
    errors: validator.errors.bind(validator),
    reset: validator.reset.bind(validator),
    extend: validator.extend.bind(validator),
    addMessages: validator.addMessages.bind(validator),
    getState: validator.getState.bind(validator)
  };
}

/**
 * Get the global validator instance
 * @returns {Validator|null} Global validator instance
 */
export function getGlobalValidator() {
  return PLUGIN_STATE.globalValidator;
}

/**
 * Set global locale for all validators
 * @param {string} locale - Locale code
 */
export function setGlobalLocale(locale) {
  if (PLUGIN_STATE.globalValidator) {
    PLUGIN_STATE.globalValidator.setLocale(locale);
  }
}

/**
 * Get current global locale
 * @returns {string} Current locale
 */
export function getGlobalLocale() {
  return PLUGIN_STATE.globalValidator?.getLocale() || 'en';
}

/**
 * Use validator in composition API (modern approach)
 * @returns {Object} Validator instance and utilities
 */
export function useValidator() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('useValidator must be called within a component setup function');
  }

  const validator = inject(VALIDATOR_INJECTION_KEY);
  const config = inject(VALIDATOR_CONFIG_KEY);

  if (!validator) {
    throw new Error('useValidator must be used within a component that has the validator plugin installed');
  }

  return {
    validator,
    config,
    // Convenience methods
    setLocale: validator.setLocale.bind(validator),
    addRule: validator.addRule.bind(validator),
    addMessage: validator.addMessage.bind(validator),
    getLocale: validator.getLocale.bind(validator)
  };
}

/**
 * Default plugin instance
 */
export default createValidationPlugin();
