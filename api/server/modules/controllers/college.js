var ctrl = require('express').Router();
module.exports = ctrl;

var locals;
var mailer = require('../../mailer/models');
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
var College = require('../models/college');
var User = require('../models/user');


ctrl.get('/', function (req, res) {
    var memIds;
    if (req.query.memIds) {
        memIds = JSON.parse(req.query.memIds);
        College.find({ _id: { $in: memIds } }, function (err, colleges) {
            if (err)
                throw err;
            console.log(colleges);
            res.json(colleges);
        });
    } else {
        College.find({}, function (err, colleges) {
            if (err)
                throw err;
            res.json(colleges);
        });
    }
});

ctrl.get('/delete', function (req, res) {
    College.remove(function (err, post) {
        if (err)
            throw err;
        data = { message: 'All college deleted' };
        res.json(data);
    });
});

ctrl.post('/addBulkCollege', function (req, res) {
    var College = require('../models/college');
    var college = [];
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
                        if (newdata) {
                            newdata = newdata.trim();
                        }
                        var collDefer = Q.defer();
                        College.findOne({ name: newdata }, function (err, finCollege) {
                            if (err)
                                collDefer.reject(err);
                            if (!finCollege) {
                                College.create({ "name": newdata }, function (err, insertData) {
                                    if (err)
                                        collDefer.reject(err);
                                    collDefer.resolve();
                                });
                            } else {
                                collDefer.resolve();
                            }
                        });
                        promiseArr.push(collDefer);
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

ctrl.post('/collegeSearch', function (req, res) {
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
        getCollegeSearchlist(req.body.name, idToFilter, function (data) {
            res.json({ status: 2, msg: "Search complete!", data: data });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});
ctrl.post('/collegeSearchByUser', function (req, res) {
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
        getCollegeSearchlistByUser(req.body.name, req.body.user_id, idToFilter, function (data) {
            res.json({ status: 2, msg: "Search complete!", data: data });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});

function getCollegeSearchlistByUser(search_name, userId, idToFilter, callback) {
    College.find({
        "name": new RegExp(search_name, "i"),
        "members.user_id": { $in: userId }
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, degree) {
            callback(degree);
        });
}

function getCollegeSearchlist(search_name, idToFilter, callback) {
    College.find({
        name: new RegExp(search_name, "i"),
        _id: { $not: { $in: idToFilter } }
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, degree) {
            callback(degree);
        });
}

ctrl.get('/getAllCollege/:counter', function (req, res) {
    var counter = req.params.counter;
    var limit = 50;
    var skip = (counter - 1) * 50;
    var memIds;
    if (req.session.passport && req.session.passport.type == 2) {
        if (req.query.memIds) {
            memIds = JSON.parse(req.query.memIds);
            College.find({ _id: { $in: memIds } })
                .select('name icon members post')
                .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
                .limit(limit)
                .skip(skip)
                .exec(function (err, colleges) {
                    if (err)
                        throw err;
                    College.count({ _id: { $in: memIds } }, function (err, total_colleges) {
                        if (err)
                            throw err;
                        console.log(colleges);
                        res.json({ data: colleges, total_colleges: total_colleges });
                    });
                });
        } else {
            College.find({})
                .select('name icon members post')
                .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
                .limit(limit)
                .skip(skip)
                .exec(function (err, colleges) {
                    if (err)
                        throw err;
                    College.count({})
                        .exec(function (err, total_colleges) {
                            if (err)
                                throw err;
                            res.json({ data: colleges, total_colleges: total_colleges });
                        });
                });
        }
    } else {
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.get('/dropDownList', function (req, res) {
    College.find({})
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function (err, college) {
            if (err)
                throw err;
            res.json(college);
        });
});

ctrl.get('/delete/:id', function (req, res) {
    var College = require('../models/college');
    var User = require('../models/user');
    var Post = require('../models/post');
    var college = new College();
    if (req.session.passport && req.session.passport.type == 2) {
        var CollegeId = req.params.id;
        College.find({ '_id': CollegeId })
            .select('name icon members post')
            .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
            .exec(function (err, college) {
                if (err) {
                    throw err;
                }
                if (college.length > 0) {
                    College.remove({ _id: CollegeId }, function (err, colleges) {
                        if (err)
                            throw err;
                        data = { message: 'User deleted' };
                        res.json(data);
                    });
                    for (var i = 0; i < college[0].members.length; i++) {
                        if (college[0].members[i].user_id != null) {
                            User.findByIdAndUpdate({ "_id": college[0].members[i].user_id._id }, { $pull: { college: { college_id: college[0]._id } } }, function (err, user) {
                                if (err)
                                    throw err;
                            });
                        }
                    }
                } else {
                    data = { message: 'User not found' };
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
        College.findById(req.params.id)
            .select('name icon members post')
            .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
            .exec(function (err, college) {
                if (err)
                    throw err;
                return res.json(college);
            });
    }
});

ctrl.post('/add', function (req, res) {
    var college = new College(req.body);
    var cDate = new Date();
    cUJDate = cDate;
    pUJDate = cDate;
    college.current_members = { user_id: req.body.cUserId, join_date: cUJDate };
    college.past_members = { user_id: req.body.pUserId, join_date: pUJDate };
    college.save(function (err, college) {
        if (err)
            throw err;
        res.json(college);
    });
});

ctrl.post('/addOnlyCollege', function (req, res) {
    var College = require('../models/college');
    var newCollege = new College();
    console.log("req.session.passport", req.session.passport);
    var userId = req.session.passport.user;
    if (req.session.passport) {
        College.findOne({ 'name': req.body.name }, function (err, Collegedata) {
            if (err) {
                throw err;
            }
            if (Collegedata) {
                res.json({ status: 3, msg: "College Already Added" });
            } else {
                if (req.body.name != '') {
                    newCollege.name = req.body.name;
                }
                newCollege.save(function (err, newCollege) {
                    if (err) {
                        throw err;
                    }
                    if (req.session.passport.type == 1) {
                        sendNewSCDAddedMail(req.body.name, userId);
                    }
                    res.json({ status: 2, msg: "College Added Successfully", data: newCollege });
                });
            }
        });
    } else {
        res.json({ msg: 'User Not Found' });
    }
});

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

ctrl.post('/addCollege/:name', function (req, res) {
    var College = require('../models/college');
    var newCollege = new College();
    var userId = req.session.passport.user;
    if (req.session.passport) {
        College.findOne({ 'name': req.params.name }, function (err, Collegedata) {
            if (err) {
                throw err;
            }
            if (Collegedata) {
                res.json({ status: 3, msg: "College Already Added" });
            } else {
                if (req.params.name != '') {
                    newCollege.name = req.params.name;
                }
                newCollege.save(function (err, newCollege) {
                    if (err) {
                        throw err;
                    }
                    upload(req, res, function (err) {
                        if (err) {
                            return
                        }
                        var ext = req.file.originalname.split('.').pop();
                        filename = newCollege._id + '.' + ext;

                        var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/College/Icon");
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                            if (err) {
                                return console.log(err);
                            }
                            College.findByIdAndUpdate(newCollege._id, {
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
                                res.json({ status: 2, msg: "College Added Successfully", data: newSub });
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

function sendNewSCDAddedMail(scdName, userId) {
    var fullUrl = "http://dev.stribein.com";
    getUserDetail(userId, function (userDetails) {
        locals = {
            email: 'admin@stribein.com',
            from: userDetails.local.email,
            subject: 'College',
            name: userDetails.fname + " " + (userDetails.lname ? userDetails.lname : ""),
            logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
            scdName: scdName,
            type: 2,
            siteLink: fullUrl,
        };
        mailer.sendOne('scd_added', locals, function (err, responseStatus, html, text) {
        });
    });
}

ctrl.post('/updateOnlyCollegeById/:id', function (req, res) {
    var College = require('../models/college');
    var name = req.body.name;
    var ID = req.params.id;
    if (req.session.passport && req.session.passport.type == 2) {
        College.findOne({ 'name': name }, function (err, Collegedata) {
            if (err) {
                throw err;
            }
            if (Collegedata) {
                res.json({ status: 3, msg: "College Already Added" });
            } else {
                College.findByIdAndUpdate(ID, {
                    $set: {
                        name: name,
                    }
                }, function (err, newSub) {
                    if (err) {
                        throw err;
                    }
                    College.find({ _id: ID }, function (err, updCollege) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: "College Updated Successfully", data: updCollege });
                    });
                });
            }
        });

    } else {
        res.json({ msg: 'User Not Found' });
    }
});

ctrl.post('/updateCollegeById/:id/:name', function (req, res) {
    var College = require('../models/college');
    var name = req.params.name;
    var ID = req.params.id;
    if (req.session.passport && req.session.passport.type == 2) {
        upload(req, res, function (err) {
            if (err) {
                return;
            }
            var ext = req.file.originalname.split('.').pop();
            filename = ID + '.' + ext;
            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/College/Icon");
            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                if (err) {
                    return console.log(err);
                }
                College.findOne({ 'name': name }, function (err, Collegedata) {
                    if (err) {
                        throw err;
                    }
                    if (Collegedata) {
                        College.findByIdAndUpdate(ID, {
                            $set: {
                                icon: filename,
                            }
                        }, function (err, newSub) {
                            if (err) {
                                throw err;
                            }
                            College.find({ _id: ID }, function (err, updCollege) {
                                if (err)
                                    throw err;
                                res.json({ status: 2, msg: "College Image Updated & Name Already Exist", data: updCollege });
                            });
                        });
                    } else {
                        College.findByIdAndUpdate(ID, {
                            $set: {
                                icon: filename,
                                name: name,
                            }
                        }, function (err, newSub) {
                            if (err) {
                                throw err;
                            }
                            College.find({ _id: ID }, function (err, updCollege) {
                                if (err)
                                    throw err;
                                res.json({ status: 2, msg: "College Added Successfully", data: updCollege });
                            });
                        });
                    }
                });
            });
        });
    } else {
        res.json({ msg: 'User Not Found' });
    }
});

ctrl.post('/addDegree', function (req, res) {
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
ctrl.get('/degreeDropDownList', function (req, res) {
    var Degree = require('../models/degree');
    Degree.find({})
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function (err, degree) {
            if (err)
                throw err;
            res.json(degree);
        });
});

ctrl.get('/getcollegeData/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var logged = req.session.passport.user;
        var current_members = [];
        var future_members = [];
        var past_members = [];
        var friend_members = [];
        var id = req.params.id;
        var is_member = false;
        getCollegeDetails(id, function (collegeDetails) {
            getFriendIds(logged, function (friendIds) {
                for (var i in collegeDetails.data.members) {
                    if (collegeDetails.data.members[i].user_id && friendIds.indexOf(collegeDetails.data.members[i].user_id._id) > -1) {
                        friend_members.push({ user_id: collegeDetails.data.members[i].user_id, status: 3 });
                    }
                    if (collegeDetails.data.members[i].user_id && collegeDetails.data.members[i].user_id._id == logged) {
                        is_member = true;
                    }
                    if (collegeDetails.data.members[i].from && collegeDetails.data.members[i].to) {
                        var collegeFromDate = new Date(collegeDetails.data.members[i].from).getTime();
                        var collegeToDate = new Date(collegeDetails.data.members[i].to).getTime();

                        if (collegeFromDate <= currentDate && currentDate <= collegeToDate) {
                            if (collegeDetails.data.members[i].user_id && collegeDetails.data.members[i].user_id._id != logged) {
                                if (friendIds.indexOf(collegeDetails.data.members[i].user_id._id) > -1) {
                                    current_members.push({ currentMember: collegeDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    current_members.push({ currentMember: collegeDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        } else if (collegeFromDate > currentDate) {
                            if (collegeDetails.data.members[i].user_id && collegeDetails.data.members[i].user_id._id != logged) {

                                if (friendIds.indexOf(collegeDetails.data.members[i].user_id._id) > -1) {
                                    future_members.push({ futureMember: collegeDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    future_members.push({ futureMember: collegeDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        } else if (collegeToDate < currentDate) {
                            if (collegeDetails.data.members[i].user_id && collegeDetails.data.members[i].user_id._id != logged) {
                                if (friendIds.indexOf(collegeDetails.data.members[i].user_id._id) > -1) {
                                    past_members.push({ pastMember: collegeDetails.data.members[i].user_id, status: 3 });
                                } else {
                                    past_members.push({ pastMember: collegeDetails.data.members[i].user_id, status: 2 });
                                }
                            }
                        }
                    }
                }
                res.json({ status: 2, collegeDetails: collegeDetails.data, current_members: current_members, future_members: future_members, past_members: past_members, is_member: is_member, friend_members: friend_members });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
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

ctrl.get('/getcollegeData/getCurrentMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var current_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getCollegeDetails(id, function (collegeDetails) {
            for (var i in collegeDetails.data.members) {
                if (collegeDetails.data.members[i].from && collegeDetails.data.members[i].to) {
                    var collegeFromDate = new Date(collegeDetails.data.members[i].from).getTime();
                    var collegeToDate = new Date(collegeDetails.data.members[i].to).getTime();
                    if (collegeFromDate <= currentDate && currentDate <= collegeToDate) {
                        if (collegeDetails.data.members[i].user_id && collegeDetails.data.members[i].user_id._id != logged) {
                            current_members.push(collegeDetails.data.members[i].user_id);
                        }
                    }
                }
            }
            res.json({ status: 2, collegeDetails: collegeDetails.data, current_members: current_members });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});
ctrl.get('/getcollegeData/getFutureMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var future_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getCollegeDetails(id, function (collegeDetails) {
            for (var i in collegeDetails.data.members) {
                if (collegeDetails.data.members[i].from && collegeDetails.data.members[i].to) {
                    var collegeFromDate = new Date(collegeDetails.data.members[i].from).getTime();
                    var collegeToDate = new Date(collegeDetails.data.members[i].to).getTime();
                    if (collegeFromDate > currentDate) {
                        if (collegeDetails.data.members[i].user_id && collegeDetails.data.members[i].user_id._id != logged) {
                            future_members.push(collegeDetails.data.members[i].user_id);
                        }
                    }
                }
            }

            res.json({ status: 2, collegeDetails: collegeDetails.data, future_members: future_members });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});

ctrl.get('/getcollegeData/getPastMembers/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var past_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getCollegeDetails(id, function (collegeDetails) {
            for (var i in collegeDetails.data.members) {
                if (collegeDetails.data.members[i].from && collegeDetails.data.members[i].to) {
                    var collegeFromDate = new Date(collegeDetails.data.members[i].from).getTime();
                    var collegeToDate = new Date(collegeDetails.data.members[i].to).getTime();
                    if (collegeToDate < currentDate) {
                        if (collegeDetails.data.members[i].user_id && collegeDetails.data.members[i].user_id._id != logged) {
                            past_members.push(collegeDetails.data.members[i].user_id);
                        }
                        collegeDetails.data.members[i] = {
                            'from': collegeDetails.data.members[i].from,
                            'status': collegeDetails.data.members[i].status,
                            'user_id': collegeDetails.data.members[i].user_id,
                            'to': collegeDetails.data.members[i].to,
                            'user_status': 2
                        };
                    } else if (collegeFromDate <= currentDate && currentDate <= collegeToDate) {
                        collegeDetails.data.members[i] = {
                            'from': collegeDetails.data.members[i].from,
                            'status': collegeDetails.data.members[i].status,
                            'user_id': collegeDetails.data.members[i].user_id,
                            'to': collegeDetails.data.members[i].to,
                            'user_status': 1
                        };
                    } else if (collegeFromDate > currentDate) {
                        collegeDetails.data.members[i] = {
                            'from': collegeDetails.data.members[i].from,
                            'status': collegeDetails.data.members[i].status,
                            'user_id': collegeDetails.data.members[i].user_id,
                            'to': collegeDetails.data.members[i].to,
                            'user_status': 3
                        };
                    }
                }
            }
            res.json({ status: 2, collegeDetails: collegeDetails.data, past_members: past_members });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.get('/getcollegeData/getFriendCollegeMembers/:id', function (req, res) {
    if (req.session.passport) {
        var friend_members = [];
        var id = req.params.id;
        var logged = req.session.passport.user;
        getCollegeDetails(id, function (collegeDetails) {
            getFriendIds(logged, function (friendIds) {
                for (var i in collegeDetails.data.members) {
                    if (collegeDetails.data.members[i].user_id && friendIds.indexOf(collegeDetails.data.members[i].user_id._id) > -1) {
                        friend_members.push(collegeDetails.data.members[i].user_id);
                    }
                }
                res.json({ status: 2, collegeDetails: collegeDetails.data, friend_members: friend_members });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

function getCollegeDetails(college_id, callback) {
    College.findOne({ '_id': college_id })
        .select('name country_id url icon members subjects post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function (err, college) {
            if (err)
                throw err;
            var data = college.members.filter(function (member) {
                return member.user_id;
            });
            college.members = data;
            callback({ data: college });
        });
}
ctrl.get('/deleteCollegeMember', function (req, res) {
    College.update({}, { $pull: { post: {}, members: {} } }, { multi: true }, function (err, post) {
        if (err)
            throw err;
        data = { message: 'All member Deleted deleted' };
        res.json(data);
    });
});

ctrl.get('/getUserSearchCollege/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var name = req.params.name;
        getCollegeSearchlistByUser(name, userId, [], function (data) {
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

ctrl.get('/getMyWallSearchCollege/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var name = req.params.name;
        searchCollegeMyWall(name, function (data) {
            res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function searchCollegeMyWall(search_name, callback) {
    College.find({
        "name": new RegExp(search_name, "i"),
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, college) {
            callback(college);
        });
}

ctrl.get('/getFriendSearchCollege/:friendId/:name', function (req, res) {
    if (req.session.passport) {
        var name = req.params.name;
        var friendId = req.params.friendId;
        getFriendCollegeSearchlist(name, friendId, function (data) {
            res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getFriendCollegeSearchlist(search_name, friendId, callback) {
    College.find({
        "name": new RegExp(search_name, "i"),
        "members.user_id": friendId
    }, { name: 1, _id: 1 })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .limit(10)
        .exec(function (err, college) {
            callback(college);
        });
}
ctrl.get('/setDefaultSubject', function (req, res) {
    var collegeData = [{
        "_id": 24680,
        "name": "Academia Nacional Superior de Orquesta",
    },
    {
        "_id": 24683,
        "name": "Academia Tehnica Militara",
    },
    {
        "_id": 24681,
        "name": "Academy of Arts 'George Enescu' Iasi",
    },
    {
        "_id": 24682,
        "name": "Academy of Arts in Banská Bystrica",
    },
    {
        "_id": 24684,
        "name": "Academy of Arts",
    },
    {
        "_id": 24685,
        "name": "Academy of Drama and Film",
    },
    {
        "_id": 24687,
        "name": "Academy of Economics 'Dimitur A.Tscenov'",
    },
    {
        "_id": 24688,
        "name": "Academy of Economics in Katowice",
    },
    {
        "_id": 24689,
        "name": "Academy of Economics in Poznan",
    },
    {
        "_id": 24693,
        "name": "Academy of Economics in Wroclaw",
    },
    {
        "_id": 24692,
        "name": "Academy of Fine Arts",
    },
    {
        "_id": 24690,
        "name": "Academy of Economic Studies of Moldova",
    },
    {
        "_id": 24691,
        "name": "Academy of Fine Arts and Design in Bratislava",
    },
    {
        "_id": 24694,
        "name": "Academy of Humanities and Economics in Lodz",
    },
    {
        "_id": 24697,
        "name": "Academy of International Economic and Political Relations, Gdynia",
    },
    {
        "_id": 24695,
        "name": "Academy of Management and Entrepreneurship",
    },
    {
        "_id": 24696,
        "name": "Academy of Music, Dance and Fine Arts",
    },
    {
        "_id": 24698,
        "name": "Academy of Music 'Georghe Dima' Cluj-Napoca",
    },
    {
        "_id": 24699,
        "name": "Academy of Performing Arts, Film and TV Fakulty",
    },
    {
        "_id": 24700,
        "name": "Academy of Public Administration",
    },
    {
        "_id": 24701,
        "name": "Academy of Public Administration of Belarus",
    },
    {
        "_id": 24702,
        "name": "Academy of Sports and Physical Training",
    },
    {
        "_id": 24703,
        "name": "Academy of the Ministry of Internal Affairs of the Republic of Belarus",
    },
    {
        "_id": 24704,
        "name": "Acadia University",
    },
    {
        "_id": 24705,
        "name": "Accra Polytechnic",
    },
    {
        "_id": 24706,
        "name": "Acdemic Center for Law and Business",
    },
    {
        "_id": 24709,
        "name": "Acharya Nagarjuna University",
    },
    {
        "_id": 24707,
        "name": "Acharya Ranga Agricultural University",
    },
    {
        "_id": 24710,
        "name": "Adamawa State University",
    },
    {
        "_id": 24708,
        "name": "Adama Science and Technology University",
    },
    {
        "_id": 24711,
        "name": "Adam Mickiewicz University of Poznan",
    },
    {
        "_id": 24712,
        "name": "Adamson University",
    },
    {
        "_id": 24713,
        "name": "Addis Ababa Science & Technology University",
    },
    {
        "_id": 24714,
        "name": "Addis Ababa University",
    },
    {
        "_id": 24715,
        "name": "Adekunle Ajasin University",
    },
    {
        "_id": 24716,
        "name": "Adeleke University",
    },
    {
        "_id": 24717,
        "name": "Adeyemi College of Education",
    },
    {
        "_id": 24718,
        "name": "Adiban Higher Education Institue",
    },
    {
        "_id": 24719,
        "name": "Adigrat University",
    },
    {
        "_id": 24722,
        "name": "Adnan Menderes University",
    },
    {
        "_id": 24720,
        "name": "Advance Tertiary College",
    },
    {
        "_id": 24721,
        "name": "Adventist University of Africa",
    },
    {
        "_id": 24723,
        "name": "Adventist University of Central Africa",
    },
    {
        "_id": 24724,
        "name": "Adventist University of the Philippines",
    },
    {
        "_id": 24725,
        "name": "Adygeja State University",
    },
    {
        "_id": 24727,
        "name": "Aegean University",

        post: []
    },
    {
        "_id": 24726,
        "name": "Afe Babalola University",
    },
    {
        "_id": 24728,
        "name": "Afeka Tel Aviv Academic College of Engineering",
    },
    {
        "_id": 24729,
        "name": "Afghan University",
    },
    {
        "_id": 24732,
        "name": "Africa International University",
    },
    {
        "_id": 24730,
        "name": "Africa Nazarene University",
    },
    {
        "_id": 24731,
        "name": "African University of Science and Technology",
    },
    {
        "_id": 24734,
        "name": "African Virtual University",
    },
    {
        "_id": 24733,
        "name": "Africa University",
    },
    {
        "_id": 24737,
        "name": "Afyon Kocatepe University",
    },
    {
        "_id": 24735,
        "name": "Aga Khan University",
    },
    {
        "_id": 24736,
        "name": "Agder University College",
    },
    {
        "_id": 24738,
        "name": "AGH University of Science and Technology",
    },
    {
        "_id": 24739,
        "name": "Agricultural-Technical Academy in Olsztyn",
    },
    {
        "_id": 24740,
        "name": "Agricultural University of Athens",
    },
    {
        "_id": 24741,
        "name": "Agricultural University of Cracow",
    },
    {
        "_id": 24742,
        "name": "Agricultural University of Georgia",

        post: []
    },
    {
        "_id": 24744,
        "name": "Agricultural University of Lublin",
    },
    {
        "_id": 24743,
        "name": "Agricultural University of Norway",
    },
    {
        "_id": 24747,
        "name": "Agricultural University of Plovdiv",
    },
    {
        "_id": 24745,
        "name": "Agricultural University of Poznan",
    },
    {
        "_id": 24746,
        "name": "Agricultural University of Szczecin",
    },
    {
        "_id": 24748,
        "name": "Agricultural University of Tirane",
    },
    {
        "_id": 24749,
        "name": "Agricultural University of Warsaw",
    },
    {
        "_id": 24750,
        "name": "Agricultural University of Wroclaw",
    },
    {
        "_id": 24751,
        "name": "Agriculture and Forestry University",
    },
    {
        "_id": 24752,
        "name": "AgroParisTech",
    },
    {
        "_id": 24753,
        "name": "Ahfad University for Women",
    },
    {
        "_id": 24754,
        "name": "Ahi Evran University",
    },
    {
        "_id": 24755,
        "name": "Ahlulbait International University",
    },
    {
        "_id": 24756,
        "name": "Ahmadu Bello University",
    },
    {
        "_id": 24757,
        "name": "Ahmedabad University",
    },
    {
        "_id": 24758,
        "name": "Ahsanullah University of Science & Technology",
    },
    {
        "_id": 24759,
        "name": "Ahvaz University of Medical Sciences",
    },
    {
        "_id": 24760,
        "name": "Ahwaz Jondishapour University of Medical Sciences",
    },
    {
        "_id": 24762,
        "name": "Aichi Bunkyo University",
    },
    {
        "_id": 24761,
        "name": "Aichi Gakuin University",
    },
    {
        "_id": 24763,
        "name": "Aichi Gakusen University",
    },
    {
        "_id": 24764,
        "name": "Aichi Institute of Technology",
    },
    {
        "_id": 24767,
        "name": "Aichi Medical University",
    },
    {
        "_id": 24765,
        "name": "Aichi Prefectural University",
    },
    {
        "_id": 24766,
        "name": "Aichi Prefectural University of Fine Arts & Music",
    },
    {
        "_id": 24768,
        "name": "Aichi Sangyo University",
    },
    {
        "_id": 24769,
        "name": "Aichi Shukutoku University",
    },
    {
        "_id": 24770,
        "name": "Aichi University",
    },
    {
        "_id": 24772,
        "name": "Aichi University of Education",
    },
    {
        "_id": 24771,
        "name": "Aikoku Gakuen University",
    },
    {
        "_id": 24773,
        "name": "Aimst University",
    },
    {
        "_id": 24774,
        "name": "Ain Shams University",
    },
    {
        "_id": 24777,
        "name": "Air University",
    },
    {
        "_id": 24775,
        "name": "AISECT University",
    },
    {
        "_id": 24776,
        "name": "AISTEDA",
    },
    {
        "_id": 24778,
        "name": "Ajayi Crowther University",
    },
    {
        "_id": 24779,
        "name": "Ajman University of Science & Technology",
    },
    {
        "_id": 24780,
        "name": "Ajou University",
    },
    {
        "_id": 24781,
        "name": "Akademia Podlaska",
    },
    {
        "_id": 24782,
        "name": "Akademie der bildenden Künste Wien",
    },
    {
        "_id": 24783,
        "name": "AKAD Hochschulen für Berufstätige, Fachhochschule Leipzig",
    },
    {
        "_id": 24784,
        "name": "Akaki Tsereteli State University",
    },
    {
        "_id": 24785,
        "name": "Akanu Ibiam Federal Polytechnic, Unwana",
    },
    {
        "_id": 24786,
        "name": "Akdeniz University",
    },
    {
        "_id": 24788,
        "name": "Akita University",
    },
    {
        "_id": 24789,
        "name": "Akita University of Economics and Law",
    },
    {
        "_id": 24790,
        "name": "Aklan Catholic College",
    },
    {
        "_id": 24787,
        "name": "Akhbar El Yom Academy",
    },
    {
        "_id": 24792,
        "name": "Aksum University",
    },
    {
        "_id": 24793,
        "name": "Aktau State University",
    },
    {
        "_id": 24794,
        "name": "Akwa Ibom State University of Technology",
    },
    {
        "_id": 24791,
        "name": "Akrofi-Christaller Institute of Theeology, Mission and Culture",
    },
    {
        "_id": 24796,
        "name": "Alahgaff University",
    },
    {
        "_id": 24797,
        "name": "Al Ahlia University",
    },
    {
        "_id": 24798,
        "name": "Al-Ahliyya Amman University",
    },
    {
        "_id": 24795,
        "name": "Alagappa University",
    },
    {
        "_id": 24800,
        "name": "Al Akhawayn University",
    },
    {
        "_id": 24801,
        "name": "Al al-Bayt University",
    },
    {
        "_id": 24802,
        "name": "Al-Aqsa University",
    },
    {
        "_id": 24803,
        "name": "Al-Asmarya University for Islamic Studies",
    },
    {
        "_id": 24799,
        "name": "Alain University of Science and Technology",
    },
    {
        "_id": 24805,
        "name": "Al Azhar University",
    },
    {
        "_id": 24804,
        "name": "Al-Azhar University of Gaza",
    },
    {
        "_id": 24806,
        "name": "Al-Baath University",
    },
    {
        "_id": 24807,
        "name": "Al-baha University",
    },
    {
        "_id": 24809,
        "name": "Al-Batterjee Medical College",
    },
    {
        "_id": 24810,
        "name": "Albert-Ludwigs-Universität Freiburg",
    },
    {
        "_id": 24811,
        "name": "Al-Birony University",
    },
    {
        "_id": 24808,
        "name": "Al-Balqa Applied University",
    },
    {
        "_id": 24813,
        "name": "Al-Buraimi University College",
    },
    {
        "_id": 24814,
        "name": "Aleksander Gieysztor School of Humanities in Pultusk",
    },
    {
        "_id": 24815,
        "name": "Aleksander Zelwerowicz State Theatre Academy",
    },
    {
        "_id": 24816,
        "name": "Al-Eman University",
    },
    {
        "_id": 24812,
        "name": "Al-Bukhari International University",
    },
    {
        "_id": 24817,
        "name": "Aletheia University",
    },
    {
        "_id": 24818,
        "name": "Alexandria University",
    },
    {
        "_id": 24819,
        "name": "Alfaisal University",
    },
    {
        "_id": 24820,
        "name": "Al Falah University",
    },
    {
        "_id": 24822,
        "name": "Al Fashir University",
    },
    {
        "_id": 24823,
        "name": "Alfred Nobel University of Economics and Law",
    },
    {
        "_id": 24824,
        "name": "Al Ghurair University",
    },
    {
        "_id": 24821,
        "name": "Al-Farabi Kazakh National University",
    },
    {
        "_id": 24826,
        "name": "Alhamd Islamic University",
    },
    {
        "_id": 24827,
        "name": "Al-hikmah University",
    },
    {
        "_id": 24828,
        "name": "Alhosn University",
    },
    {
        "_id": 24825,
        "name": "Algonquin College",
    },
    {
        "_id": 24830,
        "name": "Alice-Salomon-Fachhochschule für Sozialarbeit und Sozialpädagogik Berlin",
    },
    {
        "_id": 24831,
        "name": "Aligarh Muslim University",
    },
    {
        "_id": 24832,
        "name": "Al Imam Al-Ouzai University",
    },
    {
        "_id": 24829,
        "name": "Al Hussein Bin Talal University",
    },
    {
        "_id": 24834,
        "name": "Al-Islah University",
    },
    {
        "_id": 24835,
        "name": "Al-Isra University",
    },
    {
        "_id": 24836,
        "name": "Al-Jabal Al-Gharbi University",
    },
    {
        "_id": 24833,
        "name": "Al-Imam Mohamed Ibn Saud Islamic University",
    },
    {
        "_id": 24838,
        "name": "Al-Khair University",
    },
    {
        "_id": 24839,
        "name": "Alkharj University",
    },
    {
        "_id": 24840,
        "name": "Al Khawarizmi International College",
    },
    {
        "_id": 24837,
        "name": "Aljouf University",
    },
    {
        "_id": 24842,
        "name": "Allahabad University",
    },
    {
        "_id": 24843,
        "name": "Allama Iqbal Open University",
    },
    {
        "_id": 24844,
        "name": "Allameh Tabatabaie University",
    },
    {
        "_id": 24841,
        "name": "Allahabad Agricultural Institute, Deemed University",
    },
    {
        "_id": 24846,
        "name": "All India Institute of Medical Sciences",
    },
    {
        "_id": 24847,
        "name": "All Nations University College",
    },
    {
        "_id": 24848,
        "name": "Al Maarif University College",
    },
    {
        "_id": 24845,
        "name": "Allianze College of Medical Sciences (ACMS)",
    },
    {
        "_id": 24850,
        "name": "Al Mamon University College",
    },
    {
        "_id": 24851,
        "name": "Al-Manar University",
    },
    {
        "_id": 24852,
        "name": "Al Mansour University College",
    },
    {
        "_id": 24849,
        "name": "Al Madinah International University",
    },
    {
        "_id": 24854,
        "name": "Al Muthanna University",
    },
    {
        "_id": 24855,
        "name": "Al Nahrain University",
    },
    {
        "_id": 24856,
        "name": "Al-Nasser University",
    },
    {
        "_id": 24853,
        "name": "Almustafa Open University",
    },
    {
        "_id": 24858,
        "name": "Al-Quds Open University",
    },
    {
        "_id": 24859,
        "name": "Al-Quds University - The Arab University in Jerusalem",
    },
    {
        "_id": 24860,
        "name": "Al Rafidain University College",
    },
    {
        "_id": 24857,
        "name": "Alpha Omega University",
    },
    {
        "_id": 24862,
        "name": "Alsadrain University",
    },
    {
        "_id": 24863,
        "name": "Altai State Medical University",
    },
    {
        "_id": 24864,
        "name": "Altai State Technical University",
    },
    {
        "_id": 24861,
        "name": "Al Rasheed University College",
    },
    {
        "_id": 24866,
        "name": "Al Turath University College",
    },
    {
        "_id": 24867,
        "name": "Al-Wataniya Private University",
    },
    {
        "_id": 24868,
        "name": "Al-Yamamah College",
    },
    {
        "_id": 24865,
        "name": "Altai State University",
    },
    {
        "_id": 24870,
        "name": "Al-Zaiem Al-Azhari University",
    },
    {
        "_id": 24871,
        "name": "Al-Zaytoonah University",
    },
    {
        "_id": 24872,
        "name": "Ama International University",
    },
    {
        "_id": 24869,
        "name": "Al Yarmouk University College",
    },
    {
        "_id": 24874,
        "name": "Ambrose Alli University",
    },
    {
        "_id": 24875,
        "name": "American College Of Dubai",
    },
    {
        "_id": 24876,
        "name": "American College of Greece",
    },
    {
        "_id": 24873,
        "name": "Ambo University",
    },
    {
        "_id": 24878,
        "name": "American Graduate School in Paris",
    },
    {
        "_id": 24879,
        "name": "American InterContinental University - London",
    },
    {
        "_id": 24877,
        "name": "American College of Thessaloniki",
    },
    {
        "_id": 24880,
        "name": "American International University - Bangladesh",
    },
    {
        "_id": 24881,
        "name": "American International University West Africa",
    },
    {
        "_id": 24882,
        "name": "Americanos College",
    },
    {
        "_id": 24883,
        "name": "American University",
    },
    {
        "_id": 24885,
        "name": "American University Extension, Okinawa",
    },
    {
        "_id": 24886,
        "name": "American University in Bulgaria",
    },
    {
        "_id": 24887,
        "name": "American University in Cairo",
    },
    {
        "_id": 24884,
        "name": "American University College of Technology",
    },
    {
        "_id": 24889,
        "name": "American University In Kosovo",
    },
    {
        "_id": 24890,
        "name": "American University in the Emirates",
    },
    {
        "_id": 24891,
        "name": "American University of Afghanistan",
    },
    {
        "_id": 24888,
        "name": "American University in Dubai",
    },
    {
        "_id": 24893,
        "name": "American University of Armenia",
    },
    {
        "_id": 24894,
        "name": "American University of Beirut",
    },
    {
        "_id": 24895,
        "name": "American University of Central Asia",
    },
    {
        "_id": 24892,
        "name": "American University of Antigua",
    },
    {
        "_id": 24897,
        "name": "American University of Iraq, Sulaimani (Kurdistan Region)",
    },
    {
        "_id": 24898,
        "name": "American University of Kuwait",
    },
    {
        "_id": 24899,
        "name": "American University of Middle East",
    },
    {
        "_id": 24896,
        "name": "American University of Hawaii, Punjab Campus",
    },
    {
        "_id": 24902,
        "name": "American University of Sharjah",
    },
    {
        "_id": 24900,
        "name": "American University of Paris",
    },
    {
        "_id": 24905,
        "name": "American University of the Caribbean, Sint Maarten",
    },
    {
        "_id": 24901,
        "name": "American University of Science and Technology",
    },
    {
        "_id": 24903,
        "name": "American University of the Caribbean",
    },
    {
        "_id": 24904,
        "name": "American University of the Caribbean, School of Medicine",
    },
    {
        "_id": 24907,
        "name": "Amirkabir College of Managmant & Technology",
    },
    {
        "_id": 24908,
        "name": "Amirkabir University of Technology",
    },
    {
        "_id": 24909,
        "name": "Amity University",
    },
    {
        "_id": 24906,
        "name": "American University of Tirana",
    },
    {
        "_id": 24911,
        "name": "Amman University",
    },
    {
        "_id": 24912,
        "name": "Amoud University",
    },
    {
        "_id": 24913,
        "name": "Amravati University",
    },
    {
        "_id": 24914,
        "name": "Amrita Vishwa Vidyapeetham (Deemed University)",
    },
    {
        "_id": 24910,
        "name": "Amman Arab University for Higher Studies",
    },
    {
        "_id": 24915,
        "name": "Amur State University",
    },
    {
        "_id": 24916,
        "name": "Anadolu University",
    },
    {
        "_id": 24917,
        "name": "Anambra State University of Science and Technology",
    },
    {
        "_id": 24918,
        "name": "Andhra University",
    },
    {
        "_id": 24920,
        "name": "Andrassy Gyula German Speaking University Budapest",
    },
    {
        "_id": 24922,
        "name": "Angeles University",
    },
    {
        "_id": 24921,
        "name": "Andrzej Frycz Modrzewski Cracow College",
    },
    {
        "_id": 24919,
        "name": "Andong National University",
    },
    {
        "_id": 24924,
        "name": "Anglia Ruskin University",
    },
    {
        "_id": 24926,
        "name": "Anglo-American University",
    },
    {
        "_id": 24925,
        "name": "Anhui Medical University",
    },
    {
        "_id": 24923,
        "name": "Angkor University",
    },
    {
        "_id": 24928,
        "name": "Anhui Technical College of Water Resources and Hydroelectric Power",
    },
    {
        "_id": 24929,
        "name": "Anhui University",
    },
    {
        "_id": 24930,
        "name": "Anhui University of Finance and Economics",
    },
    {
        "_id": 24927,
        "name": "Anhui Normal University",
    },
    {
        "_id": 24932,
        "name": "Ankara University",
    },
    {
        "_id": 24933,
        "name": "An-Najah National University",
    },
    {
        "_id": 24934,
        "name": "Annamalai University",
    },
    {
        "_id": 24931,
        "name": "Anhui University of Traditional Chinese Medicine",
    },
    {
        "_id": 24936,
        "name": "Anna University of Technology, Tirunelveli",
    },
    {
        "_id": 24937,
        "name": "Anton de Kom University",
    },
    {
        "_id": 24938,
        "name": "Aomori Chuoh Gakuin University",
    },
    {
        "_id": 24935,
        "name": "Anna University",
    },
    {
        "_id": 24940,
        "name": "Aomori University",
    },
    {
        "_id": 24942,
        "name": "Aoyama Gakuin University",
    },
    {
        "_id": 24941,
        "name": "Aomori University of Health and Welfare",
    },
    {
        "_id": 24939,
        "name": "Aomori Public College",
    },
    {
        "_id": 24944,
        "name": "AP University College",
    },
    {
        "_id": 24945,
        "name": "Aquinas University",
    },
    {
        "_id": 24946,
        "name": "Arab Academy for Banking and Financial Sciences",
    },
    {
        "_id": 24943,
        "name": "Applied Science University",
    },
    {
        "_id": 24948,
        "name": "Arab American University - Jenin",
    },
    {
        "_id": 24949,
        "name": "Arab European University",
    },
    {
        "_id": 24950,
        "name": "Arabian Gulf University",
    },
    {
        "_id": 24947,
        "name": "Arab Academy for Science & Technology",
    },
    {
        "_id": 24952,
        "name": "Arab Open University, Kuwait Branch",
    },
    {
        "_id": 24953,
        "name": "Arak University",
    },
    {
        "_id": 24955,
        "name": "Arak University of Medical Sciences",
    },
    {
        "_id": 24954,
        "name": "Arak University of Technology",
    },
    {
        "_id": 24951,
        "name": "Arab Open University",
    },
    {
        "_id": 24956,
        "name": "Araullo University",
    },
    {
        "_id": 24957,
        "name": "Arba Minch University",
    },
    {
        "_id": 24958,
        "name": "Ardabil University of Medical Sciences",
    },
    {
        "_id": 24959,
        "name": "Arellano University",
    },
    {
        "_id": 24961,
        "name": "Aria Institute of Higher Education",
    },
    {
        "_id": 24962,
        "name": "Arid Agriculture University",
    },
    {
        "_id": 24963,
        "name": "Ariel University Center of Samaria",
    },
    {
        "_id": 24960,
        "name": "Arhangelsk State Technical University",
    },
    {
        "_id": 24965,
        "name": "Armed Forces Academy of General Milan Rastislav Štefánik",
    },
    {
        "_id": 24966,
        "name": "Armenian State Agrarian University",
    },
    {
        "_id": 24967,
        "name": "Armenian State University of Economics",
    },
    {
        "_id": 24964,
        "name": "Aristotle University of Thessaloniki",
    },
    {
        "_id": 24969,
        "name": "Arts, Sciences and Technology University",
    },
    {
        "_id": 24971,
        "name": "Art University",
    },
    {
        "_id": 24970,
        "name": "ARYA Institute of Engineering & Technology",
    },
    {
        "_id": 24968,
        "name": "Arthur C Clarke Institute of Modern Technologies",
    },
    {
        "_id": 24973,
        "name": "Asahikawa University",
    },
    {
        "_id": 24974,
        "name": "Asahi University",
    },
    {
        "_id": 24975,
        "name": "Asa University Bangladesh",
    },
    {
        "_id": 24972,
        "name": "Asahikawa Medical College",
    },
    {
        "_id": 24977,
        "name": "Ashikaga Institute of Technology",
    },
    {
        "_id": 24978,
        "name": "Ashiya University",
    },
    {
        "_id": 24979,
        "name": "Ashkelon Academic College",
    },
    {
        "_id": 24976,
        "name": "Ashesi University",
    },
    {
        "_id": 24980,
        "name": "Ashton College",
    },
    {
        "_id": 24984,
        "name": "Asian Institute of Technology",
    },
    {
        "_id": 24982,
        "name": "Asia E University",
    },
    {
        "_id": 24981,
        "name": "Asian Business School",
    },
    {
        "_id": 24983,
        "name": "Asia Europe University",
    },
    {
        "_id": 24986,
        "name": "Asian Medical Institute",
    },
    {
        "_id": 24987,
        "name": "Asian University of Bangladesh",
    },
    {
        "_id": 24988,
        "name": "Asian University of Science and Technology",
    },
    {
        "_id": 24989,
        "name": "Asia Pacific Institute of Information Technology (APIIT)",
    },
    {
        "_id": 24985,
        "name": "Asian Management Institute",
    },
    {
        "_id": 24990,
        "name": "Asia Pacific Institute of Information Technology Pakistan (APIIT PAK)",
    },
    {
        "_id": 24991,
        "name": "Asia University",
    },
    {
        "_id": 24992,
        "name": "Assam Agricultural University",
    },
    {
        "_id": 24993,
        "name": "Assam University",
    },
    {
        "_id": 24995,
        "name": "Assosa University",
    },
    {
        "_id": 24996,
        "name": "Assumption University",
    },
    {
        "_id": 24997,
        "name": "Assumption University of Thailand",
    },
    {
        "_id": 24994,
        "name": "Assiut University",
    },
    {
        "_id": 24999,
        "name": "Astrahan State Medical Academy",
    },
    {
        "_id": 25000,
        "name": "Astrahan State Technical University",
    },
    {
        "_id": 25001,
        "name": "Astrakhan State University",
    },
    {
        "_id": 24998,
        "name": "Aston University",
    },
    {
        "_id": 25003,
        "name": "Ateneo de Davao University",
    },
    {
        "_id": 25004,
        "name": "Ateneo de Manila University",
    },
    {
        "_id": 25005,
        "name": "Ateneo de Naga University",
    },
    {
        "_id": 25002,
        "name": "Atatürk University",
    },
    {
        "_id": 25007,
        "name": "Athabasca University",
    },
    {
        "_id": 25008,
        "name": "Athenaeum Pontificium Regina Apostolorum",
    },
    {
        "_id": 25006,
        "name": "Ateneo de Zamboanga University",
    },
    {
        "_id": 25011,
        "name": "Athens School of Fine Arts",
    },
    {
        "_id": 25012,
        "name": "Athens University of Economics and Business",
    },
    {
        "_id": 25009,
        "name": "Athens Laboratory of Business Administration (ALBA)",
    },
    {
        "_id": 25010,
        "name": "Athens Graduate School of Management (AGSM)",
    },
    {
        "_id": 25014,
        "name": "Atilim University",
    },
    {
        "_id": 25015,
        "name": "Atish Dipankar University",
    },
    {
        "_id": 25016,
        "name": "Atomi College",
    },
    {
        "_id": 25013,
        "name": "Athlone Institute of Technology",
    },
    {
        "_id": 25018,
        "name": "Auchi Polytechnic",
    },
    {
        "_id": 25019,
        "name": "Auckland University of Technology",
    },
    {
        "_id": 25020,
        "name": "Augustana Hochschule Neuendettelsau",
    },
    {
        "_id": 25017,
        "name": "Atyrau State University",
    },
    {
        "_id": 25022,
        "name": "Australian Catholic University",
    },
    {
        "_id": 25023,
        "name": "Australian Correspondence Schools",
    },
    {
        "_id": 25024,
        "name": "Australian Defence Force Academy",
    },
    {
        "_id": 25021,
        "name": "Augustana University College",
    },
    {
        "_id": 25026,
        "name": "Australian Maritime College",
    },
    {
        "_id": 25027,
        "name": "Australian National University",
    },
    {
        "_id": 25028,
        "name": "Australlian College of Kuwait",
    },
    {
        "_id": 25025,
        "name": "Australian Lutheran College",
    },
    {
        "_id": 25030,
        "name": "Aventis School of Management",
    },
    {
        "_id": 25031,
        "name": "Avicenna International College",
    },
    {
        "_id": 25032,
        "name": "Avinashilingam Institute for Home Science and Higher Education for Women",
    },
    {
        "_id": 25029,
        "name": "Avans Hogeschool",
    },
    {
        "_id": 25034,
        "name": "Awadhesh Pratap Singh University",
    },
    {
        "_id": 25035,
        "name": "Azabu University",
    },
    {
        "_id": 25036,
        "name": "Azad Jammu and Kashmir University",
    },
    {
        "_id": 25033,
        "name": "Avondale College",
    },
    {
        "_id": 25038,
        "name": "Azerbaijan International University",
    },
    {
        "_id": 25039,
        "name": "Azerbaijan Medical University",
    },
    {
        "_id": 25040,
        "name": "Azerbaijan National Conservatorie",
    },
    {
        "_id": 25037,
        "name": "Azerbaijan Diplomatic Academy",
    },
    {
        "_id": 25042,
        "name": "Azerbaijan State Oil Academy",
    },
    {
        "_id": 25043,
        "name": "Azerbaijan Technical University",
    },
    {
        "_id": 25044,
        "name": "Azerbaijan Technology University",
    },
    {
        "_id": 25041,
        "name": "Azerbaijan State Economic University",
    },
    {
        "_id": 25046,
        "name": "Azerbaijan University",
    },
    {
        "_id": 25047,
        "name": "Azerbaijan University ol Languages",
    },
    {
        "_id": 25048,
        "name": "Azzahra University",
    },
    {
        "_id": 25045,
        "name": "Azerbaijan Toursim Institute",
    },
    {
        "_id": 25050,
        "name": "Babcock University",
    },
    {
        "_id": 25051,
        "name": "Babes-Bolyai University of Cluj-Napoca",
    },
    {
        "_id": 25052,
        "name": "Babol Noshirvani University of Technology",
    },
    {
        "_id": 25049,
        "name": "Babasaheb Bhimrao Ambedkar University",
    },
    {
        "_id": 25054,
        "name": "Badakhshan University",
    },
    {
        "_id": 25055,
        "name": "Baghdad College of Economic Sciences University",
    },
    {
        "_id": 25056,
        "name": "Baghdad College of Pharmacy",
    },
    {
        "_id": 25053,
        "name": "Babol University of Medical Sciences",
    },
    {
        "_id": 25058,
        "name": "Baghyatoolah Medical Sciences University",
    },
    {
        "_id": 25059,
        "name": "Baha'i Institute for Higher Education",
    },
    {
        "_id": 25060,
        "name": "Bahauddin Zakariya University, Multan",
    },
    {
        "_id": 25057,
        "name": "Baghlan University",
    },
    {
        "_id": 25062,
        "name": "Bahir Dar University",
    },
    {
        "_id": 25063,
        "name": "Bahrain Polytechnic",
    },
    {
        "_id": 25064,
        "name": "Bahria University",
    },
    {
        "_id": 25061,
        "name": "Bahcesehir University",
    },
    {
        "_id": 25066,
        "name": "Baika Women's College",
    },
    {
        "_id": 25067,
        "name": "Baiko Women's College",
    },
    {
        "_id": 25068,
        "name": "Baitulmal Management Institute (IPB)",
    },
    {
        "_id": 25065,
        "name": "Baikal National University of Economics and Law",
    },
    {
        "_id": 25070,
        "name": "Bakht Er-Ruda University",
    },
    {
        "_id": 25071,
        "name": "Baki Business University",
    },
    {
        "_id": 25072,
        "name": "Baku Slavic University",
    },
    {
        "_id": 25069,
        "name": "Bakhtar University",
    },
    {
        "_id": 25074,
        "name": "Balamand University",
    },
    {
        "_id": 25075,
        "name": "Balikesir University",
    },
    {
        "_id": 25076,
        "name": "Balkh University",
    },
    {
        "_id": 25073,
        "name": "Baku State University",
    },
    {
        "_id": 25078,
        "name": "Balochistan University of Engineering and Technology Khuzdar",
    },
    {
        "_id": 25079,
        "name": "Balochistan University of Information Technology & Management Sciences",
    },
    {
        "_id": 25077,
        "name": "Ballsbridge University",
    },
    {
        "_id": 25080,
        "name": "Balqa Applied University",
    },
    {
        "_id": 25081,
        "name": "Baltic International Academy",
    },
    {
        "_id": 25082,
        "name": "Baltic State Technical University",
    },
    {
        "_id": 25085,
        "name": "Bamiyan University",
    },
    {
        "_id": 25083,
        "name": "Balti State University 'Alecu Russo'",
    },
    {
        "_id": 25084,
        "name": "Bamenda University of Science & Technology",
    },
    {
        "_id": 25088,
        "name": "Banat's University of Agricultural Sciences",
    },
    {
        "_id": 25089,
        "name": "Bangabandhu Sheikh Mujibur Rahman Agricultural University",
    },
    {
        "_id": 25086,
        "name": "Banaras Hindu University",
    },
    {
        "_id": 25087,
        "name": "Banasthali University",
    },
    {
        "_id": 25091,
        "name": "Bangalore University",
    },
    {
        "_id": 25092,
        "name": "Bangkok University",
    },
    {
        "_id": 25093,
        "name": "Bangladesh Agricultural University",
    },
    {
        "_id": 25090,
        "name": "Bangabandhu Sheikh Mujibur Rahman Medical University",
    },
    {
        "_id": 25095,
        "name": "Bangladesh University",
    },
    {
        "_id": 25096,
        "name": "Bangladesh University of Business & Technology",
    },
    {
        "_id": 25097,
        "name": "Bangladesh University of Engineering and Technology",
    },
    {
        "_id": 25094,
        "name": "Bangladesh Open University",
    },
    {
        "_id": 25099,
        "name": "Bangladesh University of Textiles",
    },
    {
        "_id": 25100,
        "name": "Banking University of Ho Chi Minh City",
    },
    {
        "_id": 25101,
        "name": "Bankura University",
    },
    {
        "_id": 25098,
        "name": "Bangladesh University of Professionals",
    },
    {
        "_id": 25103,
        "name": "Barcelona Graduate School of Economics",
    },
    {
        "_id": 25104,
        "name": "Baresan University",
    },
    {
        "_id": 25105,
        "name": "Bar-Ilan University",
    },
    {
        "_id": 25102,
        "name": "Baqai Medical University",
    },
    {
        "_id": 25107,
        "name": "Bashkir State Agrarian University",
    },
    {
        "_id": 25108,
        "name": "Bashkir State Medical University",
    },
    {
        "_id": 25109,
        "name": "Bashkir State Pedagogical University 'name'd After M. Akmullah",
    },
    {
        "_id": 25106,
        "name": "Barkatullah University",
    },
    {
        "_id": 25111,
        "name": "Basilicata University Potenza",
    },
    {
        "_id": 25112,
        "name": "Baskent University",
    },
    {
        "_id": 25110,
        "name": "Bashkir State University",
    },
    {
        "_id": 25115,
        "name": "Bauchi State University, Gadau",
    },
    {
        "_id": 25116,
        "name": "Bauhaus Universität Weimar",
    },
    {
        "_id": 25113,
        "name": "Batchelor Institute of Indigenous Tertiary Education",
    },
    {
        "_id": 25114,
        "name": "Batterjee Medical College",
    },
    {
        "_id": 25118,
        "name": "Bayan College for Science & Technology",
    },
    {
        "_id": 25119,
        "name": "Bayerische Julius-Maximilians-Universität Würzburg",
    },
    {
        "_id": 25120,
        "name": "Bayero University Kano",
    },
    {
        "_id": 25117,
        "name": "Bauman Moscow State Technical University",
    },
    {
        "_id": 25122,
        "name": "Beder University",
    },
    {
        "_id": 25123,
        "name": "Begum Rokeya University, Rangpur",
    },
    {
        "_id": 25124,
        "name": "Beijing Foreign Studies University",
    },
    {
        "_id": 25121,
        "name": "Baze University Abuja",
    },
    {
        "_id": 25126,
        "name": "Beijing Information Science and Technology University",
    },
    {
        "_id": 25127,
        "name": "Beijing Institute of Technology",
    },
    {
        "_id": 25128,
        "name": "Beijing International Studies University",
    },
    {
        "_id": 25125,
        "name": "Beijing Forestry University",
    },
    {
        "_id": 25130,
        "name": "Beijing Medical University",
    },
    {
        "_id": 25131,
        "name": "Beijing New Asia University",
    },
    {
        "_id": 25132,
        "name": "Beijing Normal University",
    },
    {
        "_id": 25129,
        "name": "Beijing Language and Culture University",
    },
    {
        "_id": 25134,
        "name": "Beijing Polytechnic University",
    },
    {
        "_id": 25135,
        "name": "Beijing Sport University",
    },
    {
        "_id": 25136,
        "name": "Beijing Union University",
    },
    {
        "_id": 25133,
        "name": "Beijing Petroleum University",
    },
    {
        "_id": 25138,
        "name": "Beijing University of Agriculture",
    },
    {
        "_id": 25139,
        "name": "Beijing University of Chemical Technology",
    },
    {
        "_id": 25140,
        "name": "Beijing University of Posts and Telecommunications",
    },
    {
        "_id": 25137,
        "name": "Beijing University of Aeronautics and Astronautics",
    },
    {
        "_id": 25142,
        "name": "Beijing University of Science and Technology",
    },
    {
        "_id": 25143,
        "name": "Belarusian-Russian University",
    },
    {
        "_id": 25144,
        "name": "Beirut Arab University",
    },
    {
        "_id": 25141,
        "name": "Beijing University of Chinese Medicine and Pharmacology",
    },
    {
        "_id": 25146,
        "name": "Belarussian State Agrarian Technical University",
    },
    {
        "_id": 25147,
        "name": "Belarussian State Agricultural Academy",
    },
    {
        "_id": 25148,
        "name": "Belarussian State Economic University",
    },
    {
        "_id": 25145,
        "name": "Belarussian State Academy of Music",
    },
    {
        "_id": 25150,
        "name": "Belarussian State Medical University",
    },
    {
        "_id": 25151,
        "name": "Belarussian State Pedagogical University M. Tanka",
    },
    {
        "_id": 25152,
        "name": "Belarussian State Polytechnical Academy",
    },
    {
        "_id": 25149,
        "name": "Belarussian National Technical University",
    },
    {
        "_id": 25154,
        "name": "Belarussian State University",
    },
    {
        "_id": 25155,
        "name": "Belarussian State University of Culture and Arts",
    },
    {
        "_id": 25156,
        "name": "Belarussian State University of Informatics and Radioelectronics",
    },
    {
        "_id": 25153,
        "name": "Belarussian State Technological University",
    },
    {
        "_id": 25158,
        "name": "Belgorod State Agricultural Academy",
    },
    {
        "_id": 25159,
        "name": "Belgorod State Technical University",
    },
    {
        "_id": 25160,
        "name": "Belgorod State University",
    },
    {
        "_id": 25157,
        "name": "Belarussian State University of Transport",
    },
    {
        "_id": 25162,
        "name": "Benadir University",
    },
    {
        "_id": 25163,
        "name": "Benemerita Universidad Autónoma de Puebla",
    },
    {
        "_id": 25164,
        "name": "Bengal Engineering College",
    },
    {
        "_id": 25161,
        "name": "Bells University of Technology",
    },
    {
        "_id": 25166,
        "name": "Ben-Gurion University of the Negev",
    },
    {
        "_id": 25167,
        "name": "Benha University",
    },
    {
        "_id": 25168,
        "name": "Beni Suef University",
    },
    {
        "_id": 25165,
        "name": "Benguet State University",
    },
    {
        "_id": 25170,
        "name": "Benue State University",
    },
    {
        "_id": 25171,
        "name": "Beppu University",
    },
    {
        "_id": 25172,
        "name": "Bergen University College",
    },
    {
        "_id": 25169,
        "name": "Benson Idahosa University",
    },
    {
        "_id": 25174,
        "name": "Berhampur University",
    },
    {
        "_id": 25175,
        "name": "Bermuda College",
    },
    {
        "_id": 25176,
        "name": "Bethlehem University",
    },
    {
        "_id": 25173,
        "name": "Bergische Universität Gesamthochschule Wuppertal",
    },
    {
        "_id": 25178,
        "name": "Bezalel Academy of Art and Design",
    },
    {
        "_id": 25179,
        "name": "BGC Trust University, Bangladesh",
    },
    {
        "_id": 25177,
        "name": "Beykent University",
    },
    {
        "_id": 25180,
        "name": "Bhagwant University",
    },
    {
        "_id": 25181,
        "name": "Bharathiar University",
    },
    {
        "_id": 25182,
        "name": "Bharathidasan University",
    },
    {
        "_id": 25183,
        "name": "Bharath Institue Of Higher Education & Research",
    },
    {
        "_id": 25185,
        "name": "Bhavnagar University",
    },
    {
        "_id": 25186,
        "name": "Bhupendra Narayan Mandal University",
    },
    {
        "_id": 25187,
        "name": "Bicol University",
    },
    {
        "_id": 25184,
        "name": "Bharati Vidyapeeth University",
    },
    {
        "_id": 25189,
        "name": "Bifrost School of Business",
    },
    {
        "_id": 25190,
        "name": "Biju Pattnaik University of Technology",
    },
    {
        "_id": 25191,
        "name": "Bila Cerkva State Agrarian University",
    },
    {
        "_id": 25188,
        "name": "Bidhan Chandra Agricultural University",
    },
    {
        "_id": 25193,
        "name": "Bilkent University",
    },
    {
        "_id": 25194,
        "name": "Binary University College of Managemant & Entrepreneurship",
    },
    {
        "_id": 25195,
        "name": "Bindura University of Science Education",
    },
    {
        "_id": 25192,
        "name": "Bilecik University",
    },
    {
        "_id": 25197,
        "name": "Binh Duong University",
    },
    {
        "_id": 25198,
        "name": "Binus University",
    },
    {
        "_id": 25199,
        "name": "Bircham International University",
    },
    {
        "_id": 25196,
        "name": "Bingham University",
    },
    {
        "_id": 25201,
        "name": "Birjand University of Medical Sciences",
    },
    {
        "_id": 25202,
        "name": "Birkbeck College, University of London",
    },
    {
        "_id": 25203,
        "name": "Birla Institute of Technology and Science",
    },
    {
        "_id": 25200,
        "name": "Birjand University",
    },
    {
        "_id": 25205,
        "name": "Birmingham City University",
    },
    {
        "_id": 25206,
        "name": "Birsa Agricultural University",
    },
    {
        "_id": 25207,
        "name": "Birsk State Pedagogical Institute",
    },
    {
        "_id": 25204,
        "name": "Birla Institute of Technology, Ranchi",
    },
    {
        "_id": 25209,
        "name": "Bishkek Humanities University",
    },
    {
        "_id": 25210,
        "name": "Bishop's University",
    },
    {
        "_id": 25211,
        "name": "BiTS - Business and Information Technology School gGmbH",
    },
    {
        "_id": 25208,
        "name": "Birzeit University",
    },
    {
        "_id": 25213,
        "name": "Blekinge Institute of Technology",
    },
    {
        "_id": 25214,
        "name": "Blue Mountains Hotel School",
    },
    {
        "_id": 25215,
        "name": "Blue Nile University",
    },
    {
        "_id": 25212,
        "name": "Biysk State Padagogical University after V.M. Shukshin",
    },
    {
        "_id": 25217,
        "name": "Bogazici University",
    },
    {
        "_id": 25218,
        "name": "Bogor Agricultural University",
    },
    {
        "_id": 25219,
        "name": "Bohai University",
    },
    {
        "_id": 25216,
        "name": "Bodo Regional University",
    },
    {
        "_id": 25221,
        "name": "Bosaso College",
    },
    {
        "_id": 25222,
        "name": "Bost University",
    },
    {
        "_id": 25223,
        "name": "Botho University",
    },
    {
        "_id": 25220,
        "name": "Bond University",
    },
    {
        "_id": 25225,
        "name": "Botswana College of Agriculture",
    },
    {
        "_id": 25226,
        "name": "Botswana International University of Science & Technology",
    },
    {
        "_id": 25227,
        "name": "Bourgas Free University",
    },
    {
        "_id": 25224,
        "name": "Botswana Accountancy College",
    },
    {
        "_id": 25229,
        "name": "Bournemouth University",
    },
    {
        "_id": 25230,
        "name": "Bowen University",
    },
    {
        "_id": 25231,
        "name": "Bow Valley College",
    },
    {
        "_id": 25228,
        "name": "Bourgas University 'Prof. Assen Zlatarov'",
    },
    {
        "_id": 25233,
        "name": "Brac University",
    },
    {
        "_id": 25234,
        "name": "B. R. Ambedkar Bihar University",
    },
    {
        "_id": 25235,
        "name": "Brandenburgische Technische Universität Cottbus",
    },
    {
        "_id": 25232,
        "name": "B.P.Koirala Institute of Health Sciences",
    },
    {
        "_id": 25237,
        "name": "Brandon University",
    },
    {
        "_id": 25238,
        "name": "Brest State Technical University",
    },
    {
        "_id": 25239,
        "name": "Brest State University",
    },
    {
        "_id": 25236,
        "name": "Bratislava International School of Liberal Arts",
    },
    {
        "_id": 25241,
        "name": "Bratsk State Technical University",
    },
    {
        "_id": 25242,
        "name": "Brescia College",
    },
    {
        "_id": 25243,
        "name": "Brickfields Asia College",
    },
    {
        "_id": 25245,
        "name": "British Columbia Institute of Technology",
    },
    {
        "_id": 25240,
        "name": "Brexgata University Academy",
    },
    {
        "_id": 25246,
        "name": "British Columbia Open University",
    },
    {
        "_id": 25247,
        "name": "British Institute in Paris, University of London",
    },
    {
        "_id": 25249,
        "name": "British Royal University",
    },
    {
        "_id": 25244,
        "name": "British College of Osteopathic Medicine",
    },
    {
        "_id": 25250,
        "name": "British University in Dubai",
    },
    {
        "_id": 25251,
        "name": "Brjansk State Technical University",
    },
    {
        "_id": 25248,
        "name": "British Malaysian Institute",
    },
    {
        "_id": 25253,
        "name": "Brock University",
    },
    {
        "_id": 25254,
        "name": "Brookdale Community College",
    },
    {
        "_id": 25255,
        "name": "Brunel University Uxbridge",
    },
    {
        "_id": 25252,
        "name": "Brno University of Technology",
    },
    {
        "_id": 25257,
        "name": "Brussels School of International Studies",
    },
    {
        "_id": 25258,
        "name": "B. S. Abdur Rahman University",
    },
    {
        "_id": 25259,
        "name": "Bu Ali Sina University",
    },
    {
        "_id": 25256,
        "name": "Brussels Management School (ICHEC)",
    },
    {
        "_id": 25261,
        "name": "Budapest Buddhist University",
    },
    {
        "_id": 25262,
        "name": "Budapest University of Economic Sciences and Public Administration",
    },
    {
        "_id": 25263,
        "name": "Buddhasravaka Bhikshu University",
    },
    {
        "_id": 25260,
        "name": "Buckinghamshire New University",
    },
    {
        "_id": 25265,
        "name": "Buddhist and Pali University of Sri Lanka",
    },
    {
        "_id": 25267,
        "name": "Build Bright University",
    },
    {
        "_id": 25266,
        "name": "Bugema University",
    },
    {
        "_id": 25264,
        "name": "Buddhist Acamedy of China",
    },
    {
        "_id": 25269,
        "name": "Bulacan State University",
    },
    {
        "_id": 25270,
        "name": "Bule Hora University",
    },
    {
        "_id": 25271,
        "name": "Bundelkhand University",
    },
    {
        "_id": 25268,
        "name": "Bukkyo University",
    },
    {
        "_id": 25273,
        "name": "Bunkyo University",
    },
    {
        "_id": 25274,
        "name": "Burapha University",
    },
    {
        "_id": 25275,
        "name": "Buraydah College for Applied Medical Sciences",
    },
    {
        "_id": 25272,
        "name": "Bunka Women's University",
    },
    {
        "_id": 25277,
        "name": "Burjat State University",
    },
    {
        "_id": 25276,
        "name": "Burdwan University",
    },
    {
        "_id": 25279,
        "name": "Business and Hotel Management School",
    },
    {
        "_id": 25280,
        "name": "Business & Computer University College",
    },
    {
        "_id": 25278,
        "name": "Bushehr University of Medical Sciences",
    },
    {
        "_id": 25281,
        "name": "Business School Barcelona",
    },
    {
        "_id": 25282,
        "name": "Business School Lausanne (BSL)",
    },
    {
        "_id": 25284,
        "name": "Busoga University",
    },
    {
        "_id": 25285,
        "name": "Cagayan State University",
    },
    {
        "_id": 25286,
        "name": "Cag University",
    },
    {
        "_id": 25283,
        "name": "Busitema University",
    },
    {
        "_id": 25288,
        "name": "Caleb University",
    },
    {
        "_id": 25289,
        "name": "Calorx Teacher's University",
    },
    {
        "_id": 25290,
        "name": "Camberwell College of Arts",
    },
    {
        "_id": 25287,
        "name": "Cairo University",
    },
    {
        "_id": 25292,
        "name": "Cambodia University of Specialties",
    },
    {
        "_id": 25293,
        "name": "Camosun College",
    },
    {
        "_id": 25294,
        "name": "Campion College",
    },
    {
        "_id": 25291,
        "name": "Cambodian Mekong University",
    },
    {
        "_id": 25296,
        "name": "Canadian College of Business & Computers",
    },
    {
        "_id": 25297,
        "name": "Canadian Mennonite University",
    },
    {
        "_id": 25298,
        "name": "Canadian Sudanese College",
    },
    {
        "_id": 25295,
        "name": "Campus Bio-Medico University of Rome",
    },
    {
        "_id": 25300,
        "name": "Cankaya University",
    },
    {
        "_id": 25302,
        "name": "Can-Tho University",
    },
    {
        "_id": 25299,
        "name": "Canakkale (18th March) University",
    },
    {
        "_id": 25301,
        "name": "Canterbury Christ Church University",
    },
    {
        "_id": 25304,
        "name": "Cape Peninsula University of Technology",
    },
    {
        "_id": 25305,
        "name": "Capilano College",
    },
    {
        "_id": 25306,
        "name": "Capital Normal University",
    },
    {
        "_id": 25303,
        "name": "Cape Coast Polytechnic",
    },
    {
        "_id": 25308,
        "name": "Capital University of Medical Sciences",
    },
    {
        "_id": 25309,
        "name": "Cardiff University",
    },
    {
        "_id": 25307,
        "name": "Capital University of Economics and Business",
    },
    {
        "_id": 25312,
        "name": "Caribbean University",
    },
    {
        "_id": 25313,
        "name": "Caritas University",
    },
    {
        "_id": 25310,
        "name": "Capitol University",
    },
    {
        "_id": 25311,
        "name": "Cardinal Stefan Wyszynski University in Warsaw",
    },
    {
        "_id": 25315,
        "name": "Carlow Institute of Technology",
    },
    {
        "_id": 25316,
        "name": "Carl von Ossietzky Universität Oldenburg",
    },
    {
        "_id": 25317,
        "name": "Catholic University in Ruzomberok",
    },
    {
        "_id": 25314,
        "name": "Carleton University",
    },
    {
        "_id": 25319,
        "name": "Catholic University in Zimbabwe",
    },
    {
        "_id": 25320,
        "name": "Catholic University of Eastern Africa",
    },
    {
        "_id": 25318,
        "name": "Catholic University in Ružomberok",
    },
    {
        "_id": 25321,
        "name": "Catholic University of Korea",
    },
    {
        "_id": 25323,
        "name": "Catholic University of Malawi",
    },
    {
        "_id": 25324,
        "name": "Catholic University of Pusan",
    },
    {
        "_id": 25325,
        "name": "Catholic University of Taegu-Hyosung",
    },
    {
        "_id": 25322,
        "name": "Catholic University of Lublin",
    },
    {
        "_id": 25327,
        "name": "Caucasus University",
    },
    {
        "_id": 25328,
        "name": "Cavendish University",
    },
    {
        "_id": 25326,
        "name": "Catholic University of the Sacred Heart",
    },
    {
        "_id": 25331,
        "name": "Celal Bayar University",
    },
    {
        "_id": 25332,
        "name": "Centennial College",
    },
    {
        "_id": 25329,
        "name": "CCS Haryana Agricultural University",
    },
    {
        "_id": 25330,
        "name": "Cecos Univeristy of Information Technology",
    },
    {
        "_id": 25334,
        "name": "Central Academy of Fine Art",
    },
    {
        "_id": 25335,
        "name": "Central Agricultural University",
    },
    {
        "_id": 25336,
        "name": "Central America Health Sciences University (Belize Medical College)",
    },
    {
        "_id": 25337,
        "name": "Central Buganda University",
    },
    {
        "_id": 25333,
        "name": "Center for Entrepreneurship and Small Business Management",
    },
    {
        "_id": 25338,
        "name": "Central China Normal University",
    },
    {
        "_id": 25339,
        "name": "Central European University",
    },
    {
        "_id": 25340,
        "name": "Central Institute of English and Foreign Languages",
    },
    {
        "_id": 25341,
        "name": "Central Institute of Fisheries Education",
    },
    {
        "_id": 25343,
        "name": "Central Luzon State University",
    },
    {
        "_id": 25344,
        "name": "Central Mindanao University",
    },
    {
        "_id": 25345,
        "name": "Central Ostrobothnia University of Applied Sciences",
    },
    {
        "_id": 25342,
        "name": "Central Institute of Higher Tibetan Studies",
    },
    {
        "_id": 25347,
        "name": "Central Police University",
    },
    {
        "_id": 25348,
        "name": "Central Queensland University",
    },
    {
        "_id": 25349,
        "name": "Central Radio and TV University",
    },
    {
        "_id": 25346,
        "name": "Central Philippine University",
    },
    {
        "_id": 25351,
        "name": "Central South Forestry University",
    },
    {
        "_id": 25352,
        "name": "Central South University",
    },
    {
        "_id": 25353,
        "name": "Central University College",
    },
    {
        "_id": 25350,
        "name": "Central Saint Martins College of Art & Design",
    },
    {
        "_id": 25355,
        "name": "Central University of Finance and Economics",
    },
    {
        "_id": 25356,
        "name": "Central University of Technology, Free State",
    },
    {
        "_id": 25357,
        "name": "Centre de Formation et de Perfectionnement des Journalistes",
    },
    {
        "_id": 25354,
        "name": "Central University for Nationalities",
    },
    {
        "_id": 25359,
        "name": "Centre d'Etudes Supérieures Industrielles Paris",
    },
    {
        "_id": 25360,
        "name": "Centre National d'Etudes Agronomiques des Régions Chaudes",
    },
    {
        "_id": 25358,
        "name": "Centre d'Etudes Supérieures des Techniques Industrielles",
    },
    {
        "_id": 25361,
        "name": "Centre Universitaire de Jijel",
    },
    {
        "_id": 25363,
        "name": "Centre Universitaire de Technologie",
    },
    {
        "_id": 25364,
        "name": "Centre Universitaire de Tiaret",
    },
    {
        "_id": 25365,
        "name": "Centre Universitaire d'Oum El Bouaghi",
    },
    {
        "_id": 25362,
        "name": "Centre Universitaire de Tebessa",
    },
    {
        "_id": 25367,
        "name": "Centro de Estudios Avanzados de Puerto Rico y el Caribe",
    },
    {
        "_id": 25368,
        "name": "Centro de Estudios Investigación y Tecnología (CEIT)",
    },
    {
        "_id": 25369,
        "name": "Centro de Estudios Universitarios Monterrey",
    },
    {
        "_id": 25366,
        "name": "Centro de Enseñanza Técnica Industrial",
    },
    {
        "_id": 25371,
        "name": "Centro Escolar University",
    },
    {
        "_id": 25372,
        "name": "Centro Regional Universitário de Espiríto Santo do Pinhal",
    },
    {
        "_id": 25373,
        "name": "Centro Universitário Adventista de São Paulo",
    },
    {
        "_id": 25370,
        "name": "Centro de Estudios Universitarios Xochicalco",
    },
    {
        "_id": 25375,
        "name": "Centro Universitario Ciudad Vieja",
    },
    {
        "_id": 25376,
        "name": "Centro Universitário Claretiano",
    },
    {
        "_id": 25377,
        "name": "Centro Universitário de Araraquara",
    },
    {
        "_id": 25374,
        "name": "Centro Universitário Barao de Maua",
    },
    {
        "_id": 25378,
        "name": "Centro Universitário de João Pessoa",
    },
    {
        "_id": 25379,
        "name": "Centro Universitario de Occidente",
    },
    {
        "_id": 25380,
        "name": "Centro Universitario Ixtlahuaca",
    },
    {
        "_id": 25382,
        "name": "Centro Universitário Newton Paiva",
    },
    {
        "_id": 25383,
        "name": "Centro Universitário Plinio Leite",
    },
    {
        "_id": 25384,
        "name": "Centro Universitário Senac",
    },
    {
        "_id": 25381,
        "name": "Centro Universitário Monte Serrat",
    },
    {
        "_id": 25386,
        "name": "Centro Universitario Villanueva",
    },
    {
        "_id": 25387,
        "name": "CETYS Universidad",
    },
    {
        "_id": 25388,
        "name": "Cevro Institut College",
    },
    {
        "_id": 25385,
        "name": "Centro Universitário Serra dos Órgãos",
    },
    {
        "_id": 25390,
        "name": "Chamreun University of Poly Technology",
    },
    {
        "_id": 25391,
        "name": "Chandra Shekhar Azad University of Agriculture and Technology",
    },
    {
        "_id": 25392,
        "name": "Changchun Teachers College",
    },
    {
        "_id": 25389,
        "name": "Chalmers University of Technology",
    },
    {
        "_id": 25394,
        "name": "Chang Gung University",
    },
    {
        "_id": 25395,
        "name": "Chang Jung University",
    },
    {
        "_id": 25396,
        "name": "Changsha Railway University",
    },
    {
        "_id": 25393,
        "name": "Changchun University of Technology",
    },
    {
        "_id": 25398,
        "name": "Changwon National University",
    },
    {
        "_id": 25399,
        "name": "Chaopraya University",
    },
    {
        "_id": 25400,
        "name": "Chao Yang University of Science and Technology",
    },
    {
        "_id": 25397,
        "name": "Changsha University of Electric Power",
    },
    {
        "_id": 25402,
        "name": "Charles Darwin University",
    },
    {
        "_id": 25403,
        "name": "Charles Sturt University",
    },
    {
        "_id": 25404,
        "name": "Charles University Prague",
    },
    {
        "_id": 25401,
        "name": "Charisma University",
    },
    {
        "_id": 25406,
        "name": "Chaudhary Charan Singh University",
    },
    {
        "_id": 25407,
        "name": "Ch. Charan Singh University",
    },
    {
        "_id": 25408,
        "name": "Cheju National University",
    },
    {
        "_id": 25405,
        "name": "Chaudhary Charan Singh Haryana Agricultural University",
    },
    {
        "_id": 25410,
        "name": "Cheljabinsk State Institute of Teacher Training",
    },
    {
        "_id": 25411,
        "name": "Cheljabinsk State University",
    },
    {
        "_id": 25412,
        "name": "Cheljabinsk University of Agricultural Engineering",
    },
    {
        "_id": 25409,
        "name": "Cheju National University of Education",
    },
    {
        "_id": 25414,
        "name": "Chengdu Institute of Sichuan International Studies University",
    },
    {
        "_id": 25415,
        "name": "Chengdu University",
    },
    {
        "_id": 25416,
        "name": "Chengdu University of Technology",
    },
    {
        "_id": 25413,
        "name": "Chelsea College of Art and Design",
    },
    {
        "_id": 25418,
        "name": "Chernivci National University",
    },
    {
        "_id": 25419,
        "name": "Chhatrapati Shahu Ji Maharaj University",
    },
    {
        "_id": 25420,
        "name": "Chia Nana College of Pharmacy and Science",
    },
    {
        "_id": 25422,
        "name": "Chiang Mai University",
    },
    {
        "_id": 25417,
        "name": "Chengdu University of Traditional Chinese Medicine",
    },
    {
        "_id": 25423,
        "name": "Chiang Mai Vocational College",
    },
    {
        "_id": 25424,
        "name": "Chiba Institute of Technology",
    },
    {
        "_id": 25421,
        "name": "Chiang Mai Rajabhat University",
    },
    {
        "_id": 25426,
        "name": "Chiba University",
    },
    {
        "_id": 25427,
        "name": "Chiba University of Commerce",
    },
    {
        "_id": 25428,
        "name": "Chikushi Jogakuen University",
    },
    {
        "_id": 25425,
        "name": "Chiba Keizai University",
    },
    {
        "_id": 25430,
        "name": "China Agricultural University",
    },
    {
        "_id": 25431,
        "name": "China Agriculture University East",
    },
    {
        "_id": 25432,
        "name": "China Foreign Affairs University",
    },
    {
        "_id": 25429,
        "name": "China Academy of Art",
    },
    {
        "_id": 25434,
        "name": "China Medical University Shenyang",
    },
    {
        "_id": 25435,
        "name": "China Pharmaceutical University Nanjing",
    },
    {
        "_id": 25436,
        "name": "China Three Gorges University",
    },
    {
        "_id": 25433,
        "name": "China Medical College",
    },
    {
        "_id": 25438,
        "name": "China University of Geosciences Wuhan",
    },
    {
        "_id": 25440,
        "name": "China University of Mining Technology - Xuzhou",
    },
    {
        "_id": 25437,
        "name": "China University of Geoscience Beijing",
    },
    {
        "_id": 25439,
        "name": "China University of Mining Technology - Beijing",
    },
    {
        "_id": 25442,
        "name": "China USA Business University",
    },
    {
        "_id": 25444,
        "name": "Chinese Culture University",
    },
    {
        "_id": 25443,
        "name": "China youth college for political science",
    },
    {
        "_id": 25441,
        "name": "China University of Political Science and Law",
    },
    {
        "_id": 25446,
        "name": "Chinese University of Hong Kong",
    },
    {
        "_id": 25447,
        "name": "Ching Kuo Institue of Management & Health",
    },
    {
        "_id": 25448,
        "name": "Chinhoyi University of Technology",
    },
    {
        "_id": 25445,
        "name": "Chinese People's Public Security University",
    },
    {
        "_id": 25450,
        "name": "Chinju National University of Education",
    },
    {
        "_id": 25451,
        "name": "Chittagong Independent University",
    },
    {
        "_id": 25452,
        "name": "Chittagong University of Engineering and Technology",
    },
    {
        "_id": 25449,
        "name": "Chinju National University",
    },
    {
        "_id": 25454,
        "name": "Chonbuk National University",
    },
    {
        "_id": 25456,
        "name": "Chongju National University of Education",
    },
    {
        "_id": 25453,
        "name": "Chodang University",
    },
    {
        "_id": 25455,
        "name": "Chonbuk Sanup University of Technology (Howon University)",
    },
    {
        "_id": 25458,
        "name": "Chongqing Education College",
    },
    {
        "_id": 25459,
        "name": "Chongqing Medical University",
    },
    {
        "_id": 25460,
        "name": "Chongqing Normal University",
    },
    {
        "_id": 25457,
        "name": "Chongju University",
    },
    {
        "_id": 25462,
        "name": "Chongqing Technology and Business University",
    },
    {
        "_id": 25463,
        "name": "Chongqing Telecommunication College",
    },
    {
        "_id": 25464,
        "name": "Chongqing Three Gorges University",
    },
    {
        "_id": 25461,
        "name": "Chongqing Normal University Foreign Trade and Business College",
    },
    {
        "_id": 25466,
        "name": "Chongqing University of Communications",
    },
    {
        "_id": 25467,
        "name": "Chongqing University of Post and Telecommunications",
    },
    {
        "_id": 25468,
        "name": "Chongqing University of Science and Technology",
    },
    {
        "_id": 25465,
        "name": "Chongqing University",
    },
    {
        "_id": 25470,
        "name": "Chongqing Vocational College of Public Transportation",
    },
    {
        "_id": 25471,
        "name": "Chongqing Wenli University",
    },
    {
        "_id": 25472,
        "name": "Chonju National University of Education",
    },
    {
        "_id": 25473,
        "name": "Chonnam National University",
    },
    {
        "_id": 25469,
        "name": "Chongqing University of Technology",
    },
    {
        "_id": 25474,
        "name": "Chosun University",
    },
    {
        "_id": 25475,
        "name": "Christchurch Polytechnic Institute of Technology",
    },
    {
        "_id": 25476,
        "name": "Christelijke Hogeschool Windesheim",
    },
    {
        "_id": 25477,
        "name": "Christian-Albrechts-Universität Kiel",
    },
    {
        "_id": 25478,
        "name": "Christian Theological Academy in Warszaw",
    },
    {
        "_id": 25479,
        "name": "Christ University",
    },
    {
        "_id": 25483,
        "name": "Chuka University",
    },
    {
        "_id": 25480,
        "name": "Chubu Gakuin University & Chubu Women's College",
    },
    {
        "_id": 25481,
        "name": "Chubu University",
    },
    {
        "_id": 25482,
        "name": "Chu Hai College",
    },
    {
        "_id": 25486,
        "name": "Chukyo Women's University",
    },
    {
        "_id": 25487,
        "name": "Chulalongkorn University",
    },
    {
        "_id": 25484,
        "name": "Chukyo Gakuin University",
    },
    {
        "_id": 25485,
        "name": "Chukyo University",
    },
    {
        "_id": 25489,
        "name": "Chung-Ang University",
    },
    {
        "_id": 25490,
        "name": "Chungbuk National University",
    },
    {
        "_id": 25491,
        "name": "Chung Hua University",
    },
    {
        "_id": 25488,
        "name": "Chunchon National University of Education",
    },
    {
        "_id": 25493,
        "name": "Chungnam National University",
    },
    {
        "_id": 25494,
        "name": "Chung Shan Medical and Dental College",
    },
    {
        "_id": 25495,
        "name": "Chung Yuan Christian University",
    },
    {
        "_id": 25492,
        "name": "Chung-Ju National University",
    },
    {
        "_id": 25497,
        "name": "Chuo University",
    },
    {
        "_id": 25498,
        "name": "Chuvash State University",
    },
    {
        "_id": 25499,
        "name": "Cihan University",
    },
    {
        "_id": 25496,
        "name": "Chuo Gakuin University",
    },
    {
        "_id": 25501,
        "name": "City University Athens",
    },
    {
        "_id": 25502,
        "name": "City University College of Science and Technology",
    },
    {
        "_id": 25503,
        "name": "City University of Hong Kong",
    },
    {
        "_id": 25504,
        "name": "City University Programs in Bulgaria",
    },
    {
        "_id": 25500,
        "name": "City University",
    },
    {
        "_id": 25505,
        "name": "Civil Aviation University of China",
    },
    {
        "_id": 25506,
        "name": "CMJ University",
    },
    {
        "_id": 25507,
        "name": "Cochin University of Science and Technology",
    },
    {
        "_id": 25508,
        "name": "Colegio de Estudios Superiores de Administración (CESA)",
    },
    {
        "_id": 25510,
        "name": "Collège Boréal",
    },
    {
        "_id": 25511,
        "name": "College in Sládkovičovo",
    },
    {
        "_id": 25512,
        "name": "College of Business Management ( CBM )",
    },
    {
        "_id": 25509,
        "name": "Colegio de San Juan de Letran",
    },
    {
        "_id": 25514,
        "name": "College of Computer Science in Lodz",
    },
    {
        "_id": 25515,
        "name": "College of Dunaujvaros",
    },
    {
        "_id": 25516,
        "name": "College of Education Ikere",
    },
    {
        "_id": 25513,
        "name": "College of Busniess Admnistration",
    },
    {
        "_id": 25518,
        "name": "College of Europe",
    },
    {
        "_id": 25519,
        "name": "College of Management",
    },
    {
        "_id": 25520,
        "name": "College of New Caledonia",
    },
    {
        "_id": 25517,
        "name": "College of Education Oju",
    },
    {
        "_id": 25522,
        "name": "College of Science, Baghdad University",
    },
    {
        "_id": 25523,
        "name": "College of Technology at Abha",
    },
    {
        "_id": 25524,
        "name": "College of Technology at Dammam",
    },
    {
        "_id": 25521,
        "name": "College of Nursing and Allied Health Scinces",
    },
    {
        "_id": 25526,
        "name": "College of Technology at Jeddah",
    },
    {
        "_id": 25527,
        "name": "College of Technology at Kharj",
    },
    {
        "_id": 25528,
        "name": "College of Technology at Riyadh",
    },
    {
        "_id": 25525,
        "name": "College of Technology at Jazan",
    },
    {
        "_id": 25530,
        "name": "College of the Holy Spirit",
    },
    {
        "_id": 25531,
        "name": "College of the Rockies",
    },
    {
        "_id": 25532,
        "name": "Collegium Civitas",
    },
    {
        "_id": 25529,
        "name": "College of Telecommunication & Information",
    },
    {
        "_id": 25534,
        "name": "Columbia College",
    },
    {
        "_id": 25535,
        "name": "Columbus University",
    },
    {
        "_id": 25536,
        "name": "Comenius University in Bratislava",
    },
    {
        "_id": 25533,
        "name": "Cologne Business School",
    },
    {
        "_id": 25538,
        "name": "Comilla University",
    },
    {
        "_id": 25539,
        "name": "Communication University of China",
    },
    {
        "_id": 25540,
        "name": "Comrat State University",
    },
    {
        "_id": 25537,
        "name": "Comilla Medical College",
    },
    {
        "_id": 25542,
        "name": "COMSATS Institute of Information Technology, Abbottabad",
    },
    {
        "_id": 25543,
        "name": "COMSATS Institute of Information Technology, Attock",
    },
    {
        "_id": 25544,
        "name": "COMSATS Institute of Information Technology, Lahore",
    },
    {
        "_id": 25541,
        "name": "COMSATS Institute of Information Technology",
    },
    {
        "_id": 25546,
        "name": "Concordia University",
    },
    {
        "_id": 25547,
        "name": "Concordia University College of Alberta",
    },
    {
        "_id": 25548,
        "name": "Conestoga College",
    },
    {
        "_id": 25545,
        "name": "COMSATS Institute of Information Technology, Wah",
    },
    {
        "_id": 25550,
        "name": "Conservatorio del Tolima",
    },
    {
        "_id": 25551,
        "name": "Constantin Brancoveanu University Pitesti",
    },
    {
        "_id": 25552,
        "name": "Continental Theological Seminary",
    },
    {
        "_id": 25549,
        "name": "Conservatoire National des Arts et Métiers",
    },
    {
        "_id": 25554,
        "name": "Copenhagen University",
    },
    {
        "_id": 25555,
        "name": "Copperbelt University",
    },
    {
        "_id": 25556,
        "name": "Cork Institute of Technology",
    },
    {
        "_id": 25553,
        "name": "Copenhagen Business School",
    },
    {
        "_id": 25558,
        "name": "Corporación Universitaria de Ibagué (CORUNIVERSITARIA)",
    },
    {
        "_id": 25559,
        "name": "Corporación Universitaria de la Costa (UNICOSTA)",
    },
    {
        "_id": 25560,
        "name": "Corporación Universitaria de Santander (UDES)",
    },
    {
        "_id": 25557,
        "name": "Corporación Educativa Mayor del Desarrollo 'Simón Bolivar'",
    },
    {
        "_id": 25562,
        "name": "COSMIQ Institute of Technology",
    },
    {
        "_id": 25563,
        "name": "Courtauld Institute of Art, University of London",
    },
    {
        "_id": 25564,
        "name": "Covenant University",
    },
    {
        "_id": 25561,
        "name": "Corporación Universitaria Tecnológica de Bolivar",
    },
    {
        "_id": 25566,
        "name": "Cranfield University",
    },
    {
        "_id": 25567,
        "name": "Crawford University",
    },
    {
        "_id": 25568,
        "name": "Crescent University",
    },
    {
        "_id": 25565,
        "name": "Coventry University",
    },
    {
        "_id": 25570,
        "name": "Cross River University of Science and Technology",
    },
    {
        "_id": 25571,
        "name": "Cubidor University Switzerland",
    },
    {
        "_id": 25572,
        "name": "Cukurova University",
    },
    {
        "_id": 25569,
        "name": "Crimea State Medical University",
    },
    {
        "_id": 25574,
        "name": "Curtin University of Technology",
    },
    {
        "_id": 25575,
        "name": "Curtin University of Technology, Sarawak Campus",
    },
    {
        "_id": 25576,
        "name": "Cyberjaya University College of Medical Science",
    },
    {
        "_id": 25573,
        "name": "Cumhuriyet (Republik) University",
    },
    {
        "_id": 25578,
        "name": "Cyprus International Institute of Management (CIIM)",
    },
    {
        "_id": 25577,
        "name": "Cyprus College",
    },
    {
        "_id": 25580,
        "name": "Cyprus University of Technology",
    },
    {
        "_id": 25579,
        "name": "Cyprus International University",
    },
    {
        "_id": 25581,
        "name": "Cyryx College",
    },
    {
        "_id": 25582,
        "name": "Czech Technical University of Prague",
    },
    {
        "_id": 25583,
        "name": "Czech University of Agriculture Prague",
    },
    {
        "_id": 25584,
        "name": "Dadabhoy Institute of Higher Education",
    },
    {
        "_id": 25585,
        "name": "Daebul University",
    },
    {
        "_id": 25586,
        "name": "Daffodil International University",
    },
    {
        "_id": 25587,
        "name": "Dagestan State University",
    },
    {
        "_id": 25588,
        "name": "Daido Institute of Technology",
    },
    {
        "_id": 25590,
        "name": "Dai Ichi University, College of Technology",
    },
    {
        "_id": 25591,
        "name": "Daiichi University of Economics",
    },
    {
        "_id": 25592,
        "name": "Daito Bunka University",
    },
    {
        "_id": 25589,
        "name": "Daiichi College of Pharmaceutical Sciences",
    },
    {
        "_id": 25594,
        "name": "Dalarna University College",
    },
    {
        "_id": 25595,
        "name": "Dalhousie University",
    },
    {
        "_id": 25596,
        "name": "Dalian Martime University",
    },
    {
        "_id": 25593,
        "name": "Dalanj University",
    },
    {
        "_id": 25598,
        "name": "Dalian Polytechnic University",
    },
    {
        "_id": 25599,
        "name": "Dalian University",
    },
    {
        "_id": 25600,
        "name": "Dalian University of Foreign Language",
    },
    {
        "_id": 25597,
        "name": "Dalian Medical University",
    },
    {
        "_id": 25602,
        "name": "Damanhour University",
    },
    {
        "_id": 25603,
        "name": "Damascus University",
    },
    {
        "_id": 25604,
        "name": "Damghan University of Basic Sciences",
    },
    {
        "_id": 25601,
        "name": "Dalian University of Technology",
    },
    {
        "_id": 25606,
        "name": "Dammam Community College",
    },
    {
        "_id": 25607,
        "name": "Danang College Of Technology",
    },
    {
        "_id": 25608,
        "name": "Daneshestan Institute of Higher Education",
    },
    {
        "_id": 25605,
        "name": "Damietta University",
    },
    {
        "_id": 25610,
        "name": "Danish Business Academy",
    },
    {
        "_id": 25611,
        "name": "Danish University of Education",
    },
    {
        "_id": 25612,
        "name": "Dankook University",
    },
    {
        "_id": 25609,
        "name": "Dániel Berzsenyi Teacher Training College",
    },
    {
        "_id": 25614,
        "name": "Dar Al-Uloom Colleges",
    },
    {
        "_id": 25615,
        "name": "Dares Salaam Institute of Technology",
    },
    {
        "_id": 25616,
        "name": "Darul Hikmah Islamic College",
    },
    {
        "_id": 25613,
        "name": "Dar al Hekma College",
    },
    {
        "_id": 25618,
        "name": "Darul Ihsan University",
    },
    {
        "_id": 25619,
        "name": "Darul Naim College of Technology",
    },
    {
        "_id": 25620,
        "name": "Darul Quran Islamic College University",
    },
    {
        "_id": 25617,
        "name": "Darul Huda Islamic University",
    },
    {
        "_id": 25622,
        "name": "Darul Ulum Islamic College",
    },
    {
        "_id": 25623,
        "name": "Daugavpils University",
    },
    {
        "_id": 25624,
        "name": "Davao Doctors College",
    },
    {
        "_id": 25621,
        "name": "Darul Takzim Institute of Technology",
    },
    {
        "_id": 25626,
        "name": "Dawat University",
    },
    {
        "_id": 25627,
        "name": "Dawood College of Engineering and Technology",
    },
    {
        "_id": 25625,
        "name": "Dav University",
    },
    {
        "_id": 25628,
        "name": "Dayalbagh Educational Institute",
    },
    {
        "_id": 25629,
        "name": "Da-Yeh University",
    },
    {
        "_id": 25630,
        "name": "Daystar University",
    },
    {
        "_id": 25631,
        "name": "DCT International Hotel & Business Management School",
    },
    {
        "_id": 25634,
        "name": "Debrecen University of Agricultural Sciences",
    },
    {
        "_id": 25635,
        "name": "Debre Markos University",
    },
    {
        "_id": 25632,
        "name": "Deakin University",
    },
    {
        "_id": 25633,
        "name": "Debre Birhan University",
    },
    {
        "_id": 25637,
        "name": "Dedan Kimathi University of Technology",
    },
    {
        "_id": 25638,
        "name": "Deen Dayal Upadhyay Gorakhpur University",
    },
    {
        "_id": 25639,
        "name": "De Haagse Hogeschool",
    },
    {
        "_id": 25636,
        "name": "Deccan College Postgraduate and Research Institute",
    },
    {
        "_id": 25641,
        "name": "De La Salle University",
    },
    {
        "_id": 25642,
        "name": "De La Salle University, Araneta",
    },
    {
        "_id": 25643,
        "name": "Delft University of Technology",
    },
    {
        "_id": 25640,
        "name": "DEI Bachelor & Master Degrees",
    },
    {
        "_id": 25645,
        "name": "Delijan Payame Noor University",
    },
    {
        "_id": 25646,
        "name": "Delta University",
    },
    {
        "_id": 25644,
        "name": "Delhi College of Engineering (DCE)",
    },
    {
        "_id": 25647,
        "name": "De Montfort University Leicester",
    },
    {
        "_id": 25649,
        "name": "Deutsche Sporthochschule Köln",
    },
    {
        "_id": 25650,
        "name": "Deutsche Telekom Fachhochschule Leipzig",
    },
    {
        "_id": 25651,
        "name": "Deutsch-Ordens Fachhochschule Riedlingen, Hochschule für Wirtschaft",
    },
    {
        "_id": 25648,
        "name": "Deutsche Hochschule für Verwaltungswissenschaften Speyer",
    },
    {
        "_id": 25653,
        "name": "DeVry Institute of Technology",
    },
    {
        "_id": 25654,
        "name": "Deylaman Institute of Higher Education",
    },
    {
        "_id": 25655,
        "name": "Dhaka International University",
    },
    {
        "_id": 25652,
        "name": "Devi Ahilya University of Indore",
    },
    {
        "_id": 25657,
        "name": "Dhirubhai Ambani Institute of Information and Communication Technology",
    },
    {
        "_id": 25658,
        "name": "Dhofar University",
    },
    {
        "_id": 25659,
        "name": "Dhurakijpundit University",
    },
    {
        "_id": 25656,
        "name": "Dhaka University of Engineering and Technology",
    },
    {
        "_id": 25661,
        "name": "Dibrugarh University",
    },
    {
        "_id": 25662,
        "name": "Dicle (Tirgris) University",
    },
    {
        "_id": 25663,
        "name": "Dijla University College",
    },
    {
        "_id": 25660,
        "name": "Diaconia University of Applied Sciences",
    },
    {
        "_id": 25665,
        "name": "Dimocritus University of Thrace",
    },
    {
        "_id": 25666,
        "name": "DIPLOMA-Fachhochschule Ölsnitz/Vogtland",
    },
    {
        "_id": 25667,
        "name": "Dirección General de Institutos Tecnológicos",
    },
    {
        "_id": 25664,
        "name": "Dilla University",
    },
    {
        "_id": 25669,
        "name": "Divine Word College of Legazpi",
    },
    {
        "_id": 25670,
        "name": "Divine Word University",
    },
    {
        "_id": 25671,
        "name": "Diyala University",
    },
    {
        "_id": 25668,
        "name": "Dire Dawa University",
    },
    {
        "_id": 25673,
        "name": "Dnepropetrovsk National University",
    },
    {
        "_id": 25674,
        "name": "Dnepropetrovsk National University of Railway Transport",
    },
    {
        "_id": 25675,
        "name": "Dogus University",
    },
    {
        "_id": 25672,
        "name": "Dneprodzerzhinsk State Technical University",
    },
    {
        "_id": 25677,
        "name": "Dohto University",
    },
    {
        "_id": 25678,
        "name": "Dokkyo University",
    },
    {
        "_id": 25679,
        "name": "Dokkyo University School of Medicine",
    },
    {
        "_id": 25681,
        "name": "Dominican College of Philosophy and Theology",
    },
    {
        "_id": 25676,
        "name": "Doho University",
    },
    {
        "_id": 25682,
        "name": "Dominica State College",
    },
    {
        "_id": 25683,
        "name": "Donau-Universität Krems",
    },
    {
        "_id": 25680,
        "name": "Dokuz Eylül University",
    },
    {
        "_id": 25685,
        "name": "Donetsk National University",
    },
    {
        "_id": 25686,
        "name": "Donetsk State Medical University",
    },
    {
        "_id": 25687,
        "name": "Dong-A University",
    },
    {
        "_id": 25684,
        "name": "Donetsk National Technical University",
    },
    {
        "_id": 25689,
        "name": "Dongduk Women's University",
    },
    {
        "_id": 25690,
        "name": "Dong Eui University",
    },
    {
        "_id": 25691,
        "name": "Dongguk University",
    },
    {
        "_id": 25688,
        "name": "Dongbei University of Finance And Economics",
    },
    {
        "_id": 25693,
        "name": "Dongseo University",
    },
    {
        "_id": 25694,
        "name": "Dongshin University",
    },
    {
        "_id": 25695,
        "name": "Dong Yang University of Technology",
    },
    {
        "_id": 25692,
        "name": "Donghua University, Shanghai",
    },
    {
        "_id": 25697,
        "name": "Don State Agrarian University",
    },
    {
        "_id": 25698,
        "name": "Don State Technical University",
    },
    {
        "_id": 25699,
        "name": "Doshisha University",
    },
    {
        "_id": 25696,
        "name": "Don Mariano Marcos Memorial State University",
    },
    {
        "_id": 25701,
        "name": "Douglas College",
    },
    {
        "_id": 25702,
        "name": "Dow University of Health Sciences",
    },
    {
        "_id": 25703,
        "name": "Dravidian University",
    },
    {
        "_id": 25704,
        "name": "Dr. Babasaheb Ambedkar Marathwada Universtiy",
    },
    {
        "_id": 25700,
        "name": "Doshisha Women's College of Liberal Arts",
    },
    {
        "_id": 25705,
        "name": "Dr. Babasaheb Ambedkar Technological University",
    },
    {
        "_id": 25706,
        "name": "Dr. Bhim Rao Abdekar University",
    },
    {
        "_id": 25707,
        "name": "Dr. B.R. Ambedkar Open University",
    },
    {
        "_id": 25708,
        "name": "Dr. C.V. Raman University",
    },
    {
        "_id": 25710,
        "name": "Dr. Hari Singh Gour University, formerly University of Sagar",
    },
    {
        "_id": 25711,
        "name": "Dr. Panjabrao Deshmukh Krishi Vidyapeeth",
    },
    {
        "_id": 25712,
        "name": "Dr. Ram Manohar Lohia Avadh University",
    },
    {
        "_id": 25709,
        "name": "Dr. D.Y. Patil University",
    },
    {
        "_id": 25715,
        "name": "Drzavni Univerzitet u Novom Pazaru",
    },
    {
        "_id": 25714,
        "name": "Duale Hochschule Baden-Württemberg",
    },
    {
        "_id": 25716,
        "name": "Dubai Medical College for Girls",
    },
    {
        "_id": 25713,
        "name": "Dr. YS Parmar University of Horticulture and Forestry",
    },
    {
        "_id": 25719,
        "name": "Dublin Institute for Advanced Studies",
    },
    {
        "_id": 25718,
        "name": "Dublin City University",
    },
    {
        "_id": 25720,
        "name": "Dublin Institute of Technology",
    },
    {
        "_id": 25717,
        "name": "Dubai Pharmacy College",
    },
    {
        "_id": 25722,
        "name": "Duksung Women's University",
    },
    {
        "_id": 25723,
        "name": "Dumlupinar University",
    },
    {
        "_id": 25724,
        "name": "Dunya Institute of Higher Education",
    },
    {
        "_id": 25721,
        "name": "Dubna International University for Nature, Society and Man",
    },
    {
        "_id": 25726,
        "name": "Durham College",
    },
    {
        "_id": 25727,
        "name": "Dutch Delta University",
    },
    {
        "_id": 25725,
        "name": "Durban Institute of Technology",
    },
    {
        "_id": 25728,
        "name": "Dutch University Institute for Art History (DUIA)",
    },
    {
        "_id": 25729,
        "name": "E.A.P. Europäische Wirtschaftshochschule Berlin",
    },
    {
        "_id": 25730,
        "name": "East Africa University Bosaso",
    },
    {
        "_id": 25731,
        "name": "East China Jiao Tong University",
    },
    {
        "_id": 25734,
        "name": "East Delta University",
    },
    {
        "_id": 25735,
        "name": "Eastern Asia University",
    },
    {
        "_id": 25732,
        "name": "East China Normal University",
    },
    {
        "_id": 25733,
        "name": "East China University of Science and Technology",
    },
    {
        "_id": 25737,
        "name": "Eastern University",
    },
    {
        "_id": 25738,
        "name": "Eastern University of Sri Lanka",
    },
    {
        "_id": 25739,
        "name": "East Kazakhstan State University",
    },
    {
        "_id": 25736,
        "name": "Eastern Mediterranean University",
    },
    {
        "_id": 25741,
        "name": "East-Siberian State Institute of Culture",
    },
    {
        "_id": 25742,
        "name": "East-Siberian State University",
    },
    {
        "_id": 25743,
        "name": "East-Siberian State University of Technology",
    },
    {
        "_id": 25740,
        "name": "East Kazakstan State Technical University",
    },
    {
        "_id": 25745,
        "name": "East West University",
    },
    {
        "_id": 25746,
        "name": "East-West University, Mohakhali",
    },
    {
        "_id": 25747,
        "name": "Eberhard-Karls-Universität Tübingen",
    },
    {
        "_id": 25744,
        "name": "East Ukrainian National University",
    },
    {
        "_id": 25749,
        "name": "ECAM - Institut Supérieur Industriel",
    },
    {
        "_id": 25750,
        "name": "Ecole Catholique d'Arts & Metiers",
    },
    {
        "_id": 25751,
        "name": "Ecole Centrale d'Electronique - ECE",
    },
    {
        "_id": 25748,
        "name": "Ebonyi State University",
    },
    {
        "_id": 25753,
        "name": "Ecole Centrale de Lyon",
    },
    {
        "_id": 25754,
        "name": "Ecole Centrale de Nantes",
    },
    {
        "_id": 25755,
        "name": "Ecole d'Architecture de Nancy",
    },
    {
        "_id": 25752,
        "name": "Ecole Centrale de Lille",
    },
    {
        "_id": 25757,
        "name": "Ecole des Hautes Etudes Commerciales",
    },
    {
        "_id": 25758,
        "name": "École des Hautes Études Commerciales",
    },
    {
        "_id": 25759,
        "name": "Ecole des Hautes Etudes Commerciales du Nord",
    },
    {
        "_id": 25756,
        "name": "Ecole de l'Air",
    },
    {
        "_id": 25761,
        "name": "Ecole des Hautes Etudes en Gestion Informatique et Communication",
    },
    {
        "_id": 25762,
        "name": "Ecole des Hautes Etudes Industrielles de Lille",
    },
    {
        "_id": 25763,
        "name": "Ecole des Ingénieurs de la Ville de Paris",
    },
    {
        "_id": 25760,
        "name": "Ecole des Hautes Etudes Commerciales MAROC",
    },
    {
        "_id": 25765,
        "name": "Ecole d'Ingénieurs en Informatique pour l'Industrie",
    },
    {
        "_id": 25766,
        "name": "Ecole Européen des Affaires",
    },
    {
        "_id": 25767,
        "name": "Ecole Européenne de Chimie, Polymères et Matériaux de Strasbourg",
    },
    {
        "_id": 25764,
        "name": "École de technologie supérieure, Université du Québec",
    },
    {
        "_id": 25769,
        "name": "Ecole Française de Papeterie et des Industries Graphiques",
    },
    {
        "_id": 25770,
        "name": "Ecole Mohammadia d'Ingénieurs",
    },
    {
        "_id": 25771,
        "name": "Ecole National d'Agriculture de Meknes",
    },
    {
        "_id": 25768,
        "name": "Ecole Française d'Electronique et d'Informatique",
    },
    {
        "_id": 25773,
        "name": "École nationale d'administration publique, Université du Québec",
    },
    {
        "_id": 25774,
        "name": "Ecole Nationale d'Architecture",
    },
    {
        "_id": 25775,
        "name": "Ecole Nationale de la Météorologie",
    },
    {
        "_id": 25772,
        "name": "Ecole Nationale d'Administration",
    },
    {
        "_id": 25777,
        "name": "Ecole Nationale de la Statistique et de l'Analyse de l'information",
    },
    {
        "_id": 25778,
        "name": "Ecole Nationale de l'Aviation Civile",
    },
    {
        "_id": 25779,
        "name": "Ecole Nationale des Ponts et Chausees",
    },
    {
        "_id": 25776,
        "name": "Ecole Nationale de la Statistique et de l'Administration Economique",
    },
    {
        "_id": 25781,
        "name": "Ecole Nationale des Travaux Publics de l'Etat",
    },
    {
        "_id": 25782,
        "name": "Ecole Nationale d'Ingénieurs de Metz",
    },
    {
        "_id": 25783,
        "name": "Ecole Nationale d'Ingénieurs de Saint-Etienne",
    },
    {
        "_id": 25780,
        "name": "Ecole Nationale des Sciences Géographiques",
    },
    {
        "_id": 25785,
        "name": "Ecole Nationale d'Ingénieurs des Travaux Agricoles de Bordeaux",
    },
    {
        "_id": 25786,
        "name": "Ecole Nationale d'Ingénieurs des Travaux Agricoles de Clermont-Ferrand",
    },
    {
        "_id": 25787,
        "name": "Ecole Nationale d'Ingénieurs de Tarbes",
    },
    {
        "_id": 25784,
        "name": "Ecole Nationale d'Ingénieurs des Techniques des Industries Agricoles et Alimentaires",
    },
    {
        "_id": 25789,
        "name": "Ecole Nationale Supérieur de Géologie de Nancy",
    },
    {
        "_id": 25790,
        "name": "Ecole Nationale Supérieur de Mécanique et d'Aéronautique",
    },
    {
        "_id": 25791,
        "name": "Ecole Nationale Supérieur de Mécaniques et des Microtechniques",
    },
    {
        "_id": 25788,
        "name": "Ecole Nationale du Génie de l'Eau et de l'Environnement de Strasbourg",
    },
    {
        "_id": 25793,
        "name": "Ecole Nationale Supérieur d'Ingénieurs de Constructions Aéronautique",
    },
    {
        "_id": 25794,
        "name": "Ecole Nationale Supérieure Agronomique de Toulouse",
    },
    {
        "_id": 25795,
        "name": "Ecole Nationale Supérieure d'Agronomie de Montpellier",
    },
    {
        "_id": 25792,
        "name": "Ecole Nationale Supérieur des Ingénieur des Etudes et Techniques d'Armement",
    },
    {
        "_id": 25797,
        "name": "Ecole Nationale Supérieure d'Agronomie et des Industries Alimentaires",
    },
    {
        "_id": 25798,
        "name": "Ecole Nationale Supérieure d'Arts et Métiers de Paris",
    },
    {
        "_id": 25799,
        "name": "Ecole Nationale Supérieure de Biologie Appliquée à la Nutrition et à l'Alementation",
    },
    {
        "_id": 25796,
        "name": "Ecole Nationale Supérieure d'Agronomie de Rennes",
    },
    {
        "_id": 25801,
        "name": "Ecole Nationale Supérieure de Chimie de Lille",
    },
    {
        "_id": 25802,
        "name": "Ecole Nationale Supérieure de Chimie de Montpellier",
    },
    {
        "_id": 25803,
        "name": "Ecole Nationale Supérieure de Chimie de Mulhouse",
    },
    {
        "_id": 25800,
        "name": "Ecole Nationale Supérieure de Chimie de Clermont-Ferrand",
    },
    {
        "_id": 25805,
        "name": "Ecole Nationale Supérieure de Chimie de Rennes",
    },
    {
        "_id": 25806,
        "name": "Ecole Nationale Supérieure de Chimie de Toulouse",
    },
    {
        "_id": 25808,
        "name": "Ecole Nationale Supérieure de l'Aéronautique et de l'Espace",
    },
    {
        "_id": 25804,
        "name": "Ecole Nationale Supérieure de Chimie de Paris",
    },
    {
        "_id": 25809,
        "name": "Ecole Nationale Supérieure d'Electrochimie et d'Electrométallurgie de Gernoble",
    },
    {
        "_id": 25810,
        "name": "Ecole Nationale Supérieure d'Electronique, d'Electrotechnique, d'Informatique et d'Hydraulique de Toulouse",
    },
    {
        "_id": 25811,
        "name": "Ecole Nationale Supérieure d'Electronique et de Radioelectricite de Bordeaux",
    },
    {
        "_id": 25807,
        "name": "Ecole Nationale Supérieure de Chimie et de Physique de Bordeaux",
    },
    {
        "_id": 25813,
        "name": "Ecole Nationale Supérieure de l'Electronique et de ses Applications",
    },
    {
        "_id": 25814,
        "name": "Ecole Nationale Supérieure de Physique de Grenoble",
    },
    {
        "_id": 25815,
        "name": "Ecole Nationale Supérieure de Physique de Marseille",
    },
    {
        "_id": 25812,
        "name": "Ecole Nationale Supérieure d'Electronique et de Radioelectricite de Grenoble",
    },
    {
        "_id": 25817,
        "name": "Ecole Nationale Supérieure des Arts et Industries de Strasbourg",
    },
    {
        "_id": 25818,
        "name": "Ecole Nationale Supérieure des Arts et Industries Textiles",
    },
    {
        "_id": 25819,
        "name": "Ecole Nationale Supérieure des Industries Chimiques de Nancy",
    },
    {
        "_id": 25816,
        "name": "Ecole Nationale Supérieure de Physique de Strasbourg",
    },
    {
        "_id": 25821,
        "name": "Ecole Nationale Supérieure des Mines d'Alès",
    },
    {
        "_id": 25822,
        "name": "Ecole Nationale Supérieure des Mines de Douai",
    },
    {
        "_id": 25823,
        "name": "Ecole Nationale Supérieure des Mines de Nancy",
    },
    {
        "_id": 25820,
        "name": "Ecole Nationale Supérieure des Industries Textiles de Mulhouse",
    },
    {
        "_id": 25825,
        "name": "Ecole Nationale Supérieure des Mines de St-Etienne",
    },
    {
        "_id": 25827,
        "name": "Ecole Nationale Supérieure des Telecommunications de Paris",
    },
    {
        "_id": 25826,
        "name": "Ecole Nationale Supérieure des Telecommunications de Bretagne",
    },
    {
        "_id": 25824,
        "name": "Ecole Nationale Supérieure des Mines de Paris",
    },
    {
        "_id": 25828,
        "name": "Ecole Nationale Supérieure de Techniques Avancées",
    },
    {
        "_id": 25829,
        "name": "Ecole Nationale Supérieure d'Hydraulique et de Mécanique de Grenoble",
    },
    {
        "_id": 25832,
        "name": "Ecole Nationale Supérieure d'Ingénieurs de Génie Chimique",
    },
    {
        "_id": 25833,
        "name": "Ecole Nationale Supérieure d'Ingenieurs Electriciens de Grenoble",
    },
    {
        "_id": 25830,
        "name": "Ecole Nationale Superieure d'Informatique et de Mathematiques Appliquees de Grenoble",
    },
    {
        "_id": 25831,
        "name": "École Nationale Supérieure d'Ingénieurs de Constructions Aéronautiques",
    },
    {
        "_id": 25835,
        "name": "Ecole Nationale Supérieure du Pétrole et des Monteurs",
    },
    {
        "_id": 25836,
        "name": "Ecole Nationale Supérieure Electricité et Mécanique",
    },
    {
        "_id": 25837,
        "name": "Ecole Nationale Supérieure en Electrotechnique, Electronique, Informatique et Hydraulique de Toulouse",
    },
    {
        "_id": 25834,
        "name": "Ecole Nationale Supérieure d'Ingénieurs en Mécanique et Energétique de Valenciennes",
    },
    {
        "_id": 25839,
        "name": "Ecole Nationale Vétérinaire de Lyon",
    },
    {
        "_id": 25840,
        "name": "Ecole Nationale Vétérinaire de Nantes",
    },
    {
        "_id": 25841,
        "name": "Ecole Nationale Vétérinaire de Toulouse",
    },
    {
        "_id": 25838,
        "name": "Ecole Nationale Vétérinaire d'Alfort",
    },
    {
        "_id": 25843,
        "name": "Ecole Normale Supérieure de Fontenay-Saint Cloud",
    },
    {
        "_id": 25844,
        "name": "Ecole Normale Supérieure de Lyon",
    },
    {
        "_id": 25845,
        "name": "Ecole Normale Supérieure de Paris",
    },
    {
        "_id": 25842,
        "name": "Ecole Normale Supérieure de Cachan",
    },
    {
        "_id": 25847,
        "name": "École Polytechnique de Montréal, Université de Montréal",
    },
    {
        "_id": 25848,
        "name": "Ecole Polytechnique Marseille",
    },
    {
        "_id": 25849,
        "name": "Ecole Polytechnique Universitaire de Lille",
    },
    {
        "_id": 25846,
        "name": "Ecole Polytechnique",
    },
    {
        "_id": 25851,
        "name": "Ecole Spéciale de Mécanique et d'Electricité",
    },
    {
        "_id": 25852,
        "name": "Ecole Spéciale des Travaux Publics du Bâtiment et de l'Industrie",
    },
    {
        "_id": 25853,
        "name": "Ecole Superieur d'Ingenieurs Leonard de Vinci",
    },
    {
        "_id": 25850,
        "name": "Ecole pour les Etudes et la Recherche en Informatique et Electronique",
    },
    {
        "_id": 25855,
        "name": "Ecole Supérieure d'Agriculture de Purpan",
    },
    {
        "_id": 25854,
        "name": "Ecole Supérieure d'Agriculture d'Angers",
    },
    {
        "_id": 25857,
        "name": "Ecole Supérieure de Chimie Physique Electronique de Lyon",
    },
    {
        "_id": 25856,
        "name": "Ecole Supérieure de Chimie Organique et Minérale",
    },
    {
        "_id": 25858,
        "name": "Ecole Supérieure de Commerce de Bordeaux",
    },
    {
        "_id": 25859,
        "name": "Ecole Supérieure de Commerce de Clermont-Ferrand",
    },
    {
        "_id": 25860,
        "name": "Ecole Supérieure de Commerce de Brest",
    },
    {
        "_id": 25863,
        "name": "Ecole Supérieure de Commerce de Le Havre/Caen",
    },
    {
        "_id": 25864,
        "name": "Ecole Supérieure de Commerce de Lille",
    },
    {
        "_id": 25861,
        "name": "Ecole Supérieure de Commerce de Dijon",
    },
    {
        "_id": 25862,
        "name": "Ecole Supérieure de Commerce de Grenoble",
    },
    {
        "_id": 25866,
        "name": "Ecole Supérieure de Commerce de Marseille-Provence",
    },
    {
        "_id": 25867,
        "name": "Ecole Supérieure de Commerce de Nantes-Atlantique",
    },
    {
        "_id": 25868,
        "name": "Ecole Supérieure de Commerce de Paris",
    },
    {
        "_id": 25865,
        "name": "Ecole Supérieure de Commerce de Lyon",
    },
    {
        "_id": 25870,
        "name": "Ecole Supérieure de Commerce de Reims",
    },
    {
        "_id": 25871,
        "name": "Ecole Supérieure de Commerce de Rouen",
    },
    {
        "_id": 25872,
        "name": "Ecole Supérieure de Commerce de Sophia Antipolis",
    },
    {
        "_id": 25869,
        "name": "Ecole Supérieure de Commerce de Pau",
    },
    {
        "_id": 25874,
        "name": "Ecole Supérieure de Commerce et des Affaires",
    },
    {
        "_id": 25875,
        "name": "Ecole Supérieure de Commerce et Management",
    },
    {
        "_id": 25876,
        "name": "Ecole Supérieure d'Electricité",
    },
    {
        "_id": 25873,
        "name": "Ecole Supérieure de Commerce de Toulouse",
    },
    {
        "_id": 25877,
        "name": "Ecole Supérieure de Physique et de Chimie Industrielles",
    },
    {
        "_id": 25879,
        "name": "Ecole Supérieure des Sciences Commerciales d'Angers",
    },
    {
        "_id": 25880,
        "name": "Ecole Supérieure des Sciences Economiques et Commerciales",
    },
    {
        "_id": 25878,
        "name": "Ecole Supérieure d'Electronique de l'Ouest",
    },
    {
        "_id": 25881,
        "name": "Ecole Supérieure des Techniques Industrielles et des Textiles",
    },
    {
        "_id": 25883,
        "name": "Ecole Superieure des Télécommunications",
    },
    {
        "_id": 25884,
        "name": "Ecole Supérieure d'Informatique-Electronique-Automatique",
    },
    {
        "_id": 25882,
        "name": "Ecole Supérieure des Sciences et Technologie de l'Ingénieur de Nancy",
    },
    {
        "_id": 25886,
        "name": "Ecole Supérieure d'Ingénieurs de Marseille",
    },
    {
        "_id": 25887,
        "name": "Ecole Supérieure d'Ingénieurs en Electronique et Electrotechnique",
    },
    {
        "_id": 25888,
        "name": "Ecole Supérieure d'Ingénieurs en Génie Electrique",
    },
    {
        "_id": 25885,
        "name": "Ecole Supérieure d'Informatique et de Management",
    },
    {
        "_id": 25890,
        "name": "Ecole Supérieure d'Optique",
    },
    {
        "_id": 25891,
        "name": "Ecole Supérieure Internationale d'Administration des Entreprises",
    },
    {
        "_id": 25892,
        "name": "Ecole Superieure Robert de Sorbon",
    },
    {
        "_id": 25889,
        "name": "Ecole Supérieure d'Ingénieurs et de Techniciens pour l'Agriculture",
    },
    {
        "_id": 25894,
        "name": "Edith Cowan University",
    },
    {
        "_id": 25895,
        "name": "Edogawa University",
    },
    {
        "_id": 25896,
        "name": "Eelo American University",
    },
    {
        "_id": 25893,
        "name": "Ecole Universitaire d'Ingénieurs de Lille",
    },
    {
        "_id": 25898,
        "name": "Egerton University",
    },
    {
        "_id": 25899,
        "name": "Ege University",
    },
    {
        "_id": 25900,
        "name": "Ehime University",
    },
    {
        "_id": 25897,
        "name": "Effat College",
    },
    {
        "_id": 25902,
        "name": "Eichi University",
    },
    {
        "_id": 25903,
        "name": "Eiilm University",
    },
    {
        "_id": 25904,
        "name": "Eindhoven University of Technology",
    },
    {
        "_id": 25901,
        "name": "EHSAL - Europese Hogeschool Brussel",
    },
    {
        "_id": 25906,
        "name": "El Colegio de México",
    },
    {
        "_id": 25907,
        "name": "Elisabeth University of Music",
    },
    {
        "_id": 25908,
        "name": "Elmergib University",
    },
    {
        "_id": 25905,
        "name": "Ekiti State University",
    },
    {
        "_id": 25910,
        "name": "El Shorouk Academy",
    },
    {
        "_id": 25911,
        "name": "Emanuel University",
    },
    {
        "_id": 25912,
        "name": "Emeishan Buddhist College",
    },
    {
        "_id": 25909,
        "name": "Elrazi College Of Medical & Technological Sciences",
    },
    {
        "_id": 25914,
        "name": "EMESCAM - Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória",
    },
    {
        "_id": 25915,
        "name": "Emilio Aguinaldo College",
    },
    {
        "_id": 25916,
        "name": "Emily Carr Institute of Art + Design",
    },
    {
        "_id": 25913,
        "name": "Emeq Yizrael College",
    },
    {
        "_id": 25918,
        "name": "Engineering College of Copenhagen",
    },
    {
        "_id": 25919,
        "name": "Engineering Colleges in Bhubaneswar",
    },
    {
        "_id": 25920,
        "name": "Engineering Colleges in Tamil Nadu",
    },
    {
        "_id": 25917,
        "name": "Engineering College of Aarhus",
    },
    {
        "_id": 25922,
        "name": "ENIC Telecom Lille 1",
    },
    {
        "_id": 25923,
        "name": "Enugu State University of Science and Technology",
    },
    {
        "_id": 25924,
        "name": "Eötvös Lorand University",
    },
    {
        "_id": 25921,
        "name": "Engineering Faculty of Asian University",
    },
    {
        "_id": 25926,
        "name": "Epoka University",
    },
    {
        "_id": 25927,
        "name": "Erasmushogeschool Brussel",
    },
    {
        "_id": 25925,
        "name": "EPF Ecole d'Ingénieurs",
    },
    {
        "_id": 25928,
        "name": "Erasmus University Rotterdam",
    },
    {
        "_id": 25929,
        "name": "Erciyes University",
    },
    {
        "_id": 25930,
        "name": "Eritrea Institute of Technology",
    },
    {
        "_id": 25931,
        "name": "Ernst-Moritz-Arndt Universität Greifswald",
    },
    {
        "_id": 25932,
        "name": "Escola Nautica Infante D. Henrique",
    },
    {
        "_id": 25934,
        "name": "Escola Superior de Hotelaria e Turismo do Estoril",
    },
    {
        "_id": 25935,
        "name": "Escola Universitária Vasco da Gama",
    },
    {
        "_id": 25936,
        "name": "Escuela Agricola Pa'name'ricana Zamorano",
    },
    {
        "_id": 25933,
        "name": "Escola Superior de Artes e Design",
    },
    {
        "_id": 25938,
        "name": "Escuela Colombiana de Carreras Industriales",
    },
    {
        "_id": 25939,
        "name": "Escuela Colombiana de Ingeniería Julio Garavito",
    },
    {
        "_id": 25940,
        "name": "Escuela de Administración de Negocios",
    },
    {
        "_id": 25937,
        "name": "Escuela Bancaria y Comercial",
    },
    {
        "_id": 25942,
        "name": "Escuela de Ingeniería de Antioquia",
    },
    {
        "_id": 25943,
        "name": "Escuela de Policia 'General Santander'",
    },
    {
        "_id": 25944,
        "name": "Escuela Militar de Ingeniería",
    },
    {
        "_id": 25941,
        "name": "Escuela de Arquitectura y Diseño",
    },
    {
        "_id": 25946,
        "name": "Escuela Politécnica de Chimborazo",
    },
    {
        "_id": 25947,
        "name": "Escuela Politécnica del Ejercito",
    },
    {
        "_id": 25948,
        "name": "Escuela Politécnica Nacional",
    },
    {
        "_id": 25945,
        "name": "Escuela Nacional de Estudios Superiores Unidad León",
    },
    {
        "_id": 25950,
        "name": "Escuela Superiore de Administración Pública",
    },
    {
        "_id": 25951,
        "name": "Escuela Superior Politécnica del Litoral",
    },
    {
        "_id": 25952,
        "name": "Espam Formation University",
    },
    {
        "_id": 25949,
        "name": "Escuela Superior de Gestion Comercial y Marketing (ESIC)",
    },
    {
        "_id": 25954,
        "name": "Estonian Academy of Music and Theatre",
    },
    {
        "_id": 25955,
        "name": "Estonian Academy of Security Sciences",
    },
    {
        "_id": 25956,
        "name": "Estonian Business School",
    },
    {
        "_id": 25953,
        "name": "Estonian Academy of Arts",
    },
    {
        "_id": 25958,
        "name": "Esztergom Theological College",
    },
    {
        "_id": 25959,
        "name": "Ethiopian Civil Service University",
    },
    {
        "_id": 25960,
        "name": "Etisalat University College",
    },
    {
        "_id": 25957,
        "name": "Estonian University of Life Sciences",
    },
    {
        "_id": 25962,
        "name": "Eurasia International University",
    },
    {
        "_id": 25963,
        "name": "Eurasian Institute of market",
    },
    {
        "_id": 25964,
        "name": "EURECOM, Graduate School In Communication Systems",
    },
    {
        "_id": 25961,
        "name": "EUCLID University",
    },
    {
        "_id": 25966,
        "name": "Europäische Betriebswirtschafts-Akademie",
    },
    {
        "_id": 25967,
        "name": "Europäische Fachhochschule",
    },
    {
        "_id": 25968,
        "name": "Europa-Universität Viadrina Frankfurt (Oder)",
    },
    {
        "_id": 25965,
        "name": "Europa Fachhochschule Fresenius",
    },
    {
        "_id": 25970,
        "name": "European Business School",
    },
    {
        "_id": 25971,
        "name": "European Business School Schloß Reichartshausen",
    },
    {
        "_id": 25972,
        "name": "European Carolus Magnus University",
    },
    {
        "_id": 25969,
        "name": "European Academy of Arts in Warsaw",
    },
    {
        "_id": 25974,
        "name": "European Graduate School, Media & Communications",
    },
    {
        "_id": 25975,
        "name": "European Humanities University",
    },
    {
        "_id": 25976,
        "name": "European Institute of Education",
    },
    {
        "_id": 25973,
        "name": "European College of Liberal Arts",
    },
    {
        "_id": 25978,
        "name": "European Management Center Paris",
    },
    {
        "_id": 25979,
        "name": "European Management School",
    },
    {
        "_id": 25980,
        "name": "European Open University",
    },
    {
        "_id": 25977,
        "name": "European International University",
    },
    {
        "_id": 25982,
        "name": "European School of Economics",
    },
    {
        "_id": 25983,
        "name": "European University",
    },
    {
        "_id": 25984,
        "name": "European University, Athens Campus",
    },
    {
        "_id": 25981,
        "name": "European Regional Educational Academy of Armenia",
    },
    {
        "_id": 25986,
        "name": "European University Cyprus",
    },
    {
        "_id": 25987,
        "name": "European University Institute",
    },
    {
        "_id": 25988,
        "name": "European University of Lefke",
    },
    {
        "_id": 25985,
        "name": "European University at St.Petersburg",
    },
    {
        "_id": 25990,
        "name": "Evangelische Fachhochschule Berlin, Fachhochschule für Sozialarbeit und Sozialpädagogik",
    },
    {
        "_id": 25991,
        "name": "Evangelische Fachhochschule Darmstadt",
    },
    {
        "_id": 25992,
        "name": "Evangelische Fachhochschule Freiburg, Hochschule für Soziale Arbeit, Diakonie und Religionspädagogik",
    },
    {
        "_id": 25989,
        "name": "European University Portugal",
    },
    {
        "_id": 25994,
        "name": "Evangelische Fachhochschule für Sozialpädagogik der 'Diakonenanstalt des Rauhen Hauses' Hamburg",
    },
    {
        "_id": 25995,
        "name": "Evangelische Fachhochschule Hannover",
    },
    {
        "_id": 25996,
        "name": "Evangelische Fachhochschule Ludwigshafen Hochschule für Sozial- und Gesundheitswesen",
    },
    {
        "_id": 25993,
        "name": "Evangelische Fachhochschule für Religionspädagogik, und Gemeindediakonie Moritzburg",
    },
    {
        "_id": 25997,
        "name": "Evangelische Fachhochschule Nürnberg",
    },
    {
        "_id": 25998,
        "name": "Evangelische Fachhochschule Reutlingen-Ludwigsburg, Hochschule für Soziale Arbeit, Religionspädagogik und Diakonie",
    },
    {
        "_id": 25999,
        "name": "Evangelische Fachhochschule Rheinland-Westfalen-Lippe",
    },
    {
        "_id": 26000,
        "name": "Evangelische Hochschule für Soziale Arbeit Dresden (FH)",
    },
    {
        "_id": 26001,
        "name": "Evangelische Theologische Faculteit, Leuven",
    },
    {
        "_id": 26003,
        "name": "Ewha Women's University",
    },
    {
        "_id": 26004,
        "name": "FAAP - Fundação Armando Alvares Penteado",
    },
    {
        "_id": 26005,
        "name": "Fachhochschule Aachen",
    },
    {
        "_id": 26002,
        "name": "EVTEK University of Applied Sciences",
    },
    {
        "_id": 26007,
        "name": "Fachhochschule Augsburg",
    },
    {
        "_id": 26008,
        "name": "Fachhochschule Biberach, Hochschule für Bauwesen und Wirtschaft",
    },
    {
        "_id": 26009,
        "name": "Fachhochschule Bielefeld",
    },
    {
        "_id": 26006,
        "name": "Fachhochschule Aschaffenburg",
    },
    {
        "_id": 26011,
        "name": "Fachhochschule Bochum",
    },
    {
        "_id": 26012,
        "name": "Fachhochschule Bonn-Rhein-Sieg",
    },
    {
        "_id": 26013,
        "name": "Fachhochschule Brandenburg",
    },
    {
        "_id": 26010,
        "name": "Fachhochschule Bingen",
    },
    {
        "_id": 26015,
        "name": "Fachhochschule Burgenland",
    },
    {
        "_id": 26016,
        "name": "Fachhochschule Deggendorf",
    },
    {
        "_id": 26017,
        "name": "Fachhochschule der Wirtschaft",
    },
    {
        "_id": 26014,
        "name": "Fachhochschule Braunschweig/Wolfenbüttel",
    },
    {
        "_id": 26019,
        "name": "Fachhochschule Dortmund",
    },
    {
        "_id": 26020,
        "name": "Fachhochschule Düsseldorf",
    },
    {
        "_id": 26021,
        "name": "Fachhochschule Eberswalde",
    },
    {
        "_id": 26018,
        "name": "Fachhochschule des Mittelstandes (FHM)",
    },
    {
        "_id": 26023,
        "name": "Fachhochschule Flensburg",
    },
    {
        "_id": 26024,
        "name": "Fachhochschule Frankfurt am Main",
    },
    {
        "_id": 26025,
        "name": "Fachhochschule für Bank- und Finanzwirtschaft",
    },
    {
        "_id": 26022,
        "name": "Fachhochschule Erfurt",
    },
    {
        "_id": 26027,
        "name": "Fachhochschule für die Wirtschaft",
    },
    {
        "_id": 26026,
        "name": "Fachhochschule für das öffentliche Bibliothekswesen Bonn",
    },
    {
        "_id": 26028,
        "name": "Fachhochschule für Oekonomie und Management (FOM)",
    },
    {
        "_id": 26029,
        "name": "Fachhochschule für Technik und Wirtschaft Berlin",
    },
    {
        "_id": 26030,
        "name": "Fachhochschule Furtwangen, Hochschule für Technik und Wirtschaft",
    },
    {
        "_id": 26031,
        "name": "Fachhochschule für Verwaltung und Rechtspflege Berlin",
    },
    {
        "_id": 26035,
        "name": "Fachhochschule Hamburg",
    },
    {
        "_id": 26032,
        "name": "Fachhochschule für Wirtschaft Berlin",
    },
    {
        "_id": 26033,
        "name": "Fachhochschule Gelsenkirchen",
    },
    {
        "_id": 26034,
        "name": "Fachhochschule Gießen-Friedberg",
    },
    {
        "_id": 26037,
        "name": "Fachhochschule Heidelberg",
    },
    {
        "_id": 26038,
        "name": "Fachhochschule Heilbronn, Hochschule für Technik und Wirtschaft",
    },
    {
        "_id": 26039,
        "name": "Fachhochschule Hildesheim/Holzminden/Göttingen, Hochschule für angewandte Wissenschaft und Kunst",
    },
    {
        "_id": 26036,
        "name": "Fachhochschule Hannover",
    },
    {
        "_id": 26041,
        "name": "Fachhochschule Ingolstadt",
    },
    {
        "_id": 26042,
        "name": "Fachhochschule Jena",
    },
    {
        "_id": 26043,
        "name": "FH JOANNEUM",
    },
    {
        "_id": 26040,
        "name": "Fachhochschule Hof",
    },
    {
        "_id": 26045,
        "name": "CUAS",
    },
    {
        "_id": 26046,
        "name": "Fachhochschule Kempten, University of Technology and Economics",
    },
    {
        "_id": 26047,
        "name": "Fachhochschule Kiel",
    },
    {
        "_id": 26044,
        "name": "Fachhochschule Kaiserslautern",
    },
    {
        "_id": 26049,
        "name": "University of Applied Sciences Cologne",
    },
    {
        "_id": 26050,
        "name": "Fachhochschule Konstanz, University of Technology, Business and Design",
    },
    {
        "_id": 26051,
        "name": "Fachhochschule Krems",
    },
    {
        "_id": 26048,
        "name": "Fachhochschule Koblenz",
    },
    {
        "_id": 26053,
        "name": "Fachhochschule Landshut, School of Business - Social affairs - art",
    },
    {
        "_id": 26054,
        "name": "Fachhochschule Lausitz",
    },
    {
        "_id": 26055,
        "name": "Fachhochschule Lippe",
    },
    {
        "_id": 26052,
        "name": "Fachhochschule Kufstein (Tirol)",
    },
    {
        "_id": 26057,
        "name": "Fachhochschule Ludwigshafen, School of Business",
    },
    {
        "_id": 26058,
        "name": "Fachhochschule Mainz",
    },
    {
        "_id": 26059,
        "name": "Fachhochschule Mannheim, University for Applied Sciences",
    },
    {
        "_id": 26056,
        "name": "Fachhochschule Lübeck",
    },
    {
        "_id": 26061,
        "name": "Fachhochschule Merseburg",
    },
    {
        "_id": 26062,
        "name": "Fachhochschule Munich",
    },
    {
        "_id": 26063,
        "name": "MUAS",
    },
    {
        "_id": 26060,
        "name": "Fachhochschule Mannheim, University of Technology and Design",
    },
    {
        "_id": 26065,
        "name": "Fachhochschule Neu-Ulm",
    },
    {
        "_id": 26066,
        "name": "Fachhochschule Niederrhein",
    },
    {
        "_id": 26067,
        "name": "Fachhochschule Nordhausen",
    },
    {
        "_id": 26064,
        "name": "Fachhochschule Neubrandenburg",
    },
    {
        "_id": 26069,
        "name": "Fachhochschule Nordostniedersachsen",
    },
    {
        "_id": 26070,
        "name": "Nürtingen University, School of Economics, Agriculture and Landscape Management",
    },
    {
        "_id": 26071,
        "name": "Fachhochschule Offenburg University of Applied Sciences",
    },
    {
        "_id": 26068,
        "name": "Fachhochschule Nordhessen",
    },
    {
        "_id": 26073,
        "name": "Fachhochschule Osnabrück",
    },
    {
        "_id": 26074,
        "name": "Fachhochschule Pforzheim, University of Design, Technology and Business",
    },
    {
        "_id": 26075,
        "name": "Fachhochschule Potsdam",
    },
    {
        "_id": 26072,
        "name": "Fachhochschule Oldenburg / Ostfriesland / Wilhelmshaven",
    },
    {
        "_id": 26077,
        "name": "Fachhochschule Ravensburg-Weingarten",
    },
    {
        "_id": 26078,
        "name": "Fachhochschule Regensburg",
    },
    {
        "_id": 26079,
        "name": "Fachhochschule Reutlingen, University of Technology and Economics",
    },
    {
        "_id": 26076,
        "name": "Fachhochschule Pur",
    },
    {
        "_id": 26081,
        "name": "Fachhochschule Rottenburg University of Applied Forest",
    },
    {
        "_id": 26082,
        "name": "Fachhochschule Salzburg",
    },
    {
        "_id": 26083,
        "name": "Fachhochschule Schmalkalden",
    },
    {
        "_id": 26080,
        "name": "Fachhochschule Rosenheim, University of Technology and Economics",
    },
    {
        "_id": 26085,
        "name": "Fachhochschule Schwäbisch Hall, College of Design",
    },
    {
        "_id": 26087,
        "name": "Fachhochschule St. Pölten",
    },
    {
        "_id": 26086,
        "name": "Fachhochschule St. Gallen",
    },
    {
        "_id": 26084,
        "name": "Fachhochschule Schwabisch Gmund, College of Design",
    },
    {
        "_id": 26090,
        "name": "Fachhochschule Stuttgart, Hochschule für Technik",
    },
    {
        "_id": 26089,
        "name": "Fachhochschule Stuttgart, Hochschule der Medien",
    },
    {
        "_id": 26091,
        "name": "Fachhochschule Trier, University of Technology, Business and Design",
    },
    {
        "_id": 26088,
        "name": "Fachhochschule Stralsund",
    },
    {
        "_id": 26093,
        "name": "Fachhochschule und Berufskollegs NTA, Prof.Dr. Grübler gemein. GmbH",
    },
    {
        "_id": 26094,
        "name": "Fachhochschule Vorarlberg",
    },
    {
        "_id": 26095,
        "name": "Fachhochschule Wedel",
    },
    {
        "_id": 26092,
        "name": "Fachhochschule Ulm, University of Applied Sciences",
    },
    {
        "_id": 26097,
        "name": "Fachhochschule Westküste, Hochschule für Wirtschaft und Technik",
    },
    {
        "_id": 26098,
        "name": "Fachhochschule Wiener Neustadt",
    },
    {
        "_id": 26099,
        "name": "Fachhochschule Wiesbaden",
    },
    {
        "_id": 26096,
        "name": "Fachhochschule Weihenstephan",
    },
    {
        "_id": 26101,
        "name": "Fachhochschule Würzburg - Schweinfurt",
    },
    {
        "_id": 26102,
        "name": "Fachhochschulstudiengänge der Wiener Wirtschaft",
    },
    {
        "_id": 26103,
        "name": "Fachhochschulstudiengänge Hagenberg",
    },
    {
        "_id": 26100,
        "name": "Fachhochschule Worms",
    },
    {
        "_id": 26105,
        "name": "Fachhochschulstudiengänge Steyr",
    },
    {
        "_id": 26106,
        "name": "Fachhochschulstudiengänge Wels",
    },
    {
        "_id": 26104,
        "name": "Fachhochschulstudiengänge Krems IMC",
    },
    {
        "_id": 26109,
        "name": "Faculdade Jaguariúna",
    },
    {
        "_id": 26110,
        "name": "Faculdades Integradas Curitiba",
    },
    {
        "_id": 26107,
        "name": "Faculdade Integradas do Ceará",
    },
    {
        "_id": 26108,
        "name": "Faculdade Italo Brasileira",
    },
    {
        "_id": 26112,
        "name": "Faculdades Integradas do Brasil (UNIBRASIL)",
    },
    {
        "_id": 26113,
        "name": "Faculdades Integradas Toledo",
    },
    {
        "_id": 26114,
        "name": "Faculdades Integradas UPIS",
    },
    {
        "_id": 26111,
        "name": "Faculdades Integradas de Botucatu (UNIFAC)",
    },
    {
        "_id": 26116,
        "name": "Facultés Universitaires Catholiques de Mons",
    },
    {
        "_id": 26117,
        "name": "Facultés Universitaires Notre-Dame de la Paix",
    },
    {
        "_id": 26118,
        "name": "Facultés Universitaires Saint-Louis",
    },
    {
        "_id": 26115,
        "name": "Faculté Polytechnique de Mons",
    },
    {
        "_id": 26120,
        "name": "Fahad Bin Sultan University",
    },
    {
        "_id": 26121,
        "name": "Faisalabad Institute of Textile and Fashion Design",
    },
    {
        "_id": 26122,
        "name": "Fakir Mohan University",
    },
    {
        "_id": 26119,
        "name": "FAE Business School - Faculdade de Administração e Economia",
    },
    {
        "_id": 26124,
        "name": "Fanshawe College",
    },
    {
        "_id": 26125,
        "name": "Far Easten State University of Humanities",
    },
    {
        "_id": 26126,
        "name": "Far Eastern State Technical Fisheries University",
    },
    {
        "_id": 26127,
        "name": "Far Eastern State Technical University",
    },
    {
        "_id": 26129,
        "name": "Far Eastern University",
    },
    {
        "_id": 26123,
        "name": "Falmouth University",
    },
    {
        "_id": 26128,
        "name": "Far Eastern State University",
    },
    {
        "_id": 26131,
        "name": "Faryab Higher Education Institute",
    },
    {
        "_id": 26132,
        "name": "Fasa Faculty of Medical Sciences",
    },
    {
        "_id": 26133,
        "name": "FAST - National University of Computer and Emerging Sciences (NUCES)",
    },
    {
        "_id": 26130,
        "name": "Far East State Transport University",
    },
    {
        "_id": 26136,
        "name": "Fayoum University",
    },
    {
        "_id": 26135,
        "name": "Fatima mata national college kollam kerala",
    },
    {
        "_id": 26137,
        "name": "FEAD - Centro de Gestao Empreendedora",
    },
    {
        "_id": 26134,
        "name": "Fatih University",
    },
    {
        "_id": 26139,
        "name": "Federal College Of Education (Technical), Akoka",
    },
    {
        "_id": 26140,
        "name": "Federal Polytechnic Bauchi, Nigeria",
    },
    {
        "_id": 26141,
        "name": "Federal University of Petroleum Resources",
    },
    {
        "_id": 26138,
        "name": "Feati University",
    },
    {
        "_id": 26143,
        "name": "Federal University of Technology, Minna",
    },
    {
        "_id": 26144,
        "name": "Federal University of Technology, Owerri",
    },
    {
        "_id": 26145,
        "name": "Federal University of Technology, Yola",
    },
    {
        "_id": 26142,
        "name": "Federal University of Technology, Akure",
    },
    {
        "_id": 26147,
        "name": "Feng Chia University",
    },
    {
        "_id": 26148,
        "name": "Ferdowsi University of Mashhad",
    },
    {
        "_id": 26149,
        "name": "Ferghana Politechnical Institute",
    },
    {
        "_id": 26146,
        "name": "Federal Urdu University of Arts,Science and Technology",
    },
    {
        "_id": 26151,
        "name": "Fernuniversität Gesamthochschule Hagen",
    },
    {
        "_id": 26152,
        "name": "Ferris University",
    },
    {
        "_id": 26153,
        "name": "Fiji National University",
    },
    {
        "_id": 26150,
        "name": "Fern-Fachhochschule Hamburg",
    },
    {
        "_id": 26155,
        "name": "Finance Academy",
    },
    {
        "_id": 26156,
        "name": "Fine Arts Academy in Gdansk",
    },
    {
        "_id": 26157,
        "name": "Fine Arts Academy in Katowice",
    },
    {
        "_id": 26154,
        "name": "Fiji School of Medicine",
    },
    {
        "_id": 26159,
        "name": "Fine Arts Academy in Warsaw",
    },
    {
        "_id": 26160,
        "name": "Fine Arts Academy in Wroclaw",
    },
    {
        "_id": 26161,
        "name": "Fine Arts Academy 'Jan Matejko' in Cracow",
    },
    {
        "_id": 26158,
        "name": "Fine Arts Academy in Poznan",
    },
    {
        "_id": 26163,
        "name": "Finnmark University College",
    },
    {
        "_id": 26164,
        "name": "Firat (Euphrates) University",
    },
    {
        "_id": 26165,
        "name": "First Global University to teaching Jainism",
    },
    {
        "_id": 26162,
        "name": "Fine Arts Academy Wladyslaw Strzeminski in Lodz",
    },
    {
        "_id": 26167,
        "name": "Flinders University of South Australia",
    },
    {
        "_id": 26168,
        "name": "Floret Global University",
    },
    {
        "_id": 26169,
        "name": "Fomic Polytechnic",
    },
    {
        "_id": 26166,
        "name": "First Nations University of Canada",
    },
    {
        "_id": 26171,
        "name": "Fondazione Sacro Cuore",
    },
    {
        "_id": 26172,
        "name": "Fontys University of Applied Sciences",
    },
    {
        "_id": 26173,
        "name": "FON University",
    },
    {
        "_id": 26170,
        "name": "Fondation Universitaire Luxembourgeoise",
    },
    {
        "_id": 26175,
        "name": "Forest Research Institute Dehradun",
    },
    {
        "_id": 26177,
        "name": "Foundation University",
    },
    {
        "_id": 26176,
        "name": "Foshan University",
    },
    {
        "_id": 26174,
        "name": "Foreign Trade University",
    },
    {
        "_id": 26179,
        "name": "Fourah Bay College, University of Sierra Leone",
    },
    {
        "_id": 26180,
        "name": "FPT University",
    },
    {
        "_id": 26181,
        "name": "Franklin College Switzerland",
    },
    {
        "_id": 26178,
        "name": "Fountain University",
    },
    {
        "_id": 26183,
        "name": "Free International University of Moldova",
    },
    {
        "_id": 26184,
        "name": "Free International University of Social Studies",
    },
    {
        "_id": 26185,
        "name": "Free University Amsterdam",
    },
    {
        "_id": 26186,
        "name": "Free University Institute 'Carlo Cattaneo'",
    },
    {
        "_id": 26182,
        "name": "Frederick University",
    },
    {
        "_id": 26187,
        "name": "Free University 'Maria Santissima Assunta'",
    },
    {
        "_id": 26188,
        "name": "Free University of Bozen",
    },
    {
        "_id": 26190,
        "name": "Free University Stockholm",
    },
    {
        "_id": 26189,
        "name": "Free University of Tbilisi",
    },
    {
        "_id": 26192,
        "name": "Freie Universität Berlin",
    },
    {
        "_id": 26193,
        "name": "French Institute of Management",
    },
    {
        "_id": 26194,
        "name": "French University in Armenia (UFAR)",
    },
    {
        "_id": 26191,
        "name": "Freie Kunst-Studienstätte Ottersberg",
    },
    {
        "_id": 26196,
        "name": "Friedrich-Schiller Universität Jena",
    },
    {
        "_id": 26197,
        "name": "FTMS Global Academy",
    },
    {
        "_id": 26195,
        "name": "Friedrich-Alexander Universität Erlangen-Nürnberg",
    },
    {
        "_id": 26198,
        "name": "Fudan University",
    },
    {
        "_id": 26200,
        "name": "Fujian Agricultural University",
    },
    {
        "_id": 26201,
        "name": "Fujian Medical University",
    },
    {
        "_id": 26202,
        "name": "Fujian Normal University",
    },
    {
        "_id": 26199,
        "name": "Fu Jen Catholic University",
    },
    {
        "_id": 26204,
        "name": "Fujita Health University",
    },
    {
        "_id": 26205,
        "name": "Fuji University",
    },
    {
        "_id": 26206,
        "name": "Fuji Women's College",
    },
    {
        "_id": 26203,
        "name": "Fujian University of Traditional Chinese Medicine",
    },
    {
        "_id": 26208,
        "name": "Fukui Prefectural University",
    },
    {
        "_id": 26209,
        "name": "Fukui University",
    },
    {
        "_id": 26210,
        "name": "Fukui University of Technology",
    },
    {
        "_id": 26207,
        "name": "Fukui Medical School",
    },
    {
        "_id": 26212,
        "name": "Fukuoka Institute of Technology",
    },
    {
        "_id": 26213,
        "name": "Fukuoka International University",
    },
    {
        "_id": 26214,
        "name": "Fukuoka Prefectural University",
    },
    {
        "_id": 26211,
        "name": "Fukuoka Dental College",
    },
    {
        "_id": 26216,
        "name": "Fukuoka University of Education",
    },
    {
        "_id": 26217,
        "name": "Fukuoka Women's University",
    },
    {
        "_id": 26218,
        "name": "Fukushima Medical College",
    },
    {
        "_id": 26215,
        "name": "Fukuoka University",
    },
    {
        "_id": 26221,
        "name": "Fukuyama University",
    },
    {
        "_id": 26220,
        "name": "Fukuyama Heisei University",
    },
    {
        "_id": 26222,
        "name": "Fundação Educacional de Ituverava",
    },
    {
        "_id": 26219,
        "name": "Fukushima University",
    },
    {
        "_id": 26224,
        "name": "Fundación Universitaria de Boyacá",
    },
    {
        "_id": 26225,
        "name": "Fundación Universitaria del Area Andina. Sede Pereira",
    },
    {
        "_id": 26226,
        "name": "Fundación Universitaria Luis Amigó",
    },
    {
        "_id": 26223,
        "name": "Fundacion Escuela Colombiana de Rehabiliación",
    },
    {
        "_id": 26227,
        "name": "Fundación Universitaria Manuela Beltrán",
    },
    {
        "_id": 26229,
        "name": "Fushun Petroleum University",
    },
    {
        "_id": 26230,
        "name": "Future University",
    },
    {
        "_id": 26228,
        "name": "Fundación Universitaria San Martín",
    },
    {
        "_id": 26231,
        "name": "Fuzhou University",
    },
    {
        "_id": 26232,
        "name": "Gaborone Universal College of Law",
    },
    {
        "_id": 26233,
        "name": "Gakushuin University",
    },
    {
        "_id": 26234,
        "name": "Galatasaray University",
    },
    {
        "_id": 26236,
        "name": "Galway Mayo Institute of Technology",
    },
    {
        "_id": 26237,
        "name": "Gandhara Institute of Medical Sciences",
    },
    {
        "_id": 26238,
        "name": "Gandhigram Rural Institute",
    },
    {
        "_id": 26235,
        "name": "Galillee College",
    },
    {
        "_id": 26240,
        "name": "Gangdara Institute Of Science & Technology",
    },
    {
        "_id": 26241,
        "name": "Ganja State University",
    },
    {
        "_id": 26242,
        "name": "Gansu Agricultural University",
    },
    {
        "_id": 26239,
        "name": "Gandhi Institute of Technology and Managment",
    },
    {
        "_id": 26244,
        "name": "Gauhati University",
    },
    {
        "_id": 26245,
        "name": "Gaziantep University",
    },
    {
        "_id": 26246,
        "name": "Gaziosmanpasa University",
    },
    {
        "_id": 26243,
        "name": "Gansu University of Technology",
    },
    {
        "_id": 26248,
        "name": "GC University",
    },
    {
        "_id": 26249,
        "name": "Gdansk Management College",
    },
    {
        "_id": 26250,
        "name": "Gdynia Maritime Academy",
    },
    {
        "_id": 26247,
        "name": "Gazi University Ankara",
    },
    {
        "_id": 26252,
        "name": "Gediz University",
    },
    {
        "_id": 26253,
        "name": "Gemsville Technical University",
    },
    {
        "_id": 26254,
        "name": "Geneva Business School",
    },
    {
        "_id": 26251,
        "name": "Gebze Institute of Technology",
    },
    {
        "_id": 26256,
        "name": "George Brown College",
    },
    {
        "_id": 26257,
        "name": "Georgian Technical University",
    },
    {
        "_id": 26258,
        "name": "Georg-Simon-Ohm-Fachhochschule Nürnberg",
    },
    {
        "_id": 26255,
        "name": "Georg-August Universität Göttingen",
    },
    {
        "_id": 26260,
        "name": "German University in Cairo",
    },
    {
        "_id": 26261,
        "name": "Gezira College of Technology",
    },
    {
        "_id": 26262,
        "name": "Ghana Christian University College",
    },
    {
        "_id": 26259,
        "name": "German Jordanian University",
    },
    {
        "_id": 26264,
        "name": "Ghana Telecom University College",
    },
    {
        "_id": 26265,
        "name": "Ghazni University",
    },
    {
        "_id": 26266,
        "name": "Ghulam Ishaq Khan Institute of Science & Technology",
    },
    {
        "_id": 26263,
        "name": "Ghana Institute of Management and Public Administration (GIMPA)",
    },
    {
        "_id": 26268,
        "name": "Gifu Keizai University",
    },
    {
        "_id": 26269,
        "name": "Gifu Pharmaceutical University",
    },
    {
        "_id": 26270,
        "name": "Gifu Shotoku Gakuen University",
    },
    {
        "_id": 26267,
        "name": "Gift University",
    },
    {
        "_id": 26272,
        "name": "Gifu University for Education and Languages",
    },
    {
        "_id": 26273,
        "name": "Gifu Women's University",
    },
    {
        "_id": 26274,
        "name": "Girne American University",
    },
    {
        "_id": 26271,
        "name": "Gifu University",
    },
    {
        "_id": 26275,
        "name": "Glasgow School of Art",
    },
    {
        "_id": 26276,
        "name": "Glion Institute of Higher Education",
    },
    {
        "_id": 26277,
        "name": "Global Business School Barcelona",
    },
    {
        "_id": 26279,
        "name": "Global University",
    },
    {
        "_id": 26280,
        "name": "Gnesins Russian Academy of Music",
    },
    {
        "_id": 26278,
        "name": "Global Open University , Nagaland",
    },
    {
        "_id": 26282,
        "name": "Godfrey Okoye University",
    },
    {
        "_id": 26283,
        "name": "Gokhale Institute of Politics and Economics",
    },
    {
        "_id": 26281,
        "name": "Goa University",
    },
    {
        "_id": 26285,
        "name": "Golestan University of Medical Sciences",
    },
    {
        "_id": 26286,
        "name": "Gollis University",
    },
    {
        "_id": 26284,
        "name": "Goldsmiths College, University of London",
    },
    {
        "_id": 26288,
        "name": "Gombe State University",
    },
    {
        "_id": 26289,
        "name": "Gomel State Medical University",
    },
    {
        "_id": 26287,
        "name": "Gomal University",
    },
    {
        "_id": 26291,
        "name": "Gomel State University Francisk Scarnia",
    },
    {
        "_id": 26292,
        "name": "Gonabad University of Medical Sciences",
    },
    {
        "_id": 26290,
        "name": "Gomel State Technical University Pavel Sukhoi",
    },
    {
        "_id": 26294,
        "name": "Gorgan University of Agricultural Sciences and Natural Resources",
    },
    {
        "_id": 26295,
        "name": "Gorno-Altaisk State University",
    },
    {
        "_id": 26293,
        "name": "Gondar University",
    },
    {
        "_id": 26296,
        "name": "Glasgow Caledonian University",
    },
    {
        "_id": 26298,
        "name": "Gotland University College",
    },
    {
        "_id": 26299,
        "name": "Government College University Faisalabad",
    },
    {
        "_id": 26300,
        "name": "Government College University Lahore",
    },
    {
        "_id": 26297,
        "name": "Göteborg University",
    },
    {
        "_id": 26302,
        "name": "Graduate School of Business Administration Zurich (GSBA Zurich)",
    },
    {
        "_id": 26303,
        "name": "Graduate University for Advanced Studies",
    },
    {
        "_id": 26304,
        "name": "Great Lakes University of Kisumu",
    },
    {
        "_id": 26301,
        "name": "Govind Ballabh Pant University of Agriculture and Technology",
    },
    {
        "_id": 26306,
        "name": "Greenford International University",
    },
    {
        "_id": 26307,
        "name": "Greenheart Medical School",
    },
    {
        "_id": 26308,
        "name": "Green University of Bangladesh",
    },
    {
        "_id": 26305,
        "name": "Great Zimbabwe University",
    },
    {
        "_id": 26310,
        "name": "Grenoble Ecole de Management",
    },
    {
        "_id": 26311,
        "name": "Gretsa Universtiy",
    },
    {
        "_id": 26312,
        "name": "GRG School of Management Studies",
    },
    {
        "_id": 26309,
        "name": "Greenwich University",
    },
    {
        "_id": 26314,
        "name": "Griffith University",
    },
    {
        "_id": 26315,
        "name": "Grodno State Agrarian University",
    },
    {
        "_id": 26316,
        "name": "Grodno State Medical University",
    },
    {
        "_id": 26313,
        "name": "Griffith College",
    },
    {
        "_id": 26318,
        "name": "Groupe Sup de Co Amiens Picardie",
    },
    {
        "_id": 26319,
        "name": "Groupe Sup de Co Montpellier",
    },
    {
        "_id": 26320,
        "name": "GSFC University",
    },
    {
        "_id": 26317,
        "name": "Grodno State University Yanka Kupaly",
    },
    {
        "_id": 26322,
        "name": "Guangdong Peizheng College",
    },
    {
        "_id": 26323,
        "name": "Guangdong Polytechnic Normal University",
    },
    {
        "_id": 26324,
        "name": "Guangdong Radio & TV University",
    },
    {
        "_id": 26321,
        "name": "Guam Community College",
    },
    {
        "_id": 26326,
        "name": "Guangdong University of Technology",
    },
    {
        "_id": 26327,
        "name": "Guangxi Medical University",
    },
    {
        "_id": 26325,
        "name": "Guangdong University of Foreign Studies",
    },
    {
        "_id": 26328,
        "name": "Guangxi Normal University",
    },
    {
        "_id": 26329,
        "name": "Guangxi Traditional Chinese Medical University",
    },
    {
        "_id": 26330,
        "name": "Guangxi University",
    },
    {
        "_id": 26331,
        "name": "Guangxi University for Nationalities",
    },
    {
        "_id": 26334,
        "name": "Guangzhou University",
    },
    {
        "_id": 26332,
        "name": "Guangzhou Academy of Fine Art",
    },
    {
        "_id": 26333,
        "name": "Guangzhou Normal University",
    },
    {
        "_id": 26335,
        "name": "Guangzhou University of Traditional Chinese Medicine",
    },
    {
        "_id": 26337,
        "name": "Guilan University",
    },
    {
        "_id": 26338,
        "name": "Guilan University of Medical Sciences",
    },
    {
        "_id": 26339,
        "name": "Guizhou Normal University",
    },
    {
        "_id": 26336,
        "name": "Gubkin Russian State University of Oil and Gas",
    },
    {
        "_id": 26341,
        "name": "Gujarat Ayurved University",
    },
    {
        "_id": 26342,
        "name": "Gujarat Technological University Ahmedabad",
    },
    {
        "_id": 26343,
        "name": "Gujarat University Ahmedabad",
    },
    {
        "_id": 26340,
        "name": "Guizhou University",
    },
    {
        "_id": 26345,
        "name": "Gulf Medical University",
    },
    {
        "_id": 26346,
        "name": "Gulf University College",
    },
    {
        "_id": 26347,
        "name": "Gulf University for Science and Technology",
    },
    {
        "_id": 26344,
        "name": "Gulbarga University",
    },
    {
        "_id": 26349,
        "name": "Gulu University",
    },
    {
        "_id": 26350,
        "name": "Gumi University",
    },
    {
        "_id": 26351,
        "name": "Gunma Prefectural Women's University",
    },
    {
        "_id": 26353,
        "name": "Guru Ghasidas University",
    },
    {
        "_id": 26348,
        "name": "Gulhane Military Medical Academy",
    },
    {
        "_id": 26354,
        "name": "Guru Gobind Singh Indraprastha University",
    },
    {
        "_id": 26355,
        "name": "Guru Jambeshwar University",
    },
    {
        "_id": 26352,
        "name": "Gunma University",
    },
    {
        "_id": 26357,
        "name": "Gurukul University",
    },
    {
        "_id": 26358,
        "name": "Guru Nanak Dev University",
    },
    {
        "_id": 26359,
        "name": "Gustav-Siewerth-Akademie",
    },
    {
        "_id": 26356,
        "name": "Gurukula Kangri University",
    },
    {
        "_id": 26361,
        "name": "Gyeongju University",
    },
    {
        "_id": 26362,
        "name": "Gyeongsang National University",
    },
    {
        "_id": 26363,
        "name": "Hacettepe University",
    },
    {
        "_id": 26360,
        "name": "Gwangju Catholic College",
    },
    {
        "_id": 26365,
        "name": "Hachinohe University",
    },
    {
        "_id": 26366,
        "name": "Hadhramout University of Science and Technology",
    },
    {
        "_id": 26367,
        "name": "Hafencity Universität Hamburg",
    },
    {
        "_id": 26364,
        "name": "Hachinohe Institute of Technology",
    },
    {
        "_id": 26369,
        "name": "Hai Duong University",
    },
    {
        "_id": 26370,
        "name": "Haigazian University",
    },
    {
        "_id": 26371,
        "name": "Hainan Normal University",
    },
    {
        "_id": 26368,
        "name": "Hahnamann Honoeopathic Medical College",
    },
    {
        "_id": 26373,
        "name": "Hajee Mohammad Danesh Science and Technology University",
    },
    {
        "_id": 26374,
        "name": "Hajvery University Lahore for Women",
    },
    {
        "_id": 26375,
        "name": "Hakodate University",
    },
    {
        "_id": 26372,
        "name": "Hainan University",
    },
    {
        "_id": 26377,
        "name": "Halic University",
    },
    {
        "_id": 26378,
        "name": "Halla University",
    },
    {
        "_id": 26379,
        "name": "Hallym University",
    },
    {
        "_id": 26376,
        "name": "Hakuoh University",
    },
    {
        "_id": 26381,
        "name": "Hamadan University of Medical Sciences",
    },
    {
        "_id": 26382,
        "name": "Hamamatsu University",
    },
    {
        "_id": 26383,
        "name": "Hamamatsu University School of Medicine",
    },
    {
        "_id": 26380,
        "name": "Halmstad University College",
    },
    {
        "_id": 26385,
        "name": "Hamdard University",
    },
    {
        "_id": 26386,
        "name": "Hanazono University",
    },
    {
        "_id": 26387,
        "name": "Handelshochschule Leipzig",
    },
    {
        "_id": 26384,
        "name": "Hamdan Bin Mohammed e-University",
    },
    {
        "_id": 26390,
        "name": "Hankuk University of Foreign Studies",
    },
    {
        "_id": 26389,
        "name": "Hankyong National University",
    },
    {
        "_id": 26391,
        "name": "Hannam University",
    },
    {
        "_id": 26392,
        "name": "Hannan University",
    },
    {
        "_id": 26388,
        "name": "Hankuk Aviation University",
    },
    {
        "_id": 26393,
        "name": "Hanoi Medical University",
    },
    {
        "_id": 26394,
        "name": "Hanoi National Economics University",
    },
    {
        "_id": 26395,
        "name": "Hanoi Open University",
    },
    {
        "_id": 26396,
        "name": "Hanoi University of Architecture",
    },
    {
        "_id": 26398,
        "name": "Hanoi University of Mining and Geology",
    },
    {
        "_id": 26399,
        "name": "Hanoi University of Science",
    },
    {
        "_id": 26400,
        "name": "Hanoi University of Science & Technology",
    },
    {
        "_id": 26397,
        "name": "Hanoi University of Civil Engineering",
    },
    {
        "_id": 26402,
        "name": "Hanseo University",
    },
    {
        "_id": 26403,
        "name": "Hanshin University",
    },
    {
        "_id": 26404,
        "name": "Hansung University Seoul",
    },
    {
        "_id": 26401,
        "name": "Hansei University",
    },
    {
        "_id": 26406,
        "name": "Hanzehogeschool Groningen",
    },
    {
        "_id": 26407,
        "name": "Haramaya University",
    },
    {
        "_id": 26408,
        "name": "Harare Institute of Technology",
    },
    {
        "_id": 26405,
        "name": "Hanyang University",
    },
    {
        "_id": 26410,
        "name": "Harbin Institute of Technology",
    },
    {
        "_id": 26411,
        "name": "Harbin Medical University",
    },
    {
        "_id": 26412,
        "name": "Harbin Normal University",
    },
    {
        "_id": 26409,
        "name": "Harbin Engineering University",
    },
    {
        "_id": 26414,
        "name": "Harbin University of Science and Technology",
    },
    {
        "_id": 26415,
        "name": "Hariri Canadian University",
    },
    {
        "_id": 26416,
        "name": "Harokopio University",
    },
    {
        "_id": 26413,
        "name": "Harbin University of Civil Engineering & Architecture",
    },
    {
        "_id": 26418,
        "name": "Hashemite University",
    },
    {
        "_id": 26419,
        "name": "Hasselt University",
    },
    {
        "_id": 26420,
        "name": "Hatyai University",
    },
    {
        "_id": 26417,
        "name": "Harran University",
    },
    {
        "_id": 26422,
        "name": "Hawler Medical University",
    },
    {
        "_id": 26423,
        "name": "Haynal Imre University of Health Sciences Budapest",
    },
    {
        "_id": 26424,
        "name": "Hazara University",
    },
    {
        "_id": 26421,
        "name": "Hawassa University",
    },
    {
        "_id": 26426,
        "name": "Hebei Academy of Fine Art",
    },
    {
        "_id": 26427,
        "name": "Hebei Agricultural University",
    },
    {
        "_id": 26425,
        "name": "Health sciences University of Mongolia",
    },
    {
        "_id": 26428,
        "name": "Hebei Medical University",
    },
    {
        "_id": 26429,
        "name": "Hebei Normal University",
    },
    {
        "_id": 26430,
        "name": "Hebei United University",
    },
    {
        "_id": 26431,
        "name": "Hebei University",
    },
    {
        "_id": 26433,
        "name": "Hebei University of Science and Technology",
    },
    {
        "_id": 26434,
        "name": "Hebei University of Technology",
    },
    {
        "_id": 26435,
        "name": "Hebrew University of Jerusalem",
    },
    {
        "_id": 26432,
        "name": "Hebei University of Economics and Trade",
    },
    {
        "_id": 26437,
        "name": "Hefei University of Technology",
    },
    {
        "_id": 26438,
        "name": "Hehai University",
    },
    {
        "_id": 26439,
        "name": "Heilongjiang August 1st Reclamation University",
    },
    {
        "_id": 26436,
        "name": "Hebron University",
    },
    {
        "_id": 26441,
        "name": "Heilongjiang University",
    },
    {
        "_id": 26442,
        "name": "Heinrich-Heine Universität Düsseldorf",
    },
    {
        "_id": 26443,
        "name": "Heisei International University",
    },
    {
        "_id": 26440,
        "name": "Heilongjiang Commercial University",
    },
    {
        "_id": 26448,
        "name": "Help University College",
    },
    {
        "_id": 26446,
        "name": "Helsinki School of Economics and Business Administration",
    },
    {
        "_id": 26447,
        "name": "Helsinki University of Technology",
    },
    {
        "_id": 26444,
        "name": "Hellenic Army Academy",
    },
    {
        "_id": 26449,
        "name": "Helwan University",
    },
    {
        "_id": 26450,
        "name": "Hemchandracharay North Gujarat University",
    },
    {
        "_id": 26451,
        "name": "Hemwati Nandan Bahuguna Garhwal University",
    },
    {
        "_id": 26445,
        "name": "Hellenic Open University",
    },
    {
        "_id": 26453,
        "name": "Henan Buddhist College",
    },
    {
        "_id": 26454,
        "name": "Henan Normal University",
    },
    {
        "_id": 26452,
        "name": "Henan Agriculture University",
    },
    {
        "_id": 26455,
        "name": "Henan Univeristy",
    },
    {
        "_id": 26457,
        "name": "Heriot-Watt University",
    },
    {
        "_id": 26458,
        "name": "Hertie School of Governance",
    },
    {
        "_id": 26459,
        "name": "Herzen State Pedagogical University of Russia",
    },
    {
        "_id": 26456,
        "name": "Herat University",
    },
    {
        "_id": 26461,
        "name": "Hidayatullah National Law University, Raipur",
    },
    {
        "_id": 26462,
        "name": "Higashi Nippon International University",
    },
    {
        "_id": 26463,
        "name": "Higer College of Technology",
    },
    {
        "_id": 26460,
        "name": "Heythrop College, University of London",
    },
    {
        "_id": 26465,
        "name": "Higher Institute of Agriculture and Animal Husbandry",
    },
    {
        "_id": 26466,
        "name": "Higher Institute of Business Administration",
    },
    {
        "_id": 26467,
        "name": "Higher School o Business in Tarnow",
    },
    {
        "_id": 26464,
        "name": "Higher Colleges of Technology",
    },
    {
        "_id": 26469,
        "name": "Higher School of Economics",
    },
    {
        "_id": 26470,
        "name": "Higher School of Psychology",
    },
    {
        "_id": 26471,
        "name": "Higher School of University and Advanced Studies Pisa",
    },
    {
        "_id": 26468,
        "name": "Higher School o Business/National Louis University(WSB/NLU) in Nowy Sacz",
    },
    {
        "_id": 26473,
        "name": "High Institute for Banking & Financial Studies",
    },
    {
        "_id": 26474,
        "name": "Hiiraan University",
    },
    {
        "_id": 26475,
        "name": "Hijiyama University",
    },
    {
        "_id": 26472,
        "name": "Higher Technological Institute",
    },
    {
        "_id": 26477,
        "name": "Himachal Pradesh University",
    },
    {
        "_id": 26478,
        "name": "Himeji Dokkyo University",
    },
    {
        "_id": 26479,
        "name": "Himeji Institute of Technology",
    },
    {
        "_id": 26480,
        "name": "Hirosaki Gakuin University",
    },
    {
        "_id": 26476,
        "name": "Himachal Pradesh Agricultural University",
    },
    {
        "_id": 26481,
        "name": "Hirosaki University",
    },
    {
        "_id": 26482,
        "name": "Hiroshima Bunkyo Women's University",
    },
    {
        "_id": 26483,
        "name": "Hiroshima City University",
    },
    {
        "_id": 26484,
        "name": "Hiroshima Institute of Technology",
    },
    {
        "_id": 26486,
        "name": "Hiroshima Jogakuin University",
    },
    {
        "_id": 26487,
        "name": "Hiroshima Kokusai Gakuin University",
    },
    {
        "_id": 26488,
        "name": "Hiroshima Prefectural University",
    },
    {
        "_id": 26485,
        "name": "Hiroshima International University",
    },
    {
        "_id": 26490,
        "name": "Hiroshima University",
    },
    {
        "_id": 26491,
        "name": "Hiroshima University of Economics",
    },
    {
        "_id": 26492,
        "name": "Hiroshima Women's University",
    },
    {
        "_id": 26489,
        "name": "Hiroshima Shudo University",
    },
    {
        "_id": 26494,
        "name": "Hitotsubashi University",
    },
    {
        "_id": 26495,
        "name": "Ho Chi Minh City Open University",
    },
    {
        "_id": 26496,
        "name": "Ho Chi Minh City University of Agriculture and Forestry",
    },
    {
        "_id": 26497,
        "name": "Ho Chi Minh City University of Architecture",
    },
    {
        "_id": 26493,
        "name": "Hitec University",
    },
    {
        "_id": 26498,
        "name": "Ho Chi Minh City University of Economics",
    },
    {
        "_id": 26499,
        "name": "Ho Chi Minh City University of Foreign Languages and Information Technology",
    },
    {
        "_id": 26500,
        "name": "Ho Chi Minh City University of Law",
    },
    {
        "_id": 26501,
        "name": "Ho Chi Minh City University of Medicine and Pharmacy",
    },
    {
        "_id": 26503,
        "name": "Ho Chi Minh City University of Pedagogics",
    },
    {
        "_id": 26504,
        "name": "Ho Chi Minh City University of Social Sciences and Humanities",
    },
    {
        "_id": 26505,
        "name": "Ho Chi Minh City University of Technology",
    },
    {
        "_id": 26502,
        "name": "Ho Chi Minh City University of Natural Sciences",
    },
    {
        "_id": 26507,
        "name": "Hochschule Albstadt-Sigmaringen",
    },
    {
        "_id": 26508,
        "name": "Hochschule Anhalt (FH), Hochschule für angewandte Wissenschaften",
    },
    {
        "_id": 26509,
        "name": "Hochschule Bremen",
    },
    {
        "_id": 26510,
        "name": "Hochschule Bremerhaven",
    },
    {
        "_id": 26506,
        "name": "Ho Chi Minh City University of Transport",
    },
    {
        "_id": 26511,
        "name": "Hochschule Coburg",
    },
    {
        "_id": 26512,
        "name": "Hochschule Darmstadt",
    },
    {
        "_id": 26513,
        "name": "Hochschule Esslingen",
    },
    {
        "_id": 26514,
        "name": "Hochschule Fulda",
    },
    {
        "_id": 26516,
        "name": "Hochschule für Berufstätige Rendsburg",
    },
    {
        "_id": 26517,
        "name": "Hochschule für Gestaltung und Kunst Zürich",
    },
    {
        "_id": 26518,
        "name": "Hochschule für Internationales Management",
    },
    {
        "_id": 26515,
        "name": "Hochschule für Bankwirtschaft (HfB), Private Fachhochschule der Bankakademie",
    },
    {
        "_id": 26520,
        "name": "Hochschule für Philosophie München",
    },
    {
        "_id": 26521,
        "name": "Hochschule für Politik (HFP)",
    },
    {
        "_id": 26522,
        "name": "Hochschule für Technik und Wirtschaft des Saarlandes",
    },
    {
        "_id": 26519,
        "name": "Hochschule für Jüdische Studien Heidelberg",
    },
    {
        "_id": 26524,
        "name": "Hochschule für Technik und Wirtschaft Karlsruhe",
    },
    {
        "_id": 26525,
        "name": "Hochschule für Technik, Wirtschaft und Kultur Leipzig (FH)",
    },
    {
        "_id": 26526,
        "name": "Hochschule Harz, Hochschule für angewandte Wissenschaften (FH)",
    },
    {
        "_id": 26523,
        "name": "Hochschule für Technik und Wirtschaft Dresden (FH)",
    },
    {
        "_id": 26527,
        "name": "Hochschule Magdeburg-Stendal (FH)",
    },
    {
        "_id": 26529,
        "name": "Hochschule Vechta",
    },
    {
        "_id": 26530,
        "name": "Hochschule Wismar, Fachhochschule für Technik, Wirtschaft und Gestaltung",
    },
    {
        "_id": 26528,
        "name": "Hochschule Mittweida (FH)",
    },
    {
        "_id": 26531,
        "name": "Hochschule Zittau/Görlitz (FH)",
    },
    {
        "_id": 26532,
        "name": "Hodeidah University",
    },
    {
        "_id": 26533,
        "name": "Hogere Zeevaartschool - Maritime Academy",
    },
    {
        "_id": 26534,
        "name": "Hogeschool Antwerpen",
    },
    {
        "_id": 26536,
        "name": "Hogeschool Leiden",
    },
    {
        "_id": 26537,
        "name": "Hogeschool Rotterdam",
    },
    {
        "_id": 26538,
        "name": "Hogeschool Utrecht",
    },
    {
        "_id": 26535,
        "name": "Hogeschool Inholland",
    },
    {
        "_id": 26540,
        "name": "Hogeschool voor de Kunsten Utrecht (HKU)",
    },
    {
        "_id": 26541,
        "name": "Hogeschool voor Wetenschap en Kunst (VLEKHO), Brussel",
    },
    {
        "_id": 26542,
        "name": "Hogeschool voor Wetenschap & Kunst",
    },
    {
        "_id": 26539,
        "name": "Hogeschool van Amsterdam",
    },
    {
        "_id": 26544,
        "name": "Hohai University Changzhou",
    },
    {
        "_id": 26545,
        "name": "Hokkaido Information University",
    },
    {
        "_id": 26546,
        "name": "Hokkaido Institute of Pharmaceutical Sciences",
    },
    {
        "_id": 26547,
        "name": "Hokkaido Institute of Technology",
    },
    {
        "_id": 26543,
        "name": "Hogeschool West-Vlaanderen (TU)",
    },
    {
        "_id": 26548,
        "name": "Hokkaido Tokai University",
    },
    {
        "_id": 26549,
        "name": "Hokkaido University",
    },
    {
        "_id": 26550,
        "name": "Hokkaido University of Education",
    },
    {
        "_id": 26551,
        "name": "Hokkaido University of Health Sciences",
    },
    {
        "_id": 26552,
        "name": "Hokkaigakuen University",
    },
    {
        "_id": 26553,
        "name": "Hokkaigakuen University of Kitami",
    },
    {
        "_id": 26554,
        "name": "Hokuriku University",
    },
    {
        "_id": 26555,
        "name": "Hokusei Gakuen University",
    },
    {
        "_id": 26556,
        "name": "Holar University College",
    },
    {
        "_id": 26558,
        "name": "Holy Angel University",
    },
    {
        "_id": 26559,
        "name": "Holy Spirit University of Kaslik",
    },
    {
        "_id": 26560,
        "name": "Honam University",
    },
    {
        "_id": 26561,
        "name": "Hong Bang University International",
    },
    {
        "_id": 26557,
        "name": "Holmes Institute",
    },
    {
        "_id": 26562,
        "name": "Hongik University",
    },
    {
        "_id": 26563,
        "name": "Hong Kong Academy for Performing Arts",
    },
    {
        "_id": 26564,
        "name": "Hong Kong Baptist University",
    },
    {
        "_id": 26565,
        "name": "Hong Kong Institute of Education",
    },
    {
        "_id": 26567,
        "name": "Hong Kong Shue Yan College",
    },
    {
        "_id": 26568,
        "name": "Hong Kong University of Science and Technology",
    },
    {
        "_id": 26569,
        "name": "Hope Africa University",
    },
    {
        "_id": 26566,
        "name": "Hong Kong Polytechnic University",
    },
    {
        "_id": 26571,
        "name": "Horizon College of Business and Technology",
    },
    {
        "_id": 26572,
        "name": "Hormozgan University of Medical Sciences",
    },
    {
        "_id": 26573,
        "name": "Hosei University",
    },
    {
        "_id": 26570,
        "name": "Ho Polytechnic",
    },
    {
        "_id": 26575,
        "name": "Hoshi University",
    },
    {
        "_id": 26576,
        "name": "Hotelschool The Hague",
    },
    {
        "_id": 26577,
        "name": "Houdegbe North American University Benin",
    },
    {
        "_id": 26574,
        "name": "Hoseo University",
    },
    {
        "_id": 26579,
        "name": "Huachiew Chalermprakiet University",
    },
    {
        "_id": 26580,
        "name": "Huafan University",
    },
    {
        "_id": 26581,
        "name": "Huaihai Institute of Technology",
    },
    {
        "_id": 26578,
        "name": "Hsuan Chuang University",
    },
    {
        "_id": 26583,
        "name": "Huaihua Radio and Television University",
    },
    {
        "_id": 26584,
        "name": "Huaihua University",
    },
    {
        "_id": 26585,
        "name": "Huanghe Science & Technology University",
    },
    {
        "_id": 26582,
        "name": "Huaihua Medical College",
    },
    {
        "_id": 26587,
        "name": "Huazhong Agricultural University",
    },
    {
        "_id": 26588,
        "name": "Huazhong University of Science and Technology",
    },
    {
        "_id": 26589,
        "name": "Hubei University",
    },
    {
        "_id": 26586,
        "name": "Huaqiao University Quanzhuo",
    },
    {
        "_id": 26591,
        "name": "Hue University",
    },
    {
        "_id": 26592,
        "name": "Hue University of Agriculture and Forestry",
    },
    {
        "_id": 26593,
        "name": "Huizhou University",
    },
    {
        "_id": 26590,
        "name": "Hubert Kairuki Memorial University",
    },
    {
        "_id": 26595,
        "name": "Humboldt Universität Berlin",
    },
    {
        "_id": 26596,
        "name": "Hunan Agricultural University",
    },
    {
        "_id": 26597,
        "name": "Hunan Normal University",
    },
    {
        "_id": 26594,
        "name": "Humber College",
    },
    {
        "_id": 26599,
        "name": "Hungarian Academy of Craft and Design",
    },
    {
        "_id": 26600,
        "name": "Hungarian Academy of Fine Arts Budapest",
    },
    {
        "_id": 26601,
        "name": "Hungarian University of Physical Education",
    },
    {
        "_id": 26598,
        "name": "Hunan University",
    },
    {
        "_id": 26603,
        "name": "Huron University USA in London",
    },
    {
        "_id": 26604,
        "name": "Hvanneyri Agricultural University",
    },
    {
        "_id": 26605,
        "name": "HWP - Hamburger Universität für Wirtschaft und Politik",
    },
    {
        "_id": 26602,
        "name": "Huron University College",
    },
    {
        "_id": 26607,
        "name": "Hyogo University",
    },
    {
        "_id": 26608,
        "name": "Hyogo University of Education",
    },
    {
        "_id": 26609,
        "name": "Hyrcania Institute of Higher Education",
    },
    {
        "_id": 26606,
        "name": "Hyogo College of Medicine",
    },
    {
        "_id": 26611,
        "name": "Iact College",
    },
    {
        "_id": 26612,
        "name": "Iasar University",
    },
    {
        "_id": 26613,
        "name": "IASE (Institute of Advanced Studies) Deemed University",
    },
    {
        "_id": 26610,
        "name": "Hyupsung University",
    },
    {
        "_id": 26615,
        "name": "Ibaraki Christian College",
    },
    {
        "_id": 26616,
        "name": "Ibaraki Prefectural University of Health Sciences",
    },
    {
        "_id": 26617,
        "name": "Ibaraki University",
    },
    {
        "_id": 26614,
        "name": "IBAIS University",
    },
    {
        "_id": 26619,
        "name": "Ibn Sina University",
    },
    {
        "_id": 26620,
        "name": "Ibra College of Technology",
    },
    {
        "_id": 26621,
        "name": "Ibrahim Babangida University",
    },
    {
        "_id": 26618,
        "name": "Ibn Sina National College for Medical Studies",
    },
    {
        "_id": 26623,
        "name": "Iceland University of Education",
    },
    {
        "_id": 26624,
        "name": "ICFAI University",
    },
    {
        "_id": 26625,
        "name": "IDRAC (Institut de recherche en action commerciale)",
    },
    {
        "_id": 26622,
        "name": "Iceland Academy of the Arts",
    },
    {
        "_id": 26627,
        "name": "ifs University College",
    },
    {
        "_id": 26626,
        "name": "IE University",
    },
    {
        "_id": 26628,
        "name": "Igbinedion University",
    },
    {
        "_id": 26629,
        "name": "Ilam University",
    },
    {
        "_id": 26630,
        "name": "Ilam University of Medical Sciences",
    },
    {
        "_id": 26631,
        "name": "Ilia Chavchavadze State University",
    },
    {
        "_id": 26634,
        "name": "Imam Khomeini International University",
    },
    {
        "_id": 26635,
        "name": "Imam Reza University",
    },
    {
        "_id": 26632,
        "name": "ILIRIA College",
    },
    {
        "_id": 26633,
        "name": "Ilsa Independent College",
    },
    {
        "_id": 26637,
        "name": "Imam University",
    },
    {
        "_id": 26638,
        "name": "Immanuel Kant State University of Russia",
    },
    {
        "_id": 26639,
        "name": "Imo State University",
    },
    {
        "_id": 26636,
        "name": "Imam Sadiq University",
    },
    {
        "_id": 26641,
        "name": "Imperial College School of Medicine",
    },
    {
        "_id": 26642,
        "name": "I.M. Sechenov Moscow Medical Academy",
    },
    {
        "_id": 26643,
        "name": "Inchon National University of Education",
    },
    {
        "_id": 26640,
        "name": "Imperial College London",
    },
    {
        "_id": 26645,
        "name": "Independent University, Bangladesh",
    },
    {
        "_id": 26646,
        "name": "Indian Agricultural Research Institute",
    },
    {
        "_id": 26647,
        "name": "Indian Board of Alternative Medicine",
    },
    {
        "_id": 26644,
        "name": "Inchon University",
    },
    {
        "_id": 26649,
        "name": "Indian Institute of Information Technology and Management - Kerala",
    },
    {
        "_id": 26650,
        "name": "Indian Institute of Management, Tiruchirappalli",
    },
    {
        "_id": 26651,
        "name": "Indian Institute of Science",
    },
    {
        "_id": 26648,
        "name": "Indian Institute of Information Technology",
    },
    {
        "_id": 26653,
        "name": "Indian Institute of Technology, Delhi",
    },
    {
        "_id": 26654,
        "name": "Indian Institute of Technology, Guwahati",
    },
    {
        "_id": 26655,
        "name": "Indian Institute of Technology, Hyderabad"
    },
    {
        "_id": 26659,
        "name": "Indian Institute of Technology, Bombay",
    },
    {
        "_id": 26882,
        "name": "Indian Institute of Technology, Kharagpur",
    },
    {
        "_id": 26881,
        "name": "Indian Institute of Technology, Madras",
    },
    {
        "_id": 26880,
        "name": "Indian Institute of Technology, Roorkee",
    },
    {
        "_id": 26879,
        "name": "Indian Institute of Technology, Kanpur",
    },
    {
        "_id": 26878,
        "name": "Indian School of Business Management and Administration",
    },
    {
        "_id": 26877,
        "name": "Indian School of Mines (ISM)",
    },
    {
        "_id": 26656,
        "name": "Indian Law Institue",
    },
    {
        "_id": 26657,
        "name": "Indian Statistical Institute"
    },
    {
        "_id": 26658,
        "name": "Indian University"
    }
    ];
    College.create(collegeData, function (err, collegeData) {
        if (err)
            throw err;
        res.json(collegeData);
    });
});