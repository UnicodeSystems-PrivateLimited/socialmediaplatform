var ctrl = require('express').Router();
//var busboy = require('connect-busboy'); //middleware for form/file upload
// var formidable = require('formidable');
var path = require('path');
// var fs = require('fs-extra');       //File System - for file manipulation

module.exports = ctrl;

ctrl.get('/', function (req, res) {
    var File = require('../models/file');
    File.find({}, function (err, files) {
        if (err)
            throw err;
        console.log(files);
        res.json(files);
    });
});
ctrl.get('/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        var File = require('../models/file');
        console.log("Session:" + JSON.stringify(req.session));
        File.findById(req.params.id, function (err, file) {
            if (err)
                throw err;
            console.log(file);
            return res.json(file);
        });
    }
    //res.end();
});

ctrl.post('/upload', function (req, res) {
//     var File = require('../models/file');
//     var form = new formidable.IncomingForm();
//     //Formidable uploads to operating systems tmp dir by default
//     form.uploadDir = path.resolve(__dirname, "../../../public/files");       //set upload directory
//     form.keepExtensions = true;     //keep file extension

    form.parse(req, function (err, fields, files) {
//        res.writeHead(200, {'content-type': 'text/plain'});
//        res.write('received upload:\n\n');
        console.log("file: " + JSON.stringify(files));
 
        var file = new File();
        if (req.session.passport) {
            var userId = req.session.passport.user;
            file.created_by = userId;
            file.file_name = files.file.name;
            file.title = fields.title;
            file.description = fields.description;
            file.save(function (err) {
                if (err)
                    throw err;
                return res.json(fields);
            });
        } else {
            return res.end();
        }
    });
});
