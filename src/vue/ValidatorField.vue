<template>
  <div :class="fieldClasses">
    <slot 
      :field="field"
      :errors="fieldErrors"
      :hasError="hasFieldError"
      :firstError="firstError"
      :isValid="isFieldValid"
      :validate="validate"
    />
    
    <!-- Default error display -->
    <div v-if="showErrors && hasFieldError" :class="errorClasses">
      <div v-for="error in fieldErrors" :key="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed, inject } from 'vue';
import { ValidatorSymbol } from './composables.js';

export default {
  name: 'ValidatorField',
  props: {
    /**
     * Field name for validation
     */
    field: {
      type: String,
      required: true
    },

    /**
     * Validation rules for this field
     */
    rules: {
      type: [String, Object, Array],
      default: null
    },

    /**
     * Whether to show validation errors
     */
    showErrors: {
      type: Boolean,
      default: true
    },

    /**
     * CSS classes for the field wrapper
     */
    fieldClass: {
      type: [String, Object, Array],
      default: ''
    },

    /**
     * CSS classes for error messages
     */
    errorClass: {
      type: [String, Object, Array],
      default: 'text-red-500 text-sm mt-1'
    },

    /**
     * Field value for validation
     */
    modelValue: {
      default: null
    }
  },

  emits: ['field-validated', 'field-error'],

  setup(props, { emit }) {
    const validator = inject(ValidatorSymbol);
    
    if (!validator) {
      console.warn('ValidatorField requires a validator instance. Use it inside ValidatorForm or provide ValidatorSymbol.');
      return {};
    }

    // Set rules for the field
    if (props.rules) {
      validator.setRules(props.field, props.rules);
    }

    // Get field errors
    const fieldErrors = computed(() => {
      return validator.errors().get(props.field);
    });

    // Check if field has errors
    const hasFieldError = computed(() => {
      return validator.errors().has(props.field);
    });

    // Get first error
    const firstError = computed(() => {
      return validator.errors().first(props.field);
    });

    // Check if field is valid
    const isFieldValid = computed(() => {
      return !hasFieldError.value;
    });

    // Validate this field
    const validate = async (value = null) => {
      const fieldValue = value !== null ? value : props.modelValue;
      const isValid = await validator.validateField(props.field, fieldValue, validator.getData());
      
      if (isValid) {
        emit('field-validated', {
          field: props.field,
          value: fieldValue,
          isValid: true
        });
      } else {
        emit('field-error', {
          field: props.field,
          value: fieldValue,
          errors: fieldErrors.value,
          isValid: false
        });
      }
      
      return isValid;
    };

    // Computed field classes
    const fieldClasses = computed(() => {
      const classes = [props.fieldClass];
      
      if (hasFieldError.value) {
        classes.push('has-error');
      }
      
      if (isFieldValid.value && props.modelValue !== null && props.modelValue !== undefined) {
        classes.push('is-valid');
      }
      
      return classes;
    });

    // Computed error classes
    const errorClasses = computed(() => {
      return [props.errorClass];
    });

    return {
      fieldErrors,
      hasFieldError,
      firstError,
      isFieldValid,
      validate,
      fieldClasses,
      errorClasses
    };
  }
};
</script>

<style scoped>
.has-error {
  /* Add visual indication for fields with errors */
}

.is-valid {
  /* Add visual indication for valid fields */
}

.error-message {
  /* Default error message styling */
}
</style>
