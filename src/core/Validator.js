import { reactive, computed } from 'vue';
import { ErrorBag } from './ErrorBag.js';
import { I18nManager } from './I18nManager.js';
import { RuleRegistry } from '../RuleRegistry.js';

/**
 * Main Validator class that orchestrates the validation process with Vue 3 reactivity
 * Provides real-time validation updates and automatic UI synchronization
 */
export class Validator {
  constructor(options = {}) {
    // Reactive state
    this.state = reactive({
      isValidating: false,
      formData: {},
      fieldRules: new Map()
    });

    // Core components
    this.errorBag = new ErrorBag();
    this.i18nManager = new I18nManager();
    this.ruleRegistry = new RuleRegistry();
    
    // Configuration options
    this.options = {
      stopOnFirstFailure: false,
      locale: 'en',
      ...options
    };

    // Set initial locale
    this.i18nManager.setLocale(this.options.locale);

    // Reactive computed properties
    this.isValid = computed(() => !this.errorBag.anyStatic());
    this.hasErrors = computed(() => this.errorBag.anyStatic());
    this.errorCount = computed(() => this.errorBag.countStatic());
  }

  /**
   * Set validation rules for a field
   * @param {string} field - The field name
   * @param {string|Object|Array} rules - The validation rules
   * @returns {Validator} Returns this for method chaining
   */
  setRules(field, rules) {
    const parsedRules = this.ruleRegistry.parseRules(rules);
    this.state.fieldRules.set(field, parsedRules);
    
    // Trigger reactivity
    this.state.fieldRules = new Map(this.state.fieldRules);
    
    return this;
  }

  /**
   * Set multiple field rules at once
   * @param {Object} rulesObject - Object with field names as keys and rules as values
   * @returns {Validator} Returns this for method chaining
   */
  setMultipleRules(rulesObject) {
    for (const [field, rules] of Object.entries(rulesObject)) {
      this.setRules(field, rules);
    }
    return this;
  }

  /**
   * Validate a single field with reactive updates
   * @param {string} field - The field name
   * @param {any} value - The value to validate
   * @param {Object} allValues - All form values for cross-field validation
   * @returns {Promise<boolean>} True if valid, false if invalid
   */
  async validateField(field, value, allValues = {}) {
    // Clear existing errors for this field
    this.errorBag.remove(field);

    const rules = this.state.fieldRules.get(field) || [];
    let isValid = true;

    for (const rule of rules) {
      // Check if rule should be applied
      if (rule.shouldApply && !rule.shouldApply(value, field, allValues)) {
        continue;
      }

      try {
        const ruleResult = await rule.validate(value, field, allValues);
        
        if (!ruleResult) {
          isValid = false;
          
          // Get rule name for i18n lookup
          const ruleName = rule.getRuleName ? rule.getRuleName() : 'invalid';
          
          // Get localized message
          const message = this.i18nManager.getMessage(ruleName, field, rule.params || {});
          
          this.errorBag.add(field, message);

          // Stop on first failure if configured
          if (this.options.stopOnFirstFailure) {
            break;
          }
        }
      } catch (error) {
        console.error(`Error validating field ${field}:`, error);
        isValid = false;
        const errorMessage = this.i18nManager.getMessage('invalid', field);
        this.errorBag.add(field, errorMessage);
      }
    }

    return isValid;
  }

  /**
   * Validate all fields with their current values
   * @param {Object} data - Form data to validate
   * @returns {Promise<boolean>} True if all fields are valid
   */
  async validateAll(data = {}) {
    this.state.isValidating = true;
    
    try {
      // Update form data
      Object.assign(this.state.formData, data);
      
      // Clear all errors
      this.errorBag.clear();

      const validationPromises = [];
      
      for (const [field] of this.state.fieldRules) {
        const value = this.state.formData[field];
        validationPromises.push(this.validateField(field, value, this.state.formData));
      }

      const results = await Promise.all(validationPromises);
      return results.every(result => result === true);
    } finally {
      this.state.isValidating = false;
    }
  }

  /**
   * Check if all validations pass (reactive)
   * @returns {ComputedRef<boolean>} Reactive boolean
   */
  passes() {
    return this.isValid;
  }

  /**
   * Check if any validations fail (reactive)
   * @returns {ComputedRef<boolean>} Reactive boolean
   */
  fails() {
    return this.hasErrors;
  }

  /**
   * Get the reactive error bag instance
   * @returns {ErrorBag} The reactive error bag
   */
  errors() {
    return this.errorBag;
  }

  /**
   * Register a custom validation rule
   * @param {string} name - The rule name
   * @param {Function|Class} rule - The rule implementation
   * @param {string} message - Optional default error message
   * @returns {Validator} Returns this for method chaining
   */
  extend(name, rule, message = null) {
    this.ruleRegistry.register(name, rule, message);
    
    // Add message to i18n if provided
    if (message) {
      this.i18nManager.addMessages(this.i18nManager.getLocale(), {
        [name]: message
      });
    }
    
    return this;
  }

  /**
   * Set the locale for error messages (reactive)
   * @param {string} locale - The locale code
   * @returns {Validator} Returns this for method chaining
   */
  setLocale(locale) {
    this.i18nManager.setLocale(locale);
    
    // Re-validate all fields to update error messages
    this.revalidateAllFields();
    
    return this;
  }

  /**
   * Add localized messages
   * @param {string} locale - The locale code
   * @param {Object} messages - The messages object
   * @returns {Validator} Returns this for method chaining
   */
  addMessages(locale, messages) {
    this.i18nManager.addMessages(locale, messages);
    return this;
  }

  /**
   * Reset the validator state
   * @returns {Validator} Returns this for method chaining
   */
  reset() {
    this.errorBag.clear();
    this.state.formData = {};
    this.state.isValidating = false;
    return this;
  }

  /**
   * Re-validate all fields (useful after locale change)
   */
  async revalidateAllFields() {
    if (this.errorBag.anyStatic()) {
      // Only re-validate if there were errors
      const fieldsWithErrors = this.errorBag.keysStatic();
      
      for (const field of fieldsWithErrors) {
        const value = this.state.formData[field];
        await this.validateField(field, value, this.state.formData);
      }
    }
  }

  /**
   * Get reactive state for Vue components
   * @returns {Object} Reactive state object
   */
  getReactiveState() {
    return {
      // Form data
      formData: this.state.formData,
      
      // Validation state
      isValidating: computed(() => this.state.isValidating),
      isValid: this.isValid,
      hasErrors: this.hasErrors,
      errorCount: this.errorCount,
      
      // Error bag reactive state
      ...this.errorBag.getReactiveState(),
      
      // I18n reactive state  
      ...this.i18nManager.getReactiveState(),
      
      // Methods
      validateField: (field, value) => this.validateField(field, value, this.state.formData),
      validateAll: (data) => this.validateAll(data),
      setRules: (field, rules) => this.setRules(field, rules),
      setMultipleRules: (rules) => this.setMultipleRules(rules),
      reset: () => this.reset(),
      extend: (name, rule, message) => this.extend(name, rule, message)
    };
  }

  /**
   * Remove rules for a specific field
   * @param {string} field - The field name
   * @returns {Validator} Returns this for method chaining
   */
  removeRules(field) {
    this.state.fieldRules.delete(field);
    this.errorBag.remove(field);
    
    // Trigger reactivity
    this.state.fieldRules = new Map(this.state.fieldRules);
    
    return this;
  }

  /**
   * Get rules for a specific field
   * @param {string} field - The field name
   * @returns {Array} Array of rule instances
   */
  getRules(field) {
    return this.state.fieldRules.get(field) || [];
  }

  /**
   * Check if a field has rules
   * @param {string} field - The field name
   * @returns {boolean} True if field has rules
   */
  hasRules(field) {
    return this.state.fieldRules.has(field) && this.state.fieldRules.get(field).length > 0;
  }

  /**
   * Set form data
   * @param {Object} data - The form data
   * @returns {Validator} Returns this for method chaining
   */
  setData(data) {
    Object.assign(this.state.formData, data);
    return this;
  }

  /**
   * Get form data
   * @returns {Object} The current form data
   */
  getData() {
    return { ...this.state.formData };
  }

  /**
   * Update a single field value
   * @param {string} field - The field name
   * @param {any} value - The field value
   * @returns {Validator} Returns this for method chaining
   */
  setValue(field, value) {
    this.state.formData[field] = value;
    return this;
  }

  /**
   * Get a single field value
   * @param {string} field - The field name
   * @returns {any} The field value
   */
  getValue(field) {
    return this.state.formData[field];
  }

  /**
   * Get global configuration
   * @returns {Object} Current configuration options
   */
  getGlobalConfig() {
    return { ...this.options };
  }

  /**
   * Set global configuration
   * @param {Object} newConfig - New configuration options
   * @returns {Validator} Returns this for method chaining
   */
  setGlobalConfig(newConfig) {
    Object.assign(this.options, newConfig);
    
    // Update locale if changed
    if (newConfig.locale && newConfig.locale !== this.i18nManager.getLocale()) {
      this.i18nManager.setLocale(newConfig.locale);
    }
    
    return this;
  }
}
