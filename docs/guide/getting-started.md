# Getting Started

Welcome to @vueller/validator! This guide will help you get up and running quickly with our modern validation library.

## Quick Start

### Installation

```bash
npm install @vueller/validator
# or
yarn add @vueller/validator
# or
pnpm add @vueller/validator
```

### Basic Usage

#### JavaScript (Vanilla)

```javascript
import { Validator } from '@vueller/validator';

// Create validator instance
const validator = new Validator({
  locale: 'en',
  validateOnBlur: true,
  validateOnInput: false
});

// Set validation rules
validator.setRules('email', { required: true, email: true });
validator.setRules('password', { required: true, min: 8 });

// Set form data
validator.setData({ 
  email: 'user@example.com', 
  password: 'mypassword123' 
});

// Validate
const isValid = await validator.validate();
if (!isValid) {
  const errors = validator.errors().allByField();
  console.log('Validation errors:', errors);
}
```

#### Vue 3 (Global Plugin)

```javascript
// main.js
import { createApp } from 'vue';
import { validator } from '@vueller/validator/vue';
import App from './App.vue';

const app = createApp(App);

// Install validator globally
app.use(validator, {
  locale: 'en',
  validateOnBlur: true,
  validateOnInput: false,
  devtools: true
});

app.mount('#app');
```

```vue
<!-- App.vue -->
<template>
  <div>
    <!-- Global validator controls -->
    <button @click="changeLanguage('pt-BR')">Português</button>
    <button @click="changeLanguage('en')">English</button>
    
    <!-- Validation Form -->
    <ValidationForm v-slot="{ values, errors, isValid, setValue, getValue, setRules, clear }" 
                    :rules="rules" 
                    @submit="onSubmit">
      
      <div class="form-group">
        <label for="email">E-mail</label>
        <input 
          id="email" 
          name="email" 
          type="email"
          v-label="'E-mail'"
          v-rules="{ required: true, email: true }"
        />
        <div v-if="errors.has('email')" class="error">
          {{ errors.first('email') }}
        </div>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password" 
          name="password" 
          type="password"
          v-label="'Password'"
          v-rules="{ required: true, min: 8 }"
        />
        <div v-if="errors.has('password')" class="error">
          {{ errors.first('password') }}
        </div>
      </div>
      
      <div class="form-group">
        <label for="cpf">CPF</label>
        <input 
          id="cpf" 
          name="cpf" 
          type="text"
          v-label="'CPF'"
          v-rules="{ required: true, cpf: true }"
        />
        <div v-if="errors.has('cpf')" class="error">
          {{ errors.first('cpf') }}
        </div>
      </div>
      
      <button type="submit" :disabled="!isValid">
        Submit
      </button>
      
      <button type="button" @click="clear">
        Clear Form
      </button>
    </ValidationForm>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ValidationForm, useValidator } from '@vueller/validator/vue';

// Get global validator instance
const { setLocale } = useValidator();

// Form rules
const rules = ref({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  cpf: { required: true, cpf: true }
});

// Event handlers
const onSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data);
    // Handle form submission
  }
};

const changeLanguage = (locale) => {
  setLocale(locale);
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.error {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

## Key Features

### 🌐 **Universal Compatibility**
- Works with vanilla JavaScript and Vue 3
- Framework-agnostic core with Vue-specific integrations
- No external dependencies

### ⚡ **Reactive Validation**
- Real-time validation with automatic UI updates
- Built-in reactivity for Vue.js applications
- Manual control over validation timing

### 🎯 **Global Instance Management**
- Single validator instance shared across the entire application
- Global locale switching
- Centralized rule and message management

### 🧩 **Custom Rules & Messages**
- Easy custom rule creation with fallback messages
- Dynamic message management per locale
- Rule composition for complex validation scenarios

### 🌍 **Internationalization**
- Built-in i18n system with locale switching
- Custom message overrides
- Fallback message system

## What's Next?

- [**Installation**](./installation.md) - Detailed installation instructions
- [**Basic Usage**](./basic-usage.md) - Core concepts and API
- [**Vue Integration**](./vue-integration.md) - Vue 3 specific features
- [**Custom Rules**](./custom-rules.md) - Creating custom validation rules
- [**Internationalization**](./internationalization.md) - Multi-language support
- [**Advanced Patterns**](./advanced-patterns.md) - Complex validation scenarios
- [**API Reference**](./api-reference.md) - Complete API documentation
