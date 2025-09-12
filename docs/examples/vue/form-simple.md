# ValidatorForm Component Examples

Complete examples showing the ValidatorForm component with minimal styling - focusing on the validator functionality.

## Basic ValidatorForm Usage

```vue
<template>
  <div>
    <h2>User Registration</h2>
    
    <ValidatorForm 
      v-model="formData"
      :rules="formRules"
      @submit="handleSubmit"
      @validation-failed="handleValidationFailed"
    >
      <div>
        <label for="firstName">First Name</label>
        <input 
          id="firstName"
          v-model="formData.firstName"
          name="firstName"
          placeholder="Enter your first name"
        />
      </div>

      <div>
        <label for="email">Email Address</label>
        <input 
          id="email"
          v-model="formData.email"
          name="email"
          type="email"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label for="phone">Phone Number (Optional)</label>
        <input 
          id="phone"
          v-model="formData.phone"
          name="phone"
          placeholder="(11) 99999-9999"
        />
      </div>

      <button type="submit">Create Account</button>
    </ValidatorForm>

    <!-- Display form state for demonstration -->
    <div v-if="showFormState">
      <h3>Form State (for demo)</h3>
      <p><strong>Is Valid:</strong> {{ formRef?.isValid ?? false }}</p>
      <p><strong>Has Errors:</strong> {{ formRef?.hasErrors ?? false }}</p>
      <div v-if="formRef?.errors?.any()">
        <h4>Current Errors:</h4>
        <ul>
          <li v-for="error in formRef.errors.all()" :key="error">{{ error }}</li>
        </ul>
      </div>
    </div>
    
    <button @click="showFormState = !showFormState">
      {{ showFormState ? 'Hide' : 'Show' }} Form State
    </button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { ValidatorForm } from '@vueller/validator/vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const formData = ref({
  firstName: '',
  email: '',
  phone: ''
})

const formRules = {
  firstName: { required: true, min: 2, max: 50 },
  email: { required: true, email: true },
  phone: { phone: true } // Optional field with phone validation
}

const formRef = ref(null)
const showFormState = ref(false)
const globalValidator = inject(ValidatorSymbol)

onMounted(() => {
  // Register custom phone rule
  globalValidator.extend('phone', (value) => {
    if (!value) return true // Optional field
    return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
  })

  // Add custom error messages
  globalValidator.addMessages('en', {
    phone: 'The {field} must be in format (11) 99999-9999.'
  })
})

const handleSubmit = (data) => {
  console.log('✅ Form submitted successfully:', data)
  alert(`Welcome, ${data.firstName}!`)
  
  // Reset form after successful submission
  Object.keys(formData.value).forEach(key => {
    formData.value[key] = ''
  })
}

const handleValidationFailed = (errors) => {
  console.log('❌ Validation failed:', errors.allStatic())
  alert('Please correct the errors in the form.')
}
</script>

<style>
/* Only the validation classes provided by @vueller/validator */
.valid {
  border-color: #28a745;
  background-color: #f8fff9;
}

.invalid {
  border-color: #dc3545;
  background-color: #fff8f8;
}
</style>
```

::: tip Field Name Mapping
Notice how the field names in the template (`name="firstName"`) correspond to the keys used in:
- **Form data**: `formData.firstName`
- **Validation rules**: `formRules.firstName`
- **Error checking**: `errors.has('firstName')`

The `name` attribute is crucial for connecting these pieces together.
:::

## Form with Custom Error Display

```vue
<template>
  <div>
    <h2>Contact Form with Custom Error Display</h2>
    
    <ValidatorForm 
      ref="contactForm"
      v-model="contactData"
      :rules="contactRules"
      :validate-on-blur="true"
      :validate-on-input="false"
      @submit="submitContact"
    >
      <div>
        <label for="name">Full Name *</label>
        <input 
          id="name"
          v-model="contactData.name"
          name="name"
          placeholder="Enter your full name"
        />
        <FieldError field-name="name" />
      </div>

      <div>
        <label for="email">Email Address *</label>
        <input 
          id="email"
          v-model="contactData.email"
          name="email"
          type="email"
          placeholder="your.email@example.com"
        />
        <FieldError field-name="email" />
      </div>

      <div>
        <label for="subject">Subject *</label>
        <select 
          id="subject"
          v-model="contactData.subject"
          name="subject"
        >
          <option value="">Select a subject</option>
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="sales">Sales Question</option>
        </select>
        <FieldError field-name="subject" />
      </div>

      <div>
        <label for="message">Message *</label>
        <textarea 
          id="message"
          v-model="contactData.message"
          name="message"
          rows="4"
          placeholder="Tell us how we can help you..."
        ></textarea>
        <FieldError field-name="message" />
        <div>{{ contactData.message.length }}/500 characters</div>
      </div>

      <div>
        <label>
          <input 
            v-model="contactData.newsletter"
            name="newsletter"
            type="checkbox"
          />
          Subscribe to our newsletter for updates
        </label>
      </div>

      <button type="submit" :disabled="!canSubmit">
        {{ isSubmitting ? 'Sending...' : 'Send Message' }}
      </button>
      
      <button type="button" @click="resetForm">Clear Form</button>

      <!-- Form Summary -->
      <div v-if="showSummary">
        <h4>Form Summary</h4>
        <div>
          <strong>Valid Fields:</strong> {{ validFieldCount }} | 
          <strong>Invalid Fields:</strong> {{ invalidFieldCount }} | 
          <strong>Can Submit:</strong> {{ canSubmit ? 'Yes' : 'No' }}
        </div>
      </div>
      
      <button @click="showSummary = !showSummary">
        {{ showSummary ? 'Hide' : 'Show' }} Summary
      </button>
    </ValidatorForm>
  </div>
</template>

<script setup>
import { ref, computed, inject, defineComponent, h } from 'vue'
import { ValidatorForm } from '@vueller/validator/vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

// Custom error display component
const FieldError = defineComponent({
  props: {
    fieldName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const globalValidator = inject(ValidatorSymbol)
    
    const errorMessage = computed(() => {
      const errors = globalValidator.errors()
      return errors.has(props.fieldName) ? errors.first(props.fieldName) : null
    })
    
    return () => {
      if (!errorMessage.value) return null
      
      return h('div', {
        style: { color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }
      }, [
        h('span', '⚠️ '),
        h('span', errorMessage.value)
      ])
    }
  }
})

const contactData = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
  newsletter: false
})

const contactRules = {
  name: { required: true, min: 2, max: 100 },
  email: { required: true, email: true },
  subject: { required: true },
  message: { required: true, min: 10, max: 500 }
  // newsletter is optional, no rules needed
}

const contactForm = ref(null)
const isSubmitting = ref(false)
const showSummary = ref(false)

const canSubmit = computed(() => {
  return contactForm.value?.isValid ?? false
})

const validFieldCount = computed(() => {
  if (!contactForm.value?.errors) return 0
  const totalFields = Object.keys(contactRules).length
  const errorCount = contactForm.value.errors.count()
  return totalFields - errorCount
})

const invalidFieldCount = computed(() => {
  return contactForm.value?.errors?.count() ?? 0
})

const submitContact = async (data) => {
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Contact form submitted:', data)
    alert(`Thank you, ${data.name}! Your message has been sent.`)
    
    resetForm()
  } catch (error) {
    console.error('Submit error:', error)
    alert('Error sending message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  // Reset form data
  Object.keys(contactData.value).forEach(key => {
    if (typeof contactData.value[key] === 'boolean') {
      contactData.value[key] = false
    } else {
      contactData.value[key] = ''
    }
  })
  
  // Clear validation errors
  if (contactForm.value) {
    contactForm.value.reset()
  }
}
</script>

<style>
.valid {
  border-color: #28a745;
  background-color: #f8fff9;
}

.invalid {
  border-color: #dc3545;
  background-color: #fff8f8;
}
</style>
```

## Dynamic Form with Conditional Fields

```vue
<template>
  <div>
    <h2>Dynamic Survey Form</h2>
    
    <ValidatorForm 
      ref="surveyForm"
      v-model="surveyData"
      :rules="dynamicRules"
      :validate-on-blur="true"
    >
      <!-- Basic Info -->
      <fieldset>
        <legend>Basic Information</legend>
        
        <div>
          <label for="respondentType">I am a...</label>
          <select 
            id="respondentType"
            v-model="surveyData.respondentType"
            name="respondentType"
            @change="handleRespondentTypeChange"
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="professional">Working Professional</option>
            <option value="business-owner">Business Owner</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Conditional field for "Other" -->
        <div v-if="surveyData.respondentType === 'other'">
          <label for="customRole">Please specify your role</label>
          <input 
            id="customRole"
            v-model="surveyData.customRole"
            name="customRole"
            placeholder="Enter your role"
          />
        </div>
      </fieldset>

      <!-- Student-specific fields -->
      <fieldset v-if="surveyData.respondentType === 'student'">
        <legend>Student Information</legend>
        
        <div>
          <label for="institution">Educational Institution</label>
          <input 
            id="institution"
            v-model="surveyData.institution"
            name="institution"
            placeholder="Your school/university"
          />
        </div>

        <div>
          <label for="studyLevel">Level of Study</label>
          <select 
            id="studyLevel"
            v-model="surveyData.studyLevel"
            name="studyLevel"
          >
            <option value="">Select level</option>
            <option value="high-school">High School</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="phd">PhD</option>
          </select>
        </div>
      </fieldset>

      <!-- Professional-specific fields -->
      <fieldset v-if="surveyData.respondentType === 'professional'">
        <legend>Professional Information</legend>
        
        <div>
          <label for="company">Company</label>
          <input 
            id="company"
            v-model="surveyData.company"
            name="company"
            placeholder="Your company name"
          />
        </div>

        <div>
          <label for="experience">Years of Experience</label>
          <select 
            id="experience"
            v-model="surveyData.experience"
            name="experience"
          >
            <option value="">Select range</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </fieldset>

      <!-- Business Owner fields -->
      <fieldset v-if="surveyData.respondentType === 'business-owner'">
        <legend>Business Information</legend>
        
        <div>
          <label for="businessName">Business Name</label>
          <input 
            id="businessName"
            v-model="surveyData.businessName"
            name="businessName"
            placeholder="Your business name"
          />
        </div>

        <div>
          <label for="businessSize">Number of Employees</label>
          <select 
            id="businessSize"
            v-model="surveyData.businessSize"
            name="businessSize"
          >
            <option value="">Select size</option>
            <option value="1">Just me</option>
            <option value="2-10">2-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="50+">50+ employees</option>
          </select>
        </div>
      </fieldset>

      <!-- Common feedback section -->
      <fieldset>
        <legend>Feedback</legend>
        
        <div>
          <label>Overall Satisfaction</label>
          <div>
            <label v-for="rating in satisfactionOptions" :key="rating.value">
              <input 
                v-model="surveyData.satisfaction"
                :value="rating.value"
                name="satisfaction"
                type="radio"
              />
              {{ rating.label }}
            </label>
          </div>
        </div>

        <div>
          <label for="comments">Additional Comments</label>
          <textarea 
            id="comments"
            v-model="surveyData.comments"
            name="comments"
            rows="4"
            placeholder="Any additional feedback..."
          ></textarea>
        </div>
      </fieldset>

      <button type="submit">Submit Survey</button>
      <button type="button" @click="clearForm">Clear All</button>

      <!-- Validation Summary -->
      <div v-if="showValidationSummary && hasErrors">
        <h4>Please complete the following:</h4>
        <ul>
          <li v-for="error in allErrors" :key="error">{{ error }}</li>
        </ul>
      </div>
      
      <button @click="showValidationSummary = !showValidationSummary">
        {{ showValidationSummary ? 'Hide' : 'Show' }} Validation Summary
      </button>
    </ValidatorForm>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { ValidatorForm } from '@vueller/validator/vue'
import { ValidatorSymbol } from '@vueller/validator/vue'

const surveyData = ref({
  respondentType: '',
  customRole: '',
  institution: '',
  studyLevel: '',
  company: '',
  experience: '',
  businessName: '',
  businessSize: '',
  satisfaction: '',
  comments: ''
})

const satisfactionOptions = [
  { value: 'very-unsatisfied', label: 'Very Unsatisfied' },
  { value: 'unsatisfied', label: 'Unsatisfied' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'very-satisfied', label: 'Very Satisfied' }
]

const surveyForm = ref(null)
const showValidationSummary = ref(false)
const globalValidator = inject(ValidatorSymbol)

// Dynamic rules based on selected respondent type
const dynamicRules = computed(() => {
  const rules = {
    respondentType: { required: true },
    satisfaction: { required: true }
  }

  // Add conditional rules based on respondent type
  switch (surveyData.value.respondentType) {
    case 'other':
      rules.customRole = { required: true, min: 2 }
      break
      
    case 'student':
      rules.institution = { required: true, min: 2 }
      rules.studyLevel = { required: true }
      break
      
    case 'professional':
      rules.company = { required: true, min: 2 }
      rules.experience = { required: true }
      break
      
    case 'business-owner':
      rules.businessName = { required: true, min: 2 }
      rules.businessSize = { required: true }
      break
  }

  return rules
})

const hasErrors = computed(() => {
  return surveyForm.value?.hasErrors ?? false
})

const allErrors = computed(() => {
  return surveyForm.value?.errors?.all() ?? []
})

const handleRespondentTypeChange = () => {
  // Clear conditional fields when respondent type changes
  const fieldsToKeep = ['respondentType', 'satisfaction', 'comments']
  
  Object.keys(surveyData.value).forEach(key => {
    if (!fieldsToKeep.includes(key)) {
      surveyData.value[key] = ''
    }
  })
  
  // Clear validation errors for fields that are no longer relevant
  if (surveyForm.value) {
    Object.keys(surveyData.value).forEach(key => {
      if (!fieldsToKeep.includes(key)) {
        globalValidator.errors().clear(key)
      }
    })
  }
}

const clearForm = () => {
  Object.keys(surveyData.value).forEach(key => {
    surveyData.value[key] = ''
  })
  
  if (surveyForm.value) {
    surveyForm.value.reset()
  }
}

const handleSubmit = async (data) => {
  console.log('Survey submitted:', data)
  alert('Thank you for your feedback!')
  clearForm()
}
</script>

<style>
.valid {
  border-color: #28a745;
  background-color: #f8fff9;
}

.invalid {
  border-color: #dc3545;
  background-color: #fff8f8;
}
</style>
```

::: tip Understanding Field Names
In these examples, notice how the field names map:

- **HTML**: `<input name="firstName" />` 
- **Rules**: `firstName: { required: true }`
- **Data**: `formData.firstName`
- **Error checking**: `errors.has('firstName')`

The `name` attribute is the key that connects everything together!
:::

## Key Features Demonstrated

### 1. **Automatic Validation**
- Fields validate on blur by default
- CSS classes (`.valid`, `.invalid`) applied automatically
- Real-time error tracking

### 2. **Custom Error Display**
- Custom `FieldError` component for consistent error presentation
- Error messages tied to field names via `name` attribute

### 3. **Dynamic Rules**
- Validation rules change based on form state
- Conditional fields with conditional validation

### 4. **Form State Management**
- Access to `isValid`, `hasErrors`, `errors` via template refs
- Programmatic form reset and error clearing

### 5. **Event Handling**
- `@submit` for successful form submission
- `@validation-failed` for handling validation errors

## Best Practices

1. **Always use `name` attributes** - They're required for field identification
2. **Keep styling minimal** - Focus on validator functionality
3. **Handle both success and failure** - Provide feedback for all scenarios  
4. **Clear forms appropriately** - Reset both data and validation state
5. **Use semantic field names** - Make them meaningful and consistent

## Next Steps

- **[Custom Rules →](./custom-rules)** - Create your own validation logic
- **[Internationalization →](./i18n)** - Add multi-language support
- **[Composables →](./composables)** - Use validation composables for complex logic
