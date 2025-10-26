/**
 * Fallback Message Demo
 * Demonstrates how the fallback message system works
 */

import { createApp } from 'vue';
import { validator } from 'validator';

const app = createApp({
  template: `
    <div>
      <h1>Fallback Message Demo</h1>
      
      <form @submit.prevent="handleSubmit">
        <div>
          <label>Email:</label>
          <input 
            v-model="form.email" 
            v-validate="'required|email'"
            type="email"
          />
          <div v-if="$validator.errors().has('email')" class="error">
            {{ $validator.errors().first('email') }}
          </div>
        </div>
        
        <div>
          <label>CPF (Brazilian Document):</label>
          <input 
            v-model="form.cpf" 
            v-validate="'required|cpf'"
            type="text"
          />
          <div v-if="$validator.errors().has('cpf')" class="error">
            {{ $validator.errors().first('cpf') }}
          </div>
        </div>
        
        <div>
          <label>Phone:</label>
          <input 
            v-model="form.phone" 
            v-validate="'required|phone'"
            type="text"
          />
          <div v-if="$validator.errors().has('phone')" class="error">
            {{ $validator.errors().first('phone') }}
          </div>
        </div>
        
        <button type="submit">Submit</button>
      </form>
      
      <div>
        <h3>Language Controls</h3>
        <button @click="changeLocale('en')">English</button>
        <button @click="changeLocale('pt-BR')">Português</button>
        <button @click="changeLocale('fr')">Français</button>
        <button @click="changeLocale('es')">Español</button>
        <p>Current locale: {{ $validator.getLocale() }}</p>
      </div>
      
      <div>
        <h3>Message Resolution Demo</h3>
        <p><strong>CPF Rule:</strong></p>
        <ul>
          <li>English: Has custom message → Uses custom message</li>
          <li>Portuguese: Has custom message → Uses custom message</li>
          <li>French: No custom message → Uses fallback message from addRule()</li>
          <li>Spanish: No custom message → Uses fallback message from addRule()</li>
        </ul>
        
        <p><strong>Phone Rule:</strong></p>
        <ul>
          <li>English: Has custom message → Uses custom message</li>
          <li>Portuguese: Has custom message → Uses custom message</li>
          <li>French: No custom message → Uses fallback message from addRule()</li>
          <li>Spanish: No custom message → Uses fallback message from addRule()</li>
        </ul>
      </div>
    </div>
  `,
  
  data() {
    return {
      form: {
        email: '',
        cpf: '',
        phone: ''
      }
    };
  },
  
  methods: {
    async handleSubmit() {
      this.$validator.setData(this.form);
      this.$validator.setMultipleRules({
        email: 'required|email',
        cpf: 'required|cpf',
        phone: 'required|phone'
      });
      
      const isValid = await this.$validator.validate();
      if (isValid) {
        alert('Form is valid!');
      } else {
        console.log('Validation errors:', this.$validator.errors().all());
      }
    },
    
    changeLocale(locale) {
      this.$validator.setLocale(locale);
    }
  }
});

// Install validator
app.use(validator, {
  locale: 'en',
  validateOnBlur: true
});

// Register CPF rule with fallback message
app.config.globalProperties.$validator.addRule('cpf', (value) => {
  const cpf = value.replace(/\D/g, '');
  return cpf.length === 11 && /^(\d)\1{10}$/.test(cpf) === false;
}, 'The {field} field must be a valid CPF'); // Fallback message

// Register Phone rule with fallback message
app.config.globalProperties.$validator.addRule('phone', (value) => {
  const phone = value.replace(/\D/g, '');
  return phone.length >= 10 && phone.length <= 11;
}, 'The {field} field must be a valid phone number'); // Fallback message

// Add custom messages for specific locales (these override fallback messages)
app.config.globalProperties.$validator.addMessage('en', 'cpf', 'The {field} field must be a valid CPF');
app.config.globalProperties.$validator.addMessage('en', 'phone', 'The {field} field must be a valid phone number');

app.config.globalProperties.$validator.addMessage('pt-BR', 'cpf', 'O campo {field} deve ser um CPF válido');
app.config.globalProperties.$validator.addMessage('pt-BR', 'phone', 'O campo {field} deve ser um telefone válido');

// Note: We intentionally don't add messages for 'fr' and 'es' locales
// This will demonstrate how fallback messages work

app.mount('#app');

// Demo: Show how messages are resolved
console.log('=== Message Resolution Demo ===');

// Change to French (no custom messages defined)
app.config.globalProperties.$validator.setLocale('fr');
console.log('French locale - will use fallback messages:');
console.log('CPF fallback:', app.config.globalProperties.$validator.i18nManager.getMessage('cpf', 'cpf', {}, 'fr', 'The {field} field must be a valid CPF'));
console.log('Phone fallback:', app.config.globalProperties.$validator.i18nManager.getMessage('phone', 'phone', {}, 'fr', 'The {field} field must be a valid phone number'));

// Change to English (has custom messages)
app.config.globalProperties.$validator.setLocale('en');
console.log('English locale - will use custom messages:');
console.log('CPF custom:', app.config.globalProperties.$validator.i18nManager.getMessage('cpf', 'cpf', {}, 'en', 'The {field} field must be a valid CPF'));
console.log('Phone custom:', app.config.globalProperties.$validator.i18nManager.getMessage('phone', 'phone', {}, 'en', 'The {field} field must be a valid phone number'));
