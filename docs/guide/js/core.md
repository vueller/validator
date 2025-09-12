# Vanilla JavaScript Core

Learn how to use @vueller/validator in pure JavaScript applications without any framework dependencies.

## Basic Usage

### Installation and Setup

```javascript
// ES6 Modules
import { Validator } from '@vueller/validator'

// CommonJS
const { Validator } = require('@vueller/validator')

// Browser (via CDN)
// <script src="https://unpkg.com/@vueller/validator"></script>
// const { Validator } = VuellerValidator
```

### Creating a Validator Instance

```javascript
// Basic validator
const validator = new Validator()

// Validator with options
const validator = new Validator({
  locale: 'en',
  stopOnFirstFailure: false
})
```

## Simple Validation

### Validating Single Values

```javascript
const validator = new Validator()

// Validate individual values
const isValidEmail = await validator.validate('user@example.com', { email: true })
console.log(isValidEmail) // true

const isValidName = await validator.validate('', { required: true })
console.log(isValidName) // false

// Get validation errors
const result = await validator.validate('', { required: true, min: 3 })
if (!result) {
  const errors = validator.errors()
  console.log(errors.first()) // "The field is required."
}
```

### Validating Objects

```javascript
const validator = new Validator()

const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  website: 'https://johndoe.com'
}

const rules = {
  name: { required: true, min: 2, max: 50 },
  email: { required: true, email: true },
  age: { required: true, numeric: true, min: 18 },
  website: { url: true } // Optional field
}

// Validate all fields
const isValid = await validator.validateAll(userData, rules)

if (isValid) {
  console.log('✅ All data is valid!')
} else {
  console.log('❌ Validation failed:')
  const errors = validator.errors()
  
  // Display all errors
  errors.all().forEach(error => {
    console.log(`- ${error}`)
  })
  
  // Get errors by field
  if (errors.has('email')) {
    console.log(`Email error: ${errors.first('email')}`)
  }
}
```

## Working with Forms

### Basic Form Validation

```html
<!DOCTYPE html>
<html>
<head>
  <title>Form Validation Example</title>
  <style>
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .form-control.valid {
      border-color: #28a745;
      background-color: #f8fff9;
    }
    
    .form-control.invalid {
      border-color: #dc3545;
      background-color: #fff8f8;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <form id="userForm">
    <div class="form-group">
      <label for="firstName">First Name</label>
      <input 
        type="text" 
        id="firstName" 
        name="firstName" 
        class="form-control"
        placeholder="Enter your first name"
      >
      <div class="error-message" id="firstName-error"></div>
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        class="form-control"
        placeholder="Enter your email"
      >
      <div class="error-message" id="email-error"></div>
    </div>

    <div class="form-group">
      <label for="age">Age</label>
      <input 
        type="number" 
        id="age" 
        name="age" 
        class="form-control"
        placeholder="Enter your age"
      >
      <div class="error-message" id="age-error"></div>
    </div>

    <button type="submit" class="btn" id="submitBtn">
      Create Account
    </button>
  </form>

  <script type="module">
    import { Validator } from 'https://unpkg.com/@vueller/validator/dist/validator.esm.js'

    class FormValidator {
      constructor(formSelector, rules) {
        this.form = document.querySelector(formSelector)
        this.validator = new Validator()
        this.rules = rules
        this.init()
      }

      init() {
        // Add event listeners
        this.form.addEventListener('submit', this.handleSubmit.bind(this))
        
        // Add blur validation to all inputs
        const inputs = this.form.querySelectorAll('input')
        inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateField(input.name))
          input.addEventListener('input', () => this.clearFieldError(input.name))
        })
      }

      async validateField(fieldName) {
        const input = this.form.querySelector(`[name="${fieldName}"]`)
        const value = input.value
        const fieldRules = this.rules[fieldName]

        if (!fieldRules) return true

        const isValid = await this.validator.validate(value, fieldRules, fieldName)
        
        this.updateFieldUI(fieldName, isValid)
        return isValid
      }

      async validateAll() {
        const formData = new FormData(this.form)
        const data = Object.fromEntries(formData.entries())

        const isValid = await this.validator.validateAll(data, this.rules)
        
        // Update UI for all fields
        Object.keys(this.rules).forEach(fieldName => {
          const hasError = this.validator.errors().has(fieldName)
          this.updateFieldUI(fieldName, !hasError)
        })

        return isValid
      }

      updateFieldUI(fieldName, isValid) {
        const input = this.form.querySelector(`[name="${fieldName}"]`)
        const errorElement = document.getElementById(`${fieldName}-error`)

        // Update input classes
        input.classList.remove('valid', 'invalid')
        input.classList.add(isValid ? 'valid' : 'invalid')

        // Update error message
        if (isValid) {
          errorElement.textContent = ''
        } else {
          const error = this.validator.errors().first(fieldName)
          errorElement.textContent = error
        }

        // Update submit button state
        this.updateSubmitButton()
      }

      clearFieldError(fieldName) {
        const input = this.form.querySelector(`[name="${fieldName}"]`)
        const errorElement = document.getElementById(`${fieldName}-error`)
        
        input.classList.remove('valid', 'invalid')
        errorElement.textContent = ''
      }

      updateSubmitButton() {
        const submitBtn = document.getElementById('submitBtn')
        const hasErrors = this.validator.errors().any()
        submitBtn.disabled = hasErrors
      }

      async handleSubmit(event) {
        event.preventDefault()

        const isValid = await this.validateAll()

        if (isValid) {
          const formData = new FormData(this.form)
          const data = Object.fromEntries(formData.entries())
          
          console.log('✅ Form is valid! Submitting:', data)
          alert('Form submitted successfully!')
          
          // Here you would typically send data to server
          // await this.submitToServer(data)
        } else {
          console.log('❌ Form has errors')
          alert('Please fix the errors in the form.')
        }
      }
    }

    // Initialize form validation
    const formValidator = new FormValidator('#userForm', {
      firstName: { required: true, min: 2, max: 50 },
      email: { required: true, email: true },
      age: { required: true, numeric: true, min: 18, max: 120 }
    })
  </script>
</body>
</html>
```

## Error Handling

### Understanding the ErrorBag

```javascript
const validator = new Validator()

const data = {
  name: '',
  email: 'invalid-email',
  age: 'not-a-number'
}

const rules = {
  name: { required: true },
  email: { required: true, email: true },
  age: { required: true, numeric: true }
}

await validator.validateAll(data, rules)

const errors = validator.errors()

// Check if there are any errors
console.log(errors.any()) // true

// Get all errors as array
console.log(errors.all())
// ['The name field is required.', 'The email must be a valid email address.', 'The age must be numeric.']

// Get errors for specific field
console.log(errors.has('email')) // true
console.log(errors.first('email')) // 'The email must be a valid email address.'
console.log(errors.get('email')) // ['The email must be a valid email address.']

// Get all errors as object
console.log(errors.allStatic())
// {
//   name: ['The name field is required.'],
//   email: ['The email must be a valid email address.'],
//   age: ['The age must be numeric.']
// }

// Count errors
console.log(errors.count()) // 3
console.log(errors.count('email')) // 1
```

### Custom Error Messages

```javascript
const validator = new Validator()

// Add custom messages for specific rules
validator.addMessages('en', {
  'required': 'Hey! The {field} field cannot be empty!',
  'email': 'Please enter a valid email address for {field}.',
  'min': 'The {field} must be at least {0} characters long.',
  'max': 'The {field} cannot exceed {0} characters.'
})

// Field-specific messages
validator.addMessages('en', {
  'firstName.required': 'First name is mandatory.',
  'email.email': 'Please provide a valid email address.',
  'age.numeric': 'Age must be a valid number.'
})

// Test custom messages
const result = await validator.validate('', { required: true }, 'firstName')
console.log(validator.errors().first()) // "First name is mandatory."
```

## Internationalization

### Setting Up Multiple Languages

```javascript
const validator = new Validator({ locale: 'en' })

// Add English messages (default)
validator.addMessages('en', {
  required: 'The {field} field is required.',
  email: 'The {field} must be a valid email address.',
  min: 'The {field} must be at least {0} characters.',
  max: 'The {field} may not be greater than {0} characters.',
  numeric: 'The {field} must be a number.'
})

// Add Portuguese messages
validator.addMessages('pt-BR', {
  required: 'O campo {field} é obrigatório.',
  email: 'O campo {field} deve ser um endereço de email válido.',
  min: 'O campo {field} deve ter pelo menos {0} caracteres.',
  max: 'O campo {field} não pode ter mais que {0} caracteres.',
  numeric: 'O campo {field} deve ser um número.'
})

// Add Spanish messages
validator.addMessages('es', {
  required: 'El campo {field} es obligatorio.',
  email: 'El campo {field} debe ser una dirección de email válida.',
  min: 'El campo {field} debe tener al menos {0} caracteres.',
  max: 'El campo {field} no puede tener más de {0} caracteres.',
  numeric: 'El campo {field} debe ser un número.'
})

// Switch languages
validator.setLocale('pt-BR')
await validator.validate('', { required: true }, 'email')
console.log(validator.errors().first()) // "O campo email é obrigatório."

validator.setLocale('es')
await validator.validate('', { required: true }, 'email')
console.log(validator.errors().first()) // "El campo email es obligatorio."
```

### Language Switcher Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Multi-language Validation</title>
</head>
<body>
  <div class="language-switcher">
    <h3>Choose Language / Escolha o Idioma / Elige Idioma</h3>
    <button onclick="setLanguage('en')" id="btn-en">🇺🇸 English</button>
    <button onclick="setLanguage('pt-BR')" id="btn-pt">🇧🇷 Português</button>
    <button onclick="setLanguage('es')" id="btn-es">🇪🇸 Español</button>
  </div>

  <form id="form">
    <div>
      <label for="name" data-translate="name_label">Name</label>
      <input type="text" id="name" name="name" placeholder="Enter your name">
      <div class="error" id="name-error"></div>
    </div>

    <div>
      <label for="email" data-translate="email_label">Email</label>
      <input type="email" id="email" name="email" placeholder="Enter your email">
      <div class="error" id="email-error"></div>
    </div>

    <button type="submit" data-translate="submit_button">Submit</button>
  </form>

  <script type="module">
    import { Validator } from 'https://unpkg.com/@vueller/validator/dist/validator.esm.js'

    const validator = new Validator()
    let currentLanguage = 'en'

    // Translation data
    const translations = {
      en: {
        name_label: 'Name',
        email_label: 'Email',
        submit_button: 'Submit'
      },
      'pt-BR': {
        name_label: 'Nome',
        email_label: 'Email',
        submit_button: 'Enviar'
      },
      es: {
        name_label: 'Nombre',
        email_label: 'Correo electrónico',
        submit_button: 'Enviar'
      }
    }

    // Setup validation messages for all languages
    validator.addMessages('en', {
      required: 'The {field} field is required.',
      email: 'Please enter a valid email address.',
      min: 'The {field} must be at least {0} characters.'
    })

    validator.addMessages('pt-BR', {
      required: 'O campo {field} é obrigatório.',
      email: 'Por favor, digite um endereço de email válido.',
      min: 'O {field} deve ter pelo menos {0} caracteres.'
    })

    validator.addMessages('es', {
      required: 'El campo {field} es obligatorio.',
      email: 'Por favor, ingrese una dirección de email válida.',
      min: 'El {field} debe tener al menos {0} caracteres.'
    })

    // Language switching function
    window.setLanguage = function(lang) {
      currentLanguage = lang
      validator.setLocale(lang)
      updateUI()
      updateActiveButton(lang)
      
      // Re-validate if there are errors to update messages
      const hasErrors = validator.errors().any()
      if (hasErrors) {
        validateForm()
      }
    }

    function updateUI() {
      const elements = document.querySelectorAll('[data-translate]')
      elements.forEach(element => {
        const key = element.getAttribute('data-translate')
        if (translations[currentLanguage][key]) {
          if (element.tagName === 'INPUT') {
            element.placeholder = translations[currentLanguage][key]
          } else {
            element.textContent = translations[currentLanguage][key]
          }
        }
      })
    }

    function updateActiveButton(lang) {
      document.querySelectorAll('button[onclick^="setLanguage"]').forEach(btn => {
        btn.style.backgroundColor = btn.id === `btn-${lang}` ? '#007bff' : '#6c757d'
        btn.style.color = 'white'
      })
    }

    async function validateForm() {
      const formData = new FormData(document.getElementById('form'))
      const data = Object.fromEntries(formData.entries())

      const rules = {
        name: { required: true, min: 2 },
        email: { required: true, email: true }
      }

      const isValid = await validator.validateAll(data, rules)
      
      // Update error displays
      Object.keys(rules).forEach(field => {
        const errorElement = document.getElementById(`${field}-error`)
        if (validator.errors().has(field)) {
          errorElement.textContent = validator.errors().first(field)
          errorElement.style.color = 'red'
        } else {
          errorElement.textContent = ''
        }
      })

      return isValid
    }

    // Initialize
    updateActiveButton('en')
    
    // Add form validation
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const isValid = await validateForm()
      
      if (isValid) {
        alert('Form submitted successfully! / Formulário enviado com sucesso! / ¡Formulario enviado exitosamente!')
      }
    })

    // Add blur validation
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('blur', validateForm)
    })
  </script>
</body>
</html>
```

## Advanced Configuration

### Custom Validator Setup

```javascript
class CustomValidator extends Validator {
  constructor(options = {}) {
    super({
      locale: 'en',
      stopOnFirstFailure: false,
      fieldNameFormatter: (fieldName) => {
        // Convert camelCase to readable format
        return fieldName
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replace(/^./, str => str.toUpperCase())
      },
      ...options
    })

    this.setupCustomRules()
    this.setupCustomMessages()
  }

  setupCustomRules() {
    // Add custom validation rules
    this.extend('phone', (value) => {
      if (!value) return true
      return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
    })

    this.extend('cpf', (value) => {
      if (!value) return true
      // CPF validation logic here
      return this.validateCPF(value)
    })
  }

  setupCustomMessages() {
    this.addMessages('en', {
      phone: 'The {field} must be in format (11) 99999-9999.',
      cpf: 'The {field} must be a valid CPF number.'
    })

    this.addMessages('pt-BR', {
      phone: 'O {field} deve estar no formato (11) 99999-9999.',
      cpf: 'O {field} deve ser um CPF válido.'
    })
  }

  validateCPF(value) {
    const cpf = value.replace(/[^\d]/g, '')
    if (cpf.length !== 11) return false
    if (/^(\d)\1+$/.test(cpf)) return false
    
    // CPF algorithm validation
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    return remainder === parseInt(cpf.charAt(10))
  }

  // Helper method for form validation
  async validateFormElement(formElement) {
    const formData = new FormData(formElement)
    const data = Object.fromEntries(formData.entries())
    
    // Extract rules from data attributes
    const rules = {}
    formElement.querySelectorAll('[data-rules]').forEach(input => {
      const fieldName = input.name
      const rulesString = input.dataset.rules
      
      try {
        rules[fieldName] = JSON.parse(rulesString)
      } catch (error) {
        console.warn(`Invalid rules for field ${fieldName}:`, rulesString)
      }
    })

    return await this.validateAll(data, rules)
  }
}

// Usage
const validator = new CustomValidator({ locale: 'pt-BR' })

// Validate with custom rules
const isValid = await validator.validate('11999999999', { phone: true })
console.log(isValid) // false (missing formatting)

const isValidFormatted = await validator.validate('(11) 99999-9999', { phone: true })
console.log(isValidFormatted) // true
```

## Performance Optimization

### Batch Validation

```javascript
const validator = new Validator()

// For large datasets, batch validation
async function validateLargeDataset(dataArray, rules) {
  const batchSize = 100
  const results = []

  for (let i = 0; i < dataArray.length; i += batchSize) {
    const batch = dataArray.slice(i, i + batchSize)
    const batchPromises = batch.map(async (item, index) => {
      const isValid = await validator.validateAll(item, rules)
      return {
        index: i + index,
        data: item,
        isValid,
        errors: isValid ? null : validator.errors().allStatic()
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Clear errors between batches
    validator.errors().clear()
  }

  return results
}

// Usage
const users = [
  { name: 'John', email: 'john@example.com' },
  { name: '', email: 'invalid-email' },
  // ... many more items
]

const rules = {
  name: { required: true },
  email: { required: true, email: true }
}

const validationResults = await validateLargeDataset(users, rules)
console.log(validationResults)
```

### Debounced Validation

```javascript
function createDebouncedValidator(validator, delay = 300) {
  let timeoutId

  return function debouncedValidate(value, rules, fieldName) {
    return new Promise((resolve) => {
      clearTimeout(timeoutId)
      
      timeoutId = setTimeout(async () => {
        const isValid = await validator.validate(value, rules, fieldName)
        resolve(isValid)
      }, delay)
    })
  }
}

// Usage for real-time validation
const validator = new Validator()
const debouncedValidate = createDebouncedValidator(validator, 500)

document.getElementById('email').addEventListener('input', async (e) => {
  const isValid = await debouncedValidate(e.target.value, { email: true }, 'email')
  
  // Update UI based on validation result
  e.target.classList.toggle('invalid', !isValid)
})
```

## Next Steps

- **[DOM Integration →](./dom)** - Learn DOM manipulation patterns
- **[Custom Rules →](./custom-rules)** - Create custom validation rules
- **[Async Validation →](./async)** - Handle asynchronous validation
- **[Examples →](/examples/js/basic)** - See complete JavaScript examples
