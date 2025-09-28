# Examples

Explore practical examples of Universal Validator in action. These examples demonstrate real-world usage patterns and best practices.

## 📋 Available Examples

### [JavaScript Examples](./javascript.md)
Complete examples for vanilla JavaScript applications:
- **Basic Form Validation** - Simple contact form with real-time validation
- **Live Search** - Real-time search with validation and debouncing
- **Multiple Forms** - Login and registration forms on the same page with scoped validation
- **Custom Rules** - Creating and using custom validation rules

### [Vue.js Examples](./vue.md)
Vue.js specific examples using the Composition API:
- **Basic Form Validation** - Contact form with Vue reactivity
- **Using Composables** - Registration form with `useValidator` composable
- **ValidatorForm Component** - Automatic error display and form handling
- **Multiple Forms** - Scoped validation for multiple forms
- **Custom Rules** - Vue integration with custom validation rules


## 🎯 Example Categories

### Beginner Examples
Perfect for getting started with Universal Validator:
- Simple form validation
- Basic error handling
- Real-time validation setup

### Intermediate Examples
More complex scenarios for growing applications:
- Multiple form management
- Custom validation rules
- Async validation patterns

### Advanced Examples
For complex applications and advanced use cases:
- Performance optimization
- Framework integration
- Testing strategies

## 🚀 Quick Start Templates

### Vanilla JavaScript Template
```html
<!DOCTYPE html>
<html>
<head>
    <title>Universal Validator Example</title>
</head>
<body>
    <form id="myForm">
        <input type="email" name="email" placeholder="Email">
        <div class="error-message" id="email-error"></div>
        <button type="submit">Submit</button>
    </form>

    <script type="module">
        import { createValidator } from '@vueller/validator';
        
        const validator = createValidator();
        validator.setRules('email', { required: true, email: true });
        
        document.getElementById('myForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            const isValid = await validator.validate(data);
            if (isValid) {
                console.log('Form is valid!');
            } else {
                document.getElementById('email-error').textContent = 
                    validator.errors().first('email');
            }
        });
    </script>
</body>
</html>
```

### Vue.js Template
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input 
      v-model="formData.email" 
      type="email" 
      placeholder="Email"
      :class="{ error: errors.has('email') }"
    />
    <div v-if="errors.has('email')" class="error-message">
      {{ errors.first('email') }}
    </div>
    <button type="submit">Submit</button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useValidator } from '@vueller/validator/vue';

const formData = ref({ email: '' });
const { validator } = useValidator();

validator.setRules('email', { required: true, email: true });

const errors = computed(() => validator.errors());

const handleSubmit = async () => {
  const isValid = await validator.validate(formData.value);
  if (isValid) {
    console.log('Form is valid!');
  }
};
</script>
```

## 💡 Tips for Using Examples

### Copy and Customize
All examples are designed to be copied and customized for your specific needs. Start with the closest example to your use case and modify as needed.

### Progressive Enhancement
Examples are organized from simple to complex. Start with basic examples and gradually work your way up to more advanced patterns.

### Framework Agnostic Patterns
Many patterns shown in framework-specific examples can be adapted to other frameworks by following the core validation principles.

## 🔗 Related Resources

- [**Installation Guide**](../guide/installation.md) - Set up Universal Validator
- [**API Reference**](../api/core.md) - Complete API documentation
- [**Advanced Guide**](../guide/advanced.md) - Advanced patterns and techniques

## 📝 Contributing Examples

Have a great example to share? We welcome contributions! Examples should be:
- **Complete and runnable** - Include all necessary code
- **Well-documented** - Clear comments explaining key concepts
- **Practical** - Solve real-world problems
- **Clean** - Follow best practices and coding standards
