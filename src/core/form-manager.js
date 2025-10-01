/**
 * FormManager - Manages form data and field states
 * Handles data storage, field tracking, and form lifecycle
 */

export class FormManager {
  constructor() {
    this.forms = new Map(); // Map<scope, FormData>
    this.fieldStates = new Map(); // Map<scope, Map<field, FieldState>>
    this.listeners = new Set();
  }

  /**
   * Create or get form data for a scope
   * @param {string} scope - Form scope identifier
   * @returns {Object} Form data object
   */
  getFormData(scope = 'default') {
    if (!this.forms.has(scope)) {
      this.forms.set(scope, {});
    }
    return this.forms.get(scope);
  }

  /**
   * Create or get field states for a scope
   * @param {string} scope - Form scope identifier
   * @returns {Map} Field states map
   */
  getFieldStates(scope = 'default') {
    if (!this.fieldStates.has(scope)) {
      this.fieldStates.set(scope, new Map());
    }
    return this.fieldStates.get(scope);
  }

  /**
   * Set form data
   * @param {Object} data - Form data
   * @param {string} scope - Form scope
   */
  setFormData(data, scope = 'default') {
    const formData = this.getFormData(scope);
    Object.assign(formData, data);
    this.notifyListeners();
  }

  /**
   * Set a single field value
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @param {string} scope - Form scope
   */
  setFieldValue(field, value, scope = 'default') {
    const formData = this.getFormData(scope);
    formData[field] = value;
    this.notifyListeners();
  }

  /**
   * Get a single field value
   * @param {string} field - Field name
   * @param {string} scope - Form scope
   * @returns {any} Field value
   */
  getFieldValue(field, scope = 'default') {
    const formData = this.getFormData(scope);
    return formData[field];
  }

  /**
   * Get all form data
   * @param {string} scope - Form scope
   * @returns {Object} Form data
   */
  getAllFormData(scope = 'default') {
    return { ...this.getFormData(scope) };
  }

  /**
   * Set field state
   * @param {string} field - Field name
   * @param {Object} state - Field state
   * @param {string} scope - Form scope
   */
  setFieldState(field, state, scope = 'default') {
    const fieldStates = this.getFieldStates(scope);
    const currentState = fieldStates.get(field) || {};
    fieldStates.set(field, { ...currentState, ...state });
    this.notifyListeners();
  }

  /**
   * Get field state
   * @param {string} field - Field name
   * @param {string} scope - Form scope
   * @returns {Object} Field state
   */
  getFieldState(field, scope = 'default') {
    const fieldStates = this.getFieldStates(scope);
    return fieldStates.get(field) || {};
  }

  /**
   * Clear form data
   * @param {string} scope - Form scope
   */
  clearFormData(scope = 'default') {
    if (scope === 'all') {
      this.forms.clear();
      this.fieldStates.clear();
    } else {
      this.forms.delete(scope);
      this.fieldStates.delete(scope);
    }
    this.notifyListeners();
  }

  /**
   * Reset form to initial state
   * @param {string} scope - Form scope
   */
  resetForm(scope = 'default') {
    this.clearFormData(scope);
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
      formData: this.getAllFormData(scope),
      fieldStates: Object.fromEntries(this.getFieldStates(scope)),
      hasData: Object.keys(this.getFormData(scope)).length > 0,
      
      // Methods
      setData: (data) => this.setFormData(data, scope),
      setValue: (field, value) => this.setFieldValue(field, value, scope),
      getValue: (field) => this.getFieldValue(field, scope),
      clear: () => this.clearFormData(scope),
      reset: () => this.resetForm(scope)
    };
  }
}
