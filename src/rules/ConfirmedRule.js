import { Rule } from './Rule.js';

/**
 * Confirmed rule - validates that two fields match
 */
export class ConfirmedRule extends Rule {
  constructor(targetField) {
    super({ targetField });
  }

  validate(value, field, allValues) {
    const targetValue = allValues[this.params.targetField];
    return value === targetValue;
  }
}
