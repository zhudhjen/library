var express = require('express');
var validator = require('validator');
var xssFilters = require('xss-filters');
var user = require('../models/user');
var book = require('../models/book');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var session = req.session;
    if (session.username) {
        res.render('index', { title: 'Express' });
    } else {
        res.redirect('/login');
    }
});

router.get('/login', function(req, res, next) {
    res.send('login');
});

router.post('/login', function(req, res, next) {
    var session = req.session;
    user.manualLogin(req.body.username, req.body.password, function(err, o) {
        if (err) {
            res.json(err);
        } else {
            session.username = req.body.username;
            res.redirect('/');
        }
    });
});

router.all('/logout', function(req, res, next) {
    var session = req.session;
    session.destroy(function(err) {
        if (err) {
            throw err;
        } else {
            res.redirect('/login');
        }
    });
});

router.post('/book', function(req, res, next) {
    var session = req.session;
    if (session.username) {
        book.add({
            book_id: xssFilters.inHTMLData(req.body.id),
            category: xssFilters.inHTMLData(req.body.category),
            title: xssFilters.inHTMLData(req.body.title),
            press: xssFilters.inHTMLData(req.body.press),
            author: xssFilters.inHTMLData(req.body.author),
            year: isNaN(validator.toInt(req.body.year)) ? 0 : validator.toInt(req.body.year),
            price: isNaN(validator.toFloat(req.body.price)) ? 0.00 : validator.toFloat(req.body.price),
            total_quantity: isNaN(validator.toInt(req.body.total)) ? 1 : validator.toInt(req.body.total)
        }, function(err) {
            if (err) {
                throw err;
            } else {
                res.send('success');
            }
        });
    } else {
        res.redirect('/login');
    }    
});

router.get('/book', function(req, res, next) {
    var session = req.session;
    if (session.username) {
        console.log(req.query);
        book.query({
            book_id: xssFilters.inHTMLData(req.query.id || ''),
            category: xssFilters.inHTMLData(req.query.category || ''),
            title: xssFilters.inHTMLData(req.query.title || ''),
            press: xssFilters.inHTMLData(req.query.press || ''),
            author: xssFilters.inHTMLData(req.query.author || ''),
            year: {
                from: validator.toInt(req.query.year_from),
                to : validator.toInt(req.query.year_to)
            },
            price: {
                from: validator.toFloat(req.query.price_from),
                to: validator.toFloat(req.query.price_to)
            }
        }, function(err, rows, fields) {
            if (err) {
                throw err;
            } else {
                res.json(rows);
            }
        });
    } else {
        res.redirect('/login');
    }    
});
module.exports = router;
