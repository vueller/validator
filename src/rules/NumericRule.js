import { Rule } from './Rule.js';
import { validateNumeric } from '../utils/index.js';

/**
 * Numeric rule - validates numeric values
 * Uses centralized validation logic for consistency
 */
export class NumericRule extends Rule {
  validate(value, field, allValues) {
    return validateNumeric(value);
  }
}
