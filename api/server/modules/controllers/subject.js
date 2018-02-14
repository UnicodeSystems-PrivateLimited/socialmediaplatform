﻿var ctrl = require('express').Router();
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
var Subject = require('../models/subject');
var User = require('../models/user');

ctrl.get('/', function (req, res) {
    var memIds;
    if (req.query.memIds) {
        memIds = JSON.parse(req.query.memIds);
        //console.log();
        Subject.find({ _id: { $in: memIds } }, function (err, subjects) {
            if (err)
                throw err;
            console.log(subjects);
            res.json(subjects);
        });
    } else {
        Subject.find({}, function (err, subjects) {
            if (err)
                throw err;
            res.json(subjects);
        });
    }
});
ctrl.get('/deleteSubjectMember', function (req, res) {
    Subject.update({}, { $pull: { post: {}, members: {} } }, { multi: true }, function (err, post) {
        if (err)
            throw err;
        data = { message: 'All member Deleted deleted' };
        res.json(data);
    });
});

ctrl.get('/delete', function (req, res) {
    Subject.remove(function (err, post) {
        if (err)
            throw err;
        data = { message: 'All subject deleted' };
        res.json(data);
    });
});

ctrl.get('/getAllSubject/:counter', function (req, res) {
    var counter = req.params.counter;
    var limit = 50;
    var skip = (counter - 1) * 50;
    var memIds;
    if (req.session.passport && req.session.passport.type == 2) {
        if (req.query.memIds) {
            memIds = JSON.parse(req.query.memIds);
            //console.log();
            Subject.find({ _id: { $in: memIds } })
                .select('name icon members post')
                .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
                .limit(limit)
                .skip(skip)
                .exec(function (err, subjects) {
                    if (err)
                        throw err;
                    Subject.find({}, function (err, total_subjects) {
                        if (err)
                            throw err;
                        console.log(subjects);
                        res.json({ data: subjects, total_subjects: total_subjects });
                    });
                });
        } else {
            Subject.find({})
                .select('name icon members post')
                .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
                .limit(limit)
                .skip(skip)
                .exec(function (err, subjects) {
                    if (err)
                        throw err;
                    Subject.find({})
                        .select('name icon type members post')
                        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
                        .count()
                        .exec(function (err, total_subjects) {
                            if (err)
                                throw err;
                            res.json({ data: subjects, total_subjects: total_subjects });
                        });
                });
        }
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.get('/dropDownList', function (req, res) {
    Subject.find({})
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function (err, subjects) {
            if (err)
                throw err;
            res.json(subjects);
        });

});

ctrl.post('/subjectSearch', function (req, res) {
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

        getSubjectSearchlist(req.body.name, idToFilter, function (data) {
            res.json({ status: 2, msg: "Search complete!", idToFilter: idToFilter, data: data });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});
ctrl.post('/subjectSearchByUser', function (req, res) {
    if (req.body.name) {
        var idToFilter = []
        console.log('idsssssssss', req.body.name);
        console.log('idsssssssss', req.body.user_id);
        if (req.body.ids) {
            idToFilter = req.body.ids.split(',');
            for (var i = 0; i < idToFilter.length; i++) {
                if (idToFilter[i])
                    idToFilter[i] = parseInt(idToFilter[i]);
            }
        } else
            idToFilter[0] = -1;

        getSubjectSearchlistByUser(req.body.name, req.body.user_id, idToFilter, function (data) {
            res.json({ status: 2, msg: "Search complete!", idToFilter: idToFilter, data: data });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});

function getSubjectSearchlistByUser(search_name, userId, idToFilter, callback) {
    Subject.find({
        "name": new RegExp(search_name, "i"),
        //        name: new RegExp('^' +search_name, "i"),
        "members.user_id": { $in: userId }
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, subject) {
            callback(subject);
        });
}

function getSubjectSearchlist(search_name, idToFilter, callback) {
    Subject.find({
        name: new RegExp(search_name, "i"),
        //    name: new RegExp('^' +search_name, "i"),
        _id: { $not: { $in: idToFilter } }
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, subject) {
            callback(subject);
        });
}

ctrl.get('/delete/:id', function (req, res) {
    var User = require('../models/user');
    var Subject = require('../models/subject');
    var Post = require('../models/post');
    //    var subject = new Subject();
    if (req.session.passport && req.session.passport.type == 2) {
        var SubjectId = req.params.id;
        Subject.find({ '_id': SubjectId })
            .select('name icon type members post')
            .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
            .exec(function (err, subject) {
                if (err) {
                    throw err;
                }
                if (subject.length > 0) {
                    Subject.remove({ _id: SubjectId }, function (err, subjects) {
                        if (err)
                            throw err;
                        data = { message: 'subject deleted' };
                        res.json({ data: data });
                    });
                    for (var i = 0; i < subject[0].members.length; i++) {
                        if (subject[0].members[i].user_id != null) {
                            User.findByIdAndUpdate({ "_id": subject[0].members[i].user_id._id }, { $pull: { subjects: { subject_id: subject[0]._id } } }, function (err, user) {
                                if (err)
                                    throw err;
                                console.log("user removed");
                            });
                        }
                    }
                } else {
                    console.log("User not found");
                    data = { message: 'User not found' };
                    res.json({ data: data });
                }
            });
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});

ctrl.get('/list/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        Subject.findById(req.params.id)
            .select('name icon type members post')
            .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
            .exec(function (err, subject) {
                if (err)
                    throw err;
                console.log(subject);
                return res.json(subject);
            });
    }
    //res.end();
});

ctrl.post('/add', function (req, res) {
    var subject = new Subject(req.body);
    var cDate = new Date();
    cUJDate = cDate;
    pUJDate = cDate;
    //subject.current_members = {user_id: req.body.cUserId, join_date: cUJDate};
    //subject.past_members = {user_id: req.body.pUserId, join_date: pUJDate};
    subject.save(function (err) {
        if (err)
            throw err;
        res.json(subject);
    });
});
ctrl.post('/addOnlySubject', function (req, res) {
    var Subject = require('../models/subject');
    var newSubject = new Subject();
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Subject.findOne({ 'name': req.body.name }, function (err, Subjectdata) {
            if (err) {
                throw err;
            }
            if (Subjectdata) {
                res.json({ status: 3, msg: "Subject Already Added" });
            } else {
                if (req.body.name != '') {
                    newSubject.name = req.body.name;
                }
                newSubject.save(function (err, newSubject) {
                    if (err) {
                        throw err;
                    }
                    if (req.session.passport.type == 1) {
                        sendNewSCDAddedMail(req.body.name, userId);
                    }
                    res.json({ status: 2, msg: "Subject added Successfully", data: newSubject });
                });
            }
        });
    } else {
        console.log("User not found");
        //        data = {message: 'User not found'};
        res.json({ msg: 'User Not Found' });
    }
});
ctrl.post('/addSubject/:name', function (req, res) {
    var Subject = require('../models/subject');
    var newSubject = new Subject();

    if (req.session.passport) {
        var userId = req.session.passport.user;
        Subject.findOne({ 'name': req.params.name }, function (err, Subjectdata) {
            if (err) {
                throw err;
            }
            if (Subjectdata) {
                res.json({ status: 3, msg: "Subject Already Added" });
            } else {
                if (req.params.name != '') {
                    newSubject.name = req.params.name;
                }
                newSubject.save(function (err, newSubject) {
                    if (err) {
                        throw err;
                    }
                    upload(req, res, function (err) {
                        if (err) {
                            return
                        }
                        var ext = req.file.originalname.split('.').pop();
                        filename = newSubject._id + '.' + ext;

                        var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Subject/Icon");
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                            if (err) {
                                return console.log(err);
                            }
                            Subject.findByIdAndUpdate(newSubject._id, {
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
                                res.json({ status: 2, msg: "Subject Added Successfully", data: newSub });
                            });
                        });
                    });
                });
            }
        });
    } else {
        console.log("User not found");
        //        data = {message: 'User not found'};
        res.json({ msg: 'User Not Found' });
    }
});
ctrl.post('/addBulkSubject', function (req, res) {
    var Subject = require('../models/subject');
    var subject = [];
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
                        var subDefer = Q.defer();
                        if (newdata) {
                            newdata = newdata.trim();
                        }
                        Subject.findOne({ 'name': newdata }, function (err, finData) {
                            if (err) {
                                subDefer.reject(err);
                            }
                            if (!finData) {
                                Subject.create({ "name": newdata }, function (err, insertData) {
                                    if (err)
                                        subDefer.reject(err);
                                    subDefer.resolve()
                                });
                            } else {
                                subDefer.resolve()
                            }
                        });
                        promiseArr.push(subDefer);
                    })
                    .on('end', function (data) {
                        Q.all(promiseArr).then(function () {
                            res.json({ 'data': null, 'msg': 'Bulk Upload Successful' });
                        })
                    });
            });
        });
    } else {
        console.log("User not found");
        //        data = {message: 'User not found'};
        res.json({ msg: 'User Not Found' });
    }
});

ctrl.post('/updateOnlySubjectById/:id', function (req, res) {
    var Subject = require('../models/subject');
    var name = req.body.name;
    var ID = req.params.id;
    console.log("name");
    console.log(name);
    console.log("ID");
    console.log(ID);
    if (req.session.passport && req.session.passport.type == 2) {
        Subject.findOne({ 'name': name }, function (err, Subjectdata) {
            if (err) {
                throw err;
            }
            if (Subjectdata) {
                res.json({ status: 3, msg: "Subject Already Added" });
            } else {
                Subject.findByIdAndUpdate(ID, {
                    $set: {
                        name: name,
                    }
                }, function (err, newSub) {
                    if (err) {
                        throw err;
                    }
                    Subject.find({ _id: ID }, function (err, updSub) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: "Subject Updated Successfully", data: updSub });
                    });
                });
            }
        });
    } else {
        console.log("User not found");
        //        data = {message: 'User not found'};
        res.json({ msg: 'User Not Found' });
    }
});
ctrl.post('/updateSubjectById/:id/:name', function (req, res) {
    var Subject = require('../models/subject');
    var name = req.params.name;
    var ID = req.params.id;
    console.log("name");
    console.log(name);
    console.log("ID");
    console.log(ID);
    if (req.session.passport && req.session.passport.type == 2) {
        upload(req, res, function (err) {
            if (err) {
                return
            }
            var ext = req.file.originalname.split('.').pop();
            filename = ID + '.' + ext;
            console.log("filename");
            console.log(filename);
            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Subject/Icon");
            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                if (err) {
                    return console.log(err);
                }
                Subject.findOne({ 'name': name }, function (err, Degreedata) {
                    if (err) {
                        throw err;
                    }
                    if (Degreedata) {
                        Subject.findByIdAndUpdate(ID, {
                            $set: {
                                icon: filename,
                                //                                        name: name,
                            }
                        }, function (err, newSub) {
                            if (err) {
                                throw err;
                            }
                            Subject.find({ _id: ID }, function (err, updSub) {
                                if (err)
                                    throw err;
                                res.json({ status: 2, msg: "Subject Image Updated & Name Already Exist", data: updSub });
                            });
                        });
                        //                        res.json({status: 3, msg: "Subject Already Added"});
                    } else {
                        Subject.findByIdAndUpdate(ID, {
                            $set: {
                                icon: filename,
                                name: name,
                            }
                        }, function (err, newSub) {
                            if (err) {
                                throw err;
                            }
                            Subject.find({ _id: ID }, function (err, updSub) {
                                if (err)
                                    throw err;
                                res.json({ status: 2, msg: "Subject Updated Successfully", data: updSub });
                            });
                        });
                    }
                });
            });
        });
    } else {
        console.log("User not found");
        //        data = {message: 'User not found'};
        res.json({ msg: 'User Not Found' });
    }
});
ctrl.get("/setDefaultSubjects", function (req, res) {
    subjectData = [{ "_id": 1, "name": "3-D art" }, { "_id": 2, "name": "Aboriginal Studies" }, { "_id": 3, "name": "Academic studies in education" }, { "_id": 4, "name": "Academic studies in nursery education" }, { "_id": 5, "name": "Academic studies in primary education" }, { "_id": 6, "name": "Academic studies in specialist education" }, { "_id": 7, "name": "Accountancy" }, { "_id": 8, "name": "Accounting" }, { "_id": 9, "name": "Acoustics & vibration" }, { "_id": 10, "name": "Acting" }, { "_id": 11, "name": "Acupuncture" }, { "_id": 12, "name": "Adaptive P.E." }, { "_id": 13, "name": "Addiction and Co-existing Disorders" }, { "_id": 14, "name": "Adult Education" }, { "_id": 15, "name": "Adult nursing" }, { "_id": 16, "name": "Advanced Clinical Nursing" }, { "_id": 17, "name": "Advertising" }, { "_id": 18, "name": "Aerobics" }, { "_id": 19, "name": "Aeromedical Retrieval and Transport" }, { "_id": 20, "name": "Aerospace Engineering" }, { "_id": 21, "name": "African studies" }, { "_id": 22, "name": "Afrikaans " }, { "_id": 23, "name": "Afrikaans (Language) " }, { "_id": 24, "name": "Agricultural sciences" }, { "_id": 25, "name": "Agriculture" }, { "_id": 26, "name": "Akan" }, { "_id": 27, "name": "Algebra" }, { "_id": 28, "name": "Algebra I" }, { "_id": 29, "name": "Algebra II" }, { "_id": 30, "name": "American Literature" }, { "_id": 31, "name": "American Sign Language" }, { "_id": 32, "name": "American studies" }, { "_id": 33, "name": "Amharic" }, { "_id": 34, "name": "Anatomy" }, { "_id": 35, "name": "Anatomy, physiology & pathology" }, { "_id": 36, "name": "Ancient Civilizations" }, { "_id": 37, "name": "Ancient Greek" }, { "_id": 38, "name": "Ancient History" }, { "_id": 39, "name": "Ancient History " }, { "_id": 40, "name": "Ancient History (Greece) " }, { "_id": 41, "name": "Ancient language studies" }, { "_id": 42, "name": "Ancient Literature" }, { "_id": 43, "name": "Animal Science" }, { "_id": 44, "name": "Animation" }, { "_id": 45, "name": "Anthropology" }, { "_id": 46, "name": "Anthropology " }, { "_id": 47, "name": "AP Courses in any core subject" }, { "_id": 48, "name": "App development" }, { "_id": 49, "name": "Applied Art and Design " }, { "_id": 50, "name": "APPLIED ARTS" }, { "_id": 51, "name": "Applied Business " }, { "_id": 52, "name": "Applied Geology" }, { "_id": 53, "name": "Applied Information and Communication Technology (ICT) " }, { "_id": 54, "name": "Applied Mathematics " }, { "_id": 55, "name": "Applied Performing Arts " }, { "_id": 56, "name": "Applied Science" }, { "_id": 57, "name": "Applied Science " }, { "_id": 58, "name": "Aquaculture and Fisheries" }, { "_id": 59, "name": "Arabic" }, { "_id": 60, "name": "Arabic Literature " }, { "_id": 61, "name": "Arabic, Algerian Spoken" }, { "_id": 62, "name": "Arabic, Egyptian Spoken" }, { "_id": 63, "name": "Arabic, Mesopotamian Spoken" }, { "_id": 64, "name": "Arabic, Moroccan Spoken" }, { "_id": 65, "name": "Arabic, Najdi Spoken" }, { "_id": 66, "name": "Arabic, North Levantine Spoken" }, { "_id": 67, "name": "Arabic, Saidi Spoken" }, { "_id": 68, "name": "Arabic, Sanaani Spoken" }, { "_id": 69, "name": "Arabic, Sudanese Spoken" }, { "_id": 70, "name": "Arabic, Tunisian Spoken" }, { "_id": 71, "name": "Archaeology" }, { "_id": 72, "name": "Archery" }, { "_id": 73, "name": "Architecture" }, { "_id": 74, "name": "Architecture, building & planning" }, { "_id": 75, "name": "Aromatherapy" }, { "_id": 76, "name": "Art" }, { "_id": 77, "name": "Art & design" }, { "_id": 78, "name": "Art Administration" }, { "_id": 79, "name": "Art and Design (Art, Craft and Design) " }, { "_id": 80, "name": "Art and Design (Critical and Contextual Studies) " }, { "_id": 81, "name": "Art and Design (Fine Art) " }, { "_id": 82, "name": "Art and Design (Graphic Communication) " }, { "_id": 83, "name": "Art and Design (Graphic Design)" }, { "_id": 84, "name": "Art and Design (Photography) " }, { "_id": 85, "name": "Art and Design (Textiles) " }, { "_id": 86, "name": "Art and Design (Three-Dimensional Design) " }, { "_id": 87, "name": "Art and Design (Unendorsed)" }, { "_id": 88, "name": "Art Appreciation" }, { "_id": 89, "name": "Art History" }, { "_id": 90, "name": "Art History and Theory" }, { "_id": 91, "name": "Artificial intelligence" }, { "_id": 92, "name": "Arts" }, { "_id": 93, "name": "Asian (other) studies" }, { "_id": 94, "name": "Asian Studies" }, { "_id": 95, "name": "Assamese" }, { "_id": 96, "name": "Astronomy" }, { "_id": 97, "name": "Audio production" }, { "_id": 98, "name": "Audio technologies" }, { "_id": 99, "name": "Australasian studies" }, { "_id": 100, "name": "Auto body repair" }, { "_id": 101, "name": "Auto Mechanics" }, { "_id": 102, "name": "Aviation" }, { "_id": 103, "name": "Aviation Medicine" }, { "_id": 104, "name": "Awadhi" }, { "_id": 105, "name": "Azerbaijani, North" }, { "_id": 106, "name": "Azerbaijani, South" }, { "_id": 107, "name": "Back to top" }, { "_id": 108, "name": "Band" }, { "_id": 109, "name": "Banking" }, { "_id": 110, "name": "Basic First Aid and Safety" }, { "_id": 111, "name": "Basic Math" }, { "_id": 112, "name": "Basic Yard Care" }, { "_id": 113, "name": "Beauty Therapy" }, { "_id": 114, "name": "Belarusan" }, { "_id": 115, "name": "Bengali" }, { "_id": 116, "name": "Bengali " }, { "_id": 117, "name": "Bhojpuri" }, { "_id": 118, "name": "Biblical Hebrew" }, { "_id": 119, "name": "Biblical Studies" }, { "_id": 120, "name": "Biochemistry" }, { "_id": 121, "name": "Bioengineering" }, { "_id": 122, "name": "Bioengineering, biomedical engineering & clinical engineering" }, { "_id": 123, "name": "Bioethics, Bioethics and Health Law, Clinical Ethics" }, { "_id": 124, "name": "Biological Anthropology" }, { "_id": 125, "name": "Biological sciences" }, { "_id": 126, "name": "Biology" }, { "_id": 127, "name": "Biomaterials Science" }, { "_id": 128, "name": "Biomedical Engineering" }, { "_id": 129, "name": "Biomedical Sciences" }, { "_id": 130, "name": "Biostatistics" }, { "_id": 131, "name": "Biotechnologies" }, { "_id": 132, "name": "Botany" }, { "_id": 133, "name": "Bowling" }, { "_id": 134, "name": "British & Irish history" }, { "_id": 135, "name": "British Literature" }, { "_id": 136, "name": "Buddhism" }, { "_id": 137, "name": "Buddhist Studies" }, { "_id": 138, "name": "Building & construction" }, { "_id": 139, "name": "Building construction" }, { "_id": 140, "name": "Built Environment" }, { "_id": 141, "name": "Bulgarian" }, { "_id": 142, "name": "Burmese" }, { "_id": 143, "name": "Business" }, { "_id": 144, "name": "Business Administration" }, { "_id": 145, "name": "Business law" }, { "_id": 146, "name": "Business management" }, { "_id": 147, "name": "Business Math" }, { "_id": 148, "name": "Business Services" }, { "_id": 149, "name": "Business Studies" }, { "_id": 150, "name": "Business Technology" }, { "_id": 151, "name": "Calculus" }, { "_id": 152, "name": "Cardiology" }, { "_id": 153, "name": "Career Advice" }, { "_id": 154, "name": "Career Planning" }, { "_id": 155, "name": "Catering" }, { "_id": 156, "name": "Cebuano" }, { "_id": 157, "name": "Celtic studies" }, { "_id": 158, "name": "Ceramics" }, { "_id": 159, "name": "Chaplaincy" }, { "_id": 160, "name": "Chemical and Materials Engineering" }, { "_id": 161, "name": "Chemical Engineering" }, { "_id": 162, "name": "Chemical, process & energy engineering" }, { "_id": 163, "name": "Chemistry" }, { "_id": 164, "name": "Chemistry of foods" }, { "_id": 165, "name": "Chhattisgarhi" }, { "_id": 166, "name": "Child Development" }, { "_id": 167, "name": "Child Health" }, { "_id": 168, "name": "Childhood and Youth Studies" }, { "_id": 169, "name": "Childhood Education" }, { "_id": 170, "name": "Children\'s Issues" }, { "_id": 171, "name": "China Studies in Chinese" }, { "_id": 172, "name": "China Studies in English " }, { "_id": 173, "name": "Chinese" }, { "_id": 174, "name": "Chinese " }, { "_id": 175, "name": "Chinese Language " }, { "_id": 176, "name": "Chinese Literature" }, { "_id": 177, "name": "Chinese studies" }, { "_id": 178, "name": "Chinese, Gan" }, { "_id": 179, "name": "Chinese, Hakka" }, { "_id": 180, "name": "Chinese, Jinyu" }, { "_id": 181, "name": "Chinese, Mandarin" }, { "_id": 182, "name": "Chinese, Min Bei" }, { "_id": 183, "name": "Chinese, Min Nan" }, { "_id": 184, "name": "Chinese, Wu" }, { "_id": 185, "name": "Chinese, Xiang" }, { "_id": 186, "name": "Chinese, Yue" }, { "_id": 187, "name": "Chittagonian" }, { "_id": 188, "name": "Choir" }, { "_id": 189, "name": "Choreography" }, { "_id": 190, "name": "Christian Thought and History" }, { "_id": 191, "name": "Christianity" }, { "_id": 192, "name": "Cinematics & photography" }, { "_id": 193, "name": "Cinematography" }, { "_id": 194, "name": "Citizenship Studies" }, { "_id": 195, "name": "Civics" }, { "_id": 196, "name": "Civil Engineering" }, { "_id": 197, "name": "Civil Law" }, { "_id": 198, "name": "Classical Civilisation" }, { "_id": 199, "name": "Classical Greek studies" }, { "_id": 200, "name": "Classical literature" }, { "_id": 201, "name": "Classical Music" }, { "_id": 202, "name": "Classical Music Performance" }, { "_id": 203, "name": "Classical Music Studies" }, { "_id": 204, "name": "Classical studies" }, { "_id": 205, "name": "Classical Studies " }, { "_id": 206, "name": "Classics" }, { "_id": 207, "name": "Classics " }, { "_id": 208, "name": "Climate & Atmospheric Sciences" }, { "_id": 209, "name": "Clinical Biochemistry" }, { "_id": 210, "name": "Clinical Education" }, { "_id": 211, "name": "Clinical Ethics" }, { "_id": 212, "name": "Clinical Pharmacy" }, { "_id": 213, "name": "Clinical Rehabilitation" }, { "_id": 214, "name": "Clinical Research" }, { "_id": 215, "name": "Clothing and Textile Sciences" }, { "_id": 216, "name": "Clothing, Textiles and the Human Environment" }, { "_id": 217, "name": "Clothing/fashion design" }, { "_id": 218, "name": "Coaching" }, { "_id": 219, "name": "Cognitive Science" }, { "_id": 220, "name": "Cognitive-Behaviour Therapy" }, { "_id": 221, "name": "Communication" }, { "_id": 222, "name": "Communication and Culture " }, { "_id": 223, "name": "Communication skills" }, { "_id": 224, "name": "Communication Studies" }, { "_id": 225, "name": "Communications engineering" }, { "_id": 226, "name": "Community & Family Studies" }, { "_id": 227, "name": "Community Dentistry" }, { "_id": 228, "name": "Comparative literary studies" }, { "_id": 229, "name": "Complementary Health" }, { "_id": 230, "name": "Complementary medicines, therapies & well-being" }, { "_id": 231, "name": "Composition" }, { "_id": 232, "name": "Computational Modelling" }, { "_id": 233, "name": "Computational physics" }, { "_id": 234, "name": "Computer Aided Design {Digital Media}" }, { "_id": 235, "name": "Computer Aided Drafting" }, { "_id": 236, "name": "Computer and Information Science" }, { "_id": 237, "name": "Computer Applications" }, { "_id": 238, "name": "Computer generated visual & audio effects" }, { "_id": 239, "name": "Computer Graphics" }, { "_id": 240, "name": "Computer math" }, { "_id": 241, "name": "Computer programming" }, { "_id": 242, "name": "Computer Repair" }, { "_id": 243, "name": "Computer Science" }, { "_id": 244, "name": "Computer-aided drafting" }, { "_id": 245, "name": "COMPUTERS" }, { "_id": 246, "name": "Computing " }, { "_id": 247, "name": "Computing & information technology" }, { "_id": 248, "name": "Computing Applications" }, { "_id": 249, "name": "Concert band" }, { "_id": 250, "name": "Construction" }, { "_id": 251, "name": "Consumer education" }, { "_id": 252, "name": "Consumer Food Science" }, { "_id": 253, "name": "Consumer Math" }, { "_id": 254, "name": "Contemporary literature" }, { "_id": 255, "name": "Contemporary Music Performance" }, { "_id": 256, "name": "Continence Management" }, { "_id": 257, "name": "Conversational LANGUAGE" }, { "_id": 258, "name": "CORE - core subjects class" }, { "_id": 259, "name": "Cosmetology" }, { "_id": 260, "name": "Counselling" }, { "_id": 261, "name": "CPR training" }, { "_id": 262, "name": "Craft skills" }, { "_id": 263, "name": "Crafts" }, { "_id": 264, "name": "Creative Non-Fiction Writing in Science" }, { "_id": 265, "name": "Creative Writing " }, { "_id": 266, "name": "Criminal justice" }, { "_id": 267, "name": "Criminal Law" }, { "_id": 268, "name": "Criminology" }, { "_id": 269, "name": "Critical Gender Studies" }, { "_id": 270, "name": "Critical Thinking" }, { "_id": 271, "name": "Culinary Arts" }, { "_id": 272, "name": "Cultural anthropology" }, { "_id": 273, "name": "Cultural Studies" }, { "_id": 274, "name": "Current events" }, { "_id": 275, "name": "Cycling" }, { "_id": 276, "name": "Czech" }, { "_id": 277, "name": "Dance" }, { "_id": 278, "name": "Dance & culture" }, { "_id": 279, "name": "Dance & drama" }, { "_id": 280, "name": "Dance Education (for BEdSt GradDipEdTchg)" }, { "_id": 281, "name": "Dance Studies" }, { "_id": 282, "name": "Data" }, { "_id": 283, "name": "Debate" }, { "_id": 284, "name": "Deccan" }, { "_id": 285, "name": "Dental nursing" }, { "_id": 286, "name": "Dental Technology" }, { "_id": 287, "name": "Dental Therapy" }, { "_id": 288, "name": "Dentistry" }, { "_id": 289, "name": "Design & Technology" }, { "_id": 290, "name": "Design and Technology: Food Technology " }, { "_id": 291, "name": "Design and Technology: Product Design" }, { "_id": 292, "name": "Design and Technology: Systems and Control Technology " }, { "_id": 293, "name": "Design and Textiles " }, { "_id": 294, "name": "Design for Technology" }, { "_id": 295, "name": "Desktop Publishing" }, { "_id": 296, "name": "Development Studies" }, { "_id": 297, "name": "Dietetics" }, { "_id": 298, "name": "Digital Arts" }, { "_id": 299, "name": "Digital media" }, { "_id": 300, "name": "Discrete Mathematics" }, { "_id": 301, "name": "Divinity" }, { "_id": 302, "name": "Drafting" }, { "_id": 303, "name": "Drama" }, { "_id": 304, "name": "Drama and Theatre Studies " }, { "_id": 305, "name": "Drama Education (for BEdSt GradDipEdTchg)" }, { "_id": 306, "name": "Dramatics" }, { "_id": 307, "name": "Drawing" }, { "_id": 308, "name": "Drill Team, Honor Guard, Pageantry, Flag, Cheer" }, { "_id": 309, "name": "Driver\'s Education" }, { "_id": 310, "name": "Drugs and Human Health" }, { "_id": 311, "name": "Dutch" }, { "_id": 312, "name": "Dutch " }, { "_id": 313, "name": "Early childhood development" }, { "_id": 314, "name": "Early childhood education" }, { "_id": 315, "name": "Earth and Environmental Science" }, { "_id": 316, "name": "Earth and Ocean Science" }, { "_id": 317, "name": "Earth Science" }, { "_id": 318, "name": "Ecology" }, { "_id": 319, "name": "E-Commerce" }, { "_id": 320, "name": "Economics" }, { "_id": 321, "name": "Economics and Business " }, { "_id": 322, "name": "Education" }, { "_id": 323, "name": "Education & teaching" }, { "_id": 324, "name": "Education Learning" }, { "_id": 325, "name": "Education Management" }, { "_id": 326, "name": "Education Research" }, { "_id": 327, "name": "Educational Psychology" }, { "_id": 328, "name": "Electrical Engineering" }, { "_id": 329, "name": "Electronic & electrical engineering" }, { "_id": 330, "name": "Electronic Engineering" }, { "_id": 331, "name": "Electronics" }, { "_id": 332, "name": "Electronics Technology" }, { "_id": 333, "name": "Endodontics" }, { "_id": 334, "name": "Energy Studies" }, { "_id": 335, "name": "Engineering" }, { "_id": 336, "name": "Engineering & manufacturing" }, { "_id": 337, "name": "Engineering Studies" }, { "_id": 338, "name": "English" }, { "_id": 339, "name": "English and Linguistics" }, { "_id": 340, "name": "English as a second language" }, { "_id": 341, "name": "English for Speakers of Other Languages (for BEdSt GradDipEdTchg)" }, { "_id": 342, "name": "English language" }, { "_id": 343, "name": "English language & literature" }, { "_id": 344, "name": "English language and composition" }, { "_id": 345, "name": "English Language and Linguistics" }, { "_id": 346, "name": "English Language and Literature " }, { "_id": 347, "name": "English Linguistics" }, { "_id": 348, "name": "English literature" }, { "_id": 349, "name": "English literature and composition" }, { "_id": 350, "name": "English Studies" }, { "_id": 351, "name": "Entertainment" }, { "_id": 352, "name": "Entrepreneurial skills" }, { "_id": 353, "name": "Entrepreneurship" }, { "_id": 354, "name": "Environment and Society" }, { "_id": 355, "name": "Environmental & marine biology" }, { "_id": 356, "name": "Environmental Engineering" }, { "_id": 357, "name": "Environmental health" }, { "_id": 358, "name": "Environmental Management" }, { "_id": 359, "name": "Environmental Management " }, { "_id": 360, "name": "Environmental Science" }, { "_id": 361, "name": "Environmental Science " }, { "_id": 362, "name": "Environmental Sciences" }, { "_id": 363, "name": "Environmental studies" }, { "_id": 364, "name": "Environmental Studies " }, { "_id": 365, "name": "Environmental Toxicology" }, { "_id": 366, "name": "Equestrian Skills" }, { "_id": 367, "name": "Equine Science" }, { "_id": 368, "name": "ESL - English as second language" }, { "_id": 369, "name": "Ethics; see \"Religious Studies\"" }, { "_id": 370, "name": "Ethnic Studies" }, { "_id": 371, "name": "Ethnomusicology" }, { "_id": 372, "name": "European history" }, { "_id": 373, "name": "European Studies" }, { "_id": 374, "name": "Exercise and Sport Science" }, { "_id": 375, "name": "Exploring Early Childhood" }, { "_id": 376, "name": "Fabric & leather crafts" }, { "_id": 377, "name": "Family and Society (for BEdSt GradDipEdTchg)" }, { "_id": 378, "name": "Family and Systems Therapies" }, { "_id": 379, "name": "Family studies" }, { "_id": 380, "name": "Farm Management" }, { "_id": 381, "name": "Farming" }, { "_id": 382, "name": "Farsi, Eastern" }, { "_id": 383, "name": "Farsi, Western" }, { "_id": 384, "name": "Fashion and retail merchandising" }, { "_id": 385, "name": "Fashion and Textile Design" }, { "_id": 386, "name": "Fashion construction" }, { "_id": 387, "name": "Fencing" }, { "_id": 388, "name": "Figure skating" }, { "_id": 389, "name": "Film & sound recording" }, { "_id": 390, "name": "Film & Television" }, { "_id": 391, "name": "Film and Media Studies" }, { "_id": 392, "name": "Film as Literature" }, { "_id": 393, "name": "Film Production" }, { "_id": 394, "name": "Film Studies " }, { "_id": 395, "name": "Finance" }, { "_id": 396, "name": "Financial Management" }, { "_id": 397, "name": "Fine art" }, { "_id": 398, "name": "Fire science" }, { "_id": 399, "name": "Food & drink" }, { "_id": 400, "name": "Food and Drink Production" }, { "_id": 401, "name": "Food Science" }, { "_id": 402, "name": "Food Science and Technology" }, { "_id": 403, "name": "Food Service Management" }, { "_id": 404, "name": "Food Studies " }, { "_id": 405, "name": "Food Technology" }, { "_id": 406, "name": "Food, leisure & hospitality" }, { "_id": 407, "name": "Forensic & archaeological sciences" }, { "_id": 408, "name": "Forensic Analytical Science" }, { "_id": 409, "name": "Forensic Biology" }, { "_id": 410, "name": "Forensic Mental Health" }, { "_id": 411, "name": "Forensic Science" }, { "_id": 412, "name": "Forestry & arboriculture" }, { "_id": 413, "name": "French" }, { "_id": 414, "name": "French / Spanish / Latin" }, { "_id": 415, "name": "French Language " }, { "_id": 416, "name": "French Literature " }, { "_id": 417, "name": "French studies" }, { "_id": 418, "name": "Fulfulde, Nigerian" }, { "_id": 419, "name": "Functional Human Biology" }, { "_id": 420, "name": "Fundamental Math or Basic Math" }, { "_id": 421, "name": "Fundamentals of math" }, { "_id": 422, "name": "Furnishing" }, { "_id": 423, "name": "Further Mathematics" }, { "_id": 424, "name": "Further Mathematics " }, { "_id": 425, "name": "Gaelic studies" }, { "_id": 426, "name": "Games" }, { "_id": 427, "name": "Gardening" }, { "_id": 428, "name": "Gender Studies" }, { "_id": 429, "name": "Genealogy" }, { "_id": 430, "name": "General Engineering and Technology" }, { "_id": 431, "name": "General Paper " }, { "_id": 432, "name": "General Practice" }, { "_id": 433, "name": "General Practice (Dentistry)" }, { "_id": 434, "name": "General Science" }, { "_id": 435, "name": "General Studies" }, { "_id": 436, "name": "Genetics" }, { "_id": 437, "name": "Geographic Information Systems" }, { "_id": 438, "name": "Geographic Information Systems (GIS)" }, { "_id": 439, "name": "Geography" }, { "_id": 440, "name": "Geography & geology" }, { "_id": 441, "name": "Geology" }, { "_id": 442, "name": "Geology & Geosciences" }, { "_id": 443, "name": "Geometry" }, { "_id": 444, "name": "Geophysics" }, { "_id": 445, "name": "German" }, { "_id": 446, "name": "German Language" }, { "_id": 447, "name": "German Literature" }, { "_id": 448, "name": "German studies" }, { "_id": 449, "name": "German, Standard" }, { "_id": 450, "name": "Gerontology" }, { "_id": 451, "name": "Glass crafts" }, { "_id": 452, "name": "Global Development" }, { "_id": 453, "name": "Global Perspectives" }, { "_id": 454, "name": "Global studies" }, { "_id": 455, "name": "Golf" }, { "_id": 456, "name": "Government" }, { "_id": 457, "name": "Government and Politics " }, { "_id": 458, "name": "Government Information" }, { "_id": 459, "name": "Grammar" }, { "_id": 460, "name": "Graphic Design" }, { "_id": 461, "name": "Greek" }, { "_id": 462, "name": "Greek and Roman History" }, { "_id": 463, "name": "Guitar" }, { "_id": 464, "name": "Gujarati" }, { "_id": 465, "name": "Gujarati " }, { "_id": 466, "name": "Gymnastics" }, { "_id": 467, "name": "Hairdressing" }, { "_id": 468, "name": "Haitian Creole French" }, { "_id": 469, "name": "Handwork or handcrafts" }, { "_id": 470, "name": "Handwriting" }, { "_id": 471, "name": "Haryanvi" }, { "_id": 472, "name": "Hausa" }, { "_id": 473, "name": "Hazard Assessment and Management" }, { "_id": 474, "name": "Health" }, { "_id": 475, "name": "Health and Fitness" }, { "_id": 476, "name": "Health and Safety" }, { "_id": 477, "name": "Health and Social Care " }, { "_id": 478, "name": "Health Economics" }, { "_id": 479, "name": "Health Education (for BEdSt GradDipEdTchg)" }, { "_id": 480, "name": "Health Informatics" }, { "_id": 481, "name": "Health Information Systems" }, { "_id": 482, "name": "Health Management" }, { "_id": 483, "name": "Health Promotion (for PGCertPH)" }, { "_id": 484, "name": "Health Sciences" }, { "_id": 485, "name": "Health Services Policy" }, { "_id": 486, "name": "Health Studies" }, { "_id": 487, "name": "Health Systems and Services" }, { "_id": 488, "name": "Healthful Living {Personal Health}" }, { "_id": 489, "name": "Heating and cooling systems" }, { "_id": 490, "name": "Hebrew" }, { "_id": 491, "name": "Heritage studies" }, { "_id": 492, "name": "Heroes, Myth and Legend" }, { "_id": 493, "name": "High School Subjects" }, { "_id": 494, "name": "Higher Education" }, { "_id": 495, "name": "Hiking" }, { "_id": 496, "name": "Hiligaynon" }, { "_id": 497, "name": "Hindi" }, { "_id": 498, "name": "Hindi " }, { "_id": 499, "name": "Hindi Language" }, { "_id": 500, "name": "Hindi Literature" }, { "_id": 501, "name": "Hinduism" }, { "_id": 502, "name": "History" }, { "_id": 503, "name": "History and Philosophy of Science" }, { "_id": 504, "name": "History of art" }, { "_id": 505, "name": "History of Film" }, { "_id": 506, "name": "History of Science" }, { "_id": 507, "name": "Home Economics" }, { "_id": 508, "name": "Home Management" }, { "_id": 509, "name": "Home Organization" }, { "_id": 510, "name": "Honors Courses in any core subject" }, { "_id": 511, "name": "Honors Math in Algebra or Geometry" }, { "_id": 512, "name": "Horticulture" }, { "_id": 513, "name": "Hospitality" }, { "_id": 514, "name": "Hospitality and tourism" }, { "_id": 515, "name": "Hotel Management" }, { "_id": 516, "name": "Human Biology " }, { "_id": 517, "name": "Human Development" }, { "_id": 518, "name": "Human Geography" }, { "_id": 519, "name": "Human Nutrition" }, { "_id": 520, "name": "Human Resource Management" }, { "_id": 521, "name": "Human Resources Management" }, { "_id": 522, "name": "Human Services Law" }, { "_id": 523, "name": "Humanities" }, { "_id": 524, "name": "Hungarian" }, { "_id": 525, "name": "Ice Skating" }, { "_id": 526, "name": "Igbo" }, { "_id": 527, "name": "Illustration" }, { "_id": 528, "name": "Ilocano" }, { "_id": 529, "name": "Imaginative writing" }, { "_id": 530, "name": "Immunology" }, { "_id": 531, "name": "Improvisational Theater" }, { "_id": 532, "name": "Indigenous Development" }, { "_id": 533, "name": "Indigenous Studies" }, { "_id": 534, "name": "Indonesian" }, { "_id": 535, "name": "Industrial Design" }, { "_id": 536, "name": "Industrial Technology" }, { "_id": 537, "name": "Industrial/product design" }, { "_id": 538, "name": "Infection and Immunity" }, { "_id": 539, "name": "Information and Communication Technologies (for BEdSt GradDipEdTchg)" }, { "_id": 540, "name": "Information and Communications Technology" }, { "_id": 541, "name": "Information management" }, { "_id": 542, "name": "Information Processes and Technology" }, { "_id": 543, "name": "Information Science" }, { "_id": 544, "name": "Information systems" }, { "_id": 545, "name": "Information Technology" }, { "_id": 546, "name": "Instrumental Music" }, { "_id": 547, "name": "Instrumental Music - specific instrument" }, { "_id": 548, "name": "Integrated math" }, { "_id": 549, "name": "Interactive & electronic design" }, { "_id": 550, "name": "Interior Design" }, { "_id": 551, "name": "Intermediate Algebra" }, { "_id": 552, "name": "International Business" }, { "_id": 553, "name": "International Law" }, { "_id": 554, "name": "International politics" }, { "_id": 555, "name": "International relations" }, { "_id": 556, "name": "International Studies" }, { "_id": 557, "name": "Introduction to Algebra" }, { "_id": 558, "name": "Introduction to business" }, { "_id": 559, "name": "Investment & insurance" }, { "_id": 560, "name": "Irish " }, { "_id": 561, "name": "Irish studies" }, { "_id": 562, "name": "Islam" }, { "_id": 563, "name": "Islamic Studies" }, { "_id": 564, "name": "Islamic Studies " }, { "_id": 565, "name": "Italian" }, { "_id": 566, "name": "Italian studies" }, { "_id": 567, "name": "Japanese" }, { "_id": 568, "name": "Japanese Language" }, { "_id": 569, "name": "Japanese studies" }, { "_id": 570, "name": "Javanese" }, { "_id": 571, "name": "Jazz band" }, { "_id": 572, "name": "Jewelry design" }, { "_id": 573, "name": "Jewish Studies" }, { "_id": 574, "name": "Journalism" }, { "_id": 575, "name": "JROTC" }, { "_id": 576, "name": "Judaism" }, { "_id": 577, "name": "Kannada" }, { "_id": 578, "name": "Kazakh" }, { "_id": 579, "name": "Keyboarding" }, { "_id": 580, "name": "Khmer, Central" }, { "_id": 581, "name": "Knowledge and Inquiry" }, { "_id": 582, "name": "Korean" }, { "_id": 583, "name": "Korean Studies" }, { "_id": 584, "name": "Kurmanji" }, { "_id": 585, "name": "Land Planning and Development" }, { "_id": 586, "name": "Landscape & garden design" }, { "_id": 587, "name": "Language and Literature in English " }, { "_id": 588, "name": "Language Arts" }, { "_id": 589, "name": "Language Teaching (for BEdSt GradDipEdTchg)" }, { "_id": 590, "name": "Languages" }, { "_id": 591, "name": "Languages and Linguistics" }, { "_id": 592, "name": "Latin" }, { "_id": 593, "name": "Latin American Studies" }, { "_id": 594, "name": "Latin studies" }, { "_id": 595, "name": "Law" }, { "_id": 596, "name": "Law by geographic area" }, { "_id": 597, "name": "Law by topic" }, { "_id": 598, "name": "Leadership" }, { "_id": 599, "name": "Learning disability nursing" }, { "_id": 600, "name": "Leather Working" }, { "_id": 601, "name": "Legal Advice" }, { "_id": 602, "name": "Legal Studies" }, { "_id": 603, "name": "Leisure & tourism studies" }, { "_id": 604, "name": "Leisure and Tourism " }, { "_id": 605, "name": "Leisure Management" }, { "_id": 606, "name": "Leisure Studies " }, { "_id": 607, "name": "Library Studies" }, { "_id": 608, "name": "Life Lab or gardening" }, { "_id": 609, "name": "Life Science" }, { "_id": 610, "name": "Life skills" }, { "_id": 611, "name": "Life Skills Courses - Special Program of Study" }, { "_id": 612, "name": "Lifeguard training" }, { "_id": 613, "name": "Linguistics" }, { "_id": 614, "name": "Linguistics & classics" }, { "_id": 615, "name": "Literacy (for BEdSt GradDipEdTchg)" }, { "_id": 616, "name": "Literary analysis" }, { "_id": 617, "name": "Literature" }, { "_id": 618, "name": "Literature (for BEdSt GradDipEdTchg)" }, { "_id": 619, "name": "Livestock" }, { "_id": 620, "name": "LOGIC" }, { "_id": 621, "name": "Lombard" }, { "_id": 622, "name": "Macroeconomics" }, { "_id": 623, "name": "Madura" }, { "_id": 624, "name": "Magahi" }, { "_id": 625, "name": "Maintenance Services" }, { "_id": 626, "name": "Maithili" }, { "_id": 627, "name": "Malagasy" }, { "_id": 628, "name": "Malay" }, { "_id": 629, "name": "Malayalam" }, { "_id": 630, "name": "Management" }, { "_id": 631, "name": "Management studies" }, { "_id": 632, "name": "Manufacturing and Production" }, { "_id": 633, "name": "Māori Studies" }, { "_id": 634, "name": "Māori Studies (for BEdSt GradDipEdTchg)" }, { "_id": 635, "name": "Marathi" }, { "_id": 636, "name": "Marathi Language" }, { "_id": 637, "name": "Marching band" }, { "_id": 638, "name": "Marine Biology" }, { "_id": 639, "name": "Marine Engineering" }, { "_id": 640, "name": "Marine Science" }, { "_id": 641, "name": "Marine Science " }, { "_id": 642, "name": "Marine Sciences" }, { "_id": 643, "name": "Marine Studies" }, { "_id": 644, "name": "Maritime geography" }, { "_id": 645, "name": "Maritime technologies" }, { "_id": 646, "name": "Marketing" }, { "_id": 647, "name": "Marketing Management" }, { "_id": 648, "name": "Martial Arts" }, { "_id": 649, "name": "Marwari" }, { "_id": 650, "name": "Massage" }, { "_id": 651, "name": "Material technologies" }, { "_id": 652, "name": "Materials Science" }, { "_id": 653, "name": "Materials Sciences" }, { "_id": 654, "name": "Math applications" }, { "_id": 655, "name": "Mathematics" }, { "_id": 656, "name": "Mathematics & statistics" }, { "_id": 657, "name": "Mathematics Education (for BEdSt GradDipEdTchg)" }, { "_id": 658, "name": "Mechanical Diagnosis and Therapy" }, { "_id": 659, "name": "Mechanical Engineering" }, { "_id": 660, "name": "Mechanics" }, { "_id": 661, "name": "Media" }, { "_id": 662, "name": "Media & creative arts" }, { "_id": 663, "name": "Media Communication and Production " }, { "_id": 664, "name": "Media Studies" }, { "_id": 665, "name": "Media Studies " }, { "_id": 666, "name": "Media technology" }, { "_id": 667, "name": "Medical Laboratory Science" }, { "_id": 668, "name": "Medical physics" }, { "_id": 669, "name": "Medical technology" }, { "_id": 670, "name": "Medicine" }, { "_id": 671, "name": "Medicine, dentistry & optometry" }, { "_id": 672, "name": "Medicines Management" }, { "_id": 673, "name": "Medieval and Renaissance" }, { "_id": 674, "name": "Medieval History" }, { "_id": 675, "name": "Medieval Literature" }, { "_id": 676, "name": "Mental Health" }, { "_id": 677, "name": "Mental health nursing" }, { "_id": 678, "name": "Metal & Engineering" }, { "_id": 679, "name": "Metal crafts" }, { "_id": 680, "name": "Metal Shop" }, { "_id": 681, "name": "Metal Work" }, { "_id": 682, "name": "Metallurgy" }, { "_id": 683, "name": "Metalworking" }, { "_id": 684, "name": "Meteorology" }, { "_id": 685, "name": "Microbiology" }, { "_id": 686, "name": "Microeconomics" }, { "_id": 687, "name": "Middle Eastern studies" }, { "_id": 688, "name": "Middle School Subjects" }, { "_id": 689, "name": "Midwifery" }, { "_id": 690, "name": "Minerals technologies" }, { "_id": 691, "name": "Mining and Oil & Gas Operations" }, { "_id": 692, "name": "Ministry" }, { "_id": 693, "name": "Modern European languages & cultural studies" }, { "_id": 694, "name": "Modern Hebrew " }, { "_id": 695, "name": "Modern history" }, { "_id": 696, "name": "Modern History with US History" }, { "_id": 697, "name": "Modern Literature" }, { "_id": 698, "name": "Modern world studies" }, { "_id": 699, "name": "Molecular Basis of Health and Disease" }, { "_id": 700, "name": "Molecular biology, biophysics & biochemistry" }, { "_id": 701, "name": "Molecular Biotechnology" }, { "_id": 702, "name": "Moral and Political Thought" }, { "_id": 703, "name": "Motivating Behaviour Change" }, { "_id": 704, "name": "Movement or Eurythmy" }, { "_id": 705, "name": "Moving Image Arts " }, { "_id": 706, "name": "Moving image techniques" }, { "_id": 707, "name": "Multimedia" }, { "_id": 708, "name": "Multivariable calculus" }, { "_id": 709, "name": "Musculoskeletal Management" }, { "_id": 710, "name": "Musculoskeletal Medicine" }, { "_id": 711, "name": "Musculoskeletal Physiotherapy" }, { "_id": 712, "name": "Museum Studies" }, { "_id": 713, "name": "Music" }, { "_id": 714, "name": "Music Appreciation" }, { "_id": 715, "name": "Music Education (for BEdSt GradDipEdTchg)" }, { "_id": 716, "name": "Music education/teaching" }, { "_id": 717, "name": "Music Fundamentals" }, { "_id": 718, "name": "Music History" }, { "_id": 719, "name": "Music Industry" }, { "_id": 720, "name": "Music production" }, { "_id": 721, "name": "Music studies" }, { "_id": 722, "name": "Music Technology" }, { "_id": 723, "name": "Music Technology " }, { "_id": 724, "name": "Music technology & industry" }, { "_id": 725, "name": "Music Theory" }, { "_id": 726, "name": "Musical performance" }, { "_id": 727, "name": "Musicology" }, { "_id": 728, "name": "Nanotechnology" }, { "_id": 729, "name": "Napoletano-Calabrese" }, { "_id": 730, "name": "Naval architecture" }, { "_id": 731, "name": "Nepali" }, { "_id": 732, "name": "Networking" }, { "_id": 733, "name": "Neurorehabilitation" }, { "_id": 734, "name": "Neuroscience" }, { "_id": 735, "name": "New Zealand Studies" }, { "_id": 736, "name": "Non-industrial Design" }, { "_id": 737, "name": "Nursery teaching" }, { "_id": 738, "name": "Nursing" }, { "_id": 739, "name": "Nursing (Advanced Mental Health)" }, { "_id": 740, "name": "Nursing (Clinical)" }, { "_id": 741, "name": "Nursing (Gerontology)" }, { "_id": 742, "name": "Nursing (High Acuity)" }, { "_id": 743, "name": "Nursing (Leadership and Management)" }, { "_id": 744, "name": "Nursing (Long-term Condition Management)" }, { "_id": 745, "name": "Nursing (Primary Health Care)" }, { "_id": 746, "name": "Nursing (Specialty Mental Health)" }, { "_id": 747, "name": "Nursing, health & wellbeing" }, { "_id": 748, "name": "Nutrition" }, { "_id": 749, "name": "Nutrition & Dietetics" }, { "_id": 750, "name": "Nutrition and Health" }, { "_id": 751, "name": "Nutrition and Metabolism in Human Health" }, { "_id": 752, "name": "Nutrition Communication" }, { "_id": 753, "name": "Obstetrics and Gynaecology" }, { "_id": 754, "name": "Occupational Health" }, { "_id": 755, "name": "Occupational health & safety" }, { "_id": 756, "name": "Occupational Health Physiotherapy" }, { "_id": 757, "name": "Occupational Medicine" }, { "_id": 758, "name": "Occupational Therapy" }, { "_id": 759, "name": "Oceanography" }, { "_id": 760, "name": "Oceanography, Biological" }, { "_id": 761, "name": "Oceanography, Physical" }, { "_id": 762, "name": "Office Administration" }, { "_id": 763, "name": "Office skills" }, { "_id": 764, "name": "Operational research" }, { "_id": 765, "name": "Ophthalmology" }, { "_id": 766, "name": "Optometry" }, { "_id": 767, "name": "Oral and Maxillofacial Surgery" }, { "_id": 768, "name": "Oral Health" }, { "_id": 769, "name": "Oral Medicine" }, { "_id": 770, "name": "Oral Pathology" }, { "_id": 771, "name": "Oral Surgery" }, { "_id": 772, "name": "Orchestra" }, { "_id": 773, "name": "Organic Chemistry" }, { "_id": 774, "name": "Oriya" }, { "_id": 775, "name": "Oromo, West-Central" }, { "_id": 776, "name": "Orthodontics" }, { "_id": 777, "name": "Orthopaedic Manipulative Therapy" }, { "_id": 778, "name": "Outdoor Survival Skills" }, { "_id": 779, "name": "Pacific Islands Studies" }, { "_id": 780, "name": "Paediatric Dentistry" }, { "_id": 781, "name": "Pain and Pain Management" }, { "_id": 782, "name": "Painting" }, { "_id": 783, "name": "Panjabi, Eastern" }, { "_id": 784, "name": "Panjabi, Western" }, { "_id": 785, "name": "Paramedical science" }, { "_id": 786, "name": "Pashto, Northern" }, { "_id": 787, "name": "Pashto, Southern" }, { "_id": 788, "name": "Pastoral Studies" }, { "_id": 789, "name": "Pathology" }, { "_id": 790, "name": "Peace and Conflict Studies" }, { "_id": 791, "name": "Pedagogy" }, { "_id": 792, "name": "Percussion" }, { "_id": 793, "name": "Performance & live arts" }, { "_id": 794, "name": "Performance Studies " }, { "_id": 795, "name": "Performing Arts" }, { "_id": 796, "name": "Perinatal Mental Health" }, { "_id": 797, "name": "Periodontology" }, { "_id": 798, "name": "Persian " }, { "_id": 799, "name": "Personal Development, Health and Physical Education (PDHPE)" }, { "_id": 800, "name": "Personal finance" }, { "_id": 801, "name": "Personal Finance and Investing" }, { "_id": 802, "name": "Personal Organization" }, { "_id": 803, "name": "Pharmacology" }, { "_id": 804, "name": "Pharmacology, toxicology & pharmacy" }, { "_id": 805, "name": "Pharmacy" }, { "_id": 806, "name": "Pharmacy and Pharmacology" }, { "_id": 807, "name": "Philosophy" }, { "_id": 808, "name": "Philosophy and Ethics" }, { "_id": 809, "name": "Philosophy, Politics and Economics" }, { "_id": 810, "name": "Philosophy, theology & religion" }, { "_id": 811, "name": "Photography" }, { "_id": 812, "name": "Photography, Video and Digital Imaging" }, { "_id": 813, "name": "Photojournalism" }, { "_id": 814, "name": "Photoshop" }, { "_id": 815, "name": "Physical Activity and Health" }, { "_id": 816, "name": "Physical anthropology" }, { "_id": 817, "name": "Physical Education" }, { "_id": 818, "name": "Physical Education " }, { "_id": 819, "name": "Physical Education (for BEdSt GradDipEdTchg)" }, { "_id": 820, "name": "Physical Fitness" }, { "_id": 821, "name": "Physical Geography" }, { "_id": 822, "name": "Physical Science" }, { "_id": 823, "name": "Physical Sciences" }, { "_id": 824, "name": "Physics" }, { "_id": 825, "name": "Physiology" }, { "_id": 826, "name": "Physiotherapy" }, { "_id": 827, "name": "Piano  " }, { "_id": 828, "name": "Pilates" }, { "_id": 829, "name": "Planning" }, { "_id": 830, "name": "Planning (urban, rural & regional)" }, { "_id": 831, "name": "Plant and Crop Sciences" }, { "_id": 832, "name": "Plant Biotechnology" }, { "_id": 833, "name": "Plumbing" }, { "_id": 834, "name": "Podiatry" }, { "_id": 835, "name": "Poetry" }, { "_id": 836, "name": "Polish" }, { "_id": 837, "name": "Polish " }, { "_id": 838, "name": "Political Science" }, { "_id": 839, "name": "Political studies" }, { "_id": 840, "name": "Politics" }, { "_id": 841, "name": "Popular literature" }, { "_id": 842, "name": "Popular Music" }, { "_id": 843, "name": "Portuguese" }, { "_id": 844, "name": "Portuguese Literature " }, { "_id": 845, "name": "Portuguese studies" }, { "_id": 846, "name": "Pottery" }, { "_id": 847, "name": "Power and Energy Engineering" }, { "_id": 848, "name": "Practical math" }, { "_id": 849, "name": "Pre-algebra" }, { "_id": 850, "name": "Precalculus" }, { "_id": 851, "name": "Pre-calculus" }, { "_id": 852, "name": "Primary Bicultural Education" }, { "_id": 853, "name": "Primary Education" }, { "_id": 854, "name": "Primary Health Care" }, { "_id": 855, "name": "Primary Industries" }, { "_id": 856, "name": "Primary teaching" }, { "_id": 857, "name": "Printmaking" }, { "_id": 858, "name": "Probability" }, { "_id": 859, "name": "Producing & directing motion pictures" }, { "_id": 860, "name": "Product Design" }, { "_id": 861, "name": "Production & manufacturing engineering" }, { "_id": 862, "name": "Production technology" }, { "_id": 863, "name": "Professional Studies (Physical Education)" }, { "_id": 864, "name": "Programming" }, { "_id": 865, "name": "Project work" }, { "_id": 866, "name": "Property Management" }, { "_id": 867, "name": "Prosthodontics" }, { "_id": 868, "name": "Psychiatry" }, { "_id": 869, "name": "Psychological Medicine" }, { "_id": 870, "name": "Psychology" }, { "_id": 871, "name": "Public Health" }, { "_id": 872, "name": "Public Law" }, { "_id": 873, "name": "Publishing" }, { "_id": 874, "name": "Publishing Skills" }, { "_id": 875, "name": "Punjabi " }, { "_id": 876, "name": "Pure Mathematics" }, { "_id": 877, "name": "Quality Control" }, { "_id": 878, "name": "Quality Management" }, { "_id": 879, "name": "Quantitative literacy" }, { "_id": 880, "name": "Quantitative Methods" }, { "_id": 881, "name": "Quantitative Methods for Commerce" }, { "_id": 882, "name": "Racket sports" }, { "_id": 883, "name": "Radiation Therapy" }, { "_id": 884, "name": "Reading" }, { "_id": 885, "name": "Recording and Production" }, { "_id": 886, "name": "Recreation & leisure studies" }, { "_id": 887, "name": "Reed crafts" }, { "_id": 888, "name": "Reflexology" }, { "_id": 889, "name": "Refrigeration fundamentals" }, { "_id": 890, "name": "Regional Studies" }, { "_id": 891, "name": "Rehabilitation" }, { "_id": 892, "name": "Religion" }, { "_id": 893, "name": "Religious Education (for BEdSt GradDipEdTchg)" }, { "_id": 894, "name": "Religious Studies" }, { "_id": 895, "name": "Remedial English" }, { "_id": 896, "name": "Remedial Math" }, { "_id": 897, "name": "Renaissance History with US History" }, { "_id": 898, "name": "Renaissance Literature" }, { "_id": 899, "name": "Reproduction, Genetics and Development" }, { "_id": 900, "name": "Reproductive Mental Health" }, { "_id": 901, "name": "Research & study skills in education" }, { "_id": 902, "name": "Research Data Curation" }, { "_id": 903, "name": "Research Methods (for PGCertPH)" }, { "_id": 904, "name": "Research Projects " }, { "_id": 905, "name": "Research Skills" }, { "_id": 906, "name": "Resource Program" }, { "_id": 907, "name": "Responsible Leadership" }, { "_id": 908, "name": "Restorative Dentistry" }, { "_id": 909, "name": "Retail" }, { "_id": 910, "name": "Rhetoric" }, { "_id": 911, "name": "Robotics" }, { "_id": 912, "name": "Rock Climbing" }, { "_id": 913, "name": "Romanian" }, { "_id": 914, "name": "Rural and Provincial Hospital Practice" }, { "_id": 915, "name": "Rural estate management" }, { "_id": 916, "name": "Rural Nursing" }, { "_id": 917, "name": "Russian" }, { "_id": 918, "name": "Russian & East European studies" }, { "_id": 919, "name": "Rwanda" }, { "_id": 920, "name": "Sanskrit" }, { "_id": 921, "name": "Saraiki" }, { "_id": 922, "name": "SAT Prep" }, { "_id": 923, "name": "Scandinavian studies" }, { "_id": 924, "name": "Science" }, { "_id": 925, "name": "Science and Natural History Filmmaking" }, { "_id": 926, "name": "Science Communication" }, { "_id": 927, "name": "Science Education (for BEdSt GradDipEdTchg)" }, { "_id": 928, "name": "Science for Public Understanding" }, { "_id": 929, "name": "Science in Society" }, { "_id": 930, "name": "Science in Society " }, { "_id": 931, "name": "Science Innovation and Enterprise" }, { "_id": 932, "name": "Scottish studies" }, { "_id": 933, "name": "Sculpture" }, { "_id": 934, "name": "Secondary Education" }, { "_id": 935, "name": "Secondary teaching" }, { "_id": 936, "name": "Senior Science" }, { "_id": 937, "name": "Serbo-Croatian" }, { "_id": 938, "name": "Shona" }, { "_id": 939, "name": "Short Story" }, { "_id": 940, "name": "Sign Language" }, { "_id": 941, "name": "sindhi" }, { "_id": 942, "name": "Sinhala" }, { "_id": 943, "name": "Sleep Medicine" }, { "_id": 944, "name": "Small Engine Mechanics" }, { "_id": 945, "name": "Social Policy" }, { "_id": 946, "name": "Social Science" }, { "_id": 947, "name": "Social Skills" }, { "_id": 948, "name": "Social Studies" }, { "_id": 949, "name": "Social Studies Education (for BEdSt GradDipEdTchg)" }, { "_id": 950, "name": "Social Work" }, { "_id": 951, "name": "Society and Culture" }, { "_id": 952, "name": "Sociology" }, { "_id": 953, "name": "Software" }, { "_id": 954, "name": "Software Design & Development" }, { "_id": 955, "name": "Software engineering" }, { "_id": 956, "name": "Somali" }, { "_id": 957, "name": "Spanish" }, { "_id": 958, "name": "Spanish Language " }, { "_id": 959, "name": "Spanish Literature" }, { "_id": 960, "name": "Spanish or other foreign language" }, { "_id": 961, "name": "Spanish studies" }, { "_id": 962, "name": "Special Day Class" }, { "_id": 963, "name": "SPECIAL EDUCATION" }, { "_id": 964, "name": "Special Education Day Class" }, { "_id": 965, "name": "Special Needs Dentistry" }, { "_id": 966, "name": "Specialised Teaching" }, { "_id": 967, "name": "Specialist teaching" }, { "_id": 968, "name": "Specialized sports" }, { "_id": 969, "name": "Speech" }, { "_id": 970, "name": "Speech & language therapy" }, { "_id": 971, "name": "Speech and Debate" }, { "_id": 972, "name": "Speech Therapy" }, { "_id": 973, "name": "Sport & exercise science" }, { "_id": 974, "name": "Sport and Exercise Medicine" }, { "_id": 975, "name": "Sport and Exercise Nutrition" }, { "_id": 976, "name": "Sport and Leisure Studies" }, { "_id": 977, "name": "Sport and Physical Education" }, { "_id": 978, "name": "Sport sciences" }, { "_id": 979, "name": "Sport, Lifestyle and Recreation" }, { "_id": 980, "name": "Sports" }, { "_id": 981, "name": "Sports Business" }, { "_id": 982, "name": "Sports coaching" }, { "_id": 983, "name": "Sports Physiotherapy" }, { "_id": 984, "name": "Sports Science" }, { "_id": 985, "name": "Sports Technology" }, { "_id": 986, "name": "Statistics" }, { "_id": 987, "name": "Structural Engineering" }, { "_id": 988, "name": "Studies of Religion" }, { "_id": 989, "name": "Studio Music Teaching" }, { "_id": 990, "name": "Study Skills" }, { "_id": 991, "name": "Sunda" }, { "_id": 992, "name": "Supplementary Nutritional Science" }, { "_id": 993, "name": "Surface decoration" }, { "_id": 994, "name": "Surgical Anatomy" }, { "_id": 995, "name": "Surveying" }, { "_id": 996, "name": "Swedish" }, { "_id": 997, "name": "Swimming" }, { "_id": 998, "name": "Systems engineering" }, { "_id": 999, "name": "Tagalog" }, { "_id": 1000, "name": "Tamil" }, { "_id": 1001, "name": "Tamil language" }, { "_id": 1002, "name": "Tamil literature" }, { "_id": 1003, "name": "Tatar" }, { "_id": 1004, "name": "Teacher Education" }, { "_id": 1005, "name": "Teacher training" }, { "_id": 1006, "name": "Teacher Training PGCE" }, { "_id": 1007, "name": "Teaching" }, { "_id": 1008, "name": "Teaching English as a Foreign Language (TEFL)" }, { "_id": 1009, "name": "Teaching English to Speakers of Other Languages" }, { "_id": 1010, "name": "Team Sports (Soccer, volleyball, football, etc)" }, { "_id": 1011, "name": "Technical writing" }, { "_id": 1012, "name": "Technologies" }, { "_id": 1013, "name": "Technology Education (for BEdSt GradDipEdTchg)" }, { "_id": 1014, "name": "Telecommunications" }, { "_id": 1015, "name": "Telugu" }, { "_id": 1016, "name": "Telugu " }, { "_id": 1017, "name": "Telugu Language" }, { "_id": 1018, "name": "Telugu Literature" }, { "_id": 1019, "name": "Textiles" }, { "_id": 1020, "name": "Textiles & Design" }, { "_id": 1021, "name": "Thai" }, { "_id": 1022, "name": "Thai, Northeastern" }, { "_id": 1023, "name": "Theater & Dance" }, { "_id": 1024, "name": "Theater technology" }, { "_id": 1025, "name": "Theatre and Drama Studies" }, { "_id": 1026, "name": "Theatre Arts -{Beg., interm., and advanced}" }, { "_id": 1027, "name": "Theatre studies" }, { "_id": 1028, "name": "Theology" }, { "_id": 1029, "name": "Therapeutic" }, { "_id": 1030, "name": "Thinking Skills " }, { "_id": 1031, "name": "Topical history" }, { "_id": 1032, "name": "Tourism" }, { "_id": 1033, "name": "Toxicology" }, { "_id": 1034, "name": "Track and Field" }, { "_id": 1035, "name": "Translation studies" }, { "_id": 1036, "name": "Transportation and Logistics" }, { "_id": 1037, "name": "Travel and Tourism" }, { "_id": 1038, "name": "Travel Medicine" }, { "_id": 1039, "name": "Trigonometry" }, { "_id": 1040, "name": "Turkish" }, { "_id": 1041, "name": "Turkish " }, { "_id": 1042, "name": "Types of dance" }, { "_id": 1043, "name": "Types of music" }, { "_id": 1044, "name": "Typing" }, { "_id": 1045, "name": "U.S. History and Government" }, { "_id": 1046, "name": "Ukrainian" }, { "_id": 1047, "name": "United States History" }, { "_id": 1048, "name": "Urban Studies & Planning" }, { "_id": 1049, "name": "Urdu" }, { "_id": 1050, "name": "Urdu " }, { "_id": 1051, "name": "Urdu Language" }, { "_id": 1052, "name": "Urdu Literature " }, { "_id": 1053, "name": "US government" }, { "_id": 1054, "name": "US History" }, { "_id": 1055, "name": "Use of Mathematics" }, { "_id": 1056, "name": "Uyghur" }, { "_id": 1057, "name": "Uzbek, Northern" }, { "_id": 1058, "name": "Vehicle Engineering" }, { "_id": 1059, "name": "Veterinary Medicine" }, { "_id": 1060, "name": "Veterinary Science" }, { "_id": 1061, "name": "Video game development" }, { "_id": 1062, "name": "Videography" }, { "_id": 1063, "name": "Vietnamese" }, { "_id": 1064, "name": "Visual & audio effects" }, { "_id": 1065, "name": "Visual Arts" }, { "_id": 1066, "name": "Visual Arts Education (for BEdSt GradDipEdTchg)" }, { "_id": 1067, "name": "Visual Culture" }, { "_id": 1068, "name": "Visual Design" }, { "_id": 1069, "name": "Vocabulary" }, { "_id": 1070, "name": "Voice" }, { "_id": 1071, "name": "Web Design" }, { "_id": 1072, "name": "Web programming" }, { "_id": 1073, "name": "Weight training" }, { "_id": 1074, "name": "Weightlifting" }, { "_id": 1075, "name": "Welsh" }, { "_id": 1076, "name": "Welsh studies" }, { "_id": 1077, "name": "Wildlife Management" }, { "_id": 1078, "name": "Women’s studies" }, { "_id": 1079, "name": "Wood crafts" }, { "_id": 1080, "name": "Woodshop" }, { "_id": 1081, "name": "Woodworking" }, { "_id": 1082, "name": "Word Processing" }, { "_id": 1083, "name": "Work studies " }, { "_id": 1084, "name": "Works of Shakespeare" }, { "_id": 1085, "name": "Work-Study" }, { "_id": 1086, "name": "World Current Events (Global Issues)" }, { "_id": 1087, "name": "World Development " }, { "_id": 1088, "name": "World Geography" }, { "_id": 1089, "name": "World History" }, { "_id": 1090, "name": "World languages & cultural studies" }, { "_id": 1091, "name": "World Literature" }, { "_id": 1092, "name": "World music" }, { "_id": 1093, "name": "World politics" }, { "_id": 1094, "name": "World Religions" }, { "_id": 1095, "name": "Writing" }, { "_id": 1096, "name": "Written and oral communication" }, { "_id": 1097, "name": "Yearbook" }, { "_id": 1098, "name": "Yoga" }, { "_id": 1099, "name": "Yoruba" }, { "_id": 1100, "name": "Zhuang, Northern" }, { "_id": 1101, "name": "Zoology" }, { "_id": 1102, "name": "Zulu" }];
    Subject.create(subjectData, function (err, subjectData) {
        if (err)
            throw err;
        res.json(subjectData);
    });
});
ctrl.get("/dropcollection", function (req, res) {
    Subject.remove({}, function (err) {
        res.json('collection removed')
    });
});
ctrl.get('/getSubjectData/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var logged = req.session.passport.user;
        var current_members = [];
        var future_members = [];
        var past_members = [];
        var friends = [];
        var id = req.params.id;
        var is_member = false;
        getSubjectDetails(id, function (subjectDetails) {
            getFriendIds(logged, function (friendIds) {
                for (var i in subjectDetails.data.members) {
                    if (subjectDetails.data.members[i].user_id && friendIds.indexOf(subjectDetails.data.members[i].user_id._id) > -1) {
                        friends.push({ user_id: subjectDetails.data.members[i].user_id, status: 3 });
                    }
                    if (subjectDetails.data.members[i].user_id && subjectDetails.data.members[i].user_id._id == logged) {
                        is_member = true;
                    }
                    if (subjectDetails.data.members[i].from && subjectDetails.data.members[i].to) {
                        var subFromDate = new Date(subjectDetails.data.members[i].from).getTime();
                        var subToDate = new Date(subjectDetails.data.members[i].to).getTime();
                        if (subFromDate <= currentDate && currentDate <= subToDate) {
                            if (subjectDetails.data.members[i].user_id && subjectDetails.data.members[i].user_id._id != logged) {
                                if (friendIds.indexOf(subjectDetails.data.members[i].user_id._id) > -1) {
                                    current_members.push({ currentMember: subjectDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    current_members.push({ currentMember: subjectDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        } else if (subFromDate > currentDate) {
                            if (subjectDetails.data.members[i].user_id && subjectDetails.data.members[i].user_id._id != logged) {

                                if (friendIds.indexOf(subjectDetails.data.members[i].user_id._id) > -1) {
                                    future_members.push({ futureMember: subjectDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    future_members.push({ futureMember: subjectDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        } else if (subToDate < currentDate) {
                            if (subjectDetails.data.members[i].user_id && subjectDetails.data.members[i].user_id._id != logged) {
                                if (friendIds.indexOf(subjectDetails.data.members[i].user_id._id) > -1) {
                                    past_members.push({ pastMember: subjectDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    past_members.push({ pastMember: subjectDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        }
                    }
                }
                res.json({ status: 2, subjectDetails: subjectDetails.data, current_members: current_members, future_members: future_members, past_members: past_members, is_member: is_member, subjectJoinedFriends: friends });
            });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});

function getFriendsDetails(userId, callback) {
    User.findOne({ '_id': userId })
        .select('friends')
        .exec(function (err, user) {
            if (err)
                throw err;
            callback({ data: user });
        });
}


ctrl.get('/getSubjectData/getCurrentMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var current_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getSubjectDetails(id, function (subjectDetails) {
            for (var i in subjectDetails.data.members) {
                if (subjectDetails.data.members[i].from && subjectDetails.data.members[i].to) {
                    var subFromDate = new Date(subjectDetails.data.members[i].from).getTime();
                    var subToDate = new Date(subjectDetails.data.members[i].to).getTime();
                    if (subFromDate <= currentDate && currentDate <= subToDate) {
                        if (subjectDetails.data.members[i].user_id && subjectDetails.data.members[i].user_id._id != logged) {
                            current_members.push(subjectDetails.data.members[i].user_id);
                        }
                        //user_status 1=>current,2=>past,3=>future,4=>Subject Expert,5=>Teacher of Subject,6=>Just Interested
                        subjectDetails.data.members[i] = {
                            'from': subjectDetails.data.members[i].from,
                            'status': subjectDetails.data.members[i].status,
                            'subjects_user_type': subjectDetails.data.members[i].subjects_user_type,
                            'user_id': subjectDetails.data.members[i].user_id,
                            'to': subjectDetails.data.members[i].to,
                            'user_status': 1
                        };
                    } else if (subToDate < currentDate) {
                        subjectDetails.data.members[i] = {
                            'from': subjectDetails.data.members[i].from,
                            'status': subjectDetails.data.members[i].status,
                            'subjects_user_type': subjectDetails.data.members[i].subjects_user_type,
                            'user_id': subjectDetails.data.members[i].user_id,
                            'to': subjectDetails.data.members[i].to,
                            'user_status': 2
                        };
                    } else if (subFromDate > currentDate) {
                        subjectDetails.data.members[i] = {
                            'from': subjectDetails.data.members[i].from,
                            'status': subjectDetails.data.members[i].status,
                            'subjects_user_type': subjectDetails.data.members[i].subjects_user_type,
                            'user_id': subjectDetails.data.members[i].user_id,
                            'to': subjectDetails.data.members[i].to,
                            'user_status': 3
                        };
                    }
                }
                if (subjectDetails.data.members[i].subjects_user_type == 3) {
                    subjectDetails.data.members[i] = {
                        'from': subjectDetails.data.members[i].from,
                        'status': subjectDetails.data.members[i].status,
                        'subjects_user_type': subjectDetails.data.members[i].subjects_user_type,
                        'to': subjectDetails.data.members[i].to,
                        'user_id': subjectDetails.data.members[i].user_id,
                        'user_status': 4
                    };
                }
                if (subjectDetails.data.members[i].subjects_user_type == 4) {
                    subjectDetails.data.members[i] = {
                        'from': subjectDetails.data.members[i].from,
                        'status': subjectDetails.data.members[i].status,
                        'subjects_user_type': subjectDetails.data.members[i].subjects_user_type,
                        'to': subjectDetails.data.members[i].to,
                        'user_id': subjectDetails.data.members[i].user_id,
                        'user_status': 5
                    };
                }
                if (subjectDetails.data.members[i].subjects_user_type == 5) {
                    subjectDetails.data.members[i] = {
                        'from': subjectDetails.data.members[i].from,
                        'status': subjectDetails.data.members[i].status,
                        'subjects_user_type': subjectDetails.data.members[i].subjects_user_type,
                        'to': subjectDetails.data.members[i].to,
                        'user_id': subjectDetails.data.members[i].user_id,
                        'user_status': 6
                    };
                }
            }
            res.json({ status: 2, subjectDetails: subjectDetails.data, current_members: current_members });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/getSubjectData/getFutureMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var future_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getSubjectDetails(id, function (subjectDetails) {
            for (var i in subjectDetails.data.members) {
                if (subjectDetails.data.members[i].from && subjectDetails.data.members[i].to) {
                    var subFromDate = new Date(subjectDetails.data.members[i].from).getTime();
                    var subToDate = new Date(subjectDetails.data.members[i].to).getTime();
                    if (subFromDate > currentDate) {
                        if (subjectDetails.data.members[i].user_id && subjectDetails.data.members[i].user_id._id != logged) {
                            future_members.push(subjectDetails.data.members[i].user_id);
                        }
                    }
                }

            }
            res.json({ status: 2, subjectDetails: subjectDetails.data, future_members: future_members });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});
ctrl.get('/getSubjectData/getPastMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var past_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getSubjectDetails(id, function (subjectDetails) {
            for (var i in subjectDetails.data.members) {
                if (subjectDetails.data.members[i].from && subjectDetails.data.members[i].to) {
                    var subFromDate = new Date(subjectDetails.data.members[i].from).getTime();
                    var subToDate = new Date(subjectDetails.data.members[i].to).getTime();
                    if (subToDate < currentDate) {
                        if (subjectDetails.data.members[i].user_id && subjectDetails.data.members[i].user_id._id != logged) {
                            past_members.push(subjectDetails.data.members[i].user_id);
                        }
                    }
                }
            }
            res.json({ status: 2, subjectDetails: subjectDetails.data, past_members: past_members });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.get('/getSubjectData/getFriendSubjectMembers/:id', function (req, res) {
    if (req.session.passport) {
        var friend_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getSubjectDetails(id, function (subjectDetails) {
            getFriendIds(logged, function (friendIds) {
                for (var i in subjectDetails.data.members) {
                    if (subjectDetails.data.members[i].user_id && friendIds.indexOf(subjectDetails.data.members[i].user_id._id) > -1) {
                        friend_members.push(subjectDetails.data.members[i].user_id);
                    }
                }
                res.json({ status: 2, subjectDetails: subjectDetails.data, friend_members: friend_members });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

function getSubjectDetails(subject_id, callback) {
    Subject.findOne({ '_id': subject_id })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname subjects_user_type photo _id' })
        .exec(function (err, subject) {
            if (err)
                throw err;
            var data = subject.members.filter(function (member) {
                return member.user_id;
            });
            subject.members = data;
            callback({ data: subject });
        });
}

ctrl.get('/getUserSearchSubject/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var name = req.params.name;
        getSubjectSearchlistByUser(name, userId, [], function (data) {
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
            console.log(data);
            for (var i = 0; i < data.friends.length; i++) {
                if (data.friends[i].friend_id && data.friends[i].status == 3) {
                    ids.push(data.friends[i].friend_id);
                }
            }
            callback(ids);
        });
}

ctrl.get('/getMyWallSearchSubject/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var name = req.params.name;
        searchSubjectMyWall(name, function (data) {
            res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not logged In' });
    }
});

function searchSubjectMyWall(search_name, callback) {
    Subject.find({
        "name": new RegExp(search_name, "i"),
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, subject) {
            callback(subject);
        });
}

ctrl.get('/getFriendSearchSubject/:friendId/:name', function (req, res) {
    if (req.session.passport) {
        var name = req.params.name;
        var friendId = req.params.friendId;
        getFriendSubjectSearchlist(name, friendId, function (data) {
            res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getFriendSubjectSearchlist(search_name, friendId, callback) {
    Subject.find({
        "name": new RegExp(search_name, "i"),
        "members.user_id": friendId
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, subject) {
            callback(subject);
        });
}

ctrl.get('/test', function (req, res) {
    var College = require('../models/college');
    College.findOne({ 'name': 'Academy of Arts in Banská Bystrica' })
        .exec(function (err, data) {
            if (err)
                throw err;
            res.json(data);
        });
});

function sendNewSCDAddedMail(scdName, userId) {
    var fullUrl = "http://dev.stribein.com";
    getUserDetail(userId, function (userDetails) {
        locals = {
            email: 'admin@stribein.com',
            from: userDetails.local.email,
            subject: 'Subject',
            name: userDetails.fname + " " + (userDetails.lname ? userDetails.lname : ""),
            logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
            scdName: scdName,
            type: 1,
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
