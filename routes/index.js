var express = require('express');
var validator = require('validator');
var xssFilters = require('xss-filters');
var moment = require('moment');

var user = require('../models/user');
var book = require('../models/book');
var card = require('../models/card');
var record = require('../models/record');

var router = express.Router();

router.get('/login', function(req, res, next) {
    var session = req.session;
    if (session.username) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

router.post('/login', function(req, res, next) {
    var session = req.session;
    user.manualLogin(req.body.username, req.body.password, function(err, user) {
        if (err) {
            res.json({
                err: true,
                msg: 'Error ' + err.errno + ': ' + err.code
            });
        } else {
            session.username = user.username;
            session.name = user.name;
            res.json({
                err: false,
                url: '/'
            });
        }
    });
});

router.all('*', function(req, res, next) {
    var session = req.session;
    if (session.username) {
        next();
    } else {
        res.redirect('/login');
    }
});

router.get('/', function(req, res, next) {
    res.render('home', {
        nav: 'home',
        name: req.session.name
    });
});

router.all('/logout', function(req, res, next) {
    var session = req.session;
    session.destroy(function(err) {
        if (err) {
            res.json(err);
        } else {
            res.redirect('/login');
        }
    });
});

router.get('/book/add', function(req, res, next) {
    res.render('bookadd', {
        nav: 'book-add',
        name: req.session.name
    });
});

router.get('/book/query', function(req, res, next) {
    res.render('bookquery', {
        nav: 'book-query',
        name: req.session.name
    });
});

router.get('/book', function(req, res, next) {
    book.query({
        book_id: xssFilters.inHTMLData(req.query.id || ''),
        category: xssFilters.inHTMLData(req.query.category || ''),
        title: xssFilters.inHTMLData(req.query.title || ''),
        press: xssFilters.inHTMLData(req.query.press || ''),
        author: xssFilters.inHTMLData(req.query.author || ''),
        year: {
            from: validator.toInt(req.query.from_year),
            to : validator.toInt(req.query.to_year)
        },
        price: {
            from: validator.toFloat(req.query.from_price),
            to: validator.toFloat(req.query.to_price)
        },
        sort_by: xssFilters.inHTMLData(req.query.sort_by || ''),
        sort_order: validator.toInt(req.query.sort_order)
    }, function(err, rows, fields) {
        if (err) {
            res.json({
                err: true,
                msg: 'Error ' + err.errno + ': ' + err.code
            });
        } else {
            res.json({
                err: false,
                result: rows
            });
        }
    });
});

router.post('/book', function(req, res, next) {
    var bookIns = {
        book_id: xssFilters.inHTMLData(req.body.id),
        category: xssFilters.inHTMLData(req.body.category),
        title: xssFilters.inHTMLData(req.body.title),
        press: xssFilters.inHTMLData(req.body.press),
        year: isNaN(validator.toInt(req.body.year)) ? 0 : validator.toInt(req.body.year),
        author: xssFilters.inHTMLData(req.body.author),
        price: isNaN(validator.toFloat(req.body.price)) ? 0.00 : validator.toFloat(req.body.price),
        total_quantity: isNaN(validator.toInt(req.body.total)) ? 1 : validator.toInt(req.body.total)
    };
    book.query({book_id: bookIns.book_id}, function(err, rows, field) {
        if (err) {
            res.json({
                err: true,
                msg: 'Error ' + err.errno + ': ' + err.code
            });
            return;
        } 
        if (rows.length) {
            res.json({
                err: true,
                msg: 'Book ID Conflict'
            });
            return;
        }
        book.add(bookIns, function(err, result) {
            if (err) {
                res.json({
                    err: true,
                    msg: 'Error ' + err.errno + ': ' + err.code
                });
            } else {
                res.json({
                    err: false,
                    msg: result
                });
            }
        });
    });
});

router.get('/borrow', function(req, res, next) {
    res.render('borrow', {
        nav: 'borrow',
        name: req.session.name
    });
});

router.post('/borrow', function(req, res, next) {
    var returnDate = moment(req.body.return_date);
    if (!returnDate.isValid()) {
        res.json({
            err: true,
            msg: 'Date Invalid'
        });
        return;
    }
    var recordIns = {
        book_id: xssFilters.inHTMLData(req.body.book_id),
        card_id: xssFilters.inHTMLData(req.body.card_id),
        borrow_date: moment().format('YYYY-MM-DD hh:mm:ss'),
        return_date: returnDate.format('YYYY-MM-DD hh:mm:ss'),
        operator: req.session.username
    };
    record.query(recordIns, function(err, rows, fields) {
        if (err) {
            res.json({
                err: true,
                msg: 'Error ' + err.errno + ': ' + err.code
            });
        }
        if (rows.length) {
            res.json({
                err: true,
                msg: 'Already borrowed this book'
            });
            return;
        }
        console.log('haven\'t borrowed');
        book.query({book_id: recordIns.book_id}, function(err, rows, fields) {
            if (err) {
                res.json({
                    err: true,
                    msg: 'Error ' + err.errno + ': ' + err.code
                });
            } 
            if (rows.length === 0) {
                res.json({
                    err: true,
                    msg: 'No such books'
                });
                return;
            }
            if (rows[0].remain_quantity <= 0) {
                console.log('no book left');
                record.query({book_id: recordIns.book_id}, function(err, rows, fields) {
                    if (err) {
                        res.json({
                            err: true,
                            msg: 'Error ' + err.errno + ': ' + err.code
                        });
                    } else {
                        res.json({
                            err: true,
                            msg: 'No remaining books, will be available ' + 
                                moment(rows[0].return_date).fromNow()
                        });
                    }
                });
                return;
            }
            console.log('book found');
            card.query(recordIns.card_id, function(err, rows, fields) {
                if (err) {
                    res.json({
                        err: true,
                        msg: 'Error ' + err.errno + ': ' + err.code
                    });
                }
                if (rows.length === 0) {
                    res.json({
                        err: true,
                        msg: 'No such card'
                    });
                    return;
                }
                console.log('user found');
                record.add(recordIns, function(err, result) {
                    if (err) {
                        res.json({
                            err: true,
                            msg: 'Error ' + err.errno + ': ' + err.code
                        });
                    } else {
                        res.json({
                            err: false,
                            result: result
                        });
                    }
                });
            });
        });
    });
});

router.get('/return', function(req, res, next) {
    res.render('return', {
        nav: 'return',
        name: req.session.name
    });
});

router.post('/return', function(req, res, next) {
    var recordIns = {
        book_id: xssFilters.inHTMLData(req.body.book_id),
        card_id: xssFilters.inHTMLData(req.body.card_id)
    };
    book.query({book_id: recordIns.book_id}, function(err, rows, fields) {
        if (err) {
            res.json(err);
        } 
        if (rows.length === 0) {
            res.json({
                err: true,
                msg: 'No such books'
            });
            return;
        }
        card.query(recordIns.card_id, function(err, rows, fields) {
            if (err) {
                res.json(err);
            }
            if (rows.length === 0) {
                res.json({
                    err: true,
                    msg: 'No such card'
                });
                return;
            }
            record.query(recordIns, function(err, rows, fields) {
                if (err) {
                    res.json({
                        err: true,
                        msg: 'Error ' + err.errno + ': ' + err.code
                    });
                }
                if (rows.length === 0) {
                    res.json({
                        err: true,
                        msg: 'Haven\'t borrowed this book'
                    });
                    return;
                }
                record.delete(recordIns, function(err, result) {
                    if (err) {
                        res.json({
                            err: true,
                            msg: 'Error ' + err.errno + ': ' + err.code
                        });
                    } else {
                        res.json({
                            err: false,
                            result: result
                        });
                    }
                });
            });
        });
    });
});

router.get('/card/add', function(req, res, next) {
    res.render('cardadd', {
        nav: 'card-add',
        name: req.session.name
    });
});

router.get('/card/delete', function(req, res, next) {
    res.render('carddelete', {
        nav: 'card-delete',
        name: req.session.name
    });
});

router.post('/card', function(req, res, next) {
    var cardIns = {
        card_id: xssFilters.inHTMLData(req.body.id),
        name: xssFilters.inHTMLData(req.body.name),
        department: xssFilters.inHTMLData(req.body.department),
        category: xssFilters.inHTMLData(req.body.category)
    };
    card.query(cardIns.card_id, function(err, rows, fields) {
        if (err) {
            res.json({
                err: true,
                msg: 'Error ' + err.errno + ': ' + err.code
            });
            return;
        } 
        if (rows.length) {
            res.json({
                err: true,
                msg: 'Card ID Conflict'
            });
        }
        card.add(cardIns, function(err, result) {
            if (err) {
                res.json({
                    err: true,
                    msg: 'Error ' + err.errno + ': ' + err.code
                });
            } else {
                res.json({
                    err: false,
                    msg: result
                });
            }
        });
    });  
});

router.get('/card', function(req, res, next) {
    var validatedId = xssFilters.inHTMLData(req.query.id);
    if (validatedId) {
        res.json({
            err: true,
            msg: 'Invalid Card ID'
        });
    }
    card.query(validatedId, function(err, rows, fields) {
        if (err) {
            res.json({
                err: true,
                msg: 'Error ' + err.errno + ': ' + err.code
            });
        } else {
            res.json({
                err: false,
                result: rows
            });
        }
    });
});

router.delete('/card', function(req, res, next) {
    var validatedId = xssFilters.inHTMLData(req.body.id);
    if (!validatedId) {
        res.json({
            err: true,
            msg: 'Invalid Card ID'
        });
        return;
    }
    card.query(validatedId, function(err, rows, fields) {
        if (err) {
            res.json({
                err: true,
                msg: 'Error ' + err.errno + ': ' + err.code
            });
            return;
        } 
        if (!rows.length) {
            res.json({
                err: true,
                msg: 'No such card'
            });
        }
        record.query({card_id: validatedId}, function(err, rows, fields) {
            if (err) {
                res.json({
                    err: true,
                    msg: 'Error ' + err.errno + ': ' + err.code
                });
                return;
            } 
            if (rows.length) {
                res.json({
                    err: true,
                    msg: 'Please return all books first'
                });
                return;
            }
            card.delete(validatedId, function(err, result) {
                if (err) {
                    res.json({
                        err: true,
                        msg: 'Error ' + err.errno + ': ' + err.code
                    });
                } else {
                    res.json({
                        err: false,
                        msg: result
                    });
                }
            }); 
        })
    });
});

router.get('/record', function(req, res, next) {
    res.render('record', {
        nav: 'record',
        name: req.session.name
    });
});

router.get('/record/list', function(req, res, next) {
    var validatedId = xssFilters.inHTMLData(req.query.id);
    if (!validatedId) {
        res.json({
            err: true,
            msg: 'Invalid Card ID'
        });
    }
    card.query(validatedId, function(err, rows, fields) {
        if (err) {
            res.json({
                err: true,
                msg: 'Error ' + err.errno + ': ' + err.code
            });
            return;
        } 
        if (!rows.length) {
            res.json({
                err: true,
                msg: 'No such card'
            });
            return;
        }
        record.list(validatedId, function(err, rows, fields) { 
            if (err) {
                res.json({
                    err: true,
                    msg: 'Error ' + err.errno + ': ' + err.code
                });
            } else {
                for (var i = rows.length - 1; i >= 0; i -= 1) {
                    rows[i].remain_time = moment(rows[i].return_date).fromNow();
                }
                res.json({
                    err: false,
                    result: rows
                });
            }
        });
    });
});

router.post('/upload', function(req, res, next) {
    res.redirect('/book/add');
});

module.exports = router;
