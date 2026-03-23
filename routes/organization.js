var express = require('express');
var router = express.Router();
var path = require('path');

function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.username) {
        req.username = req.session.user.username;
        next();
    } else {
        req.username = 'guest';
        next();
    }
}

router.get('/:username?', isAuthenticated, function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public', 'organization.html'));
});

// Route to handle RSVPs
router.post('/rsvp', isAuthenticated, function (req, res, next) {
    const eventID = req.body.eventID;
    const username = req.username;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        // Check if the event is public if the user is a guest
        const query = username === 'guest' ?
            "SELECT * FROM events WHERE eventID = ? AND eventPrivacy = 'public'" :
            "SELECT * FROM events WHERE eventID = ?";

        connection.query(query, [eventID], function (err, results) {
            if (err) {
                connection.release();
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                connection.release();
                res.status(404).json({ success: false, message: 'Event not found or not public' });
                return;
            }

            const event = results[0];

            // If the user is a guest, create a temporary RSVP record
            if (username === 'guest') {
                const guestRSVPQuery = "INSERT INTO guest_rsvps (eventID, guestID) VALUES (?, ?)";
                connection.query(guestRSVPQuery, [eventID, req.sessionID], function (err, results) {
                    connection.release();
                    if (err) {
                        console.error('Database query failed:', err);
                        res.status(500).json({ success: false, message: 'Database query failed' });
                        return;
                    }
                    res.json({ success: true, message: 'RSVP successful for guest' });
                });
            } else {
                // If the user is logged in, create a normal RSVP record
                const userQuery = "SELECT user_id FROM users WHERE username = ?";
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

                    const rsvpQuery = "INSERT INTO rsvps (eventID, userID) VALUES (?, ?)";
                    connection.query(rsvpQuery, [eventID, user_id], function (err, results) {
                        connection.release();
                        if (err) {
                            console.error('Database query failed:', err);
                            res.status(500).json({ success: false, message: 'Database query failed' });
                            return;
                        }
                        res.json({ success: true, message: 'RSVP successful' });
                    });
                });
            }
        });
    });
});


// Fetch organization details
router.get('/details/:organizationID', isAuthenticated, function (req, res, next) {
    const organizationID = req.params.organizationID;
    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }
        const query = "SELECT * FROM organizations WHERE organization_id = ?";
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

// Fetch organization events
router.get('/events/:organizationID', isAuthenticated, function (req, res, next) {
    const organizationID = req.params.organizationID;
    const isGuest = req.username === 'guest';
    const query = isGuest ?
        "SELECT * FROM events WHERE organizationID = ? AND eventPrivacy = 'public'" :
        "SELECT * FROM events WHERE organizationID = ?";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }
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


// Fetch organization updates
router.get('/updates/:organizationID', isAuthenticated, function (req, res, next) {
    const organizationID = req.params.organizationID;
    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }
        var query = "SELECT * FROM updates WHERE organizationID = ?";
        connection.query(query, [organizationID], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true, updates: results });
        });
    });
});

router.post('/add-event/:organizationID', isAuthenticated, function (req, res, next) {
    const { eventName, eventDescription, eventDate, eventLocation } = req.body;
    const organizationID = req.params.organizationID;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        const query = "INSERT INTO events (organizationID, eventName, eventDescription, eventDate, eventLocation) VALUES (?, ?, ?, ?, ?)";
        connection.query(query, [organizationID, eventName, eventDescription, eventDate, eventLocation], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true, event: { eventID: results.insertId, organizationID, eventName, eventDescription, eventDate, eventLocation } });
        });
    });
});

router.put('/update-event/:eventID', isAuthenticated, function (req, res, next) {
    const { eventID } = req.params;
    const { eventName, eventDescription, eventDate, eventLocation } = req.body;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        const query = "UPDATE events SET eventName = ?, eventDescription = ?, eventDate = ?, eventLocation = ? WHERE eventID = ?";
        connection.query(query, [eventName, eventDescription, eventDate, eventLocation, eventID], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true });
        });
    });
});

router.delete('/delete-event/:eventID', isAuthenticated, function (req, res, next) {
    const { eventID } = req.params;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        const query = "DELETE FROM events WHERE eventID = ?";
        connection.query(query, [eventID], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }
            res.json({ success: true });
        });
    });
});

// Check if user is manager
router.get('/check-manager/:organizationID', isAuthenticated, function (req, res, next) {
    const organizationID = req.params.organizationID;
    const username = req.username;

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection failed:', err);
            res.status(500).json({ success: false, message: 'Database connection failed' });
            return;
        }

        const query = `
            SELECT * FROM organization_managers
            WHERE organizationID = ? AND userID = (
                SELECT user_id FROM users WHERE username = ?
            )
        `;

        connection.query(query, [organizationID, username], function (err, results) {
            connection.release();
            if (err) {
                console.error('Database query failed:', err);
                res.status(500).json({ success: false, message: 'Database query failed' });
                return;
            }

            if (results.length > 0) {
                res.json({ success: true, isManager: true });
            } else {
                res.json({ success: true, isManager: false });
            }
        });
    });
});

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

module.exports = router;
