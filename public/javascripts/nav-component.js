Vue.component('nav-component', {
    template: `
        <nav>
            <ul>
                <li><a :href="'/find/browse/' + (username ? username : 'guest')" class="active">Find Organizations</a></li>
                <li v-if="username"><a :href="'/create/organization?username=' + username">Create Organization</a></li>
                <li v-if="username"><a href="#" v-on:click.prevent="redirectToAccount">Account</a></li>
                <li v-if="username"><a href="#" v-on:click.prevent="logout">Logout</a></li>
                <li v-else><a href="/auth/sign-up">Sign Up</a></li>
            </ul>
        </nav>
    `,
    data() {
        return {
            username: localStorage.getItem('username')
        };
    },
    methods: {
        redirectToAccount() {
            if (this.username) {
                window.location.href = `/account?username=${this.username}`;
            } else {
                window.location.href = '/auth/sign-up';
            }
        },
        logout() {
            fetch('/auth/logout', {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.removeItem('username');
                        window.location.href = '/';
                    } else {
                        alert('Logout failed: ' + data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }
});
