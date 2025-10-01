# 🔧 Core API Reference

Complete reference for the core `Validator`, `ErrorBag`, `I18nManager`, and `RuleRegistry` APIs.

## Table of Contents

- [Validator Class](#validator-class)
- [ErrorBag Class](#errorbag-class)
- [I18nManager Class](#i18nmanager-class)
- [RuleRegistry Class](#ruleregistry-class)
- [Types & Interfaces](#types--interfaces)

## Validator Class

The main validation engine that handles rules, data, and validation logic.

### Constructor

```javascript
import { Validator } from '@vueller/validator';

const validator = new Validator({ locale: 'en' });
```

#### Options

| Option                 | Type      | Default | Description                                        |
| ---------------------- | --------- | ------- | -------------------------------------------------- |
| `locale`               | `string`  | `'en'`  | Default locale for error messages                  |
| `stopOnFirstFailure`   | `boolean` | `false` | Stop validating further rules after first failure  |
| `validateEmptyFields`  | `boolean` | `false` | Validate empty values even when not required       |

### Methods

#### `setRules(field, rules, scope='default')`

Set validation rules for a field.

```javascript
// Basic usage
validator.setRules('email', { required: true, email: true });

// In a specific scope
validator.setRules('email', { required: true, email: true }, 'loginForm');
```

**Parameters:**

- `field` (string) - Field name
- `rules` (string|object|array) - Validation rules
- `scope` (string, optional) - Scope identifier (default: 'default')

**Returns:** `Validator` - Chainable instance

#### `setMultipleRules(rulesObject, scope='default')`

Set validation rules for multiple fields at once.

```javascript
validator.setMultipleRules(
  {
    email: { required: true, email: true },
    password: { required: true, min: 8 },
    name: { required: true, min: 2, max: 50 }
  },
  {
    'email.required': 'Email is required',
    'password.min': 'Password must be at least 8 characters'
  }
);
```

**Parameters:**

- `rulesObject` (object) - Object with field names as keys and rules as values
- `scope` (string, optional) - Scope identifier (default: 'default')

**Returns:** `Validator` - Chainable instance

#### `validate(scope='default')`

Validate all fields in a scope.

```javascript
// Validate all fields in default scope
const isValid = await validator.validate();

// Validate all fields in custom scope
const isLoginValid = await validator.validate('loginForm');
```

**Parameters:**

- `scope` (string, optional) - Scope identifier (default: 'default')

**Returns:** `Promise<boolean>` - Validation result

#### `setData(data, scope?)`

Set form data for validation.

```javascript
validator.setData({ email: 'test@test.com', password: '123456' });

// With scope
validator.setData({ email: 'test@test.com' }, 'loginForm');
```

**Parameters:**

- `data` (object) - Form data object
- `scope` (string, optional) - Scope identifier (default: 'default')

**Returns:** `Validator` - Chainable instance

#### `getData(scope?)`

Get form data for a scope.

```javascript
const data = validator.getData();
const loginData = validator.getData('loginForm');
```

**Parameters:**

- `scope` (string, optional) - Scope identifier (default: 'default')

**Returns:** `object` - Form data object

#### `setValue(field, value, scope?)`

Set value for a specific field.

```javascript
validator.setValue('email', 'test@test.com');
validator.setValue('email', 'test@test.com', 'loginForm');
```

**Parameters:**

- `field` (string) - Field name
- `value` (any) - Field value
- `scope` (string, optional) - Scope identifier (default: 'default')

**Returns:** `Validator` - Chainable instance

#### `getValue(field, scope?)`

Get value for a specific field.

```javascript
const email = validator.getValue('email');
const loginEmail = validator.getValue('email', 'loginForm');
```

**Parameters:**

- `field` (string) - Field name
- `scope` (string, optional) - Scope identifier (default: 'default')

**Returns:** `any` - Field value

#### `errors()`

Get the `ErrorBag` instance for accessing validation errors.

```javascript
const errors = validator.errors();

// Check if field has errors
const hasEmailError = errors.has('email');

// Get first error for field
const firstError = errors.first('email');

// Get errors grouped by field
const allErrors = errors.allByField();
```

**Returns:** `ErrorBag` - ErrorBag instance

#### `isValid()`

Check if all validated data is valid.

```javascript
const isValid = validator.isValid();
```

**Returns:** `boolean` - True if no validation errors

#### `hasErrors()`

Check if there are any validation errors.

```javascript
const hasErrors = validator.hasErrors();
```

**Returns:** `boolean` - True if validation errors exist

#### `reset(scope='all')`
 
Reset validation state.

```javascript
// Reset all scopes
validator.reset();

// Reset specific scope
validator.reset('loginForm');
```

**Parameters:**

- `scope` (string, optional) - Scope to reset (if not provided, resets all)

**Returns:** `Validator` - Chainable instance

#### `extend(name, rule, message?)`
 
Add custom validation rule (callback or class-based).

```javascript
// Simple rule
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

// Async rule
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

**Parameters:**
 
- `name` (string) - Name of the custom rule
- `rule` (Function|Class) - Validation function or rule class with `validate`
- `message` (string, optional) - Default error message

**Returns:** `Validator` - Chainable instance

#### `setLocale(locale)`

Set the current locale for error messages.

```javascript
validator.setLocale('pt-BR');
validator.setLocale('es');
```

**Parameters:**

- `locale` (string) - Locale identifier

**Returns:** `Validator` - Chainable instance

#### `getLocale()`

Get current locale.

```javascript
const locale = validator.getLocale();
```

#### `addMessages(locale, messages)`

Add error messages for a specific locale.

```javascript
validator.addMessages('pt-BR', {
  required: 'Este campo é obrigatório',
  email: 'Por favor, insira um endereço de email válido'
});
```

**Parameters:**

- `locale` (string) - Locale identifier
- `messages` (object) - Object with rule names as keys and messages as values

**Returns:** `Validator` - Chainable instance

#### `subscribe(callback)`

Subscribe to validation state changes.

```javascript
const unsubscribe = validator.subscribe(() => {
  console.log('Validation state changed');
  updateUI();
});

// Don't forget to unsubscribe
unsubscribe();
```

**Parameters:**

- `callback` (function) - Function to call when validation state changes

**Returns:** `function` - Unsubscribe function

### Field Validation

#### `validateField(field, scope='default')`

Validate a specific field.

```javascript
const ok = await validator.validateField('email');
const okLogin = await validator.validateField('email', 'loginForm');
```

## ErrorBag Class

Manages validation errors with reactive capabilities.

### Methods

#### `add(field, message)`

Add an error message for a field.

```javascript
errors.add('email', 'Email is required');
```

#### `remove(field)`

Remove all errors for a field.

```javascript
errors.remove('email');
```

#### `clear()`

Clear all errors.

```javascript
errors.clear();
```

#### `has(field)`

Check if field has errors.

```javascript
const hasError = errors.has('email');
```

#### `first(field)`

Get first error message for a field.

```javascript
const firstError = errors.first('email');
```

#### `get(field)`

Get all error messages for a field.

```javascript
const fieldErrors = errors.get('email');
```

#### `all()`

Get all error messages as flat array.

```javascript
const allErrors = errors.all();
```

#### `allByField()`

Get all errors grouped by field.

```javascript
const errorsByField = errors.allByField();
// { email: ['Email is required'], password: ['Password too short'] }
```

#### `any()`

Check if there are any errors.

```javascript
const hasAnyErrors = errors.any();
```


#### `keys()`

Get array of field names that have errors.

```javascript
const fieldsWithErrors = errors.keys();
```

## I18nManager Class

Handles internationalization for error messages.

### Methods

#### `setLocale(locale)`

Set current locale.

```javascript
i18n.setLocale('pt-BR');
```

#### `getLocale()`

Get current locale.

```javascript
const currentLocale = i18n.getLocale();
```

#### `addMessages(locale, messages)`

Add messages for a locale.

```javascript
i18n.addMessages('pt-BR', {
  required: 'Campo obrigatório',
  email: 'Email inválido'
});
```

#### `getMessage(rule, field?, params?)`

Get localized message for a rule.

```javascript
const message = i18n.getMessage('required', 'email');
const message = i18n.getMessage('min', 'password', 8);
```

## RuleRegistry Class

Manages validation rules.

### Methods

#### `add(name, validator, message?)`

Add a validation rule.

```javascript
rules.add('evenNumber', value => Number(value) % 2 === 0, 'Must be even');
```

#### `get(name)`

Get a validation rule.

```javascript
const rule = rules.get('required');
```

#### `has(name)`

Check if rule exists.

```javascript
const exists = rules.has('email');
```

#### `all()`

Get all registered rules.

```javascript
const allRules = rules.all();
```

## Notes

- Messages can reference `{field}` and named parameters provided by rules.
- Use `setFieldLabel(field, label)` to customize the field display name in messages.

## Types & Interfaces

### ValidationRules

```typescript
interface ValidationRules {
  required?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  numeric?: boolean;
  pattern?: RegExp;
  confirmed?: string;
  [customRule: string]: any;
}
```

### ValidationMessages

```typescript
interface ValidationMessages {
  [ruleName: string]: string;
}
```

### FormData

```typescript
interface FormData {
  [fieldName: string]: any;
}
```

### ValidatorOptions

```typescript
interface ValidatorOptions {
  locale?: string;
  validateOnBlur?: boolean;
  validateOnInput?: boolean;
  stopOnFirstFailure?: boolean;
}
```

### FluentAPI

```typescript
interface FluentAPI {
  field(fieldName: string, fieldValue?: any): Promise<boolean>;
  then(resolve: Function, reject?: Function): Promise<boolean>;
}
```

### ErrorBagInterface

```typescript
interface ErrorBagInterface {
  add(field: string, message: string): void;
  remove(field: string): void;
  clear(): void;
  has(field: string): boolean;
  first(field: string): string | null;
  get(field: string): string[];
  all(): string[];
  allByField(): Record<string, string[]>;
  any(): boolean;
  count(): number;
  keys(): string[];
}
```

## Examples

### Basic Usage

```javascript
import { Validator } from '@vueller/validator';

// Create validator
const validator = new Validator({
  locale: 'en'
});

// Set rules
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  confirmPassword: { required: true, confirmed: 'password' }
});

// Validate form
const formData = {
  email: 'user@example.com',
  password: 'mypassword123',
  confirmPassword: 'mypassword123'
};

validator.setData(formData);
const isValid = await validator.validate();

if (isValid) {
  console.log('Form is valid!');
} else {
  console.log('Validation errors:', validator.errors().allByField());
}
```

### Scope-based Validation

```javascript
// Multiple forms on same page
const loginData = { email: 'user@test.com', password: '123456' };
const registerData = { email: 'new@test.com', password: '123456', name: 'John' };

validator.setData(loginData, 'loginForm');
validator.setData(registerData, 'registerForm');

// Validate login form
const isLoginValid = await validator.validate('loginForm');

// Validate register form
const isRegisterValid = await validator.validate('registerForm');

// Validate specific field in scope
const isEmailValid = await validator.validateField('email', 'loginForm');
```

### Custom Rules

```javascript
// Add custom rule
validator.extend(
  'strongPassword',
  value => {
    if (!value) return false;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);

    return hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;
  },
  'Password must contain uppercase, lowercase, number, and special character'
);

// Use custom rule
validator.setRules('password', { required: true, strongPassword: true });
```

### Internationalization

```javascript
// Set locale
validator.setLocale('pt-BR');

// Add Portuguese messages
validator.addMessages('pt-BR', {
  required: 'O campo {field} é obrigatório',
  email: 'O campo {field} deve ser um email válido',
  min: 'O campo {field} deve ter pelo menos {min} caracteres'
});

// Validate with Portuguese messages
validator.setData({ email: '' });
const isValidPt = await validator.validate();
console.log(validator.errors().first('email'));
```

## Next Steps

- [Vue API Reference](vue.md) - Vue-specific components and composables
- [JavaScript Examples](../examples/javascript.md) - Practical JavaScript examples
- [Vue Examples](../examples/vue.md) - Vue.js examples
- [Validation Rules](../guide/validation-rules.md) - Complete rules reference
