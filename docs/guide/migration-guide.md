# Migration Guide: v1.x to v2.0

This guide will help you migrate your @vueller/validator implementation from v1.x to v2.0. The new version introduces significant improvements while maintaining backward compatibility where possible.

## Overview of Changes

### ✨ **New Features**
- Global validator instance management
- Simplified Vue plugin installation
- Enhanced composables with modern Vue 3 patterns
- Automatic validation for custom rules
- Improved reactivity system
- Enhanced fallback message system

### 🔧 **Breaking Changes**
- Plugin API changes
- Composable method signatures
- Directive behavior updates
- Message resolution order changes

## Migration Steps

### 1. Update Installation

#### Before (v1.x)
```javascript
// main.js
import { createApp } from 'vue';
import { ValidationForm } from '@vueller/validator/vue';

const app = createApp(App);
app.component('ValidationForm', ValidationForm);
app.mount('#app');
```

#### After (v2.0)
```javascript
// main.js
import { createApp } from 'vue';
import { validator } from '@vueller/validator/vue';

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

### 2. Update Component Usage

#### Before (v1.x)
```vue
<template>
  <ValidationForm v-slot="{ values, errors, isValid }" :rules="rules">
    <input name="email" v-rules="{ required: true, email: true }" />
    <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
  </ValidationForm>
</template>

<script setup>
import { ValidationForm } from '@vueller/validator/vue';
</script>
```

#### After (v2.0)
```vue
<template>
  <ValidationForm v-slot="{ values, errors, isValid, setValue, getValue, setRules, clear }" 
                  :rules="rules">
    <input name="email" v-rules="{ required: true, email: true }" />
    <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
  </ValidationForm>
</template>

<script setup>
// No need to import ValidationForm - it's globally available
// Additional slot props: setValue, getValue, setRules, clear
</script>
```

### 3. Update Composables

#### Before (v1.x)
```vue
<script setup>
import { useValidation } from '@vueller/validator/vue';

const { errors, isValid, validate, validateField } = useValidation();
</script>
```

#### After (v2.0)
```vue
<script setup>
import { useValidator, useValidation } from '@vueller/validator/vue';

// Access global validator
const { setLocale, addRule, addMessage } = useValidator();

// Local validation (unchanged)
const { errors, isValid, validate, validateField } = useValidation();
</script>
```

### 4. Update Custom Rules Registration

#### Before (v1.x)
```javascript
// Component level
import { useValidation } from '@vueller/validator/vue';

const { validator } = useValidation();
validator.extend('cpf', CpfRule, 'Invalid CPF');
```

#### After (v2.0)
```javascript
// Global registration (recommended)
import { validator } from '@vueller/validator/vue';

app.use(validator, {
  rules: {
    cpf: {
      rule: CpfRule,
      message: 'Invalid CPF format'
    }
  }
});

// Or programmatically
import { useValidator } from '@vueller/validator/vue';

const { addRule } = useValidator();
addRule('cpf', CpfRule, 'Invalid CPF format');
```

### 5. Update Message Management

#### Before (v1.x)
```javascript
// Component level
const { validator } = useValidation();
validator.addMessage('en', 'cpf', 'Invalid CPF');
```

#### After (v2.0)
```javascript
// Global message management
import { useValidator } from '@vueller/validator/vue';

const { addMessage, addMessages } = useValidator();

// Single message
addMessage('en', 'cpf', 'Invalid CPF');

// Multiple messages
addMessages('en', {
  cpf: 'Invalid CPF',
  email: 'Invalid email address'
});
```

### 6. Update Locale Management

#### Before (v1.x)
```javascript
// Component level
const { validator } = useValidation();
validator.setLocale('pt-BR');
```

#### After (v2.0)
```javascript
// Global locale management
import { useValidator } from '@vueller/validator/vue';

const { setLocale, getLocale } = useValidator();

// Change language globally
setLocale('pt-BR');

// Get current locale
const currentLocale = getLocale();
```

## Detailed Changes

### Plugin API Changes

#### New Plugin Options
```javascript
app.use(validator, {
  locale: 'en',              // Default locale
  validateOnBlur: true,      // Validate on field blur
  validateOnInput: false,    // Validate on field input
  devtools: true,            // Enable Vue DevTools
  rules: {                   // Global custom rules
    cpf: { rule: CpfRule, message: 'Invalid CPF' }
  }
});
```

### Composable Changes

#### useValidator (New)
```javascript
import { useValidator } from '@vueller/validator/vue';

const { 
  setLocale,     // Set global locale
  getLocale,     // Get current locale
  addRule,       // Add global custom rule
  addMessage,    // Add global message
  addMessages,   // Add multiple messages
  validator      // Access validator instance
} = useValidator();
```

#### useValidation (Updated)
```javascript
import { useValidation } from '@vueller/validator/vue';

const { 
  errors,        // Error bag
  isValid,       // Overall validation state
  validate,      // Validate all fields
  validateField, // Validate specific field
  setValue,      // Set field value
  setRules,      // Set field rules
  formData,      // Form data (reactive)
  clear          // Clear form
} = useValidation();
```

### Directive Changes

#### v-validate (Optional)
```vue
<!-- Before: Required for custom rules -->
<input v-rules="{ cpf: true }" v-validate="'cpf'" name="document" />

<!-- After: Optional - automatic validation -->
<input v-rules="{ cpf: true }" name="document" />
```

#### v-label (Enhanced)
```vue
<!-- Before: Basic field labeling -->
<input v-label="'Email'" name="email" />

<!-- After: Enhanced with better error messages -->
<input v-label="'E-mail Address'" name="email" />
<!-- Error: "The E-mail Address field must be a valid email address" -->
```

### Message Resolution Changes

#### New Resolution Order
1. **Field-specific message** (`field.rule`) - Highest priority
2. **Rule-specific message** (`rule`) - Medium priority
3. **Rule fallback message** (from registration) - Low priority
4. **Default fallback** (generic message) - Lowest priority

#### Before (v1.x)
```javascript
// Simple message override
validator.addMessage('en', 'cpf', 'Invalid CPF');
```

#### After (v2.0)
```javascript
// Hierarchical message system
addRule('cpf', CpfRule, 'Invalid CPF format'); // Fallback message
addMessage('en', 'cpf', 'Invalid CPF');        // Locale-specific override
addMessage('en', 'user.cpf', 'User CPF invalid'); // Field-specific override
```

## Migration Checklist

### ✅ **Core Migration**
- [ ] Update package to v2.0
- [ ] Install validator plugin globally
- [ ] Update component imports
- [ ] Test basic validation functionality

### ✅ **Advanced Features**
- [ ] Migrate custom rules to global registration
- [ ] Update message management to global system
- [ ] Migrate locale management to global system
- [ ] Update composable usage

### ✅ **Testing**
- [ ] Run existing tests
- [ ] Update test files for new API
- [ ] Test custom rules functionality
- [ ] Test internationalization features

### ✅ **Performance**
- [ ] Verify improved reactivity
- [ ] Check for any performance regressions
- [ ] Test with large forms

## Common Issues and Solutions

### Issue: Custom Rules Not Working

#### Problem
```javascript
// Old way - not working in v2.0
const { validator } = useValidation();
validator.extend('cpf', CpfRule);
```

#### Solution
```javascript
// New way - global registration
import { useValidator } from '@vueller/validator/vue';

const { addRule } = useValidator();
addRule('cpf', CpfRule, 'Invalid CPF format');
```

### Issue: Messages Not Updating

#### Problem
```javascript
// Old way - component level
const { validator } = useValidation();
validator.addMessage('en', 'email', 'Custom message');
```

#### Solution
```javascript
// New way - global messages
import { useValidator } from '@vueller/validator/vue';

const { addMessage } = useValidator();
addMessage('en', 'email', 'Custom message');
```

### Issue: Locale Changes Not Reflected

#### Problem
```javascript
// Old way - component level
const { validator } = useValidation();
validator.setLocale('pt-BR');
```

#### Solution
```javascript
// New way - global locale
import { useValidator } from '@vueller/validator/vue';

const { setLocale } = useValidator();
setLocale('pt-BR');
```

## Performance Improvements

### Reactivity Optimizations
- Reduced unnecessary re-renders
- Optimized update cycles
- Better memory management
- Improved subscription system

### Bundle Size
- Smaller core library
- Tree-shaking improvements
- Better code splitting

## Backward Compatibility

### What Still Works
- Basic validation functionality
- Most built-in rules
- Core API methods
- Vue component usage

### What Changed
- Plugin installation method
- Composable signatures
- Message resolution order
- Custom rule registration

## Getting Help

If you encounter issues during migration:

1. **Check the documentation** for updated examples
2. **Review breaking changes** in this guide
3. **Test incrementally** - migrate one feature at a time
4. **Use the migration checklist** to ensure completeness
5. **Report issues** on GitHub with migration context

## Next Steps

After successful migration:

1. **Explore new features** like global validator instance
2. **Optimize performance** with new reactivity system
3. **Enhance UX** with automatic validation
4. **Improve maintainability** with centralized rule management

Welcome to @vueller/validator v2.0! 🎉
