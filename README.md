# @vueller/validator

> Modern universal validation library with Vue 3, JavaScript support, and upcoming React & Angular integrations.

[![npm version](https://img.shields.io/npm/v/@vueller/validator.svg)](https://www.npmjs.com/package/@vueller/validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)

## What is it?

A clean, modular validation library that provides:

- **Universal Support** - Works with Vue 3, Vanilla JS, and coming soon: React & Angular
- **Auto-validation** - Zero configuration validation with visual feedback
- **Real-time i18n** - Instant language switching for error messages
- **Custom Rules** - Easy to extend with your own validation logic
- **TypeScript Ready** - Full type support out of the box

## Quick Example

### Vue 3
```vue
<template>
  <input 
    v-model="email" 
    v-rules="{ required: true, email: true }" 
    name="email" 
  />
</template>
```

### JavaScript
```javascript
import { Validator } from '@vueller/validator'

const validator = new Validator()
const isValid = await validator.validate('user@example.com', { 
  required: true, 
  email: true 
})
```

## Installation

```bash
npm install @vueller/validator
```

## Documentation

**[📖 Full Documentation →](https://vueller.github.io/validator/)**

The documentation includes:
- Complete setup guides for Vue 3 and JavaScript
- Interactive examples and live demos
- API reference and advanced patterns
- Custom rules and internationalization

The documentation includes:
- Complete setup guides for Vue 3 and JavaScript
- Interactive examples and live demos
- API reference and advanced patterns
- Custom rules and internationalization

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**[⭐ Star on GitHub](https://github.com/vueller/validator)** • **[📦 View on NPM](https://www.npmjs.com/package/@vueller/validator)** • **[📖 Documentation](https://vueller.github.io/validator/)**

</div>