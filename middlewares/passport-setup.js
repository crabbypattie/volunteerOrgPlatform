const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../database');

// List of callback URLs
const callbackURLs = [
    'http://localhost:8081/auth/google/callback',
    'http://localhost:8080/auth/google/callback',
    'http://localhost:3000/auth/google/callback',
    'https://fantastic-disco-pvxr6r759rp366gp.github.dev/auth/google/callback'
];

// Function to select a callback URL based on some condition
function getCallbackURL() {
    if (process.env.NODE_ENV === 'production') {
        return callbackURLs[3];
    } else {
        // Example logic to choose between local URLs
        return callbackURLs.find(url => url.includes('8080')) || callbackURLs[0];
    }
}

const callbackURL = getCallbackURL();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
}, function (accessToken, refreshToken, profile, done) {
    const provider = 'google';
    const providerUserId = profile.id;
    const email = profile.emails[0].value;
    const givenName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const profilePhoto = profile.photos[0].value;
    let username = email.split('@')[0];
    const phoneNumber = profile.phoneNumber || null; // Handle phone number

    console.log('Google profile received:', profile);

    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            return done(err);
        }

        connection.query('SELECT * FROM oauth_users WHERE provider = ? AND provider_user_id = ?', [provider, providerUserId], function (err, results) {
            if (err) {
                console.error('Error querying oauth_users:', err);
                connection.release();
                return done(err);
            }

            if (results.length > 0) {
                // User exists in oauth_users table
                const userId = results[0].user_id;
                console.log('User found in oauth_users:', userId);
                connection.query('SELECT * FROM users WHERE user_id = ?', [userId], function (err, userResults) {
                    connection.release();
                    if (err) {
                        console.error('Error querying users:', err);
                        return done(err);
                    }
                    const user = userResults[0];
                    console.log('User found:', user);
                    done(null, user);
                });
            } else {
                // User does not exist in oauth_users table, check by email
                connection.query('SELECT * FROM users WHERE email = ?', [email], function (err, emailResults) {
                    if (err) {
                        console.error('Error querying users by email:', err);
                        connection.release();
                        return done(err);
                    }

                    if (emailResults.length > 0) {
                        // User exists by email, link OAuth
                        const userId = emailResults[0].user_id;
                        console.log('User found by email:', userId);
                        const insertQuery = 'INSERT INTO oauth_users (user_id, provider, provider_user_id) VALUES (?, ?, ?)';
                        connection.query(insertQuery, [userId, provider, providerUserId], function (err) {
                            connection.release();
                            if (err) {
                                console.error('Error inserting into oauth_users:', err);
                                return done(err);
                            }
                            const user = emailResults[0];
                            console.log('User linked with OAuth:', user);
                            done(null, user);
                        });
                    } else {
                        // Generate unique username if necessary
                        const checkUsernameQuery = 'SELECT * FROM users WHERE username = ?';
                        connection.query(checkUsernameQuery, [username], function (err, usernameResults) {
                            if (err) {
                                console.error('Error checking username:', err);
                                connection.release();
                                return done(err);
                            }

                            if (usernameResults.length > 0) {
                                // Username exists, generate a new one
                                username += Math.floor(Math.random() * 10000).toString();
                            }

                            // New user, insert into users and oauth_users
                            console.log('Creating new user:', givenName, lastName, email, username);
                            const insertUserQuery = 'INSERT INTO users (given_name, last_name, username, phone_number, email, profile_photo) VALUES (?, ?, ?, ?, ?, ?)';
                            connection.query(insertUserQuery, [givenName, lastName, username, phoneNumber, email, profilePhoto], function (err, userInsertResult) {
                                if (err) {
                                    console.error('Error inserting into users:', err);
                                    connection.release();
                                    return done(err);
                                }
                                const userId = userInsertResult.insertId;
                                const insertOAuthQuery = 'INSERT INTO oauth_users (user_id, provider, provider_user_id) VALUES (?, ?, ?)';
                                connection.query(insertOAuthQuery, [userId, provider, providerUserId], function (err) {
                                    connection.release();
                                    if (err) {
                                        console.error('Error inserting into oauth_users:', err);
                                        return done(err);
                                    }
                                    const user = { user_id: userId, given_name: givenName, last_name: lastName, email, username, phone_number: phoneNumber, profile_photo: profilePhoto };
                                    console.log('New user created and linked with OAuth:', user);
                                    done(null, user);
                                });
                            });
                        });
                    }
                });
            }
        });
    });
}));

passport.serializeUser(function (user, done) {
    console.log('Serializing user:', user);
    done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            return done(err);
        }
        connection.query('SELECT * FROM users WHERE user_id = ?', [id], function (err, results) {
            connection.release();
            if (err) {
                console.error('Error querying users in deserializeUser:', err);
                return done(err);
            }
            console.log('Deserializing user:', results[0]);
            done(null, results[0]);
        });
    });
});

module.exports = passport;
