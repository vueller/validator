# 🟢 Vue.js Examples

Complete examples for using the Universal Validator in Vue.js applications.

## 📋 Table of Contents

- [Basic Form Validation](#basic-form-validation)
- [Using Composables](#using-composables)
- [ValidatorForm Component](#validatorform-component)
- [Multiple Forms](#multiple-forms)
- [Custom Rules](#custom-rules)

## 🚀 Basic Form Validation

### Simple Contact Form

```vue
<template>
  <div>
    <h1>Contact Form</h1>
    
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Name *</label>
        <input 
          v-model="formData.name"
          type="text" 
          placeholder="Your name"
          :class="{ error: errors.has('name'), valid: !errors.has('name') && formData.name }"
          @blur="validateField('name')"
        />
        <div v-if="errors.has('name')" class="error-message">
          {{ errors.first('name') }}
        </div>
      </div>

      <div>
        <label>Email *</label>
        <input 
          v-model="formData.email"
          type="email" 
          placeholder="your@email.com"
          :class="{ error: errors.has('email'), valid: !errors.has('email') && formData.email }"
          @blur="validateField('email')"
        />
        <div v-if="errors.has('email')" class="error-message">
          {{ errors.first('email') }}
        </div>
      </div>

      <div>
        <label>Message *</label>
        <textarea 
          v-model="formData.message"
          placeholder="Your message"
          :class="{ error: errors.has('message'), valid: !errors.has('message') && formData.message }"
          @blur="validateField('message')"
        ></textarea>
        <div v-if="errors.has('message')" class="error-message">
          {{ errors.first('message') }}
        </div>
      </div>

      <button type="submit" :disabled="!isValid || isSubmitting">
        {{ isSubmitting ? 'Sending...' : 'Send Message' }}
      </button>
    </form>

    <div v-if="showSuccess" class="success-message">
      ✅ Message sent successfully!
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useValidator } from '@vueller/validator/vue'

// Form data
const formData = ref({
  name: '',
  email: '',
  message: ''
})

// Form state
const isSubmitting = ref(false)
const showSuccess = ref(false)

// Validator setup
const { validator } = useValidator()

// Set validation rules
validator.setMultipleRules({
  name: { required: true, min: 2 },
  email: { required: true, email: true },
  message: { required: true, min: 10 }
})

// Reactive validation state
const errors = computed(() => validator.errors())
const isValid = computed(() => validator.isValid())

// Validate single field
const validateField = async (fieldName) => {
  await validator.validate().field(fieldName, formData.value[fieldName])
}

// Handle form submission
const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    
    const isFormValid = await validator.validate(formData.value)
    
    if (isFormValid) {
      console.log('Form submitted:', formData.value)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showSuccess.value = true
      
      // Reset form
      Object.keys(formData.value).forEach(key => {
        formData.value[key] = ''
      })
      validator.reset()
      
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.error { border-color: #ef4444; }
.valid { border-color: #10b981; }
.error-message { color: #ef4444; font-size: 14px; margin-top: 4px; }
.success-message { color: #10b981; padding: 10px; background: #f0fdf4; border-radius: 4px; margin-top: 10px; }
input, textarea { width: 100%; padding: 8px; margin: 4px 0; border: 2px solid #e5e7eb; border-radius: 4px; }
button { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; }
button:disabled { background: #9ca3af; }
label { display: block; margin-top: 10px; font-weight: bold; }
</style>
```

## 🧩 Using Composables

### Registration Form with useValidator

```vue
<template>
  <div>
    <h1>Create Account</h1>
    
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Username *</label>
        <input 
          v-model="formData.username"
          type="text" 
          placeholder="Choose username"
          :class="fieldClass('username')"
          @blur="validateField('username')"
        />
        <div v-if="errors.has('username')" class="error-message">
          {{ errors.first('username') }}
        </div>
      </div>

      <div>
        <label>Email *</label>
        <input 
          v-model="formData.email"
          type="email" 
          placeholder="your@email.com"
          :class="fieldClass('email')"
          @blur="validateField('email')"
        />
        <div v-if="errors.has('email')" class="error-message">
          {{ errors.first('email') }}
        </div>
      </div>

      <div>
        <label>Password *</label>
        <input 
          v-model="formData.password"
          type="password" 
          placeholder="Strong password"
          :class="fieldClass('password')"
          @blur="validateField('password')"
        />
        <div v-if="errors.has('password')" class="error-message">
          {{ errors.first('password') }}
        </div>
      </div>

      <div>
        <label>Confirm Password *</label>
        <input 
          v-model="formData.confirmPassword"
          type="password" 
          placeholder="Confirm password"
          :class="fieldClass('confirmPassword')"
          @blur="validateField('confirmPassword')"
        />
        <div v-if="errors.has('confirmPassword')" class="error-message">
          {{ errors.first('confirmPassword') }}
        </div>
      </div>

      <button type="submit" :disabled="!isValid">
        Create Account
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useValidator } from '@vueller/validator/vue'

// Form data
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Validator setup
const { validator } = useValidator()

// Set validation rules
validator.setMultipleRules({
  username: { required: true, min: 3, pattern: /^[a-zA-Z0-9_]+$/ },
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  confirmPassword: { required: true, confirmed: 'password' }
})

// Reactive validation state
const errors = computed(() => validator.errors())
const isValid = computed(() => validator.isValid())

// Helper for field classes
const fieldClass = (fieldName) => {
  return {
    error: errors.value.has(fieldName),
    valid: !errors.value.has(fieldName) && formData.value[fieldName]
  }
}

// Validate single field
const validateField = async (fieldName) => {
  await validator.validate().field(fieldName, formData.value[fieldName])
}

// Handle form submission
const handleSubmit = async () => {
  const isFormValid = await validator.validate(formData.value)
  
  if (isFormValid) {
    console.log('Account created:', formData.value)
    alert('Account created successfully!')
  }
}
</script>

<style scoped>
.error { border-color: #ef4444; }
.valid { border-color: #10b981; }
.error-message { color: #ef4444; font-size: 14px; margin-top: 4px; }
input { width: 100%; padding: 8px; margin: 4px 0; border: 2px solid #e5e7eb; border-radius: 4px; }
button { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; }
button:disabled { background: #9ca3af; }
label { display: block; margin-top: 10px; font-weight: bold; }
</style>
```

## 🧩 ValidatorForm Component

The `ValidatorForm` component provides automatic error display and form handling with minimal setup. It automatically validates all form elements with `name` attributes that match the provided rules and displays errors automatically.

### Slot Props Available

The ValidatorForm provides these props to its slot. You can access them using `v-slot="{ values, errors, clear }"`:

| Prop | Type | Description |
|------|------|-------------|
| `values` | Object | Reactive form data (same as formData) |
| `errors` | ErrorBag | Error bag instance for accessing validation errors |
| `clear` | Function | Function to clear/reset the form |
| `validator` | Validator | Validator instance for advanced usage |
| `isValidating` | Boolean | Currently validating state |
| `isValid` | Boolean | Form is valid state |
| `hasErrors` | Boolean | Form has errors state |
| `validate` | Function | Manual validation function |
| `reset` | Function | Reset validation state (same as clear) |

> **Note**: The `v-slot` is used directly on the `ValidatorForm` component, not on a template tag.

### Simple Usage (Automatic Error Display)

```vue
<template>
  <ValidatorForm :rules="formRules" @submit="handleSubmit">
    <input v-model="formData.email" name="email" type="email" placeholder="Email" />
    <input v-model="formData.password" name="password" type="password" placeholder="Password" />
    <button type="submit">Submit</button>
  </ValidatorForm>
</template>

<script setup>
import { ref } from 'vue'
import { ValidatorForm } from '@vueller/validator'

const formData = ref({ email: '', password: '' })

const formRules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}

const handleSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data)
  }
}
</script>
```

### Advanced Usage (With Slot Props)

```vue
<template>
  <ValidatorForm :rules="formRules" @submit="handleSubmit" v-slot="{ values, errors, clear }">
    <div class="form-field">
      <input v-model="values.email" name="email" type="email" placeholder="Email" />
      <div v-if="errors.has('email')" class="error">{{ errors.first('email') }}</div>
    </div>
    
    <div class="form-field">
      <input v-model="values.password" name="password" type="password" placeholder="Password" />
      <div v-if="errors.has('password')" class="error">{{ errors.first('password') }}</div>
    </div>
    
    <div class="form-actions">
      <button type="submit">Submit</button>
      <button type="button" @click="clear">Clear</button>
    </div>
  </ValidatorForm>
</template>

<script setup>
import { ValidatorForm } from '@vueller/validator'

const formRules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}

const handleSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data)
  }
}
</script>
```

### Complete Example with Slot Props

```vue
<template>
  <div>
    <h1>Contact Us</h1>
    
    <ValidatorForm 
      :rules="formRules"
      @submit="handleSubmit"
      @validation-success="onSuccess"
      @validation-error="onError"
      v-slot="{ values, errors, clear }"
    >
        <div class="field-group">
          <label for="name">Name *</label>
          <input 
            id="name"
            v-model="values.name"
            name="name"
            type="text"
            placeholder="Your full name"
          />
          <div v-if="errors.has('name')" class="error-message">
            {{ errors.first('name') }}
          </div>
        </div>

        <div class="field-group">
          <label for="email">Email *</label>
          <input 
            id="email"
            v-model="values.email"
            name="email"
            type="email"
            placeholder="your@email.com"
          />
          <div v-if="errors.has('email')" class="error-message">
            {{ errors.first('email') }}
          </div>
        </div>

        <div class="field-group">
          <label for="subject">Subject *</label>
          <input 
            id="subject"
            v-model="values.subject"
            name="subject"
            type="text"
            placeholder="What's this about?"
          />
          <div v-if="errors.has('subject')" class="error-message">
            {{ errors.first('subject') }}
          </div>
        </div>

        <div class="field-group">
          <label for="message">Message *</label>
          <textarea 
            id="message"
            v-model="values.message"
            name="message"
            placeholder="Tell us more..."
            rows="5"
          ></textarea>
          <div v-if="errors.has('message')" class="error-message">
            {{ errors.first('message') }}
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Sending...' : 'Send Message' }}
          </button>
          <button type="button" @click="clear" class="clear-button">
            Clear Form
          </button>
        </div>
    </ValidatorForm>

    <div v-if="showSuccess" class="success-message">
      ✅ Message sent successfully!
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ValidatorForm } from '@vueller/validator'

// Form state
const isSubmitting = ref(false)
const showSuccess = ref(false)

// Validation rules
const formRules = {
  name: { required: true, min: 2 },
  email: { required: true, email: true },
  subject: { required: true, min: 5 },
  message: { required: true, min: 20 }
}

// Form handlers
const handleSubmit = async (event) => {
  try {
    isSubmitting.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submitted:', event.data)
    
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const onSuccess = (data) => {
  console.log('Validation successful:', data)
}

const onError = (data) => {
  console.log('Validation failed:', data)
}
</script>

<style scoped>
.field-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #374151;
}

input, textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

/* ValidatorForm automatic classes */
input.v-valid, textarea.v-valid {
  border-color: #10b981;
}

input.v-invalid, textarea.v-invalid {
  border-color: #ef4444;
}

button {
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background: #2563eb;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.clear-button {
  background: #6b7280;
  color: white;
}

.clear-button:hover {
  background: #4b5563;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
}

.success-message {
  background: #f0fdf4;
  color: #166534;
  padding: 12px;
  border-radius: 6px;
  margin-top: 20px;
  border: 1px solid #bbf7d0;
}
</style>
```

### Alternative: Using v-rules with Manual Error Display

If you prefer to handle error display manually, you can use `v-rules` directly:

```vue
<template>
  <div>
    <h1>Contact Us (Manual Error Display)</h1>
    
    <ValidatorForm 
      :rules="formRules"
      @submit="handleSubmit"
    >
      <div class="field-group">
        <label for="name">Name *</label>
        <input 
          id="name"
          v-model="formData.name"
          v-rules="formRules.name"
          name="name"
          type="text"
          placeholder="Your full name"
          :class="{ error: errors.has('name'), valid: !errors.has('name') && formData.name }"
        />
        <div v-if="errors.has('name')" class="error-message">
          {{ errors.first('name') }}
        </div>
      </div>

      <div class="field-group">
        <label for="email">Email *</label>
        <input 
          id="email"
          v-model="formData.email"
          v-rules="formRules.email"
          name="email"
          type="email"
          placeholder="your@email.com"
          :class="{ error: errors.has('email'), valid: !errors.has('email') && formData.email }"
        />
        <div v-if="errors.has('email')" class="error-message">
          {{ errors.first('email') }}
        </div>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Sending...' : 'Send Message' }}
      </button>
    </ValidatorForm>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ValidatorForm, useValidator } from '@vueller/validator'

// Form data
const formData = ref({
  name: '',
  email: ''
})

// Form state
const isSubmitting = ref(false)

// Get validator instance for manual error access
const { validator } = useValidator()

// Validation rules
const formRules = {
  name: { required: true, min: 2 },
  email: { required: true, email: true }
}

// Reactive errors for manual display
const errors = computed(() => validator.errors())

// Form handlers
const handleSubmit = async (event) => {
  try {
    isSubmitting.value = true
    
    // Validation is handled automatically by ValidatorForm
    console.log('Form submitted:', formData.value)
    
  } catch (error) {
    console.error('Submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.error { border-color: #ef4444; }
.valid { border-color: #10b981; }
.error-message { color: #ef4444; font-size: 14px; margin-top: 4px; }
/* ... other styles ... */
</style>
```

## 🔄 Multiple Forms

### Multiple Forms on Same Page (No Conflicts)

The ValidatorForm uses unique refs internally, so you can have multiple forms on the same page without conflicts:

```vue
<template>
  <div style="display: flex; gap: 20px;">
    <!-- Login Form -->
    <div style="flex: 1; padding: 20px; border: 1px solid #ccc;">
      <h2>Login</h2>
      <ValidatorForm 
        :rules="loginRules" 
        @submit="handleLogin"
        scope="login"
      >
        <div class="field-group">
          <label>Email</label>
          <input 
            v-model="loginData.email"
            name="email"
            type="email" 
            placeholder="Email"
          />
        </div>

        <div class="field-group">
          <label>Password</label>
          <input 
            v-model="loginData.password"
            name="password"
            type="password" 
            placeholder="Password"
          />
        </div>

        <button type="submit">Login</button>
      </ValidatorForm>
    </div>

    <!-- Registration Form -->
    <div style="flex: 1; padding: 20px; border: 1px solid #ccc;">
      <h2>Register</h2>
      <ValidatorForm 
        :rules="registerRules" 
        @submit="handleRegister"
        scope="register"
      >
        <div class="field-group">
          <label>Name</label>
          <input 
            v-model="registerData.name"
            name="name"
            type="text" 
            placeholder="Full name"
          />
        </div>

        <div class="field-group">
          <label>Email</label>
          <input 
            v-model="registerData.email"
            name="email"
            type="email" 
            placeholder="Email"
          />
        </div>

        <div class="field-group">
          <label>Password</label>
          <input 
            v-model="registerData.password"
            name="password"
            type="password" 
            placeholder="Password"
          />
        </div>

        <button type="submit">Register</button>
      </ValidatorForm>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ValidatorForm } from '@vueller/validator'

// Form data
const loginData = ref({
  email: '',
  password: ''
})

const registerData = ref({
  name: '',
  email: '',
  password: ''
})

// Validation rules (scoped)
const loginRules = {
  email: { required: true, email: true },
  password: { required: true, min: 6 }
}

const registerRules = {
  name: { required: true, min: 2 },
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}

// Form handlers
const handleLogin = ({ data, isValid }) => {
  if (isValid) {
    console.log('Login successful:', data)
    alert('Login successful!')
  }
}

const handleRegister = ({ data, isValid }) => {
  if (isValid) {
    console.log('Registration successful:', data)
    alert('Registration successful!')
  }
}
</script>

<style scoped>
.field-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 2px solid #e5e7eb;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #2563eb;
}
</style>
```

### Login and Registration on Same Page (Legacy Example)

```vue
<template>
  <div style="display: flex; gap: 20px;">
    <!-- Login Form -->
    <div style="flex: 1; padding: 20px; border: 1px solid #ccc;">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <label>Email</label>
          <input 
            v-model="loginData.email"
            type="email" 
            placeholder="Email"
            :class="getFieldClass('login', 'email')"
            @blur="validateLoginField('email')"
          />
          <div v-if="hasError('login', 'email')" class="error-message">
            {{ getError('login', 'email') }}
          </div>
        </div>

        <div>
          <label>Password</label>
          <input 
            v-model="loginData.password"
            type="password" 
            placeholder="Password"
            :class="getFieldClass('login', 'password')"
            @blur="validateLoginField('password')"
          />
          <div v-if="hasError('login', 'password')" class="error-message">
            {{ getError('login', 'password') }}
          </div>
        </div>

        <button type="submit">Login</button>
      </form>
    </div>

    <!-- Registration Form -->
    <div style="flex: 1; padding: 20px; border: 1px solid #ccc;">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister">
        <div>
          <label>Name</label>
          <input 
            v-model="registerData.name"
            type="text" 
            placeholder="Full name"
            :class="getFieldClass('register', 'name')"
            @blur="validateRegisterField('name')"
          />
          <div v-if="hasError('register', 'name')" class="error-message">
            {{ getError('register', 'name') }}
          </div>
        </div>

        <div>
          <label>Email</label>
          <input 
            v-model="registerData.email"
            type="email" 
            placeholder="Email"
            :class="getFieldClass('register', 'email')"
            @blur="validateRegisterField('email')"
          />
          <div v-if="hasError('register', 'email')" class="error-message">
            {{ getError('register', 'email') }}
          </div>
        </div>

        <div>
          <label>Password</label>
          <input 
            v-model="registerData.password"
            type="password" 
            placeholder="Password"
            :class="getFieldClass('register', 'password')"
            @blur="validateRegisterField('password')"
          />
          <div v-if="hasError('register', 'password')" class="error-message">
            {{ getError('register', 'password') }}
          </div>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useValidator } from '@vueller/validator/vue'

// Form data
const loginData = ref({
  email: '',
  password: ''
})

const registerData = ref({
  name: '',
  email: '',
  password: ''
})

// Validator setup
const { validator } = useValidator()

// Set validation rules (global rules, scoped validation)
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 6 },
  name: { required: true, min: 2 }
})

// Reactive validation state
const errors = computed(() => validator.errors())

// Helper functions
const hasError = (scope, field) => {
  return errors.value.has(`${scope}.${field}`)
}

const getError = (scope, field) => {
  return errors.value.first(`${scope}.${field}`)
}

const getFieldClass = (scope, field) => {
  const fieldData = scope === 'login' ? loginData.value : registerData.value
  return {
    error: hasError(scope, field),
    valid: !hasError(scope, field) && fieldData[field]
  }
}

// Validation functions
const validateLoginField = async (field) => {
  await validator.validate('login').field(field, loginData.value[field])
}

const validateRegisterField = async (field) => {
  await validator.validate('register').field(field, registerData.value[field])
}

// Form handlers
const handleLogin = async () => {
  const isValid = await validator.validate('login', loginData.value)
  
  if (isValid) {
    console.log('Login successful:', loginData.value)
    alert('Login successful!')
  }
}

const handleRegister = async () => {
  const isValid = await validator.validate('register', registerData.value)
  
  if (isValid) {
    console.log('Registration successful:', registerData.value)
    alert('Registration successful!')
  }
}
</script>

<style scoped>
.error { border-color: #ef4444; }
.valid { border-color: #10b981; }
.error-message { color: #ef4444; font-size: 14px; margin-top: 4px; }
input { width: 100%; padding: 8px; margin: 4px 0; border: 2px solid #e5e7eb; border-radius: 4px; }
button { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; margin-top: 10px; }
label { display: block; margin-top: 10px; font-weight: bold; }
</style>
```

## 🎯 Custom Rules

### Adding Custom Validation Rules

```vue
<template>
  <div>
    <h1>Custom Rules Example</h1>
    
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Even Number *</label>
        <input 
          v-model="formData.evenNumber"
          type="number" 
          placeholder="Enter an even number"
          :class="fieldClass('evenNumber')"
          @blur="validateField('evenNumber')"
        />
        <div v-if="errors.has('evenNumber')" class="error-message">
          {{ errors.first('evenNumber') }}
        </div>
      </div>

      <div>
        <label>Strong Password *</label>
        <input 
          v-model="formData.strongPassword"
          type="password" 
          placeholder="Strong password"
          :class="fieldClass('strongPassword')"
          @blur="validateField('strongPassword')"
        />
        <div v-if="errors.has('strongPassword')" class="error-message">
          {{ errors.first('strongPassword') }}
        </div>
      </div>

      <div>
        <label>Username (async check) *</label>
        <input 
          v-model="formData.username"
          type="text" 
          placeholder="Username"
          :class="fieldClass('username')"
          @blur="validateField('username')"
        />
        <div v-if="errors.has('username')" class="error-message">
          {{ errors.first('username') }}
        </div>
      </div>

      <button type="submit" :disabled="!isValid">
        Submit
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useValidator } from '@vueller/validator/vue'

// Form data
const formData = ref({
  evenNumber: '',
  strongPassword: '',
  username: ''
})

// Validator setup
const { validator } = useValidator()

// Add custom rules
onMounted(() => {
  // Even number rule
  validator.extend('evenNumber', (value) => {
    return Number(value) % 2 === 0
  }, 'The {field} must be an even number')

  // Strong password rule
  validator.extend('strongPassword', (value) => {
    if (!value) return false
    
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*]/.test(value)
    
    return hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8
  }, 'Password must contain uppercase, lowercase, number, and special character')

  // Async rule (simulates API check)
  validator.extend('uniqueUsername', async (value) => {
    if (!value) return true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate taken usernames
    const takenUsernames = ['admin', 'user', 'test', 'demo']
    return !takenUsernames.includes(value.toLowerCase())
  }, 'This username is already taken')

  // Set validation rules
  validator.setMultipleRules({
    evenNumber: { required: true, evenNumber: true },
    strongPassword: { required: true, strongPassword: true },
    username: { required: true, min: 3, uniqueUsername: true }
  })
})

// Reactive validation state
const errors = computed(() => validator.errors())
const isValid = computed(() => validator.isValid())

// Helper for field classes
const fieldClass = (fieldName) => {
  return {
    error: errors.value.has(fieldName),
    valid: !errors.value.has(fieldName) && formData.value[fieldName]
  }
}

// Validate single field
const validateField = async (fieldName) => {
  await validator.validate().field(fieldName, formData.value[fieldName])
}

// Handle form submission
const handleSubmit = async () => {
  const isFormValid = await validator.validate(formData.value)
  
  if (isFormValid) {
    console.log('Form is valid:', formData.value)
    alert('Form submitted successfully!')
  }
}
</script>

<style scoped>
.error { border-color: #ef4444; }
.valid { border-color: #10b981; }
.error-message { color: #ef4444; font-size: 14px; margin-top: 4px; }
input { width: 100%; padding: 8px; margin: 4px 0; border: 2px solid #e5e7eb; border-radius: 4px; }
button { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; }
button:disabled { background: #9ca3af; }
label { display: block; margin-top: 10px; font-weight: bold; }
</style>
```

## Next Steps

- [JavaScript Examples](javascript.md) - Vanilla JavaScript examples
- [Advanced Guide](../guide/advanced.md) - Advanced patterns and techniques
- [API Reference](../api/vue.md) - Complete Vue API documentation