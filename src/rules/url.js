/**
 * UrlRule - Validates URL format
 */

import { BaseRule } from './base-rule.js';

export class UrlRule extends BaseRule {
  validate(value) {
    if (value === null || value === undefined || value === '') {
      return true; // Let required rule handle empty values
    }

    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    return urlRegex.test(String(value));
  }
}

