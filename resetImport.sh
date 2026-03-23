#!/bin/bash

# Variables for database setup
DB_NAME="Organizations"
DB_USER="root"
DUMP_FILE="database.sql"

# Drop, create, and use the database, then import the dump file
mysql -u $DB_USER -p -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;" && mysql -u $DB_USER -p $DB_NAME < $DUMP_FILE

# Install npm dependencies
echo "Installing npm dependencies..."
npm install express passport passport-google-oauth20 dotenv express-session mysql2

echo "Setup complete. You can now run the application using 'npm start'."
