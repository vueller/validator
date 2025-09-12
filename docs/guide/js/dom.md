# DOM Integration

Learn advanced DOM manipulation patterns for seamless validation integration in vanilla JavaScript applications.

## Automatic Form Setup

### Data-Attribute Driven Validation

```html
<!DOCTYPE html>
<html>
<head>
  <title>Auto-Setup Form Validation</title>
  <style>
    .form-container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 0.375rem;
      font-size: 1rem;
      transition: all 0.15s ease-in-out;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .form-control.is-valid {
      border-color: #28a745;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' fill='%2328a745' viewBox='0 0 8 8'%3e%3cpath d='m2.3 6.73.94-.94 1.44 1.44L7.88 4.03 6.94 3.09 4.25 5.78 2.3 3.83z'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
    
    .form-control.is-invalid {
      border-color: #dc3545;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.8 4.2 2.4 2.4m0-2.4L5.8 6.6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
    
    .invalid-feedback {
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc3545;
    }
    
    .valid-feedback {
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #28a745;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: #fff;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
      transform: translateY(-1px);
    }
    
    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="form-container">
    <form 
      id="autoForm" 
      data-validator-form
      data-validate-on-blur="true"
      data-validate-on-input="false"
    >
      <h2>User Registration</h2>
      
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input 
          type="text" 
          id="firstName" 
          name="firstName" 
          class="form-control"
          data-rules='{"required": true, "min": 2, "max": 50}'
          data-messages='{"required": "First name is required", "min": "Name too short"}'
          placeholder="Enter your first name"
        >
        <div class="invalid-feedback"></div>
        <div class="valid-feedback">Looks good!</div>
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input 
          type="text" 
          id="lastName" 
          name="lastName" 
          class="form-control"
          data-rules='{"required": true, "min": 2, "max": 50}'
          placeholder="Enter your last name"
        >
        <div class="invalid-feedback"></div>
        <div class="valid-feedback">Looks good!</div>
      </div>

      <div class="form-group">
        <label for="email">Email Address</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          class="form-control"
          data-rules='{"required": true, "email": true, "uniqueEmail": true}'
          data-debounce="500"
          placeholder="Enter your email"
        >
        <div class="invalid-feedback"></div>
        <div class="valid-feedback">Email is available!</div>
        <div class="validation-loading" style="display: none;">
          <span class="loading-spinner"></span> Checking availability...
        </div>
      </div>

      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          class="form-control"
          data-rules='{"required": true, "min": 3, "max": 20, "pattern": "^[a-zA-Z0-9_]+$"}'
          data-messages='{"pattern": "Username can only contain letters, numbers, and underscores"}'
          placeholder="Choose a username"
        >
        <div class="invalid-feedback"></div>
        <div class="valid-feedback">Username is available!</div>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          class="form-control"
          data-rules='{"required": true, "min": 8, "strongPassword": true}'
          placeholder="Create a strong password"
        >
        <div class="invalid-feedback"></div>
        <div class="valid-feedback">Strong password!</div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          type="password" 
          id="confirmPassword" 
          name="confirmPassword" 
          class="form-control"
          data-rules='{"required": true, "confirmed": "password"}'
          data-depends-on="password"
          placeholder="Confirm your password"
        >
        <div class="invalid-feedback"></div>
        <div class="valid-feedback">Passwords match!</div>
      </div>

      <div class="form-group">
        <label for="age">Age</label>
        <input 
          type="number" 
          id="age" 
          name="age" 
          class="form-control"
          data-rules='{"required": true, "numeric": true, "min": 18, "max": 120}'
          placeholder="Enter your age"
        >
        <div class="invalid-feedback"></div>
        <div class="valid-feedback">Valid age!</div>
      </div>

      <button type="submit" class="btn btn-primary" id="submitBtn">
        Create Account
      </button>
    </form>
  </div>

  <script type="module">
    import { Validator } from 'https://unpkg.com/@vueller/validator/dist/validator.esm.js'

    class AutoFormValidator {
      constructor() {
        this.validator = new Validator()
        this.loadingStates = new Map()
        this.debounceTimeouts = new Map()
        
        this.setupCustomRules()
        this.initializeForms()
      }

      setupCustomRules() {
        // Strong password rule
        this.validator.extend('strongPassword', (value) => {
          if (!value) return true
          
          const hasLower = /[a-z]/.test(value)
          const hasUpper = /[A-Z]/.test(value)
          const hasNumber = /\d/.test(value)
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
          
          return hasLower && hasUpper && hasNumber && hasSpecial
        })

        // Confirmed field rule
        this.validator.extend('confirmed', (value, targetField, formData) => {
          if (!value) return true
          return value === formData[targetField]
        })

        // Unique email simulation
        this.validator.extend('uniqueEmail', async (value) => {
          if (!value || !/\S+@\S+\.\S+/.test(value)) return true
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock: emails with 'taken' are not available
          return !value.includes('taken')
        })

        // Add custom messages
        this.validator.addMessages('en', {
          strongPassword: 'Password must contain uppercase, lowercase, number, and special character.',
          confirmed: 'Password confirmation does not match.',
          uniqueEmail: 'This email address is already taken.'
        })
      }

      initializeForms() {
        document.querySelectorAll('[data-validator-form]').forEach(form => {
          this.setupForm(form)
        })
      }

      setupForm(form) {
        const validateOnBlur = form.dataset.validateOnBlur === 'true'
        const validateOnInput = form.dataset.validateOnInput === 'true'

        // Setup individual field validation
        const fields = form.querySelectorAll('[data-rules]')
        fields.forEach(field => {
          this.setupField(field, form, validateOnBlur, validateOnInput)
        })

        // Setup form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e, form))

        // Setup dependent field validation
        this.setupDependentFields(form)
      }

      setupField(field, form, validateOnBlur, validateOnInput) {
        const fieldName = field.name
        const debounceMs = parseInt(field.dataset.debounce) || 300

        if (validateOnBlur) {
          field.addEventListener('blur', () => {
            this.validateField(field, form)
          })
        }

        if (validateOnInput) {
          field.addEventListener('input', () => {
            this.debouncedValidateField(field, form, debounceMs)
          })
        }

        // Clear validation state on focus
        field.addEventListener('focus', () => {
          this.clearFieldState(field)
        })
      }

      setupDependentFields(form) {
        const dependentFields = form.querySelectorAll('[data-depends-on]')
        dependentFields.forEach(field => {
          const dependsOn = field.dataset.dependsOn
          const triggerField = form.querySelector(`[name="${dependsOn}"]`)
          
          if (triggerField) {
            triggerField.addEventListener('input', () => {
              if (field.value) {
                this.debouncedValidateField(field, form, 300)
              }
            })
          }
        })
      }

      async validateField(field, form) {
        const fieldName = field.name
        const value = field.value
        const rules = this.parseRules(field.dataset.rules)
        const customMessages = this.parseMessages(field.dataset.messages)

        if (!rules) return true

        // Show loading state for async rules
        if (this.hasAsyncRules(rules)) {
          this.showLoadingState(field, true)
        }

        try {
          // Get form data for cross-field validation
          const formData = new FormData(form)
          const allData = Object.fromEntries(formData.entries())

          const isValid = await this.validator.validate(value, rules, fieldName, allData)
          
          this.updateFieldUI(field, isValid, customMessages)
          this.updateSubmitButton(form)
          
          return isValid
        } catch (error) {
          console.error('Validation error:', error)
          return false
        } finally {
          this.showLoadingState(field, false)
        }
      }

      debouncedValidateField(field, form, delay) {
        const fieldName = field.name
        
        // Clear existing timeout
        if (this.debounceTimeouts.has(fieldName)) {
          clearTimeout(this.debounceTimeouts.get(fieldName))
        }

        // Set new timeout
        const timeoutId = setTimeout(() => {
          this.validateField(field, form)
          this.debounceTimeouts.delete(fieldName)
        }, delay)

        this.debounceTimeouts.set(fieldName, timeoutId)
      }

      async validateForm(form) {
        const formData = new FormData(form)
        const data = Object.fromEntries(formData.entries())
        
        // Collect all rules
        const allRules = {}
        form.querySelectorAll('[data-rules]').forEach(field => {
          const rules = this.parseRules(field.dataset.rules)
          if (rules) {
            allRules[field.name] = rules
          }
        })

        const isValid = await this.validator.validateAll(data, allRules)
        
        // Update UI for all fields
        form.querySelectorAll('[data-rules]').forEach(field => {
          const hasError = this.validator.errors().has(field.name)
          const customMessages = this.parseMessages(field.dataset.messages)
          this.updateFieldUI(field, !hasError, customMessages)
        })

        this.updateSubmitButton(form)
        return isValid
      }

      updateFieldUI(field, isValid, customMessages = {}) {
        const fieldName = field.name
        
        // Update field classes
        field.classList.remove('is-valid', 'is-invalid')
        field.classList.add(isValid ? 'is-valid' : 'is-invalid')

        // Update feedback messages
        const invalidFeedback = field.parentNode.querySelector('.invalid-feedback')
        const validFeedback = field.parentNode.querySelector('.valid-feedback')

        if (isValid) {
          if (invalidFeedback) invalidFeedback.textContent = ''
          if (validFeedback) validFeedback.style.display = 'block'
        } else {
          if (validFeedback) validFeedback.style.display = 'none'
          
          if (invalidFeedback) {
            let errorMessage = this.validator.errors().first(fieldName)
            
            // Use custom message if available
            const errorType = this.getErrorType(errorMessage)
            if (customMessages[errorType]) {
              errorMessage = customMessages[errorType]
            }
            
            invalidFeedback.textContent = errorMessage
          }
        }
      }

      showLoadingState(field, show) {
        const loadingElement = field.parentNode.querySelector('.validation-loading')
        if (loadingElement) {
          loadingElement.style.display = show ? 'block' : 'none'
        }
        
        this.loadingStates.set(field.name, show)
      }

      clearFieldState(field) {
        field.classList.remove('is-valid', 'is-invalid')
        
        const invalidFeedback = field.parentNode.querySelector('.invalid-feedback')
        const validFeedback = field.parentNode.querySelector('.valid-feedback')
        
        if (invalidFeedback) invalidFeedback.textContent = ''
        if (validFeedback) validFeedback.style.display = 'none'
      }

      updateSubmitButton(form) {
        const submitBtn = form.querySelector('button[type="submit"]')
        if (!submitBtn) return

        const hasErrors = this.validator.errors().any()
        const hasLoadingStates = Array.from(this.loadingStates.values()).some(loading => loading)
        
        submitBtn.disabled = hasErrors || hasLoadingStates
      }

      async handleSubmit(event, form) {
        event.preventDefault()
        
        const submitBtn = form.querySelector('button[type="submit"]')
        const originalText = submitBtn.textContent
        
        submitBtn.disabled = true
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating Account...'

        try {
          const isValid = await this.validateForm(form)
          
          if (isValid) {
            const formData = new FormData(form)
            const data = Object.fromEntries(formData.entries())
            
            console.log('✅ Form is valid! Submitting:', data)
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            alert('Account created successfully!')
            form.reset()
            
            // Clear all validation states
            form.querySelectorAll('[data-rules]').forEach(field => {
              this.clearFieldState(field)
            })
          } else {
            alert('Please fix the errors in the form.')
          }
        } catch (error) {
          console.error('Submit error:', error)
          alert('An error occurred. Please try again.')
        } finally {
          submitBtn.disabled = false
          submitBtn.textContent = originalText
        }
      }

      parseRules(rulesString) {
        if (!rulesString) return null
        
        try {
          return JSON.parse(rulesString)
        } catch (error) {
          console.warn('Invalid rules JSON:', rulesString)
          return null
        }
      }

      parseMessages(messagesString) {
        if (!messagesString) return {}
        
        try {
          return JSON.parse(messagesString)
        } catch (error) {
          console.warn('Invalid messages JSON:', messagesString)
          return {}
        }
      }

      hasAsyncRules(rules) {
        const asyncRuleNames = ['uniqueEmail', 'uniqueUsername']
        return Object.keys(rules).some(rule => asyncRuleNames.includes(rule))
      }

      getErrorType(errorMessage) {
        // Simple heuristic to determine error type from message
        if (errorMessage.includes('required')) return 'required'
        if (errorMessage.includes('email')) return 'email'
        if (errorMessage.includes('minimum') || errorMessage.includes('min')) return 'min'
        if (errorMessage.includes('maximum') || errorMessage.includes('max')) return 'max'
        if (errorMessage.includes('pattern')) return 'pattern'
        return 'generic'
      }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      new AutoFormValidator()
    })
  </script>
</body>
</html>
```

## Dynamic Form Builder

### JSON-driven Form Creation

```javascript
class DynamicFormBuilder {
  constructor(containerSelector, validator) {
    this.container = document.querySelector(containerSelector)
    this.validator = validator
    this.formConfig = null
    this.formElement = null
  }

  buildForm(config) {
    this.formConfig = config
    this.container.innerHTML = ''
    
    // Create form element
    this.formElement = document.createElement('form')
    this.formElement.className = 'dynamic-form'
    
    // Add title if provided
    if (config.title) {
      const title = document.createElement('h2')
      title.textContent = config.title
      this.formElement.appendChild(title)
    }

    // Build fields
    config.fields.forEach(fieldConfig => {
      const fieldElement = this.buildField(fieldConfig)
      this.formElement.appendChild(fieldElement)
    })

    // Add submit button
    const submitBtn = document.createElement('button')
    submitBtn.type = 'submit'
    submitBtn.textContent = config.submitText || 'Submit'
    submitBtn.className = 'btn btn-primary'
    this.formElement.appendChild(submitBtn)

    // Setup validation and events
    this.setupFormValidation()
    
    this.container.appendChild(this.formElement)
  }

  buildField(config) {
    const fieldWrapper = document.createElement('div')
    fieldWrapper.className = 'form-group'

    // Label
    if (config.label) {
      const label = document.createElement('label')
      label.textContent = config.label
      label.setAttribute('for', config.name)
      fieldWrapper.appendChild(label)
    }

    // Input element
    let input
    switch (config.type) {
      case 'select':
        input = this.createSelectElement(config)
        break
      case 'textarea':
        input = this.createTextareaElement(config)
        break
      case 'checkbox':
        input = this.createCheckboxElement(config)
        break
      case 'radio':
        return this.createRadioGroup(config)
      default:
        input = this.createInputElement(config)
    }

    fieldWrapper.appendChild(input)

    // Error message container
    const errorDiv = document.createElement('div')
    errorDiv.className = 'invalid-feedback'
    fieldWrapper.appendChild(errorDiv)

    // Valid message container
    if (config.successMessage) {
      const validDiv = document.createElement('div')
      validDiv.className = 'valid-feedback'
      validDiv.textContent = config.successMessage
      fieldWrapper.appendChild(validDiv)
    }

    return fieldWrapper
  }

  createInputElement(config) {
    const input = document.createElement('input')
    input.type = config.inputType || 'text'
    input.name = config.name
    input.id = config.name
    input.className = 'form-control'
    
    if (config.placeholder) input.placeholder = config.placeholder
    if (config.value !== undefined) input.value = config.value
    if (config.readonly) input.readOnly = true
    if (config.disabled) input.disabled = true
    
    return input
  }

  createSelectElement(config) {
    const select = document.createElement('select')
    select.name = config.name
    select.id = config.name
    select.className = 'form-control'

    if (config.placeholder) {
      const placeholderOption = document.createElement('option')
      placeholderOption.value = ''
      placeholderOption.textContent = config.placeholder
      placeholderOption.disabled = true
      placeholderOption.selected = true
      select.appendChild(placeholderOption)
    }

    config.options.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label
      if (option.selected) optionElement.selected = true
      select.appendChild(optionElement)
    })

    return select
  }

  createTextareaElement(config) {
    const textarea = document.createElement('textarea')
    textarea.name = config.name
    textarea.id = config.name
    textarea.className = 'form-control'
    
    if (config.placeholder) textarea.placeholder = config.placeholder
    if (config.rows) textarea.rows = config.rows
    if (config.value) textarea.value = config.value
    
    return textarea
  }

  createCheckboxElement(config) {
    const wrapper = document.createElement('div')
    wrapper.className = 'form-check'

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.name = config.name
    input.id = config.name
    input.className = 'form-check-input'
    input.value = config.value || '1'
    if (config.checked) input.checked = true

    const label = document.createElement('label')
    label.className = 'form-check-label'
    label.setAttribute('for', config.name)
    label.textContent = config.checkboxLabel || config.label

    wrapper.appendChild(input)
    wrapper.appendChild(label)
    
    return wrapper
  }

  createRadioGroup(config) {
    const fieldWrapper = document.createElement('div')
    fieldWrapper.className = 'form-group'

    if (config.label) {
      const legend = document.createElement('legend')
      legend.textContent = config.label
      legend.className = 'form-label'
      fieldWrapper.appendChild(legend)
    }

    config.options.forEach(option => {
      const radioWrapper = document.createElement('div')
      radioWrapper.className = 'form-check'

      const input = document.createElement('input')
      input.type = 'radio'
      input.name = config.name
      input.id = `${config.name}_${option.value}`
      input.className = 'form-check-input'
      input.value = option.value
      if (option.selected) input.checked = true

      const label = document.createElement('label')
      label.className = 'form-check-label'
      label.setAttribute('for', input.id)
      label.textContent = option.label

      radioWrapper.appendChild(input)
      radioWrapper.appendChild(label)
      fieldWrapper.appendChild(radioWrapper)
    })

    const errorDiv = document.createElement('div')
    errorDiv.className = 'invalid-feedback'
    fieldWrapper.appendChild(errorDiv)

    return fieldWrapper
  }

  setupFormValidation() {
    // Extract validation rules from config
    const rules = {}
    this.formConfig.fields.forEach(field => {
      if (field.validation) {
        rules[field.name] = field.validation
      }
    })

    // Setup field-level validation
    this.formElement.querySelectorAll('input, select, textarea').forEach(element => {
      if (rules[element.name]) {
        element.addEventListener('blur', () => {
          this.validateField(element, rules[element.name])
        })
      }
    })

    // Setup form submission
    this.formElement.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const formData = new FormData(this.formElement)
      const data = Object.fromEntries(formData.entries())
      
      const isValid = await this.validator.validateAll(data, rules)
      
      if (isValid) {
        this.handleFormSubmit(data)
      } else {
        this.displayFormErrors()
      }
    })
  }

  async validateField(element, fieldRules) {
    const value = element.value
    const fieldName = element.name
    
    const isValid = await this.validator.validate(value, fieldRules, fieldName)
    this.updateFieldUI(element, isValid)
  }

  updateFieldUI(element, isValid) {
    const fieldWrapper = element.closest('.form-group')
    const errorDiv = fieldWrapper.querySelector('.invalid-feedback')
    const validDiv = fieldWrapper.querySelector('.valid-feedback')

    element.classList.remove('is-valid', 'is-invalid')
    element.classList.add(isValid ? 'is-valid' : 'is-invalid')

    if (isValid) {
      errorDiv.textContent = ''
      if (validDiv) validDiv.style.display = 'block'
    } else {
      if (validDiv) validDiv.style.display = 'none'
      const error = this.validator.errors().first(element.name)
      errorDiv.textContent = error
    }
  }

  displayFormErrors() {
    const errors = this.validator.errors()
    
    this.formElement.querySelectorAll('input, select, textarea').forEach(element => {
      const hasError = errors.has(element.name)
      this.updateFieldUI(element, !hasError)
    })
  }

  handleFormSubmit(data) {
    console.log('Form submitted:', data)
    
    if (this.formConfig.onSubmit) {
      this.formConfig.onSubmit(data)
    } else {
      alert('Form submitted successfully!')
    }
  }

  // Helper method to update form after creation
  updateFieldValue(fieldName, value) {
    const field = this.formElement.querySelector(`[name="${fieldName}"]`)
    if (field) {
      field.value = value
    }
  }

  // Helper method to get current form data
  getFormData() {
    const formData = new FormData(this.formElement)
    return Object.fromEntries(formData.entries())
  }

  // Helper method to reset form
  resetForm() {
    this.formElement.reset()
    
    // Clear validation states
    this.formElement.querySelectorAll('.form-control').forEach(element => {
      element.classList.remove('is-valid', 'is-invalid')
    })
    
    this.formElement.querySelectorAll('.invalid-feedback').forEach(element => {
      element.textContent = ''
    })
  }
}

// Usage example
const validator = new Validator()

// Setup custom rules
validator.extend('phone', (value) => {
  if (!value) return true
  return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
})

const formBuilder = new DynamicFormBuilder('#form-container', validator)

// Build a registration form
const registrationFormConfig = {
  title: 'User Registration',
  submitText: 'Create Account',
  fields: [
    {
      name: 'firstName',
      type: 'input',
      inputType: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      validation: { required: true, min: 2, max: 50 },
      successMessage: 'Looks good!'
    },
    {
      name: 'email',
      type: 'input',
      inputType: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      validation: { required: true, email: true }
    },
    {
      name: 'phone',
      type: 'input',
      inputType: 'tel',
      label: 'Phone Number',
      placeholder: '(11) 99999-9999',
      validation: { phone: true }
    },
    {
      name: 'gender',
      type: 'select',
      label: 'Gender',
      placeholder: 'Select your gender',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
      ],
      validation: { required: true }
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio',
      placeholder: 'Tell us about yourself',
      rows: 4,
      validation: { max: 500 }
    },
    {
      name: 'newsletter',
      type: 'checkbox',
      label: 'Subscribe to Newsletter',
      checkboxLabel: 'Yes, I want to receive updates',
      value: '1'
    }
  ],
  onSubmit: (data) => {
    console.log('Registration data:', data)
    alert(`Welcome, ${data.firstName}!`)
  }
}

formBuilder.buildForm(registrationFormConfig)
```

## Real-time Validation Patterns

### Validation States Manager

```javascript
class ValidationStateManager {
  constructor(validator) {
    this.validator = validator
    this.states = new Map()
    this.observers = new Map()
  }

  // Subscribe to field validation state changes
  subscribe(fieldName, callback) {
    if (!this.observers.has(fieldName)) {
      this.observers.set(fieldName, [])
    }
    this.observers.get(fieldName).push(callback)
  }

  // Unsubscribe from field validation state changes
  unsubscribe(fieldName, callback) {
    const observers = this.observers.get(fieldName)
    if (observers) {
      const index = observers.indexOf(callback)
      if (index > -1) {
        observers.splice(index, 1)
      }
    }
  }

  // Notify observers of state changes
  notify(fieldName, state) {
    const observers = this.observers.get(fieldName)
    if (observers) {
      observers.forEach(callback => callback(state))
    }
  }

  // Validate field and update state
  async validateField(fieldName, value, rules, formData = {}) {
    const previousState = this.states.get(fieldName)
    
    // Set validating state
    const validatingState = {
      fieldName,
      isValidating: true,
      isValid: false,
      errors: [],
      timestamp: Date.now()
    }
    
    this.states.set(fieldName, validatingState)
    this.notify(fieldName, validatingState)

    try {
      const isValid = await this.validator.validate(value, rules, fieldName, formData)
      const errors = isValid ? [] : this.validator.errors().get(fieldName)
      
      const newState = {
        fieldName,
        isValidating: false,
        isValid,
        errors,
        timestamp: Date.now()
      }
      
      this.states.set(fieldName, newState)
      this.notify(fieldName, newState)
      
      return isValid
    } catch (error) {
      const errorState = {
        fieldName,
        isValidating: false,
        isValid: false,
        errors: ['Validation error occurred'],
        timestamp: Date.now()
      }
      
      this.states.set(fieldName, errorState)
      this.notify(fieldName, errorState)
      
      return false
    }
  }

  // Get current state for a field
  getState(fieldName) {
    return this.states.get(fieldName) || {
      fieldName,
      isValidating: false,
      isValid: true,
      errors: [],
      timestamp: 0
    }
  }

  // Get overall form validity
  isFormValid() {
    for (const [fieldName, state] of this.states) {
      if (!state.isValid || state.isValidating) {
        return false
      }
    }
    return true
  }

  // Clear state for a field
  clearField(fieldName) {
    this.states.delete(fieldName)
    this.notify(fieldName, {
      fieldName,
      isValidating: false,
      isValid: true,
      errors: [],
      timestamp: Date.now()
    })
  }

  // Clear all states
  clearAll() {
    const fieldNames = Array.from(this.states.keys())
    this.states.clear()
    
    fieldNames.forEach(fieldName => {
      this.notify(fieldName, {
        fieldName,
        isValidating: false,
        isValid: true,
        errors: [],
        timestamp: Date.now()
      })
    })
  }
}

// Usage example
const validator = new Validator()
const stateManager = new ValidationStateManager(validator)

// Setup field state management
function setupFieldStateManagement(fieldElement, rules) {
  const fieldName = fieldElement.name
  
  // Subscribe to state changes
  stateManager.subscribe(fieldName, (state) => {
    updateFieldUI(fieldElement, state)
  })
  
  // Setup validation events
  fieldElement.addEventListener('blur', async () => {
    const formData = getFormData(fieldElement.form)
    await stateManager.validateField(fieldName, fieldElement.value, rules, formData)
  })
  
  // Clear state on focus
  fieldElement.addEventListener('focus', () => {
    clearFieldVisualState(fieldElement)
  })
}

function updateFieldUI(fieldElement, state) {
  const { isValidating, isValid, errors } = state
  
  // Remove all state classes
  fieldElement.classList.remove('is-validating', 'is-valid', 'is-invalid')
  
  if (isValidating) {
    fieldElement.classList.add('is-validating')
    showLoadingIndicator(fieldElement, true)
  } else {
    showLoadingIndicator(fieldElement, false)
    fieldElement.classList.add(isValid ? 'is-valid' : 'is-invalid')
    
    // Update error messages
    const errorContainer = fieldElement.parentNode.querySelector('.error-message')
    if (errorContainer) {
      errorContainer.textContent = isValid ? '' : errors[0] || ''
    }
  }
}

function showLoadingIndicator(fieldElement, show) {
  let loader = fieldElement.parentNode.querySelector('.validation-loader')
  
  if (show && !loader) {
    loader = document.createElement('div')
    loader.className = 'validation-loader'
    loader.textContent = 'Validating...'
    fieldElement.parentNode.appendChild(loader)
  } else if (!show && loader) {
    loader.remove()
  }
}

function clearFieldVisualState(fieldElement) {
  fieldElement.classList.remove('is-validating', 'is-valid', 'is-invalid')
  showLoadingIndicator(fieldElement, false)
  
  const errorContainer = fieldElement.parentNode.querySelector('.error-message')
  if (errorContainer) {
    errorContainer.textContent = ''
  }
}

function getFormData(formElement) {
  const formData = new FormData(formElement)
  return Object.fromEntries(formData.entries())
}
```

## Next Steps

- **[Custom Rules →](./custom-rules)** - Create JavaScript-specific validation rules
- **[Async Validation →](./async)** - Handle asynchronous validation patterns
- **[Examples →](/examples/js/dom)** - See complete DOM integration examples
