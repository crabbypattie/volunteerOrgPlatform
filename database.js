// database.js
const mysql = require('mysql');

const pool = mysql.createPool({
    host: '127.0.0.1',
    database: 'Organizations'
});

module.exports = pool;
