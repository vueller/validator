/**
 * Tests for Vue plugin installation
 * Testing install function and plugin configuration
 */

import { install } from '../../src/vue/index.js';
import { Validator } from '../../src/core/index.js';

// Mock Vue app
const createMockApp = () => ({
  directive: jest.fn(),
  component: jest.fn(),
  provide: jest.fn(),
  config: {
    globalProperties: {}
  },
  _validatorConfig: null
});

describe('Vue Plugin Installation', () => {
  let mockApp;

  beforeEach(() => {
    mockApp = createMockApp();
    jest.clearAllMocks();
  });

  describe('install function', () => {
    test('should register directives', () => {
      install(mockApp);

      expect(mockApp.directive).toHaveBeenCalledWith('rules', expect.any(Object));
      expect(mockApp.directive).toHaveBeenCalledWith('validate', expect.any(Object));
    });

    test('should register components', () => {
      install(mockApp);

      expect(mockApp.component).toHaveBeenCalledWith('ValidatorForm', expect.any(Object));
      expect(mockApp.component).toHaveBeenCalledWith('ValidatorField', expect.any(Object));
    });

    test('should use default configuration', () => {
      install(mockApp);

      expect(mockApp._validatorConfig).toEqual({
        validateOnBlur: true,
        validateOnInput: false,
        locale: 'en'
      });
    });

    test('should merge custom options with defaults', () => {
      const options = {
        validateOnBlur: false,
        validateOnInput: true,
        locale: 'pt-BR',
        customOption: 'test'
      };

      install(mockApp, options);

      expect(mockApp._validatorConfig).toEqual({
        validateOnBlur: false,
        validateOnInput: true,
        locale: 'pt-BR',
        customOption: 'test'
      });
    });

    test('should create global validator when requested', () => {
      const options = { globalValidator: true };

      install(mockApp, options);

      expect(mockApp.provide).toHaveBeenCalledWith(
        expect.any(Symbol), // ValidatorSymbol
        expect.any(Validator)
      );
      expect(mockApp.config.globalProperties.$validatorConfig).toBeDefined();
    });

    test('should add global properties when requested', () => {
      const options = { 
        globalValidator: true,
        globalProperties: true 
      };

      install(mockApp, options);

      expect(mockApp.config.globalProperties.$validator).toBeDefined();
      expect(mockApp.config.globalProperties.$validatorConfig).toBeDefined();
      expect(mockApp.config.globalProperties.$validate).toBeDefined();
      expect(mockApp.config.globalProperties.$validatorUniversal).toBeDefined();
    });

    test('should not add global properties by default', () => {
      install(mockApp);

      expect(mockApp.config.globalProperties.$validator).toBeUndefined();
      expect(mockApp.config.globalProperties.$validate).toBeUndefined();
    });
  });

  describe('global validator configuration', () => {
    test('should create validator with configuration methods', () => {
      const options = { 
        globalValidator: true,
        locale: 'pt-BR',
        validateOnBlur: false
      };

      install(mockApp, options);

      // Get the validator instance from the provide call
      const provideCall = mockApp.provide.mock.calls.find(call => 
        typeof call[0] === 'symbol'
      );
      const validator = provideCall[1];

      expect(validator).toBeInstanceOf(Validator);
      expect(typeof validator.getGlobalConfig).toBe('function');
      expect(typeof validator.setGlobalConfig).toBe('function');

      // Test configuration methods
      const config = validator.getGlobalConfig();
      expect(config.locale).toBe('pt-BR');
      expect(config.validateOnBlur).toBe(false);

      // Test setGlobalConfig
      validator.setGlobalConfig({ validateOnInput: true });
      const updatedConfig = validator.getGlobalConfig();
      expect(updatedConfig.validateOnInput).toBe(true);
    });
  });

  describe('plugin exports', () => {
    test('should export install function', () => {
      expect(typeof install).toBe('function');
    });

    test('should export components and utilities', () => {
      const vuePlugin = require('../../src/vue/index.js');
      
      expect(vuePlugin.ValidatorForm).toBeDefined();
      expect(vuePlugin.ValidatorField).toBeDefined();
      expect(vuePlugin.useValidator).toBeDefined();
      expect(vuePlugin.ValidatorSymbol).toBeDefined();
      expect(vuePlugin.globalValidation).toBeDefined();
      expect(vuePlugin.universalValidator).toBeDefined();
      expect(vuePlugin.rulesDirective).toBeDefined();
      expect(vuePlugin.validateDirective).toBeDefined();
    });

    test('should have default export with install method', () => {
      const vuePlugin = require('../../src/vue/index.js');
      
      expect(vuePlugin.default).toBeDefined();
      expect(vuePlugin.default.install).toBe(install);
      expect(vuePlugin.default.ValidatorForm).toBeDefined();
      expect(vuePlugin.default.ValidatorField).toBeDefined();
    });
  });

  describe('configuration scenarios', () => {
    test('should handle minimal configuration', () => {
      install(mockApp, {});

      expect(mockApp.directive).toHaveBeenCalledTimes(2);
      expect(mockApp.component).toHaveBeenCalledTimes(2);
      expect(mockApp.provide).not.toHaveBeenCalled();
    });

    test('should handle full configuration', () => {
      const options = {
        globalValidator: true,
        globalProperties: true,
        validateOnBlur: true,
        validateOnInput: true,
        locale: 'es'
      };

      install(mockApp, options);

      expect(mockApp.directive).toHaveBeenCalledTimes(2);
      expect(mockApp.component).toHaveBeenCalledTimes(2);
      expect(mockApp.provide).toHaveBeenCalledTimes(1);
      expect(Object.keys(mockApp.config.globalProperties)).toHaveLength(4);
      expect(mockApp._validatorConfig.locale).toBe('es');
    });
  });
});
