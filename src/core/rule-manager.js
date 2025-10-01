/**
 * RuleManager - Manages validation rules for fields and scopes
 * Handles rule registration, parsing, and field-rule associations
 */

export class RuleManager {
  constructor(ruleRegistry) {
    this.ruleRegistry = ruleRegistry;
    this.fieldRules = new Map(); // Map<scope, Map<field, rules>>
    this.fieldLabels = new Map(); // Map<scope, Map<field, label>>
    this.listeners = new Set();
  }

  /**
   * Get or create field rules for a scope
   * @param {string} scope - Form scope
   * @returns {Map} Field rules map
   */
  getFieldRulesMap(scope = 'default') {
    if (!this.fieldRules.has(scope)) {
      this.fieldRules.set(scope, new Map());
    }
    return this.fieldRules.get(scope);
  }

  /**
   * Get or create field labels for a scope
   * @param {string} scope - Form scope
   * @returns {Map} Field labels map
   */
  getFieldLabels(scope = 'default') {
    if (!this.fieldLabels.has(scope)) {
      this.fieldLabels.set(scope, new Map());
    }
    return this.fieldLabels.get(scope);
  }

  /**
   * Set rules for a field
   * @param {string} field - Field name
   * @param {string|Object|Array} rules - Validation rules
   * @param {string} scope - Form scope
   */
  setFieldRules(field, rules, scope = 'default') {
    const parsedRules = this.ruleRegistry.parseRules(rules);
    const fieldRules = this.getFieldRulesMap(scope);
    fieldRules.set(field, parsedRules);
    this.notifyListeners();
  }

  /**
   * Set multiple field rules at once
   * @param {Object} rulesObject - Rules object
   * @param {string} scope - Form scope
   */
  setMultipleFieldRules(rulesObject, scope = 'default') {
    for (const [field, rules] of Object.entries(rulesObject)) {
      this.setFieldRules(field, rules, scope);
    }
  }

  /**
   * Get rules for a field
   * @param {string} field - Field name
   * @param {string} scope - Form scope
   * @returns {Array} Array of rule instances
   */
  getFieldRules(field, scope = 'default') {
    const fieldRulesMap = this.getFieldRulesMap(scope);
    return fieldRulesMap.get(field) || [];
  }

  /**
   * Check if field has rules
   * @param {string} field - Field name
   * @param {string} scope - Form scope
   * @returns {boolean} True if field has rules
   */
  hasFieldRules(field, scope = 'default') {
    const fieldRules = this.getFieldRulesMap(scope);
    return fieldRules.has(field) && fieldRules.get(field).length > 0;
  }

  /**
   * Remove rules for a field
   * @param {string} field - Field name
   * @param {string} scope - Form scope
   */
  removeFieldRules(field, scope = 'default') {
    const fieldRules = this.getFieldRulesMap(scope);
    fieldRules.delete(field);
    this.notifyListeners();
  }

  /**
   * Set field label
   * @param {string} field - Field name
   * @param {string} label - Display label
   * @param {string} scope - Form scope
   */
  setFieldLabel(field, label, scope = 'default') {
    const fieldLabels = this.getFieldLabels(scope);
    fieldLabels.set(field, label);
    this.notifyListeners();
  }

  /**
   * Get field label
   * @param {string} field - Field name
   * @param {string} scope - Form scope
   * @returns {string} Field label
   */
  getFieldLabel(field, scope = 'default') {
    const fieldLabels = this.getFieldLabels(scope);
    return fieldLabels.get(field);
  }

  /**
   * Get all fields with rules in a scope
   * @param {string} scope - Form scope
   * @returns {Array} Array of field names
   */
  getFieldsWithRules(scope = 'default') {
    const fieldRules = this.getFieldRulesMap(scope);
    return Array.from(fieldRules.keys());
  }

  /**
   * Clear all rules for a scope
   * @param {string} scope - Form scope
   */
  clearRules(scope = 'default') {
    if (scope === 'all') {
      this.fieldRules.clear();
      this.fieldLabels.clear();
    } else {
      this.fieldRules.delete(scope);
      this.fieldLabels.delete(scope);
    }
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
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Get state for reactive frameworks
   * @param {string} scope - Form scope
   * @returns {Object} State object
   */
  getState(scope = 'default') {
    return {
      fieldRules: Object.fromEntries(this.getFieldRulesMap(scope)),
      fieldLabels: Object.fromEntries(this.getFieldLabels(scope)),
      fieldsWithRules: this.getFieldsWithRules(scope),
      
      // Methods
      setRules: (field, rules) => this.setFieldRules(field, rules, scope),
      setMultipleRules: (rulesObject) => this.setMultipleFieldRules(rulesObject, scope),
      getRules: (field) => this.getFieldRules(field, scope),
      hasRules: (field) => this.hasFieldRules(field, scope),
      removeRules: (field) => this.removeFieldRules(field, scope),
      setLabel: (field, label) => this.setFieldLabel(field, label, scope),
      getLabel: (field) => this.getFieldLabel(field, scope)
    };
  }
}
