import { locales } from '../locales/index.js';
import { camelCaseToReadable, replacePlaceholders } from '../utils/index.js';

/**
 * I18nManager for handling internationalization
 * Framework-agnostic implementation that works with both JavaScript and Vue
 * Supports real-time language switching and automatic UI updates
 */
export class I18nManager {
  constructor() {
    // Internal state
    this.state = {
      locale: 'en',
      fallbackLocale: 'en',
      messages: { ...locales }
    };

    this.listeners = new Set();
  }

  /**
   * Set the current locale
   * @param {string} locale - The locale code (e.g., 'en', 'pt-BR', 'pt')
   */
  setLocale(locale) {
    if (this.hasLocale(locale)) {
      this.state.locale = locale;
      this.notifyListeners();
    } else {
      console.warn(`Locale '${locale}' not found. Available locales:`, this.getAvailableLocales());
    }
  }

  /**
   * Get the current locale
   * @returns {string} Current locale code
   */
  getLocale() {
    return this.state.locale;
  }

  /**
   * Set the fallback locale
   * @param {string} locale - The fallback locale code
   */
  setFallbackLocale(locale) {
    if (this.hasLocale(locale)) {
      this.state.fallbackLocale = locale;
      this.notifyListeners();
    }
  }

  /**
   * Add messages for a specific locale
   * @param {string} locale - The locale code
   * @param {Object} messages - Object with message keys and values
   */
  addMessages(locale, messages) {
    if (!this.state.messages[locale]) {
      this.state.messages[locale] = {};
    }

    Object.assign(this.state.messages[locale], messages);
    this.notifyListeners();
  }

  /**
   * Set messages for a locale (replaces existing messages)
   * @param {string} locale - The locale code
   * @param {Object} messages - The messages object
   * @param {boolean} mergeWithDefaults - Whether to merge with default messages
   */
  setMessages(locale, messages, mergeWithDefaults = true) {
    if (mergeWithDefaults && this.state.messages['en']) {
      // Merge with English defaults
      this.state.messages[locale] = {
        ...this.state.messages['en'],
        ...messages
      };
    } else {
      // Replace completely
      this.state.messages[locale] = { ...messages };
    }

    this.notifyListeners();
  }

  /**
   * Load translation file with optional custom messages
   * @param {Object} translations - Translation file object or custom messages object
   * @param {Object} customMessages - Optional custom messages to override or extend
   */
  loadTranslations(translations, customMessages = {}) {
    let messages = {};

    // If translations is provided, use it as base
    if (translations && typeof translations === 'object') {
      messages = { ...translations };
    }

    // Add or override with custom messages
    if (customMessages && typeof customMessages === 'object') {
      Object.keys(customMessages).forEach(key => {
        messages[key] = customMessages[key];
      });
    }

    // Set the messages for current locale
    this.state.messages[this.state.locale] = messages;
    this.notifyListeners();
  }

  /**
   * Get current messages for active locale
   * @returns {Object} Current locale messages
   */
  getCurrentMessages() {
    return this.state.messages[this.state.locale] || this.state.messages[this.state.fallbackLocale];
  }

  /**
   * Get a message for a specific rule and locale
   * @param {string} rule - The rule name
   * @param {string} field - The field name
   * @param {Object} params - Parameters to substitute in the message
   * @param {string} locale - Optional locale override
   * @returns {string} The formatted message
   */
  getMessage(rule, field, params = {}, locale = null) {
    const targetLocale = locale || this.state.locale;

    // Try to get field-specific message first (field.rule format)
    let message = this.getRawMessage(`${field}.${rule}`, targetLocale);

    // If not found, try rule-only message (VeeValidate 3 style)
    if (!message) {
      message = this.getRawMessage(rule, targetLocale);
    }

    // Fallback to default locale
    if (!message) {
      message =
        this.getRawMessage(`${field}.${rule}`, this.state.fallbackLocale) ||
        this.getRawMessage(rule, this.state.fallbackLocale);
    }

    if (!message) {
      // Final fallback
      message = `The {field} field is invalid.`;
    }

    return this.formatMessage(message, field, params);
  }

  /**
   * Get raw message without parameter substitution
   * @param {string} rule - The rule name
   * @param {string} locale - The locale code
   * @returns {string|null} The raw message or null if not found
   */
  getRawMessage(rule, locale) {
    const localeMessages = this.state.messages[locale];
    return localeMessages ? localeMessages[rule] : null;
  }

  /**
   * Format message with field name and parameters
   * @param {string} message - The message template
   * @param {string} field - The field name
   * @param {Object} params - Parameters to substitute
   * @returns {string} The formatted message
   */
  formatMessage(message, field, params = {}) {
    const formattedField = this.formatFieldName(field);

    const replacements = {
      field: formattedField,
      ...params
    };

    return replacePlaceholders(message, replacements);
  }

  /**
   * Format field name for display (convert camelCase to readable format)
   * @param {string} field - The field name
   * @returns {string} Formatted field name
   */
  formatFieldName(field) {
    return camelCaseToReadable(field);
  }

  /**
   * Check if a locale has been loaded
   * @param {string} locale - The locale code
   * @returns {boolean} True if locale exists
   */
  hasLocale(locale) {
    return this.state.messages.hasOwnProperty(locale);
  }

  /**
   * Get all available locales
   * @returns {string[]} Array of locale codes
   */
  getAvailableLocales() {
    return Object.keys(this.state.messages);
  }

  /**
   * Remove a locale
   * @param {string} locale - The locale code to remove
   */
  removeLocale(locale) {
    if (locale !== this.state.fallbackLocale) {
      delete this.state.messages[locale];
      this.notifyListeners();
    }
  }

  /**
   * Clear all messages except fallback
   */
  clear() {
    const fallbackMessages = this.state.messages[this.state.fallbackLocale];
    this.state.messages = {
      [this.state.fallbackLocale]: fallbackMessages
    };
    this.notifyListeners();
  }

  /**
   * Subscribe to changes (for reactive frameworks)
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   * @private
   */
  notifyListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Get state for Vue components (creates reactive wrappers)
   * @returns {Object} Reactive state object
   */
  getState() {
    // Check if Vue is available
    if (typeof window !== 'undefined' && window.Vue) {
      const { computed } = window.Vue;
      return this.createVueState(computed);
    }

    // Try to import Vue dynamically
    try {
      const { computed } = require('vue');
      return this.createVueState(computed);
    } catch {
      // Fallback to plain object for non-Vue environments
      return this.createPlainState();
    }
  }

  /**
   * Create Vue reactive state
   * @param {Function} computed - Vue computed function
   * @returns {Object} Vue reactive state
   */
  createVueState(computed) {
    return {
      locale: computed(() => this.state.locale),
      availableLocales: computed(() => this.getAvailableLocales()),
      setLocale: this.setLocale.bind(this),
      addMessages: this.addMessages.bind(this)
    };
  }

  /**
   * Create plain JavaScript state
   * @returns {Object} Plain state object
   */
  createPlainState() {
    return {
      locale: this.state.locale,
      availableLocales: this.getAvailableLocales(),
      setLocale: this.setLocale.bind(this),
      addMessages: this.addMessages.bind(this)
    };
  }
}
