# Introduction

@vueller/validator is a modern, reactive validation library designed specifically for Vue 3, with support for vanilla JavaScript. It provides zero-configuration auto-validation, real-time language switching, and a clean, modular architecture.

## Why @vueller/validator?

### 🔥 **Auto-validation**
No more manual event listeners or complex setup. Just add `v-rules` and validation happens automatically:

```vue
<input v-rules="{ required: true, email: true }" name="email" />
```

### ⚡ **Vue 3 Native**
Built from the ground up for Vue 3's Composition API with full reactivity:

```vue
<script setup>
import { useValidator } from '@vueller/validator/vue'

const { errors, isValid, validateField } = useValidator()
</script>
```

### 🌍 **Real-time i18n Localization**
Change languages instantly without page reloads:

```javascript
validator.setLocale('pt-BR') // All error messages update automatically
```

## Comparison with Other Libraries

| Feature | @vueller/validator | VeeValidate | Vuelidate |
|---------|-------------------|-------------|-----------|
| Auto-validation | ✅ Zero config | ❌ Manual setup | ❌ Manual setup |
| Vue 3 Composition API | ✅ Native | ✅ Supported | ✅ Supported |
| Real-time Localization | ✅ Built-in | ✅ Built-in | ❌ External plugin |
| CSS classes | ✅ Automatic | ❌ Manual | ❌ Manual |
| Bundle size | ✅ Small | ⚠️ Medium | ✅ Small |
| TypeScript | ✅ Full support | ✅ Full support | ✅ Full support |

## Philosophy

@vueller/validator follows these core principles:

### **Convention over Configuration**
```vue
<!-- This just works - no configuration needed -->
<input v-rules="{ required: true, email: true }" name="email" />
```

### **Reactive by Default**
```javascript
// All state is reactive - changes propagate automatically
const { errors, isValid } = useValidator()
```

### **Progressive Enhancement**
```vue
<!-- Start simple -->
<input v-rules="{ required: true }" name="field" />

<!-- Add complexity as needed -->
<ValidatorForm :rules="complexRules" @submit="handleSubmit">
  <!-- Advanced form logic -->
</ValidatorForm>
```

### **Developer Experience First**
- **Auto-completion** - Full TypeScript support
- **Visual feedback** - Automatic CSS classes
- **Clear errors** - Descriptive error messages
- **Debugging** - Built-in development tools

## What's Next?

Ready to get started? Here's what to do next:

1. **[Installation →](/guide/installation)** - Install and set up the library
2. **[Quick Start →](/guide/quick-start)** - Your first validation in 5 minutes
3. **[Vue 3 Setup →](/guide/vue3-setup)** - Complete Vue 3 integration
4. **[Examples →](/examples/)** - See real-world examples

## Getting Help

- **[GitHub Issues](https://github.com/vueller/validator/issues)** - Report bugs
- **[GitHub Discussions](https://github.com/vueller/validator/discussions)** - Ask questions
- **[API Reference](/api/)** - Detailed API documentation
- **[Examples](/examples/)** - Working code examples
