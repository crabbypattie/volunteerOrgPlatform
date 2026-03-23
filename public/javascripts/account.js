Vue.component('account-overview', {
    template: `
        <div class="account-container">
            <div class="header">
                <button class="close-button" v-on:click="goBack">x</button>
            </div>
            <div class="profile-section">
                <img :src="getProfilePhotoUrl(user.profile_photo)" alt="Profile Picture" class="profile-picture" id="profile-picture">
                <input type="file" ref="fileInput" v-on:change="onFileChange" class="file-input" accept=".jpeg, .jpg, .png, .gif" style="display: none;">
                <button class="edit-button" v-on:click="triggerFileInput">Edit</button>
                <a href="#" class="change-password" v-on:click="openChangePasswordModal">Change Password</a>
                <a href="#" class="logout">Log out</a>
            </div>
            <div class="details-section">
                <h2>My Account</h2>
                <div class="input-group" v-for="(value, key) in userDetails" :key="key">
                    <label :for="key">{{ labelMap[key] }}</label>
                    <input :id="key" v-model="user[key]" :disabled="key === 'username'">
                    <button class="edit-icon">✏️</button>
                </div>
                <div class="interests-section">
                    <h3>Interests <a href="#" class="edit-link">Edit</a></h3>
                    <div class="interests">
                        <span v-for="interest in user.interests.split(',')" class="interest">{{ interest.trim() }}</span>
                    </div>
                </div>
                <div class="organizations-section">
                    <h3>Organizations</h3>
                    <div class="organizations">
                        <span v-for="org in user.organizations" class="organization">{{ org }}</span>
                    </div>
                </div>
                <button class="save-button" v-on:click="saveAccount">Save</button>
            </div>

            <!-- Change Password Modal -->
            <div id="changePasswordModal" class="modal" v-if="showChangePasswordModal">
                <div class="modal-content">
                    <span class="close" v-on:click="closeChangePasswordModal">&times;</span>
                    <h2>Change Password</h2>
                    <form v-on:submit.prevent="resetPassword">
                        <label for="currentPassword">Current Password:</label>
                        <input type="password" v-model="currentPassword" id="currentPassword" required>
                        <label for="newPassword">New Password:</label>
                        <input type="password" v-model="newPassword" id="newPassword" required>
                        <label for="repeatPassword">Repeat Password:</label>
                        <input type="password" v-model="repeatPassword" id="repeatPassword" required>
                        <div>
                            <button type="submit" class="save-button">Save</button>
                            <button type="button" class="cancel-button" v-on:click="closeChangePasswordModal">Cancel</button>
                        </div>
                    </form>
                    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
                    <div v-if="successMessage" class="success">{{ successMessage }}</div>
                    <div class="password-requirements">
                        <p>Password must:</p>
                        <ul>
                            <li>Include lower and upper characters</li>
                            <li>Include at least 1 number or symbol</li>
                            <li>Be at least 8 characters long</li>
                            <li>Match in both fields</li>
                            <li>Cannot contain spaces and "/" symbol</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            user: {
                given_name: '',
                last_name: '',
                username: '',
                phone_number: '',
                email: '',
                interests: '',
                profile_photo: '',
                organizations: []
            },
            labelMap: {
                given_name: 'Given Name',
                last_name: 'Last Name',
                username: 'Username',
                phone_number: 'Phone Number',
                email: 'Email Address'
            },
            selectedFile: null,
            currentPassword: '',
            newPassword: '',
            repeatPassword: '',
            showChangePasswordModal: false,
            errorMessage: '',
            successMessage: ''
        };
    },
    computed: {
        userDetails() {
            return {
                given_name: this.user.given_name,
                last_name: this.user.last_name,
                username: this.user.username,
                phone_number: this.user.phone_number,
                email: this.user.email
            };
        }
    },
    methods: {
        fetchUserData() {
            const username = localStorage.getItem('username') || 'defaultUsername'; // Use dynamic username from localStorage
            fetch(`/account/${username}/data`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.user = data.user;
                    } else {
                        console.error('Failed to fetch user data:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching user data:', error));
        },
        saveAccount() {
            const username = this.user.username || 'defaultUsername'; // Replace with dynamic username if needed
            fetch(`/account/${username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.user)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Account updated successfully');
                } else {
                    alert('Failed to update account: ' + data.message);
                }
            })
            .catch(error => console.error('Error updating account:', error));
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        onFileChange(event) {
            this.selectedFile = event.target.files[0];
            if (this.validateFileType(this.selectedFile)) {
                this.uploadProfilePicture();
            } else {
                alert("Invalid file type. Please select a .jpeg, .png, or .gif file.");
            }
        },
        validateFileType(file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            return validTypes.includes(file.type);
        },
        uploadProfilePicture() {
            if (!this.selectedFile) {
                alert("Please select a file first.");
                return;
            }

            const formData = new FormData();
            formData.append('profile_picture', this.selectedFile);
            const username = this.user.username || 'defaultUsername'; // Replace with dynamic username if needed

            fetch(`/account/${username}/upload`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Profile picture uploaded successfully');
                    this.user.profile_photo = data.profile_photo; // Update profile picture in UI
                } else {
                    alert('Failed to upload profile picture: ' + data.message);
                }
            })
            .catch(error => console.error('Error uploading profile picture:', error));
        },
        getProfilePhotoUrl(photoPath) {
            return photoPath ? photoPath : '/images/default_picture.jpg';
        },
        goBack() {
            window.history.back();
        },
        openChangePasswordModal() {
            this.showChangePasswordModal = true;
        },
        closeChangePasswordModal() {
            this.showChangePasswordModal = false;
            this.currentPassword = '';
            this.newPassword = '';
            this.repeatPassword = '';
            this.errorMessage = '';
            this.successMessage = '';
        },
        resetPassword() {
            if (this.newPassword !== this.repeatPassword) {
                this.errorMessage = 'New passwords do not match';
                return;
            }

            console.log('Validating current password...');

            fetch('/account/validate-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: this.user.username, currentPassword: this.currentPassword })
            })
            .then(response => {
                console.log('Validation response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Validation response:', JSON.stringify(data));
                if (data.success) {
                    console.log('Current password validated. Proceeding to reset password...');

                    fetch('/account/reset-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username: this.user.username, newPassword: this.newPassword })
                    })
                    .then(response => {
                        console.log('Password reset response status:', response.status);
                        return response.json();
                    })
                    .then(data => {
                        console.log('Password reset response:', JSON.stringify(data));
                        if (data.success) {
                            this.successMessage = 'Password changed successfully';
                            this.closeChangePasswordModal();
                        } else {
                            this.errorMessage = 'Failed to change password';
                        }
                    })
                    .catch(error => {
                        console.error('Error changing password:', error);
                        this.errorMessage = 'Failed to change password';
                    });
                } else {
                    console.error('Current password validation failed:', data.message);
                    this.errorMessage = 'Current password is incorrect';
                }
            })
            .catch(error => {
                console.error('Error validating password:', error);
                this.errorMessage = 'Failed to validate current password';
            });
        }
    },
    created() {
        this.fetchUserData();
    }
});

new Vue({
    el: '#app'
});