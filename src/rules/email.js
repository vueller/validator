/**
 * EmailRule - Validates email format
 */

import { BaseRule } from './base-rule.js';

export class EmailRule extends BaseRule {
  validate(value) {
    if (typeof value !== 'string') {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}
