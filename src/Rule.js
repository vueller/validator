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
   * Get the error message for this rule
   * @param {string} field - The field name
   * @param {any} value - The value that failed validation
   * @returns {string} The error message
   */
  getMessage(field, value) {
    throw new Error('Rule must implement getMessage method');
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

/**
 * Required rule - checks if value exists and is not empty
 */
export class RequiredRule extends Rule {
  validate(value, field, allValues) {
    if (value === null || value === undefined) {
      return false;
    }
    
    // Trim strings before validation to ignore whitespace-only values
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    
    // For arrays, check if they have elements
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    // For objects, check if they have properties
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    
    return true;
  }

  getMessage(field, value) {
    return `The {field} field is required.`;
  }
}

/**
 * Min length rule - checks minimum string length or number value
 */
export class MinRule extends Rule {
  constructor(minValue) {
    super({ min: minValue });
  }

  validate(value, field, allValues) {
    if (value === null || value === undefined) {
      return true; // Let required rule handle empty values
    }

    if (typeof value === 'string') {
      return value.length >= this.params.min;
    }

    if (typeof value === 'number') {
      return value >= this.params.min;
    }

    if (Array.isArray(value)) {
      return value.length >= this.params.min;
    }

    return false;
  }

  getMessage(field, value) {
    return `The {field} field must be at least {min} characters.`;
  }
}

/**
 * Max length rule - checks maximum string length or number value
 */
export class MaxRule extends Rule {
  constructor(maxValue) {
    super({ max: maxValue });
  }

  validate(value, field, allValues) {
    if (value === null || value === undefined) {
      return true; // Let required rule handle empty values
    }

    if (typeof value === 'string') {
      return value.length <= this.params.max;
    }

    if (typeof value === 'number') {
      return value <= this.params.max;
    }

    if (Array.isArray(value)) {
      return value.length <= this.params.max;
    }

    return false;
  }

  getMessage(field, value) {
    return `The {field} field must not exceed {max} characters.`;
  }
}

/**
 * Email rule - validates email format
 */
export class EmailRule extends Rule {
  validate(value, field, allValues) {
    if (!value) return true; // Let required rule handle empty values
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  getMessage(field, value) {
    return `The {field} field must be a valid email address.`;
  }
}

/**
 * Numeric rule - validates numeric values
 */
export class NumericRule extends Rule {
  validate(value, field, allValues) {
    if (!value) return true; // Let required rule handle empty values
    
    return !isNaN(value) && !isNaN(parseFloat(value));
  }

  getMessage(field, value) {
    return `The {field} field must be a number.`;
  }
}

/**
 * Pattern rule - validates against a regular expression
 */
export class PatternRule extends Rule {
  constructor(pattern, flags = '') {
    super({ pattern: new RegExp(pattern, flags) });
  }

  validate(value, field, allValues) {
    if (!value) return true; // Let required rule handle empty values
    
    return this.params.pattern.test(value);
  }

  getMessage(field, value) {
    return `The {field} field format is invalid.`;
  }
}

/**
 * Confirmed rule - validates that two fields match
 */
export class ConfirmedRule extends Rule {
  constructor(targetField) {
    super({ targetField });
  }

  validate(value, field, allValues) {
    const targetValue = allValues[this.params.targetField];
    return value === targetValue;
  }

  getMessage(field, value) {
    return `The {field} field confirmation does not match.`;
  }
}
