# Vue 3 Setup & Configuration

This guide covers how to set up @vueller/validator in your Vue 3 application.

## Installation

First, install the validator package:

::: code-group

```bash [npm]
npm install @vueller/validator
```

```bash [yarn]
yarn add @vueller/validator
```

```bash [pnpm]
pnpm add @vueller/validator
```

:::

## Plugin Registration

Register the validator plugin in your main application file:

```javascript{7-12}
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

// Import the validator plugin
import ValidatorPlugin from '@vueller/validator/vue'

const app = createApp(App)

// Register the plugin
app.use(ValidatorPlugin, {
  globalValidator: true,
  validateOnBlur: true,
  validateOnInput: false,
  locale: 'en'
})

app.mount('#app')
```

## Configuration Options

The plugin accepts several configuration options to customize its behavior:

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `globalValidator` | `boolean` | `false` | Creates a global validator instance accessible in all components |
| `globalProperties` | `boolean` | `false` | Adds `$validator` to Vue's global properties |

### Validation Behavior

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `validateOnBlur` | `boolean` | `true` | Enable automatic validation when fields lose focus |
| `validateOnInput` | `boolean` | `false` | Enable automatic validation while typing |
| `stopOnFirstFailure` | `boolean` | `false` | Stop validation on first error encountered |

### Internationalization

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locale` | `string` | `'en'` | Default language for error messages |
| `fallbackLocale` | `string` | `'en'` | Fallback language when translation is missing |

## Complete Configuration Example

```javascript
// src/main.js
import { createApp } from 'vue'
import ValidatorPlugin from '@vueller/validator/vue'
import App from './App.vue'

const app = createApp(App)

app.use(ValidatorPlugin, {
  // Core settings
  globalValidator: true,
  globalProperties: true,
  
  // Validation behavior
  validateOnBlur: true,
  validateOnInput: false,
  stopOnFirstFailure: false,
  
  // Internationalization
  locale: 'en',
  fallbackLocale: 'en',
  
  // Advanced options
  fieldNameFormatter: (fieldName) => {
    // Convert camelCase to readable format
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^./, str => str.toUpperCase())
  }
})

app.mount('#app')
```

## Global Access

Once the plugin is registered with `globalValidator: true`, you can access the validator instance in any component:

```vue
<script setup>
import { inject } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

// Access the global validator
const globalValidator = inject(ValidatorSymbol)

// Change language globally
const switchLanguage = (locale) => {
  globalValidator.setLocale(locale)
}

// Register custom rules globally
const addCustomRule = () => {
  globalValidator.extend('phone', (value) => {
    if (!value) return true
    return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
  })
}
</script>
```

## Using with Global Properties

If you enable `globalProperties: true`, you can access the validator through `this.$validator`:

```vue
<script>
export default {
  mounted() {
    // Access via global property
    this.$validator.setLocale('pt-BR')
  }
}
</script>
```

## TypeScript Support

@vueller/validator includes full TypeScript support out of the box:

```typescript
// types/validator.d.ts (auto-generated)
import { Validator } from '@vueller/validator'
import { ValidatorSymbol } from '@vueller/validator/vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $validator: Validator
  }
}
```

### Type-safe Configuration

```typescript
import type { ValidatorPluginOptions } from '@vueller/validator/vue'

const validatorConfig: ValidatorPluginOptions = {
  globalValidator: true,
  validateOnBlur: true,
  validateOnInput: false,
  locale: 'en'
}

app.use(ValidatorPlugin, validatorConfig)
```

## Verification

Test your installation by creating a simple validation:

```vue
<template>
  <div>
    <input 
      v-model="email"
      v-rules="{ required: true, email: true }"
      name="email"
      placeholder="Enter your email"
    />
    <p v-if="email">Email: {{ email }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
</script>

<style>
.valid {
  border-color: #28a745;
  background-color: #f8fff9;
}

.invalid {
  border-color: #dc3545;
  background-color: #fff8f8;
}
</style>
```

If validation classes are applied when you type and blur the field, your setup is working correctly!

## Troubleshooting

### Common Issues

**Plugin not working**
```javascript
// ❌ Wrong import
import ValidatorPlugin from '@vueller/validator'

// ✅ Correct import
import ValidatorPlugin from '@vueller/validator/vue'
```

**Global validator not accessible**
```javascript
// Make sure to enable global validator
app.use(ValidatorPlugin, {
  globalValidator: true // ← This is required
})
```

**TypeScript errors**
```bash
# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## Next Steps

Now that you have the validator set up:

1. **[Auto-validation →](./auto-validation)** - Learn about automatic validation
2. **[ValidatorForm →](./validator-form)** - Use the ValidatorForm component
3. **[Custom Rules →](./custom-rules)** - Create your own validation rules

## Production Considerations

### Performance

```javascript
// For better performance in production
app.use(ValidatorPlugin, {
  globalValidator: true,
  validateOnBlur: true,
  validateOnInput: false, // Disable for better performance
  stopOnFirstFailure: true // Stop on first error
})
```

### Bundle Size

```javascript
// Import only what you need
import { useValidator } from '@vueller/validator/vue'
// Instead of importing the entire plugin
```

### Error Handling

```javascript
// Add global error handling
app.config.errorHandler = (err, instance, info) => {
  if (err.name === 'ValidationError') {
    console.error('Validation error:', err)
  }
}
```
