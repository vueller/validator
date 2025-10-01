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
      link: /guide/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/vueller/validator

features:
  - icon: 🌐
    title: Universal
    details: Works with vanilla JavaScript and integrates deeply with Vue 3
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
    details: Built-in internationalization with customizable messages and locale support
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
  <ValidationForm v-slot="{ values, errors }" :rules="rules" @submit="onSubmit">
    <input id="email" name="email" v-label="'E-mail'" />
    <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
    
    <input id="password" name="password" type="password" v-label="'Password'" />
    <div v-if="errors.has('password')">{{ errors.first('password') }}</div>
    
    <button type="submit">Submit</button>
  </ValidationForm>
  
  <button @click="setLang('pt-BR')">pt-BR</button>
  <button @click="setLang('en')">en</button>
  
</template>

<script setup>
import { ref } from 'vue'
import { ValidationForm, setGlobalLocale } from '@vueller/validator/vue'

const rules = ref({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
})

const onSubmit = ({ data, isValid }) => {
  if (isValid) {
    // handle success
  }
}

const setLang = (code) => setGlobalLocale(code)
</script>
```

:::

## Why @vueller/validator?

### 🚀 **Modern Architecture**
Built with modern JavaScript patterns, supporting both synchronous and asynchronous validation with a clean, intuitive API.

### 🎯 **Scope Management**
Handle multiple forms on the same page with isolated validation states, perfect for complex applications.

### ⚡ **Performance Focused**
Optimized for performance with smart caching, debouncing, and minimal re-renders.

### 🧪 **Battle Tested**
Comprehensive test suite ensuring reliability across different environments and use cases.
