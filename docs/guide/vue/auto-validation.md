# Auto-validation

Auto-validation is the simplest way to add validation to your Vue 3 forms. With zero configuration, fields automatically validate when users interact with them.

## Basic Usage

Simply add the `v-rules` directive to any input element:

```vue
<template>
  <form>
    <input 
      v-model="email"
      v-rules="{ required: true, email: true }"
      name="email"
      placeholder="Enter your email"
    />
    
    <input 
      v-model="password"
      v-rules="{ required: true, min: 8 }"
      name="password"
      type="password"
      placeholder="Password (min 8 chars)"
    />
  </form>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
</script>
```

::: tip Required Name Attribute
The `name` attribute is **required** for auto-validation to work. This attribute:

- **Identifies the field** for error tracking
- **Used as the field key** in `errors.has('fieldName')` and `errors.first('fieldName')`
- **Required for cross-field validation** (like password confirmation)
- **Must be unique** within the same form

Example: `<input name="email" />` → Use `errors.has('email')` to check for errors.
:::

## How It Works

Auto-validation follows a simple lifecycle:

1. **User interacts** with the field (types, clicks away)
2. **Validation triggers** automatically on blur (default)
3. **CSS classes applied** for visual feedback
4. **Error messages** available through the global error bag

## Validation Events

You can control when validation occurs:

### Blur Validation (Default)

Validates when the field loses focus:

```vue
<template>
  <!-- Default behavior - validates on blur -->
  <input 
    v-model="username"
    v-rules="{ required: true, min: 3 }"
    name="username"
    placeholder="Username"
  />
</template>
```

### Input Validation

For real-time validation while typing:

```vue
<template>
  <ValidatorForm :validate-on-input="true" :validate-on-blur="false">
    <input 
      v-model="password"
      v-rules="{ required: true, min: 8 }"
      name="password"
      type="password"
      placeholder="Password (validates while typing)"
    />
  </ValidatorForm>
</template>
```

### Both Events

Maximum validation feedback:

```vue
<template>
  <ValidatorForm :validate-on-blur="true" :validate-on-input="true">
    <input 
      v-model="email"
      v-rules="{ required: true, email: true }"
      name="email"
      placeholder="Email (validates on blur and input)"
    />
  </ValidatorForm>
</template>
```

## CSS Classes

Auto-validation automatically applies CSS classes based on validation state:

```css
/* Applied to valid fields */
.valid {
  border-color: #28a745;
  background-color: #f8fff9;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

/* Applied to invalid fields */
.invalid, .has-error {
  border-color: #dc3545;
  background-color: #fff8f8;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* Smooth transitions */
input {
  transition: all 0.15s ease-in-out;
}
```

## Complete Example

Here's a complete registration form with auto-validation:

```vue
<template>
  <div class="registration-form">
    <h2>Create Account</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input 
          id="firstName"
          v-model="form.firstName"
          v-rules="{ required: true, min: 2, max: 50 }"
          name="firstName"
          placeholder="Enter your first name"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input 
          id="lastName"
          v-model="form.lastName"
          v-rules="{ required: true, min: 2, max: 50 }"
          name="lastName"
          placeholder="Enter your last name"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="email">Email Address</label>
        <input 
          id="email"
          v-model="form.email"
          v-rules="{ required: true, email: true }"
          name="email"
          type="email"
          placeholder="Enter your email"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          v-model="form.password"
          v-rules="{ required: true, min: 8, max: 100 }"
          name="password"
          type="password"
          placeholder="Create a password (min 8 chars)"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          id="confirmPassword"
          v-model="form.confirmPassword"
          v-rules="{ required: true, confirmed: 'password' }"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="age">Age</label>
        <input 
          id="age"
          v-model="form.age"
          v-rules="{ required: true, numeric: true, min: 18, max: 120 }"
          name="age"
          type="number"
          placeholder="Enter your age"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="phone">Phone (Optional)</label>
        <input 
          id="phone"
          v-model="form.phone"
          v-rules="{ phone: true }"
          name="phone"
          placeholder="(11) 99999-9999"
          class="form-control"
        />
      </div>

      <button type="submit" class="btn btn-primary">
        Create Account
      </button>
    </form>
    
    <!-- Language Switcher -->
    <div class="language-switcher">
      <h3>Language / Idioma</h3>
      <button @click="setLanguage('en')" :class="{ active: currentLang === 'en' }">
        🇺🇸 English
      </button>
      <button @click="setLanguage('pt-BR')" :class="{ active: currentLang === 'pt-BR' }">
        🇧🇷 Português
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  phone: ''
})

// Access global validator for language switching
const globalValidator = inject(ValidatorSymbol)
const currentLang = ref('en')

// Language switching
const setLanguage = (lang) => {
  currentLang.value = lang
  globalValidator.setLocale(lang)
}

// Register custom phone rule (if not already registered)
try {
  globalValidator.extend('phone', (value) => {
    if (!value) return true // Optional field
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    return phoneRegex.test(value)
  })
  
  globalValidator.addMessages('en', {
    phone: 'The {field} must be in format (11) 99999-9999.'
  })
  
  globalValidator.addMessages('pt-BR', {
    phone: 'O {field} deve estar no formato (11) 99999-9999.'
  })
} catch (error) {
  // Rule might already be registered
}

// Form submission
const handleSubmit = async () => {
  // Validate all fields before submission
  const isValid = await globalValidator.validateAll(form.value)
  
  if (isValid) {
    console.log('✅ Form is valid:', form.value)
    alert('Account created successfully!')
    
    // Reset form
    Object.keys(form.value).forEach(key => {
      form.value[key] = ''
    })
    
    // Remove CSS classes
    document.querySelectorAll('.form-control').forEach(input => {
      input.classList.remove('valid', 'invalid')
    })
  } else {
    const errors = globalValidator.errors()
    console.log('❌ Validation errors:', errors.allStatic())
    alert('Please fix the errors in the form.')
  }
}
</script>

<style scoped>
.registration-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.15s ease-in-out;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Auto-validation CSS classes */
.form-control.valid {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.form-control.invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.language-switcher {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.language-switcher h3 {
  margin-bottom: 1rem;
  color: #374151;
}

.language-switcher button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.language-switcher button.active,
.language-switcher button:hover {
  border-color: #3b82f6;
  background-color: #3b82f6;
  color: white;
}
</style>
```

## Accessing Validation State

You can access validation errors programmatically:

```vue
<script setup>
import { inject, computed } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const globalValidator = inject(ValidatorSymbol)

// Get reactive access to errors
const errors = computed(() => globalValidator.errors())

// Check specific field errors
const emailError = computed(() => {
  return errors.value.has('email') ? errors.value.first('email') : null
})

// Check overall form validity
const isFormValid = computed(() => !errors.value.any())

// Get all errors
const allErrors = computed(() => errors.value.all())
</script>
```

## Performance Considerations

### Input Validation Debouncing

When using input validation, it's automatically debounced (300ms) to prevent excessive validation calls:

```vue
<template>
  <!-- This won't validate on every keystroke -->
  <ValidatorForm :validate-on-input="true">
    <input v-rules="{ required: true, min: 8 }" name="password" />
  </ValidatorForm>
</template>
```

### Disabling Auto-validation

For performance-critical forms, disable auto-validation:

```vue
<template>
  <ValidatorForm :validate-on-blur="false" :validate-on-input="false">
    <input v-rules="{ required: true }" name="field" />
    <button @click="validateManually">Validate</button>
  </ValidatorForm>
</template>

<script setup>
const validateManually = async () => {
  const isValid = await globalValidator.validateAll(formData.value)
  console.log('Form valid:', isValid)
}
</script>
```

## Best Practices

### 1. Use Semantic Field Names

```vue
<!-- ✅ Good: Clear, semantic names -->
<input v-rules="{ required: true }" name="firstName" />
<input v-rules="{ required: true }" name="lastName" />
<input v-rules="{ required: true }" name="emailAddress" />

<!-- ❌ Avoid: Generic or unclear names -->
<input v-rules="{ required: true }" name="field1" />
<input v-rules="{ required: true }" name="input2" />
<input v-rules="{ required: true }" name="data" />
```

### 2. Combine with Labels

```vue
<template>
  <div class="form-group">
    <label for="email">Email Address</label>
    <input 
      id="email"
      v-rules="{ required: true, email: true }"
      name="email"
      type="email"
    />
  </div>
</template>
```

### 3. Provide Clear Visual Feedback

```css
/* Clear visual distinction between states */
.form-control.valid {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.form-control.invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

/* Avoid overly aggressive styling */
.form-control.invalid {
  /* ❌ Don't: Too jarring */
  background-color: red;
  
  /* ✅ Do: Subtle indication */
  border-color: #ef4444;
  background-color: #fef2f2;
}
```

## Next Steps

- **[ValidatorForm Component →](./validator-form)** - Learn about the ValidatorForm component
- **[Custom Rules →](./custom-rules)** - Create your own validation rules
- **[Composables →](./composables)** - Use validation composables
