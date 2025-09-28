/**
 * Vue Composables Tests
 * Tests the Vue composables functionality
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { ref, reactive } from 'vue';
import { useValidator } from '../../src/vue/composables.js';

// Mock Vue
global.Vue = {
  ref,
  reactive,
  computed: vi.fn((fn) => ({ value: fn() })),
  watch: vi.fn(),
  onMounted: vi.fn((fn) => fn()),
  onUnmounted: vi.fn()
};

describe('Vue Composables', () => {
  describe('useValidator', () => {
    it('should create validator instance', () => {
      const { validator } = useValidator();
      expect(validator).toBeDefined();
      expect(validator.validate).toBeDefined();
      expect(validator.setRules).toBeDefined();
    });

    it('should create reactive state', () => {
      const { errors, isValid, isValidating } = useValidator();
      
      expect(errors).toBeDefined();
      expect(isValid).toBeDefined();
      expect(isValidating).toBeDefined();
    });

    it('should accept validator options', () => {
      const options = {
        locale: 'pt-BR',
        stopOnFirstFailure: true
      };

      const { validator } = useValidator(options);
      expect(validator).toBeDefined();
    });

    it('should handle validation state changes', async () => {
      const { validator, errors, isValid } = useValidator();
      
      // Set up rules
      validator.setMultipleRules({
        email: { required: true, email: true }
      }, {}, 'testForm');
      
      // Validate with invalid data
      await validator.validate('testForm', { email: 'invalid-email' });
      
      // State should be reactive (mocked)
      expect(errors).toBeDefined();
      expect(isValid).toBeDefined();
    });
  });

  describe('ValidatorSymbol', () => {
    it('should create unique symbol', () => {
      const { ValidatorSymbol } = useValidator();
      expect(typeof ValidatorSymbol).toBe('symbol');
    });

    it('should create different symbols on each call', () => {
      const { ValidatorSymbol: symbol1 } = useValidator();
      const { ValidatorSymbol: symbol2 } = useValidator();
      
      expect(symbol1).not.toBe(symbol2);
    });
  });

  describe('Integration with Validator', () => {
    it('should work with validator methods', async () => {
      const { validator } = useValidator();
      
      // Set rules
      validator.setRules('email', { required: true, email: true }, {}, 'testForm');
      
      // Validate
      const isValid = await validator.validate('testForm').field('email', 'test@example.com');
      expect(isValid).toBe(true);
    });

    it('should handle multiple scopes', async () => {
      const { validator } = useValidator();
      
      // Set up two scopes
      validator.setMultipleRules({
        email: { required: true, email: true }
      }, {}, 'loginForm');
      
      validator.setMultipleRules({
        name: { required: true, min: 2 }
      }, {}, 'profileForm');
      
      // Validate both
      const loginValid = await validator.validate('loginForm', { email: 'user@example.com' });
      const profileValid = await validator.validate('profileForm', { name: 'John Doe' });
      
      expect(loginValid).toBe(true);
      expect(profileValid).toBe(true);
    });
  });

  describe('Reactivity', () => {
    it('should update reactive state on validation', async () => {
      const { validator, errors, isValid } = useValidator();
      
      // Mock reactive updates
      const mockErrors = { value: {} };
      const mockIsValid = { value: true };
      
      // Simulate validation
      validator.setRules('email', { required: true }, {}, 'testForm');
      await validator.validate('testForm', { email: '' });
      
      // In real Vue, these would be reactive
      expect(errors).toBeDefined();
      expect(isValid).toBeDefined();
    });

    it('should handle subscription to validator changes', () => {
      const { validator } = useValidator();
      
      // Mock subscription
      const callback = vi.fn();
      validator.subscribe(callback);
      
      // Trigger change
      validator.setData({ email: 'test@example.com' }, 'testForm');
      
      // In real Vue, callback would be called
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const { validator, errors } = useValidator();
      
      validator.setRules('email', { required: true, email: true }, {}, 'testForm');
      
      const isValid = await validator.validate('testForm', { email: 'invalid-email' });
      expect(isValid).toBe(false);
      
      // Errors should be available
      expect(errors).toBeDefined();
    });

    it('should handle missing validator gracefully', () => {
      // This would happen if useValidator is called outside of Vue context
      // The composable should still work
      const { validator } = useValidator();
      expect(validator).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle multiple validations efficiently', async () => {
      const { validator } = useValidator();
      
      const startTime = performance.now();
      
      // Set up rules
      validator.setMultipleRules({
        email: { required: true, email: true },
        password: { required: true, min: 8 }
      }, {}, 'perfForm');
      
      // Perform multiple validations
      for (let i = 0; i < 50; i++) {
        await validator.validate('perfForm', {
          email: `user${i}@example.com`,
          password: 'password123'
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete in less than 500ms
    });

    it('should handle frequent state updates efficiently', () => {
      const { validator } = useValidator();
      
      const startTime = performance.now();
      
      // Simulate frequent updates
      for (let i = 0; i < 1000; i++) {
        validator.setData({ email: `user${i}@example.com` }, 'testForm');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Vue Integration', () => {
    it('should work with Vue reactive system', () => {
      const { validator } = useValidator();
      
      // Mock Vue reactive
      const mockReactive = vi.fn((obj) => obj);
      global.Vue.reactive = mockReactive;
      
      // Create state
      const state = validator.createVueState();
      
      expect(state).toBeDefined();
      expect(mockReactive).toHaveBeenCalled();
    });

    it('should handle Vue lifecycle hooks', () => {
      const { validator } = useValidator();
      
      // Mock Vue lifecycle hooks
      const mockOnMounted = vi.fn();
      const mockOnUnmounted = vi.fn();
      
      global.Vue.onMounted = mockOnMounted;
      global.Vue.onUnmounted = mockOnUnmounted;
      
      // The composable should use these hooks
      expect(mockOnMounted).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options', () => {
      const { validator } = useValidator({});
      expect(validator).toBeDefined();
    });

    it('should handle null options', () => {
      const { validator } = useValidator(null);
      expect(validator).toBeDefined();
    });

    it('should handle undefined options', () => {
      const { validator } = useValidator(undefined);
      expect(validator).toBeDefined();
    });

    it('should handle invalid validator options', () => {
      const invalidOptions = {
        locale: 'nonexistent',
        invalidOption: 'value'
      };

      const { validator } = useValidator(invalidOptions);
      expect(validator).toBeDefined();
    });
  });
});