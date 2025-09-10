import { 
  RequiredRule, 
  MinRule, 
  MaxRule, 
  EmailRule, 
  NumericRule, 
  PatternRule, 
  ConfirmedRule 
} from './rules/index.js';

/**
 * RuleRegistry class for managing validation rules
 * Provides a centralized way to register, create, and manage validation rules
 */
export class RuleRegistry {
  constructor() {
    this.rules = new Map();
    this.customRules = new Map();
    
    // Register built-in rules
    this.registerBuiltInRules();
  }

  /**
   * Register all built-in validation rules
   */
  registerBuiltInRules() {
    this.rules.set('required', RequiredRule);
    this.rules.set('min', MinRule);
    this.rules.set('max', MaxRule);
    this.rules.set('email', EmailRule);
    this.rules.set('numeric', NumericRule);
    this.rules.set('pattern', PatternRule);
    this.rules.set('confirmed', ConfirmedRule);
  }

  /**
   * Register a custom rule
   * @param {string} name - The rule name
   * @param {Function|Object} rule - Rule class or validation function
   * @param {string} message - Optional default message
   */
  register(name, rule, message = null) {
    if (typeof rule === 'function' && (!rule.prototype || !rule.prototype.validate)) {
      // If it's a plain function, wrap it in a rule class
      this.customRules.set(name, {
        validate: rule,
        message: message || `The {field} field is invalid.`
      });
    } else {
      // It's a rule class
      this.rules.set(name, rule);
    }
  }

  /**
   * Create a rule instance from a rule definition
   * @param {string} name - The rule name
   * @param {any} params - Parameters for the rule
   * @returns {Object|null} Rule instance, custom rule object, or null if rule is unknown
   */
  create(name, params = null) {
    // Check if it's a built-in rule
    if (this.rules.has(name)) {
      const RuleClass = this.rules.get(name);
      
      // Handle different parameter formats
      if (params !== null && params !== undefined) {
        if (name === 'min' || name === 'max') {
          return new RuleClass(params);
        } else if (name === 'confirmed') {
          return new RuleClass(params);
        } else if (name === 'pattern') {
          return new RuleClass(params);
        } else {
          return new RuleClass(params);
        }
      } else {
        return new RuleClass();
      }
    }

    // Check if it's a custom rule
    if (this.customRules.has(name)) {
      const customRule = this.customRules.get(name);
      return {
        validate: customRule.validate,
        getMessage: () => customRule.message,
        params: params
      };
    }

    // Instead of throwing an error, log a warning and return null
    console.warn(`Unknown validation rule: ${name}. This rule will be ignored.`);
    return null;
  }

  /**
   * Parse rules from various formats
   * @param {string|Object|Array} rules - Rules in different formats
   * @returns {Array} Array of rule instances
   */
  parseRules(rules) {
    if (!rules) return [];

    // Handle object format: { required: true, min: 5, max: 15 }
    if (typeof rules === 'object' && !Array.isArray(rules)) {
      const ruleInstances = [];
      
      for (const [ruleName, ruleValue] of Object.entries(rules)) {
        if (ruleValue === false) continue; // Skip disabled rules
        
        let ruleInstance;
        if (ruleValue === true) {
          ruleInstance = this.create(ruleName);
        } else {
          ruleInstance = this.create(ruleName, ruleValue);
        }
        
        // Only add valid rule instances (filter out null values from unknown rules)
        if (ruleInstance !== null) {
          ruleInstances.push(ruleInstance);
        }
      }
      
      return ruleInstances;
    }

    // Handle array format: ['required', 'min:5', 'max:15']
    if (Array.isArray(rules)) {
      return rules.map(rule => {
        let ruleInstance;
        if (typeof rule === 'string') {
          ruleInstance = this.parseStringRule(rule);
        } else if (typeof rule === 'object') {
          // Handle rule objects in array
          const [ruleName, ruleParams] = Object.entries(rule)[0];
          ruleInstance = this.create(ruleName, ruleParams);
        } else {
          ruleInstance = rule; // Assume it's already a rule instance
        }
        return ruleInstance;
      }).filter(rule => rule !== null); // Filter out null values from unknown rules
    }

    // Handle string format: 'required|min:5|max:15'
    if (typeof rules === 'string') {
      return rules.split('|').map(rule => this.parseStringRule(rule)).filter(rule => rule !== null);
    }

    return [];
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
    } else if (params.length === 1) {
      // Try to parse as number if possible
      const param = isNaN(params[0]) ? params[0] : Number(params[0]);
      return this.create(ruleName, param);
    } else {
      // Multiple parameters
      return this.create(ruleName, params);
    }
  }

  /**
   * Check if a rule exists
   * @param {string} name - The rule name
   * @returns {boolean} True if rule exists
   */
  has(name) {
    return this.rules.has(name) || this.customRules.has(name);
  }

  /**
   * Get all registered rule names
   * @returns {string[]} Array of rule names
   */
  getRuleNames() {
    return [
      ...Array.from(this.rules.keys()),
      ...Array.from(this.customRules.keys())
    ];
  }

  /**
   * Remove a rule
   * @param {string} name - The rule name
   */
  remove(name) {
    this.rules.delete(name);
    this.customRules.delete(name);
  }

  /**
   * Clear all rules except built-in ones
   */
  clearCustomRules() {
    this.customRules.clear();
  }

  /**
   * Clear all rules including built-in ones
   */
  clear() {
    this.rules.clear();
    this.customRules.clear();
  }
}
