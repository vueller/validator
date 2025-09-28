---
layout: home

hero:
  name: Universal Validator
  text: Modern Validation Library
  tagline: Framework-agnostic validation with reactive support for JavaScript and Vue.js applications
  image:
    src: /logo.svg
    alt: Universal Validator
  actions:
    - theme: brand
      text: Get Started
      link: /guide/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/vueller/validator

features:
  - icon: 🌐
    title: Universal
    details: Works with vanilla JavaScript, Vue.js, and any framework
  - icon: ⚡
    title: Reactive
    details: Real-time validation with automatic UI updates
  - icon: 🎯
    title: Scope-based
    details: Multiple forms in the same page with isolated validation
  - icon: 🧩
    title: Modular
    details: Clean architecture with extensible rules system
  - icon: 🌍
    title: i18n Ready
    details: Built-in internationalization support
  - icon: 🎨
    title: Framework Agnostic
    details: No dependencies on specific frameworks
---

## Quick Example

::: code-group

```javascript [JavaScript]
import { createValidator } from '@vueller/validator';

// Create validator and set rules
const validator = createValidator();
validator.setRules('email', { required: true, email: true });
validator.setRules('password', { required: true, min: 8 });

// Validate with data
const formData = {
  email: 'user@example.com',
  password: 'mypassword123'
};

const isValid = await validator.validate(formData);
console.log('Form is valid:', isValid);
```

```vue [Vue.js]
<template>
  <ValidatorForm v-model="formData" :rules="rules" @submit="handleSubmit">
    <ValidatorField field="email" v-model="formData.email">
      <input v-model="formData.email" type="email" placeholder="Email" />
    </ValidatorField>
    
    <ValidatorField field="password" v-model="formData.password">
      <input v-model="formData.password" type="password" placeholder="Password" />
    </ValidatorField>
    
    <button type="submit">Submit</button>
  </ValidatorForm>
</template>

<script setup>
import { ref } from 'vue';
import { ValidatorForm, ValidatorField } from '@vueller/validator/vue';

const formData = ref({ email: '', password: '' });
const rules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
};

const handleSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data);
  }
};
</script>
```

:::

## Why Universal Validator?

### 🚀 **Modern Architecture**
Built with modern JavaScript patterns, supporting both synchronous and asynchronous validation with a clean, intuitive API.

### 🎯 **Scope Management**
Handle multiple forms on the same page with isolated validation states, perfect for complex applications.

### ⚡ **Performance Focused**
Optimized for performance with smart caching, debouncing, and minimal re-renders.

### 🧪 **Battle Tested**
Comprehensive test suite ensuring reliability across different environments and use cases.
