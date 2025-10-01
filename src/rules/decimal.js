/**
 * DecimalRule - Validates decimal numbers
 */

import { BaseRule } from './base-rule.js';

export class DecimalRule extends BaseRule {
  validate(value) {
    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    const decimalRegex = /^-?\d*\.?\d+$/;
    return decimalRegex.test(String(value));
  }
}

