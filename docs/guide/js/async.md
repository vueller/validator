# Async Validation - JavaScript

Learn how to handle asynchronous validation with API calls, file uploads, and other async operations.

## Basic Async Validation

Async validation is essential for real-world applications where you need to validate against external data sources.

### Simple Async Rule

```javascript
import { Validator } from '@vueller/validator'

const validator = new Validator()

// Async rule for email uniqueness
validator.extend('uniqueEmail', async (value) => {
  if (!value) return true // Optional field
  
  try {
    const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`)
    const data = await response.json()
    return !data.exists // true if email is available
  } catch (error) {
    console.error('Email check failed:', error)
    return false // Fail validation if API is down
  }
})

// Usage
const isValid = await validator.validate('user@example.com', { uniqueEmail: true })
console.log(isValid) // true if email is available
```

### Async Rule with Parameters

```javascript
// Async rule with custom parameters
validator.extend('uniqueInTable', async (value, tableName, columnName) => {
  if (!value) return true
  
  try {
    const response = await fetch(`/api/check-unique`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: tableName,
        column: columnName,
        value: value
      })
    })
    
    const data = await response.json()
    return !data.exists
  } catch (error) {
    return false
  }
})

// Usage
const isValid = await validator.validate('john_doe', { 
  uniqueInTable: ['users', 'username'] 
})
```

## Form-Level Async Validation

### Validate Entire Form with Async Rules

```javascript
const formData = {
  email: 'user@example.com',
  username: 'john_doe',
  phone: '+1234567890'
}

const rules = {
  email: { required: true, email: true, uniqueEmail: true },
  username: { required: true, min: 3, uniqueInTable: ['users', 'username'] },
  phone: { required: true, phone: true, uniqueInTable: ['users', 'phone'] }
}

// Validate all fields with async rules
const isValid = await validator.validateAll(formData, rules)

if (isValid) {
  console.log('All validations passed!')
} else {
  console.log('Validation errors:', validator.errors().all())
}
```

### Progressive Validation

```javascript
// Validate fields one by one as user types
const validateField = async (fieldName, value, fieldRules) => {
  try {
    const isValid = await validator.validate(value, fieldRules, fieldName)
    
    // Update UI based on result
    const field = document.querySelector(`[name="${fieldName}"]`)
    if (field) {
      field.classList.remove('valid', 'invalid')
      field.classList.add(isValid ? 'valid' : 'invalid')
      
      const errorElement = document.getElementById(`${fieldName}-error`)
      if (errorElement) {
        errorElement.textContent = isValid ? '' : validator.errors().first(fieldName)
      }
    }
    
    return isValid
  } catch (error) {
    console.error(`Validation failed for ${fieldName}:`, error)
    return false
  }
}

// Usage with input events
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('blur', async () => {
    const fieldRules = rules[input.name]
    if (fieldRules) {
      await validateField(input.name, input.value, fieldRules)
    }
  })
})
```

## Advanced Async Patterns

### Debounced Async Validation

```javascript
// Debounce async validation to avoid excessive API calls
const debouncedValidation = (() => {
  let timeoutId
  
  return (fieldName, value, fieldRules, delay = 500) => {
    clearTimeout(timeoutId)
    
    timeoutId = setTimeout(async () => {
      await validateField(fieldName, value, fieldRules)
    }, delay)
  }
})()

// Usage with input events
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    const fieldRules = rules[input.name]
    if (fieldRules) {
      debouncedValidation(input.name, input.value, fieldRules)
    }
  })
})
```

### Parallel Async Validation

```javascript
// Validate multiple fields in parallel for better performance
const validateFieldsParallel = async (formData, rules) => {
  const validationPromises = Object.entries(rules).map(async ([fieldName, fieldRules]) => {
    const value = formData[fieldName]
    const isValid = await validator.validate(value, fieldRules, fieldName)
    return { fieldName, isValid, errors: validator.errors().get(fieldName) }
  })
  
  const results = await Promise.all(validationPromises)
  
  // Process results
  const allValid = results.every(result => result.isValid)
  const errors = results.reduce((acc, result) => {
    if (!result.isValid) {
      acc[result.fieldName] = result.errors
    }
    return acc
  }, {})
  
  return { allValid, errors }
}

// Usage
const { allValid, errors } = await validateFieldsParallel(formData, rules)
```

### Async Validation with Loading States

```javascript
// Track validation state for better UX
const validationState = {
  loading: new Set(),
  errors: {},
  valid: new Set()
}

const validateWithLoading = async (fieldName, value, fieldRules) => {
  // Set loading state
  validationState.loading.add(fieldName)
  updateFieldUI(fieldName, 'loading')
  
  try {
    const isValid = await validator.validate(value, fieldRules, fieldName)
    
    // Update state
    validationState.loading.delete(fieldName)
    if (isValid) {
      validationState.valid.add(fieldName)
      validationState.errors[fieldName] = []
    } else {
      validationState.valid.delete(fieldName)
      validationState.errors[fieldName] = validator.errors().get(fieldName)
    }
    
    updateFieldUI(fieldName, isValid ? 'valid' : 'invalid')
  } catch (error) {
    validationState.loading.delete(fieldName)
    validationState.valid.delete(fieldName)
    validationState.errors[fieldName] = ['Validation failed']
    updateFieldUI(fieldName, 'error')
  }
}

const updateFieldUI = (fieldName, state) => {
  const field = document.querySelector(`[name="${fieldName}"]`)
  const errorElement = document.getElementById(`${fieldName}-error`)
  const loadingElement = document.getElementById(`${fieldName}-loading`)
  
  if (!field) return
  
  // Remove all state classes
  field.classList.remove('valid', 'invalid', 'loading')
  
  // Add current state class
  if (state !== 'loading') {
    field.classList.add(state)
  }
  
  // Update error message
  if (errorElement) {
    if (state === 'valid') {
      errorElement.textContent = ''
    } else if (state === 'invalid') {
      errorElement.textContent = validationState.errors[fieldName]?.[0] || ''
    } else if (state === 'error') {
      errorElement.textContent = 'Validation failed'
    }
  }
  
  // Update loading indicator
  if (loadingElement) {
    loadingElement.style.display = state === 'loading' ? 'block' : 'none'
  }
}
```

## Real-World Examples

### User Registration Form

```javascript
// Complete registration form with async validation
const registrationForm = {
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
}

const registrationRules = {
  email: { 
    required: true, 
    email: true, 
    uniqueEmail: true 
  },
  username: { 
    required: true, 
    min: 3, 
    max: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    uniqueUsername: true 
  },
  password: { 
    required: true, 
    min: 8,
    strongPassword: true 
  },
  confirmPassword: { 
    required: true, 
    confirmed: 'password' 
  }
}

// Custom async rules
validator.extend('uniqueEmail', async (value) => {
  if (!value) return true
  
  const response = await fetch('/api/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: value })
  })
  
  const data = await response.json()
  return !data.exists
})

validator.extend('uniqueUsername', async (value) => {
  if (!value) return true
  
  const response = await fetch('/api/check-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: value })
  })
  
  const data = await response.json()
  return !data.exists
})

// Form submission handler
const handleRegistration = async (e) => {
  e.preventDefault()
  
  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData.entries())
  
  // Show loading state
  const submitButton = e.target.querySelector('button[type="submit"]')
  const originalText = submitButton.textContent
  submitButton.textContent = 'Creating Account...'
  submitButton.disabled = true
  
  try {
    const isValid = await validator.validateAll(data, registrationRules)
    
    if (isValid) {
      // Submit to server
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        alert('Account created successfully!')
        e.target.reset()
      } else {
        throw new Error('Registration failed')
      }
    } else {
      // Show validation errors
      const errors = validator.errors().all()
      alert('Please fix the following errors:\n' + errors.join('\n'))
    }
  } catch (error) {
    console.error('Registration error:', error)
    alert('Registration failed. Please try again.')
  } finally {
    // Reset button state
    submitButton.textContent = originalText
    submitButton.disabled = false
  }
}
```

### File Upload Validation

```javascript
// Async file validation
validator.extend('fileSize', async (file, maxSizeKB) => {
  if (!file) return true
  
  const maxSizeBytes = parseInt(maxSizeKB) * 1024
  return file.size <= maxSizeBytes
})

validator.extend('fileType', async (file, allowedTypes) => {
  if (!file) return true
  
  const allowedArray = allowedTypes.split(',').map(type => type.trim())
  return allowedArray.includes(file.type)
})

validator.extend('imageDimensions', async (file, maxWidth, maxHeight) => {
  if (!file || !file.type.startsWith('image/')) return true
  
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve(img.width <= maxWidth && img.height <= maxHeight)
    }
    img.onerror = () => resolve(false)
    img.src = URL.createObjectURL(file)
  })
})

// File upload handler
const handleFileUpload = async (fileInput) => {
  const file = fileInput.files[0]
  if (!file) return
  
  const rules = {
    fileSize: 2048, // 2MB max
    fileType: 'image/jpeg,image/png,image/gif',
    imageDimensions: [1920, 1080] // Max 1920x1080
  }
  
  try {
    const isValid = await validator.validate(file, rules)
    
    if (isValid) {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('File uploaded:', result.url)
      }
    } else {
      const errors = validator.errors().all()
      alert('File validation failed:\n' + errors.join('\n'))
    }
  } catch (error) {
    console.error('Upload failed:', error)
    alert('Upload failed. Please try again.')
  }
}
```

## Error Handling Strategies

### Graceful Degradation

```javascript
// Fallback validation when API is unavailable
validator.extend('uniqueEmail', async (value) => {
  if (!value) return true
  
  try {
    const response = await fetch('/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: value })
    })
    
    if (!response.ok) {
      throw new Error('API unavailable')
    }
    
    const data = await response.json()
    return !data.exists
  } catch (error) {
    console.warn('Email uniqueness check failed, using fallback:', error)
    
    // Fallback: basic email format validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
})
```

### Retry Logic

```javascript
// Retry failed async validations
const validateWithRetry = async (value, rules, fieldName, maxRetries = 3) => {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const isValid = await validator.validate(value, rules, fieldName)
      return isValid
    } catch (error) {
      lastError = error
      console.warn(`Validation attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  throw lastError
}
```

## Performance Optimization

### Caching Async Results

```javascript
// Cache validation results to avoid repeated API calls
const validationCache = new Map()

const cachedValidation = async (cacheKey, validationFn) => {
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey)
  }
  
  const result = await validationFn()
  validationCache.set(cacheKey, result)
  
  // Clear cache after 5 minutes
  setTimeout(() => {
    validationCache.delete(cacheKey)
  }, 5 * 60 * 1000)
  
  return result
}

// Usage
validator.extend('uniqueEmail', async (value) => {
  if (!value) return true
  
  const cacheKey = `email:${value}`
  
  return await cachedValidation(cacheKey, async () => {
    const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`)
    const data = await response.json()
    return !data.exists
  })
})
```

## Testing Async Validation

### Unit Testing Async Rules

```javascript
// Test async validation rules
describe('Async Validation', () => {
  beforeEach(() => {
    // Mock fetch for tests
    global.fetch = jest.fn()
  })
  
  afterEach(() => {
    global.fetch.mockRestore()
  })
  
  test('uniqueEmail rule with API success', async () => {
    const validator = new Validator()
    
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exists: false })
    })
    
    validator.extend('uniqueEmail', async (value) => {
      const response = await fetch('/api/check-email')
      const data = await response.json()
      return !data.exists
    })
    
    const isValid = await validator.validate('test@example.com', { uniqueEmail: true })
    expect(isValid).toBe(true)
  })
  
  test('uniqueEmail rule with API failure', async () => {
    const validator = new Validator()
    
    // Mock API failure
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    
    validator.extend('uniqueEmail', async (value) => {
      try {
        const response = await fetch('/api/check-email')
        const data = await response.json()
        return !data.exists
      } catch (error) {
        return false // Fail validation on API error
      }
    })
    
    const isValid = await validator.validate('test@example.com', { uniqueEmail: true })
    expect(isValid).toBe(false)
  })
})
```

## Best Practices

### 1. Handle Network Failures
```javascript
// Always handle network failures gracefully
validator.extend('apiCheck', async (value) => {
  try {
    const response = await fetch('/api/check')
    return response.ok
  } catch (error) {
    // Decide: fail validation or allow it to pass
    return false // Fail validation if API is down
  }
})
```

### 2. Use Timeouts
```javascript
// Add timeout to prevent hanging requests
const validateWithTimeout = async (value, rules, timeout = 5000) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Validation timeout')), timeout)
  })
  
  const validationPromise = validator.validate(value, rules)
  
  return Promise.race([validationPromise, timeoutPromise])
}
```

### 3. Provide User Feedback
```javascript
// Show loading states and progress
const validateWithFeedback = async (fieldName, value, rules) => {
  showLoadingState(fieldName)
  
  try {
    const isValid = await validator.validate(value, rules, fieldName)
    showValidationResult(fieldName, isValid)
    return isValid
  } catch (error) {
    showErrorState(fieldName, 'Validation failed')
    return false
  } finally {
    hideLoadingState(fieldName)
  }
}
```

## Next Steps

- **[Custom Rules →](./custom-rules)** - Learn about creating custom validation rules
- **[Core Usage →](./core)** - Master the core Validator API
- **[Examples →](../../examples/)** - See async validation in action

Ready to build robust async validation? Start implementing! 🚀
