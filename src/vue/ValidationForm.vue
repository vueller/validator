<template>
  <form @submit.prevent="handleSubmit" class="validation-form" ref="formElement">
    <slot 
      :values="formValues"
      :errors="errorProxy"
      :isValid="isValid"
      :hasErrors="hasErrors"
      :isValidating="isValidating"
      :validate="validate"
      :reset="reset"
    />
  </form>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { Validator } from '../core/validator.js';
import { RuleManager } from '../core/rule-manager.js';
// Removed circular dependency - will handle global validator differently

export default {
  name: 'ValidationForm',
  props: {
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
  },
  emits: ['submit', 'update:modelValue', 'validation-success', 'validation-error'],
  setup(props, { emit }) {
    // Create validator instance without global dependency
    const globalValidator = null;
    
    // Create validator instance
    const validator = new Validator(props.options);
    
    if (globalValidator) {
      // Share the same RuleRegistry so custom rules are available
      validator.ruleRegistry = globalValidator.ruleRegistry;
      
      // Share the same I18nManager so locale changes are global
      validator.i18nManager = globalValidator.i18nManager;
      
      // IMPORTANT: Recreate RuleManager with the shared RuleRegistry
      validator.ruleManager = new RuleManager(globalValidator.ruleRegistry);
    }
    
    const formElement = ref(null);
    const formValues = ref({});
    const isValidating = ref(false);
    const updateTrigger = ref(0);
    const fieldElements = new Map(); // Map<fieldName, element>

    // Computed properties
    const isValid = computed(() => {
      updateTrigger.value;
      return !validator.errorBag.any();
    });

    const hasErrors = computed(() => {
      updateTrigger.value;
      return validator.errorBag.any();
    });

    // Error proxy
    const errorProxy = {
      has: (field) => {
        updateTrigger.value;
        return validator.errorBag.has(field);
      },
      first: (field) => {
        updateTrigger.value;
        return validator.errorBag.first(field);
      },
      get: (field) => {
        updateTrigger.value;
        return validator.errorBag.get(field);
      },
      any: () => {
        updateTrigger.value;
        return validator.errorBag.any();
      }
    };

    // Methods
    const setValue = (field, value) => {
      formValues.value = {
        ...formValues.value,
        [field]: value
      };
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
        
        updateTrigger.value++;
        return !hasErrors;
      } catch (error) {
        console.error('Validation error:', error);
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
      updateTrigger.value++;
      
      // Reset field elements
      fieldElements.forEach((el) => {
        if (el) el.value = '';
      });
    };

    // Auto-bind form fields
    const bindFormFields = () => {
      if (!formElement.value) return;

      const fieldsWithRules = Object.keys(props.rules || {});
      
      fieldsWithRules.forEach(fieldName => {
        // Find element by name or id
        const el = formElement.value.querySelector(`[name="${fieldName}"], #${fieldName}`);
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

      // Subscribe to validator changes
      validator.subscribe(() => {
        updateTrigger.value++;
      });

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

    // Watch formValues and emit v-model update
    watch(formValues, (newValues) => {
      emit('update:modelValue', newValues);
      validator.setData(newValues);
      
      // Update field elements
      fieldElements.forEach((el, fieldName) => {
        if (el && el.value !== newValues[fieldName]) {
          el.value = newValues[fieldName] || '';
        }
      });
    }, { deep: true });

    // Watch rules changes and re-bind
    watch(() => props.rules, () => {
      nextTick(() => bindFormFields());
    }, { deep: true });


    return {
      formElement,
      formValues,
      errorProxy,
      isValid,
      hasErrors,
      isValidating,
      validate,
      handleSubmit,
      reset
    };
  }
};
</script>

<style scoped>
.validation-form {
  width: 100%;
}
</style>
