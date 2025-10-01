# Quick Start Guide - Validator Refatorado

## Instalação

```bash
npm install @vueller/validator
```

## Exemplos Rápidos

### 1. Validação Básica

```javascript
import { createValidator } from '@vueller/validator';

// Criar e configurar validador
const validator = createValidator()
  .rules('email', 'required|email')
  .rules('password', 'required|min:8')
  .data({ 
    email: 'user@example.com', 
    password: 'secret123' 
  });

// Validar
const isValid = await validator.validate();
console.log('Form is valid:', isValid);
```

### 2. Validação com Erros

```javascript
import { createValidator } from '@vueller/validator';

const validator = createValidator()
  .rules('email', 'required|email')
  .data({ email: 'invalid-email' });

const isValid = await validator.validate();

if (!isValid) {
  console.log('Errors:', validator.errors().allByField());
  console.log('Email error:', validator.errors().first('email'));
}
```

### 3. Formulário Completo

```javascript
import { createFormValidator } from '@vueller/validator';

const form = createFormValidator({
  rules: {
    name: 'required|min:2',
    email: 'required|email',
    age: 'required|numeric|minValue:18',
    password: 'required|min:8',
    confirmPassword: 'required|confirmed:password'
  },
  initialData: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    password: 'secret123',
    confirmPassword: 'secret123'
  }
});

// Validar e submeter
const success = await form.submit(
  (data) => {
    console.log('Form submitted successfully:', data);
    // Enviar dados para servidor
  },
  (errors) => {
    console.log('Validation failed:', errors);
    // Mostrar erros para usuário
  }
);
```

### 4. Validação Individual de Campos

```javascript
import { createValidator } from '@vueller/validator';

const validator = createValidator();

// Configurar campo
validator.rules('email', 'required|email');

// Validar em tempo real
const emailField = validator.field('email');

emailField.setValue('user@example.com');
const isValid = await emailField.validate();

console.log('Email valid:', isValid);
console.log('Error:', emailField.getError());
```

### 5. Validação Simples (Uma Linha)

```javascript
import { validate, validateData } from '@vueller/validator';

// Validação rápida
console.log(validate.email('test@example.com')); // true
console.log(validate.required('')); // false
console.log(validate.minLength('hello', 3)); // true

// Validação de objeto
const result = await validateData(
  { email: 'user@example.com', name: 'John' },
  { 
    email: 'required|email',
    name: 'required|min:2'
  }
);

console.log('Valid:', result.isValid);
console.log('Errors:', result.errors);
```

### 6. Regras Personalizadas

```javascript
import { createValidator } from '@vueller/validator';

const validator = createValidator()
  .extend('strongPassword', (value) => {
    // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
  }, 'Password must be at least 8 characters with uppercase, lowercase, and number')
  .rules('password', 'required|strongPassword');
```

### 7. Internacionalização

```javascript
import { createValidator } from '@vueller/validator';

const validator = createValidator()
  .locale('pt-BR')
  .messages('pt-BR', {
    required: 'Campo obrigatório',
    email: 'Email inválido',
    min: 'Mínimo de {min} caracteres',
    strongPassword: 'Senha deve ter pelo menos 8 caracteres com maiúscula, minúscula e número'
  });
```

## Vue 3 Examples

### 1. Composable Básico

```vue
<template>
  <div>
    <input 
      v-model="formData.email"
      :class="{ error: hasError('email') }"
      placeholder="Email"
    />
    <div v-if="hasError('email')" class="error">
      {{ getError('email') }}
    </div>
    
    <button @click="handleSubmit" :disabled="!isValid">
      Submit
    </button>
  </div>
</template>

<script setup>
import { useValidation } from '@vueller/validator/vue';

const { 
  formData, 
  isValid, 
  hasError, 
  getError, 
  validate 
} = useValidation({
  rules: {
    email: 'required|email'
  }
});

const handleSubmit = async () => {
  const isValidForm = await validate();
  if (isValidForm) {
    console.log('Submitted:', formData.value);
  }
};
</script>

<style>
.error {
  border-color: red;
}
</style>
```

### 2. Componente de Formulário

```vue
<template>
  <ValidationForm 
    :rules="rules"
    :initial-data="initialData"
    @submit="handleSubmit"
  >
    <template #default="{ formData, errors, setValue, hasError, getError }">
      <div>
        <input 
          :value="formData.email"
          @input="setValue('email', $event.target.value)"
          :class="{ error: hasError('email') }"
          placeholder="Email"
        />
        <div v-if="hasError('email')" class="error">
          {{ getError('email') }}
        </div>
        
        <input 
          :value="formData.name"
          @input="setValue('name', $event.target.value)"
          :class="{ error: hasError('name') }"
          placeholder="Name"
        />
        <div v-if="hasError('name')" class="error">
          {{ getError('name') }}
        </div>
        
        <button type="submit">Submit</button>
      </div>
    </template>
  </ValidationForm>
</template>

<script setup>
import { ValidationForm } from '@vueller/validator/vue';

const rules = {
  email: 'required|email',
  name: 'required|min:2'
};

const initialData = {
  email: 'user@example.com',
  name: 'John Doe'
};

const handleSubmit = (data) => {
  console.log('Form submitted:', data);
};
</script>
```

### 3. Campo de Validação

```vue
<template>
  <ValidationField 
    field="email" 
    rules="required|email"
    label="Email Address"
  >
    <template #default="{ value, error, hasError, setValue }">
      <div>
        <label>Email:</label>
        <input 
          :value="value"
          @input="setValue($event.target.value)"
          :class="{ error: hasError }"
        />
        <div v-if="hasError" class="error">
          {{ error }}
        </div>
      </div>
    </template>
  </ValidationField>
</template>

<script setup>
import { ValidationField } from '@vueller/validator/vue';
</script>
```

### 4. Plugin Global

```javascript
// main.js
import { createApp } from 'vue';
import { createValidationPlugin } from '@vueller/validator/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createValidationPlugin({
  locale: 'pt-BR',
  messages: {
    'pt-BR': {
      required: 'Campo obrigatório',
      email: 'Email inválido',
      min: 'Mínimo de {min} caracteres'
    }
  }
}));

app.mount('#app');
```

## Casos de Uso Comuns

### 1. Formulário de Login

```javascript
const loginForm = createFormValidator({
  rules: {
    email: 'required|email',
    password: 'required|min:6'
  }
});

const handleLogin = async () => {
  await loginForm.submit(
    (data) => authenticateUser(data),
    (errors) => showErrors(errors)
  );
};
```

### 2. Formulário de Registro

```javascript
const registerForm = createFormValidator({
  rules: {
    name: 'required|min:2',
    email: 'required|email',
    password: 'required|min:8',
    confirmPassword: 'required|confirmed:password',
    terms: 'required'
  }
});
```

### 3. Validação em Tempo Real

```javascript
const validator = createValidator();

// Validar enquanto usuário digita
input.addEventListener('input', async (e) => {
  const field = validator.field('email');
  field.setValue(e.target.value);
  await field.validate();
  
  if (field.hasError()) {
    showError(field.getError());
  } else {
    hideError();
  }
});
```

### 4. Validação de API

```javascript
// Validar dados antes de enviar para API
const validateApiData = async (data) => {
  const result = await validateData(data, {
    title: 'required|min:3',
    content: 'required|min:10',
    category: 'required'
  });
  
  if (!result.isValid) {
    throw new Error('Validation failed: ' + JSON.stringify(result.errors));
  }
  
  return data;
};
```

## Próximos Passos

1. **Explore a API**: Teste diferentes métodos e combinações
2. **Customize Regras**: Crie suas próprias regras de validação
3. **Integre com Vue**: Use os composables e componentes
4. **Configure I18n**: Adicione suporte a múltiplos idiomas
5. **Teste Thoroughly**: Valide todos os cenários do seu aplicativo

Para mais informações, consulte a [documentação completa](../api/core.md).
