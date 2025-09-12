# Installation

Get started with @vueller/validator in your project with these simple installation steps.

## Package Installation

Choose your preferred package manager:

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

## CDN Usage

For quick prototyping or simple projects, you can use the CDN version:

```html
<!-- ES Modules -->
<script type="module">
  import { Validator } from 'https://unpkg.com/@vueller/validator/dist/validator.esm.js'
  
  const validator = new Validator()
  // Your validation code here
</script>

<!-- UMD (Global) -->
<script src="https://unpkg.com/@vueller/validator/dist/validator.umd.js"></script>
<script>
  const { Validator } = VuellerValidator
  const validator = new Validator()
</script>
```

## Framework-Specific Setup

### Vue 3

For Vue 3 applications, install and register the plugin:

```javascript
// main.js
import { createApp } from 'vue'
import ValidatorPlugin from '@vueller/validator/vue'
import App from './App.vue'

const app = createApp(App)

// Register the validator plugin
app.use(ValidatorPlugin, {
  globalValidator: true,
  validateOnBlur: true,
  validateOnInput: false,
  locale: 'en'
})

app.mount('#app')
```

### Vanilla JavaScript

For plain JavaScript projects:

```javascript
// ES6 Modules
import { Validator } from '@vueller/validator'

const validator = new Validator({
  locale: 'en',
  stopOnFirstFailure: false
})

// CommonJS
const { Validator } = require('@vueller/validator')
```

## TypeScript Support

@vueller/validator includes TypeScript definitions out of the box:

```typescript
import { Validator, ValidationRules } from '@vueller/validator'

interface UserForm {
  email: string
  password: string
}

const validator = new Validator()

const rules: ValidationRules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}

const formData: UserForm = {
  email: 'user@example.com',
  password: 'securepass123'
}
```

## Verification

Test your installation with a simple validation:

::: code-group

```vue [Vue 3]
<template>
  <div>
    <input 
      v-model="email"
      v-rules="{ required: true, email: true }"
      name="email"
      placeholder="Enter email"
    />
    <p v-if="email">Email: {{ email }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
</script>
```

```javascript [Vanilla JS]
import { Validator } from '@vueller/validator'

const validator = new Validator()

// Test validation
const test = async () => {
  const isValid = await validator.validate('test@example.com', { 
    required: true, 
    email: true 
  })
  
  console.log('Email is valid:', isValid) // true
}

test()
```

:::

## Browser Compatibility

@vueller/validator supports all modern browsers:

- **Chrome** 63+
- **Firefox** 67+
- **Safari** 12+
- **Edge** 79+

For older browsers, consider using a polyfill for:
- Promise
- async/await
- Object.assign

## Bundle Size

| Package | Minified | Gzipped |
|---------|----------|---------|
| Core | ~15KB | ~5KB |
| Vue Plugin | ~8KB | ~3KB |
| Total | ~23KB | ~8KB |

The library is designed to be lightweight and tree-shakeable.

## Troubleshooting

### Common Issues

**Import Errors**
```javascript
// ❌ Wrong
import Validator from '@vueller/validator'

// ✅ Correct
import { Validator } from '@vueller/validator'
```

**Vue Plugin Not Working**
```javascript
// Make sure to import from the Vue subpackage
import ValidatorPlugin from '@vueller/validator/vue'
```

**TypeScript Errors**
```bash
# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Getting Help

If you encounter issues:

1. **Check the [FAQ](/guide/faq)** for common solutions
2. **Search [GitHub Issues](https://github.com/vueller/validator/issues)**
3. **Create a new issue** with a minimal reproduction

## Next Steps

Now that you have @vueller/validator installed:

- **[Quick Start →](./quick-start)** - Build your first validation
- **[Vue 3 Setup →](./vue/setup)** - Configure for Vue 3
- **[Core Usage →](./js/core)** - Use with vanilla JavaScript

## Development Setup

If you want to contribute or run from source:

```bash
# Clone the repository
git clone https://github.com/vueller/validator.git
cd validator

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Run development server
npm run dev
```

## License

@vueller/validator is released under the MIT License. See the [LICENSE](https://github.com/vueller/validator/blob/main/LICENSE) file for details.