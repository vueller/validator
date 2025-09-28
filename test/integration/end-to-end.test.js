/**
 * End-to-End Integration Tests
 * Tests complete validation workflows
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { validator } from '../../src/universal-validator.js';
import { ptBR, en } from '../../src/locales/index.js';

describe('End-to-End Integration', () => {
  beforeEach(() => {
    // Reset validator state
    validator.reset();
  });

  describe('Complete Form Validation Workflow', () => {
    it('should handle complete user registration form', async () => {
      // Set up form rules
      validator.setMultipleRules({
        name: { required: true, min: 2 },
        email: { required: true, email: true },
        password: { required: true, min: 8 },
        confirmPassword: { required: true, confirmed: 'password' },
        age: { required: true, numeric: true, min: 18 },
        phone: { required: true, pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ }
      }, {}, 'registrationForm');

      // Test valid data
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        age: '25',
        phone: '(11) 99999-9999'
      };

      const isValid = await validator.validate('registrationForm', validData);
      expect(isValid).toBe(true);

      // Test invalid data
      const invalidData = {
        name: 'J', // Too short
        email: 'invalid-email', // Invalid email
        password: '123', // Too short
        confirmPassword: 'different', // Doesn't match
        age: '15', // Too young
        phone: 'invalid-phone' // Invalid format
      };

      const isInvalid = await validator.validate('registrationForm', invalidData);
      expect(isInvalid).toBe(false);

      // Check specific errors
      const errors = validator.getErrors();
      expect(errors).toHaveProperty('registrationForm.name');
      expect(errors).toHaveProperty('registrationForm.email');
      expect(errors).toHaveProperty('registrationForm.password');
      expect(errors).toHaveProperty('registrationForm.confirmPassword');
      expect(errors).toHaveProperty('registrationForm.age');
      expect(errors).toHaveProperty('registrationForm.phone');
    });

    it('should handle multi-step form validation', async () => {
      // Step 1: Personal Information
      validator.setMultipleRules({
        firstName: { required: true, min: 2 },
        lastName: { required: true, min: 2 },
        email: { required: true, email: true }
      }, {}, 'personalInfo');

      // Step 2: Address Information
      validator.setMultipleRules({
        street: { required: true, min: 5 },
        city: { required: true, min: 2 },
        zipCode: { required: true, pattern: /^\d{5}-\d{3}$/ }
      }, {}, 'addressInfo');

      // Step 3: Payment Information
      validator.setMultipleRules({
        cardNumber: { required: true, pattern: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/ },
        expiryDate: { required: true, pattern: /^\d{2}\/\d{2}$/ },
        cvv: { required: true, pattern: /^\d{3}$/ }
      }, {}, 'paymentInfo');

      // Validate each step
      const step1Data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const step1Valid = await validator.validate('personalInfo', step1Data);
      expect(step1Valid).toBe(true);

      const step2Data = {
        street: '123 Main Street',
        city: 'New York',
        zipCode: '12345-678'
      };
      const step2Valid = await validator.validate('addressInfo', step2Data);
      expect(step2Valid).toBe(true);

      const step3Data = {
        cardNumber: '1234 5678 9012 3456',
        expiryDate: '12/25',
        cvv: '123'
      };
      const step3Valid = await validator.validate('paymentInfo', step3Data);
      expect(step3Valid).toBe(true);
    });
  });

  describe('Internationalization Workflow', () => {
    it('should handle complete i18n workflow', async () => {
      // Set up rules
      validator.setMultipleRules({
        email: { required: true, email: true },
        password: { required: true, min: 8 }
      }, {}, 'loginForm');

      // Test with English
      validator.setLocale('en');
      validator.loadTranslations(en, {
        'email.required': 'Email is required',
        'password.min': 'Password must be at least {min} characters'
      });

      await validator.validate('loginForm', { email: '', password: '123' });
      let errors = validator.getErrors();
      expect(errors).toHaveProperty('loginForm.email');
      expect(errors).toHaveProperty('loginForm.password');

      // Test with Portuguese
      validator.setLocale('pt-BR');
      validator.loadTranslations(ptBR, {
        'email.required': 'Email é obrigatório',
        'password.min': 'Senha deve ter pelo menos {min} caracteres'
      });

      await validator.validate('loginForm', { email: '', password: '123' });
      errors = validator.getErrors();
      expect(errors).toHaveProperty('loginForm.email');
      expect(errors).toHaveProperty('loginForm.password');

      // Test with custom Spanish
      validator.setLocale('es');
      validator.loadTranslations(null, {
        required: 'El campo {field} es obligatorio',
        email: 'El campo {field} debe ser un email válido',
        min: 'El campo {field} debe tener al menos {min} caracteres'
      });

      await validator.validate('loginForm', { email: '', password: '123' });
      errors = validator.getErrors();
      expect(errors).toHaveProperty('loginForm.email');
      expect(errors).toHaveProperty('loginForm.password');
    });
  });

  describe('Custom Rules Workflow', () => {
    it('should handle custom business rules', async () => {
      // Add custom rules
      validator.extend('cpf', (value) => {
        const cpf = value.replace(/\D/g, '');
        return cpf.length === 11 && cpf !== '00000000000';
      });

      validator.extend('cnpj', (value) => {
        const cnpj = value.replace(/\D/g, '');
        return cnpj.length === 14 && cnpj !== '00000000000000';
      });

      validator.extend('phoneBR', (value) => {
        const phone = value.replace(/\D/g, '');
        return phone.length === 11 && phone.startsWith('11');
      });

      // Set up form with custom rules
      validator.setMultipleRules({
        cpf: { required: true, cpf: true },
        cnpj: { required: true, cnpj: true },
        phone: { required: true, phoneBR: true }
      }, {}, 'businessForm');

      // Test valid data
      const validData = {
        cpf: '12345678901',
        cnpj: '12345678000195',
        phone: '11999999999'
      };

      const isValid = await validator.validate('businessForm', validData);
      expect(isValid).toBe(true);

      // Test invalid data
      const invalidData = {
        cpf: '123456789', // Too short
        cnpj: '123456780001', // Too short
        phone: '21999999999' // Wrong area code
      };

      const isInvalid = await validator.validate('businessForm', invalidData);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Performance Workflow', () => {
    it('should handle large form validation efficiently', async () => {
      const startTime = performance.now();

      // Set up large form with many fields
      const rules = {};
      for (let i = 0; i < 100; i++) {
        rules[`field${i}`] = { required: true, min: 3 };
      }

      validator.setMultipleRules(rules, {}, 'largeForm');

      // Create test data
      const formData = {};
      for (let i = 0; i < 100; i++) {
        formData[`field${i}`] = `value${i}`;
      }

      // Validate
      const isValid = await validator.validate('largeForm', formData);
      expect(isValid).toBe(true);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle multiple concurrent validations', async () => {
      const startTime = performance.now();

      // Set up multiple forms
      const forms = ['form1', 'form2', 'form3', 'form4', 'form5'];
      
      for (const form of forms) {
        validator.setMultipleRules({
          email: { required: true, email: true },
          password: { required: true, min: 8 }
        }, {}, form);
      }

      // Validate all forms concurrently
      const validationPromises = forms.map(form => 
        validator.validate(form, {
          email: 'user@example.com',
          password: 'password123'
        })
      );

      const results = await Promise.all(validationPromises);
      
      // All should be valid
      results.forEach(result => expect(result).toBe(true));

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should complete in less than 500ms
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should handle validation errors and recovery', async () => {
      validator.setMultipleRules({
        email: { required: true, email: true },
        password: { required: true, min: 8 }
      }, {}, 'recoveryForm');

      // Initial validation with errors
      let isValid = await validator.validate('recoveryForm', {
        email: 'invalid-email',
        password: '123'
      });
      expect(isValid).toBe(false);

      let errors = validator.getErrors();
      expect(errors).toHaveProperty('recoveryForm.email');
      expect(errors).toHaveProperty('recoveryForm.password');

      // Fix email
      isValid = await validator.validate('recoveryForm', {
        email: 'valid@example.com',
        password: '123'
      });
      expect(isValid).toBe(false);

      errors = validator.getErrors();
      expect(errors).not.toHaveProperty('recoveryForm.email');
      expect(errors).toHaveProperty('recoveryForm.password');

      // Fix password
      isValid = await validator.validate('recoveryForm', {
        email: 'valid@example.com',
        password: 'password123'
      });
      expect(isValid).toBe(true);

      errors = validator.getErrors();
      expect(errors).not.toHaveProperty('recoveryForm.email');
      expect(errors).not.toHaveProperty('recoveryForm.password');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle e-commerce checkout form', async () => {
      validator.setMultipleRules({
        // Customer Information
        firstName: { required: true, min: 2 },
        lastName: { required: true, min: 2 },
        email: { required: true, email: true },
        phone: { required: true, pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ },
        
        // Shipping Address
        shippingAddress: { required: true, min: 10 },
        shippingCity: { required: true, min: 2 },
        shippingZip: { required: true, pattern: /^\d{5}-\d{3}$/ },
        
        // Payment
        cardNumber: { required: true, pattern: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/ },
        expiryDate: { required: true, pattern: /^\d{2}\/\d{2}$/ },
        cvv: { required: true, pattern: /^\d{3}$/ },
        
        // Terms
        acceptTerms: { required: true }
      }, {}, 'checkoutForm');

      const checkoutData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '(11) 99999-9999',
        shippingAddress: '123 Main Street, Apt 4B',
        shippingCity: 'New York',
        shippingZip: '12345-678',
        cardNumber: '1234 5678 9012 3456',
        expiryDate: '12/25',
        cvv: '123',
        acceptTerms: true
      };

      const isValid = await validator.validate('checkoutForm', checkoutData);
      expect(isValid).toBe(true);
    });

    it('should handle user profile update form', async () => {
      validator.setMultipleRules({
        username: { required: true, min: 3, max: 20 },
        email: { required: true, email: true },
        bio: { max: 500 },
        website: { pattern: /^https?:\/\/.+/ },
        birthDate: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ }
      }, {}, 'profileForm');

      const profileData = {
        username: 'johndoe',
        email: 'john@example.com',
        bio: 'Software developer passionate about clean code',
        website: 'https://johndoe.dev',
        birthDate: '1990-01-01'
      };

      const isValid = await validator.validate('profileForm', profileData);
      expect(isValid).toBe(true);
    });
  });
});
