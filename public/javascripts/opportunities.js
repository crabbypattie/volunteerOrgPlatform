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


Vue.component('sidebar-component', {
    template: `
    <div class="sidebar" id="sidebar">
        <div class="filter-section">
            <div class="filter-title">Category</div>
            <label class="filter-label" v-for="category in categories" :key="category.categoryID">
                <input type="checkbox" class="filter-checkbox" name="category" :value="category.categoryID" @change="updateSelectedCategories"> {{ category.categoryName }}
            </label>
        </div>
    </div>
    `,
    data() {
        return {
            categories: []
        };
    },
    created() {
        this.fetchCategories();
    },
    methods: {
        fetchCategories() {
            fetch('/find/categories')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Filter out duplicate categories by categoryName
                        const uniqueCategories = Array.from(new Map(data.categories.map(category => [category.categoryName, category])).values());
                        this.categories = uniqueCategories;
                        console.log('Unique categories:', this.categories); // Debugging line
                    } else {
                        console.error('Failed to fetch categories:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching categories:', error));
        },
        updateSelectedCategories() {
            const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => checkbox.value);
            this.$emit('update-selected-categories', selectedCategories);
        }
    }
});

Vue.component('discover-component', {
    template: `
    <div id="discoverContent" class="view-content">
        <div class="opportunities-info">
            <h2 style="color:#f7c948;">LIST OF VOLUNTEER ORGANIZATION</h2>
            <p id="organizationCountText" style="color:white">Displaying {{ startIndex + 1 }} - {{ endIndex }} of {{ totalOrganizations }} Organizations</p>
            <input type="text" v-model="searchQuery" @input="searchOrganizations" placeholder="Search Organization name..." class="search-input"/>
        </div>
        <div id="organizations-list">
            <div v-for="org in paginatedOrganizations" :key="org.organizationID" class="volunteer-listing">
                <h2 class="volunteer-title">{{ org.name }}</h2>
                <div class="volunteer-category">Category: {{ org.categoryName }}</div>
                <div class="volunteer-description">{{ org.description }}</div>
                <div class="volunteer-email">Email: {{ org.email }}</div>
                <button class="details-button" @click="showDetails(org.organizationID)">Organization Details</button>
                <button class="join-button" @click="joinOrganization(org)">Join Organization</button>
                <button class="rsvp-button" @click="rsvpEvent(org.organizationID)" v-if="org.eventPrivacy === 'public'">RSVP</button>
            </div>
        </div>
        <pagination-component
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-changed="changePage"
        ></pagination-component>
    </div>
    `,
    props: ['selectedCategories'],
    data() {
        return {
            organizations: [],
            totalOrganizations: 0,
            currentPage: 1,
            itemsPerPage: 8,
            loggedInUser: null,
            searchQuery: '' // Add searchQuery to data
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalOrganizations / this.itemsPerPage);
        },
        paginatedOrganizations() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.organizations.slice(start, end);
        },
        startIndex() {
            return (this.currentPage - 1) * this.itemsPerPage;
        },
        endIndex() {
            return Math.min(this.startIndex + this.itemsPerPage, this.totalOrganizations);
        }
    },
    watch: {
        selectedCategories(newCategories) {
            this.fetchOrganizations(newCategories);
        }
    },
    created() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        if (searchQuery) {
            this.searchQuery = searchQuery;
            this.searchOrganizations();
        } else {
            this.fetchOrganizations(this.selectedCategories);
        }
        this.fetchOrganizationCount();
        this.fetchLoggedInUser();
    },
    methods: {
        fetchOrganizations(categories = []) {
            const categoryQuery = categories.length ? `?categoryID=${categories.join(',')}` : '';
            fetch(`/find/organizations${categoryQuery}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.organizations = data.organizations;
                        this.totalOrganizations = this.organizations.length;
                    } else {
                        console.error('Failed to fetch organizations:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching data:', error));
        },
        fetchOrganizationCount() {
            fetch('/find/organization-count')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.totalOrganizations = data.count;
                    }
                })
                .catch(error => console.error('Error fetching organization count:', error));
        },
        fetchLoggedInUser() {
            fetch('/auth/logged-in-user')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.loggedInUser = data.user;
                        localStorage.setItem('username', data.user.username); // Store username in local storage
                    }
                })
                .catch(error => console.error('Error fetching logged-in user:', error));
        },
        changePage(page) {
            this.currentPage = page;
        },
        showDetails(organizationID) {
            localStorage.setItem('organizationID', organizationID);
            const username = localStorage.getItem('username') || 'guest';
            window.location.href = `/organization/${username}`;
        },
        joinOrganization(org) {
            const username = localStorage.getItem('username');
            if (!username) {
                alert('Please log in to join an organization.');
                window.location.href = '/auth/sign-up'; // Redirect to login page
                return;
            }

            const organizationID = org.organizationID;
            fetch('/find/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ organizationID: organizationID })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('You have successfully joined ' + org.name);
                    } else {
                        alert('Failed to join organization: ' + data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
        },
        rsvpEvent(organizationID) {
            const username = localStorage.getItem('username') || 'guest';
            fetch('/organization/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ eventID: organizationID })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('RSVP successful');
                    } else {
                        alert('Failed to RSVP: ' + data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
        },
        searchOrganizations() {
            if (this.searchQuery.trim() === '') {
                this.fetchOrganizations(this.selectedCategories);
                return;
            }
            fetch(`/find/search?q=${encodeURIComponent(this.searchQuery.trim())}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.organizations = data.organizations;
                        this.totalOrganizations = this.organizations.length;
                    } else {
                        console.error('Failed to fetch search results:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching search results:', error));
        }
    }
});


Vue.component('dashboard-component', {
    template: `
    <div id="dashboardContent" class="view-content">
        <div class="opportunities-info">
            <h2 style="color:#f7c948">ORGANIZATIONS YOU HAVE JOINED</h2>
        </div>
        <div v-if="joinedOrganizations.length === 0">
            <h1 style="color:white">OOPS, you haven't joined any organizations yet.</h1>
        </div>
        <div v-else>
            <div v-for="org in joinedOrganizations" :key="org.organization_id" class="volunteer-listing">
                <h2 class="volunteer-title">{{ org.name }}</h2>
                <div class="volunteer-category">Category: {{ org.categoryName }}</div>
                <div class="volunteer-description">{{ org.description }}</div>
                <div class="volunteer-email">Email: {{ org.email }}</div>
                <button class="details-button" @click="fetchEvents(org.organization_id)">View Events</button>
                <button v-if="events[org.organization_id]" class="details-button" @click="hideEvents(org.organization_id)">Hide Events</button>
                <div v-if="events[org.organization_id]" class="events-list">
                    <div v-for="event in events[org.organization_id]" :key="event.eventID" class="event-item">
                        <h3>{{ event.eventName }}</h3>
                        <p>{{ event.eventDescription }}</p>
                        <p>Date: {{ formatDate(event.eventDate) }}</p>
                        <p>Location: {{ event.eventLocation }}</p>
                        <button class="rsvp-button" @click="rsvpEvent(event.eventID)">RSVP</button>
                        <hr class="event-separator">
                    </div>
                </div>
            </div>
        </div>

        <div class="opportunities-info">
            <h2 style="color:#f7c948">ORGANIZATIONS YOU RUN</h2>
        </div>
        <div v-if="managedOrganizations.length === 0">
            <h1 style="color:white">OOPS, you don't manage any organizations yet.</h1>
        </div>
        <div v-else>
            <div v-for="org in managedOrganizations" :key="org.organization_id" class="volunteer-listing">
                <h2 class="volunteer-title">{{ org.name }}</h2>
                <div class="volunteer-category">Category: {{ org.categoryName }}</div>
                <div class="volunteer-description">{{ org.description }}</div>
                <div class="volunteer-email">Email: {{ org.email }}</div>
                <button class="details-button" @click="manageOrganization(org.organization_id)">Manage Organization</button>
                <button v-if="events[org.organization_id]" class="details-button" @click="hideEvents(org.organization_id)">Hide Events</button>
                <div v-if="events[org.organization_id]" class="events-list">
                    <div v-for="event in events[org.organization_id]" :key="event.eventID" class="event-item">
                        <h3>{{ event.eventName }}</h3>
                        <p>{{ event.eventDescription }}</p>
                        <p>Date: {{ formatDate(event.eventDate) }}</p>
                        <p>Location: {{ event.eventLocation }}</p>
                        <button class="rsvp-button" @click="rsvpEvent(event.eventID)">RSVP</button>
                        <hr class="event-separator">
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            joinedOrganizations: [],
            managedOrganizations: [],
            events: {},
            username: localStorage.getItem('username')
        };
    },
    created() {
        this.fetchJoinedOrganizations();
        this.fetchManagedOrganizations();
    },
    methods: {
        fetchJoinedOrganizations() {
            fetch('/find/joined-organizations')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.joinedOrganizations = data.organizations;
                    } else {
                        console.error('Failed to fetch joined organizations:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching joined organizations:', error));
        },
        fetchManagedOrganizations() {
            fetch('/find/managed-organizations')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.managedOrganizations = data.organizations;
                    } else {
                        console.error('Failed to fetch managed organizations:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching managed organizations:', error));
        },
        fetchEvents(organizationID) {
            if (!this.events[organizationID]) {
                fetch(`/find/events/${organizationID}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.$set(this.events, organizationID, data.events);
                        } else {
                            console.error('Failed to fetch events:', data.message);
                        }
                    })
                    .catch(error => console.error('Error fetching events:', error));
            }
        },
        hideEvents(organizationID) {
            this.$delete(this.events, organizationID);
        },
        rsvpEvent(eventID) {
            const permissionResponse = 1;
            fetch('/find/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ eventID: eventID, permissionResponse: permissionResponse })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Successfully RSVPed to the event');
                    } else {
                        alert('Failed to RSVP: ' + data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
        },
        manageOrganization(organizationID) {
            localStorage.setItem('organizationID', organizationID); // Store the organization ID in local storage
            window.location.href = `/organization/${this.username}`;
        },
        formatDate(dateStr) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateStr).toLocaleDateString(undefined, options);
        }
    }
});



Vue.component('pagination-component', {
    template: `
    <div class="pagination">
        <button v-on:click="prevPage" :disabled="currentPage === 1">❮</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button v-on:click="nextPage" :disabled="currentPage === totalPages">❯</button>
    </div>
    `,
    props: {
        currentPage: {
            type: Number,
            required: true
        },
        totalPages: {
            type: Number,
            required: true
        }
    },
    methods: {
        prevPage() {
            if (this.currentPage > 1) {
                this.$emit('page-changed', this.currentPage - 1);
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.$emit('page-changed', this.currentPage + 1);
            }
        }
    }
});

new Vue({
    el: '#app',
    data: {
        isDashboardActive: false,
        isDiscoverActive: true,
        selectedCategories: []
    },
    methods: {
        showDashboard() {
            this.isDashboardActive = true;
            this.isDiscoverActive = false;
        },
        showDiscover() {
            this.isDashboardActive = false;
            this.isDiscoverActive = true;
        },
        updateSelectedCategories(categories) {
            this.selectedCategories = categories;
            this.$refs.discover.fetchOrganizations(categories);
        }
    }
});
