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
    /** Field name for validation */
    field: {
      type: String,
      required: true
    },

    /** Validation rules for this field */
    rules: {
      type: [String, Object, Array],
      default: null
    },

    /** Form scope identifier */
    scope: {
      type: String,
      default: 'default'
    },

    /** Field value for validation */
    modelValue: {
      default: null
    },

    /** Whether to show validation errors */
    showErrors: {
      type: Boolean,
      default: true
    },

    /** CSS classes for the field wrapper */
    fieldClass: {
      type: [String, Object, Array],
      default: ''
    },

    /** CSS classes for error messages */
    errorClass: {
      type: [String, Object, Array],
      default: 'field-errors'
    }
  },

  emits: ['field-validated', 'field-error'],

  setup(props, { emit }) {
    const validator = inject(ValidatorSymbol);
    
    if (!validator) {
      console.warn('ValidatorField requires a validator instance. Use it inside ValidatorForm or provide ValidatorSymbol.');
      return {};
    }

    // Set rules for the field in this scope
    if (props.rules) {
      validator.setRules(props.field, props.rules, {}, props.scope);
    }

    // Get scoped field name for error tracking
    const scopedFieldName = computed(() => {
      return props.scope === 'default' ? props.field : `${props.scope}.${props.field}`;
    });

    // Get field errors (scoped)
    const fieldErrors = computed(() => {
      return validator.errors().get(scopedFieldName.value);
    });

    // Check if field has errors (scoped)
    const hasFieldError = computed(() => {
      return validator.errors().has(scopedFieldName.value);
    });

    // Get first error (scoped)
    const firstError = computed(() => {
      return validator.errors().first(scopedFieldName.value);
    });

    // Check if field is valid
    const isFieldValid = computed(() => {
      return !hasFieldError.value;
    });

    // Validate this field
    const validate = async (value = null) => {
      const fieldValue = value !== null ? value : props.modelValue;
      
      // Validate using new API (field value set automatically)
      const isValid = await validator.validate(props.scope).field(props.field, fieldValue);
      
      const eventData = {
        field: props.field,
        value: fieldValue,
        isValid,
        scope: props.scope
      };

      if (isValid) {
        emit('field-validated', eventData);
      } else {
        emit('field-error', {
          ...eventData,
          errors: fieldErrors.value
        });
      }
      
      return isValid;
    };

    // Computed field classes
    const fieldClasses = computed(() => {
      const classes = [props.fieldClass];
      
      if (hasFieldError.value) classes.push('has-error');
      if (isFieldValid.value && props.modelValue != null) classes.push('is-valid');
      
      return classes.filter(Boolean);
    });

    // Computed error classes
    const errorClasses = computed(() => {
      return [props.errorClass].filter(Boolean);
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

.field-errors {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-message {
  /* Individual error message styling */
}
</style>