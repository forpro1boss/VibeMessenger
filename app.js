// VibeMessenger - Логика приложения

document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const phoneForm = document.getElementById('phone-form');
    const loginFormElement = document.getElementById('login-form-element');
    const registerFormElement = document.getElementById('register-form-element');
    const googleLoginBtn = document.getElementById('google-login');
    const googleRegisterBtn = document.getElementById('google-register');
    const phoneLoginBtn = document.getElementById('phone-login');
    const phoneRegisterBtn = document.getElementById('phone-register');
    const sendCodeBtn = document.getElementById('send-code');
    const verifyCodeBtn = document.getElementById('verify-code');
    const backToMainBtn = document.getElementById('back-to-main');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    let recaptchaVerifier;
    let confirmationResult;

    // Переключение вкладок
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));

    function switchTab(tab) {
        loginTab.classList.toggle('active', tab === 'login');
        registerTab.classList.toggle('active', tab === 'register');
        loginForm.classList.toggle('active', tab === 'login');
        registerForm.classList.toggle('active', tab === 'register');
        phoneForm.classList.remove('active');
        hideError();
    }

    // Вход по email и паролю
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!validateEmail(email)) {
            showError('Неверный формат email');
            return;
        }

        showLoader();
        try {
            await window.signInWithEmailAndPassword(window.auth, email, password);
            redirectToChat();
        } catch (error) {
            showError(getErrorMessage(error.code));
        }
        hideLoader();
    });

    // Регистрация по email и паролю
    registerFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value.trim();
        const surname = document.getElementById('register-surname').value.trim();
        const username = document.getElementById('register-username').value.trim().toLowerCase();
        const phone = document.getElementById('register-phone').value.trim() || null;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        // Валидация
        if (!name || !surname) {
            showError('Введите имя и фамилию');
            return;
        }

        if (!username || username.length < 3) {
            showError('@юзернейм должен быть минимум 3 символа');
            return;
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
            showError('@юзернейм может содержать только латиницу, цифры и _');
            return;
        }

        if (!validateEmail(email)) {
            showError('Неверный формат email');
            return;
        }

        if (password.length < 6) {
            showError('Пароль должен содержать минимум 6 символов');
            return;
        }

        showLoader();
        try {
            // Проверка уникальности юзернейма
            const usernameQuery = window.query(
                window.collection(window.db, 'users'),
                window.where('username', '==', username)
            );
            const usernameSnapshot = await window.getDocs(usernameQuery);
            
            if (!usernameSnapshot.empty) {
                showError('Этот @юзернейм уже занят');
                hideLoader();
                return;
            }

            // Создание аккаунта
            const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;

            // Сохранение профиля в Firestore
            await window.addDoc(window.collection(window.db, 'users'), {
                uid: user.uid,
                name: name,
                surname: surname,
                username: username,
                email: email,
                phone: phone,
                avatar: null,
                bio: '',
                createdAt: new Date(),
                lastSeen: new Date()
            });

            console.log('Профиль создан:', { name, surname, username });
            redirectToChat();
        } catch (error) {
            console.error('Registration error:', error);
            showError(getErrorMessage(error.code));
        }
        hideLoader();
    });

    // Вход через Google
    googleLoginBtn.addEventListener('click', () => signInWithGoogle());
    googleRegisterBtn.addEventListener('click', () => signInWithGoogle());

    async function signInWithGoogle() {
        showLoader();
        try {
            const result = await window.signInWithPopup(window.auth, window.provider);
            const user = result.user;
            console.log('Google sign in successful:', user.email);

            // Проверяем существует ли профиль
            const userQuery = window.query(
                window.collection(window.db, 'users'),
                window.where('uid', '==', user.uid)
            );
            const userSnapshot = await window.getDocs(userQuery);

            if (userSnapshot.empty) {
                // Создаём новый профиль для Google пользователя
                const nameParts = (user.displayName || 'User').split(' ');
                const username = (user.email.split('@')[0] + Math.random().toString(36).substr(2, 5)).toLowerCase();

                await window.addDoc(window.collection(window.db, 'users'), {
                    uid: user.uid,
                    name: nameParts[0] || 'User',
                    surname: nameParts[1] || '',
                    username: username,
                    email: user.email,
                    phone: null,
                    avatar: user.photoURL || null,
                    bio: '',
                    createdAt: new Date(),
                    lastSeen: new Date(),
                    provider: 'google'
                });
                console.log('Google профиль создан:', username);
            }

            redirectToChat();
        } catch (error) {
            console.error('Google sign in error:', error);
            showError(getErrorMessage(error.code));
        }
        hideLoader();
    }

    // Телефонная аутентификация
    phoneLoginBtn.addEventListener('click', () => showPhoneForm());
    phoneRegisterBtn.addEventListener('click', () => showPhoneForm());

    function showPhoneForm() {
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        phoneForm.classList.add('active');
        initRecaptcha();
    }

    backToMainBtn.addEventListener('click', () => {
        phoneForm.classList.remove('active');
        loginForm.classList.add('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        document.getElementById('code-group').classList.add('hidden');
        document.getElementById('verify-code').classList.add('hidden');
    });

    function initRecaptcha() {
        if (!recaptchaVerifier) {
            recaptchaVerifier = new window.RecaptchaVerifier('recaptcha-container', {
                size: 'normal',
                callback: (response) => {
                    console.log('reCAPTCHA solved');
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expired');
                }
            }, window.auth);
        }
    }

    sendCodeBtn.addEventListener('click', async () => {
        const phoneNumber = document.getElementById('phone-number').value;
        if (!phoneNumber) {
            showError('Введите номер телефона');
            return;
        }
        if (!phoneNumber.startsWith('+')) {
            showError('Номер телефона должен начинаться с + (например, +7...)');
            return;
        }
        if (phoneNumber.length < 10) {
            showError('Введите полный номер телефона');
            return;
        }

        showLoader();
        try {
            confirmationResult = await window.signInWithPhoneNumber(window.auth, phoneNumber, recaptchaVerifier);
            document.getElementById('code-group').classList.remove('hidden');
            document.getElementById('verify-code').classList.remove('hidden');
            sendCodeBtn.style.display = 'none';
            showError('Код отправлен на ваш номер. Проверьте SMS.');
        } catch (error) {
            console.error('Phone auth error:', error);
            showError(getErrorMessage(error.code));
        }
        hideLoader();
    });

    verifyCodeBtn.addEventListener('click', async () => {
        const code = document.getElementById('verification-code').value;
        if (!code) {
            showError('Введите код подтверждения');
            return;
        }

        showLoader();
        try {
            const result = await confirmationResult.confirm(code);
            const user = result.user;
            console.log('Phone verification successful:', result.user);

            // Проверяем существует ли профиль
            const userQuery = window.query(
                window.collection(window.db, 'users'),
                window.where('uid', '==', user.uid)
            );
            const userSnapshot = await window.getDocs(userQuery);

            if (userSnapshot.empty) {
                // Создаём новый профиль для Phone пользователя
                const username = (user.phoneNumber.replace(/\D/g, '') + Math.random().toString(36).substr(2, 5)).toLowerCase().substr(-10);

                await window.addDoc(window.collection(window.db, 'users'), {
                    uid: user.uid,
                    name: 'User',
                    surname: '',
                    username: username,
                    email: user.email || '',
                    phone: user.phoneNumber,
                    avatar: null,
                    bio: '',
                    createdAt: new Date(),
                    lastSeen: new Date(),
                    provider: 'phone'
                });
                console.log('Phone профиль создан:', username);
            }

            redirectToChat();
        } catch (error) {
            console.error('Phone verification error:', error);
            showError('Неверный код подтверждения');
        }
        hideLoader();
    });

    // Валидация email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Показ/скрытие loader
    function showLoader() {
        loader.classList.remove('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    // Показ ошибок
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    // Перевод ошибок Firebase
    function getErrorMessage(code) {
        switch (code) {
            case 'auth/user-not-found':
                return 'Пользователь не найден';
            case 'auth/wrong-password':
                return 'Неверный пароль';
            case 'auth/email-already-in-use':
                return 'Email уже используется';
            case 'auth/weak-password':
                return 'Пароль слишком слабый';
            case 'auth/invalid-email':
                return 'Неверный email';
            case 'auth/too-many-requests':
                return 'Слишком много попыток, попробуйте позже';
            case 'auth/invalid-phone-number':
                return 'Неверный номер телефона. Используйте формат +7XXXXXXXXXX';
            case 'auth/missing-phone-number':
                return 'Введите номер телефона';
            case 'auth/code-expired':
                return 'Код истёк, запросите новый';
            case 'auth/invalid-verification-code':
                return 'Неверный код';
            case 'auth/invalid-verification-id':
                return 'Неверный ID верификации';
            case 'auth/missing-verification-code':
                return 'Введите код верификации';
            case 'auth/popup-blocked':
                return 'Popup заблокирован браузером. Разрешите popups для этого сайта';
            case 'auth/popup-closed-by-user':
                return 'Popup закрыт пользователем';
            case 'auth/cancelled-popup-request':
                return 'Запрос popup отменён';
            case 'auth/operation-not-allowed':
                return 'Операция не разрешена. Проверьте настройки в Firebase Console';
            case 'auth/operation-not-supported-in-this-environment':
                return 'Операция не поддерживается в этой среде';
            default:
                return 'Произошла ошибка: ' + code;
        }
    }

    // Редирект после входа
    function redirectToChat() {
        // В будущем здесь будет редирект на чат
        alert('Успешный вход! Переход к чату...');
        // window.location.href = 'chat.html';
    }

    // Проверка состояния авторизации
    window.onAuthStateChanged(window.auth, (user) => {
        if (user) {
            // Пользователь авторизован
            console.log('Пользователь авторизован:', user.email || user.phoneNumber);
            // redirectToChat();
        } else {
            // Пользователь не авторизован
            console.log('Пользователь не авторизован');
        }
    });
});