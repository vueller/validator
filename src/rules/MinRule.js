import { Rule } from './Rule.js';

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
}
