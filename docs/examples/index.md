# Examples Overview

Explore comprehensive examples for both Vue 3 and Vanilla JavaScript implementations.

## Vue 3 Examples

### 🚀 Quick Start
- **[Basic Validation](/examples/vue/basic)** - Simple form validation with `v-rules`
- **[ValidatorForm Component](/examples/vue/form)** - Complete form management
- **[Custom Rules](/examples/vue/custom-rules)** - Creating custom validation rules
- **[Multi-language](/examples/vue/i18n)** - Internationalization examples

### 🎯 Real-world Scenarios
- **Contact Forms** - Newsletter signups, contact us forms
- **User Registration** - Account creation with complex validation
- **E-commerce Checkout** - Multi-step checkout processes
- **Profile Management** - User profile editing with conditional rules

## Vanilla JavaScript Examples

### 🛠️ Core Implementation
- **[Basic Usage](/examples/js/basic)** - Core validator without frameworks
- **[DOM Integration](/examples/js/dom)** - Advanced DOM manipulation patterns
- **[Custom Rules](/examples/js/custom-rules)** - JavaScript-specific custom rules
- **[Async Validation](/examples/js/async)** - Handling asynchronous validation

### 🎪 Advanced Patterns
- **Dynamic Forms** - JSON-driven form generation
- **Real-time Validation** - Live validation with debouncing
- **Form Builders** - Interactive form creation tools
- **Multi-language Support** - Language switching without Vue

## Getting Started

Choose your preferred technology stack:

::: code-group

```vue [Vue 3]
<template>
  <ValidatorForm v-model="formData" :rules="rules">
    <input 
      v-model="formData.email"
      v-rules="rules.email"
      name="email"
      placeholder="Enter email"
    />
  </ValidatorForm>
</template>

<script setup>
import { ref } from 'vue'
import { ValidatorForm } from '@vueller/validator/vue'

const formData = ref({ email: '' })
const rules = {
  email: { required: true, email: true }
}
</script>
```

```javascript [Vanilla JS]
import { Validator } from '@vueller/validator'

const validator = new Validator()

// Validate single field
const isValid = await validator.validate(
  'user@example.com', 
  { required: true, email: true }
)

// Validate entire form
const formData = { email: 'user@example.com' }
const rules = { email: { required: true, email: true } }
const allValid = await validator.validateAll(formData, rules)
```

:::

## Example Categories

### By Use Case

#### 📝 Forms
- **Login/Registration** - User authentication forms
- **Contact Forms** - Customer inquiry forms  
- **Surveys** - Multi-question survey forms
- **Settings** - User preference panels

#### 🛒 E-commerce
- **Product Reviews** - Rating and review forms
- **Checkout** - Payment and shipping forms
- **Wishlists** - Product selection forms
- **User Profiles** - Account management

#### 💼 Business
- **Lead Generation** - Marketing capture forms
- **Job Applications** - Career opportunity forms
- **Feedback** - Customer satisfaction surveys
- **Booking** - Appointment scheduling forms

### By Complexity

#### 🟢 Beginner
Simple single-field validation examples perfect for learning the basics.

```vue
<!-- Email validation only -->
<input v-model="email" v-rules="{ email: true }" name="email" />
```

#### 🟡 Intermediate  
Multi-field forms with cross-field validation and custom rules.

```vue
<!-- Password confirmation -->
<input v-model="password" v-rules="{ required: true, min: 8 }" name="password" />
<input v-model="confirmPassword" v-rules="{ confirmed: 'password' }" name="confirmPassword" />
```

#### 🔴 Advanced
Complex forms with async validation, conditional rules, and custom components.

```vue
<!-- Dynamic rules based on user type -->
<ValidatorForm :rules="dynamicRules" v-model="formData">
  <UserTypeSelector v-model="formData.userType" />
  <ConditionalFields :user-type="formData.userType" />
</ValidatorForm>
```

## Interactive Playground

Try out @vueller/validator in your browser:

- **[CodePen Examples](https://codepen.io/collection/validator-examples)** - Quick experiments
- **[JSFiddle Demos](https://jsfiddle.net/user/vueller-validator)** - Interactive demos
- **[StackBlitz Projects](https://stackblitz.com/@vueller/collections/validator)** - Full projects

## Download Examples

All examples are available for download:

- **[Vue 3 Examples (ZIP)](./downloads/vue3-examples.zip)** - Complete Vue 3 project examples
- **[Vanilla JS Examples (ZIP)](./downloads/js-examples.zip)** - Pure JavaScript implementations
- **[All Examples (ZIP)](./downloads/all-examples.zip)** - Complete package

## Contributing Examples

Have a great example to share? We'd love to include it!

1. **Fork** the [repository](https://github.com/vueller/validator)
2. **Create** your example in the appropriate directory
3. **Document** your example with clear comments
4. **Submit** a pull request

### Example Guidelines

- **Clear Documentation** - Explain what the example demonstrates
- **Real-world Scenarios** - Use practical, relatable use cases
- **Progressive Complexity** - Start simple, build up features
- **Best Practices** - Demonstrate proper validation patterns
- **Cross-browser Compatibility** - Test in major browsers

## Need Help?

- **[GitHub Issues](https://github.com/vueller/validator/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/vueller/validator/discussions)** - Community support
- **[Documentation](/)** - Complete API reference

## Quick Navigation

### Vue 3
- [Basic Validation →](/examples/vue/basic)
- [ValidatorForm →](/examples/vue/form)  
- [Custom Rules →](/examples/vue/custom-rules)
- [Internationalization →](/examples/vue/i18n)

### Vanilla JavaScript
- [Core Usage →](/examples/js/basic)
- [DOM Integration →](/examples/js/dom)
- [Custom Rules →](/examples/js/custom-rules)
- [Async Validation →](/examples/js/async)

Ready to start building? Choose your preferred approach and dive into the examples!