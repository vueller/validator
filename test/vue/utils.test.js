/**
 * Tests for Vue utilities
 * Testing DOM helpers and validation helpers
 */

import { 
  getFieldName, 
  getFormData, 
  updateFieldClasses, 
  cleanupValidationListeners,
  debounce 
} from '../../src/vue/utils/dom-helpers.js';

import { 
  parseRules, 
  createValidationHandler, 
  setupValidationEvents 
} from '../../src/vue/utils/validation-helpers.js';

import { Validator } from '../../src/core/index.js';

// Mock DOM environment
const mockElement = (props = {}) => ({
  name: props.name || '',
  id: props.id || '',
  classList: {
    classes: new Set(),
    add: function(className) { this.classes.add(className); },
    remove: function(className) { this.classes.delete(className); },
    contains: function(className) { return this.classes.has(className); }
  },
  closest: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  ...props
});

const mockVNode = (props = {}) => ({
  props: props
});

describe('Vue Utils - DOM Helpers', () => {
  describe('getFieldName', () => {
    test('should get field name from name attribute', () => {
      const el = mockElement({ name: 'email' });
      const vnode = mockVNode();
      
      const fieldName = getFieldName(el, vnode);
      expect(fieldName).toBe('email');
    });

    test('should get field name from v-model directive', () => {
      const el = mockElement();
      const vnode = mockVNode({ 'onUpdate:username': jest.fn() });
      
      const fieldName = getFieldName(el, vnode);
      expect(fieldName).toBe('username');
    });

    test('should get field name from id attribute as fallback', () => {
      const el = mockElement({ id: 'password' });
      const vnode = mockVNode();
      
      const fieldName = getFieldName(el, vnode);
      expect(fieldName).toBe('password');
    });

    test('should return null if no field name found', () => {
      const el = mockElement();
      const vnode = mockVNode();
      
      const fieldName = getFieldName(el, vnode);
      expect(fieldName).toBeNull();
    });
  });

  describe('getFormData', () => {
    test('should extract form data from form elements', () => {
      const mockForm = {
        querySelectorAll: jest.fn().mockReturnValue([
          { name: 'email', value: 'test@example.com', type: 'email' },
          { name: 'password', value: 'secret123', type: 'password' },
          { name: 'remember', checked: true, type: 'checkbox' },
          { name: 'gender', value: 'male', checked: true, type: 'radio' }
        ])
      };

      const el = {
        closest: jest.fn().mockReturnValue(mockForm)
      };

      const formData = getFormData(el);
      
      expect(formData).toEqual({
        email: 'test@example.com',
        password: 'secret123',
        remember: true,
        gender: 'male'
      });
    });

    test('should return empty object if no form found', () => {
      const el = {
        closest: jest.fn().mockReturnValue(null)
      };

      const formData = getFormData(el);
      expect(formData).toEqual({});
    });
  });

  describe('updateFieldClasses', () => {
    test('should add valid class when no errors', () => {
      const el = mockElement();
      const validator = {
        errors: () => ({
          has: () => false
        })
      };

      updateFieldClasses(el, validator, 'email');
      
      expect(el.classList.contains('v-valid')).toBe(true);
      expect(el.classList.contains('v-invalid')).toBe(false);
    });

    test('should add invalid classes when errors exist', () => {
      const el = mockElement();
      const validator = {
        errors: () => ({
          has: () => true
        })
      };

      updateFieldClasses(el, validator, 'email');
      
      expect(el.classList.contains('v-invalid')).toBe(true);
      expect(el.classList.contains('v-has-error')).toBe(true);
      expect(el.classList.contains('v-valid')).toBe(false);
    });
  });

  describe('cleanupValidationListeners', () => {
    test('should remove event listeners and clean up references', () => {
      const el = mockElement();
      el._blurHandler = jest.fn();
      el._inputHandler = jest.fn();

      cleanupValidationListeners(el);

      expect(el.removeEventListener).toHaveBeenCalledWith('blur', el._blurHandler);
      expect(el.removeEventListener).toHaveBeenCalledWith('input', el._inputHandler);
      expect(el._blurHandler).toBeUndefined();
      expect(el._inputHandler).toBeUndefined();
    });
  });

  describe('debounce', () => {
    test('should debounce function calls', (done) => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test1');
      debouncedFn('test2');
      debouncedFn('test3');

      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();

      setTimeout(() => {
        // Should be called only once with the last arguments
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('test3');
        done();
      }, 150);
    });
  });
});

describe('Vue Utils - Validation Helpers', () => {
  describe('parseRules', () => {
    test('should parse string rules', () => {
      const rules = parseRules('required|email|min:5');
      
      expect(rules).toEqual({
        required: true,
        email: true,
        min: '5'
      });
    });

    test('should parse complex string rules with colons', () => {
      const rules = parseRules('required|pattern:^[A-Z]{2}\\d{4}$|min:6');
      
      expect(rules).toEqual({
        required: true,
        pattern: '^[A-Z]{2}\\d{4}$',
        min: '6'
      });
    });

    test('should return object rules as-is', () => {
      const originalRules = { required: true, email: true, min: 5 };
      const rules = parseRules(originalRules);
      
      expect(rules).toEqual(originalRules);
    });

    test('should return empty object for null/undefined rules', () => {
      expect(parseRules(null)).toEqual({});
      expect(parseRules(undefined)).toEqual({});
    });
  });

  describe('createValidationHandler', () => {
    test('should create validation handler that validates field', async () => {
      const el = mockElement();
      const validator = {
        validateField: jest.fn().mockResolvedValue(true)
      };
      
      // Mock getFormData
      el.closest = jest.fn().mockReturnValue({
        querySelectorAll: jest.fn().mockReturnValue([])
      });

      const handler = createValidationHandler(el, validator, 'email', 'blur');
      
      const mockEvent = {
        target: { value: 'test@example.com' }
      };

      await handler(mockEvent);

      expect(validator.validateField).toHaveBeenCalledWith('email', 'test@example.com', {});
    });

    test('should handle validation errors gracefully', async () => {
      const el = mockElement();
      const validator = {
        validateField: jest.fn().mockRejectedValue(new Error('Validation failed'))
      };
      
      el.closest = jest.fn().mockReturnValue(null);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const handler = createValidationHandler(el, validator, 'email', 'blur');
      
      const mockEvent = {
        target: { value: 'invalid-email' }
      };

      await handler(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Validation error for field email on blur:'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});

// Console mock for tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});
