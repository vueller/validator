/**
 * MaxRule - Validates maximum length
 */

import { BaseRule } from './base-rule.js';

export class MaxRule extends BaseRule {
  validate(value) {
    const max = this.getParam('max', this.params);
    
    // Let required rule handle empty values
    if (value === null || value === undefined || value === '') {
      return true;
    }

    // Validate length for strings and arrays
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length <= max;
    }

    // Invalid type
    return false;
  }
}
