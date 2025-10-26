# JavaScript Usage

Using @vueller/validator with vanilla JavaScript.

## Installation

```bash
npm install @vueller/validator
```

## Basic Usage

### Creating a Validator Instance

```javascript
import { Validator } from '@vueller/validator';

const validator = new Validator({
  locale: 'en',
  validateOnBlur: true,
  validateOnInput: false
});
```

### Setting Validation Rules

```javascript
// Set rules for individual fields
validator.setRules('email', { required: true, email: true });
validator.setRules('password', { required: true, min: 8 });
validator.setRules('age', { required: true, min: 18 });
```

### Setting Form Data

```javascript
// Set form data
validator.setData({
  email: 'user@example.com',
  password: 'mypassword123',
  age: 25
});
```

### Validating Forms

```javascript
// Validate all fields
const isValid = await validator.validate();

if (isValid) {
  console.log('Form is valid!');
} else {
  const errors = validator.errors();
  console.log('Validation errors:', errors.all());
}
```

## Advanced Usage

### Field-Specific Validation

```javascript
// Validate specific field
const isEmailValid = await validator.validateField('email');

if (!isEmailValid) {
  const emailError = validator.errors().first('email');
  console.log('Email error:', emailError);
}
```

### Custom Rules

```javascript
// Define custom rule
class CustomRule {
  validate(value) {
    return value === 'custom';
  }
  
  message(field) {
    return `The ${field} field must be "custom"`;
  }
}

// Register custom rule
validator.extend('custom', CustomRule, 'Must be custom value');

// Use custom rule
validator.setRules('field', { required: true, custom: true });
```

### Message Management

```javascript
// Add custom message
validator.i18nManager.addMessages('en', { email: 'Please enter a valid email address' });

// Add multiple messages
validator.i18nManager.addMessages('en', {
  'email': 'Please enter a valid email address',
  'password': 'Password must be at least 8 characters'
});
```

### Locale Management

```javascript
// Change locale
validator.setLocale('pt-BR');

// Get current locale
const currentLocale = validator.getLocale();
console.log('Current locale:', currentLocale);
```

## Error Handling

### Error Bag Methods

```javascript
const errors = validator.errors();

// Check if field has errors
if (errors.has('email')) {
  console.log('Email has errors');
}

// Get first error for field
const firstError = errors.first('email');

// Get all errors for field
const allErrors = errors.get('email');

// Get all errors as object
const allErrorsObject = errors.all();

// Get all errors grouped by field
const errorsByField = errors.allByField();

// Check if any errors exist
if (errors.any()) {
  console.log('Form has validation errors');
}

// Clear all errors
errors.clear();

// Remove errors for specific field
errors.remove('email');
```

## Real-World Examples

### Contact Form

```javascript
import { Validator } from '@vueller/validator';

class ContactForm {
  constructor() {
    this.validator = new Validator({
      locale: 'en',
      validateOnBlur: true
    });
    
    this.setupValidation();
    this.bindEvents();
  }
  
  setupValidation() {
    this.validator.setRules('name', { required: true, min: 2 });
    this.validator.setRules('email', { required: true, email: true });
    this.validator.setRules('message', { required: true, min: 10 });
  }
  
  bindEvents() {
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input.name);
      });
      
      input.addEventListener('input', () => {
        this.updateFormData();
      });
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }
  
  async validateField(fieldName) {
    const isValid = await this.validator.validateField(fieldName);
    this.updateFieldError(fieldName, isValid);
  }
  
  updateFieldError(fieldName, isValid) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const errorElement = field.parentNode.querySelector('.error');
    
    if (!isValid) {
      const error = this.validator.errors().first(fieldName);
      errorElement.textContent = error;
      errorElement.style.display = 'block';
    } else {
      errorElement.style.display = 'none';
    }
  }
  
  updateFormData() {
    const formData = new FormData(document.getElementById('contact-form'));
    const data = Object.fromEntries(formData.entries());
    this.validator.setData(data);
  }
  
  async handleSubmit() {
    const isValid = await this.validator.validate();
    
    if (isValid) {
      const data = this.validator.getData();
      console.log('Submitting form:', data);
      // Submit form data
    } else {
      console.log('Form has validation errors');
      this.showAllErrors();
    }
  }
  
  showAllErrors() {
    const errors = this.validator.errors().allByField();
    
    Object.keys(errors).forEach(fieldName => {
      this.updateFieldError(fieldName, false);
    });
  }
}

// Initialize contact form
new ContactForm();
```

### User Registration

```javascript
import { Validator } from '@vueller/validator';

class UserRegistration {
  constructor() {
    this.validator = new Validator({
      locale: 'en',
      validateOnBlur: true
    });
    
    this.setupValidation();
    this.bindEvents();
  }
  
  setupValidation() {
    // Username validation
    this.validator.setRules('username', {
      required: true,
      min: 3,
      max: 20,
      pattern: /^[a-zA-Z0-9_]+$/
    });
    
    // Email validation
    this.validator.setRules('email', {
      required: true,
      email: true
    });
    
    // Password validation
    this.validator.setRules('password', {
      required: true,
      min: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    });
    
    // Confirm password
    this.validator.setRules('confirmPassword', {
      required: true,
      confirmed: 'password'
    });
    
    // Terms acceptance
    this.validator.setRules('terms', {
      required: true
    });
  }
  
  bindEvents() {
    const form = document.getElementById('registration-form');
    
    // Real-time validation
    form.addEventListener('input', (e) => {
      if (e.target.name) {
        this.updateFormData();
        this.validateField(e.target.name);
      }
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }
  
  async validateField(fieldName) {
    const isValid = await this.validator.validateField(fieldName);
    this.updateFieldUI(fieldName, isValid);
  }
  
  updateFieldUI(fieldName, isValid) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const errorElement = field.parentNode.querySelector('.error');
    const successElement = field.parentNode.querySelector('.success');
    
    if (isValid) {
      errorElement.style.display = 'none';
      successElement.style.display = 'block';
      field.classList.remove('error');
      field.classList.add('success');
    } else {
      const error = this.validator.errors().first(fieldName);
      errorElement.textContent = error;
      errorElement.style.display = 'block';
      successElement.style.display = 'none';
      field.classList.remove('success');
      field.classList.add('error');
    }
  }
  
  updateFormData() {
    const formData = new FormData(document.getElementById('registration-form'));
    const data = Object.fromEntries(formData.entries());
    this.validator.setData(data);
  }
  
  async handleSubmit() {
    const isValid = await this.validator.validate();
    
    if (isValid) {
      const data = this.validator.getData();
      console.log('Registering user:', data);
      // Process registration
    } else {
      console.log('Registration form has errors');
      this.showAllErrors();
    }
  }
  
  showAllErrors() {
    const errors = this.validator.errors().allByField();
    
    Object.keys(errors).forEach(fieldName => {
      this.updateFieldUI(fieldName, false);
    });
  }
}

// Initialize registration form
new UserRegistration();
```

## Best Practices

### Performance

- Use debouncing for real-time validation
- Validate only changed fields
- Cache validation results when possible

### User Experience

- Show validation errors immediately
- Provide helpful error messages
- Use progressive validation

### Code Organization

- Separate validation logic from UI
- Use custom rules for complex validation
- Centralize validation configuration

This guide provides comprehensive examples for using @vueller/validator with vanilla JavaScript.
