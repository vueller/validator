# Vue 3 Basic Validation Examples

Learn the fundamentals of form validation with @vueller/validator in Vue 3. These examples show only the essential code without custom styling.

## Simple Field Validation

Start with basic single-field validation using the `v-rules` directive.

```vue
<template>
  <div>
    <h3>Email Validation</h3>
    
    <input 
      v-model="email"
      v-rules="{ required: true, email: true }"
      name="email"
      placeholder="Enter your email"
    />
    
    <p v-if="email">
      Current value: {{ email }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
</script>

<style>
/* Only the validation classes provided by @vueller/validator */
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

::: tip Required Name Attribute
The `name` attribute is **required** for auto-validation to work. This attribute:

- **Identifies the field** for error tracking
- **Used as the field key** in `errors.has('fieldName')` and `errors.first('fieldName')`
- **Required for cross-field validation** (like password confirmation)
- **Must be unique** within the same form

Example: `<input name="email" />` → Use `errors.has('email')` to check for errors.
:::

## Multiple Field Validation

Validate multiple fields with different rules:

```vue
<template>
  <div>
    <h3>User Registration</h3>
    
    <div>
      <label for="firstName">First Name</label>
      <input 
        id="firstName"
        v-model="form.firstName"
        v-rules="{ required: true, min: 2, max: 50 }"
        name="firstName"
        placeholder="Enter your first name"
      />
    </div>

    <div>
      <label for="email">Email</label>
      <input 
        id="email"
        v-model="form.email"
        v-rules="{ required: true, email: true }"
        name="email"
        type="email"
        placeholder="Enter your email"
      />
    </div>

    <div>
      <label for="age">Age</label>
      <input 
        id="age"
        v-model="form.age"
        v-rules="{ required: true, numeric: true, min: 18, max: 120 }"
        name="age"
        type="number"
        placeholder="Enter your age"
      />
    </div>

    <button @click="submitForm">Submit</button>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const form = ref({
  firstName: '',
  email: '',
  age: ''
})

const globalValidator = inject(ValidatorSymbol)

const submitForm = async () => {
  const isValid = await globalValidator.validateAll(form.value)
  
  if (isValid) {
    alert('✅ Form is valid!')
    console.log('Form data:', form.value)
  } else {
    const errors = globalValidator.errors().all()
    alert('❌ Please fix the following errors:\n' + errors.join('\n'))
  }
}
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

## Custom Error Messages

Customize error messages for better user experience:

```vue
<template>
  <div>
    <h3>Custom Error Messages</h3>
    
    <div>
      <label for="username">Username</label>
      <input 
        id="username"
        v-model="username"
        v-rules="{ required: true, min: 3, max: 20, pattern: /^[a-zA-Z0-9_]+$/ }"
        name="username"
        placeholder="Choose a username"
      />
      <small>Only letters, numbers, and underscores allowed</small>
    </div>

    <div>
      <label for="password">Password</label>
      <input 
        id="password"
        v-model="password"
        v-rules="{ required: true, min: 8, strongPassword: true }"
        name="password"
        type="password"
        placeholder="Create a strong password"
      />
      <small>Must contain uppercase, lowercase, number, and special character</small>
    </div>

    <div>
      <label for="confirmPassword">Confirm Password</label>
      <input 
        id="confirmPassword"
        v-model="confirmPassword"
        v-rules="{ required: true, confirmed: 'password' }"
        name="confirmPassword"
        type="password"
        placeholder="Confirm your password"
      />
    </div>

    <button @click="checkValidation">Check Validation</button>

    <div v-if="errors.length > 0">
      <h4>❌ Validation Errors:</h4>
      <ul>
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <div v-if="isFormValid">
      <h4>✅ All fields are valid!</h4>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errors = ref([])
const isFormValid = ref(false)

const globalValidator = inject(ValidatorSymbol)

onMounted(() => {
  // Register custom strong password rule
  globalValidator.extend('strongPassword', (value) => {
    if (!value) return true
    
    const hasLower = /[a-z]/.test(value)
    const hasUpper = /[A-Z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    
    return hasLower && hasUpper && hasNumber && hasSpecial
  })

  // Register confirmed rule for password matching
  globalValidator.extend('confirmed', (value, targetField, formData) => {
    if (!value) return true
    return value === formData[targetField]
  })

  // Add custom error messages
  globalValidator.addMessages('en', {
    'username.required': 'Please choose a username',
    'username.pattern': 'Username can only contain letters, numbers, and underscores',
    'password.min': 'Password must be at least 8 characters long',
    'strongPassword': 'Password must contain uppercase, lowercase, number, and special character',
    'confirmed': 'Password confirmation does not match'
  })
})

const checkValidation = async () => {
  const formData = {
    username: username.value,
    password: password.value,
    confirmPassword: confirmPassword.value
  }

  const rules = {
    username: { required: true, min: 3, max: 20, pattern: /^[a-zA-Z0-9_]+$/ },
    password: { required: true, min: 8, strongPassword: true },
    confirmPassword: { required: true, confirmed: 'password' }
  }

  const valid = await globalValidator.validateAll(formData, rules)
  
  if (valid) {
    isFormValid.value = true
    errors.value = []
  } else {
    isFormValid.value = false
    errors.value = globalValidator.errors().all()
  }
}
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

## Real-time Validation

Enable validation while typing for immediate feedback:

```vue
<template>
  <ValidatorForm 
    v-model="formData"
    :rules="rules"
    :validate-on-input="true"
    :validate-on-blur="true"
  >
    <div>
      <label for="email">Email Address</label>
      <input 
        id="email"
        v-model="formData.email"
        name="email"
        type="email"
        placeholder="Type your email..."
      />
      <div v-if="formData.email && isValidEmail">
        ✅ Valid email format
      </div>
      <div v-else-if="formData.email">
        ❌ Invalid email format
      </div>
    </div>

    <div>
      <label for="username">Username</label>
      <input 
        id="username"
        v-model="formData.username"
        name="username"
        placeholder="Type your username..."
      />
      <div v-if="formData.username && isValidUsername">
        ✅ Username available
      </div>
      <div v-else-if="formData.username">
        ❌ Invalid username
      </div>
    </div>

    <button type="submit" :disabled="!isFormValid">
      Create Account
    </button>
  </ValidatorForm>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ValidatorForm } from '@vueller/validator/vue'

const formData = ref({
  email: '',
  username: ''
})

const rules = {
  email: { required: true, email: true },
  username: { required: true, min: 3, max: 20, pattern: /^[a-zA-Z0-9_]+$/ }
}

// Real-time validation status
const isValidEmail = computed(() => {
  if (!formData.value.email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
})

const isValidUsername = computed(() => {
  const username = formData.value.username
  if (!username) return false
  return username.length >= 3 && 
         username.length <= 20 && 
         /^[a-zA-Z0-9_]+$/.test(username)
})

const isFormValid = computed(() => {
  return isValidEmail.value && isValidUsername.value
})
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

## Key Features

### 1. **Automatic Validation**
- Fields validate on blur by default
- CSS classes (`.valid`, `.invalid`) applied automatically
- Real-time error tracking

### 2. **Field Name Mapping**
Notice how the field names map:
- **HTML**: `<input name="email" />` 
- **Error checking**: `errors.has('email')`
- **Validation rules**: `email: { required: true }`

### 3. **Custom Rules**
- Easy to register with `globalValidator.extend()`
- Support for async validation
- Cross-field validation (like password confirmation)

### 4. **Real-time Feedback**
- Enable input validation for immediate user feedback
- Debounced automatically to prevent excessive validation

## Best Practices

1. **Always use `name` attributes** - They're required for field identification
2. **Keep styling minimal** - Let the validator handle the logic
3. **Use semantic field names** - Make them meaningful and consistent
4. **Test with different validation events** - Choose blur vs input based on UX needs

## Next Steps

- **[ValidatorForm Component →](./form)** - Learn about the complete form component
- **[Custom Rules →](./custom-rules)** - Create your own validation rules
- **[Internationalization →](./i18n)** - Add multi-language support
