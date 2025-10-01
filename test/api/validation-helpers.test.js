/**
 * Tests for validation helpers
 */

import { validate, createRules, validateData, patterns } from '../../src/api/validation-helpers.js';

describe('validate', () => {
  describe('email', () => {
    test('should validate correct email addresses', () => {
      expect(validate.email('test@example.com')).toBe(true);
      expect(validate.email('user.name@domain.co.uk')).toBe(true);
      expect(validate.email('test+tag@example.org')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(validate.email('invalid-email')).toBe(false);
      expect(validate.email('test@')).toBe(false);
      expect(validate.email('@example.com')).toBe(false);
      expect(validate.email('')).toBe(false);
      expect(validate.email(null)).toBe(false);
    });
  });

  describe('required', () => {
    test('should validate required values', () => {
      expect(validate.required('hello')).toBe(true);
      expect(validate.required('0')).toBe(true);
      expect(validate.required(false)).toBe(true);
      expect(validate.required([1, 2, 3])).toBe(true);
      expect(validate.required({ key: 'value' })).toBe(true);
    });

    test('should reject empty values', () => {
      expect(validate.required('')).toBe(false);
      expect(validate.required('   ')).toBe(false);
      expect(validate.required(null)).toBe(false);
      expect(validate.required(undefined)).toBe(false);
      expect(validate.required([])).toBe(false);
      expect(validate.required({})).toBe(false);
    });
  });

  describe('minLength', () => {
    test('should validate minimum length', () => {
      expect(validate.minLength('hello', 3)).toBe(true);
      expect(validate.minLength('hello', 5)).toBe(true);
      expect(validate.minLength([1, 2, 3], 2)).toBe(true);
    });

    test('should reject values below minimum length', () => {
      expect(validate.minLength('hi', 3)).toBe(false);
      expect(validate.minLength([1], 2)).toBe(false);
    });

    test('should handle empty values', () => {
      expect(validate.minLength('', 5)).toBe(true);
      expect(validate.minLength(null, 5)).toBe(true);
    });
  });

  describe('maxLength', () => {
    test('should validate maximum length', () => {
      expect(validate.maxLength('hello', 10)).toBe(true);
      expect(validate.maxLength('hello', 5)).toBe(true);
      expect(validate.maxLength([1, 2, 3], 5)).toBe(true);
    });

    test('should reject values above maximum length', () => {
      expect(validate.maxLength('hello', 3)).toBe(false);
      expect(validate.maxLength([1, 2, 3], 2)).toBe(false);
    });

    test('should handle empty values', () => {
      expect(validate.maxLength('', 5)).toBe(true);
      expect(validate.maxLength(null, 5)).toBe(true);
    });
  });

  describe('numeric', () => {
    test('should validate numeric values', () => {
      expect(validate.numeric(123)).toBe(true);
      expect(validate.numeric('123')).toBe(true);
      expect(validate.numeric('123.45')).toBe(true);
      expect(validate.numeric('-123')).toBe(true);
    });

    test('should reject non-numeric values', () => {
      expect(validate.numeric('abc')).toBe(false);
      expect(validate.numeric('12abc')).toBe(false);
      expect(validate.numeric(NaN)).toBe(false);
      expect(validate.numeric(Infinity)).toBe(false);
    });

    test('should handle empty values', () => {
      expect(validate.numeric('')).toBe(true);
      expect(validate.numeric(null)).toBe(true);
      expect(validate.numeric(undefined)).toBe(true);
    });
  });

  describe('pattern', () => {
    test('should validate against regex patterns', () => {
      expect(validate.pattern('hello', /^[a-z]+$/)).toBe(true);
      expect(validate.pattern('123', /^\d+$/)).toBe(true);
      expect(validate.pattern('test@example.com', patterns.email)).toBe(true);
    });

    test('should reject non-matching patterns', () => {
      expect(validate.pattern('HELLO', /^[a-z]+$/)).toBe(false);
      expect(validate.pattern('12a', /^\d+$/)).toBe(false);
    });

    test('should handle invalid patterns', () => {
      expect(validate.pattern('test', '[invalid')).toBe(false);
    });
  });
});

describe('createRules', () => {
  test('should parse string format rules', () => {
    const rules = createRules({
      email: 'required|email|min:5'
    });

    expect(rules.email).toEqual(['required', 'email', { min: '5' }]);
  });

  test('should handle array format rules', () => {
    const rules = createRules({
      email: ['required', 'email', { min: 5 }]
    });

    expect(rules.email).toEqual(['required', 'email', { min: 5 }]);
  });

  test('should handle object format rules', () => {
    const rules = createRules({
      email: { required: true, email: true, min: 5 }
    });

    expect(rules.email).toEqual({ required: true, email: true, min: 5 });
  });
});

describe('validateData', () => {
  test('should validate data correctly', async () => {
    const data = {
      email: 'test@example.com',
      name: 'John Doe'
    };

    const rules = {
      email: ['required', 'email'],
      name: ['required']
    };

    const result = await validateData(data, rules);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('should return validation errors', async () => {
    const data = {
      email: 'invalid-email',
      name: ''
    };

    const rules = {
      email: ['required', 'email'],
      name: ['required']
    };

    const result = await validateData(data, rules);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
    expect(result.errors.name).toBeDefined();
  });
});

describe('patterns', () => {
  test('should provide common regex patterns', () => {
    expect(patterns.email.test('test@example.com')).toBe(true);
    expect(patterns.phone.test('+1234567890')).toBe(true);
    expect(patterns.url.test('https://example.com')).toBe(true);
    expect(patterns.alphanumeric.test('abc123')).toBe(true);
    expect(patterns.numeric.test('123')).toBe(true);
  });
});
