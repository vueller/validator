---
layout: home

hero:
  name: '@vueller/validator'
  text: 'Modern Validation Library'
  tagline: 'Framework-agnostic validation with reactive support for JavaScript and Vue 3'
  image:
    src: /logo.svg
    alt: '@vueller/validator'
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/vueller/validator

features:
  - icon: 🌐
    title: Universal
    details: Works with vanilla JavaScript and integrates deeply with Vue 3
  - icon: ⚡
    title: Reactive
    details: Real-time validation with automatic UI updates and optimized performance
  - icon: 🎯
    title: Global Instance
    details: Single validator instance shared across the entire application
  - icon: 🧩
    title: Custom Rules
    details: Easy custom rule creation with fallback message system
  - icon: 🌍
    title: i18n Ready
    details: Built-in internationalization with hierarchical message resolution
  - icon: 🎨
    title: Framework Agnostic
    details: No dependencies on specific frameworks
---

## Quick Example

::: code-group

```javascript [JavaScript]
import { Validator } from '@vueller/validator';

const validator = new Validator({ locale: 'en' });
validator.setRules('email', { required: true, email: true });
validator.setRules('password', { required: true, min: 8 });

validator.setData({ email: 'user@example.com', password: 'mypassword123' });
const isValid = await validator.validate();
```

```vue [Vue 3]
<template>
  <div>
    <!-- Global language switcher -->
    <button @click="changeLanguage('pt-BR')">Português</button>
    <button @click="changeLanguage('en')">English</button>
    
    <!-- Validation Form -->
    <ValidationForm v-slot="{ values, errors, isValid }" :rules="rules" @submit="onSubmit">
      <input name="email" v-label="'E-mail'" v-rules="{ required: true, email: true }" />
      <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
      
      <input name="password" type="password" v-label="'Password'" v-rules="{ required: true, min: 8 }" />
      <div v-if="errors.has('password')">{{ errors.first('password') }}</div>
      
      <button type="submit" :disabled="!isValid">Submit</button>
    </ValidationForm>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ValidationForm, useValidator } from '@vueller/validator/vue'

// Access global validator
const { setLocale } = useValidator();

const rules = ref({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
})

const onSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data);
  }
}

const changeLanguage = (locale) => {
  setLocale(locale);
}
</script>
```

:::

## What's New in v2.0

### ✨ **Major Updates**
- **Global Validator Instance**: Single validator shared across the entire application
- **Simplified Vue Plugin**: Easy setup with `app.use(validator, options)`
- **Enhanced Composables**: Modern Vue 3 Composition API integration
- **Automatic Validation**: No need for `v-validate` directive on custom rules
- **Improved Reactivity**: Better performance with optimized update cycles
- **Custom Rule Messages**: Fallback message system with locale-specific overrides

### 🚀 **Getting Started**
Ready to start validating? Head over to the [Getting Started Guide](/guide/getting-started) to begin your validation journey!

## Why @vueller/validator?

### 🚀 **Modern Architecture**
Built with modern JavaScript patterns, supporting both synchronous and asynchronous validation with a clean, intuitive API.

### 🎯 **Global Instance Management**
Handle validation across your entire application with a single, shared validator instance.

### ⚡ **Performance Focused**
Optimized for performance with smart caching, debouncing, and minimal re-renders.

### 🧪 **Battle Tested**
Comprehensive test suite ensuring reliability across different environments and use cases.
