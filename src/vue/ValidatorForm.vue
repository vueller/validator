<template>
  <form 
    ref="formRef"
    @submit.prevent="handleSubmit" 
    :class="formClasses"
    :data-validator-blur-disabled="!validateOnBlur"
    :data-validator-input-disabled="!validateOnInput"
  >
    <slot 
      v-bind="slotProps"
    />
  </form>
</template>

<script>
import { computed, watch, reactive, onMounted, nextTick, ref } from 'vue';
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
    },

    /** Whether to show errors automatically */
    showErrors: {
      type: Boolean,
      default: true
    }
  },

  emits: [
    'submit',
    'validation-success', 
    'validation-error',
    'update:modelValue'
  ],

  setup(props, { emit }) {
    // Form ref
    const formRef = ref(null);
    
    const {
      validator,
      errors,
      isValidating,
      isValid,
      hasErrors,
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

    // Setup automatic error display and validation
    const setupFormValidation = () => {
      if (!props.showErrors || !formRef.value) return;

      nextTick(() => {
        const form = formRef.value;
        if (!form) return;

        // Find all form elements with name attributes
        const formElements = form.querySelectorAll('input[name], select[name], textarea[name]');
        
        formElements.forEach(element => {
          const fieldName = element.name;
          if (!fieldName || !props.rules[fieldName]) return;

          // Setup error display
          setupFieldErrorDisplay(element, fieldName);
          
          // Setup validation events
          setupFieldValidation(element, fieldName);
        });
      });
    };

    // Setup error display for a field
    const setupFieldErrorDisplay = (element, fieldName) => {
      // Create error container if it doesn't exist
      if (element._errorContainer) return;

      const errorContainer = document.createElement('div');
      errorContainer.className = 'validator-field-error';
      errorContainer.style.cssText = 'color: #ef4444; font-size: 14px; margin-top: 4px;';
      
      // Insert after the element
      element.parentNode.insertBefore(errorContainer, element.nextSibling);
      element._errorContainer = errorContainer;

      // Update error display function
      const updateErrorDisplay = () => {
        const fieldErrors = validator.errors().get(fieldName);
        if (fieldErrors && fieldErrors.length > 0) {
          errorContainer.textContent = fieldErrors[0];
          errorContainer.style.display = 'block';
          element.classList.add('v-invalid', 'v-has-error');
          element.classList.remove('v-valid');
        } else {
          errorContainer.style.display = 'none';
          element.classList.remove('v-invalid', 'v-has-error');
          if (element.value) {
            element.classList.add('v-valid');
          }
        }
      };

      // Store update function for cleanup
      element._updateErrorDisplay = updateErrorDisplay;
      
      // Initial update
      updateErrorDisplay();
    };

    // Setup validation events for a field
    const setupFieldValidation = (element, fieldName) => {
      // Clean up existing handlers
      if (element._blurHandler) {
        element.removeEventListener('blur', element._blurHandler);
      }
      if (element._inputHandler) {
        element.removeEventListener('input', element._inputHandler);
      }

      // Blur validation
      if (props.validateOnBlur) {
        element._blurHandler = async () => {
          const value = element.value;
          formData[fieldName] = value;
          validator.setData(formData, props.scope);
          await validator.validate(props.scope).field(fieldName);
          element._updateErrorDisplay();
        };
        element.addEventListener('blur', element._blurHandler);
      }

      // Input validation with debouncing
      if (props.validateOnInput) {
        element._inputHandler = debounce(async () => {
          const value = element.value;
          formData[fieldName] = value;
          validator.setData(formData, props.scope);
          await validator.validate(props.scope).field(fieldName);
          element._updateErrorDisplay();
        }, 300);
        element.addEventListener('input', element._inputHandler);
      }
    };

    // Debounce utility
    const debounce = (func, delay) => {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    };

    // Setup validation on mount
    onMounted(() => {
      setupFormValidation();
    });

    // Watch for errors changes to update display
    watch(errors, () => {
      if (props.showErrors && formRef.value) {
        const form = formRef.value;
        const formElements = form.querySelectorAll('input[name], select[name], textarea[name]');
        formElements.forEach(element => {
          if (element._updateErrorDisplay) {
            element._updateErrorDisplay();
          }
        });
      }
    }, { deep: true });

    // Handle form submission
    const handleSubmit = async (event) => {
      // Validate with current form data
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
      
      // Clear error displays
      if (props.showErrors && formRef.value) {
        const form = formRef.value;
        const formElements = form.querySelectorAll('input[name], select[name], textarea[name]');
        formElements.forEach(element => {
          if (element._updateErrorDisplay) {
            element._updateErrorDisplay();
          }
        });
      }
    };

    // Computed form classes
    const formClasses = computed(() => {
      const classes = [props.formClass];
      
      if (hasErrors.value) classes.push('has-errors');
      if (isValid.value && Object.keys(formData).length > 0) classes.push('is-valid');
      if (isValidating.value) classes.push('is-validating');
      
      return classes.filter(Boolean);
    });

    // Slot props object
    const slotProps = computed(() => ({
      values: formData,
      errors: errors.value,
      isValidating: isValidating.value,
      isValid: isValid.value,
      hasErrors: hasErrors.value,
      reset
    }));

    return {
      formRef,
      slotProps,
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
  .v-valid - for valid fields
  .v-invalid - for invalid fields
  .v-has-error - for fields with errors
*/
</style>