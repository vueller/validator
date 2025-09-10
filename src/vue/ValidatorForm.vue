<template>
  <form @submit.prevent="handleSubmit" :class="formClasses">
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
     * Whether to validate fields on blur
     */
    validateOnBlur: {
      type: Boolean,
      default: true
    },

    /**
     * Whether to validate fields on input
     */
    validateOnInput: {
      type: Boolean,
      default: false
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

    // Setup field validation events if enabled
    if (props.validateOnBlur || props.validateOnInput) {
      // This would be implemented with event delegation
      // For now, we'll leave this as a placeholder for future enhancement
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
      formClasses
    };
  }
};
</script>

<style scoped>
.has-errors {
  /* Add visual indication for forms with errors */
}

.is-valid {
  /* Add visual indication for valid forms */
}

.is-validating {
  /* Add visual indication for forms being validated */
  pointer-events: none;
  opacity: 0.7;
}
</style>
