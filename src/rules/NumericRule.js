import { Rule } from './Rule.js';

/**
 * Numeric rule - validates numeric values
 */
export class NumericRule extends Rule {
  validate(value, field, allValues) {
    if (!value) return true; // Let required rule handle empty values
    
    return !isNaN(value) && !isNaN(parseFloat(value));
  }
}
