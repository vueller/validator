/**
 * Basic Tests
 * Tests basic functionality and imports with modern patterns
 */

import { describe, it, expect } from '@jest/globals';

// Test core exports
import { Validator, ErrorBag, I18nManager } from '../src/core/index.js';
import { RuleRegistry } from '../src/RuleRegistry.js';
import { 
  RequiredRule, 
  MinRule, 
  MaxRule, 
  EmailRule, 
  NumericRule, 
  PatternRule, 
  ConfirmedRule 
} from '../src/rules/index.js';

// Test Vue exports
import { useValidator, ValidatorSymbol } from '../src/vue/use-validation.js';

// Test main exports
import ValidatorMain from '../src/index.js';
import { install as installVuePlugin } from '../src/vue/index.js';

describe('Basic Functionality Tests', () => {
  describe('Core Classes', () => {
    it('should export Validator class', () => {
      expect(Validator).toBeDefined();
      expect(typeof Validator).toBe('function');
    });

    it('should export ErrorBag class', () => {
      expect(ErrorBag).toBeDefined();
      expect(typeof ErrorBag).toBe('function');
    });

    it('should export I18nManager class', () => {
      expect(I18nManager).toBeDefined();
      expect(typeof I18nManager).toBe('function');
    });

    it('should export RuleRegistry class', () => {
      expect(RuleRegistry).toBeDefined();
      expect(typeof RuleRegistry).toBe('function');
    });
  });

  describe('Validation Rules', () => {
    it('should export all validation rules', () => {
      expect(RequiredRule).toBeDefined();
      expect(MinRule).toBeDefined();
      expect(MaxRule).toBeDefined();
      expect(EmailRule).toBeDefined();
      expect(NumericRule).toBeDefined();
      expect(PatternRule).toBeDefined();
      expect(ConfirmedRule).toBeDefined();
    });

    it('should create rule instances', () => {
      const requiredRule = new RequiredRule();
      const emailRule = new EmailRule();
      const minRule = new MinRule();

      expect(requiredRule).toBeDefined();
      expect(emailRule).toBeDefined();
      expect(minRule).toBeDefined();
    });
  });

  describe('Vue Composables', () => {
    it('should export useValidator function', () => {
      expect(useValidator).toBeDefined();
      expect(typeof useValidator).toBe('function');
    });

    it('should export ValidatorSymbol', () => {
      expect(ValidatorSymbol).toBeDefined();
      expect(typeof ValidatorSymbol).toBe('symbol');
    });
  });

  describe('Main Exports', () => {
    it('should export main Validator as default', () => {
      expect(ValidatorMain).toBeDefined();
      expect(ValidatorMain).toBe(Validator);
    });

    it('should export Vue plugin install function', () => {
      expect(installVuePlugin).toBeDefined();
      expect(typeof installVuePlugin).toBe('function');
    });
  });

  describe('Basic Instantiation', () => {
    it('should create Validator instance', () => {
      const validator = new Validator();
      expect(validator).toBeInstanceOf(Validator);
    });

    it('should create ErrorBag instance', () => {
      const errorBag = new ErrorBag();
      expect(errorBag).toBeInstanceOf(ErrorBag);
    });

    it('should create I18nManager instance', () => {
      const i18nManager = new I18nManager();
      expect(i18nManager).toBeInstanceOf(I18nManager);
    });

    it('should create RuleRegistry instance', () => {
      const ruleRegistry = new RuleRegistry();
      expect(ruleRegistry).toBeInstanceOf(RuleRegistry);
    });
  });

  describe('Basic Functionality', () => {
    it('should validate simple required field', async () => {
      const validator = new Validator();
      validator.setRules('name', { required: true });
      validator.setData({ name: 'John' });

      const result = await validator.validate();
      expect(result).toBe(true);
    });

    it('should handle validation errors', async () => {
      const validator = new Validator();
      validator.setRules('name', { required: true });
      validator.setData({ name: '' });

      const result = await validator.validate();
      expect(result).toBe(false);
      expect(validator.errors().has('name')).toBe(true);
    });

    it('should handle email validation', async () => {
      const validator = new Validator();
      validator.setRules('email', { required: true, email: true });

      validator.setData({ email: 'test@example.com' });
      let result = await validator.validate();
      expect(result).toBe(true);

      validator.setData({ email: 'invalid-email' });
      result = await validator.validate();
      expect(result).toBe(false);
    });

    it('should handle min/max validation', async () => {
      const validator = new Validator();
      validator.setRules('age', { required: true, numeric: true, minValue: 18, maxValue: 65 });

      validator.setData({ age: 25 });
      let result = await validator.validate();
      expect(result).toBe(true);

      validator.setData({ age: 17 });
      result = await validator.validate();
      expect(result).toBe(false);

      validator.setData({ age: 66 });
      result = await validator.validate();
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid rule configurations gracefully', () => {
      const validator = new Validator();
      
      expect(() => {
        validator.setRules('field', 'invalid-rules');
      }).not.toThrow();
    });

    it('should handle validation with missing rules', async () => {
      const validator = new Validator();
      validator.setData({ field: 'value' });

      const result = await validator.validate();
      expect(result).toBe(true);
    });

    it('should handle validation with null data', async () => {
      const validator = new Validator();
      validator.setRules('field', { required: true });

      const result = await validator.validate(null);
      expect(result).toBe(true);
    });
  });

  describe('Module Structure', () => {
    it('should have proper ES6 module structure', () => {
      // Test that all exports are functions or classes
      expect(typeof Validator).toBe('function');
      expect(typeof ErrorBag).toBe('function');
      expect(typeof I18nManager).toBe('function');
      expect(typeof RuleRegistry).toBe('function');
    });

    it('should support tree shaking', () => {
      // Test that individual exports work
      expect(Validator).toBeDefined();
      expect(ErrorBag).toBeDefined();
      expect(I18nManager).toBeDefined();
    });
  });
});
