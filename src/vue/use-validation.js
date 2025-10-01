/**
 * useValidation - Simplified Vue 3 composable for form validation
 * Clean, intuitive API for reactive form validation
 */

import { ref, computed, reactive, provide, inject } from 'vue';
import { Validator } from '../core/validator.js';

// Symbol for providing validator instance
export const ValidatorSymbol = Symbol('validator');

/**
 * Main composable for form validation
 * @param {Object} options - Validation options
 * @returns {Object} Validation utilities and state
 */
export function useValidation(options = {}) {
  const validator = new Validator(options);
  const forceUpdate = ref(0);

  // Reactive state
  const state = reactive({
    isValidating: false,
    isValid: true,
    hasErrors: false,
    formData: {},
    locale: 'en'
  });

  // Subscribe to validator changes
  validator.subscribe(() => {
    forceUpdate.value++;
    updateState();
  });

  // Update reactive state
  function updateState() {
    const validatorState = validator.getState();
    Object.assign(state, validatorState);
  }

  // Initialize state
  updateState();

  // Reactive errors - proxy to ErrorBag methods
  const errors = {
    has: (field) => {
      forceUpdate.value; // Trigger reactivity
      return validator.errorBag.has(field);
    },
    first: (field) => {
      forceUpdate.value; // Trigger reactivity
      return validator.errorBag.first(field);
    },
    get: (field) => {
      forceUpdate.value; // Trigger reactivity
      return validator.errorBag.get(field);
    },
    all: () => {
      forceUpdate.value; // Trigger reactivity
      return validator.errorBag.all();
    },
    allByField: () => {
      forceUpdate.value; // Trigger reactivity
      return validator.errorBag.allByField();
    },
    any: () => {
      forceUpdate.value; // Trigger reactivity
      return validator.errorBag.any();
    },
    clear: () => validator.errorBag.clear(),
    keys: () => {
      forceUpdate.value; // Trigger reactivity
      return validator.errorBag.keys();
    }
  };

  // Reactive form data
  const formData = computed({
    get: () => {
      forceUpdate.value; // Trigger reactivity
      return validator.getData();
    },
    set: (data) => {
      validator.setData(data);
    }
  });

  // Validation methods
  const validate = async (scope = 'default') => {
    return await validator.validate(scope);
  };

  const validateField = async (field, scope = 'default') => {
    return await validator.validateField(field, scope);
  };

  // Rules management
  const setRules = (field, rules, scope = 'default') => {
    return validator.setRules(field, rules, scope);
  };

  const setMultipleRules = (rulesObject, scope = 'default') => {
    return validator.setMultipleRules(rulesObject, scope);
  };

  // Data management
  const setValue = (field, value, scope = 'default') => {
    return validator.setValue(field, value, scope);
  };

  const getValue = (field, scope = 'default') => {
    return validator.getValue(field, scope);
  };

  // Field utilities
  const setFieldLabel = (field, label, scope = 'default') => {
    return validator.setFieldLabel(field, label, scope);
  };

  // Error utilities
  const hasError = (field) => {
    forceUpdate.value; // Trigger reactivity
    return validator.errors().has(field);
  };

  const getError = (field) => {
    forceUpdate.value; // Trigger reactivity
    return validator.errors().first(field);
  };

  const clearErrors = () => {
    validator.errors().clear();
  };

  // I18n utilities
  const setLocale = (locale) => {
    validator.setLocale(locale);
  };

  const addMessages = (locale, messages) => {
    validator.addMessages(locale, messages);
  };

  // Reset
  const reset = (scope = 'all') => {
    validator.reset(scope);
  };

  // Provide validator for child components
  provide(ValidatorSymbol, validator);

  return {
    // State
    state: readonly(state),
    errors,
    formData,
    isValid: computed(() => state.isValid),
    hasErrors: computed(() => state.hasErrors),
    isValidating: computed(() => state.isValidating),
    locale: computed(() => state.locale),

    // Methods
    validate,
    validateField,
    setRules,
    setMultipleRules,
    setValue,
    getValue,
    setFieldLabel,
    hasError,
    getError,
    clearErrors,
    setLocale,
    addMessages,
    reset,

    // Direct access to validator instance
    validator
  };
}

/**
 * Use validation from parent component
 * @returns {Object} Validation utilities
 */
export function useValidationFromParent() {
  const validator = inject(ValidatorSymbol);
  
  if (!validator) {
    throw new Error('useValidationFromParent must be used within a component that has useValidation');
  }

  const forceUpdate = ref(0);

  // Subscribe to changes
  validator.subscribe(() => {
    forceUpdate.value++;
  });

  // Reactive errors
  const errors = computed(() => {
    forceUpdate.value; // Trigger reactivity
    return validator.errors().allByField();
  });

  // Error utilities
  const hasError = (field) => {
    forceUpdate.value; // Trigger reactivity
    return validator.errors().has(field);
  };

  const getError = (field) => {
    forceUpdate.value; // Trigger reactivity
    return validator.errors().first(field);
  };

  return {
    errors,
    hasError,
    getError,
    validator
  };
}

/**
 * Field validation composable
 * @param {string} field - Field name
 * @param {string|Object|Array} rules - Validation rules
 * @param {Object} options - Options
 * @returns {Object} Field validation utilities
 */
export function useFieldValidation(field, rules, options = {}) {
  const validator = inject(ValidatorSymbol);
  
  if (!validator) {
    throw new Error('useFieldValidation must be used within a component that has useValidation');
  }

  const forceUpdate = ref(0);

  // Set rules for this field
  if (rules) {
    validator.setRules(field, rules, options.scope);
  }

  // Subscribe to changes
  validator.subscribe(() => {
    forceUpdate.value++;
  });

  // Reactive field state
  const fieldState = computed(() => {
    forceUpdate.value; // Trigger reactivity
    return {
      value: validator.getValue(field, options.scope),
      error: validator.errors().first(field),
      hasError: validator.errors().has(field),
      isValid: !validator.errors().has(field)
    };
  });

  // Field methods
  const setValue = (value) => {
    validator.setValue(field, value, options.scope);
  };

  const validate = async () => {
    return await validator.validateField(field, options.scope);
  };

  const setLabel = (label) => {
    validator.setFieldLabel(field, label, options.scope);
  };

  return {
    ...fieldState.value,
    setValue,
    validate,
    setLabel,
    fieldState
  };
}

// Helper for readonly
function readonly(obj) {
  return new Proxy(obj, {
    set() {
      console.warn('Cannot modify readonly validation state');
      return false;
    }
  });
}

// Alias for backward compatibility
export { useValidation as useValidator };
