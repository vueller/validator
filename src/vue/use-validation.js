/**
 * useValidation - Modern Vue 3 composable for form validation
 * Following Vue.js source code patterns and modern practices
 */

import { 
  ref, 
  computed, 
  reactive, 
  provide, 
  inject, 
  getCurrentInstance,
  unref,
  watchEffect,
  watch,
  nextTick,
  toRefs,
  readonly
} from 'vue';
import { Validator } from '../core/validator.js';
import { VALIDATOR_INJECTION_KEY } from './plugin.js';

// Symbol for providing validator instance (legacy support)
export const ValidatorSymbol = VALIDATOR_INJECTION_KEY;

/**
 * Main composable for form validation following Vue patterns
 * @param {Object} options - Validation options
 * @returns {Object} Validation utilities and state
 */
export function useValidation(options = {}) {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('useValidation must be called within a component setup function');
  }

  // Try to get global validator first, fallback to creating new one
  const globalValidator = inject(VALIDATOR_INJECTION_KEY, null);
  const validator = globalValidator || new Validator(options);
  
  // Force update trigger for reactivity
  const forceUpdate = ref(0);

  // Reactive state following Vue patterns
  const state = reactive({
    isValidating: false,
    isValid: validator.isValid(),
    hasErrors: validator.hasErrors(),
    formData: validator.getData(),
    locale: validator.getLocale()
  });

  // Subscribe to validator changes with proper cleanup
  const unsubscribe = validator.subscribe(() => {
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

  // Cleanup on unmount
  if (instance) {
    instance.scope.stop(unsubscribe);
  }

  // Reactive errors following Vue patterns
  const errors = computed(() => {
    forceUpdate.value; // Trigger reactivity
    return {
      has: (field) => validator.errorBag.has(field),
      first: (field) => validator.errorBag.first(field),
      get: (field) => validator.errorBag.get(field),
      all: () => validator.errorBag.all(),
      allByField: () => validator.errorBag.allByField(),
      any: () => validator.errorBag.any(),
      clear: () => validator.errorBag.clear(),
      keys: () => validator.errorBag.keys()
    };
  });

  // Reactive form data with proper reactivity
  const formData = computed({
    get: () => {
      forceUpdate.value; // Trigger reactivity
      return validator.getData();
    },
    set: (data) => {
      validator.setData(data);
    }
  });

  // Validation methods with modern patterns
  const validate = async (scope = 'default') => {
    state.isValidating = true;
    try {
      const result = await validator.validate(scope);
      return result;
    } finally {
      state.isValidating = false;
    }
  };

  const validateField = async (field, scope = 'default') => {
    state.isValidating = true;
    try {
      const result = await validator.validateField(field, scope);
      return result;
    } finally {
      state.isValidating = false;
    }
  };

  // Rules management with reactivity
  const setRules = (field, rules, scope = 'default') => {
    const result = validator.setRules(field, rules, scope);
    forceUpdate.value++; // Trigger reactivity
    return result;
  };

  const setMultipleRules = (rulesObject, scope = 'default') => {
    const result = validator.setMultipleRules(rulesObject, scope);
    forceUpdate.value++; // Trigger reactivity
    return result;
  };

  // Data management with reactivity
  const setValue = (field, value, scope = 'default') => {
    const result = validator.setValue(field, value, scope);
    forceUpdate.value++; // Trigger reactivity
    return result;
  };

  const getValue = (field, scope = 'default') => {
    return validator.getValue(field, scope);
  };

  // Field utilities
  const setFieldLabel = (field, label, scope = 'default') => {
    return validator.setFieldLabel(field, label, scope);
  };

  // Error utilities with reactivity
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
    forceUpdate.value++; // Trigger reactivity
  };

  // I18n utilities
  const setLocale = (locale) => {
    validator.setLocale(locale);
    forceUpdate.value++; // Trigger reactivity
  };

  const addMessages = (locale, messages) => {
    validator.addMessages(locale, messages);
    forceUpdate.value++; // Trigger reactivity
  };

  // Reset with reactivity
  const reset = (scope = 'all') => {
    validator.reset(scope);
    forceUpdate.value++; // Trigger reactivity
  };

  // Provide validator for child components
  provide(ValidatorSymbol, validator);

  // Computed properties following Vue patterns
  const isValid = computed(() => state.isValid);
  const hasErrors = computed(() => state.hasErrors);
  const isValidating = computed(() => state.isValidating);
  const locale = computed(() => state.locale);

  return {
    // Reactive state
    state: readonly(state),
    errors,
    formData,
    isValid,
    hasErrors,
    isValidating,
    locale,

    // Validation methods
    validate,
    validateField,
    
    // Rules management
    setRules,
    setMultipleRules,
    
    // Data management
    setValue,
    getValue,
    setFieldLabel,
    
    // Error utilities
    hasError,
    getError,
    clearErrors,
    
    // I18n utilities
    setLocale,
    addMessages,
    
    // Utilities
    reset,

    // Direct access to validator instance
    validator
  };
}

/**
 * Use validation from parent component (modern approach)
 * @returns {Object} Validation utilities
 */
export function useValidationFromParent() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('useValidationFromParent must be called within a component setup function');
  }

  const validator = inject(VALIDATOR_INJECTION_KEY);
  
  if (!validator) {
    throw new Error('useValidationFromParent must be used within a component that has the validator plugin installed');
  }

  const forceUpdate = ref(0);

  // Subscribe to changes with proper cleanup
  const unsubscribe = validator.subscribe(() => {
    forceUpdate.value++;
  });

  // Cleanup on unmount
  if (instance) {
    instance.scope.stop(unsubscribe);
  }

  // Reactive errors following Vue patterns
  const errors = computed(() => {
    forceUpdate.value; // Trigger reactivity
    return {
      has: (field) => validator.errors().has(field),
      first: (field) => validator.errors().first(field),
      get: (field) => validator.errors().get(field),
      all: () => validator.errors().all(),
      allByField: () => validator.errors().allByField(),
      any: () => validator.errors().any(),
      clear: () => validator.errors().clear(),
      keys: () => validator.errors().keys()
    };
  });

  // Error utilities with reactivity
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
 * Field validation composable following Vue patterns
 * @param {string} field - Field name
 * @param {string|Object|Array} rules - Validation rules
 * @param {Object} options - Options
 * @returns {Object} Field validation utilities
 */
export function useFieldValidation(field, rules, options = {}) {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('useFieldValidation must be called within a component setup function');
  }

  const validator = inject(VALIDATOR_INJECTION_KEY);
  
  if (!validator) {
    throw new Error('useFieldValidation must be used within a component that has the validator plugin installed');
  }

  const forceUpdate = ref(0);

  // Set rules for this field
  if (rules) {
    validator.setRules(field, rules, options.scope);
  }

  // Subscribe to changes with proper cleanup
  const unsubscribe = validator.subscribe(() => {
    forceUpdate.value++;
  });

  // Cleanup on unmount
  if (instance) {
    instance.scope.stop(unsubscribe);
  }

  // Reactive field state following Vue patterns
  const fieldState = computed(() => {
    forceUpdate.value; // Trigger reactivity
    return {
      value: validator.getValue(field, options.scope),
      error: validator.errors().first(field),
      hasError: validator.errors().has(field),
      isValid: !validator.errors().has(field)
    };
  });

  // Field methods with reactivity
  const setValue = (value) => {
    validator.setValue(field, value, options.scope);
    forceUpdate.value++; // Trigger reactivity
  };

  const validate = async () => {
    const result = await validator.validateField(field, options.scope);
    forceUpdate.value++; // Trigger reactivity
    return result;
  };

  const setLabel = (label) => {
    validator.setFieldLabel(field, label, options.scope);
    forceUpdate.value++; // Trigger reactivity
  };

  // Destructure fieldState for easier access
  const { value, error, hasError, isValid } = toRefs(fieldState);

  return {
    // Reactive field state
    value,
    error,
    hasError,
    isValid,
    fieldState,
    
    // Field methods
    setValue,
    validate,
    setLabel
  };
}

// Using Vue's readonly helper - no custom implementation needed

// Alias for backward compatibility
export { useValidation as useValidator };
