var db = require('./db');

exports.add = function(recordIns, callback) {
    db.query('INSERT INTO record SET ?', recordIns, function(err, result) {
        callback(err, result);
    });
};

exports.query = function(queryIns, callback) {
    var queryParams = [];
    if (queryIns.book_id) {
        queryParams.push('`book_id` = ' + db.escape(queryIns.book_id));
    }
    if (queryIns.card_id) {
        queryParams.push('`card_id` = ' + db.escape(queryIns.card_id));
    }
    db.query('SELECT * FROM record WHERE ' + queryParams.join(' AND ') + ' ORDER BY `return_date` DESC LIMIT 50', function(err, rows, fields) {
        callback(err, rows, fields);
    });
};

exports.delete = function(recordIns, callback) {
    db.query('DELETE FROM record WHERE `card_id` = ? AND `book_id` = ? LIMIT 50', [recordIns.card_id, recordIns.book_id], function(err, rows, fields) {
        callback(err, rows, fields);
    });
};

exports.list = function(cardId, callback) {
    db.query('SELECT * FROM record NATURAL LEFT JOIN book WHERE `card_id` = ? ORDER BY `return_date`', [cardId], function(err, rows, fields) {
        callback(err, rows, fields);
    });
};