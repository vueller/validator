# Guide Overview

Welcome to the @vueller/validator guide! This comprehensive documentation will help you master our modern validation library.

## Quick Navigation

### 🚀 **Getting Started**
- [**Getting Started**](./getting-started.md) - Quick start with examples and key features
- [**Installation**](./installation.md) - Detailed installation instructions
- [**Basic Usage**](./basic-usage.md) - Core concepts and API fundamentals

### 🎯 **Framework Integration**
- [**Vue Integration**](./vue-integration.md) - Vue 3 specific features and components
- [**JavaScript Usage**](./javascript-usage.md) - Vanilla JavaScript implementation

### 🧩 **Advanced Features**
- [**Custom Rules**](./custom-rules.md) - Creating and managing custom validation rules
- [**Internationalization**](./internationalization.md) - Multi-language support and localization
- [**Advanced Patterns**](./advanced-patterns.md) - Complex validation scenarios and best practices

### 📚 **Reference**
- [**API Reference**](./api-reference.md) - Complete API documentation
- [**Validation Rules**](./validation-rules.md) - All available built-in rules
- [**Examples**](./examples.md) - Real-world usage examples

## What's New in v2.0

### ✨ **Major Updates**

- **Global Validator Instance**: Single validator shared across the entire application
- **Simplified Vue Plugin**: Easy setup with `app.use(validator, options)`
- **Enhanced Composables**: Modern Vue 3 Composition API integration
- **Automatic Validation**: No need for `v-validate` directive on custom rules
- **Improved Reactivity**: Better performance with optimized update cycles
- **Custom Rule Messages**: Fallback message system with locale-specific overrides

### 🔧 **Breaking Changes**

- **Plugin API**: New global plugin installation method
- **Composable Changes**: Updated `useValidator()` composable
- **Directive Updates**: Simplified directive usage
- **Message System**: Enhanced fallback message resolution

### 📖 **Migration Guide**

If you're upgrading from v1.x, check our [Migration Guide](./migration-guide.md) for detailed upgrade instructions.

## Philosophy

@vueller/validator follows these core principles:

### **Convention over Configuration**
```vue
<!-- This just works - no configuration needed -->
<input v-rules="{ required: true, email: true }" name="email" />
```

### **Framework Agnostic Core**
```javascript
// Same validation logic works everywhere
const validator = new Validator();
validator.setRules('email', { required: true, email: true });
```

### **Reactive by Default**
```vue
<!-- Automatic UI updates -->
<div v-if="errors.has('email')">{{ errors.first('email') }}</div>
```

## Getting Help

- 📖 **Documentation**: Comprehensive guides and API reference
- 💬 **Community**: Join our discussions on GitHub
- 🐛 **Issues**: Report bugs and request features
- 💡 **Examples**: Check out real-world usage examples

Ready to start? Head over to [Getting Started](./getting-started.md) to begin your validation journey!
