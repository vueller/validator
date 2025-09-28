/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeEach(() => {
  // Suppress console.log in tests unless explicitly enabled
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
});

afterEach(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});

// Global test utilities
global.testUtils = {
  // Create test data
  createTestData: (fields = {}) => ({
    email: 'test@example.com',
    password: 'password123',
    name: 'John Doe',
    ...fields
  }),

  // Create test rules
  createTestRules: (fields = {}) => ({
    email: { required: true, email: true },
    password: { required: true, min: 8 },
    name: { required: true, min: 2 },
    ...fields
  }),

  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock performance.now for consistent timing tests
  mockPerformance: () => {
    let time = 0;
    global.performance = {
      now: () => time++
    };
  },

  // Reset performance mock
  resetPerformance: () => {
    delete global.performance;
  }
};

// Mock Vue for Vue-related tests
global.Vue = {
  ref: value => ({ value }),
  reactive: obj => obj,
  computed: fn => ({ value: fn() }),
  watch: () => {},
  onMounted: fn => fn(),
  onUnmounted: () => {}
};

// Mock DOM for DOM-related tests
global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => []
};

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { href: 'http://localhost' }
};

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
