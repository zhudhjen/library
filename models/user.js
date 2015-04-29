var crypto = require('crypto');
var db = require('./db');

exports.manualLogin = function(username, password, callback) {
    db.query('SELECT * FROM user WHERE username = ?', [username], function(err, rows, fields) {
        if (err) {
            console.log(err);
            callback('Error ' + err.errno + ': ' + err.code);
            return;
        }
        if (!rows.length) {
            callback('User not found');
        } else {
            validatePassword(password, rows[0].password, function(err, success) {
                if (success) {
                    callback(null, rows[0]);
                } else {
                    callback('Password not correct');
                }
            });
        }
    });
};

var generateSalt = function()
{
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; ++i) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
};

var md5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
};

var saltAndHash = function(pass, callback)
{
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
};

var validatePassword = function(plainPass, hashedPass, callback)
{
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    callback(null, hashedPass === validHash);
};