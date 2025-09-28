<template>
  <div class="validator-examples">
    <h1>Vue Integration Examples</h1>
    
    <!-- Language Selector -->
    <section class="language-selector">
      <h2>Language Selection</h2>
      <div class="selector-group">
        <label for="language">Choose Language:</label>
        <select id="language" v-model="currentLanguage" @change="handleLanguageChange">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
        <span class="current-lang">{{ languageNames[currentLanguage] }}</span>
      </div>
    </section>

    <!-- Example 1: ValidatorForm Component -->
    <section class="example-section">
      <h2>Example 1: ValidatorForm Component</h2>
      
      <ValidatorForm
        :rules="loginRules"
        v-model="loginData"
        scope="loginForm"
        @submit="handleLoginSubmit"
        @validation-success="handleLoginSuccess"
        @validation-error="handleLoginError"
      >
        <template #default="{ errors, isValid, validate }">
          <form class="form-grid">
            <div class="field-group">
              <label for="login-email">Email:</label>
              <input 
                id="login-email"
                v-model="loginData.email" 
                type="email"
                :class="{ error: errors['loginForm.email'] }"
                @blur="validate"
              />
              <span v-if="errors['loginForm.email']" class="error-message">
                {{ errors['loginForm.email'][0] }}
              </span>
            </div>

            <div class="field-group">
              <label for="login-password">Password:</label>
              <input 
                id="login-password"
                v-model="loginData.password" 
                type="password"
                :class="{ error: errors['loginForm.password'] }"
                @blur="validate"
              />
              <span v-if="errors['loginForm.password']" class="error-message">
                {{ errors['loginForm.password'][0] }}
              </span>
            </div>

            <button type="submit" :disabled="!isValid" class="submit-btn">
              {{ getLocalizedText('loginButton') }}
            </button>
          </form>
        </template>
      </ValidatorForm>
    </section>

    <!-- Example 2: ValidatorField Components -->
    <section class="example-section">
      <h2>Example 2: ValidatorField Components</h2>
      
      <form @submit.prevent="handleRegistrationSubmit" class="form-grid">
        <ValidatorField
          field="email"
          :rules="{ required: true, email: true }"
          v-model="registrationData.email"
          scope="registrationForm"
        >
          <template #default="{ fieldErrors, hasError, validate }">
            <div class="field-group">
              <label for="reg-email">Email:</label>
              <input 
                id="reg-email"
                v-model="registrationData.email"
                type="email"
                :class="{ error: hasError }"
                @blur="validate"
              />
              <span v-if="hasError" class="error-message">
                {{ fieldErrors[0] }}
              </span>
            </div>
          </template>
        </ValidatorField>

        <ValidatorField
          field="name"
          :rules="{ required: true, min: 2 }"
          v-model="registrationData.name"
          scope="registrationForm"
        >
          <template #default="{ fieldErrors, hasError, validate }">
            <div class="field-group">
              <label for="reg-name">Name:</label>
              <input 
                id="reg-name"
                v-model="registrationData.name"
                type="text"
                :class="{ error: hasError }"
                @blur="validate"
              />
              <span v-if="hasError" class="error-message">
                {{ fieldErrors[0] }}
              </span>
            </div>
          </template>
        </ValidatorField>

        <ValidatorField
          field="password"
          :rules="{ required: true, min: 8 }"
          v-model="registrationData.password"
          scope="registrationForm"
        >
          <template #default="{ fieldErrors, hasError, validate }">
            <div class="field-group">
              <label for="reg-password">Password:</label>
              <input 
                id="reg-password"
                v-model="registrationData.password"
                type="password"
                :class="{ error: hasError }"
                @blur="validate"
              />
              <span v-if="hasError" class="error-message">
                {{ fieldErrors[0] }}
              </span>
            </div>
          </template>
        </ValidatorField>

        <button type="submit" class="submit-btn">
          {{ getLocalizedText('registerButton') }}
        </button>
      </form>
    </section>

    <!-- Example 3: Composable Usage -->
    <section class="example-section">
      <h2>Example 3: useValidator Composable</h2>
      
      <form @submit.prevent="handleComposableSubmit" class="form-grid">
        <div class="field-group">
          <label for="comp-email">Email:</label>
          <input 
            id="comp-email"
            v-model="composableData.email"
            type="email"
            :class="{ error: composableErrors['composableForm.email'] }"
            @blur="validateComposableField('email')"
          />
          <span v-if="composableErrors['composableForm.email']" class="error-message">
            {{ composableErrors['composableForm.email'][0] }}
          </span>
        </div>

        <div class="field-group">
          <label for="comp-phone">Phone:</label>
          <input 
            id="comp-phone"
            v-model="composableData.phone"
            type="tel"
            placeholder="(11) 99999-9999"
            :class="{ error: composableErrors['composableForm.phone'] }"
            @blur="validateComposableField('phone')"
          />
          <span v-if="composableErrors['composableForm.phone']" class="error-message">
            {{ composableErrors['composableForm.phone'][0] }}
          </span>
        </div>

        <button type="submit" :disabled="!composableIsValid" class="submit-btn">
          {{ getLocalizedText('validateButton') }}
        </button>
      </form>
    </section>

    <!-- Results Display -->
    <section v-if="lastResult" class="results-section">
      <h2>Last Validation Result</h2>
      <div class="result-display">
        <div class="result-header">
          <span class="result-type">{{ lastResult.type }}</span>
          <span class="result-language">{{ lastResult.language }}</span>
          <span class="result-status" :class="{ valid: lastResult.isValid, invalid: !lastResult.isValid }">
            {{ lastResult.isValid ? '✓ Valid' : '✗ Invalid' }}
          </span>
        </div>
        <pre class="result-data">{{ JSON.stringify(lastResult, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { ValidatorForm, ValidatorField, useValidator, validator } from '@vueller/validator';
import { ptBR, en } from '@vueller/validator/locales';

export default {
  name: 'VueIntegrationExamples',
  
  components: {
    ValidatorForm,
    ValidatorField
  },
  
  setup() {
    // ===== REACTIVE STATE =====
    
    const currentLanguage = ref('pt-BR');
    const lastResult = ref(null);
    
    // Form data
    const loginData = reactive({
      email: '',
      password: ''
    });
    
    const registrationData = reactive({
      email: '',
      name: '',
      password: ''
    });
    
    const composableData = reactive({
      email: '',
      phone: ''
    });
    
    // ===== LANGUAGE CONFIGURATION =====
    
    const languageNames = {
      'pt-BR': 'Português (Brasil)',
      'en': 'English',
      'es': 'Español',
      'fr': 'Français'
    };
    
    const languageConfig = {
      'pt-BR': {
        file: ptBR,
        custom: {
          'email.required': 'Email é obrigatório',
          'email.email': 'Email inválido',
          'password.required': 'Senha é obrigatória',
          'password.min': 'Senha deve ter pelo menos {min} caracteres',
          'name.required': 'Nome é obrigatório',
          'name.min': 'Nome deve ter pelo menos {min} caracteres',
          'phone.required': 'Telefone é obrigatório',
          'phone.pattern': 'Telefone deve estar no formato (11) 99999-9999'
        },
        texts: {
          loginButton: 'Entrar',
          registerButton: 'Registrar',
          validateButton: 'Validar'
        }
      },
      'en': {
        file: en,
        custom: {
          'email.required': 'Email is required',
          'email.email': 'Invalid email address',
          'password.required': 'Password is required',
          'password.min': 'Password must be at least {min} characters',
          'name.required': 'Name is required',
          'name.min': 'Name must be at least {min} characters',
          'phone.required': 'Phone is required',
          'phone.pattern': 'Phone must be in format (11) 99999-9999'
        },
        texts: {
          loginButton: 'Login',
          registerButton: 'Register',
          validateButton: 'Validate'
        }
      },
      'es': {
        file: null,
        custom: {
          required: 'El campo {field} es obligatorio',
          email: 'El campo {field} debe ser un email válido',
          min: 'El campo {field} debe tener al menos {min} caracteres',
          pattern: 'El formato del campo {field} es inválido'
        },
        texts: {
          loginButton: 'Iniciar Sesión',
          registerButton: 'Registrarse',
          validateButton: 'Validar'
        }
      },
      'fr': {
        file: null,
        custom: {
          required: 'Le champ {field} est requis',
          email: 'Le champ {field} doit être un email valide',
          min: 'Le champ {field} doit avoir au moins {min} caractères',
          pattern: 'Le format du champ {field} est invalide'
        },
        texts: {
          loginButton: 'Se Connecter',
          registerButton: 'S\'inscrire',
          validateButton: 'Valider'
        }
      }
    };
    
    // ===== VALIDATION RULES =====
    
    const loginRules = {
      email: { required: true, email: true },
      password: { required: true, min: 8 }
    };
    
    // ===== COMPOSABLE FOR MANUAL VALIDATION =====
    
    const { 
      validator: composableValidator, 
      errors: composableErrors, 
      isValid: composableIsValid 
    } = useValidator();
    
    // ===== COMPUTED =====
    
    const getLocalizedText = computed(() => {
      return (key) => {
        return languageConfig[currentLanguage.value]?.texts?.[key] || key;
      };
    });
    
    // ===== METHODS =====
    
    const setupLanguage = (language) => {
      const config = languageConfig[language];
      if (!config) return;
      
      validator.setLocale(language);
      validator.loadTranslations(config.file, config.custom);
      
      console.log(`Language switched to: ${languageNames[language]}`);
    };
    
    const handleLanguageChange = () => {
      setupLanguage(currentLanguage.value);
    };
    
    // Form handlers
    const handleLoginSubmit = (submitData) => {
      lastResult.value = {
        type: 'ValidatorForm (Login)',
        language: languageNames[currentLanguage.value],
        ...submitData
      };
      
      console.log('Login form submitted:', submitData);
    };
    
    const handleLoginSuccess = (data) => {
      console.log('Login validation successful:', data);
    };
    
    const handleLoginError = (errorData) => {
      console.log('Login validation failed:', errorData);
    };
    
    const handleRegistrationSubmit = async () => {
      const isValid = await validator.validate('registrationForm', registrationData);
      const errors = validator.getErrors();
      
      lastResult.value = {
        type: 'ValidatorField (Registration)',
        language: languageNames[currentLanguage.value],
        isValid,
        errors,
        data: { ...registrationData }
      };
      
      console.log('Registration form submitted:', lastResult.value);
    };
    
    const handleComposableSubmit = async () => {
      // Set up rules for composable form
      composableValidator.setMultipleRules({
        email: { required: true, email: true },
        phone: { required: true, pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ }
      }, {}, 'composableForm');
      
      const isValid = await composableValidator.validate('composableForm', composableData);
      
      lastResult.value = {
        type: 'useValidator Composable',
        language: languageNames[currentLanguage.value],
        isValid,
        errors: { ...composableErrors.value },
        data: { ...composableData }
      };
      
      console.log('Composable form submitted:', lastResult.value);
    };
    
    const validateComposableField = async (fieldName) => {
      composableValidator.setRules(fieldName, 
        fieldName === 'email' 
          ? { required: true, email: true }
          : { required: true, pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ }, 
        {}, 
        'composableForm'
      );
      
      await composableValidator.validate('composableForm').field(fieldName, composableData[fieldName]);
    };
    
    // ===== LIFECYCLE =====
    
    onMounted(() => {
      setupLanguage(currentLanguage.value);
    });
    
    // ===== RETURN =====
    
    return {
      // State
      currentLanguage,
      lastResult,
      loginData,
      registrationData,
      composableData,
      
      // Config
      languageNames,
      loginRules,
      
      // Composable
      composableErrors,
      composableIsValid,
      
      // Computed
      getLocalizedText,
      
      // Methods
      handleLanguageChange,
      handleLoginSubmit,
      handleLoginSuccess,
      handleLoginError,
      handleRegistrationSubmit,
      handleComposableSubmit,
      validateComposableField
    };
  }
};
</script>

<style scoped>
.validator-examples {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.language-selector {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.selector-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.selector-group label {
  font-weight: 600;
}

.selector-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.current-lang {
  font-weight: 500;
  color: #007bff;
}

.example-section {
  margin-bottom: 40px;
  padding: 25px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
}

.example-section h2 {
  margin-top: 0;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.form-grid {
  display: grid;
  gap: 20px;
  max-width: 400px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-group label {
  font-weight: 600;
  color: #495057;
}

.field-group input {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out;
}

.field-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.field-group input.error {
  border-color: #dc3545;
  background-color: #f8d7da;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  font-weight: 500;
}

.submit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.results-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.result-display {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.result-header {
  background: #e9ecef;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
}

.result-type {
  font-weight: 600;
  color: #495057;
}

.result-language {
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 12px;
}

.result-status {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.result-status.valid {
  background: #d4edda;
  color: #155724;
}

.result-status.invalid {
  background: #f8d7da;
  color: #721c24;
}

.result-data {
  margin: 0;
  padding: 16px;
  background: #f8f9fa;
  font-size: 12px;
  overflow-x: auto;
  color: #495057;
}

@media (max-width: 768px) {
  .validator-examples {
    padding: 15px;
  }
  
  .selector-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .result-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
