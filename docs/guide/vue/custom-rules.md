# Custom Rules in Vue

Create powerful custom validation rules that integrate seamlessly with Vue 3's reactivity system and your application logic.

## Creating Custom Rules

### Basic Custom Rule

```vue
<template>
  <ValidatorForm v-model="formData" :rules="rules">
    <div class="form-group">
      <label for="username">Username</label>
      <input 
        id="username"
        v-model="formData.username"
        name="username"
        placeholder="Enter username (no spaces allowed)"
      />
    </div>

    <div class="form-group">
      <label for="cpf">CPF</label>
      <input 
        id="cpf"
        v-model="formData.cpf"
        name="cpf"
        placeholder="000.000.000-00"
      />
    </div>
  </ValidatorForm>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const globalValidator = inject(ValidatorSymbol)

const formData = ref({
  username: '',
  cpf: ''
})

const rules = {
  username: { required: true, noSpaces: true },
  cpf: { required: true, cpf: true }
}

onMounted(() => {
  // Register the noSpaces rule
  globalValidator.extend('noSpaces', (value) => {
    if (!value) return true // Optional fields
    return !/\s/.test(value) // No whitespace characters
  })

  // Register CPF validation rule
  globalValidator.extend('cpf', (value) => {
    if (!value) return true

    // Remove non-numeric characters
    const cpf = value.replace(/[^\d]/g, '')

    // Check length
    if (cpf.length !== 11) return false

    // Check for repeated digits
    if (/^(\d)\1+$/.test(cpf)) return false

    // Validate CPF algorithm
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

  // Add custom error messages
  globalValidator.addMessages('en', {
    noSpaces: 'The {field} cannot contain spaces.',
    cpf: 'The {field} must be a valid CPF number.'
  })

  globalValidator.addMessages('pt-BR', {
    noSpaces: 'O {field} não pode conter espaços.',
    cpf: 'O {field} deve ser um CPF válido.'
  })
})
</script>
```

## Advanced Custom Rules

### Rule with Parameters

```vue
<template>
  <ValidatorForm v-model="formData" :rules="rules">
    <div class="form-group">
      <label for="birthDate">Birth Date</label>
      <input 
        id="birthDate"
        v-model="formData.birthDate"
        name="birthDate"
        type="date"
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input 
        id="password"
        v-model="formData.password"
        name="password"
        type="password"
        placeholder="Must contain uppercase, lowercase, number and symbol"
      />
    </div>
  </ValidatorForm>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const globalValidator = inject(ValidatorSymbol)

const formData = ref({
  birthDate: '',
  password: ''
})

const rules = {
  birthDate: { required: true, minAge: 18 },
  password: { 
    required: true, 
    min: 8,
    complexity: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    }
  }
}

onMounted(() => {
  // Minimum age rule
  globalValidator.extend('minAge', (value, params) => {
    if (!value) return true

    const birthDate = new Date(value)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age >= params
  })

  // Password complexity rule
  globalValidator.extend('complexity', (value, params) => {
    if (!value) return true

    const tests = {
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      numbers: /\d/.test(value),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
    }

    for (const [requirement, enabled] of Object.entries(params)) {
      if (enabled && !tests[requirement]) {
        return false
      }
    }

    return true
  })

  // Add messages with parameter support
  globalValidator.addMessages('en', {
    minAge: 'You must be at least {0} years old.',
    complexity: 'Password must meet complexity requirements.'
  })

  globalValidator.addMessages('pt-BR', {
    minAge: 'Você deve ter pelo menos {0} anos.',
    complexity: 'A senha deve atender aos requisitos de complexidade.'
  })
})
</script>
```

### Async Custom Rules

For rules that need to make API calls:

```vue
<template>
  <ValidatorForm v-model="formData" :rules="rules">
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        id="email"
        v-model="formData.email"
        name="email"
        type="email"
        placeholder="Enter your email"
      />
      <!-- Show loading indicator during async validation -->
      <div v-if="isValidatingEmail" class="validation-loading">
        Checking email availability...
      </div>
    </div>

    <div class="form-group">
      <label for="username">Username</label>
      <input 
        id="username"
        v-model="formData.username"
        name="username"
        placeholder="Choose a username"
      />
      <div v-if="isValidatingUsername" class="validation-loading">
        Checking username availability...
      </div>
    </div>
  </ValidatorForm>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const globalValidator = inject(ValidatorSymbol)

const formData = ref({
  email: '',
  username: ''
})

const rules = {
  email: { required: true, email: true, uniqueEmail: true },
  username: { required: true, min: 3, uniqueUsername: true }
}

// Loading states for async validations
const isValidatingEmail = ref(false)
const isValidatingUsername = ref(false)

// Mock API functions
const checkEmailAvailable = async (email) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock logic: emails ending with 'taken' are not available
  return !email.endsWith('taken@example.com')
}

const checkUsernameAvailable = async (username) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Mock logic: certain usernames are taken
  const takenUsernames = ['admin', 'root', 'user', 'test']
  return !takenUsernames.includes(username.toLowerCase())
}

onMounted(() => {
  // Unique email rule
  globalValidator.extend('uniqueEmail', async (value) => {
    if (!value) return true

    // Basic email format check first
    if (!/\S+@\S+\.\S+/.test(value)) return true

    isValidatingEmail.value = true
    try {
      const isAvailable = await checkEmailAvailable(value)
      return isAvailable
    } catch (error) {
      console.error('Email validation error:', error)
      return true // Don't fail validation due to network errors
    } finally {
      isValidatingEmail.value = false
    }
  })

  // Unique username rule
  globalValidator.extend('uniqueUsername', async (value) => {
    if (!value || value.length < 3) return true

    isValidatingUsername.value = true
    try {
      const isAvailable = await checkUsernameAvailable(value)
      return isAvailable
    } catch (error) {
      console.error('Username validation error:', error)
      return true
    } finally {
      isValidatingUsername.value = false
    }
  })

  // Add error messages
  globalValidator.addMessages('en', {
    uniqueEmail: 'This email address is already taken.',
    uniqueUsername: 'This username is already taken.'
  })

  globalValidator.addMessages('pt-BR', {
    uniqueEmail: 'Este endereço de email já está em uso.',
    uniqueUsername: 'Este nome de usuário já está em uso.'
  })
})
</script>

<style scoped>
.validation-loading {
  color: #f59e0b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-style: italic;
}
</style>
```

## Cross-Field Validation

Rules that depend on other form fields:

```vue
<template>
  <ValidatorForm v-model="formData" :rules="rules">
    <div class="form-group">
      <label for="password">Password</label>
      <input 
        id="password"
        v-model="formData.password"
        name="password"
        type="password"
        placeholder="Enter password"
      />
    </div>

    <div class="form-group">
      <label for="confirmPassword">Confirm Password</label>
      <input 
        id="confirmPassword"
        v-model="formData.confirmPassword"
        name="confirmPassword"
        type="password"
        placeholder="Confirm your password"
      />
    </div>

    <div class="form-group">
      <label for="currentPassword">Current Password</label>
      <input 
        id="currentPassword"
        v-model="formData.currentPassword"
        name="currentPassword"
        type="password"
        placeholder="Enter current password"
      />
    </div>
  </ValidatorForm>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const globalValidator = inject(ValidatorSymbol)

const formData = ref({
  password: '',
  confirmPassword: '',
  currentPassword: ''
})

const rules = {
  password: { required: true, min: 8 },
  confirmPassword: { required: true, confirmed: 'password' },
  currentPassword: { required: true, different: 'password' }
}

onMounted(() => {
  // Confirmed rule (password confirmation)
  globalValidator.extend('confirmed', (value, fieldName, formData) => {
    if (!value) return true
    
    const targetValue = formData[fieldName]
    return value === targetValue
  })

  // Different rule (must be different from another field)
  globalValidator.extend('different', (value, fieldName, formData) => {
    if (!value) return true
    
    const targetValue = formData[fieldName]
    return value !== targetValue
  })

  // Add error messages
  globalValidator.addMessages('en', {
    confirmed: 'The {field} confirmation does not match.',
    different: 'The {field} must be different from {0}.'
  })

  globalValidator.addMessages('pt-BR', {
    confirmed: 'A confirmação de {field} não confere.',
    different: 'O {field} deve ser diferente de {0}.'
  })
})

// Re-validate confirmation when password changes
watch(() => formData.value.password, () => {
  if (formData.value.confirmPassword) {
    globalValidator.validateField('confirmPassword', formData.value.confirmPassword, formData.value)
  }
})
</script>
```

## Conditional Rules

Rules that apply based on certain conditions:

```vue
<template>
  <ValidatorForm v-model="formData" :rules="conditionalRules">
    <div class="form-group">
      <label>
        <input 
          v-model="formData.hasCompany"
          name="hasCompany"
          type="checkbox"
        />
        I represent a company
      </label>
    </div>

    <div v-if="formData.hasCompany" class="form-group">
      <label for="companyName">Company Name</label>
      <input 
        id="companyName"
        v-model="formData.companyName"
        name="companyName"
        placeholder="Enter company name"
      />
    </div>

    <div v-if="formData.hasCompany" class="form-group">
      <label for="cnpj">CNPJ</label>
      <input 
        id="cnpj"
        v-model="formData.cnpj"
        name="cnpj"
        placeholder="00.000.000/0000-00"
      />
    </div>

    <div class="form-group">
      <label for="age">Age</label>
      <input 
        id="age"
        v-model="formData.age"
        name="age"
        type="number"
        placeholder="Enter your age"
      />
    </div>

    <div v-if="parseInt(formData.age) < 18" class="form-group">
      <label for="parentEmail">Parent's Email</label>
      <input 
        id="parentEmail"
        v-model="formData.parentEmail"
        name="parentEmail"
        type="email"
        placeholder="Parent's email (required for minors)"
      />
    </div>
  </ValidatorForm>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const globalValidator = inject(ValidatorSymbol)

const formData = ref({
  hasCompany: false,
  companyName: '',
  cnpj: '',
  age: '',
  parentEmail: ''
})

// Conditional rules based on form state
const conditionalRules = computed(() => {
  const rules = {
    age: { required: true, numeric: true, min: 1, max: 120 }
  }

  if (formData.value.hasCompany) {
    rules.companyName = { required: true, min: 2, max: 100 }
    rules.cnpj = { required: true, cnpj: true }
  }

  if (parseInt(formData.value.age) < 18) {
    rules.parentEmail = { required: true, email: true }
  }

  return rules
})

onMounted(() => {
  // CNPJ validation rule
  globalValidator.extend('cnpj', (value) => {
    if (!value) return true

    // Remove non-numeric characters
    const cnpj = value.replace(/[^\d]/g, '')

    // Check length
    if (cnpj.length !== 14) return false

    // Check for repeated digits
    if (/^(\d)\1+$/.test(cnpj)) return false

    // Validate CNPJ algorithm
    let size = cnpj.length - 2
    let numbers = cnpj.substring(0, size)
    let digits = cnpj.substring(size)
    let sum = 0
    let pos = size - 7

    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--
      if (pos < 2) pos = 9
    }

    let result = sum % 11 < 2 ? 0 : 11 - sum % 11
    if (result !== parseInt(digits.charAt(0))) return false

    size = size + 1
    numbers = cnpj.substring(0, size)
    sum = 0
    pos = size - 7

    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--
      if (pos < 2) pos = 9
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11
    if (result !== parseInt(digits.charAt(1))) return false

    return true
  })

  // Add error messages
  globalValidator.addMessages('en', {
    cnpj: 'The {field} must be a valid CNPJ number.'
  })

  globalValidator.addMessages('pt-BR', {
    cnpj: 'O {field} deve ser um CNPJ válido.'
  })
})
</script>
```

## Rule Composition

Combine multiple rules for complex validation:

```vue
<script setup>
import { ref, inject, onMounted } from 'vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const globalValidator = inject(ValidatorSymbol)

onMounted(() => {
  // Compose multiple validation concerns
  globalValidator.extend('strongPassword', (value) => {
    if (!value) return true

    const tests = [
      { test: value.length >= 12, message: 'at least 12 characters' },
      { test: /[A-Z]/.test(value), message: 'an uppercase letter' },
      { test: /[a-z]/.test(value), message: 'a lowercase letter' },
      { test: /\d/.test(value), message: 'a number' },
      { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value), message: 'a special character' },
      { test: !/(.)\1{2,}/.test(value), message: 'no repeated characters (3+)' },
      { test: !/password|123456|qwerty/i.test(value), message: 'no common patterns' }
    ]

    const failedTests = tests.filter(t => !t.test)
    
    if (failedTests.length > 0) {
      // Store detailed error information
      globalValidator._lastPasswordErrors = failedTests.map(t => t.message)
      return false
    }

    return true
  })

  // Brazilian phone number validation
  globalValidator.extend('brPhone', (value) => {
    if (!value) return true

    // Remove all non-numeric characters
    const phone = value.replace(/[^\d]/g, '')

    // Check for valid lengths (10 or 11 digits)
    if (phone.length !== 10 && phone.length !== 11) return false

    // Check area code (first 2 digits should be valid)
    const areaCode = parseInt(phone.substring(0, 2))
    const validAreaCodes = [
      11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
      21, 22, 24, // RJ
      27, 28, // ES
      31, 32, 33, 34, 35, 37, 38, // MG
      41, 42, 43, 44, 45, 46, // PR
      47, 48, 49, // SC
      51, 53, 54, 55, // RS
      61, // DF
      62, 64, // GO
      63, // TO
      65, 66, // MT
      67, // MS
      68, // AC
      69, // RO
      71, 73, 74, 75, 77, // BA
      79, // SE
      81, 87, // PE
      82, // AL
      83, // PB
      84, // RN
      85, 88, // CE
      86, 89, // PI
      91, 93, 94, // PA
      92, 97, // AM
      95, // RR
      96, // AP
      98, 99 // MA
    ]

    if (!validAreaCodes.includes(areaCode)) return false

    // For mobile phones (11 digits), the third digit should be 9
    if (phone.length === 11 && phone.charAt(2) !== '9') return false

    return true
  })

  // Credit card validation using Luhn algorithm
  globalValidator.extend('creditCard', (value) => {
    if (!value) return true

    const number = value.replace(/[^\d]/g, '')
    
    if (number.length < 13 || number.length > 19) return false

    let sum = 0
    let isEven = false

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i))

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

  // Add comprehensive error messages
  globalValidator.addMessages('en', {
    strongPassword: 'Password must contain {0}.',
    brPhone: 'Please enter a valid Brazilian phone number.',
    creditCard: 'Please enter a valid credit card number.'
  })

  globalValidator.addMessages('pt-BR', {
    strongPassword: 'A senha deve conter {0}.',
    brPhone: 'Digite um número de telefone brasileiro válido.',
    creditCard: 'Digite um número de cartão de crédito válido.'
  })
})
</script>
```

## Custom Rule Utilities

Create reusable rule utilities:

```javascript
// utils/validationRules.js
export const createRegexRule = (pattern, message) => {
  return (value) => {
    if (!value) return true
    return pattern.test(value)
  }
}

export const createLengthRule = (min, max) => {
  return (value) => {
    if (!value) return true
    return value.length >= min && value.length <= max
  }
}

export const createRangeRule = (min, max) => {
  return (value) => {
    if (!value) return true
    const num = parseFloat(value)
    return !isNaN(num) && num >= min && num <= max
  }
}

export const createAsyncUniqueRule = (checkFunction, errorMessage) => {
  return async (value) => {
    if (!value) return true
    
    try {
      return await checkFunction(value)
    } catch (error) {
      console.error('Async validation error:', error)
      return true // Don't fail on network errors
    }
  }
}

// Brazilian document validators
export const brazilianDocuments = {
  cpf: (value) => {
    if (!value) return true
    
    const cpf = value.replace(/[^\d]/g, '')
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
    
    // CPF validation algorithm implementation...
    return true
  },
  
  cnpj: (value) => {
    if (!value) return true
    
    const cnpj = value.replace(/[^\d]/g, '')
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
    
    // CNPJ validation algorithm implementation...
    return true
  }
}
```

Usage:

```vue
<script setup>
import { createRegexRule, createRangeRule, brazilianDocuments } from '@/utils/validationRules'

onMounted(() => {
  // Register utility-created rules
  globalValidator.extend('slug', createRegexRule(
    /^[a-z0-9-]+$/,
    'Only lowercase letters, numbers, and hyphens allowed'
  ))

  globalValidator.extend('score', createRangeRule(0, 100))
  
  globalValidator.extend('cpf', brazilianDocuments.cpf)
  globalValidator.extend('cnpj', brazilianDocuments.cnpj)
})
</script>
```

## Best Practices

### 1. Keep Rules Focused

```javascript
// ✅ Good: Single responsibility
globalValidator.extend('cpf', validateCPF)
globalValidator.extend('cnpj', validateCNPJ)

// ❌ Avoid: Multiple responsibilities
globalValidator.extend('brazilianDocument', (value, type) => {
  if (type === 'cpf') return validateCPF(value)
  if (type === 'cnpj') return validateCNPJ(value)
})
```

### 2. Handle Edge Cases

```javascript
globalValidator.extend('customRule', (value) => {
  // Always handle empty/null values first
  if (!value) return true
  
  // Handle different data types
  if (typeof value !== 'string') {
    value = String(value)
  }
  
  // Your validation logic
  return true
})
```

### 3. Provide Clear Error Messages

```javascript
// ✅ Good: Specific, actionable messages
globalValidator.addMessages('en', {
  strongPassword: 'Password must be at least 12 characters with uppercase, lowercase, number, and symbol.',
  uniqueEmail: 'This email is already registered. Please use a different email or login instead.'
})

// ❌ Avoid: Vague messages
globalValidator.addMessages('en', {
  strongPassword: 'Invalid password.',
  uniqueEmail: 'Email error.'
})
```

### 4. Test Custom Rules

```javascript
// tests/validation-rules.test.js
import { brazilianDocuments } from '@/utils/validationRules'

describe('Brazilian Document Validation', () => {
  test('validates correct CPF', () => {
    expect(brazilianDocuments.cpf('123.456.789-09')).toBe(true)
  })

  test('rejects invalid CPF', () => {
    expect(brazilianDocuments.cpf('123.456.789-00')).toBe(false)
  })

  test('handles empty values', () => {
    expect(brazilianDocuments.cpf('')).toBe(true)
    expect(brazilianDocuments.cpf(null)).toBe(true)
  })
})
```

## Next Steps

- **[Examples →](/examples/vue/custom-rules)** - See more custom rule examples
- **[Advanced Features →](/guide/advanced/i18n)** - Learn about internationalization
- **[API Reference →](/api/rules)** - Complete rules API documentation
