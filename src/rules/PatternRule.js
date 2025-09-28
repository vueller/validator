import { Rule } from './Rule.js';
import { validatePattern } from '../utils/index.js';

/**
 * Pattern rule - validates against a regular expression
 * Uses centralized validation logic for consistency
 */
export class PatternRule extends Rule {
  constructor(pattern, flags = '') {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, flags);
    super({ pattern: regex });
  }

  validate(value, field, allValues) {
    return validatePattern(value, this.params.pattern);
  }
}
