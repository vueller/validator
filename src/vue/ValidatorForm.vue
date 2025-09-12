<template>
  <form 
    @submit.prevent="handleSubmit" 
    :class="formClasses"
    data-validator-form
    :data-validator-blur-disabled="!computedValidateOnBlur"
    :data-validator-input-disabled="!computedValidateOnInput"
  >
    <slot 
      :errors="validator.errors()"
      :errorData="errors"
      :isValidating="isValidating"
      :isValid="isValid"
      :hasErrors="hasErrors"
      :validateField="validateField"
      :reset="reset"
    />
  </form>
</template>

<script>
import { computed } from 'vue';
import { useValidator } from './composables.js';

export default {
  name: 'ValidatorForm',
  props: {
    /**
     * Validation rules for form fields
     * Format: { fieldName: rules }
     */
    rules: {
      type: Object,
      default: () => ({})
    },

    /**
     * Initial form data
     */
    modelValue: {
      type: Object,
      default: () => ({})
    },

    /**
     * Validator options
     */
    validatorOptions: {
      type: Object,
      default: () => ({})
    },

    /**
     * Whether to validate fields on blur (overrides global setting)
     */
    validateOnBlur: {
      type: Boolean,
      default: null // null means use global setting
    },

    /**
     * Whether to validate fields on input (overrides global setting)
     */
    validateOnInput: {
      type: Boolean,
      default: null // null means use global setting
    },

    /**
     * CSS classes for the form
     */
    formClass: {
      type: [String, Object, Array],
      default: ''
    }
  },

  emits: [
    'submit',
    'validation-success', 
    'validation-error',
    'update:modelValue'
  ],

  setup(props, { emit }) {
    const {
      validator,
      formData,
      errors,
      isValidating,
      isValid,
      hasErrors,
      validateField,
      validateAll,
      reset: resetValidator
    } = useValidator(props.validatorOptions);

    // Set initial rules
    if (props.rules) {
      validator.setMultipleRules(props.rules);
    }

    // Set initial data
    if (props.modelValue) {
      Object.assign(formData, props.modelValue);
    }

    // Watch for rule changes
    const unwatchRules = computed(() => {
      if (props.rules) {
        validator.setMultipleRules(props.rules);
      }
    });

    // Watch for model value changes
    const unwatchModelValue = computed(() => {
      if (props.modelValue) {
        Object.assign(formData, props.modelValue);
      }
    });

    // Handle form submission
    const handleSubmit = async (event) => {
      emit('update:modelValue', formData);
      
      const isFormValid = await validateAll();
      
      if (isFormValid) {
        emit('validation-success', formData);
        emit('submit', {
          data: formData,
          isValid: true,
          errors: errors.value,
          event
        });
      } else {
        emit('validation-error', {
          data: formData,
          errors: errors.value
        });
        emit('submit', {
          data: formData,
          isValid: false,
          errors: errors.value,
          event
        });
      }
    };

    // Reset form
    const reset = () => {
      resetValidator();
      Object.keys(formData).forEach(key => {
        delete formData[key];
      });
      emit('update:modelValue', {});
    };

    // Computed form classes
    const formClasses = computed(() => {
      const classes = [props.formClass];
      
      if (hasErrors.value) {
        classes.push('has-errors');
      }
      
      if (isValid.value && Object.keys(formData).length > 0) {
        classes.push('is-valid');
      }
      
      if (isValidating.value) {
        classes.push('is-validating');
      }
      
      return classes;
    });

    // Computed validateOnBlur - considers both global config and form prop
    const computedValidateOnBlur = computed(() => {
      // Form prop takes priority over global config
      if (props.validateOnBlur !== null) {
        return props.validateOnBlur;
      }
      
      // Get global config from validator
      const globalConfig = validator.getGlobalConfig?.() || {};
      return globalConfig.validateOnBlur !== false; // Default to true
    });

    // Computed validateOnInput - considers both global config and form prop  
    const computedValidateOnInput = computed(() => {
      // Form prop takes priority over global config
      if (props.validateOnInput !== null) {
        return props.validateOnInput;
      }
      
      // Get global config from validator
      const globalConfig = validator.getGlobalConfig?.() || {};
      return globalConfig.validateOnInput === true; // Default to false
    });

    // Setup field validation events if enabled
    if (props.validateOnBlur || props.validateOnInput) {
      // This would be implemented with event delegation
      // For now, we'll leave this as a placeholder for future enhancement
    }

    // Expose methods for external access (like in step-by-step components)
    const expose = {
      validator,
      validateAll: () => validateAll(formData),
      reset,
      isValid,
      hasErrors,
      errors,
      formData
    }

    return {
      validator,
      formData,
      errors,
      isValidating,
      isValid,
      hasErrors,
      validateField,
      handleSubmit,
      reset,
      formClasses,
      computedValidateOnBlur,
      computedValidateOnInput,
      
      // For template ref access
      ...expose
    };
  }
};
</script>

<style scoped>
.is-validating {
  /* Add visual indication for forms being validated */
  pointer-events: none;
  opacity: 0.7;
}

/* Additional classes can be added here for:
   .has-errors - visual indication for forms with errors
   .is-valid - visual indication for valid forms
*/
</style>
