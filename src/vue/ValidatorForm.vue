<template>
  <form 
    @submit.prevent="handleSubmit" 
    :class="formClasses"
    data-validator-form
    :data-validator-blur-disabled="!validateOnBlur"
    :data-validator-input-disabled="!validateOnInput"
  >
    <slot 
      :validator="validator"
      :errors="errors"
      :isValidating="isValidating"
      :isValid="isValid"
      :hasErrors="hasErrors"
      :validate="validate"
      :reset="reset"
      :formData="formData"
    />
  </form>
</template>

<script>
import { computed, watch, reactive } from 'vue';
import { useValidator } from './composables.js';

export default {
  name: 'ValidatorForm',
  
  props: {
    /** Validation rules for form fields */
    rules: {
      type: Object,
      default: () => ({})
    },

    /** Initial form data */
    modelValue: {
      type: Object,
      default: () => ({})
    },

    /** Form scope identifier */
    scope: {
      type: String,
      default: 'default'
    },

    /** Validator options */
    validatorOptions: {
      type: Object,
      default: () => ({})
    },

    /** Whether to validate fields on blur */
    validateOnBlur: {
      type: Boolean,
      default: true
    },

    /** Whether to validate fields on input */
    validateOnInput: {
      type: Boolean,
      default: false
    },

    /** CSS classes for the form */
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
      errors,
      isValidating,
      isValid,
      hasErrors,
      validate,
      reset: resetValidator
    } = useValidator(props.validatorOptions);

    // Form data (reactive)
    const formData = reactive({ ...props.modelValue });

    // Initialize validator
    const initializeValidator = () => {
      // Set rules for this scope
      if (props.rules && Object.keys(props.rules).length > 0) {
        validator.setMultipleRules(props.rules, {}, props.scope);
      }

      // Set initial data for scope
      validator.setData(formData, props.scope);
    };

    // Initialize on setup
    initializeValidator();

    // Watch for rule changes
    watch(() => props.rules, (newRules) => {
      if (newRules && Object.keys(newRules).length > 0) {
        validator.setMultipleRules(newRules, {}, props.scope);
      }
    }, { deep: true });

    // Watch for model value changes
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        Object.assign(formData, newValue);
        validator.setData(formData, props.scope);
      }
    }, { deep: true });

    // Watch form data changes and emit updates
    watch(formData, (newData) => {
      emit('update:modelValue', newData);
    }, { deep: true });

    // Handle form submission
    const handleSubmit = async (event) => {
      // Validate with current form data (setData handled automatically)
      const isFormValid = await validator.validate(props.scope, formData);
      
      const submitData = {
        data: formData,
        isValid: isFormValid,
        errors: errors.value,
        event
      };

      if (isFormValid) {
        emit('validation-success', formData);
      } else {
        emit('validation-error', { data: formData, errors: errors.value });
      }
      
      emit('submit', submitData);
    };

    // Reset form
    const reset = () => {
      resetValidator();
      Object.keys(formData).forEach(key => delete formData[key]);
      emit('update:modelValue', {});
    };

    // Computed form classes
    const formClasses = computed(() => {
      const classes = [props.formClass];
      
      if (hasErrors.value) classes.push('has-errors');
      if (isValid.value && Object.keys(formData).length > 0) classes.push('is-valid');
      if (isValidating.value) classes.push('is-validating');
      
      return classes.filter(Boolean);
    });

    return {
      validator,
      formData,
      errors,
      isValidating,
      isValid,
      hasErrors,
      validate: (data = formData) => validator.validate(props.scope, data),
      handleSubmit,
      reset,
      formClasses
    };
  }
};
</script>

<style scoped>
.is-validating {
  pointer-events: none;
  opacity: 0.7;
}

/* 
  Additional CSS classes available:
  .has-errors - for forms with validation errors
  .is-valid - for forms that are valid
*/
</style>