# API Reference

Complete API documentation for Universal Validator. This reference covers all classes, methods, and interfaces available in the library.

## 📚 API Modules

### [Core API](./core.md)
The foundation of Universal Validator, providing framework-agnostic validation functionality:

- **Validator Class** - Main validation engine
- **ErrorBag Class** - Error management and retrieval
- **I18nManager Class** - Internationalization support
- **RuleRegistry Class** - Validation rule management

### [Vue Components](./vue.md)
Vue.js specific components and composables:

- **ValidatorForm Component** - Form wrapper with validation
- **ValidatorField Component** - Individual field validation
- **useValidator Composable** - Composition API integration
- **Plugin Installation** - Global Vue.js setup

### [Universal API](./universal.md)
Framework-agnostic validation interface:

- **Global Validator Instance** - Pre-configured validator
- **Simplified Methods** - Easy-to-use validation functions
- **Cross-framework Compatibility** - Works everywhere

## 🎯 Quick Reference

### Core Methods

```javascript
// Create validator
const validator = createValidator(options)

// Set validation rules
validator.setRules(field, rules, messages?)
validator.setMultipleRules(rulesObject, messagesObject?)

// Validate data
await validator.validate(scopeOrData?, data?)
await validator.validate(scope).field(fieldName, value?)

// Access validation state
validator.errors()     // ErrorBag instance
validator.isValid()    // boolean
validator.hasErrors()  // boolean

// Manage data
validator.setData(data, scope?)
validator.getData(scope?)
validator.setValue(field, value, scope?)
validator.getValue(field, scope?)

// Custom rules
validator.extend(ruleName, validatorFn, message?)

// Internationalization
validator.setLocale(locale)
validator.addMessages(locale, messages)
```

### Vue Composable

```javascript
// Use in Vue components
const { validator, errors, isValid } = useValidator(options?)

// Reactive validation state
const errors = computed(() => validator.errors())
const isValid = computed(() => validator.isValid())

// Validate with reactivity
await validator.validate(formData.value)
```

### Universal API

```javascript
// Import global validator
import { validator } from '@vueller/validator/universal'

// Use anywhere
await validator.validate(data)
validator.setRules(field, rules)
const errors = validator.getErrors()
```

## 📖 Type Definitions

### Validation Rules Interface

```typescript
interface ValidationRules {
  required?: boolean
  email?: boolean
  min?: number
  max?: number
  numeric?: boolean
  pattern?: RegExp
  confirmed?: string
  [customRule: string]: any
}
```

### Validator Options

```typescript
interface ValidatorOptions {
  locale?: string
  validateOnBlur?: boolean
  validateOnInput?: boolean
  stopOnFirstFailure?: boolean
}
```

### Error Bag Interface

```typescript
interface ErrorBagInterface {
  add(field: string, message: string): void
  remove(field: string): void
  clear(): void
  has(field: string): boolean
  first(field: string): string | null
  get(field: string): string[]
  all(): string[]
  allByField(): Record<string, string[]>
  any(): boolean
  count(): number
  keys(): string[]
}
```

## 🔧 Advanced Usage Patterns

### Custom Rule Creation

```javascript
// Synchronous rule
validator.extend('ruleName', (value, ...params) => {
  // Return true if valid, false if invalid
  return validationLogic(value, params)
}, 'Error message with {field} and {parameter} placeholders')

// Asynchronous rule
validator.extend('asyncRule', async (value) => {
  const result = await apiCall(value)
  return result.isValid
}, 'Async validation failed for {field}')
```

### Scope Management

```javascript
// Multiple forms with isolated validation
await validator.validate('loginForm', loginData)
await validator.validate('registerForm', registerData)

// Field-specific validation within scope
await validator.validate('loginForm').field('email', emailValue)

// Scope-specific error retrieval
const loginErrors = validator.errors().get('loginForm.email')
```

### Framework Integration Patterns

```javascript
// React Hook Pattern
function useValidator(rules) {
  const [validator] = useState(() => createValidator())
  const [errors, setErrors] = useState({})
  
  useEffect(() => {
    const unsubscribe = validator.subscribe(() => {
      setErrors(validator.errors().allByField())
    })
    return unsubscribe
  }, [validator])
  
  return { validator, errors }
}

// Angular Service Pattern
@Injectable()
export class ValidationService {
  private validator = createValidator()
  
  validate(data: any): Promise<boolean> {
    return this.validator.validate(data)
  }
}
```

## 📋 Method Categories

### Validation Methods
- `validate()` - Main validation method
- `validateField()` - Single field validation (deprecated)
- `validateAll()` - All fields validation (deprecated)

### Rule Management
- `setRules()` - Set rules for single field
- `setMultipleRules()` - Set rules for multiple fields
- `extend()` - Add custom validation rule

### Data Management
- `setData()` - Set form data for scope
- `getData()` - Get form data from scope
- `setValue()` - Set single field value
- `getValue()` - Get single field value

### Error Handling
- `errors()` - Get ErrorBag instance
- `isValid()` - Check if validation passed
- `hasErrors()` - Check if errors exist
- `reset()` - Reset validation state

### Internationalization
- `setLocale()` - Set current locale
- `addMessages()` - Add localized messages
- `setMessages()` - Set global messages

### State Management
- `subscribe()` - Listen to validation changes
- `getState()` - Get reactive state helpers
- `createVueState()` - Create Vue-compatible state

## 🔗 Related Documentation

- [**Installation Guide**](../guide/installation.md) - Setup instructions
- [**Basic Usage**](../guide/basic-usage.md) - Getting started tutorial
- [**Advanced Guide**](../guide/advanced.md) - Advanced patterns and techniques
- [**Examples**](../examples/) - Practical implementation examples
