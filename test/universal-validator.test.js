/**
 * Universal Validator Tests
 * Tests the universal validator API
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { validator, setGlobalValidator, getGlobalValidator } from '../src/universal-validator.js';
import { Validator } from '../src/core/index.js';
import { ptBR, en } from '../src/locales/index.js';

describe('Universal Validator', () => {
  let originalValidator;

  beforeEach(() => {
    // Store original validator
    originalValidator = getGlobalValidator();
  });

  afterEach(() => {
    // Restore original validator
    setGlobalValidator(originalValidator);
  });

  describe('Global Validator Management', () => {
    it('should get global validator instance', () => {
      const instance = getGlobalValidator();
      expect(instance).toBeInstanceOf(Validator);
    });

    it('should set global validator instance', () => {
      const newValidator = new Validator();
      setGlobalValidator(newValidator);
      
      expect(getGlobalValidator()).toBe(newValidator);
    });

    it('should create new instance if none exists', () => {
      setGlobalValidator(null);
      const instance = getGlobalValidator();
      
      expect(instance).toBeInstanceOf(Validator);
    });
  });

  describe('Validation API', () => {
    beforeEach(() => {
      validator.setMultipleRules({
        email: { required: true, email: true },
        password: { required: true, min: 8 }
      }, {}, 'testForm');
    });

    it('should validate with data object', async () => {
      const formData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const isValid = await validator.validate('testForm', formData);
      expect(isValid).toBe(true);
    });

    it('should validate with fluent API', async () => {
      const validation = validator.validate('testForm', {
        email: 'user@example.com',
        password: 'password123'
      });

      expect(validation).toHaveProperty('field');
      expect(validation).toHaveProperty('then');

      const isValid = await validation;
      expect(isValid).toBe(true);
    });

    it('should validate single field with fluent API', async () => {
      const isValid = await validator.validate('testForm').field('email', 'user@example.com');
      expect(isValid).toBe(true);
    });

    it('should fail validation with invalid data', async () => {
      const formData = {
        email: 'invalid-email',
        password: '123'
      };

      const isValid = await validator.validate('testForm', formData);
      expect(isValid).toBe(false);
    });
  });

  describe('Rule Management', () => {
    it('should set rules for field', () => {
      validator.setRules('email', { required: true, email: true }, {}, 'testForm');
      
      const rules = validator.getRules('email', 'testForm');
      expect(rules).toHaveLength(2);
    });

    it('should set multiple rules', () => {
      const rules = {
        email: { required: true, email: true },
        password: { required: true, min: 8 }
      };

      validator.setMultipleRules(rules, {}, 'testForm');

      expect(validator.hasRules('email', 'testForm')).toBe(true);
      expect(validator.hasRules('password', 'testForm')).toBe(true);
    });

    it('should set rules with custom messages', () => {
      const customMessages = {
        'email.required': 'Email is required',
        'email.email': 'Invalid email format'
      };

      validator.setRules('email', { required: true, email: true }, customMessages, 'testForm');
      
      // The rule should be set (we can't easily test message application here)
      expect(validator.hasRules('email', 'testForm')).toBe(true);
    });
  });

  describe('Data Management', () => {
    it('should get and set data for scope', () => {
      const formData = { email: 'test@example.com' };
      
      validator.setData(formData, 'testForm');
      const retrievedData = validator.getData('testForm');
      
      expect(retrievedData).toEqual(formData);
    });

    it('should get validation errors', async () => {
      validator.setRules('email', { required: true }, {}, 'testForm');
      await validator.validate('testForm', { email: '' });
      
      const errors = validator.getErrors();
      expect(errors).toHaveProperty('testForm.email');
    });

    it('should check if validation is valid', async () => {
      validator.setRules('email', { required: true }, {}, 'testForm');
      
      await validator.validate('testForm', { email: 'test@example.com' });
      expect(validator.isValid()).toBe(true);
      
      await validator.validate('testForm', { email: '' });
      expect(validator.isValid()).toBe(false);
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      validator.setMultipleRules({
        email: { required: true, email: true }
      }, {}, 'testForm');
      
      validator.setData({ email: 'test@example.com' }, 'testForm');
    });

    it('should reset specific scope', () => {
      validator.reset('testForm');
      
      const data = validator.getData('testForm');
      expect(data).toEqual({});
    });

    it('should reset all validation state', () => {
      validator.reset();
      
      // Should clear all scopes
      const data = validator.getData('testForm');
      expect(data).toEqual({});
    });
  });

  describe('Internationalization', () => {
    it('should set locale', () => {
      validator.setLocale('pt-BR');
      expect(validator.getLocale()).toBe('pt-BR');
    });

    it('should load built-in translations', () => {
      validator.setLocale('pt-BR');
      validator.loadTranslations(ptBR);
      
      // Should not throw error
      expect(() => validator.loadTranslations(ptBR)).not.toThrow();
    });

    it('should load custom translations', () => {
      const customMessages = {
        required: 'Custom required message',
        email: 'Custom email message'
      };

      validator.setLocale('en');
      validator.loadTranslations(null, customMessages);
      
      // Should not throw error
      expect(() => validator.loadTranslations(null, customMessages)).not.toThrow();
    });

    it('should load built-in translations with custom overrides', () => {
      const customOverrides = {
        required: 'Custom required message',
        'email.required': 'Email is required'
      };

      validator.setLocale('pt-BR');
      validator.loadTranslations(ptBR, customOverrides);
      
      // Should not throw error
      expect(() => validator.loadTranslations(ptBR, customOverrides)).not.toThrow();
    });
  });

  describe('Custom Rules', () => {
    it('should extend validator with custom rule', () => {
      validator.extend('cpf', (value) => {
        const cpf = value.replace(/\D/g, '');
        return cpf.length === 11 && cpf !== '00000000000';
      });

      validator.setRules('document', { required: true, cpf: true }, {}, 'testForm');
      
      expect(validator.hasRules('document', 'testForm')).toBe(true);
    });

    it('should validate with custom rule', async () => {
      validator.extend('cpf', (value) => {
        const cpf = value.replace(/\D/g, '');
        return cpf.length === 11 && cpf !== '00000000000';
      });

      validator.setRules('document', { required: true, cpf: true }, {}, 'testForm');
      
      const isValid = await validator.validate('testForm').field('document', '12345678901');
      expect(isValid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      validator.setRules('email', { required: true, email: true }, {}, 'testForm');
      
      const isValid = await validator.validate('testForm', { email: 'invalid-email' });
      expect(isValid).toBe(false);
      
      const errors = validator.getErrors();
      expect(errors).toHaveProperty('testForm.email');
    });

    it('should handle missing rules gracefully', async () => {
      const isValid = await validator.validate('nonexistentForm', { email: 'test@example.com' });
      expect(isValid).toBe(true); // Should pass when no rules exist
    });

    it('should handle invalid rule parameters gracefully', async () => {
      validator.setRules('email', { min: 'invalid' }, {}, 'testForm');
      
      // Should not throw error, but validation might fail
      const isValid = await validator.validate('testForm', { email: 'test@example.com' });
      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('Performance', () => {
    it('should handle large number of validations efficiently', async () => {
      const startTime = performance.now();
      
      // Set up rules
      validator.setMultipleRules({
        email: { required: true, email: true },
        password: { required: true, min: 8 }
      }, {}, 'perfForm');
      
      // Perform 100 validations
      for (let i = 0; i < 100; i++) {
        await validator.validate('perfForm', {
          email: `user${i}@example.com`,
          password: 'password123'
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle multiple scopes efficiently', async () => {
      const startTime = performance.now();
      
      // Set up multiple scopes
      for (let i = 0; i < 50; i++) {
        validator.setMultipleRules({
          email: { required: true, email: true }
        }, {}, `form${i}`);
        
        await validator.validate(`form${i}`, {
          email: `user${i}@example.com`
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete in less than 500ms
    });
  });

  describe('Integration', () => {
    it('should work with multiple scopes independently', async () => {
      // Set up two different forms
      validator.setMultipleRules({
        email: { required: true, email: true }
      }, {}, 'loginForm');
      
      validator.setMultipleRules({
        name: { required: true, min: 2 },
        age: { required: true, numeric: true }
      }, {}, 'profileForm');
      
      // Validate login form
      const loginValid = await validator.validate('loginForm', {
        email: 'user@example.com'
      });
      expect(loginValid).toBe(true);
      
      // Validate profile form
      const profileValid = await validator.validate('profileForm', {
        name: 'John Doe',
        age: '25'
      });
      expect(profileValid).toBe(true);
      
      // Errors should be scoped
      const errors = validator.getErrors();
      expect(errors).not.toHaveProperty('loginForm.name');
      expect(errors).not.toHaveProperty('profileForm.email');
    });

    it('should work with different locales', () => {
      // Set up English
      validator.setLocale('en');
      validator.loadTranslations(en);
      
      // Set up Portuguese
      validator.setLocale('pt-BR');
      validator.loadTranslations(ptBR);
      
      // Should not throw errors
      expect(() => {
        validator.setLocale('en');
        validator.loadTranslations(en);
      }).not.toThrow();
    });
  });
});
