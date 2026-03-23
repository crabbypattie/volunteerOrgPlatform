var express = require('express');
var router = express.Router();
var path = require('path');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.username) {
        req.username = req.session.user.username; // Store username in request for easier access
        console.log('Authenticated user:', req.username); // Debugging line
    } else {
        req.username = 'guest'; // Store guest in request for easier access
    }
    next();
}

router.get('/search', isAuthenticated, function (req, res, next) {
    const searchQuery = req.query.q;
    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }
        const query = "SELECT * FROM organizations WHERE name LIKE ?";
        connection.query(query, [`%${searchQuery}%`], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true, organizations: results });
        });
    });
});


// Route to serve the findOrg.html file with optional username parameter
router.get('/browse/:username?', isAuthenticated, function (req, res, next) {
    const username = req.params.username || req.username;
    if (!req.params.username) {
        res.redirect(`/find/browse/${username}`);
    } else {
        res.sendFile(path.join(__dirname, '../public', 'findOrg.html'));
    }
});

// Route to fetch all organization categories
router.get('/categories', isAuthenticated, function (req, res, next) {
    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        const query = "SELECT DISTINCT categoryID, categoryName FROM organization_categories";
        connection.query(query, function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true, categories: results });
        });
    });
});

// Route to fetch organizations by categoryID
router.get('/organizations', isAuthenticated, function (req, res, next) {
    const categoryID = req.query.categoryID; // Get categoryID from query parameter

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        let query = "SELECT organizations.organization_id AS organizationID, organizations.name, organizations.description, organizations.email, organization_categories.categoryName " +
            "FROM organizations " +
            "JOIN organization_categories ON organizations.categoryID = organization_categories.categoryID";
        const queryParams = [];

        if (categoryID) {
            query += " WHERE organizations.categoryID = ?";
            queryParams.push(categoryID);
        }

        connection.query(query, queryParams, function (err, results) {
            connection.release(); // release connection
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true, organizations: results });
        });
    });
});

// GET organization count
router.get('/organization-count', isAuthenticated, function (req, res, next) {
    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        var query = "SELECT COUNT(*) AS count FROM organizations";
        connection.query(query, function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true, count: results[0].count });
        });
    });
});

// API endpoint to get user-specific data
router.get('/api/user/:username', isAuthenticated, function (req, res, next) {
    const username = req.params.username;
    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }
        var query = "SELECT * FROM users WHERE username = ?";
        connection.query(query, [username], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            if (results.length === 0) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            res.json({ success: true, user: results[0] });
        });
    });
});

// Route to fetch organization details
router.get('/details/:organizationID', isAuthenticated, function (req, res, next) {
    const organizationID = req.params.organizationID;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        var query = "SELECT * FROM organizations WHERE organization_id = ?";
        connection.query(query, [organizationID], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            if (results.length === 0) {
                res.status(404).json({ success: false, message: 'Organization not found' });
                return;
            }
            res.json({ success: true, organization: results[0] });
        });
    });
});

// Route to fetch events for an organization
router.get('/events/:organizationID', isAuthenticated, function (req, res, next) {
    const organizationID = req.params.organizationID;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        var query = "SELECT * FROM events WHERE organizationID = ?";
        connection.query(query, [organizationID], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true, events: results });
        });
    });
});

// Route to handle joining an organization
router.post('/join', isAuthenticated, function (req, res, next) {
    if (req.username === 'guest') {
        return res.status(401).json({ success: false, message: 'Please log in to join an organization.' });
    }

    const { organizationID } = req.body;
    const username = req.username;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        var userQuery = "SELECT user_id FROM users WHERE username = ?";
        connection.query(userQuery, [username], function (err, results) {
            if (err) {
                connection.release();
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                connection.release();
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            const user_id = results[0].user_id;

            var checkMembershipQuery = "SELECT * FROM organization_members WHERE organizationID = ? AND userID = ?";
            connection.query(checkMembershipQuery, [organizationID, user_id], function (err, results) {
                if (err) {
                    connection.release();
                    console.error('Database query failed:', err);
                    res.status(500).json({ success: false, message: 'Database query failed' });
                    return;
                }

                if (results.length > 0) {
                    connection.release();
                    res.status(400).json({ success: false, message: 'You have already joined this organization' });
                    return;
                }

                var insertQuery = "INSERT INTO organization_members (organizationID, userID) VALUES (?, ?)";
                connection.query(insertQuery, [organizationID, user_id], function (err, results) {
                    connection.release();
                    if (err) {
                        console.error('Database query failed:', err);
                        res.status(500).json({ success: false, message: 'Database query failed' });
                        return;
                    }
                    res.json({ success: true, message: 'Successfully joined the organization' });
                });
            });
        });
    });
});

// Route to fetch organizations that a user has joined
router.get('/joined-organizations', isAuthenticated, function (req, res, next) {
    const username = req.session.user.username;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        // Query to get the user_id from the username
        var userQuery = "SELECT user_id FROM users WHERE username = ?";
        connection.query(userQuery, [username], function (err, results) {
            if (err) {
                connection.release();
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                connection.release();
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            const user_id = results[0].user_id;
            console.log('User ID:', user_id); // Debugging line

            // Query to get the organizations the user has joined
            var orgQuery = `
                SELECT o.organization_id, o.name, o.description, o.email, oc.categoryName
                FROM organizations o
                JOIN organization_members om ON o.organization_id = om.organizationID
                JOIN organization_categories oc ON o.categoryID = oc.categoryID
                WHERE om.userID = ?`;
            connection.query(orgQuery, [user_id], function (err, results) {
                connection.release();
                if (err) {
                    console.error('Database query failed:', err);
                    res.status(500).json({ success: false, message: 'Database query failed' });
                    return;
                }
                res.json({ success: true, organizations: results });
            });
        });
    });
});



router.post('/rsvp', isAuthenticated, function (req, res, next) {
    const { eventID, permissionResponse } = req.body;
    const username = req.session.user.username;

    console.log('Username:', username); // Debugging line
    console.log('Event ID:', eventID); // Debugging line

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        // Query to get the user_id from the username
        var userQuery = "SELECT user_id FROM users WHERE username = ?";
        connection.query(userQuery, [username], function (err, results) {
            if (err) {
                connection.release();
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                connection.release();
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            const user_id = results[0].user_id;
            console.log('User ID:', user_id); // Debugging line

            // Check if the user has already RSVPed to the event
            var checkRSVPQuery = "SELECT * FROM RSVP WHERE eventID = ? AND userID = ?";
            connection.query(checkRSVPQuery, [eventID, user_id], function (err, results) {
                if (err) {
                    connection.release();
                    console.error('Database query failed:', err);
                    res.status(500).json({ success: false, message: 'Database query failed' });
                    return;
                }

                if (results.length > 0) {
                    connection.release();
                    res.status(400).json({ success: false, message: 'You have already RSVPed to this event' });
                    return;
                }

                // Insert into RSVP table
                var insertRSVPQuery = "INSERT INTO RSVP (eventID, userID, permission_response) VALUES (?, ?, ?)";
                connection.query(insertRSVPQuery, [eventID, user_id, permissionResponse], function (err, results) {
                    connection.release();
                    if (err) {
                        console.error('Database query failed:', err);
                        res.status(500).json({ success: false, message: 'Database query failed' });
                        return;
                    }
                    res.json({ success: true, message: 'Successfully RSVPed to the event' });
                });
            });
        });
    });
});


// Route to fetch organizations that a user manages
router.get('/managed-organizations', isAuthenticated, function (req, res, next) {
    const username = req.session.user.username;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        // Query to get the user_id from the username
        var userQuery = "SELECT user_id FROM users WHERE username = ?";
        connection.query(userQuery, [username], function (err, results) {
            if (err) {
                connection.release();
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                connection.release();
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            const user_id = results[0].user_id;
            console.log('User ID:', user_id); // Debugging line

            // Query to get the organizations the user manages
            var orgQuery = `
                SELECT o.organization_id, o.name, o.description, o.email, oc.categoryName
                FROM organizations o
                JOIN organization_managers om ON o.organization_id = om.organizationID
                JOIN organization_categories oc ON o.categoryID = oc.categoryID
                WHERE om.userID = ?`;
            connection.query(orgQuery, [user_id], function (err, results) {
                connection.release();
                if (err) {
                    console.error('Database query failed:', err);
                    res.status(500).json({ success: false, message: 'Database query failed' });
                    return;
                }
                res.json({ success: true, organizations: results });
            });
        });
    });
});



module.exports = router;
