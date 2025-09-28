# Universal API Reference

The Universal API provides a simple, framework-agnostic interface for validation that works in any JavaScript environment.

## Overview

The Universal API is designed for maximum simplicity and compatibility. It provides a pre-configured validator instance that you can use immediately without setup.

```javascript
import { validator } from '@vueller/validator/universal'

// Ready to use - no configuration needed
await validator.validate({ email: 'test@example.com' })
```

## Global Validator Instance

### `validator`

A pre-configured validator instance available globally.

```javascript
import { validator } from '@vueller/validator/universal'
```

## Methods

### `validate(scopeOrData?, data?)`

Main validation method with automatic data management.

**Parameters:**
- `scopeOrData` (string|object, optional) - Scope identifier or data object
- `data` (object, optional) - Data object when first parameter is scope

**Returns:** `Promise<boolean>` - True if validation passes

**Examples:**

```javascript
// Validate data directly
const isValid = await validator.validate({
  email: 'user@example.com',
  password: 'password123'
})

// Validate with scope
const isValid = await validator.validate('loginForm', {
  email: 'user@example.com',
  password: 'password123'
})

// Get fluent API for field validation
const isEmailValid = await validator.validate('loginForm').field('email', 'user@example.com')
```

### `setRules(field, rules, messages?)`

Set validation rules for a field.

**Parameters:**
- `field` (string) - Field name
- `rules` (object) - Validation rules
- `messages` (object, optional) - Custom error messages

**Returns:** `void`

**Example:**

```javascript
validator.setRules('email', { 
  required: true, 
  email: true 
}, {
  required: 'Email is required',
  email: 'Please enter a valid email'
})
```

### `setMultipleRules(rules, messages?)`

Set validation rules for multiple fields.

**Parameters:**
- `rules` (object) - Rules object with field names as keys
- `messages` (object, optional) - Custom error messages

**Returns:** `void`

**Example:**

```javascript
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  name: { required: true, min: 2 }
}, {
  'email.required': 'Email is required',
  'password.min': 'Password must be at least 8 characters'
})
```

### `getErrors()`

Get current validation errors.

**Returns:** `Object` - Error object with ErrorBag-like interface

**Example:**

```javascript
const errors = validator.getErrors()

// Check if field has errors
if (errors.has('email')) {
  console.log('Email error:', errors.first('email'))
}

// Get all errors by field
const allErrors = errors.allByField()
console.log(allErrors) // { email: ['Email is required'], password: ['Too short'] }
```

### `isValid()`

Check if current validation state is valid.

**Returns:** `boolean` - True if no validation errors exist

**Example:**

```javascript
const formIsValid = validator.isValid()
if (formIsValid) {
  console.log('Form can be submitted')
}
```

### `hasErrors()`

Check if validation errors exist.

**Returns:** `boolean` - True if validation errors exist

**Example:**

```javascript
if (validator.hasErrors()) {
  console.log('Form has validation errors')
  const errors = validator.getErrors().allByField()
  console.log(errors)
}
```

### `reset(scope?)`

Reset validation state.

**Parameters:**
- `scope` (string, optional) - Scope to reset (if not provided, resets all)

**Returns:** `void`

**Example:**

```javascript
// Reset all validation state
validator.reset()

// Reset specific scope
validator.reset('loginForm')
```

### `setLocale(locale)`

Set the current locale for error messages.

**Parameters:**
- `locale` (string) - Locale identifier (e.g., 'en', 'pt-BR')

**Returns:** `void`

**Example:**

```javascript
validator.setLocale('pt-BR')
```

### `addMessages(locale, messages)`

Add localized error messages.

**Parameters:**
- `locale` (string) - Locale identifier
- `messages` (object) - Localized messages

**Returns:** `void`

**Example:**

```javascript
validator.addMessages('pt-BR', {
  required: 'O campo {field} é obrigatório',
  email: 'O campo {field} deve ser um email válido',
  min: 'O campo {field} deve ter pelo menos {parameter} caracteres'
})
```

## Usage Patterns

### Basic Form Validation

```javascript
import { validator } from '@vueller/validator/universal'

// Set up validation rules
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  name: { required: true, min: 2 }
})

// Validate form data
async function validateForm(formData) {
  const isValid = await validator.validate(formData)
  
  if (isValid) {
    console.log('Form is valid!')
    return true
  } else {
    const errors = validator.getErrors().allByField()
    console.log('Validation errors:', errors)
    return false
  }
}

// Usage
const formData = {
  email: 'user@example.com',
  password: 'mypassword',
  name: 'John Doe'
}

await validateForm(formData)
```

### Multiple Forms with Scopes

```javascript
// Set global rules (used by all scopes)
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  name: { required: true, min: 2 }
})

// Login form validation
async function validateLogin(loginData) {
  return await validator.validate('login', loginData)
}

// Registration form validation
async function validateRegistration(registrationData) {
  return await validator.validate('registration', registrationData)
}

// Usage
const loginData = { email: 'user@test.com', password: 'password123' }
const registrationData = { name: 'John', email: 'john@test.com', password: 'password123' }

const isLoginValid = await validateLogin(loginData)
const isRegistrationValid = await validateRegistration(registrationData)

// Errors are scoped
const loginErrors = validator.getErrors()
// Will contain errors like: { 'login.email': ['Email is required'] }
```

### Real-time Field Validation

```javascript
// Validate individual fields as user types
async function validateField(fieldName, value, scope = 'default') {
  const isValid = await validator.validate(scope).field(fieldName, value)
  
  // Update UI based on validation result
  updateFieldUI(fieldName, isValid, scope)
  
  return isValid
}

function updateFieldUI(fieldName, isValid, scope) {
  const errors = validator.getErrors()
  const scopedFieldName = scope === 'default' ? fieldName : `${scope}.${fieldName}`
  
  if (!isValid && errors.has(scopedFieldName)) {
    showFieldError(fieldName, errors.first(scopedFieldName))
  } else {
    hideFieldError(fieldName)
  }
}

// Usage with DOM events
document.getElementById('email').addEventListener('blur', async (e) => {
  await validateField('email', e.target.value, 'login')
})
```

### Custom Validation Rules

```javascript
// Add custom rule to global validator
validator.extend('strongPassword', (value) => {
  if (!value) return false
  
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecial = /[!@#$%^&*]/.test(value)
  
  return hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8
}, 'Password must contain uppercase, lowercase, number, and special character')

// Use custom rule
validator.setRules('password', { 
  required: true, 
  strongPassword: true 
})
```

### Async Validation

```javascript
// Add async validation rule
validator.extend('uniqueEmail', async (value) => {
  if (!value) return true
  
  try {
    const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`)
    const result = await response.json()
    return result.isUnique
  } catch (error) {
    console.error('Email validation error:', error)
    return false
  }
}, 'This email is already registered')

// Use async rule
validator.setRules('email', { 
  required: true, 
  email: true, 
  uniqueEmail: true 
})

// Validate with async rules
const isValid = await validator.validate({ email: 'user@example.com' })
```

## Framework Integration Examples

### React Integration

```javascript
import { useState, useEffect } from 'react'
import { validator } from '@vueller/validator/universal'

function useUniversalValidator(rules) {
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(true)
  
  useEffect(() => {
    if (rules) {
      validator.setMultipleRules(rules)
    }
  }, [rules])
  
  useEffect(() => {
    // Subscribe to validation changes
    const updateState = () => {
      setErrors(validator.getErrors().allByField())
      setIsValid(validator.isValid())
    }
    
    // Note: Universal validator doesn't have built-in subscription
    // You would need to call updateState after each validation
    
    return () => {
      // Cleanup if needed
    }
  }, [])
  
  const validate = async (data, scope) => {
    const result = await validator.validate(scope, data)
    setErrors(validator.getErrors().allByField())
    setIsValid(validator.isValid())
    return result
  }
  
  return { errors, isValid, validate }
}

// Usage in React component
function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const { errors, isValid, validate } = useUniversalValidator({
    email: { required: true, email: true },
    password: { required: true, min: 8 }
  })
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const isFormValid = await validate(formData, 'login')
    
    if (isFormValid) {
      console.log('Form submitted:', formData)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      {errors['login.email'] && <span>{errors['login.email'][0]}</span>}
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      {errors['login.password'] && <span>{errors['login.password'][0]}</span>}
      
      <button type="submit" disabled={!isValid}>Login</button>
    </form>
  )
}
```

### Vanilla JavaScript Integration

```javascript
import { validator } from '@vueller/validator/universal'

class FormValidator {
  constructor(formElement, rules, scope = 'default') {
    this.form = formElement
    this.scope = scope
    
    // Set validation rules
    validator.setMultipleRules(rules)
    
    // Bind events
    this.bindEvents()
  }
  
  bindEvents() {
    // Validate on form submission
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault()
      await this.validateForm()
    })
    
    // Real-time validation on blur
    this.form.addEventListener('blur', async (e) => {
      if (e.target.name) {
        await this.validateField(e.target.name, e.target.value)
      }
    }, true)
  }
  
  async validateForm() {
    const formData = new FormData(this.form)
    const data = Object.fromEntries(formData)
    
    const isValid = await validator.validate(this.scope, data)
    
    if (isValid) {
      this.onSuccess(data)
    } else {
      this.showErrors()
    }
    
    return isValid
  }
  
  async validateField(fieldName, value) {
    const isValid = await validator.validate(this.scope).field(fieldName, value)
    this.updateFieldUI(fieldName, isValid)
    return isValid
  }
  
  updateFieldUI(fieldName, isValid) {
    const input = this.form.querySelector(`[name="${fieldName}"]`)
    const errorElement = this.form.querySelector(`#${fieldName}-error`)
    
    if (!isValid) {
      const errors = validator.getErrors()
      const scopedFieldName = `${this.scope}.${fieldName}`
      
      input.classList.add('error')
      if (errorElement && errors.has(scopedFieldName)) {
        errorElement.textContent = errors.first(scopedFieldName)
      }
    } else {
      input.classList.remove('error')
      if (errorElement) {
        errorElement.textContent = ''
      }
    }
  }
  
  showErrors() {
    const errors = validator.getErrors().allByField()
    
    Object.keys(errors).forEach(scopedFieldName => {
      if (scopedFieldName.startsWith(`${this.scope}.`)) {
        const fieldName = scopedFieldName.replace(`${this.scope}.`, '')
        this.updateFieldUI(fieldName, false)
      }
    })
  }
  
  onSuccess(data) {
    console.log('Form validation successful:', data)
    // Handle successful validation
  }
}

// Usage
const loginForm = new FormValidator(
  document.getElementById('loginForm'),
  {
    email: { required: true, email: true },
    password: { required: true, min: 8 }
  },
  'login'
)
```

## Error Handling

The Universal API provides a consistent error interface:

```javascript
// Get errors after validation
await validator.validate(formData)
const errors = validator.getErrors()

// Check for specific field errors
if (errors.has('email')) {
  console.log('Email error:', errors.first('email'))
}

// Get all errors as array
const allErrorMessages = errors.all()
console.log('All errors:', allErrorMessages)

// Get errors grouped by field
const errorsByField = errors.allByField()
console.log('Errors by field:', errorsByField)

// Count total errors
const errorCount = errors.count()
console.log('Total errors:', errorCount)

// Get field names with errors
const fieldsWithErrors = errors.keys()
console.log('Fields with errors:', fieldsWithErrors)
```

## Best Practices

### 1. Set Rules Once
```javascript
// Good: Set rules once at application startup
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 }
})

// Then use throughout the application
await validator.validate('login', loginData)
await validator.validate('register', registerData)
```

### 2. Use Scopes for Multiple Forms
```javascript
// Good: Use descriptive scopes
await validator.validate('userProfile', profileData)
await validator.validate('changePassword', passwordData)
await validator.validate('billingInfo', billingData)
```

### 3. Handle Async Validation Properly
```javascript
// Good: Handle loading states for async validation
async function validateWithLoading(data) {
  showLoadingIndicator()
  
  try {
    const isValid = await validator.validate(data)
    return isValid
  } finally {
    hideLoadingIndicator()
  }
}
```

### 4. Provide User Feedback
```javascript
// Good: Always provide feedback to users
async function submitForm(formData) {
  const isValid = await validator.validate(formData)
  
  if (isValid) {
    showSuccessMessage('Form submitted successfully!')
  } else {
    const errors = validator.getErrors().allByField()
    showValidationErrors(errors)
  }
}
```

## Next Steps

- [**Core API**](./core.md) - Detailed core validator documentation
- [**Vue API**](./vue.md) - Vue.js specific components and composables
- [**Examples**](../examples/) - Practical implementation examples
