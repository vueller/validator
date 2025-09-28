/**
 * I18nManager Tests
 * Tests the I18nManager class functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { I18nManager } from '../../src/core/I18nManager.js';
import { ptBR, en } from '../../src/locales/index.js';

describe('I18nManager', () => {
  let i18nManager;

  beforeEach(() => {
    i18nManager = new I18nManager();
  });

  describe('Locale Management', () => {
    it('should set and get current locale', () => {
      i18nManager.setLocale('pt-BR');
      expect(i18nManager.getLocale()).toBe('pt-BR');
    });

    it('should set and get fallback locale', () => {
      i18nManager.setFallbackLocale('en');
      expect(i18nManager.getFallbackLocale()).toBe('en');
    });

    it('should check if locale exists', () => {
      expect(i18nManager.hasLocale('en')).toBe(true);
      expect(i18nManager.hasLocale('pt-BR')).toBe(true);
      expect(i18nManager.hasLocale('nonexistent')).toBe(false);
    });

    it('should get available locales', () => {
      const locales = i18nManager.getAvailableLocales();
      expect(locales).toContain('en');
      expect(locales).toContain('pt-BR');
    });

    it('should warn when setting non-existent locale', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      i18nManager.setLocale('nonexistent');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Locale 'nonexistent' not found")
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Message Management', () => {
    it('should add messages for locale', () => {
      const messages = {
        required: 'Field is required',
        email: 'Invalid email'
      };

      i18nManager.addMessages('en', messages);
      
      const localeMessages = i18nManager.getMessages('en');
      expect(localeMessages.required).toBe('Field is required');
      expect(localeMessages.email).toBe('Invalid email');
    });

    it('should set messages for locale with merge option', () => {
      // First add some base messages
      i18nManager.addMessages('en', {
        required: 'Field is required',
        email: 'Invalid email'
      });

      // Then set new messages with merge
      i18nManager.setMessages('en', {
        required: 'Custom required message',
        min: 'Too short'
      }, true);

      const messages = i18nManager.getMessages('en');
      expect(messages.required).toBe('Custom required message'); // Overridden
      expect(messages.email).toBe('Invalid email'); // Preserved
      expect(messages.min).toBe('Too short'); // Added
    });

    it('should set messages for locale without merge', () => {
      // First add some base messages
      i18nManager.addMessages('en', {
        required: 'Field is required',
        email: 'Invalid email'
      });

      // Then set new messages without merge
      i18nManager.setMessages('en', {
        required: 'Custom required message',
        min: 'Too short'
      }, false);

      const messages = i18nManager.getMessages('en');
      expect(messages.required).toBe('Custom required message');
      expect(messages.email).toBeUndefined(); // Not preserved
      expect(messages.min).toBe('Too short');
    });
  });

  describe('Translation Loading', () => {
    it('should load built-in translations', () => {
      i18nManager.loadTranslations(ptBR);
      
      const messages = i18nManager.getMessages('pt-BR');
      expect(messages.required).toBe('O campo {field} é obrigatório.');
      expect(messages.email).toBe('O campo {field} deve ser um endereço de email válido.');
    });

    it('should load custom translations only', () => {
      const customMessages = {
        required: 'Custom required message',
        email: 'Custom email message'
      };

      i18nManager.loadTranslations(null, customMessages);
      
      const messages = i18nManager.getMessages('en'); // Current locale
      expect(messages.required).toBe('Custom required message');
      expect(messages.email).toBe('Custom email message');
    });

    it('should load built-in translations with custom overrides', () => {
      const customOverrides = {
        required: 'Custom required message',
        'email.required': 'Email is required'
      };

      i18nManager.loadTranslations(ptBR, customOverrides);
      
      const messages = i18nManager.getMessages('pt-BR');
      expect(messages.required).toBe('Custom required message'); // Overridden
      expect(messages.email).toBe('O campo {field} deve ser um endereço de email válido.'); // Original
      expect(messages['email.required']).toBe('Email is required'); // Custom
    });
  });

  describe('Message Retrieval', () => {
    beforeEach(() => {
      i18nManager.setLocale('en');
      i18nManager.loadTranslations(en, {
        'email.required': 'Email is required',
        'email.email': 'Invalid email format'
      });
    });

    it('should get message for rule and field', () => {
      const message = i18nManager.getMessage('required', 'email');
      expect(message).toContain('email');
    });

    it('should get field-specific message when available', () => {
      const message = i18nManager.getMessage('required', 'email');
      expect(message).toBe('Email is required');
    });

    it('should fallback to general rule message', () => {
      const message = i18nManager.getMessage('min', 'email', { min: 8 });
      expect(message).toContain('email');
      expect(message).toContain('8');
    });

    it('should fallback to fallback locale', () => {
      i18nManager.setLocale('nonexistent');
      i18nManager.setFallbackLocale('en');
      
      const message = i18nManager.getMessage('required', 'email');
      expect(message).toContain('email');
    });

    it('should use final fallback message', () => {
      i18nManager.setLocale('nonexistent');
      i18nManager.setFallbackLocale('nonexistent');
      
      const message = i18nManager.getMessage('nonexistent', 'field');
      expect(message).toBe('The {field} field is invalid.');
    });

    it('should format message with parameters', () => {
      const message = i18nManager.getMessage('min', 'password', { min: 8 });
      expect(message).toContain('password');
      expect(message).toContain('8');
    });
  });

  describe('Reactivity', () => {
    it('should notify listeners when locale changes', (done) => {
      i18nManager.subscribe(() => {
        done();
      });

      i18nManager.setLocale('pt-BR');
    });

    it('should notify listeners when messages are added', (done) => {
      i18nManager.subscribe(() => {
        done();
      });

      i18nManager.addMessages('en', { required: 'Field is required' });
    });

    it('should notify listeners when translations are loaded', (done) => {
      i18nManager.subscribe(() => {
        done();
      });

      i18nManager.loadTranslations(ptBR);
    });

    it('should allow unsubscribing from notifications', () => {
      const callback = jest.fn();
      const unsubscribe = i18nManager.subscribe(callback);

      i18nManager.setLocale('pt-BR');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      i18nManager.setLocale('en');
      expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('State Management', () => {
    it('should get current state', () => {
      i18nManager.setLocale('pt-BR');
      i18nManager.setFallbackLocale('en');
      
      const state = i18nManager.getState();
      expect(state.locale).toBe('pt-BR');
      expect(state.fallbackLocale).toBe('en');
      expect(state.messages).toBeDefined();
    });

    it('should create Vue state when Vue is available', () => {
      // Mock Vue
      global.Vue = {
        reactive: jest.fn((obj) => obj),
        computed: jest.fn((fn) => ({ value: fn() }))
      };

      const vueState = i18nManager.createVueState();
      expect(vueState).toBeDefined();
      expect(vueState.locale).toBeDefined();
      expect(vueState.setLocale).toBeDefined();
      expect(vueState.getMessage).toBeDefined();

      delete global.Vue;
    });

    it('should create plain state when Vue is not available', () => {
      const plainState = i18nManager.createPlainState();
      expect(plainState).toBeDefined();
      expect(plainState.locale).toBeDefined();
      expect(plainState.setLocale).toBeDefined();
      expect(plainState.getMessage).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message objects', () => {
      i18nManager.addMessages('en', {});
      const messages = i18nManager.getMessages('en');
      expect(messages).toEqual({});
    });

    it('should handle null and undefined values', () => {
      i18nManager.addMessages('en', {
        required: null,
        email: undefined
      });
      
      const messages = i18nManager.getMessages('en');
      expect(messages.required).toBeNull();
      expect(messages.email).toBeUndefined();
    });

    it('should handle special characters in field names', () => {
      const message = i18nManager.getMessage('required', 'user.email@domain.com');
      expect(message).toContain('user.email@domain.com');
    });

    it('should handle missing parameters in message formatting', () => {
      const message = i18nManager.getMessage('min', 'password', {});
      expect(message).toContain('password');
      expect(message).toContain('{min}'); // Should not be replaced
    });
  });

  describe('Performance', () => {
    it('should handle large number of messages efficiently', () => {
      const startTime = performance.now();
      
      // Add 1000 messages
      const messages = {};
      for (let i = 0; i < 1000; i++) {
        messages[`rule${i}`] = `Message ${i}`;
      }
      
      i18nManager.addMessages('en', messages);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete in less than 50ms
      expect(Object.keys(i18nManager.getMessages('en'))).toHaveLength(1000);
    });

    it('should handle frequent locale changes efficiently', () => {
      const startTime = performance.now();
      
      // Change locale 1000 times
      for (let i = 0; i < 1000; i++) {
        i18nManager.setLocale(i % 2 === 0 ? 'en' : 'pt-BR');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});
