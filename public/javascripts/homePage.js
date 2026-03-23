Vue.component('home-page', {
    template: `
    <div class="login-container">
        <div class="login-box">
            <img src="/images/logo.png" alt="Unity Volunteer Logo" class="logo">
            <h1>Unity Volunteer</h1>
            <p>A place to connect volunteers and make a difference</p>
            <div class="social-login">
                <a href="/auth/google" class="google-login-button">
                    Continue with Google
                </a>
                <a href="/auth/facebook" class="facebook-login-button">
                    Continue with Facebook
                </a>
            </div>
            <div class="divider">
                <hr class="divider-line">
                <span>or</span>
                <hr class="divider-line">
            </div>
            <form id="signinForm" @submit.prevent="login">
                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" v-model="email" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" v-model="password" required>
                </div>
                <div class="input-group">
                    <button type="submit" class="login-btn">Login</button>
                </div>
                <div class="forgot-password">
                    <a href="#">Forgot password?</a>
                </div>
            </form>
            <div class="signup-link">
                <p>Don't have an account? <a href="sign-up">Sign up with email</a></p>
            </div>
            <p v-if="signinMessage" :style="{ color: signinMessageColor }">{{ signinMessage }}</p>
        </div>
    </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            signinMessage: '',
            signinMessageColor: 'red'
        };
    },
    created() {
        const username = localStorage.getItem('username');
        if (username) {
            window.location.href = '/find/browse?username=' + username;
        }else{
            window.location.href = '/find/browse'
        }
    },
    methods: {
        login() {
            const formData = new URLSearchParams();
            formData.append('email', this.email);
            formData.append('password', this.password);

            fetch('/auth/signin', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.signinMessage = 'Login successful. Redirecting...';
                    this.signinMessageColor = 'green';
                    localStorage.setItem('username', data.user.username);
                    localStorage.setItem('user_id', data.user.user_id);
                    window.location.href = '/find/browse?username=' + data.user.username;
                } else {
                    this.signinMessage = data.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.signinMessage = 'An error occurred. Please try again.';
            });
        }
    }
});

new Vue({
    el: '#app'
});
