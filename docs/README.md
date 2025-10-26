# @vueller/validator Documentation

This is the official documentation for @vueller/validator v2.0 - a modern validation library for JavaScript and Vue 3.

## Features

- 🌐 **Universal**: Works with vanilla JavaScript and Vue 3
- ⚡ **Reactive**: Real-time validation with automatic UI updates
- 🎯 **Global Instance**: Single validator shared across the entire application
- 🧩 **Custom Rules**: Easy custom rule creation with fallback message system
- 🌍 **i18n Ready**: Built-in internationalization with hierarchical message resolution
- 🎨 **Framework Agnostic**: No dependencies on specific frameworks

## Quick Start

### Installation

```bash
npm install @vueller/validator
```

### Vue 3 Usage

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
  <ValidationForm v-slot="{ errors, isValid }" :rules="rules" @submit="onSubmit">
    <input name="email" v-rules="{ required: true, email: true }" />
    <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
    <button type="submit" :disabled="!isValid">Submit</button>
  </ValidationForm>
</template>

<script setup>
import { ref } from 'vue';

const rules = ref({
  email: { required: true, email: true }
});

const onSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data);
  }
};
</script>
```

### JavaScript Usage

```javascript
import { Validator } from '@vueller/validator';

const validator = new Validator({ locale: 'en' });
validator.setRules('email', { required: true, email: true });
validator.setData({ email: 'user@example.com' });
const isValid = await validator.validate();
```

## Documentation Structure

### 📚 **Guide**
- [Getting Started](/guide/getting-started) - Quick start with examples
- [Installation](/guide/installation) - Installation instructions
- [Basic Usage](/guide/basic-usage) - Core concepts and API
- [Vue Integration](/guide/vue-integration) - Vue 3 specific features
- [Custom Rules](/guide/custom-rules) - Creating custom validation rules
- [Internationalization](/guide/internationalization) - Multi-language support
- [Migration Guide](/guide/migration-guide) - Upgrading from v1.x

### 🔧 **API Reference**
- [Core API](/api/core) - Core validation functionality
- [Vue API](/api/vue) - Vue 3 specific API
- [Universal API](/api/universal) - Framework-agnostic API

### 💡 **Examples**
- [Quick Start](/examples/quick-start) - Basic examples
- [JavaScript Examples](/examples/javascript) - Vanilla JS examples
- [Vue Examples](/examples/vue) - Vue 3 examples

## What's New in v2.0

### ✨ **Major Updates**
- **Global Validator Instance**: Single validator shared across the entire application
- **Simplified Vue Plugin**: Easy setup with `app.use(validator, options)`
- **Enhanced Composables**: Modern Vue 3 Composition API integration
- **Automatic Validation**: No need for `v-validate` directive on custom rules
- **Improved Reactivity**: Better performance with optimized update cycles
- **Custom Rule Messages**: Fallback message system with locale-specific overrides

### 🔧 **Breaking Changes**
- **Plugin API**: New global plugin installation method
- **Composable Changes**: Updated `useValidator()` composable
- **Directive Updates**: Simplified directive usage
- **Message System**: Enhanced fallback message resolution

## Development

### Running the Documentation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build documentation
npm run build

# Preview build
npm run preview
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](https://github.com/vueller/validator/blob/main/LICENSE) for details.

## Support

- 📖 **Documentation**: Comprehensive guides and API reference
- 💬 **Community**: Join our discussions on GitHub
- 🐛 **Issues**: Report bugs and request features
- 💡 **Examples**: Check out real-world usage examples

---

Built with ❤️ by the Vueller Team
