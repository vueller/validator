import { Rule } from './Rule.js';

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
}
