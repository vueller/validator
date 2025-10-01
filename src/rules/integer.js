/**
 * IntegerRule - Validates integer numbers
 */

import { BaseRule } from './base-rule.js';

export class IntegerRule extends BaseRule {
  validate(value) {
    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    const num = Number(value);
    return Number.isInteger(num);
  }
}

