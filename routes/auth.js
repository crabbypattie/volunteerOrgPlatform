// routes/auth.js
var express = require('express');
var router = express.Router();
var path = require('path');
var bcrypt = require('bcrypt');
const saltRounds = 10;
const passport = require('../middlewares/passport-setup'); // Corrected import path

// Initialize Passport
router.use(passport.initialize());
router.use(passport.session());

// Google OAuth Routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/sign-in' }), function(req, res) {
    res.redirect(`/find/browse/${req.user.username}`);
});


// Serve the signup page
router.get('/sign-up/', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

// Serve the login page
router.get('/sign-in/', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Handle user signup
router.post('/signup', function (req, res) {
    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }
        const { given_name, last_name, username, phone_number, email, password, interests, profile_photo } = req.body;

        if (!given_name || !last_name || !username || !phone_number || !email || !password) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }

        var checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
        connection.query(checkQuery, [username, email], function (err, results) {
            if (err) {
                connection.release();
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            if (results.length > 0) {
                connection.release();
                res.status(409).json({ success: false, message: 'Username or email already exists' });
                return;
            }

            bcrypt.hash(password, saltRounds, function (err, hash) {
                if (err) {
                    console.error('Password encryption failed:', err);
                    res.status(500).json({ success: false, message: 'Password encryption failed' });
                    return;
                }
                var query = "INSERT INTO users (given_name, last_name, username, phone_number, email, password, interests, profile_photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                connection.query(query, [given_name, last_name, username, phone_number, email, hash, interests, profile_photo], function (err, result) {
                    connection.release();
                    if (err) {
                        console.error('Database query failed:', err);
                        res.status(500).json({ success: false, message: 'Database query failed' });
                        return;
                    }
                    res.json({ success: true, message: 'Signup successful' });
                });
            });
        });
    });
});

router.post('/signin', function (req, res) {
    const { email, password } = req.body;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        var query = "SELECT * FROM users WHERE email = ?";
        connection.query(query, [email], function (err, results) {
            connection.release();

            if (err) {
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                res.status(401).json({ success: false, message: 'User not found' });
                return;
            }

            var user = results[0];
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err || !isMatch) {
                    res.status(401).json({ success: false, message: 'Invalid credentials' });
                    return;
                }

                // Store userID and username in session
                req.session.user = { userID: user.userID, username: user.username };
                res.json({ success: true, user: { username: user.username } });
            });
        });
    });
});

// Add this route to check if the user is logged in
router.get('/logged-in-user', function (req, res) {
    if (req.session.user) {
        res.json({ success: true, user: req.session.user });
    } else {
        res.status(404).json({ success: false, message: 'User not logged in' });
    }
});

router.post('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            res.status(500).json({ success: false, message: 'Failed to log out' });
            return;
        }
        res.json({ success: true });
    });
});


module.exports = router;
