# Vue 3 Integration

@vueller/validator provides deep integration with Vue 3, offering a seamless validation experience with automatic reactivity and modern Composition API support.

## Installation

### Global Plugin Installation

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

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locale` | `string` | `'en'` | Default locale for validation messages |
| `validateOnBlur` | `boolean` | `true` | Validate fields when they lose focus |
| `validateOnInput` | `boolean` | `false` | Validate fields as user types |
| `devtools` | `boolean` | `false` | Enable Vue DevTools integration |

## Global Validator Instance

After installing the plugin, you get access to a global validator instance throughout your application:

```vue
<template>
  <div>
    <!-- Global language switcher -->
    <button @click="changeLanguage('pt-BR')">Português</button>
    <button @click="changeLanguage('en')">English</button>
    
    <!-- Forms automatically use the global validator -->
    <ValidationForm :rules="rules" @submit="onSubmit">
      <!-- Form content -->
    </ValidationForm>
  </div>
</template>

<script setup>
import { useValidator } from '@vueller/validator/vue';

// Access global validator
const { setLocale, addRule, addMessage } = useValidator();

const changeLanguage = (locale) => {
  setLocale(locale);
};
</script>
```

## Components

### ValidationForm

The main component for form validation with automatic field binding and error display.

```vue
<template>
  <ValidationForm 
    v-slot="{ values, errors, isValid, setValue, getValue, setRules, clear }" 
    :rules="rules" 
    :model-value="formData"
    @submit="onSubmit"
    @validation-success="onSuccess"
    @validation-error="onError"
  >
    <!-- Form fields -->
    <input 
      name="email" 
      v-label="'E-mail'"
      v-rules="{ required: true, email: true }"
    />
    <div v-if="errors.has('email')" class="error">
      {{ errors.first('email') }}
    </div>
    
    <button type="submit" :disabled="!isValid">
      Submit
    </button>
  </ValidationForm>
</template>

<script setup>
import { ref } from 'vue';
import { ValidationForm } from '@vueller/validator/vue';

const rules = ref({
  email: { required: true, email: true },
  password: { required: true, min: 8 }
});

const formData = ref({
  email: '',
  password: ''
});

const onSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data);
  }
};

const onSuccess = (data) => {
  console.log('Validation successful:', data);
};

const onError = (errors) => {
  console.log('Validation failed:', errors);
};
</script>
```

### ValidationForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rules` | `Object` | `{}` | Validation rules for form fields |
| `model-value` | `Object` | `{}` | Form data (v-model support) |
| `initial-data` | `Object` | `{}` | Initial form data |
| `validate-on-blur` | `boolean` | `true` | Validate on field blur |
| `validate-on-input` | `boolean` | `false` | Validate on field input |

### ValidationForm Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `{ data, isValid }` | Form submission with validation result |
| `validation-success` | `data` | Successful validation |
| `validation-error` | `errors` | Validation failed with error details |
| `update:model-value` | `data` | Form data changes (v-model) |

### ValidationForm Slot Props

| Prop | Type | Description |
|------|------|-------------|
| `values` | `Object` | Current form values |
| `errors` | `Object` | Error bag with validation errors |
| `isValid` | `boolean` | Overall form validation state |
| `hasErrors` | `boolean` | Whether form has any errors |
| `isValidating` | `boolean` | Whether validation is in progress |
| `setValue` | `Function` | Set field value programmatically |
| `getValue` | `Function` | Get field value |
| `setRules` | `Function` | Set field validation rules |
| `clear` | `Function` | Clear form and reset validation |

## Directives

### v-label

Sets the display label for a field, used in error messages.

```vue
<input v-label="'E-mail Address'" name="email" />
<!-- Error message will use "E-mail Address" instead of "email" -->
```

### v-rules

Defines validation rules for a field.

```vue
<input 
  v-rules="{ required: true, email: true, min: 5 }" 
  name="email" 
/>
```

### v-validate

Manually triggers validation for a field (optional for custom rules).

```vue
<input 
  v-validate="'email'" 
  name="email" 
/>
```

### v-error

Displays error messages for a field.

```vue
<input name="email" />
<div v-error="'email'"></div>
<!-- Automatically shows error message for email field -->
```

## Composables

### useValidator

Access the global validator instance and its methods.

```vue
<script setup>
import { useValidator } from '@vueller/validator/vue';

const { 
  setLocale, 
  getLocale, 
  addRule, 
  addMessage, 
  addMessages,
  validator 
} = useValidator();

// Change language globally
const changeLanguage = (locale) => {
  setLocale(locale);
};

// Add custom rule globally
const addCustomRule = () => {
  addRule('customRule', {
    validate: (value) => value === 'custom',
    message: 'Value must be "custom"'
  });
};

// Add custom message for specific locale
const addCustomMessage = () => {
  addMessage('en', 'customRule', 'Custom validation message');
};
</script>
```

### useValidation

Create a local validator instance for component-specific validation.

```vue
<script setup>
import { useValidation } from '@vueller/validator/vue';

const { 
  errors, 
  isValid, 
  validate, 
  validateField, 
  setValue, 
  setRules 
} = useValidation();

// Set up validation rules
setRules('email', { required: true, email: true });

// Validate specific field
const handleBlur = async () => {
  await validateField('email');
};
</script>
```

### useFieldValidation

Validate individual fields with reactive state.

```vue
<script setup>
import { useFieldValidation } from '@vueller/validator/vue';

const { 
  value, 
  error, 
  isValid, 
  validate, 
  setValue 
} = useFieldValidation('email', { required: true, email: true });

// Reactive field state
const handleInput = (event) => {
  setValue(event.target.value);
};
</script>

<template>
  <div>
    <input 
      :value="value" 
      @input="handleInput"
      @blur="validate"
    />
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>
```

## Custom Rules Integration

### Adding Custom Rules Globally

```javascript
// main.js
import { validator } from '@vueller/validator/vue';

app.use(validator, {
  rules: {
    cpf: {
      validate: (value) => {
        // CPF validation logic
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value);
      },
      message: 'Invalid CPF format'
    }
  }
});
```

### Adding Custom Rules Locally

```vue
<script setup>
import { useValidator } from '@vueller/validator/vue';

const { addRule } = useValidator();

// Add custom rule
addRule('phone', {
  validate: (value) => {
    return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value);
  },
  message: 'Invalid phone format'
});
</script>
```

## Internationalization

### Global Locale Management

```vue
<script setup>
import { useValidator } from '@vueller/validator/vue';

const { setLocale, addMessage, addMessages } = useValidator();

// Change language globally
const changeLanguage = (locale) => {
  setLocale(locale);
};

// Add custom messages for specific locale
const addCustomMessages = () => {
  addMessages('pt-BR', {
    'email': 'O campo {field} deve ser um email válido',
    'required': 'O campo {field} é obrigatório'
  });
};
</script>
```

### Message Resolution Order

1. **Field-specific message** (`field.rule`)
2. **Rule-specific message** (`rule`)
3. **Rule fallback message** (from rule registration)
4. **Default fallback** (generic message)

```javascript
// Rule registration with fallback message
addRule('cpf', CpfRule, 'Invalid CPF format');

// Locale-specific message (takes priority)
addMessage('pt-BR', 'cpf', 'CPF inválido');

// Field-specific message (highest priority)
addMessage('pt-BR', 'user.cpf', 'CPF do usuário inválido');
```

## Best Practices

### 1. Use Global Instance for Consistency

```javascript
// ✅ Good: Use global instance
app.use(validator, { locale: 'en' });

// ❌ Avoid: Multiple validator instances
const validator1 = new Validator();
const validator2 = new Validator();
```

### 2. Leverage Automatic Validation

```vue
<!-- ✅ Good: Automatic validation -->
<input v-rules="{ required: true, email: true }" name="email" />

<!-- ❌ Avoid: Manual validation when not needed -->
<input v-rules="{ required: true, email: true }" v-validate="'email'" name="email" />
```

### 3. Use Composables for Complex Logic

```vue
<script setup>
// ✅ Good: Use composables for complex validation
const { validate, setRules } = useValidation();

const handleComplexValidation = async () => {
  setRules('email', { required: true, email: true });
  const isValid = await validate();
  // Handle result
};
</script>
```

### 4. Organize Custom Rules

```javascript
// ✅ Good: Organize custom rules
const customRules = {
  cpf: { validate: validateCpf, message: 'Invalid CPF' },
  phone: { validate: validatePhone, message: 'Invalid phone' }
};

app.use(validator, { rules: customRules });
```

## Troubleshooting

### Common Issues

1. **Validation not working**: Ensure `v-rules` directive is properly applied
2. **Messages not updating**: Check if locale is properly set
3. **Custom rules not working**: Verify rule registration and validation logic
4. **Reactivity issues**: Use `useValidator()` composable for global state access

### Debug Mode

Enable debug mode to see validation details:

```javascript
app.use(validator, { 
  devtools: true,
  debug: true 
});
```

This will log validation details to the console and enable Vue DevTools integration.
