/**
 * BaseRule - Simplified base class for validation rules
 * Provides a clean, consistent interface for all validation rules
 */

export class BaseRule {
  constructor(params = null) {
    this.params = params;
  }

  /**
   * Validate a value against this rule
   * @param {any} value - The value to validate
   * @param {string} field - The field name being validated
   * @param {Object} allValues - All form values for cross-field validation
   * @returns {boolean|Promise<boolean>} True if valid, false if invalid
   */
  validate(value, field, allValues = {}) {
    throw new Error(`${this.constructor.name} must implement validate method`);
  }

  /**
   * Get the rule name for i18n message lookup
   * @returns {string} The rule name
   */
  getRuleName() {
    // Convert class name to rule name (e.g., RequiredRule -> required)
    return this.constructor.name
      .replace(/Rule$/, '')
      .replace(/([A-Z])/g, (match, letter, index) => 
        index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`
      );
  }

  /**
   * Check if this rule should be applied
   * @param {any} value - The value to validate
   * @returns {boolean} True if rule should be applied
   */
  shouldApply(value) {
    return true;
  }

  /**
   * Get parameter value with fallback
   * @param {string} key - Parameter key
   * @param {any} fallback - Fallback value
   * @returns {any} Parameter value or fallback
   */
  getParam(key, fallback = null) {
    if (this.params === null) return fallback;
    
    if (typeof this.params === 'object') {
      return this.params[key] !== undefined ? this.params[key] : fallback;
    }
    
    return this.params;
  }
}
