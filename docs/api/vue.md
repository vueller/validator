# Vue.js API Reference

Complete API reference for Vue.js specific components, composables, and utilities.

## Components

### ValidationForm

A form wrapper component that provides validation context and handles form submission.

#### Props

| Prop               | Type      | Default     | Description                            |
| ------------------ | --------- | ----------- | -------------------------------------- |
| `modelValue`       | `Object`  | `{}`        | Form data object                       |
| `rules`            | `Object`  | `{}`        | Validation rules (field -> rules)      |
| `labels`           | `Object`  | `{}`        | Field labels for i18n messages         |
| `initialData`      | `Object`  | `{}`        | Initial data (alternative to v-model)  |
| `validateOnSubmit` | `Boolean` | `true`      | Validate on form submission            |
| `validateOnBlur`   | `Boolean` | `true`      | Validate on blur event                 |
| `validateOnInput`  | `Boolean` | `false`     | Validate on input event                |

#### Events

| Event                | Payload  | Description                    |
| -------------------- | -------- | ------------------------------ |
| `update:modelValue`  | `Object` | Emitted when form data changes |
| `submit`             | `Object` | Emitted on form submission     |
| `validation-success` | `Object` | Emitted when validation passes |
| `validation-error`   | `Object` | Emitted when validation fails  |

#### Slots

| Slot      | Props                                  | Description       |
| --------- | -------------------------------------- | ----------------- |
| `default` | `{ values, errors, isValid, hasErrors, isValidating, validate, reset }` | Main form content |

#### Example

```vue
<template>
  <ValidationForm v-model="formData" :rules="rules" @submit="handleSubmit">
    <template #default="{ values, errors, isValid, hasErrors, isValidating, validate }">
      <input name="email" v-model="values.email" type="email" />
      <div v-if="errors.has('email')">{{ errors.first('email') }}</div>
      <button type="submit" :disabled="!isValid || isValidating" @click.prevent="validate()">
        {{ isValidating ? 'Validating...' : 'Submit' }}
      </button>
    </template>
  </ValidationForm>
</template>
```

### ValidatorField

A field wrapper component for individual form field validation.

#### Props

| Prop              | Type      | Default      | Description             |
| ----------------- | --------- | ------------ | ----------------------- |
| `modelValue`      | `Any`     | `''`         | Field value             |
| `field`           | `String`  | **required** | Field name              |
| `rules`           | `Object`  | `{}`         | Field validation rules  |
| `messages`        | `Object`  | `{}`         | Custom error messages   |
| `scope`           | `String`  | `'default'`  | Validation scope        |
| `validateOnBlur`  | `Boolean` | `true`       | Validate on blur event  |
| `validateOnInput` | `Boolean` | `false`      | Validate on input event |

#### Events

| Event               | Payload  | Description                      |
| ------------------- | -------- | -------------------------------- |
| `update:modelValue` | `Any`    | Emitted when field value changes |
| `field-validated`   | `Object` | Emitted after field validation   |
| `field-error`       | `Object` | Emitted when field has errors    |

#### Slots

| Slot      | Props                                              | Description   |
| --------- | -------------------------------------------------- | ------------- |
| `default` | `{ fieldValue, hasError, errorMessage, validate }` | Field content |

#### Example

```vue
<template>
  <ValidatorField
    v-model="email"
    field="email"
    :rules="{ required: true, email: true }"
    scope="login"
  >
    <template #default="{ hasError, errorMessage }">
      <input v-model="email" type="email" :class="{ error: hasError }" />
      <div v-if="hasError">{{ errorMessage }}</div>
    </template>
  </ValidatorField>
</template>
```

## Composables

### useValidation (alias: useValidator)

A composable that provides validator instance and reactive validation state.

#### Parameters

| Parameter | Type     | Default | Description                     |
| --------- | -------- | ------- | ------------------------------- |
| `options` | `Object` | `{}`    | Validator configuration options |

#### Returns

| Property    | Type                    | Description                    |
| ----------- | ----------------------- | ------------------------------ |
| `validator` | `Validator`             | Validator instance             |
| `errors`    | `Object`                | Reactive error helpers         |
| `formData`  | `ComputedRef<Object>`   | Reactive form data             |
| `isValid`   | `ComputedRef<Boolean>`  | Reactive validation state      |
| `hasErrors` | `ComputedRef<Boolean>`  | Reactive error existence check |
| `isValidating` | `ComputedRef<Boolean>` | Reactive validation progress |
| `locale`    | `ComputedRef<String>`   | Current locale                 |
| `validate`  | `(scope?: string) => Promise<boolean>` | Validate scope |
| `validateField` | `(field: string, scope?: string) => Promise<boolean>` | Validate field |
| `setRules`  | `(field: string, rules, scope?: string) => Validator` | Set rules |
| `setMultipleRules` | `(rulesObject, scope?: string) => Validator` | Set multiple rules |
| `setValue`  | `(field: string, value: any, scope?: string) => Validator` | Set value |
| `getValue`  | `(field: string, scope?: string) => any` | Get value |
| `setFieldLabel` | `(field: string, label: string, scope?: string) => Validator` | Set label |
| `setLocale` | `(locale: string) => void` | Set locale |
| `addMessages` | `(locale: string, messages: Record<string,string>) => void` | Add messages |
| `reset`     | `(scope?: string) => void` | Reset                            |

#### Example

```vue
<script setup>
import { useValidation } from '@vueller/validator/vue';

const { validator, errors, formData, isValid, validate, setLocale } = useValidation({ locale: 'en' });

validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 }
});

const handleSubmit = async () => {
  const ok = await validate();
  if (ok) {
    // submit
  }
};

// Change locale globally via plugin helper (if plugin installed)
// import { setGlobalLocale } from '@vueller/validator/vue';
// setGlobalLocale('pt-BR');
</script>
```

## Plugin

### Installation

Install the Vue plugin to enable global validator access and components.

#### Options

| Option             | Type      | Default | Description                        |
| ------------------ | --------- | ------- | ---------------------------------- |
| `globalValidator`  | `Boolean` | `true`  | Create global validator instance   |
| `globalProperties` | `Boolean` | `true`  | Add validator to global properties |
| `locale`           | `String`  | `'en'`  | Default locale                     |
| `validateOnBlur`   | `Boolean` | `true`  | Default blur validation            |
| `validateOnInput`  | `Boolean` | `false` | Default input validation           |

#### Example

```javascript
import { createApp } from 'vue';
import { createValidationPlugin } from '@vueller/validator/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createValidationPlugin({
  globalValidator: true,
  locale: 'en'
}));

app.mount('#app');
```

## Directives

### v-validate

A directive for simple field validation without components.

#### Modifiers

| Modifier | Description              |
| -------- | ------------------------ |
| `.blur`  | Validate on blur event   |
| `.input` | Validate on input event  |
| `.lazy`  | Validate on change event |

#### Example

```vue
<template>
  <form>
    <input v-model="email" v-validate:email="{ required: true, email: true }" type="email" />
    <input
      v-model="password"
      v-validate:password.blur="{ required: true, min: 8 }"
      type="password"
    />
  </form>
</template>
```

### v-rules

A directive for setting validation rules on form elements.

#### Example

```vue
<template>
  <form v-rules="formRules">
    <input name="email" v-model="formData.email" type="email" />
    <input name="password" v-model="formData.password" type="password" />
  </form>
</template>

<script setup>
const formRules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
};
</script>
```

## Plugin Helpers

The Vue entry exports helpers when the plugin is used:

- `getGlobalValidator()` - access the global validator instance
- `setGlobalLocale(locale)` - set locale globally (updates `ValidationForm` instances sharing i18n)

## Reactive State Helpers

### Error Bag Methods

The error bag provides reactive methods for accessing validation errors:

```vue
<script setup>
const { errors } = useValidator();

// Reactive error checking
const hasEmailError = computed(() => errors.value.has('email'));
const emailError = computed(() => errors.value.first('email'));
const allErrors = computed(() => errors.value.allByField());
</script>
```

### Validation State

```vue
<script setup>
const { validator, isValid, hasErrors } = useValidator();

// Reactive validation state
watch(isValid, newValue => {
  console.log('Form validity changed:', newValue);
});

watch(hasErrors, newValue => {
  if (newValue) {
    console.log('Form has errors');
  }
});
</script>
```

## Advanced Patterns

### Custom Validation Component

```vue
<template>
  <div class="custom-field">
    <label>{{ label }}</label>
    <input :value="modelValue" @input="handleInput" @blur="handleBlur" :class="fieldClasses" />
    <div v-if="hasError" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  modelValue: String,
  field: String,
  label: String
});

const emit = defineEmits(['update:modelValue']);

// Inject validator from parent ValidationForm
const validator = inject('validator');

const hasError = computed(() => validator.errors().has(props.field));
const errorMessage = computed(() => validator.errors().first(props.field));
const fieldClasses = computed(() => ({
  'field-error': hasError.value,
  'field-valid': !hasError.value && props.modelValue
}));

const handleInput = e => {
  emit('update:modelValue', e.target.value);
};

const handleBlur = async () => {
  await validator.validate().field(props.field, props.modelValue);
};
</script>
```

### Scoped Validation Hook

```vue
<script setup>
import { ref } from 'vue';
import { useValidator } from '@vueller/validator/vue';

function useScopedValidator(scope, rules) {
  const { validator, errors, isValid } = useValidator();

  // Set rules for this scope
  validator.setMultipleRules(rules);

  const validate = async data => {
    return await validator.validate(scope, data);
  };

  const validateField = async (field, value) => {
    return await validator.validate(scope).field(field, value);
  };

  const getScopedErrors = () => {
    const allErrors = errors.value.allByField();
    return Object.keys(allErrors)
      .filter(key => key.startsWith(`${scope}.`))
      .reduce((acc, key) => {
        const fieldName = key.replace(`${scope}.`, '');
        acc[fieldName] = allErrors[key];
        return acc;
      }, {});
  };

  return {
    validator,
    errors: getScopedErrors,
    isValid,
    validate,
    validateField
  };
}

// Usage
const { validate, errors } = useScopedValidator('login', {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
});
</script>
```

## TypeScript Support

### Component Props Types

```typescript
import type { ValidationRules, ValidationMessages } from '@vueller/validator';

interface ValidationFormProps {
  modelValue?: Record<string, any>;
  rules?: Record<string, ValidationRules>;
  labels?: Record<string, string>;
  initialData?: Record<string, any>;
  validateOnSubmit?: boolean;
  validateOnBlur?: boolean;
  validateOnInput?: boolean;
}

interface ValidatorFieldProps {
  modelValue?: any;
  field: string;
  rules?: ValidationRules;
  messages?: ValidationMessages;
  scope?: string;
  validateOnBlur?: boolean;
  validateOnInput?: boolean;
}
```

### Composable Types

```typescript
import type { Validator } from '@vueller/validator';
import type { ComputedRef } from 'vue';

interface UseValidationReturn {
  validator: Validator;
  errors: {
    has(field: string): boolean;
    first(field: string): string | null;
    get(field: string): string[];
    allByField(): Record<string, string[]>;
    any(): boolean;
    clear(): void;
    keys(): string[];
  };
  formData: ComputedRef<Record<string, any>>;
  isValid: ComputedRef<boolean>;
  hasErrors: ComputedRef<boolean>;
  isValidating: ComputedRef<boolean>;
  locale: ComputedRef<string>;
  validate(scope?: string): Promise<boolean>;
  validateField(field: string, scope?: string): Promise<boolean>;
  setRules(field: string, rules: any, scope?: string): Validator;
  setMultipleRules(rulesObject: Record<string, any>, scope?: string): Validator;
  setValue(field: string, value: any, scope?: string): Validator;
  getValue(field: string, scope?: string): any;
  setFieldLabel(field: string, label: string, scope?: string): Validator;
  setLocale(locale: string): void;
  addMessages(locale: string, messages: Record<string, string>): void;
  reset(scope?: string): void;
}
```

## Next Steps

- [**Core API**](./core.md) - Core validator functionality
- [**Universal API**](./universal.md) - Framework-agnostic API
- [**Vue Examples**](../examples/vue.md) - Practical Vue.js examples
