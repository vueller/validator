/**
 * I18nManager
 *
 * Minimal internationalization manager for validator messages. Stores messages
 * per-locale and provides helpers to retrieve and format them with
 * interpolation parameters.
 */
export class I18nManager {
  constructor() {
    this.locale = 'en';
    this.fallbackLocale = 'en';
    this.messages = new Map(); // Map<locale, Map<key, message>>
    this.listeners = new Set();
    this.isInitializing = true;
    
    this.loadDefaultMessages();
    // Mark initialization as complete after a short delay
    setTimeout(() => {
      this.isInitializing = false;
    }, 100);
  }

  /**
   * Load default messages for supported locales
   * @private
   * @returns {void}
   */
  loadDefaultMessages() {
    // Import and load all available translations
    import('../locales/en.js').then(module => {
      this.addMessages('en', module.default);
    });

    // Load Brazilian Portuguese translations
    import('../locales/pt-BR.js').then(module => {
      this.addMessages('pt-BR', module.default);
    });
  }

  /**
   * Set the current locale
   * @param {string} locale - The locale code (e.g., 'en', 'pt-BR')
   * @returns {void}
   */
  setLocale(locale) {
    if (locale && typeof locale === 'string') {
      this.locale = locale.toLowerCase();
      this.notifyListeners();
    }
  }

  /**
   * Get the current locale
   * @returns {string} Current locale code
   */
  getLocale() {
    return this.locale;
  }

  /**
   * Add messages for a specific locale
   * @param {string} locale - The locale code
   * @param {Object<string, string>} messages - Object with message keys and templates
   * @returns {void}
   */
  addMessages(locale, messages) {
    if (!locale || !messages) return;

    const normalizedLocale = locale.toLowerCase();
    if (!this.messages.has(normalizedLocale)) {
      this.messages.set(normalizedLocale, new Map());
    }

    const localeMessages = this.messages.get(normalizedLocale);
    for (const [key, message] of Object.entries(messages)) {
      localeMessages.set(key, message);
    }

    this.notifyListeners();
  }

  /**
   * Set messages for a locale (alias for addMessages for compatibility)
   * @param {string} locale - The locale code
   * @param {Object<string, string>} messages - Object with message keys and templates
   * @returns {void}
   */
  setMessages(locale, messages) {
    return this.addMessages(locale, messages);
  }

  /**
   * Get current messages for active locale
   * @returns {Record<string, string>} Current locale messages as plain object
   */
  getCurrentMessages() {
    const messages = this.messages.get(this.locale) || this.messages.get(this.fallbackLocale) || new Map();
    return Object.fromEntries(messages);
  }

  /**
   * Get a message for a specific rule
   * Resolution order: `field.rule` -> `rule` -> rule's fallback message -> default fallback message
   * @param {string} rule - The rule name
   * @param {string} field - The field name
   * @param {Object<string, any>} [params] - Parameters to substitute in the message
   * @param {string} [locale] - Optional locale override
   * @param {string} [ruleFallbackMessage] - Fallback message from rule registration
   * @returns {string} The formatted message
   */
  getMessage(rule, field, params = {}, locale = null, ruleFallbackMessage = null) {
    const targetLocale = locale ? locale.toLowerCase() : this.locale;
    const localeMessages = this.messages.get(targetLocale) || this.messages.get(this.fallbackLocale) || new Map();
    
    // Try field-specific message first
    let message = localeMessages.get(`${field}.${rule}`);
    
    // Fallback to rule-only message
    if (!message) {
      message = localeMessages.get(rule);
    }

    // Fallback to rule's registered fallback message
    if (!message && ruleFallbackMessage) {
      message = ruleFallbackMessage;
    }

    // Final fallback
    if (!message) {
      message = `The {field} field is invalid.`;
    }

    return this.formatMessage(message, field, params);
  }

  /**
   * Translate a message (alias for getMessage)
   * @param {string} rule - Rule name
   * @param {string} field - Field name
   * @param {Object<string, any>} [params] - Parameters
   * @param {string} [locale] - Optional locale override
   * @param {string} [ruleFallbackMessage] - Fallback message from rule registration
   * @returns {string} Formatted message
   */
  t(rule, field, params = {}, locale = null, ruleFallbackMessage = null) {
    return this.getMessage(rule, field, params, locale, ruleFallbackMessage);
  }

  /**
   * Format message with field name and parameters
   * @param {string} message - The message template
   * @param {string} field - The field name
   * @param {Object<string, any>} [params] - Parameters to substitute
   * @returns {string} The formatted message
   */
  formatMessage(message, field, params = {}) {
    const formattedField = this.formatFieldName(field);
    const replacements = { field: formattedField, ...params };

    // Simple placeholder replacement
    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return replacements[key] !== undefined ? replacements[key] : match;
    });
  }

  /**
   * Format field name for display
   * @param {string} field - The field name
   * @returns {string} Formatted field name
   */
  formatFieldName(field) {
    if (!field) return '';
    
    // Convert camelCase to readable format
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Check if a locale has been loaded
   * @param {string} locale - The locale code
   * @returns {boolean} True if locale exists
   */
  hasLocale(locale) {
    return this.messages.has(locale?.toLowerCase());
  }

  /**
   * Get all available locales
   * @returns {string[]} Array of locale codes
   */
  getAvailableLocales() {
    // Return locales in original format (preserving case)
    const locales = Array.from(this.messages.keys());
    return locales.map(locale => {
      // Convert back to original case if possible
      if (locale === 'pt-br') return 'pt-BR';
      if (locale === 'en') return 'en';
      return locale;
    });
  }

  /**
   * Clear all messages and reload defaults
   * @returns {void}
   */
  clear() {
    this.messages.clear();
    this.loadDefaultMessages();
    this.notifyListeners();
  }

  /**
   * Subscribe to changes
   * @param {Function} listener - Change listener
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   * @private
   * @returns {void}
   */
  notifyListeners() {
    // Skip notifications during initialization to prevent loops
    if (this.isInitializing) return;
    
    this.listeners.forEach(listener => listener());
  }

  /**
   * Get state for reactive frameworks
   * @returns {Object} State object
   */
  getState() {
    return {
      locale: this.locale,
      availableLocales: this.getAvailableLocales(),
      hasLocale: this.hasLocale.bind(this),
      
      // Methods
      setLocale: this.setLocale.bind(this),
      getLocale: this.getLocale.bind(this),
      addMessages: this.addMessages.bind(this),
      getMessage: this.getMessage.bind(this),
      t: this.t.bind(this),
      clear: this.clear.bind(this)
    };
  }
}

