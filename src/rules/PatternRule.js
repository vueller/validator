import { Rule } from './Rule.js';

/**
 * Pattern rule - validates against a regular expression
 */
export class PatternRule extends Rule {
  constructor(pattern, flags = '') {
    super({ pattern: new RegExp(pattern, flags) });
  }

  validate(value, field, allValues) {
    if (!value) return true; // Let required rule handle empty values
    
    return this.params.pattern.test(value);
  }
}
