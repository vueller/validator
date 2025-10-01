/**
 * Tests for createValidator API
 */

import { createValidator, createFormValidator, createSimpleValidator } from '../../src/api/create-validator.js';

describe('createValidator', () => {
  let validator;

  beforeEach(() => {
    validator = createValidator();
  });

  test('should create a validator instance', () => {
    expect(validator).toBeDefined();
    expect(typeof validator.validate).toBe('function');
    expect(typeof validator.rules).toBe('function');
    expect(typeof validator.data).toBe('function');
  });

  test('should support method chaining', () => {
    const result = validator
      .rules('email', 'required|email')
      .data({ email: 'test@example.com' })
      .label('email', 'Email Address');

    expect(result).toBe(validator);
  });

  test('should validate data correctly', async () => {
    validator
      .rules('email', 'required|email')
      .data({ email: 'test@example.com' });

    const isValid = await validator.validate();
    expect(isValid).toBe(true);
  });

  test('should handle validation errors', async () => {
    validator
      .rules('email', 'required|email')
      .data({ email: 'invalid-email' });

    const isValid = await validator.validate();
    expect(isValid).toBe(false);
    expect(validator.hasErrors()).toBe(true);
  });
});

describe('createFormValidator', () => {
  test('should create form validator with initial config', () => {
    const formValidator = createFormValidator({
      rules: {
        email: 'required|email',
        name: 'required|min:2'
      },
      initialData: {
        email: 'test@example.com',
        name: 'John'
      }
    });

    expect(formValidator).toBeDefined();
    expect(typeof formValidator.submit).toBe('function');
    expect(typeof formValidator.field).toBe('function');
  });

  test('should handle form submission', async () => {
    const formValidator = createFormValidator({
      rules: {
        email: 'required|email'
      },
      initialData: {
        email: 'test@example.com'
      }
    });

    let successCalled = false;
    let errorCalled = false;

    await formValidator.submit(
      (data) => { successCalled = true; },
      (errors) => { errorCalled = true; }
    );

    expect(successCalled).toBe(true);
    expect(errorCalled).toBe(false);
  });

  test('should provide field-specific methods', () => {
    const formValidator = createFormValidator({
      rules: {
        email: 'required|email'
      }
    });

    const emailField = formValidator.field('email');
    
    expect(typeof emailField.validate).toBe('function');
    expect(typeof emailField.setValue).toBe('function');
    expect(typeof emailField.getValue).toBe('function');
    expect(typeof emailField.hasError).toBe('function');
    expect(typeof emailField.getError).toBe('function');
  });
});

describe('createSimpleValidator', () => {
  test('should create simple validator for string rules', async () => {
    const simpleValidator = createSimpleValidator('required|email');
    
    const result1 = await simpleValidator.validate({ value: 'test@example.com' });
    expect(result1).toBe(true);

    const result2 = await simpleValidator.validate({ value: 'invalid-email' });
    expect(result2).toBe(false);
  });

  test('should create simple validator for object rules', async () => {
    const simpleValidator = createSimpleValidator({
      email: 'required|email',
      passwordField: 'required|min:6'
    });

    const result1 = await simpleValidator.validate({
      email: 'test@example.com',
      passwordField: 'secret123'
    });
    expect(result1).toBe(true);

    const result2 = await simpleValidator.validate({
      email: 'invalid-email',
      passwordField: '123'
    });
    expect(result2).toBe(false);
  });
});
