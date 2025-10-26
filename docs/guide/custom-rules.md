# Custom Rules

Creating custom validation rules in @vueller/validator is straightforward and powerful. This guide covers everything you need to know about building, registering, and managing custom rules.

## Creating Custom Rules

### Basic Rule Structure

```javascript
// Custom rule class
class CpfRule {
  constructor() {
    this.name = 'cpf';
  }

  validate(value, params = {}) {
    // Validation logic
    if (!value) return true; // Let required rule handle empty values
    
    // CPF validation logic
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    
    // Check for invalid patterns (all same digits)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  message(field, value, params) {
    return `The ${field} field must contain a valid CPF`;
  }
}

export default CpfRule;
```

### Rule with Parameters

```javascript
class MinAgeRule {
  constructor() {
    this.name = 'minAge';
  }

  validate(value, params = {}) {
    if (!value) return true;
    
    const minAge = params.minAge || 18;
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= minAge;
  }

  message(field, value, params) {
    const minAge = params.minAge || 18;
    return `The ${field} field must be at least ${minAge} years old`;
  }
}

export default MinAgeRule;
```

### Async Rule

```javascript
class UniqueEmailRule {
  constructor() {
    this.name = 'uniqueEmail';
  }

  async validate(value, params = {}) {
    if (!value) return true;
    
    try {
      const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`);
      const data = await response.json();
      return !data.exists;
    } catch (error) {
      console.error('Email validation error:', error);
      return false;
    }
  }

  message(field, value, params) {
    return `The ${field} field must be unique`;
  }
}

export default UniqueEmailRule;
```

## Registering Custom Rules

### Global Registration (Vue Plugin)

```javascript
// main.js
import { validator } from '@vueller/validator/vue';
import CpfRule from './rules/CpfRule.js';
import MinAgeRule from './rules/MinAgeRule.js';

app.use(validator, {
  rules: {
    cpf: {
      rule: CpfRule,
      message: 'Invalid CPF format'
    },
    minAge: {
      rule: MinAgeRule,
      message: 'Must be at least {minAge} years old'
    }
  }
});
```

### Programmatic Registration

```javascript
// Using the global validator instance
import { useValidator } from '@vueller/validator/vue';
import CpfRule from './rules/CpfRule.js';

const { validator } = useValidator();

// Register with fallback message
validator.extend('cpf', CpfRule, 'Invalid CPF format');

// Register with parameters
validator.extend('minAge', MinAgeRule, 'Must be at least {minAge} years old');
```

### Local Registration (Component Level)

```vue
<script setup>
import { useValidator } from '@vueller/validator/vue';
import CpfRule from './rules/CpfRule.js';

const { validator } = useValidator();

// Register rule for this component's scope
validator.extend('cpf', CpfRule, 'Invalid CPF format');
</script>
```

## Message Management

### Fallback Messages

Fallback messages are used when no locale-specific message is defined:

```javascript
// Rule registration with fallback message
validator.extend('cpf', CpfRule, 'Invalid CPF format');

// Usage in validation
validator.setRules('document', { required: true, cpf: true });
// If validation fails, "Invalid CPF format" will be used
```

### Locale-Specific Messages

Override fallback messages with locale-specific ones:

```javascript
const { validator } = useValidator();

// Portuguese message (overrides fallback)
validator.i18nManager.addMessages('pt-BR', { cpf: 'CPF inválido' });

// English message (overrides fallback)
validator.i18nManager.addMessages('en', { cpf: 'Invalid CPF' });
```

### Field-Specific Messages

Override both fallback and locale messages for specific fields:

```javascript
const { validator } = useValidator();

// Field-specific message (highest priority)
validator.i18nManager.addMessages('pt-BR', { 'user.cpf': 'CPF do usuário inválido' });
validator.i18nManager.addMessages('en', { 'user.cpf': 'User CPF is invalid' });
```

### Message Resolution Order

1. **Field-specific message** (`field.rule`) - Highest priority
2. **Rule-specific message** (`rule`) - Medium priority  
3. **Rule fallback message** (from registration) - Low priority
4. **Default fallback** (generic message) - Lowest priority

```javascript
// Example resolution order for field "user.cpf" with rule "cpf"
// 1. Check for "user.cpf" message in current locale
// 2. Check for "cpf" message in current locale  
// 3. Use fallback message from rule registration
// 4. Use generic fallback message
```

## Advanced Patterns

### Rule Composition

Combine multiple rules for complex validation:

```javascript
class PasswordStrengthRule {
  constructor() {
    this.name = 'passwordStrength';
  }

  validate(value, params = {}) {
    if (!value) return true;
    
    const minLength = params.minLength || 8;
    const requireUppercase = params.requireUppercase !== false;
    const requireNumbers = params.requireNumbers !== false;
    const requireSpecial = params.requireSpecial !== false;
    
    if (value.length < minLength) return false;
    if (requireUppercase && !/[A-Z]/.test(value)) return false;
    if (requireNumbers && !/\d/.test(value)) return false;
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;
    
    return true;
  }

  message(field, value, params) {
    const minLength = params.minLength || 8;
    return `The ${field} field must be at least ${minLength} characters long and contain uppercase letters, numbers, and special characters`;
  }
}
```

### Conditional Rules

Create rules that depend on other field values:

```javascript
class ConditionalRule {
  constructor() {
    this.name = 'conditional';
  }

  validate(value, params = {}) {
    const { dependsOn, condition, rule } = params;
    
    // Get dependent field value from validator context
    const dependentValue = this.validator?.getValue(dependsOn);
    
    if (!this.evaluateCondition(dependentValue, condition)) {
      return true; // Skip validation if condition not met
    }
    
    // Apply the actual rule
    return this.applyRule(value, rule);
  }

  evaluateCondition(value, condition) {
    switch (condition.type) {
      case 'equals':
        return value === condition.value;
      case 'notEmpty':
        return value && value.length > 0;
      default:
        return true;
    }
  }

  applyRule(value, rule) {
    // Apply the specified rule
    return rule.validate(value);
  }

  message(field, value, params) {
    return `The ${field} field is required when ${params.dependsOn} meets the condition`;
  }
}
```

### Rule with Custom Error Codes

```javascript
class CustomErrorRule {
  constructor() {
    this.name = 'customError';
  }

  validate(value, params = {}) {
    if (!value) return true;
    
    // Custom validation logic
    const result = this.performValidation(value, params);
    
    if (!result.isValid) {
      // Store custom error code for handling
      this.lastErrorCode = result.errorCode;
      return false;
    }
    
    return true;
  }

  performValidation(value, params) {
    // Return validation result with error code
    if (value.length < 5) {
      return { isValid: false, errorCode: 'TOO_SHORT' };
    }
    
    if (!/^[a-zA-Z]/.test(value)) {
      return { isValid: false, errorCode: 'INVALID_START' };
    }
    
    return { isValid: true };
  }

  message(field, value, params) {
    const errorCode = this.lastErrorCode;
    
    switch (errorCode) {
      case 'TOO_SHORT':
        return `The ${field} field is too short`;
      case 'INVALID_START':
        return `The ${field} field must start with a letter`;
      default:
        return `The ${field} field is invalid`;
    }
  }
}
```

## Testing Custom Rules

### Unit Tests

```javascript
// tests/rules/CpfRule.test.js
import CpfRule from '../../src/rules/CpfRule.js';

describe('CpfRule', () => {
  let rule;

  beforeEach(() => {
    rule = new CpfRule();
  });

  test('should validate correct CPF', () => {
    expect(rule.validate('111.444.777-35')).toBe(true);
    expect(rule.validate('11144477735')).toBe(true);
  });

  test('should reject invalid CPF', () => {
    expect(rule.validate('111.444.777-36')).toBe(false);
    expect(rule.validate('12345678901')).toBe(false);
    expect(rule.validate('111.111.111-11')).toBe(false);
  });

  test('should allow empty values', () => {
    expect(rule.validate('')).toBe(true);
    expect(rule.validate(null)).toBe(true);
    expect(rule.validate(undefined)).toBe(true);
  });

  test('should generate correct error message', () => {
    const message = rule.message('document', 'invalid', {});
    expect(message).toBe('The document field must contain a valid CPF');
  });
});
```

### Integration Tests

```javascript
// tests/integration/CustomRules.test.js
import { Validator } from '@vueller/validator';
import CpfRule from '../rules/CpfRule.js';

describe('Custom Rules Integration', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
    validator.extend('cpf', CpfRule, 'Invalid CPF format');
  });

  test('should validate form with custom rule', async () => {
    validator.setRules('document', { required: true, cpf: true });
    validator.setData({ document: '111.444.777-35' });
    
    const isValid = await validator.validate();
    expect(isValid).toBe(true);
  });

  test('should show custom error message', async () => {
    validator.setRules('document', { required: true, cpf: true });
    validator.setData({ document: '111.444.777-36' });
    
    await validator.validate();
    const errors = validator.errors();
    expect(errors.first('document')).toBe('Invalid CPF format');
  });
});
```

## Best Practices

### 1. Keep Rules Focused

```javascript
// ✅ Good: Single responsibility
class EmailRule {
  validate(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}

// ❌ Avoid: Multiple responsibilities
class EmailAndPhoneRule {
  validate(value, type) {
    if (type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    } else if (type === 'phone') {
      return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value);
    }
  }
}
```

### 2. Handle Empty Values Consistently

```javascript
// ✅ Good: Let required rule handle empty values
class CpfRule {
  validate(value) {
    if (!value) return true; // Let required rule handle this
    // ... validation logic
  }
}

// ❌ Avoid: Duplicating required logic
class CpfRule {
  validate(value) {
    if (!value) return false; // This conflicts with required rule
    // ... validation logic
  }
}
```

### 3. Use Descriptive Error Messages

```javascript
// ✅ Good: Clear, actionable messages
message(field, value, params) {
  return `The ${field} field must contain a valid CPF (11 digits with verification)`;
}

// ❌ Avoid: Vague messages
message(field, value, params) {
  return `Invalid ${field}`;
}
```

### 4. Test Edge Cases

```javascript
// ✅ Good: Comprehensive testing
test('should handle edge cases', () => {
  expect(rule.validate('')).toBe(true);
  expect(rule.validate(null)).toBe(true);
  expect(rule.validate(undefined)).toBe(true);
  expect(rule.validate('   ')).toBe(false);
  expect(rule.validate('invalid')).toBe(false);
});
```

## Common Patterns

### Brazilian Documents

```javascript
// CPF Rule
class CpfRule {
  validate(value) {
    if (!value) return true;
    const cpf = value.replace(/\D/g, '');
    // CPF validation logic...
    return isValid;
  }
}

// CNPJ Rule  
class CnpjRule {
  validate(value) {
    if (!value) return true;
    const cnpj = value.replace(/\D/g, '');
    // CNPJ validation logic...
    return isValid;
  }
}
```

### Phone Numbers

```javascript
class PhoneRule {
  validate(value, params = {}) {
    if (!value) return true;
    
    const country = params.country || 'BR';
    const patterns = {
      BR: /^\(\d{2}\) \d{4,5}-\d{4}$/,
      US: /^\(\d{3}\) \d{3}-\d{4}$/,
      UK: /^\+44 \d{4} \d{6}$/
    };
    
    return patterns[country]?.test(value) || false;
  }
}
```

### File Validation

```javascript
class FileRule {
  validate(file, params = {}) {
    if (!file) return true;
    
    const maxSize = params.maxSize || 5 * 1024 * 1024; // 5MB
    const allowedTypes = params.allowedTypes || ['image/jpeg', 'image/png'];
    
    if (file.size > maxSize) return false;
    if (!allowedTypes.includes(file.type)) return false;
    
    return true;
  }
}
```

This comprehensive guide should help you create robust, maintainable custom validation rules for your applications.
