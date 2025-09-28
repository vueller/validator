/**
 * Tests for global validation API
 * Testing globalValidation methods
 */

import { globalValidation } from '../../src/vue/global-validation.js';
import { setGlobalValidator } from '../../src/vue/directives/validate-directive.js';
import { Validator } from '../../src/core/index.js';

// Mock DOM
Object.defineProperty(global, 'document', {
  value: {
    activeElement: {
      closest: jest.fn().mockReturnValue(null)
    },
    body: {
      closest: jest.fn().mockReturnValue(null)
    }
  },
  writable: true
});

describe('Global Validation API', () => {
  let mockValidator;

  beforeEach(() => {
    mockValidator = {
      validateField: jest.fn().mockResolvedValue(true),
      validateAll: jest.fn().mockResolvedValue(true),
      errors: jest.fn().mockReturnValue({
        allByField: jest.fn().mockReturnValue({})
      }),
      isValid: true,
      reset: jest.fn()
    };
    
    // Reset global validator
    setGlobalValidator(null);
  });

  describe('validate method', () => {
    test('should return true when no global validator', async () => {
      const result = await globalValidation.validate();
      expect(result).toBe(true);
    });

    test('should validate specific field when fieldName provided', async () => {
      setGlobalValidator(mockValidator);
      
      const result = await globalValidation.validate(null, 'email');
      
      expect(mockValidator.validateField).toHaveBeenCalledWith('email', undefined, {});
      expect(result).toBe(true);
    });

    test('should validate all fields when scope provided', async () => {
      setGlobalValidator(mockValidator);
      
      const result = await globalValidation.validate('form1');
      
      expect(mockValidator.validateAll).toHaveBeenCalledWith({});
      expect(result).toBe(true);
    });

    test('should return object with field method when no parameters', async () => {
      setGlobalValidator(mockValidator);
      
      const result = globalValidation.validate();
      
      expect(result).toHaveProperty('field');
      expect(typeof result.field).toBe('function');
      
      // Test field method
      await result.field('email');
      expect(mockValidator.validateField).toHaveBeenCalledWith('email', undefined, {});
    });
  });

  describe('getErrors method', () => {
    test('should return empty object when no global validator', () => {
      const errors = globalValidation.getErrors();
      expect(errors).toEqual({});
    });

    test('should return errors from global validator', () => {
      const mockErrors = { email: ['Email is required'] };
      mockValidator.errors.mockReturnValue({
        allByField: jest.fn().mockReturnValue(mockErrors)
      });
      
      setGlobalValidator(mockValidator);
      
      const errors = globalValidation.getErrors();
      expect(errors).toEqual(mockErrors);
    });

    test('should handle validator without allByField method', () => {
      mockValidator.errors.mockReturnValue({});
      setGlobalValidator(mockValidator);
      
      const errors = globalValidation.getErrors();
      expect(errors).toEqual({});
    });
  });

  describe('isValid method', () => {
    test('should return true when no global validator', () => {
      const isValid = globalValidation.isValid();
      expect(isValid).toBe(true);
    });

    test('should return validator isValid state', () => {
      mockValidator.isValid = false;
      setGlobalValidator(mockValidator);
      
      const isValid = globalValidation.isValid();
      expect(isValid).toBe(false);
    });

    test('should return true as fallback', () => {
      mockValidator.isValid = undefined;
      setGlobalValidator(mockValidator);
      
      const isValid = globalValidation.isValid();
      expect(isValid).toBe(true);
    });
  });

  describe('reset method', () => {
    test('should do nothing when no global validator', () => {
      expect(() => globalValidation.reset()).not.toThrow();
    });

    test('should call reset on global validator', () => {
      setGlobalValidator(mockValidator);
      
      globalValidation.reset();
      
      expect(mockValidator.reset).toHaveBeenCalled();
    });
  });

  describe('integration with form data', () => {
    test('should extract form data from DOM', async () => {
      const mockForm = {
        querySelectorAll: jest.fn().mockReturnValue([
          { name: 'email', value: 'test@example.com', type: 'email' },
          { name: 'password', value: 'secret123', type: 'password' }
        ])
      };

      document.activeElement.closest = jest.fn().mockReturnValue(mockForm);
      
      setGlobalValidator(mockValidator);
      
      await globalValidation.validate(null, 'email');
      
      expect(mockValidator.validateField).toHaveBeenCalledWith(
        'email', 
        'test@example.com', 
        { email: 'test@example.com', password: 'secret123' }
      );
    });
  });
});
