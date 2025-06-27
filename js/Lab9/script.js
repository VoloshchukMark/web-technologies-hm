document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const signupSuccessMessage = document.getElementById('signupSuccessMessage');
    const loginSuccessMessage = document.getElementById('loginSuccessMessage');
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');

    const citiesByCountry = {
        'Ukraine': ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro'],
        'USA': ['New York', 'Los-Angeless', 'Chicago', 'Nevada'],
        'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg']
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const targetTabId = button.dataset.tab;
            document.getElementById(targetTabId).classList.add('active');

            signupSuccessMessage.style.display = 'none';
            loginSuccessMessage.style.display = 'none';

            clearFormAndValidation(signupForm);
            clearFormAndValidation(loginForm);
        });
    });

    function clearFormAndValidation(form) {
        form.reset();
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('valid', 'invalid');
            const errorMessage = group.querySelector('.error-message');
            const validationIcon = group.querySelector('.validation-icon');
            if (errorMessage) errorMessage.textContent = '';
            if (validationIcon) validationIcon.innerHTML = '';
        });
        if (form.id === 'signupForm') {
            citySelect.innerHTML = '<option value="">Choose your city...</option>';
            citySelect.disabled = true;
        }
    }


    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        const validationIcon = formGroup.querySelector('.validation-icon');

        formGroup.classList.remove('valid');
        formGroup.classList.add('invalid');
        inputElement.classList.remove('valid');
        inputElement.classList.add('invalid');
        errorMessage.textContent = message;
        validationIcon.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #dc3545;"></i>';
    }

    function showSuccess(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        const validationIcon = formGroup.querySelector('.validation-icon');

        formGroup.classList.remove('invalid');
        formGroup.classList.add('valid');
        inputElement.classList.remove('invalid');
        inputElement.classList.add('valid');
        errorMessage.textContent = '';
        validationIcon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #28a745;"></i>';
    }

    function validateLength(inputElement, min, max) {
        const value = inputElement.value.trim();
        if (value.length < min || value.length > max) {
            showError(inputElement, `The field should have from ${min} to ${max} symbols.`);
            return false;
        }
        showSuccess(inputElement);
        return true;
    }

    function validateFirstName() {
        const firstNameInput = document.getElementById('firstName');
        if (firstNameInput.value.trim() === '') {
            showError(firstNameInput, 'The firstname is required!');
            return false;
        }
        return validateLength(firstNameInput, 3, 15);
    }

    function validateLastName() {
        const lastNameInput = document.getElementById('lastName');
        if (lastNameInput.value.trim() === '') {
            showError(lastNameInput, 'The lastname is required!');
            return false;
        }
        return validateLength(lastNameInput, 3, 15);
    }

    function validateEmail() {
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const value = emailInput.value.trim();
        if (value === '') {
            showError(emailInput, 'Email is required!');
            return false;
        } else if (!emailRegex.test(value)) {
            showError(emailInput, 'Enter the correct email please.');
            return false;
        }
        showSuccess(emailInput);
        return true;
    }

    function validatePassword(passwordInput, minLength = 6) {
        const value = passwordInput.value;
        const passwordRegex = /^[a-zA-Z0-9]+$/; 

        if (value.length === 0) {
            showError(passwordInput, 'The password is required!');
            return false;
        } else if (value.length < minLength) {
            showError(passwordInput, `The password should contain more than ${minLength} symbols.`);
            return false;
        } else if (!passwordRegex.test(value)) {
            showError(passwordInput, 'The password must contain english letters and numbers only!');
            return false;
        }
        showSuccess(passwordInput);
        return true;
    }

    function validateConfirmPassword() {
        const passwordInput = document.getElementById('signupPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput.value === '') {
            showError(confirmPasswordInput, 'Password confirmation is essensial!');
            return false;
        } else if (confirmPasswordInput.value !== passwordInput.value) {
            showError(confirmPasswordInput, 'The passwords do not match!');
            return false;
        }
        showSuccess(confirmPasswordInput);
        return true;
    }

    function validatePhone() {
        const phoneInput = document.getElementById('phone');
        const cleanedValue = phoneInput.value.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^\+\d{7,15}$/;

        if (phoneInput.value.trim() === '') {
            showError(phoneInput, 'Phone number is required!');
            return false;
        } else if (!phoneRegex.test(cleanedValue)) {
            showError(phoneInput, 'Enter correct phone number please (for instance, +1234567890).');
            return false;
        }
        showSuccess(phoneInput);
        return true;
    }


    function validateDateBirth() {
        const dateBirthInput = document.getElementById('dateBirth');
        const value = dateBirthInput.value;

        if (value === '') {
            showError(dateBirthInput, 'Date of birth is required!');
            return false;
        }

        const dob = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        dob.setHours(0, 0, 0, 0);

        if (dob > today) {
            showError(dateBirthInput, 'Date of birth cannot be from the future!');
            return false;
        }

        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (age < 12) {
            showError(dateBirthInput, 'You must be at least 12 years old to register!');
            return false;
        }
        showSuccess(dateBirthInput);
        return true;
    }

    function validateSex() {
        const sexRadios = document.querySelectorAll('input[name="sex"]');
        const anySelected = Array.from(sexRadios).some(radio => radio.checked);
        const formGroup = sexRadios[0].closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');

        if (!anySelected) {
            errorMessage.textContent = 'Please select your sex.';
            return false;
        }
        errorMessage.textContent = '';
        return true;
    }

    function validateCountry() {
        if (countrySelect.value === '') {
            showError(countrySelect, 'Please select a country.');
            return false;
        }
        showSuccess(countrySelect);
        return true;
    }

    function validateCity() {
        if (citySelect.disabled || citySelect.value === '') {
            showError(citySelect, 'Please select a city.');
            return false;
        }
        showSuccess(citySelect);
        return true;
    }

    function validateUsername() {
        const usernameInput = document.getElementById('username');
        const value = usernameInput.value.trim();
        if (value === '') {
            showError(usernameInput, 'Username is required!');
            return false;
        }
        showSuccess(usernameInput);
        return true;
    }


    countrySelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;
        citySelect.innerHTML = '<option value="">Select your city...</option>';

        if (selectedCountry && citiesByCountry[selectedCountry]) {
            citiesByCountry[selectedCountry].forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
        } else {
            citySelect.disabled = true;
        }
        validateCountry();
        if (citySelect.disabled || citySelect.value === '') {
            showError(citySelect, 'Select your city please.');
        } else {
            showSuccess(citySelect);
        }
    });

    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordInput = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const isFirstNameValid = validateFirstName();
        const isLastNameValid = validateLastName();
        const isEmailValid = validateEmail();
        const isSignupPasswordValid = validatePassword(document.getElementById('signupPassword'));
        const isConfirmPasswordValid = validateConfirmPassword();
        const isPhoneValid = validatePhone();
        const isDateBirthValid = validateDateBirth();
        const isSexValid = validateSex();
        const isCountryValid = validateCountry();
        const isCityValid = validateCity();
        
        const isValid = isFirstNameValid && isLastNameValid && isEmailValid && isSignupPasswordValid &&
                  isConfirmPasswordValid && isPhoneValid && isDateBirthValid && isSexValid &&
                  isCountryValid && isCityValid;
        
        if (isValid) {
            signupSuccessMessage.textContent = 'You have been successfully registered!';
            signupSuccessMessage.style.display = 'block';
            clearFormAndValidation(signupForm);
        } else {
            signupSuccessMessage.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const isUsernameValid = validateUsername();
        const isLoginPasswordValid = validatePassword(document.getElementById('loginPassword'));

        const isValid = isUsernameValid && isLoginPasswordValid;

        if (isValid) {
            loginSuccessMessage.textContent = 'Login successful!';
            loginSuccessMessage.style.display = 'block';
            clearFormAndValidation(loginForm);
        } else {
            loginSuccessMessage.style.display = 'none';
        }
    });

    document.querySelectorAll('#signupForm input:not([type="radio"]), #signupForm select').forEach(input => {
        input.addEventListener('blur', (event) => {
            const fieldId = event.target.id;
            switch (fieldId) {
                case 'firstName':
                    validateFirstName();
                    break;
                case 'lastName':
                    validateLastName();
                    break;
                case 'email':
                    validateEmail();
                    break;
                case 'signupPassword':
                    validatePassword(event.target);
                    const confirmPassInput = document.getElementById('confirmPassword');
                    if (confirmPassInput.value !== '') { 
                        validateConfirmPassword(); 
                    }
                    break;
                case 'confirmPassword':
                    validateConfirmPassword();
                    break;
                case 'phone':
                    validatePhone();
                    break;
                case 'dateBirth':
                    validateDateBirth();
                    break;
                case 'country':
                    validateCountry();
                    break;
                case 'city':
                    validateCity();
                    break;
            }
        });
    });

    document.querySelectorAll('#loginForm input').forEach(input => {
        input.addEventListener('blur', (event) => {
            const fieldId = event.target.id;
            switch (fieldId) {
                case 'username':
                    validateUsername();
                    break;
                case 'loginPassword':
                    validatePassword(event.target);
                    break;
            }
        });
    });

    document.querySelectorAll('input[name="sex"]').forEach(radio => {
        radio.addEventListener('change', validateSex);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const focusedElement = document.activeElement;
            if (focusedElement.tagName !== 'BUTTON' && focusedElement.type !== 'submit') {
                event.preventDefault();
            }
        }
    });
});