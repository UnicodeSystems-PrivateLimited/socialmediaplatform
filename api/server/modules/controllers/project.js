var ctrl = require('express').Router();
module.exports = ctrl;

ctrl.get('/', function (req, res) {
    var Project = require('../models/project');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Project.find({$and:[{'members.user_id':userId},{'status':1}]}, function (err, projects) {
            if (err) throw err;
            console.log(projects);
            res.json(projects);
        });
    }
});
ctrl.get('/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        var Project = require('../models/project');
        console.log("Session:" + JSON.stringify(req.session));
        Project.findById(req.params.id, function (err, project) {
            if (err) throw err;
            console.log(project);
            return res.json(project);
        });
    }
    //res.end();
});

ctrl.post('/add', function (req, res) {
    var Project = require('../models/project');
    var project = new Project(req.body);
    if (req.session.passport) {
        var userId = req.session.passport.user;
        project.created_by = userId;
        project.save(function (err) {
            if (err) throw err;
            res.json(project);
        });
    }
});
