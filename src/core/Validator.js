import { ErrorBag } from './ErrorBag.js';
import { I18nManager } from './I18nManager.js';
import { RuleRegistry } from '../RuleRegistry.js';
import { normalizeValue, shouldValidate } from '../utils/index.js';

/**
 * Main Validator class that orchestrates the validation process
 * Framework-agnostic implementation that works with both JavaScript and Vue
 * Provides validation with optional reactivity support
 */
export class Validator {
  constructor(options = {}) {
    // Configuration options
    this.options = this.buildOptions(options);

    // Internal state with scopes support
    this.state = {
      isValidating: false,
      formData: {},
      scopes: new Map() // Map<scope, { formData, isValidating, fieldRules }>
    };

    // Core components
    this.errorBag = new ErrorBag();
    this.i18nManager = new I18nManager();
    this.ruleRegistry = new RuleRegistry();
    
    // Listeners for reactivity
    this.listeners = new Set();
    
    // Initialize components
    this.initializeComponents();
  }

  /**
   * Build configuration options with defaults
   * @param {Object} options - User provided options
   * @returns {Object} Complete options object
   */
  buildOptions(options) {
    return {
      stopOnFirstFailure: false,
      locale: 'en',
      validateOnBlur: true,
      validateOnInput: false,
      ...options
    };
  }

  /**
   * Initialize core components
   */
  initializeComponents() {
    this.i18nManager.setLocale(this.options.locale);
    
    // Subscribe to changes from components
    this.errorBag.subscribe(() => this.notifyListeners());
    this.i18nManager.subscribe(() => this.notifyListeners());
  }

  /**
   * Set validation rules for a field in a specific scope
   * @param {string} field - The field name
   * @param {string|Object|Array} rules - The validation rules
   * @param {Object} messages - Optional custom messages for this field
   * @param {string} scope - Optional scope identifier
   * @returns {Validator} Returns this for method chaining
   */
  setRules(field, rules, messages = {}, scope = 'default') {
    const parsedRules = this.ruleRegistry.parseRules(rules);
    const scopeData = this.getScopeData(scope);
    scopeData.fieldRules.set(field, parsedRules);
    
    // Set custom messages if provided
    if (Object.keys(messages).length > 0) {
      const fieldMessages = {};
      Object.keys(messages).forEach(rule => {
        fieldMessages[`${field}.${rule}`] = messages[rule];
      });
      this.i18nManager.addMessages(this.i18nManager.getLocale(), fieldMessages);
    }
    
    this.notifyListeners();
    return this;
  }

  /**
   * Set multiple field rules at once for a specific scope
   * @param {Object} rulesObject - Object with field names as keys and rules as values
   * @param {Object} messagesObject - Optional custom messages object
   * @param {string} scope - Optional scope identifier
   * @returns {Validator} Returns this for method chaining
   */
  setMultipleRules(rulesObject, messagesObject = {}, scope = 'default') {
    for (const [field, rules] of Object.entries(rulesObject)) {
      const fieldMessages = messagesObject[field] || {};
      this.setRules(field, rules, fieldMessages, scope);
    }
    return this;
  }

  /**
   * Main validation method with fluent API
   * @param {string|Object} scopeOrData - Scope identifier or data object
   * @param {Object} data - Optional data object (when first param is scope)
   * @returns {Object|Promise<boolean>} Validation result or fluent API object
   */
  validate(scopeOrData = null, data = null) {
    let scope = 'default';
    let formData = null;

    // Parse parameters
    if (typeof scopeOrData === 'string') {
      scope = scopeOrData;
      formData = data;
    } else if (typeof scopeOrData === 'object' && scopeOrData !== null) {
      formData = scopeOrData;
    } else if (scopeOrData === null) {
      // No parameters, validate default scope
      return this.validateScope('default');
    }

    // Set data automatically if provided
    if (formData) {
      this.setData(formData, scope);
    }

    // Return fluent API object
    return {
      /**
       * Validate a specific field in the scope
       * @param {string} fieldName - Field name to validate
       * @param {any} fieldValue - Optional field value to set before validation
       * @returns {Promise<boolean>} True if valid
       */
      field: async (fieldName, fieldValue = undefined) => {
        // Set field value if provided
        if (fieldValue !== undefined) {
          this.setValue(fieldName, fieldValue, scope);
        }
        
        const scopeData = this.getScopeData(scope);
        const value = scopeData.formData[fieldName];
        return await this.validateSingleField(fieldName, value, scopeData.formData, scope);
      },

      /**
       * Validate all fields in the scope (when called without field)
       * @returns {Promise<boolean>} True if all fields are valid
       */
      then: async (resolve, reject) => {
        try {
          const result = await this.validateScope(scope);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    };
  }

  /**
   * Validate all fields in a scope
   * @param {string} scope - Scope identifier
   * @returns {Promise<boolean>} True if all fields are valid
   */
  async validateScope(scope = 'default') {
    const scopeData = this.getScopeData(scope);
    
    // Get all fields that have rules and data in this scope
    const fieldsToValidate = [];
    for (const [field] of scopeData.fieldRules) {
      if (scopeData.formData.hasOwnProperty(field)) {
        fieldsToValidate.push(field);
      }
    }

    if (fieldsToValidate.length === 0) {
      return true; // No fields to validate
    }

    scopeData.isValidating = true;
    this.notifyListeners();

    try {
      // Clear errors for this scope
      this.clearScopeErrors(scope);

      const validationPromises = [];
      
      for (const field of fieldsToValidate) {
        const value = scopeData.formData[field];
        validationPromises.push(
          this.validateSingleField(field, value, scopeData.formData, scope)
        );
      }

      const results = await Promise.all(validationPromises);
      return results.every(result => result === true);
    } finally {
      scopeData.isValidating = false;
      this.notifyListeners();
    }
  }

  /**
   * Validate a single field (internal method)
   * @param {string} field - The field name
   * @param {any} value - The value to validate
   * @param {Object} allValues - All form values for cross-field validation
   * @param {string} scope - Scope identifier
   * @returns {Promise<boolean>} True if valid, false if invalid
   */
  async validateSingleField(field, value, allValues = {}, scope = 'default') {
    // Clear existing errors for this field
    this.errorBag.remove(this.getScopedFieldName(field, scope));

    // Get scoped rules for this field
    const scopeData = this.getScopeData(scope);
    const rules = scopeData.fieldRules.get(field) || [];
    if (rules.length === 0) return true;
    
    const normalizedValue = normalizeValue(value);
    
    let isValid = true;
    const hasRequiredRule = this.hasRequiredRule(rules);

    for (const rule of rules) {
      // Skip validation if rule should not apply
      if (!this.shouldApplyRule(rule, normalizedValue, field, allValues, hasRequiredRule)) {
        continue;
      }

      try {
        const ruleResult = await this.executeRule(rule, normalizedValue, field, allValues);
        
        if (!ruleResult) {
          isValid = false;
          await this.handleRuleFailure(rule, field, scope);

          // Stop on first failure if configured
          if (this.options.stopOnFirstFailure) {
            break;
          }
        }
      } catch (error) {
        isValid = false;
        await this.handleRuleError(error, field, scope);
      }
    }

    return isValid;
  }

  /**
   * Check if rules contain a required rule
   * @param {Array} rules - Array of rule instances
   * @returns {boolean} True if has required rule
   */
  hasRequiredRule(rules) {
    return rules.some(rule => 
      rule.getRuleName && rule.getRuleName() === 'required'
    );
  }

  /**
   * Check if rule should be applied
   * @param {Object} rule - Rule instance
   * @param {any} value - Normalized value
   * @param {string} field - Field name
   * @param {Object} allValues - All form values
   * @param {boolean} hasRequiredRule - Whether field has required rule
   * @returns {boolean} True if rule should be applied
   */
  shouldApplyRule(rule, value, field, allValues, hasRequiredRule) {
    // Check rule's own shouldApply method
    if (rule.shouldApply && !rule.shouldApply(value, field, allValues)) {
      return false;
    }

    // For non-required rules, skip if value is empty and field is not required
    const isRequiredRule = rule.getRuleName && rule.getRuleName() === 'required';
    if (!isRequiredRule && !hasRequiredRule) {
      return shouldValidate(value, false);
    }

    return true;
  }

  /**
   * Execute a validation rule
   * @param {Object} rule - Rule instance
   * @param {any} value - Normalized value
   * @param {string} field - Field name
   * @param {Object} allValues - All form values
   * @returns {Promise<boolean>} Rule validation result
   */
  async executeRule(rule, value, field, allValues) {
    return await rule.validate(value, field, allValues);
  }

  /**
   * Handle rule validation failure
   * @param {Object} rule - Rule instance
   * @param {string} field - Field name
   * @param {string} scope - Scope identifier
   */
  async handleRuleFailure(rule, field, scope) {
    const ruleName = rule.getRuleName ? rule.getRuleName() : 'invalid';
    const message = this.i18nManager.getMessage(ruleName, field, rule.params || {});
    const scopedFieldName = this.getScopedFieldName(field, scope);
    this.errorBag.add(scopedFieldName, message);
  }

  /**
   * Handle rule execution error
   * @param {Error} error - The error that occurred
   * @param {string} field - Field name
   * @param {string} scope - Scope identifier
   */
  async handleRuleError(error, field, scope) {
    console.error(`Error validating field ${field}:`, error);
    const errorMessage = this.i18nManager.getMessage('invalid', field);
    const scopedFieldName = this.getScopedFieldName(field, scope);
    this.errorBag.add(scopedFieldName, errorMessage);
  }

  /**
   * Get scoped field name for error tracking
   * @param {string} field - Field name
   * @param {string} scope - Scope identifier
   * @returns {string} Scoped field name
   */
  getScopedFieldName(field, scope) {
    return scope === 'default' ? field : `${scope}.${field}`;
  }

  /**
   * Get scope data, creating if it doesn't exist
   * @param {string} scope - Scope identifier
   * @returns {Object} Scope data
   */
  getScopeData(scope) {
    if (!this.state.scopes.has(scope)) {
      this.state.scopes.set(scope, { 
        formData: {}, 
        isValidating: false,
        fieldRules: new Map() // Map<field, rules> - rules per scope
      });
    }
    return this.state.scopes.get(scope);
  }

  /**
   * Clear errors for a specific scope
   * @param {string} scope - Scope identifier
   */
  clearScopeErrors(scope) {
    const scopeData = this.getScopeData(scope);
    
    // Clear errors for all fields that have data in this scope
    for (const field in scopeData.formData) {
      if (scopeData.fieldRules.has(field)) {
        const scopedFieldName = this.getScopedFieldName(field, scope);
        this.errorBag.remove(scopedFieldName);
      }
    }
  }


  /**
   * Check if all validations pass
   * @returns {boolean} True if valid
   */
  isValid() {
    return !this.errorBag.any();
  }

  /**
   * Check if any validations fail
   * @returns {boolean} True if has errors
   */
  hasErrors() {
    return this.errorBag.any();
  }

  /**
   * Get the error bag instance
   * @returns {ErrorBag} The error bag
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
   * Set the locale for error messages
   * @param {string} locale - The locale code
   * @returns {Validator} Returns this for method chaining
   */
  setLocale(locale) {
    this.i18nManager.setLocale(locale);
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
    this.notifyListeners();
    return this;
  }

  /**
   * Re-validate all fields (useful after locale change)
   */
  async revalidateAllFields() {
    if (!this.errorBag.any()) {
      return; // No need to revalidate if no errors
    }

    const fieldsWithErrors = this.errorBag.keys();
    
    // Group fields by scope
    const scopeFields = new Map();
    
    for (const scopedFieldName of fieldsWithErrors) {
      if (scopedFieldName.includes('.')) {
        const [scope, field] = scopedFieldName.split('.', 2);
        if (!scopeFields.has(scope)) {
          scopeFields.set(scope, []);
        }
        scopeFields.get(scope).push(field);
      } else {
        // Default scope
        if (!scopeFields.has('default')) {
          scopeFields.set('default', []);
        }
        scopeFields.get('default').push(scopedFieldName);
      }
    }
    
    // Revalidate each scope
    for (const [scope, fields] of scopeFields) {
      for (const field of fields) {
        const scopeData = this.getScopeData(scope);
        const value = scopeData.formData[field];
        if (value !== undefined) {
          await this.validate(scope).field(field);
        }
      }
    }
  }

  /**
   * Subscribe to changes (for reactive frameworks)
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   * @private
   */
  notifyListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Get state for Vue components (creates reactive wrappers)
   * @returns {Object} Reactive state object
   */
  getState() {
    // Check if Vue is available
    if (typeof window !== 'undefined' && window.Vue) {
      const { computed } = window.Vue;
      return this.createVueState(computed);
    }

    // Try to import Vue dynamically
    try {
      const { computed } = require('vue');
      return this.createVueState(computed);
    } catch {
      // Fallback to plain object for non-Vue environments
      return this.createPlainState();
    }
  }

  /**
   * Create Vue reactive state
   * @param {Function} computed - Vue computed function
   * @returns {Object} Vue reactive state
   */
  createVueState(computed) {
    return {
      // Form data
      formData: this.state.formData,
      
      // Validation state
      isValidating: computed(() => this.state.isValidating),
      isValid: computed(() => this.isValid()),
      hasErrors: computed(() => this.hasErrors()),
      errorCount: computed(() => this.errorBag.count()),
      
      // Error bag state
      ...this.errorBag.getState(),
      
      // I18n state  
      ...this.i18nManager.getState(),
      
      // Methods - bound to maintain context
      validate: this.validate.bind(this),
      setRules: this.setRules.bind(this),
      setMultipleRules: this.setMultipleRules.bind(this),
      setData: this.setData.bind(this),
      setValue: this.setValue.bind(this),
      getValue: this.getValue.bind(this),
      reset: this.reset.bind(this),
      extend: this.extend.bind(this)
    };
  }

  /**
   * Create plain JavaScript state
   * @returns {Object} Plain state object
   */
  createPlainState() {
    return {
      // Form data
      formData: this.state.formData,
      
      // Validation state
      isValidating: this.state.isValidating,
      isValid: this.isValid(),
      hasErrors: this.hasErrors(),
      errorCount: this.errorBag.count(),
      
      // Error bag state
      ...this.errorBag.getState(),
      
      // I18n state  
      ...this.i18nManager.getState(),
      
      // Methods - bound to maintain context
      validate: this.validate.bind(this),
      setRules: this.setRules.bind(this),
      setMultipleRules: this.setMultipleRules.bind(this),
      setData: this.setData.bind(this),
      setValue: this.setValue.bind(this),
      getValue: this.getValue.bind(this),
      reset: this.reset.bind(this),
      extend: this.extend.bind(this)
    };
  }

  /**
   * Remove rules for a specific field
   * @param {string} field - The field name
   * @returns {Validator} Returns this for method chaining
   */
  removeRules(field, scope = 'default') {
    const scopeData = this.getScopeData(scope);
    scopeData.fieldRules.delete(field);
    
    // Remove errors for this field in this scope
    const scopedFieldName = this.getScopedFieldName(field, scope);
    this.errorBag.remove(scopedFieldName);
    
    this.notifyListeners();
    return this;
  }

  /**
   * Get rules for a specific field in a scope
   * @param {string} field - The field name
   * @param {string} scope - Optional scope identifier
   * @returns {Array} Array of rule instances
   */
  getRules(field, scope = 'default') {
    const scopeData = this.getScopeData(scope);
    return scopeData.fieldRules.get(field) || [];
  }

  /**
   * Check if a field has rules
   * @param {string} field - The field name
   * @returns {boolean} True if field has rules
   */
  hasRules(field, scope = 'default') {
    const scopeData = this.getScopeData(scope);
    return scopeData.fieldRules.has(field) && scopeData.fieldRules.get(field).length > 0;
  }

  /**
   * Set form data for a scope
   * @param {Object} data - The form data
   * @param {string} scope - Optional scope identifier
   * @returns {Validator} Returns this for method chaining
   */
  setData(data, scope = 'default') {
    const scopeData = this.getScopeData(scope);
    Object.assign(scopeData.formData, data);
    
    // Also update global formData for backward compatibility
    if (scope === 'default') {
      Object.assign(this.state.formData, data);
    }
    
    this.notifyListeners();
    return this;
  }

  /**
   * Get form data for a scope
   * @param {string} scope - Optional scope identifier
   * @returns {Object} The current form data
   */
  getData(scope = 'default') {
    if (scope === 'default') {
      return { ...this.state.formData };
    }
    
    const scopeData = this.getScopeData(scope);
    return { ...scopeData.formData };
  }

  /**
   * Update a single field value in a scope
   * @param {string} field - The field name
   * @param {any} value - The field value
   * @param {string} scope - Optional scope identifier
   * @returns {Validator} Returns this for method chaining
   */
  setValue(field, value, scope = 'default') {
    const scopeData = this.getScopeData(scope);
    scopeData.formData[field] = value;
    
    // Also update global formData for backward compatibility
    if (scope === 'default') {
      this.state.formData[field] = value;
    }
    
    this.notifyListeners();
    return this;
  }

  /**
   * Get a single field value from a scope
   * @param {string} field - The field name
   * @param {string} scope - Optional scope identifier
   * @returns {any} The field value
   */
  getValue(field, scope = 'default') {
    if (scope === 'default') {
      return this.state.formData[field];
    }
    
    const scopeData = this.getScopeData(scope);
    return scopeData.formData[field];
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
    
    this.notifyListeners();
    return this;
  }
}