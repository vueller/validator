# 📦 Installation & Setup

## Installation

### NPM

```bash
npm install @vueller/validator
```

### Yarn

```bash
yarn add @vueller/validator
```

### CDN

```html
<script src="https://unpkg.com/@vueller/validator/dist/validator.min.js"></script>
```

## Setup

### JavaScript/TypeScript

```javascript
import { Validator } from '@vueller/validator'

const validator = new Validator({ locale: 'en' })
validator.setRules('email', { required: true, email: true })
validator.setRules('password', { required: true, min: 8 })
validator.setData({ email: '', password: '' })
await validator.validate()
```

### Vue 3 Plugin

```ts
import { createApp } from 'vue'
import ValidationPlugin from '@vueller/validator/vue'
import App from './App.vue'

const app = createApp(App)
app.use(ValidationPlugin)
app.mount('#app')
```

### Vue 3 with ValidationForm

```vue
<script setup>
import { ref } from 'vue'
import { ValidationForm } from '@vueller/validator/vue'

const rules = ref({ email: { required: true, email: true } })
</script>

<template>
  <ValidationForm v-slot="{ errors }" :rules="rules">
    <input id="email" name="email" v-label="'E-mail'" />
    <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
    <button type="submit">Submit</button>
  </ValidationForm>
  
  <button @click="setGlobalLocale('pt-BR')">pt-BR</button>
  <button @click="setGlobalLocale('en')">en</button>
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
```
```

## Configuration Options

| Option               | Type      | Default | Description                       |
| -------------------- | --------- | ------- | --------------------------------- |
| `locale`             | `string`  | `'en'`  | Default locale for error messages |
| `validateOnBlur`     | `boolean` | `true`  | Auto-validate fields on blur      |
| `validateOnInput`    | `boolean` | `false` | Auto-validate fields on input     |
| `stopOnFirstFailure` | `boolean` | `false` | Stop validation on first error    |

## Framework-Specific Setup

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Validator Example</title>
  </head>
  <body>
    <form id="myForm">
      <input type="email" name="email" placeholder="Email" />
      <input type="password" name="password" placeholder="Password" />
      <button type="submit">Submit</button>
    </form>

    <script type="module">
      import { createValidator } from '@vueller/validator';

      const validator = createValidator();

      // Set validation rules
      validator.setRules('email', { required: true, email: true });
      validator.setRules('password', { required: true, min: 8 });

      // Handle form submission
      document.getElementById('myForm').addEventListener('submit', async e => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const isValid = await validator.validate(data);

        if (isValid) {
          console.log('Form is valid!', data);
        } else {
          console.log('Validation errors:', validator.errors().allByField());
        }
      });
    </script>
  </body>
</html>
```

### React (using Universal API)

```jsx
import React, { useState } from 'react';
import { validator } from '@vueller/validator/universal';

// Set rules once
validator.setRules('email', { required: true, email: true });
validator.setRules('password', { required: true, min: 8 });

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async e => {
    e.preventDefault();

    const isValid = await validator.validate(formData);

    if (isValid) {
      console.log('Form submitted:', formData);
    } else {
      setErrors(validator.getErrors());
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type='email'
          placeholder='Email'
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
        />
        {errors.email && <span className='error'>{errors.email[0]}</span>}
      </div>

      <div>
        <input
          type='password'
          placeholder='Password'
          value={formData.password}
          onChange={e => handleChange('password', e.target.value)}
        />
        {errors.password && <span className='error'>{errors.password[0]}</span>}
      </div>

      <button type='submit'>Login</button>
    </form>
  );
}

export default LoginForm;
```

### Vue.js with Composition API

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input
        v-model="formData.email"
        type="email"
        placeholder="Email"
        :class="{ error: errors.email }"
      />
      <span v-if="errors.email" class="error-message">
        {{ errors.email[0] }}
      </span>
    </div>

    <div>
      <input
        v-model="formData.password"
        type="password"
        placeholder="Password"
        :class="{ error: errors.password }"
      />
      <span v-if="errors.password" class="error-message">
        {{ errors.password[0] }}
      </span>
    </div>

    <button type="submit" :disabled="!isValid">Login</button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useValidator } from '@vueller/validator/vue';

const { validator, validate } = useValidator();

// Form data
const formData = ref({
  email: '',
  password: ''
});

// Set validation rules
validator.setRules('email', { required: true, email: true });
validator.setRules('password', { required: true, min: 8 });

// Reactive errors
const errors = computed(() => validator.errors().allByField());
const isValid = computed(() => validator.isValid());

// Handle form submission
const handleSubmit = async () => {
  const isFormValid = await validate(formData.value);

  if (isFormValid) {
    console.log('Form submitted:', formData.value);
  }
};
</script>

<style scoped>
.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
```

## Next Steps

- [Basic Usage](basic-usage.md) - Learn the fundamentals
- [Validation Rules](validation-rules.md) - Explore available rules
- [JavaScript Examples](../examples/javascript.md) - See practical examples
- [Vue Examples](../examples/vue.md) - Vue-specific examples
