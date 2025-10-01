/**
 * ErrorBag
 *
 * Stores validation errors per field and provides helpers to query them.
 * Notifies subscribers on changes so UI layers can reactively update.
 *
 * Error shape: `{ message: string, rule: string }`.
 */
export class ErrorBag {
  constructor() {
    this.errors = new Map(); // Map<field, Array<Error>>
    this.listeners = new Set();
  }

  /**
   * Add an error for a specific field
   * @param {string} field - The field name
   * @param {string} message - The error message
   * @param {string} [ruleName='validation'] - The rule name that caused the error
   */
  add(field, message, ruleName = 'validation') {
    if (!field || !message) return;

    if (!this.errors.has(field)) {
      this.errors.set(field, []);
    }
    
    const fieldErrors = this.errors.get(field);
    
    // If it's a required error, add at the beginning (highest priority)
    if (ruleName === 'required') {
      fieldErrors.unshift({ message, rule: ruleName });
    } else {
      // Add other errors at the end
      fieldErrors.push({ message, rule: ruleName });
    }
    
    this.notifyListeners();
  }

  /**
   * Remove all errors for a specific field
   * @param {string} field - The field name
   */
  remove(field) {
    if (!field) return;
    
    this.errors.delete(field);
    this.notifyListeners();
  }

  /**
   * Get all errors for a specific field
   * @param {string} field - The field name
   * @returns {Array<{message: string, rule: string}>} Array of error objects
   */
  get(field) {
    return this.errors.get(field) || [];
  }

  /**
   * Get the first error message for a specific field
   * @param {string} field - The field name
   * @returns {string|null} First error message or null
   */
  first(field) {
    const fieldErrors = this.get(field);
    return fieldErrors.length > 0 ? fieldErrors[0].message : null;
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
   * Get all errors grouped by field
   * @returns {Record<string, string[]>} Map of field -> error messages
   */
  allByField() {
    const result = {};
    for (const [field, fieldErrors] of this.errors.entries()) {
      if (fieldErrors.length > 0) {
        result[field] = fieldErrors.map(error => error.message);
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
   * Get all field names that have errors
   * @returns {string[]} Array of field names
   */
  keys() {
    return Array.from(this.errors.keys()).filter(field => 
      this.errors.get(field).length > 0
    );
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
   * Get state for reactive frameworks
   * @returns {Object} State object
   */
  getState() {
    return {
      errors: this.allByField(),
      hasErrors: this.any(),
      fieldsWithErrors: this.keys(),
      
      // Methods
      has: this.has.bind(this),
      first: this.first.bind(this),
      get: this.get.bind(this),
      any: this.any.bind(this),
      keys: this.keys.bind(this),
      clear: this.clear.bind(this),
      add: this.add.bind(this),
      remove: this.remove.bind(this)
    };
  }
}