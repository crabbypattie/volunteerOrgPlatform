const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('database');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, function(accessToken, refreshToken, profile, done) {
    const provider = 'google';
    const providerUserId = profile.id;
    const email = profile.emails[0].value;

    pool.getConnection(function(err, connection) {
        if (err) {
            return done(err);
        }

        connection.query('SELECT * FROM oauth_users WHERE provider = ? AND provider_user_id = ?', [provider, providerUserId], function(err, results) {
            if (err) {
                connection.release();
                return done(err);
            }

            if (results.length > 0) {
                const userId = results[0].user_id;
                connection.query('SELECT * FROM users WHERE user_id = ?', [userId], function(err, userResults) {
                    connection.release();
                    if (err) {
                        return done(err);
                    }
                    const user = userResults[0];
                    done(null, user);
                });
            } else {
                connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, emailResults) {
                    if (err) {
                        connection.release();
                        return done(err);
                    }

                    if (emailResults.length > 0) {
                        const userId = emailResults[0].user_id;
                        const insertQuery = 'INSERT INTO oauth_users (user_id, provider, provider_user_id) VALUES (?, ?, ?)';
                        connection.query(insertQuery, [userId, provider, providerUserId], function(err) {
                            connection.release();
                            if (err) {
                                return done(err);
                            }
                            const user = emailResults[0];
                            done(null, user);
                        });
                    } else {
                        const username = profile.displayName;
                        const insertUserQuery = 'INSERT INTO users (username, email) VALUES (?, ?)';
                        connection.query(insertUserQuery, [username, email], function(err, userInsertResult) {
                            if (err) {
                                connection.release();
                                return done(err);
                            }
                            const userId = userInsertResult.insertId;
                            const insertOAuthQuery = 'INSERT INTO oauth_users (user_id, provider, provider_user_id) VALUES (?, ?, ?)';
                            connection.query(insertOAuthQuery, [userId, provider, providerUserId], function(err) {
                                connection.release();
                                if (err) {
                                    return done(err);
                                }
                                const user = { user_id: userId, username, email };
                                done(null, user);
                            });
                        });
                    }
                });
            }
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.user_id);
});

passport.deserializeUser(function(id, done) {
    pool.getConnection(function(err, connection) {
        if (err) {
            return done(err);
        }
        connection.query('SELECT * FROM users WHERE user_id = ?', [id], function(err, results) {
            connection.release();
            if (err) {
                return done(err);
            }
            done(null, results[0]);
        });
    });
});

module.exports = passport;
