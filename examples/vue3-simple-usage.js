/**
 * Vue 3 Simple Usage Example
 * Demonstrates the simplified API for global validator usage
 */

import { createApp } from 'vue';
import { validator } from 'validator'; // or from your local path

// Create Vue app
const app = createApp({
  template: `
    <div>
      <h1>Simple Validator Usage</h1>
      
      <form @submit.prevent="handleSubmit">
        <div>
          <label>Email:</label>
          <input 
            v-model="form.email" 
            v-validate="'required|email'"
            type="email"
          />
          <span v-if="$validator.errors().has('email')" class="error">
            {{ $validator.errors().first('email') }}
          </span>
        </div>
        
        <div>
          <label>Password:</label>
          <input 
            v-model="form.password" 
            v-validate="'required|min:6'"
            type="password"
          />
          <span v-if="$validator.errors().has('password')" class="error">
            {{ $validator.errors().first('password') }}
          </span>
        </div>
        
        <div>
          <label>Age:</label>
          <input 
            v-model="form.age" 
            v-validate="'required|numeric|min_value:18'"
            type="number"
          />
          <span v-if="$validator.errors().has('age')" class="error">
            {{ $validator.errors().first('age') }}
          </span>
        </div>
        
        <button type="submit">Submit</button>
      </form>
      
      <div>
        <h3>Global Validator Controls</h3>
        <button @click="changeLocale('pt-BR')">Português</button>
        <button @click="changeLocale('en')">English</button>
        <p>Current locale: {{ $validator.getLocale() }}</p>
      </div>
    </div>
  `,
  
  data() {
    return {
      form: {
        email: '',
        password: '',
        age: ''
      }
    };
  },
  
  methods: {
    async handleSubmit() {
      // Set form data
      this.$validator.setData(this.form);
      
      // Set validation rules
      this.$validator.setMultipleRules({
        email: 'required|email',
        password: 'required|min:6',
        age: 'required|numeric|min_value:18'
      });
      
      // Validate
      const isValid = await this.$validator.validate();
      
      if (isValid) {
        alert('Form is valid!');
        console.log('Form data:', this.$validator.getData());
      } else {
        console.log('Validation errors:', this.$validator.errors().all());
      }
    },
    
    changeLocale(locale) {
      this.$validator.setLocale(locale);
    }
  }
});

// Install validator plugin with options
app.use(validator, {
  locale: 'en',
  validateOnBlur: true,
  validateOnInput: false
});

// Add custom rules globally with fallback messages
app.config.globalProperties.$validator.addRule('cpf', (value) => {
  // Simple CPF validation (Brazilian document)
  const cpf = value.replace(/\D/g, '');
  return cpf.length === 11 && /^(\d)\1{10}$/.test(cpf) === false;
}, 'The {field} field must be a valid CPF'); // This is the fallback message

// Add custom messages globally (these will override the fallback message)
app.config.globalProperties.$validator.addMessage('pt-BR', 'cpf', 'O campo {field} deve ser um CPF válido');
app.config.globalProperties.$validator.addMessage('en', 'cpf', 'The {field} field must be a valid CPF');

// Example: If you don't add a message for 'fr' locale, it will use the fallback message
// app.config.globalProperties.$validator.addMessage('fr', 'cpf', 'Le champ {field} doit être un CPF valide');

// Mount the app
app.mount('#app');

// You can also access the validator globally
console.log('Available locales:', app.config.globalProperties.$validator.i18nManager.getAvailableLocales());

// Change locale programmatically
app.config.globalProperties.$validator.setLocale('pt-BR');

// Add more custom rules
app.config.globalProperties.$validator.addRule('phone', (value) => {
  const phone = value.replace(/\D/g, '');
  return phone.length >= 10 && phone.length <= 11;
}, 'The {field} field must be a valid phone number');

// Add messages for the new rule
app.config.globalProperties.$validator.addMessage('pt-BR', 'phone', 'O campo {field} deve ser um telefone válido');
app.config.globalProperties.$validator.addMessage('en', 'phone', 'The {field} field must be a valid phone number');
