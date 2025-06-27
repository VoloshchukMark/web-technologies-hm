
document.addEventListener('DOMContentLoaded', () => {
    const authWrapper = document.querySelector('.auth-wrapper');
    const mainAppWrapper = document.querySelector('.main-app-wrapper');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const signupSuccessMessage = document.getElementById('signupSuccessMessage');
    const loginSuccessMessage = document.getElementById('loginSuccessMessage');
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');
    const logoutButton = document.getElementById('logoutButton');
    const loggedInUserNameDisplay = document.getElementById('loggedInUserNameDisplay');
    const searchInput = document.getElementById('searchInput');
    const sortBySelect = document.getElementById('sortBy');
    const genderFilterSelect = document.getElementById('genderFilter');
    const countryFilterSelect = document.getElementById('countryFilter');
    const minAgeFilterInput = document.getElementById('minAgeFilter');
    const maxAgeFilterInput = document.getElementById('maxAgeFilter');
    const clearFiltersButton = document.getElementById('clearFiltersButton');
    const userCardsContainer = document.getElementById('userCardsContainer');
    const globalErrorMessage = document.getElementById('globalErrorMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const paginationNumbersContainer = document.getElementById('paginationNumbers');
    const loadMoreButton = document.getElementById('loadMoreButton');
    const favoriteFriendsContainer = document.getElementById('favoriteFriendsContainer');
    const noFavoritesMessage = document.getElementById('noFavoritesMessage');
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    let authenticatedUser = JSON.parse(localStorage.getItem('authenticatedUser'));

    let allUsers = []; 
    let filteredAndSortedUsers = [];

    const usersPerPage = 30; 
    let currentPage = 1;
    let totalPages = 0;
    let isLoading = false; 
    let currentQueryParams = {
        search: '',
        sortBy: '',
        gender: '',
        country: '',
        minAge: '',
        maxAge: '',
        page: 1
    };
    let favoriteUserIds = new Set(); 
    const citiesByCountry = {
        'Ukraine': ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro'],
        'USA': ['New York', 'Los-Angeles', 'Chicago', 'Nevada'],
        'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg']
    };


    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };


    const updateUrlParams = (params) => {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key]) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        history.pushState(params, '', url.toString());
    };


    const parseUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            search: params.get('search') || '',
            sortBy: params.get('sortBy') || '',
            gender: params.get('gender') || '',
            country: params.get('country') || '',
            minAge: params.get('minAge') || '',
            maxAge: params.get('maxAge') || '',
            page: parseInt(params.get('page')) || 1
        };
    };


    const showAuthContainer = () => {
        authWrapper.classList.remove('hidden');
        mainAppWrapper.classList.add('hidden');
        clearFormAndValidation(signupForm);
        clearFormAndValidation(loginForm);
        signupSuccessMessage.style.display = 'none';
        loginSuccessMessage.style.display = 'none';
        globalErrorMessage.classList.add('hidden');
        loadingIndicator.classList.add('hidden');
        noResultsMessage.classList.add('hidden');
    };


    const showMainAppContainer = (user) => {
        if (user && user.firstName) {
            loggedInUserNameDisplay.textContent = `Welcome, ${user.firstName}!`;
        }
        authWrapper.classList.add('hidden');
        mainAppWrapper.classList.remove('hidden');
        loadFavorites();
        fetchAndRenderUsers();
        renderFavoriteFriends();
    };


    const checkAuthStatus = () => {
        authenticatedUser = JSON.parse(localStorage.getItem('authenticatedUser'));
        if (authenticatedUser) {
            showMainAppContainer(authenticatedUser);
            console.log('User already logged in:', authenticatedUser.email);
        } else {
            showAuthContainer();
            console.log('No user logged in, showing auth form.');
        }
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

    const validateFirstName = () => {
        const firstNameInput = document.getElementById('firstName');
        if (firstNameInput.value.trim() === '') {
            showError(firstNameInput, 'The firstname is required!');
            return false;
        }
        return validateLength(firstNameInput, 3, 15);
    };

    const validateLastName = () => {
        const lastNameInput = document.getElementById('lastName');
        if (lastNameInput.value.trim() === '') {
            showError(lastNameInput, 'The lastname is required!');
            return false;
        }
        return validateLength(lastNameInput, 3, 15);
    };

    const validateEmail = (inputElement, isLogin = false) => {
        const emailInput = inputElement;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const value = emailInput.value.trim();
        if (value === '') {
            showError(emailInput, 'Email is required!');
            return false;
        } else if (!emailRegex.test(value)) {
            showError(emailInput, 'Enter the correct email please.');
            return false;
        }
        if (!isLogin && registeredUsers.some(user => user.email === value)) {
            showError(emailInput, 'This email is already registered.');
            return false;
        }
        showSuccess(emailInput);
        return true;
    };

    const validatePassword = (passwordInput, minLength = 6) => {
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
    };

    const validateConfirmPassword = () => {
        const passwordInput = document.getElementById('signupPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput.value === '') {
            showError(confirmPasswordInput, 'Password confirmation is essential!');
            return false;
        } else if (confirmPasswordInput.value !== passwordInput.value) {
            showError(confirmPasswordInput, 'The passwords do not match!');
            return false;
        }
        showSuccess(confirmPasswordInput);
        return true;
    };

    const validatePhone = () => {
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
    };

    const validateDateBirth = () => {
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
    };

    const validateSex = () => {
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
    };

    const validateCountry = () => {
        if (countrySelect.value === '') {
            showError(countrySelect, 'Please select a country.');
            return false;
        }
        showSuccess(countrySelect);
        return true;
    };

    const validateCity = () => {
        if (citySelect.disabled || citySelect.value === '') {
            showError(citySelect, 'Please select a city.');
            return false;
        }
        showSuccess(citySelect);
        return true;
    };
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
        const isEmailValid = validateEmail(document.getElementById('email'));
        const signupPasswordInput = document.getElementById('signupPassword');
        const isSignupPasswordValid = validatePassword(signupPasswordInput);
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
            const newUser = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: signupPasswordInput.value,
                phone: document.getElementById('phone').value.replace(/[\s\-\(\)]/g, ''),
                dateBirth: document.getElementById('dateBirth').value,
                sex: document.querySelector('input[name="sex"]:checked').value,
                country: countrySelect.value,
                city: citySelect.value,
                favoriteUserIds: [] 
            };
            registeredUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

            signupSuccessMessage.textContent = 'You have been successfully registered! Now you can log in.';
            signupSuccessMessage.style.display = 'block';
            
            const loginTabButton = document.querySelector('.tab-button[data-tab="login"]');
            if (loginTabButton) {
                loginTabButton.click(); 
            }
            clearFormAndValidation(signupForm);
        } else {
            signupSuccessMessage.style.display = 'none';
        }
    });
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const loginEmailInput = document.getElementById('loginEmail');
        const loginPasswordInput = document.getElementById('loginPassword');

        const isEmailValid = validateEmail(loginEmailInput, true);
        const isLoginPasswordValid = validatePassword(loginPasswordInput);

        const isValid = isEmailValid && isLoginPasswordValid;

        if (isValid) {
            const enteredEmail = loginEmailInput.value.trim();
            const enteredPassword = loginPasswordInput.value;

            const foundUser = registeredUsers.find(user =>
                user.email === enteredEmail &&
                user.password === enteredPassword
            );

            if (foundUser) {
                authenticatedUser = foundUser;
                localStorage.setItem('authenticatedUser', JSON.stringify(authenticatedUser));
                loginSuccessMessage.textContent = `Welcome, ${foundUser.firstName}! Login successful!`;
                loginSuccessMessage.style.display = 'block';
                clearFormAndValidation(loginForm);
                showMainAppContainer(foundUser); 
            } else {
                loginSuccessMessage.textContent = 'Invalid email or password.';
                loginSuccessMessage.style.color = '#dc3545';
                loginSuccessMessage.style.display = 'block';
            }
        } else {
            loginSuccessMessage.style.display = 'none';
        }
    });
    logoutButton.addEventListener('click', () => {
        saveFavorites(); 

        localStorage.removeItem('authenticatedUser');
        authenticatedUser = null;
        favoriteUserIds.clear(); 
        
        showAuthContainer();
        console.log('User logged out.');
        userCardsContainer.innerHTML = '';
        favoriteFriendsContainer.innerHTML = '';
        noFavoritesMessage.classList.remove('hidden'); 
        globalErrorMessage.classList.add('hidden');
        loadingIndicator.classList.add('hidden');
        noResultsMessage.classList.add('hidden');
        paginationNumbersContainer.innerHTML = '';
        loadMoreButton.classList.add('hidden');
        allUsers = [];
        filteredAndSortedUsers = [];
        currentPage = 1;
        totalPages = 0;
        isLoading = false;
        currentQueryParams = { search: '', sortBy: '', gender: '', country: '', minAge: '', maxAge: '', page: 1 };
        updateUrlParams({}); 
    });
    document.querySelectorAll('#signupForm input:not([type="radio"]), #signupForm select').forEach(input => {
        input.addEventListener('blur', (event) => {
            const fieldId = event.target.id;
            switch (fieldId) {
                case 'firstName': validateFirstName(); break;
                case 'lastName': validateLastName(); break;
                case 'email': validateEmail(event.target); break;
                case 'signupPassword':
                    validatePassword(event.target);
                    const confirmPassInput = document.getElementById('confirmPassword');
                    if (confirmPassInput && confirmPassInput.value !== '') {
                        validateConfirmPassword();
                    }
                    break;
                case 'confirmPassword': validateConfirmPassword(); break;
                case 'phone': validatePhone(); break;
                case 'dateBirth': validateDateBirth(); break;
                case 'country': validateCountry(); break;
                case 'city': validateCity(); break;
            }
        });
    });

    document.querySelectorAll('#loginForm input').forEach(input => {
        input.addEventListener('blur', (event) => {
            const fieldId = event.target.id;
            switch (fieldId) {
                case 'loginEmail': validateEmail(event.target, true); break;
                case 'loginPassword': validatePassword(event.target); break;
            }
        });
    });

    document.querySelectorAll('input[name="sex"]').forEach(radio => {
        radio.addEventListener('change', validateSex);
    });

    const formatRegistrationDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('uk-UA', options);
    };

    const calculateAge = (dobString) => {
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const createUserCardHtml = (user, isFavorite) => {
        const fullName = `${user.name.first} ${user.name.last}`;
        const age = calculateAge(user.dob.date);
        const registrationDate = formatRegistrationDate(user.registered.date);
        const phone = user.phone;
        const email = user.email;
        const location = `${user.location.city}, ${user.location.country}`;
        const photo = user.picture.large;
        const userId = user.login.uuid;

        const favoriteClass = isFavorite ? 'favorite' : 'add-to-favorites';
        const favoriteText = isFavorite ? 'Favorite' : 'Add to Favorites';
        const favoriteIcon = isFavorite ? 'fas fa-star' : 'far fa-star'; 

        return `
            <div class="user-card" data-user-id="${userId}">
                <div class="user-card-header">
                    <img src="${photo}" alt="${fullName}" class="user-card-photo">
                    <h3 class="user-card-name">${fullName}</h3>
                    <p class="user-card-age">${age} years old</p>
                </div>
                <div class="user-card-body">
                    <p><i class="fas fa-envelope"></i> ${email}</p>
                    <p><i class="fas fa-phone"></i> ${phone}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${location}</p>
                    <p><i class="fas fa-calendar-alt"></i> Registered: ${registrationDate}</p>
                </div>
                <div class="user-card-actions">
                    <button class="user-card-button ${favoriteClass}" data-user-id="${userId}">
                        <i class="${favoriteIcon}"></i> ${favoriteText}
                    </button>
                </div>
            </div>
        `;
    };

    const renderUsers = (usersToRender, container, append = false) => {
        if (!append) {
            container.innerHTML = '';
        }
        if (usersToRender.length === 0) {
            if (container.id === 'userCardsContainer') {
                noResultsMessage.classList.remove('hidden');
            }
            return;
        } else {
            noResultsMessage.classList.add('hidden');
        }

        const fragment = document.createDocumentFragment();
        usersToRender.forEach(user => {
            const isFavorite = favoriteUserIds.has(user.login.uuid);
            const userCardDiv = document.createElement('div');
            userCardDiv.innerHTML = createUserCardHtml(user, isFavorite);
            fragment.appendChild(userCardDiv.firstElementChild);
        });
        container.appendChild(fragment);
    };

    const fetchUsers = async (page, results) => {
        if (isLoading) return;
        isLoading = true;
        loadingIndicator.classList.remove('hidden');
        globalErrorMessage.classList.add('hidden');
        loadMoreButton.classList.add('hidden');

        try {
            const response = await fetch(`https://randomuser.me/api/?page=${page}&results=${results}&seed=friendsfinder&nat=us,ua,de`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            isLoading = false;
            loadingIndicator.classList.add('hidden');
            if (currentPage < totalPages) {
                loadMoreButton.classList.remove('hidden'); 
            }
            return data.results;
        } catch (error) {
            isLoading = false;
            loadingIndicator.classList.add('hidden');
            globalErrorMessage.textContent = `Failed to load users: ${error.message}. Please try again later.`;
            globalErrorMessage.classList.remove('hidden');
            loadMoreButton.classList.add('hidden');
            console.error("Error fetching users:", error);
            return [];
        }
    };

    const populateCountryFilter = () => {
        const countries = new Set(allUsers.map(user => user.location.country));
        countryFilterSelect.innerHTML = '<option value="">All Countries</option>';
        Array.from(countries).sort().forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countryFilterSelect.appendChild(option);
        });
        countryFilterSelect.value = currentQueryParams.country;
    };

    const filterUsers = (users, filters) => {
        return users.filter(user => {
            const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
            const email = user.email.toLowerCase();
            const city = user.location.city.toLowerCase();
            const country = user.location.country.toLowerCase();
            const age = calculateAge(user.dob.date);
            if (filters.search && !(fullName.includes(filters.search) || email.includes(filters.search) || city.includes(filters.search))) {
                return false;
            }
            if (filters.gender && user.gender !== filters.gender) {
                return false;
            }
            if (filters.country && country !== filters.country.toLowerCase()) {
                return false;
            }
            if (filters.minAge && age < parseInt(filters.minAge)) {
                return false;
            }
            if (filters.maxAge && age > parseInt(filters.maxAge)) {
                return false;
            }

            return true;
        });
    };

    const sortUsers = (users, sortBy) => {
        const sorted = [...users];
        switch (sortBy) {
            case 'name_asc':
                sorted.sort((a, b) => (a.name.first + a.name.last).localeCompare(b.name.first + b.name.last));
                break;
            case 'name_desc':
                sorted.sort((a, b) => (b.name.first + b.name.last).localeCompare(a.name.first + a.name.last));
                break;
            case 'age_asc':
                sorted.sort((a, b) => calculateAge(a.dob.date) - calculateAge(b.dob.date));
                break;
            case 'age_desc':
                sorted.sort((a, b) => calculateAge(b.dob.date) - calculateAge(a.dob.date));
                break;
            case 'registered_asc':
                sorted.sort((a, b) => new Date(a.registered.date).getTime() - new Date(b.registered.date).getTime());
                break;
            case 'registered_desc':
                sorted.sort((a, b) => new Date(b.registered.date).getTime() - new Date(a.registered.date).getTime());
                break;
            default:
                break;
        }
        return sorted;
    };

    const applyFiltersAndSort = () => {
        const filtered = filterUsers(allUsers, currentQueryParams);
        filteredAndSortedUsers = sortUsers(filtered, currentQueryParams.sortBy);

        totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
        currentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1); 

        renderVisibleUsers();
        renderPagination();
        updateUrlParams(currentQueryParams);
    };

    const renderVisibleUsers = () => {
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const usersToDisplay = filteredAndSortedUsers.slice(startIndex, endIndex);
        renderUsers(usersToDisplay, userCardsContainer, false);
    };

    const handleSearch = debounce(() => {
        currentQueryParams.search = searchInput.value.toLowerCase().trim();
        currentQueryParams.page = 1;
        applyFiltersAndSort();
    }, 300);

    const handleSort = () => {
        currentQueryParams.sortBy = sortBySelect.value;
        currentQueryParams.page = 1; 
        applyFiltersAndSort();
    };

    const handleFilter = () => {
        currentQueryParams.gender = genderFilterSelect.value;
        currentQueryParams.country = countryFilterSelect.value;
        currentQueryParams.minAge = minAgeFilterInput.value;
        currentQueryParams.maxAge = maxAgeFilterInput.value;
        currentQueryParams.page = 1; 
        applyFiltersAndSort();
    };

    const clearFilters = () => {
        searchInput.value = '';
        sortBySelect.value = '';
        genderFilterSelect.value = '';
        countryFilterSelect.value = '';
        minAgeFilterInput.value = '';
        maxAgeFilterInput.value = '';

        currentQueryParams = { search: '', sortBy: '', gender: '', country: '', minAge: '', maxAge: '', page: 1 };
        applyFiltersAndSort();
    };

    const renderPagination = () => {
        paginationNumbersContainer.innerHTML = '';
        if (totalPages <= 1 && filteredAndSortedUsers.length <= usersPerPage) {
            loadMoreButton.classList.add('hidden');
            return;
        }
        if (currentPage < totalPages) {
            loadMoreButton.classList.remove('hidden'); 
        } else {
            loadMoreButton.classList.add('hidden');
        }
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        if (endPage - startPage + 1 < 5) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, 5);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 4);
            }
        }
        startPage = Math.max(1, startPage);

        if (startPage > 1) {
            createPaginationButton(1);
            if (startPage > 2) {
                createEllipsis();
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            createPaginationButton(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                createEllipsis();
            }
            createPaginationButton(totalPages);
        }
    };

    const createPaginationButton = (pageNumber) => {
        const button = document.createElement('button');
        button.classList.add('pagination-number-button');
        button.textContent = pageNumber;
        if (pageNumber === currentPage) {
            button.classList.add('active-page');
        }
        button.addEventListener('click', () => handlePageChange(pageNumber));
        paginationNumbersContainer.appendChild(button);
    };

    const createEllipsis = () => {
        const span = document.createElement('span');
        span.textContent = '...';
        span.classList.add('pagination-ellipsis');
        paginationNumbersContainer.appendChild(span);
    };

    const handlePageChange = (newPage) => {
        if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
        currentPage = newPage;
        currentQueryParams.page = newPage;
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
        applyFiltersAndSort();
    };

    const handleScroll = debounce(() => {
        if (isLoading || currentPage >= totalPages) {
            loadMoreButton.classList.add('hidden');
            return;
        }
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            currentPage++;
            currentQueryParams.page = currentPage;
            fetchAndAppendUsers(currentPage, usersPerPage);
            updateUrlParams(currentQueryParams); 
            renderPagination();
        }
    }, 100);

    const handleLoadMoreClick = () => {
        if (isLoading || currentPage >= totalPages) return;
        currentPage++;
        currentQueryParams.page = currentPage;
        fetchAndAppendUsers(currentPage, usersPerPage);
        updateUrlParams(currentQueryParams);
        renderPagination();
    };

    const fetchAndAppendUsers = async (page, results) => {
        const newUsers = await fetchUsers(page, results);
        if (newUsers.length > 0) {
            newUsers.forEach(newUser => {
                if (!allUsers.some(existingUser => existingUser.login.uuid === newUser.login.uuid)) {
                    allUsers.push(newUser);
                }
            });
            applyFiltersAndSort();
        }
        if (currentPage >= totalPages) {
            loadMoreButton.classList.add('hidden');
        }
    };

    const fetchAndRenderUsers = async () => {
        if (!currentQueryParams.search && !currentQueryParams.gender && !currentQueryParams.country && !currentQueryParams.minAge && !currentQueryParams.maxAge && allUsers.length === 0) {
            const fetched = await fetchUsers(1, usersPerPage);
            allUsers = fetched;
            if (fetched.length > 0) {
                 totalPages = 100; 
            } else {
                 totalPages = 0;
            }
            currentPage = 1;
        } else {
            if (allUsers.length > 0) {
                totalPages = 100;
            } else {
                totalPages = 0;
            }
        }
        
        applyFiltersAndSort(); 
        populateCountryFilter(); 
    };

    const saveFavorites = () => {
        if (authenticatedUser) {
            const userIndex = registeredUsers.findIndex(user => user.email === authenticatedUser.email);
            if (userIndex !== -1) {
                registeredUsers[userIndex].favoriteUserIds = Array.from(favoriteUserIds);
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                authenticatedUser.favoriteUserIds = Array.from(favoriteUserIds);
                localStorage.setItem('authenticatedUser', JSON.stringify(authenticatedUser));
            }
        }
    };

    const loadFavorites = () => {
        if (authenticatedUser && authenticatedUser.favoriteUserIds) {
            favoriteUserIds = new Set(authenticatedUser.favoriteUserIds);
        } else {
            favoriteUserIds = new Set();
        }
    };

    const toggleFavorite = (userId) => {
        if (favoriteUserIds.has(userId)) {
            favoriteUserIds.delete(userId);
        } else {
            favoriteUserIds.add(userId);
        }
        saveFavorites();
        updateUserCardFavoriteStatus(userId);
        renderFavoriteFriends();
    };

    const updateUserCardFavoriteStatus = (userId) => {
        const mainCard = userCardsContainer.querySelector(`.user-card[data-user-id="${userId}"]`);
        if (mainCard) {
            const button = mainCard.querySelector('.user-card-button');
            const icon = button.querySelector('i');
            const isFavorite = favoriteUserIds.has(userId);

            if (isFavorite) {
                button.classList.remove('add-to-favorites');
                button.classList.add('favorite');
                button.textContent = ' Favorite';
                icon.className = 'fas fa-star';
            } else {
                button.classList.remove('favorite');
                button.classList.add('add-to-favorites');
                button.textContent = ' Add to Favorites';
                icon.className = 'far fa-star';
            }
            button.prepend(icon);
        }
        const favCard = favoriteFriendsContainer.querySelector(`.user-card[data-user-id="${userId}"]`);
        if (favCard) {
            const button = favCard.querySelector('.user-card-button');
            const icon = button.querySelector('i');
            const isFavorite = favoriteUserIds.has(userId);

            if (isFavorite) {
                button.classList.remove('add-to-favorites');
                button.classList.add('favorite');
                button.textContent = ' Favorite';
                icon.className = 'fas fa-star';
            } else {
            }
        }
    };

    const renderFavoriteFriends = () => {
        const favoriteUsers = allUsers.filter(user => favoriteUserIds.has(user.login.uuid));
        
        favoriteFriendsContainer.innerHTML = '';
        
        if (favoriteUsers.length === 0) {
            noFavoritesMessage.classList.remove('hidden');
        } else {
            noFavoritesMessage.classList.add('hidden');
            const fragment = document.createDocumentFragment();
            favoriteUsers.forEach(user => {
                const userCardDiv = document.createElement('div');
                userCardDiv.innerHTML = createUserCardHtml(user, true); 
                fragment.appendChild(userCardDiv.firstElementChild);
            });
            favoriteFriendsContainer.appendChild(fragment);
        }
    };
    searchInput.addEventListener('input', handleSearch);
    sortBySelect.addEventListener('change', handleSort);
    genderFilterSelect.addEventListener('change', handleFilter);
    countryFilterSelect.addEventListener('change', handleFilter);
    minAgeFilterInput.addEventListener('input', handleFilter);
    maxAgeFilterInput.addEventListener('input', handleFilter);
    clearFiltersButton.addEventListener('click', clearFilters);
    loadMoreButton.addEventListener('click', handleLoadMoreClick);
    userCardsContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.user-card-button');
        if (targetButton && (targetButton.classList.contains('add-to-favorites') || targetButton.classList.contains('favorite'))) {
            const userId = targetButton.dataset.userId;
            toggleFavorite(userId);
        }
    });
    favoriteFriendsContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.user-card-button');
        if (targetButton && targetButton.classList.contains('favorite')) {
            const userId = targetButton.dataset.userId;
            toggleFavorite(userId);
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const focusedElement = document.activeElement;
            if (focusedElement.tagName !== 'BUTTON' && focusedElement.type !== 'submit') {
                event.preventDefault();
            }
        }
    });
    window.addEventListener('popstate', (event) => {
        if (authenticatedUser) {
            const state = event.state || parseUrlParams();
            Object.assign(currentQueryParams, state);
            searchInput.value = currentQueryParams.search;
            sortBySelect.value = currentQueryParams.sortBy;
            genderFilterSelect.value = currentQueryParams.gender;
            countryFilterSelect.value = currentQueryParams.country;
            minAgeFilterInput.value = currentQueryParams.minAge;
            maxAgeFilterInput.value = currentQueryParams.maxAge;
            currentPage = currentQueryParams.page;
            applyFiltersAndSort();
        }
    });

    window.addEventListener('scroll', handleScroll);

    const init = () => {
        currentQueryParams = parseUrlParams();
        searchInput.value = currentQueryParams.search;
        sortBySelect.value = currentQueryParams.sortBy;
        genderFilterSelect.value = currentQueryParams.gender;
        minAgeFilterInput.value = currentQueryParams.minAge;
        maxAgeFilterInput.value = currentQueryParams.maxAge;
        
        checkAuthStatus(); 
    };

    init();
});
