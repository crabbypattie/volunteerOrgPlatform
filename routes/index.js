var express = require('express');
var router = express.Router();
var path = require('path');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        req.username = req.session.user.username; // Store the username in the request object
        next();
    } else {
        req.username = 'guest';
        next();
    }
}

/* GET home page. */
router.get('//:username?', isAuthenticated, function(req, res, next) {
    res.render('index', { title: 'Express', username: req.username || null });
});

module.exports = router;