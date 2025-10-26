# Advanced Patterns

This guide covers advanced validation patterns and techniques for complex scenarios.

## Complex Validation Scenarios

### Conditional Validation

```javascript
// Validate field based on another field's value
const validator = new Validator();

validator.setRules('email', { required: true, email: true });
validator.setRules('phone', { 
  required: (value, data) => !data.email, // Required if no email
  phone: true 
});
```

### Dynamic Rules

```javascript
// Change rules based on user input
const updateRules = (userType) => {
  if (userType === 'business') {
    validator.setRules('company', { required: true });
    validator.setRules('taxId', { required: true });
  } else {
    validator.setRules('company', {});
    validator.setRules('taxId', {});
  }
};
```

### Multi-Step Forms

```javascript
// Validate specific steps
const validateStep = async (step) => {
  const stepFields = {
    1: ['name', 'email'],
    2: ['address', 'phone'],
    3: ['payment', 'terms']
  };
  
  const fields = stepFields[step];
  return await validator.validateFields(fields);
};
```

## Best Practices

### Performance Optimization

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

## Examples

### E-commerce Checkout

```javascript
const checkoutValidator = new Validator({
  locale: 'en',
  validateOnBlur: true
});

// Shipping validation
checkoutValidator.setRules('shippingAddress', { required: true });
checkoutValidator.setRules('shippingMethod', { required: true });

// Payment validation
checkoutValidator.setRules('paymentMethod', { required: true });
checkoutValidator.setRules('cardNumber', { 
  required: true, 
  pattern: /^\d{16}$/ 
});
```

### User Registration

```javascript
const registrationValidator = new Validator();

// Basic info
registrationValidator.setRules('username', { 
  required: true, 
  min: 3, 
  pattern: /^[a-zA-Z0-9_]+$/ 
});

// Password strength
registrationValidator.setRules('password', { 
  required: true, 
  min: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/ 
});

// Email confirmation
registrationValidator.setRules('email', { required: true, email: true });
registrationValidator.setRules('emailConfirm', { 
  required: true, 
  email: true,
  confirmed: 'email' 
});
```

This guide provides patterns for handling complex validation scenarios in your applications.
