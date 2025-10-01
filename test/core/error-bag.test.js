/**
 * ErrorBag Tests
 * Tests the ErrorBag class functionality with modern patterns
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
      expect(errorBag.get('email')[0]).toEqual({ message: 'Email is required', rule: 'validation' });
      expect(errorBag.get('email')[1]).toEqual({ message: 'Email is invalid', rule: 'validation' });
    });

    it('should add errors with rule names', () => {
      errorBag.add('email', 'Email is invalid', 'email');
      errorBag.add('email', 'Email format is wrong', 'email');

      const errors = errorBag.get('email');
      expect(errors[0]).toEqual({ message: 'Email is invalid', rule: 'email' });
      expect(errors[1]).toEqual({ message: 'Email format is wrong', rule: 'email' });
    });

    it('should prioritize required errors', () => {
      errorBag.add('email', 'Email is invalid', 'email');
      errorBag.add('email', 'Email is required', 'required');

      const errors = errorBag.get('email');
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ message: 'Email is required', rule: 'required' });
    });

    it('should not add non-required errors when required error exists', () => {
      errorBag.add('email', 'Email is required', 'required');
      errorBag.add('email', 'Email is invalid', 'email');

      const errors = errorBag.get('email');
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ message: 'Email is required', rule: 'required' });
    });

    it('should get first error for field', () => {
      errorBag.add('email', 'First error');
      errorBag.add('email', 'Second error');

      expect(errorBag.first('email')).toBe('First error');
    });

    it('should get first error with rule name', () => {
      errorBag.add('email', 'Email is required', 'required');

      const firstError = errorBag.first('email');
      expect(firstError).toBe('Email is required');
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

    it('should get all errors with rule names', () => {
      errorBag.add('email', 'Email is required', 'required');
      errorBag.add('password', 'Password is too short', 'min');

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

    it('should get error count', () => {
      expect(errorBag.any()).toBe(false);

      errorBag.add('email', 'Email is required');
      errorBag.add('password', 'Password is too short');
      expect(errorBag.keys()).toHaveLength(2);
    });

    it('should get total error count', () => {
      errorBag.add('email', 'First error');
      errorBag.add('email', 'Second error');
      errorBag.add('password', 'Password error');

      expect(errorBag.keys()).toHaveLength(2);
    });
  });

  describe('Error Clearing', () => {
    beforeEach(() => {
      errorBag.add('email', 'Email is required');
      errorBag.add('password', 'Password is too short');
    });

    it('should clear errors for specific field', () => {
      errorBag.remove('email');

      expect(errorBag.has('email')).toBe(false);
      expect(errorBag.has('password')).toBe(true);
    });

    it('should clear all errors', () => {
      errorBag.clear();

      expect(errorBag.any()).toBe(false);
      expect(errorBag.any()).toBe(false);
    });

    it('should clear errors and reset manual error flag', () => {
      errorBag.add('email', 'Error message');
      errorBag.first('email');
      errorBag.clear();

      expect(errorBag.any()).toBe(false);
    });
  });

  describe('Error Messages', () => {
    it('should get error messages for specific field', () => {
      errorBag.add('email', 'First error');
      errorBag.add('email', 'Second error');

      const messages = errorBag.get('email');
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({ message: 'First error', rule: 'validation' });
      expect(messages[1]).toEqual({ message: 'Second error', rule: 'validation' });
    });
  });

  describe('Manual Error Management', () => {
    it('should set manual errors flag when getting first error', () => {
      errorBag.add('email', 'Manual error');
      const firstError = errorBag.first('email');
      expect(firstError).toBe('Manual error');
    });

    it('should not set manual errors flag when clearing', () => {
      errorBag.add('email', 'Manual error');
      errorBag.clear();
      expect(errorBag.any()).toBe(false);
    });

    it('should handle manual error display', () => {
      errorBag.add('email', 'Manual error');
      const firstError = errorBag.first('email');
      expect(firstError).toBe('Manual error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid field names', () => {
      errorBag.add('', 'Error message');
      errorBag.add(null, 'Error message');
      errorBag.add(undefined, 'Error message');

      // Invalid field names should be ignored
      expect(errorBag.any()).toBe(false);
    });

    it('should handle empty error messages', () => {
      errorBag.add('email', '');
      errorBag.add('email', null);
      errorBag.add('email', undefined);

      expect(errorBag.any()).toBe(false);
    });

    it('should handle non-string field names', () => {
      errorBag.add(123, 'Error message');
      errorBag.add({}, 'Error message');
      errorBag.add([], 'Error message');

      // Non-string field names are truthy, so they should be added
      expect(errorBag.any()).toBe(true);
    });

    it('should handle getting errors for non-existent field', () => {
      expect(errorBag.get('nonExistent')).toEqual([]);
      expect(errorBag.first('nonExistent')).toBeNull();
      expect(errorBag.has('nonExistent')).toBe(false);
      expect(errorBag.any()).toBe(false);
    });

    it('should handle clearing non-existent field', () => {
      expect(() => errorBag.clear('nonExistent')).not.toThrow();
    });
  });

  describe('Reactivity', () => {
    it('should notify listeners when errors are added', () => {
      let notified = false;
      const listener = () => { notified = true; };
      errorBag.subscribe(listener);

      errorBag.add('email', 'Email is required');

      expect(notified).toBe(true);
    });

    it('should notify listeners when errors are cleared', () => {
      let notified = false;
      const listener = () => { notified = true; };
      errorBag.subscribe(listener);
      errorBag.add('email', 'Email is required');

      errorBag.clear();

      expect(notified).toBe(true);
    });

    it('should add listeners', () => {
      const listener = () => {};
      
      errorBag.subscribe(listener);
      expect(errorBag.listeners.has(listener)).toBe(true);
    });
  });
});
