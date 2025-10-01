/**
 * BetweenRule - Validates value is between min and max
 */

import { BaseRule } from './base-rule.js';

export class BetweenRule extends BaseRule {
  validate(value) {
    const min = this.getParam('min', this.params?.min);
    const max = this.getParam('max', this.params?.max);

    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    if (typeof value === 'string' || Array.isArray(value)) {
      const length = value.length;
      return length >= min && length <= max;
    }

    const num = Number(value);
    if (isNaN(num)) {
      return false;
    }

    return num >= min && num <= max;
  }
}

