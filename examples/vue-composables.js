/**
 * Vue Composables Examples
 * Demonstrates custom composables for validation
 */

import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useValidator, validator } from '@vueller/validator';
import { ptBR, en } from '@vueller/validator/locales';

// ===== ENHANCED VALIDATION COMPOSABLE =====

/**
 * Enhanced validation composable with translation support
 * @param {Object} options - Configuration options
 * @returns {Object} Validation state and methods
 */
export function useFormValidation(options = {}) {
  const {
    scope = 'default',
    rules = {},
    initialData = {},
    locale = 'pt-BR',
    autoValidate = true
  } = options;
  
  // ===== STATE =====
  
  const formData = reactive({ ...initialData });
  const { validator: validatorInstance, errors, isValid, isValidating } = useValidator();
  
  // ===== COMPUTED =====
  
  const fieldErrors = computed(() => {
    const scopedErrors = {};
    Object.keys(errors.value).forEach(key => {
      if (key.startsWith(`${scope}.`)) {
        const fieldName = key.replace(`${scope}.`, '');
        scopedErrors[fieldName] = errors.value[key];
      }
    });
    return scopedErrors;
  });
  
  const hasErrors = computed(() => {
    return Object.keys(fieldErrors.value).length > 0;
  });
  
  const errorCount = computed(() => {
    return Object.values(fieldErrors.value).reduce((count, fieldErrors) => {
      return count + fieldErrors.length;
    }, 0);
  });
  
  // ===== METHODS =====
  
  const setupValidation = () => {
    if (Object.keys(rules).length > 0) {
      validatorInstance.setMultipleRules(rules, {}, scope);
    }
  };
  
  const validate = async (data = formData) => {
    return await validatorInstance.validate(scope, data);
  };
  
  const validateField = async (fieldName, value = formData[fieldName]) => {
    return await validatorInstance.validate(scope).field(fieldName, value);
  };
  
  const clearErrors = (fieldName = null) => {
    if (fieldName) {
      const scopedFieldName = `${scope}.${fieldName}`;
      validatorInstance.errors().remove(scopedFieldName);
    } else {
      validatorInstance.reset(scope);
    }
  };
  
  const reset = () => {
    Object.keys(formData).forEach(key => {
      formData[key] = initialData[key] || '';
    });
    clearErrors();
  };
  
  const updateField = (fieldName, value) => {
    formData[fieldName] = value;
    
    if (autoValidate) {
      // Debounced validation
      clearTimeout(updateField.timer);
      updateField.timer = setTimeout(() => {
        validateField(fieldName, value);
      }, 300);
    }
  };
  
  // ===== WATCHERS =====
  
  watch(() => ({ ...formData }), (newData) => {
    if (autoValidate && Object.keys(rules).length > 0) {
      validate(newData);
    }
  }, { deep: true });
  
  // ===== INITIALIZATION =====
  
  onMounted(() => {
    setupValidation();
  });
  
  return {
    // Data
    formData,
    
    // Computed state
    errors: fieldErrors,
    hasErrors,
    errorCount,
    isValid,
    isValidating,
    
    // Methods
    validate,
    validateField,
    clearErrors,
    reset,
    updateField
  };
}

// ===== TRANSLATION COMPOSABLE =====

/**
 * Translation management composable
 * @param {string} initialLocale - Initial locale
 * @returns {Object} Translation state and methods
 */
export function useTranslation(initialLocale = 'pt-BR') {
  const currentLocale = ref(initialLocale);
  const isLoading = ref(false);
  
  const availableLocales = ref([
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]);
  
  const localeConfig = {
    'pt-BR': {
      file: ptBR,
      messages: {}
    },
    'en': {
      file: en,
      messages: {}
    },
    'es': {
      file: null,
      messages: {
        required: 'El campo {field} es obligatorio',
        email: 'El campo {field} debe ser un email válido',
        min: 'El campo {field} debe tener al menos {min} caracteres'
      }
    },
    'fr': {
      file: null,
      messages: {
        required: 'Le champ {field} est requis',
        email: 'Le champ {field} doit être un email valide',
        min: 'Le champ {field} doit avoir au moins {min} caractères'
      }
    }
  };
  
  const currentLocaleInfo = computed(() => {
    return availableLocales.value.find(locale => locale.code === currentLocale.value);
  });
  
  const setLocale = async (localeCode, customMessages = {}) => {
    if (!localeConfig[localeCode]) {
      console.warn(`Locale '${localeCode}' not supported`);
      return false;
    }
    
    isLoading.value = true;
    
    try {
      const config = localeConfig[localeCode];
      const messages = { ...config.messages, ...customMessages };
      
      validator.setLocale(localeCode);
      validator.loadTranslations(config.file, messages);
      
      currentLocale.value = localeCode;
      console.log(`Locale changed to: ${localeCode}`);
      
      return true;
    } catch (error) {
      console.error('Error setting locale:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  const addCustomMessages = (localeCode, messages) => {
    if (localeConfig[localeCode]) {
      Object.assign(localeConfig[localeCode].messages, messages);
      
      if (localeCode === currentLocale.value) {
        setLocale(localeCode);
      }
    }
  };
  
  // Initialize
  onMounted(() => {
    setLocale(initialLocale);
  });
  
  return {
    currentLocale,
    currentLocaleInfo,
    availableLocales,
    isLoading,
    setLocale,
    addCustomMessages
  };
}

// ===== FIELD VALIDATION COMPOSABLE =====

/**
 * Individual field validation composable
 * @param {Object} options - Field configuration
 * @returns {Object} Field validation state and methods
 */
export function useFieldValidation(options = {}) {
  const {
    fieldName,
    rules = {},
    scope = 'default',
    initialValue = '',
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options;
  
  const fieldValue = ref(initialValue);
  const isValidating = ref(false);
  const isValid = ref(true);
  const errors = ref([]);
  const touched = ref(false);
  const focused = ref(false);
  
  const { validator: validatorInstance } = useValidator();
  
  // Set up field rules
  if (Object.keys(rules).length > 0) {
    validatorInstance.setRules(fieldName, rules, {}, scope);
  }
  
  const validate = async (value = fieldValue.value) => {
    isValidating.value = true;
    
    try {
      const result = await validatorInstance.validate(scope).field(fieldName, value);
      isValid.value = result;
      
      const fieldErrors = validatorInstance.getErrors()[`${scope}.${fieldName}`] || [];
      errors.value = fieldErrors;
      
      return result;
    } finally {
      isValidating.value = false;
    }
  };
  
  const clearErrors = () => {
    errors.value = [];
    const scopedFieldName = `${scope}.${fieldName}`;
    validatorInstance.errors().remove(scopedFieldName);
  };
  
  const setValue = (value) => {
    fieldValue.value = value;
    
    if (validateOnChange && touched.value) {
      // Debounced validation
      clearTimeout(setValue.timer);
      setValue.timer = setTimeout(() => {
        validate(value);
      }, debounceMs);
    }
  };
  
  const onFocus = () => {
    focused.value = true;
  };
  
  const onBlur = () => {
    focused.value = false;
    touched.value = true;
    
    if (validateOnBlur) {
      validate();
    }
  };
  
  const reset = () => {
    fieldValue.value = initialValue;
    touched.value = false;
    focused.value = false;
    clearErrors();
  };
  
  const fieldClasses = computed(() => {
    return {
      'field-valid': touched.value && isValid.value,
      'field-invalid': touched.value && !isValid.value,
      'field-focused': focused.value,
      'field-touched': touched.value,
      'field-validating': isValidating.value
    };
  });
  
  return {
    // State
    fieldValue,
    isValidating,
    isValid,
    errors,
    touched,
    focused,
    
    // Computed
    fieldClasses,
    
    // Methods
    validate,
    clearErrors,
    setValue,
    onFocus,
    onBlur,
    reset
  };
}

// ===== EXAMPLE USAGE =====

export function createValidationExample() {
  // Example of using the enhanced composables together
  const translation = useTranslation('pt-BR');
  
  const loginForm = useFormValidation({
    scope: 'login',
    rules: {
      email: { required: true, email: true },
      password: { required: true, min: 8 }
    },
    initialData: {
      email: '',
      password: ''
    }
  });
  
  const registrationForm = useFormValidation({
    scope: 'registration',
    rules: {
      email: { required: true, email: true },
      password: { required: true, min: 8 },
      name: { required: true, min: 2 }
    },
    initialData: {
      email: '',
      password: '',
      name: ''
    }
  });
  
  return {
    translation,
    loginForm,
    registrationForm
  };
}
