var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcrypt');
var fs = require('fs');

// Configure multer for file upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile_pictures');
    },
    filename: function (req, file, cb) {
        cb(null, req.username + path.extname(file.originalname)); // Save the file with the username
    }
});

var upload = multer({ storage: storage });

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        req.username = req.session.user.username;
        next();
    } else {
        res.redirect('/auth/sign-in');
    }
}

// Serve the account overview page with optional username parameter
router.get('/:username?', isAuthenticated, function (req, res, next) {
    const username = req.params.username || req.username;
    if (!req.params.username) {
        res.redirect(`/account/${username}`);
    } else {
        res.sendFile(path.join(__dirname, '../public', 'accountOverview.html'));
    }
});

// Fetch user data
router.get('/:username/data', isAuthenticated, function (req, res, next) {
    const username = req.params.username;
    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).json({ success: false, message: 'Database connection failed' });
        }
        var query = "SELECT * FROM users WHERE username = ?";
        connection.query(query, [username], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ success: false, message: 'Database query failed' });
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.json({ success: true, user: results[0] });
        });
    });
});

// Update user data
router.post('/:username', isAuthenticated, function (req, res, next) {
    const username = req.params.username;
    const { given_name, last_name, phone_number, email, interests, profile_photo } = req.body;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).json({ success: false, message: 'Database connection failed' });
        }

        var query = "UPDATE users SET given_name = ?, last_name = ?, phone_number = ?, email = ?, interests = ?, profile_photo = ? WHERE username = ?";
        connection.query(query, [given_name, last_name, phone_number, email, interests, profile_photo, username], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ success: false, message: 'Database query failed' });
            }
            res.json({ success: true, message: 'Account updated successfully' });
        });
    });
});

// Handle profile picture upload
router.post('/:username/upload', isAuthenticated, upload.single('profile_picture'), function (req, res, next) {
    const username = req.params.username;
    const profilePhotoPath = `/uploads/profile_pictures/${req.file.filename}`;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).json({ success: false, message: 'Database connection failed' });
        }

        var query = "UPDATE users SET profile_photo = ? WHERE username = ?";
        connection.query(query, [profilePhotoPath, username], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ success: false, message: 'Database query failed' });
            }
            res.json({ success: true, profile_photo: profilePhotoPath });
        });
    });
});

router.post('/validate-password', isAuthenticated, function (req, res) {
    const { username, currentPassword } = req.body;
    console.log(`Validating password for user: ${username}`);

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).json({ success: false, message: 'Database connection failed' });
        }

        const query = "SELECT password FROM users WHERE username = ?";
        connection.query(query, [username], function (err, results) {
            connection.release();

            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ success: false, message: 'Database query failed' });
            }

            if (results.length === 0) {
                console.log('User not found');
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const hashedPassword = results[0].password;
            console.log(`Hashed password from DB: ${hashedPassword}`);

            bcrypt.compare(currentPassword, hashedPassword, function (err, result) {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ success: false, message: 'Error comparing passwords' });
                }

                if (result) {
                    console.log('Current password validated successfully');
                    return res.json({ success: true, message: 'Password validation successful' });
                } else {
                    console.log('Current password is incorrect');
                    return res.json({ success: false, message: 'Current password is incorrect' });
                }
            });
        });
    });
});


router.post('/reset-password', isAuthenticated, function (req, res) {
    const { username, newPassword } = req.body;
    console.log(`Resetting password for user: ${username}`);

    bcrypt.hash(newPassword, 10, function (err, hashedPassword) {
        if (err) {
            console.error('Password hashing failed:', err);
            return res.status(500).json({ success: false, message: 'Password hashing failed' });
        }

        req.pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Database connection failed:', err);
                return res.status(500).json({ success: false, message: 'Database connection failed' });
            }

            const query = "UPDATE users SET password = ? WHERE username = ?";
            connection.query(query, [hashedPassword, username], function (err, results) {
                connection.release();

                if (err) {
                    console.error('Database query failed:', err);
                    return res.status(500).json({ success: false, message: 'Database query failed' });
                }

                console.log('Password reset successfully');
                return res.json({ success: true, message: 'Password changed successfully' });
            });
        });
    });
});



module.exports = router;