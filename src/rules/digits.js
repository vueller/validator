/**
 * DigitsRule - Validates exact number of digits
 */

import { BaseRule } from './base-rule.js';

export class DigitsRule extends BaseRule {
  validate(value) {
    const length = this.getParam('length', this.params);

    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    const digitsRegex = /^\d+$/;
    const strValue = String(value);
    
    return digitsRegex.test(strValue) && strValue.length === length;
  }
}

