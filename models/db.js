var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'library',
    password: 'pXTXB4PRwUrsVqfA',
    database: 'library'
});

connection.connect();

module.exports = connection;