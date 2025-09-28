/**
 * Validation utilities
 * Centralized validation helpers for the entire project
 */

import { isEmpty, isNumeric, getLength } from './type-helpers.js';
import { trimString } from './string-helpers.js';

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export function validateRequired(value) {
  // Trim strings before checking if empty
  const trimmedValue = trimString(value);
  return !isEmpty(trimmedValue);
}

/**
 * Validate minimum length/value
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value/length
 * @returns {boolean} True if value meets minimum requirement
 */
export function validateMin(value, min) {
  if (isEmpty(value)) return true; // Let required rule handle empty values
  
  if (isNumeric(value)) {
    return parseFloat(value) >= min;
  }
  
  return getLength(value) >= min;
}

/**
 * Validate maximum length/value
 * @param {any} value - Value to validate
 * @param {number} max - Maximum value/length
 * @returns {boolean} True if value meets maximum requirement
 */
export function validateMax(value, max) {
  if (isEmpty(value)) return true; // Let required rule handle empty values
  
  if (isNumeric(value)) {
    return parseFloat(value) <= max;
  }
  
  return getLength(value) <= max;
}

/**
 * Validate numeric value
 * @param {any} value - Value to validate
 * @returns {boolean} True if value is numeric
 */
export function validateNumeric(value) {
  if (isEmpty(value)) return true; // Let required rule handle empty values
  return isNumeric(value);
}

/**
 * Validate email format
 * @param {any} value - Value to validate
 * @returns {boolean} True if value is valid email
 */
export function validateEmail(value) {
  if (isEmpty(value)) return true; // Let required rule handle empty values
  
  if (typeof value !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
}

/**
 * Validate pattern match
 * @param {any} value - Value to validate
 * @param {RegExp|string} pattern - Pattern to match
 * @returns {boolean} True if value matches pattern
 */
export function validatePattern(value, pattern) {
  if (isEmpty(value)) return true; // Let required rule handle empty values
  
  if (typeof value !== 'string') return false;
  
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return regex.test(value);
}

/**
 * Validate field confirmation (password confirmation, etc.)
 * @param {any} value - Value to validate
 * @param {string} confirmationField - Name of field to confirm against
 * @param {Object} allValues - All form values
 * @returns {boolean} True if values match
 */
export function validateConfirmed(value, confirmationField, allValues = {}) {
  if (isEmpty(value)) return true; // Let required rule handle empty values
  
  const confirmationValue = allValues[confirmationField];
  return value === confirmationValue;
}

/**
 * Normalize value for validation (trim strings, convert types)
 * @param {any} value - Value to normalize
 * @returns {any} Normalized value
 */
export function normalizeValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  
  return value;
}

/**
 * Check if value should be validated (skip empty values for optional rules)
 * @param {any} value - Value to check
 * @param {boolean} isRequired - Whether the field is required
 * @returns {boolean} True if value should be validated
 */
export function shouldValidate(value, isRequired = false) {
  if (isRequired) {
    return true; // Always validate required fields
  }
  
  return !isEmpty(value); // Only validate non-empty optional fields
}
