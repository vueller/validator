# Exemplos de Importação

Este documento mostra as diferentes formas de importar e usar o Universal Validator.

## 📦 **Importações Básicas**

### **JavaScript Universal**
```javascript
// Importar o validator principal
import { validator } from '@vueller/validator';

// Usar
validator.setRules('email', { required: true, email: true });
await validator.validate({ email: 'test@example.com' });
```

### **Vue.js**
```javascript
// Importar componentes e composables do Vue
import { 
  ValidatorForm, 
  ValidatorField, 
  useValidator 
} from '@vueller/validator';

// Usar
const { validator, errors, isValid } = useValidator();
```

## 🌍 **Importações de Locales**

### **Locales Específicos**
```javascript
// Importar locales específicos
import { ptBR, en } from '@vueller/validator/locales';

// Usar
validator.setLocale('pt-BR');
validator.loadTranslations(ptBR);
```

### **Todos os Locales**
```javascript
// Importar todos os locales disponíveis
import { locales } from '@vueller/validator/locales';

// Usar
validator.setLocale('pt-BR');
validator.loadTranslations(locales['pt-BR']);
```

### **Locale + Custom**
```javascript
import { ptBR } from '@vueller/validator/locales';

// Arquivo original + customizações
validator.loadTranslations(ptBR, {
  'email.required': 'Email é obrigatório',
  'password.min': 'Senha muito curta'
});
```

## 🔧 **Importações Avançadas**

### **Core Classes**
```javascript
// Para uso avançado - criar instâncias próprias
import { 
  Validator, 
  ErrorBag, 
  I18nManager,
  createValidator 
} from '@vueller/validator';

// Criar instância customizada
const myValidator = createValidator({
  locale: 'pt-BR',
  stopOnFirstFailure: true
});
```

### **Regras Customizadas**
```javascript
// Importar regras existentes para extensão
import { 
  RequiredRule,
  EmailRule,
  MinRule,
  MaxRule 
} from '@vueller/validator';

// Criar regra baseada em uma existente
class CustomEmailRule extends EmailRule {
  // Customizar comportamento
}
```

## 📁 **Estrutura de Importação**

```
@vueller/validator
├── .                    # Core validator, utils, regras
├── /vue                 # Componentes e composables Vue
└── /locales            # Arquivos de tradução
```

## 🎯 **Casos de Uso Práticos**

### **1. Aplicação JavaScript Simples**
```javascript
import { validator } from '@vueller/validator';
import { ptBR } from '@vueller/validator/locales';

// Configurar
validator.setLocale('pt-BR');
validator.loadTranslations(ptBR);

// Usar
validator.setMultipleRules({
  email: { required: true, email: true },
  password: { required: true, min: 8 }
});

const isValid = await validator.validate({
  email: 'user@example.com',
  password: 'mypassword'
});
```

### **2. Aplicação Vue.js**
```vue
<script setup>
import { ValidatorForm } from '@vueller/validator';
import { ptBR } from '@vueller/validator/locales';

// Configurar tradução
validator.setLocale('pt-BR');
validator.loadTranslations(ptBR, {
  'email.required': 'Digite seu email'
});

const formRules = {
  email: { required: true, email: true },
  password: { required: true, min: 8 }
};
</script>

<template>
  <ValidatorForm :rules="formRules" v-model="formData">
    <!-- Campos do formulário -->
  </ValidatorForm>
</template>
```

### **3. Múltiplos Idiomas**
```javascript
import { validator } from '@vueller/validator';
import { ptBR, en } from '@vueller/validator/locales';

// Configurar múltiplos idiomas
const setupLanguage = (locale) => {
  validator.setLocale(locale);
  
  switch (locale) {
    case 'pt-BR':
      validator.loadTranslations(ptBR, {
        'email.required': 'Email é obrigatório'
      });
      break;
      
    case 'en':
      validator.loadTranslations(en, {
        'email.required': 'Email is required'
      });
      break;
      
    default:
      // Apenas mensagens customizadas
      validator.loadTranslations({
        required: 'Field is required',
        email: 'Invalid email'
      });
  }
};

// Trocar idioma
setupLanguage('pt-BR');
```

### **4. Customização Avançada**
```javascript
import { createValidator } from '@vueller/validator';
import { ptBR } from '@vueller/validator/locales';

// Criar validador customizado
const formValidator = createValidator({
  locale: 'pt-BR',
  stopOnFirstFailure: false,
  validateOnBlur: true
});

// Configurar
formValidator.loadTranslations(ptBR);

// Adicionar regra customizada
formValidator.extend('cpf', (value) => {
  const cpf = value.replace(/\D/g, '');
  return cpf.length === 11 && cpf !== '00000000000';
});

// Usar
formValidator.setRules('document', { required: true, cpf: true });
```

## ✨ **Vantagens da Estrutura de Importação**

### **🎯 Organização:**
- **Separação clara** - Core, Vue, Locales
- **Importação granular** - Apenas o que precisa
- **Tree-shaking** - Bundle menor

### **🚀 Performance:**
- **Lazy loading** - Carrega locales sob demanda
- **Bundle splitting** - Separa código por funcionalidade
- **Otimização** - Webpack/Vite otimizam automaticamente

### **🔧 Flexibilidade:**
- **Modular** - Use apenas partes necessárias
- **Extensível** - Fácil adicionar novos locales
- **Compatível** - Funciona com qualquer bundler

## 📋 **Resumo de Importações**

```javascript
// Core
import { validator, createValidator, Validator } from '@vueller/validator';

// Vue
import { ValidatorForm, ValidatorField, useValidator } from '@vueller/validator';

// Locales
import { ptBR, en, locales } from '@vueller/validator/locales';

// Regras (avançado)
import { RequiredRule, EmailRule } from '@vueller/validator';
```
