/**
 * English validation messages
 * All messages support parameter substitution with {field}, {min}, {max}, etc.
 */
export default {
  required: 'The {field} field is required.',
  min: 'The {field} field must be at least {min} characters.',
  max: 'The {field} field must not exceed {max} characters.',
  email: 'The {field} field must be a valid email address.',
  numeric: 'The {field} field must be a number.',
  pattern: 'The {field} field format is invalid.',
  confirmed: 'The {field} field confirmation does not match.',

  // Additional common validation messages
  alpha: 'The {field} field may only contain letters.',
  alphaNum: 'The {field} field may only contain letters and numbers.',
  alphaSpaces: 'The {field} field may only contain letters and spaces.',
  alphaDash: 'The {field} field may only contain letters, numbers, dashes and underscores.',
  between: 'The {field} field must be between {min} and {max}.',
  decimal: 'The {field} field must be a valid decimal number.',
  digits: 'The {field} field must be {length} digits.',
  dimensions: 'The {field} field must have valid dimensions.',
  excluded: 'The {field} field must be excluded.',
  ext: 'The {field} field must be a valid file.',
  image: 'The {field} field must be an image.',
  included: 'The {field} field must be a valid value.',
  integer: 'The {field} field must be an integer.',
  ip: 'The {field} field must be a valid IP address.',
  json: 'The {field} field must be a valid JSON string.',
  length: 'The {field} field must be {length} characters long.',
  mimes: 'The {field} field must be a valid file type.',
  oneOf: 'The {field} field must be one of the following values: {list}.',
  regex: 'The {field} field format is invalid.',
  size: 'The {field} field size must be less than {size}KB.',
  url: 'The {field} field must be a valid URL.'
};
