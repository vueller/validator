# API Reference

Complete API documentation for @vueller/validator.

## Core API

### Validator Class

```javascript
import { Validator } from '@vueller/validator';

const validator = new Validator(options);
```

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locale` | `string` | `'en'` | Default locale for messages |
| `validateOnBlur` | `boolean` | `true` | Validate on field blur |
| `validateOnInput` | `boolean` | `false` | Validate on field input |

#### Methods

##### `setRules(field, rules)`
Set validation rules for a field.

```javascript
validator.setRules('email', { required: true, email: true });
```

##### `setData(data)`
Set form data for validation.

```javascript
validator.setData({ email: 'user@example.com' });
```

##### `validate(scope)`
Validate all fields or specific scope.

```javascript
const isValid = await validator.validate();
```

##### `validateField(field)`
Validate a specific field.

```javascript
const isValid = await validator.validateField('email');
```

##### `errors()`
Get error bag with validation errors.

```javascript
const errors = validator.errors();
console.log(errors.first('email'));
```

## Vue API

### Plugin Installation

```javascript
import { validator } from '@vueller/validator/vue';

app.use(validator, options);
```

### Composables

#### `useValidator()`
Access global validator instance.

```javascript
import { useValidator } from '@vueller/validator/vue';

const { setLocale, validator } = useValidator();
```

#### `useValidation()`
Create local validator instance.

```javascript
import { useValidation } from '@vueller/validator/vue';

const { errors, isValid, validate } = useValidation();
```

### Components

#### `ValidationForm`
Main form validation component.

```vue
<ValidationForm v-slot="{ errors, isValid }" :rules="rules">
  <!-- Form content -->
</ValidationForm>
```

### Directives

#### `v-rules`
Define validation rules.

```vue
<input v-rules="{ required: true, email: true }" />
```

#### `v-label`
Set field label for error messages.

```vue
<input v-label="'E-mail Address'" />
```

## Universal API

### Rule Registration

```javascript
import { Validator } from '@vueller/validator';

// Register custom rule
validator.extend('customRule', CustomRuleClass, 'Fallback message');
```

### Message Management

```javascript
// Add custom rule with fallback message
validator.extend('rule', RuleClass, 'Custom message');

// Add custom messages
validator.i18nManager.addMessages('en', {
  'rule1': 'Message 1',
  'rule2': 'Message 2'
});
```

### Locale Management

```javascript
// Set locale
validator.setLocale('pt-BR');

// Get current locale
const locale = validator.getLocale();
```

## Built-in Rules

### Required
```javascript
{ required: true }
```

### Email
```javascript
{ email: true }
```

### Min Length
```javascript
{ min: 8 }
```

### Max Length
```javascript
{ max: 100 }
```

### Numeric
```javascript
{ numeric: true }
```

### Pattern
```javascript
{ pattern: /^[a-zA-Z]+$/ }
```

## Error Handling

### Error Bag Methods

```javascript
const errors = validator.errors();

// Check if field has errors
errors.has('email');

// Get first error for field
errors.first('email');

// Get all errors for field
errors.get('email');

// Get all errors
errors.all();

// Check if any errors exist
errors.any();

// Clear all errors
errors.clear();

// Remove errors for specific field
errors.remove('email');
```

## TypeScript Support

### Type Definitions

```typescript
interface ValidatorOptions {
  locale?: string;
  validateOnBlur?: boolean;
  validateOnInput?: boolean;
}

interface ValidationRules {
  [field: string]: RuleDefinition;
}

interface RuleDefinition {
  required?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  [key: string]: any;
}
```

This API reference provides comprehensive documentation for all @vueller/validator features.
