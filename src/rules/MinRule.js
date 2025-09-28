import { Rule } from './Rule.js';
import { validateMin } from '../utils/index.js';

/**
 * Min rule - checks minimum string length or number value
 * Uses centralized validation logic for consistency
 */
export class MinRule extends Rule {
  constructor(minValue) {
    super({ min: minValue });
  }

  validate(value, field, allValues) {
    return validateMin(value, this.params.min);
  }
}
