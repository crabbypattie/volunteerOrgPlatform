require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var findOrgRouter = require('./routes/find');
var createOrgRouter = require('./routes/create');
var accountRouter = require('./routes/account');
var organizationRouter = require('./routes/organization');

var app = express();

// Create a pool of connections to the MySQL server
var dbConnectionPool = mysql.createPool({
    host: '127.0.0.1',
    database: 'Organizations'
});

// Session store
var sessionStore = new MySQLStore({}, dbConnectionPool);

// Session middleware
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: app.get('env') === 'production',
        maxAge: 1000 * 60 * 60 // 60 seconds
    }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to attach the DB connection pool to the request object
app.use(function (req, res, next) {
    req.pool = dbConnectionPool;
    next();
});

// Optional: Middleware to log session info
app.use(function (req, res, next) {
    console.log('Session info:', req.session);
    next();
});

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/find', findOrgRouter);
app.use('/create', createOrgRouter);
app.use('/account', accountRouter);
app.use('/organization', organizationRouter);

module.exports = app;
