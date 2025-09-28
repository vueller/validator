import { isEmpty, isString } from '../utils/index.js';

/**
 * ErrorBag class for storing and manipulating validation errors
 * Framework-agnostic implementation that works with both JavaScript and Vue
 * Provides reactive-like behavior without Vue dependency
 */
export class ErrorBag {
  constructor() {
    // Internal state for errors
    this.errors = new Map();
    this.listeners = new Set();
    // Flag to track if manual error display is being used
    this.usingManualErrors = false;
  }

  /**
   * Add an error for a specific field
   * @param {string} field - The field name
   * @param {string} message - The error message
   */
  add(field, message) {
    if (!isString(field) || isEmpty(message)) {
      return; // Ignore invalid inputs
    }

    if (!this.errors.has(field)) {
      this.errors.set(field, []);
    }
    
    this.errors.get(field).push(message);
    this.notifyListeners();
  }

  /**
   * Remove all errors for a specific field
   * @param {string} field - The field name
   */
  remove(field) {
    if (!isString(field)) {
      return; // Ignore invalid inputs
    }

    this.errors.delete(field);
    this.notifyListeners();
  }

  /**
   * Get all errors for a specific field
   * @param {string} field - The field name
   * @returns {string[]} Array of error messages
   */
  get(field) {
    return this.errors.get(field) || [];
  }

  /**
   * Get the first error for a specific field
   * @param {string} field - The field name
   * @returns {string|null} First error message or null
   */
  first(field) {
    this.usingManualErrors = true; // Mark that manual error display is being used
    const fieldErrors = this.errors.get(field) || [];
    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  }

  /**
   * Check if a field has any errors
   * @param {string} field - The field name
   * @returns {boolean} True if field has errors
   */
  has(field) {
    return this.errors.has(field) && this.errors.get(field).length > 0;
  }

  /**
   * Get all errors as a flat array
   * @returns {string[]} Array of all error messages
   */
  all() {
    const allErrors = [];
    for (const fieldErrors of this.errors.values()) {
      allErrors.push(...fieldErrors);
    }
    return allErrors;
  }

  /**
   * Get all errors grouped by field
   * @returns {Object} Object with field names as keys and error arrays as values
   */
  allByField() {
    const result = {};
    for (const [field, fieldErrors] of this.errors.entries()) {
      if (fieldErrors.length > 0) {
        result[field] = [...fieldErrors];
      }
    }
    return result;
  }

  /**
   * Clear all errors
   */
  clear() {
    this.errors.clear();
    this.notifyListeners();
  }

  /**
   * Check if there are any errors
   * @returns {boolean} True if there are any errors
   */
  any() {
    return this.errors.size > 0;
  }

  /**
   * Get the total count of errors
   * @returns {number} Total number of errors
   */
  count() {
    let total = 0;
    for (const fieldErrors of this.errors.values()) {
      total += fieldErrors.length;
    }
    return total;
  }

  /**
   * Get all field names that have errors
   * @returns {string[]} Array of field names
   */
  keys() {
    return Array.from(this.errors.keys()).filter(field => 
      this.errors.get(field).length > 0
    );
  }

  /**
   * Check if manual error display is being used
   * @returns {boolean} True if manual error display is being used
   */
  isUsingManualErrors() {
    return this.usingManualErrors;
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
   * @returns {Object} Object with reactive computed properties
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
      errors: computed(() => this.allByField()),
      
      // Direct methods - will be reactive through computed
      has: this.has.bind(this),
      first: this.first.bind(this),
      get: this.get.bind(this),
      any: computed(() => this.any()),
      count: computed(() => this.count()),
      keys: computed(() => this.keys()),
      clear: this.clear.bind(this)
    };
  }

  /**
   * Create plain JavaScript state
   * @returns {Object} Plain state object
   */
  createPlainState() {
    return {
      errors: this.allByField(),
      
      // Direct methods
      has: this.has.bind(this),
      first: this.first.bind(this),
      get: this.get.bind(this),
      any: this.any.bind(this),
      count: this.count.bind(this),
      keys: this.keys.bind(this),
      clear: this.clear.bind(this)
    };
  }
}