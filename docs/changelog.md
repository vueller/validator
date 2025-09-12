# Changelog

All notable changes to @vueller/validator will be documented here.

## [1.2.0] - 2024-12-19

### 🚀 Major Features

#### Auto-validation
- **Enhanced `v-rules` directive** with automatic validation on blur (default: enabled)
- **Input validation support** with 300ms debounce for real-time feedback
- **Visual feedback classes** automatically applied (`.valid`, `.invalid`, `.has-error`)
- **Cross-field validation** support in automatic events

#### ValidatorForm Enhanced Props
- **`validateOnBlur`** prop: Control blur validation per form (default: `null` → uses global)
- **`validateOnInput`** prop: Control input validation per form (default: `null` → uses global)
- **Global configuration override** at form level
- **Hierarchical configuration**: Form props → Global config → Defaults

#### Plugin Global Configuration
- **`validateOnBlur: true`** - Global blur validation setting (default: enabled)
- **`validateOnInput: false`** - Global input validation setting (default: disabled)
- **Dynamic configuration** via `setGlobalConfig()` method
- **Real-time config changes** with automatic directive updates

#### Enhanced Form Integration
- **ValidatorForm expose methods** for external access (`validateAll`, `reset`, etc.)
- **Reactive validation patterns** for complex form scenarios
- **Programmatic validation** for custom workflows
- **Multiple forms per page** support

### 🎯 Usage Examples

#### Basic Auto-Validation
```vue
<!-- Automatic blur validation (default behavior) -->
<input v-model="email" v-rules="{ required: true, email: true }" name="email" />
```

#### Form-Level Control
```vue
<!-- Custom validation behavior per form -->
<ValidatorForm 
  :validate-on-blur="false"    <!-- Disable blur -->
  :validate-on-input="true"    <!-- Enable input -->
  v-model="formData"
>
  <!-- inputs here use form-specific settings -->
</ValidatorForm>
```

#### Global Configuration
```javascript
// main.js
app.use(ValidatorPlugin, {
  globalValidator: true,
  validateOnBlur: true,     // Global blur validation
  validateOnInput: false,   // Global input validation
  locale: 'pt-BR'
})
```

#### Programmatic Validation
```vue
<script setup>
const formRef = ref(null)

const customValidation = async () => {
  // Programmatic validation for custom workflows
  const isValid = await formRef.value.validateAll()
  if (isValid) {
    // Process form or continue workflow
    processFormData()
  }
}
</script>
```

### 🛠️ Technical Improvements

#### Directive Enhancements
- **Automatic event listener management** (blur/input)
- **Form data collection** for cross-field validation
- **Performance optimizations** with debouncing
- **Memory leak prevention** with proper cleanup

#### Validator Core
- **Enhanced global config methods** (`getGlobalConfig`, `setGlobalConfig`)
- **Better error handling** in async validation
- **Improved method exposure** for external access

#### Vue 3 Integration
- **Better composable patterns** for step validation
- **Reactive configuration** with immediate UI updates
- **Template ref compatibility** for programmatic access

### 🎨 CSS Classes Added

Automatically applied by `v-rules` directive:
- **`.valid`** - Applied to valid fields
- **`.invalid`** - Applied to invalid fields  
- **`.has-error`** - Alias for invalid fields

### 📋 Migration Guide

#### From 1.1.x to 1.2.0

**No breaking changes!** All existing code continues to work.

**New Features Available:**
1. **Automatic validation** now works out of the box with `v-rules`
2. **Form-level control** via ValidatorForm props
3. **Programmatic validation** via exposed methods

**Optional Upgrades:**
```vue
<!-- Before (still works) -->
<input v-rules="{ required: true }" @blur="validateField('name', value)" />

<!-- After (automatic validation) -->
<input v-rules="{ required: true }" name="name" />
```

### 🔧 Configuration Changes

#### Global Plugin Options (New)
```javascript
app.use(ValidatorPlugin, {
  globalValidator: true,        // Existing
  validateOnBlur: true,         // 🆕 New
  validateOnInput: false,       // 🆕 New
  locale: 'pt-BR'              // Existing
})
```

#### ValidatorForm Props (New)
```vue
<ValidatorForm
  :validate-on-blur="true|false|null"    <!-- 🆕 New -->
  :validate-on-input="true|false|null"   <!-- 🆕 New -->
  v-model="formData"                      <!-- Existing -->
>
```

### 📈 Performance Improvements

- **Debounced input validation** (300ms) prevents excessive API calls
- **Smart event listener management** - only attached when needed
- **Optimized form data collection** for cross-field validation
- **Memory efficient** with proper cleanup on component unmount

### 🐛 Bug Fixes

- Fixed memory leaks in directive event listeners
- Improved error handling in async validation scenarios
- Better cross-field validation data collection
- Enhanced reactive state management

---

## [1.1.3] - Previous Release

### Features
- Core validation engine with reactive error handling
- Vue 3 composables and components
- Internationalization support with real-time language switching
- Built-in validation rules (required, email, min, max, etc.)
- Custom rule registration system

### Components
- ValidatorForm component with slot-based validation
- ValidatorField component for individual field validation
- Vue 3 directives for seamless form integration

### Internationalization
- Multi-language support (English, Portuguese)
- Real-time language switching
- Customizable error messages
- Parameter substitution in messages

---

## Support

- **[GitHub Issues](https://github.com/vueller/validator/issues)** - Report bugs or request features
- **[GitHub Discussions](https://github.com/vueller/validator/discussions)** - Community support
- **[Documentation](https://vueller.github.io/validator/)** - Full documentation
