/**
 * Base Rule class that all validation rules must extend
 * Provides a consistent interface for validation logic
 */
export class Rule {
  constructor(params = {}) {
    this.params = params;
  }

  /**
   * Validate a value against this rule
   * @param {any} value - The value to validate
   * @param {string} field - The field name being validated
   * @param {Object} allValues - All form values for cross-field validation
   * @returns {boolean|Promise<boolean>} True if valid, false if invalid
   */
  validate(value, field, allValues) {
    throw new Error('Rule must implement validate method');
  }

  /**
   * Get the rule name for i18n message lookup
   * @returns {string} The rule name
   */
  getRuleName() {
    return this.constructor.name.replace('Rule', '').toLowerCase();
  }

  /**
   * Check if this rule should be applied (useful for conditional validation)
   * @param {any} value - The value to validate
   * @param {string} field - The field name
   * @param {Object} allValues - All form values
   * @returns {boolean} True if rule should be applied
   */
  shouldApply(value, field, allValues) {
    return true;
  }
}
