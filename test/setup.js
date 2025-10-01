/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock Vue 3 APIs for testing
global.Vue = {
  ref: jest.fn((value) => ({ value })),
  reactive: jest.fn((obj) => obj),
  computed: jest.fn((fn) => ({ value: fn() })),
  watch: jest.fn(),
  watchEffect: jest.fn(),
  onMounted: jest.fn(),
  onUnmounted: jest.fn(),
  onUpdated: jest.fn(),
  nextTick: jest.fn((fn) => fn ? Promise.resolve().then(fn) : Promise.resolve()),
  provide: jest.fn(),
  inject: jest.fn(),
  createApp: jest.fn(() => ({
    directive: jest.fn(),
    component: jest.fn(),
    provide: jest.fn(),
    mount: jest.fn(),
    unmount: jest.fn()
  }))
};

// Mock DOM APIs
global.document = {
  createElement: jest.fn(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn()
    },
    value: '',
    type: 'text',
    name: '',
    textContent: ''
  })),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => [])
};

global.window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  location: { href: 'http://localhost' },
  navigator: { userAgent: 'test' }
};

// Mock fetch for any HTTP requests
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve('')
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock MutationObserver
global.MutationObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}));

// Global test utilities
global.createMockElement = (overrides = {}) => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setAttribute: jest.fn(),
  removeAttribute: jest.fn(),
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    toggle: jest.fn()
  },
  value: '',
  type: 'text',
  name: 'field',
  textContent: '',
  ...overrides
});

global.createMockBinding = (overrides = {}) => ({
  value: {},
  arg: null,
  modifiers: {},
  instance: {
    $validator: null
  },
  ...overrides
});

global.createMockVNode = (overrides = {}) => ({
  el: global.createMockElement(),
  props: {},
  children: [],
  ...overrides
});

// Mock validator for testing
global.createMockValidator = () => ({
  setRules: jest.fn(),
  getRules: jest.fn(),
  clearRules: jest.fn(),
  setData: jest.fn(),
  getData: jest.fn(),
  setField: jest.fn(),
  getField: jest.fn(),
  clearData: jest.fn(),
  validate: jest.fn(() => Promise.resolve(true)),
  validateField: jest.fn(() => Promise.resolve(true)),
  clearErrors: jest.fn(),
  errors: {
    has: jest.fn(() => false),
    get: jest.fn(() => []),
    first: jest.fn(() => undefined),
    all: jest.fn(() => []),
    allByField: jest.fn(() => ({})),
    any: jest.fn(() => false),
    count: jest.fn(() => 0),
    isEmpty: jest.fn(() => true),
    add: jest.fn(),
    clear: jest.fn()
  },
  addListener: jest.fn(),
  removeListener: jest.fn(),
  reset: jest.fn()
});

// Test timeout configuration
jest.setTimeout(10000);

// Suppress specific warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific warnings that are expected in tests
  if (
    args[0]?.includes?.('Vue') ||
    args[0]?.includes?.('directive') ||
    args[0]?.includes?.('component')
  ) {
    return;
  }
  originalWarn(...args);
};

// Global test helpers
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock file for testing file uploads
global.createMockFile = (name = 'test.txt', type = 'text/plain', content = 'test content') => {
  const file = new Blob([content], { type });
  file.name = name;
  file.lastModified = Date.now();
  return file;
};

// Mock FormData for testing
global.createMockFormData = (data = {}) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Test utilities are available globally