import { reactive, computed } from 'vue';

/**
 * ErrorBag class for storing and manipulating validation errors
 * Provides real-time updates and Vue 3 reactivity for seamless UI integration
 */
export class ErrorBag {
  constructor() {
    // Reactive state for errors
    this.state = reactive({
      errors: new Map()
    });
  }

  /**
   * Add an error for a specific field
   * @param {string} field - The field name
   * @param {string} message - The error message
   */
  add(field, message) {
    if (!this.state.errors.has(field)) {
      this.state.errors.set(field, []);
    }
    this.state.errors.get(field).push(message);
    
    // Trigger reactivity by creating new Map
    this.state.errors = new Map(this.state.errors);
  }

  /**
   * Remove all errors for a specific field
   * @param {string} field - The field name
   */
  remove(field) {
    this.state.errors.delete(field);
    
    // Trigger reactivity by creating new Map
    this.state.errors = new Map(this.state.errors);
  }

  /**
   * Get all errors for a specific field (reactive)
   * @param {string} field - The field name
   * @returns {ComputedRef<string[]>} Reactive array of error messages
   */
  get(field) {
    return computed(() => {
      return this.state.errors.get(field) || [];
    });
  }

  /**
   * Get all errors for a specific field (non-reactive)
   * @param {string} field - The field name
   * @returns {string[]} Array of error messages
   */
  getStatic(field) {
    return this.state.errors.get(field) || [];
  }

  /**
   * Get the first error for a specific field (reactive)
   * @param {string} field - The field name
   * @returns {ComputedRef<string|null>} Reactive first error message or null
   */
  first(field) {
    return computed(() => {
      const fieldErrors = this.state.errors.get(field) || [];
      return fieldErrors.length > 0 ? fieldErrors[0] : null;
    });
  }

  /**
   * Get the first error for a specific field (non-reactive)
   * @param {string} field - The field name
   * @returns {string|null} First error message or null
   */
  firstStatic(field) {
    const fieldErrors = this.state.errors.get(field) || [];
    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  }

  /**
   * Check if a field has any errors (reactive)
   * @param {string} field - The field name
   * @returns {ComputedRef<boolean>} Reactive boolean indicating if field has errors
   */
  has(field) {
    return computed(() => {
      return this.state.errors.has(field) && this.state.errors.get(field).length > 0;
    });
  }

  /**
   * Check if a field has any errors (non-reactive)
   * @param {string} field - The field name
   * @returns {boolean} True if field has errors
   */
  hasStatic(field) {
    return this.state.errors.has(field) && this.state.errors.get(field).length > 0;
  }

  /**
   * Get all errors as a flat array (reactive)
   * @returns {ComputedRef<string[]>} Reactive array of all error messages
   */
  all() {
    return computed(() => {
      const allErrors = [];
      for (const fieldErrors of this.state.errors.values()) {
        allErrors.push(...fieldErrors);
      }
      return allErrors;
    });
  }

  /**
   * Get all errors as a flat array (non-reactive)
   * @returns {string[]} Array of all error messages
   */
  allStatic() {
    const allErrors = [];
    for (const fieldErrors of this.state.errors.values()) {
      allErrors.push(...fieldErrors);
    }
    return allErrors;
  }

  /**
   * Get all errors grouped by field (reactive)
   * @returns {ComputedRef<Object>} Reactive object with field names as keys and error arrays as values
   */
  allByField() {
    return computed(() => {
      const result = {};
      for (const [field, fieldErrors] of this.state.errors.entries()) {
        result[field] = [...fieldErrors];
      }
      return result;
    });
  }

  /**
   * Get all errors grouped by field (non-reactive)
   * @returns {Object} Object with field names as keys and error arrays as values
   */
  allByFieldStatic() {
    const result = {};
    for (const [field, fieldErrors] of this.state.errors.entries()) {
      result[field] = [...fieldErrors];
    }
    return result;
  }

  /**
   * Clear all errors
   */
  clear() {
    this.state.errors.clear();
    
    // Trigger reactivity by creating new Map
    this.state.errors = new Map(this.state.errors);
  }

  /**
   * Check if there are any errors (reactive)
   * @returns {ComputedRef<boolean>} Reactive boolean indicating if there are any errors
   */
  any() {
    return computed(() => {
      return this.state.errors.size > 0;
    });
  }

  /**
   * Check if there are any errors (non-reactive)
   * @returns {boolean} True if there are any errors
   */
  anyStatic() {
    return this.state.errors.size > 0;
  }

  /**
   * Get the total count of errors (reactive)
   * @returns {ComputedRef<number>} Reactive total number of errors
   */
  count() {
    return computed(() => {
      let total = 0;
      for (const fieldErrors of this.state.errors.values()) {
        total += fieldErrors.length;
      }
      return total;
    });
  }

  /**
   * Get the total count of errors (non-reactive)
   * @returns {number} Total number of errors
   */
  countStatic() {
    let total = 0;
    for (const fieldErrors of this.state.errors.values()) {
      total += fieldErrors.length;
    }
    return total;
  }

  /**
   * Get all field names that have errors (reactive)
   * @returns {ComputedRef<string[]>} Reactive array of field names
   */
  keys() {
    return computed(() => {
      return Array.from(this.state.errors.keys());
    });
  }

  /**
   * Get all field names that have errors (non-reactive)
   * @returns {string[]} Array of field names
   */
  keysStatic() {
    return Array.from(this.state.errors.keys());
  }

  /**
   * Get reactive state for Vue components
   * @returns {Object} Object with reactive computed properties
   */
  getReactiveState() {
    return {
      errors: this.allByField(),
      hasErrors: this.any(),
      errorCount: this.count(),
      errorKeys: this.keys(),
      
      // Helper methods
      hasError: (field) => this.has(field),
      getError: (field) => this.first(field),
      getErrors: (field) => this.get(field),
      
      // Non-reactive methods for performance when reactivity is not needed
      hasErrorStatic: (field) => this.hasStatic(field),
      getErrorStatic: (field) => this.firstStatic(field),
      getErrorsStatic: (field) => this.getStatic(field)
    };
  }
}
