/**
 * Validation helpers - Utility functions for common validation patterns
 */

/**
 * Quick validation functions for common use cases
 */
export const validate = {
  /**
   * Validate email
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  email: (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate required field
   * @param {any} value - Value to validate
   * @returns {boolean} True if valid
   */
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  },

  /**
   * Validate minimum length
   * @param {string|Array} value - Value to validate
   * @param {number} min - Minimum length
   * @returns {boolean} True if valid
   */
  minLength: (value, min) => {
    if (!value) return true; // Let required handle empty values
    return value.length >= min;
  },

  /**
   * Validate maximum length
   * @param {string|Array} value - Value to validate
   * @param {number} max - Maximum length
   * @returns {boolean} True if valid
   */
  maxLength: (value, max) => {
    if (!value) return true; // Let required handle empty values
    return value.length <= max;
  },

  /**
   * Validate numeric value
   * @param {any} value - Value to validate
   * @returns {boolean} True if valid
   */
  numeric: (value) => {
    if (value === null || value === undefined || value === '') return true;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  },

  /**
   * Validate minimum value
   * @param {any} value - Value to validate
   * @param {number} min - Minimum value
   * @returns {boolean} True if valid
   */
  minValue: (value, min) => {
    if (value === null || value === undefined || value === '') return true;
    const num = Number(value);
    return !isNaN(num) && num >= min;
  },

  /**
   * Validate maximum value
   * @param {any} value - Value to validate
   * @param {number} max - Maximum value
   * @returns {boolean} True if valid
   */
  maxValue: (value, max) => {
    if (value === null || value === undefined || value === '') return true;
    const num = Number(value);
    return !isNaN(num) && num <= max;
  },

  /**
   * Validate against regex pattern
   * @param {string} value - Value to validate
   * @param {string|RegExp} pattern - Pattern to match
   * @returns {boolean} True if valid
   */
  pattern: (value, pattern) => {
    if (!value || typeof value !== 'string') return true;
    try {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      return regex.test(value);
    } catch {
      return false;
    }
  },

  /**
   * Validate field confirmation
   * @param {any} value - Value to validate
   * @param {any} confirmValue - Confirmation value
   * @returns {boolean} True if valid
   */
  confirmed: (value, confirmValue) => {
    return value === confirmValue;
  }
};

/**
 * Create validation rules object from simple format
 * @param {Object} rules - Rules in simple format
 * @returns {Object} Standard rules object
 */
export function createRules(rules) {
  const standardRules = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    if (typeof fieldRules === 'string') {
      // Parse string format: "required|email|min:5"
      standardRules[field] = fieldRules.split('|').map(rule => {
        if (rule.includes(':')) {
          const [name, value] = rule.split(':');
          return { [name]: value };
        }
        return rule;
      });
    } else if (Array.isArray(fieldRules)) {
      standardRules[field] = fieldRules;
    } else {
      standardRules[field] = fieldRules;
    }
  }

  return standardRules;
}

/**
 * Validate data against rules
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules
 * @returns {Promise<Object>} Validation result
 */
export async function validateData(data, rules) {
  const errors = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of Array.isArray(fieldRules) ? fieldRules : [fieldRules]) {
      let ruleResult = true;
      let ruleName = 'validation';

      if (typeof rule === 'string') {
        ruleName = rule;
        ruleResult = validate[rule] ? validate[rule](value) : true;
      } else if (typeof rule === 'object') {
        const [ruleKey, ruleValue] = Object.entries(rule)[0];
        ruleName = ruleKey;
        ruleResult = validate[ruleKey] ? validate[ruleKey](value, ruleValue) : true;
      }

      if (!ruleResult) {
        if (!errors[field]) errors[field] = [];
        errors[field].push(`${field} is invalid`);
        isValid = false;
        break; // Stop on first error
      }
    }
  }

  return {
    isValid,
    errors,
    hasErrors: !isValid
  };
}

/**
 * Common validation patterns
 */
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+\.?\d*$/,
  slug: /^[a-z0-9\-]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};
