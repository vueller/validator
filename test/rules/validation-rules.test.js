/**
 * Validation Rules Tests
 * Tests all built-in validation rules
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  RequiredRule,
  EmailRule,
  MinRule,
  MaxRule,
  NumericRule,
  PatternRule,
  ConfirmedRule
} from '../../src/rules/index.js';

describe('Validation Rules', () => {
  describe('RequiredRule', () => {
    let rule;

    beforeEach(() => {
      rule = new RequiredRule();
    });

    it('should validate non-empty strings', async () => {
      expect(await rule.validate('hello')).toBe(true);
      expect(await rule.validate('0')).toBe(true);
      expect(await rule.validate('false')).toBe(true);
    });

    it('should reject empty values', async () => {
      expect(await rule.validate('')).toBe(false);
      expect(await rule.validate(null)).toBe(false);
      expect(await rule.validate(undefined)).toBe(false);
    });

    it('should reject whitespace-only strings', async () => {
      expect(await rule.validate('   ')).toBe(false);
      expect(await rule.validate('\t\n')).toBe(false);
    });

    it('should validate arrays with elements', async () => {
      expect(await rule.validate([1, 2, 3])).toBe(true);
      expect(await rule.validate(['a', 'b'])).toBe(true);
    });

    it('should reject empty arrays', async () => {
      expect(await rule.validate([])).toBe(false);
    });

    it('should validate objects with properties', async () => {
      expect(await rule.validate({ a: 1 })).toBe(true);
      expect(await rule.validate({})).toBe(false);
    });

    it('should validate numbers', async () => {
      expect(await rule.validate(0)).toBe(true);
      expect(await rule.validate(1)).toBe(true);
      expect(await rule.validate(-1)).toBe(true);
    });

    it('should reject NaN', async () => {
      expect(await rule.validate(NaN)).toBe(false);
    });
  });

  describe('EmailRule', () => {
    let rule;

    beforeEach(() => {
      rule = new EmailRule();
    });

    it('should validate correct email formats', async () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.co'
      ];

      for (const email of validEmails) {
        expect(await rule.validate(email)).toBe(true);
      }
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com',
        'user@example.com.',
        'user name@example.com',
        'user@example com'
      ];

      for (const email of invalidEmails) {
        expect(await rule.validate(email)).toBe(false);
      }
    });

    it('should handle empty values', async () => {
      expect(await rule.validate('')).toBe(true); // Should pass (let required handle empty)
      expect(await rule.validate(null)).toBe(true);
      expect(await rule.validate(undefined)).toBe(true);
    });
  });

  describe('MinRule', () => {
    let rule;

    beforeEach(() => {
      rule = new MinRule();
    });

    it('should validate string length', async () => {
      expect(await rule.validate('hello', { min: 3 })).toBe(true);
      expect(await rule.validate('hi', { min: 3 })).toBe(false);
      expect(await rule.validate('hello', { min: 5 })).toBe(true);
    });

    it('should validate number values', async () => {
      expect(await rule.validate(10, { min: 5 })).toBe(true);
      expect(await rule.validate(3, { min: 5 })).toBe(false);
      expect(await rule.validate(5, { min: 5 })).toBe(true);
    });

    it('should validate array length', async () => {
      expect(await rule.validate([1, 2, 3], { min: 2 })).toBe(true);
      expect(await rule.validate([1], { min: 2 })).toBe(false);
      expect(await rule.validate([1, 2], { min: 2 })).toBe(true);
    });

    it('should handle empty values', async () => {
      expect(await rule.validate('', { min: 3 })).toBe(true); // Let required handle empty
      expect(await rule.validate(null, { min: 3 })).toBe(true);
    });

    it('should handle missing min parameter', async () => {
      expect(await rule.validate('hello')).toBe(true); // Should pass when no min specified
    });
  });

  describe('MaxRule', () => {
    let rule;

    beforeEach(() => {
      rule = new MaxRule();
    });

    it('should validate string length', async () => {
      expect(await rule.validate('hello', { max: 10 })).toBe(true);
      expect(await rule.validate('hello world', { max: 5 })).toBe(false);
      expect(await rule.validate('hello', { max: 5 })).toBe(true);
    });

    it('should validate number values', async () => {
      expect(await rule.validate(5, { max: 10 })).toBe(true);
      expect(await rule.validate(15, { max: 10 })).toBe(false);
      expect(await rule.validate(10, { max: 10 })).toBe(true);
    });

    it('should validate array length', async () => {
      expect(await rule.validate([1, 2], { max: 5 })).toBe(true);
      expect(await rule.validate([1, 2, 3, 4, 5, 6], { max: 5 })).toBe(false);
      expect(await rule.validate([1, 2, 3], { max: 3 })).toBe(true);
    });

    it('should handle empty values', async () => {
      expect(await rule.validate('', { max: 3 })).toBe(true);
      expect(await rule.validate(null, { max: 3 })).toBe(true);
    });

    it('should handle missing max parameter', async () => {
      expect(await rule.validate('hello')).toBe(true);
    });
  });

  describe('NumericRule', () => {
    let rule;

    beforeEach(() => {
      rule = new NumericRule();
    });

    it('should validate numeric strings', async () => {
      expect(await rule.validate('123')).toBe(true);
      expect(await rule.validate('123.45')).toBe(true);
      expect(await rule.validate('-123')).toBe(true);
      expect(await rule.validate('+123')).toBe(true);
      expect(await rule.validate('0')).toBe(true);
    });

    it('should validate actual numbers', async () => {
      expect(await rule.validate(123)).toBe(true);
      expect(await rule.validate(123.45)).toBe(true);
      expect(await rule.validate(-123)).toBe(true);
      expect(await rule.validate(0)).toBe(true);
    });

    it('should reject non-numeric strings', async () => {
      expect(await rule.validate('abc')).toBe(false);
      expect(await rule.validate('123abc')).toBe(false);
      expect(await rule.validate('abc123')).toBe(false);
      expect(await rule.validate('12.34.56')).toBe(false);
    });

    it('should reject special values', async () => {
      expect(await rule.validate(NaN)).toBe(false);
      expect(await rule.validate(Infinity)).toBe(false);
      expect(await rule.validate(-Infinity)).toBe(false);
    });

    it('should handle empty values', async () => {
      expect(await rule.validate('')).toBe(true);
      expect(await rule.validate(null)).toBe(true);
      expect(await rule.validate(undefined)).toBe(true);
    });
  });

  describe('PatternRule', () => {
    let rule;

    beforeEach(() => {
      rule = new PatternRule();
    });

    it('should validate against regex patterns', async () => {
      expect(await rule.validate('123-456-7890', { pattern: /^\d{3}-\d{3}-\d{4}$/ })).toBe(true);
      expect(await rule.validate('1234567890', { pattern: /^\d{3}-\d{3}-\d{4}$/ })).toBe(false);
    });

    it('should validate against string patterns', async () => {
      expect(await rule.validate('hello', { pattern: '^[a-z]+$' })).toBe(true);
      expect(await rule.validate('Hello', { pattern: '^[a-z]+$' })).toBe(false);
    });

    it('should handle case-insensitive patterns', async () => {
      expect(await rule.validate('Hello', { pattern: /^[a-z]+$/i })).toBe(true);
      expect(await rule.validate('HELLO', { pattern: /^[a-z]+$/i })).toBe(true);
    });

    it('should handle empty values', async () => {
      expect(await rule.validate('', { pattern: /^.+$/ })).toBe(true);
      expect(await rule.validate(null, { pattern: /^.+$/ })).toBe(true);
    });

    it('should handle missing pattern parameter', async () => {
      expect(await rule.validate('hello')).toBe(true);
    });
  });

  describe('ConfirmedRule', () => {
    let rule;

    beforeEach(() => {
      rule = new ConfirmedRule();
    });

    it('should validate matching confirmation fields', async () => {
      const allValues = {
        password: 'mypassword',
        password_confirmation: 'mypassword'
      };

      expect(await rule.validate('mypassword', { confirmed: 'password' }, allValues)).toBe(true);
    });

    it('should reject non-matching confirmation fields', async () => {
      const allValues = {
        password: 'mypassword',
        password_confirmation: 'different'
      };

      expect(await rule.validate('mypassword', { confirmed: 'password' }, allValues)).toBe(false);
    });

    it('should handle missing confirmation field', async () => {
      const allValues = {
        password: 'mypassword'
      };

      expect(await rule.validate('mypassword', { confirmed: 'password' }, allValues)).toBe(false);
    });

    it('should handle empty values', async () => {
      const allValues = {
        password: '',
        password_confirmation: ''
      };

      expect(await rule.validate('', { confirmed: 'password' }, allValues)).toBe(true);
    });

    it('should handle missing confirmed parameter', async () => {
      expect(await rule.validate('value')).toBe(true);
    });
  });

  describe('Rule Integration', () => {
    it('should work with multiple rules on same field', async () => {
      const requiredRule = new RequiredRule();
      const emailRule = new EmailRule();
      const minRule = new MinRule();

      const value = 'user@example.com';
      const allValues = { email: value };

      expect(await requiredRule.validate(value)).toBe(true);
      expect(await emailRule.validate(value)).toBe(true);
      expect(await minRule.validate(value, { min: 5 })).toBe(true);
    });

    it('should handle rule chaining', async () => {
      const requiredRule = new RequiredRule();
      const emailRule = new EmailRule();

      // Empty value should fail required
      expect(await requiredRule.validate('')).toBe(false);

      // Valid email should pass both
      expect(await requiredRule.validate('user@example.com')).toBe(true);
      expect(await emailRule.validate('user@example.com')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long strings', async () => {
      const longString = 'a'.repeat(10000);
      const minRule = new MinRule();

      expect(await minRule.validate(longString, { min: 1000 })).toBe(true);
      expect(await minRule.validate(longString, { min: 20000 })).toBe(false);
    });

    it('should handle special characters', async () => {
      const emailRule = new EmailRule();
      const specialEmail = 'user+tag@example-domain.co.uk';

      expect(await emailRule.validate(specialEmail)).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const minRule = new MinRule();
      const unicodeString = 'héllo wörld';

      expect(await minRule.validate(unicodeString, { min: 5 })).toBe(true);
    });
  });
});
