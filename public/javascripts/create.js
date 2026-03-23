Vue.component('create-organization-form', {
    template: `
        <div class="container">
            <button class="close-btn" @click="redirectToPreviousPage">X</button>
            <div class="stepper">
                <div class="step" :class="{ active: currentStep === 1 }">
                    <h3>1. The Basics</h3>
                    <p>Set up your free organization account</p>
                </div>
                <div class="step" :class="{ active: currentStep === 2 }">
                    <h3>2. Organization Details</h3>
                    <p>Submit it to Unity Volunteer for a brief review</p>
                </div>
            </div>

            <form @submit.prevent="submitForm" novalidate>
                <div v-if="currentStep === 1" class="form-section">
                    <h2>What is your organization called?</h2>
                    <div class="form-group">
                        <label for="organization-name">Organization Name*</label>
                        <input type="text" v-model="formData['organization-name']" @input="validateName" :class="{ 'is-invalid': errors.name }" placeholder="Start Typing..." required>
                        <span v-if="errors.name" class="error">{{ errors.name }}</span>
                    </div>
                    <div class="form-group">
                        <label for="location-type">Location Type*</label>
                        <select v-model="formData['location-type']" required>
                            <option value="onsite">Onsite</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="organization-email">Organization Email*</label>
                        <input type="email" v-model="formData['organization-email']" @input="validateEmail" :class="{ 'is-invalid': errors.email }" placeholder="e.g., info@yourorg.com" required>
                        <span v-if="errors.email" class="error">{{ errors.email }}</span>
                    </div>
                    <div class="form-group">
                        <label for="organization-category">Organization Category*</label>
                        <select v-model="formData['organization-category']" required>
                            <option v-for="category in categories" :key="category.categoryID" :value="category.categoryID">
                                {{ category.categoryName }}
                            </option>
                        </select>
                    </div>
                    <div class="button-group">
                        <button type="button" @click="nextStep" :disabled="!isStepOneValid">Next</button>
                    </div>
                </div>

                <div v-if="currentStep === 2" class="form-section">
                    <h2>Give us the description of your organization</h2>
                    <div class="form-group">
                        <label for="organization-description">Description*</label>
                        <textarea v-model="formData['organization-description']" placeholder="Describe your organization in less than 200 words" maxlength="200" required></textarea>
                    </div>
                    <div class="button-group">
                        <button type="button" @click="prevStep">Back</button>
                        <button type="submit">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    `,
    data() {
        return {
            currentStep: 1,
            formData: {
                'organization-name': '',
                'location-type': 'onsite',
                'organization-email': '',
                'organization-category': '',
                'organization-description': ''
            },
            categories: [],
            errors: {
                name: '',
                email: ''
            }
        };
    },
    computed: {
        isStepOneValid() {
            return this.formData['organization-name'] &&
                   this.formData['location-type'] &&
                   this.formData['organization-email'] &&
                   this.formData['organization-category'] &&
                   !this.errors.name &&
                   !this.errors.email;
        }
    },
    methods: {
        redirectToPreviousPage() {
            const previousPage = localStorage.getItem('previousPage');
            if (previousPage) {
                window.location.href = previousPage;
            } else {
                window.location.href = '/'; // Fallback to home page if no previous page found
            }
        },
        nextStep() {
            if (this.isStepOneValid) {
                this.currentStep++;
            } else {
                this.validateName();
                this.validateEmail();
            }
        },
        prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
            }
        },
        fetchCategories() {
            fetch('/create/organization-categories')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.categories = data.categories;
                    } else {
                        console.error('Failed to fetch categories:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching categories:', error));
        },
        validateName() {
            const name = this.formData['organization-name'];
            const numberCount = name.replace(/[^0-9]/g, "").length;
            if (numberCount > 1) {
                this.errors.name = 'Organization Name cannot consist of more than 1 number';
            } else {
                this.errors.name = '';
            }
        },
        validateEmail() {
            const email = this.formData['organization-email'];
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                this.errors.email = 'Please enter a valid email address';
            } else {
                this.errors.email = '';
            }
        },
        submitForm() {
            if (this.isStepOneValid) {
                fetch('/create/organization', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.formData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Organization created successfully!');
                        window.location.href = '/'; // Redirect to home or another page
                    } else {
                        alert('Error creating organization: ' + data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
            }
        }
    },
    created() {
        this.fetchCategories();
    }
});

new Vue({
    el: '#app'
});
