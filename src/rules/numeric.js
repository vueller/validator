/**
 * NumericRule - Validates numeric values
 */

import { BaseRule } from './base-rule.js';

export class NumericRule extends BaseRule {
  validate(value) {
    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    // Check if it's already a number
    if (typeof value === 'number') {
      return !isNaN(value) && isFinite(value);
    }

    // Check if it's a numeric string
    if (typeof value === 'string') {
      const num = Number(value);
      return !isNaN(num) && isFinite(num);
    }

    return false;
  }
}
