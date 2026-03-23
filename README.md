# Volunteer Organization Management Platform

A full-stack web application designed to help volunteer organizations manage members, events, and participation within a centralized system.

This project was developed as part of a university coursework project, focusing on building a functional multi-entity system with real user flows and relational data management.

---

## Overview

Volunteer organizations often rely on fragmented tools such as spreadsheets, emails, and social media to coordinate activities. This platform was built to streamline:

* Organization discovery
* Event management
* Volunteer participation (RSVP)
* User account management

The system brings these workflows into a single web application to improve coordination and usability.

---

## Features

* User authentication (sign up / login)
* Google OAuth integration
* Profile management (update details, profile image)
* Organization creation and browsing
* Category-based organization filtering
* Event creation, editing, and deletion
* RSVP and participation tracking
* Role-based relationships (organization managers & members)

---

## Tech Stack

**Backend**

* Node.js
* Express.js

**Database**

* MySQL (relational schema)

**Frontend**

* HTML, CSS, JavaScript (server-rendered)

**Other**

* Passport.js (authentication)
* Google OAuth 2.0
* Express-session

---

## Database Structure

The application is built on a relational database model, including:

* Users
* Organizations
* Organization Managers
* Organization Members
* Events
* RSVPs
* Updates

This structure allows proper handling of relationships between users, organizations, and participation.

---

## Setup Instructions

### 1. Clone the repository

git clone <your-repo-link>
cd <repo-folder>

### 2. Install dependencies

npm install

### 3. Configure environment variables

Create a `.env` file in the root directory:

PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=Organizations
SESSION_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

### 4. Setup database

Make sure MySQL is running locally, then import the schema:

mysql -u root -p Organizations < database.sql

Or use the provided script:

sh resetImport.sh

### 5. Run the application

npm start

Open: http://localhost:3000

---

## Notes

* Google OAuth requires valid credentials from Google Cloud Console.
* Some features depend on local database configuration.
* This project is designed for development/demo purposes and not production deployment.

---

## Limitations

* Not deployment-ready (requires local MySQL setup)
* Session handling can be further optimized
* UI is functional but not built with modern frontend frameworks
* Limited validation and error handling in some flows

---

## What I Learned

* Designing relational database schemas for real user systems
* Building full-stack CRUD flows across multiple entities
* Implementing authentication including OAuth
* Structuring backend logic and routes in Express
* Managing real-world system complexity beyond simple applications

---

## Future Improvements

* Refactor configuration to be fully environment-based
* Improve session handling and security practices
* Migrate frontend to React for better scalability
* Deploy using cloud platforms such as Render or Railway
* Improve role-based access control and validation

---

## Author

Developed as part of a university project.
