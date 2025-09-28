# Vue.js API Reference

Complete API reference for Vue.js specific components, composables, and utilities.

## Components

### ValidatorForm

A form wrapper component that provides validation context and handles form submission.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Object` | `{}` | Form data object |
| `rules` | `Object` | `{}` | Validation rules |
| `messages` | `Object` | `{}` | Custom error messages |
| `scope` | `String` | `'default'` | Validation scope |
| `validateOnSubmit` | `Boolean` | `true` | Validate on form submission |
| `resetOnSuccess` | `Boolean` | `false` | Reset form after successful validation |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Object` | Emitted when form data changes |
| `submit` | `Object` | Emitted on form submission |
| `validation-success` | `Object` | Emitted when validation passes |
| `validation-error` | `Object` | Emitted when validation fails |

#### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ errors, isValid, validate, reset }` | Main form content |

#### Example

```vue
<template>
  <ValidatorForm 
    v-model="formData" 
    :rules="rules"
    scope="registration"
    @submit="handleSubmit"
  >
    <template #default="{ errors, isValid }">
      <input v-model="formData.email" type="email" />
      <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
      <button type="submit" :disabled="!isValid">Submit</button>
    </template>
  </ValidatorForm>
</template>
```

### ValidatorField

A field wrapper component for individual form field validation.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Any` | `''` | Field value |
| `field` | `String` | **required** | Field name |
| `rules` | `Object` | `{}` | Field validation rules |
| `messages` | `Object` | `{}` | Custom error messages |
| `scope` | `String` | `'default'` | Validation scope |
| `validateOnBlur` | `Boolean` | `true` | Validate on blur event |
| `validateOnInput` | `Boolean` | `false` | Validate on input event |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Any` | Emitted when field value changes |
| `field-validated` | `Object` | Emitted after field validation |
| `field-error` | `Object` | Emitted when field has errors |

#### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ fieldValue, hasError, errorMessage, validate }` | Field content |

#### Example

```vue
<template>
  <ValidatorField 
    v-model="email" 
    field="email" 
    :rules="{ required: true, email: true }"
    scope="login"
  >
    <template #default="{ hasError, errorMessage }">
      <input v-model="email" type="email" :class="{ error: hasError }" />
      <div v-if="hasError">{{ errorMessage }}</div>
    </template>
  </ValidatorField>
</template>
```

## Composables

### useValidator

A composable that provides validator instance and reactive validation state.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options` | `Object` | `{}` | Validator configuration options |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `validator` | `Validator` | Validator instance |
| `errors` | `ComputedRef<ErrorBag>` | Reactive errors |
| `isValid` | `ComputedRef<Boolean>` | Reactive validation state |
| `hasErrors` | `ComputedRef<Boolean>` | Reactive error existence check |
| `validate` | `Function` | Validation function |
| `reset` | `Function` | Reset function |

#### Example

```vue
<script setup>
import { ref, computed } from 'vue'
import { useValidator } from '@vueller/validator/vue'

const formData = ref({ email: '', password: '' })

const { validator, errors, isValid, validate } = useValidator({
  locale: 'en',
  validateOnBlur: true
})

// Set rules
validator.setRules('email', { required: true, email: true })
validator.setRules('password', { required: true, min: 8 })

// Validate form
const handleSubmit = async () => {
  const isFormValid = await validate(formData.value)
  if (isFormValid) {
    console.log('Form is valid!')
  }
}
</script>
```

## Plugin

### Installation

Install the Vue plugin to enable global validator access and components.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `globalValidator` | `Boolean` | `true` | Create global validator instance |
| `globalProperties` | `Boolean` | `true` | Add validator to global properties |
| `locale` | `String` | `'en'` | Default locale |
| `validateOnBlur` | `Boolean` | `true` | Default blur validation |
| `validateOnInput` | `Boolean` | `false` | Default input validation |

#### Example

```javascript
import { createApp } from 'vue'
import ValidatorPlugin from '@vueller/validator/vue'
import App from './App.vue'

const app = createApp(App)

app.use(ValidatorPlugin, {
  globalValidator: true,
  locale: 'en',
  validateOnBlur: true
})

app.mount('#app')
```

## Directives

### v-validate

A directive for simple field validation without components.

#### Modifiers

| Modifier | Description |
|----------|-------------|
| `.blur` | Validate on blur event |
| `.input` | Validate on input event |
| `.lazy` | Validate on change event |

#### Example

```vue
<template>
  <form>
    <input 
      v-model="email"
      v-validate:email="{ required: true, email: true }"
      type="email"
    />
    <input 
      v-model="password"
      v-validate:password.blur="{ required: true, min: 8 }"
      type="password"
    />
  </form>
</template>
```

### v-rules

A directive for setting validation rules on form elements.

#### Example

```vue
<template>
  <form v-rules="formRules">
    <input name="email" v-model="formData.email" type="email" />
    <input name="password" v-model="formData.password" type="password" />
  </form>
</template>

<script setup>
const formRules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}
</script>
```

## Global Properties

When the plugin is installed with `globalProperties: true`, the following properties are available on all component instances:

### $validator

Global validator instance accessible in all components.

```vue
<script>
export default {
  async mounted() {
    // Access global validator
    this.$validator.setRules('email', { required: true, email: true })
    const isValid = await this.$validator.validate({ email: 'test@test.com' })
  }
}
</script>
```

### $validate

Global validation function for quick validation.

```vue
<script>
export default {
  methods: {
    async handleSubmit() {
      const isValid = await this.$validate(this.formData)
      if (isValid) {
        // Form is valid
      }
    }
  }
}
</script>
```

## Reactive State Helpers

### Error Bag Methods

The error bag provides reactive methods for accessing validation errors:

```vue
<script setup>
const { errors } = useValidator()

// Reactive error checking
const hasEmailError = computed(() => errors.value.has('email'))
const emailError = computed(() => errors.value.first('email'))
const allErrors = computed(() => errors.value.allByField())
</script>
```

### Validation State

```vue
<script setup>
const { validator, isValid, hasErrors } = useValidator()

// Reactive validation state
watch(isValid, (newValue) => {
  console.log('Form validity changed:', newValue)
})

watch(hasErrors, (newValue) => {
  if (newValue) {
    console.log('Form has errors')
  }
})
</script>
```

## Advanced Patterns

### Custom Validation Component

```vue
<template>
  <div class="custom-field">
    <label>{{ label }}</label>
    <input 
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
      :class="fieldClasses"
    />
    <div v-if="hasError" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  modelValue: String,
  field: String,
  label: String
})

const emit = defineEmits(['update:modelValue'])

// Inject validator from parent ValidatorForm
const validator = inject('validator')

const hasError = computed(() => validator.errors().has(props.field))
const errorMessage = computed(() => validator.errors().first(props.field))
const fieldClasses = computed(() => ({
  'field-error': hasError.value,
  'field-valid': !hasError.value && props.modelValue
}))

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleBlur = async () => {
  await validator.validate().field(props.field, props.modelValue)
}
</script>
```

### Scoped Validation Hook

```vue
<script setup>
import { ref } from 'vue'
import { useValidator } from '@vueller/validator/vue'

function useScopedValidator(scope, rules) {
  const { validator, errors, isValid } = useValidator()
  
  // Set rules for this scope
  validator.setMultipleRules(rules)
  
  const validate = async (data) => {
    return await validator.validate(scope, data)
  }
  
  const validateField = async (field, value) => {
    return await validator.validate(scope).field(field, value)
  }
  
  const getScopedErrors = () => {
    const allErrors = errors.value.allByField()
    return Object.keys(allErrors)
      .filter(key => key.startsWith(`${scope}.`))
      .reduce((acc, key) => {
        const fieldName = key.replace(`${scope}.`, '')
        acc[fieldName] = allErrors[key]
        return acc
      }, {})
  }
  
  return {
    validator,
    errors: getScopedErrors,
    isValid,
    validate,
    validateField
  }
}

// Usage
const { validate, errors } = useScopedValidator('login', {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
})
</script>
```

## TypeScript Support

### Component Props Types

```typescript
import type { ValidationRules, ValidationMessages } from '@vueller/validator'

interface ValidatorFormProps {
  modelValue?: Record<string, any>
  rules?: Record<string, ValidationRules>
  messages?: ValidationMessages
  scope?: string
  validateOnSubmit?: boolean
  resetOnSuccess?: boolean
}

interface ValidatorFieldProps {
  modelValue?: any
  field: string
  rules?: ValidationRules
  messages?: ValidationMessages
  scope?: string
  validateOnBlur?: boolean
  validateOnInput?: boolean
}
```

### Composable Types

```typescript
import type { Validator, ErrorBag } from '@vueller/validator'
import type { ComputedRef } from 'vue'

interface UseValidatorReturn {
  validator: Validator
  errors: ComputedRef<ErrorBag>
  isValid: ComputedRef<boolean>
  hasErrors: ComputedRef<boolean>
  validate: (scope?: string, data?: any) => Promise<boolean>
  reset: (scope?: string) => void
}
```

## Next Steps

- [**Core API**](./core.md) - Core validator functionality
- [**Universal API**](./universal.md) - Framework-agnostic API
- [**Vue Examples**](../examples/vue.md) - Practical Vue.js examples
