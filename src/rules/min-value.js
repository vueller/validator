/**
 * MinValueRule - Validates minimum numeric value
 */

import { BaseRule } from './base-rule.js';

export class MinValueRule extends BaseRule {
  validate(value) {
    const min = this.getParam('min', this.params);
    
    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      return false;
    }

    return num >= min;
  }
}
