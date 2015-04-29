var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'library',
    password: 'UbxfUw2QQzqcHYhL',
    database: 'library'
});

connection.connect(function(err) {
    console.log(err);
});

module.exports = connection;