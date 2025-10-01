/**
 * English validation messages
 * All messages support parameter substitution with {field}, {min}, {max}, etc.
 */
export default {
  // ============================================
  // Basic Rules
  // ============================================
  required: 'The {field} field is required.',
  email: 'The {field} field must be a valid email address.',
  confirmed: 'The {field} field confirmation does not match.',
  
  // ============================================
  // Size/Length Rules
  // ============================================
  min: 'The {field} field must be at least {min} characters.',
  max: 'The {field} field may not be greater than {max} characters.',
  between: 'The {field} field must be between {min} and {max}.',
  
  // ============================================
  // Numeric Rules
  // ============================================
  numeric: 'The {field} field must be a number.',
  integer: 'The {field} field must be an integer.',
  decimal: 'The {field} field must be a valid decimal number.',
  minValue: 'The {field} field must be at least {minValue}.',
  maxValue: 'The {field} field may not be greater than {maxValue}.',
  
  // ============================================
  // Format Rules
  // ============================================
  pattern: 'The {field} field format is invalid.',
  alpha: 'The {field} field may only contain letters.',
  digits: 'The {field} field must be {length} digits.',
  url: 'The {field} field must be a valid URL.'
};
