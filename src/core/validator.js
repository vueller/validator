/**
 * Validator
 *
 * Main validation facade that orchestrates rules, data, i18n and errors.
 * Provides a clean, framework-agnostic API for form validation.
 *
 * Responsibilities:
 * - Manage form data and field values per scope
 * - Register rules and delegate validation to the validation engine
 * - Centralize errors using an ErrorBag
 * - Handle internationalized messages via I18nManager
 *
 * Usage example:
 *
 * ```js
 * const v = new Validator({ locale: 'pt-BR' })
 * v.setRules('email', { required: true, email: true })
 * v.setData({ email: '' })
 * const ok = await v.validate()
 * if (!ok) console.log(v.errors().first('email'))
 * ```
 */

import { ErrorBag } from './ErrorBag.js';
import { I18nManager } from './I18nManager.js';
import { ValidationEngine } from './validation-engine.js';
import { FormManager } from './form-manager.js';
import { RuleManager } from './rule-manager.js';
import { RuleRegistry } from '../RuleRegistry.js';

export class Validator {
  /**
   * Create a new Validator instance
   * @param {Object} [options] - Validator options
   * @param {boolean} [options.stopOnFirstFailure=false] - Stop validating further rules after first failure
   * @param {boolean} [options.validateEmptyFields=false] - Validate empty values even when not required
   * @param {string} [options.locale='en'] - Default locale
   */
  constructor(options = {}) {
    this.options = {
      stopOnFirstFailure: false,
      validateEmptyFields: false,
      locale: 'en',
      ...options
    };

    // Core components
    this.errorBag = new ErrorBag();
    this.i18nManager = new I18nManager();
    this.ruleRegistry = new RuleRegistry();
    this.validationEngine = new ValidationEngine(this.options);
    this.formManager = new FormManager();
    this.ruleManager = new RuleManager(this.ruleRegistry);
    
    // Listeners for reactive updates
    this.listeners = new Set();
    this.isInitializing = true;

    // Initialize
    this.initialize();
    
    // Mark initialization as complete after a short delay
    setTimeout(() => {
      this.isInitializing = false;
    }, 100);
  }

  /**
   * Initialize internal wiring and subscriptions
   * @private
   * @returns {void}
   */
  initialize() {
    // Set dependencies
    this.validationEngine.setDependencies(this.ruleRegistry, this.i18nManager);
    
    // Set initial locale
    this.i18nManager.setLocale(this.options.locale);

    // Subscribe to changes
    this.errorBag.subscribe(() => this.notifyListeners());
    this.i18nManager.subscribe(() => this.notifyListeners());
    this.formManager.subscribe(() => this.notifyListeners());
    this.ruleManager.subscribe(() => this.notifyListeners());
  }

  /**
   * Set validation rules for a single field
   * @param {string} field - Field name
   * @param {string|Object|Array} rules - Validation rules (object, array or pipe string)
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Validator} This instance for chaining
   */
  setRules(field, rules, scope = 'default') {
    this.ruleManager.setFieldRules(field, rules, scope);
    // notifyListeners() is called by ruleManager.subscribe() - no need to call again
    return this;
  }

  /**
   * Set multiple field rules at once
   * @param {Object<string, string|Object|Array>} rulesObject - Map of field -> rules
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Validator} This instance for chaining
   */
  setMultipleRules(rulesObject, scope = 'default') {
    this.ruleManager.setMultipleFieldRules(rulesObject, scope);
    // notifyListeners() is called by ruleManager.subscribe() - no need to call again
    return this;
  }

  /**
   * Set form data for a scope
   * @param {Object<string, any>} data - Form data
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Validator} This instance for chaining
   */
  setData(data, scope = 'default') {
    this.formManager.setFormData(data, scope);
    // notifyListeners() is called by formManager.subscribe() - no need to call again
    return this;
  }

  /**
   * Set a single field value
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Validator} This instance for chaining
   */
  setValue(field, value, scope = 'default') {
    this.formManager.setFieldValue(field, value, scope);
    // notifyListeners() is called by formManager.subscribe() - no need to call again
    return this;
  }

  /**
   * Get a field value
   * @param {string} field - Field name
   * @param {string} [scope='default'] - Optional form scope
   * @returns {any} Field value
   */
  getValue(field, scope = 'default') {
    return this.formManager.getFieldValue(field, scope);
  }

  /**
   * Get all form data for a scope
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Object<string, any>} Form data
   */
  getData(scope = 'default') {
    return this.formManager.getAllFormData(scope);
  }

  /**
   * Set field label used by i18n messages
   * @param {string} field - Field name
   * @param {string} label - Display label
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Validator} This instance for chaining
   */
  setFieldLabel(field, label, scope = 'default') {
    this.ruleManager.setFieldLabel(field, label, scope);
    // notifyListeners() is called by ruleManager.subscribe() - no need to call again
    return this;
  }

  /**
   * Validate a single field
   * @param {string} field - Field name
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Promise<boolean>} Resolves true if field is valid
   */
  async validateField(field, scope = 'default') {
    const value = this.formManager.getFieldValue(field, scope);
    const rules = this.ruleManager.getFieldRules(field, scope);
    const allValues = this.formManager.getAllFormData(scope);

    // Clear existing errors for this field
    this.errorBag.remove(field);

    // Validate the field
    const result = await this.validationEngine.validateField(field, value, rules, allValues);
    
    // Add errors to error bag
    result.errors.forEach(error => {
      this.errorBag.add(error.field, error.message, error.rule);
    });

    // notifyListeners() is called by errorBag.add() - no need to call again
    return result.isValid;
  }

  /**
   * Validate all fields in a scope
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Promise<boolean>} Resolves true if all fields are valid
   */
  async validate(scope = 'default') {
    const fieldsWithRules = this.ruleManager.getFieldsWithRules(scope);
    
    if (fieldsWithRules.length === 0) {
      return true;
    }

    // Clear existing errors for this scope
    fieldsWithRules.forEach(field => this.errorBag.remove(field));

    const validationPromises = fieldsWithRules.map(field => 
      this.validateField(field, scope)
    );

    const results = await Promise.all(validationPromises);
    // notifyListeners() is called by validateField() -> errorBag.add() - no need to call again
    return results.every(result => result === true);
  }

  /**
   * Check if there are no errors
   * @returns {boolean} True if valid (no errors in ErrorBag)
   */
  isValid() {
    return !this.errorBag.any();
  }

  /**
   * Check if there are any errors
   * @returns {boolean} True if there are errors in ErrorBag
   */
  hasErrors() {
    return this.errorBag.any();
  }

  /**
   * Get the underlying ErrorBag instance
   * @returns {ErrorBag} Error bag instance
   */
  errors() {
    return this.errorBag;
  }

  /**
   * Register a custom rule
   * @param {string} name - Rule name
   * @param {Function|Class} rule - Rule implementation (callback or class with validate)
   * @param {string} [message] - Optional default i18n message for this rule
   * @returns {Validator} This instance for chaining
   */
  extend(name, rule, message = null) {
    this.ruleRegistry.register(name, rule, message);
    
    if (message) {
      this.i18nManager.addMessages(this.i18nManager.getLocale(), {
        [name]: message
      });
    }
    
    return this;
  }

  /**
   * Set active locale
   * @param {string} locale - Locale code (e.g., 'en', 'pt-BR')
   * @returns {Validator} This instance for chaining
   */
  setLocale(locale) {
    this.i18nManager.setLocale(locale);
    // notifyListeners() is called by i18nManager.subscribe() - no need to call again
    return this;
  }

  /**
   * Get current locale
   * @returns {string} Current locale code
   */
  getLocale() {
    return this.i18nManager.getLocale();
  }

  /**
   * Add messages for a locale
   * @param {string} locale - Locale code
   * @param {Object<string, string>} messages - Message map (key -> template)
   * @returns {Validator} This instance for chaining
   */
  addMessages(locale, messages) {
    this.i18nManager.addMessages(locale, messages);
    // notifyListeners() is called by i18nManager.subscribe() - no need to call again
    return this;
  }

  /**
   * Reset validator state
   * @param {string} [scope='all'] - Scope to reset ('all' clears data for all scopes)
   * @returns {Validator} This instance for chaining
   */
  reset(scope = 'all') {
    this.errorBag.clear();
    this.formManager.resetForm(scope);
    // notifyListeners() is called by both errorBag.clear() and formManager.resetForm() - no need to call again
    return this;
  }

  /**
   * Subscribe to changes (for reactive integrations)
   * @param {Function} listener - Change listener
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners (internal)
   * @private
   * @returns {void}
   */
  notifyListeners() {
    // Skip notifications during initialization to prevent loops
    if (this.isInitializing) return;
    
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.warn('Validator listener error:', error);
      }
    });
  }

  /**
   * Get a snapshot state object with commonly used helpers and data
   * @param {string} [scope='default'] - Optional form scope
   * @returns {Object} Complete validator state and bound helper methods
   */
  getState(scope = 'default') {
    return {
      // Validation state
      isValid: this.isValid(),
      hasErrors: this.hasErrors(),
      
      // Form data
      ...this.formManager.getState(scope),
      
      // Rules
      ...this.ruleManager.getState(scope),
      
      // Errors
      ...this.errorBag.getState(),
      
      // I18n
      ...this.i18nManager.getState(),
      
      // Methods
      validate: () => this.validate(scope),
      validateField: (field) => this.validateField(field, scope),
      setRules: (field, rules) => this.setRules(field, rules, scope),
      setMultipleRules: (rulesObject) => this.setMultipleRules(rulesObject, scope),
      setData: (data) => this.setData(data, scope),
      setValue: (field, value) => this.setValue(field, value, scope),
      getValue: (field) => this.getValue(field, scope),
      getData: () => this.getData(scope),
      setFieldLabel: (field, label) => this.setFieldLabel(field, label, scope),
      reset: () => this.reset(scope)
    };
  }
}
