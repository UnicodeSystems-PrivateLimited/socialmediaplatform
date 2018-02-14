var ctrl = require('express').Router();
module.exports = ctrl;
var should = require('should');
var mailer = require('../../mailer/models');
var locals;
var multer = require('multer');
var fs = require('fs');
var request = require('request');
var path = require('path');
var upload = multer({
    dest: '/tmp',
});
var upload = multer().single('avatar');
var im = require('imagemagick');
var Groupchat = require('../models/groupchat');
var User = require('../models/user');
var Event = require('../models/event');
var moment = require('moment');
var Subscriber = require('../models/subscriber');
var RuleOfPost = require('../models/ruleofpost');
var Group = require('../models/group');
var Groupevents = require('../models/groupevents');
var Random = require("random-js");
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyCr5CzBp9NgjPH7RKlk0ruHZIQIRyk6A90', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

function addfriendevent(user_id, friend_id, title, callback) {
    var Event = require('../models/event');
    var newEvent = new Event();
    newEvent.created_by = user_id;
    newEvent.friend_id = friend_id;
    newEvent.timestamp = new Date();
    newEvent.title = title;
    newEvent.save(function (err, newEvent) {
        if (err)
            throw err;
        callback();
    });
}

function addSCDEvent(user_id, post_id, type, post_type, title) {
    var Event = require('../models/event');
    var newEvent = new Event();
    newEvent.created_by = user_id;
    newEvent.post_id = post_id;
    newEvent.type = type;
    newEvent.post_type = post_type;
    newEvent.timestamp = new Date();
    newEvent.title = title;
    Event.update({ post_id: post_id }, newEvent, { upsert: true }, function (err, data) {
        if (err)
            throw err;
    });
}

function addSCDPost(user_id, scdId, type, title, message, callback) {
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var College = require('../models/college');
    var Degree = require('../models/degree');
    var newPost = new Post();
    newPost.created_by = user_id;
    newPost.catagory = 1;
    if (type == 1) {
        newPost.subject_id = scdId;
        newPost.types = 1;
    }

    if (type == 2) {
        newPost.college_id = scdId;
        newPost.types = 2;
    }

    if (type == 3) {
        newPost.degree_id = scdId;
        newPost.types = 3;
    }

    newPost.created_on = new Date();
    newPost.message = message;
    newPost.post_type = 8;
    newPost.privacy = 1;
    newPost.save(function (err, newPost) {
        if (err)
            throw err;
        addSCDEvent(user_id, newPost._id, newPost.types, newPost.post_type, title);
        if (type == 1) {
            Subject.findByIdAndUpdate(scdId, {
                $push: {
                    post: {
                        post_id: newPost._id,
                        created_by: user_id,
                    }
                }
            }, function (err, newSubject) {
                if (err)
                    throw err
            });
        }
        if (type == 2) {
            College.findByIdAndUpdate(scdId, {
                $push: {
                    post: {
                        post_id: newPost._id,
                        created_by: user_id,
                    }
                }
            }, function (err, newCollege) {
                if (err)
                    throw err
            });
        }
        if (type == 3) {
            Degree.findByIdAndUpdate(scdId, {
                $push: {
                    post: {
                        post_id: newPost._id,
                        created_by: user_id,
                    }
                }
            }, function (err, newDegree) {
                if (err)
                    throw err
            });
        }
        callback();
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


function addUserToSubject(subject_id, user_id, from, to, subjects_user_type, status, callback) {
    var Subject = require('../models/subject');
    Subject.findByIdAndUpdate(subject_id, {
        $push: {
            members: {
                user_id: user_id,
                from: from,
                to: to,
                subjects_user_type: subjects_user_type,
                status: status,
            }
        }
    }, function (err, focus1) {
        if (err)
            throw err;
        callback();
    });
}

function addUserToCollege(college_id, user_id, from, to, status, callback) {
    var College = require('../models/college');
    College.findByIdAndUpdate(college_id, {
        $push: {
            members: {
                user_id: user_id,
                from: from,
                to: to,
                status: status,
            }
        }
    }, function (err, focus1) {
        if (err)
            throw err;
        callback();
    });
}

function addUserToDegree(degree_id, user_id, from, to, status, callback) {
    var Degree = require('../models/degree');
    Degree.findByIdAndUpdate(degree_id, {
        $push: {
            members: {
                user_id: user_id,
                from: from,
                to: to,
                status: status,
            }
        }
    }, function (err, focus1) {
        if (err)
            throw err;
        callback();
    });
}

function getfollowinglist(userId, callback) {
    var User = require('../models/user');
    User.findOne({ "_id": userId }, { following: 1 }, function (err, data) {
        if (err)
            return handleError(err);
        callback({ data: data.following });
    });
}

function getsearchlist(userId, search_name, callback) {
    var User = require('../models/user');
    var following = [];
    User.find({
        '_id': { $ne: userId },
        $or: [
            { fname: new RegExp('^' + search_name, "i") },
            { lname: new RegExp('^' + search_name, "i") }
        ]
    }, { fname: 1, lname: 1, gender: 1, city: 1, state: 1, photo: 1 }, function (err, user) {
        if (user.length > 0) {
            getfollowinglist(userId, function (following1) {

                following = following1.data;
            });
            getfriendlist(userId, function (friends) {
                console.log(user);
                for (var att1 in user) {
                    user[att1].status = 6; //Unknown Person
                    user[att1].forgot_password_code = 6; //Not Following forgot_password_code is used to display follwoing status

                    for (var att7 in following) {
                        if (user[att1]._id == following[att7].following_id) {
                            user[att1].forgot_password_code = 3; // following 
                            continue;
                        }
                    }

                    for (var att2 in friends.current) {
                        if (user[att1]._id == friends.current[att2].friend_id) {
                            user[att1].status = 3; //current friend
                            continue;
                        }
                    }
                    for (var att3 in friends.pending) {
                        if (user[att1]._id == friends.pending[att3].friend_id) {
                            user[att1].status = 2; //Pending friend Request
                            continue;
                        }
                    }
                    for (var att4 in friends.request) {
                        if (user[att1]._id == friends.request[att4].friend_id) {
                            user[att1].status = 1; // Waiting approval
                            continue;
                        }
                    }
                    for (var att5 in friends.unblocked) {
                        if (user[att1]._id == friends.unblocked[att5].friend_id && friends.unblocked[att5].status == 5) {
                            user[att1].status = 5; // blocked
                            continue;
                        }
                    }
                    for (var att5 in friends.blocked) {
                        if (user[att1]._id == friends.blocked[att5].friend_id && friends.blocked[att5].status == 4) {
                            user[att1].status = 4; // blocked
                            continue;
                        }
                    }

                }
                console.log("user");
                console.log(user);
                var myUser = [];
                for (var attr in user) {
                    if (user[attr].following_status == 3 && user[attr].status !== 5) {
                        myUser.push(user[attr]);
                    } else if (user[attr].status !== 5) {
                        myUser.push(user[attr]);
                    }
                }

                callback(myUser);
            });
        } else {
            callback(user);
        }
    });
}

function getUserSearchList(userId, search_name, callback) {
    var User = require('../models/user');
    var following = [];
    User.find({
        '_id': { $ne: userId },
        $or: [
            { fname: new RegExp('^' + search_name, "i") },
            //            {lname: new RegExp('^' + search_name, "i")}
        ]
    }, { fname: 1, lname: 1, gender: 1, city: 1, state: 1, photo: 1 }, function (err, user) {
        if (user.length > 0) {
            getfollowinglist(userId, function (following1) {

                following = following1.data;
            });
            getfriendlist(userId, function (friends) {
                console.log(user);
                for (var att1 in user) {
                    user[att1].status = 6; //Unknown Person
                    user[att1].forgot_password_code = 6; //Not Following forgot_password_code is used to display follwoing status

                    for (var att7 in following) {
                        if (user[att1]._id == following[att7].following_id) {
                            user[att1].forgot_password_code = 3; // following 
                            continue;
                        }
                    }

                    for (var att2 in friends.current) {
                        if (user[att1]._id == friends.current[att2].friend_id) {
                            user[att1].status = 3; //current friend
                            continue;
                        }
                    }
                    for (var att3 in friends.pending) {
                        if (user[att1]._id == friends.pending[att3].friend_id) {
                            user[att1].status = 2; //Pending friend Request
                            continue;
                        }
                    }
                    for (var att4 in friends.request) {
                        if (user[att1]._id == friends.request[att4].friend_id) {
                            user[att1].status = 1; // Waiting approval
                            continue;
                        }
                    }
                    for (var att5 in friends.unblocked) {
                        if (user[att1]._id == friends.unblocked[att5].friend_id && friends.unblocked[att5].status == 5) {
                            user[att1].status = 5; // blocked
                            continue;
                        }
                    }
                    for (var att5 in friends.blocked) {
                        if (user[att1]._id == friends.blocked[att5].friend_id && friends.blocked[att5].status == 4) {
                            user[att1].status = 4; // blocked
                            continue;
                        }
                    }

                }
                console.log("user");
                console.log(user);
                var myUser = [];
                for (var attr in user) {
                    if (user[attr].following_status == 3 && user[attr].status !== 5) {
                        myUser.push(user[attr]);
                    } else if (user[attr].status !== 5) {
                        myUser.push(user[attr]);
                    }
                }

                callback(myUser);
            });
        } else {
            callback(user);
        }
    });
}

function getblockedfriendlist(userId, callback) {
    var User = require('../models/user');
    var blocked_friends = [];
    User.find({ '_id': userId })
        .populate({ path: 'friends.friend_id', select: 'fname lname photo _id' })
        .exec(function (err, users) {
            if (err)
                throw err;
            data = users[0];
            for (var attributename in data.friends) {
                if (data.friends[attributename].friend_id != null) {
                    var friend_name = data.friends[attributename].friend_id.fname + ' ' + data.friends[attributename].friend_id.lname;
                    var friend_id = data.friends[attributename].friend_id._id;
                    var photo = data.friends[attributename].friend_id.photo;
                    if (data.friends[attributename].status === 4) {
                        blocked_friends.push({ name: friend_name, friend_id: friend_id, photo: photo });
                    }
                }
            }
            callback({ blocked_friends: blocked_friends });
        });
}
ctrl.get('/adminCreator', function (req, res) {
    var User = require('../models/user');
    //////////////User.find({_id:126 }).remove( function(err,data){res.json(data);});
    //////////////User.update({_id:127 },{activated:1},function(err,data){res.json(data);});
    admin = new User();
    var password = 'uni@123';
    password = admin.generateHash(password)
    admin.type = 2;
    admin.local.email = 'admin@socialsn.com';
    admin.local.password = password;
    admin.activation_code = 1;
    admin.activated = 1;
    // admin.isRegConEnable = 1;
    admin.save(function (err, admin) {
        if (err)
            throw err;
        res.json(admin);
    });
});
ctrl.get('/getHeaderData', function (req, res) {
    var User = require('../models/user');
    if (req.session.passport) {
        var type;
        if (req.session.passport.type) {
            type = req.session.passport.type;
        }
        var userId = req.session.passport.user;
        // User.findOne({ _id: userId })
        //     .select('college subjects degree program fname lname photo local.email login_details check_status')
        //     .populate({ path: 'college.college_id subjects.subject_id degree.degree_id', select: 'name type' })
        //     .exec(function(err, users) {
        //         if (err)
        //             throw err;
        //         res.json({ status: 2, data: users, Type: type });
        //     });
        // getUserScdIds(userId, function(scdIds) {
        //     getSCDCounts(userId, scdIds, function(data) {
        //         res.json({ status: 2, data: data, Type: type });
        //     })
        // })
        User.findOne({ '_id': userId })
            .select('college subjects degree program fname lname photo local.email login_details check_status')
            .populate({
                path: 'subjects.subject_id',
                model: 'Subject',
                select: 'name type post',
                populate: {
                    path: 'post.post_id',
                    model: 'Post',
                    // match: { 'created_by': { $nin: [userId] } },
                    select: 'created_on',
                }
            })
            .populate({
                path: 'degree.degree_id',
                model: 'Degree',
                select: 'name type post',
                populate: {
                    path: 'post.post_id',
                    model: 'Post',
                    // match: { 'created_by': { $nin: [userId] } },
                    select: 'created_on',
                }
            })
            .populate({
                path: 'college.college_id',
                model: 'College',
                select: 'name type post',
                populate: {
                    path: 'post.post_id',
                    model: 'Post',
                    // match: { 'created_by': { $nin: [userId] } },
                    select: 'created_on',
                }
            })
            .exec(function (err, users) {
                if (err)
                    throw err;
                users.subjects = sortSubjectAndGetCounter(users.subjects);
                users.college = sortCollegeAndGetCounter(users.college);
                users.degree = sortDegreeAndGetCounter(users.degree);
                res.json({ status: 2, data: users, Type: type });
            });

    } else {
        res.json({ status: 0, data: 'Not loggedIn!' });
    }
});

function sortSubjectAndGetCounter(subjects) {
    var filtered_subject = subjects.filter(function (sub) {
        return sub.subject_id;
    });

    for (var i in filtered_subject) {
        if (filtered_subject[i].subject_id) {
            var posts = filtered_subject[i].subject_id.post.filter(function (posts) {
                return posts.post_id
            });
            filtered_subject[i].subject_id.post = posts;
            filtered_subject[i].subject_id.post.sort(function (a, b) {
                var textA = new Date(a.post_id.created_on).getTime();
                var textB = new Date(b.post_id.created_on).getTime();
                return textB - textA;
            });
        }
    }
    filtered_subject.sort(function (a, b) {
        var textA = new Date(a.subject_id.post.length > 0 ? a.subject_id.post[0].post_id.created_on : '1970/01/01').getTime();
        var textB = new Date(b.subject_id.post.length > 0 ? b.subject_id.post[0].post_id.created_on : '1970/01/01').getTime();
        return textB - textA;
    });
    return subjects;
}

function sortCollegeAndGetCounter(college) {
    var filtered_college = college.filter(function (col) {
        return col.college_id;
    });
    for (var i in filtered_college) {
        if (filtered_college[i].college_id) {
            var posts = filtered_college[i].college_id.post.filter(function (posts) {
                return posts.post_id
            });
            filtered_college[i].college_id.post = posts;
            filtered_college[i].college_id.post.sort(function (a, b) {
                var textA = new Date(a.post_id.created_on).getTime();
                var textB = new Date(b.post_id.created_on).getTime();
                return textB - textA;
            });
        }
    }
    filtered_college.sort(function (a, b) {
        var textA = new Date(a.college_id.post.length > 0 ? a.college_id.post[0].post_id.created_on : '1970/01/01').getTime();
        var textB = new Date(b.college_id.post.length > 0 ? b.college_id.post[0].post_id.created_on : '1970/01/01').getTime();
        return textB - textA;
    });
    return filtered_college;
}

function sortDegreeAndGetCounter(degree) {
    var filtered_degree = degree.filter(function (deg) {
        return deg.degree_id;
    });

    for (var i in filtered_degree) {
        if (filtered_degree[i].degree_id) {
            var posts = filtered_degree[i].degree_id.post.filter(function (posts) {
                return posts.post_id
            });
            filtered_degree[i].degree_id.post = posts;
            filtered_degree[i].degree_id.post.sort(function (a, b) {
                var textA = new Date(a.post_id.created_on).getTime();
                var textB = new Date(b.post_id.created_on).getTime();
                return textB - textA;
            });
        }
    }
    filtered_degree.sort(function (a, b) {
        var textA = new Date(a.degree_id.post.length > 0 ? a.degree_id.post[0].post_id.created_on : '1970/01/01').getTime();
        var textB = new Date(b.degree_id.post.length > 0 ? b.degree_id.post[0].post_id.created_on : '1970/01/01').getTime();
        return textB - textA;
    });
    return filtered_degree;
}

ctrl.get('/', function (req, res) {
    var User = require('../models/user');
    var memIds;
    if (req.query.memIds) {
        memIds = JSON.parse(req.query.memIds);
        //console.log();
        User.find({ _id: { $in: memIds } }, function (err, users) {
            if (err)
                throw err;
            res.json(users);
        });
    } else {
        User.find({}, function (err, users) {
            if (err)
                throw err;
            res.json(users);
        });
    }
});


ctrl.post('/userSearch', function (req, res) {
    var userId = req.session.passport.user;
    var searchData = [];
    if (req.body.name) {
        //        getsearchlist(userId, req.body.name, function (data) {
        getUserSearchlist(req.body.name, function (data) {
            for (i = 0; i < data.length; i++) {
                if (data[i]._id != userId) {
                    //                    searchData.pop(data[i]);
                    //                } else {
                    searchData.push(data[i]);
                }
            }
            res.json({ status: 2, msg: "Search complete!", data: searchData });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});
//ctrl.post('/userSearch', function (req, res) {
//    var userId = req.session.passport.user;
//    var searchData = [];
//    var searchSubjectData = [];
//    var searchCollegeData = [];
//    var searchDegreeData = [];
//    if (req.body.name) {
//        //        getsearchlist(userId, req.body.name, function (data) {
//        getUserSearchlist(req.body.name, function (data) {
//            getSubjectSearchlist(req.body.name,req.body.statusType, function (subjectData) {
//                getCollegeSearchlist(req.body.name,req.body.statusType, function (collegeData) {
//                    getDegreeSearchlist(req.body.name,req.body.statusType, function (degreeData) {
//                        for (i = 0; i < data.length; i++) {
//                            if (data[i]._id != userId) {
//                                //                    searchData.pop(data[i]);
//                                //                } else {
//                                searchData.push(data[i]);
//                                console.log('searchData', searchData);
//                            }
//                        }
//                        for (j = 0; j < subjectData.length; j++) {
//                            searchSubjectData.push(subjectData[j]);
//                            console.log('searchSubjectData', searchSubjectData);
//                        }
//                        for (k = 0; k < collegeData.length; k++) {
//                            searchCollegeData.push(collegeData[k]);
//                            console.log('searchCollegeData', searchCollegeData);
//                        }
//                        for (l = 0; l < degreeData.length; l++) {
//                            searchDegreeData.push(degreeData[l]);
//                            console.log('searchDegreeData', searchDegreeData);
//                        }
//                        res.json({ status: 2, msg: "Search complete!", data: searchData, subjectData: searchSubjectData, collegeData: searchCollegeData , degreeData:searchDegreeData});
//                    });
//                });
//            });
//            // res.json({status: 2, msg: "user Search complete!", data: searchData,subjectData:searchSubjectData});
//        });
//    } else {
//        res.json({ status: 0, msg: "No search parameters provided!" });
//    }
//});
//function getSubjectSearchlist(name,statusType, callback) {
//    var Subject = require('../models/subject');
//    if(statusType == 1){
//        Subject.find({ name: new RegExp('^' + name, "i")})
//            .select('name')
//            .limit(5)
//            .exec(function (err, subject) {
//                callback(subject);
//            });
//    }else if(statusType == 2){
//        Subject.find({ name: new RegExp('^' + name, "i")})
//            .select('name')
//            .exec(function (err, subject) {
//                callback(subject);
//            });
//    }
//    
//}
//function getCollegeSearchlist(name,statusType, callback) {
//    var College = require('../models/college');
//    if(statusType == 1){
//        College.find({ name: new RegExp('^' + name, "i")})
//                .select('name')
//                .limit(5)
//                .exec(function (err, college) {
//                    callback(college);
//                });
//     }else if(statusType == 2){
//          College.find({ name: new RegExp('^' + name, "i")})
//                .select('name')
//                .exec(function (err, college) {
//                    callback(college);
//                });
//     }
//}
//function getDegreeSearchlist(name,statusType, callback) {
//    var Degree = require('../models/degree');
//    if(statusType == 1){
//        Degree.find({ name: new RegExp('^' + name, "i")})
//                .select('name')
//                .limit(5)
//                .exec(function (err, degree) {
//                    callback(degree);
//                });
//    }else if(statusType == 2){
//        Degree.find({ name: new RegExp('^' + name, "i")})
//                .select('name')
//                .exec(function (err, degree) {
//                    callback(degree);
//                });
//    }
//}


ctrl.post('/userSearchByStatus', function (req, res) {
    var userId = req.session.passport.user;
    var searchData = [];
    console.log('userSearchByStatus name', req.body.name);
    console.log('userSearchByStatus status', req.body.status);
    if (req.body.name) {
        var name = req.body.name;

        //        getsearchlist(userId, req.body.name, function (data) {
        getUserSearchlistByStatus(req.body.name, req.body.status, userId, function (data) {
            console.log('final data for search friend data', data);
            if (data[0]._id.friends.length > 0) {
                var filterForUser = { '_id': { $in: data[0]._id.friends }, 'fname': new RegExp('^' + name, "i") };
                User.find(filterForUser)
                    .select('fname lname photo')
                    .exec(function (err, datas) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: "Search complete!", data: datas });
                    })
            } else {
                res.json({ status: 2, msg: "Search complete!", data: [] });
            }
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});

function getUserSearchlistByStatus(search_name, search_status, userId, callback) {
    var User = require('../models/user');
    console.log('status for freinds', search_status)
    var friend_status = parseInt(search_status);
    var loggedUserId = parseInt(userId);
    User.aggregate([{
        $project: {
            friends: {
                $filter: {
                    input: "$friends",
                    as: "friend",
                    cond: { $eq: ["$$friend.status", friend_status] }
                }
            }
        }
    },
    {
        "$group": {
            "_id": {
                "user": "$_id",
                "friends": "$friends.friend_id",
            },
        }
    },
    { $match: { "_id.user": loggedUserId } },

    ], function (err, result) {
        if (err) {
            throw err;
        }
        callback(result);
    });
}
ctrl.post('/userSearching', function (req, res) {
    var userId = req.session.passport.user;
    var searchData = [];
    if (req.body.name) {
        //        getsearchlist(userId, req.body.name, function (data) {
        getUserSearchList(userId, req.body.name, function (data) {
            for (i = 0; i < data.length; i++) {
                if (data[i]._id != userId) {
                    //                    searchData.pop(data[i]);
                    //                } else {
                    searchData.push(data[i]);
                }
            }
            res.json({ status: 2, msg: "Search complete!", data: searchData });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});





function getUserSearchlist(search_name, callback) {
    var User = require('../models/user');
    User.find({
        fname: new RegExp('^' + search_name, "i")
    }, { fname: 1, _id: 1, photo: 1, lname: 1, status: 1 })
        .limit(10)
        .exec(function (err, user) {
            callback(user);
        });
}


ctrl.get('/getAllUser/:counter', function (req, res) {
    console.log("getAllUser");
    var User = require('../models/user');
    var counter = req.params.counter;
    var limit = 50;
    var skip = (counter - 1) * 50;
    var memIds;
    if (req.session.passport && req.session.passport.type == 2) {
        if (req.query.memIds) {
            memIds = JSON.parse(req.query.memIds);
            //console.log();
            User.find({ _id: { $in: memIds } })
                .limit(limit)
                .skip(skip)
                .exec(function (err, users) {
                    if (err)
                        throw err;
                    User.find({ _id: { $in: memIds } })
                        .exec(function (err, total_user) {
                            if (err)
                                throw err;
                            console.log(users);
                            res.json({ status: 2, data: users, total_user: total_user.length });
                        });
                });
        } else {
            User.find({})
                .limit(limit)
                .skip(skip)
                .exec(function (err, users) {
                    if (err)
                        throw err;
                    User.find({})
                        .exec(function (err, total_user) {
                            if (err)
                                throw err;
                            res.json({ status: 2, data: users, total_user: total_user.length });
                        });
                });
        }
    } else {
        console.log("User not found");
        data = { status: 1, message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.post('/userSearchadgetUserSearchlistmin', function (req, res) {
    var User = require('../models/user');
    var search_name = req.body.name;
    if (search_name != '') {
        User.find({
            $or: [
                { fname: new RegExp('^' + search_name, "i") },
                { lname: new RegExp('^' + search_name, "i") }
            ]
        }, function (err, user) {
            //            if (user.length > 0) {
            res.json({ status: 2, data: user, msg: "Search complete!" });
            //            }else{
            //                res.json({status: 2, msg: "No result found!", data:''});
            //            }
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});
ctrl.get('/delete/:id', function (req, res) {
    var User = require('../models/user');
    var user = new User();
    var userId = req.params.id;
    User.find({ '_id': userId }, function (err, user) {
        if (err) {
            throw err;
        }
        if (user.length > 0) {
            User.remove({ _id: userId }, function (err, user) {
                if (err)
                    throw err;
                data = { message: 'User deleted' };
                res.json(data);
            });
        } else {
            data = { message: 'User not found' };
            res.json(data);
        }
    });
    //    }
});
ctrl.get('/profile/:type', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var User = require('../models/user');
        User.findById(userId, function (err, user) {
            if (err)
                throw err;
            req.session.passport.email = user.local.email;
            req.session.passport.fname = user.fname;
            req.session.passport.lname = user.lname;
            return res.json(user);
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
    //res.end();
});
ctrl.get('/checktype', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var User = require('../models/user');
        User.findById(userId, { type: 1 }, function (err, user) {
            if (err)
                throw err;
            return res.json({ status: 2, data: user.type });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
    //res.end();
});
// ctrl.post('/userSearch', function (req, res) {
//     if (req.session.passport) {
//         var userId = req.session.passport.user;
//         if (req.body.name) {
//             getsearchlist(userId, req.body.name, function (data) {
//                 res.json({ status: 2, msg: "Search complete!", data: data });
//             });
//         } else {
//             res.json({ status: 0, msg: "No search parameters provided!" });
//         }
//     }
// });
ctrl.get('/currentUserDetail', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var User = require('../models/user');
        User.findById(userId)
            .populate({ path: 'followers.follower_id friends.friend_id', select: 'fname lname photo _id' })
            .exec(function (err, user) {
                if (err)
                    throw err;
                return res.json(user);
            });
    } else {
        return res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/currentFriendDetail/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.params.id;
        var User = require('../models/user');
        User.findById(userId)
            .populate({ path: 'followers.follower_id friends.friend_id', select: 'fname lname photo _id' })
            .exec(function (err, user) {
                if (err)
                    throw err;
                return res.json({ data: user });
            });
    } else {
        return res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.post('/editProfile', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var User = require('../models/user');
        User.findByIdAndUpdate(userId, {
            $set: {
                education: req.body.education,
                location: req.body.location,
                skills: req.body.skills,
                notes: req.body.notes,
            }
        },
            function (err, status) {
                if (err)
                    throw err;
                return res.json({ status: 0, msg: "Profile Updated" });
            });
    } else {
        return res.json({ status: 0, msg: "User id Not found please relogin and try again" });
    }
});
ctrl.get('/list/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        var User = require('../models/user');
        User.findById(req.params.id, function (err, user) {
            if (err)
                throw err;
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
        if (err)
            throw err;
        res.json(user);
    });
});
ctrl.post('/login', function (req, res, next) {
    var passport = req.app.get('passport');
    if (passport) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.json({ status: 0, code: 200, msg: info.message, type: user.type });
            }
            req.logIn(user, function (err) {

                if (err) {

                    return next(err);
                }
                var User = require('../models/user');
                var total_login = user.login_details.total_login ? user.login_details.total_login + 1 : 1;
                var last_login = user.login_details.current_login ? user.login_details.current_login : new Date();
                var current_login = new Date();
                User.findByIdAndUpdate(user._id, { $set: { login_details: { total_login: total_login, last_login: last_login, current_login: current_login } } },
                    function (err, usr) {
                        if (err)
                            throw err;
                    });
                req.session.passport.type = user.type;
                console.log("req.session.passport.type");
                console.log(req.session.passport.type);
                return res.json({ status: 1, code: 200, user: user, msg: "Login Successful! Please wait...", type: user.type });
            });
        })(req, res, next);
    } else {
        res.json({ status: 0, code: 401, msg: "Application error!" });
        console.log("Passport not found");
    }
});




ctrl.post('/loginByFacebook', function (req, res) {
    var User = require('../models/user');
    var RuleOfPost = require('../models/ruleofpost');
    var data = req.body;
    var criteria = { 'facebook.id': data.id };
    if (data.email) {
        criteria = {
            $or: [
                { 'facebook.id': data.id },
                { 'local.email': data.email },
            ]

        };
    }
    User.findOne(criteria, function (err, user) {
        if (err) {
            return res.json({ status: 0 });
        }
        console.log(data);
        if (!user) {
            user1 = new User();
            user1.facebook.id = data.id;
            user1.fname = data.fname ? data.fname : data.name;
            user1.lname = data.lname ? data.lname : '';
            if (data.email) {
                user1.facebook.email = data.email;
                user1.local.email = data.email;
            } else {
                user1.facebook.email = data.id + "@fb.com";
                user1.local.email = data.id + "@fb.com";
            }
            user1.facebook.username = data.name;
            user1.facebook.photo = data.photo;
            user1.email = data.email;
            user1.facebook.token = data.accessToken;
            user1.activated = 1;


            user1.save(function (err) {
                if (err)
                    console.log(err);
                User.findOne({
                    'facebook.id': data.id
                }, function (err, user) {
                    if (err) {
                        return res.json({ status: 0 });
                    }
                    upload(req, null, function (err) {
                        if (err) {
                            return
                        }

                        if (data.photo) {
                            request({
                                url: data.photo,
                                encoding: null
                            }, function (error, response, body) {

                                var ext = data.photo.split('.').pop().split('?').shift();
                                filename = user._id + '.' + ext;

                                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/ProfilePicture/");

                                console.log(body instanceof Buffer);

                                fs.writeFile(uploadpath + '/' + filename, body, {
                                    encoding: null
                                }, function (err) {

                                    if (err)
                                        throw err;
                                    console.log('It\'s saved!');
                                    User.findByIdAndUpdate(user._id, {
                                        $set: {
                                            photo: filename
                                        }
                                    },
                                        function (err, user) {
                                            if (err)
                                                throw err;
                                            var clManager = req.app.get('wsClient');
                                            clManager.addBuddyToList(user);
                                            return res.json({ status: 1, user: user });
                                        });
                                });
                            });
                        } else {
                            var clManager = req.app.get('wsClient');
                            clManager.addBuddyToList(user);
                            return res.json({ status: 1, user: user });
                        }
                    });
                    var newRuleOfPost = new RuleOfPost();
                    newRuleOfPost.post_status = 1;
                    newRuleOfPost.user_id = user._id;
                    console.log('newRuleOfPostnewRuleOfPostnewRuleOfPostnewRuleOfPostnewRuleOfPostnewRuleOfPost', newRuleOfPost);
                    newRuleOfPost.save(function (err, newRuleOfPost) {
                        if (err) {
                            throw err;
                        }
                    });
                });
            });
        } else {
            User.findByIdAndUpdate(user._id, {
                $set: {
                    fname: data.fname ? data.fname : data.name,
                    lname: data.lname ? data.lname : '',
                    facebook: {
                        id: data.id,
                        username: data.name,
                        email: data.email,
                        photo: data.photo
                    }
                }
            },
                function (err, user) {
                    if (err)
                        throw err;
                    return res.json({ status: 1, user: user });
                });
        }
    });
});




ctrl.post('/loginByGoogle', function (req, res) {
    var User = require('../models/user');
    var RuleOfPost = require('../models/ruleofpost');
    var data = req.body;
    var criteria = { 'google.id': data.id };
    if (data.email) {
        criteria = {
            $or: [
                { 'google.id': data.id },
                { 'local.email': data.email },
            ]
        };
    }
    User.findOne(criteria, function (err, user) {
        if (err) {
            return res.json({ status: 0 });
        }
        if (!user) {
            console.log("hello2");
            user1 = new User();
            user1.google.id = data.id;
            user1.fname = data.fname ? data.fname : data.name;
            user1.lname = data.lname ? data.lname : '';
            if (data.email) {
                user1.google.email = data.email;
                user1.local.email = data.email;
            } else {
                user1.google.email = data.id + "@google.com";
                user1.local.email = data.id + "@google.com";
            }
            user1.google.username = data.name;
            user1.google.photo = data.photo;

            user1.email = data.email;

            user1.activated = 1;


            user1.save(function (err) {
                if (err)
                    console.log(err);
                User.findOne({
                    'google.id': data.id
                }, function (err, user) {
                    if (err) {
                        return res.json({ status: 0 });
                    }
                    upload(req, null, function (err) {
                        if (err) {
                            return
                        }
                        if (data.photo) {

                            request({
                                url: data.photo.split('?')[0] + '?sz=200',
                                encoding: null
                            }, function (error, response, body) {

                                var ext = data.photo.split('.').pop().split('?').shift();
                                filename = user._id + '.' + ext;
                                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/ProfilePicture/");
                                console.log(body instanceof Buffer);
                                fs.writeFile(uploadpath + '/' + filename, body, {
                                    encoding: null
                                }, function (err) {

                                    if (err)
                                        throw err;
                                    console.log('It\'s saved!');
                                    User.findByIdAndUpdate(user._id, {
                                        $set: {
                                            photo: filename
                                        }
                                    },
                                        function (err, user) {
                                            if (err)
                                                throw err;
                                            var clManager = req.app.get('wsClient');
                                            clManager.addBuddyToList(user);
                                            return res.json({ status: 1, user: user });
                                        });
                                });
                            });
                        } else {
                            var clManager = req.app.get('wsClient');
                            clManager.addBuddyToList(user);
                            return res.json({ status: 1, user: user });

                        }
                    });
                    var newRuleOfPost = new RuleOfPost();
                    newRuleOfPost.post_status = 1;
                    newRuleOfPost.user_id = user._id;
                    console.log('newRuleOfPostnewRuleOfPostnewRuleOfPostnewRuleOfPostnewRuleOfPostnewRuleOfPost', newRuleOfPost);
                    newRuleOfPost.save(function (err, newRuleOfPost) {
                        if (err) {
                            throw err;
                        }
                    });
                });
            });
        } else {
            console.log("hello3");
            User.findByIdAndUpdate(user._id, {
                $set: {
                    fname: data.fname ? data.fname : data.name,
                    lname: data.lname,
                    google: {
                        username: data.name,
                        photo: data.photo,
                        email: data.email,
                        id: data.id
                    },
                }
            },
                function (err, user) {
                    if (err)
                        throw err;
                    return res.json({ status: 1, user: user });
                });
        }
    });
});





ctrl.post('/checkEmail', function (req, res) {
    var User = require('../models/user');
    User.findOne({ 'local.email': req.body.email }, function (err, user) {
        if (err)
            throw err;
        if (user) {
            res.json({ status: 0, msg: "Email entered by you is already taken" });
        } else {
            res.json({ status: 2, msg: "No Email Found" });
        }
    });
});
ctrl.post('/addSubject', function (req, res) {
    var userId = req.session.passport.user;
    var id = req.body._id;
    var from = req.body.from;
    var to = req.body.to;
    var subjects_user_type = req.body.subjects_user_type;
    var currentDate = new Date().getTime();
    var userOffset = req.body.userOffset;
    var message;
    var User = require('../models/user');
    User.findOne({ '_id': userId, 'subjects.subject_id': id }, function (err, data) {
        if (!data) {
            User.findByIdAndUpdate(userId, { $push: { subjects: { subject_id: id, from: from, to: to, subjects_user_type: subjects_user_type, last_visit: new Date() } } },
                function (err, usr) {
                    if (err)
                        throw err;
                    cur_status = 1;
                    addUserToSubject(id, userId, from, to, subjects_user_type, cur_status, function (data) { });
                    // addSCDEvent(userId, id, 1, 'has joined the subject', function (data) { });
                    if (subjects_user_type == 1) {

                        if (new Date(from).getTime() <= currentDate && currentDate <= new Date(to).getTime()) {
                            message = "Currently taking from " + getDateTimeFormatInUserTimeZone(from, userOffset) + " to " + getDateTimeFormatInUserTimeZone(to, userOffset);
                        } else if (new Date(to).getTime() < currentDate) {
                            message = "Past Student from " + getDateTimeFormatInUserTimeZone(from, userOffset) + " to " + getDateTimeFormatInUserTimeZone(to, userOffset);
                        }
                        else if (currentDate < new Date(from).getTime()) {
                            message = "Future Student from " + getDateTimeFormatInUserTimeZone(from, userOffset) + " to " + getDateTimeFormatInUserTimeZone(to, userOffset);
                        }
                    } else if (subjects_user_type == 3) {
                        message = "Subject Expert";
                    } else if (subjects_user_type == 4) {
                        message = "Teacher of Subject";
                    } else if (subjects_user_type == 5) {
                        message = "Just Interested";
                    }
                    addSCDPost(userId, id, 1, 'has joined the subject', message, function (data) { });
                    res.json({ status: 2, message: "Subject Added Successfully" });
                });
        } else {
            res.json({ status: 0, message: "Subject Already Added" });
        }
    });
});
function getDateTimeFormatInUserTimeZone(date, offset) {
    console.log("date", date);
    console.log("offset", offset);
    var startTimeUtc = new Date(date).getTime() + (new Date(date).getTimezoneOffset() * 60000);
    console.log("startTimeUtc", startTimeUtc);
    var startDateUtc = new Date(startTimeUtc - (60000 * offset));
    console.log("startDateUtc", startDateUtc);
    return moment(startDateUtc).format('MMM YYYY');
}
ctrl.get('/removeSubject/:id', function (req, res) {
    var userId = req.session.passport.user;
    var id = req.params.id;
    var User = require('../models/user');
    var Subject = require('../models/subject');
    var Post = require('../models/post');
    User.findByIdAndUpdate(userId, { $pull: { subjects: { subject_id: id } } },
        function (err, usr) {
            if (err)
                throw err;
            Post.find({ 'created_by': userId, 'subject_id': id }).remove().exec(function (err, posts) {
                if (err)
                    throw err;
            });
            Subject.update({ "_id": id, "members.user_id": userId }, { $pull: { members: { user_id: userId } } }, { safe: true },
                function (err, obj) {
                    if (err)
                        throw err;
                });
            // Event.find({ 'created_by': userId, 'subject_id': id }).remove().exec(function (err, event) {
            //     if (err)
            //         throw err;
            // });
            res.json({ status: 2, message: "Subject Removed Successfully" });
        });
});
ctrl.post('/addCollege', function (req, res) {
    var userId = req.session.passport.user;
    var id = req.body._id;
    var from = req.body.from;
    var to = req.body.to;
    var message;
    var userOffset = req.body.userOffset;
    var User = require('../models/user');
    User.findOne({ '_id': userId, 'college.college_id': id }, function (err, data) {
        if (!data) {
            User.findByIdAndUpdate(userId, { $push: { college: { college_id: id, from: from, to: to, last_visit: new Date() } } },
                function (err, usr) {
                    if (err)
                        throw err;
                    cur_status = 1;
                    addUserToCollege(id, userId, from, to, cur_status, function (data) { });
                    // addSCDEvent(userId, id, 2, 'has joined the college', function (data) { });
                    message = "From " + getDateTimeFormatInUserTimeZone(from, userOffset) + " to " + getDateTimeFormatInUserTimeZone(to, userOffset);
                    addSCDPost(userId, id, 2, 'has joined the college', message, function (data) { });
                    res.json({ status: 2, message: "College Added Successfully" });
                });
        } else {
            res.json({ status: 0, message: "College Already Added" });
        }
    });
});
ctrl.post('/saveUpdate', function (req, res) {
    var User = require('../models/user');
    var userId = req.session.passport.user;
    var userName = req.body.userName;
    var userEmail = req.body.userEmail;
    var userPass = req.body.userPass;
    var namePart = userName.split(' ');
    var fname = namePart[0];
    var lname = namePart.slice(1).join(' ');
    lname = lname ? lname.trim() : '';
    console.log("userpass+++++++++++++++++++++" + userPass + "+++++++++++++++++++");
    var userConfirmPass = req.body.userConfirmPass;
    user = new User();
    if (userPass && userPass.length < 5) {
        res.json({ status: 0, message: "Password Is To Small!" });
    } else {
        if (userPass && userPass !== userConfirmPass) {
            res.json({ status: 0, message: "Please Enter Correct Confirm Password" });
        } else {
            var newpass = user.generateHash(userPass);
            User.findOne({ 'local.email': userEmail, _id: { $ne: userId } }, function (err, data) {
                if (!data) {
                    User.findOne({ _id: userId }, function (err, user) {
                        if (err)
                            throw err;
                        if (!userEmail)
                            userEmail = user.local.email;
                        if (!userPass)
                            newpass = user.local.password;
                        if (!fname)
                            fname = user.fname;
                        User.findByIdAndUpdate(userId, { $set: { local: { email: userEmail, password: newpass }, fname: fname, lname: lname } },
                            function (err, usrUpdate) {
                                if (err)
                                    throw err;
                                User.findOne({ _id: userId }, function (err, userNewUpdate) {
                                    getFriendsEmailIds(userId, function (data) {
                                        var dataForUpdate = { recepients: data.ids, from: userId, field: 'name', lname: lname, value: fname };
                                        var clManager = req.app.get('wsClient');
                                        clManager.changeNameOrPhoto(dataForUpdate);
                                        res.json({ status: 2, message: "Updated Successfully", data: userNewUpdate });
                                    });
                                });
                            });
                    });
                } else {
                    res.json({ status: 0, message: "Email Already Exist!" });
                }
            });

        }
    }
});
ctrl.post('/saveAdminUpdate/:userName/:userEmail/:userPass/:userConfirmPass', function (req, res) {
    var User = require('../models/user');
    var userId = req.session.passport.user;
    var userName = req.params.userName;
    var userEmail = req.params.userEmail;
    var userPass = req.params.userPass;
    var namePart = userName.split(' ');
    var fname = namePart[0];
    var lname = namePart.slice(1).join(' ');
    lname = lname ? lname.trim() : '';
    console.log("userpass+++++++++++++++++++++" + userPass + "+++++++++++++++++++");
    var userConfirmPass = req.params.userConfirmPass;
    user = new User();
    if (userPass && userPass.length < 6) {
        res.json({ status: 0, message: "Password Is To Small!" });
    } else {
        if (userPass === userConfirmPass) {
            if (userPass == '9@9@9@9@') {
                userPass = '';
                console.log("++++++++++++++++++userPass=" + userPass);
            }
            var newpass = user.generateHash(userPass);
            User.findOne({ 'local.email': userEmail, _id: { $ne: userId } }, function (err, data) {
                if (!data) {
                    User.findOne({ _id: userId }, function (err, user) {
                        if (err)
                            throw err;
                        if (!userEmail)
                            userEmail = user.local.email;
                        if (!userPass)
                            newpass = user.local.password;
                        console.log("newpass++++++++++++" + newpass);
                        if (!fname)
                            fname = user.fname;
                        upload(req, res, function (err) {
                            if (err) {
                                return;
                            }
                            var ext = req.file.originalname.split('.').pop();
                            filename = user._id + '.' + ext;
                            console.log("filename");
                            console.log(filename);
                            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/ProfilePicture");
                            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                                if (err) {
                                    return console.log(err);
                                }
                                User.findByIdAndUpdate(userId, { $set: { local: { email: userEmail, password: newpass }, fname: fname, lname: lname, photo: filename } },
                                    function (err, usrUpdate) {
                                        if (err)
                                            throw err;
                                        User.findOne({ _id: userId }, function (err, userNewUpdate) {
                                            res.json({ status: 2, message: "Updated Successfully", data: userNewUpdate });
                                        });
                                    });
                            });
                        });
                    });
                } else {
                    res.json({ status: 0, message: "Email Already Exist!" });
                }
            });
        } else {
            res.json({ status: 0, message: "Please Enter Correct Confirm Password" });
        }
    }
});
ctrl.get('/removeCollege/:id', function (req, res) {
    var userId = req.session.passport.user;
    var id = req.params.id;
    var User = require('../models/user');
    var College = require('../models/college');
    var Post = require('../models/post');
    User.findByIdAndUpdate(userId, { $pull: { college: { college_id: id } } },
        function (err, usr) {
            if (err)
                throw err;
            Post.find({ 'created_by': userId, 'college_id': id }).remove().exec(function (err, posts) {
                if (err)
                    throw err;
            });
            College.update({ "_id": id, "members.user_id": userId }, { $pull: { members: { user_id: userId } } }, { safe: true },
                function (err, obj) {
                    if (err)
                        throw err;
                });
            // Event.find({ 'created_by': userId, 'college_id': id }).remove().exec(function (err, event) {
            //     if (err)
            //         throw err;
            // })
            res.json({ status: 2, message: "College Removed Successfully" });
        });
});
ctrl.post('/addDegree', function (req, res) {
    var userId = req.session.passport.user;
    var id = req.body._id;
    var from = req.body.from;
    var to = req.body.to;
    var message;
    var userOffset = req.body.userOffset;
    var User = require('../models/user');
    User.findOne({ '_id': userId, 'degree.degree_id': id }, function (err, data) {
        if (!data) {
            User.findByIdAndUpdate(userId, { $push: { degree: { degree_id: id, from: from, to: to, last_visit: new Date() } } },
                function (err, usr) {
                    if (err)
                        throw err;
                    cur_status = 1;
                    addUserToDegree(id, userId, from, to, cur_status, function (data) { });
                    // addSCDEvent(userId, id, 3, 'has joined the degree', function (data) { });
                    message = "From " + getDateTimeFormatInUserTimeZone(from, userOffset) + " to " + getDateTimeFormatInUserTimeZone(to, userOffset);
                    addSCDPost(userId, id, 3, 'has joined the degree', message, function (data) { });
                    res.json({ status: 2, message: "Degree Added Successfully" });
                });
        } else {
            res.json({ status: 0, message: "Degree Already Added" });
        }
    });
});
ctrl.get('/removeDegree/:id', function (req, res) {
    var userId = req.session.passport.user;
    var id = req.params.id;
    var User = require('../models/user');
    var Degree = require('../models/degree');
    var Post = require('../models/post');
    User.findByIdAndUpdate(userId, { $pull: { degree: { degree_id: id } } },
        function (err, usr) {
            if (err)
                throw err;
            Post.find({ 'created_by': userId, 'degree_id': id }).remove().exec(function (err, posts) {
                if (err)
                    throw err;
            });
            Degree.update({ "_id": id, "members.user_id": userId }, { $pull: { members: { user_id: userId } } }, { safe: true },
                function (err, obj) {
                    if (err)
                        throw err;
                });
            // Event.find({ 'created_by': userId, 'degree_id': id }).remove().exec(function (err, event) {
            //     if (err)
            //         throw err;
            // })
            res.json({ status: 2, message: "Degree Removed Successfully" });
        });
});
ctrl.post('/register', function (req, res, next) {
    var random = new Random(Random.engines.mt19937().autoSeed());
    var activation_code = random.integer(10000000000, 999999999999);
    User.findOne({ 'local.email': req.body.email }, function (err, user) {
        if (err) {
            throw err;
        }
        if (user) {
            res.json({ status: 0, msg: "Email entered by you is already taken" });
        } else {
            var colleges = [];
            var subjects = [];
            var degrees = [];
            colleges = req.body.colleges ? req.body.colleges : [];
            subjects = req.body.subjects ? req.body.subjects : [];
            degrees = req.body.degrees ? req.body.degrees : [];
            colleges = colleges.length ? JSON.parse(colleges) : colleges;
            subjects = subjects.length ? JSON.parse(subjects) : subjects;
            degrees = degrees.length ? JSON.parse(degrees) : degrees;
            var fname = req.body.fname;
            var newUser = new User();
            var newSubscriber = new Subscriber();
            newSubscriber.name = req.body.fname;
            newSubscriber.email = req.body.email;
            newSubscriber.status = 1;
            newSubscriber.save(function (err, newSubscriber) {
                if (err)
                    throw err;
            });
            newUser.local.password = newUser.generateHash(req.body.password);
            newUser.fname = fname;
            newUser.lname = '';
            newUser.dob = req.body.dob ? new Date(req.body.dob) : null;
            newUser.zip = req.body.postalCode;
            newUser.gender = req.body.gender;
            newUser.activation_code = activation_code;
            newUser.local.email = req.body.email;
            newUser.mobile_no = req.body.mobile_no;
            newUser.save(function (err, newUser) {
                if (err) {
                    throw err;
                }
                if (req.body.postalCode) {
                    saveCityStateName(newUser._id, req.body.postalCode);
                }
                for (var i in colleges) {
                    if (colleges[i]) {
                        User.findByIdAndUpdate(newUser._id, {
                            $push: {
                                college: {
                                    college_id: colleges[i].id,
                                    from: colleges[i].from,
                                    to: colleges[i].to,
                                    last_visit: new Date()
                                }
                            }
                        },
                            function (err, usr) {
                                if (err)
                                    throw err;
                            }
                        );
                        addUserToCollege(colleges[i].id, newUser._id, colleges[i].from, colleges[i].to, 1, function (data) { });
                    }
                }
                for (var i in subjects) {
                    if (subjects[i]) {
                        User.findByIdAndUpdate(newUser._id, {
                            $push: {
                                subjects: {
                                    subject_id: subjects[i].id,
                                    from: subjects[i].from,
                                    to: subjects[i].to,
                                    subjects_user_type: subjects[i].subjects_user_type,
                                    last_visit: new Date()
                                }
                            }
                        },
                            function (err, usr) {
                                if (err)
                                    throw err;
                            }
                        );
                        addUserToSubject(subjects[i].id, newUser._id, subjects[i].from, subjects[i].to, subjects[i].subjects_user_type, 1, function (data) { });
                    }
                }
                for (var i in degrees) {
                    if (degrees[i]) {
                        User.findByIdAndUpdate(newUser._id, {
                            $push: {
                                degree: {
                                    degree_id: degrees[i].id,
                                    from: degrees[i].from,
                                    to: degrees[i].to,
                                    last_visit: new Date()
                                }
                            }
                        },
                            function (err, usr) {
                                if (err)
                                    throw err;
                            }
                        );
                        addUserToDegree(degrees[i].id, newUser._id, degrees[i].from, degrees[i].to, 1, function (data) { });
                    }
                }
                var newRuleOfPost = new RuleOfPost();
                newRuleOfPost.post_status = 1;
                newRuleOfPost.user_id = newUser._id;
                newRuleOfPost.save(function (err, newRuleOfPost) {
                    if (err) {
                        throw err;
                    }
                });
                getSendRegEmailStatus((regEmailStatus) => {
                    var clManager = req.app.get('wsClient');
                    if (regEmailStatus) {
                        getEmailData('account_activate', function (data) {
                            var fullUrl = "http://dev.stribein.com";
                            locals = {
                                email: req.body.email,
                                from: 'register@stribein.com',
                                subject: data.subject, //'Just one more step to get started with StudentNetwork',
                                logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
                                name: fname,
                                password: req.body.password,
                                siteLink: fullUrl,
                                activation_link: fullUrl + '/api/user/activate/' + newUser.id + '/' + activation_code
                            };
                            clManager.addBuddyToList(newUser);
                            res.json({ status: 2, newUser: newUser, msg: "Registration is successful!." });
                            next();
                        });
                    } else {
                        User.update({ '_id': newUser._id }, { $set: { 'activated': 1 } }, (err, data) => { });
                        clManager.addBuddyToList(newUser);
                        res.json({ status: 2, newUser: newUser, msg: "Registration is successful!." });
                    }
                });
            });
        }
    });
}, function (req, res) {
    mailer.sendOne('account_activate', locals, function (err, responseStatus, html, text) { });
});

function getSendRegEmailStatus(callback) {
    User.findOne({ type: 2 })
        .select('isRegConEnable')
        .exec((err, data) => {
            if (err)
                throw err;
            if (data) {
                callback(data.isRegConEnable);
            } else {
                callback(0);
            }
        });
}

function getEmailData(tmp_name, callback) {
    var Template = require('../models/template');
    Template.find({ type: 2, name: tmp_name })
        .exec(function (err, template) {
            if (err)
                throw err;
            callback(template[0]);
        });
}

ctrl.get('/activate/:id/:validationcode', function (req, res, next) {
    var User = require('../models/user');
    var Subscriber = require('../models/subscriber');
    var user = new User();
    var userId = req.params.id;
    var validationcode = req.params.validationcode;
    console.log("validationcode");
    console.log(validationcode);
    if (userId && validationcode) {
        User.find({ '_id': userId }, function (err, userActivate) {
            if (err)
                throw err;
            console.log("userActivate");
            console.log(userActivate);
            console.log("userActivate.activated");
            console.log(userActivate[0].activated);
            if (userActivate[0].activated == 0) {
                User.find({ '_id': userId, 'activation_code': validationcode }, function (err, user) {
                    if (err)
                        throw err;
                    console.log("userdetail:" + JSON.stringify(user));
                    var name = user[0].fname + ' ' + (user[0].lname ? user[0].lname : '');
                    Subscriber.findOneAndUpdate({ email: user[0].local.email }, { $set: { status: 2, name: name } }, function (err, newSub) {
                        if (err)
                            throw err;
                    });
                    if (user.length > 0) {
                        User.findByIdAndUpdate(userId, { $set: { activated: 1 } },
                            function (err, status) {
                                if (err)
                                    throw err;
                                getEmailData('activation_email', function (data) {
                                    var fullUrl = "http://dev.stribein.com";
                                    locals = {
                                        email: user[0].local.email,
                                        from: 'notifications@stribein.com',
                                        subject: data.subject, //'Welcome to StudentNetwork !',
                                        logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
                                        name: user[0].fname + ' ' + (user[0].lname ? user[0].lname : ''),
                                        login_url: fullUrl,
                                        siteLink: fullUrl,
                                        unsubscribe_url: fullUrl + '/userUnSubscribe/' + user[0].local.email
                                    };
                                    req.flash({ message: 'Account activated successfully!' });
                                    res.redirect('/login');
                                    next();
                                })
                            }
                        );
                    } else {
                        res.json({ status: 0, msg: "Invalid Activation Code Or Email!" });
                    }
                });
            } else {
                req.flash({ msg: 'Your account is already activated!' });
                res.redirect('/login');
            }

        });
    }
}, function (req, res) {
    mailer.sendOne('activation_email', locals, function (err, responseStatus, html, text) { });
});
ctrl.get('/addFriend/:user_id', function (req, res, next) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var friendId = req.params.user_id;
            var User = require('../models/user');
            var cDate = new Date();
            /*
             * Status{
             *      1 => UnApproved
             *      2 => WaitingApproval
             *      3 => Approved              
             *      4 => Blocker              
             *      5 => Blocked              
             * }              
             */
            getFriendStatus(userId, friendId, function (friend) {
                if (!(friend.status == 5 || friend.status == 2 || friend.status == 1)) {
                    User.find({ "_id": userId, "friends.friend_id": friendId }, function (err, user) {
                        if (!user.length) {
                            User.findByIdAndUpdate(userId, {
                                $push: {
                                    friends: {
                                        friend_id: friendId,
                                        date: cDate,
                                        status: "1"
                                    }
                                }
                            },
                                function (err, usr) {
                                    if (err)
                                        throw err;
                                    User.findByIdAndUpdate(friendId, {
                                        $push: {
                                            friends: {
                                                friend_id: userId,
                                                date: cDate,
                                                status: "2"
                                            }
                                        }
                                    },
                                        function (err, friend) {
                                            if (err)
                                                throw err;
                                            var friend_name;
                                            var friend_email;
                                            var fullUrl = "http://dev.stribein.com";
                                            res.json({ status: 2, msg: "Friend request send!" });
                                        }
                                    );
                                });
                        } else {
                            res.json("Already present");
                        }
                    });
                } else {
                    res.json({ status: 0, msg: "You are not allowed to send request.", friendStatus: friend.status });
                }
            });
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
}, function (req, res) { });
ctrl.get('/addFollower/:user_id', function (req, res) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var followToId = req.params.user_id;
            var User = require('../models/user');
            var cDate = new Date();
            /*
             * Status{
             *      1 => follower
             *      2 => following
             * }              
             */
            User.findByIdAndUpdate(userId, {
                $push: {
                    following: {
                        following_id: followToId,
                        date: cDate
                    }
                }
            },
                function (err, usr) {
                    if (err)
                        throw err;
                    User.findByIdAndUpdate(followToId, {
                        $push: {
                            followers: {
                                follower_id: userId,
                                date: cDate
                            }
                        }
                    },
                        function (err, follower) {
                            if (err)
                                throw err;
                            getFollowers(followToId, req, function (followers) {

                                res.json({ status: 2, msg: "You have successfully followed the user.", followersCount: followers.followersCount, followers: followers.data });

                            });
                        }
                    );
                }
            );
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/unFollow/:user_id', function (req, res) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var followToId = req.params.user_id;
            var User = require('../models/user');
            /*
             * Status{
             *      1 => follower
             *      2 => following
             * }              
             */
            User.update({ "_id": userId, "following.following_id": followToId }, { $pull: { following: { following_id: followToId } } }, { safe: true },
                function (err, usr) {
                    if (err)
                        throw err;
                    User.update({ "_id": followToId, "followers.follower_id": userId }, { $pull: { followers: { follower_id: userId } } }, { safe: true },
                        function (err, follower) {
                            if (err)
                                throw err;
                            getFollowers(followToId, req, function (followers) {

                                res.json({ status: 2, msg: "You have successfully unfollowed the user.", followersCount: followers.followersCount, followers: followers.data });

                            });
                        }
                    );
                }
            );
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/getFollowers', function (req, res) {
    if (req.session.passport) {
        var User = require('../models/user');
        var userId = req.session.passport.user;
        var follower = [];
        var following = [];
        var follower_name;
        var follower_id;
        var photo;
        User.findOne({ "_id": userId })
            .select("followers")
            .populate({ path: 'followers.follower_id', select: 'fname lname photo _id' })
            .exec(function (err, user) {
                if (err)
                    return handleError(err);
                if (user) {
                    for (var i in user.followers) {
                        if (user.followers[i].follower_id) {
                            follower_id = user.followers[i].follower_id._id;
                            follower_name = user.followers[i].follower_id.fname + " " + user.followers[i].follower_id.lname;
                            photo = user.followers[i].follower_id.photo;
                            follower.push({ name: follower_name, follower_id: follower_id, photo: photo });
                        }

                    }
                }
                return res.json({ status: 2, data: { follower: follower } })
            });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/getFollowing', function (req, res) {
    if (req.session.passport) {
        var User = require('../models/user');
        var userId = req.session.passport.user;
        var follower = [];
        var following = [];
        var follower_name;
        var follower_id;
        var photo;
        User.findOne({ "_id": userId })
            .select("following")
            .populate({ path: 'following.following_id', select: 'fname lname photo _id' })
            .exec(function (err, user) {
                if (err)
                    return handleError(err);
                if (user) {
                    for (var i in user.following) {
                        following_id = user.following[i].following_id._id;
                        following_name = user.following[i].following_id.fname + " " + user.following[i].following_id.lname;
                        photo = user.following[i].following_id.photo;
                        following.push({ name: following_name, following_id: following_id, photo: photo });
                    }
                }
                return res.json({ status: 2, data: { following: following } })
            });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/cancelFriend/:user_id', function (req, res) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var friendId = req.params.user_id;
            var User = require('../models/user');
            getFriendStatus(userId, friendId, function (friend) {
                if (!(friend.status == 3 || friend.status == 5)) {
                    User.update({ "_id": userId, "friends.friend_id": friendId, "friends.status": 1 }, { $pull: { friends: { friend_id: friendId } } }, { safe: true },
                        function (err, obj) {
                            if (err)
                                throw err;
                            User.update({ "_id": friendId, "friends.friend_id": userId, "friends.status": 2 }, { $pull: { friends: { friend_id: userId } } }, { safe: true },
                                function (err, obj) {
                                    if (err)
                                        throw err;
                                    getfriendlist(userId, function (data) {
                                        return res.json({ status: 2, data: data });
                                    });
                                });
                        });
                } else {
                    if (friend.status == 5)
                        res.json({ status: 0, msg: "You are not allowed to perform this action.", friendStatus: friend.status });
                    else if (friend.status == 3)
                        res.json({ status: 0, msg: "You are already friend.", friendStatus: friend.status });
                }
            });
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/rejectFriend/:user_id', function (req, res) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var friendId = req.params.user_id;
            var User = require('../models/user');
            getFriendStatus(userId, friendId, function (friend) {
                if (friend.status == 2) {
                    User.update({ "_id": userId, "friends.friend_id": friendId, "friends.status": 2 }, { $pull: { friends: { friend_id: friendId } } }, { safe: true },
                        function (err, obj) {
                            if (err)
                                throw err;
                            User.update({ "_id": friendId, "friends.friend_id": userId, "friends.status": 1 }, { $pull: { friends: { friend_id: userId } } }, { safe: true },
                                function (err, obj) {
                                    if (err)
                                        throw err;
                                    getfriendlist(userId, function (data) {
                                        return res.json({ status: 2, data: data });
                                    });
                                });
                        });
                } else {
                    res.json({ status: 0, msg: "Request Already Canceled", friendStatus: friend.status });
                }
            });
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/approveFriend/:user_id', function (req, res, next) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var friendId = req.params.user_id;
            var User = require('../models/user');
            var cDate = new Date();
            getFriendStatus(userId, friendId, function (friend) {
                if (friend.status == 2) {
                    User.find({ "_id": userId, "friends.friend_id": friendId, "friends.status": 2 }, function (err, user) {
                        if (user.length > 0) {
                            User.update({ "_id": userId, "friends.friend_id": friendId, "friends.status": 2 }, { $pull: { friends: { friend_id: friendId } } },
                                function (err, user) {
                                    if (err)
                                        throw err;
                                    User.findByIdAndUpdate(userId, {
                                        $push: {
                                            friends: {
                                                friend_id: friendId,
                                                date: cDate,
                                                status: "3"
                                            }
                                        }
                                    },
                                        function (err, usr) {
                                            if (err)
                                                throw err;
                                            User.update({ "_id": friendId, "friends.friend_id": userId, "friends.status": 1 }, { $pull: { friends: { friend_id: userId } } },
                                                function (err, friend) {
                                                    if (err)
                                                        throw err;
                                                    User.findByIdAndUpdate(friendId, {
                                                        $push: {
                                                            friends: {
                                                                friend_id: userId,
                                                                date: cDate,
                                                                status: "3"
                                                            }
                                                        }
                                                    },
                                                        function (err, usr) {
                                                            if (err)
                                                                throw err;
                                                            title = "is now friend";
                                                            addfriendevent(userId, friendId, title, function (req, res) { });
                                                            addfriendevent(friendId, userId, title, function (req, res) { });
                                                            var friend_name;
                                                            var friend_email;
                                                            var fullUrl = "http://dev.stribein.com";
                                                            /*    getUserDetail(friendId, function (friendData) {
                                                             
                                                             */

                                                            getfriendlist(userId, function (data) {
                                                                var dataForUpdate = { recepients: [userId, friendId] ,action: 'add'};
                                                                var clManager = req.app.get('wsClient');
                                                                clManager.changeFriendStatus(dataForUpdate)
                                                                return res.json({ status: 2, data: data });
                                                            });
                                                        });
                                                });
                                        });
                                });

                        } else {
                            res.json({ status: 0, msg: "No User Found" });
                        }
                    });
                } else {
                    res.json({ status: 0, msg: "Sorry! Friend request is canceled.", friendStatus: friend.status });
                }
            });
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
}, function (req, res) { });
ctrl.get('/blockFriend/:user_id', function (req, res) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var friendId = req.params.user_id;
            var User = require('../models/user');
            removeGroupMember(userId, friendId, function (groupdata) {
                User.update({ "_id": userId, "friends.friend_id": friendId }, { $pull: { friends: { friend_id: friendId } } }, { safe: true },
                    function (err, obj) {
                        if (err)
                            throw err;
                        User.update({ "_id": friendId, "friends.friend_id": userId }, { $pull: { friends: { friend_id: userId } } }, { safe: true },
                            function (err, obj) {
                                if (err)
                                    throw err;
                                User.update({ "_id": userId }, { $push: { friends: { "friend_id": friendId, "status": 4 } } }, { safe: true },
                                    function (err, obj) {
                                        if (err)
                                            throw err;
                                        User.update({ "_id": friendId }, { $push: { friends: { "friend_id": userId, "status": 5 } } }, { safe: true },
                                            function (err, obj) {
                                                if (err)
                                                    throw err;
                                                getblockedfriendlist(userId, function (blocked_friends) {
                                                    var dataForUpdate = { recepients: [userId, friendId],action: 'remove' };
                                                    var clManager = req.app.get('wsClient');
                                                    clManager.changeFriendStatus(dataForUpdate)
                                                    return res.json({ status: 2, data: { blocked_friends: blocked_friends } });
                                                });
                                            });
                                    });
                            });
                    });
            });
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/unblockFriend/:user_id', function (req, res) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var friendId = req.params.user_id;
            var User = require('../models/user');
            getFriendStatus(userId, friendId, function (friend) {
                if (friend.status == 4) {
                    User.update({ "_id": userId, "friends.friend_id": friendId, "friends.status": 4 }, { $pull: { friends: { friend_id: friendId } } }, { safe: true },
                        function (err, obj) {
                            if (err)
                                throw err;
                            User.update({ "_id": friendId, "friends.friend_id": userId, "friends.status": 5 }, { $pull: { friends: { friend_id: userId } } }, { safe: true },
                                function (err, obj) {
                                    if (err)
                                        throw err;
                                    getblockedfriendlist(userId, function (blocked_friends) {
                                        return res.json({ status: 2, data: { blocked_friends: blocked_friends } });
                                    });
                                });
                        });
                } else {
                    return res.json({ status: 0, msg: 'User is not blocked', friendStatus: friend.status });
                }
            });
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/removeFriend/:user_id', function (req, res) {
    if (req.session.passport) {
        if ((req.params.user_id && req.params.user_id > -1)) {
            var userId = req.session.passport.user;
            var friendId = req.params.user_id;
            var User = require('../models/user');
            getFriendStatus(userId, friendId, function (friend) {
                if (friend.status == 3) {
                    removeGroupMember(userId, friendId, function (groupdata) {


                        User.update({ "_id": userId, "friends.friend_id": friendId, "friends.status": 3 }, { $pull: { friends: { friend_id: friendId } } }, { safe: true },
                            function (err, obj) {
                                if (err)
                                    throw err;
                                User.update({ "_id": friendId, "friends.friend_id": userId, "friends.status": 3 }, { $pull: { friends: { friend_id: userId } } }, { safe: true },
                                    function (err, obj) {
                                        if (err)
                                            throw err;
                                        getfriendlist(userId, function (data) {
                                            var dataForUpdate = { recepients: [userId, friendId] ,action: 'remove'};
                                            var clManager = req.app.get('wsClient');
                                            clManager.changeFriendStatus(dataForUpdate)
                                            return res.json({ status: 2, data: data, groupdata: groupdata });
                                        });
                                    });
                            });

                    });
                    //                    });
                } else {
                    res.json({ status: 0, msg: "You are not friend.", friendStatus: friend.status });
                }
            });
        } else {
            res.json({ status: 0, msg: "No User Selected" });
        }
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/getAllTypeFriends', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        getfriendlist(userId, function (data) {
            return res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }

});

function removeGroupMember(userId, friendId, callback) {
    Groupchat.update({ 'created_by': userId }, { $pull: { members: { user_id: friendId } } }, { multi: true },
        function (err, grp) {
            if (err)
                throw err;
            Groupchat.update({ 'members.user_id': userId, 'created_by': friendId }, { $pull: { members: { user_id: userId } } }, { multi: true },
                function (err, Othergrp) {
                    if (err)
                        throw err;
                    callback({ Othergrp: Othergrp, grp: grp });

                });
        });
}

function getfriendlist(userId, callback) {
    var User = require('../models/user');
    var current_friends = [];
    var pending_friends = [];
    var request_friends = [];
    var blocked_friends = [];
    var unblocked_friends = [];
    User.find({ '_id': userId })
        .populate({ path: 'friends.friend_id', select: 'fname lname photo _id' })

        .exec(function (err, users) {
            if (err)
                throw err;
            data = users[0];
            for (var attributename in data.friends) {
                if (data.friends[attributename].friend_id != null) {
                    var friend_name = data.friends[attributename].friend_id.fname + ' ' + data.friends[attributename].friend_id.lname;
                    var friend_id = data.friends[attributename].friend_id._id;
                    var photo = data.friends[attributename].friend_id.photo;
                    var status = data.friends[attributename].status;
                    if (data.friends[attributename].status === 3) {
                        current_friends.push({ name: friend_name, friend_id: friend_id, photo: photo, status: status });
                    } else if (data.friends[attributename].status === 2) {
                        pending_friends.push({ name: friend_name, friend_id: friend_id, photo: photo, status: status });
                    } else if (data.friends[attributename].status === 1) {
                        request_friends.push({ name: friend_name, friend_id: friend_id, photo: photo, status: status });
                    } else if (data.friends[attributename].status === 4) {
                        blocked_friends.push({ name: friend_name, friend_id: friend_id, photo: photo, status: status });
                    } else if (data.friends[attributename].status === 5) {
                        unblocked_friends.push({ name: friend_name, friend_id: friend_id, photo: photo, status: status });
                    }
                }
            }
            callback({ current: current_friends, pending: pending_friends, request: request_friends, blocked: blocked_friends, unblocked: unblocked_friends });
        });
}
ctrl.get('/getFriendList', function (req, res) {
    if (req.session.passport) {
        var User = require('../models/user');
        var userId = req.session.passport.user;
        User.findOne({ '_id': userId })
            .select('friends')
            .populate({ path: 'friends.friend_id', select: 'fname lname photo city _id' })
            .exec(function (err, user) {
                if (err)
                    throw err;
                return res.json({ status: 2, data: user.friends });
            });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.post('/forgetPassword', function (req, res, next) {
    var User = require('../models/user');
    var Random = require("random-js");
    var random = new Random(Random.engines.mt19937().autoSeed());
    var forgot_password_code = random.integer(10000000000, 999999999999);
    console.log("req.body.email", req.body.email);
    if (req.body.email) {
        User.find({ 'local.email': req.body.email }, function (err, user) {
            if (user.length > 0) {
                User.findByIdAndUpdate(user[0].id, { $set: { forgot_password_code: forgot_password_code } },
                    function (err, status) {
                        if (err)
                            throw err;
                        getEmailData('change_password_email', function (data) {
                            var fullUrl = "http://dev.stribein.com";
                            locals = {
                                email: user[0].local.email,
                                from: 'support@stribein.com',
                                subject: data.subject, //'Somebody requested a new password for your StudentNetwork Account',
                                logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
                                name: user[0].fname + ' ' + (user[0].lname ? user[0].lname : ''),
                                siteLink: fullUrl,
                                change_pass_url: fullUrl + '/resetPassword/' + user[0].id + '/' + forgot_password_code
                            };
                            res.json({ status: 1, msg: "Email sent successfully." });
                            next();
                        });
                    });
            } else {
                res.json({ status: 0, msg: "Email Id does not exist." });
            }
        });
    } else {
        res.json({ status: 0, msg: "Email Id cannot be left blank." });
    }
}, function () {
    mailer.sendOne('change_password_email', locals, function (err, responseStatus, html, text) { });
});
ctrl.post('/changePassword', function (req, res) {
    var oldPassword = req.body.oldPass;
    var newPassword = req.body.newPass;
    var confirmPassword = req.body.confPass;
    if (newPassword !== confirmPassword) {
        res.json({ status: 0, msg: "New and confirm password mismatch" });
    } else {
        if (req.session.passport) {
            var userId = req.session.passport.user;
            var User = require('../models/user');
            user = new User();
            var oldpass = user.generateHash(oldPassword);
            var newpass = user.generateHash(newPassword);
            console.log(userId);
            if (newpass) {
                User.find({ _id: userId }, function (err, user) {
                    if (err)
                        throw err;
                    console.log(user);
                    if (user.length > 0) {
                        User.findByIdAndUpdate(userId, { $set: { local: { password: newpass, email: user[0].local.email } } },
                            function (err, status) {
                                if (err)
                                    throw err;
                                res.json({ status: 1, msg: "Password has been updated successfully" });
                            });
                    } else {
                        res.json({ status: 0, msg: "Authentication failed" });
                    }
                });
            }
        } else {
            res.json({ msg: "Authentication failed" });
        }
    }
});
ctrl.post('/changePasswordAdmin/:userId', function (req, res) {
    console.log("req.body.currentPassword.currentPassword");
    console.log(req.body.currentPassword.currentPassword);
    var oldPassword = req.body.currentPassword.currentPassword;
    var newPassword = req.body.newPassword.newPassword;
    var confirmPassword = req.body.confirmPassword.confirmPassword;
    console.log("oldPassword");
    console.log(oldPassword);
    console.log("newPassword");
    console.log(newPassword);
    console.log("confirmPassword");
    console.log(confirmPassword);
    if (req.session.passport && req.session.passport.type == 2) {
        if (newPassword !== confirmPassword) {
            res.json({ status: 0, msg: "New and confirm password mismatch" });
        } else {
            if (req.session.passport) {
                var userId = req.params.userId;
                var User = require('../models/user');
                user = new User();
                var oldpass = user.generateHash(oldPassword);
                var newpass = user.generateHash(newPassword);
                console.log(userId);
                if (newpass) {
                    User.find({ _id: userId }, function (err, user) {
                        if (err)
                            throw err;
                        console.log(user);
                        if (user.length > 0) {
                            User.findByIdAndUpdate(userId, { $set: { local: { password: newpass, email: user[0].local.email } } },
                                function (err, status) {
                                    if (err)
                                        throw err;
                                    res.json({ status: 1, msg: "Password has been updated successfully" });
                                });
                        } else {
                            res.json({ status: 0, msg: "Authentication failed" });
                        }
                    });
                }
            } else {
                res.json({ msg: "Authentication failed" });
            }
        }

    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.get('/isActive/:id/:status', function (req, res) {
    var User = require('../models/user');
    if (req.params.id != '' && req.params.id != null) {
        var ID = req.params.id;
        console.log("ID");
        console.log(ID);
    }
    if (req.params.status != '' && req.params.status != null) {
        var status = req.params.status;
        console.log("status");
        console.log(status);
    }
    if (req.session.passport && req.session.passport.type == 2) {
        User.findByIdAndUpdate(ID, {
            $set: {
                activated: status,
            }
        }, function (err, newSub) {
            if (err) {
                throw err
            }
            res.json({ status: 2, msg: "Account isActive status updated", data: newSub });
        });
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.get('/delete/:id', function (req, res) {
    var User = require('../models/user');
    var user = new User();
    var userId = req.params.id;
    User.find({ '_id': userId }, function (err, user) {
        if (err) {
            throw err;
        }
        if (user.length > 0) {
            User.remove({ _id: userId }, function (err, user) {
                if (err)
                    throw err;
                data = { message: 'User deleted' };
                res.json(data);
            });
        } else {
            console.log("User not found");
            data = { message: 'User not found' };
            res.json(data);
        }
    });
    //    }
});
ctrl.get('/getProfileData', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        getCurrentFriends(id, function (friends) {
            getSaperateFollowings(id, friends, function (followings) {
                getSaperateFollowers(id, friends, function (followers) {
                    getSubjects(id, function (subjects) {
                        getColleges(id, function (colleges) {
                            getDegree(id, function (degree) {
                                getSkills(id, function (skills) {
                                    getLoginDetails(id, function (loginDetails) {
                                        getProfileStatus(subjects, function (profilestatus) {
                                            res.json({
                                                status: 2, friendsCount: friends.friendsCount,
                                                followingsCount: followings.followingsCount,
                                                followersCount: followers.followersCount,
                                                loginDetails: loginDetails.data,
                                                friends: friends.data,
                                                followings: followings.data,
                                                followers: followers.data,
                                                subjects: subjects.data,
                                                subject_count: subjects.subject_count,
                                                current_subjects: subjects.current_subjects,
                                                future_subjects: subjects.future_subjects,
                                                past_subjects: subjects.past_subjects,
                                                colleges: colleges.data,
                                                college_count: colleges.college_count,
                                                current_colleges: colleges.current_colleges,
                                                past_colleges: colleges.past_colleges,
                                                future_colleges: colleges.future_colleges,
                                                degree: degree.data,
                                                degree_count: degree.degree_count,
                                                current_degrees: degree.current_degrees,
                                                past_degrees: degree.past_degrees,
                                                future_degrees: degree.future_degrees,
                                                skills: skills.data,
                                                profilestatus: profilestatus
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/dashboard/getProfileData', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        getCurrentFriends(id, function (friends) {
            getSaperateFollowings(id, friends, function (followings) {
                getSaperateFollowers(id, friends, function (followers) {
                    getSubjects(id, function (subjects) {
                        getColleges(id, function (colleges) {
                            getDegree(id, function (degree) {
                                getLoginDetails(id, function (loginDetails) {
                                    res.json({
                                        status: 2,
                                        friendsCount: friends.friendsCount,
                                        followingsCount: followings.followingsCount,
                                        followersCount: followers.followersCount,
                                        loginDetails: loginDetails.data,
                                        friends: friends.data,
                                        followings: followings.data,
                                        followers: followers.data,
                                        subjects: subjects.data,
                                        current_subjects: subjects.current_subjects,
                                        past_subjects: subjects.past_subjects,
                                        just_interested_list: subjects.just_interested_list,
                                        subject_teacher_list: subjects.subject_teacher_list,
                                        subject_experts_list: subjects.subject_experts_list,
                                        colleges: colleges.data,
                                        future_subjects: subjects.future_subjects,
                                        current_colleges: colleges.current_colleges,
                                        past_colleges: colleges.past_colleges,
                                        future_colleges: colleges.future_colleges,
                                        degree: degree.data,
                                        degree_count: degree.degree_count,
                                        current_degrees: degree.current_degrees,
                                        past_degrees: degree.past_degrees,
                                        future_degrees: degree.future_degrees
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});


//to get current past future subjects, colleges and degrees required in app

ctrl.get('/DegColSub', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        getSubjects(id, function (subjects) {
            getColleges(id, function (colleges) {
                getDegree(id, function (degree) {
                    res.json({ status: 2, subjects: subjects.data, current_subjects: subjects.current_subjects, past_subjects: subjects.past_subjects, colleges: colleges.data, current_colleges: colleges.current_colleges, past_colleges: colleges.past_colleges, degree: degree.data, current_degrees: degree.current_degrees, past_degrees: degree.past_degrees, future_degrees: degree.future_degrees });
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});


ctrl.get('/Deg', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        getDegree(id, function (degree) {
            res.json({ status: 2, degree: degree.data, current_degrees: degree.current_degrees, past_degrees: degree.past_degrees, future_degrees: degree.future_degrees });
        });

    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});

ctrl.get('/Col', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;

        getColleges(id, function (colleges) {
            res.json({ status: 2, colleges: colleges.data, current_colleges: colleges.current_colleges, past_colleges: colleges.past_colleges, future_colleges: colleges.future_colleges });
        });

    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});

ctrl.get('/Sub', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        getSubjects(id, function (subjects) {
            res.json({ status: 2, subjects: subjects.data, current_subjects: subjects.current_subjects, past_subjects: subjects.past_subjects, future_subjects: subjects.future_subjects, subject_experts_list: subjects.subject_experts_list, subject_teacher_list: subjects.subject_teacher_list, just_interested_list: subjects.just_interested_list });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});



ctrl.get('/dashboard/getFriends', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        getCurrentFriends(id, function (friends) {
            //            getSaperateFollowings(id, friends, function (followings) {
            //                getSaperateFollowers(id, friends, function (followers) {
            //                    getSubjects(id, function (subjects) {
            //                        getColleges(id, function (colleges) {
            //                            getDegree(id, function (degree) {
            //                                getLoginDetails(id, function (loginDetails) {
            res.json({ status: 2, friendsCount: friends.friendsCount, friends: friends.data });
        });
        //                            });
        //                        });
        //                    });
        //                });
        //            });
        //        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/dashboard/getFollowing', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        getCurrentFriends(id, function (friends) {
            getSaperateFollowings(id, friends, function (followings) {
                //                getSaperateFollowers(id, friends, function (followers) {
                //                    getSubjects(id, function (subjects) {
                //                        getColleges(id, function (colleges) {
                //                            getDegree(id, function (degree) {
                //                                getLoginDetails(id, function (loginDetails) {
                res.json({ status: 2, followingsCount: followings.followingsCount, followings: followings.data });
            });
        });
        //                        });
        //                    });
        //                });
        //            });
        //        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/dashboard/getFollower', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        getCurrentFriends(id, function (friends) {
            //            getSaperateFollowings(id, friends, function (followings) {
            getSaperateFollowers(id, friends, function (followers) {
                //                    getSubjects(id, function (subjects) {
                //                        getColleges(id, function (colleges) {
                //                            getDegree(id, function (degree) {
                //                                getLoginDetails(id, function (loginDetails) {
                res.json({ status: 2, followersCount: followers.followersCount, followers: followers.data });
            });
        });
        //                        });
        //                    });
        //                });
        //            });
        //        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/getUserSkills/:id', function (req, res) {
    if (req.session.passport) {
        var id = req.params.id;
        getSkills(id, function (skills) {
            res.json({ status: 2, skills: skills.data });
        });
    }
});
ctrl.get('/getUserProfileData/:id', function (req, res) {
    if (req.session.passport) {
        var id = req.params.id;
        var logged = req.session.passport.user;
        var is_logged_user = (req.session.passport.user == id) ? true : false
        getSaperateCurrentFriends(id, req, function (friends) {
            getFollowings(id, req, function (followings) {
                getFollowers(id, req, function (followers) {
                    getSubjects(id, function (subjects) {
                        getColleges(id, function (colleges) {
                            getDegree(id, function (degree) {
                                getSkills(id, function (skills) {
                                    getUserDetails(id, function (userDetails) {
                                        getProfileStatus(subjects, function (profilestatus) {
                                            res.json({
                                                status: 2, friendsCount: friends.friendsCount,
                                                future_subjects: subjects.future_subjects,
                                                current_subjects: subjects.current_subjects,
                                                past_subjects: subjects.past_subjects,
                                                just_interested_list: subjects.just_interested_list,
                                                current_colleges: colleges.current_colleges,
                                                past_colleges: colleges.past_colleges,
                                                subject_teacher_list: subjects.subject_teacher_list,
                                                subject_experts_list: subjects.subject_experts_list,
                                                followingsCount: followings.followingsCount,
                                                followersCount: followers.followersCount,
                                                userDetails: userDetails.data,
                                                loginDetails: userDetails.login_details,
                                                friends: friends.data,
                                                current_friends_status_code: friends.current_friends_status_code,
                                                followings: followings.data,
                                                following_friend_status_code: followers.following_friend_status_code,
                                                followers: followers.data,
                                                subjects: subjects.data,
                                                subject_count: subjects.subject_count,
                                                colleges: colleges.data,
                                                degree: degree.data,
                                                is_logged_user: is_logged_user,
                                                skills: skills.data,
                                                ui: logged,
                                                profilestatus: profilestatus,
                                                current_degrees: degree.current_degrees,
                                                past_degrees: degree.past_degrees,
                                                future_colleges: colleges.future_colleges,
                                                future_degrees: degree.future_degrees
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/getUserProfileData/getFollowings/:id', function (req, res) {
    if (req.session.passport) {
        var id = req.params.id;
        console.log("getFollowings");
        console.log(id);
        getSaperateCurrentFriends(id, req, function (friends) {
            getFollowings(id, req, function (followings) {
                //                getFollowers(id, req, function (followers) {
                //                    getSubjects(id, function (subjects) {
                //                        getColleges(id, function (colleges) {
                //                            getDegree(id, function (degree) {
                //                                getUserDetails(id, function (userDetails) {
                res.json({ status: 2, friendsCount: friends.friendsCount, followingsCount: followings.followingsCount, friends: friends.data, current_friends_status_code: friends.current_friends_status_code, followings: followings.data });
                //                                });
                //                            });
                //                        });
                //                    });
                //                });
            });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/getUserProfileData/getFollowers/:id', function (req, res) {
    if (req.session.passport) {
        var id = req.params.id;
        console.log("getFollowers");
        console.log(id);
        getSaperateCurrentFriends(id, req, function (friends) {
            //            getFollowings(id, req, function (followings) {
            getFollowers(id, req, function (followers) {
                //                    getSubjects(id, function (subjects) {
                //                        getColleges(id, function (colleges) {
                //                            getDegree(id, function (degree) {
                //                                getUserDetails(id, function (userDetails) {
                res.json({ status: 2, friendsCount: friends.friendsCount, followersCount: followers.followersCount, friends: friends.data, current_friends_status_code: friends.current_friends_status_code, following_friend_status_code: followers.following_friend_status_code, followers: followers.data });
                //                                });
                //                            });
                //                        });
                //                    });
                //                });
            });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});
ctrl.get('/getUserProfileData/getFriends/:id', function (req, res) {
    if (req.session.passport) {
        var id = req.params.id;
        console.log("getFollowers");
        console.log(id);
        getSaperateCurrentFriends(id, req, function (friends) {
            //            getFollowings(id, req, function (followings) {
            //            getFollowers(id, req, function (followers) {
            //                    getSubjects(id, function (subjects) {
            //                        getColleges(id, function (colleges) {
            //                            getDegree(id, function (degree) {
            //                                getUserDetails(id, function (userDetails) {
            res.json({ status: 2, friendsCount: friends.friendsCount, friends: friends.data, current_friends_status_code: friends.current_friends_status_code });
            //                res.json({status: 2, friendsCount: friends.friendsCount, followersCount: followers.followersCount, friends: friends.data, current_friends_status_code: friends.current_friends_status_code, following_friend_status_code: followers.following_friend_status_code, followers: followers.data});
            //                                });
            //                            });
            //                        });
            //                    });
            //                });
            //            });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});

function getFollowers(id, req, callback) {
    var User = require('../models/user');
    var followers = [];
    var follower_name;
    var follower_id;
    var photo;
    var following_friend_status_code = 6;
    var user_id = req.session.passport.user;
    User.findOne({ "_id": id })
        .select("followers")
        .populate({ path: 'followers.follower_id', select: 'fname lname photo _id' })
        .exec(function (err, user) {
            if (err)
                return handleError(err);
            if (user) {
                for (var i in user.followers) {
                    if (user.followers[i].follower_id) {
                        follower_id = user.followers[i].follower_id._id;
                        if (follower_id == user_id) {
                            following_friend_status_code = 3;
                        }
                        follower_name = user.followers[i].follower_id.fname + " " + user.followers[i].follower_id.lname;
                        photo = user.followers[i].follower_id.photo;
                        followers.push({ name: follower_name, follower_id: follower_id, photo: photo });
                    }
                }
            }
            callback({ data: followers, followersCount: followers.length, following_friend_status_code: following_friend_status_code });
        });
}



function getSaperateFollowers(id, friends, callback) {
    var User = require('../models/user');
    var followers = [];
    //    var follower_friends = [];
    var follower_name;
    var follower_id;
    //    var follower_friends_id;
    var follower_friends_status;
    var photo;
    User.findOne({ "_id": id })
        .select("followers")
        .populate({ path: 'followers.follower_id', select: 'fname lname photo _id' })
        .exec(function (err, user) {
            if (err)
                return handleError(err);
            if (user) {
                if (friends.data.length == 0) {
                    for (var i in user.followers) {

                        if (typeof (user.followers[i].follower_id) != 'undefined') {

                            follower_id = user.followers[i].follower_id._id;
                            follower_name = user.followers[i].follower_id.fname + " " + user.followers[i].follower_id.lname;
                            photo = user.followers[i].follower_id.photo;
                            followers.push({ name: follower_name, follower_id: follower_id, photo: photo });

                        }

                    }
                } else {
                    for (var j in friends.data) {
                        for (var k in user.followers) {

                            if (typeof (user.followers[k].follower_id) != 'undefined') {
                                var followerId = null;
                                if (user.followers[k].follower_id) {
                                    followerId = user.followers[k].follower_id._id;
                                }
                                if (friends.data[j].friend_id == followerId) {
                                    var count = 0;
                                    follower_id = followerId;
                                    follower_name = user.followers[k].follower_id.fname + " " + user.followers[k].follower_id.lname;
                                    follower_friends_status = 1;
                                    photo = user.followers[k].follower_id.photo;
                                    for (var l in followers) {
                                        if (followers[l].follower_id == followerId) {
                                            followers[l].follower_friends_status = 1;
                                            count = 3;
                                        }
                                    }

                                    if (count != 3) {
                                        followers.push({ name: follower_name, follower_id: follower_id, photo: photo, follower_friends_status: follower_friends_status });
                                        count = 0;
                                    }
                                } else {
                                    var counter = 0;
                                    follower_id = followerId;
                                    follower_name = user.followers[k].follower_id.fname + " " + user.followers[k].follower_id.lname;
                                    follower_friends_status = 2;
                                    photo = user.followers[k].follower_id.photo;
                                    if (typeof followers != 'undefined' && followers.length > 0) {
                                        for (var l in followers) {
                                            if (followers[l].follower_id == followerId) {
                                                counter = 1;
                                            }
                                        }
                                    }

                                    if (followers.length == 0) {
                                        followers.push({ name: follower_name, follower_id: follower_id, photo: photo, follower_friends_status: follower_friends_status });
                                    } else if (counter != 1) {
                                        followers.push({ name: follower_name, follower_id: follower_id, photo: photo, follower_friends_status: follower_friends_status });
                                        counter = 0;
                                    }
                                }

                            }

                        }
                    }
                }


            }
            callback({ data: followers, followersCount: followers.length });
        });
}

function getFollowings(id, req, callback) {
    var User = require('../models/user');
    var followings = [];
    var following_name;
    var following_id;
    var photo;
    var following_friend_status_code = 6;
    var user_id = req.session.passport.user;
    User.findOne({ "_id": id })
        .select("following")
        .populate({ path: 'following.following_id', select: 'fname lname photo _id' })
        .exec(function (err, user) {
            if (err)
                return handleError(err);
            if (user) {
                for (var i in user.following) {
                    if (user.following[i].following_id) {
                        following_id = user.following[i].following_id._id;
                        following_name = user.following[i].following_id.fname + " " + user.following[i].following_id.lname;
                        photo = user.following[i].following_id.photo;
                        followings.push({ name: following_name, following_id: following_id, photo: photo });
                    }
                }
            }
            callback({ data: followings, followingsCount: followings.length });
        });
}




function getSaperateFollowings(id, friends, callback) {
    var User = require('../models/user');
    var followings = [];
    var following_friend_status;
    var following_name;
    var following_id;
    var photo;
    User.findOne({ "_id": id })
        .select("following")
        .populate({ path: 'following.following_id', select: 'fname lname photo _id' })
        .exec(function (err, user) {
            if (err)
                return handleError(err);
            if (user) {

                if (friends.data.length == 0) {
                    for (var i in user.following) {
                        if (typeof (user.following[i].following_id) != 'undefined') {
                            following_id = user.following[i].following_id._id;
                            following_name = user.following[i].following_id.fname + " " + user.following[i].following_id.lname;
                            photo = user.following[i].following_id.photo;
                            followings.push({ name: following_name, following_id: following_id, photo: photo });
                        }
                    }
                } else {
                    for (var j in friends.data) {
                        for (var k in user.following) {


                            if (typeof (user.following[k].following_id) != 'undefined') {

                                if (friends.data[j].friend_id == user.following[k].following_id._id) {
                                    var count = 0;
                                    following_id = user.following[k].following_id._id;
                                    following_friend_status = 1;
                                    following_name = user.following[k].following_id.fname + " " + user.following[k].following_id.lname;
                                    photo = user.following[k].following_id.photo;
                                    for (var l in followings) {
                                        //                                        if (followings[l].follower_id == following_id) {
                                        //                                            followings[l].follower_friends_status = 1;
                                        if (followings[l].following_id == following_id) {
                                            followings[l].following_friend_status = 1;
                                            count = 3;
                                        }
                                    }

                                    if (count != 3) {
                                        followings.push({ name: following_name, following_id: following_id, photo: photo, following_friend_status: following_friend_status });
                                        count = 0;
                                    }
                                } else {
                                    var counter = 0;
                                    following_id = user.following[k].following_id._id;
                                    following_friend_status = 2;
                                    following_name = user.following[k].following_id.fname + " " + user.following[k].following_id.lname;
                                    photo = user.following[k].following_id.photo;
                                    if (typeof followings != 'undefined' && followings.length > 0) {
                                        for (var l in followings) {
                                            if (followings[l].following_id == user.following[k].following_id._id) {
                                                counter = 1;
                                            }
                                        }
                                    }

                                    if (followings.length == 0) {
                                        followings.push({ name: following_name, following_id: following_id, photo: photo, following_friend_status: following_friend_status });
                                    } else if (counter != 1) {

                                        followings.push({ name: following_name, following_id: following_id, photo: photo, following_friend_status: following_friend_status });
                                        counter = 0;
                                    }
                                }

                            }

                        }
                    }
                }
            }
            callback({ data: followings, followingsCount: followings.length });
        });
}


function getCurrentFriends(id, callback) {
    var User = require('../models/user');
    var friends = [];
    var friend_name;
    var friend_id;
    var photo;
    User.findOne({ '_id': id, 'friends.status': 3 })
        .select('friends')
        .populate({ path: 'friends.friend_id', select: 'fname lname photo city _id' })
        .exec(function (err, user) {
            if (err)
                throw err;
            if (user) {
                for (var i in user.friends) {
                    if (user.friends[i].friend_id && user.friends[i].status === 3) {
                        friend_id = user.friends[i].friend_id._id;
                        friend_name = user.friends[i].friend_id.fname + " " + user.friends[i].friend_id.lname;
                        photo = user.friends[i].friend_id.photo;
                        friends.push({ name: friend_name, friend_id: friend_id, photo: photo });
                    }
                }
            }
            callback({ data: friends, friendsCount: friends.length });
        });
}





function getSaperateCurrentFriends(id, req, callback) {

    var User = require('../models/user');
    var friends = [];
    var search_user_id = id;
    console.log("search_user_id+++++++++++++++++++++:" + search_user_id);
    var friend_name;
    var friend_id;
    var photo;
    var current_friends_status_code = 6;
    var userId = req.session.passport.user;
    console.log("userId++++++++++++++:" + userId);
    User.findOne({ '_id': search_user_id, 'friends.status': 3 })
        .select('friends')
        .populate({ path: 'friends.friend_id', select: 'fname lname photo city _id' })
        .exec(function (err, user) {
            if (err)
                throw err;
            if (user) {
                console.log("user+++++++++++++++++=:" + user);
                for (var i in user.friends) {

                    if (user.friends[i].friend_id && user.friends[i].status === 3) {
                        friend_id = user.friends[i].friend_id._id;
                        friend_name = user.friends[i].friend_id.fname + " " + user.friends[i].friend_id.lname;
                        photo = user.friends[i].friend_id.photo;
                        friends.push({ name: friend_name, friend_id: friend_id, photo: photo });
                    }



                }

            }
            User.findOne({ '_id': userId })
                .select('friends')
                .populate({ path: 'friends.friend_id', select: 'fname lname photo city _id' })
                .exec(function (err, user1) {
                    if (err)
                        throw err;
                    if (user1) {
                        console.log("user1+++++++++++++++++=:" + user1.friends);
                        for (var i in user1.friends) {
                            console.log("user1+++++++++++++++++=:" + user1.friends[i]);
                            if (user1.friends[i].friend_id != null && user1.friends[i].friend_id != '' && user1.friends[i].friend_id._id == search_user_id) {
                                current_friends_status_code = user1.friends[i].status;
                            }

                        }
                    }
                    callback({ data: friends, friendsCount: friends.length, current_friends_status_code: current_friends_status_code });
                });
        });
}

function getSubjects(id, callback) {
    var User = require('../models/user');
    var subjects = [];
    var name;
    var subject_id;
    var past_members;
    var current_members;
    var from_date;
    var to_date;
    var icon;
    var subjects_user_type;
    var subject_count;
    var posts = [];
    User.findOne({ '_id': id })
        .select('subjects')
        .populate({
            path: 'subjects.subject_id',
            model: 'Subject',
            select: 'name type post',
            populate: {
                path: 'post.post_id',
                model: 'Post',
                select: 'created_on',

            }
        })
        .exec(function (err, user) {
            if (err)
                throw err;
            if (user) {
                subject_count = user.subjects.length;
                user.subjects = sortSubjectAndGetCounter(user.subjects);
                // for (var i in user.subjects)
                for (var i = 0; i < subject_count; i++) {
                    if (user.subjects[i].subject_id) {
                        subject_id = user.subjects[i].subject_id._id;
                        name = user.subjects[i].subject_id.name;
                        past_members = user.subjects[i].subject_id.past_members;
                        current_members = user.subjects[i].subject_id.current_members;
                        subjects_user_type = user.subjects[i].subjects_user_type;
                        posts = user.subjects[i].subject_id.post;
                    }
                    from_date = user.subjects[i].from;
                    to_date = user.subjects[i].to;
                    icon = user.subjects[i].icon;
                    var lastVisit = user.subjects[i].last_visit;
                    subjects.push({ name: name, subject_id: subject_id, subjects_user_type: subjects_user_type, from_date: from_date, to_date: to_date, photo: icon, past_members: past_members, current_members: current_members, post: posts, last_visit: lastVisit });
                }
            }

            var current_subjects = [];
            var future_subjects = [];
            var past_subjects = [];
            var subject_experts_list = [];
            var subject_teacher_list = [];
            var just_interested_list = [];
            var currentDate = new Date().getTime();
            for (var i in subjects) {
                if (subjects[i].from_date && subjects[i].to_date) {
                    var startDate = new Date(subjects[i].from_date).getTime();
                    var endDate = new Date(subjects[i].to_date).getTime();
                    if (currentDate >= startDate && currentDate <= endDate) {
                        current_subjects.push(subjects[i]);
                    } else if (currentDate > endDate) {
                        past_subjects.push(subjects[i]);
                    } else if (currentDate < startDate) {
                        future_subjects.push(subjects[i]);
                    }
                } else {
                    if (subjects[i].subjects_user_type == 3) {
                        subject_experts_list.push(subjects[i]);
                    } else if (subjects[i].subjects_user_type == 4) {
                        subject_teacher_list.push(subjects[i]);
                    } else if (subjects[i].subjects_user_type == 5) {
                        just_interested_list.push(subjects[i]);
                    }
                }
            }
            callback({ data: subjects, subject_count: subject_count, current_subjects: current_subjects, future_subjects: future_subjects, past_subjects: past_subjects, subject_experts_list: subject_experts_list, subject_teacher_list: subject_teacher_list, just_interested_list: just_interested_list });
        });
}

function getColleges(id, callback) {
    var User = require('../models/user');
    var colleges = [];
    var name;
    var college_id;
    var url;
    var subjects;
    var country_id;
    var past_members;
    var current_members;
    var from_date;
    var to_date;
    var icon;
    var college_count;
    var posts = [];
    User.findOne({ '_id': id })
        .select('college')
        .populate({
            path: 'college.college_id',
            model: 'College',
            select: 'name type post',
            populate: {
                path: 'post.post_id',
                model: 'Post',
                select: 'created_on',
            }
        })
        .exec(function (err, user) {
            if (err)
                throw err;
            if (user) {
                college_count = user.college.length;
                user.college = sortCollegeAndGetCounter(user.college);
                for (var i in user.college) {
                    if (user.college[i].college_id) {
                        college_id = user.college[i].college_id._id;
                        name = user.college[i].college_id.name;
                        url = user.college[i].college_id.url;
                        subjects = user.college[i].college_id.subjects;
                        country_id = user.college[i].college_id.country_id;
                        past_members = user.college[i].college_id.past_members;
                        current_members = user.college[i].college_id.current_members;
                        posts = user.college[i].college_id.post;
                    }
                    from_date = user.college[i].from;
                    to_date = user.college[i].to;
                    icon = user.college[i].icon;
                    var lastVisit = user.college[i].last_visit
                    colleges.push({ college_id: college_id, name: name, from_date: from_date, to_date: to_date, photo: icon, url: url, country_id: country_id, subjects: subjects, past_members: past_members, current_members: current_members, last_visit: lastVisit, post: posts });
                }


            }

            var current_colleges = [];
            var future_colleges = [];
            var past_colleges = [];
            var currentDate = new Date();
            for (var i in colleges) {

                if (currentDate >= colleges[i].from_date && currentDate <= colleges[i].to_date) {
                    current_colleges.push(colleges[i]);
                } else if (currentDate > colleges[i].to_date) {
                    past_colleges.push(colleges[i]);
                } else if (currentDate < colleges[i].from_date) {
                    future_colleges.push(colleges[i]);
                }

            }
            callback({ data: colleges, college_count: college_count, current_colleges: current_colleges, future_colleges: future_colleges, past_colleges: past_colleges });
        });
}

function getSkills(id, callback) {
    var Userskills = require('../models/userskills');
    Userskills.find({ user_id: id })
        .select('_id skill_id user_id endorse')
        .populate({ path: 'endorse.user_id', select: 'fname photo _id' })
        .populate({ path: 'skill_id', select: 'title _id' })
        .exec(function (err, skill) {
            callback({ data: skill })
        });
}

function getDegree(id, callback) {
    var degree = [];
    var degree_id;
    var name;
    var posts = [];
    var from_date;
    var to_date;
    var degree_count;
    var icon;
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('degree')
        .populate({
            path: 'degree.degree_id',
            model: 'Degree',
            select: 'name type post',
            populate: {
                path: 'post.post_id',
                model: 'Post',
                select: 'created_on',
            }
        })
        .exec(function (err, user) {
            if (err)
                throw err;
            if (user) {
                degree_count = user.degree.length;
                user.degree = sortDegreeAndGetCounter(user.degree);
                for (var i = 0; i < degree_count; i++) {
                    if (user.degree[i].degree_id) {
                        degree_id = user.degree[i].degree_id._id;
                        name = user.degree[i].degree_id.name;
                        posts = user.degree[i].degree_id.post;
                    }
                    from_date = user.degree[i].from;
                    to_date = user.degree[i].to;
                    icon = user.degree[i].icon;
                    var lastVisit = user.degree[i].last_visit
                    degree.push({ degree_id: degree_id, name: name, from_date: from_date, to_date: to_date, photo: icon, post: posts, last_visit: lastVisit });
                }
                var current_degrees = [];
                var future_degrees = [];
                var past_degrees = [];
                var currentDate = new Date();
                for (var i in degree) {
                    if (currentDate >= degree[i].from_date && currentDate <= degree[i].to_date) {
                        current_degrees.push(degree[i]);
                    } else if (currentDate > degree[i].to_date) {
                        past_degrees.push(degree[i]);
                    } else if (currentDate < degree[i].from_date) {
                        future_degrees.push(degree[i]);
                    }
                }
            }
            callback({ data: degree, degree_count: degree_count, current_degrees: current_degrees, past_degrees: past_degrees, future_degrees: future_degrees })
        });
}

function getLoginDetails(id, callback) {
    var lastLogin;
    var totalLogin;
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('login_details')
        .exec(function (err, user) {
            if (err)
                throw err;
            if (user) {
                lastLogin = user.login_details.last_login;
                totalLogin = user.login_details.total_login;
            }
            callback({ data: { lastLogin: lastLogin, totalLogin: totalLogin } })
        });
}

function getProfileStatus(subjects, callback) {

    console.log("***********************************", subjects);
    var data = subjects.data;
    var profilestatus = [];
    var flag = 0;
    var currentDate = new Date().getTime();
    for (var i in data) {
        if (data[i].from_date && data[i].to_date) {
            var fromDate = new Date(data[i].from_date).getTime();
            var toDate = new Date(data[i].to_date).getTime();
            if (fromDate <= currentDate && currentDate <= toDate) {
                profilestatus.push(data[i]);
            }
        }
        // if (data[att1].subjects_user_type == 1) {
        //     profilestatus.data = data[att1];
        //     profilestatus.title = "Currently Taking " + data[att1].name;
        //     flag = 1;
        // }
        // if (data[att1].subjects_user_type == 2 && flag == 0) {
        //     profilestatus.data = data[att1];
        //     profilestatus.title = "Future Student of " + data[att1].name;
        //     flag = 2;
        // }
        // if (data[att1].subjects_user_type == 4 && flag == 0) {
        //     profilestatus.data = data[att1];
        //     profilestatus.title = data[att1].name + " Teacher";
        //     flag = 4;
        // }
        // if (data[att1].subjects_user_type == 3 && flag == 0) {
        //     profilestatus.data = data[att1];
        //     profilestatus.title = data[att1].name + " Expert";
        //     flag = 3;
        // }
        // if (data[att1].subjects_user_type == 5 && flag == 0) {
        //     profilestatus.data = data[att1];
        //     profilestatus.title = "Just Interested in " + data[att1].name;
        //     flag = 5;
        // }
        // if (data[att1].subjects_user_type == 6 && flag == 0) {
        //     profilestatus.data = data[att1];
        //     profilestatus.title = "Past Student of " + data[att1].name;
        //     flag = 6;
        // }

    }
    callback(profilestatus);
}

function getUserDetails(id, callback) {
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('lname fname gender photo dob city state zip login_details social_link')
        .exec(function (err, user) {
            if (err)
                throw err;
            callback({ data: user, login_details: user.login_details });
        });
}

ctrl.post('/sendgoogleinvite/:type/:id', function (req, res, next) {
    var emails = req.body.email_check;
    if (emails) {
        var email_type = typeof emails;
        var email = '';
        if (email_type == 'string') {
            email += emails + ",";
        } else {
            for (var i = 0; i < emails.length; i++) {
                email += emails[i] + ",";
            }
        }
        email = email.substr(0, (email.length - 1));
        console.log(email);
    }

    getInvitTitle(req.params.type, req.params.id, function (inviteTitle) {
        getUserDetail(req.session.passport.user, function (userDetails) {
            var name = userDetails.fname + ' ' + (userDetails.lname ? userDetails.lname : '');
            var fullUrl = "http://dev.stribein.com";
            if (req.params.type == 'Subject') {
                link = fullUrl + '/api/groupInvite/' + req.params.id + '/1';
            } else if (req.params.type == 'College') {
                link = fullUrl + '/api/groupInvite/' + req.params.id + '/2';
            } else if (req.params.type == 'Degree') {
                link = fullUrl + '/api/groupInvite/' + req.params.id + '/3';
            } else if (req.params.type == 'Group') {
                link = fullUrl + '/api/groupInvite/-1/-1';
            } else {
                link = fullUrl;
            }
            locals = {
                email: email,
                from: 'invite@stribein.com',
                logo: fullUrl + '/public/files/logo/StribeIN-logo.png', //fullUrl + '/theme/assets/images/logo/logo-white.png',
                subject: 'StribeIN – ' + name + ' invites you to join & connect.',
                name: name,
                title: name + inviteTitle.title,
                link: link,
                siteLink: fullUrl,
            };
            next();
            res.redirect('/google_invite_success');
        });
    });

}, function (req, res) {
    mailer.sendOne('invite_friends_email', locals, function (err, responseStatus, html, text) { });
});
function getInvitTitle(wallType, wallId, callback) {
    var Subject = require('../models/subject');
    var Degree = require('../models/college');
    var College = require('../models/degree');
    var Group = require('../models/group');
    if (wallType == 'Subject') {
        Subject.findOne({ _id: wallId })
            .select('name')
            .exec(function (err, data) {
                if (err)
                    throw err;
                callback({ title: ' has invited you to Join the Subject ' + data.name + '.' });
            });
    } else if (wallType == 'College') {
        College.findOne({ _id: wallId })
            .select('name')
            .exec(function (err, data) {
                if (err)
                    throw err;
                callback({ title: ' has invited you to Join the College ' + data.name + '.' });
            });
    } else if (wallType == 'Degree') {
        Degree.findOne({ _id: wallId })
            .select('name')
            .exec(function (err, data) {
                if (err)
                    throw err;
                callback({ title: ' has invited you to Join the Degree ' + data.name + '.' });
            });
    } else if (wallType == 'Group') {
        Group.findOne({ '_id': wallId })
            .populate({ path: 'subject_id college_id degree_id', select: 'name' })
            .exec(function (err, data) {
                if (err)
                    throw err;
                callback({ title: ' has invited you to Join the Group ' + data.title + ' under ' + (data.subject_id ? data.subject_id.name : data.college_id ? data.college_id.name : data.degree_id.name) });
            })
    } else {
        callback({ title: ' invites you to join StribeIN.com. A networking platform for students to connect, make friends & learn from each other.' });
    }
}

ctrl.post('/inviteByEmail', function (req, res, next) {
    var email = req.body.email;
    var title = req.body.title;
    var wallId = req.body.wallId;
    var wallType = req.body.wallType;
    var link;
    if (req.session.passport) {
        var fullUrl = "http://dev.stribein.com";
        if (wallType == 'Subject') {
            link = fullUrl + '/api/groupInvite/' + wallId + '/1';
        } else if (wallType == 'College') {
            link = fullUrl + '/api/groupInvite/' + wallId + '/2';
        } else if (wallType == 'Degree') {
            link = fullUrl + '/api/groupInvite/' + wallId + '/3';
        } else {
            link = fullUrl;
        }
        getUserDetail(req.session.passport.user, function (userDetails) {
            var name = userDetails.fname + ' ' + (userDetails.lname ? userDetails.lname : '');
            locals = {
                email: email,
                from: 'invite@stribein.com',
                logo: fullUrl + '/public/files/logo/StribeIN-logo.png', //fullUrl + '/theme/assets/images/logo/logo-white.png',
                subject: 'StribeIN – ' + name + ' invites you to join & connect.',
                title: title,
                link: link,
                siteLink: fullUrl,
            };
            res.json({ status: 2, msg: 'Invite send successfully.' });
            next();
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
}, function (req, res) {
    mailer.sendOne('invite_friends_email', locals, function (err, responseStatus, html, text) { });
});

ctrl.post('/postSocialLink', function (req, res) {
    var User = require('../models/user');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var social_link = req.body;
        console.log(social_link);
        User.findByIdAndUpdate(userId, {
            $set: {
                social_link: social_link
            }
        }, function (err, user) {
            if (err) {
                throw err;
            }
            User.findOne({ _id: user._id })
                .select('social_link')
                .exec(function (err, user) {
                    if (err)
                        throw err;
                    return res.json({ status: 2, message: 'links updated successfully!', data: user.social_link });
                });
        });
    }
});
ctrl.get('/getSocialLink', function (req, res) {
    var User = require('../models/user');
    var userId = req.session.passport.user;
    User.findOne({ _id: userId })
        .select('social_link')
        .exec(function (err, user) {
            if (err)
                throw err;
            res.json({ status: 2, data: user.social_link });
        });
});
ctrl.get('/removeProfileImage', function (req, res) {
    var User = require('../models/user');
    var userId = req.session.passport.user;
    User.find({ '_id': userId }, function (err, user) {
        if (err) {
            throw err;
        }
        if (user.length > 0) {
            User.update({ _id: userId }, { $set: { photo: null } }, function (err, user) {
                if (err)
                    throw err;
                getFriendsEmailIds(userId, function (data) {
                    var dataForUpdate = { recepients: data.ids, from: userId, field: 'photo', value: '' };
                    var clManager = req.app.get('wsClient');
                    clManager.changeNameOrPhoto(dataForUpdate);
                    res.json({ data: user });
                });
            });
        } else {
            console.log("User not found");
            data = { message: 'User not found' };
            res.json(data);
        }
    });
});
ctrl.post('/addProfilePicture/:user_id', function (req, res) {
    var User = require('../models/user');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        User.find({ '_id': userId }, function (err, user) {
            if (err)
                throw err;
            if (user.length > 0) {
                upload(req, res, function (err) {
                    if (err)
                        throw err;
                    var ext = req.file.originalname.split('.').pop();
                    filename = userId + '.' + ext;
                    var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/ProfilePicture/");
                    fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        var im = require('imagemagick');
                        im.identify(['-format', '%wx%h', uploadpath + '/' + filename], function (err, output) {
                            if (err)
                                throw err;
                            console.log('dimension: ' + output);
                            var str = output.substr(0, output.indexOf('x'));
                            console.log('str+++++++++++++++++++' + str);
                            im.resize({
                                srcPath: uploadpath + '/' + filename,
                                dstPath: uploadpath + '/' + filename,
                                width: 256,
                                height: 256
                            }, function (err, stdout, stderr) {
                                if (err)
                                    throw err;
                                User.findByIdAndUpdate(userId, {
                                    photo: filename,
                                },
                                    function (err, updated) {
                                        if (err)
                                            throw err;
                                        User.find({ '_id': userId }, function (err, user1) {
                                            if (err)
                                                throw err;
                                            getFriendsEmailIds(userId, function (data) {
                                                var dataForUpdate = { recepients: data.ids, from: userId, field: 'photo', value: filename };
                                                var clManager = req.app.get('wsClient');
                                                clManager.changeNameOrPhoto(dataForUpdate);
                                                res.json({ status: 2, msg: "File Uploaded Successfully", data: user1[0].photo });
                                            })
                                        });
                                    }
                                );
                            });
                        });

                    });
                });
            } else {
                data = { message: 'USER ID not found' };
                res.json(data);
            }
        });
    } else {
        console.log("User not found");
        data = { message: 'user not found' };
        res.json(data);
    }

});

function getFriendStatus(userId, friendId, callback) {
    var User = require('../models/user');
    User.findOne({ '_id': userId })
        .select('friends')
        .exec(function (err, user) {
            if (err)
                throw err;
            var status;
            for (var i = 0; i < user.friends.length; i++) {
                if (user.friends[i].friend_id == friendId) {
                    status = user.friends[i].status;
                    break;
                }
            }
            return callback({ status: status });
        })
}
ctrl.get('/getFriendStatus/:friend', function (req, res) {
    userId = req.session.passport.user;
    friendId = req.params.friend;
    getFriendStatus(userId, friendId, function (friend) {
        res.json({ status: friend.status });
    })
})

function getFriendsEmailIds(id, calback) {
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('friends.friend_id')
        .populate({ path: 'friends.friend_id', select: 'local.email' })
        .exec(function (err, user) {
            if (err) {
                throw err;
            }
            var emailIds = [];
            var ids = [];
            var emailIdsString;
            if (user) {
                for (var i in user.friends) {
                    if (user.friends[i].friend_id) {
                        emailIds.push(user.friends[i].friend_id.local.email);
                        ids.push(user.friends[i].friend_id._id);
                    }
                }
                emailIdsString = emailIds.toString();
                calback({ emails: emailIdsString, ids: ids });
            } else {
                calback();
            }
        });
}


function getFriendsIdsStatus(id, calback) {
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('friends.friend_id')
        .populate({ path: 'friends.friend_id', select: 'local.email' })
        .exec(function (err, user) {
            if (err) {
                throw err;
            }
            var friends = [];
            var emailIdsString;
            if (user) {
                for (var i in user.friends) {
                    if (user.friends[i].friend_id)
                        friends.push({ id: user.friends[i].friend_id._id, status: user.friends[i].status });
                }
                calback({ friends: friends });
            } else {
                calback();
            }
        });
}

// ************************* Global Search api*****************************//

ctrl.post('/memberSearch', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        getMemberSearchlist(userId, req.body.name, function (data) {
            res.json({ status: 2, msg: "Search complete!", data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not LoggedIn' });
    }
});
ctrl.post('/search', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        getMemberSearchlist(userId, req.body.name, function (member) {
            getSubjectSearchlist(userId, req.body.name, function (subjects) {
                getCollegeSearchlist(userId, req.body.name, function (colleges) {
                    getDegreeSearchlist(userId, req.body.name, function (degrees) {
                        getGroupSearchlist(userId, req.body.name, function (groups) {
                            getEventSearchlist(userId, req.body.name, function (events) {
                                res.json({ status: 2, msg: "Search complete!", members: member, subjects: subjects, colleges: colleges, degrees: degrees, groups: groups, events: events });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not LoggedIn' });
    }
});

ctrl.post('/getAllSearchedMember/:counter', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var search_name = req.body.name;
        var sort = { 'fname': -1 };
        var limit = 20;
        var skip = limit * counter;
        getfriendIdslist(userId, function (userFriends) {
            User.find({ $and: [{ "fname": new RegExp(search_name, "i") }, { '_id': { $nin: userFriends.blocked } }, { '_id': { $nin: userFriends.blocked_me } }, { '_id': { $nin: [userId] } }] })
                .select('_id fname lname photo')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function (err, searchedData) {
                    res.json({ status: 2, msg: 'Search complete!', searchedMember: searchedData });
                });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/getAllSearchedSubject/:counter', function (req, res) {
    var Subject = require('../models/subject');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var search_name = req.body.name;
        var sort = { 'name': -1 };
        var limit = 20;
        var skip = limit * counter;
        Subject.find({ "name": new RegExp(search_name, "i") })
            .select('_id name')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function (err, searchedData) {
                res.json({ status: 2, msg: 'Search complete!', searchedSubjects: searchedData });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/getAllSearchedCollege/:counter', function (req, res) {
    var College = require('../models/college');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var search_name = req.body.name;
        var sort = { 'name': -1 };
        var limit = 20;
        var skip = limit * counter;
        College.find({ "name": new RegExp(search_name, "i") })
            .select('_id name')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function (err, searchedData) {
                res.json({ status: 2, msg: 'Search complete!', searchedCollege: searchedData });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/getAllSearchedDegree/:counter', function (req, res) {
    var Degree = require('../models/degree');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var search_name = req.body.name;
        var sort = { 'name': -1 };
        var limit = 20;
        var skip = limit * counter;
        Degree.find({ "name": new RegExp(search_name, "i") })
            .select('_id name')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function (err, searchedData) {
                res.json({ status: 2, msg: 'Search complete!', searchedDegree: searchedData });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/getAllSearchedGroups/:counter', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var search_name = req.body.name;
        var sort = { 'title': -1 };
        var limit = 20;
        var skip = limit * counter;
        Group.find({ "title": new RegExp(search_name, "i") })
            .select('_id title icon')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function (err, searchedData) {
                res.json({ status: 2, msg: 'Search complete!', searchedGroup: searchedData });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/getAllSearchedEvents/:counter', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var search_name = req.body.name;
        var sort = { 'title': -1 };
        var limit = 20;
        var skip = limit * counter;
        Groupevents.find({ "title": new RegExp(search_name, "i") })
            .select('_id title icon')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function (err, searchedData) {
                res.json({ status: 2, msg: 'Search complete!', searchedEvent: searchedData });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getMemberSearchlist(loggedId, search_name, callback) {
    var User = require('../models/user');
    var searchData = [];
    getfriendIdslist(loggedId, function (data) {
        loggedId = parseInt(loggedId);
        User.find({ $and: [{ "fname": new RegExp(search_name, "i") }, { '_id': { $nin: data.blocked } }, { '_id': { $nin: data.blocked_me } }, { '_id': { $nin: data.current } }, { '_id': { $nin: [loggedId] } }] })
            .select('_id fname lname photo')
            .limit(3)
            .exec(function (err, nonFriends) {
                if (err) {
                    throw err;
                }
                User.find({ $and: [{ "fname": new RegExp(search_name, "i") }, { '_id': { $in: data.current } }, { '_id': { $nin: [loggedId] } }] })
                    .select('_id fname lname photo')
                    .limit(3)
                    .exec(function (err, friends) {
                        if (err) {
                            throw err;
                        }
                        getTopThreeData(friends, nonFriends, function (data) {
                            callback(data);
                        });
                    });

            });
    });

}

function getSubjectSearchlist(loggedId, search_name, callback) {
    var Subject = require('../models/subject');
    getSubjectsCollegeDegreeId(loggedId, function (data) {
        loggedId = parseInt(loggedId);
        Subject.find({ $and: [{ "name": new RegExp(search_name, "i") }, { '_id': { $nin: data.subject } }] })
            .select('name icon members post _id')
            .limit(3)
            .exec(function (err, nonUserSubjects) {
                if (err) {
                    throw err;
                }
                Subject.find({ $and: [{ "name": new RegExp(search_name, "i") }, { '_id': { $in: data.subject } }] })
                    .select('name icon members post _id')
                    .limit(3)
                    .exec(function (err, userSubjects) {
                        if (err) {
                            throw err;
                        }
                        getTopThreeData(userSubjects, nonUserSubjects, function (data) {
                            callback(data);
                        });
                    });
            });
    });

}

function getCollegeSearchlist(loggedId, search_name, callback) {
    var College = require('../models/college');
    getSubjectsCollegeDegreeId(loggedId, function (data) {
        loggedId = parseInt(loggedId);
        College.find({ $and: [{ "name": new RegExp(search_name, "i") }, { '_id': { $nin: data.college } }] })
            .select('name icon members post _id')
            .limit(3)
            .exec(function (err, nonUserColleges) {
                if (err) {
                    throw err;
                }
                College.find({ $and: [{ "name": new RegExp(search_name, "i") }, { '_id': { $in: data.college } }] })
                    .select('name icon members post _id')
                    .limit(3)
                    .exec(function (err, userColleges) {
                        if (err) {
                            throw err;
                        }
                        getTopThreeData(userColleges, nonUserColleges, function (data) {
                            callback(data);
                        });
                    });
            });
    });

}

function getDegreeSearchlist(loggedId, search_name, callback) {
    var Degree = require('../models/degree');
    getSubjectsCollegeDegreeId(loggedId, function (data) {
        loggedId = parseInt(loggedId);
        Degree.find({ $and: [{ "name": new RegExp(search_name, "i") }, { '_id': { $nin: data.degree } }] })
            .select('name icon members post _id')
            .limit(3)
            .exec(function (err, nonUserDegrees) {
                if (err) {
                    throw err;
                }
                Degree.find({ $and: [{ "name": new RegExp(search_name, "i") }, { '_id': { $in: data.degree } }] })
                    .select('name icon members post _id')
                    .limit(3)
                    .exec(function (err, userDegrees) {
                        if (err) {
                            throw err;
                        }
                        getTopThreeData(userDegrees, nonUserDegrees, function (data) {
                            callback(data);
                        });
                    });
            });
    });

}

function getGroupSearchlist(loggedId, search_name, callback) {
    getGroupIds(loggedId, function (data) {
        loggedId = parseInt(loggedId);
        Group.find({ $and: [{ "title": new RegExp(search_name, "i") }, { '_id': { $nin: data.groups } }, { $or: [{ 'privacy': 1 }, { 'privacy': 2, 'members.user_id': { $in: [loggedId] } }] }] })
            .select('title description privacy subject_id college_id degree_id icon members post _id')
            .limit(3)
            .exec(function (err, nonUserGroups) {
                if (err) {
                    throw err;
                }
                Group.find({ $and: [{ "title": new RegExp(search_name, "i") }, { '_id': { $in: data.groups } }] })
                    .select('title description privacy subject_id college_id degree_id icon members post _id')
                    .limit(3)
                    .exec(function (err, userGroups) {
                        if (err) {
                            throw err;
                        }
                        getTopThreeData(userGroups, nonUserGroups, function (data) {
                            callback(data);
                        });
                    });
            });
    });

}
function getGroupIds(loggedId, callback) {
    Group.find({ 'created_by': loggedId }).distinct('_id').exec(function (err, ids) {
        if (err)
            throw err;
        callback({ groups: ids });
    })
}
function getEventSearchlist(loggedId, search_name, callback) {
    getEventIds(loggedId, function (data) {
        loggedId = parseInt(loggedId);
        Groupevents.find({ $and: [{ "title": new RegExp(search_name, "i") }, { '_id': { $nin: data.events } }, { $or: [{ 'privacy': 1 }, { 'privacy': 2, 'members.user_id': { $in: [loggedId] } }] }] })
            .select('title description privacy icon members post _id')
            .limit(3)
            .exec(function (err, nonUserEvents) {
                if (err) {
                    throw err;
                }
                Groupevents.find({ $and: [{ "title": new RegExp(search_name, "i") }, { '_id': { $in: data.events } }] })
                    .select('title description privacy icon members post _id')
                    .limit(3)
                    .exec(function (err, userEvents) {
                        if (err) {
                            throw err;
                        }
                        getTopThreeData(userEvents, nonUserEvents, function (data) {
                            callback(data);
                        });
                    });
            });
    });

}
function getEventIds(loggedId, callback) {
    Groupevents.find({ 'created_by': loggedId }).distinct('_id').exec(function (err, ids) {
        if (err)
            throw err;
        callback({ events: ids });
    })
}

function getTopThreeData(userData, nonUserData, callback) {
    var searchData = [];
    searchData = userData;
    for (var i = 0; i < nonUserData.length; i++) {
        searchData.push(nonUserData[i]);
    }
    callback(searchData);
}

function getfriendIdslist(userId, callback) {
    var current_friends = [];
    var pending_friends = [];
    var request_friends = [];
    var blocked_friends = [];
    var users_blocked_me = [];
    User.findOne({ '_id': userId })
        .exec(function (err, user) {
            if (err)
                throw err;
            for (var i in user.friends) {
                if (user.friends[i].friend_id) {
                    if (user.friends[i].status === 3) {
                        current_friends.push(user.friends[i].friend_id);
                    }
                    if (user.friends[i].status === 2) {
                        pending_friends.push(user.friends[i].friend_id);
                    }
                    if (user.friends[i].status === 1) {
                        request_friends.push(user.friends[i].friend_id);
                    }
                    if (user.friends[i].status === 4) {
                        blocked_friends.push(user.friends[i].friend_id);
                    }
                    if (user.friends[i].status === 5) {
                        users_blocked_me.push(user.friends[i].friend_id);
                    }
                }
            }
            callback({ current: current_friends, pending: pending_friends, request: request_friends, blocked: blocked_friends, blocked_me: users_blocked_me });
        });
}

function getSubjectsCollegeDegreeId(userId, callback) {
    var subjectIds = [];
    var collegeIds = [];
    var degreeIds = [];
    User.findOne({ '_id': userId })
        .exec(function (err, user) {
            if (err)
                throw err;
            for (var i in user.subjects) {
                if (user.subjects[i].subject_id) {
                    subjectIds.push(user.subjects[i].subject_id);
                }
            }
            for (var i in user.college) {
                if (user.college[i].college_id) {
                    collegeIds.push(user.college[i].college_id);
                }
            }
            for (var i in user.degree) {
                if (user.degree[i].degree_id) {
                    degreeIds.push(user.degree[i].degree_id);
                }
            }
            callback({ college: collegeIds, degree: degreeIds, subject: subjectIds });
        });
}

function getSCDCounts(userId, scdIds, callback) {
    var Post = require('../models/post');
    Post.find({ 'subject_id': { $in: scdIds.current_subjects } })
        .sort({ '_id': -1 })
        .limit(1)
        .exec(function (err, data) {
            callback(data);
        });
}

//method to check user current college,subject and degree
function getUserScdIds(userId, callback) {
    var User = require('../models/user');
    User.findOne({ _id: userId }, { subjects: 1, degree: 1, college: 1 },
        function (err, result) {
            var current_subjects = [];
            var current_college = [];
            var current_degree = [];
            for (var i in result.subjects) {
                current_subjects.push(result.subjects[i].subject_id);
            }
            for (var i in result.college) {
                current_college.push(result.college[i].college_id);
            }
            for (var i in result.degree) {
                current_degree.push(result.degree[i].degree_id);
            }
            callback({ current_subjects: current_subjects, current_college: current_college, current_degree: current_degree });
        });
}

ctrl.get('/updateSubjectLastVisit/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var scdId = req.params.id;
        User.update({ '_id': userId, 'subjects.subject_id': scdId }, { $set: { "subjects.$.last_visit": new Date() } }, function (err, data) {
            res.json({ status: 2, msg: 'visit updated successfully.', data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.get('/updateCollegeLastVisit/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var scdId = req.params.id;
        User.update({ '_id': userId, 'college.college_id': scdId }, { $set: { "college.$.last_visit": new Date() } }, function (err, data) {
            res.json({ status: 2, msg: 'visit updated successfully.', data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.get('/updateDegreeLastVisit/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var scdId = req.params.id;
        User.update({ '_id': userId, 'degree.degree_id': scdId }, { $set: { "degree.$.last_visit": new Date() } }, function (err, data) {
            res.json({ status: 2, msg: 'visit updated successfully.', data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

ctrl.get('/getMembersList/:counter/:type', function (req, res) {
    if (req.session.passport) {
        var counter = req.params.counter;
        var type = req.params.type;
        var limit = 20;
        var skip = limit * counter;
        var sort = { 'fname': -1 };
        var members = [];
        var userId = req.session.passport.user;
        getfriendIdslist(userId, function (friendIds) {
            getFollowingIds(userId, function (followingIds) {
                getFollowerIds(userId, function (followerIds) {
                    User.find({ $and: [{ '_id': { $nin: [userId] } }, { '_id': { $nin: friendIds.current } }, { '_id': { $nin: friendIds.pending } }, { '_id': { $nin: friendIds.request } }, { '_id': { $nin: friendIds.blocked } }, { '_id': { $nin: friendIds.blocked_me } }, { 'type': 1 }] })
                        .select('fname lname photo')
                        .sort(sort)
                        .exec(function (err, user) {
                            if (err)
                                throw err;
                            for (var i in user) {
                                if (type == 1) {
                                    if (followingIds.indexOf(user[i]._id) == -1) {
                                        members.push({ '_id': user[i]._id, 'fname': user[i].fname, 'lname': user[i].lname, 'photo': user[i].photo, 'status': 6, followingStatus: 6 });
                                    } else {
                                        members.push({ '_id': user[i]._id, 'fname': user[i].fname, 'lname': user[i].lname, 'photo': user[i].photo, 'status': 6, followingStatus: 3 });
                                    }
                                } else if (type == 2) {
                                    if (followerIds.indexOf(user[i]._id) > -1) {
                                        if (followingIds.indexOf(user[i]._id) == -1) {
                                            members.push({ '_id': user[i]._id, 'fname': user[i].fname, 'lname': user[i].lname, 'photo': user[i].photo, 'status': 6, followingStatus: 6 });
                                        } else {
                                            members.push({ '_id': user[i]._id, 'fname': user[i].fname, 'lname': user[i].lname, 'photo': user[i].photo, 'status': 6, followingStatus: 3 });
                                        }
                                    }
                                } else if (type == 3) {
                                    if (followingIds.indexOf(user[i]._id) > -1) {
                                        members.push({ '_id': user[i]._id, 'fname': user[i].fname, 'lname': user[i].lname, 'photo': user[i].photo, 'status': 6, followingStatus: 3 });
                                    }
                                }
                            }
                            var finalMembers = members.slice(skip, skip + limit);
                            res.json({ status: 2, msg: 'getting member successfully.', members: finalMembers, userCount: members.length });
                        });
                });
            });

        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
function getFollowingIds(userId, callback) {
    var followingIds = [];
    User.findOne({ _id: userId })
        .select('following')
        .exec(function (err, user) {
            if (err)
                throw err;
            for (var i in user.following) {
                followingIds.push(user.following[i].following_id);
            }
            callback(followingIds);
        });
}
function getFollowerIds(userId, callback) {
    var followerIds = [];
    User.findOne({ _id: userId })
        .select('followers')
        .exec(function (err, user) {
            if (err)
                throw err;
            for (var i in user.followers) {
                followerIds.push(user.followers[i].follower_id);
            }
            callback(followerIds);
        });
}

ctrl.post('/removeOthersPostTimeline', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.body.postId;
        User.findOne({ '_id': userId, 'hidden_postIds': { $in: [postId] } }).exec(function (err, data) {
            if (err)
                throw err;
            if (!data) {
                User.findByIdAndUpdate({ '_id': userId }, { $push: { 'hidden_postIds': postId } }).exec(function (err, updatedUser) {
                    if (err)
                        throw err;
                    res.json({ status: 2, message: 'Post removed successfully.' });
                });
            } else {
                res.json({ status: 0, msg: 'Post already removed' });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

ctrl.post('/resend/activation/email', function (req, res, next) {
    User.findOne({ 'local.email': req.body.email }, function (err, user) {
        if (err)
            throw err;
        if (user) {
            getEmailData('account_activate', function (data) {
                var fullUrl = "http://dev.stribein.com";
                locals = {
                    email: req.body.email,
                    from: 'register@stribein.com',
                    subject: data.subject, //'Just one more step to get started with StudentNetwork',
                    logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
                    name: user.fname + ' ' + (user.lname ? user.lname : ''),
                    password: req.body.password,
                    siteLink: fullUrl,
                    activation_link: fullUrl + '/api/user/activate/' + user._id + '/' + user.activation_code
                };
                res.json({ status: 2, msg: "Email sent successfully!." });
                next();
            });
        }
    });
}, function (req, res) {
    mailer.sendOne('account_activate', locals, function (err, responseStatus, html, text) { });
});

ctrl.post('/inviteToGroupByEmail', function (req, res, next) {
    var email = req.body.email;
    var scdname;
    // var message = req.body.message;
    var groupId = req.body.groupId;
    var Group = require('../models/group');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Group.findOne({ '_id': groupId })
            .populate({ path: 'subject_id college_id degree_id', select: 'name' })
            .exec(function (err, groupData) {
                if (err)
                    throw err;
                if (groupData.subject_id)
                    scdname = groupData.subject_id.name
                if (groupData.college_id)
                    scdname = groupData.college_id.name
                if (groupData.degree_id)
                    scdname = groupData.degree_id.name
                getUserDetail(userId, function (userDetails) {
                    // getEmailData('invite_friends_email_group', function (data) {
                    var name = userDetails.fname.charAt(0).toUpperCase() + userDetails.fname.slice(1) + ' ' + (userDetails.lname ? userDetails.lname : '');
                    var fullUrl = "http://dev.stribein.com";
                    locals = {
                        email: email,
                        from: 'invite@stribein.com',
                        logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
                        subject: 'StribeIN – ' + name + ' invites you to join & connect.',
                        name: name,
                        title: groupData.title.charAt(0).toUpperCase() + groupData.title.slice(1),
                        link: fullUrl + '/api/groupInvite/-1/-1',
                        siteLink: fullUrl,
                        scdname: scdname.charAt(0).toUpperCase() + scdname.slice(1),
                    };
                    res.json({ status: 2, msg: 'Invite send successfully.' });
                    next();
                    // });
                });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
}, function (req, res) {
    mailer.sendOne('invite_friends_email_group', locals, function (err, responseStatus, html, text) { });
});

ctrl.get('/getSubjectSearchList/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        getSubjectSearchlist(userId, req.params.name, function (subjects) {
            res.json({ status: 2, msg: "Search complete!", subjects: subjects });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.get('/getCollegeSearchList/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        getCollegeSearchlist(userId, req.params.name, function (colleges) {
            res.json({ status: 2, msg: "Search complete!", colleges: colleges });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.get('/getDegreeSearchList/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        getDegreeSearchlist(userId, req.params.name, function (degrees) {
            res.json({ status: 2, msg: "Search complete!", degrees: degrees });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.get('/getFriendsList/:count', function (req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counter = req.params.count;
        var limit = 20;
        var skip = limit * counter;
        getCurrentFriends(id, function (friends) {
            var members = friends.data.slice(skip, skip + limit);
            res.json({ status: 2, total: friends.friendsCount, data: members });
        });
    } else {
        res.json({ status: 0, msg: "Not logged in" });
    }
});

ctrl.get('/getAllMembers', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        getAllMemberslist(userId, function (data) {
            res.json({ status: 2, data: data });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
})
function getAllMemberslist(loggedId, callback) {
    var User = require('../models/user');
    var searchData = [];
    getfriendIdslist(loggedId, function (data) {
        loggedId = parseInt(loggedId);
        User.find({ $and: [{ type: 1 }, { '_id': { $nin: data.blocked } }, { '_id': { $nin: data.blocked_me } }, { '_id': { $nin: data.current } }, { '_id': { $nin: [loggedId] } }] })
            .select('_id fname lname photo')
            .exec(function (err, nonFriends) {
                if (err) {
                    throw err;
                }
                User.find({ $and: [{ type: 1 }, { '_id': { $in: data.current } }, { '_id': { $nin: [loggedId] } }] })
                    .select('_id fname lname photo')
                    .exec(function (err, friends) {
                        if (err) {
                            throw err;
                        }
                        getTopThreeData(friends, nonFriends, function (data) {
                            callback(data);
                        });
                    });

            });
    });

}
ctrl.get('/getNonFriends/:name', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var name = req.params.name;
        getNonFriendlist(userId, name, function (data) {
            res.json({ status: 2, data: data });
        })
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
})
function getNonFriendlist(loggedId, search_name, callback) {
    var User = require('../models/user');
    var searchData = [];
    getfriendIdslist(loggedId, function (data) {
        loggedId = parseInt(loggedId);
        User.find({ $and: [{ "fname": new RegExp('^' + search_name, "i") }, { '_id': { $nin: data.blocked } }, { '_id': { $nin: data.blocked_me } }, { '_id': { $nin: data.current } }, { '_id': { $nin: data.pending } }, { '_id': { $nin: data.request } }, { '_id': { $nin: [loggedId] } }] })
            .select('_id fname lname photo')
            .exec(function (err, nonFriends) {
                if (err) {
                    throw err;
                }
                callback(nonFriends);
            });
    });

}

ctrl.get('/leaveScd/:id/:type', function (req, res) {
    var User = require('../models/user');
    var Subject = require('../models/subject');
    var College = require('../models/college');
    var Degree = require('../models/degree');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var id = req.params.id;
        var type = req.params.type;
        if (type == 'Subject') {
            User.findByIdAndUpdate(userId, { $pull: { subjects: { subject_id: id } } },
                function (err, usr) {
                    if (err)
                        throw err;
                    Subject.update({ "_id": id, "members.user_id": userId }, { $pull: { members: { user_id: userId } } }, { safe: true },
                        function (err, obj) {
                            if (err)
                                throw err;
                        });
                    res.json({ status: 2, message: "Subject Removed Successfully" });
                });
        } else if (type == 'College') {
            User.findByIdAndUpdate(userId, { $pull: { college: { college_id: id } } },
                function (err, usr) {
                    if (err)
                        throw err;
                    College.update({ "_id": id, "members.user_id": userId }, { $pull: { members: { user_id: userId } } }, { safe: true },
                        function (err, obj) {
                            if (err)
                                throw err;
                        });
                    res.json({ status: 2, message: "College Removed Successfully" });
                });
        } else if (type == 'Degree') {
            User.findByIdAndUpdate(userId, { $pull: { degree: { degree_id: id } } },
                function (err, usr) {
                    if (err)
                        throw err;
                    Degree.update({ "_id": id, "members.user_id": userId }, { $pull: { members: { user_id: userId } } }, { safe: true },
                        function (err, obj) {
                            if (err)
                                throw err;
                        });
                    res.json({ status: 2, message: "Degree Removed Successfully" });
                });
        } else {
            res.json({ status: 1, message: "wall id not found." });
        }
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/send/contactInformation', function (req, res, next) {
    // if (req.session.passport) {
        var name = req.body.fname;
        var email = req.body.email;
        var subject = req.body.subject;
        var message = req.body.message;
        var fullUrl = "http://dev.stribein.com";
        locals = {
            email: 'admin@stribein.com,support@stribein.com',
            from: email,
            logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
            subject: subject,
            name: name,
            message: message,
            siteLink: fullUrl
        };
        res.json({ status: 2, msg: 'sent successfully.' });
        next();
    // } else {
    //     res.json({ status: 0, msg: 'User not loggedIn.' });
    // }
}, function (req, res) {
    mailer.sendOne('contact_us_email', locals, function (err, responseStatus, html, text) { });
});

ctrl.get('/getUserFollowingIds', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        User.findOne({ '_id': userId })
            .select('following')
            .exec(function (err, data) {
                if (err)
                    throw err;
                var following = [];
                for (var i in data.following) {
                    following.push(data.following[i].following_id);
                }
                res.json({ status: 2, following: following })
            });
    } else {
        res.json({ status: 0, mag: 'User not LoggedIn' });
    }
});
ctrl.get('/checkUserStatus/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var friendId = +req.params.id;
        getBlockBlockByUserlist(userId, function (userDetails) {
            if (userDetails.blocked.indexOf(friendId) > -1 || userDetails.unblocked.indexOf(friendId) > -1) {
                res.json({ status: 2, isBlocked: true });
            } else {
                res.json({ status: 2, isBlocked: false });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});
function getBlockBlockByUserlist(userId, callback) {
    var User = require('../models/user');
    var blocked_friends = [];
    var unblocked_friends = [];
    User.findOne({ '_id': userId })
        .populate({ path: 'friends.friend_id', select: 'fname lname photo _id' })
        .exec(function (err, data) {
            if (err)
                throw err;
            for (var attributename in data.friends) {
                if (data.friends[attributename].friend_id != null) {
                    if (data.friends[attributename].status === 4) {
                        blocked_friends.push(data.friends[attributename].friend_id._id);
                    } else if (data.friends[attributename].status === 5) {
                        unblocked_friends.push(data.friends[attributename].friend_id._id);
                    }
                }
            }
            callback({ blocked: blocked_friends, unblocked: unblocked_friends });
        });
}

function saveCityStateName(id, pincode) {
    if (pincode) {
        getCityStateFromPincode(pincode, function (data) {
            if (data) {
                User.findByIdAndUpdate({ '_id': id }, { $set: { 'city': data.city, 'state': data.state } }, function (err, updatedData) {
                    if (err)
                        throw err;
                });
            }
        });
    }
}
function getCityStateFromPincode(pincode, callback) {
    geocoder.geocode(pincode, function (err, data) {
        if (err)
            throw err;
        if (data.length) {
            geocoder.reverse({ lat: data[0].latitude, lon: data[0].longitude }, function (err, finalData) {
                if (err)
                    throw err;
                if (finalData.length) {
                    callback({ 'city': finalData[0].city, 'state': finalData[0].administrativeLevels.level1long });
                } else {
                    callback(null);
                }
            });
        } else {
            callback(null);
        }
    });
}
ctrl.get('/emailStatus', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        User.findOne({ '_id': userId, 'type': 2 })
            .select('isRegConEnable')
            .exec((err, data) => {
                if (err)
                    throw err;
                if (data) {
                    res.json({ status: 2, data: data });
                } else {
                    res.json({ status: 0, msg: 'User not found' });
                }
            })
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.get('/enableEmailStatus', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        User.findOne({ '_id': userId, 'type': 2 })
            .exec((err, data) => {
                if (err)
                    throw err;
                if (data) {
                    User.update({ '_id': userId }, { $set: { 'isRegConEnable': 1 } }, (err, data) => {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'updated successfully.' });
                    });
                } else {
                    res.json({ status: 0, msg: 'User not found' });
                }
            })
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.get('/disableEmailStatus', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        User.findOne({ '_id': userId, 'type': 2 })
            .exec((err, data) => {
                if (err)
                    throw err;
                if (data) {
                    User.update({ '_id': userId }, { $set: { 'isRegConEnable': 0 } }, (err, data) => {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'updated successfully.' });
                    });
                } else {
                    res.json({ status: 0, msg: 'User not found' });
                }
            })
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
