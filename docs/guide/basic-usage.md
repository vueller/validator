# 🎯 Basic Usage

## Core Concepts

### 1. Validator Instance

```javascript
import { createValidator } from '@vueller/validator';

// Create validator
const validator = createValidator();
```

### 2. Setting Rules

```javascript
// Single field rules
validator.setRules('email', { 
    required: true, 
    email: true 
});

// Multiple field rules
validator.setMultipleRules({
    email: { required: true, email: true },
    password: { required: true, min: 8 },
    name: { required: true, min: 2, max: 50 }
});
```

### 3. Validation Methods

#### Validate All Fields
```javascript
const formData = {
    email: 'user@example.com',
    password: 'mypassword123',
    name: 'John Doe'
};

const isValid = await validator.validate(formData);
console.log('Form is valid:', isValid);
```

#### Validate Specific Field
```javascript
// Validate single field with value
const isEmailValid = await validator.validate().field('email', 'user@example.com');

// Validate field from existing data
validator.setData({ email: 'user@example.com' });
const isValid = await validator.validate().field('email');
```

#### Scope-based Validation
```javascript
// Multiple forms in same page
const loginData = { email: 'user@test.com', password: '123456' };
const registerData = { email: 'new@test.com', password: '123456', confirmPassword: '123456' };

// Validate login form
const isLoginValid = await validator.validate('loginForm', loginData);

// Validate register form
const isRegisterValid = await validator.validate('registerForm', registerData);
```

## Working with Errors

### Getting Errors

```javascript
// Get all errors
const allErrors = validator.errors().all();

// Get errors by field
const fieldErrors = validator.errors().allByField();
console.log(fieldErrors);
// Output: { email: ['Email is required'], password: ['Password must be at least 8 characters'] }

// Get first error for field
const firstEmailError = validator.errors().first('email');

// Check if field has errors
const hasEmailError = validator.errors().has('email');

// Count total errors
const errorCount = validator.errors().count();
```

### Error Messages

```javascript
// Default English messages
validator.setRules('email', { required: true, email: true });

// Custom messages
validator.setRules('email', { 
    required: true, 
    email: true 
}, {
    required: 'Please enter your email address',
    email: 'Please enter a valid email address'
});
```

## Reactive State

### JavaScript (Manual Reactivity)

```javascript
// Subscribe to validation state changes
const unsubscribe = validator.subscribe(() => {
    console.log('Validation state changed');
    updateUI();
});

function updateUI() {
    const errors = validator.errors().allByField();
    const isValid = validator.isValid();
    
    // Update DOM elements
    document.getElementById('submit-btn').disabled = !isValid;
    
    // Display errors
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        errorElement.textContent = errors[field][0] || '';
    });
}

// Don't forget to unsubscribe
// unsubscribe();
```

### Vue.js (Automatic Reactivity)

```vue
<script setup>
import { useValidator } from '@vueller/validator/vue';

const { validator, errors, isValid, hasErrors } = useValidator();

// Set rules
validator.setRules('email', { required: true, email: true });

// Reactive state automatically updates
</script>

<template>
    <div>
        <p>Form is valid: {{ isValid }}</p>
        <p>Has errors: {{ hasErrors }}</p>
        <p>Error count: {{ errors.count() }}</p>
        
        <div v-if="errors.has('email')">
            Email error: {{ errors.first('email') }}
        </div>
    </div>
</template>
```

## Form Data Management

### Setting Data

```javascript
// Set all form data
validator.setData({
    email: 'user@example.com',
    password: 'mypassword'
});

// Set single field value
validator.setValue('email', 'user@example.com');

// Set data with scope
validator.setData({ email: 'login@test.com' }, 'loginForm');
validator.setValue('email', 'login@test.com', 'loginForm');
```

### Getting Data

```javascript
// Get all data
const allData = validator.getData();

// Get single field value
const email = validator.getValue('email');

// Get data from scope
const loginData = validator.getData('loginForm');
const loginEmail = validator.getValue('email', 'loginForm');
```

## Validation Events

### Real-time Validation

```javascript
// Validate on input change
document.getElementById('email').addEventListener('input', async (e) => {
    const isValid = await validator.validate().field('email', e.target.value);
    
    // Update UI based on validation result
    e.target.classList.toggle('valid', isValid);
    e.target.classList.toggle('invalid', !isValid);
});

// Validate on blur
document.getElementById('email').addEventListener('blur', async (e) => {
    await validator.validate().field('email', e.target.value);
    
    // Show error message
    const errorElement = document.getElementById('email-error');
    const error = validator.errors().first('email');
    errorElement.textContent = error || '';
});
```

### Form Submission

```javascript
document.getElementById('myForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Validate all fields
    const isValid = await validator.validate(data);
    
    if (isValid) {
        // Submit form
        console.log('Submitting form:', data);
        await submitForm(data);
    } else {
        // Show validation errors
        console.log('Validation failed:', validator.errors().allByField());
        showValidationErrors();
    }
});

async function submitForm(data) {
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Form submitted successfully');
        }
    } catch (error) {
        console.error('Submission error:', error);
    }
}
```

## Complete Example

### JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contact Form</title>
    <style>
        .form-group { margin-bottom: 1rem; }
        .form-control { width: 100%; padding: 0.5rem; }
        .error { border-color: #ef4444; }
        .error-message { color: #ef4444; font-size: 0.875rem; }
        .valid { border-color: #10b981; }
    </style>
</head>
<body>
    <form id="contactForm">
        <div class="form-group">
            <label>Name:</label>
            <input type="text" name="name" class="form-control" placeholder="Your name">
            <div class="error-message" id="name-error"></div>
        </div>
        
        <div class="form-group">
            <label>Email:</label>
            <input type="email" name="email" class="form-control" placeholder="your@email.com">
            <div class="error-message" id="email-error"></div>
        </div>
        
        <div class="form-group">
            <label>Message:</label>
            <textarea name="message" class="form-control" placeholder="Your message"></textarea>
            <div class="error-message" id="message-error"></div>
        </div>
        
        <button type="submit" id="submitBtn">Send Message</button>
    </form>

    <script type="module">
        import { createValidator } from '@vueller/validator';
        
        const validator = createValidator();
        
        // Set validation rules
        validator.setMultipleRules({
            name: { required: true, min: 2 },
            email: { required: true, email: true },
            message: { required: true, min: 10 }
        });
        
        // Get form elements
        const form = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        
        // Real-time validation
        form.addEventListener('input', async (e) => {
            if (e.target.name) {
                await validator.validate().field(e.target.name, e.target.value);
                updateFieldUI(e.target);
            }
        });
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const isValid = await validator.validate(data);
            
            if (isValid) {
                console.log('Form is valid, submitting...', data);
                // Here you would submit to your API
            } else {
                console.log('Form has errors');
                updateAllFieldsUI();
            }
        });
        
        // Update UI for single field
        function updateFieldUI(input) {
            const fieldName = input.name;
            const hasError = validator.errors().has(fieldName);
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            input.classList.toggle('error', hasError);
            input.classList.toggle('valid', !hasError && input.value);
            
            errorElement.textContent = hasError ? validator.errors().first(fieldName) : '';
            
            updateSubmitButton();
        }
        
        // Update UI for all fields
        function updateAllFieldsUI() {
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(updateFieldUI);
        }
        
        // Update submit button state
        function updateSubmitButton() {
            submitBtn.disabled = !validator.isValid();
        }
    </script>
</body>
</html>
```

### Vue.js

```vue
<template>
    <form @submit.prevent="handleSubmit" class="contact-form">
        <div class="form-group">
            <label>Name:</label>
            <input 
                v-model="formData.name"
                type="text" 
                placeholder="Your name"
                :class="{ error: errors.has('name'), valid: !errors.has('name') && formData.name }"
                @blur="validateField('name')"
            />
            <div v-if="errors.has('name')" class="error-message">
                {{ errors.first('name') }}
            </div>
        </div>
        
        <div class="form-group">
            <label>Email:</label>
            <input 
                v-model="formData.email"
                type="email" 
                placeholder="your@email.com"
                :class="{ error: errors.has('email'), valid: !errors.has('email') && formData.email }"
                @blur="validateField('email')"
            />
            <div v-if="errors.has('email')" class="error-message">
                {{ errors.first('email') }}
            </div>
        </div>
        
        <div class="form-group">
            <label>Message:</label>
            <textarea 
                v-model="formData.message"
                placeholder="Your message"
                :class="{ error: errors.has('message'), valid: !errors.has('message') && formData.message }"
                @blur="validateField('message')"
            ></textarea>
            <div v-if="errors.has('message')" class="error-message">
                {{ errors.first('message') }}
            </div>
        </div>
        
        <button type="submit" :disabled="!isValid">
            Send Message
        </button>
    </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useValidator } from '@vueller/validator/vue';

// Form data
const formData = ref({
    name: '',
    email: '',
    message: ''
});

// Validator setup
const { validator } = useValidator();

// Set validation rules
validator.setMultipleRules({
    name: { required: true, min: 2 },
    email: { required: true, email: true },
    message: { required: true, min: 10 }
});

// Reactive validation state
const errors = computed(() => validator.errors());
const isValid = computed(() => validator.isValid());

// Validate single field
const validateField = async (fieldName) => {
    await validator.validate().field(fieldName, formData.value[fieldName]);
};

// Handle form submission
const handleSubmit = async () => {
    const isFormValid = await validator.validate(formData.value);
    
    if (isFormValid) {
        console.log('Form submitted:', formData.value);
        // Submit to API
        await submitForm(formData.value);
    } else {
        console.log('Form has validation errors');
    }
};

// Submit form to API
const submitForm = async (data) => {
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Message sent successfully!');
            // Reset form
            Object.keys(formData.value).forEach(key => {
                formData.value[key] = '';
            });
            validator.reset();
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
};
</script>

<style scoped>
.contact-form {
    max-width: 500px;
    margin: 0 auto;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 1rem;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.error {
    border-color: #ef4444;
}

.valid {
    border-color: #10b981;
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

button {
    background: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    cursor: pointer;
}

button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background: #2563eb;
}

textarea {
    min-height: 100px;
    resize: vertical;
}
</style>
```

## Next Steps

- [Validation Rules](validation-rules.md) - Learn about all available rules
- [JavaScript Examples](../examples/javascript.md) - More JavaScript examples
- [Vue Examples](../examples/vue.md) - More Vue.js examples
- [API Reference](../api/core.md) - Complete API documentation
