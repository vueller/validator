# 📋 Validation Rules

## Built-in Rules

### Required Rule

Ensures the field has a value and is not empty.

```javascript
// Basic usage
validator.setRules('email', { required: true });

// Custom message
validator.setRules(
  'email',
  { required: true },
  {
    required: 'Email address is required'
  }
);
```

**Examples:**

- ✅ `'user@example.com'` - Valid
- ✅ `'0'` - Valid (string zero)
- ✅ `0` - Valid (number zero)
- ❌ `''` - Invalid (empty string)
- ❌ `null` - Invalid
- ❌ `undefined` - Invalid
- ❌ `'   '` - Invalid (only whitespace)

### Email Rule

Validates email format using RFC 5322 standard.

```javascript
// Basic usage
validator.setRules('email', { email: true });

// Combined with required
validator.setRules('email', {
  required: true,
  email: true
});
```

**Examples:**

- ✅ `'user@example.com'` - Valid
- ✅ `'test.email+tag@domain.co.uk'` - Valid
- ✅ `'user123@sub.domain.org'` - Valid
- ❌ `'invalid-email'` - Invalid
- ❌ `'@domain.com'` - Invalid
- ❌ `'user@'` - Invalid

### Min Rule

Validates minimum length for strings or minimum value for numbers.

```javascript
// Minimum length for strings
validator.setRules('password', { min: 8 });

// Minimum value for numbers
validator.setRules('age', { min: 18 });

// Custom message
validator.setRules(
  'password',
  { min: 8 },
  {
    min: 'Password must be at least 8 characters long'
  }
);
```

**Examples (min: 8):**

- ✅ `'password123'` - Valid (9 characters)
- ✅ `12345678` - Valid (number >= 8)
- ❌ `'short'` - Invalid (5 characters)
- ❌ `5` - Invalid (number < 8)

### Max Rule

Validates maximum length for strings or maximum value for numbers.

```javascript
// Maximum length for strings
validator.setRules('username', { max: 20 });

// Maximum value for numbers
validator.setRules('age', { max: 120 });

// Combined min/max
validator.setRules('username', {
  min: 3,
  max: 20
});
```

**Examples (max: 20):**

- ✅ `'validusername'` - Valid (13 characters)
- ✅ `15` - Valid (number <= 20)
- ❌ `'thisusernameistoolongtobevalid'` - Invalid (31 characters)
- ❌ `25` - Invalid (number > 20)

### Numeric Rule

Ensures the value is numeric (integer or decimal).

```javascript
// Basic numeric validation
validator.setRules('price', { numeric: true });

// Combined with min/max
validator.setRules('price', {
  required: true,
  numeric: true,
  min: 0.01,
  max: 999999.99
});
```

**Examples:**

- ✅ `123` - Valid (integer)
- ✅ `123.45` - Valid (decimal)
- ✅ `'123'` - Valid (numeric string)
- ✅ `'123.45'` - Valid (decimal string)
- ❌ `'abc'` - Invalid (non-numeric)
- ❌ `'12.34.56'` - Invalid (multiple decimals)

### Pattern Rule

Validates against a custom regular expression.

```javascript
// Phone number pattern
validator.setRules('phone', {
  pattern: /^\(\d{3}\) \d{3}-\d{4}$/
});

// Alphanumeric only
validator.setRules('code', {
  pattern: /^[a-zA-Z0-9]+$/
});

// Custom message
validator.setRules(
  'phone',
  {
    pattern: /^\(\d{3}\) \d{3}-\d{4}$/
  },
  {
    pattern: 'Phone must be in format (123) 456-7890'
  }
);
```

**Examples (phone pattern):**

- ✅ `'(123) 456-7890'` - Valid
- ✅ `'(999) 888-7777'` - Valid
- ❌ `'123-456-7890'` - Invalid (wrong format)
- ❌ `'(123) 456-78901'` - Invalid (too many digits)

### Confirmed Rule

Validates that a field matches another field (useful for password confirmation).

```javascript
// Password confirmation
validator.setRules('password', { required: true, min: 8 });
validator.setRules('password_confirmation', {
  required: true,
  confirmed: 'password'
});

// Email confirmation
validator.setRules('email_confirmation', {
  confirmed: 'email'
});
```

**Usage Example:**

```javascript
const formData = {
  password: 'mypassword123',
  password_confirmation: 'mypassword123'
};

// This will validate that both passwords match
await validator.validate(formData);
```

## Custom Rules

### Creating Custom Rules

```javascript
// Simple custom rule
validator.extend(
  'evenNumber',
  value => {
    return Number(value) % 2 === 0;
  },
  'The {field} must be an even number'
);

// Rule with parameters
validator.extend(
  'divisibleBy',
  (value, parameter) => {
    return Number(value) % parameter === 0;
  },
  'The {field} must be divisible by {parameter}'
);

// Async rule (for API validation)
validator.extend(
  'uniqueEmail',
  async value => {
    const response = await fetch(`/api/check-email?email=${value}`);
    const result = await response.json();
    return result.isUnique;
  },
  'This email is already taken'
);
```

### Using Custom Rules

```javascript
// Use simple custom rule
validator.setRules('number', {
  required: true,
  numeric: true,
  evenNumber: true
});

// Use rule with parameters
validator.setRules('number', {
  divisibleBy: 5
});

// Use async rule
validator.setRules('email', {
  required: true,
  email: true,
  uniqueEmail: true
});
```

### Advanced Custom Rule

```javascript
validator.extend(
  'strongPassword',
  value => {
    if (!value) return false;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
  },
  'Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters'
);

// Usage
validator.setRules('password', {
  required: true,
  strongPassword: true
});
```

## Rule Combinations

### Common Combinations

```javascript
// User registration form
validator.setMultipleRules({
  // Username: required, 3-20 chars, alphanumeric
  username: {
    required: true,
    min: 3,
    max: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },

  // Email: required and valid format
  email: {
    required: true,
    email: true
  },

  // Password: required, strong password
  password: {
    required: true,
    strongPassword: true
  },

  // Password confirmation
  password_confirmation: {
    required: true,
    confirmed: 'password'
  },

  // Age: required, numeric, 18-120
  age: {
    required: true,
    numeric: true,
    min: 18,
    max: 120
  },

  // Phone: optional, but if provided must match pattern
  phone: {
    pattern: /^\(\d{3}\) \d{3}-\d{4}$/
  }
});
```

### Conditional Rules

```javascript
// Rules that depend on other fields
validator.extend(
  'requiredIf',
  (value, otherField, otherValue) => {
    const otherFieldValue = validator.getValue(otherField);

    if (otherFieldValue === otherValue) {
      return value !== null && value !== undefined && value !== '';
    }

    return true; // Not required if condition not met
  },
  'The {field} is required when {parameter} is {parameter2}'
);

// Usage: billing address required if different from shipping
validator.setRules('billing_address', {
  requiredIf: ['use_different_billing', true]
});
```

## Rule Messages

### Default Messages

```javascript
// English (default)
const defaultMessages = {
  required: 'The {field} field is required',
  email: 'The {field} must be a valid email address',
  min: 'The {field} must be at least {parameter} characters',
  max: 'The {field} may not be greater than {parameter} characters',
  numeric: 'The {field} must be a number',
  pattern: 'The {field} format is invalid',
  confirmed: 'The {field} confirmation does not match'
};
```

### Custom Messages

```javascript
// Field-specific messages
validator.setRules(
  'email',
  {
    required: true,
    email: true
  },
  {
    required: 'Please enter your email address',
    email: 'Please enter a valid email address'
  }
);

// Global message overrides
validator.setMessages({
  required: 'This field is required',
  email: 'Please provide a valid email address'
});

// Localized messages
validator.setLocale('pt-BR');
validator.addMessages('pt-BR', {
  required: 'O campo {field} é obrigatório',
  email: 'O campo {field} deve ser um email válido',
  min: 'O campo {field} deve ter pelo menos {parameter} caracteres'
});
```

### Message Placeholders

Available placeholders in error messages:

- `{field}` - The field name
- `{parameter}` - The rule parameter (e.g., min length)
- `{parameter2}` - Second parameter (for rules with multiple params)
- `{value}` - The field value

```javascript
// Custom message with placeholders
validator.extend(
  'between',
  (value, min, max) => {
    const num = Number(value);
    return num >= min && num <= max;
  },
  'The {field} must be between {parameter} and {parameter2}, but {value} was given'
);
```

## Complete Examples

### JavaScript Form Validation

```html
<form id="registrationForm">
  <div>
    <label>Username:</label>
    <input type="text" name="username" placeholder="Enter username" />
    <div class="error" id="username-error"></div>
  </div>

  <div>
    <label>Email:</label>
    <input type="email" name="email" placeholder="Enter email" />
    <div class="error" id="email-error"></div>
  </div>

  <div>
    <label>Password:</label>
    <input type="password" name="password" placeholder="Enter password" />
    <div class="error" id="password-error"></div>
  </div>

  <div>
    <label>Confirm Password:</label>
    <input type="password" name="password_confirmation" placeholder="Confirm password" />
    <div class="error" id="password_confirmation-error"></div>
  </div>

  <button type="submit">Register</button>
</form>

<script type="module">
  import { createValidator } from '@vueller/validator';

  const validator = createValidator();

  // Set comprehensive validation rules
  validator.setMultipleRules({
    username: {
      required: true,
      min: 3,
      max: 20,
      pattern: /^[a-zA-Z0-9_]+$/
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      min: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    },
    password_confirmation: {
      required: true,
      confirmed: 'password'
    }
  });

  // Custom error messages
  validator.setMessages({
    'username.required': 'Please choose a username',
    'username.pattern': 'Username can only contain letters, numbers, and underscores',
    'password.pattern': 'Password must contain uppercase, lowercase, number, and special character',
    'password_confirmation.confirmed': 'Passwords do not match'
  });

  // Form submission
  document.getElementById('registrationForm').addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const isValid = await validator.validate(data);

    if (isValid) {
      console.log('Registration data:', data);
      // Submit to server
    } else {
      // Display errors
      const errors = validator.errors().allByField();
      Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        errorElement.textContent = errors[field][0];
      });
    }
  });
</script>
```

### Vue.js Component

```vue
<template>
  <form @submit.prevent="handleSubmit" class="registration-form">
    <div class="field-group">
      <label>Username:</label>
      <input
        v-model="formData.username"
        type="text"
        placeholder="Enter username"
        :class="{ error: errors.has('username') }"
      />
      <div v-if="errors.has('username')" class="error-message">
        {{ errors.first('username') }}
      </div>
    </div>

    <div class="field-group">
      <label>Email:</label>
      <input
        v-model="formData.email"
        type="email"
        placeholder="Enter email"
        :class="{ error: errors.has('email') }"
      />
      <div v-if="errors.has('email')" class="error-message">
        {{ errors.first('email') }}
      </div>
    </div>

    <div class="field-group">
      <label>Password:</label>
      <input
        v-model="formData.password"
        type="password"
        placeholder="Enter password"
        :class="{ error: errors.has('password') }"
      />
      <div v-if="errors.has('password')" class="error-message">
        {{ errors.first('password') }}
      </div>
    </div>

    <div class="field-group">
      <label>Confirm Password:</label>
      <input
        v-model="formData.password_confirmation"
        type="password"
        placeholder="Confirm password"
        :class="{ error: errors.has('password_confirmation') }"
      />
      <div v-if="errors.has('password_confirmation')" class="error-message">
        {{ errors.first('password_confirmation') }}
      </div>
    </div>

    <button type="submit" :disabled="!isValid">Register</button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useValidator } from '@vueller/validator/vue';

const formData = ref({
  username: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const { validator } = useValidator();

// Set validation rules
validator.setMultipleRules({
  username: {
    required: true,
    min: 3,
    max: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    min: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  password_confirmation: {
    required: true,
    confirmed: 'password'
  }
});

// Reactive validation state
const errors = computed(() => validator.errors());
const isValid = computed(() => validator.isValid());

// Handle form submission
const handleSubmit = async () => {
  const isFormValid = await validator.validate(formData.value);

  if (isFormValid) {
    console.log('Registration successful:', formData.value);
    // Submit to API
  }
};
</script>
```

## Next Steps

- [JavaScript Examples](../examples/javascript.md) - Complete JavaScript examples
- [Vue Examples](../examples/vue.md) - Complete Vue.js examples
- [API Reference](../api/core.md) - Detailed API documentation
