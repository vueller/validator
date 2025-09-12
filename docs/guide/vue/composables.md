# Composables

Vue 3 composables provide a clean, reactive way to handle validation logic. @vueller/validator includes several composables for different validation patterns.

## useValidator

The main composable for handling validation in Vue components.

### Basic Usage

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <input 
        v-model="formData.email"
        @blur="validateField('email')"
        name="email"
        placeholder="Email"
        :class="{ invalid: hasError('email') }"
      />
      <span v-if="hasError('email')" class="error">
        {{ getError('email') }}
      </span>
    </div>

    <div class="form-group">
      <input 
        v-model="formData.password"
        @blur="validateField('password')"
        name="password"
        type="password"
        placeholder="Password"
        :class="{ invalid: hasError('password') }"
      />
      <span v-if="hasError('password')" class="error">
        {{ getError('password') }}
      </span>
    </div>

    <button type="submit" :disabled="!isValid">
      Submit
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useValidator } from '@vueller/validator/vue'

const formData = ref({
  email: '',
  password: ''
})

const rules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}

const {
  validateField,
  validateAll,
  hasError,
  getError,
  isValid,
  reset,
  errors
} = useValidator(rules, formData)

const handleSubmit = async () => {
  const isFormValid = await validateAll()
  if (isFormValid) {
    console.log('Form submitted:', formData.value)
  }
}
</script>
```

### API Reference

#### Parameters

```typescript
useValidator(
  rules?: ValidationRules,
  data?: Ref<Record<string, any>>,
  options?: ValidatorOptions
)
```

- **rules** - Validation rules object
- **data** - Reactive form data reference
- **options** - Validator configuration options

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `validateField` | `(field: string) => Promise<boolean>` | Validate a specific field |
| `validateAll` | `() => Promise<boolean>` | Validate all fields |
| `hasError` | `(field: string) => boolean` | Check if field has errors |
| `getError` | `(field: string) => string \| null` | Get first error for field |
| `getAllErrors` | `(field?: string) => string[]` | Get all errors for field or all fields |
| `isValid` | `Ref<boolean>` | Reactive validation state |
| `errors` | `Ref<ErrorBag>` | Reactive error collection |
| `reset` | `() => void` | Clear all errors |
| `clearField` | `(field: string) => void` | Clear errors for specific field |

## useValidatorForm

A higher-level composable for complete form management.

### Basic Usage

```vue
<template>
  <form @submit.prevent="submit">
    <div v-for="field in formFields" :key="field.name">
      <label :for="field.name">{{ field.label }}</label>
      <input 
        :id="field.name"
        v-model="formData[field.name]"
        :name="field.name"
        :type="field.type"
        :placeholder="field.placeholder"
        @blur="blurHandler(field.name)"
        :class="getFieldClass(field.name)"
      />
      <div v-if="hasError(field.name)" class="error">
        {{ getError(field.name) }}
      </div>
    </div>

    <button type="submit" :disabled="!canSubmit">
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useValidatorForm } from '@vueller/validator/vue'

const formFields = [
  { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Enter first name' },
  { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter email' }
]

const {
  formData,
  hasError,
  getError,
  getFieldClass,
  blurHandler,
  submit,
  canSubmit,
  isSubmitting,
  reset
} = useValidatorForm({
  initialData: {
    firstName: '',
    lastName: '',
    email: ''
  },
  rules: {
    firstName: { required: true, min: 2 },
    lastName: { required: true, min: 2 },
    email: { required: true, email: true }
  },
  onSubmit: async (data) => {
    console.log('Submitting:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Submitted successfully!')
  }
})
</script>
```

### API Reference

#### Parameters

```typescript
useValidatorForm({
  initialData?: Record<string, any>,
  rules?: ValidationRules,
  onSubmit?: (data: Record<string, any>) => Promise<void> | void,
  validateOnBlur?: boolean,
  validateOnInput?: boolean,
  resetOnSubmit?: boolean
})
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `formData` | `Ref<Record<string, any>>` | Reactive form data |
| `hasError` | `(field: string) => boolean` | Check field errors |
| `getError` | `(field: string) => string \| null` | Get field error |
| `getFieldClass` | `(field: string) => string` | Get CSS class for field |
| `blurHandler` | `(field: string) => void` | Handle blur validation |
| `inputHandler` | `(field: string) => void` | Handle input validation (debounced) |
| `submit` | `() => Promise<void>` | Submit form with validation |
| `canSubmit` | `Ref<boolean>` | Whether form can be submitted |
| `isSubmitting` | `Ref<boolean>` | Submission state |
| `reset` | `() => void` | Reset form and errors |

## useValidatorI18n

Composable for handling internationalization in validation.

### Basic Usage

```vue
<template>
  <div>
    <div class="language-switcher">
      <button 
        v-for="lang in availableLanguages"
        :key="lang.code"
        @click="setLocale(lang.code)"
        :class="{ active: currentLocale === lang.code }"
      >
        {{ lang.flag }} {{ lang.name }}
      </button>
    </div>

    <form>
      <input 
        v-model="email"
        v-rules="{ required: true, email: true }"
        name="email"
        :placeholder="t('email_placeholder')"
      />
      
      <p v-if="validationError">{{ validationError }}</p>
    </form>

    <p>{{ t('current_language') }}: {{ currentLocaleName }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useValidatorI18n } from '@vueller/validator/vue'

const {
  currentLocale,
  setLocale,
  t,
  addTranslations,
  availableLocales
} = useValidatorI18n()

const email = ref('')

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

// Add custom translations
addTranslations('en', {
  email_placeholder: 'Enter your email address',
  current_language: 'Current language'
})

addTranslations('pt-BR', {
  email_placeholder: 'Digite seu endereço de email',
  current_language: 'Idioma atual'
})

addTranslations('es', {
  email_placeholder: 'Ingresa tu dirección de email',
  current_language: 'Idioma actual'
})

const currentLocaleName = computed(() => {
  const lang = availableLanguages.find(l => l.code === currentLocale.value)
  return lang ? lang.name : currentLocale.value
})

// Get validation error for reactive display
const validationError = ref('')
// You would connect this to your validation system
</script>
```

### API Reference

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `currentLocale` | `Ref<string>` | Current active locale |
| `setLocale` | `(locale: string) => void` | Change current locale |
| `t` | `(key: string, params?: object) => string` | Translate function |
| `addTranslations` | `(locale: string, translations: object) => void` | Add translations |
| `availableLocales` | `Ref<string[]>` | List of available locales |

## useFieldValidation

Composable for individual field validation.

### Basic Usage

```vue
<template>
  <div class="field-wrapper">
    <label :for="fieldName">{{ label }}</label>
    <input 
      :id="fieldName"
      v-model="fieldValue"
      :name="fieldName"
      :type="type"
      :placeholder="placeholder"
      @blur="handleBlur"
      @input="handleInput"
      :class="fieldClasses"
    />
    <div v-if="showError" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-if="showSuccess" class="success-message">
      ✓ Valid
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useFieldValidation } from '@vueller/validator/vue'

const props = defineProps({
  modelValue: String,
  fieldName: { type: String, required: true },
  rules: { type: Object, default: () => ({}) },
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  validateOnBlur: { type: Boolean, default: true },
  validateOnInput: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const {
  fieldValue,
  errorMessage,
  isValid,
  isValidating,
  showError,
  showSuccess,
  fieldClasses,
  handleBlur,
  handleInput,
  validate,
  reset
} = useFieldValidation({
  fieldName: props.fieldName,
  rules: props.rules,
  modelValue: props.modelValue,
  validateOnBlur: props.validateOnBlur,
  validateOnInput: props.validateOnInput,
  onUpdate: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 1rem;
}

.field-valid {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.field-invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.field-validating {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.success-message {
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
```

### API Reference

#### Parameters

```typescript
useFieldValidation({
  fieldName: string,
  rules: ValidationRules,
  modelValue?: any,
  validateOnBlur?: boolean,
  validateOnInput?: boolean,
  onUpdate?: (value: any) => void,
  debounceMs?: number
})
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `fieldValue` | `Ref<any>` | Reactive field value |
| `errorMessage` | `Ref<string \| null>` | Current error message |
| `isValid` | `Ref<boolean>` | Field validity state |
| `isValidating` | `Ref<boolean>` | Whether field is being validated |
| `showError` | `Ref<boolean>` | Whether to show error |
| `showSuccess` | `Ref<boolean>` | Whether to show success |
| `fieldClasses` | `Ref<string>` | CSS classes for field |
| `handleBlur` | `() => void` | Blur event handler |
| `handleInput` | `() => void` | Input event handler |
| `validate` | `() => Promise<boolean>` | Manually validate field |
| `reset` | `() => void` | Reset field state |

## Advanced Examples

### Custom Validation Hook

Create your own validation composable:

```javascript
// composables/useLoginValidation.js
import { ref, computed, watch } from 'vue'
import { useValidator } from '@vueller/validator/vue'

export function useLoginValidation() {
  const formData = ref({
    email: '',
    password: ''
  })

  const rules = {
    email: { required: true, email: true },
    password: { required: true, min: 8 }
  }

  const {
    validateField,
    validateAll,
    hasError,
    getError,
    isValid,
    reset
  } = useValidator(rules, formData)

  // Custom validation logic
  const isFormReady = computed(() => {
    return formData.value.email.length > 0 && 
           formData.value.password.length > 0 &&
           isValid.value
  })

  const loginAttempts = ref(0)
  const maxAttempts = 3
  
  const canAttemptLogin = computed(() => {
    return loginAttempts.value < maxAttempts
  })

  // Watch for changes and validate
  watch(() => formData.value.email, () => {
    if (formData.value.email.length > 0) {
      validateField('email')
    }
  }, { immediate: false })

  const attemptLogin = async () => {
    const isFormValid = await validateAll()
    
    if (!isFormValid) {
      return { success: false, error: 'Please fix validation errors' }
    }

    if (!canAttemptLogin.value) {
      return { success: false, error: 'Too many login attempts' }
    }

    loginAttempts.value++

    try {
      // Simulate API call
      const response = await loginAPI(formData.value)
      
      if (response.success) {
        reset()
        loginAttempts.value = 0
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const resetForm = () => {
    formData.value.email = ''
    formData.value.password = ''
    reset()
    loginAttempts.value = 0
  }

  return {
    formData,
    hasError,
    getError,
    isValid,
    isFormReady,
    canAttemptLogin,
    loginAttempts,
    maxAttempts,
    attemptLogin,
    resetForm,
    validateField
  }
}
```

Usage:

```vue
<template>
  <form @submit.prevent="handleLogin">
    <div class="form-group">
      <input 
        v-model="formData.email"
        @blur="validateField('email')"
        type="email"
        placeholder="Email"
        :class="{ invalid: hasError('email') }"
      />
      <span v-if="hasError('email')" class="error">
        {{ getError('email') }}
      </span>
    </div>

    <div class="form-group">
      <input 
        v-model="formData.password"
        @blur="validateField('password')"
        type="password"
        placeholder="Password"
        :class="{ invalid: hasError('password') }"
      />
      <span v-if="hasError('password')" class="error">
        {{ getError('password') }}
      </span>
    </div>

    <button 
      type="submit" 
      :disabled="!isFormReady || !canAttemptLogin"
    >
      Login ({{ maxAttempts - loginAttempts }} attempts left)
    </button>

    <button type="button" @click="resetForm">
      Reset
    </button>
  </form>
</template>

<script setup>
import { useLoginValidation } from '@/composables/useLoginValidation'

const {
  formData,
  hasError,
  getError,
  isValid,
  isFormReady,
  canAttemptLogin,
  loginAttempts,
  maxAttempts,
  attemptLogin,
  resetForm,
  validateField
} = useLoginValidation()

const handleLogin = async () => {
  const result = await attemptLogin()
  
  if (result.success) {
    console.log('Login successful:', result.data)
    // Redirect or show success
  } else {
    console.error('Login failed:', result.error)
    // Show error message
  }
}
</script>
```

## TypeScript Support

All composables include full TypeScript support:

```typescript
import type { ValidationRules } from '@vueller/validator'
import { useValidator } from '@vueller/validator/vue'

interface LoginForm {
  email: string
  password: string
}

const formData = ref<LoginForm>({
  email: '',
  password: ''
})

const rules: ValidationRules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}

const {
  validateField,
  validateAll,
  hasError,
  getError,
  isValid
} = useValidator(rules, formData)
```

## Best Practices

### 1. Keep Composables Focused

```javascript
// ✅ Good: Focused on specific validation concern
export function useEmailValidation() {
  // Email-specific validation logic
}

// ❌ Avoid: Too many concerns
export function useFormValidationAndSubmissionAndErrorHandling() {
  // Too much responsibility
}
```

### 2. Reuse Common Patterns

```javascript
// common/validation-composables.js
export function useRequiredField(fieldName, customMessage) {
  return useFieldValidation({
    fieldName,
    rules: { 
      required: { 
        value: true, 
        message: customMessage || `${fieldName} is required` 
      } 
    }
  })
}

export function useEmailField(fieldName = 'email') {
  return useFieldValidation({
    fieldName,
    rules: { 
      required: true, 
      email: true 
    }
  })
}
```

### 3. Combine with Global State

```javascript
// stores/auth.js (Pinia)
export const useAuthStore = defineStore('auth', () => {
  const {
    formData,
    validateAll,
    isValid
  } = useValidator({
    email: { required: true, email: true },
    password: { required: true, min: 8 }
  })

  const login = async () => {
    if (await validateAll()) {
      // Proceed with login
    }
  }

  return { formData, login, isValid }
})
```

## Next Steps

- **[Custom Rules →](./custom-rules)** - Create your own validation rules
- **[Examples →](/examples/vue/composables)** - See more composable examples
- **[API Reference →](/api/composables)** - Complete API documentation
