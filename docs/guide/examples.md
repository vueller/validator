# Examples

Real-world examples and use cases for @vueller/validator.

## Quick Start Examples

### Basic Form Validation

```vue
<template>
  <ValidationForm v-slot="{ errors, isValid }" :rules="rules" @submit="onSubmit">
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        id="email" 
        name="email" 
        type="email"
        v-rules="{ required: true, email: true }"
      />
      <div v-if="errors.has('email')" class="error">
        {{ errors.first('email') }}
      </div>
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input 
        id="password" 
        name="password" 
        type="password"
        v-rules="{ required: true, min: 8 }"
      />
      <div v-if="errors.has('password')" class="error">
        {{ errors.first('password') }}
      </div>
    </div>
    
    <button type="submit" :disabled="!isValid">
      Submit
    </button>
  </ValidationForm>
</template>

<script setup>
import { ref } from 'vue';

const rules = ref({
  email: { required: true, email: true },
  password: { required: true, min: 8 }
});

const onSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Form submitted:', data);
  }
};
</script>
```

### Global Language Switching

```vue
<template>
  <div>
    <!-- Language switcher -->
    <div class="language-switcher">
      <button @click="changeLanguage('en')">English</button>
      <button @click="changeLanguage('pt-BR')">Português</button>
    </div>
    
    <!-- Form with validation -->
    <ValidationForm v-slot="{ errors }" :rules="rules">
      <input name="email" v-rules="{ required: true, email: true }" />
      <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
    </ValidationForm>
  </div>
</template>

<script setup>
import { useValidator } from '@vueller/validator/vue';

const { setLocale } = useValidator();

const changeLanguage = (locale) => {
  setLocale(locale);
};
</script>
```

## Advanced Examples

### Custom Rules with Fallback Messages

```javascript
// Custom CPF rule
class CpfRule {
  validate(value) {
    if (!value) return true;
    
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    
    // CPF validation logic
    return this.isValidCpf(cpf);
  }
  
  message(field) {
    return `The ${field} field must contain a valid CPF`;
  }
  
  isValidCpf(cpf) {
    // CPF validation algorithm
    // ... implementation
    return true;
  }
}

// Register with fallback message
const { validator } = useValidator();
validator.extend('cpf', CpfRule, 'Invalid CPF format');

// Use in form
const rules = ref({
  document: { required: true, cpf: true }
});
```

### Multi-Step Form Validation

```vue
<template>
  <div class="multi-step-form">
    <!-- Step indicator -->
    <div class="steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="{ active: currentStep === index, completed: currentStep > index }"
        class="step"
      >
        {{ step.title }}
      </div>
    </div>
    
    <!-- Step content -->
    <ValidationForm v-slot="{ errors, isValid }" :rules="currentRules" @submit="nextStep">
      <div v-if="currentStep === 0">
        <h3>Personal Information</h3>
        <input name="name" v-rules="{ required: true, min: 2 }" />
        <div v-if="errors.has('name')">{{ errors.first('name') }}</div>
        
        <input name="email" v-rules="{ required: true, email: true }" />
        <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
      </div>
      
      <div v-if="currentStep === 1">
        <h3>Address Information</h3>
        <input name="address" v-rules="{ required: true }" />
        <div v-if="errors.has('address')">{{ errors.first('address') }}</div>
        
        <input name="city" v-rules="{ required: true }" />
        <div v-if="errors.has('city')">{{ errors.first('city') }}</div>
      </div>
      
      <div v-if="currentStep === 2">
        <h3>Payment Information</h3>
        <input name="cardNumber" v-rules="{ required: true, pattern: /^\d{16}$/ }" />
        <div v-if="errors.has('cardNumber')">{{ errors.first('cardNumber') }}</div>
        
        <input name="cvv" v-rules="{ required: true, pattern: /^\d{3}$/ }" />
        <div v-if="errors.has('cvv')">{{ errors.first('cvv') }}</div>
      </div>
      
      <div class="form-actions">
        <button v-if="currentStep > 0" @click="prevStep" type="button">
          Previous
        </button>
        <button type="submit" :disabled="!isValid">
          {{ currentStep === steps.length - 1 ? 'Complete' : 'Next' }}
        </button>
      </div>
    </ValidationForm>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentStep = ref(0);

const steps = [
  { title: 'Personal', rules: ['name', 'email'] },
  { title: 'Address', rules: ['address', 'city'] },
  { title: 'Payment', rules: ['cardNumber', 'cvv'] }
];

const currentRules = computed(() => {
  const stepRules = {};
  steps[currentStep.value].rules.forEach(field => {
    stepRules[field] = { required: true };
  });
  return stepRules;
});

const nextStep = ({ isValid }) => {
  if (isValid) {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++;
    } else {
      console.log('Form completed!');
    }
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};
</script>
```

### Dynamic Form Fields

```vue
<template>
  <ValidationForm v-slot="{ errors, isValid }" :rules="dynamicRules" @submit="onSubmit">
    <div v-for="(field, index) in dynamicFields" :key="index" class="dynamic-field">
      <input 
        :name="field.name"
        :type="field.type"
        :placeholder="field.placeholder"
        v-rules="field.rules"
      />
      <div v-if="errors.has(field.name)" class="error">
        {{ errors.first(field.name) }}
      </div>
      <button @click="removeField(index)" type="button">Remove</button>
    </div>
    
    <button @click="addField" type="button">Add Field</button>
    <button type="submit" :disabled="!isValid">Submit</button>
  </ValidationForm>
</template>

<script setup>
import { ref, computed } from 'vue';

const dynamicFields = ref([
  { name: 'field1', type: 'text', placeholder: 'Field 1', rules: { required: true } }
]);

const dynamicRules = computed(() => {
  const rules = {};
  dynamicFields.value.forEach(field => {
    rules[field.name] = field.rules;
  });
  return rules;
});

const addField = () => {
  const fieldCount = dynamicFields.value.length + 1;
  dynamicFields.value.push({
    name: `field${fieldCount}`,
    type: 'text',
    placeholder: `Field ${fieldCount}`,
    rules: { required: true }
  });
};

const removeField = (index) => {
  dynamicFields.value.splice(index, 1);
};

const onSubmit = ({ data, isValid }) => {
  if (isValid) {
    console.log('Dynamic form submitted:', data);
  }
};
</script>
```

## Integration Examples

### With Vue Router

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { validator } from '@vueller/validator/vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/contact', component: Contact },
    { path: '/register', component: Register }
  ]
});

// Global validation setup
router.beforeEach((to, from, next) => {
  // Reset validation state on route change
  validator.reset();
  next();
});

export default router;
```

### With Pinia Store

```javascript
// stores/validation.js
import { defineStore } from 'pinia';
import { validator } from '@vueller/validator/vue';

export const useValidationStore = defineStore('validation', {
  state: () => ({
    currentForm: null,
    validationErrors: {}
  }),
  
  actions: {
    setCurrentForm(formName) {
      this.currentForm = formName;
    },
    
    async validateForm(formData) {
      validator.setData(formData);
      const isValid = await validator.validate();
      
      if (!isValid) {
        this.validationErrors = validator.errors().allByField();
      } else {
        this.validationErrors = {};
      }
      
      return isValid;
    },
    
    clearErrors() {
      this.validationErrors = {};
      validator.reset();
    }
  }
});
```

### With Axios HTTP Client

```javascript
// api/forms.js
import axios from 'axios';
import { validator } from '@vueller/validator/vue';

class FormAPI {
  async submitContactForm(formData) {
    try {
      // Validate form data
      validator.setData(formData);
      const isValid = await validator.validate();
      
      if (!isValid) {
        throw new Error('Form validation failed');
      }
      
      // Submit to API
      const response = await axios.post('/api/contact', formData);
      return response.data;
    } catch (error) {
      if (error.message === 'Form validation failed') {
        throw validator.errors().allByField();
      }
      throw error;
    }
  }
}

export default new FormAPI();
```

## Testing Examples

### Unit Tests

```javascript
// tests/validation.test.js
import { Validator } from '@vueller/validator';

describe('Validator', () => {
  let validator;
  
  beforeEach(() => {
    validator = new Validator();
  });
  
  test('should validate required fields', async () => {
    validator.setRules('email', { required: true });
    validator.setData({ email: '' });
    
    const isValid = await validator.validate();
    expect(isValid).toBe(false);
    expect(validator.errors().has('email')).toBe(true);
  });
  
  test('should validate email format', async () => {
    validator.setRules('email', { required: true, email: true });
    validator.setData({ email: 'invalid-email' });
    
    const isValid = await validator.validate();
    expect(isValid).toBe(false);
    expect(validator.errors().first('email')).toContain('email');
  });
});
```

### Integration Tests

```javascript
// tests/integration/forms.test.js
import { mount } from '@vue/test-utils';
import { createApp } from 'vue';
import { validator } from '@vueller/validator/vue';
import ContactForm from '@/components/ContactForm.vue';

describe('ContactForm Integration', () => {
  let app;
  
  beforeEach(() => {
    app = createApp(ContactForm);
    app.use(validator, { locale: 'en' });
  });
  
  test('should validate form on submit', async () => {
    const wrapper = mount(ContactForm, {
      global: { plugins: [validator] }
    });
    
    // Fill form with invalid data
    await wrapper.find('input[name="email"]').setValue('invalid-email');
    await wrapper.find('form').trigger('submit');
    
    // Check for validation errors
    expect(wrapper.find('.error').text()).toContain('email');
  });
});
```

These examples demonstrate various ways to use @vueller/validator in real-world applications.
