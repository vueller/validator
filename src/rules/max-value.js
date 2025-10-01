/**
 * MaxValueRule - Validates maximum numeric value
 */

import { BaseRule } from './base-rule.js';

export class MaxValueRule extends BaseRule {
  validate(value) {
    const max = this.getParam('max', this.params);
    
    if (value === null || value === undefined || value === '') {
      return false; // Let required rule handle empty values
    }

    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      return false;
    }

    return num <= max;
  }
}
