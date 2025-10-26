<template>
  <form 
    @submit.prevent="handleSubmit" 
    class="validation-form" 
    ref="formElement"
    data-validator
  >
    <slot 
      :values="formValues"
      :errors="errors"
      :isValid="isValid"
      :hasErrors="hasErrors"
      :isValidating="isValidating"
      :validate="validate"
      :reset="reset"
      :setValue="setValue"
      :getValue="getValue"
      :setRules="setRules"
      :clear="clear"
    />
  </form>
</template>

<script setup>
import { 
  ref, 
  computed, 
  watch, 
  onMounted, 
  onUnmounted,
  nextTick,
  inject,
} from 'vue';
import { Validator } from '../core/validator.js';
import { VALIDATOR_INJECTION_KEY } from './plugin.js';

// Props definition
const props = defineProps({
  rules: {
    type: Object,
    default: () => ({})
  },
  labels: {
    type: Object,
    default: () => ({})
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  validateOnSubmit: {
    type: Boolean,
    default: true
  },
  validateOnBlur: {
    type: Boolean,
    default: true
  },
  validateOnInput: {
    type: Boolean,
    default: false
  }
});

// Emits definition
const emit = defineEmits([
  'submit', 
  'update:modelValue', 
  'validation-success', 
  'validation-error'
]);

// Try to get global validator first
const globalValidator = inject(VALIDATOR_INJECTION_KEY, null);

// Create validator instance - use global validator directly if available
const validator = globalValidator || new Validator();

// If we have a global validator, we don't need to share components
// as we're using the same instance
if (!globalValidator) {
  // Only initialize components for new validator instances
  // (global validator already has everything initialized)
}

// Reactive state
const formElement = ref(null);
const formValues = ref({});
const isValidating = ref(false);
const fieldElements = new Map(); // Map<fieldName, element>

// Reactive state for validator
const validatorState = ref({
  isValid: !validator.errorBag.any(),
  hasErrors: validator.errorBag.any(),
  errors: validator.errors()
});

// Computed properties following Vue patterns
const isValid = computed(() => validatorState.value.isValid);
const hasErrors = computed(() => validatorState.value.hasErrors);

// Error proxy with simple reactivity
const errorsTrigger = ref(0);
const errors = computed(() => {
  // Access trigger to make this reactive
  errorsTrigger.value;
  
  return {
    has: (field) => validator.errorBag.has(field),
    first: (field) => validator.errorBag.first(field),
    get: (field) => validator.errorBag.get(field),
    all: () => validator.errorBag.all(),
    allByField: () => validator.errorBag.allByField(),
    any: () => validator.errorBag.any(),
    clear: () => validator.errorBag.clear(),
    remove: (field) => validator.errorBag.remove(field),
    add: (field, message, rule) => validator.errorBag.add(field, message, rule),
    keys: () => validator.errorBag.keys()
  };
});

// Methods following Vue patterns
const setValue = (field, value) => {
  formValues.value = {
    ...formValues.value,
    [field]: value
  };
  validator.setValue(field, value);
};

const getValue = (field) => {
  return validator.getValue(field);
};

const setRules = (field, rules) => {
  validator.setRules(field, rules);
};

// Update validator state manually when needed
const updateValidatorState = () => {
  validatorState.value = {
    isValid: !validator.errorBag.any(),
    hasErrors: validator.errorBag.any(),
    errors: validator.errors()
  };
  errorsTrigger.value++;
};

const validateField = async (field) => {
  try {
    validator.errorBag.remove(field);
    
    const fieldRules = validator.ruleManager.getFieldRules(field);
    if (!fieldRules || fieldRules.length === 0) {
      return true;
    }

    const value = formValues.value[field];
    let hasErrors = false;
    
    // Validate against ALL rules, not stopping at first failure
    for (const ruleInstance of fieldRules) {
      const isValid = await ruleInstance.validate(value, field, formValues.value);
      
      if (!isValid) {
        hasErrors = true;
        const ruleName = ruleInstance.getRuleName();
        
        let messageParams = {};
        if (ruleInstance.params !== null && ruleInstance.params !== undefined) {
          if (typeof ruleInstance.params === 'object' && !Array.isArray(ruleInstance.params)) {
            messageParams = ruleInstance.params;
          } else {
            messageParams[ruleName] = ruleInstance.params;
          }
        }
        
        // Get field label (custom or field name)
        const fieldLabel = validator.ruleManager.getFieldLabel(field) || field;
        
        const message = validator.i18nManager.getMessage(
          ruleName,
          fieldLabel,
          messageParams
        );
        
        validator.errorBag.add(field, message, ruleName);
      }
    }
    
    // Update reactive state after validation
    updateValidatorState();
    
    return !hasErrors;
  } catch (error) {
    console.error('[Vue Validator] Validation error:', error);
    return false;
  }
};

const validate = async () => {
  isValidating.value = true;
  
  try {
    validator.errorBag.clear();
    const fieldsWithRules = Object.keys(props.rules || {});
    let hasAnyError = false;
    
    for (const field of fieldsWithRules) {
      const isFieldValid = await validateField(field);
      if (!isFieldValid) {
        hasAnyError = true;
      }
    }
    
    const result = !hasAnyError;
    
    // Update reactive state after validation
    updateValidatorState();
    
    if (result) {
      emit('validation-success', formValues.value);
    } else {
      emit('validation-error', validator.errorBag.allByField());
    }
    
    return result;
  } finally {
    isValidating.value = false;
  }
};

const handleSubmit = async () => {
  if (props.validateOnSubmit) {
    const isValid = await validate();
    if (isValid) {
      emit('submit', formValues.value);
    }
  } else {
    emit('submit', formValues.value);
  }
};

const reset = () => {
  formValues.value = {};
  validator.errorBag.clear();
  validator.reset();
  
  // Reset field elements
  fieldElements.forEach((el) => {
    if (el) el.value = '';
  });
  
  // Update reactive state after reset
  updateValidatorState();
};

const clear = () => {
  reset();
};

// Expose methods for parent component to access via template ref
defineExpose({
  validate,
  reset,
  clear,
  setValue,
  getValue,
  setRules,
  formValues,
  errors,
  isValid,
  hasErrors,
  isValidating
});

// Auto-bind form fields
const bindFormFields = () => {
  if (!formElement.value) return;

  const fieldsWithRules = Object.keys(props.rules || {});
  
  fieldsWithRules.forEach(fieldName => {
    // Find element by name or id - try multiple selectors
    let el = formElement.value.querySelector(`[name="${fieldName}"]`);
    if (!el) {
      el = formElement.value.querySelector(`#${fieldName}`);
    }
    if (!el) {
      el = formElement.value.querySelector(`input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`);
    }
    if (!el) return;

    fieldElements.set(fieldName, el);

    // Set initial value
    if (formValues.value[fieldName] !== undefined) {
      el.value = formValues.value[fieldName];
    }

    // Handle input event
    const handleInput = (e) => {
      const value = e.target.value;
      setValue(fieldName, value);
      if (props.validateOnInput) {
        validateField(fieldName);
      }
    };

    // Handle blur event
    const handleBlur = () => {
      if (props.validateOnBlur) {
        validateField(fieldName);
      }
    };

    // Remove old listeners if any
    if (el.__inputListener__) {
      el.removeEventListener('input', el.__inputListener__);
      el.removeEventListener('blur', el.__blurListener__);
    }

    // Attach event listeners
    el.addEventListener('input', handleInput);
    el.addEventListener('blur', handleBlur);

    // Store listeners for cleanup
    el.__inputListener__ = handleInput;
    el.__blurListener__ = handleBlur;
  });
};

// Initialize
onMounted(async () => {
  // Attach validator to form element FIRST (for v-label directive)
  if (formElement.value) {
    formElement.value.__validator__ = validator;
    formElement.value.__validationContext__ = {
      setValue,
      validateField,
      formValues,
      validateOnInput: props.validateOnInput,
      validateOnBlur: props.validateOnBlur
    };
  }

  // Set initial data
  const initialData = props.modelValue || props.initialData || {};
  formValues.value = { ...initialData };
  validator.setData(initialData);
  
  // Simple reactive state without subscriptions
  const validatorState = ref({
    isValid: !validator.errorBag.any(),
    hasErrors: validator.errorBag.any(),
    errors: validator.errors()
  });

  // Error proxy with simple reactivity
  const errorsTrigger = ref(0);
  const errors = computed(() => {
    // Access trigger to make this reactive
    errorsTrigger.value;
    
    return {
      has: (field) => validator.errorBag.has(field),
      first: (field) => validator.errorBag.first(field),
      get: (field) => validator.errorBag.get(field),
      all: () => validator.errorBag.all(),
      allByField: () => validator.errorBag.allByField(),
      any: () => validator.errorBag.any(),
      clear: () => validator.errorBag.clear(),
      remove: (field) => validator.errorBag.remove(field),
      add: (field, message, rule) => validator.errorBag.add(field, message, rule),
      keys: () => validator.errorBag.keys()
    };
  });

  // Set rules
  if (props.rules && Object.keys(props.rules).length > 0) {
    Object.entries(props.rules).forEach(([field, rules]) => {
      validator.setRules(field, rules);
    });
  }

  // Set labels from props
  if (props.labels && Object.keys(props.labels).length > 0) {
    Object.entries(props.labels).forEach(([field, label]) => {
      validator.setFieldLabel(field, label);
    });
  }

  // Wait for DOM to be ready (including v-label directives)
  await nextTick();
  
  // Process v-label directives
  const elementsWithLabels = formElement.value?.querySelectorAll('[data-label]');
  if (elementsWithLabels) {
    elementsWithLabels.forEach(el => {
      const fieldName = el.name || el.id;
      const label = el.getAttribute('data-label');
      if (fieldName && label) {
        validator.setFieldLabel(fieldName, label);
      }
    });
  }
  
  // Auto-bind form fields
  bindFormFields();
});

// Watch for locale changes and re-validate fields with errors
watch(() => validator.getLocale(), (newLocale, oldLocale) => {
  if (oldLocale && newLocale !== oldLocale && validator.errorBag.any()) {
    // Re-validate all fields that currently have errors
    const fieldsWithErrors = validator.errorBag.keys();
    fieldsWithErrors.forEach(fieldName => {
      validateField(fieldName);
    });
  }
});

// Watch formValues and emit v-model update
watch(formValues, (newValues) => {
  emit('update:modelValue', newValues);
}, { deep: true });

// Watch rules changes and re-bind
watch(() => props.rules, () => {
  nextTick(() => bindFormFields());
}, { deep: true });

// Cleanup on unmount
onUnmounted(() => {
  // Cleanup event listeners
  fieldElements.forEach((el) => {
    if (el && el.__inputListener__) {
      el.removeEventListener('input', el.__inputListener__);
      el.removeEventListener('blur', el.__blurListener__);
    }
  });
  fieldElements.clear();
});
</script>

<style scoped>
.validation-form {
  width: 100%;
}
</style>
