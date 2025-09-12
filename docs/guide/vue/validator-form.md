# ValidatorForm Component

The `ValidatorForm` component provides a higher-level abstraction for form validation, with built-in state management, configuration options, and reactive validation.

## Basic Usage

Import and use the component in your templates:

```vue
<template>
  <ValidatorForm 
    v-model="formData"
    :rules="formRules"
    @submit="handleSubmit"
  >
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        id="email"
        v-model="formData.email"
        name="email"
        type="email"
        placeholder="Enter your email"
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input 
        id="password"
        v-model="formData.password"
        name="password"
        type="password"
        placeholder="Enter your password"
      />
    </div>

    <button type="submit" :disabled="!isValid">
      Login
    </button>
  </ValidatorForm>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ValidatorForm } from '@vueller/validator/vue'

const formData = ref({
  email: '',
  password: ''
})

const formRules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
}

// Component exposes isValid state
const isValid = computed(() => {
  // This will be reactive to validation state
  return formRef.value?.isValid ?? false
})

const formRef = ref(null)

const handleSubmit = (data) => {
  console.log('Form submitted with:', data)
}
</script>
```

## Props

The ValidatorForm component accepts the following props:

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Object` | `{}` | The form data object (v-model support) |
| `rules` | `Object` | `{}` | Validation rules for form fields |

### Validation Behavior

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `validateOnBlur` | `Boolean` | `null` | Override global blur validation setting |
| `validateOnInput` | `Boolean` | `null` | Override global input validation setting |
| `stopOnFirstFailure` | `Boolean` | `false` | Stop validation at first error |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cssClasses` | `Object` | `{ valid: 'valid', invalid: 'invalid' }` | CSS classes for validation states |
| `disableClasses` | `Boolean` | `false` | Disable automatic CSS class application |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@submit` | `(formData)` | Fired when form is submitted and valid |
| `@validation-failed` | `(errors)` | Fired when validation fails |
| `@field-validated` | `{ field, isValid, errors }` | Fired when a field is validated |
| `@update:modelValue` | `(formData)` | v-model update event |

## Exposed Methods

Access these methods using template refs:

```vue
<template>
  <ValidatorForm ref="formRef">
    <!-- form content -->
  </ValidatorForm>
  
  <button @click="validateForm">Validate All</button>
  <button @click="resetForm">Reset Form</button>
</template>

<script setup>
import { ref } from 'vue'

const formRef = ref(null)

const validateForm = async () => {
  const isValid = await formRef.value.validateAll()
  console.log('Form is valid:', isValid)
}

const resetForm = () => {
  formRef.value.reset()
}
</script>
```

### Available Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `validateAll()` | `Promise<boolean>` | Validate all form fields |
| `validateField(fieldName)` | `Promise<boolean>` | Validate specific field |
| `reset()` | `void` | Reset form and clear errors |
| `clearErrors()` | `void` | Clear all validation errors |

### Available Properties

| Property | Type | Description |
|----------|------|-------------|
| `isValid` | `Ref<boolean>` | Reactive form validity state |
| `hasErrors` | `Ref<boolean>` | Reactive error state |
| `errors` | `Ref<ErrorBag>` | Reactive error collection |
| `formData` | `Ref<Object>` | Reactive form data |

## Validation Configuration

### Per-Form Configuration

Override global validation settings for specific forms:

```vue
<template>
  <!-- This form validates on input, not blur -->
  <ValidatorForm 
    :validate-on-blur="false"
    :validate-on-input="true"
    v-model="formData"
    :rules="rules"
  >
    <input v-model="formData.username" name="username" />
  </ValidatorForm>
</template>
```

### Mixed Validation

Different validation timing for different forms:

```vue
<template>
  <div>
    <!-- Login form: validate on blur (less intrusive) -->
    <ValidatorForm 
      :validate-on-blur="true"
      :validate-on-input="false"
      v-model="loginData"
      :rules="loginRules"
      class="login-form"
    >
      <input v-model="loginData.email" name="email" />
      <input v-model="loginData.password" name="password" type="password" />
    </ValidatorForm>

    <!-- Search form: validate on input (immediate feedback) -->
    <ValidatorForm 
      :validate-on-blur="false"
      :validate-on-input="true"
      v-model="searchData"
      :rules="searchRules"
      class="search-form"
    >
      <input v-model="searchData.query" name="query" />
    </ValidatorForm>
  </div>
</template>
```

## Error Display

### Reactive Error Access

```vue
<template>
  <ValidatorForm 
    ref="formRef"
    v-model="formData"
    :rules="rules"
  >
    <div class="form-group">
      <input v-model="formData.email" name="email" />
      
      <!-- Display field-specific errors -->
      <div v-if="errors.has('email')" class="error-message">
        {{ errors.first('email') }}
      </div>
    </div>

    <!-- Display all errors -->
    <div v-if="hasErrors" class="error-summary">
      <h4>Please correct the following errors:</h4>
      <ul>
        <li v-for="error in errors.all()" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>
  </ValidatorForm>
</template>

<script setup>
import { computed } from 'vue'

const formRef = ref(null)

// Reactive access to validation state
const errors = computed(() => formRef.value?.errors ?? {})
const hasErrors = computed(() => formRef.value?.hasErrors ?? false)
const isValid = computed(() => formRef.value?.isValid ?? false)
</script>
```

## Multi-Step Forms

```vue
<template>
  <div class="multi-step-form">
    <div class="step-indicator">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step', { active: currentStep === index, completed: index < currentStep }]"
      >
        {{ step.title }}
      </div>
    </div>

    <ValidatorForm 
      ref="formRef"
      v-model="formData"
      :rules="currentStepRules"
      :validate-on-blur="true"
    >
      <!-- Step 1: Personal Info -->
      <div v-if="currentStep === 0" class="step-content">
        <h3>Personal Information</h3>
        <input v-model="formData.firstName" name="firstName" placeholder="First Name" />
        <input v-model="formData.lastName" name="lastName" placeholder="Last Name" />
        <input v-model="formData.email" name="email" type="email" placeholder="Email" />
      </div>

      <!-- Step 2: Address -->
      <div v-if="currentStep === 1" class="step-content">
        <h3>Address Information</h3>
        <input v-model="formData.street" name="street" placeholder="Street Address" />
        <input v-model="formData.city" name="city" placeholder="City" />
        <input v-model="formData.zipCode" name="zipCode" placeholder="ZIP Code" />
      </div>
    </ValidatorForm>

    <div class="step-navigation">
      <button 
        v-if="currentStep > 0"
        @click="previousStep"
        class="btn btn-secondary"
      >
        Previous
      </button>
      
      <button 
        v-if="currentStep < steps.length - 1"
        @click="nextStep"
        class="btn btn-primary"
      >
        Next
      </button>
      
      <button 
        v-if="currentStep === steps.length - 1"
        @click="submitForm"
        class="btn btn-success"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentStep = ref(0)
const formRef = ref(null)

const steps = [
  { title: 'Personal Info', fields: ['firstName', 'lastName', 'email'] },
  { title: 'Address', fields: ['street', 'city', 'zipCode'] }
]

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  city: '',
  zipCode: ''
})

const allRules = {
  firstName: { required: true, min: 2 },
  lastName: { required: true, min: 2 },
  email: { required: true, email: true },
  street: { required: true, min: 5 },
  city: { required: true, min: 2 },
  zipCode: { required: true, pattern: /^\d{5}(-\d{4})?$/ }
}

const currentStepRules = computed(() => {
  const stepFields = steps[currentStep.value].fields
  const rules = {}
  
  stepFields.forEach(field => {
    if (allRules[field]) {
      rules[field] = allRules[field]
    }
  })
  
  return rules
})

const nextStep = async () => {
  // Validate current step before proceeding
  const isValid = await formRef.value.validateAll()
  
  if (isValid) {
    currentStep.value++
  } else {
    alert('Please correct the errors before proceeding.')
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    // Clear errors when going back
    formRef.value.clearErrors()
  }
}

const submitForm = async () => {
  // Validate all form data
  const isValid = await formRef.value.validateAll()
  
  if (isValid) {
    console.log('Form submitted:', formData.value)
    alert('Form submitted successfully!')
  }
}
</script>
```

## Best Practices

### 1. Use Template Refs for Complex Logic

```vue
<script setup>
const formRef = ref(null)

// Access form methods when needed
const handleSpecialAction = async () => {
  await formRef.value.validateAll()
  if (formRef.value.isValid) {
    // Proceed with action
  }
}
</script>
```

### 2. Separate Rules Definition

```javascript
// validation-rules.js
export const userRegistrationRules = {
  firstName: { required: true, min: 2, max: 50 },
  lastName: { required: true, min: 2, max: 50 },
  email: { required: true, email: true },
  password: { required: true, min: 8, max: 100 }
}

export const loginRules = {
  email: { required: true, email: true },
  password: { required: true }
}
```

### 3. Handle Loading States

```vue
<template>
  <ValidatorForm @submit="handleSubmit">
    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
    </button>
  </ValidatorForm>
</template>

<script setup>
const isSubmitting = ref(false)

const handleSubmit = async (data) => {
  isSubmitting.value = true
  try {
    await submitToAPI(data)
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

## Next Steps

- **[Custom Rules →](./custom-rules)** - Create your own validation rules
- **[Composables →](./composables)** - Use validation composables
- **[Examples →](/examples/vue/form)** - See more ValidatorForm examples
