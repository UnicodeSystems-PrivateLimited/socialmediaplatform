var ctrl = require('express').Router();
module.exports = ctrl;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: '/tmp',
});
var Q = require('q');
var Converter = require("csvtojson").Converter;
var converter = new Converter({ constructResult: false });
var csv = require('fast-csv');

var upload = multer().single('avatar');
var locals;
var mailer = require('../../mailer/models');
var Degree = require('../models/degree');
var User = require('../models/user');


ctrl.get('/', function (req, res) {
    var memIds;
    if (req.query.memIds) {
        memIds = JSON.parse(req.query.memIds);
        Degree.find({ _id: { $in: memIds } }, function (err, degree) {
            if (err)
                throw err;
            res.json(degree);
        });
    } else {
        Degree.find({}, function (err, degree) {
            if (err)
                throw err;
            res.json(degree);
        });
    }
});

ctrl.get('/delete', function (req, res) {
    Degree.remove(function (err, post) {
        if (err)
            throw err;
        data = { message: 'All degree deleted' };
        res.json(data);
    });
});

ctrl.post('/addBulkDegree', function (req, res) {
    var Degree = require('../models/degree');
    var degree = [];
    var promiseArr = [];
    if (req.session.passport && req.session.passport.type == 2) {
        var userId = req.session.passport.user;
        upload(req, res, function (err) {
            if (err) {
                return
            }
            var ext = req.file.originalname.split('.').pop();
            filename = userId + '.' + ext;
            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/CSVfiles/");
            var CSVpath = uploadpath + '/' + filename;
            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                if (err) {
                    return console.log(err);
                }
                fs.createReadStream(CSVpath)
                    .pipe(csv())
                    .on('data', function (data) {
                        var newdata = data.toString();
                        var degDefer = Q.defer();
                        if (newdata) {
                            newdata = newdata.trim();
                        }
                        Degree.findOne({ name: newdata }, function (err, finDegree) {
                            if (err)
                                degDefer.reject(err);
                            if (!finDegree) {
                                Degree.create({ "name": newdata }, function (err, insertData) {
                                    if (err)
                                        degDefer.reject(err);
                                    degDefer.resolve();
                                });
                            } else {
                                degDefer.resolve();
                            }
                        });
                        promiseArr.push(degDefer);
                    })
                    .on('end', function (data) {
                        Q.all(promiseArr).then(function () {
                            res.json({ 'data': null, 'msg': 'Bulk Upload Successful' });
                        })
                    })
            });
        });
    } else {
        res.json({ msg: 'User Not Found' });
    }
});

ctrl.post('/degreeSearch', function (req, res) {
    if (req.body.name) {
        var idToFilter = []
        if (req.body.ids) {
            idToFilter = req.body.ids.split(',');
            for (var i = 0; i < idToFilter.length; i++) {
                if (idToFilter[i])
                    idToFilter[i] = parseInt(idToFilter[i]);
            }
        } else
            idToFilter[0] = -1;

        getDegreeSearchlist(req.body.name, idToFilter, function (data) {
            res.json({ status: 2, msg: "Search complete!", data: data });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});
ctrl.post('/degreeSearchByUser', function (req, res) {
    if (req.body.name) {
        var idToFilter = []
        if (req.body.ids) {
            idToFilter = req.body.ids.split(',');
            for (var i = 0; i < idToFilter.length; i++) {
                if (idToFilter[i])
                    idToFilter[i] = parseInt(idToFilter[i]);
            }
        } else
            idToFilter[0] = -1;
        getDegreeSearchlistByUser(req.body.name, req.body.user_id, idToFilter, function (data) {
            res.json({ status: 2, msg: "Search complete!", data: data });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});

function getDegreeSearchlistByUser(search_name, userId, idToFilter, callback) {
    Degree.find({
        "name": new RegExp(search_name, "i"),
        "members.user_id": { $in: userId }
    }, { name: 1, _id: 1 })
        .select('name icon type members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, degree) {
            callback(degree);
        });
}

function getDegreeSearchlist(search_name, idToFilter, callback) {
    Degree.find({
        name: new RegExp(search_name, "i"),
        _id: { $not: { $in: idToFilter } }
    }, { name: 1, _id: 1 })
        .select('name icon type members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, degree) {
            callback(degree);
        });
}

ctrl.get('/getAllDegree/:counter', function (req, res) {
    var counter = req.params.counter;
    var limit = 50;
    var skip = (counter - 1) * 50;
    var memIds;
    if (req.session.passport && req.session.passport.type == 2) {
        if (req.query.memIds) {
            memIds = JSON.parse(req.query.memIds);
            Degree.find({ _id: { $in: memIds } })
                .select('name icon type members post')
                .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
                .limit(limit)
                .skip(skip)
                .exec(function (err, degree) {
                    if (err)
                        throw err;
                    Degree.find({}, function (err, total_degrees) {
                        if (err)
                            throw err;
                        res.json({ data: degree, total_degrees: total_degrees.length });
                    });
                });
        } else {
            Degree.find({})
                .select('name icon type members post')
                .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
                .limit(limit)
                .skip(skip)
                .exec(function (err, degree) {
                    if (err)
                        throw err;
                    Degree.find({})
                        .count()
                        .exec(function (err, total_degrees) {
                            if (err)
                                throw err;
                            res.json({ data: degree, total_degrees: total_degrees });
                        });
                });
        }
    } else {
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.get('/dropDownList', function (req, res) {
    Degree.find({})
        .select('name icon type members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function (err, degree) {
            if (err)
                throw err;
            res.json(degree);
        });
});

ctrl.get('/delete/:id', function (req, res) {
    var Degree = require('../models/degree');
    var User = require('../models/user');
    var Post = require('../models/post');
    var degree = new Degree();
    if (req.session.passport && req.session.passport.type == 2) {
        var DegreeId = req.params.id;
        Degree.find({ '_id': DegreeId })
            .select('name icon type members post')
            .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
            .exec(function (err, degree) {
                if (err) {
                    throw err;
                }
                if (degree.length > 0) {
                    Degree.remove({ _id: DegreeId }, function (err, degrees) {
                        if (err)
                            throw err;
                        data = { message: 'Degree deleted' };
                        res.json(data);
                    });
                    for (var i = 0; i < degree[0].members.length; i++) {
                        if (degree[0].members[i].user_id != null) {
                            User.findByIdAndUpdate({ "_id": degree[0].members[i].user_id._id }, { $pull: { degree: { degree_id: degree[0]._id } } }, function (err, user) {
                                if (err)
                                    throw err;
                            });
                        }
                    }
                } else {
                    data = { message: 'Degree not found' };
                    res.json({ data: data });
                }
            });
    } else {
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});

ctrl.get('/list/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        Degree.findById(req.params.id)
            .select('name icon type members post')
            .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
            .exec(function (err, degree) {
                if (err)
                    throw err;
                return res.json(degree);
            });
    }
});

ctrl.post('/add', function (req, res) {
    var Degree = require('../models/degree');
    var degree = new Degree(req.body);
    var cDate = new Date();
    jDate = cDate;
    pDate = cDate;
    degree.members = { user_id: req.body.userId, join_date: jDate, pass_out_date: pDate };
    degree.save(function (err, college) {
        if (err)
            throw err;
        Degree.find({}, function (err, degree) {
            if (err)
                throw err;
            return res.json(degree);
        });
    });
});

ctrl.post('/addDegree/:name', function (req, res) {
    var Degree = require('../models/degree');
    var newDegree = new Degree();
    if (req.params.name != '') {
        newDegree.name = req.params.name;
    }
    if (req.session.passport && req.session.passport.type == 2) {
        newDegree.save(function (err, newDegree) {
            if (err) {
                throw err;
            }
            upload(req, res, function (err) {
                if (err) {
                    return
                }
                var ext = req.file.originalname.split('.').pop();
                filename = newDegree._id + '.' + ext;

                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Degree/Icon");
                fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    Degree.findByIdAndUpdate(newDegree._id, {
                        $push: {
                            icon: filename,
                        }
                    }, function (err, newSub) {
                        if (err) {
                            throw err
                        }
                        res.json({ status: 2, msg: "photo uploaded", data: newSub });
                    });
                });
            });
        });
    } else {
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});

ctrl.post('/addNewDegree/:name/:type', function (req, res) {
    var Degree = require('../models/degree');
    var newDegree = new Degree();
    newDegree.type = req.params.type;
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Degree.findOne({ 'name': req.params.name }, function (err, Degreedata) {
            if (err) {
                throw err;
            }
            if (Degreedata) {
                res.json({ status: 3, msg: "Degree Already Added" });
            } else {
                if (req.params.name != '') {
                    newDegree.name = req.params.name;
                }
                newDegree.save(function (err, newDegree) {
                    if (err) {
                        throw err;
                    }
                    upload(req, res, function (err) {
                        if (err) {
                            return
                        }
                        var ext = req.file.originalname.split('.').pop();
                        filename = newDegree._id + '.' + ext;

                        var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Degree/Icon");
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                            if (err) {
                                return console.log(err);
                            }
                            Degree.findByIdAndUpdate(newDegree._id, {
                                $push: {
                                    icon: filename,
                                }
                            }, function (err, newSub) {
                                if (err) {
                                    throw err
                                }
                                if (req.session.passport.type == 1) {
                                    sendNewSCDAddedMail(req.params.name, userId);
                                }
                                res.json({ status: 2, msg: "Degree Added Successfully", data: newSub });
                            });
                        });
                    });
                });
            }
        });
    } else {
        res.json({ msg: 'User Not Found' });
    }
});
ctrl.post('/addOnlyDegree', function (req, res) {
    var Degree = require('../models/degree');
    var newDegree = new Degree();
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Degree.findOne({ 'name': req.body.name.name }, function (err, Degreedata) {
            if (err) {
                throw err;
            }
            if (Degreedata) {
                res.json({ status: 3, msg: "Degree Already Added" });
            } else {
                if (req.body.name.name != '') {
                    newDegree.name = req.body.name.name;
                }
                if (req.body.type.type != '') {
                    newDegree.type = req.body.type.type;
                }
                newDegree.save(function (err, newDegree) {
                    if (err) {
                        throw err;
                    }
                    if (req.session.passport.type == 1) {
                        sendNewSCDAddedMail(req.body.name.name, userId);
                    }
                    res.json({ status: 2, msg: "Degree Added Successfully", data: newDegree });
                });
            }
        });

    } else {
        res.json({ msg: 'User Not Found' });
    }
});
ctrl.post('/updateDegreeById/:id/:name', function (req, res) {
    var Degree = require('../models/degree');
    var name = req.params.name;
    var ID = req.params.id;
    if (req.session.passport && req.session.passport.type == 2) {
        upload(req, res, function (err) {
            if (err) {
                return
            }
            var ext = req.file.originalname.split('.').pop();
            filename = ID + '.' + ext;
            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Degree/Icon");
            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                if (err) {
                    return console.log(err);
                }
                Degree.findOne({ 'name': name }, function (err, Degreedata) {
                    if (err) {
                        throw err;
                    }
                    if (Degreedata) {
                        Degree.findByIdAndUpdate(ID, {
                            $set: {
                                icon: filename,

                            }
                        }, function (err, newSub) {
                            if (err) {
                                throw err
                            }
                            res.json({ status: 2, msg: "Degree Image Updated & Name Already Exist", data: newSub });
                        });
                    } else {
                        Degree.findByIdAndUpdate(ID, {
                            $set: {
                                icon: filename,
                                name: name,
                            }
                        }, function (err, newSub) {
                            if (err) {
                                throw err
                            }
                            res.json({ status: 2, msg: "Degree Updated Successfully", data: newSub });
                        });
                    }
                });
            });
        });
    } else {
        res.json({ msg: 'User Not Found' });
    }
});
ctrl.post('/updateOnlyDegree/:id', function (req, res) {
    var Degree = require('../models/degree');
    var name = req.body.name.name;
    var ID = req.params.id;
    var type = req.body.type.type;
    if (req.session.passport && req.session.passport.type == 2) {
        Degree.findOne({ 'name': name }, function (err, Degreedata) {
            if (err) {
                throw err;
            }
            if (Degreedata) {
                res.json({ status: 3, msg: "Degree Already Added" });
            } else {
                Degree.findByIdAndUpdate(ID, {
                    $set: {
                        name: name,
                        type: type
                    }
                }, function (err, newSub) {
                    if (err) {
                        throw err
                    }
                    Degree.find({ _id: ID }, function (err, newDeg) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: "Degree Updated Successfully", data: newDeg });
                    });
                });
            }
        });
    } else {
        res.json({ msg: 'User Not Found' });
    }
});

ctrl.post('/updateNewDegreeById/:id/:name/:type', function (req, res) {
    var Degree = require('../models/degree');
    var name = req.params.name;
    var ID = req.params.id;
    var type = req.params.type;
    if (req.session.passport && req.session.passport.type == 2) {
        upload(req, res, function (err) {
            if (err) {
                return
            }
            var ext = req.file.originalname.split('.').pop();
            filename = ID + '.' + ext;
            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Degree/Icon");
            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                if (err) {
                    return console.log(err);
                }
                Degree.findByIdAndUpdate(ID, {
                    $set: {
                        icon: filename,
                        name: name,
                        type: type
                    }
                }, function (err, newSub) {
                    if (err) {
                        throw err;
                    }
                    Degree.find({ _id: ID }, function (err, newDeg) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: "photo updated", data: newDeg });
                    });
                });
            });
        });
    } else {
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});

ctrl.get("/setDefaultPrograms", function (req, res) {
    programData = [{ "_id": 1, "name": "Associate Degree in Administration of Justice", "type": 2 }, { "_id": 2, "name": "Associate Degree in Advertising", "type": 2 }, { "_id": 3, "name": "Associate Degree in Agribusiness", "type": 2 }, { "_id": 4, "name": "Associate Degree in Animal Management", "type": 2 }, { "_id": 5, "name": "Associate Degree in Architectural Building Engineering Technology", "type": 2 }, { "_id": 6, "name": "Associate Degree in Architecture and Career Options", "type": 2 }, { "_id": 7, "name": "Associate Degree in Art", "type": 2 }, { "_id": 8, "name": "Associate Degree in Automotive Maintenance Technology", "type": 2 }, { "_id": 9, "name": "Associate Degree in Aviation Mechanics", "type": 2 }, { "_id": 10, "name": "Associate Degree in Behavioral Science", "type": 2 }, { "_id": 11, "name": "Associate Degree in Boat Mechanics", "type": 2 }, { "_id": 12, "name": "Associate Degree in Boat Repair and Maintenance", "type": 2 }, { "_id": 13, "name": "Associate Degree in Cabinet Design Technology", "type": 2 }, { "_id": 14, "name": "Associate Degree in Child Development: Program Summary", "type": 2 }, { "_id": 15, "name": "Associate Degree in Christian Ministry", "type": 2 }, { "_id": 16, "name": "Associate Degree in Cosmetology Business", "type": 2 }, { "_id": 17, "name": "Associate Degree in Digital Media", "type": 2 }, { "_id": 18, "name": "Associate Degree in Early Childhood Special Education", "type": 2 }, { "_id": 19, "name": "Associate Degree in Elementary Education", "type": 2 }, { "_id": 20, "name": "Associate Degree in English", "type": 2 }, { "_id": 21, "name": "Associate Degree in Environmental Science", "type": 2 }, { "_id": 22, "name": "Associate Degree in Environmental Studies", "type": 2 }, { "_id": 23, "name": "Associate Degree in General Psychology", "type": 2 }, { "_id": 24, "name": "Associate Degree in History and Information", "type": 2 }, { "_id": 25, "name": "Associate Degree in Interdisciplinary Studies", "type": 2 }, { "_id": 26, "name": "Associate Degree in International Relations", "type": 2 }, { "_id": 27, "name": "Associate Degree in Landscape Architecture", "type": 2 }, { "_id": 28, "name": "Associate Degree in Landscaping Design", "type": 2 }, { "_id": 29, "name": "Associate Degree in Library Science", "type": 2 }, { "_id": 30, "name": "Associate Degree in Music", "type": 2 }, { "_id": 31, "name": "Associate Degree in Wildlife Management", "type": 2 }, { "_id": 32, "name": "Associate Degree in Education", "type": 2 }, { "_id": 33, "name": "Associate of Applied Science (AAS) in Accelerated Culinary Arts", "type": 2 }, { "_id": 34, "name": "Associate of Applied Science (AAS) in Accounting Specialist", "type": 2 }, { "_id": 35, "name": "Associate of Applied Science (AAS) in Administrative Support", "type": 2 }, { "_id": 36, "name": "Associate of Applied Science (AAS) in Baking and Pastry", "type": 2 }, { "_id": 37, "name": "Associate of Applied Science (AAS) in Business Administration", "type": 2 }, { "_id": 38, "name": "Associate of Applied Science (AAS) in Business Administration - Finance", "type": 2 }, { "_id": 39, "name": "Associate of Applied Science (AAS) in Business Information Systems", "type": 2 }, { "_id": 40, "name": "Associate of Applied Science (AAS) in Civil Justice - Law Enforcement", "type": 2 }, { "_id": 41, "name": "Associate of Applied Science (AAS) in Clinical Medical Assisting", "type": 2 }, { "_id": 42, "name": "Associate of Applied Science (AAS) in Computer Applications", "type": 2 }, { "_id": 43, "name": "Associate of Applied Science (AAS) in Computer Electronics", "type": 2 }, { "_id": 44, "name": "Associate of Applied Science (AAS) in Computer Game Design", "type": 2 }, { "_id": 45, "name": "Associate of Applied Science (AAS) in Computer Information Systems", "type": 2 }, { "_id": 46, "name": "Associate of Applied Science (AAS) in Culinary Arts", "type": 2 }, { "_id": 47, "name": "Associate of Applied Science (AAS) in Digital Media Communications", "type": 2 }, { "_id": 48, "name": "Associate of Applied Science (AAS) in Digital Photography", "type": 2 }, { "_id": 49, "name": "Associate of Applied Science (AAS) in Electronic Engineering", "type": 2 }, { "_id": 50, "name": "Associate of Applied Science (AAS) in Emergency Medical Services", "type": 2 }, { "_id": 51, "name": "Associate of Applied Science (AAS) in Health Care Management", "type": 2 }, { "_id": 52, "name": "Associate of Applied Science (AAS) in Health Information Management", "type": 2 }, { "_id": 53, "name": "Associate of Applied Science (AAS) in Healthcare Administration", "type": 2 }, { "_id": 54, "name": "Associate of Applied Science (AAS) in Legal Office E-ministration", "type": 2 }, { "_id": 55, "name": "Associate of Applied Science (AAS) in Telecommunications Technology", "type": 2 }, { "_id": 56, "name": "Associate of Applied Science (AAS) in Television Production", "type": 2 }, { "_id": 57, "name": "Associate of Applied Science (AAS) in Visual Communications", "type": 2 }, { "_id": 58, "name": "Associate of Arts (AA) in Computer Information Systems", "type": 2 }, { "_id": 59, "name": "Associate of Arts (AA) in Internetworking Technology", "type": 2 }, { "_id": 60, "name": "Associate of Arts (AA) in Psychology", "type": 2 }, { "_id": 61, "name": "Associate of Arts (AA) in Interior Architecture and Design", "type": 2 }, { "_id": 62, "name": "Associate of Biotechnology", "type": 2 }, { "_id": 63, "name": "Associate of Business Science (ABS) in Individualized Studies", "type": 2 }, { "_id": 64, "name": "Associate of Early Childhood Education (AECE)", "type": 2 }, { "_id": 65, "name": "Associate of Occupational Studies (AOS) in Legal Office Administration", "type": 2 }, { "_id": 66, "name": "Associate of Science (AS) in Computer Information Science", "type": 2 }, { "_id": 67, "name": "Associate of Science (AS) in Computer Science", "type": 2 }, { "_id": 68, "name": "Associate of Science (AS) in Corrections, Probation, & Parole", "type": 2 }, { "_id": 69, "name": "Associate of Science (AS) in Electronics Engineering Technology", "type": 2 }, { "_id": 70, "name": "Associate of Science (AS) in Interactive & Graphic Art", "type": 2 }, { "_id": 71, "name": "AA - Associate of Arts", "type": 2 }, { "_id": 72, "name": "AE - Associate of Engineering or Associate in Electronics Engineering Technology", "type": 2 }, { "_id": 73, "name": "ASN - Associate of Science in Nursing", "type": 2 }, { "_id": 74, "name": "AS - Associate of Science", "type": 2 }, { "_id": 75, "name": "AF - Associate of Forestry", "type": 2 }, { "_id": 76, "name": "AT - Associate of Technology", "type": 2 }, { "_id": 77, "name": "AAA - Associate of Applied Arts", "type": 2 }, { "_id": 78, "name": "AAB - Associate of Applied Business", "type": 2 }, { "_id": 79, "name": "AAS - Associate of Applied Science or Associate of Arts and Sciences", "type": 2 }, { "_id": 80, "name": "AAT - Associate of Arts in Teaching", "type": 2 }, { "_id": 81, "name": "ABA - Associate of Business Administration", "type": 2 }, { "_id": 82, "name": "ABS - Associate of Baccalaureate Studies", "type": 2 }, { "_id": 83, "name": "ADN - Associate Degree in Nursing", "type": 2 }, { "_id": 84, "name": "AES - Associate of Engineering Science", "type": 2 }, { "_id": 85, "name": "AET - Associate in Engineering Technology", "type": 2 }, { "_id": 86, "name": "AFA - Associate of Fine Arts", "type": 2 }, { "_id": 87, "name": "AGS - Associate of General Studies", "type": 2 }, { "_id": 88, "name": "AIT - Associate of Industrial Technology", "type": 2 }, { "_id": 89, "name": "AOS - Associate of Occupational Studies", "type": 2 }, { "_id": 90, "name": "APE - Associate of Pre-Engineering", "type": 2 }, { "_id": 91, "name": "APS - Associate of Political Science or Associate of Public Service", "type": 2 }, { "_id": 92, "name": "ASPT-APT - Associate in Physical Therapy", "type": 2 }, { "_id": 93, "name": "Bachelor of Architecture", "type": 3 }, { "_id": 94, "name": "Bachelor of Biomedical Science", "type": 3 }, { "_id": 95, "name": "Bachelor of Business Administration", "type": 3 }, { "_id": 96, "name": "Bachelor of Clinical Science", "type": 3 }, { "_id": 97, "name": "Bachelor of Commerce", "type": 3 }, { "_id": 98, "name": "Bachelor of Computer Applications", "type": 3 }, { "_id": 99, "name": "Bachelor of Computer Information Systems", "type": 3 }, { "_id": 100, "name": "Bachelor of Science in Construction Technology", "type": 3 }, { "_id": 101, "name": "Bachelor of Criminal Justice", "type": 3 }, { "_id": 102, "name": "Bachelor of Divinity", "type": 3 }, { "_id": 103, "name": "Bachelor of Economics", "type": 3 }, { "_id": 104, "name": "Bachelor of Education", "type": 3 }, { "_id": 105, "name": "Bachelor of Engineering", "type": 3 }, { "_id": 106, "name": "Bachelor of Fine Arts", "type": 3 }, { "_id": 107, "name": "Bachelor of Information Systems", "type": 3 }, { "_id": 108, "name": "Bachelor of Management", "type": 3 }, { "_id": 109, "name": "Bachelor of Music", "type": 3 }, { "_id": 110, "name": "Bachelor of Pharmacy", "type": 3 }, { "_id": 111, "name": "Bachelor of Philosophy", "type": 3 }, { "_id": 112, "name": "Bachelor of Social Work", "type": 3 }, { "_id": 113, "name": "Bachelor of Technology", "type": 3 }, { "_id": 114, "name": "Bachelor of Accountancy", "type": 3 }, { "_id": 115, "name": "Bachelor of Arts in American Studies", "type": 3 }, { "_id": 116, "name": "Bachelor of Arts in American Indian Studies", "type": 3 }, { "_id": 117, "name": "Bachelor of Arts in Applied Psychology", "type": 3 }, { "_id": 118, "name": "Bachelor of Arts in Biology", "type": 3 }, { "_id": 119, "name": "Bachelor of Arts in Anthropology", "type": 3 }, { "_id": 120, "name": "Bachelor of Arts in Child Advocacy", "type": 3 }, { "_id": 121, "name": "Bachelor of Arts in Clinical Psychology", "type": 3 }, { "_id": 122, "name": "Bachelor of Arts in Forensic Psychology", "type": 3 }, { "_id": 123, "name": "Bachelor of Arts in Organizational Psychology", "type": 3 }, { "_id": 124, "name": "Bachelor of Science in Aerospace Engineering", "type": 3 }, { "_id": 125, "name": "Bachelor of Science in Actuarial", "type": 3 }, { "_id": 126, "name": "Bachelor of Science in Agriculture", "type": 3 }, { "_id": 127, "name": "Bachelor of Science in Architecture", "type": 3 }, { "_id": 128, "name": "Bachelor of Science in Architectural Engineering", "type": 3 }, { "_id": 129, "name": "Bachelor of Science in Biology", "type": 3 }, { "_id": 130, "name": "Bachelor of Science in Biomedical Engineering", "type": 3 }, { "_id": 131, "name": "Bachelor of Science in Business Administration", "type": 3 }, { "_id": 132, "name": "Bachelor of Science in Business and Technology", "type": 3 }, { "_id": 133, "name": "Bachelor of Science in Chemical Engineering", "type": 3 }, { "_id": 134, "name": "Bachelor of Science in Chemistry", "type": 3 }, { "_id": 135, "name": "Bachelor of Science in Civil Engineering", "type": 3 }, { "_id": 136, "name": "Bachelor of Science in Clinical Laboratory Science", "type": 3 }, { "_id": 137, "name": "Bachelor of Science in Cognitive Science", "type": 3 }, { "_id": 138, "name": "Bachelor of Science in Computer Engineering", "type": 3 }, { "_id": 139, "name": "Bachelor of Science in Computer Science", "type": 3 }, { "_id": 140, "name": "Bachelor of Science in Construction Engineering", "type": 3 }, { "_id": 141, "name": "Bachelor of Science in Construction Management", "type": 3 }, { "_id": 142, "name": "Bachelor of Science in Criminal Justice", "type": 3 }, { "_id": 143, "name": "Bachelor of Science in Criminology", "type": 3 }, { "_id": 144, "name": "Bachelor of Science in Diagnostic Radiography", "type": 3 }, { "_id": 145, "name": "Bachelor of Science in Education", "type": 3 }, { "_id": 146, "name": "Bachelor of Science in Electrical Engineering", "type": 3 }, { "_id": 147, "name": "Bachelor of Science in Engineering Physics", "type": 3 }, { "_id": 148, "name": "Bachelor of Science in Engineering Science", "type": 3 }, { "_id": 149, "name": "Bachelor of Science in Engineering Technology", "type": 3 }, { "_id": 150, "name": "Bachelor of Science in English Literature", "type": 3 }, { "_id": 151, "name": "Bachelor of Science in Environmental Engineering", "type": 3 }, { "_id": 152, "name": "Bachelor of Science in Environmental Science", "type": 3 }, { "_id": 153, "name": "Bachelor of Science in Environmental Studies", "type": 3 }, { "_id": 154, "name": "Bachelor of Science in Food Science", "type": 3 }, { "_id": 155, "name": "Bachelor of Science in Foreign Service", "type": 3 }, { "_id": 156, "name": "Bachelor of Science in Forensic Science", "type": 3 }, { "_id": 157, "name": "Bachelor of Science in Forestry", "type": 3 }, { "_id": 158, "name": "Bachelor of Science in History", "type": 3 }, { "_id": 159, "name": "Bachelor of Science in Hospitality Management", "type": 3 }, { "_id": 160, "name": "Bachelor of Science in Human Resources Management", "type": 3 }, { "_id": 161, "name": "Bachelor of Science in Industrial Engineering", "type": 3 }, { "_id": 162, "name": "Bachelor of Science in Information Technology", "type": 3 }, { "_id": 163, "name": "Bachelor of Science in Information Systems", "type": 3 }, { "_id": 164, "name": "Bachelor of Science in Integrated Science", "type": 3 }, { "_id": 165, "name": "Bachelor of Science in International Relations", "type": 3 }, { "_id": 166, "name": "Bachelor of Science in Journalism", "type": 3 }, { "_id": 167, "name": "Bachelor of Science in Legal Management", "type": 3 }, { "_id": 168, "name": "Bachelor of Science in Management", "type": 3 }, { "_id": 169, "name": "Bachelor of Science in Manufacturing Engineering", "type": 3 }, { "_id": 170, "name": "Bachelor of Science in Marketing", "type": 3 }, { "_id": 171, "name": "Bachelor of Science in Mathematics", "type": 3 }, { "_id": 172, "name": "Bachelor of Science in Mechanical Engineering", "type": 3 }, { "_id": 173, "name": "Bachelor of Science in Medical Technology", "type": 3 }, { "_id": 174, "name": "Bachelor of Science in Metallurgical Engineering", "type": 3 }, { "_id": 175, "name": "Bachelor of Science in Meteorology", "type": 3 }, { "_id": 176, "name": "Bachelor of Science in Microbiology", "type": 3 }, { "_id": 177, "name": "Bachelor of Science in Mining Engineering", "type": 3 }, { "_id": 178, "name": "Bachelor of Science in Molecular Biology", "type": 3 }, { "_id": 179, "name": "Bachelor of Science in Neuroscience", "type": 3 }, { "_id": 180, "name": "Bachelor of Science in Nursing", "type": 3 }, { "_id": 181, "name": "Bachelor of Science in Nutrition science", "type": 3 }, { "_id": 182, "name": "Bachelor of Science in Software Engineering", "type": 3 }, { "_id": 183, "name": "Bachelor of Science in Petroleum Engineering", "type": 3 }, { "_id": 184, "name": "Bachelor of Science in Podiatry", "type": 3 }, { "_id": 185, "name": "Bachelor of Science in Pharmacology", "type": 3 }, { "_id": 186, "name": "Bachelor of Science in Pharmacy", "type": 3 }, { "_id": 187, "name": "Bachelor of Science in Physical Therapy", "type": 3 }, { "_id": 188, "name": "Bachelor of Science in Physics", "type": 3 }, { "_id": 189, "name": "Bachelor of Science in Plant Science", "type": 3 }, { "_id": 190, "name": "Bachelor of Science in Politics", "type": 3 }, { "_id": 191, "name": "Bachelor of Science in Psychology", "type": 3 }, { "_id": 192, "name": "Bachelor of Science in Public Safety", "type": 3 }, { "_id": 193, "name": "Bachelor of Science in Quantity Surveying Engineering", "type": 3 }, { "_id": 194, "name": "Bachelor of Science in Radiologic Technology", "type": 3 }, { "_id": 195, "name": "Bachelor of Science in Real-Time Interactive Simulation", "type": 3 }, { "_id": 196, "name": "Bachelor of Science in Religion", "type": 3 }, { "_id": 197, "name": "Bachelor of Science in Respiratory Therapy", "type": 3 }, { "_id": 198, "name": "Bachelor of Science in Risk Management and Insurance", "type": 3 }, { "_id": 199, "name": "Bachelor of Science in Science Education", "type": 3 }, { "_id": 200, "name": "Bachelor of Science in Sports Management", "type": 3 }, { "_id": 201, "name": "Bachelor of Science in Systems Engineering", "type": 3 }, { "_id": 202, "name": "Bachelor of Music in Jazz Studies", "type": 3 }, { "_id": 203, "name": "Bachelor of Music in Composition", "type": 3 }, { "_id": 204, "name": "Bachelor of Music in Performance", "type": 3 }, { "_id": 205, "name": "Bachelor of Music in Theory", "type": 3 }, { "_id": 206, "name": "Bachelor of Music in Music Education", "type": 3 }, { "_id": 207, "name": "Bachelor of Science in Veterinary Technology", "type": 3 }, { "_id": 208, "name": "Bachelor of Architecture (BArch)", "type": 3 }, { "_id": 209, "name": "Bachelor of Design (BDes, or SDes in Indonesia)", "type": 3 }, { "_id": 210, "name": "Bachelor of Arts (BA, AB, BS, BSc, SB, ScB)", "type": 3 }, { "_id": 211, "name": "Bachelor of Applied Arts (BAA)", "type": 3 }, { "_id": 212, "name": "Bachelor of Applied Arts and Science (BAAS)", "type": 3 }, { "_id": 213, "name": "Bachelor of Engineering (BEng, BE, BSE, BESc, BSEng, BASc, BTech, BSc(Eng), AMIE,GradIETE)", "type": 3 }, { "_id": 214, "name": "Bachelor of Technology (B.Tech. or B.Tech.)", "type": 3 }, { "_id": 215, "name": "Bachelor of Engineering Technology (BSET)", "type": 3 }, { "_id": 216, "name": "Bachelor of Business Administration (BBA)", "type": 3 }, { "_id": 217, "name": "International Business Economics (BIBE)", "type": 3 }, { "_id": 218, "name": "Bachelor of Science in Business (BSBA)", "type": 3 }, { "_id": 219, "name": "Bachelor of Management Studies (BMS)", "type": 3 }, { "_id": 220, "name": "Bachelor of Administrative Studies", "type": 3 }, { "_id": 221, "name": "Bachelor of International Business Economics (BIBE)", "type": 3 }, { "_id": 222, "name": "Bachelor of Commerce (BCom, or BComm)", "type": 3 }, { "_id": 223, "name": "Bachelor of Business (BBus or BBus)", "type": 3 }, { "_id": 224, "name": "Bachelor of Management and Organizational Studies (BMOS)", "type": 3 }, { "_id": 225, "name": "Bachelor of Business Science (BBusSc)", "type": 3 }, { "_id": 226, "name": "Bachelor of Accountancy (B.Acy. or B.Acc. or B. Accty)", "type": 3 }, { "_id": 227, "name": "Bachelor of Comptrolling (B.Acc.Sci. or B.Compt.)", "type": 3 }, { "_id": 228, "name": "Bachelor of Economics (BEc, BEconSc; sometimes BA(Econ) or BSc(Econ))", "type": 3 }, { "_id": 229, "name": "Bachelor of Arts in Organizational Management (BAOM)", "type": 3 }, { "_id": 230, "name": "Bachelor of Computing (BComp)", "type": 3 }, { "_id": 231, "name": "Bachelor of Computer Science (BCompSc)", "type": 3 }, { "_id": 232, "name": "Bachelor of Science in Information Technology (BSc IT)", "type": 3 }, { "_id": 233, "name": "Bachelor of Computer Applications (BCA)", "type": 3 }, { "_id": 234, "name": "Bachelor of Applied Science in Information Technology (BAppSc(IT))", "type": 3 }, { "_id": 235, "name": "Bachelor of Business Information Systems (BBIS)", "type": 3 }, { "_id": 236, "name": "Intercalated Bachelor of Science (BSc)", "type": 3 }, { "_id": 237, "name": "Bachelor of Medical Science (BMedSci)", "type": 3 }, { "_id": 238, "name": "Bachelor of Medical Biology (BMedBiol)", "type": 3 }, { "_id": 239, "name": "Doctorate of Dental Surgery (DDS)", "type": 3 }, { "_id": 240, "name": "Bachelor of Science in Nursing (BN, BNSc, BScN, BSN, BNurs, BSN, BHSc.)", "type": 3 }, { "_id": 241, "name": "Bachelor of Science in Public Health (BSPH)", "type": 3 }, { "_id": 242, "name": "Bachelor of Health Science (BHS & BHSc)", "type": 3 }, { "_id": 243, "name": "Bachelor of Science in Human Biology (BSc)", "type": 3 }, { "_id": 244, "name": "Bachelor of Kinesiology (BKin, BSc(Kin), BHK)", "type": 3 }, { "_id": 245, "name": "Bachelor of Aviation (BAvn)", "type": 3 }, { "_id": 246, "name": "Bachelor of Divinity (BD or BDiv)", "type": 3 }, { "_id": 247, "name": "Bachelor of Theology (B.Th.; Th.B. or BTheol)", "type": 3 }, { "_id": 248, "name": "Bachelor of Religious Studies (BRS)", "type": 3 }, { "_id": 249, "name": "Bachelor of Religious Education (BRE)", "type": 3 }, { "_id": 250, "name": "Bachelor of Fine Arts (BFA)", "type": 3 }, { "_id": 251, "name": "Bachelor of Film and Television (BF&TV)", "type": 3 }, { "_id": 252, "name": "Bachelor of Integrated studies (BIS)", "type": 3 }, { "_id": 253, "name": "Bachelor of Journalism (BJ, BAJ, BSJ or BJourn)", "type": 3 }, { "_id": 254, "name": "Bachelor of Landscape Architecture (BLArch)", "type": 3 }, { "_id": 255, "name": "Bachelor of Liberal Arts (B.L.A.; occasionally A.L.B.)", "type": 3 }, { "_id": 256, "name": "Bachelor of General Studies (BGS, BSGS)", "type": 3 }, { "_id": 257, "name": "Bachelor of Applied Studies (BAS)", "type": 3 }, { "_id": 258, "name": "Bachelor of Liberal Studies", "type": 3 }, { "_id": 259, "name": "Bachelor of Professional Studies (BPS)", "type": 3 }, { "_id": 260, "name": "Bachelor of Library Science (B.L.S., B.Lib.)", "type": 3 }, { "_id": 261, "name": "Bachelor of Library and Information Science (B.L.I.S.)", "type": 3 }, { "_id": 262, "name": "Bachelor of Music (BM or BMus)", "type": 3 }, { "_id": 263, "name": "Bachelor of Art in Music (BA in Music)", "type": 3 }, { "_id": 264, "name": "Bachelor of Music Education (BME)", "type": 3 }, { "_id": 265, "name": "Bachelor of Mortuary Science (BMS)", "type": 3 }, { "_id": 266, "name": "Bachelor of Philosophy (BPhil, PhB)", "type": 3 }, { "_id": 267, "name": "Bachelor of Arts in Psychology (BAPSY)", "type": 3 }, { "_id": 268, "name": "Bachelor of Science in Psychology (BSc(Psych)", "type": 3 }, { "_id": 269, "name": "Bachelor of Science in Education (BSE, BS in Ed)", "type": 3 }, { "_id": 270, "name": "Bachelor of Arts for Teaching (BAT)", "type": 3 }, { "_id": 271, "name": "Bachelor of Science and/with education degree (BScEd)", "type": 3 }, { "_id": 272, "name": "Bachelor of Science in Forestry (B.S.F. or B.Sc.F.)", "type": 3 }, { "_id": 273, "name": "Bachelor of Applied Science (BASc)", "type": 3 }, { "_id": 274, "name": "Bachelor of Science in Law (BSL)", "type": 3 }, { "_id": 275, "name": "Bachelor of Social Science (BSocSc)", "type": 3 }, { "_id": 276, "name": "Bachelor of Arts in Social Work (BSW or BASW)", "type": 3 }, { "_id": 277, "name": "Bachelor of Technology (B.Tech)", "type": 3 }, { "_id": 278, "name": "Bachelor of Talmudic Law (BTL)", "type": 3 }, { "_id": 279, "name": "Bachelor of Tourism Studies (BTS)", "type": 3 }, { "_id": 280, "name": "Bachelor of Mathematics (BMath)", "type": 3 }, { "_id": 281, "name": "Bachelor of Mathematical Sciences (BMathSc)", "type": 3 }, { "_id": 282, "name": "Bachelor of Urban and Regional Planning (BURP and BPlan)", "type": 3 }, { "_id": 283, "name": "Bachelor of Public Affairs and Policy Management (BPAPM)", "type": 3 }, { "_id": 284, "name": "African Studies (B)", "type": 3 }, { "_id": 285, "name": "Ancient History and Classical Studies (B)", "type": 3 }, { "_id": 286, "name": "Astronomy (B)", "type": 3 }, { "_id": 287, "name": "Biology (B)", "type": 3 }, { "_id": 288, "name": "Business Administration (B)", "type": 3 }, { "_id": 289, "name": "Business Informatics (B)", "type": 3 }, { "_id": 290, "name": "Byzantine and Modern Greek Studies (B)", "type": 3 }, { "_id": 291, "name": "Chemistry (B)", "type": 3 }, { "_id": 292, "name": "Classical Archaeology (B)", "type": 3 }, { "_id": 293, "name": "Classical Philology (B)", "type": 3 }, { "_id": 294, "name": "Comparative Literature (B)", "type": 3 }, { "_id": 295, "name": "Computer Science (B)", "type": 3 }, { "_id": 296, "name": "Dutch Studies (B)", "type": 3 }, { "_id": 297, "name": "Earth Sciences (B)", "type": 3 }, { "_id": 298, "name": "Economics (B)", "type": 3 }, { "_id": 299, "name": "Education (B)", "type": 3 }, { "_id": 300, "name": "Egyptology (B)", "type": 3 }, { "_id": 301, "name": "English and American Studies (B)", "type": 3 }, { "_id": 302, "name": "European Ethnology (B)", "type": 3 }, { "_id": 303, "name": "Fennistic Studies (B)", "type": 3 }, { "_id": 304, "name": "Geography (B)", "type": 3 }, { "_id": 305, "name": "German Studies (B)", "type": 3 }, { "_id": 306, "name": "History (B)", "type": 3 }, { "_id": 307, "name": "History of Art and Architecture (B)", "type": 3 }, { "_id": 308, "name": "Hungarian Studies (B)", "type": 3 }, { "_id": 309, "name": "International Business Administration (B)", "type": 3 }, { "_id": 310, "name": "Japanese Studies (B)", "type": 3 }, { "_id": 311, "name": "Jewish Studies (B)", "type": 3 }, { "_id": 312, "name": "Korean Studies (B)", "type": 3 }, { "_id": 313, "name": "Languages and Cultures of South Asia and Tibet (B)", "type": 3 }, { "_id": 314, "name": "Linguistics (B)", "type": 3 }, { "_id": 315, "name": "Mass Media and Communication Science (BAKK)", "type": 3 }, { "_id": 316, "name": "Mathematics (B)", "type": 3 }, { "_id": 317, "name": "Meteorology (B)", "type": 3 }, { "_id": 318, "name": "Musicology (B)", "type": 3 }, { "_id": 319, "name": "Nutritional Science (B)", "type": 3 }, { "_id": 320, "name": "Oriental Studies (B)", "type": 3 }, { "_id": 321, "name": "Pharmacy (B)", "type": 3 }, { "_id": 322, "name": "Philosophy (B)", "type": 3 }, { "_id": 323, "name": "Physics (B)", "type": 3 }, { "_id": 324, "name": "Political Science (B)", "type": 3 }, { "_id": 325, "name": "Prehistoric and Historical Archaeology (B)", "type": 3 }, { "_id": 326, "name": "Protestant Theology (B)", "type": 3 }, { "_id": 327, "name": "Psychology (B)", "type": 3 }, { "_id": 328, "name": "Religious Education (B)", "type": 3 }, { "_id": 329, "name": "Romance Studies (B)", "type": 3 }, { "_id": 330, "name": "Scandinavian Studies (B)", "type": 3 }, { "_id": 331, "name": "Sinology (B)", "type": 3 }, { "_id": 332, "name": "Slavonic Studies (B)", "type": 3 }, { "_id": 333, "name": "Social and Cultural Anthropology (B)", "type": 3 }, { "_id": 334, "name": "Sociology (B)", "type": 3 }, { "_id": 335, "name": "Sports Sciences (BAKK)", "type": 3 }, { "_id": 336, "name": "Statistics (B)", "type": 3 }, { "_id": 337, "name": "Theatre, Film and Media Studies (B)", "type": 3 }, { "_id": 338, "name": "Transcultural Communication  (B)", "type": 3 }, { "_id": 339, "name": "12 Month Full Time - Computer Animation, Visual Effects and Game Design Diploma", "type": 1 }, { "_id": 340, "name": "18-month Food & Beverage Management Diploma", "type": 1 }, { "_id": 341, "name": "AAT Level 3 Diploma in Accounting", "type": 1 }, { "_id": 342, "name": "AAT Level 4 Diploma in Accounting", "type": 1 }, { "_id": 343, "name": "ACCA - Diploma in Financial Management", "type": 1 }, { "_id": 344, "name": "Access to HE Diploma (Business Management) full-time", "type": 1 }, { "_id": 345, "name": "Access to HE Diploma (Social Sciences) full-time", "type": 1 }, { "_id": 346, "name": "Accounting and Payroll Administrator Diploma Program", "type": 1 }, { "_id": 347, "name": "Addictions Services Counselling Diploma", "type": 1 }, { "_id": 348, "name": "Advance Diploma in Business Administration", "type": 1 }, { "_id": 349, "name": "Advance Diploma in Computer Application", "type": 1 }, { "_id": 350, "name": "Advanced Diploma in Graphic Design and Web Development", "type": 1 }, { "_id": 351, "name": "Advanced Diploma in Tourism Hospitality Management w/ Business Administration Principles Co-op", "type": 1 }, { "_id": 352, "name": "Advanced Diploma of Accounting", "type": 1 }, { "_id": 353, "name": "Advanced Diploma of Business", "type": 1 }, { "_id": 354, "name": "Advanced Diploma of Management", "type": 1 }, { "_id": 355, "name": "Audio Technology Diploma", "type": 1 }, { "_id": 356, "name": "BCSC Diploma in Shopping Centre Management", "type": 1 }, { "_id": 357, "name": "Boulangerie Diploma", "type": 1 }, { "_id": 358, "name": "BTEC Diploma in Music Production", "type": 1 }, { "_id": 359, "name": "BTEC Extended Diploma in Applied Science", "type": 1 }, { "_id": 360, "name": "BTEC Extended Diploma in Art & Design (Fashion & Clothing)", "type": 1 }, { "_id": 361, "name": "BTEC Extended Diploma in DJ & Electronic Music Production", "type": 1 }, { "_id": 362, "name": "BTEC Extended Diploma in Engineering", "type": 1 }, { "_id": 363, "name": "BTEC Extended Diploma in ICT", "type": 1 }, { "_id": 364, "name": "BTEC Extended Diploma in Music Performance", "type": 1 }, { "_id": 365, "name": "BTEC Extended Diploma in Performing Arts (Dance)", "type": 1 }, { "_id": 366, "name": "BTEC Foundation Diploma Art & Design", "type": 1 }, { "_id": 367, "name": "BTEC Higher National Diploma in Business (Business Management)", "type": 1 }, { "_id": 368, "name": "BTEC HND Diploma - Graphic Design, Interactive Media, Fashion & Textile", "type": 1 }, { "_id": 369, "name": "BTEC level 3 Diploma in Business Management or Business Marketing", "type": 1 }, { "_id": 370, "name": "BTEC Level 3 Diploma in IT", "type": 1 }, { "_id": 371, "name": "BTEC Level 3 Extended Diploma in Aeronautical Engineering", "type": 1 }, { "_id": 372, "name": "BTEC Level 3 Extended Diploma in Art & Design", "type": 1 }, { "_id": 373, "name": "BTEC Level 3 Extended Diploma in Interactive Media and Digital Design", "type": 1 }, { "_id": 374, "name": "BTEC Level 5 HND Diploma in Business (Accounting)", "type": 1 }, { "_id": 375, "name": "BTEC Level 5 HND Diploma in Business (Management)", "type": 1 }, { "_id": 376, "name": "BTEC Level 5 HND Diploma in Business (Marketing)", "type": 1 }, { "_id": 377, "name": "BTEC Level 5 HND Diploma in Computing and Systems Development", "type": 1 }, { "_id": 378, "name": "BTEC Level 5 HND Diploma in Travel and Tourism Management", "type": 1 }, { "_id": 379, "name": "BTEC Level 7 Diploma in Strategic Management and Leadership - Edexcel", "type": 1 }, { "_id": 380, "name": "BTEC Sub Diploma/Diploma in Business", "type": 1 }, { "_id": 381, "name": "Business Administration - E-Commerce Management Diploma Program", "type": 1 }, { "_id": 382, "name": "Business Administration / E-Commerce Management Diploma Program", "type": 1 }, { "_id": 383, "name": "Business Administration Diploma", "type": 1 }, { "_id": 384, "name": "Business Administration Management Diploma Program", "type": 1 }, { "_id": 385, "name": "Business Diploma (undergraduate program)", "type": 1 }, { "_id": 386, "name": "Business Foundation programme", "type": 1 }, { "_id": 387, "name": "Business Management & Co-op Diploma", "type": 1 }, { "_id": 388, "name": "Cambridge International IT Diploma + Executive Secretarial Management", "type": 1 }, { "_id": 389, "name": "CIM Diploma in Professional Marketing", "type": 1 }, { "_id": 390, "name": "CIPD Level 3 Diploma Human Resource Practice", "type": 1 }, { "_id": 391, "name": "CIPD Level 3 Diploma Learning & Development", "type": 1 }, { "_id": 392, "name": "CIPD Level 5 Diploma Human Resource Management", "type": 1 }, { "_id": 393, "name": "CIPD Level 5 Diploma in Learning & Development", "type": 1 }, { "_id": 394, "name": "CIPD Level 7 Advanced Diploma Human Resource Management", "type": 1 }, { "_id": 395, "name": "Classical & Computer Animation & Production Diploma", "type": 1 }, { "_id": 396, "name": "Computer Graphic Design Diploma Program", "type": 1 }, { "_id": 397, "name": "Concept Art for Animation & Video Games Diploma", "type": 1 }, { "_id": 398, "name": "Cordon Bleu Diploma", "type": 1 }, { "_id": 399, "name": "Counselling Studies and Skills University Diploma", "type": 1 }, { "_id": 400, "name": "Course - International Diploma in Business", "type": 1 }, { "_id": 401, "name": "Course: AAT Diploma in Accounting (Level 3)", "type": 1 }, { "_id": 402, "name": "Course: Access to Higher Education Diploma: Combined Studies (Level 3)", "type": 1 }, { "_id": 403, "name": "Course: BTEC Diploma in Business (Level 3)", "type": 1 }, { "_id": 404, "name": "Course: BTEC Diploma in IT (Level 3)", "type": 1 }, { "_id": 405, "name": "Course: BTEC Extended Diploma in Applied Science (Level 3)", "type": 1 }, { "_id": 406, "name": "Course: BTEC Extended Diploma in Business (Level 3)", "type": 1 }, { "_id": 407, "name": "Course: BTEC Extended Diploma in Construction (Level 3)", "type": 1 }, { "_id": 408, "name": "Course: BTEC Extended Diploma in Creative Media Production (Level 3)", "type": 1 }, { "_id": 409, "name": "Course: BTEC Extended Diploma in Fashion and Clothing (Level 3)", "type": 1 }, { "_id": 410, "name": "Course: BTEC Extended Diploma in Games Development (Level 3)", "type": 1 }, { "_id": 411, "name": "Course: BTEC Extended Diploma in IT (Level 3)", "type": 1 }, { "_id": 412, "name": "Course: BTEC Extended Diploma in Music Performance (Level 3)", "type": 1 }, { "_id": 413, "name": "Course: BTEC Extended Diploma in Music Technology (Level 3)", "type": 1 }, { "_id": 414, "name": "Course: BTEC Extended Diploma in Photography (Level 3)", "type": 1 }, { "_id": 415, "name": "Course: Diploma in Body Repair and Paint Refinishing (Level 3)", "type": 1 }, { "_id": 416, "name": "Course: Diploma in Brickwork (Level 3)", "type": 1 }, { "_id": 417, "name": "Course: Diploma in Carpentry (Level 3)", "type": 1 }, { "_id": 418, "name": "Course: Diploma in Light Vehicle Maintenance and Repair (Level 3)", "type": 1 }, { "_id": 419, "name": "Course: Diploma in Motorsport (Level 3)", "type": 1 }, { "_id": 420, "name": "Course: Diploma of Business Administration", "type": 1 }, { "_id": 421, "name": "Cuisine Diploma", "type": 1 }, { "_id": 422, "name": "Culinary Arts Diploma", "type": 1 }, { "_id": 423, "name": "Diploma & Advanced Diploma of ESI UET50212 & UET60212", "type": 1 }, { "_id": 424, "name": "Diploma / Certificate in Hotel Management & Catering Technology", "type": 1 }, { "_id": 425, "name": "Diploma 3D Modeling Animation & Design", "type": 1 }, { "_id": 426, "name": "Diploma Accounting and Payroll Administrator", "type": 1 }, { "_id": 427, "name": "Diploma Basic Early Childhood Education", "type": 1 }, { "_id": 428, "name": "Diploma Business Accounting Technician", "type": 1 }, { "_id": 429, "name": "Diploma Business Administration", "type": 1 }, { "_id": 430, "name": "Diploma Business Administration - Management", "type": 1 }, { "_id": 431, "name": "Diploma Business Administrative Professional", "type": 1 }, { "_id": 432, "name": "Diploma Computer Business Application Specialist", "type": 1 }, { "_id": 433, "name": "Diploma Computer Business Application Specialist - Accounting", "type": 1 }, { "_id": 434, "name": "Diploma Course - Chartering", "type": 1 }, { "_id": 435, "name": "Diploma Courses in Tourism Management", "type": 1 }, { "_id": 436, "name": "Diploma Early Childhood Education", "type": 1 }, { "_id": 437, "name": "Diploma Early Childhood Education – JEE.13", "type": 1 }, { "_id": 438, "name": "Diploma Event Coordinator & Management", "type": 1 }, { "_id": 439, "name": "Diploma Financial Management - LEA.AC", "type": 1 }, { "_id": 440, "name": "Diploma Graphic Design - NTA.1U", "type": 1 }, { "_id": 441, "name": "Diploma HE in Theology", "type": 1 }, { "_id": 442, "name": "Diploma HE in Theology & Counselling", "type": 1 }, { "_id": 443, "name": "Diploma HE in Theology & Worship", "type": 1 }, { "_id": 444, "name": "Diploma HE in Theology, Music & Worship", "type": 1 }, { "_id": 445, "name": "Diploma Help Desk Analyst", "type": 1 }, { "_id": 446, "name": "Diploma IED in Creative Advertising and Branding", "type": 1 }, { "_id": 447, "name": "Diploma IED in Image, Style Design and Fashion Communication", "type": 1 }, { "_id": 448, "name": "Diploma in 3D for VFX", "type": 1 }, { "_id": 449, "name": "Diploma in 3D Modeling Animation & Design", "type": 1 }, { "_id": 450, "name": "Diploma In Accountancy", "type": 1 }, { "_id": 451, "name": "Diploma in Accounting", "type": 1 }, { "_id": 452, "name": "Diploma in Accounting (DACC)", "type": 1 }, { "_id": 453, "name": "Diploma in Accounting and Finance", "type": 1 }, { "_id": 454, "name": "Diploma in Accounting and Management Technology", "type": 1 }, { "_id": 455, "name": "Diploma in Accounting and Payroll Administration", "type": 1 }, { "_id": 456, "name": "Diploma in Accounting Assistant / Bookkeeper", "type": 1 }, { "_id": 457, "name": "Diploma in Accounting including Certificate 4 in Accounting", "type": 1 }, { "_id": 458, "name": "Diploma in Adventure Recreation and Parks Technician – CO-OP", "type": 1 }, { "_id": 459, "name": "Diploma in Adventure Tourism", "type": 1 }, { "_id": 460, "name": "Diploma in Advertising and Graphic Design", "type": 1 }, { "_id": 461, "name": "Diploma in Aircraft Structural Repair Technician", "type": 1 }, { "_id": 462, "name": "Diploma in Applied Management (Procurement & Supply Chain Management Stream - Level 7)", "type": 1 }, { "_id": 463, "name": "Diploma in Applied Management (Professional Retailing Stream - Level 7)", "type": 1 }, { "_id": 464, "name": "Diploma in Applied Management (Project Management Stream – Level 7)", "type": 1 }, { "_id": 465, "name": "Diploma in Applied Project Management", "type": 1 }, { "_id": 466, "name": "Diploma In Auditing Of Projects (in Person)", "type": 1 }, { "_id": 467, "name": "Diploma In Auditing Project (virtual)", "type": 1 }, { "_id": 468, "name": "Diploma in Banking and Finance", "type": 1 }, { "_id": 469, "name": "Diploma in Barbering", "type": 1 }, { "_id": 470, "name": "Diploma in Basic English Grammar", "type": 1 }, { "_id": 471, "name": "Diploma In Bio-Agritech", "type": 1 }, { "_id": 472, "name": "Diploma in Business", "type": 1 }, { "_id": 473, "name": "Diploma in Business - Accounting", "type": 1 }, { "_id": 474, "name": "Diploma in Business (Full-Time)", "type": 1 }, { "_id": 475, "name": "Diploma in Business (Part-Time)", "type": 1 }, { "_id": 476, "name": "Diploma in Business Accounting Level 7", "type": 1 }, { "_id": 477, "name": "Diploma in Business Administration", "type": 1 }, { "_id": 478, "name": "Diploma in Business Administration DBA - Leading to a Bachelor Degree", "type": 1 }, { "_id": 479, "name": "Diploma in Business Administration Management w/ Co-op", "type": 1 }, { "_id": 480, "name": "Diploma in Business Administration Sales and Digital Marketing", "type": 1 }, { "_id": 481, "name": "Diploma in Business Communications", "type": 1 }, { "_id": 482, "name": "Diploma in Business Internship", "type": 1 }, { "_id": 483, "name": "Diploma in Business Level 7", "type": 1 }, { "_id": 484, "name": "Diploma in Business Management", "type": 1 }, { "_id": 485, "name": "Diploma in Business Management (Awarded by Management Development Institute of Singapore)", "type": 1 }, { "_id": 486, "name": "Diploma in Business Management (Part-Time)", "type": 1 }, { "_id": 487, "name": "Diploma in Business Management and Entrepreneurship", "type": 1 }, { "_id": 488, "name": "Diploma in Business Management, NZIM Level 5", "type": 1 }, { "_id": 489, "name": "Diploma in Business Management, NZIM Level 6", "type": 1 }, { "_id": 490, "name": "Diploma in Business Mathematics", "type": 1 }, { "_id": 491, "name": "Diploma in Business Organisations", "type": 1 }, { "_id": 492, "name": "Diploma in Business Studies", "type": 1 }, { "_id": 493, "name": "Diploma in Business Studies [+]", "type": 1 }, { "_id": 494, "name": "Diploma in Business-Accounting", "type": 1 }, { "_id": 495, "name": "Diploma in Child and Youth Services Worker", "type": 1 }, { "_id": 496, "name": "Diploma in Community Services Worker", "type": 1 }, { "_id": 497, "name": "Diploma in Comprehensive Facial & Makeup", "type": 1 }, { "_id": 498, "name": "Diploma in Computer Application", "type": 1 }, { "_id": 499, "name": "Diploma in Computer Programmer", "type": 1 }, { "_id": 500, "name": "Diploma in Computer Science", "type": 1 }, { "_id": 501, "name": "Diploma in Computer Science - Administrative Data Processing", "type": 1 }, { "_id": 502, "name": "Diploma in Computer Science - Network Management", "type": 1 }, { "_id": 503, "name": "Diploma in Computer Science [+]", "type": 1 }, { "_id": 504, "name": "Diploma in Computer Support Technician", "type": 1 }, { "_id": 505, "name": "Diploma in Construction Engineering", "type": 1 }, { "_id": 506, "name": "Diploma in Construction Management", "type": 1 }, { "_id": 507, "name": "Diploma in Cosmetology", "type": 1 }, { "_id": 508, "name": "Diploma in Creative Advertising", "type": 1 }, { "_id": 509, "name": "Diploma in Creative Arts: Art and Design Profile", "type": 1 }, { "_id": 510, "name": "Diploma in Criminal Justice", "type": 1 }, { "_id": 511, "name": "Diploma in Culinary Arts", "type": 1 }, { "_id": 512, "name": "Diploma in Culinary Management", "type": 1 }, { "_id": 513, "name": "Diploma in Dance Teaching - Children and Young People (QCF Level 6)", "type": 1 }, { "_id": 514, "name": "Diploma In Digital And Social Media Marketing", "type": 1 }, { "_id": 515, "name": "Diploma in Digital Art", "type": 1 }, { "_id": 516, "name": "Diploma in Digital Communication, Journalism & PR", "type": 1 }, { "_id": 517, "name": "Diploma in Digital Creativity", "type": 1 }, { "_id": 518, "name": "Diploma in Digital Film Production", "type": 1 }, { "_id": 519, "name": "Diploma in Digital Filmmaking", "type": 1 }, { "_id": 520, "name": "Diploma in Digital Marketing", "type": 1 }, { "_id": 521, "name": "Diploma in Digital Marketing (Full-Time)", "type": 1 }, { "_id": 522, "name": "Diploma in Digital Marketing (Part-Time)", "type": 1 }, { "_id": 523, "name": "Diploma in Drilling Engineering Technology", "type": 1 }, { "_id": 524, "name": "Diploma in Early Childhood Education", "type": 1 }, { "_id": 525, "name": "Diploma in Early Childhood Education (Pasifika) (Level 5)", "type": 1 }, { "_id": 526, "name": "Diploma in Early Childhood Education and Care (includes Certificate 3)", "type": 1 }, { "_id": 527, "name": "Diploma in eBusiness", "type": 1 }, { "_id": 528, "name": "Diploma in Economics", "type": 1 }, { "_id": 529, "name": "Diploma in Electrical Engineering Technician – Power Generation", "type": 1 }, { "_id": 530, "name": "Diploma in Electrical Engineering Technician – Process Automation and Trades", "type": 1 }, { "_id": 531, "name": "Diploma in Electrolysis", "type": 1 }, { "_id": 532, "name": "Diploma in Electrolysis & Laser Technician", "type": 1 }, { "_id": 533, "name": "Diploma in Engineering - Civil Engineering", "type": 1 }, { "_id": 534, "name": "Diploma in Engineering (Awarded by Management Development Institute of Singapore)", "type": 1 }, { "_id": 535, "name": "Diploma in English", "type": 1 }, { "_id": 536, "name": "Diploma in Environmental Management (Level 6)", "type": 1 }, { "_id": 537, "name": "Diploma in Esthetics", "type": 1 }, { "_id": 538, "name": "Diploma in Event Management", "type": 1 }, { "_id": 539, "name": "Diploma in Event Management and Innovative Marketing", "type": 1 }, { "_id": 540, "name": "Diploma in Event Planner", "type": 1 }, { "_id": 541, "name": "Diploma in Export Management", "type": 1 }, { "_id": 542, "name": "Diploma in Export-Import", "type": 1 }, { "_id": 543, "name": "Diploma in Fashion design", "type": 1 }, { "_id": 544, "name": "Diploma in Fashion Design & Merchandising", "type": 1 }, { "_id": 545, "name": "Diploma in Fashion Marketing", "type": 1 }, { "_id": 546, "name": "Diploma in Fashion Marketing and Communication (Awarded by Management Development Institute of Singapore)", "type": 1 }, { "_id": 547, "name": "Diploma in Finance", "type": 1 }, { "_id": 548, "name": "Diploma In Finance For Non-financial (face)", "type": 1 }, { "_id": 549, "name": "Diploma In Finance For Non-financial (virtual)", "type": 1 }, { "_id": 550, "name": "Diploma in Finance [+]", "type": 1 }, { "_id": 551, "name": "Diploma in Financial Management (DIFM)", "type": 1 }, { "_id": 552, "name": "Diploma in Fine Art", "type": 1 }, { "_id": 553, "name": "Diploma in Folklore & Heritage of the North West, Ireland", "type": 1 }, { "_id": 554, "name": "Diploma In Food Security", "type": 1 }, { "_id": 555, "name": "Diploma in Food Service Management", "type": 1 }, { "_id": 556, "name": "Diploma in Foundation Studies (Pre-Third Level)", "type": 1 }, { "_id": 557, "name": "Diploma in Full Specialist with Salon Management", "type": 1 }, { "_id": 558, "name": "Diploma in Game Development and Design", "type": 1 }, { "_id": 559, "name": "Diploma in Gaming", "type": 1 }, { "_id": 560, "name": "Diploma in General Arts and Science - Liberal Studies", "type": 1 }, { "_id": 561, "name": "Diploma in General Arts and Science – One-Year", "type": 1 }, { "_id": 562, "name": "Diploma in Graphic and Digital Design", "type": 1 }, { "_id": 563, "name": "Diploma in Graphic Design", "type": 1 }, { "_id": 564, "name": "Diploma In Green Building", "type": 1 }, { "_id": 565, "name": "Diploma In Green Technology Management", "type": 1 }, { "_id": 566, "name": "Diploma In Hospitality & Tourism Management", "type": 1 }, { "_id": 567, "name": "Diploma in Hospitality & Tourism Management at ITH", "type": 1 }, { "_id": 568, "name": "Diploma in Hospitality and Certificate 3 in Commercial Cookery", "type": 1 }, { "_id": 569, "name": "Diploma in Hospitality Business Management", "type": 1 }, { "_id": 570, "name": "Diploma in Hospitality Management", "type": 1 }, { "_id": 571, "name": "Diploma in Hospitality Management 1 year with Co-op", "type": 1 }, { "_id": 572, "name": "Diploma in Hospitality Management 2 year w/ Co-op", "type": 1 }, { "_id": 573, "name": "Diploma in Hospitality Operations", "type": 1 }, { "_id": 574, "name": "Diploma in Hotel Management", "type": 1 }, { "_id": 575, "name": "Diploma in Hotel Management (Level 5)", "type": 1 }, { "_id": 576, "name": "Diploma in Hotel Management Techniques", "type": 1 }, { "_id": 577, "name": "Diploma in Human Resource Management (September Start)", "type": 1 }, { "_id": 578, "name": "Diploma in Human Resources", "type": 1 }, { "_id": 579, "name": "Diploma in Humanitarian Assistance", "type": 1 }, { "_id": 580, "name": "Diploma in Illustration", "type": 1 }, { "_id": 581, "name": "Diploma in Industrial Design", "type": 1 }, { "_id": 582, "name": "Diploma in Information Systems Support Specialist", "type": 1 }, { "_id": 583, "name": "Diploma in Information Technology", "type": 1 }, { "_id": 584, "name": "Diploma in Information Technology (Awarded by Management Development Institute of Singapore)", "type": 1 }, { "_id": 585, "name": "Diploma in Information Technology Networking", "type": 1 }, { "_id": 586, "name": "Diploma in Insurance and Financial Advisory Services", "type": 1 }, { "_id": 587, "name": "Diploma in Interior Design", "type": 1 }, { "_id": 588, "name": "Diploma in International Banking", "type": 1 }, { "_id": 589, "name": "Diploma in International Business", "type": 1 }, { "_id": 590, "name": "Diploma in International Culinary Arts", "type": 1 }, { "_id": 591, "name": "Diploma in International Financial Reporting", "type": 1 }, { "_id": 592, "name": "Diploma in International Hotel Management", "type": 1 }, { "_id": 593, "name": "Diploma in International Marketing", "type": 1 }, { "_id": 594, "name": "Diploma in International Tourism and Hospitality Management", "type": 1 }, { "_id": 595, "name": "Diploma in International Trade", "type": 1 }, { "_id": 596, "name": "Diploma in International Trade Management", "type": 1 }, { "_id": 597, "name": "Diploma in IT", "type": 1 }, { "_id": 598, "name": "Diploma in Law and Ethics", "type": 1 }, { "_id": 599, "name": "Diploma in Law Clerk with Internship", "type": 1 }, { "_id": 600, "name": "Diploma in Legal Administration", "type": 1 }, { "_id": 601, "name": "Diploma in Legal Administrative Assistant - LCE.3V", "type": 1 }, { "_id": 602, "name": "Diploma in Logistics & Supply Chain Management", "type": 1 }, { "_id": 603, "name": "Diploma in Makeup Artist & Skin Care", "type": 1 }, { "_id": 604, "name": "Diploma in Management", "type": 1 }, { "_id": 605, "name": "Diploma In Management And Auditing Of Occupational Health (face)", "type": 1 }, { "_id": 606, "name": "Diploma In Management And Auditing Of Occupational Health (virtual)", "type": 1 }, { "_id": 607, "name": "Diploma In Management Of Integrated HSEQ Management Systems (face)", "type": 1 }, { "_id": 608, "name": "Diploma In Management Of Integrated HSEQ Management Systems (virtual)", "type": 1 }, { "_id": 609, "name": "Diploma in Management Studies", "type": 1 }, { "_id": 610, "name": "Diploma in Marine Insurance", "type": 1 }, { "_id": 611, "name": "Diploma in Marine Studies (Level 6)", "type": 1 }, { "_id": 612, "name": "Diploma in Marketing", "type": 1 }, { "_id": 613, "name": "Diploma in Marketing Management", "type": 1 }, { "_id": 614, "name": "Diploma in Marketing Management (Full-Time)", "type": 1 }, { "_id": 615, "name": "Diploma in Marketing Management (Part-Time)", "type": 1 }, { "_id": 616, "name": "Diploma in Mass Communication & Journalism", "type": 1 }, { "_id": 617, "name": "Diploma in Mass Communications (Awarded by MDIS and Validated by Oklahoma City University, USA)", "type": 1 }, { "_id": 618, "name": "Diploma in Massage Therapy", "type": 1 }, { "_id": 619, "name": "Diploma in Mechanical Engineering Technician - Manufacturing", "type": 1 }, { "_id": 620, "name": "Diploma in Medical Esthetician", "type": 1 }, { "_id": 621, "name": "Diploma in Mobile App Development", "type": 1 }, { "_id": 622, "name": "Diploma In Mobile Communication", "type": 1 }, { "_id": 623, "name": "Diploma in Music", "type": 1 }, { "_id": 624, "name": "Diploma in Network and Database Management", "type": 1 }, { "_id": 625, "name": "Diploma in Network and Internet Security Specialist - LEA.AE", "type": 1 }, { "_id": 626, "name": "Diploma in Network Database Administrator", "type": 1 }, { "_id": 627, "name": "Diploma in Network Systems Management", "type": 1 }, { "_id": 628, "name": "Diploma in Office Administration - Accelerated", "type": 1 }, { "_id": 629, "name": "Diploma in Office Administrator - Executive", "type": 1 }, { "_id": 630, "name": "Diploma in Office Assistant", "type": 1 }, { "_id": 631, "name": "Diploma in Outdoor Leadership and Management", "type": 1 }, { "_id": 632, "name": "Diploma in Paralegal - JCA. 1F", "type": 1 }, { "_id": 633, "name": "Diploma in Paralegal Studies", "type": 1 }, { "_id": 634, "name": "Diploma in Payroll and Income Tax Practitioner", "type": 1 }, { "_id": 635, "name": "Diploma in Professional Cooking", "type": 1 }, { "_id": 636, "name": "Diploma in Professional Curtain Making and Soft Furnishings (AIM Awards)", "type": 1 }, { "_id": 637, "name": "Diploma in Professional Garden Design (AIM Awards)", "type": 1 }, { "_id": 638, "name": "Diploma in Professional Interior Design (AIM Awards)", "type": 1 }, { "_id": 639, "name": "Diploma in Professional Patisserie", "type": 1 }, { "_id": 640, "name": "Diploma in Programmer Analyst / Internet Solutions Developer – LEA.9C", "type": 1 }, { "_id": 641, "name": "Diploma in Project Management", "type": 1 }, { "_id": 642, "name": "Diploma In Project Management (in Person)", "type": 1 }, { "_id": 643, "name": "Diploma In Project Management (virtual)", "type": 1 }, { "_id": 644, "name": "Diploma in Property and Causalty Insurance - LAC.BF", "type": 1 }, { "_id": 645, "name": "Diploma in Psychology (Awarded by Management Development Institute of Singapore)", "type": 1 }, { "_id": 646, "name": "Diploma in Sales and Marketing", "type": 1 }, { "_id": 647, "name": "Diploma in Sales and Marketing Management (Full-Time)", "type": 1 }, { "_id": 648, "name": "Diploma in Sales and Marketing Management (Part-Time)", "type": 1 }, { "_id": 649, "name": "Diploma in Ship Agency & Communication", "type": 1 }, { "_id": 650, "name": "Diploma in Social Services Worker Recovery Specialist", "type": 1 }, { "_id": 651, "name": "Diploma in Social Services Worker Youth Specialist", "type": 1 }, { "_id": 652, "name": "Diploma in Spa Therapy", "type": 1 }, { "_id": 653, "name": "Diploma in Special Care Counselling", "type": 1 }, { "_id": 654, "name": "Diploma in Sustainable Business", "type": 1 }, { "_id": 655, "name": "Diploma In Talent Management", "type": 1 }, { "_id": 656, "name": "Diploma in TESOL, UK", "type": 1 }, { "_id": 657, "name": "Diploma in Textile and Fashion Design", "type": 1 }, { "_id": 658, "name": "Diploma in Tourism Management (Level 5)", "type": 1 }, { "_id": 659, "name": "Diploma in Tourism Techniques", "type": 1 }, { "_id": 660, "name": "Diploma in Travel, Tourism and Hospitality Management (Awarded by Management Development Institute of Singapore)", "type": 1 }, { "_id": 661, "name": "Diploma in VFX", "type": 1 }, { "_id": 662, "name": "Diploma in Video Game Art", "type": 1 }, { "_id": 663, "name": "Diploma in Visual Communication Multimedia", "type": 1 }, { "_id": 664, "name": "Diploma in Visual Graphic Design", "type": 1 }, { "_id": 665, "name": "Diploma in Viticulture and English package", "type": 1 }, { "_id": 666, "name": "Diploma in Warehousing & Logistics", "type": 1 }, { "_id": 667, "name": "Diploma in Web & Graphics", "type": 1 }, { "_id": 668, "name": "Diploma in Web Design", "type": 1 }, { "_id": 669, "name": "Diploma in Wedding Planning", "type": 1 }, { "_id": 670, "name": "Diploma in Wine, Gastronomy and Management", "type": 1 }, { "_id": 671, "name": "Diploma Interior Design", "type": 1 }, { "_id": 672, "name": "Diploma Leadership and Management", "type": 1 }, { "_id": 673, "name": "Diploma Management Consulting", "type": 1 }, { "_id": 674, "name": "Diploma Medical Office Administration", "type": 1 }, { "_id": 675, "name": "Diploma Network Administrator", "type": 1 }, { "_id": 676, "name": "Diploma Network and Database Administrator", "type": 1 }, { "_id": 677, "name": "Diploma Network and Internet Security Specialist program", "type": 1 }, { "_id": 678, "name": "Diploma Network Systems Administrator", "type": 1 }, { "_id": 679, "name": "Diploma Network Systems Engineer", "type": 1 }, { "_id": 680, "name": "Diploma of Accountancy", "type": 1 }, { "_id": 681, "name": "Diploma of Accounting", "type": 1 }, { "_id": 682, "name": "Diploma of Agriculture", "type": 1 }, { "_id": 683, "name": "Diploma of Applied Fashion Design and Technology", "type": 1 }, { "_id": 684, "name": "Diploma of Aquaculture", "type": 1 }, { "_id": 685, "name": "Diploma of Audiovisual Technology", "type": 1 }, { "_id": 686, "name": "Diploma of Automotive Technology", "type": 1 }, { "_id": 687, "name": "Diploma of Aviation - Commercial Pilot Licence", "type": 1 }, { "_id": 688, "name": "Diploma of Aviation - Instrument Rating", "type": 1 }, { "_id": 689, "name": "Diploma of Beauty Therapy", "type": 1 }, { "_id": 690, "name": "Diploma of Beauty Therapy - Spa Therapies", "type": 1 }, { "_id": 691, "name": "Diploma of Beauty Therapy and English package", "type": 1 }, { "_id": 692, "name": "Diploma of Building & Construction - Building", "type": 1 }, { "_id": 693, "name": "Diploma of Building and Construction (Building)", "type": 1 }, { "_id": 694, "name": "Diploma of Building Design", "type": 1 }, { "_id": 695, "name": "Diploma of Building Design and English package", "type": 1 }, { "_id": 696, "name": "Diploma of Business", "type": 1 }, { "_id": 697, "name": "Diploma of Business Administration", "type": 1 }, { "_id": 698, "name": "Diploma of Civil Construction Design", "type": 1 }, { "_id": 699, "name": "Diploma of Commerce", "type": 1 }, { "_id": 700, "name": "Diploma of Community Services and English package", "type": 1 }, { "_id": 701, "name": "Diploma of Community Services Work", "type": 1 }, { "_id": 702, "name": "Diploma of Computing and IT", "type": 1 }, { "_id": 703, "name": "Diploma of Conservation and Land Management", "type": 1 }, { "_id": 704, "name": "Diploma of Creative Industries", "type": 1 }, { "_id": 705, "name": "Diploma of Digital and Interactive Games", "type": 1 }, { "_id": 706, "name": "Diploma of Digital Media Technologies", "type": 1 }, { "_id": 707, "name": "Diploma of Early Childhood Education and Care", "type": 1 }, { "_id": 708, "name": "Diploma of Electronics and Communications Engineering", "type": 1 }, { "_id": 709, "name": "Diploma of Engineering", "type": 1 }, { "_id": 710, "name": "Diploma of Engineering - Technical", "type": 1 }, { "_id": 711, "name": "Diploma of Engineering Technology - Civil", "type": 1 }, { "_id": 712, "name": "Diploma of Engineering Technology – Security Engineering (Locksmithing)", "type": 1 }, { "_id": 713, "name": "Diploma of Environmental Monitoring & Technology", "type": 1 }, { "_id": 714, "name": "Diploma of Events", "type": 1 }, { "_id": 715, "name": "Diploma of Fashion Design", "type": 1 }, { "_id": 716, "name": "Diploma of Graphic Design", "type": 1 }, { "_id": 717, "name": "Diploma of Higher Education in Business", "type": 1 }, { "_id": 718, "name": "Diploma of Higher Education in Combined Professional Studies", "type": 1 }, { "_id": 719, "name": "Diploma of Higher Education in Combined Social Sciences", "type": 1 }, { "_id": 720, "name": "Diploma of Higher Education in Computing & IT and a second subject", "type": 1 }, { "_id": 721, "name": "Diploma of Higher Education in Computing and IT", "type": 1 }, { "_id": 722, "name": "Diploma of Higher Education in Computing and IT Practice", "type": 1 }, { "_id": 723, "name": "Diploma of Higher Education in Counselling", "type": 1 }, { "_id": 724, "name": "Diploma of Higher Education in Criminology and Psychological Studies", "type": 1 }, { "_id": 725, "name": "Diploma of Higher Education in Engineering", "type": 1 }, { "_id": 726, "name": "Diploma of Higher Education in Environmental Management and Technology", "type": 1 }, { "_id": 727, "name": "Diploma of Higher Education in Environmental Studies", "type": 1 }, { "_id": 728, "name": "Diploma of Higher Education in Humanities", "type": 1 }, { "_id": 729, "name": "Diploma of Higher Education in Language Studies", "type": 1 }, { "_id": 730, "name": "Diploma of Higher Education in Leadership and Management", "type": 1 }, { "_id": 731, "name": "Diploma of Higher Education in Mathematical Sciences", "type": 1 }, { "_id": 732, "name": "Diploma of Higher Education in Natural Sciences", "type": 1 }, { "_id": 733, "name": "Diploma of Higher Education in Primary Teaching and Learning", "type": 1 }, { "_id": 734, "name": "Diploma of Higher Education in Psychology", "type": 1 }, { "_id": 735, "name": "Diploma of Higher Education in Retail Management", "type": 1 }, { "_id": 736, "name": "Diploma of Higher Education in Social Policy and Criminology", "type": 1 }, { "_id": 737, "name": "Diploma of Higher Education in Sport and Fitness", "type": 1 }, { "_id": 738, "name": "Diploma of Higher Education in Working with Young People", "type": 1 }, { "_id": 739, "name": "Diploma of Higher Education Open", "type": 1 }, { "_id": 740, "name": "Diploma of Hospitality", "type": 1 }, { "_id": 741, "name": "Diploma of Human Resources Management", "type": 1 }, { "_id": 742, "name": "Diploma of Information Technology", "type": 1 }, { "_id": 743, "name": "Diploma of Information Technology (Networking) and English package", "type": 1 }, { "_id": 744, "name": "Diploma of Information Technology Networking", "type": 1 }, { "_id": 745, "name": "Diploma of Interactive Digital Media", "type": 1 }, { "_id": 746, "name": "Diploma of Interior Design and Decoration", "type": 1 }, { "_id": 747, "name": "Diploma of Interior Design and Decoration (Accelerated)", "type": 1 }, { "_id": 748, "name": "Diploma of International Business", "type": 1 }, { "_id": 749, "name": "Diploma of Interpreting", "type": 1 }, { "_id": 750, "name": "Diploma of Japanese Studies", "type": 1 }, { "_id": 751, "name": "Diploma of Laboratory Technology (Biotechnology)", "type": 1 }, { "_id": 752, "name": "Diploma of Landscape Design", "type": 1 }, { "_id": 753, "name": "Diploma of Leadership and Management", "type": 1 }, { "_id": 754, "name": "Diploma of Management", "type": 1 }, { "_id": 755, "name": "Diploma of Maritime Operations (Engineer Watch keeper)", "type": 1 }, { "_id": 756, "name": "Diploma of Marketing", "type": 1 }, { "_id": 757, "name": "Diploma of Mass Communication", "type": 1 }, { "_id": 758, "name": "Diploma of Network Technology (Higher Education)", "type": 1 }, { "_id": 759, "name": "Diploma of Photo Imaging", "type": 1 }, { "_id": 760, "name": "Diploma of Process Plant Technology", "type": 1 }, { "_id": 761, "name": "Diploma of Product Design", "type": 1 }, { "_id": 762, "name": "Diploma of Professional Counselling (Level 6)", "type": 1 }, { "_id": 763, "name": "Diploma of Programming - Applications (Higher Education)", "type": 1 }, { "_id": 764, "name": "Diploma of Remedial Massage", "type": 1 }, { "_id": 765, "name": "Diploma of Screen and Media", "type": 1 }, { "_id": 766, "name": "Diploma of Screen and Media (CUF50107)", "type": 1 }, { "_id": 767, "name": "Diploma of Software Development", "type": 1 }, { "_id": 768, "name": "Diploma of Sound Production", "type": 1 }, { "_id": 769, "name": "Diploma of Surveying", "type": 1 }, { "_id": 770, "name": "Diploma of Textile Design and Development", "type": 1 }, { "_id": 771, "name": "Diploma of Tourism", "type": 1 }, { "_id": 772, "name": "Diploma of Tourism & Travel", "type": 1 }, { "_id": 773, "name": "Diploma of Visual Art", "type": 1 }, { "_id": 774, "name": "Diploma of Visual Arts", "type": 1 }, { "_id": 775, "name": "Diploma of Visual Merchandising", "type": 1 }, { "_id": 776, "name": "Diploma Oil & Gas Administration", "type": 1 }, { "_id": 777, "name": "Diploma Programmer Analyst/Internet Solutions Developer", "type": 1 }, { "_id": 778, "name": "Diploma Travel and Tourism", "type": 1 }, { "_id": 779, "name": "Diploma/Advanced Diploma of Business", "type": 1 }, { "_id": 780, "name": "Dual Diploma Hotel and Food & Beverage Management + Paid Co-op", "type": 1 }, { "_id": 781, "name": "Dual Diploma of Aviation (CPL + MEAIR)", "type": 1 }, { "_id": 782, "name": "Electronic Music Production & Performance Diploma", "type": 1 }, { "_id": 783, "name": "Elementary Education Major & Teacher Education Program", "type": 1 }, { "_id": 784, "name": "Engineering Foundation programme", "type": 1 }, { "_id": 785, "name": "Event Planner Diploma", "type": 1 }, { "_id": 786, "name": "Executive Diploma DAS in ICT or Utility Management", "type": 1 }, { "_id": 787, "name": "Executive Diploma in International Hotel & Tourism Management", "type": 1 }, { "_id": 788, "name": "Executive Diploma in Shipping, London Centre of Management", "type": 1 }, { "_id": 789, "name": "Extended Diploma (Certificate 4) in Aeronautical Engineering", "type": 1 }, { "_id": 790, "name": "Extended Diploma (Certificate 4) in Business", "type": 1 }, { "_id": 791, "name": "Extended Diploma in Business", "type": 1 }, { "_id": 792, "name": "Extended Diploma in Management EQF Level 5", "type": 1 }, { "_id": 793, "name": "Fashion Design Diploma", "type": 1 }, { "_id": 794, "name": "Fashion Marketing Diploma", "type": 1 }, { "_id": 795, "name": "Film & Television Diploma", "type": 1 }, { "_id": 796, "name": "First Diploma (Certificate 3) in Business", "type": 1 }, { "_id": 797, "name": "First Diploma (Certificate 3) in Engineering", "type": 1 }, { "_id": 798, "name": "Flight Attendant Preparation Diploma", "type": 1 }, { "_id": 799, "name": "FNS50210 Diploma of Accounting (S718) [+]", "type": 1 }, { "_id": 800, "name": "Food Technology, Safety and Quality Diploma", "type": 1 }, { "_id": 801, "name": "Foundation Diploma for International Students", "type": 1 }, { "_id": 802, "name": "Foundation Diploma in Art and Design (UAL)", "type": 1 }, { "_id": 803, "name": "French Cuisine Diploma Program", "type": 1 }, { "_id": 804, "name": "German Diploma Courses", "type": 1 }, { "_id": 805, "name": "Graduate Diploma in Information Technology Level 7", "type": 1 }, { "_id": 806, "name": "Grand Diplôme - Cuisine and Pastry Diploma", "type": 1 }, { "_id": 807, "name": "Higher Diploma in Architectural Design", "type": 1 }, { "_id": 808, "name": "Higher Diploma in Business", "type": 1 }, { "_id": 809, "name": "Higher Diploma in Fashion Branding and Buying", "type": 1 }, { "_id": 810, "name": "Higher Diploma in Hospitality Management", "type": 1 }, { "_id": 811, "name": "Higher Diploma in International Culinary Arts", "type": 1 }, { "_id": 812, "name": "Higher Diploma in Product, Interior and Exhibition Design (Subject Group)", "type": 1 }, { "_id": 813, "name": "Higher Diploma in Supply Chain Management", "type": 1 }, { "_id": 814, "name": "Higher Diploma in Visual Arts and Culture", "type": 1 }, { "_id": 815, "name": "Higher Diploma in Visual Communication", "type": 1 }, { "_id": 816, "name": "Higher National Diploma (HND) Electrical & Electronic Engineering", "type": 1 }, { "_id": 817, "name": "Higher National Diploma (HND) in Mechanical Engineering", "type": 1 }, { "_id": 818, "name": "Hospitality and Flight Attendant Preparation Program", "type": 1 }, { "_id": 819, "name": "Hospitality Management & Co-op Diploma", "type": 1 }, { "_id": 820, "name": "Hospitality Management Program", "type": 1 }, { "_id": 821, "name": "Hotel Management Diploma", "type": 1 }, { "_id": 822, "name": "Human Resources Professional Diploma Program", "type": 1 }, { "_id": 823, "name": "IATA TRAVEL & TOURISM Diploma", "type": 1 }, { "_id": 824, "name": "ICI\'s Undergraduate programmes are validated by Oxford Brookes University, UK. [+]", "type": 1 }, { "_id": 825, "name": "ICM Diploma Business Studies", "type": 1 }, { "_id": 826, "name": "Illustration for Sequential Arts: Comic Books & Graphic Novels Diploma", "type": 1 }, { "_id": 827, "name": "Intensive Cordon Bleu Diploma", "type": 1 }, { "_id": 828, "name": "Interactive Design Institute Foundation Diploma in Art, Design and Media", "type": 1 }, { "_id": 829, "name": "Interior Design Diploma", "type": 1 }, { "_id": 830, "name": "International Business Diploma Program", "type": 1 }, { "_id": 831, "name": "International Diploma in Business - Online", "type": 1 }, { "_id": 832, "name": "International Diploma in Business Administration– Online", "type": 1 }, { "_id": 833, "name": "International Diploma in Business Computing", "type": 1 }, { "_id": 834, "name": "International Diploma in Business Management & Administration", "type": 1 }, { "_id": 835, "name": "International Diploma in Software Development", "type": 1 }, { "_id": 836, "name": "International Diploma in Web Design", "type": 1 }, { "_id": 837, "name": "International Trade & Co-op Diploma", "type": 1 }, { "_id": 838, "name": "International Trade Diploma Program", "type": 1 }, { "_id": 839, "name": "IT - Information Technology & Co-op Diploma", "type": 1 }, { "_id": 840, "name": "Justice Studies Diploma – Correctional Studies", "type": 1 }, { "_id": 841, "name": "Justice Studies Diploma – Law Enforcement", "type": 1 }, { "_id": 842, "name": "Justice Studies Diploma – Youth Justice", "type": 1 }, { "_id": 843, "name": "Level 3 - 4 - Diploma in International Tourism and Hospitality", "type": 1 }, { "_id": 844, "name": "Level 3 Extended Diploma in Computer Science", "type": 1 }, { "_id": 845, "name": "Level 3 Extended Diploma in Electrical Engineering", "type": 1 }, { "_id": 846, "name": "Level 3 Extended Diploma in Mechanical Engineering", "type": 1 }, { "_id": 847, "name": "Level 4 Diploma in Hospitality Management", "type": 1 }, { "_id": 848, "name": "Level 4 Diploma in Tourism Management", "type": 1 }, { "_id": 849, "name": "Level 4/5 Diploma in Hotel and Hospitality", "type": 1 }, { "_id": 850, "name": "Level 4/5 Diploma in IT and Computing", "type": 1 }, { "_id": 851, "name": "Level 4/5 Extended Diploma in Management", "type": 1 }, { "_id": 852, "name": "Level 5 Diploma in Hospitality Management", "type": 1 }, { "_id": 853, "name": "Level 5 Diploma in Hospitality Management including internship", "type": 1 }, { "_id": 854, "name": "Level 5 Diploma in Teaching English (Literacy & ESOL) CPD part-time", "type": 1 }, { "_id": 855, "name": "Level 5 Diploma in Teaching Learners with Additional Needs CPD", "type": 1 }, { "_id": 856, "name": "Level 5 Diploma in Teaching Mathematics (Numeracy) CPD part-time", "type": 1 }, { "_id": 857, "name": "Level 5 Diploma in Tourism Management", "type": 1 }, { "_id": 858, "name": "Level 6 Diploma Business and Administrative Management", "type": 1 }, { "_id": 859, "name": "Level 6 Diploma in Hospitality and Event Management", "type": 1 }, { "_id": 860, "name": "Level 7 Diploma in Strategic Management", "type": 1 }, { "_id": 861, "name": "LSBF’s Executive Education Programmes", "type": 1 }, { "_id": 862, "name": "Marketing Diploma Program", "type": 1 }, { "_id": 863, "name": "Media and Fine Arts Diploma Degree (undergraduate level)", "type": 1 }, { "_id": 864, "name": "Music Business Diploma", "type": 1 }, { "_id": 865, "name": "Music Production & Sound Engineering Diploma", "type": 1 }, { "_id": 866, "name": "National Diploma (Certificate 4) in Aviation Operations with Business", "type": 1 }, { "_id": 867, "name": "National Diploma In Art And Design", "type": 1 }, { "_id": 868, "name": "National Diploma in Hospitality (Operational Management) Level 5", "type": 1 }, { "_id": 869, "name": "Network Systems Engineer Diploma", "type": 1 }, { "_id": 870, "name": "New Zealand Diploma in Architectural Technology (Level 6)", "type": 1 }, { "_id": 871, "name": "New Zealand Diploma in Business (Level 6)", "type": 1 }, { "_id": 872, "name": "New Zealand Diploma in Business, NZDbus Level 6", "type": 1 }, { "_id": 873, "name": "New Zealand Diploma in Construction [Quantity Surveying strand or Construction Management] (Level 6)", "type": 1 }, { "_id": 874, "name": "New Zealand Diploma in Engineering (Mechanical, Electrical, Civil) (Level 6)", "type": 1 }, { "_id": 875, "name": "New Zealand Diploma in Hospitality Management (Level 5)", "type": 1 }, { "_id": 876, "name": "New Zealand Diploma in Tourism and Travel (Level 5)", "type": 1 }, { "_id": 877, "name": "NSIA Diploma in Hospitality Management", "type": 1 }, { "_id": 878, "name": "Office Administration Diploma Program", "type": 1 }, { "_id": 879, "name": "Oil and Gas Administrative Assistant Diploma", "type": 1 }, { "_id": 880, "name": "One Year Professional Diploma in Digital Marketing (Online Program)", "type": 1 }, { "_id": 881, "name": "Online Chartered Diploma in Management & Leadership", "type": 1 }, { "_id": 882, "name": "Online CSI & Criminology Diploma", "type": 1 }, { "_id": 883, "name": "Online Diploma in Retail Operations Management", "type": 1 }, { "_id": 884, "name": "Online Environmental Management Diploma - NEBOSH", "type": 1 }, { "_id": 885, "name": "Online Logistics & Supply Chain Management Subject Diploma", "type": 1 }, { "_id": 886, "name": "Online Procurement & Supply Diploma", "type": 1 }, { "_id": 887, "name": "Online Procurement & Supply Professional Diploma", "type": 1 }, { "_id": 888, "name": "Online Quality Management Diploma", "type": 1 }, { "_id": 889, "name": "Online TESL / TESOL Diploma Program", "type": 1 }, { "_id": 890, "name": "Pastry Diploma", "type": 1 }, { "_id": 891, "name": "Pâtisserie Diploma Program", "type": 1 }, { "_id": 892, "name": "Postgraduate Diploma in Marketing Management", "type": 1 }, { "_id": 893, "name": "Practical Filmmaking Diploma - Berlin", "type": 1 }, { "_id": 894, "name": "Practical Filmmaking Diploma (Dip HE)", "type": 1 }, { "_id": 895, "name": "Production Sound for Film and Television Diploma", "type": 1 }, { "_id": 896, "name": "Professional Culinary Diploma", "type": 1 }, { "_id": 897, "name": "Professional Diploma in Architecture", "type": 1 }, { "_id": 898, "name": "Professional Diploma in Architecture: Advanced Environmental & Energy Studies", "type": 1 }, { "_id": 899, "name": "Professional Diploma in Digital Marketing", "type": 1 }, { "_id": 900, "name": "Professional Diploma in Digital Selling", "type": 1 }, { "_id": 901, "name": "Professional Diploma in Digital Strategy and Planning", "type": 1 }, { "_id": 902, "name": "Professional Diploma in Marriage and Family Therapy", "type": 1 }, { "_id": 903, "name": "Professional Diploma in School Psychology", "type": 1 }, { "_id": 904, "name": "Professional Thai Cuisine Diploma Program", "type": 1 }, { "_id": 905, "name": "Project Management & Co-op Diploma", "type": 1 }, { "_id": 906, "name": "Restaurant Management Programme", "type": 1 }, { "_id": 907, "name": "Social Media Marketing & Co-op Diploma", "type": 1 }, { "_id": 908, "name": "Social Services Worker Recovery Specialist Diploma", "type": 1 }, { "_id": 909, "name": "Social Services Worker Youth Specialist Diploma", "type": 1 }, { "_id": 910, "name": "Specialist Diploma in Business Management", "type": 1 }, { "_id": 911, "name": "Specialist Diploma in Social Media Marketing", "type": 1 }, { "_id": 912, "name": "Specialist Diploma in Software Development", "type": 1 }, { "_id": 913, "name": "Specialist Diploma in Web Development", "type": 1 }, { "_id": 914, "name": "Studio Diploma Program", "type": 1 }, { "_id": 915, "name": "Summer school - Diploma in Tourism Destination Management, Learning from France", "type": 1 }, { "_id": 916, "name": "Superior Culinary Arts Diploma", "type": 1 }, { "_id": 917, "name": "Teaching English as a Second Language Diploma Program", "type": 1 }, { "_id": 918, "name": "The Diploma in Export Management comprises compulsory modules and elective modules [+]", "type": 1 }, { "_id": 919, "name": "This is the only Resources Drilling and Blasting program available in Canada. [+]", "type": 1 }, { "_id": 920, "name": "Travel & Tourism Diploma Program", "type": 1 }, { "_id": 921, "name": "Travel, Tourism and Flight Attendant Preparation Diploma", "type": 1 }, { "_id": 922, "name": "Two-Year Diploma in Hotel and Tourism Management", "type": 1 }, { "_id": 923, "name": "Veterinary Assistant Diploma", "type": 1 }, { "_id": 924, "name": "Web and Mobile Application Development Diploma", "type": 1 }, { "_id": 925, "name": "Wine and Management Programme", "type": 1 }, { "_id": 926, "name": "Doctor of Business Administration", "type": 6 }, { "_id": 927, "name": "Doctor of Canon Law", "type": 6 }, { "_id": 928, "name": "Doctor of Chiropractic", "type": 6 }, { "_id": 929, "name": "Doctor of Commerce", "type": 6 }, { "_id": 930, "name": "Doctor of Dental Surgery", "type": 6 }, { "_id": 931, "name": "Doctor of Divinity", "type": 6 }, { "_id": 932, "name": "Doctor of Education", "type": 6 }, { "_id": 933, "name": "Doctor of Engineering", "type": 6 }, { "_id": 934, "name": "Doctor of Health Administration", "type": 6 }, { "_id": 935, "name": "Doctor of Health Science", "type": 6 }, { "_id": 936, "name": "Doctor of Juridical Science; Juris Doctor", "type": 6 }, { "_id": 937, "name": "Doctor of Law; Legum Doctor", "type": 6 }, { "_id": 938, "name": "Doctor of Liberal Studies", "type": 6 }, { "_id": 939, "name": "Doctor of Management", "type": 6 }, { "_id": 940, "name": "Doctor of Medicine", "type": 6 }, { "_id": 941, "name": "Doctor of Ministry", "type": 6 }, { "_id": 942, "name": "Doctor of Musical Arts", "type": 6 }, { "_id": 943, "name": "Doctor of Naturopathic Medicine", "type": 6 }, { "_id": 944, "name": "Doctor of Optometry", "type": 6 }, { "_id": 945, "name": "Doctor of Osteopathic Medicine", "type": 6 }, { "_id": 946, "name": "Doctor of Pharmacy", "type": 6 }, { "_id": 947, "name": "Doctor of Philosophy", "type": 6 }, { "_id": 948, "name": "Doctor of Public Administration", "type": 6 }, { "_id": 949, "name": "Doctor of Science", "type": 6 }, { "_id": 950, "name": "Doctor of Theology", "type": 6 }, { "_id": 951, "name": "Doctor of Veterinary Medicine", "type": 6 }, { "_id": 952, "name": "Master of Accountancy", "type": 5 }, { "_id": 953, "name": "Master of Advanced Study", "type": 5 }, { "_id": 954, "name": "Master of Applied Finance", "type": 5 }, { "_id": 955, "name": "Master of Applied Mathematical Sciences", "type": 5 }, { "_id": 956, "name": "Master of Applied Science", "type": 5 }, { "_id": 957, "name": "Master of Architecture", "type": 5 }, { "_id": 958, "name": "Master of Arts", "type": 5 }, { "_id": 959, "name": "Master of Arts in Archives and Records Management", "type": 5 }, { "_id": 960, "name": "Master of Arts in Liberal Studies", "type": 5 }, { "_id": 961, "name": "Master of Arts in Strategic Communication Management", "type": 5 }, { "_id": 962, "name": "Master of Arts in Teaching", "type": 5 }, { "_id": 963, "name": "Master of Bioinformatics", "type": 5 }, { "_id": 964, "name": "Master of Biotechnology", "type": 5 }, { "_id": 965, "name": "Master of Business Administration", "type": 5 }, { "_id": 966, "name": "Master of Business Administration Management of Technology", "type": 5 }, { "_id": 967, "name": "Master of Business", "type": 5 }, { "_id": 968, "name": "Master of Business Economics", "type": 5 }, { "_id": 969, "name": "Master of Business Engineering", "type": 5 }, { "_id": 970, "name": "Master of Business Informatics", "type": 5 }, { "_id": 971, "name": "Master of Chemistry", "type": 5 }, { "_id": 972, "name": "Master of City Planning", "type": 5 }, { "_id": 973, "name": "Master of Commerce", "type": 5 }, { "_id": 974, "name": "Master of Computational Finance", "type": 5 }, { "_id": 975, "name": "Master of Computer Applications", "type": 5 }, { "_id": 976, "name": "Master of Computer Science", "type": 5 }, { "_id": 977, "name": "Master of Communication", "type": 5 }, { "_id": 978, "name": "Master of Counseling", "type": 5 }, { "_id": 979, "name": "Master of Criminal Justice", "type": 5 }, { "_id": 980, "name": "Master in Creative Technologies", "type": 5 }, { "_id": 981, "name": "Master of Design", "type": 5 }, { "_id": 982, "name": "Master of Divinity", "type": 5 }, { "_id": 983, "name": "Master of Economics", "type": 5 }, { "_id": 984, "name": "Master of Education", "type": 5 }, { "_id": 985, "name": "Master of Educational Technology", "type": 5 }, { "_id": 986, "name": "Master of Engineering", "type": 5 }, { "_id": 987, "name": "Master of Engineering Management", "type": 5 }, { "_id": 988, "name": "Master of Enterprise", "type": 5 }, { "_id": 989, "name": "Master of European Law", "type": 5 }, { "_id": 990, "name": "Master of Finance", "type": 5 }, { "_id": 991, "name": "Master of Financial Economics", "type": 5 }, { "_id": 992, "name": "Master of Financial Engineering", "type": 5 }, { "_id": 993, "name": "Master of Financial Mathematics", "type": 5 }, { "_id": 994, "name": "Master of Fine Arts", "type": 5 }, { "_id": 995, "name": "Master of Health Administration", "type": 5 }, { "_id": 996, "name": "Master of Health Science", "type": 5 }, { "_id": 997, "name": "Master of Humanities", "type": 5 }, { "_id": 998, "name": "Master of Industrial and Labor Relations", "type": 5 }, { "_id": 999, "name": "Master of International Affairs", "type": 5 }, { "_id": 1000, "name": "Master of International Business", "type": 5 }, { "_id": 1001, "name": "Master of International Economics", "type": 5 }, { "_id": 1002, "name": "Master of International Public Policy", "type": 5 }, { "_id": 1003, "name": "Master of International Studies", "type": 5 }, { "_id": 1004, "name": "Master of Information", "type": 5 }, { "_id": 1005, "name": "Master of Information Management", "type": 5 }, { "_id": 1006, "name": "Master of Information Systems", "type": 5 }, { "_id": 1007, "name": "Master of Information System Management", "type": 5 }, { "_id": 1008, "name": "Master of Islamic Studies", "type": 5 }, { "_id": 1009, "name": "Master of IT", "type": 5 }, { "_id": 1010, "name": "Master of Jurisprudence", "type": 5 }, { "_id": 1011, "name": "Master of Laws", "type": 5 }, { "_id": 1012, "name": "Master of Studies in Law", "type": 5 }, { "_id": 1013, "name": "Master of Landscape Architecture", "type": 5 }, { "_id": 1014, "name": "Master of Letters", "type": 5 }, { "_id": 1015, "name": "Master of Liberal Arts", "type": 5 }, { "_id": 1016, "name": "Master of Library and Information Science", "type": 5 }, { "_id": 1017, "name": "Master of Management", "type": 5 }, { "_id": 1018, "name": "Master of Mass Communication and Journalism", "type": 5 }, { "_id": 1019, "name": "Master of Mathematical Finance", "type": 5 }, { "_id": 1020, "name": "Master of Mathematics", "type": 5 }, { "_id": 1021, "name": "Master of Mathematics and Computer Science", "type": 5 }, { "_id": 1022, "name": "Master of Mathematics and Philosophy", "type": 5 }, { "_id": 1023, "name": "Master of Medical Science", "type": 5 }, { "_id": 1024, "name": "Master of Medicine", "type": 5 }, { "_id": 1025, "name": "Master of Military Art and Science", "type": 5 }, { "_id": 1026, "name": "Master of Music", "type": 5 }, { "_id": 1027, "name": "Master of Network and Communications Management", "type": 5 }, { "_id": 1028, "name": "Master of Occupational Therapy", "type": 5 }, { "_id": 1029, "name": "Master of Pharmacy", "type": 5 }, { "_id": 1030, "name": "Master of Philosophy", "type": 5 }, { "_id": 1031, "name": "Master of Physician Assistant Studies", "type": 5 }, { "_id": 1032, "name": "Master of Physics", "type": 5 }, { "_id": 1033, "name": "Master of Political Science", "type": 5 }, { "_id": 1034, "name": "Master of Professional Studies", "type": 5 }, { "_id": 1035, "name": "Master of Psychology", "type": 5 }, { "_id": 1036, "name": "Master of Public Administration", "type": 5 }, { "_id": 1037, "name": "Master of Public Affairs", "type": 5 }, { "_id": 1038, "name": "Master of Public Diplomacy", "type": 5 }, { "_id": 1039, "name": "Master of Public Health", "type": 5 }, { "_id": 1040, "name": "Master of Public Management", "type": 5 }, { "_id": 1041, "name": "Master of Public Policy", "type": 5 }, { "_id": 1042, "name": "Master of Public Relations", "type": 5 }, { "_id": 1043, "name": "Master of Public Service", "type": 5 }, { "_id": 1044, "name": "Master of Quantitative Finance", "type": 5 }, { "_id": 1045, "name": "Master of Rabbinic Studies", "type": 5 }, { "_id": 1046, "name": "Master of Real Estate Development", "type": 5 }, { "_id": 1047, "name": "Master of Religious Education", "type": 5 }, { "_id": 1048, "name": "Master of Research", "type": 5 }, { "_id": 1049, "name": "Master of Sacred Music", "type": 5 }, { "_id": 1050, "name": "Master of Sacred Theology", "type": 5 }, { "_id": 1051, "name": "Master of Science", "type": 5 }, { "_id": 1052, "name": "Master of Science in Applied Cognition and Neuroscience", "type": 5 }, { "_id": 1053, "name": "Master of Science in Bioinformatics", "type": 5 }, { "_id": 1054, "name": "Master of Science in Clinical Epidemiology", "type": 5 }, { "_id": 1055, "name": "Master of Science in Computing Research", "type": 5 }, { "_id": 1056, "name": "Master of Science in Cyber Security", "type": 5 }, { "_id": 1057, "name": "Master of Science in Education", "type": 5 }, { "_id": 1058, "name": "Master of Science in Engineering", "type": 5 }, { "_id": 1059, "name": "Master of Science in Development Administration", "type": 5 }, { "_id": 1060, "name": "Master of Science in Finance", "type": 5 }, { "_id": 1061, "name": "Master of Science in Governance & Organizational Sciences", "type": 5 }, { "_id": 1062, "name": "Master of Science in Government Contracts", "type": 5 }, { "_id": 1063, "name": "Master of Science in Health Informatics", "type": 5 }, { "_id": 1064, "name": "Master of Science in Human Resource Development", "type": 5 }, { "_id": 1065, "name": "Master of Science in Information Assurance", "type": 5 }, { "_id": 1066, "name": "Master of Science in Information Systems", "type": 5 }, { "_id": 1067, "name": "Master of Science in Information Technology", "type": 5 }, { "_id": 1068, "name": "Master of Science in Leadership", "type": 5 }, { "_id": 1069, "name": "Master of Science in Management", "type": 5 }, { "_id": 1070, "name": "Master of Science in Nursing", "type": 5 }, { "_id": 1071, "name": "Master of Science in Project Management", "type": 5 }, { "_id": 1072, "name": "Master of Science in Quality Assurance", "type": 5 }, { "_id": 1073, "name": "Master of Science in Risk Management", "type": 5 }, { "_id": 1074, "name": "Master of Science in Supply Chain Management", "type": 5 }, { "_id": 1075, "name": "Master of Science in Teaching", "type": 5 }, { "_id": 1076, "name": "Master of Science in Taxation", "type": 5 }, { "_id": 1077, "name": "Master of Social Science", "type": 5 }, { "_id": 1078, "name": "Master of Social Work", "type": 5 }, { "_id": 1079, "name": "Master of Statistics", "type": 5 }, { "_id": 1080, "name": "Master of Strategic Studies", "type": 5 }, { "_id": 1081, "name": "Master of Studies", "type": 5 }, { "_id": 1082, "name": "Master of Surgery", "type": 5 }, { "_id": 1083, "name": "Master of Theological Studies", "type": 5 }, { "_id": 1084, "name": "Master of Technology", "type": 5 }, { "_id": 1085, "name": "Master of Theology", "type": 5 }, { "_id": 1086, "name": "Master of Urban Planning", "type": 5 }, { "_id": 1087, "name": "Master of Veterinary Science", "type": 5 }, { "_id": 1088, "name": "Master of Accountancy (MAcc, MAc, or MAcy)", "type": 5 }, { "_id": 1089, "name": "Master of Advanced Study (M.A.S.)", "type": 5 }, { "_id": 1090, "name": "Master of Economics (M.Econ)", "type": 5 }, { "_id": 1091, "name": "Master of Applied Science (MASc, MAppSc, MApplSc, M.A.Sc. and MAS.)", "type": 5 }, { "_id": 1092, "name": "Master of Architecture (M.Arch.)", "type": 5 }, { "_id": 1093, "name": "Master of Arts (M.A., MA, A.M., or AM)", "type": 5 }, { "_id": 1094, "name": "Master of Arts in Teaching (MAT)", "type": 5 }, { "_id": 1095, "name": "Master of Arts in Liberal Studies (MA, ALM, MLA, MLS or MALS)", "type": 5 }, { "_id": 1096, "name": "Master of Business Administration (MBA or M.B.A.)", "type": 5 }, { "_id": 1097, "name": "Master of Business (MBus)", "type": 5 }, { "_id": 1098, "name": "Master of Business Informatics (MBI)", "type": 5 }, { "_id": 1099, "name": "Master of Chemistry (MChem)", "type": 5 }, { "_id": 1100, "name": "Master of City Planning", "type": 5 }, { "_id": 1101, "name": "Master of Commerce (MCom or MComm)", "type": 5 }, { "_id": 1102, "name": "Master of Computational Finance (or Quantitative Finance)", "type": 5 }, { "_id": 1103, "name": "Master of Computer Applications (MCA)", "type": 5 }, { "_id": 1104, "name": "Master of Criminal Justice (MCJ)", "type": 5 }, { "_id": 1105, "name": "Master in Creative Technologies", "type": 5 }, { "_id": 1106, "name": "Master of Design (MDes, M.Des. or M.Design)", "type": 5 }, { "_id": 1107, "name": "Master of Divinity (M.Div.)", "type": 5 }, { "_id": 1108, "name": "Master of Economics (M.Econ.)", "type": 5 }, { "_id": 1109, "name": "Master of Education (M.Ed., MEd, Ed.M., M.A.Ed., M.S.Ed., M.S.E., or M.Ed.L)", "type": 5 }, { "_id": 1110, "name": "Master of Engineering (M.Eng., ME or MEng)", "type": 5 }, { "_id": 1111, "name": "Master of Engineering Management (MEM)", "type": 5 }, { "_id": 1112, "name": "Master of Enterprise (M.Ent.)", "type": 5 }, { "_id": 1113, "name": "Master of European Law (LL.M. Eur)", "type": 5 }, { "_id": 1114, "name": "Master of Finance (M.Fin.)", "type": 5 }, { "_id": 1115, "name": "Master of Financial Economics", "type": 5 }, { "_id": 1116, "name": "Master of Financial Engineering (Master of Quantitative Finance)", "type": 5 }, { "_id": 1117, "name": "Master of Financial Mathematics (Master of Quantitative Finance)", "type": 5 }, { "_id": 1118, "name": "Master of Fine Arts (MFA, M.F.A.)", "type": 5 }, { "_id": 1119, "name": "Master of Health Administration (MHA)", "type": 5 }, { "_id": 1120, "name": "Master of Health Science (MHS)", "type": 5 }, { "_id": 1121, "name": "Master of Humanities (MH)", "type": 5 }, { "_id": 1122, "name": "Master of Industrial and Labor Relations (MILR)", "type": 5 }, { "_id": 1123, "name": "Master of International Affairs", "type": 5 }, { "_id": 1124, "name": "Master of International Business", "type": 5 }, { "_id": 1125, "name": "Masters in International Economics", "type": 5 }, { "_id": 1126, "name": "Master of International Studies (MIS)", "type": 5 }, { "_id": 1127, "name": "Master of Information System Management (abbreviated M.ISM, MS.IM, M.IS or similar)", "type": 5 }, { "_id": 1128, "name": "Master of IT (abbreviated MSIT, MScIT, M.Sc.IT, MSc.IT or M.Sc IT.)", "type": 5 }, { "_id": 1129, "name": "Master of Jurisprudence (M.J. or M.Jur)", "type": 5 }, { "_id": 1130, "name": "Master of Laws (LL.M. or LLM)", "type": 5 }, { "_id": 1131, "name": "Master of Studies in Law (M.S.L.)", "type": 5 }, { "_id": 1132, "name": "Master of Landscape Architecture (M.Arch.)", "type": 5 }, { "_id": 1133, "name": "Master of Letters (MLitt)", "type": 5 }, { "_id": 1134, "name": "Master of Liberal Arts (MA, ALM, MLA, MLS or MALS)", "type": 5 }, { "_id": 1135, "name": "Master of Library and Information Science (MLIS)", "type": 5 }, { "_id": 1136, "name": "Master of Management (MM)", "type": 5 }, { "_id": 1137, "name": "Master of Mathematical Finance", "type": 5 }, { "_id": 1138, "name": "Master of Mathematics (or MMath)", "type": 5 }, { "_id": 1139, "name": "Master of Medical Science", "type": 5 }, { "_id": 1140, "name": "Master of Music (M.M. or M.Mus.)", "type": 5 }, { "_id": 1141, "name": "Master of Occupational Therapy (OT)", "type": 5 }, { "_id": 1142, "name": "Master of Pharmacy (MPharm or MPharm)", "type": 5 }, { "_id": 1143, "name": "Master of Philosophy (M.Phil.)", "type": 5 }, { "_id": 1144, "name": "Master of Physician Assistant Studies", "type": 5 }, { "_id": 1145, "name": "Master of Physics (MPhys)", "type": 5 }, { "_id": 1146, "name": "Master of Political Science", "type": 5 }, { "_id": 1147, "name": "Master of Professional Studies (MPS or M.P.S.)", "type": 5 }, { "_id": 1148, "name": "Master of Public Administration (MPA)", "type": 5 }, { "_id": 1149, "name": "Master of Public Affairs (M.P.Aff.)", "type": 5 }, { "_id": 1150, "name": "Master of Public Health (M.P.H.)", "type": 5 }, { "_id": 1151, "name": "Master of Public Policy (M.P.P.)", "type": 5 }, { "_id": 1152, "name": "Master of Public Management", "type": 5 }, { "_id": 1153, "name": "Master of Quantitative Finance", "type": 5 }, { "_id": 1154, "name": "Master of Rabbinic Studies (MRb)", "type": 5 }, { "_id": 1155, "name": "Master of Real Estate Development", "type": 5 }, { "_id": 1156, "name": "Master of Religious Education", "type": 5 }, { "_id": 1157, "name": "Master of Research - MSc(R)", "type": 5 }, { "_id": 1158, "name": "Master of Sacred Music (MSM)", "type": 5 }, { "_id": 1159, "name": "Master of Sacred Theology (S.T.M.)", "type": 5 }, { "_id": 1160, "name": "Master of Science (M.Sc., MSc, M.Sci., M.Si., Sc.M., M.S., MSHS, MS, Mag., Mg., Mgr, S.M., or SM)", "type": 5 }, { "_id": 1161, "name": "Master of Science in Education", "type": 5 }, { "_id": 1162, "name": "Master of Science in Engineering (MSE)", "type": 5 }, { "_id": 1163, "name": "Master of Science in Finance (M.Fin.)", "type": 5 }, { "_id": 1164, "name": "Master of Science in Human Resource Development (HRD or MSHRD)", "type": 5 }, { "_id": 1165, "name": "Master of Science in Information Systems (MSIS)", "type": 5 }, { "_id": 1166, "name": "Master of Science in Information Systems Management (MSMIS)", "type": 5 }, { "_id": 1167, "name": "Master of Science in Information Technology (MSIT, MScIT, M.Sc.IT, MSc.IT or M.Sc IT.)", "type": 5 }, { "_id": 1168, "name": "Master of Science in Leadership (MSL)", "type": 5 }, { "_id": 1169, "name": "Master of Science in Management (MSc or MSM)", "type": 5 }, { "_id": 1170, "name": "Master of Science in Nursing (MSN)", "type": 5 }, { "_id": 1171, "name": "Master of Science in Project Management (M.S.P.M.)", "type": 5 }, { "_id": 1172, "name": "Master of Science in Supply Chain Management (SCM or MSSCM)", "type": 5 }, { "_id": 1173, "name": "Master of Science in Teaching (MST)", "type": 5 }, { "_id": 1174, "name": "Master of Science in Taxation", "type": 5 }, { "_id": 1175, "name": "Master of Social Science (MSSc)", "type": 5 }, { "_id": 1176, "name": "Master of Social Work (MSW)", "type": 5 }, { "_id": 1177, "name": "Master of Studies (M.St. or MSt)", "type": 5 }, { "_id": 1178, "name": "Master of Surgery (Ch.M. or M.S., as well as M.Ch. and M.Chir.)", "type": 5 }, { "_id": 1179, "name": "Master of Theological Studies (M.T.S.)", "type": 5 }, { "_id": 1180, "name": "Master of Theology (Th.M. or M.Th.)", "type": 5 }, { "_id": 1181, "name": "Master of Urban Planning", "type": 5 }, { "_id": 1182, "name": "Master of Veterinary Science (MVSC or MVSc)", "type": 5 }, { "_id": 1183, "name": "Advanced Theological Studies (M)", "type": 5 }, { "_id": 1184, "name": "African Studies (M)", "type": 5 }, { "_id": 1185, "name": "Ancient History and Classical Studies (M)", "type": 5 }, { "_id": 1186, "name": "Ancient Near Eastern Languages and Oriental Archaeology (M)", "type": 5 }, { "_id": 1187, "name": "Anglophone Literatures and Cultures (M)", "type": 5 }, { "_id": 1188, "name": "Anthropology (M)", "type": 5 }, { "_id": 1189, "name": "Applied Linguistics (M)", "type": 5 }, { "_id": 1190, "name": "The Arab World: Language and Society (M)", "type": 5 }, { "_id": 1191, "name": "Astronomy (M)", "type": 5 }, { "_id": 1192, "name": "Austrian Studies - Cultures, Literatures, Languages (M)", "type": 5 }, { "_id": 1193, "name": "Behavior, Neurobiology and Cognition (M)", "type": 5 }, { "_id": 1194, "name": "Biological Chemistry (M)", "type": 5 }, { "_id": 1195, "name": "Botany (M)", "type": 5 }, { "_id": 1196, "name": "Business Administration (M)", "type": 5 }, { "_id": 1197, "name": "Business Informatics (M)", "type": 5 }, { "_id": 1198, "name": "Byzantine and Modern Greek Studies (M)", "type": 5 }, { "_id": 1199, "name": "Cartography and Geographic Information Science (M)", "type": 5 }, { "_id": 1200, "name": "Religious Education (M)", "type": 5 }, { "_id": 1201, "name": "Chemistry (M)", "type": 5 }, { "_id": 1202, "name": "Chemistry and Technology of Materials (M)", "type": 5 }, { "_id": 1203, "name": "Chinese Studies (M)", "type": 5 }, { "_id": 1204, "name": "Classical Archaeology (M)", "type": 5 }, { "_id": 1205, "name": "Classical Philology (Latin) (M)", "type": 5 }, { "_id": 1206, "name": "Classical Philology (Greek) (M)", "type": 5 }, { "_id": 1207, "name": "Comparative Literature (M)", "type": 5 }, { "_id": 1208, "name": "Communication Science (M)", "type": 5 }, { "_id": 1209, "name": "Computational Science (M)", "type": 5 }, { "_id": 1210, "name": "Conservation Biology and Biodiversity Management (M)", "type": 5 }, { "_id": 1211, "name": "CREOLE - Cultural Differences and Transnational Processes (M)", "type": 5 }, { "_id": 1212, "name": "Culture and Society of Modern South Asia (M)", "type": 5 }, { "_id": 1213, "name": "Didactics of Informatics (M)", "type": 5 }, { "_id": 1214, "name": "Dutch Studies (M)", "type": 5 }, { "_id": 1215, "name": "Earth Sciences (M)", "type": 5 }, { "_id": 1216, "name": "East Asian Economy and Society  (M)", "type": 5 }, { "_id": 1217, "name": "Ecology and Ecosystems (M)", "type": 5 }, { "_id": 1218, "name": "Economics (MAG)", "type": 5 }, { "_id": 1219, "name": "Education (M)", "type": 5 }, { "_id": 1220, "name": "English Language and Linguistics (M)", "type": 5 }, { "_id": 1221, "name": "Environmental Sciences (M)", "type": 5 }, { "_id": 1222, "name": "European Ethnology (M)", "type": 5 }, { "_id": 1223, "name": "European Master in Health and Physical Activity (M)", "type": 5 }, { "_id": 1224, "name": "Evolutionary Biology (M)", "type": 5 }, { "_id": 1225, "name": "Finno-Ugrian Studies (M)", "type": 5 }, { "_id": 1226, "name": "Gender Studies (M)", "type": 5 }, { "_id": 1227, "name": "General Linguistics: Grammar Theory and Cognitive Linguistics (M)", "type": 5 }, { "_id": 1228, "name": "General Slavonic Studies (M)", "type": 5 }, { "_id": 1229, "name": "Genetics and Developmental Biology (M)", "type": 5 }, { "_id": 1230, "name": "Geography (M)", "type": 5 }, { "_id": 1231, "name": "German as a Foreign and Second Language (M)", "type": 5 }, { "_id": 1232, "name": "German Studies (M)", "type": 5 }, { "_id": 1233, "name": "Global History (ERASMUS MUNDUS) (M)", "type": 5 }, { "_id": 1234, "name": "Historical Research, Historical Ancillary Sciences and Archiving (M)", "type": 5 }, { "_id": 1235, "name": "History (M)", "type": 5 }, { "_id": 1236, "name": "History of Art and Architecture (M)", "type": 5 }, { "_id": 1237, "name": "History of Theatre, Film and Media (M)", "type": 5 }, { "_id": 1238, "name": "Hungarian Studies (M)", "type": 5 }, { "_id": 1239, "name": "Indo-European Studies and Historical Linguistics (M)", "type": 5 }, { "_id": 1240, "name": "Interdisciplinary East European Studies (M)", "type": 5 }, { "_id": 1241, "name": "International Business Administration (M)", "type": 5 }, { "_id": 1242, "name": "International Development (M)", "type": 5 }, { "_id": 1243, "name": "Islamic Religious Education  (M)", "type": 5 }, { "_id": 1244, "name": "Islamic Studies (M)", "type": 5 }, { "_id": 1245, "name": "Japanese Studies (M)", "type": 5 }, { "_id": 1246, "name": "Jewish Studies (M)", "type": 5 }, { "_id": 1247, "name": "Korean Studies (M)", "type": 5 }, { "_id": 1248, "name": "Languages and Cultures of South Asia (M)", "type": 5 }, { "_id": 1249, "name": "Mass Media and Communication Science (MAG)", "type": 5 }, { "_id": 1250, "name": "Mathematics (M)", "type": 5 }, { "_id": 1251, "name": "MATILDA: European Master in Women\'s and Gender History (M)", "type": 5 }, { "_id": 1252, "name": "Media Informatics (M)", "type": 5 }, { "_id": 1253, "name": "Mediaeval and Neolatin Studies (M)", "type": 5 }, { "_id": 1254, "name": "Meteorology (M)", "type": 5 }, { "_id": 1255, "name": "Middle European interdisciplinary master programme in Cognitive Science (M)", "type": 5 }, { "_id": 1256, "name": "Molecular Biology (M)", "type": 5 }, { "_id": 1257, "name": "Molecular Microbiology, Microbial Ecology and Immunobiology (M)", "type": 5 }, { "_id": 1258, "name": "Musicology (M)", "type": 5 }, { "_id": 1259, "name": "Numismatics and the History of Money (IMS)", "type": 5 }, { "_id": 1260, "name": "Nursing Science (M)", "type": 5 }, { "_id": 1261, "name": "Nutritional Science (M)", "type": 5 }, { "_id": 1262, "name": "Palaeobiology (M)", "type": 5 }, { "_id": 1263, "name": "Philosophy (M)", "type": 5 }, { "_id": 1264, "name": "Philosophy and History of Science (M)", "type": 5 }, { "_id": 1265, "name": "Physics (M)", "type": 5 }, { "_id": 1266, "name": "Physics of the Earth (Geophysics) (M)", "type": 5 }, { "_id": 1267, "name": "Political Science  (M)", "type": 5 }, { "_id": 1268, "name": "Prehistoric and Historical Archaeology (M)", "type": 5 }, { "_id": 1269, "name": "Protestant Theology (M)", "type": 5 }, { "_id": 1270, "name": "Psychology (M)", "type": 5 }, { "_id": 1271, "name": "Regional Research and Regional Planning (M)", "type": 5 }, { "_id": 1272, "name": "Religious Studies (M)", "type": 5 }, { "_id": 1273, "name": "Romance Studies (M)", "type": 5 }, { "_id": 1274, "name": "Scandinavian Studies (M)", "type": 5 }, { "_id": 1275, "name": "Science - Technology - Society (M)", "type": 5 }, { "_id": 1276, "name": "Scientific Computing (M)", "type": 5 }, { "_id": 1277, "name": "Slavonic Studies (M)", "type": 5 }, { "_id": 1278, "name": "Social and Cultural Anthropology (M)", "type": 5 }, { "_id": 1279, "name": "Sociology (M)", "type": 5 }, { "_id": 1280, "name": "Sports Sciences (MAG)", "type": 5 }, { "_id": 1281, "name": "Statistics (MAG)", "type": 5 }, { "_id": 1282, "name": "Studies in Egyptology (M)", "type": 5 }, { "_id": 1283, "name": "Theory of Theatre, Film and Media (M)", "type": 5 }, { "_id": 1284, "name": "Tibetan and Buddhist Studies (M)", "type": 5 }, { "_id": 1285, "name": "Translation (M)", "type": 5 }, { "_id": 1286, "name": "Turkish Studies (M)", "type": 5 }, { "_id": 1287, "name": "Urban Studies (M)", "type": 5 }, { "_id": 1288, "name": "Zoology (M)", "type": 5 }, { "_id": 1289, "name": "Accounting", "type": 4 }, { "_id": 1290, "name": "Agricultural Business Management", "type": 4 }, { "_id": 1291, "name": "Agricultural Science", "type": 4 }, { "_id": 1292, "name": "American Studies", "type": 4 }, { "_id": 1293, "name": "Animal Sciences", "type": 4 }, { "_id": 1294, "name": "Anthropology", "type": 4 }, { "_id": 1295, "name": "Applied Visual Arts", "type": 4 }, { "_id": 1296, "name": "Art", "type": 4 }, { "_id": 1297, "name": "Biochemistry and Biophysics", "type": 4 }, { "_id": 1298, "name": "Bioengineering", "type": 4 }, { "_id": 1299, "name": "BioHealth Sciences", "type": 4 }, { "_id": 1300, "name": "Biology", "type": 4 }, { "_id": 1301, "name": "Bioresource Research", "type": 4 }, { "_id": 1302, "name": "Botany", "type": 4 }, { "_id": 1303, "name": "Business Administration", "type": 4 }, { "_id": 1304, "name": "Business Information Systems", "type": 4 }, { "_id": 1305, "name": "Chemical Engineering", "type": 4 }, { "_id": 1306, "name": "Chemistry", "type": 4 }, { "_id": 1307, "name": "Civil Engineering", "type": 4 }, { "_id": 1308, "name": "Computer Science", "type": 4 }, { "_id": 1309, "name": "Construction Engineering Management", "type": 4 }, { "_id": 1310, "name": "Crop Science and Soil Science", "type": 4 }, { "_id": 1311, "name": "Digital Communication Arts", "type": 4 }, { "_id": 1312, "name": "Earth Sciences", "type": 4 }, { "_id": 1313, "name": "Ecological Engineering", "type": 4 }, { "_id": 1314, "name": "Economics", "type": 4 }, { "_id": 1315, "name": "Education (Double Degree)", "type": 4 }, { "_id": 1316, "name": "Electrical and Computer Engineering", "type": 4 }, { "_id": 1317, "name": "Energy Systems Engineering", "type": 4 }, { "_id": 1318, "name": "English", "type": 4 }, { "_id": 1319, "name": "Environmental Economics and Policy", "type": 4 }, { "_id": 1320, "name": "Environmental Engineering", "type": 4 }, { "_id": 1321, "name": "Environmental Sciences", "type": 4 }, { "_id": 1322, "name": "Ethnic Studies", "type": 4 }, { "_id": 1323, "name": "Finance", "type": 4 }, { "_id": 1324, "name": "Fisheries and Wildlife Science", "type": 4 }, { "_id": 1325, "name": "Food Science and Technology", "type": 4 }, { "_id": 1326, "name": "Forest Engineering", "type": 4 }, { "_id": 1327, "name": "Forest Engineering/Civil Engineering", "type": 4 }, { "_id": 1328, "name": "Forestry/Management Option", "type": 4 }, { "_id": 1329, "name": "Forestry/Operations Option", "type": 4 }, { "_id": 1330, "name": "French", "type": 4 }, { "_id": 1331, "name": "General Agriculture", "type": 4 }, { "_id": 1332, "name": "General Engineering", "type": 4 }, { "_id": 1333, "name": "Graphic Design", "type": 4 }, { "_id": 1334, "name": "German", "type": 4 }, { "_id": 1335, "name": "History", "type": 4 }, { "_id": 1336, "name": "Horticulture", "type": 4 }, { "_id": 1337, "name": "Hospitality Management", "type": 4 }, { "_id": 1338, "name": "Human Development and Family Sciences", "type": 4 }, { "_id": 1339, "name": "Industrial Engineering", "type": 4 }, { "_id": 1340, "name": "Innovation Management", "type": 4 }, { "_id": 1341, "name": "Interior Design", "type": 4 }, { "_id": 1342, "name": "Kinesiology", "type": 4 }, { "_id": 1343, "name": "Liberal Studies", "type": 4 }, { "_id": 1344, "name": "Management", "type": 4 }, { "_id": 1345, "name": "Manufacturing Engineering", "type": 4 }, { "_id": 1346, "name": "Marketing", "type": 4 }, { "_id": 1347, "name": "Mathematics", "type": 4 }, { "_id": 1348, "name": "Mechanical Engineering", "type": 4 }, { "_id": 1349, "name": "Merchandising Management", "type": 4 }, { "_id": 1350, "name": "Microbiology", "type": 4 }, { "_id": 1351, "name": "Music", "type": 4 }, { "_id": 1352, "name": "Natural Resources", "type": 4 }, { "_id": 1353, "name": "Nuclear Engineering", "type": 4 }, { "_id": 1354, "name": "Nutrition", "type": 4 }, { "_id": 1355, "name": "Philosophy", "type": 4 }, { "_id": 1356, "name": "Physics", "type": 4 }, { "_id": 1357, "name": "Political Science", "type": 4 }, { "_id": 1358, "name": "Pre-Pharmacy", "type": 4 }, { "_id": 1359, "name": "Psychology", "type": 4 }, { "_id": 1360, "name": "Radiation Health Physics", "type": 4 }, { "_id": 1361, "name": "Rangeland Sciences ", "type": 4 }, { "_id": 1362, "name": "Recreation Resource Management", "type": 4 }, { "_id": 1363, "name": "Religious Studies", "type": 4 }, { "_id": 1364, "name": "Renewable Materials", "type": 4 }, { "_id": 1365, "name": "Social Science", "type": 4 }, { "_id": 1366, "name": "Sociology", "type": 4 }, { "_id": 1367, "name": "Spanish", "type": 4 }, { "_id": 1368, "name": "Speech Communication", "type": 4 }, { "_id": 1369, "name": "Sustainability", "type": 4 }, { "_id": 1370, "name": "Tourism and Outdoor Leadership", "type": 4 }, { "_id": 1371, "name": "Women, Gender and Sexuality Studies", "type": 4 }, { "_id": 1372, "name": "Zoology", "type": 4 }, { "_id": 1373, "name": "Undergraduate minors", "type": 4 }, { "_id": 1374, "name": "Minor", "type": 4 }, { "_id": 1375, "name": "Actuarial Science", "type": 4 }, { "_id": 1376, "name": "Aerospace Studies", "type": 4 }, { "_id": 1377, "name": "Agricultural Business Management", "type": 4 }, { "_id": 1378, "name": "Agricultural Sciences", "type": 4 }, { "_id": 1379, "name": "Air Force Studies", "type": 4 }, { "_id": 1380, "name": "Animal Sciences", "type": 4 }, { "_id": 1381, "name": "Anthropology", "type": 4 }, { "_id": 1382, "name": "Art History", "type": 4 }, { "_id": 1383, "name": "Asian Languages and Cultures", "type": 4 }, { "_id": 1384, "name": "Asian Studies", "type": 4 }, { "_id": 1385, "name": "Bioenergy", "type": 4 }, { "_id": 1386, "name": "Biology", "type": 4 }, { "_id": 1387, "name": "Botany", "type": 4 }, { "_id": 1388, "name": "Business and Entrepreneurship", "type": 4 }, { "_id": 1389, "name": "Chemistry", "type": 4 }, { "_id": 1390, "name": "Communication", "type": 4 }, { "_id": 1391, "name": "Computational Physics", "type": 4 }, { "_id": 1392, "name": "Computer Science", "type": 4 }, { "_id": 1393, "name": "Crop Science", "type": 4 }, { "_id": 1394, "name": "Early Childhood Development and Education", "type": 4 }, { "_id": 1395, "name": "Earth Information Science and Technology", "type": 4 }, { "_id": 1396, "name": "Economics", "type": 4 }, { "_id": 1397, "name": "English", "type": 4 }, { "_id": 1398, "name": "Entomology", "type": 4 }, { "_id": 1399, "name": "Environmental Engineering", "type": 4 }, { "_id": 1400, "name": "Environmental Sciences", "type": 4 }, { "_id": 1401, "name": "Environmental Sciences", "type": 4 }, { "_id": 1402, "name": "Environmental Safety and Health", "type": 4 }, { "_id": 1403, "name": "Equine Science", "type": 4 }, { "_id": 1404, "name": "Ethnic Studies", "type": 4 }, { "_id": 1405, "name": "Exercise Physiology", "type": 4 }, { "_id": 1406, "name": "Fermentation Science", "type": 4 }, { "_id": 1407, "name": "Film Studies", "type": 4 }, { "_id": 1408, "name": "Fisheries and Wildlife", "type": 4 }, { "_id": 1409, "name": "Food Science", "type": 4 }, { "_id": 1410, "name": "Food Technology", "type": 4 }, { "_id": 1411, "name": "Forest Management", "type": 4 }, { "_id": 1412, "name": "Forest Products", "type": 4 }, { "_id": 1413, "name": "French", "type": 4 }, { "_id": 1414, "name": "Geography", "type": 4 }, { "_id": 1415, "name": "Geology", "type": 4 }, { "_id": 1416, "name": "German", "type": 4 }, { "_id": 1417, "name": "Health Management and Policy", "type": 4 }, { "_id": 1418, "name": "Health Promotion and Health Behavior", "type": 4 }, { "_id": 1419, "name": "History", "type": 4 }, { "_id": 1420, "name": "Horticulture", "type": 4 }, { "_id": 1421, "name": "International Agricultural Development", "type": 4 }, { "_id": 1422, "name": "International Engineering", "type": 4 }, { "_id": 1423, "name": "Irrigation Engineering", "type": 4 }, { "_id": 1424, "name": "KReturn to page content list.", "type": 4 }, { "_id": 1425, "name": "LReturn to page content list.", "type": 4 }, { "_id": 1426, "name": "Leadership", "type": 4 }, { "_id": 1427, "name": "Mathematics", "type": 4 }, { "_id": 1428, "name": "Merchandising Management", "type": 4 }, { "_id": 1429, "name": "Microbiology", "type": 4 }, { "_id": 1430, "name": "Military Science", "type": 4 }, { "_id": 1431, "name": "Multimedia", "type": 4 }, { "_id": 1432, "name": "Music", "type": 4 }, { "_id": 1433, "name": "Natural Resource and Environmental Law and Policy", "type": 4 }, { "_id": 1434, "name": "Natural Resources", "type": 4 }, { "_id": 1435, "name": "Naval Science", "type": 4 }, { "_id": 1436, "name": "New Media Communication", "type": 4 }, { "_id": 1437, "name": "Nuclear Engineering", "type": 4 }, { "_id": 1438, "name": "Nutrition", "type": 4 }, { "_id": 1439, "name": "Oceanography", "type": 4 }, { "_id": 1440, "name": "Outdoor Recreation Leadership and Tourism", "type": 4 }, { "_id": 1441, "name": "Philosophy", "type": 4 }, { "_id": 1442, "name": "Photography", "type": 4 }, { "_id": 1443, "name": "Physics", "type": 4 }, { "_id": 1444, "name": "Political Science", "type": 4 }, { "_id": 1445, "name": "Popular Music Studies", "type": 4 }, { "_id": 1446, "name": "Psychology", "type": 4 }, { "_id": 1447, "name": "Queer Studies", "type": 4 }, { "_id": 1448, "name": "Radiation Health Physics", "type": 4 }, { "_id": 1449, "name": "Rangeland Ecology and Management", "type": 4 }, { "_id": 1450, "name": "Recreation Resource Management", "type": 4 }, { "_id": 1451, "name": "Regional Studies", "type": 4 }, { "_id": 1452, "name": "Renewable Materials", "type": 4 }, { "_id": 1453, "name": "Resource Economics", "type": 4 }, { "_id": 1454, "name": "Resource Geography and Rural Planning", "type": 4 }, { "_id": 1455, "name": "Social Justice", "type": 4 }, { "_id": 1456, "name": "Sociology", "type": 4 }, { "_id": 1457, "name": "Soil Science", "type": 4 }, { "_id": 1458, "name": "Spanish", "type": 4 }, { "_id": 1459, "name": "Sports Injury Care", "type": 4 }, { "_id": 1460, "name": "Statistics", "type": 4 }, { "_id": 1461, "name": "Theatre Arts", "type": 4 }, { "_id": 1462, "name": "Tourism and Outdoor Leadership", "type": 4 }, { "_id": 1463, "name": "Toxicology", "type": 4 }, { "_id": 1464, "name": "Turf and Landscape Management", "type": 4 }, { "_id": 1465, "name": "UReturn to page content list.", "type": 4 }, { "_id": 1466, "name": "Visual Arts", "type": 4 }, { "_id": 1467, "name": "Women, Gender, and Sexuality Studies", "type": 4 }, { "_id": 1468, "name": "Writing", "type": 4 }, { "_id": 1469, "name": "Applied Ethics", "type": 4 }, { "_id": 1470, "name": "Gerontology", "type": 4 }, { "_id": 1471, "name": "Language in Culture", "type": 4 }, { "_id": 1472, "name": "Latin American Affairs", "type": 4 }, { "_id": 1473, "name": "Peace Studies", "type": 4 }, { "_id": 1474, "name": "Women, Gender, and Sexuality Studies", "type": 4 }];
    Degree.create(programData, function (err, programData) {
        if (err)
            throw err;
        res.json(programData);
    });
});
ctrl.get("/dropcollection", function (req, res) {
    Degree.remove({}, function (err) {
        res.json('collection removed')
    });
})

ctrl.get('/getDegreeData/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var logged = req.session.passport.user;
        var current_members = [];
        var past_members = [];
        var future_members = [];
        var friend_members = [];
        var id = req.params.id;
        var is_member = false;
        getDegreeDetails(id, function (degreeDetails) {
            getFriendIds(logged, function (friendIds) {
                for (var i in degreeDetails.data.members) {
                    if (degreeDetails.data.members[i].user_id && friendIds.indexOf(degreeDetails.data.members[i].user_id._id) > -1) {
                        friend_members.push({ user_id: degreeDetails.data.members[i].user_id, status: 3 });
                    }
                    if (degreeDetails.data.members[i].user_id && degreeDetails.data.members[i].user_id._id == logged) {
                        is_member = true;
                    }
                    if (degreeDetails.data.members[i].from && degreeDetails.data.members[i].to) {
                        var degreeFromDate = new Date(degreeDetails.data.members[i].from).getTime();
                        var degreeToDate = new Date(degreeDetails.data.members[i].to).getTime();
                        if (degreeFromDate <= currentDate && currentDate <= degreeToDate) {
                            if (degreeDetails.data.members[i].user_id && degreeDetails.data.members[i].user_id._id != logged) {
                                if (friendIds.indexOf(degreeDetails.data.members[i].user_id._id) > -1) {
                                    current_members.push({ currentMember: degreeDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    current_members.push({ currentMember: degreeDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        } else if (degreeFromDate > currentDate) {
                            if (degreeDetails.data.members[i].user_id && degreeDetails.data.members[i].user_id._id != logged) {

                                if (friendIds.indexOf(degreeDetails.data.members[i].user_id._id) > -1) {
                                    future_members.push({ futureMember: degreeDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    future_members.push({ futureMember: degreeDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        } else if (degreeToDate < currentDate) {
                            if (degreeDetails.data.members[i].user_id && degreeDetails.data.members[i].user_id._id != logged) {
                                if (friendIds.indexOf(degreeDetails.data.members[i].user_id._id) > -1) {
                                    past_members.push({ pastMember: degreeDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    past_members.push({ pastMember: degreeDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        }
                    }
                }
                res.json({ status: 2, degreeDetails: degreeDetails.data, current_members: current_members, past_members: past_members, future_members: future_members, is_member: is_member, friend_members: friend_members });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});


ctrl.get('/getDegreeData/getCurrentMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var current_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getDegreeDetails(id, function (degreeDetails) {
            for (var i in degreeDetails.data.members) {
                if (degreeDetails.data.members[i].from && degreeDetails.data.members[i].to) {
                    var degreeFromDate = new Date(degreeDetails.data.members[i].from).getTime();
                    var degreeToDate = new Date(degreeDetails.data.members[i].to).getTime();
                    if (degreeFromDate <= currentDate && currentDate <= degreeToDate) {
                        if (degreeDetails.data.members[i].user_id && degreeDetails.data.members[i].user_id._id != logged) {
                            current_members.push(degreeDetails.data.members[i].user_id);
                        }
                        degreeDetails.data.members[i] = {
                            'from': degreeDetails.data.members[i].from,
                            'status': degreeDetails.data.members[i].status,
                            'user_id': degreeDetails.data.members[i].user_id,
                            'to': degreeDetails.data.members[i].to,
                            'user_status': 1
                        };
                    } else if (degreeToDate < currentDate) {
                        degreeDetails.data.members[i] = {
                            'from': degreeDetails.data.members[i].from,
                            'status': degreeDetails.data.members[i].status,
                            'user_id': degreeDetails.data.members[i].user_id,
                            'to': degreeDetails.data.members[i].to,
                            'user_status': 2
                        };
                    } else if (degreeFromDate > currentDate) {
                        degreeDetails.data.members[i] = {
                            'from': degreeDetails.data.members[i].from,
                            'status': degreeDetails.data.members[i].status,
                            'user_id': degreeDetails.data.members[i].user_id,
                            'to': degreeDetails.data.members[i].to,
                            'user_status': 3
                        };
                    }
                }
            }
            res.json({ status: 2, degreeDetails: degreeDetails.data, current_members: current_members });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.get('/getDegreeData/getPastMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var past_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getDegreeDetails(id, function (degreeDetails) {
            for (var i in degreeDetails.data.members) {
                if (degreeDetails.data.members[i].from && degreeDetails.data.members[i].to) {
                    var degreeFromDate = new Date(degreeDetails.data.members[i].from).getTime();
                    var degreeToDate = new Date(degreeDetails.data.members[i].to).getTime();
                    if (degreeToDate < currentDate) {
                        if (degreeDetails.data.members[i].user_id && degreeDetails.data.members[i].user_id._id != logged) {
                            past_members.push(degreeDetails.data.members[i].user_id);
                        }
                    }
                }
            }
            res.json({ status: 2, degreeDetails: degreeDetails.data, past_members: past_members });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});


ctrl.get('/getDegreeData/getFutureMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var future_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getDegreeDetails(id, function (degreeDetails) {
            for (var i in degreeDetails.data.members) {
                if (degreeDetails.data.members[i].from && degreeDetails.data.members[i].to) {
                    var degreeFromDate = new Date(degreeDetails.data.members[i].from).getTime();
                    var degreeToDate = new Date(degreeDetails.data.members[i].to).getTime();
                    if (degreeFromDate > currentDate) {
                        if (degreeDetails.data.members[i].user_id && degreeDetails.data.members[i].user_id._id != logged) {
                            future_members.push(degreeDetails.data.members[i].user_id);
                        }
                    }
                }
            }
            res.json({ status: 2, degreeDetails: degreeDetails.data, future_members: future_members });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.get('/getDegreeData/getFriendDegreeMembers/:id', function (req, res) {
    if (req.session.passport) {
        var friend_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getDegreeDetails(id, function (degreeDetails) {
            getFriendIds(logged, function (friendIds) {
                for (var i in degreeDetails.data.members) {
                    if (degreeDetails.data.members[i].user_id && friendIds.indexOf(degreeDetails.data.members[i].user_id._id) > -1) {
                        friend_members.push(degreeDetails.data.members[i].user_id);
                    }
                }
                res.json({ status: 2, degreeDetails: degreeDetails.data, friend_members: friend_members });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

function getDegreeDetails(degree_id, callback) {
    Degree.findOne({ '_id': degree_id })
        .select('name icon type members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function (err, degree) {
            if (err)
                throw err;
            var data = degree.members.filter(function (member) {
                return member.user_id;
            });
            degree.members = data;
            callback({ data: degree });
        });
}

function getFriendsDetails(userId, callback) {
    User.findOne({ '_id': userId })
        .select('friends')
        .exec(function (err, user) {
            if (err)
                throw err;
            callback({ data: user });
        });
}
ctrl.get('/deleteDegreeMember', function (req, res) {
    Degree.update({}, { $pull: { post: {}, members: {} } }, { multi: true }, function (err, post) {
        if (err)
            throw err;
        data = { message: 'All member Deleted deleted' };
        res.json(data);
    });
});
ctrl.get('/getDegreeData/getFutureMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date();
        var future_members = [];
        var id = req.params.id;
        var j = 1;
        getDegreeDetails(id, function (degreeDetails) {
            for (var i in degreeDetails.data.members) {
                if (j < 9) {
                    if (currentDate < degreeDetails.data.members[i].from && currentDate <= degreeDetails.data.members[i].to && degreeDetails.data.members[i].user_id != null) {
                        future_members.push(degreeDetails.data.members[i].user_id);
                        j++;
                    }
                }
            }
            res.json({ status: 2, degreeDetails: degreeDetails.data, future_members: future_members });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});

ctrl.get('/getUserSearchDegree/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var name = req.params.name;
        getDegreeSearchlistByUser(name, userId, [], function (data) {
            res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getFriendIds(userId, callback) {
    var ids = [];
    User.findOne({ _id: userId })
        .select('friends')
        .exec(function (err, data) {
            if (err)
                throw err;
            for (var i = 0; i < data.friends.length; i++) {
                if (data.friends[i].friend_id && data.friends[i].status == 3) {
                    ids.push(data.friends[i].friend_id);
                }
            }
            callback(ids);
        });
}

ctrl.get('/getMyWallSearchDegree/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var name = req.params.name;
        searchDegreeMyWall(name, function (data) {
            res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function searchDegreeMyWall(search_name, callback) {
    Degree.find({
        "name": new RegExp(search_name, "i"),
    }, { name: 1, _id: 1 })
        .select('name icon type members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, degree) {
            callback(degree);
        });
}
ctrl.get('/getFriendSearchDegree/:friendId/:name', function (req, res) {
    if (req.session.passport) {
        var name = req.params.name;
        var friendId = req.params.friendId;
        getFriendDegreeSearchlist(name, friendId, function (data) {
            res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getFriendDegreeSearchlist(search_name, friendId, callback) {
    Degree.find({
        "name": new RegExp(search_name, "i"),
        "members.user_id": friendId
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, degree) {
            callback(degree);
        });
}

function sendNewSCDAddedMail(scdName, userId) {
    var fullUrl = "http://dev.stribein.com";
    getUserDetail(userId, function (userDetails) {
        locals = {
            email: 'admin@stribein.com',
            from: userDetails.local.email,
            subject: 'Degree',
            name: userDetails.fname + " " + (userDetails.lname ? userDetails.lname : ""),
            logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
            scdName: scdName,
            type: 3,
            siteLink: fullUrl,
        };
        mailer.sendOne('scd_added', locals, function (err, responseStatus, html, text) {
        });
    });
}
function getUserDetail(id, calback) {
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('fname lname gender city zip state dob local.email')
        .exec(function (err, user) {
            if (err) {
                throw err;
            }
            if (user) {
                calback(user);
            } else {
                calback();
            }
        });
}