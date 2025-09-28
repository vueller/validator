import { Rule } from './Rule.js';
import { validateEmail } from '../utils/index.js';

/**
 * Email rule - validates email format
 * Uses centralized validation logic for consistency
 */
export class EmailRule extends Rule {
  validate(value, field, allValues) {
    return validateEmail(value);
  }
}