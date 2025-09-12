# Quick Start

Get up and running with @vueller/validator in under 5 minutes.

## Choose Your Framework

Select your preferred approach to get started quickly:

::: code-group

```vue [Vue 3]
<template>
  <div class="quick-start">
    <h2>Contact Form</h2>
    
    <ValidatorForm v-model="form" :rules="rules" @submit="handleSubmit">
      <div class="form-group">
        <input 
          v-model="form.name"
          name="name"
          placeholder="Your name"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <input 
          v-model="form.email"
          name="email"
          type="email"
          placeholder="Your email"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <textarea 
          v-model="form.message"
          name="message"
          placeholder="Your message"
          rows="4"
          class="form-control"
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary">
        Send Message
      </button>
    </ValidatorForm>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ValidatorForm } from '@vueller/validator/vue'

const form = ref({
  name: '',
  email: '',
  message: ''
})

const rules = {
  name: { required: true, min: 2 },
  email: { required: true, email: true },
  message: { required: true, min: 10 }
}

const handleSubmit = (data) => {
  alert(`Thank you, ${data.name}! Message sent.`)
}
</script>

<style scoped>
.form-group { margin-bottom: 1rem; }
.form-control { 
  width: 100%; 
  padding: 0.75rem; 
  border: 2px solid #ddd; 
  border-radius: 4px; 
}
.form-control.valid { border-color: green; }
.form-control.invalid { border-color: red; }
.btn { 
  padding: 0.75rem 1.5rem; 
  background: #007bff; 
  color: white; 
  border: none; 
  border-radius: 4px; 
  cursor: pointer; 
}
</style>
```

```html [Vanilla JS]
<!DOCTYPE html>
<html>
<head>
  <title>Quick Start - Vanilla JS</title>
  <style>
    .form-group { margin-bottom: 1rem; }
    .form-control { 
      width: 100%; 
      padding: 0.75rem; 
      border: 2px solid #ddd; 
      border-radius: 4px; 
      box-sizing: border-box;
    }
    .form-control.valid { border-color: green; background: #f0fff0; }
    .form-control.invalid { border-color: red; background: #fff0f0; }
    .btn { 
      padding: 0.75rem 1.5rem; 
      background: #007bff; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer; 
    }
    .error { color: red; font-size: 0.875rem; margin-top: 0.25rem; }
    .container { max-width: 500px; margin: 2rem auto; padding: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Contact Form</h2>
    
    <form id="contactForm">
      <div class="form-group">
        <input 
          name="name"
          placeholder="Your name"
          class="form-control"
        />
        <div class="error" id="name-error"></div>
      </div>

      <div class="form-group">
        <input 
          name="email"
          type="email"
          placeholder="Your email"
          class="form-control"
        />
        <div class="error" id="email-error"></div>
      </div>

      <div class="form-group">
        <textarea 
          name="message"
          placeholder="Your message"
          rows="4"
          class="form-control"
        ></textarea>
        <div class="error" id="message-error"></div>
      </div>

      <button type="submit" class="btn">
        Send Message
      </button>
    </form>
  </div>

  <script type="module">
    import { Validator } from 'https://unpkg.com/@vueller/validator/dist/validator.esm.js'

    const validator = new Validator()
    const form = document.getElementById('contactForm')

    const rules = {
      name: { required: true, min: 2 },
      email: { required: true, email: true },
      message: { required: true, min: 10 }
    }

    // Add blur validation
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', async () => {
        const fieldRules = rules[field.name]
        if (!fieldRules) return

        const isValid = await validator.validate(field.value, fieldRules, field.name)
        
        // Update UI
        field.classList.remove('valid', 'invalid')
        field.classList.add(isValid ? 'valid' : 'invalid')
        
        const errorElement = document.getElementById(`${field.name}-error`)
        if (errorElement) {
          errorElement.textContent = isValid ? '' : validator.errors().first(field.name)
        }
      })
    })

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const formData = new FormData(form)
      const data = Object.fromEntries(formData.entries())
      
      const isValid = await validator.validateAll(data, rules)
      
      if (isValid) {
        alert(`Thank you, ${data.name}! Message sent.`)
        form.reset()
        
        // Clear validation classes
        form.querySelectorAll('.form-control').forEach(field => {
          field.classList.remove('valid', 'invalid')
        })
      } else {
        alert('Please fix the errors in the form.')
      }
    })
  </script>
</body>
</html>
```

:::

## Step-by-Step Tutorial

### 1. Installation

First, install the package:

```bash
npm install @vueller/validator
```

### 2. Basic Setup

**For Vue 3:**
```javascript
// main.js
import { createApp } from 'vue'
import ValidatorPlugin from '@vueller/validator/vue'
import App from './App.vue'

createApp(App)
  .use(ValidatorPlugin, { globalValidator: true })
  .mount('#app')
```

**For Vanilla JS:**
```javascript
import { Validator } from '@vueller/validator'
const validator = new Validator()
```

### 3. Create Your First Form

**Vue 3 Approach:**
```vue
<template>
  <form>
    <input 
      v-model="email"
      v-rules="{ required: true, email: true }"
      name="email"
      placeholder="Enter email"
    />
  </form>
</template>

<script setup>
import { ref } from 'vue'
const email = ref('')
</script>
```

**Vanilla JS Approach:**
```javascript
const isValid = await validator.validate(
  'user@example.com',
  { required: true, email: true }
)
console.log(isValid) // true
```

### 4. Handle Validation Results

**Get Errors:**
```javascript
if (!isValid) {
  const errors = validator.errors()
  console.log(errors.first()) // "The field is required."
  console.log(errors.all())   // ["The field is required."]
}
```

**Check Specific Fields:**
```javascript
await validator.validateAll(formData, rules)

if (validator.errors().has('email')) {
  console.log(validator.errors().first('email'))
}
```

## Common Patterns

### Email Validation
```javascript
const rules = { email: { required: true, email: true } }
```

### Password with Confirmation
```javascript
const rules = {
  password: { required: true, min: 8 },
  confirmPassword: { required: true, confirmed: 'password' }
}
```

### Optional Field with Format
```javascript
const rules = {
  website: { url: true } // Optional but must be valid URL if provided
}
```

### Number Range
```javascript
const rules = {
  age: { required: true, numeric: true, min: 18, max: 120 }
}
```

## Live Examples

Try these working examples in your browser:

### Simple Email Validator

```html
<!DOCTYPE html>
<html>
<head>
  <title>Email Validator Demo</title>
  <style>
    .demo-container { max-width: 400px; margin: 1rem 0; }
    .demo-input { 
      width: 100%; 
      padding: 0.5rem; 
      border: 2px solid #ddd; 
      border-radius: 4px; 
      box-sizing: border-box;
    }
    .demo-result { 
      margin-top: 0.5rem; 
      font-size: 0.875rem; 
    }
    .valid { border-color: green; }
    .invalid { border-color: red; }
  </style>
</head>
<body>
  <div class="demo-container">
    <input id="demo-email" placeholder="Enter email" class="demo-input" />
    <div id="demo-result" class="demo-result"></div>
  </div>

  <script type="module">
    import { Validator } from 'https://unpkg.com/@vueller/validator/dist/validator.esm.js'
    
    const validator = new Validator()
    const input = document.getElementById('demo-email')
    const result = document.getElementById('demo-result')
    
    input.addEventListener('input', async (e) => {
      const value = e.target.value
      
      if (!value) {
        result.textContent = ''
        input.classList.remove('valid', 'invalid')
        return
      }
      
      const isValid = await validator.validate(value, { email: true })
      
      input.classList.remove('valid', 'invalid')
      input.classList.add(isValid ? 'valid' : 'invalid')
      
      if (isValid) {
        result.textContent = '✅ Valid email'
        result.style.color = 'green'
      } else {
        result.textContent = '❌ ' + validator.errors().first()
        result.style.color = 'red'
      }
    })
  </script>
</body>
</html>
```

### Multi-Field Form

```html
<!DOCTYPE html>
<html>
<head>
  <title>Registration Form Demo</title>
  <style>
    .demo-form { 
      max-width: 400px; 
      padding: 1rem; 
      border: 1px solid #ddd; 
      border-radius: 8px; 
      margin: 1rem 0;
    }
    .form-group { margin-bottom: 1rem; }
    .form-control { 
      width: 100%; 
      padding: 0.5rem; 
      border: 2px solid #ddd; 
      border-radius: 4px; 
      box-sizing: border-box;
    }
    .btn { 
      padding: 0.5rem 1rem; 
      background: #007bff; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer; 
    }
    .valid { border-color: green; }
    .invalid { border-color: red; }
    .error { color: red; font-size: 0.875rem; margin-top: 0.25rem; }
  </style>
</head>
<body>
  <div class="demo-form">
    <h4>Registration Form</h4>
    
    <form id="registrationForm">
      <div class="form-group">
        <input name="name" placeholder="Full name" class="form-control" />
        <div class="error" id="name-error"></div>
      </div>
      
      <div class="form-group">
        <input name="email" type="email" placeholder="Email" class="form-control" />
        <div class="error" id="email-error"></div>
      </div>
      
      <div class="form-group">
        <input name="age" type="number" placeholder="Age" class="form-control" />
        <div class="error" id="age-error"></div>
      </div>
      
      <button type="submit" class="btn">Validate</button>
    </form>
    
    <div id="form-result" style="margin-top: 1rem; font-size: 0.875rem;"></div>
  </div>

  <script type="module">
    import { Validator } from 'https://unpkg.com/@vueller/validator/dist/validator.esm.js'
    
    const validator = new Validator()
    const form = document.getElementById('registrationForm')
    const result = document.getElementById('form-result')
    
    const rules = {
      name: { required: true, min: 2 },
      email: { required: true, email: true },
      age: { required: true, numeric: true, min: 18, max: 120 }
    }
    
    // Add blur validation
    form.querySelectorAll('input').forEach(field => {
      field.addEventListener('blur', async () => {
        const fieldRules = rules[field.name]
        if (!fieldRules) return
        
        const isValid = await validator.validate(field.value, fieldRules, field.name)
        
        field.classList.remove('valid', 'invalid')
        field.classList.add(isValid ? 'valid' : 'invalid')
        
        const errorElement = document.getElementById(`${field.name}-error`)
        if (errorElement) {
          errorElement.textContent = isValid ? '' : validator.errors().first(field.name)
        }
      })
    })
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const formData = new FormData(form)
      const data = Object.fromEntries(formData.entries())
      
      const isValid = await validator.validateAll(data, rules)
      
      if (isValid) {
        result.innerHTML = '<div style="color: green;">✅ All fields are valid!</div>'
      } else {
        const errors = validator.errors().all()
        result.innerHTML = '<div style="color: red;">❌ Errors:<br>' + 
          errors.map(e => `• ${e}`).join('<br>') + '</div>'
      }
    })
  </script>
</body>
</html>
```

## Best Practices

### 1. Use Semantic Field Names
```javascript
// ✅ Good
{ firstName: { required: true } }

// ❌ Avoid
{ field1: { required: true } }
```

### 2. Provide Clear Error Messages
```javascript
validator.addMessages('en', {
  'email.required': 'Email address is required',
  'email.email': 'Please enter a valid email address'
})
```

### 3. Validate on Appropriate Events
```vue
<!-- Validate on blur for less intrusive UX -->
<ValidatorForm :validate-on-blur="true" :validate-on-input="false">
  <input name="email" />
</ValidatorForm>
```

### 4. Handle Loading States
```vue
<script setup>
const isSubmitting = ref(false)

const handleSubmit = async (data) => {
  isSubmitting.value = true
  try {
    await submitForm(data)
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

## What's Next?

Now that you have the basics working:

### For Vue 3 Users
- **[Auto-validation →](./vue/auto-validation)** - Automatic validation with `v-rules`
- **[ValidatorForm →](./vue/validator-form)** - Complete form component
- **[Custom Rules →](./vue/custom-rules)** - Create your own rules

### For Vanilla JS Users
- **[Core Usage →](./js/core)** - Complete API reference
- **[DOM Integration →](./js/dom)** - Advanced DOM patterns
- **[Custom Rules →](./js/custom-rules)** - JavaScript-specific rules

### Advanced Topics
- **[Internationalization →](./advanced/i18n)** - Multi-language support
- **[Performance →](./advanced/performance)** - Optimization tips
- **[TypeScript →](./advanced/typescript)** - Type-safe validation

## Need Help?

- **[Examples →](/examples/)** - More complete examples
- **[API Reference →](/api/)** - Complete API documentation
- **[GitHub Issues](https://github.com/vueller/validator/issues)** - Report bugs
- **[GitHub Discussions](https://github.com/vueller/validator/discussions)** - Get help

Ready to build amazing forms? Pick your framework and start coding! 🚀