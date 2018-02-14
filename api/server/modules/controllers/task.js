var ctrl = require('express').Router();
module.exports = ctrl;

ctrl.get('/', function (req, res) {
    var Task = require('../models/task');
    Task.find({}, function (err, tasks) {
        if (err) throw err;
        console.log(tasks);
        res.json(tasks);
    });
});
ctrl.get('/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        var Task = require('../models/task');
        console.log("Session:" + JSON.stringify(req.session));
        Task.findById(req.params.id, function (err, task) {
            if (err) throw err;
            console.log(task);
            return res.json(task);
        });
    }
    //res.end();
});

ctrl.post('/add', function (req, res) {
    var Task = require('../models/task');
    var task = new Task(req.body);
    if (req.session.passport) {
        var userId = req.session.passport.user;
        task.created_by = userId;
        task.save(function (err) {
            if (err) throw err;
            res.json(task);
        });
    }
});