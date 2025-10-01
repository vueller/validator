/**
 * RequiredRule - Validates that a field is not empty
 */

import { BaseRule } from './base-rule.js';

export class RequiredRule extends BaseRule {
  validate(value) {
    // Check for null, undefined, empty string, empty array, empty object
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }

    return true;
  }
}
