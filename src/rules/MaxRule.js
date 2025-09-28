import { Rule } from './Rule.js';
import { validateMax } from '../utils/index.js';

/**
 * Max rule - checks maximum string length or number value
 * Uses centralized validation logic for consistency
 */
export class MaxRule extends Rule {
  constructor(maxValue) {
    super({ max: maxValue });
  }

  validate(value, field, allValues) {
    return validateMax(value, this.params.max);
  }
}