var db = require('./db');
var path = require('path');

exports.load = function(file, callback) {
    db.query('LOAD DATA LOCAL INFILE ? INTO TABLE book CHARACTER SET utf8 FIELDS TERMINATED BY \',\' LINES STARTING BY \'(\' TERMINATED BY \')\\r\\n\'', [file.path], function(err, result) {
        if (err) {
            callback(err);
            console.log(err);
        } else {
            callback(null, result);
        }
    });
};