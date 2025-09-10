import { Rule } from './Rule.js';

/**
 * Required rule - checks if value exists and is not empty
 * Automatically trims strings before validation to ignore whitespace-only values
 */
export class RequiredRule extends Rule {
  validate(value, field, allValues) {
    if (value === null || value === undefined) {
      return false;
    }
    
    // Trim strings before validation to ignore whitespace-only values
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    
    // For arrays, check if they have elements
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    // For objects, check if they have properties
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    
    return true;
  }
}
