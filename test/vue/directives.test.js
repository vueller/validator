/**
 * Tests for Vue directives
 * Testing v-rules and v-validate directives
 */

import { rulesDirective } from '../../src/vue/directives/rules-directive.js';
import { validateDirective, setGlobalValidator, getGlobalValidator } from '../../src/vue/directives/validate-directive.js';
import { Validator } from '../../src/core/index.js';

// Mock Vue's inject function
const mockInject = jest.fn();
jest.mock('vue', () => ({
  inject: mockInject
}));

// Mock DOM environment
const mockElement = (props = {}) => ({
  name: props.name || '',
  id: props.id || '',
  classList: {
    classes: new Set(),
    add: function(className) { this.classes.add(className); },
    remove: function(className) { this.classes.delete(className); },
    contains: function(className) { return this.classes.has(className); }
  },
  closest: jest.fn().mockReturnValue(null),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  parentNode: {
    insertBefore: jest.fn()
  },
  nextSibling: null,
  ...props
});

const mockVNode = (props = {}) => ({
  props: props
});

const mockBinding = (value) => ({
  value: value
});

describe('Vue Directives', () => {
  let mockValidator;

  beforeEach(() => {
    mockValidator = {
      setRules: jest.fn(),
      removeRules: jest.fn(),
      validateField: jest.fn().mockResolvedValue(true),
      errors: jest.fn().mockReturnValue({
        has: jest.fn().mockReturnValue(false),
        get: jest.fn().mockReturnValue([])
      }),
      getGlobalConfig: jest.fn().mockReturnValue({})
    };
    jest.clearAllMocks();
  });

  describe('rulesDirective', () => {
    describe('created hook', () => {
      test('should warn if no validator instance provided', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        mockInject.mockReturnValue(null);

        const el = mockElement({ name: 'email' });
        const binding = mockBinding({ required: true });
        const vnode = mockVNode();

        rulesDirective.created(el, binding, vnode);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('v-rules directive requires a validator instance')
        );

        consoleSpy.mockRestore();
      });

      test('should warn if no field name found', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        mockInject.mockReturnValue(mockValidator);

        const el = mockElement(); // No name or id
        const binding = mockBinding({ required: true });
        const vnode = mockVNode();

        rulesDirective.created(el, binding, vnode);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('v-rules directive requires a field name')
        );

        consoleSpy.mockRestore();
      });

      test('should set rules and store field info', () => {
        mockInject.mockReturnValue(mockValidator);

        const el = mockElement({ name: 'email' });
        const binding = mockBinding({ required: true, email: true });
        const vnode = mockVNode();

        rulesDirective.created(el, binding, vnode);

        expect(mockValidator.setRules).toHaveBeenCalledWith('email', { required: true, email: true });
        expect(el._validatorField).toBe('email');
        expect(el._validatorRules).toEqual({ required: true, email: true });
        expect(el._validatorInstance).toBe(mockValidator);
      });
    });

    describe('updated hook', () => {
      test('should update rules if they changed', () => {
        mockInject.mockReturnValue(mockValidator);

        const el = mockElement();
        el._validatorField = 'email';
        el._validatorRules = { required: true };

        const binding = mockBinding({ required: true, email: true });
        const vnode = mockVNode();

        rulesDirective.updated(el, binding, vnode);

        expect(mockValidator.setRules).toHaveBeenCalledWith('email', { required: true, email: true });
        expect(el._validatorRules).toEqual({ required: true, email: true });
      });

      test('should not update rules if they are the same', () => {
        mockInject.mockReturnValue(mockValidator);

        const el = mockElement();
        el._validatorField = 'email';
        el._validatorRules = { required: true, email: true };

        const binding = mockBinding({ required: true, email: true });
        const vnode = mockVNode();

        rulesDirective.updated(el, binding, vnode);

        expect(mockValidator.setRules).not.toHaveBeenCalled();
      });
    });

    describe('unmounted hook', () => {
      test('should clean up validator rules and listeners', () => {
        mockInject.mockReturnValue(mockValidator);

        const el = mockElement();
        el._validatorField = 'email';
        el._blurHandler = jest.fn();
        el._inputHandler = jest.fn();

        rulesDirective.unmounted(el);

        expect(mockValidator.removeRules).toHaveBeenCalledWith('email');
        expect(el.removeEventListener).toHaveBeenCalledWith('blur', el._blurHandler);
        expect(el.removeEventListener).toHaveBeenCalledWith('input', el._inputHandler);
        expect(el._validatorField).toBeUndefined();
        expect(el._validatorRules).toBeUndefined();
        expect(el._validatorInstance).toBeUndefined();
      });
    });
  });

  describe('validateDirective', () => {
    describe('mounted hook', () => {
      test('should warn if no field name found', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        mockInject.mockReturnValue(null);

        const el = mockElement(); // No name or id
        const binding = mockBinding('required|email');
        const vnode = mockVNode();

        await validateDirective.mounted(el, binding, vnode);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('v-validate directive requires a field name')
        );

        consoleSpy.mockRestore();
      });

      test('should use injected validator if available', async () => {
        mockInject.mockReturnValue(mockValidator);

        const el = mockElement({ name: 'email' });
        const binding = mockBinding('required|email');
        const vnode = mockVNode();

        await validateDirective.mounted(el, binding, vnode);

        expect(el._validator).toBe(mockValidator);
        expect(el._fieldName).toBe('email');
        expect(mockValidator.setRules).toHaveBeenCalledWith('email', { required: true, email: true });
      });

      test('should create global validator if no injected validator', async () => {
        mockInject.mockReturnValue(null);

        const el = mockElement({ name: 'email' });
        const binding = mockBinding('required|email');
        const vnode = mockVNode();

        await validateDirective.mounted(el, binding, vnode);

        expect(el._validator).toBeInstanceOf(Validator);
        expect(el._fieldName).toBe('email');
      });
    });

    describe('updated hook', () => {
      test('should update rules when binding value changes', () => {
        const el = mockElement();
        el._validator = mockValidator;
        el._fieldName = 'email';

        const binding = mockBinding('required|email|min:5');
        const vnode = mockVNode();

        validateDirective.updated(el, binding, vnode);

        expect(mockValidator.setRules).toHaveBeenCalledWith('email', { 
          required: true, 
          email: true, 
          min: '5' 
        });
      });
    });

    describe('unmounted hook', () => {
      test('should clean up validator, error element and listeners', () => {
        const el = mockElement();
        el._validator = mockValidator;
        el._fieldName = 'email';
        el._errorElement = { remove: jest.fn() };
        el._blurHandler = jest.fn();

        validateDirective.unmounted(el);

        expect(mockValidator.removeRules).toHaveBeenCalledWith('email');
        expect(el._errorElement.remove).toHaveBeenCalled();
        expect(el.removeEventListener).toHaveBeenCalledWith('blur', el._blurHandler);
        expect(el._validator).toBeUndefined();
        expect(el._fieldName).toBeUndefined();
        expect(el._errorElement).toBeUndefined();
      });
    });
  });

  describe('Global Validator Management', () => {
    test('should set and get global validator', () => {
      const validator = new Validator();
      
      setGlobalValidator(validator);
      
      expect(getGlobalValidator()).toBe(validator);
    });

    test('should return null initially', () => {
      // Reset global validator
      setGlobalValidator(null);
      
      expect(getGlobalValidator()).toBeNull();
    });
  });
});

// Console mock for tests
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});
