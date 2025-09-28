import { Rule } from './Rule.js';
import { validateRequired } from '../utils/index.js';

/**
 * Required rule - checks if value exists and is not empty
 * Uses centralized validation logic for consistency
 */
export class RequiredRule extends Rule {
  validate(value, field, allValues) {
    return validateRequired(value);
  }
}