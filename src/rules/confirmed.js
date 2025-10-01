/**
 * ConfirmedRule - Validates field confirmation
 */

import { BaseRule } from './base-rule.js';

export class ConfirmedRule extends BaseRule {
  validate(value, field, allValues) {
    // Let required rule handle empty values
    if (value === null || value === undefined || value === '') {
      return true;
    }

    // If params contains the original field name, use it
    const originalField = this.params || `${field.replace('_confirmation', '')}`;
    const originalValue = allValues[originalField];
    
    return value === originalValue;
  }
}
