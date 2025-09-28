# 🚀 Universal Validator

A modern, framework-agnostic validation library with reactive support for JavaScript and Vue.js applications.

## ✨ Features

- 🌐 **Universal**: Works with vanilla JavaScript, Vue.js, and any framework
- ⚡ **Reactive**: Real-time validation with automatic UI updates
- 🎯 **Scope-based**: Multiple forms in the same page with isolated validation
- 🧩 **Modular**: Clean architecture with extensible rules system
- 🌍 **i18n Ready**: Built-in internationalization support
- 📱 **TypeScript**: Full TypeScript support (coming soon)
- 🎨 **Framework Agnostic**: No dependencies on specific frameworks

## 🚀 Quick Start

### Installation

```bash
npm install @vueller/validator
```

### JavaScript Example

```javascript
import { validator } from '@vueller/validator';

// Set validation rules
validator.setRules('email', { required: true, email: true });
validator.setRules('password', { required: true, min: 8 });

// Validate all fields
const formData = {
  email: 'user@example.com',
  password: 'mypassword123'
};

const isValid = await validator.validate(formData);
console.log('Form is valid:', isValid);

// Validate specific field
const isEmailValid = await validator.validate().field('email');
console.log('Email is valid:', isEmailValid);
```

### Vue.js Example

```vue
<template>
  <ValidatorForm :rules="rules" @submit="handleSubmit" v-slot="{ values, errors, clear }">
    <div>
      <input 
        v-model="values.email" 
        name="email"
        type="email" 
        placeholder="Email" 
      />
      <div v-if="errors.has('email')" class="error">{{ errors.first('email') }}</div>
    </div>
    
    <div>
      <input 
        v-model="values.password" 
        name="password"
        type="password" 
        placeholder="Password" 
      />
      <div v-if="errors.has('password')" class="error">{{ errors.first('password') }}</div>
    </div>
    
    <div class="form-actions">
      <button type="submit">Submit</button>
      <button type="button" @click="clear">Clear</button>
    </div>
  </ValidatorForm>
</template>

<script setup>
import { ValidatorForm } from '@vueller/validator/vue';

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

## 📚 Documentation

### Getting Started
- [Installation & Setup](docs/guide/installation.md)
- [Basic Usage](docs/guide/basic-usage.md)
- [Validation Rules](docs/guide/validation-rules.md)

### Examples
- [JavaScript Examples](docs/examples/javascript.md)
- [Vue.js Examples](docs/examples/vue.md)

### Advanced
- [Advanced Guide](docs/guide/advanced.md)

### API Reference
- [Core API](docs/api/core.md)
- [Vue Components](docs/api/vue.md)
- [Universal API](docs/api/universal.md)

## 🎯 Key Concepts

### Scope-based Validation
Handle multiple forms in the same page with isolated validation:

```javascript
// Login form
await validator.validate('loginForm', loginData);

// Register form  
await validator.validate('registerForm', registerData);
```

### Fluent API
Chain validation calls for better readability:

```javascript
// Validate all fields
await validator.validate(formData);

// Validate specific field
await validator.validate('loginForm').field('email', 'user@test.com');
```

### Framework Agnostic
Same API works everywhere:

```javascript
// Vanilla JavaScript
import { createValidator } from '@vueller/validator';

// Vue.js
import { ValidatorForm } from '@vueller/validator/vue';

// Universal API
import { validator } from '@vueller/validator/universal';
```

## 🛠️ Built-in Validation Rules

- `required` - Field is required
- `email` - Valid email format
- `min` - Minimum length/value
- `max` - Maximum length/value
- `numeric` - Numeric values only
- `pattern` - Custom regex pattern
- `confirmed` - Field confirmation (passwords)

## 🌍 Internationalization

```javascript
validator.setLocale('pt-BR');
validator.addMessages('pt-BR', {
  required: 'O campo {field} é obrigatório',
  email: 'O campo {field} deve ser um email válido'
});
```

## 🔧 Custom Rules

```javascript
validator.extend('evenNumber', (value) => {
  return Number(value) % 2 === 0;
}, 'The {field} must be an even number');
```

## 📦 What's Included

```
@vueller/validator/
├── core          # Core validation engine
├── vue           # Vue.js components and composables  
├── universal     # Universal API for any framework
└── locales       # Internationalization files
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](docs/)
- [Examples](docs/examples/)
- [API Reference](docs/api/)
- [Changelog](CHANGELOG.md)

---

Made with ❤️ by the Vueller team