# Universal Validator Examples

This directory contains comprehensive examples demonstrating the Universal Validator library usage in different scenarios and frameworks.

## 📁 Examples Structure

### **Core JavaScript Examples**
- **`basic-usage.js`** - Fundamental validation concepts and patterns
- **`internationalization.js`** - Multi-language support and custom translations

### **Vue.js Examples**
- **`vue-integration.vue`** - Complete Vue component with all validator features
- **`vue-composables.js`** - Custom composables for advanced Vue integration

### **Documentation**
- **`import-examples.md`** - Import patterns and package structure guide
- **`README.md`** - This overview document

## 🚀 Quick Start

### JavaScript Usage
```javascript
import { validator } from '@vueller/validator';
import { ptBR } from '@vueller/validator/locales';

// Setup
validator.setLocale('pt-BR');
validator.loadTranslations(ptBR);

// Validate
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}, {}, 'loginForm');

const isValid = await validator.validate('loginForm', {
  email: 'user@example.com',
  password: 'mypassword'
});
```

### Vue.js Usage
```vue
<script setup>
import { ValidatorForm } from '@vueller/validator';

const rules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
};
</script>

<template>
  <ValidatorForm :rules="rules" v-model="formData" scope="loginForm">
    <!-- Form fields -->
  </ValidatorForm>
</template>
```

## 📚 Example Categories

### **1. Basic Validation** (`basic-usage.js`)
- Simple form validation
- Field-specific validation
- Custom validation rules
- Multiple scope management
- Error handling

**Key Features:**
- Scope-based validation
- Fluent API usage
- Custom rule creation
- Multiple form handling

### **2. Internationalization** (`internationalization.js`)
- Built-in locale loading
- Custom translation creation
- Translation overrides
- Dynamic language switching
- Advanced translation management

**Key Features:**
- Multi-language support
- Custom message formatting
- Runtime locale switching
- Translation inheritance

### **3. Vue Integration** (`vue-integration.vue`)
- ValidatorForm component usage
- ValidatorField component usage
- useValidator composable
- Language switching in Vue
- Real-time validation feedback

**Key Features:**
- Component integration
- Reactive validation
- Form submission handling
- Multi-language UI

### **4. Vue Composables** (`vue-composables.js`)
- Enhanced validation composables
- Translation management composables
- Field-level validation composables
- Reusable validation patterns

**Key Features:**
- Custom composable patterns
- Advanced form management
- Field-level control
- Reusable validation logic

## 🎯 Usage Patterns

### **Import Patterns**
```javascript
// Core validator
import { validator, createValidator } from '@vueller/validator';

// Vue components and composables
import { ValidatorForm, ValidatorField, useValidator } from '@vueller/validator';

// Translations
import { ptBR, en } from '@vueller/validator/locales';

// Advanced (rules, utilities)
import { RequiredRule, EmailRule } from '@vueller/validator';
```

### **Validation Patterns**
```javascript
// 1. Scope-based validation
validator.validate('formScope', formData);

// 2. Field-specific validation
validator.validate('formScope').field('email', 'test@example.com');

// 3. Custom rules
validator.extend('cpf', (value) => /* validation logic */);

// 4. Translation loading
validator.loadTranslations(ptBR, customMessages);
```

## 🔧 Running Examples

### **Node.js Examples**
```bash
# Run basic usage examples
node examples/basic-usage.js

# Run internationalization examples
node examples/internationalization.js
```

### **Vue Examples**
The Vue examples are designed to be used within a Vue application. Import the components and composables in your Vue project.

### **Development Setup**
```bash
# Install dependencies
npm install

# Run development server (if using with a Vue app)
npm run dev

# Run tests
npm test
```

## 📖 Learning Path

### **Beginners**
1. Start with `basic-usage.js` to understand core concepts
2. Explore `import-examples.md` for proper import patterns
3. Try `internationalization.js` for translation features

### **Vue Developers**
1. Review `vue-integration.vue` for component usage
2. Study `vue-composables.js` for advanced patterns
3. Implement custom composables based on examples

### **Advanced Users**
1. Extend examples with custom rules
2. Create multi-step validation flows
3. Integrate with state management solutions

## 🎨 Code Style

All examples follow clean code principles:
- **Descriptive naming** - Clear variable and function names
- **Modular structure** - Separated concerns and reusable code
- **Comprehensive comments** - Explanatory documentation
- **Error handling** - Proper error management
- **Performance optimization** - Efficient validation patterns

## 📝 Contributing

When adding new examples:
1. Follow the established naming convention
2. Include comprehensive documentation
3. Provide both simple and advanced usage
4. Test examples thoroughly
5. Update this README with new content

## 🔗 Related Resources

- **Main Documentation** - `/docs` directory
- **API Reference** - `/docs/api` directory
- **Source Code** - `/src` directory
- **Tests** - `/test` directory

## ❓ Need Help?

- Check the main documentation in `/docs`
- Review API reference for detailed method documentation
- Look at test files for additional usage examples
- Create an issue for specific questions or bug reports
