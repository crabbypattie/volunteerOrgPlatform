var express = require('express');
var router = express.Router();
var path = require('path');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.username) {
        req.username = req.session.user.username; // Store username in request for easier access
        console.log('Authenticated user:', req.username); // Debugging line
        next();
    } else {
        res.redirect('/auth/sign-in');
    }
}

// Serve the create organization form
router.get('/organization/:username?', isAuthenticated, function(req, res, next) {
    res.sendFile(path.join(__dirname, '../public', 'createOrg.html'));
});

// Hardcoded categories
const categories = [
    { categoryID: 1, categoryName: 'Animal Welfare' },
    { categoryID: 2, categoryName: 'Arts & Culture' },
    { categoryID: 3, categoryName: 'Community Development' },
    { categoryID: 4, categoryName: 'Education' },
    { categoryID: 5, categoryName: 'Environmental' },
    { categoryID: 6, categoryName: 'Healthcare' },
    { categoryID: 7, categoryName: 'Human Rights' },
    { categoryID: 8, categoryName: 'Sports & Recreation' },
    { categoryID: 9, categoryName: 'Technology' }
];

// Fetch organization categories
router.get('/organization-categories', isAuthenticated, function(req, res, next) {
    res.json({ success: true, categories: categories });
});

// Handle form submission
router.post('/organization', isAuthenticated, function(req, res, next) {
    const { 'organization-name': name, 'location-type': locationType, 'organization-email': email, 'organization-category': category, 'organization-description': description } = req.body;
    const username = req.session.user.username;

    req.pool.getConnection(function(err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        connection.beginTransaction(function(err) {
            if (err) {
                connection.release();
                console.error('Transaction start failed:', err);
                res.status(500).json({ success: false, message: 'Transaction start failed' });
                return;
            }

            const orgQuery = `
                INSERT INTO organizations (name, location_type, email, categoryID, description)
                VALUES (?, ?, ?, ?, ?)
            `;
            connection.query(orgQuery, [name, locationType, email, category, description], function(err, results) {
                if (err) {
                    return connection.rollback(function() {
                        connection.release();
                        console.error('Database query failed:', err);
                        res.status(500).json({ success: false, message: 'Database query failed' });
                    });
                }

                const organizationID = results.insertId;

                const userQuery = "SELECT user_id FROM users WHERE username = ?";
                connection.query(userQuery, [username], function(err, results) {
                    if (err) {
                        return connection.rollback(function() {
                            connection.release();
                            console.error('Database query failed:', err);
                            res.status(500).json({ success: false, message: 'Database query failed' });
                        });
                    }

                    if (results.length === 0) {
                        return connection.rollback(function() {
                            connection.release();
                            res.status(404).json({ success: false, message: 'User not found' });
                        });
                    }

                    const userID = results[0].user_id;

                    const managerQuery = `
                        INSERT INTO organization_managers (organizationID, userID)
                        VALUES (?, ?)
                    `;
                    connection.query(managerQuery, [organizationID, userID], function(err, results) {
                        if (err) {
                            return connection.rollback(function() {
                                connection.release();
                                console.error('Database query failed:', err);
                                res.status(500).json({ success: false, message: 'Database query failed' });
                            });
                        }

                        connection.commit(function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    connection.release();
                                    console.error('Transaction commit failed:', err);
                                    res.status(500).json({ success: false, message: 'Transaction commit failed' });
                                });
                            }

                            connection.release();
                            res.json({ success: true, message: 'Organization created successfully' });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
