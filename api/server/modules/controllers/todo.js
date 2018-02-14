var ctrl = require('express').Router();
module.exports = ctrl;

ctrl.get('/', function (req, res) {
    var Todo = require('../models/todo');
    Todo.find({}, null, { sort: { _id: -1 } }, function (err, todos) {
        if (err) throw err;
        console.log(todos);
        res.json(todos);
    });
});

ctrl.get('/pid/:pid', function (req, res) {
    var Todo = require('../models/todo');
    var criteria = {};
    if (req.params.pid && req.params.pid > -1) {
        criteria["project_id"] = req.params.pid;
    }
    Todo.find(criteria, null, { sort: { _id: -1 } }, function (err, todos) {
        if (err) throw err;
        console.log(todos);
        res.json(todos);
    });
});

ctrl.get('/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        var Todo = require('../models/todo');
        console.log("Session:" + JSON.stringify(req.session));
        Todo.findById(req.params.id, function (err, todo) {
            if (err) throw err;
            console.log(todo);
            return res.json(todo);
        });
    }
    //res.end();
});

ctrl.post('/add', function (req, res) {
    var Todo = require('../models/todo');
    console.log("Todo Data:"+JSON.stringify(req.body));
    var todo = new Todo(req.body);
    if (req.session.passport) {
        var userId = req.session.passport.user;
        todo.created_by = userId;
        todo.save(function (err) {
            if (err) throw err;
            return res.json({ status: 1, code: 200, msg: "Todo saved successfully!", data: todo });
        });
    } else {
        return res.json({ status: 0, code: 401, msg: "Authentication required!" });
    }
});