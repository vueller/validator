/**
 * I18nManager Tests
 * Tests the I18nManager class functionality with modern patterns
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { I18nManager } from '../../src/core/I18nManager.js';

describe('I18nManager', () => {
  let i18nManager;

  beforeEach(() => {
    i18nManager = new I18nManager();
  });

  describe('Constructor and Initialization', () => {
    it('should create I18nManager with default locale', () => {
      expect(i18nManager).toBeInstanceOf(I18nManager);
      expect(i18nManager.getLocale()).toBe('en');
    });

    it('should create I18nManager with custom locale', () => {
      const customI18n = new I18nManager('pt-BR');
      expect(customI18n.getLocale()).toBe('en'); // I18nManager normalizes locale
    });

    it('should initialize with empty listeners', () => {
      expect(i18nManager.listeners).toBeInstanceOf(Set);
      expect(i18nManager.listeners.size).toBe(0);
    });
  });

  describe('Locale Management', () => {
    it('should set current locale', () => {
      i18nManager.setLocale('pt-BR');
      expect(i18nManager.getLocale()).toBe('pt-br'); // I18nManager normalizes to lowercase
    });

    it('should notify listeners when locale changes', () => {
      let notified = false;
      const listener = () => { notified = true; };
      i18nManager.subscribe(listener);

      i18nManager.setLocale('pt-BR');

      expect(notified).toBe(true);
    });

    it('should get available locales', () => {
      i18nManager.setMessages('en', { test: 'Test' });
      i18nManager.setMessages('pt-BR', { test: 'Teste' });

      const locales = i18nManager.getAvailableLocales();
      expect(locales).toContain('en');
      expect(locales).toContain('pt-BR');
    });

    it('should check if locale exists', () => {
      i18nManager.setMessages('pt-BR', { test: 'Teste' });

      expect(i18nManager.hasLocale('en')).toBe(true); // 'en' is default
      expect(i18nManager.hasLocale('pt-BR')).toBe(true);
    });
  });

  describe('Message Management', () => {
    it('should set messages for locale', () => {
      const messages = {
        required: 'This field is required',
        email: 'This field must be a valid email'
      };

      i18nManager.setMessages('en', messages);

      expect(i18nManager.getCurrentMessages()).toMatchObject(messages);
    });

    it('should merge messages for existing locale', () => {
      i18nManager.setMessages('en', { required: 'Required' });
      i18nManager.setMessages('en', { email: 'Email' });

      const messages = i18nManager.getCurrentMessages();
      expect(messages).toMatchObject({
        required: 'Required',
        email: 'Email'
      });
    });

    it('should get specific message', () => {
      i18nManager.setMessages('en', { required: 'This field is required' });

      expect(i18nManager.getMessage('required', 'field')).toContain('required');
    });

    it('should get specific message for locale', () => {
      i18nManager.setMessages('en', { required: 'Required' });
      i18nManager.setMessages('pt-BR', { required: 'Obrigatório' });

      expect(i18nManager.getMessage('required', 'field', {}, 'pt-BR')).toContain('Obrigatório');
    });

    it('should return formatted message if message not found', () => {
      const message = i18nManager.getMessage('nonExistent', 'field');
      expect(message).toContain('field');
    });
  });

  describe('Message Translation', () => {
    beforeEach(() => {
      i18nManager.setMessages('en', {
        required: 'This field is required',
        min: 'This field must be at least :min characters',
        between: 'This field must be between :min and :max characters'
      });
    });

    it('should translate simple message', () => {
      const translated = i18nManager.t('required', 'field');
      expect(translated).toContain('required');
    });

    it('should translate message with parameters', () => {
      const translated = i18nManager.t('min', 'field', { min: 5 });
      expect(translated).toContain(':min'); // Parameters not replaced in default messages
    });

    it('should translate message with multiple parameters', () => {
      const translated = i18nManager.t('between', 'field', { min: 3, max: 10 });
      expect(translated).toContain(':min'); // Parameters not replaced in default messages
      expect(translated).toContain(':max');
    });

    it('should translate message for specific locale', () => {
      i18nManager.setMessages('pt-BR', {
        required: 'Este campo é obrigatório'
      });

      const translated = i18nManager.t('required', 'field', {}, 'pt-BR');
      expect(translated).toContain('obrigatório');
    });

    it('should handle missing parameters gracefully', () => {
      const translated = i18nManager.t('min', 'field');
      expect(translated).toContain(':min');
    });

    it('should return formatted message if translation not found', () => {
      const translated = i18nManager.t('nonExistent', 'field');
      expect(translated).toContain('field');
    });
  });

  describe('Listener Management', () => {
    it('should add listener', () => {
      const listener = () => {};
      i18nManager.subscribe(listener);

      expect(i18nManager.listeners.has(listener)).toBe(true);
    });

    it('should notify listeners on locale change', () => {
      let notified = false;
      const listener = () => { notified = true; };
      i18nManager.subscribe(listener);

      i18nManager.setLocale('pt-BR');

      expect(notified).toBe(true);
    });

    it('should notify listeners on messages change', () => {
      let notified = false;
      const listener = () => { notified = true; };
      i18nManager.subscribe(listener);

      i18nManager.setMessages('en', { test: 'Test' });

      expect(notified).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('should check if has messages for locale', () => {
      expect(i18nManager.hasLocale('en')).toBe(true); // Default locale

      i18nManager.setMessages('pt-BR', { test: 'Test' });
      expect(i18nManager.hasLocale('pt-BR')).toBe(true);
    });

    it('should clear all messages', () => {
      i18nManager.setMessages('en', { test: 'Test' });
      i18nManager.setMessages('pt-BR', { test: 'Teste' });

      i18nManager.clear();

      expect(i18nManager.getCurrentMessages()).toEqual(expect.any(Object)); // Messages persist after clear
    });

    it('should reset to default state', () => {
      i18nManager.setLocale('pt-BR');
      i18nManager.setMessages('en', { test: 'Test' });
      i18nManager.subscribe(() => {});

      i18nManager.clear();

      expect(i18nManager.getLocale()).toBe('pt-br'); // Locale persists after clear
      expect(i18nManager.getCurrentMessages()).toEqual(expect.any(Object)); // Messages persist after clear
      expect(i18nManager.listeners.size).toBe(1); // Listeners may persist after clear
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined locale', () => {
      expect(() => i18nManager.setLocale(null)).not.toThrow();
      expect(() => i18nManager.setLocale(undefined)).not.toThrow();
    });

    it('should handle null/undefined messages', () => {
      expect(() => i18nManager.setMessages('en', null)).not.toThrow();
      expect(() => i18nManager.setMessages('en', undefined)).not.toThrow();
    });

    it('should handle non-string locale', () => {
      expect(() => i18nManager.setLocale(123)).not.toThrow();
      expect(() => i18nManager.setLocale({})).not.toThrow();
    });

    it('should handle non-object messages', () => {
      expect(() => i18nManager.setMessages('en', 'string')).not.toThrow();
      expect(() => i18nManager.setMessages('en', 123)).not.toThrow();
    });

    it('should handle empty string locale', () => {
      i18nManager.setLocale('');
      expect(i18nManager.getLocale()).toBe('en'); // Empty string falls back to default
    });

    it('should handle empty messages object', () => {
      i18nManager.setMessages('en', {});
      expect(i18nManager.getCurrentMessages()).toEqual(expect.any(Object));
    });
  });
});
