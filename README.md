# @vueller/validator

A clean, modular validation library with reactive i18n support and Vue 3 integration.

## Features

- ✅ **Reactive by Default**: Real-time validation updates and automatic UI synchronization
- ✅ **Clean Architecture**: Modular design with organized file structure
- ✅ **Reactive i18n**: Real-time language switching with automatic error message updates
- ✅ **Vue 3 Ready**: First-class Vue 3 support with reactive directives and components
- ✅ **Custom Rules**: Easy custom validation rule creation
- ✅ **Tree Shaking**: Import only what you need
- ✅ **TypeScript Ready**: Fully typed for excellent IDE support

## Installation

```bash
npm install @vueller/validator
```

## Quick Start

### Basic Usage

```javascript
import { createValidator } from '@vueller/validator';

const validator = createValidator();

// Set validation rules
validator.setRules('email', {
  required: true,
  email: true
});

validator.setRules('password', {
  required: true,
  min: 8
});

// Validate form data
const formData = {
  email: 'user@example.com',
  password: 'mypassword123'
};

const isValid = await validator.validateAll(formData);

if (!isValid) {
  console.log('Errors:', validator.errors().allByFieldStatic());
}
```

### Vue 3 Integration

```vue
<template>
  <ValidatorForm 
    v-model="formData" 
    :rules="formRules" 
    @submit="handleSubmit"
  >
    <template #default="{ errors, isValidating }">
      <input
        v-model="formData.email"
        type="email"
        :class="{ 'error': errors.has('email') }"
      />
      <div v-if="errors.has('email')">
        {{ errors.first('email') }}
      </div>
      
      <button type="submit" :disabled="isValidating">
        Submit
      </button>
    </template>
  </ValidatorForm>
</template>

<script>
import { reactive } from 'vue';
import { ValidatorForm } from '@vueller/validator/vue';

export default {
  components: { ValidatorForm },
  setup() {
    const formData = reactive({
      email: '',
      password: ''
    });

    const formRules = {
      email: { required: true, email: true },
      password: { required: true, min: 8 }
    };

    const handleSubmit = ({ data, isValid }) => {
      if (isValid) {
        console.log('Form submitted:', data);
      }
    };

    return { formData, formRules, handleSubmit };
  }
};
</script>
```

## Built-in Validation Rules

| Rule | Usage | Description |
|------|-------|-------------|
| `required` | `{ required: true }` | Field must have a value |
| `min` | `{ min: 5 }` | Minimum length/value |
| `max` | `{ max: 15 }` | Maximum length/value |
| `email` | `{ email: true }` | Valid email format |
| `numeric` | `{ numeric: true }` | Must be a number |
| `pattern` | `{ pattern: /^[A-Z]+$/ }` | Regex validation |
| `confirmed` | `{ confirmed: 'fieldName' }` | Must match another field |

## Custom Rules

```javascript
// Register a custom rule
validator.extend('strongPassword', (value) => {
  if (!value) return true;
  
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  
  return hasUpper && hasLower && hasNumber && hasSpecial;
}, 'Password must contain uppercase, lowercase, number and special characters.');

// Use the custom rule
validator.setRules('password', {
  required: true,
  strongPassword: true
});
```

## Internationalization

```javascript
// Set locale
validator.setLocale('pt-BR');

// Add custom messages
validator.addMessages('pt-BR', {
  required: 'O campo {field} é obrigatório.',
  email: 'O campo {field} deve ser um email válido.',
  min: 'O campo {field} deve ter pelo menos {min} caracteres.'
});
```

## API Reference

### Validator

- `setRules(field, rules)` - Set validation rules for a field
- `validateField(field, value)` - Validate single field
- `validateAll(data)` - Validate all fields
- `setLocale(locale)` - Set validation locale
- `extend(name, rule, message)` - Register custom rule
- `errors()` - Get ErrorBag instance

### ErrorBag

- `get(field)` - Get field errors (reactive)
- `first(field)` - Get first field error (reactive)
- `has(field)` - Check if field has errors (reactive)
- `all()` - Get all errors (reactive)
- `clear()` - Clear all errors

### Vue Composable

```javascript
import { useValidator } from '@vueller/validator/vue';

const {
  formData,           // Reactive form data
  errors,             // Reactive errors
  isValidating,       // Validation state
  validateAll,        // Validate function
  setLocale           // Change locale
} = useValidator();
```

## License

MIT License - see LICENSE file for details.