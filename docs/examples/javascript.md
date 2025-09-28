# 🟨 JavaScript Examples

Complete examples for using the Universal Validator in vanilla JavaScript applications.

## 📋 Table of Contents

- [Basic Form Validation](#basic-form-validation)
- [Real-time Validation](#real-time-validation)
- [Multiple Forms](#multiple-forms)
- [Custom Rules](#custom-rules)

## 🚀 Basic Form Validation

### Simple Contact Form

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contact Form</title>
    <style>
        .error { border-color: red; }
        .valid { border-color: green; }
        .error-message { color: red; font-size: 14px; }
        input, textarea { width: 100%; padding: 8px; margin: 4px 0; }
        button { padding: 10px 20px; }
        button:disabled { background: #ccc; }
    </style>
</head>
<body>
    <h1>Contact Form</h1>
    
    <form id="contactForm">
        <div>
            <label>Name *</label>
            <input type="text" name="name" placeholder="Your name">
            <div class="error-message" id="name-error"></div>
        </div>

        <div>
            <label>Email *</label>
            <input type="email" name="email" placeholder="your@email.com">
            <div class="error-message" id="email-error"></div>
        </div>

        <div>
            <label>Message *</label>
            <textarea name="message" placeholder="Your message"></textarea>
            <div class="error-message" id="message-error"></div>
        </div>

        <button type="submit" id="submitBtn">Send Message</button>
    </form>

    <script type="module">
        import { createValidator } from '@vueller/validator';
        
        const validator = createValidator();
        
        // Set validation rules
        validator.setMultipleRules({
            name: { required: true, min: 2 },
            email: { required: true, email: true },
            message: { required: true, min: 10 }
        });
        
        const form = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        
        // Real-time validation on blur
        form.addEventListener('blur', async (e) => {
            if (e.target.name) {
                await validator.validate().field(e.target.name, e.target.value);
                updateFieldUI(e.target);
            }
        }, true);
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const isValid = await validator.validate(data);
            
            if (isValid) {
                console.log('Form is valid, submitting...', data);
                // Submit to your API here
            } else {
                console.log('Form has errors');
                showErrors();
            }
        });
        
        // Update field UI
        function updateFieldUI(input) {
            const fieldName = input.name;
            const hasError = validator.errors().has(fieldName);
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            input.classList.toggle('error', hasError);
            input.classList.toggle('valid', !hasError && input.value);
            
            errorElement.textContent = hasError ? validator.errors().first(fieldName) : '';
        }
        
        // Show all errors
        function showErrors() {
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(updateFieldUI);
        }
    </script>
</body>
</html>
```

## ⚡ Real-time Validation

### Live Search with Validation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Live Search</title>
    <style>
        .search-input { width: 100%; padding: 10px; }
        .error { border-color: red; }
        .valid { border-color: green; }
        .error-message { color: red; }
        .success-message { color: green; }
        .result-item { padding: 10px; border: 1px solid #ccc; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>Live Search</h1>
    
    <input 
        type="text" 
        id="searchInput" 
        class="search-input"
        placeholder="Search... (min 3 characters)"
    />
    <div id="searchStatus"></div>
    <div id="results"></div>

    <script type="module">
        import { createValidator } from '@vueller/validator';

        const validator = createValidator();

        // Set search validation rules
        validator.setRules('search', {
            required: true,
            min: 3,
            pattern: /^[a-zA-Z0-9\s]+$/
        });

        const searchInput = document.getElementById('searchInput');
        const searchStatus = document.getElementById('searchStatus');
        const resultsDiv = document.getElementById('results');

        let searchTimeout;

        // Real-time search with validation
        searchInput.addEventListener('input', async (e) => {
            const searchTerm = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            searchInput.classList.remove('error', 'valid');
            resultsDiv.innerHTML = '';
            
            if (!searchTerm) {
                searchStatus.innerHTML = '';
                return;
            }

            // Validate search term
            const isValid = await validator.validate().field('search', searchTerm);
            
            if (!isValid) {
                searchInput.classList.add('error');
                const error = validator.errors().first('search');
                searchStatus.innerHTML = `<span class="error-message">${error}</span>`;
                return;
            }

            // Valid search term
            searchInput.classList.add('valid');
            searchStatus.innerHTML = '<span class="success-message">Searching...</span>';
            
            // Debounce search
            searchTimeout = setTimeout(async () => {
                await performSearch(searchTerm);
            }, 500);
        });

        // Perform search
        async function performSearch(searchTerm) {
            try {
                resultsDiv.innerHTML = '<p>Loading...</p>';

                // Simulate API search
                const results = await searchAPI(searchTerm);
                
                searchStatus.innerHTML = `<span class="success-message">Found ${results.length} results</span>`;
                displayResults(results);

            } catch (error) {
                console.error('Search error:', error);
                searchStatus.innerHTML = '<span class="error-message">Search failed</span>';
            }
        }

        // Simulate API search
        async function searchAPI(searchTerm) {
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockData = [
                { name: 'John Doe', email: 'john@example.com' },
                { name: 'Jane Smith', email: 'jane@example.com' },
                { name: 'JavaScript Guide', type: 'book' },
                { name: 'Vue.js Course', type: 'course' }
            ];

            return mockData.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Display search results
        function displayResults(results) {
            if (results.length === 0) {
                resultsDiv.innerHTML = '<p>No results found.</p>';
                return;
            }

            const resultsHTML = results.map(result => `
                <div class="result-item">
                    <strong>${result.name}</strong>
                    ${result.email ? `<br>Email: ${result.email}` : ''}
                    ${result.type ? `<br>Type: ${result.type}` : ''}
                </div>
            `).join('');

            resultsDiv.innerHTML = resultsHTML;
        }
    </script>
</body>
</html>
```


## 🔄 Multiple Forms

### Two Forms on Same Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>Multiple Forms</title>
    <style>
        .form-container { 
            display: inline-block; 
            width: 45%; 
            margin: 10px; 
            padding: 20px; 
            border: 1px solid #ccc; 
        }
        .error { border-color: red; }
        .valid { border-color: green; }
        .error-message { color: red; font-size: 14px; }
        input { width: 100%; padding: 8px; margin: 4px 0; }
        button { padding: 10px 20px; }
    </style>
</head>
<body>
    <h1>Login and Registration</h1>
    
    <!-- Login Form -->
    <div class="form-container">
        <h2>Login</h2>
        <form id="loginForm">
            <div>
                <label>Email</label>
                <input type="email" name="email" placeholder="Email">
                <div class="error-message" id="login-email-error"></div>
            </div>
            <div>
                <label>Password</label>
                <input type="password" name="password" placeholder="Password">
                <div class="error-message" id="login-password-error"></div>
            </div>
            <button type="submit">Login</button>
        </form>
    </div>

    <!-- Registration Form -->
    <div class="form-container">
        <h2>Register</h2>
        <form id="registerForm">
            <div>
                <label>Name</label>
                <input type="text" name="name" placeholder="Full name">
                <div class="error-message" id="register-name-error"></div>
            </div>
            <div>
                <label>Email</label>
                <input type="email" name="email" placeholder="Email">
                <div class="error-message" id="register-email-error"></div>
            </div>
            <div>
                <label>Password</label>
                <input type="password" name="password" placeholder="Password">
                <div class="error-message" id="register-password-error"></div>
            </div>
            <div>
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="Confirm password">
                <div class="error-message" id="register-confirmPassword-error"></div>
            </div>
            <button type="submit">Register</button>
        </form>
    </div>

    <script type="module">
        import { createValidator } from '@vueller/validator';

        const validator = createValidator();

        // Set validation rules for both forms
        validator.setMultipleRules({
            // Login fields (will be prefixed with scope)
            email: { required: true, email: true },
            password: { required: true, min: 6 },
            
            // Register fields (will be prefixed with scope)
            name: { required: true, min: 2 },
            confirmPassword: { required: true, confirmed: 'password' }
        });

        // Login form
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData);
            
            // Validate with 'login' scope
            const isValid = await validator.validate('login', data);
            
            if (isValid) {
                console.log('Login successful:', data);
                alert('Login successful!');
            } else {
                showErrors('login');
            }
        });

        // Registration form
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData);
            
            // Validate with 'register' scope
            const isValid = await validator.validate('register', data);
            
            if (isValid) {
                console.log('Registration successful:', data);
                alert('Registration successful!');
            } else {
                showErrors('register');
            }
        });

        // Real-time validation
        document.addEventListener('blur', async (e) => {
            if (e.target.name) {
                const form = e.target.closest('form');
                const scope = form.id === 'loginForm' ? 'login' : 'register';
                
                await validator.validate(scope).field(e.target.name, e.target.value);
                updateFieldUI(e.target, scope);
            }
        }, true);

        // Update field UI
        function updateFieldUI(input, scope) {
            const fieldName = input.name;
            const scopedFieldName = `${scope}.${fieldName}`;
            const hasError = validator.errors().has(scopedFieldName);
            const errorElement = document.getElementById(`${scope}-${fieldName}-error`);
            
            input.classList.toggle('error', hasError);
            input.classList.toggle('valid', !hasError && input.value);
            
            errorElement.textContent = hasError ? validator.errors().first(scopedFieldName) : '';
        }

        // Show all errors for a scope
        function showErrors(scope) {
            const form = document.getElementById(scope + 'Form');
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => updateFieldUI(input, scope));
        }
    </script>
</body>
</html>
```

## 🎯 Custom Rules

### Adding Custom Validation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Custom Rules</title>
    <style>
        .error { border-color: red; }
        .valid { border-color: green; }
        .error-message { color: red; font-size: 14px; }
        input { width: 100%; padding: 8px; margin: 4px 0; }
        button { padding: 10px 20px; }
    </style>
</head>
<body>
    <h1>Custom Validation Rules</h1>
    
    <form id="customForm">
        <div>
            <label>Even Number</label>
            <input type="number" name="evenNumber" placeholder="Enter an even number">
            <div class="error-message" id="evenNumber-error"></div>
        </div>

        <div>
            <label>Strong Password</label>
            <input type="password" name="strongPassword" placeholder="Strong password">
            <div class="error-message" id="strongPassword-error"></div>
        </div>

        <div>
            <label>Username (async check)</label>
            <input type="text" name="username" placeholder="Username">
            <div class="error-message" id="username-error"></div>
        </div>

        <button type="submit">Submit</button>
    </form>

    <script type="module">
        import { createValidator } from '@vueller/validator';

        const validator = createValidator();

        // Add custom rules
        validator.extend('evenNumber', (value) => {
            return Number(value) % 2 === 0;
        }, 'The {field} must be an even number');

        validator.extend('strongPassword', (value) => {
            if (!value) return false;
            
            const hasUpper = /[A-Z]/.test(value);
            const hasLower = /[a-z]/.test(value);
            const hasNumber = /\d/.test(value);
            const hasSpecial = /[!@#$%^&*]/.test(value);
            
            return hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;
        }, 'Password must contain uppercase, lowercase, number, and special character');

        // Async rule (simulates API check)
        validator.extend('uniqueUsername', async (value) => {
            if (!value) return true;
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simulate taken usernames
            const takenUsernames = ['admin', 'user', 'test', 'demo'];
            return !takenUsernames.includes(value.toLowerCase());
        }, 'This username is already taken');

        // Set validation rules
        validator.setMultipleRules({
            evenNumber: { required: true, evenNumber: true },
            strongPassword: { required: true, strongPassword: true },
            username: { required: true, min: 3, uniqueUsername: true }
        });

        const form = document.getElementById('customForm');

        // Real-time validation
        form.addEventListener('blur', async (e) => {
            if (e.target.name) {
                await validator.validate().field(e.target.name, e.target.value);
                updateFieldUI(e.target);
            }
        }, true);

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const isValid = await validator.validate(data);
            
            if (isValid) {
                console.log('Form is valid:', data);
                alert('Form submitted successfully!');
            } else {
                showErrors();
            }
        });

        // Update field UI
        function updateFieldUI(input) {
            const fieldName = input.name;
            const hasError = validator.errors().has(fieldName);
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            input.classList.toggle('error', hasError);
            input.classList.toggle('valid', !hasError && input.value);
            
            errorElement.textContent = hasError ? validator.errors().first(fieldName) : '';
        }

        // Show all errors
        function showErrors() {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(updateFieldUI);
        }
    </script>
</body>
</html>
```

## Next Steps

- [Vue.js Examples](vue.md) - Complete Vue.js examples
- [API Reference](../api/core.md) - Detailed API documentation
- [Validation Rules](../guide/validation-rules.md) - Learn about all available rules
