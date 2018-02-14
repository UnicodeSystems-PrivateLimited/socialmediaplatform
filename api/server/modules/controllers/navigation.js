var ctrl = require('express').Router();
module.exports = ctrl;

ctrl.get('/', function (req, res) {
    var User = require('../models/user');
    User.find({}, function (err, users) {
        if (err) throw err;
        console.log(users);
        res.json(users);
    });
});

ctrl.get('/profile', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var User = require('../models/user');
        User.findById(userId, function (err, user) {
            if (err) throw err;            
            return res.json(user);
        });
    }
    //res.end();
});

ctrl.get('/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        var User = require('../models/user');
        User.findById(req.params.id, function (err, user) {
            if (err) throw err;
            console.log(user);
            return res.json(user);
        });
    }
    //res.end();
});

ctrl.post('/add', function (req, res) {
    var User = require('../models/user');
    var user = new User(req.body);
    user.save(function (err) {
        if (err) throw err;
        res.json(user);
    });
});

ctrl.post('/login', function (req, res, next) {
    var passport = req.app.get('passport');
    if (passport) {
        passport.authenticate('local', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.json({ status: 0, code: 401, msg: "Not authorized" }); }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                return res.json({ status: 1, code: 200, msg: "Successfull!" });
            });
        })(req, res, next);
    } else {
        res.json({ status: 0, code: 401, msg: "Application error!" });
        console.log("Passport not found");
    }
});