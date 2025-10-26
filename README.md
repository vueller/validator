# 🚀 @vueller/validator

A modern validation library with global instance management, Vue 3 integration, custom rules, and i18n support.

## 🆕 What's New in v2.0

- ✨ **Global Validator Instance**: Single validator shared across the entire application
- ✨ **Simplified Vue Plugin**: Easy setup with `app.use(validator, options)`
- ✨ **Enhanced Composables**: Modern Vue 3 Composition API integration
- ✨ **Automatic Validation**: No need for `v-validate` directive on custom rules
- ✨ **Improved Reactivity**: Better performance with optimized update cycles
- ✨ **Custom Rule Messages**: Fallback message system with locale-specific overrides
- ✨ **Hierarchical i18n**: Field-specific, rule-specific, and fallback message resolution

## ✨ Features

- 🌐 **Universal**: Works with vanilla JavaScript and Vue 3
- ⚡ **Reactive**: Real-time validation with automatic UI updates and optimized performance
- 🎯 **Global Instance**: Single validator shared across the entire application
- 🧩 **Custom Rules**: Easy custom rule creation with fallback message system
- 🌍 **i18n Ready**: Built-in internationalization with hierarchical message resolution
- 🎨 **Framework Agnostic**: No dependencies on specific frameworks

## 🚀 Quick Start

### Installation

```bash
npm install @vueller/validator
```

### Vue 3 Example

```javascript
// main.js
import { createApp } from 'vue';
import { validator } from '@vueller/validator/vue';

const app = createApp(App);
app.use(validator, {
  locale: 'en',
  validateOnBlur: true
});
app.mount('#app');
```

```vue
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
import { ref } from 'vue';
import { useValidator } from '@vueller/validator/vue';

// Access global validator
const { setLocale } = useValidator();

const rules = ref({
  email: { required: true, email: true },
  password: { required: true, min: 8 }
});

const onSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data);
  }
};

const changeLanguage = (locale) => {
  setLocale(locale);
};
</script>
```

### JavaScript Example

```javascript
import { Validator } from '@vueller/validator';

const validator = new Validator({ locale: 'en' });
validator.setRules('email', { required: true, email: true });
validator.setRules('password', { required: true, min: 8 });

validator.setData({ email: 'user@example.com', password: 'mypassword123' });
const isValid = await validator.validate();
console.log('Form is valid:', isValid);
```

### 🚀 Simple Global Usage (Vue 3)

For even simpler usage, install the validator globally and access it via `$validator`:

```javascript
// main.js
import { createApp } from 'vue';
import { validator } from '@vueller/validator';
import App from './App.vue';

const app = createApp(App);

// Install validator globally
app.use(validator, {
  locale: 'en',
  validateOnBlur: true
});

// Add custom rules globally with fallback messages
app.config.globalProperties.$validator.extend('cpf', (value) => {
  const cpf = value.replace(/\D/g, '');
  return cpf.length === 11 && /^(\d)\1{10}$/.test(cpf) === false;
}, 'The {field} field must be a valid CPF'); // Fallback message

// Add custom messages (these override the fallback message)
app.config.globalProperties.$validator.i18nManager.addMessages('pt-BR', { cpf: 'O campo {field} deve ser um CPF válido' });

app.mount('#app');
```

```vue
<!-- App.vue -->
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <input 
          v-model="form.email" 
          v-validate="'required|email'"
          type="email" 
          placeholder="Email" 
        />
        <div v-if="$validator.errors().has('email')" class="error">
          {{ $validator.errors().first('email') }}
        </div>
      </div>
      
      <div class="form-group">
        <input 
          v-model="form.password" 
          v-validate="'required|min:8'"
          type="password" 
          placeholder="Password" 
        />
        <div v-if="$validator.errors().has('password')" class="error">
          {{ $validator.errors().first('password') }}
        </div>
      </div>
      
      <button type="submit">Submit</button>
    </form>
    
    <!-- Global controls -->
    <div>
      <button @click="$validator.setLocale('pt-BR')">Português</button>
      <button @click="$validator.setLocale('en')">English</button>
      <p>Current locale: {{ $validator.getLocale() }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    };
  },
  
  methods: {
    async handleSubmit() {
      this.$validator.setData(this.form);
      this.$validator.setMultipleRules({
        email: 'required|email',
        password: 'required|min:8'
      });
      
      const isValid = await this.$validator.validate();
      if (isValid) {
        console.log('Form is valid!');
      }
    }
  }
};
</script>
```

#### Global API Methods

Once installed globally, you can use these simplified methods:

```javascript
// Change locale
$validator.setLocale('pt-BR');

// Add custom rules with fallback messages
$validator.extend('ruleName', (value) => {
  return value.length > 5;
}, 'The {field} field must be longer than 5 characters'); // Fallback message

// Add custom messages (these override fallback messages)
$validator.i18nManager.addMessages('pt-BR', { ruleName: 'O campo {field} deve ter mais de 5 caracteres' });
$validator.i18nManager.addMessages('en', { ruleName: 'The {field} field must be longer than 5 characters' });

// Get current locale
const currentLocale = $validator.getLocale();
```

#### Message Resolution Order

The validator follows this priority order when resolving error messages:

1. **Field-specific message**: `fieldName.ruleName` (e.g., `email.required`)
2. **Rule-specific message**: `ruleName` (e.g., `required`)
3. **Rule fallback message**: The message provided when registering the rule with `extend()`
4. **Default fallback**: Generic "The {field} field is invalid." message

This means:
- If you add a message with `i18nManager.addMessages()`, it will be used instead of the fallback message
- If you don't add a message for a specific locale, the fallback message from `extend()` will be used
- If no fallback message is provided, a generic message will be used

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
validator.i18nManager.addMessages('pt-BR', {
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
├── dist/         # Compiled production files (47.3kB)
│   ├── validator.esm.js      # ES modules build
│   ├── validator.cjs.js      # CommonJS build
│   ├── validator-vue.esm.js  # Vue.js components
│   └── locales.esm.js        # Built locales
├── README.md     # Documentation
└── LICENSE       # MIT License
```

## 🌐 Available Registries

- **npmjs.org**: [@vueller/validator](https://www.npmjs.com/package/@vueller/validator)
- **GitHub Packages**: [vueller/validator/packages](https://github.com/vueller/validator/packages)

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