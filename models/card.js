var db = require('./db');

exports.add = function(cardIns, callback) {
    db.query('INSERT INTO card SET ?', cardIns, function(err, result) {
        callback(err, result);
    });
};

exports.query = function(cardId, callback) {
    db.query('SELECT * FROM card WHERE `card_id` = ? LIMIT 50', [cardId], function(err, rows, fields) {
        callback(err, rows, fields);
    });
};

exports.delete = function(cardId, callback) {
    db.query('DELETE FROM card WHERE `card_id` = ?', [cardId], function(err, result) {
        callback(err, result);
    });
};