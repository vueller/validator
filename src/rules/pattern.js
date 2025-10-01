/**
 * PatternRule - Validates against regex pattern
 */

import { BaseRule } from './base-rule.js';

export class PatternRule extends BaseRule {
  validate(value) {
    const pattern = this.getParam('pattern', this.params);
    
    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    if (typeof value !== 'string') {
      return false;
    }

    try {
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch (error) {
      console.warn(`Invalid regex pattern: ${pattern}`);
      return false;
    }
  }
}
