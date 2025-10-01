/**
 * MinRule - Validates minimum length
 */

import { BaseRule } from './base-rule.js';

export class MinRule extends BaseRule {
  validate(value) {
    const min = this.getParam('min', this.params);

    // Validate length for strings and arrays
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length >= min;
    }

    // Invalid type
    return false;
  }
}

