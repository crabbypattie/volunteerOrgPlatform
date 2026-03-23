new Vue({
    el: '#app',
    data: {
        organization: null,
        events: [],
        updates: [],
        organizationID: null,
        newEvent: {
            eventName: '',
            eventDescription: '',
            eventDate: '',
            eventLocation: '',
            eventPrivacy: 'public'
        },
        currentEvent: null,
        editMode: false,
        showAddEventForm: false,
        userIsManager: false,
        loggedInUser: null
    },
    created() {
        this.organizationID = localStorage.getItem('organizationID');
        if (!this.organizationID) {
            console.error('No organizationID found in local storage');
            return;
        }
        console.log(`Loaded organizationID from localStorage: ${this.organizationID}`);
        this.fetchOrganizationDetails();
        this.fetchOrganizationEvents();
        this.fetchOrganizationUpdates();
        this.checkUserIsManager();
        this.fetchLoggedInUser();
    },
    methods: {
        fetchOrganizationDetails() {
            fetch(`/organization/details/${this.organizationID}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.organization = data.organization;
                    } else {
                        console.error('Failed to fetch organization details:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching organization details:', error));
        },
        fetchOrganizationEvents() {
            fetch(`/organization/events/${this.organizationID}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.events = data.events;
                    } else {
                        console.error('Failed to fetch organization events:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching organization events:', error));
        },
        fetchOrganizationUpdates() {
            fetch(`/organization/updates/${this.organizationID}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.updates = data.updates;
                    } else {
                        console.error('Failed to fetch organization updates:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching organization updates:', error));
        },
        rsvpEvent(eventID) {
            const username = localStorage.getItem('username') || 'guest';
            fetch('/organization/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ eventID: eventID, username: username })
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
        addEvent() {
            fetch(`/organization/add-event/${this.organizationID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.newEvent)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.events.push(data.event);
                        this.newEvent = { eventName: '', eventDescription: '', eventDate: '', eventLocation: '', eventPrivacy: 'public' };
                        this.showAddEventForm = false; // Close the form after adding event
                    } else {
                        console.error('Failed to add event:', data.message);
                    }
                })
                .catch(error => console.error('Error adding event:', error));
        },
        editEvent(event) {
            this.currentEvent = { ...event };
            this.editMode = true;
        },
        updateEvent() {
            fetch(`/organization/update-event/${this.currentEvent.eventID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.currentEvent)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const index = this.events.findIndex(event => event.eventID === this.currentEvent.eventID);
                        this.$set(this.events, index, this.currentEvent);
                        this.currentEvent = null;
                        this.editMode = false;
                    } else {
                        console.error('Failed to update event:', data.message);
                    }
                })
                .catch(error => console.error('Error updating event:', error));
        },
        deleteEvent(eventID) {
            fetch(`/organization/delete-event/${eventID}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.events = this.events.filter(event => event.eventID !== eventID);
                    } else {
                        console.error('Failed to delete event:', data.message);
                    }
                })
                .catch(error => console.error('Error deleting event:', error));
        },
        goBack() {
            window.location.href = '/find/browse';  // Redirect to Find Organization page
        },
        toggleAddEventForm() {
            this.showAddEventForm = !this.showAddEventForm;
        },
        cancelEdit() {
            this.editMode = false;
            this.currentEvent = null;
        },
        formatDate(dateStr) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateStr).toLocaleDateString(undefined, options);
        },
        checkUserIsManager() {
            console.log(`Checking if user is manager for organizationID: ${this.organizationID}`);
            fetch(`/organization/check-manager/${this.organizationID}`)
                .then(response => response.json())
                .then(data => {
                    console.log(`Manager check response: ${JSON.stringify(data)}`);
                    if (data.success) {
                        this.userIsManager = data.isManager;
                    } else {
                        this.userIsManager = false;
                    }
                })
                .catch(error => console.error('Error checking if user is manager:', error));
        },
        fetchLoggedInUser() {
            fetch('/auth/logged-in-user')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.loggedInUser = data.user;
                    }
                })
                .catch(error => console.error('Error fetching logged-in user:', error));
        }
    },
    mounted() {
        document.querySelector('.back-button').addEventListener('click', this.goBack);
    }
});
