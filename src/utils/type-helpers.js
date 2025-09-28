/**
 * Type checking utilities
 * Centralized type validation helpers for the entire project
 */

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Check if value is a valid number (including string numbers)
 * @param {any} value - Value to check
 * @returns {boolean} True if value is numeric
 */
export function isNumeric(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  
  return !isNaN(value) && !isNaN(parseFloat(value));
}

/**
 * Check if value is a valid email format
 * @param {any} value - Value to check
 * @returns {boolean} True if value is valid email
 */
export function isEmail(value) {
  if (typeof value !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Check if value is a string
 * @param {any} value - Value to check
 * @returns {boolean} True if value is string
 */
export function isString(value) {
  return typeof value === 'string';
}

/**
 * Check if value is a number
 * @param {any} value - Value to check
 * @returns {boolean} True if value is number
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if value is a boolean
 * @param {any} value - Value to check
 * @returns {boolean} True if value is boolean
 */
export function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Check if value is an object (not array, not null)
 * @param {any} value - Value to check
 * @returns {boolean} True if value is object
 */
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if value is an array
 * @param {any} value - Value to check
 * @returns {boolean} True if value is array
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 * Check if value is a function
 * @param {any} value - Value to check
 * @returns {boolean} True if value is function
 */
export function isFunction(value) {
  return typeof value === 'function';
}

/**
 * Get the length of a value (string, array, or object keys)
 * @param {any} value - Value to get length of
 * @returns {number} Length of the value
 */
export function getLength(value) {
  if (isString(value) || isArray(value)) {
    return value.length;
  }
  
  if (isObject(value)) {
    return Object.keys(value).length;
  }
  
  if (isNumber(value)) {
    return value.toString().length;
  }
  
  return 0;
}
