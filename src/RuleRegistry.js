import {
  RequiredRule,
  MinRule,
  MaxRule,
  EmailRule,
  NumericRule,
  PatternRule,
  ConfirmedRule
} from './rules/index.js';
import { isObject, isArray, isString, isNumber } from './utils/index.js';

/**
 * RuleRegistry class for managing validation rules
 * Provides a centralized way to register, create, and manage validation rules
 * Refactored to use utilities and follow clean code principles
 */
export class RuleRegistry {
  constructor() {
    this.builtInRules = new Map();
    this.customRules = new Map();

    // Register built-in rules
    this.registerBuiltInRules();
  }

  /**
   * Register all built-in validation rules
   */
  registerBuiltInRules() {
    const rules = {
      required: RequiredRule,
      min: MinRule,
      max: MaxRule,
      email: EmailRule,
      numeric: NumericRule,
      pattern: PatternRule,
      confirmed: ConfirmedRule
    };

    for (const [name, RuleClass] of Object.entries(rules)) {
      this.builtInRules.set(name, RuleClass);
    }
  }

  /**
   * Register a custom rule
   * @param {string} name - The rule name
   * @param {Function|Object} rule - Rule class or validation function
   * @param {string} message - Optional default message
   */
  register(name, rule, message = null) {
    if (this.isValidationFunction(rule)) {
      // Wrap function in rule-like object
      this.customRules.set(name, {
        validate: rule,
        message: message || `The {field} field is invalid.`,
        getRuleName: () => name
      });
    } else {
      // It's a rule class
      this.builtInRules.set(name, rule);
    }
  }

  /**
   * Check if rule is a plain validation function
   * @param {any} rule - Rule to check
   * @returns {boolean} True if it's a validation function
   */
  isValidationFunction(rule) {
    return typeof rule === 'function' && (!rule.prototype || !rule.prototype.validate);
  }

  /**
   * Create a rule instance from a rule definition
   * @param {string} name - The rule name
   * @param {any} params - Parameters for the rule
   * @returns {Object|null} Rule instance or null if rule is unknown
   */
  create(name, params = null) {
    // Check built-in rules first
    if (this.builtInRules.has(name)) {
      const RuleClass = this.builtInRules.get(name);
      return this.createBuiltInRule(RuleClass, params);
    }

    // Check custom rules
    if (this.customRules.has(name)) {
      const customRule = this.customRules.get(name);
      return {
        ...customRule,
        params: params
      };
    }

    // Log warning for unknown rules instead of throwing error
    console.warn(`Unknown validation rule: ${name}. This rule will be ignored.`);
    return null;
  }

  /**
   * Create built-in rule instance with proper parameter handling
   * @param {Function} RuleClass - Rule class constructor
   * @param {any} params - Rule parameters
   * @returns {Object} Rule instance
   */
  createBuiltInRule(RuleClass, params) {
    if (params !== null && params !== undefined) {
      return new RuleClass(params);
    }
    return new RuleClass();
  }

  /**
   * Parse rules from various formats
   * @param {string|Object|Array} rules - Rules in different formats
   * @returns {Array} Array of rule instances
   */
  parseRules(rules) {
    if (!rules) return [];

    if (isObject(rules)) {
      return this.parseObjectRules(rules);
    }

    if (isArray(rules)) {
      return this.parseArrayRules(rules);
    }

    if (isString(rules)) {
      return this.parseStringRules(rules);
    }

    return [];
  }

  /**
   * Parse object format rules: { required: true, min: 5, max: 15 }
   * @param {Object} rules - Rules object
   * @returns {Array} Array of rule instances
   */
  parseObjectRules(rules) {
    const ruleInstances = [];

    for (const [ruleName, ruleValue] of Object.entries(rules)) {
      if (ruleValue === false) continue; // Skip disabled rules

      const ruleInstance =
        ruleValue === true ? this.create(ruleName) : this.create(ruleName, ruleValue);

      if (ruleInstance !== null) {
        ruleInstances.push(ruleInstance);
      }
    }

    return ruleInstances;
  }

  /**
   * Parse array format rules: ['required', 'min:5', 'max:15']
   * @param {Array} rules - Rules array
   * @returns {Array} Array of rule instances
   */
  parseArrayRules(rules) {
    return rules.map(rule => this.parseArrayRule(rule)).filter(rule => rule !== null);
  }

  /**
   * Parse single array rule
   * @param {string|Object} rule - Single rule
   * @returns {Object|null} Rule instance or null
   */
  parseArrayRule(rule) {
    if (isString(rule)) {
      return this.parseStringRule(rule);
    }

    if (isObject(rule)) {
      const [ruleName, ruleParams] = Object.entries(rule)[0];
      return this.create(ruleName, ruleParams);
    }

    // Assume it's already a rule instance
    return rule;
  }

  /**
   * Parse string format rules: 'required|min:5|max:15'
   * @param {string} rules - Rules string
   * @returns {Array} Array of rule instances
   */
  parseStringRules(rules) {
    return rules
      .split('|')
      .map(rule => this.parseStringRule(rule))
      .filter(rule => rule !== null);
  }

  /**
   * Parse a single string rule
   * @param {string} rule - Rule string like 'min:5' or 'required'
   * @returns {Object|null} Rule instance or null if rule is unknown
   */
  parseStringRule(rule) {
    const [ruleName, ...params] = rule.split(':');

    if (params.length === 0) {
      return this.create(ruleName);
    }

    if (params.length === 1) {
      const param = this.parseParameter(params[0]);
      return this.create(ruleName, param);
    }

    // Multiple parameters
    return this.create(ruleName, params);
  }

  /**
   * Parse parameter value (convert to number if possible)
   * @param {string} param - Parameter string
   * @returns {string|number} Parsed parameter
   */
  parseParameter(param) {
    return isNaN(param) ? param : Number(param);
  }

  /**
   * Check if a rule exists
   * @param {string} name - The rule name
   * @returns {boolean} True if rule exists
   */
  has(name) {
    return this.builtInRules.has(name) || this.customRules.has(name);
  }

  /**
   * Get all registered rule names
   * @returns {string[]} Array of rule names
   */
  getRuleNames() {
    return [...Array.from(this.builtInRules.keys()), ...Array.from(this.customRules.keys())];
  }

  /**
   * Remove a rule
   * @param {string} name - The rule name
   */
  remove(name) {
    this.builtInRules.delete(name);
    this.customRules.delete(name);
  }

  /**
   * Clear all custom rules
   */
  clearCustomRules() {
    this.customRules.clear();
  }

  /**
   * Clear all rules including built-in ones
   */
  clear() {
    this.builtInRules.clear();
    this.customRules.clear();
  }

  /**
   * Get rule count
   * @returns {number} Total number of registered rules
   */
  count() {
    return this.builtInRules.size + this.customRules.size;
  }
}
