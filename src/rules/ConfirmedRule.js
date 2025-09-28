import { Rule } from './Rule.js';
import { validateConfirmed } from '../utils/index.js';

/**
 * Confirmed rule - validates that two fields match
 * Uses centralized validation logic for consistency
 */
export class ConfirmedRule extends Rule {
  constructor(targetField) {
    super({ targetField });
  }

  validate(value, field, allValues) {
    return validateConfirmed(value, this.params.targetField, allValues);
  }
}