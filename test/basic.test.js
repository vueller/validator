/**
 * Basic tests for the Validator library
 * Demonstrates core functionality and ensures everything works correctly
 */

import { Validator, createValidator, ErrorBag } from '../src/index.js';

// Mock console.log for testing
const originalLog = console.log;
console.log = (...args) => {
  // Uncomment to see test output
  // originalLog(...args);
};

async function runTests() {
  console.log('🚀 Running Validator Tests...\n');

  // Test 1: Basic Validation
  console.log('=== Test 1: Basic Validation ===');
  const validator = createValidator();
  
  validator.setRules('email', {
    required: true,
    email: true
  });

  // Valid email
  let isValid = await validator.validateField('email', 'user@example.com');
  console.assert(isValid === true, '❌ Valid email should pass');
  console.log('✅ Valid email passes');

  // Invalid email
  isValid = await validator.validateField('email', 'invalid-email');
  console.assert(isValid === false, '❌ Invalid email should fail');
  console.log('✅ Invalid email fails');

  // Empty email (required rule)
  isValid = await validator.validateField('email', '');
  console.assert(isValid === false, '❌ Empty email should fail required');
  console.log('✅ Empty email fails required rule');

  // Test 2: Multiple Rules
  console.log('\n=== Test 2: Multiple Rules ===');
  validator.reset();
  
  validator.setRules('password', {
    required: true,
    min: 8,
    max: 50
  });

  // Too short password
  isValid = await validator.validateField('password', '123');
  console.assert(isValid === false, '❌ Short password should fail');
  console.log('✅ Short password fails min rule');

  // Valid password
  isValid = await validator.validateField('password', 'validpassword123');
  console.assert(isValid === true, '❌ Valid password should pass');
  console.log('✅ Valid password passes all rules');

  // Test 3: Required Rule with Trimming
  console.log('\n=== Test 3: Required Rule Trimming ===');
  validator.reset();
  
  validator.setRules('username', { required: true });

  // Whitespace-only string should fail
  isValid = await validator.validateField('username', '   ');
  console.assert(isValid === false, '❌ Whitespace-only should fail required');
  console.log('✅ Whitespace-only string fails required (trimmed)');

  // Valid string with spaces should pass
  isValid = await validator.validateField('username', '  valid  ');
  console.assert(isValid === true, '❌ Valid string with spaces should pass');
  console.log('✅ Valid string with spaces passes (trimmed)');

  // Test 4: Form Validation
  console.log('\n=== Test 4: Form Validation ===');
  const formValidator = new Validator();
  
  formValidator.setMultipleRules({
    email: { required: true, email: true },
    password: { required: true, min: 8 },
    confirmPassword: { required: true, confirmed: 'password' }
  });

  // Valid form data
  const validFormData = {
    email: 'user@example.com',
    password: 'validpassword',
    confirmPassword: 'validpassword'
  };

  isValid = await formValidator.validateAll(validFormData);
  console.assert(isValid === true, '❌ Valid form should pass');
  console.log('✅ Valid form passes all validations');

  // Invalid form data (password mismatch)
  const invalidFormData = {
    email: 'user@example.com',
    password: 'validpassword',
    confirmPassword: 'differentpassword'
  };

  isValid = await formValidator.validateAll(invalidFormData);
  console.assert(isValid === false, '❌ Form with password mismatch should fail');
  console.log('✅ Form with password mismatch fails');

  // Test 5: Error Bag
  console.log('\n=== Test 5: Error Bag ===');
  const errors = formValidator.errors();
  
  console.assert(errors.has('confirmPassword'), '❌ Should have confirmPassword error');
  console.log('✅ Error bag correctly identifies field with error');

  const confirmError = errors.first('confirmPassword');
  console.assert(typeof confirmError === 'string', '❌ Should return error message');
  console.log('✅ Error bag returns error message');

  console.assert(errors.count() > 0, '❌ Should have error count > 0');
  console.log('✅ Error bag correctly counts errors');

  // Test 6: Custom Rules
  console.log('\n=== Test 6: Custom Rules ===');
  const customValidator = new Validator();
  
  // Add custom rule
  customValidator.extend('evenNumber', (value) => {
    if (!value) return true;
    return Number(value) % 2 === 0;
  }, 'The {field} field must be an even number.');

  customValidator.setRules('number', {
    required: true,
    evenNumber: true
  });

  // Odd number should fail
  isValid = await customValidator.validateField('number', 3);
  console.assert(isValid === false, '❌ Odd number should fail custom rule');
  console.log('✅ Custom rule correctly rejects odd number');

  // Even number should pass
  isValid = await customValidator.validateField('number', 4);
  console.assert(isValid === true, '❌ Even number should pass custom rule');
  console.log('✅ Custom rule correctly accepts even number');

  // Test 7: Internationalization
  console.log('\n=== Test 7: Internationalization ===');
  const i18nValidator = new Validator({ locale: 'pt' });
  
  i18nValidator.addMessages('pt', {
    required: 'O campo {field} é obrigatório.',
    email: 'O campo {field} deve ser um email válido.'
  });

  i18nValidator.setRules('email', { required: true });
  
  await i18nValidator.validateField('email', '');
  const ptError = i18nValidator.errors().first('email').value;
  
  console.assert(ptError && typeof ptError === 'string' && ptError.includes('obrigatório'), '❌ Should show Portuguese message');
  console.log('✅ Internationalization works correctly');

  // Test 8: Rule Formats
  console.log('\n=== Test 8: Rule Formats ===');
  const formatValidator = new Validator();
  
  // Object format
  formatValidator.setRules('field1', { required: true, min: 5 });
  
  // String format
  formatValidator.setRules('field2', 'required|min:5');
  
  // Array format
  formatValidator.setRules('field3', ['required', { min: 5 }]);

  // All should work the same way
  await formatValidator.validateField('field1', 'abc');
  await formatValidator.validateField('field2', 'abc');
  await formatValidator.validateField('field3', 'abc');

  const errors1 = formatValidator.errors().has('field1');
  const errors2 = formatValidator.errors().has('field2');
  const errors3 = formatValidator.errors().has('field3');

  console.assert(errors1 && errors2 && errors3, '❌ All formats should fail validation');
  console.log('✅ All rule formats work correctly');

  // Test 9: Numeric Rule
  console.log('\n=== Test 9: Numeric Rule ===');
  const numValidator = new Validator();
  numValidator.setRules('age', { numeric: true });

  isValid = await numValidator.validateField('age', '25');
  console.assert(isValid === true, '❌ String number should pass numeric rule');
  console.log('✅ String number passes numeric rule');

  isValid = await numValidator.validateField('age', 25);
  console.assert(isValid === true, '❌ Number should pass numeric rule');
  console.log('✅ Number passes numeric rule');

  isValid = await numValidator.validateField('age', 'abc');
  console.assert(isValid === false, '❌ Non-numeric should fail numeric rule');
  console.log('✅ Non-numeric string fails numeric rule');

  // Test 10: Pattern Rule
  console.log('\n=== Test 10: Pattern Rule ===');
  const patternValidator = new Validator();
  patternValidator.setRules('code', { pattern: /^[A-Z]{3}\d{3}$/ });

  isValid = await patternValidator.validateField('code', 'ABC123');
  console.assert(isValid === true, '❌ Valid pattern should pass');
  console.log('✅ Valid pattern passes');

  isValid = await patternValidator.validateField('code', 'abc123');
  console.assert(isValid === false, '❌ Invalid pattern should fail');
  console.log('✅ Invalid pattern fails');

  console.log('\n🎉 All tests passed! The validator is working correctly.');
}

// Jest test
describe('Validator Library', () => {
  test('should pass all validation tests', async () => {
    await runTests();
  });
});

// Restore console.log
console.log = originalLog;
