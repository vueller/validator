/**
 * Core Validator Tests
 * Tests the main Validator class functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Validator } from '../../src/core/index.js';

describe('Validator Core', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
  });

  afterEach(() => {
    validator.reset();
  });

  describe('Constructor and Options', () => {
    it('should create validator with default options', () => {
      expect(validator).toBeInstanceOf(Validator);
      expect(validator.getGlobalConfig()).toMatchObject({
        stopOnFirstFailure: false,
        locale: 'en',
        validateOnBlur: true,
        validateOnInput: false
      });
    });

    it('should create validator with custom options', () => {
      const customValidator = new Validator({
        stopOnFirstFailure: true,
        locale: 'pt-BR',
        validateOnBlur: false
      });

      expect(customValidator.getGlobalConfig()).toMatchObject({
        stopOnFirstFailure: true,
        locale: 'pt-BR',
        validateOnBlur: false,
        validateOnInput: false
      });
    });
  });

  describe('Rule Management', () => {
    it('should set rules for a field in scope', () => {
      validator.setRules('email', { required: true, email: true }, {}, 'loginForm');

      const rules = validator.getRules('email', 'loginForm');
      expect(rules).toHaveLength(2);
      expect(rules[0].name).toBe('required');
      expect(rules[1].name).toBe('email');
    });

    it('should set multiple rules for scope', () => {
      const rules = {
        email: { required: true, email: true },
        password: { required: true, min: 8 }
      };

      validator.setMultipleRules(rules, {}, 'loginForm');

      expect(validator.getRules('email', 'loginForm')).toHaveLength(2);
      expect(validator.getRules('password', 'loginForm')).toHaveLength(2);
    });

    it('should check if field has rules', () => {
      validator.setRules('email', { required: true }, {}, 'loginForm');

      expect(validator.hasRules('email', 'loginForm')).toBe(true);
      expect(validator.hasRules('password', 'loginForm')).toBe(false);
    });

    it('should remove rules for field', () => {
      validator.setRules('email', { required: true }, {}, 'loginForm');
      expect(validator.hasRules('email', 'loginForm')).toBe(true);

      validator.removeRules('email', 'loginForm');
      expect(validator.hasRules('email', 'loginForm')).toBe(false);
    });
  });

  describe('Data Management', () => {
    it('should set and get data for scope', () => {
      const formData = { email: 'test@example.com', password: 'password123' };

      validator.setData(formData, 'loginForm');
      const retrievedData = validator.getData('loginForm');

      expect(retrievedData).toEqual(formData);
    });

    it('should set and get single field value', () => {
      validator.setValue('email', 'test@example.com', 'loginForm');

      expect(validator.getValue('email', 'loginForm')).toBe('test@example.com');
    });

    it('should handle multiple scopes independently', () => {
      validator.setData({ email: 'login@test.com' }, 'loginForm');
      validator.setData({ email: 'register@test.com' }, 'registerForm');

      expect(validator.getData('loginForm')).toEqual({ email: 'login@test.com' });
      expect(validator.getData('registerForm')).toEqual({ email: 'register@test.com' });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      validator.setMultipleRules(
        {
          email: { required: true, email: true },
          password: { required: true, min: 8 }
        },
        {},
        'loginForm'
      );
    });

    it('should validate all fields in scope', async () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123'
      };

      validator.setData(validData, 'loginForm');
      const isValid = await validator.validateScope('loginForm');

      expect(isValid).toBe(true);
    });

    it('should fail validation with invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123'
      };

      validator.setData(invalidData, 'loginForm');
      const isValid = await validator.validateScope('loginForm');

      expect(isValid).toBe(false);
    });

    it('should validate single field', async () => {
      validator.setData({ email: 'test@example.com' }, 'loginForm');

      const isValid = await validator.validate('loginForm').field('email');
      expect(isValid).toBe(true);
    });

    it('should validate single field with custom value', async () => {
      const isValid = await validator.validate('loginForm').field('email', 'test@example.com');
      expect(isValid).toBe(true);
    });

    it('should handle validation with fluent API', async () => {
      const validationPromise = validator.validate('loginForm', {
        email: 'user@example.com',
        password: 'password123'
      });

      expect(validationPromise).toBeInstanceOf(Promise);

      const isValid = await validationPromise;
      expect(isValid).toBe(true);
    });
  });

  describe('Error Management', () => {
    beforeEach(() => {
      validator.setRules('email', { required: true, email: true }, {}, 'loginForm');
    });

    it('should collect validation errors', async () => {
      validator.setData({ email: 'invalid-email' }, 'loginForm');
      await validator.validateScope('loginForm');

      const errors = validator.errors();
      expect(errors.has('loginForm.email')).toBe(true);
      expect(errors.get('loginForm.email')).toContain('email');
    });

    it('should clear errors for scope', async () => {
      validator.setData({ email: 'invalid-email' }, 'loginForm');
      await validator.validateScope('loginForm');

      expect(validator.errors().has('loginForm.email')).toBe(true);

      validator.clearScopeErrors('loginForm');
      expect(validator.errors().has('loginForm.email')).toBe(false);
    });

    it('should reset all validation state', async () => {
      validator.setData({ email: 'invalid-email' }, 'loginForm');
      await validator.validateScope('loginForm');

      expect(validator.errors().has('loginForm.email')).toBe(true);

      validator.reset('loginForm');
      expect(validator.errors().has('loginForm.email')).toBe(false);
    });
  });

  describe('Custom Rules', () => {
    it('should extend validator with custom rule', () => {
      validator.extend('cpf', value => {
        const cpf = value.replace(/\D/g, '');
        return cpf.length === 11 && cpf !== '00000000000';
      });

      validator.setRules('document', { required: true, cpf: true }, {}, 'userForm');

      expect(validator.hasRules('document', 'userForm')).toBe(true);
    });

    it('should validate with custom rule', async () => {
      validator.extend('cpf', value => {
        const cpf = value.replace(/\D/g, '');
        return cpf.length === 11 && cpf !== '00000000000';
      });

      validator.setRules('document', { required: true, cpf: true }, {}, 'userForm');

      const isValid = await validator.validate('userForm').field('document', '12345678901');
      expect(isValid).toBe(true);
    });
  });

  describe('Reactivity', () => {
    it('should notify listeners on state change', done => {
      validator.subscribe(() => {
        done();
      });

      validator.setData({ email: 'test@example.com' }, 'loginForm');
    });

    it('should create Vue state when Vue is available', () => {
      // Mock Vue
      global.Vue = {
        reactive: jest.fn(obj => obj),
        computed: jest.fn(fn => ({ value: fn() }))
      };

      const vueState = validator.createVueState();
      expect(vueState).toBeDefined();
      expect(vueState.formData).toBeDefined();
      expect(vueState.errors).toBeDefined();

      delete global.Vue;
    });

    it('should create plain state when Vue is not available', () => {
      const plainState = validator.createPlainState();
      expect(plainState).toBeDefined();
      expect(plainState.formData).toBeDefined();
      expect(plainState.errors).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty validation rules', async () => {
      const isValid = await validator.validateScope('emptyForm');
      expect(isValid).toBe(true);
    });

    it('should handle validation without data', async () => {
      validator.setRules('email', { required: true }, {}, 'loginForm');

      const isValid = await validator.validateScope('loginForm');
      expect(isValid).toBe(false);
    });

    it('should handle null and undefined values', async () => {
      validator.setRules('email', { required: true }, {}, 'loginForm');

      validator.setData({ email: null }, 'loginForm');
      const isValidNull = await validator.validateScope('loginForm');
      expect(isValidNull).toBe(false);

      validator.setData({ email: undefined }, 'loginForm');
      const isValidUndefined = await validator.validateScope('loginForm');
      expect(isValidUndefined).toBe(false);
    });

    it('should handle empty string values', async () => {
      validator.setRules('email', { required: true }, {}, 'loginForm');

      validator.setData({ email: '' }, 'loginForm');
      const isValid = await validator.validateScope('loginForm');
      expect(isValid).toBe(false);
    });
  });
});
