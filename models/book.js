var db = require('./db');

exports.add = function(bookIns, callback) {
    db.query('INSERT INTO book SET ?', bookIns, function(err, result) {
        callback(err, result);
    });
};

exports.query = function(queryIns, callback) {
    var queryParams = [];
    if (queryIns.book_id) {
        queryParams.push('`book_id` = ' + db.escape(queryIns.book_id));
    }
    if (queryIns.category) {
        queryParams.push('`category` = ' + db.escape(queryIns.category));
    }
    if (queryIns.title) {
        queryParams.push('`title` = ' + db.escape(queryIns.title));
    }
    if (queryIns.press) {
        queryParams.push('`press` = ' + db.escape(queryIns.press));
    }
    if (queryIns.author) {
        queryParams.push('`author` = ' + db.escape(queryIns.author));
    }
    if (!isNaN(queryIns.year.from)) {
        queryParams.push('`year` >= ' + queryIns.year.from);
    }
    if (!isNaN(queryIns.year.to)) {
        queryParams.push('`year` <= ' + queryIns.year.to);
    }
    if (!isNaN(queryIns.price.from)) {
        queryParams.push('`price` >= ' + queryIns.price.from);
    }
    if (!isNaN(queryIns.price.to)) {
        queryParams.push('`price` <= ' + queryIns.price.to);
    }
    console.log(queryIns);
    console.log(queryParams);
    db.query('SELECT * FROM book' + (queryParams.length ? (' WHERE ' + queryParams.join(' AND ')) : '') + ' LIMIT 50' , function(err, rows, fields) {
        callback(err, rows, fields);
    });
};