/**
 * AlphaRule - Validates that value contains only letters
 */

import { BaseRule } from './base-rule.js';

export class AlphaRule extends BaseRule {
  validate(value) {
    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    const alphaRegex = /^[a-zA-Z]+$/;
    return alphaRegex.test(String(value));
  }
}

