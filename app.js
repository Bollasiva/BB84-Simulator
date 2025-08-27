class AuthApp {
    constructor() {
        this.elements = {
            signupPage: document.getElementById('signupPage'),
            signinPage: document.getElementById('signinPage'),
            forgotPasswordPage: document.getElementById('forgotPasswordPage'),

            signupForm: document.getElementById('signupForm'),
            signupEmail: document.getElementById('signupEmail'),
            signupFullName: document.getElementById('signupFullName'),
            signupUsername: document.getElementById('signupUsername'),
            signupPassword: document.getElementById('signupPassword'),
            signupError: document.getElementById('signupError'),

            signinForm: document.getElementById('signinForm'),
            signinUsername: document.getElementById('signinUsername'),
            signinPassword: document.getElementById('signinPassword'),
            signinError: document.getElementById('signinError'),

            forgotPasswordForm: document.getElementById('forgotPasswordForm'),
            forgotPasswordEmail: document.getElementById('forgotPasswordEmail'),
            forgotPasswordMessage: document.getElementById('forgotPasswordMessage'),
            forgotPasswordError: document.getElementById('forgotPasswordError'),

            showSigninLink: document.getElementById('showSigninLink'),
            showSignupLink: document.getElementById('showSignupLink2'),
            showForgotPasswordLink: document.getElementById('showForgotPasswordLink'),
            backToSigninLink: document.getElementById('backToSigninLink'),
        };

        this.backendURL = "/api";
        this.setupEventListeners();
        this.showPage('signin');
    }

    setupEventListeners() {
        if (this.elements.showSigninLink) {
            this.elements.showSigninLink.addEventListener('click', (e) => {
                e.preventDefault(); this.showPage('signin');
            });
        }
        if (this.elements.showSignupLink) {
            this.elements.showSignupLink.addEventListener('click', (e) => {
                e.preventDefault(); this.showPage('signup');
            });
        }
        if (this.elements.showForgotPasswordLink) {
            this.elements.showForgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault(); this.showPage('forgotPassword');
            });
        }
        if (this.elements.backToSigninLink) {
            this.elements.backToSigninLink.addEventListener('click', (e) => {
                e.preventDefault(); this.showPage('signin');
            });
        }

        this.elements.signupForm.addEventListener('submit', this.handleSignup.bind(this));
        this.elements.signinForm.addEventListener('submit', this.handleSignin.bind(this));
        this.elements.forgotPasswordForm.addEventListener('submit', this.handleForgotPassword.bind(this));
    }

    showPage(page) {
        this.elements.signupPage.classList.add('hidden');
        this.elements.signinPage.classList.add('hidden');
        this.elements.forgotPasswordPage.classList.add('hidden');

        if (page === 'signup') this.elements.signupPage.classList.remove('hidden');
        else if (page === 'signin') this.elements.signinPage.classList.remove('hidden');
        else if (page === 'forgotPassword') this.elements.forgotPasswordPage.classList.remove('hidden');
    }

    async handleSignup(e) {
        e.preventDefault();
        const data = {
            fullName: this.elements.signupFullName.value,
            username: this.elements.signupUsername.value,
            email: this.elements.signupEmail.value,
            password: this.elements.signupPassword.value
        };

        try {
            const res = await fetch(`${this.backendURL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (res.ok) {
                alert(result.message);
                this.showPage('signin');
            } else {
                this.elements.signupError.textContent = result.message;
                this.elements.signupError.classList.remove('hidden');
            }
        } catch (err) {
            this.elements.signupError.textContent = "Server error. Try again.";
            this.elements.signupError.classList.remove('hidden');
        }
    }

    async handleSignin(e) {
        e.preventDefault();
        const data = {
            username: this.elements.signinUsername.value,
            password: this.elements.signinPassword.value
        };

        try {
            const res = await fetch(`${this.backendURL}/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                // ✅ Save user details in localStorage
                localStorage.setItem("token", result.token);
                localStorage.setItem("username", result.username);
                localStorage.setItem("fullName", result.fullName);

                alert(`Welcome back, ${result.fullName || result.username}!`);

                // ✅ Redirect to simulator
                window.location.href = "./Simulator/bb84-simulator.html";
            } else {
                this.elements.signinError.textContent = result.message;
                this.elements.signinError.classList.remove('hidden');
            }
        } catch (err) {
            this.elements.signinError.textContent = "Server error. Try again.";
            this.elements.signinError.classList.remove('hidden');
        }
    }

    handleForgotPassword(e) {
        e.preventDefault();
        const email = this.elements.forgotPasswordEmail.value;
        this.elements.forgotPasswordMessage.textContent =
            `Password reset link sent to ${email} (simulation).`;
        this.elements.forgotPasswordMessage.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => new AuthApp());
