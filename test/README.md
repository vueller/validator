# Test Suite

This directory contains comprehensive tests for the Universal Validator library, organized by functionality and scope.

## 📁 Test Structure

### **Core Tests** (`/core/`)

- **`validator.test.js`** - Main Validator class functionality
- **`error-bag.test.js`** - ErrorBag class and error management
- **`i18n-manager.test.js`** - Internationalization and translation management

### **Rules Tests** (`/rules/`)

- **`validation-rules.test.js`** - All built-in validation rules (required, email, min, max, etc.)

### **Vue Tests** (`/vue/`)

- **`composables.test.js`** - Vue composables and reactive integration
- **`directives.test.js`** - Vue directives functionality
- **`global-validation.test.js`** - Global validation state management
- **`plugin.test.js`** - Vue plugin installation and configuration
- **`utils.test.js`** - Vue utility functions

### **Integration Tests** (`/integration/`)

- **`end-to-end.test.js`** - Complete validation workflows and real-world scenarios

### **Legacy Tests**

- **`basic.test.js`** - Original basic functionality tests

## 🚀 Running Tests

### **All Tests**

```bash
npm test
```

### **Specific Test Categories**

```bash
# Core functionality
npm run test:core

# Validation rules
npm run test:rules

# Vue integration
npm run test:vue

# Integration tests
npm run test:integration
```

### **Development Mode**

```bash
# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (no watch, with coverage)
npm run test:ci
```

## 📊 Test Coverage

The test suite aims for comprehensive coverage including:

- **Unit Tests** - Individual functions and methods
- **Integration Tests** - Component interactions
- **Edge Cases** - Boundary conditions and error scenarios
- **Performance Tests** - Large datasets and concurrent operations
- **Real-world Scenarios** - Actual use cases and workflows

## 🧪 Test Categories

### **1. Core Functionality**

- Validator class instantiation and configuration
- Rule management (set, get, remove, check)
- Data management (set, get, update)
- Validation execution (scope-based, field-specific)
- Error collection and management
- Custom rule creation and validation

### **2. Error Management**

- Error addition and retrieval
- Error counting and checking
- Error clearing and reset
- Reactive error state updates
- Vue state integration

### **3. Internationalization**

- Locale management and switching
- Message loading and overriding
- Translation fallbacks
- Custom message formatting
- Multi-language support

### **4. Validation Rules**

- Built-in rules (required, email, min, max, numeric, pattern, confirmed)
- Rule parameter validation
- Edge case handling
- Performance with large datasets
- Custom rule integration

### **5. Vue Integration**

- Composable functionality
- Reactive state management
- Directive behavior
- Plugin installation
- Component integration

### **6. End-to-End Workflows**

- Complete form validation
- Multi-step form handling
- Internationalization workflows
- Custom business rules
- Performance scenarios
- Error recovery patterns

## 🔧 Test Configuration

### **Jest Configuration**

- **Environment**: Node.js
- **Timeout**: 10 seconds
- **Coverage**: HTML, LCOV, and text reports
- **Setup**: Global test utilities and mocks

### **Test Utilities**

- **Mock Data**: Predefined test data generators
- **Mock Rules**: Common validation rule sets
- **Performance Mocks**: Timing and performance utilities
- **Vue Mocks**: Vue.js reactive system mocks

### **Global Mocks**

- **Console**: Suppressed logging in tests
- **Vue**: Mocked Vue 3 reactive system
- **DOM**: Mocked DOM APIs
- **Performance**: Mocked performance.now()

## 📈 Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## 🐛 Debugging Tests

### **Verbose Output**

```bash
npm test -- --verbose
```

### **Specific Test File**

```bash
npm test -- test/core/validator.test.js
```

### **Pattern Matching**

```bash
npm test -- --testNamePattern="should validate"
```

### **Coverage for Specific Files**

```bash
npm run test:coverage -- --collectCoverageFrom="src/core/**/*.js"
```

## 🔄 Continuous Integration

The test suite is designed to run in CI environments with:

- **No watch mode** - Tests run once and exit
- **Coverage reporting** - Generates coverage reports
- **Exit on failure** - Stops on first test failure
- **Performance thresholds** - Validates performance requirements

## 📝 Writing Tests

### **Test Structure**

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  describe('Specific Functionality', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = 'test';

      // Act
      const result = await functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### **Best Practices**

- **Descriptive names** - Clear test descriptions
- **Single responsibility** - One assertion per test
- **Setup/teardown** - Proper test isolation
- **Async handling** - Proper async/await usage
- **Error testing** - Test both success and failure cases
- **Edge cases** - Test boundary conditions

### **Mock Usage**

- **Minimal mocking** - Only mock external dependencies
- **Real behavior** - Test actual functionality when possible
- **Consistent mocks** - Use global test utilities
- **Cleanup** - Restore mocks after tests

## 🚨 Common Issues

### **Async Tests**

- Always use `async/await` for asynchronous operations
- Use proper timeout settings for long-running tests
- Handle promise rejections appropriately

### **Vue Tests**

- Mock Vue reactive system properly
- Test both reactive and non-reactive scenarios
- Handle Vue lifecycle hooks correctly

### **Performance Tests**

- Use realistic data sizes
- Set appropriate performance thresholds
- Consider CI environment limitations

## 📚 Related Documentation

- **Main Documentation** - `/docs` directory
- **API Reference** - `/docs/api` directory
- **Examples** - `/examples` directory
- **Source Code** - `/src` directory
