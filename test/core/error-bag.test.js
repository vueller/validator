/**
 * ErrorBag Tests
 * Tests the ErrorBag class functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ErrorBag } from '../../src/core/ErrorBag.js';

describe('ErrorBag', () => {
  let errorBag;

  beforeEach(() => {
    errorBag = new ErrorBag();
  });

  describe('Error Management', () => {
    it('should add errors for field', () => {
      errorBag.add('email', 'Email is required');
      errorBag.add('email', 'Email is invalid');

      expect(errorBag.has('email')).toBe(true);
      expect(errorBag.get('email')).toHaveLength(2);
      expect(errorBag.get('email')).toContain('Email is required');
      expect(errorBag.get('email')).toContain('Email is invalid');
    });

    it('should get first error for field', () => {
      errorBag.add('email', 'First error');
      errorBag.add('email', 'Second error');

      expect(errorBag.first('email')).toBe('First error');
    });

    it('should get all errors by field', () => {
      errorBag.add('email', 'Email is required');
      errorBag.add('password', 'Password is too short');

      const allErrors = errorBag.allByField();
      expect(allErrors).toEqual({
        email: ['Email is required'],
        password: ['Password is too short']
      });
    });

    it('should check if field has errors', () => {
      expect(errorBag.has('email')).toBe(false);
      
      errorBag.add('email', 'Email is required');
      expect(errorBag.has('email')).toBe(true);
    });

    it('should check if any field has errors', () => {
      expect(errorBag.any()).toBe(false);
      
      errorBag.add('email', 'Email is required');
      expect(errorBag.any()).toBe(true);
    });

    it('should remove errors for field', () => {
      errorBag.add('email', 'Email is required');
      errorBag.add('password', 'Password is too short');

      expect(errorBag.has('email')).toBe(true);
      expect(errorBag.has('password')).toBe(true);

      errorBag.remove('email');
      expect(errorBag.has('email')).toBe(false);
      expect(errorBag.has('password')).toBe(true);
    });

    it('should clear all errors', () => {
      errorBag.add('email', 'Email is required');
      errorBag.add('password', 'Password is too short');

      expect(errorBag.any()).toBe(true);

      errorBag.clear();
      expect(errorBag.any()).toBe(false);
    });
  });

  describe('Error Counting', () => {
    it('should count errors for field', () => {
      errorBag.add('email', 'First error');
      errorBag.add('email', 'Second error');

      expect(errorBag.count('email')).toBe(2);
    });

    it('should count total errors', () => {
      errorBag.add('email', 'Email error 1');
      errorBag.add('email', 'Email error 2');
      errorBag.add('password', 'Password error');

      expect(errorBag.count()).toBe(3);
    });

    it('should return 0 for non-existent field', () => {
      expect(errorBag.count('nonexistent')).toBe(0);
    });
  });

  describe('Error Retrieval', () => {
    it('should return empty array for non-existent field', () => {
      expect(errorBag.get('nonexistent')).toEqual([]);
    });

    it('should return null for first error of non-existent field', () => {
      expect(errorBag.first('nonexistent')).toBeNull();
    });

    it('should return empty object when no errors', () => {
      expect(errorBag.allByField()).toEqual({});
    });
  });

  describe('Reactivity', () => {
    it('should notify listeners when errors are added', (done) => {
      errorBag.subscribe(() => {
        done();
      });

      errorBag.add('email', 'Email is required');
    });

    it('should notify listeners when errors are removed', (done) => {
      errorBag.add('email', 'Email is required');
      
      errorBag.subscribe(() => {
        done();
      });

      errorBag.remove('email');
    });

    it('should notify listeners when errors are cleared', (done) => {
      errorBag.add('email', 'Email is required');
      
      errorBag.subscribe(() => {
        done();
      });

      errorBag.clear();
    });

    it('should allow unsubscribing from notifications', () => {
      const callback = jest.fn();
      const unsubscribe = errorBag.subscribe(callback);

      errorBag.add('email', 'Email is required');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      errorBag.add('password', 'Password is required');
      expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Vue State Creation', () => {
    it('should create Vue state when Vue is available', () => {
      // Mock Vue
      global.Vue = {
        reactive: jest.fn((obj) => obj),
        computed: jest.fn((fn) => ({ value: fn() }))
      };

      const vueState = errorBag.createVueState();
      expect(vueState).toBeDefined();
      expect(vueState.errors).toBeDefined();
      expect(vueState.has).toBeDefined();
      expect(vueState.first).toBeDefined();
      expect(vueState.any).toBeDefined();

      delete global.Vue;
    });

    it('should create plain state when Vue is not available', () => {
      const plainState = errorBag.createPlainState();
      expect(plainState).toBeDefined();
      expect(plainState.errors).toBeDefined();
      expect(plainState.has).toBeDefined();
      expect(plainState.first).toBeDefined();
      expect(plainState.any).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error messages', () => {
      errorBag.add('email', '');
      expect(errorBag.has('email')).toBe(true);
      expect(errorBag.get('email')).toContain('');
    });

    it('should handle null error messages', () => {
      errorBag.add('email', null);
      expect(errorBag.has('email')).toBe(true);
      expect(errorBag.get('email')).toContain(null);
    });

    it('should handle undefined field names', () => {
      errorBag.add(undefined, 'Error message');
      expect(errorBag.has(undefined)).toBe(true);
    });

    it('should handle special characters in field names', () => {
      const fieldName = 'user.email@domain.com';
      errorBag.add(fieldName, 'Error message');
      expect(errorBag.has(fieldName)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large number of errors efficiently', () => {
      const startTime = performance.now();
      
      // Add 1000 errors
      for (let i = 0; i < 1000; i++) {
        errorBag.add(`field${i}`, `Error ${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
      expect(errorBag.count()).toBe(1000);
    });

    it('should handle frequent add/remove operations', () => {
      const startTime = performance.now();
      
      // Perform 1000 add/remove cycles
      for (let i = 0; i < 1000; i++) {
        errorBag.add('email', `Error ${i}`);
        errorBag.remove('email');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete in less than 50ms
      expect(errorBag.any()).toBe(false);
    });
  });
});
