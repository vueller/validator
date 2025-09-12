# Custom Rules - JavaScript

Learn how to create and register custom validation rules for JavaScript applications.

## Creating Custom Rules

Custom rules are functions that return `true` for valid values and `false` for invalid ones.

### Basic Custom Rule

```javascript
import { Validator } from '@vueller/validator'

const validator = new Validator()

// Simple custom rule
validator.extend('strongPassword', (value) => {
  if (!value) return true // Optional field
  
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumbers = /\d/.test(value)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
})

// Usage
const isValid = await validator.validate('MyPass123!', { strongPassword: true })
console.log(isValid) // true
```

### Custom Rule with Parameters

```javascript
// Rule with custom parameters
validator.extend('minAge', (value, minAge) => {
  if (!value) return true
  
  const age = parseInt(value)
  return !isNaN(age) && age >= parseInt(minAge)
})

// Usage
const isValid = await validator.validate('25', { minAge: 18 })
console.log(isValid) // true
```

### Async Custom Rule

```javascript
// Async rule for API validation
validator.extend('uniqueEmail', async (value) => {
  if (!value) return true
  
  try {
    const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`)
    const data = await response.json()
    return !data.exists // true if email is available
  } catch (error) {
    console.error('Email check failed:', error)
    return false
  }
})

// Usage
const isValid = await validator.validate('user@example.com', { uniqueEmail: true })
console.log(isValid) // true if email is available
```

## Cross-Field Validation

Validate fields based on other field values:

```javascript
// Password confirmation rule
validator.extend('confirmed', (value, targetField, formData) => {
  if (!value) return true
  
  return value === formData[targetField]
})

// Usage with form data
const formData = {
  password: 'mypassword123',
  confirmPassword: 'mypassword123'
}

const rules = {
  password: { required: true, min: 8 },
  confirmPassword: { required: true, confirmed: 'password' }
}

const isValid = await validator.validateAll(formData, rules)
console.log(isValid) // true
```

## Custom Error Messages

Add custom error messages for your rules:

```javascript
// Add custom messages
validator.addMessages('en', {
  'strongPassword': 'Password must contain uppercase, lowercase, number, and special character',
  'minAge': 'You must be at least :minAge years old',
  'uniqueEmail': 'This email address is already taken',
  'confirmed': 'Password confirmation does not match'
})

// Usage with custom message
const isValid = await validator.validate('weak', { strongPassword: true })
if (!isValid) {
  console.log(validator.errors().first()) // "Password must contain uppercase, lowercase, number, and special character"
}
```

## Advanced Examples

### Brazilian CPF Validation

```javascript
validator.extend('cpf', (value) => {
  if (!value) return true
  
  // Remove non-digits
  const cpf = value.replace(/\D/g, '')
  
  // Check length
  if (cpf.length !== 11) return false
  
  // Check for invalid sequences
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  // Validate check digits
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
  if (remainder !== parseInt(cpf.charAt(10))) return false
  
  return true
})

// Usage
const isValid = await validator.validate('123.456.789-09', { cpf: true })
```

### Credit Card Validation

```javascript
validator.extend('creditCard', (value) => {
  if (!value) return true
  
  // Remove spaces and dashes
  const cardNumber = value.replace(/[\s-]/g, '')
  
  // Check if it's all digits and proper length
  if (!/^\d{13,19}$/.test(cardNumber)) return false
  
  // Luhn algorithm
  let sum = 0
  let isEven = false
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
})

// Usage
const isValid = await validator.validate('4532 1234 5678 9012', { creditCard: true })
```

### File Upload Validation

```javascript
validator.extend('fileSize', (file, maxSizeKB) => {
  if (!file) return true
  
  const maxSizeBytes = parseInt(maxSizeKB) * 1024
  return file.size <= maxSizeBytes
})

validator.extend('fileType', (file, allowedTypes) => {
  if (!file) return true
  
  const allowedArray = allowedTypes.split(',').map(type => type.trim())
  return allowedArray.includes(file.type)
})

// Usage with file input
const fileInput = document.getElementById('fileInput')
const file = fileInput.files[0]

const isValid = await validator.validate(file, { 
  fileSize: 1024, // 1MB max
  fileType: 'image/jpeg,image/png,image/gif'
})
```

## Rule Registration Patterns

### Global Rule Registration

```javascript
// Register rules globally for reuse
const globalRules = {
  cpf: (value) => { /* CPF validation logic */ },
  cnpj: (value) => { /* CNPJ validation logic */ },
  phone: (value) => { /* Phone validation logic */ }
}

// Register all rules at once
Object.entries(globalRules).forEach(([name, rule]) => {
  validator.extend(name, rule)
})
```

### Conditional Rule Registration

```javascript
// Register rules based on environment or configuration
const config = {
  enableApiValidation: true,
  enableFileValidation: true
}

if (config.enableApiValidation) {
  validator.extend('uniqueEmail', async (value) => {
    // API validation logic
  })
}

if (config.enableFileValidation) {
  validator.extend('fileSize', (file, maxSize) => {
    // File validation logic
  })
}
```

## Error Handling

### Custom Error Messages with Parameters

```javascript
validator.extend('between', (value, min, max) => {
  if (!value) return true
  
  const num = parseFloat(value)
  return !isNaN(num) && num >= parseFloat(min) && num <= parseFloat(max)
})

// Add parameterized messages
validator.addMessages('en', {
  'between': 'The field must be between :min and :max'
})

// Usage
const isValid = await validator.validate('15', { between: [10, 20] })
if (!isValid) {
  console.log(validator.errors().first()) // "The field must be between 10 and 20"
}
```

### Rule-Specific Error Handling

```javascript
validator.extend('apiCheck', async (value) => {
  try {
    const response = await fetch(`/api/validate/${value}`)
    return response.ok
  } catch (error) {
    // Log error but don't fail validation
    console.warn('API check failed:', error)
    return true // Allow validation to pass if API is down
  }
})
```

## Testing Custom Rules

### Unit Testing

```javascript
// Test your custom rules
describe('Custom Rules', () => {
  test('strongPassword rule', async () => {
    const validator = new Validator()
    validator.extend('strongPassword', (value) => {
      // Your rule logic
    })
    
    expect(await validator.validate('StrongPass123!', { strongPassword: true })).toBe(true)
    expect(await validator.validate('weak', { strongPassword: true })).toBe(false)
  })
  
  test('minAge rule with parameters', async () => {
    const validator = new Validator()
    validator.extend('minAge', (value, minAge) => {
      return parseInt(value) >= parseInt(minAge)
    })
    
    expect(await validator.validate('25', { minAge: 18 })).toBe(true)
    expect(await validator.validate('16', { minAge: 18 })).toBe(false)
  })
})
```

## Best Practices

### 1. Keep Rules Pure
```javascript
// ✅ Good - Pure function
validator.extend('email', (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
})

// ❌ Avoid - Side effects
validator.extend('email', (value) => {
  console.log('Validating email:', value) // Side effect
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
})
```

### 2. Handle Edge Cases
```javascript
validator.extend('positiveNumber', (value) => {
  if (!value) return true // Optional field
  if (value === '') return true // Empty string
  if (value === null || value === undefined) return true // Null/undefined
  
  const num = parseFloat(value)
  return !isNaN(num) && num > 0
})
```

### 3. Use Descriptive Names
```javascript
// ✅ Good - Clear and descriptive
validator.extend('brazilianPhone', (value) => { /* ... */ })
validator.extend('creditCardNumber', (value) => { /* ... */ })

// ❌ Avoid - Vague names
validator.extend('check1', (value) => { /* ... */ })
validator.extend('validate', (value) => { /* ... */ })
```

### 4. Document Your Rules
```javascript
/**
 * Validates Brazilian CPF (Cadastro de Pessoa Física)
 * @param {string} value - CPF number (with or without formatting)
 * @returns {boolean} - True if valid CPF
 */
validator.extend('cpf', (value) => {
  // Implementation...
})
```

## Next Steps

- **[Core Usage →](./core)** - Learn more about the core Validator API
- **[DOM Integration →](./dom)** - Advanced DOM validation patterns
- **[Examples →](../../examples/)** - See custom rules in action

Ready to create powerful custom validation rules? Start building! 🚀
