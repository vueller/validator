# Validator - Refatorado API Documentation

## Visão Geral

O Validator foi completamente refatorado para fornecer uma API mais simples, intuitiva e fácil de usar, mantendo todas as funcionalidades existentes. A nova estrutura segue princípios de clean code e oferece múltiplas camadas de API para diferentes casos de uso.

## Estrutura Refatorada

### Core Components
- **Validator**: Classe principal simplificada
- **ValidationEngine**: Motor de validação isolado
- **FormManager**: Gerenciamento de dados de formulário
- **RuleManager**: Gerenciamento de regras de validação
- **ErrorBag**: Gerenciamento de erros simplificado
- **I18nManager**: Internacionalização simplificada

### API Layers
1. **Low-level API**: Classes core para casos avançados
2. **High-level API**: Funções utilitárias para casos comuns
3. **Vue Integration**: Composable e componentes Vue 3

## Exemplos de Uso

### 1. API Simples (Recomendada)

```javascript
import { createValidator } from '@vueller/validator';

// Criar validador com API fluente
const validator = createValidator()
  .rules('email', 'required|email')
  .rules('name', 'required|min:2')
  .data({ email: 'test@example.com', name: 'John' });

// Validar
const isValid = await validator.validate();
console.log(isValid); // true
```

### 2. Validador de Formulário

```javascript
import { createFormValidator } from '@vueller/validator';

const formValidator = createFormValidator({
  rules: {
    email: 'required|email',
    password: 'required|min:8',
    confirmPassword: 'required|confirmed:password'
  },
  initialData: {
    email: 'user@example.com',
    password: 'secret123',
    confirmPassword: 'secret123'
  }
});

// Validar formulário completo
const isValid = await formValidator.submit(
  (data) => console.log('Form is valid:', data),
  (errors) => console.log('Validation errors:', errors)
);
```

### 3. Validação de Campo Individual

```javascript
import { createValidator } from '@vueller/validator';

const validator = createValidator();

// Configurar campo
const emailField = validator.field('email');
emailField.setLabel('Email Address');
emailField.setValue('test@example.com');

// Validar campo
const isValid = await emailField.validate();
const error = emailField.getError();
```

### 4. Validação Simples (Uma Linha)

```javascript
import { createSimpleValidator, validate } from '@vueller/validator';

// Validação rápida
const isValidEmail = validate.email('test@example.com');

// Validador simples
const simpleValidator = createSimpleValidator('required|email');
const result = await simpleValidator.validate({ value: 'test@example.com' });
```

### 5. Validação com Regras Personalizadas

```javascript
import { createValidator } from '@vueller/validator';

const validator = createValidator()
  .extend('strongPassword', (value) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
  }, 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number')
  .rules('password', 'required|strongPassword');
```

### 6. Internacionalização

```javascript
import { createValidator } from '@vueller/validator';

const validator = createValidator()
  .locale('pt-BR')
  .messages('pt-BR', {
    required: 'Campo obrigatório',
    email: 'Email inválido',
    min: 'Mínimo de {min} caracteres'
  });
```

## Vue 3 Integration

### 1. Composable Simples

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input 
      v-model="formData.email" 
      :class="{ error: hasError('email') }"
    />
    <div v-if="hasError('email')" class="error">
      {{ getError('email') }}
    </div>
    
    <button type="submit" :disabled="!isValid">
      Submit
    </button>
  </form>
</template>

<script setup>
import { useValidation } from '@vueller/validator/vue';

const { 
  formData, 
  isValid, 
  hasError, 
  getError, 
  validate,
  setRules 
} = useValidation({
  rules: {
    email: 'required|email'
  }
});

const handleSubmit = async () => {
  const isValidForm = await validate();
  if (isValidForm) {
    console.log('Form submitted:', formData.value);
  }
};
</script>
```

### 2. Componente de Formulário

```vue
<template>
  <ValidationForm 
    :rules="formRules"
    :initial-data="initialData"
    @submit="handleSubmit"
  >
    <template #default="{ formData, errors, setValue, hasError, getError }">
      <input 
        v-model="formData.email"
        :class="{ error: hasError('email') }"
      />
      <div v-if="hasError('email')" class="error">
        {{ getError('email') }}
      </div>
      
      <button type="submit">Submit</button>
    </template>
  </ValidationForm>
</template>

<script setup>
import { ValidationForm } from '@vueller/validator/vue';

const formRules = {
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
      <input 
        :value="value"
        @input="setValue($event.target.value)"
        :class="{ error: hasError }"
      />
      <div v-if="hasError" class="error">
        {{ error }}
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
import { createApp } from 'vue';
import { createValidationPlugin } from '@vueller/validator/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createValidationPlugin({
  locale: 'pt-BR',
  messages: {
    'pt-BR': {
      required: 'Campo obrigatório',
      email: 'Email inválido'
    }
  },
  rules: {
    customRule: (value) => value.length > 5
  }
}));

app.mount('#app');
```

## Regras de Validação

### Regras Built-in

```javascript
// String format
'required|email|min:5|max:50'

// Array format
['required', 'email', { min: 5 }, { max: 50 }]

// Object format
{
  required: true,
  email: true,
  min: 5,
  max: 50,
  pattern: /^[a-zA-Z0-9]+$/
}
```

### Regras Disponíveis

- `required`: Campo obrigatório
- `email`: Formato de email válido
- `min`: Comprimento mínimo (strings/arrays)
- `max`: Comprimento máximo (strings/arrays)
- `minValue`: Valor mínimo (números)
- `maxValue`: Valor máximo (números)
- `numeric`: Valor numérico
- `pattern`: Padrão regex
- `confirmed`: Confirmação de campo

### Regras Personalizadas

```javascript
// Função simples
validator.extend('custom', (value) => value.length > 5);

// Classe de regra
class CustomRule extends BaseRule {
  validate(value) {
    return this.customValidation(value);
  }
}

validator.extend('custom', CustomRule);
```

## Migração da API Antiga

### Antes (API Antiga)

```javascript
const validator = new Validator();
validator.setRules('email', 'required|email');
validator.setData({ email: 'test@example.com' });
const isValid = await validator.validate();
```

### Depois (API Refatorada)

```javascript
// Opção 1: API fluente
const validator = createValidator()
  .rules('email', 'required|email')
  .data({ email: 'test@example.com' });
const isValid = await validator.validate();

// Opção 2: API de formulário
const formValidator = createFormValidator({
  rules: { email: 'required|email' },
  initialData: { email: 'test@example.com' }
});
const isValid = await formValidator.submit();

// Opção 3: Validação simples
const result = await validateData(
  { email: 'test@example.com' },
  { email: 'required|email' }
);
```

## Benefícios da Refatoração

1. **API Mais Simples**: Menos código para casos comuns
2. **Melhor Organização**: Separação clara de responsabilidades
3. **Mais Intuitiva**: Nomes de métodos mais claros
4. **Melhor Performance**: Componentes otimizados
5. **Mais Flexível**: Múltiplas camadas de API
6. **Vue 3 Otimizado**: Composables e componentes modernos
7. **TypeScript Ready**: Melhor suporte a tipos
8. **Testes Melhorados**: Cobertura mais abrangente

## Compatibilidade

A refatoração mantém compatibilidade com a API existente, mas recomenda-se migrar para a nova API para obter os benefícios de simplicidade e performance.
