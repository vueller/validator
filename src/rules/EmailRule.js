import { Rule } from './Rule.js';

/**
 * Email rule - validates email format
 */
export class EmailRule extends Rule {
  validate(value, field, allValues) {
    if (!value) return true; // Let required rule handle empty values
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}
