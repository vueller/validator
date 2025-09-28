/**
 * String manipulation utilities
 * Centralized string helpers for the entire project
 */

/**
 * Convert camelCase to readable format
 * @param {string} str - String to convert
 * @returns {string} Formatted string
 */
export function camelCaseToReadable(str) {
  if (typeof str !== 'string') return str;

  // Convert camelCase to space-separated words
  const formatted = str.replace(/([A-Z])/g, ' $1').toLowerCase();

  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Replace placeholders in a string template
 * @param {string} template - Template string with {placeholder} syntax
 * @param {Object} replacements - Object with replacement values
 * @returns {string} String with replaced placeholders
 */
export function replacePlaceholders(template, replacements = {}) {
  if (typeof template !== 'string') return template;

  let result = template;

  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = new RegExp(`{${key}}`, 'g');
    result = result.replace(placeholder, value);
  }

  return result;
}

/**
 * Trim whitespace from string
 * @param {any} value - Value to trim
 * @returns {string} Trimmed string
 */
export function trimString(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}

/**
 * Convert value to string safely
 * @param {any} value - Value to convert
 * @returns {string} String representation
 */
export function toString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return String(value);
}

/**
 * Check if string matches pattern
 * @param {string} str - String to test
 * @param {RegExp|string} pattern - Pattern to match
 * @returns {boolean} True if string matches pattern
 */
export function matchesPattern(str, pattern) {
  if (typeof str !== 'string') return false;

  if (pattern instanceof RegExp) {
    return pattern.test(str);
  }

  if (typeof pattern === 'string') {
    return new RegExp(pattern).test(str);
  }

  return false;
}

/**
 * Escape special regex characters in string
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeRegex(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
