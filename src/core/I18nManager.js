import { reactive, computed } from 'vue';
import { locales } from '../locales/index.js';

/**
 * I18nManager for handling internationalization with Vue 3 reactivity
 * Supports real-time language switching and automatic UI updates
 */
export class I18nManager {
  constructor() {
    // Reactive state
    this.state = reactive({
      locale: 'en',
      fallbackLocale: 'en',
      messages: { ...locales }
    });
    
    // Computed current messages
    this.currentMessages = computed(() => {
      return this.state.messages[this.state.locale] || this.state.messages[this.state.fallbackLocale];
    });
  }

  /**
   * Set the current locale (reactive)
   * @param {string} locale - The locale code (e.g., 'en', 'pt-BR', 'pt')
   */
  setLocale(locale) {
    if (this.hasLocale(locale)) {
      this.state.locale = locale;
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
  }

  /**
   * Get a reactive message for a specific rule
   * @param {string} rule - The rule name
   * @param {string} field - The field name
   * @param {Object} params - Parameters to substitute in the message
   * @returns {ComputedRef<string>} Reactive computed message
   */
  getReactiveMessage(rule, field, params = {}) {
    return computed(() => {
      return this.getMessage(rule, field, params);
    });
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
    let message = this.getRawMessage(rule, targetLocale);
    
    if (!message) {
      // Fallback to default locale
      message = this.getRawMessage(rule, this.state.fallbackLocale);
    }
    
    if (!message) {
      // Final fallback
      message = `The {field} field is invalid.`;
    }

    return this.substituteParameters(message, field, params);
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
   * Substitute parameters in a message
   * @param {string} message - The message template
   * @param {string} field - The field name
   * @param {Object} params - Parameters to substitute
   * @returns {string} The message with substituted parameters
   */
  substituteParameters(message, field, params = {}) {
    let result = message;
    
    // Replace {field} with the actual field name
    result = result.replace(/{field}/g, this.formatFieldName(field));
    
    // Replace other parameters
    for (const [key, value] of Object.entries(params)) {
      const placeholder = new RegExp(`{${key}}`, 'g');
      result = result.replace(placeholder, value);
    }
    
    return result;
  }

  /**
   * Format field name for display (convert camelCase to readable format)
   * @param {string} field - The field name
   * @returns {string} Formatted field name
   */
  formatFieldName(field) {
    // Convert camelCase to space-separated words
    const formatted = field.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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
  }

  /**
   * Get reactive locale state for Vue components
   * @returns {Object} Reactive state object
   */
  getReactiveState() {
    return {
      locale: computed(() => this.state.locale),
      availableLocales: computed(() => this.getAvailableLocales()),
      setLocale: (locale) => this.setLocale(locale),
      addMessages: (locale, messages) => this.addMessages(locale, messages)
    };
  }
}
