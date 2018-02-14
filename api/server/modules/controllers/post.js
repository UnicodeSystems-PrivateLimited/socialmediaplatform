var ctrl = require('express').Router();
module.exports = ctrl;
var multer = require('multer');
var mailer = require('../../mailer/models');
var locals;
var fs = require('fs');
var path = require('path');
var im = require('imagemagick');
var upload = multer({
    dest: '/tmp',
});
var upload = multer().single('avatar');

var Post = require('../models/post');
var Subject = require('../models/subject');
var College = require('../models/college');
var Degree = require('../models/degree');
var Group = require('../models/group');
var User = require('../models/user');
var Event = require('../models/event');
var RuleOfPost = require('../models/ruleofpost');
var PostsFeedback = require('../models/postsfeedback');
var scrape = require('html-metadata');
var allSubjects = [];
//method to add post event
function addpostevent(user_id, post_id, type, post_type, title, callback) {
    var Event = require('../models/event');
    var newEvent = new Event();
    newEvent.created_by = user_id;
    newEvent.post_id = post_id;
    newEvent.type = type;
    newEvent.post_type = post_type;
    newEvent.timestamp = new Date();
    newEvent.title = title;
    Event.update({ post_id: post_id }, newEvent, { upsert: true }, function(err) {
        callback();
    });
}

//get all post
ctrl.get('/', function(req, res) {
    Post.find({}, function(err, post) {
        if (err)
            throw err;
        res.json({ data: post });
    });
});

//get api for post by ID
ctrl.get('/postById', function(req, res) {
    if (req.session.passport) {
        var sort = { 'created_on': -1 };
        var userId = req.session.passport.user;
        Post.find({ 'created_by': userId, 'post_type': 3 })
            .select('photo types created_by origin_creator')
            .sort(sort)
            .limit(6)
            .exec(function(err, photo) {
                if (err)
                    throw err;
                Post.find({ 'created_by': userId, 'post_type': 4 })
                    .select('video types created_by origin_creator')
                    .sort(sort)
                    .limit(6)
                    .exec(function(err, video) {
                        if (err)
                            throw err;
                        res.json({ data: { photo: photo, video: video } });
                    });
            });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

//get api for all posts by ID
ctrl.get('/post/:id', function(req, res) {
    if (req.params.id && req.params.id > -1) {
        var Post = require('../models/post');
        Post.find({ _id: req.params.id })
            .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
            .populate({ path: 'subject_id college_id degree_id  share.user_id likes.user_id comments.comment_by created_by origin_creator ', select: 'fname lname photo _id name' })
            .populate({
                path: 'group_id',
                model: 'Group',
                select: 'title subject_id college_id degree_id',
                populate: {
                    path: 'subject_id college_id degree_id',
                    select: 'name'
                }
            })
            .exec(function(err, post) {
                if (err)
                    throw err;
                return res.json(post);
            });
    }
});

//get api for friend posts
ctrl.get('/postFriends/:id', function(req, res) {
    if (req.params.id && req.params.id > -1) {
        var Post = require('../models/post');
        var logged = req.session.passport.user;
        Post.find({ _id: req.params.id })
            .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
            .populate({ path: 'share.user_id likes.user_id comments.comment_by created_by origin_creator', select: 'fname lname photo _id' })
            .populate({ path: 'subject_id college_id degree_id', select: 'name' })
            .populate({
                path: 'group_id',
                model: 'Group',
                select: 'title subject_id college_id degree_id',
                populate: {
                    path: 'subject_id college_id degree_id',
                    select: 'name'
                }
            })
            .exec(function(err, post) {
                if (err)
                    throw err;

                return res.json({ data: post, result: logged });
            });
    }
});

//get api to delete all post
ctrl.get('/deleteAllPost', function(req, res) {
    Post.remove(function(err, post) {
        if (err)
            throw err;
        data = { message: 'All posts deleted' };
        res.json(data);
    });
});

//get api to count all subject post
ctrl.get('/countPostsBySubjectId/:id/', function(req, res) {
    var id = req.params.id;
    getSubjectPostId(id, function(data) {
        Post.count({ '_id': { $in: data } }, function(err, count) {
            res.json({ satus: 2, total_post: count });
        });
    });
});

//get api for loggedin user post by post type
ctrl.get('/getuserpost/:post_type/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var post_type = req.params.post_type;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        var search_param = {};
        getReportedPostIds(function(reportedPostIds) {
            search_param["_id"] = { $nin: reportedPostIds }
            search_param["created_by"] = logged;
            if (post_type != 'null')
                search_param["post_type"] = post_type;
            Post.find(search_param)
                .select('name types subject_id degree_id college_id catagory created_by created_on post_type likes flag comments answer message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by answer.created_by share.user_id origin_creator', select: 'fname lname photo _id' })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Post.find(search_param)
                        .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id', select: 'fname lname photo _id' })
                        .sort(sort)
                        .exec(function(err, total_result) {
                            if (err) {
                                throw err;
                            }
                            res.json({ data: result, isResult: logged, total_result: total_result.length });
                        });
                });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

//get api for post of all users
ctrl.get('/getAllUserPost/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        checkUserWalls(logged, function(data1) {
            Post.find({
                    'created_by': logged,
                    $or: [{ privacy: 1 },
                        { share_privacy: 1 },
                        { 'custom.custom_id': { $in: logged } },
                        { 'share_custom.custom_id': { $in: logged } },
                        { created_by: logged },
                        {
                            $and: [
                                { created_by: { $in: data1.current_friend } },
                                { privacy: 3 },
                                { subject_id: { $in: data1.current_subjects } }
                            ]
                        },
                        {
                            $and: [
                                { created_by: { $in: data1.current_following } },
                                { privacy: 4 },
                                { subject_id: { $in: data1.current_subjects } }
                            ]
                        },
                        {
                            $and: [
                                { created_by: { $in: data1.current_following } },
                                { privacy: 4 },
                                { subject_id: { $in: data1.current_subjects } }
                            ]
                        },
                        {
                            $and: [{
                                    $or: [{ created_by: { $in: data1.current_friend } },
                                        { created_by: { $in: data1.current_following } }
                                    ]
                                },
                                { privacy: 6 },
                                { subject_id: { $in: data1.current_subjects } }
                            ]
                        },
                        {
                            $and: [{
                                    $or: [{ created_by: { $in: data1.current_friend } },
                                        { created_by: { $in: data1.current_following } }
                                    ]
                                },
                                { share_privacy: 6 },
                                { subject_id: { $in: data1.current_subjects } }
                            ]
                        },
                        {
                            $and: [
                                { created_by: { $in: data1.current_friend } },
                                { share_privacy: 3 },
                                { subject_id: { $in: data1.current_subjects } }
                            ]
                        },
                        {
                            $and: [
                                { created_by: { $in: data1.current_following } },
                                { share_privacy: 4 },
                                { subject_id: { $in: data1.current_subjects } }
                            ]
                        }
                    ]
                })
                .select('name share subject_id college_id degree_id types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Post.find({
                            'created_by': logged,
                            $or: [{ privacy: 1 },
                                { share_privacy: 1 },
                                { 'custom.custom_id': { $in: logged } },
                                { 'share_custom.custom_id': { $in: logged } },
                                { created_by: logged },
                                {
                                    $and: [
                                        { created_by: { $in: data1.current_friend } },
                                        { privacy: 3 },
                                        { subject_id: { $in: data1.current_subjects } }
                                    ]
                                },
                                {
                                    $and: [
                                        { created_by: { $in: data1.current_following } },
                                        { privacy: 4 },
                                        { subject_id: { $in: data1.current_subjects } }
                                    ]
                                },
                                {
                                    $and: [{
                                            $or: [{ created_by: { $in: data1.current_friend } },
                                                { created_by: { $in: data1.current_following } }
                                            ]
                                        },
                                        { privacy: 6 },
                                        { subject_id: { $in: data1.current_subjects } }
                                    ]
                                },
                                {
                                    $and: [
                                        { created_by: { $in: data1.current_friend } },
                                        { share_privacy: 3 },
                                        { subject_id: { $in: data1.current_subjects } }
                                    ]
                                },
                                {
                                    $and: [
                                        { created_by: { $in: data1.current_following } },
                                        { share_privacy: 4 },
                                        { subject_id: { $in: data1.current_subjects } }
                                    ]
                                },
                                {
                                    $and: [{
                                            $or: [{ created_by: { $in: data1.current_friend } },
                                                { created_by: { $in: data1.current_following } }
                                            ]
                                        },
                                        { share_privacy: 6 },
                                        { subject_id: { $in: data1.current_subjects } }
                                    ]
                                }
                            ]
                        })
                        .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
                        .exec(function(err, total_post) {
                            if (err) {
                                throw err;
                            }
                            res.json({ data: result, total_post: total_post.length });
                        });
                });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

//get api for post of all users
ctrl.get('/getPostCreatedBySelf/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        checkUserWalls(logged, function(data1) {
            Post.find({
                    'created_by': logged,
                    $and: [{ subject_id: 0 },
                        { share_privacy: 0 },
                        { created_by: logged }
                    ]
                })
                .select('name share subject_id college_id degree_id types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    res.json({ data: result });
                });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

//method to check friends current college,subject and degree
function checkUserFriendId(user_id, friendId, callback) {
    var User = require('../models/user');
    User.findOne({ _id: friendId }, { friends: 1, subjects: 1, degree: 1, college: 1, followers: 1 },
        function(err, result) {
            var current_friend = false;
            var current_following = false;
            var current_subjects = [];
            var current_college = [];
            var current_degree = [];
            for (var i in result.friends) {
                if (result.friends[i].status == 3 && result.friends[i].friend_id == user_id) {
                    current_friend = true;
                }
            }
            for (var i in result.followers) {
                if (result.followers[i].follower_id == user_id) {
                    current_following = true;
                }
            }
            for (var i in result.subjects) {
                current_subjects.push(result.subjects[i].subject_id);
            }
            for (var i in result.college) {
                current_college.push(result.college[i].college_id);
            }
            for (var i in result.degree) {
                current_degree.push(result.degree[i].degree_id);
            }
            callback({ current_friend: current_friend, current_following: current_following, current_subjects: current_subjects, current_college: current_college, current_degree: current_degree });
        });
}

//method to check current members belong to which subject
function checkUserWalls(user_id, callback) {
    var User = require('../models/user');
    User.findOne({ _id: user_id }, { friends: 1, subjects: 1, degree: 1, college: 1, following: 1, followers: 1 },
        function(err, result) {
            var data = result.friends;
            var subjects = result.subjects;
            var following = result.following;
            var followers = result.followers;
            var college = result.college;
            var degree = result.degree;
            var current_friend = [];
            var current_following = [];
            var current_followers = [];
            var current_subjects = [];
            var current_college = [];
            var current_degree = [];
            var block_user = [];
            for (var i in data) {
                if (data[i].status == 3) {
                    current_friend.push(data[i].friend_id);

                }
                if (data[i].status == 4 || data[i].status == 5) {
                    block_user.push(data[i].friend_id);
                }
            }
            for (var i in subjects) {
                current_subjects.push(subjects[i].subject_id);
            }
            for (var i in college) {
                current_college.push(college[i].college_id);
            }
            for (var i in degree) {
                current_degree.push(degree[i].degree_id);
            }
            for (var i in following) {
                current_following.push(following[i].following_id);
            }
            for (var i in followers) {
                current_followers.push(followers[i].follower_id);
            }
            callback({ current_friend: current_friend, current_subjects: current_subjects, current_college: current_college, current_degree: current_degree, current_following: current_following, current_followers: current_followers, block_user: block_user });
        });
}

function loggedUserAllSubjects(logged, callback) {
    // var logged = req.session.passport.user;
    var User = require('../models/user');
    User.find({ "_id": logged }, { subjects: 1 },
        function(err, result) {
            var subjects = result[0].subjects;
            var all_subjects = [];
            for (var i in subjects) {
                all_subjects.push(subjects[i].subject_id);

            }
            callback({ all_subjects: all_subjects });
        }
    );
}

// get api for friend post by userId and postype
ctrl.get('/getfriendpost/:friend_id/:post_type/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var post_type = req.params.post_type;
    var friend_id = req.params.friend_id;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var condition;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        checkUserFriendId(logged, friend_id, function(data) {
            if (data.current_friend) {
                condition = {
                    $and: [{
                            $and: [
                                { 'created_by': friend_id, 'share_type': 1 },
                                { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] }
                            ]

                        },
                        {
                            $or: [
                                { subject_id: { $in: data.current_subjects } },
                                { college_id: { $in: data.current_college } },
                                { degree_id: { $in: data.current_degree } }
                            ]
                        },
                        { 'post_type': post_type }
                    ]
                };
            } else if (data.current_following && !data.current_friend) {
                condition = {
                    $and: [
                        { 'created_by': friend_id, 'share_type': 1 },
                        { 'privacy': { $in: [1, 4, 6] } },
                        { 'post_type': post_type },
                        {
                            $or: [
                                { subject_id: { $in: data.current_subjects } },
                                { college_id: { $in: data.current_college } },
                                { degree_id: { $in: data.current_degree } }
                            ]
                        }
                    ]
                };
            } else {
                condition = {
                    $and: [
                        { 'created_by': friend_id, 'share_type': 1 },
                        { 'privacy': 1 },
                        { 'post_type': post_type },
                        {
                            $or: [
                                { subject_id: { $in: data.current_subjects } },
                                { college_id: { $in: data.current_college } },
                                { degree_id: { $in: data.current_degree } }
                            ]
                        }
                    ]
                };
            }
            Post.find(condition)
                .select('name subject_id college_id degree_id types catagory created_by created_on post_type likes flag comments answer message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                .populate({
                    path: 'created_by likes.user_id flag.user_id subject_id college_id degree_id comments.comment_by answer.created_by share.user_id origin_creator',
                    select: 'fname lname photo _id name'
                })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Post.find(condition)
                        .select('name types catagory created_by created_on post_type likes flag comments answer message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({
                            path: 'created_by likes.user_id flag.user_id subject_id college_id degree_id comments.comment_by answer.created_by share.user_id origin_creator',
                            select: 'fname lname photo _id name'
                        })
                        .sort(sort)
                        .exec(function(err, total_result) {
                            if (err) {
                                throw err;
                            }
                            res.json({ data: result, isResult: logged, potForData: data, total_result: total_result.length });
                        });
                });
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

//get api for friends all post by his/her ID
ctrl.get('/getfriendAllpost/:friend_id/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var friend_id = req.params.friend_id;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var condition;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        checkUserFriendId(logged, friend_id, function(data) {
            getReportedPostIds(function(reportedPostIds) {
                if (data.current_friend) {
                    condition = {
                        $and: [{
                                '_id': { $nin: reportedPostIds },
                                $and: [
                                    { 'created_by': friend_id, 'share_type': 1 },
                                    { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] }
                                ]

                            },
                            {
                                $or: [
                                    { subject_id: { $in: data.current_subjects } },
                                    { college_id: { $in: data.current_college } },
                                    { degree_id: { $in: data.current_degree } }
                                ]
                            }
                        ]
                    };
                } else if (data.current_following && !data.current_friend) {
                    condition = {
                        '_id': { $nin: reportedPostIds },
                        $and: [
                            { 'created_by': friend_id, 'share_type': 1 },
                            { 'privacy': { $in: [1, 4, 6] } },
                            {
                                $or: [
                                    { subject_id: { $in: data.current_subjects } },
                                    { college_id: { $in: data.current_college } },
                                    { degree_id: { $in: data.current_degree } }
                                ]
                            }
                        ]
                    };
                } else {
                    condition = {
                        '_id': { $nin: reportedPostIds },
                        $and: [
                            { 'created_by': friend_id, 'share_type': 1 },
                            { 'privacy': 1 },
                            {
                                $or: [
                                    { subject_id: { $in: data.current_subjects } },
                                    { college_id: { $in: data.current_college } },
                                    { degree_id: { $in: data.current_degree } }
                                ]
                            }
                        ]
                    };
                }
                Post.find(condition)
                    .select('name share subject_id degree_id college_id types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom')
                    .populate({
                        path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id degree_id college_id',
                        select: 'fname lname photo _id name'
                    })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec(function(err, result) {
                        if (err) {
                            throw err;
                        }
                        Post.find(condition)
                            .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                            .populate({
                                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator',
                                select: 'fname lname photo _id'
                            })
                            .sort(sort)
                            .exec(function(err, total_post) {
                                if (err) {
                                    throw err;
                                }
                                res.json({ data: result, total_post: total_post.length, result: logged });
                            });
                    });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

// get api for all post by subject ID
ctrl.get('/getAllPostsBySubjectId/:id/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        getSubjectPostId(id, function(data) {
            var match_filter = [];
            match_filter.push(1);
            checkUserWalls(logged, function(data1) {
                Post.find({
                        '_id': { $in: data },
                        $or: [{ privacy: 1 },
                            { created_by: logged, 'share_type': 1 },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_friend } },
                                    { $or: [{ privacy: { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] },
                                ]
                            },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_following } },
                                    { privacy: { $in: [1, 4, 6] } }
                                ]
                            }
                        ]
                    })
                    .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id', select: 'name fname lname photo _id' })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec(function(err, result) {
                        res.json({ data: result, isResult: logged });
                    });
            });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

ctrl.get('/postByIdForWall', function(req, res) {
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var userId = req.session.passport.user;
        var userPosts = [];
        checkUserWalls(logged, function(data1) {
            for (var i in data1.current_friend) {
                userPosts.push(data1.current_friend[i]);
            }
            Post.find({ "share": { $elemMatch: { "user_id": { $in: userPosts } } }, "share_privacy": 3 })
                .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                .exec(function(err, result) {
                    res.json({ data: result, isResult: logged });
                });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

ctrl.get('/postByIdForWallForFollowers', function(req, res) {
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var userId = req.session.passport.user;
        var userPosts = [];
        checkUserWalls(logged, function(data1) {
            for (var i in data1.current_followers) {
                userPosts.push(data1.current_followers[i]);
            }
            Post.find({ "share": { $elemMatch: { "user_id": { $in: userPosts } } }, "share_privacy": 3 })
                .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                .exec(function(err, result) {
                    console.log("dfghjkkl", result);
                    res.json({ data: result, isResult: logged });
                });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

/* All post for friends */
ctrl.get('/postByIdForWallForFriends', function(req, res) {
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var userId = req.session.passport.user;
        var userPosts = [];
        checkUserWalls(logged, function(data1) {
            for (var i in data1.current_friend) {
                userPosts.push(data1.current_friend[i]);
            }
            Post.find({ 'created_by': { $in: userPosts } })
                .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                .exec(function(err, result) {
                    res.json({ data: result, isResult: logged });
                });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

ctrl.get('/postByIdForWallForFollowing', function(req, res) {
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var userId = req.session.passport.user;
        var userPosts = [];
        checkUserWalls(logged, function(data1) {
            for (var i in data1.current_following) {
                userPosts.push(data1.current_following[i]);
            }
            Post.find({ 'created_by': { $in: userPosts } })
                .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                .exec(function(err, result) {
                    res.json({ data: result, isResult: logged });
                });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

ctrl.get('/getAllPostsBySubjectIdForWall/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        loggedUserAllSubjects(logged, function(data2) {
            allSubjects = data2.all_subjects;
            getAllSubjectPostId(allSubjects, function(data) {
                var match_filter = [];
                match_filter.push(1);
                checkUserWalls(logged, function(data1) {
                    Post.find({ "share": { $elemMatch: { "user_id": { $in: data1.current_friend } } }, "share_privacy": 3 })
                        .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .exec(function(err, result) {
                            res.json({ data: result, isResult: logged });
                        });
                });
            });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

ctrl.get('/getAllPostsBySubjectIdForWallForFollowers/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        loggedUserAllSubjects(logged, function(data2) {
            allSubjects = data2.all_subjects;
            getAllSubjectPostId(allSubjects, function(data) {
                var match_filter = [];
                match_filter.push(1);
                checkUserWalls(logged, function(data1) {
                    Post.find({ "share": { $elemMatch: { "user_id": { $in: data1.current_followers } } }, "share_privacy": 3 })
                        .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .exec(function(err, result) {
                            res.json({ data: result, isResult: logged });
                        });
                });
            });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

/* Match post for friends*/
ctrl.get('/getAllPostsBySubjectIdForWallOnlyFriends/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var friendsIds = [];
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        loggedUserAllSubjects(logged, function(data2) {
            allSubjects = data2.all_subjects;
            getAllSubjectPostId(allSubjects, function(data) {
                var match_filter = [];
                match_filter.push(1);
                checkUserWalls(logged, function(data1) {
                    friendsIds = data1.current_friend;
                    friendsIds.push(parseInt(logged));
                    Post.find({
                            '_id': { $in: data },
                            "created_by": { $in: friendsIds }
                        })
                        .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .exec(function(err, result) {
                            res.json({ data: result, isResult: logged });
                        });
                });
            });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

ctrl.get('/getAllPostsBySubjectIdForWallOnlyFollowing/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var followingIds = [];
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        loggedUserAllSubjects(logged, function(data2) {
            allSubjects = data2.all_subjects;
            getAllSubjectPostId(allSubjects, function(data) {
                var match_filter = [];
                match_filter.push(1);
                checkUserWalls(logged, function(data1) {
                    followingIds = data1.current_following;
                    followingIds.push(parseInt(logged));
                    Post.find({
                            '_id': { $in: data },
                            "created_by": { $in: followingIds }
                        })
                        .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .exec(function(err, result) {
                            res.json({ data: result, isResult: logged });
                        });
                });
            });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

function getFriendsEmailIds(id, calback) {
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('friends.friend_id')
        .populate({ path: 'friends.friend_id', select: 'local.email' })
        .exec(function(err, user) {
            if (err) {
                throw err;
            }
            var ids = [];
            if (user) {
                for (var i in user.friends) {
                    if (user.friends[i].friend_id)
                        ids.push(user.friends[i].friend_id._id);
                }
                calback({ ids: ids });
            } else {
                calback();
            }
        });
}

//get api post on scroll by subject ID
ctrl.get('/getAllScrollPostsBySubjectId/:id/:counterList/:post_type', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var post_type = req.params.post_type;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        getSubjectPostId(id, function(data) {
            var match_filter = [];
            match_filter.push(1);
            checkUserWalls(logged, function(data1) {
                Post.find({
                        '_id': { $in: data },
                        'post_type': post_type,
                        $or: [{ privacy: 1 },
                            { created_by: logged, 'share_type': 1 },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_friend } },
                                    { $or: [{ privacy: { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] },
                                ]
                            },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_following } },
                                    { privacy: { $in: [1, 4, 6] } }
                                ]
                            }
                        ]
                    })
                    .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec(function(err, result) {
                        res.json({ data: result, isResult: logged });
                    });
            });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

//get api all post of subject by subject ID and postType
ctrl.get('/getAllPostsByPostType/:id/:counterList/:post_type', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var post_type = req.params.post_type
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var id = req.params.id;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        getSubjectPostId(id, function(data) {
            checkUserWalls(logged, function(data1) {
                Post.find({
                        '_id': { $in: data },
                        'post_type': post_type,
                        $or: [{ privacy: 1 },
                            { created_by: logged, 'share_type': 1 },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_friend } },
                                    { $or: [{ privacy: { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] },
                                ]
                            },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_following } },
                                    { privacy: { $in: [1, 4, 6] } }
                                ]
                            }
                        ]
                    })
                    .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec(function(err, result) {
                        res.json({ data: result });
                    });
            });
        });
    }
});

//get api all subject post by title and subject ID
ctrl.get('/getAllSubjectPostsByTitle/:id/:search_name/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var search_name = req.params.search_name;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var id = req.params.id;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        getSubjectPostId(id, function(data) {
            checkUserWalls(logged, function(data1) {
                Post.find({
                        '_id': { $in: data },
                        $and: [{
                                $or: [
                                    { name: new RegExp('^' + search_name, "i") },
                                    { message: new RegExp('^' + search_name, "i") }
                                ]
                            },
                            {
                                $or: [{ privacy: 1 },
                                    { share_privacy: 1 },
                                    { created_by: logged },
                                    {
                                        $and: [
                                            { created_by: { $in: data1.current_friend } },
                                            { privacy: 3 },
                                            { subject_id: { $in: data1.current_subjects } }
                                        ]
                                    },
                                    {
                                        $and: [
                                            { created_by: { $in: data1.current_following } },
                                            { privacy: 4 },
                                            { subject_id: { $in: data1.current_subjects } }
                                        ]
                                    },
                                    {
                                        $and: [{
                                                $or: [{ created_by: { $in: data1.current_friend } },
                                                    { created_by: { $in: data1.current_following } }
                                                ]
                                            },
                                            { privacy: 6 },
                                            { subject_id: { $in: data1.current_subjects } }
                                        ]
                                    },
                                    {
                                        $and: [
                                            { created_by: { $in: data1.current_friend } },
                                            { share_privacy: 3 },
                                            { subject_id: { $in: data1.current_subjects } }
                                        ]
                                    },
                                    {
                                        $and: [
                                            { created_by: { $in: data1.current_following } },
                                            { share_privacy: 4 },
                                            { subject_id: { $in: data1.current_subjects } }
                                        ]
                                    },
                                    {
                                        $and: [{
                                                $or: [{ created_by: { $in: data1.current_friend } },
                                                    { created_by: { $in: data1.current_following } }
                                                ]
                                            },
                                            { share_privacy: 6 },
                                            { subject_id: { $in: data1.current_subjects } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    })
                    .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec(function(err, result) {
                        res.json({ status: 2, data: result });
                    });
            });
        });
    }
});

//post api to add comment
ctrl.post('/addComment', function(req, res, next) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.body.post_id;
        var cDate = req.body.date;
        if (postId) {
            Post.findByIdAndUpdate(postId, {
                    $push: {
                        comments: {
                            body: req.body.comment,
                            date: cDate,
                            comment_by: userId,
                        }
                    }
                },
                function(err, data) {
                    if (err)
                        throw err;
                    Post.findOne({ '_id': postId })
                        .select('comments types post_type created_by subject_id college_id degree_id group_id')
                        .populate({ path: 'comments.comment_by', select: 'fname lname photo _id' })
                        .populate({ path: 'subject_id college_id degree_id group_id', select: 'name title' })
                        .exec(function(err, post) {
                            if (err)
                                throw err;
                            var title = ' commented on your ' + getPostType(post.post_type) + ' in ' + getWallType(post.types, post);
                            if (post.created_by != userId) {
                                getUserDetail(userId, function(userData) {
                                    var recepients = [post.created_by];
                                    var notificationData = {
                                        title: title,
                                        date: new Date(),
                                        userdata: userData,
                                        userId: post.created_by,
                                        post_id: postId,
                                        from: userId,
                                        post_type: 12,
                                        notifId: '',
                                    };
                                    var clManager = req.app.get('wsClient');
                                    clManager.sendCommentNotification(recepients, notificationData);
                                    res.json({ status: 2, data: post.comments });
                                });
                            } else {
                                res.json({ status: 2, data: post.comments });
                            }
                        });
                });
        } else {
            res.json({ status: 0, message: 'please provide post id!' });
        }
    } else {
        res.json({ status: 0, message: 'Not Logged In!' });
    }
});

function getPostType(type) {
    return type == 1 ? 'message' : type == 2 ? 'question' : type == 3 ? 'photo' : type == 4 ? 'video' : type == 5 ? 'link' : type == 6 ? 'audio' : type == 7 ? 'document' : 'message';
}

function getWallType(type, post) {
    return type == 1 ? post.subject_id.name : type == 2 ? post.college_id.name : type == 3 ? post.degree_id.name : type == 5 ? 'timeline' : post.group_id.title
}

//post api to edit comment by comment ID
ctrl.post('/editComment/:commentId', function(req, res, next) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.body.post_id;
        var commentId = req.params.commentId;
        var cDate = new Date();
        if (postId) {
            Post.update({ _id: postId, 'comments._id': commentId }, {
                    $set: {
                        'comments.$': {
                            _id: commentId,
                            body: req.body.editComment,
                            date: cDate,
                            comment_by: userId,
                        }
                    }
                },
                function(err, data) {
                    if (err)
                        throw err;
                    Post.findOne({ '_id': postId })
                        .select('comments types post_type')
                        .populate({ path: 'comments.comment_by', select: 'fname lname photo _id' }).exec(function(err, post) {
                            if (err)
                                throw err;
                            title = "commented on Post";
                            res.json({ status: 2, data: post.comments });
                        });
                });
        } else {
            res.json({ status: 0, message: 'please provide post id!' });
        }
    } else {
        res.json({ status: 0, message: 'Not Logged In!' });
    }
});

//post api to add answer
ctrl.post('/addAnswer', function(req, res, next) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.body.post_id;
        var cDate = new Date();
        if (postId) {
            Post.findByIdAndUpdate(postId, {
                    $push: {
                        answer: {
                            body: req.body.answer,
                            ques_id: postId,
                            date: cDate,
                            created_by: userId,
                        }
                    }
                },
                function(err, data) {
                    if (err)
                        throw err;
                    Post.findOne({ '_id': postId })
                        .select('answer types post_type')
                        .populate({ path: 'answer.created_by', select: 'fname lname photo _id' }).exec(function(err, post) {
                            if (err)
                                throw err;
                            title = "answers on Post";
                            addpostevent(userId, postId, post.types, post.post_type, title, function(req, res) {});
                            res.json({ status: 2, data: post.answer });
                        });
                });
        } else {
            res.json({ status: 0, message: 'please provide post id!' });
        }
    } else {
        res.json({ status: 0, message: 'Not Logged In!' });
    }
});
ctrl.post('/editAnswer/:answerId', function(req, res, next) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.body.post_id;
        var answerId = req.params.answerId;

        var cDate = new Date();
        if (postId) {
            Post.update({ '_id': postId, 'answer._id': answerId }, {
                    $set: {
                        'answer.$': {
                            _id: answerId,
                            body: req.body.answer,
                            ques_id: postId,
                            date: cDate,
                            created_by: userId,
                        }
                    }
                },
                function(err, data) {
                    if (err)
                        throw err;
                    Post.findOne({ '_id': postId })
                        .select('answer types post_type')
                        .populate({ path: 'answer.created_by', select: 'fname lname photo _id' }).exec(function(err, post) {
                            if (err)
                                throw err;
                            title = "answers on Post";
                            addpostevent(userId, postId, post.types, post.post_type, title, function(req, res) {});
                            res.json({ status: 2, data: post.answer });
                        });
                });
        } else {
            res.json({ status: 0, message: 'please provide post id!' });
        }
    } else {
        res.json({ status: 0, message: 'Not Logged In!' });
    }
});
ctrl.get('/deleteComment/:id/:commentId', function(req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.params.id;
        var commentId = req.params.commentId;
        Post.find({
            $and: [
                { '_id': postId },
                { 'comments._id': commentId },
                { $or: [{ 'created_by': userId }, { 'comments.comment_by': userId }] }
            ]
        }, function(err, post) {
            if (err) {
                throw err;
            }
            if (post.length > 0) {
                Post.update({ _id: postId }, { $pull: { comments: { _id: commentId } } }, { safe: true },
                    function(err, post) {
                        if (err) {
                            throw err;
                        }
                        Post.findById({ '_id': postId })
                            .select('comments')
                            .populate({ path: 'comments.comment_by', select: 'fname lname photo _id' })
                            .exec(function(err, post) {
                                res.json({ status: 2, msg: "Comment deleted Successfully", userLoggedInId: userId, data: post.comments });
                            });
                    });
            } else {

                data = { status: 0, message: 'Comment not found' };
                res.json(data);
            }
        });
    } else {
        res.json({ status: 0, message: 'Not Logged In!' });
    }
});
ctrl.get('/deleteAnswer/:id/:answerId', function(req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.params.id;
        var answerId = req.params.answerId;
        Post.find({
            $and: [
                { '_id': postId },
                { 'answer._id': answerId },
                { $or: [{ 'created_by': userId }, { 'answer.created_by': userId }] }
            ]
        }, function(err, post) {
            if (err) {
                throw err;
            }
            if (post.length > 0) {
                Post.update({ _id: postId }, { $pull: { answer: { _id: answerId } } }, { safe: true },
                    function(err, post) {
                        if (err) {
                            throw err;
                        }
                        Post.findById({ '_id': postId })
                            .select('answer')
                            .populate({ path: 'answer.created_by', select: 'fname lname photo _id' })
                            .exec(function(err, post) {
                                res.json({ status: 2, msg: "Answer deleted Successfully", userLoggedInId: userId, data: post.answer });
                            });
                    });
            } else {
                data = { status: 0, message: 'answer not found' };
                res.json(data);
            }
        });
    } else {
        res.json({ status: 0, message: 'Not Logged In!' });
    }
});

ctrl.post('/addLike', function(req, res, next) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.body.post_id;
        var cDate = new Date();
        if (postId) {
            Post.findOne({ '_id': postId, 'likes.user_id': userId })
                .select('likes')
                .exec(function(err, exist) {
                    if (err)
                        throw err;
                    if (!exist) {
                        Post.findByIdAndUpdate(postId, {
                                $push: {
                                    likes: {
                                        user_id: userId,
                                    }
                                },
                            },
                            function(err, data) {
                                if (err)
                                    throw err;
                                Post.findOne({ '_id': postId })
                                    .select('likes')
                                    .populate({ path: 'created_by likes.user_id', select: 'fname lname photo _id' })
                                    .exec(function(err, post) {
                                        if (err)
                                            throw err;
                                        res.json({ status: 2, data: post.likes });
                                    });
                            });
                    } else {
                        Post.update({ '_id': postId }, {
                                $pull: {
                                    likes: {
                                        user_id: userId,
                                    }
                                },
                            },
                            function(err, data) {
                                if (err)
                                    throw err;
                                Post.findOne({ '_id': postId })
                                    .select('likes')
                                    .populate({ path: 'created_by likes.user_id', select: 'fname lname photo _id' })
                                    .exec(function(err, post) {
                                        if (err)
                                            throw err;
                                        res.json({ status: 2, data: post.likes });
                                    });
                            });
                    }
                });
        } else {
            res.json({ status: 0, message: 'please provide post id!' });
        }
    } else {
        res.json({ status: 0, message: 'Not Logged In!' });
    }
});

function getSubjectPostId(subject_id, callback) {
    Subject.findOne({ '_id': subject_id })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function(err, subject) {
            if (err)
                throw err;
            var data;
            if (subject.post)
                data = subject.post;
            var post_IDs = [];
            for (var i in data) {
                post_IDs.push(data[i].post_id);
            }
            callback(post_IDs);
        });
}

function getAllSubjectPostId(subject_id, callback) {
    Subject.find({ '_id': { $in: subject_id } })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function(err, subject) {
            var all_subjects = [];
            var all_subjects1 = [];
            var post_IDs = [];
            for (var i in subject) {
                all_subjects.push(subject[i].post);
            }
            for (var i in all_subjects) {
                all_subjects1 = all_subjects[i];
                for (var j in all_subjects1) {
                    post_IDs.push(all_subjects1[j].post_id);
                }
            }
            callback(post_IDs);
        });
}

ctrl.post('/editSubMsgPost', function(req, res) {
    if (req.session.passport) {
        Post.update({ _id: req.body._id }, {
                $set: {
                    '_id': req.body._id,
                    'message': req.body.message,
                }
            },
            function(err, data) {
                if (err)
                    throw err;
                Post.findOne({ '_id': req.body._id })
                    .select('types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .exec(function(err, result) {
                        if (err) {
                            throw err
                        }
                        return res.json({ status: 2, data: result });
                    });
            });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

ctrl.post('/editSubImgPost', function(req, res) {
    if (req.session.passport) {
        Post.update({ _id: req.body._id }, {
                $set: {
                    '_id': req.body._id,
                    'name': req.body.name,
                }
            },
            function(err, data) {
                if (err)
                    throw err;
                Post.findOne({ '_id': req.body._id })
                    .select('types post_type catagory created_by created_on likes name flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .exec(function(err, result) {
                        if (err) {
                            throw err
                        }
                        return res.json({ status: 2, data: result });
                    });
            });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});
/*****************  Create Post Api's ****************************************/

//post any type of data 
ctrl.post('/postAllTypeData/:subjectId', function(req, res) {
    console.log('req.params.customIds;', req.params.customIds);
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var subjectId = req.params.subjectId;
    var userId = req.session.passport.user;
    var title = '';
    var post_type = '';
    var newPost = new Post();
    if (req.session.passport) {
        if (req.body.linkTitle != '' || req.body.link != '' || req.body.message != '' || req.body.question != '') {
            newPost.created_by = userId;
            newPost.created_on = req.body.created_on;
            newPost.message = req.body.message;
            newPost.question = req.body.question;
            newPost.subject_id = subjectId;
            if (req.body.message) {
                post_type = 1;
                title = "posted a Status";
            }
            if (req.body.question) {
                post_type = 2;
                title = "posted a Question";
            }
            if (req.body.link) {
                post_type = 5;
                title = "posted a Link";
            }
            newPost.post_type = post_type;
            newPost.types = req.body.types; //subject
            newPost.privacy = req.body.privacy;
            newPost.custom = req.body.custom ? req.body.custom : [];
            newPost.catagory = req.body.catagory;
            newPost.save(function(err, newPost) {
                if (err) {
                    throw err;
                }
                Subject.findByIdAndUpdate(subjectId, {
                    $push: {
                        post: {
                            post_id: newPost._id,
                            created_by: userId,
                        }
                    }
                }, function(err, newSubject) {
                    if (err)
                        throw err
                    addpostevent(userId, newPost._id, req.body.types, post_type, title, function(req, res) {});
                    if (req.body.linkTitle || req.body.link) {
                        newPost.link.title = req.body.linkTitle;
                        newPost.link.description = req.body.link;
                        Post.findByIdAndUpdate(newPost._id, {
                            $push: {
                                link: {
                                    title: newPost.link.title,
                                    description: newPost.link.description,
                                }
                            }
                        }, function(err, newPostAgain) {
                            if (err) {
                                throw err
                            }
                        });
                    }
                    Post.findOne({ '_id': newPost._id })
                        .select('types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .exec(function(err, result) {
                            if (err) {
                                throw err
                            }
                            return res.json({ status: 2, data_post: result, data_subject: newSubject });
                        });
                });
            });
        } else {
            return res.json({ status: 0, msg: "please enter a valid value" });
        }
    } else {
        return res.json({ status: 0, msg: "user not logged in" });
    }
});

ctrl.post('/editSubMsgPost', function(req, res) {
    if (req.session.passport) {
        Post.update({ _id: req.body._id }, {
                $set: {
                    '_id': req.body._id,
                    'message': req.body.message,
                }
            },
            function(err, data) {
                if (err)
                    throw err;
                Post.findOne({ '_id': req.body._id })
                    .select('types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .exec(function(err, result) {
                        if (err) {
                            throw err
                        }
                        return res.json({ status: 2, data: result });
                    });
            });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.post('/editSubImgPost', function(req, res) {
    if (req.session.passport) {
        Post.update({ _id: req.body._id }, {
                $set: {
                    '_id': req.body._id,
                    'name': req.body.name,
                }
            },
            function(err, data) {
                if (err)
                    throw err;
                Post.findOne({ '_id': req.body._id })
                    .select('types post_type catagory created_by created_on likes flag comments message name question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .exec(function(err, result) {
                        if (err) {
                            throw err
                        }
                        return res.json({ status: 2, data: result });
                    });
            });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.post('/shareOnTimeline/:types/:post_type/:share_privacy/:post_id', function(req, res) {
    var Post = require('../models/post');
    var Event = require('../models/event');
    var date = new Date();
    var userId = req.session.passport.user;
    var post_id = req.params.post_id;
    var newEvent = new Event();
    if (req.session.passport) {
        Post.update({ _id: post_id }, { $set: { share_privacy: req.params.share_privacy, share_custom: req.body.shareCustom } }, function(err, post) {});
        Post.find({ _id: post_id, "share.user_id": userId }, function(err, post) {
            if (post.length == 0) {
                Post.findByIdAndUpdate(post_id, {
                        $push: {
                            share: {
                                user_id: userId,
                            }
                        }
                    },
                    function(err, entry) {
                        if (err) {
                            throw err
                        }
                        newEvent.post_id = post_id;
                        newEvent.created_by = userId;
                        newEvent.timestamp = new Date();
                        if (req.params.post_type != '') {
                            if (req.params.post_type == 1) {
                                newEvent.title = 'shared a message';
                            } else if (req.params.post_type == 2) {
                                newEvent.title = 'shared a question';
                            } else if (req.params.post_type == 3) {
                                newEvent.title = 'shared a photo';
                            } else if (req.params.post_type == 4) {
                                newEvent.title = 'shared a video';
                            } else if (req.params.post_type == 5) {
                                newEvent.title = 'shared a link';
                            } else if (req.params.post_type == 6) {
                                newEvent.title = 'shared an audio';
                            } else if (req.params.post_type == 7) {
                                newEvent.title = 'shared a document';
                            } else if (req.params.post_type == 8) {
                                newEvent.title = 'shared a post';
                            }
                        }
                        if (req.params.types != '') {
                            newEvent.type = req.params.types;
                        }
                        if (req.params.post_type != '') {
                            newEvent.post_type = req.params.post_type;
                        }
                        newEvent.save(function(err, newEvent) {
                            if (err) {
                                throw err;
                            }
                            Post.find({ _id: post_id }, function(err, sharePost) {
                                if (err)
                                    throw err;
                                res.json({ status: 2, msg: "data updated in events", data: sharePost });
                            });
                        });
                    });
            } else {
                res.json({ status: 1, msg: "Post already shared" });
            }
        });
    }
});

ctrl.post('/postPhotosTypeFiles/:subjectId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var subjectId = req.params.subjectId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.subject_id = subjectId;
        newFilePost.post_type = 3;
        post_type = 3;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.name = req.body.name;
            newFilePost.types = req.body.types; //subject
            newFilePost.catagory = req.body.catagory;
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            newFilePost.save(function(err, newFilePost) {
                if (err) {
                    throw err;
                }
                var f_name;
                if (req.file.originalname == 'blob') {
                    f_name = new Date().getTime();
                } else {
                    var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                }
                var ext = req.file.originalname.split('.').pop();
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                filename = filename.replace(/\s/g, '');
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Subject/Photos/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            var easyimg = require('easyimage');
                            easyimg.rescrop({
                                src: uploadpath + '/' + filename,
                                dst: uploadpath + '/' + filename,
                                width: 400,
                            }).then(
                                function(image) {
                                    console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                                },
                                function(err) {
                                    console.log(err);
                                }
                            );
                            Subject.findByIdAndUpdate(subjectId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newSubject) {
                                if (err) {
                                    throw err
                                }
                                Post.findByIdAndUpdate(newFilePost._id, {
                                        photo: {
                                            file_name: filename,
                                        }
                                    },
                                    function(err, userId1) {
                                        if (err)
                                            throw err;
                                        title = "posted a Photo";
                                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                                        Post.findOne({ '_id': newFilePost._id })
                                            .select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                            .exec(function(err, result) {
                                                if (err) {
                                                    throw err
                                                }
                                                res.json({ status: 2, msg: "Photo Uploaded Successfully", data: result });
                                            });
                                    });
                            });
                        });
                    } else {
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.post('/postVideosTypeFiles/:subjectId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var subjectId = req.params.subjectId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 4;
        post_type = 4;
        newFilePost.subject_id = subjectId;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.name = req.body.name;
            newFilePost.types = req.body.types; //subject
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            newFilePost.catagory = req.body.catagory;
            newFilePost.save(function(err, newFilePost) {
                if (err) {
                    throw err;
                }
                if (req.file.originalname == 'blob') {
                    f_name = new Date().getTime();
                    if (req.file.mimetype == 'video/3gpp') {
                        var ext = '3gp';
                    } else {
                        var ext = 'mp4';
                    }
                } else {
                    var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                    var ext = req.file.originalname.split('.').pop();
                }
                // var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Subject/Videos/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        //do something with contents
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Subject.findByIdAndUpdate(subjectId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newSubject) {
                                if (err) {
                                    throw err
                                }
                                Post.findByIdAndUpdate(newFilePost._id, {
                                        video: {
                                            file_name: filename,
                                        }
                                    },
                                    function(err, userId1) {
                                        if (err)
                                            throw err;
                                        title = "posted a Video";
                                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});

                                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                            .exec(function(err, result) {
                                                if (err) {
                                                    throw err
                                                }
                                                res.json({ status: 2, msg: "Video Uploaded Successfully", data: result });
                                            });
                                    });
                            });
                        });
                    } else {
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});
ctrl.post('/postVideoEmbedLink/:subjectId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var subjectId = req.params.subjectId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 4;
        newFilePost.subject_id = subjectId;
        post_type = 4;
        newFilePost.created_on = req.body.created_on;
        newFilePost.name = req.body.name;
        newFilePost.types = req.body.types; //subject
        newFilePost.catagory = req.body.catagory;
        newFilePost.privacy = req.body.privacy;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        var link = req.body.link;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            Subject.findByIdAndUpdate(subjectId, {
                $push: {
                    post: {
                        post_id: newFilePost._id,
                        created_by: userId,
                    }
                }
            }, function(err, newSubject) {
                if (err) {
                    throw err
                }
                Post.findByIdAndUpdate(newFilePost._id, {
                        video: {
                            title: link
                        }
                    },
                    function(err, userId1) {
                        if (err)
                            throw err;
                        title = "posted a Video";
                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                            .exec(function(err, result) {
                                if (err) {
                                    throw err;
                                }
                                res.json({ status: 2, msg: "Embed Link Uploaded Successfully", data: result });
                            });
                    });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});
ctrl.post('/postAudioEmbedLink/:subjectId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var subjectId = req.params.subjectId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //subject
        newFilePost.privacy = req.body.privacy;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        newFilePost.catagory = req.body.catagory;
        newFilePost.post_type = 6;
        newFilePost.created_on = req.body.created_on;
        newFilePost.subject_id = subjectId;
        newFilePost.name = req.body.name;
        post_type = 6;
        var link = req.body.link;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            Subject.findByIdAndUpdate(subjectId, {
                $push: {
                    post: {
                        post_id: newFilePost._id,
                        created_by: userId,
                    }
                }
            }, function(err, newSubject) {
                if (err) {
                    throw err
                }
                Post.findByIdAndUpdate(newFilePost._id, {
                        audio: {
                            title: link
                        }
                    },
                    function(err, userId1) {
                        if (err)
                            throw err;
                        title = "posted an audio";
                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                            .exec(function(err, result) {
                                if (err) {
                                    throw err;
                                }
                                res.json({ status: 2, msg: "Embed Link Uploaded Successfully", data: result });
                            });
                    });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});
ctrl.post('/postPhotoEmbedLink/:subjectId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var subjectId = req.params.subjectId;
    var userId = req.session.passport.user;
    var link = req.body.link;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //subject
        newFilePost.privacy = req.body.privacy;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        newFilePost.catagory = req.body.catagory;
        newFilePost.created_on = req.body.created_on;
        newFilePost.subject_id = subjectId;
        newFilePost.name = req.body.name;
        newFilePost.post_type = 3;
        post_type = 3;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            Subject.findByIdAndUpdate(subjectId, {
                $push: {
                    post: {
                        post_id: newFilePost._id,
                        created_by: userId,
                    }
                }
            }, function(err, newSubject) {
                if (err) {
                    throw err
                }
                Post.findByIdAndUpdate(newFilePost._id, {
                        photo: {
                            title: link
                        }
                    },
                    function(err, userId1) {
                        if (err)
                            throw err;
                        title = "posted a photo";
                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                            .exec(function(err, result) {
                                if (err) {
                                    throw err;
                                }
                                res.json({ status: 2, msg: "Embed Link Uploaded Successfully", data: result });
                            });
                    });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});

ctrl.post('/postAudiosTypeFiles/:subjectId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var subjectId = req.params.subjectId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 6;
        newFilePost.subject_id = subjectId;
        post_type = 6;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //subject
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            newFilePost.catagory = req.body.catagory;
            if (req.body.name) {
                newFilePost.name = req.body.name;
            }
            newFilePost.save(function(err, newFilePost) {
                if (err) {
                    throw err;
                }
                //audio uploading changes for app start
                if (req.file.originalname == 'blob') {
                    f_name = new Date().getTime();
                    if (req.file.mimetype == 'audio/wav') {
                        var ext = 'wav';
                    } else {
                        var ext = 'mp3';
                    }
                } else {
                    var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                    var ext = req.file.originalname.split('.').pop();
                }
                //audio uploading changes for app end

                // var ext = req.file.originalname.split('.').pop();
                // var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Subject/Audios/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        //do something with contents
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Subject.findByIdAndUpdate(subjectId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newSubject) {
                                if (err) {
                                    throw err
                                }
                                Post.findByIdAndUpdate(newFilePost._id, {
                                        audio: {
                                            file_name: filename,
                                        }
                                    },
                                    function(err, userId1) {
                                        if (err)
                                            throw err;
                                        title = "posted an Audio";
                                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                                        Post.findOne({ '_id': newFilePost._id })
                                            .select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                            .exec(function(err, result) {
                                                if (err) {
                                                    throw err
                                                }
                                                res.json({ status: 2, msg: "Audio Uploaded Successfully", data: result });
                                            });
                                    });
                            });
                        });
                    } else {
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged In" });
    }
});

ctrl.post('/postDocumentsTypeFiles/:subjectId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var subjectId = req.params.subjectId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 7;
        post_type = 7;
        newFilePost.subject_id = subjectId;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.name = req.body.name;
            newFilePost.types = req.body.types; //subject
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            newFilePost.catagory = req.body.catagory;
            newFilePost.save(function(err, newFilePost) {
                if (err) {
                    throw err;
                }
                var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                var ext = req.file.originalname.split('.').pop();
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Subject/Documents/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        //do something with contents
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Subject.findByIdAndUpdate(subjectId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newSubject) {
                                if (err) {
                                    throw err
                                }
                                Post.findByIdAndUpdate(newFilePost._id, {
                                        document: {
                                            file_name: filename,
                                        }
                                    },
                                    function(err, userId1) {
                                        if (err)
                                            throw err;
                                        title = "posted a Document";
                                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});

                                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                            .exec(function(err, result) {
                                                if (err) {
                                                    throw err
                                                }
                                                res.json({ status: 2, msg: "Document Uploaded Successfully", data: result });
                                            });
                                    });
                            });
                        });
                    } else {
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

/*********************************** Delete Api's***************************************/

ctrl.get('/delete/:id/:subjectId', function(req, res) {
    var Post = require('../models/post');
    var Journal = require('../models/journal');
    var PostsFeedback = require('../models/postsfeedback');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.params.id;
        var subjectId = req.params.subjectId;
        Post.find({ '_id': postId }, function(err, post) {
            if (err) {
                throw err;
            }
            if (post.length > 0) {
                if (post[0].created_by == userId) {
                    Post.remove({ '_id': postId }, function(err, post) {
                        if (err)
                            throw err;
                        Subject.update({ _id: subjectId }, { $pull: { post: { post_id: postId } } }, { multi: true }, function(err, post) {
                            if (err)
                                throw err;
                            PostsFeedback.find({ 'post_id': postId })
                                .remove()
                                .exec((err, data) => {});
                            Journal.update({ user_id: userId }, { $pull: { posts: { post_id: postId } } }, { multi: true }, function(err, journals) {
                                data = { message: 'Post deleted' };
                                res.json({ status: 2, data: data });
                            });
                        });
                    });
                } else {
                    data = { message: 'Post Is Not Created By You' };
                    res.json({ status: 0, data: data });
                }
            } else {
                data = { message: 'Post not found' };
                res.json({ status: 0, data: data });
            }
        });
    } else {
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});

/*********************************** Share Post On TimeLine or Friend's TimeLine***************************************/

// share post on own timeline

ctrl.post('/sharePostOnTimeLine', function(req, res) {
    var userId = req.session.passport.user;
    var newEvent = new Event();
    var newPost = new Post(req.body);
    newPost.created_by = userId;
    newPost.custom = req.body.custom;
    newPost.created_on = new Date();
    if (req.session.passport) {
        newPost.save(function(err, post) {
            if (err)
                throw err;
            newEvent.post_id = post._id;
            newEvent.created_by = userId;
            newEvent.timestamp = new Date();
            newEvent.title = post.post_type == 1 ? 'shared a message' : post.post_type == 2 ? 'shared a question' : post.post_type == 3 ? 'shared a photo' : post.post_type == 4 ? 'shared a video' : post.post_type == 5 ? 'shared a link' : post.post_type == 6 ? 'shared an audio' : post.post_type == 7 ? 'shared a document' : 'shared a post';
            newEvent.type = post.types;
            newEvent.post_type = post.post_type;
            newEvent.created_on = new Date();
            if (req.body.subject_id) {
                Subject.findByIdAndUpdate(req.body.subject_id, {
                    $push: {
                        post: {
                            post_id: post._id,
                            created_by: userId,
                        }
                    }
                }, function(err, newSubject) {
                    if (err)
                        throw err
                });
            }
            if (req.body.college_id) {
                College.findByIdAndUpdate(req.body.college_id, {
                    $push: {
                        post: {
                            post_id: post._id,
                            created_by: userId,
                        }
                    }
                }, function(err, newCollege) {
                    if (err)
                        throw err
                });
            }
            if (req.body.degree_id) {
                Degree.findByIdAndUpdate(req.body.degree_id, {
                    $push: {
                        post: {
                            post_id: post._id,
                            created_by: userId,
                        }
                    }
                }, function(err, newDegree) {
                    if (err)
                        throw err
                });
            }
            if (req.body.group_id) {
                Group.findByIdAndUpdate(req.body.group_id, {
                    $push: {
                        post: {
                            post_id: post._id,
                            created_by: userId,
                        }
                    }
                }, function(err, newGroup) {
                    if (err)
                        throw err
                });
            }
            newEvent.save(function(err, newEvent) {
                if (err) {
                    throw err;
                }
                res.json({ status: 2, msg: "Post Shared Successfully" });
            });
        });
    } else {
        res.json({ status: 0, msg: "user not loggedIn" });
    }
});

/***********************************  Advanced Subject search **********************************/

// search api of subject post

ctrl.get('/getAllSearchPostsBySubjectId/:id/:counterList/:searchDateFrom/:searchDateTo/:category/:whoPostedValue', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var searchDateTo = req.params.searchDateTo;
    var searchDateFrom = req.params.searchDateFrom;
    var category = req.params.category;
    var whoPostedValue = req.params.whoPostedValue;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        checkUserWalls(logged, function(data1) {
            var categoryCondition;
            if (category == 0) {
                categoryCondition = { $in: [1, 2, 3, 4] };
            } else {
                categoryCondition = { $in: [category] };
            }
            if (whoPostedValue == 1) {
                Post.find({
                        'subject_id': id,
                        catagory: categoryCondition,
                        created_on: { '$gte': searchDateFrom, '$lte': searchDateTo },
                        $or: [{ privacy: 1 },
                            { created_by: logged, 'share_type': 1 },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_friend } },
                                    { $or: [{ privacy: { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] },
                                ]
                            },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_following } },
                                    { privacy: { $in: [1, 4, 6] } }
                                ]
                            }
                        ]
                    })
                    .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec(function(err, result) {
                        res.json({ data: result, isResult: logged });
                    });
            } else if (whoPostedValue == 2) {
                getFriendsEmailIds(logged, function(data) {
                    Post.find({
                            'subject_id': id,
                            catagory: categoryCondition,
                            created_on: { '$gte': searchDateFrom, '$lte': searchDateTo },
                            created_by: { $in: data.ids },
                            $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [logged] }]
                        })
                        .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .exec(function(err, result) {
                            res.json({ data: result, isResult: logged });
                        });
                });
            }
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

// get all post data on search (On Scroll)

ctrl.get('/getAllScrollSearchPostsBySubjectId/:id/:counterList/:searchDateFrom/:searchDateTo/:category/:whoPostedValue', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var searchDateFrom = req.params.searchDateFrom;
    var searchDateTo = req.params.searchDateTo;
    var category = req.params.category;
    var whoPostedValue = req.params.whoPostedValue;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        checkUserWalls(logged, function(data1) {
            var categoryCondition;
            if (category == 0) {
                categoryCondition = { $in: [1, 2, 3, 4] };
            } else {
                categoryCondition = { $in: [category] };
            }
            if (whoPostedValue == 1) {
                Post.find({
                        'subject_id': id,
                        catagory: categoryCondition,
                        created_on: { '$gte': searchDateFrom, '$lt': searchDateTo },
                        $or: [{ privacy: 1 },
                            { created_by: logged, 'share_type': 1 },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_friend } },
                                    { $or: [{ privacy: { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] },
                                ]
                            },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_following } },
                                    { privacy: { $in: [1, 4, 6] } }
                                ]
                            }
                        ]
                    })
                    .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec(function(err, result) {
                        res.json({ data: result, isResult: logged });
                    });
            } else if (whoPostedValue == 2) {
                getFriendsEmailIds(logged, function(data) {
                    Post.find({
                            'subject_id': id,
                            catagory: categoryCondition,
                            created_on: { '$lt': searchDateTo, '$gte': searchDateFrom },
                            created_by: { $in: data.ids },
                            $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [logged] }]
                        })
                        .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .exec(function(err, result) {
                            res.json({ data: result, isResult: logged });
                        });
                });
            }
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

// get Count For serach data
ctrl.get('/countSearchPostsBySubjectId/:id/:searchDateFrom/:searchDateTo/:category/:whoPostedValue', function(req, res) {
    var sort = { 'created_on': -1 };
    var searchDateFrom = req.params.searchDateFrom;
    var searchDateTo = req.params.searchDateTo;
    var category = req.params.category;
    var whoPostedValue = req.params.whoPostedValue;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        var categoryCondition;
        if (category == 0) {
            categoryCondition = { $in: [1, 2, 3, 4] };
        } else {
            categoryCondition = { $in: [category] };
        }
        checkUserWalls(logged, function(data1) {
            if (whoPostedValue == 1) {
                Post.count({
                        'subject_id': id,
                        catagory: categoryCondition,
                        created_on: { '$gte': searchDateFrom, '$lt': searchDateTo },
                        $or: [{ privacy: 1 },
                            { created_by: logged, 'share_type': 1 },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_friend } },
                                    { $or: [{ privacy: { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] },
                                ]
                            },
                            {
                                $and: [
                                    { created_by: { $in: data1.current_following } },
                                    { privacy: { $in: [1, 4, 6] } }
                                ]
                            }
                        ]
                    })
                    .exec(function(err, result) {
                        res.json({ data: result, isResult: logged });
                    });
            } else if (whoPostedValue == 2) {
                getFriendsEmailIds(logged, function(data) {
                    Post.count({
                            'subject_id': id,
                            catagory: categoryCondition,
                            created_on: { '$gte': searchDateFrom, '$lt': searchDateTo },
                            created_by: { $in: data.ids },
                            $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [logged] }]
                        })
                        .exec(function(err, result) {
                            res.json({ data: result, isResult: logged });
                        });
                });
            }
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

/*********************************Get my Wall All Post by post type****************************/
ctrl.get('/getMyWallPosts/:postType/:counterList', function(req, res) {
    if (req.session.passport) {
        var loggedUserId = req.session.passport.user;
        var counterList = req.params.counterList;
        var postType = req.params.postType;
        RuleOfPost.findOne({ 'user_id': loggedUserId }, function(err, post_settings) {
            if (err)
                throw err;
            if (post_settings.post_status === 1) {
                getMyWallPostSettingCheck(loggedUserId, postType, counterList, function(data) {
                    res.json({ status: 2, data: data.posts, total_post: data.total_post });
                });
            } else {
                getMyWallPostSettingUnCheck(loggedUserId, postType, counterList, function(data) {
                    res.json({ status: 2, data: data.posts, total_post: data.total_post });
                });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User Not Logged In' });
    }
});

function getMyWallPostSettingUnCheck(userId, postType, counterList, callback) {
    var limit = 10;
    var counterList = counterList;
    var postTypeCondition;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    checkUserWalls(userId, function(data1) {
        getReportedPostIds(function(reportedPostIds) {
            if (postType == 10) {
                postTypeCondition = { $in: [1, 2, 3, 4, 5, 6, 7, 8] }; //post type
            } else {
                postTypeCondition = { $in: [postType] };
            }
            Post.find({
                    'post_type': postTypeCondition,
                    '_id': { $nin: reportedPostIds },
                    $or: [
                        { 'created_by': userId, 'share_type': 1 },
                        {
                            $and: [
                                { 'created_by': { $in: data1.current_friend } },
                                { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                                { $or: [{ 'subject_id': { $in: data1.current_subjects } }, { 'college_id': { $in: data1.current_college } }, { 'degree_id': { $in: data1.current_degree } }] }
                            ]
                        },
                        {
                            $and: [
                                { 'created_by': { $in: data1.current_following } },
                                { 'privacy': { $in: [1, 4, 6] } },
                                { $or: [{ 'subject_id': { $in: data1.current_subjects } }, { 'college_id': { $in: data1.current_college } }, { 'degree_id': { $in: data1.current_degree } }] }
                            ]
                        }
                    ]
                })
                .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom share_type')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id college_id degree_id', select: 'fname lname photo name _id' })
                .populate({
                    path: 'group_id',
                    model: 'Group',
                    select: 'title subject_id college_id degree_id',
                    populate: {
                        path: 'subject_id college_id degree_id',
                        select: '_id name'
                    }
                })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    Post.count({
                        'post_type': postTypeCondition,
                        '_id': { $nin: reportedPostIds },
                        $or: [
                            { 'created_by': userId, 'share_type': 1 },
                            {
                                $and: [
                                    { 'created_by': { $in: data1.current_friend } },
                                    { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                                    { $or: [{ 'subject_id': { $in: data1.current_subjects } }, { 'college_id': { $in: data1.current_college } }, { 'degree_id': { $in: data1.current_degree } }] }
                                ]
                            },
                            {
                                $and: [
                                    { 'created_by': { $in: data1.current_following } },
                                    { 'privacy': { $in: [1, 4, 6] } },
                                    { $or: [{ 'subject_id': { $in: data1.current_subjects } }, { 'college_id': { $in: data1.current_college } }, { 'degree_id': { $in: data1.current_degree } }] }
                                ]
                            }
                        ]
                    }, function(err, data) {
                        if (err)
                            throw err;
                        callback({ posts: result, total_post: data });
                    })
                });
        });
    });
}

function getMyWallPostSettingCheck(userId, postType, counterList, callback) {
    var limit = 10;
    var counterList = counterList;
    var postTypeCondition;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    checkUserWalls(userId, function(data1) {
        getReportedPostIds(function(reportedPostIds) {
            if (postType == 10) {
                postTypeCondition = { $in: [1, 2, 3, 4, 5, 6, 7, 8] }; //post type
            } else {
                postTypeCondition = { $in: [postType] };
            }
            Post.find({
                    'post_type': postTypeCondition,
                    '_id': { $nin: reportedPostIds },
                    $or: [
                        { 'created_by': userId, 'share_type': 1 },
                        {
                            $and: [
                                { 'created_by': { $in: data1.current_friend } },
                                { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                            ]
                        },
                        {
                            $and: [
                                { 'created_by': { $in: data1.current_following } },
                                { 'privacy': { $in: [1, 4, 6] } },
                            ]
                        }
                    ]
                })
                .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom share_type')
                .populate({ path: 'created_by likes.user_id flag.user_id origin_creator comments.comment_by share.user_id subject_id college_id degree_id', select: 'fname lname photo name _id' })
                .populate({
                    path: 'group_id',
                    model: 'Group',
                    select: 'title subject_id college_id degree_id',
                    populate: {
                        path: 'subject_id college_id degree_id',
                        select: '_id name'
                    }
                })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    Post.count({
                        'post_type': postTypeCondition,
                        '_id': { $nin: reportedPostIds },
                        $or: [
                            { 'created_by': userId, 'share_type': 1 },
                            {
                                $and: [
                                    { 'created_by': { $in: data1.current_friend } },
                                    { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                                ]
                            },
                            {
                                $and: [
                                    { 'created_by': { $in: data1.current_following } },
                                    { 'privacy': { $in: [1, 4, 6] } },
                                ]
                            }
                        ]
                    }, function(err, data) {
                        if (err)
                            throw err;
                        callback({ posts: result, total_post: data });
                    })
                });
        });
    });
}
/********************************* My Wall Search Api by post type****************************/
ctrl.post('/myWallSearch/:postType/:counter', function(req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var collegesIds = req.body.collegeIds;
        var degreeIds = req.body.degreeIds;
        var subjectIds = req.body.subjectIds;
        var counterList = req.params.counter;
        var postType = req.params.postType;
        RuleOfPost.findOne({ 'user_id': userId }, function(err, post_settings) {
            if (err)
                throw err;
            if (post_settings.post_status === 1) {
                getMyWallSearchPostSettingCheck(userId, postType, counterList, subjectIds, collegesIds, degreeIds, function(data) {
                    res.json({ status: 2, data: data.posts, total_post: data.total_post });
                });
            } else {
                getMyWallSearchPostSettingUnCheck(userId, postType, counterList, subjectIds, collegesIds, degreeIds, function(data) {
                    res.json({ status: 2, data: data.posts, total_post: data.total_post });
                });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User not logged in' });
    }
});

function getMyWallSearchPostSettingUnCheck(userId, postType, counterList, subjectIds, collegesIds, degreeIds, callback) {
    var limit = 10;
    var counterList = counterList;
    var postTypeCondition;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    checkUserWalls(userId, function(data1) {
        if (postType == 10) {
            postTypeCondition = { $in: [1, 2, 3, 4, 5, 6, 7, 8] }; //post type
        } else {
            postTypeCondition = { $in: [postType] };
        }
        Post.find({
                'post_type': postTypeCondition,
                $or: [{
                        $and: [
                            { 'created_by': userId, 'share_type': 1 },
                            { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                        ]
                    },
                    {
                        $and: [
                            { 'created_by': { $in: data1.current_friend } },
                            { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                            { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                        ]
                    },
                    {
                        $and: [
                            { 'created_by': { $in: data1.current_following } },
                            { 'privacy': { $in: [1, 4, 6] } },
                            { $or: [{ 'subject_id': { $in: collegesIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                        ]
                    }
                ]
            })
            .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom share_type')
            .populate({ path: 'created_by likes.user_id flag.user_id subject_id college_id degree_id comments.comment_by share.user_id origin_creator', select: 'fname name lname photo _id' })
            .populate({
                path: 'group_id',
                model: 'Group',
                select: 'title subject_id college_id degree_id',
                populate: {
                    path: 'subject_id college_id degree_id',
                    select: '_id name'
                }
            })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function(err, result) {
                Post.count({
                    'post_type': postTypeCondition,
                    $or: [{
                            $and: [
                                { 'created_by': userId, 'share_type': 1 },
                                { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                            ]
                        },
                        {
                            $and: [
                                { 'created_by': { $in: data1.current_friend } },
                                { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                                { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                            ]
                        },
                        {
                            $and: [
                                { 'created_by': { $in: data1.current_following } },
                                { 'privacy': { $in: [1, 4, 6] } },
                                { $or: [{ 'subject_id': { $in: collegesIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                            ]
                        }
                    ]
                }, function(err, data) {
                    if (err)
                        throw err;
                    callback({ posts: result, total_post: data });
                })
            });
    });
}

function getMyWallSearchPostSettingCheck(userId, postType, counterList, subjectIds, collegesIds, degreeIds, callback) {
    var limit = 10;
    var counterList = counterList;
    var postTypeCondition;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    checkUserWalls(userId, function(data1) {
        if (postType == 10) {
            postTypeCondition = { $in: [1, 2, 3, 4, 5, 6, 7, 8] }; //post type
        } else {
            postTypeCondition = { $in: [postType] };
        }
        Post.find({
                'post_type': postTypeCondition,
                $or: [{
                        $and: [
                            { 'created_by': userId, 'share_type': 1 },
                            { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                        ]
                    },
                    {
                        $and: [
                            { 'created_by': { $in: data1.current_friend } },
                            { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                            { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                        ]
                    },
                    {
                        $and: [
                            { 'created_by': { $in: data1.current_following } },
                            { 'privacy': { $in: [1, 4, 6] } },
                            { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                        ]
                    }
                ]
            })
            .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom share_type')
            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id subject_id college_id degree_id origin_creator', select: 'fname lname photo name _id' })
            .populate({
                path: 'group_id',
                model: 'Group',
                select: 'title subject_id college_id degree_id',
                populate: {
                    path: 'subject_id college_id degree_id',
                    select: '_id name'
                }
            })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function(err, result) {
                Post.count({
                    'post_type': postTypeCondition,
                    $or: [{
                            $and: [
                                { 'created_by': userId, 'share_type': 1 },
                                { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                            ]
                        },
                        {
                            $and: [
                                { 'created_by': { $in: data1.current_friend } },
                                { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                                { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                            ]
                        },
                        {
                            $and: [
                                { 'created_by': { $in: data1.current_following } },
                                { 'privacy': { $in: [1, 4, 6] } },
                                { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] }
                            ]
                        }
                    ]
                }, function(err, data) {
                    if (err)
                        throw err;
                    callback({ posts: result, total_post: data });
                })
            });
    });
}

// ***************************************timeline add post api************************************************

ctrl.post('/postTimelinePhotosTypeFiles', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 3;
        post_type = 3;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.name = req.body.name;
            newFilePost.types = req.body.types; //user timeline
            newFilePost.catagory = req.body.catagory;
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            newFilePost.save(function(err, newFilePost) {
                if (err) {
                    throw err;
                }
                var f_name;
                if (req.file.originalname == 'blob') {
                    f_name = new Date().getTime();
                } else {
                    var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                }
                var ext = req.file.originalname.split('.').pop();
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                filename = filename.replace(/\s/g, '');
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Timeline/Photos/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            var easyimg = require('easyimage');
                            easyimg.rescrop({
                                src: uploadpath + '/' + filename,
                                dst: uploadpath + '/' + filename,
                                width: 400,
                            }).then(
                                function(image) {
                                    console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                                },
                                function(err) {
                                    console.log(err);
                                }
                            );
                            Post.findByIdAndUpdate(newFilePost._id, {
                                    photo: {
                                        file_name: filename,
                                    }
                                },
                                function(err, userId1) {
                                    if (err)
                                        throw err;
                                    title = "posted a Photo";
                                    addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});

                                    Post.findOne({ '_id': newFilePost._id })
                                        .select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                        .exec(function(err, result) {
                                            if (err) {
                                                throw err
                                            }
                                            res.json({ status: 2, msg: "Photo Uploaded Successfully", data: result });
                                        });
                                });
                        });
                    } else {
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.post('/postTimelineVideosTypeFiles', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 4;
        post_type = 4;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.name = req.body.name;
            newFilePost.types = req.body.types; //user timeline
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            newFilePost.catagory = req.body.catagory;
            newFilePost.save(function(err, newFilePost) {
                if (err) {
                    throw err;
                }
                if (req.file.originalname == 'blob') {
                    f_name = new Date().getTime();
                    if (req.file.mimetype == 'video/3gpp') {
                        var ext = '3gp';
                    } else {
                        var ext = 'mp4';
                    }
                } else {
                    var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                    var ext = req.file.originalname.split('.').pop();
                }
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Timeline/Videos/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Post.findByIdAndUpdate(newFilePost._id, {
                                    video: {
                                        file_name: filename,
                                    }
                                },
                                function(err, userId1) {
                                    if (err)
                                        throw err;
                                    title = "posted a Video";
                                    addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});

                                    Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                        .exec(function(err, result) {
                                            if (err) {
                                                throw err
                                            }
                                            res.json({ status: 2, msg: "Video Uploaded Successfully", data: result });
                                        });
                                });
                        });
                    } else {
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});
ctrl.post('/postTimelineVideoEmbedLink', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 4;
        post_type = 4;
        newFilePost.created_on = req.body.created_on;
        newFilePost.name = req.body.name;
        newFilePost.types = req.body.types; //user timeline
        newFilePost.catagory = req.body.catagory;
        newFilePost.privacy = req.body.privacy;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        var link = req.body.link;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            Post.findByIdAndUpdate(newFilePost._id, {
                    video: {
                        title: link
                    }
                },
                function(err, userId1) {
                    if (err)
                        throw err;
                    title = "posted a Video";
                    addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                    Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .exec(function(err, result) {
                            if (err) {
                                throw err;
                            }
                            res.json({ status: 2, msg: "Embed Link Uploaded Successfully", data: result });
                        });
                });
        });

    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});
ctrl.post('/postTimelineAudioEmbedLink', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var Subject = require('../models/subject');
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //user timeline
        newFilePost.privacy = req.body.privacy;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        newFilePost.catagory = req.body.catagory;
        newFilePost.post_type = 6;
        newFilePost.created_on = req.body.created_on;
        newFilePost.name = req.body.name;
        post_type = 6;
        var link = req.body.link;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            Post.findByIdAndUpdate(newFilePost._id, {
                    audio: {
                        title: link
                    }
                },
                function(err, userId1) {
                    if (err)
                        throw err;
                    title = "posted an audio";
                    addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                    Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .exec(function(err, result) {
                            if (err) {
                                throw err;
                            }
                            res.json({ status: 2, msg: "Embed Link Uploaded Successfully", data: result });
                        });
                });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});
ctrl.post('/postTimelinePhotoEmbedLink', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var userId = req.session.passport.user;
    var link = req.body.link;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //user timeline
        newFilePost.privacy = req.body.privacy;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        newFilePost.catagory = req.body.catagory;
        newFilePost.created_on = req.body.created_on;
        newFilePost.name = req.body.name;
        newFilePost.post_type = 3;
        post_type = 3;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            Post.findByIdAndUpdate(newFilePost._id, {
                    photo: {
                        title: link
                    }
                },
                function(err, userId1) {
                    if (err)
                        throw err;
                    title = "posted a photo";
                    addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                    Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .exec(function(err, result) {
                            if (err) {
                                throw err;
                            }
                            res.json({ status: 2, msg: "Embed Link Uploaded Successfully", data: result });
                        });
                });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});


ctrl.post('/postTimelineAudiosTypeFiles', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 6;
        post_type = 6;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //user profile
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            newFilePost.catagory = req.body.catagory;
            if (req.body.name) {
                newFilePost.name = req.body.name;
            }
            newFilePost.save(function(err, newFilePost) {
                if (err) {
                    throw err;
                }
                //audio uploading changes for app start
                if (req.file.originalname == 'blob') {
                    f_name = new Date().getTime();
                    if (req.file.mimetype == 'audio/wav') {
                        var ext = 'wav';
                    } else {
                        var ext = 'mp3';
                    }
                } else {
                    var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                    var ext = req.file.originalname.split('.').pop();
                }
                //audio uploading changes for app end
                // var ext = req.file.originalname.split('.').pop();
                // var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Timeline/Audios/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Post.findByIdAndUpdate(newFilePost._id, {
                                    audio: {
                                        file_name: filename,
                                    }
                                },
                                function(err, userId1) {
                                    if (err)
                                        throw err;
                                    title = "posted an Audio";
                                    addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                                    Post.findOne({ '_id': newFilePost._id })
                                        .select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                        .exec(function(err, result) {
                                            if (err) {
                                                throw err
                                            }
                                            res.json({ status: 2, msg: "Audio Uploaded Successfully", data: result });
                                        });
                                });
                        });
                    } else {
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged In" });
    }
});


ctrl.post('/postTimelineDocumentsTypeFiles', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 7;
        post_type = 7;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.name = req.body.name;
            newFilePost.types = req.body.types; //user timeline
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            newFilePost.catagory = req.body.catagory;
            newFilePost.save(function(err, newFilePost) {
                if (err) {
                    throw err;
                }
                var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                var ext = req.file.originalname.split('.').pop();
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Timeline/Documents/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Post.findByIdAndUpdate(newFilePost._id, {
                                    document: {
                                        file_name: filename,
                                    }
                                },
                                function(err, userId1) {
                                    if (err)
                                        throw err;
                                    title = "posted a Document";
                                    addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                                    Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                        .exec(function(err, result) {
                                            if (err) {
                                                throw err
                                            }
                                            res.json({ status: 2, msg: "Document Uploaded Successfully", data: result });
                                        });
                                });
                        });
                    } else {
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

//post any type of data 
ctrl.post('/postTimelineAllTypeData', function(req, res) {
    var Post = require('../models/post');
    var userId = req.session.passport.user;
    var title = '';
    var post_type = '';
    var newPost = new Post();
    if (req.session.passport) {
        if (req.body.linkTitle != '' || req.body.link != '' || req.body.message != '' || req.body.question != '') {
            newPost.created_by = userId;
            newPost.created_on = req.body.created_on;
            newPost.message = req.body.message;
            newPost.question = req.body.question;
            if (req.body.message) {
                post_type = 1;
                title = "posted a Status";
            }
            if (req.body.question) {
                post_type = 2;
                title = "posted a Question";
            }
            if (req.body.link) {
                post_type = 5;
                title = "posted a Link";
            }
            newPost.post_type = post_type;
            newPost.types = req.body.types; //user timeline
            newPost.privacy = req.body.privacy;
            newPost.custom = req.body.custom ? req.body.custom : [];
            newPost.catagory = req.body.catagory;
            newPost.save(function(err, newPost) {
                if (err) {
                    throw err;
                }
                addpostevent(userId, newPost._id, req.body.types, post_type, title, function(req, res) {});
                if (req.body.linkTitle || req.body.link) {
                    newPost.link.title = req.body.linkTitle;
                    newPost.link.description = req.body.link;
                    Post.findByIdAndUpdate(newPost._id, {
                        $push: {
                            link: {
                                title: newPost.link.title,
                                description: newPost.link.description,
                            }
                        }
                    }, function(err, newPostAgain) {
                        if (err) {
                            throw err
                        }
                    });
                }
                Post.findOne({ '_id': newPost._id })
                    .select('types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                    .exec(function(err, result) {
                        if (err) {
                            throw err
                        }
                        return res.json({ status: 2, data_post: result });
                    });
            });
        } else {
            return res.json({ status: 0, msg: "please enter a valid value" });
        }
    } else {
        return res.json({ status: 0, msg: "user not logged in" });
    }
});

// ************************************delete user timeline posts api******************************************
ctrl.post('/deleteTimelinePost', function(req, res) {
    var Post = require('../models/post');
    var Journal = require('../models/journal');
    var PostsFeedback = require('../models/postsfeedback');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.body.postId;
        var wall_type = req.body.wallType;
        var wall_id = req.body.wallId;
        if (wall_type == 1) {
            Post.find({ '_id': postId }, function(err, post) {
                if (err) {
                    throw err;
                }
                if (post.length > 0) {
                    Post.remove({ '_id': postId }, function(err, post) {
                        if (err)
                            throw err;
                        Subject.update({ _id: wall_id }, { $pull: { post: { post_id: postId } } }, { multi: true }, function(err, post) {
                            if (err)
                                throw err;
                            PostsFeedback.find({ 'post_id': postId })
                                .remove()
                                .exec((err, data) => {});
                            Journal.update({ user_id: userId }, { $pull: { posts: { post_id: postId } } }, { multi: true }, function(err, journals) {
                                data = { message: 'Post has been deleted successfully' };
                                res.json({ status: 2, data: data });
                            });
                        });
                    });
                } else {
                    data = { message: 'Post not found' };
                    res.json({ status: 0, data: data });
                }
            });
        } else if (wall_type == 2) {
            Post.find({ '_id': postId }, function(err, post) {
                if (err) {
                    throw err;
                }
                if (post.length > 0) {
                    Post.remove({ '_id': postId }, function(err, post) {
                        if (err)
                            throw err;
                        College.update({ _id: wall_id }, { $pull: { post: { post_id: postId } } }, { multi: true }, function(err, post) {
                            if (err)
                                throw err;
                            PostsFeedback.find({ 'post_id': postId })
                                .remove()
                                .exec((err, data) => {});
                            Journal.update({ user_id: userId }, { $pull: { posts: { post_id: postId } } }, { multi: true }, function(err, journals) {
                                data = { message: 'Post has been deleted successfully' };
                                res.json({ status: 2, data: data });
                            });
                        });
                    });
                } else {
                    data = { message: 'Post not found' };
                    res.json({ status: 0, data: data });
                }
            });
        } else if (wall_type == 3 || wall_type == 4) {
            Post.find({ '_id': postId }, function(err, post) {
                if (err) {
                    throw err;
                }
                if (post.length > 0) {
                    Post.remove({ '_id': postId }, function(err, post) {
                        if (err)
                            throw err;
                        Degree.update({ _id: wall_id }, { $pull: { post: { post_id: postId } } }, { multi: true }, function(err, post) {
                            if (err)
                                throw err;
                            PostsFeedback.find({ 'post_id': postId })
                                .remove()
                                .exec((err, data) => {});
                            Journal.update({ user_id: userId }, { $pull: { posts: { post_id: postId } } }, { multi: true }, function(err, journals) {
                                data = { message: 'Post has been deleted successfully' };
                                res.json({ status: 2, data: data });
                            });
                        });
                    });
                } else {
                    data = { message: 'Post not found' };
                    res.json({ status: 0, data: data });
                }
            });
        } else if (wall_type == 5) {
            Post.find({ '_id': postId }, function(err, post) {
                if (err) {
                    throw err;
                }
                if (post.length > 0) {
                    Post.remove({ '_id': postId }, function(err, post) {
                        if (err)
                            throw err;
                        PostsFeedback.find({ 'post_id': postId })
                            .remove()
                            .exec((err, data) => {});
                        Journal.update({ user_id: userId }, { $pull: { posts: { post_id: postId } } }, { multi: true }, function(err, journals) {
                            data = { message: 'Post has been deleted successfully' };
                            res.json({ status: 2, data: data });
                        });
                    });
                } else {
                    data = { message: 'Post not found' };
                    res.json({ status: 0, data: data });
                }
            });
        } else if (wall_type == 6) {
            Post.find({ '_id': postId }, function(err, post) {
                if (err) {
                    throw err;
                }
                if (post.length > 0) {
                    Post.remove({ '_id': postId }, function(err, post) {
                        if (err)
                            throw err;
                        PostsFeedback.find({ 'post_id': postId })
                            .remove()
                            .exec((err, data) => {});
                        Group.update({ _id: wall_id }, { $pull: { post: { post_id: postId } } }, { multi: true }, function(err, post) {
                            if (err)
                                throw err;
                            Journal.update({ user_id: userId }, { $pull: { posts: { post_id: postId } } }, { multi: true }, function(err, journals) {
                                data = { message: 'Post has been deleted successfully' };
                                res.json({ status: 2, data: data });
                            });
                        });
                    });
                } else {
                    data = { message: 'Post not found' };
                    res.json({ status: 0, data: data });
                }
            });
        }
    } else {
        data = { message: 'User not found' };
        res.json({ status: 0, data: data });
    }
});

// *************************************** edit post *************************************************8
ctrl.post('/editPost', function(req, res) {
    var Post = require('../models/post');
    var Journal = require('../models/journal');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        upload(req, res, function(err) {
            if (err) {
                return err;
            }
            var postId = req.body.post_id;
            var name = req.body.name ? req.body.name : '';
            var custom = req.body.custom ? req.body.custom : [];
            var privacy = req.body.privacy;
            var post_type = req.body.post_type; //type of post => photo/audio/video/message/question/link/document
            var type = req.body.type; //shared post =2, original post = 1
            var link = req.body.link;
            var linkTitle = req.body.linkTitle ? req.body.linkTitle : '';
            var wallType = req.body.wallType; // subject == 1/college == 2/degree == 3/timeline == 5/group wall ==6
            // ****************code for shared post start*******************************
            if (type == 2) {
                Post.update({ _id: postId }, {
                        $set: {
                            '_id': postId,
                            'shared_title': name,
                            'privacy': privacy,
                            'custom': custom
                        }
                    },
                    function(err, data) {
                        if (err)
                            throw err;
                        Post.findOne({ '_id': postId })
                            .select('types post_type catagory created_by created_on likes flag comments message name question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id college_id degree_id group_id', select: 'fname lname photo name _id title ' })
                            .exec(function(err, result) {
                                if (err) {
                                    throw err
                                }
                                return res.json({ msg: 'Post Edited Successfully', status: 2, data: result });
                            });
                    });
            }
            // ****************code for shared post end***********************

            // ****************code for original post start*******************
            else if (type == 1) {
                if (post_type == 1 || post_type == 2) {
                    var key1 = (post_type == 1) ? 'message' : 'question';
                    Post.update({ _id: postId }, {
                            $set: {
                                '_id': postId,
                                [key1]: name,
                                'privacy': privacy,
                                'custom': custom
                            }
                        },
                        function(err, data) {
                            if (err)
                                throw err;
                            Post.findOne({ '_id': postId })
                                .select('types post_type catagory created_by created_on likes flag comments message name question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id college_id degree_id group_id', select: 'fname lname photo name _id title' })
                                .exec(function(err, result) {
                                    if (err) {
                                        throw err
                                    }
                                    return res.json({ msg: 'Post Edited Successfully', status: 2, data: result });
                                });
                        });
                } else if (post_type == 5) {
                    Post.update({ _id: postId }, {
                            $set: {
                                '_id': postId,
                                'link': {
                                    'title': linkTitle,
                                    'description': link,
                                },
                                'privacy': privacy,
                                'custom': custom
                            }
                        },
                        function(err, data) {
                            if (err)
                                throw err;
                            Post.findOne({ '_id': postId })
                                .select('types post_type catagory created_by created_on likes flag comments message name question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id college_id degree_id group_id', select: 'fname lname photo name _id title' })
                                .exec(function(err, result) {
                                    if (err) {
                                        throw err
                                    }
                                    return res.json({ msg: 'Post Edited Successfully', status: 2, data: result });
                                });
                        });
                } else if (post_type == 3 || post_type == 4 || post_type == 6 || post_type == 7) {
                    if (req.file || req.blob) {
                        var folderName = (post_type == 3) ? 'Photos' : (post_type == 4) ? 'Videos' : (post_type == 6) ? 'Audios' : (post_type == 7) ? 'Documents' : '';
                        var wallName = (wallType == 1) ? 'Subject' : (wallType == 2) ? 'College' : (wallType == 3) ? 'Degree' : (wallType == 5) ? 'Timeline' : (wallType == 6) ? 'GroupWall' : '';
                        var key = (post_type == 3) ? 'photo' : (post_type == 4) ? 'video' : (post_type == 6) ? 'audio' : (post_type == 7) ? 'document' : '';
                        var f_name;
                        if (req.file.originalname == 'blob') {
                            f_name = new Date().getTime();
                            if (post_type == 4) {
                                if (req.file.mimetype == 'video/3gpp') {
                                    var ext = '3gp';
                                } else {
                                    var ext = 'mp4';
                                }
                            } else if (post_type == 6) {
                                if (req.file.mimetype == 'audio/wav') {
                                    var ext = 'wav';
                                } else {
                                    var ext = 'mp3';
                                }
                            } else {
                                var ext = req.file.originalname.split('.').pop();
                            }
                        } else {
                            f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                            var ext = req.file.originalname.split('.').pop();
                        }
                        filename = f_name + '-' + postId + '.' + ext;
                        filename = filename.replace(/\s/g, '');
                        var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/" + wallName + "/" + folderName + "/" + userId);
                        fs.mkdir(uploadpath, function(e) {
                            if (!e || (e && e.code === 'EEXIST')) {
                                fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    Post.update({ _id: postId }, {
                                            $set: {
                                                '_id': postId,
                                                'name': name,
                                                [key]: {
                                                    'file_name': filename,
                                                },
                                                'privacy': privacy,
                                                'custom': custom
                                            }
                                        },
                                        function(err, data) {
                                            if (err)
                                                throw err;
                                            Post.findOne({ '_id': postId })
                                                .select('types post_type catagory created_by created_on likes flag comments message name question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                                                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id college_id degree_id group_id', select: 'fname lname photo name _id title' })
                                                .exec(function(err, result) {
                                                    if (err) {
                                                        throw err
                                                    }
                                                    return res.json({ msg: 'Post Edited Successfully', status: 2, data: result });
                                                });
                                        });
                                });
                            } else {
                                console.log(e);
                            }
                        });
                    } else if ((post_type == 3 || post_type == 4 || post_type == 6) && req.body.link) {
                        var key = (post_type == 3) ? 'photo' : (post_type == 4) ? 'video' : (post_type == 6) ? 'audio' : (post_type == 7) ? 'document' : '';
                        Post.update({ _id: postId }, {
                                $set: {
                                    '_id': postId,
                                    [key]: {
                                        title: link,
                                    },
                                    'name': name,
                                    'privacy': privacy,
                                    'custom': custom
                                }
                            },
                            function(err, data) {
                                if (err)
                                    throw err;
                                Post.findOne({ '_id': postId })
                                    .select('types post_type catagory created_by created_on likes flag comments message name question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id college_id degree_id group_id', select: 'fname lname photo name _id title' })
                                    .exec(function(err, result) {
                                        if (err) {
                                            throw err
                                        }
                                        return res.json({ msg: 'Post Edited Successfully', status: 2, data: result });
                                    });
                            });
                    } else {
                        Post.update({ _id: postId }, {
                                $set: {
                                    '_id': postId,
                                    'name': name,
                                    'privacy': privacy,
                                    'custom': custom
                                }
                            },
                            function(err, data) {
                                if (err)
                                    throw err;
                                Post.findOne({ '_id': postId })
                                    .select('types post_type catagory created_by created_on likes flag comments message name question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                                    .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id college_id degree_id group_id', select: 'fname lname photo name _id title' })
                                    .exec(function(err, result) {
                                        if (err) {
                                            throw err
                                        }
                                        return res.json({ msg: 'Post Edited Successfully', status: 2, data: result });
                                    });
                            });
                    }
                }
            }
            // ****************code for original post end*******************
        });
    } else {
        data = { message: 'User not found' };
        res.json({ status: 0, data: data });
    }
});

/************************************** Api for advance search of Friendpost  **********************************/

ctrl.post('/getfriendSearchedPost/:friend_id/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var friend_id = req.params.friend_id;
    var collegesIds = req.body.collegeIds;
    var degreeIds = req.body.degreeIds;
    var subjectIds = req.body.subjectIds;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var condition;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        checkUserFriendId(logged, friend_id, function(data) {
            getReportedPostIds(function(reportedPostIds) {
                if (data.current_friend) {
                    condition = {
                        '_id': { nin: reportedPostIds },
                        $and: [{
                                $and: [
                                    { 'created_by': friend_id, 'share_type': 1 },
                                    { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [logged] } }] }] }
                                ]

                            },
                            {
                                $or: [
                                    { subject_id: { $in: subjectIds } },
                                    { college_id: { $in: collegesIds } },
                                    { degree_id: { $in: degreeIds } }
                                ]
                            }
                        ]
                    };
                } else if (data.current_following && !data.current_friend) {
                    condition = {
                        '_id': { nin: reportedPostIds },
                        $and: [
                            { 'created_by': friend_id, 'share_type': 1 },
                            { 'privacy': { $in: [1, 4, 6] } },
                            {
                                $or: [
                                    { subject_id: { $in: subjectIds } },
                                    { college_id: { $in: collegesIds } },
                                    { degree_id: { $in: degreeIds } }
                                ]
                            }
                        ]
                    };
                } else {
                    condition = {
                        '_id': { nin: reportedPostIds },
                        $and: [
                            { 'created_by': friend_id, 'share_type': 1 },
                            { 'privacy': 1 },
                            {
                                $or: [
                                    { subject_id: { $in: subjectIds } },
                                    { college_id: { $in: collegesIds } },
                                    { degree_id: { $in: degreeIds } }
                                ]
                            }
                        ]
                    };
                }
                Post.find(condition)
                    .select('name share subject_id degree_id college_id types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom')
                    .populate({
                        path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator subject_id degree_id college_id',
                        select: 'fname lname photo _id name'
                    })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec(function(err, result) {
                        if (err) {
                            throw err;
                        }
                        Post.find(condition)
                            .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                            .populate({
                                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator',
                                select: 'fname lname photo _id'
                            })
                            .sort(sort)
                            .exec(function(err, total_post) {
                                if (err) {
                                    throw err;
                                }
                                res.json({ status: 2, data: result, total_post: total_post.length, result: logged });
                            });
                    });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

/********************************External Sharing Feature  *****************/

ctrl.post('/emailShare', function(req, res) {
    if (req.session.passport) {
        var postId = req.body.postId;
        var email = req.body.email;
        var userId = req.session.passport.user;
        User.findOne({ _id: userId })
            .select('fname lname')
            .exec(function(err, user) {
                if (err)
                    throw err;
                var fullUrl = "http://dev.stribein.com";
                locals = {
                    email: email,
                    from: 'notifications@stribein.com',
                    logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
                    subject: 'StribeIN – ' + user.fname + ' shared an interesting post with you',
                    name: user.fname + ' ' + user.lname,
                    siteLink: fullUrl,
                    shareLink: fullUrl + '/api/postDetail/' + postId,
                    siteUrl: fullUrl,
                };
                mailer.sendOne('post_email_share', locals, function(err, responseStatus, html, text) {
                    return res.json({ status: 2, msg: 'post share successfully.' });
                });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

ctrl.post('/getMetaData', function(req, res, next) {
    var key = req.body.url;
    scrape(key, function(err, data) {
        // if (err)
        //     return next(err);
        if (data) {
            res.json({ status: 2, data: data });
        } else {
            res.json({ status: 2, data: { openGraph: '', general: '' } });
        }
    })
});

// **************************************USER PROFILE FILTER POSTS BY SCD AND POST TYPE*********************************
ctrl.post('/getUserSearchPost/:post_type/:counterList', function(req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var subjectIds = req.body.subjectIds;
        var collegeIds = req.body.collegeIds;
        var degreeIds = req.body.degreeIds;
        var counterList = req.params.counterList;
        var post_type = req.params.post_type;
        var limit = 10;
        var skip = counterList * limit;
        var sort = { 'created_on': -1 };
        getUserFriendsIds(userId, function(friends) {
            var condition = {
                $and: [{
                        $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegeIds } }, { 'degree_id': { $in: degreeIds } }]
                    },
                    {
                        $or: [
                            { 'created_by': userId, 'share_type': 1, 'post_type': post_type },
                            {
                                $and: [
                                    { 'created_by': { $in: friends }, 'share_type': 2, 'post_type': post_type },
                                    { privacy: 5, custom: { $in: [userId] } },
                                ]
                            }
                        ]
                    }
                ]
            };
            Post.find(condition)
                .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type')
                .populate({ path: 'origin_creator created_by likes.user_id flag.user_id comments.comment_by share.user_id', select: 'fname lname photo _id' })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Post.find(condition)
                        .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type')
                        .populate({ path: 'origin_creator created_by likes.user_id flag.user_id comments.comment_by share.user_id', select: 'fname lname photo _id' })
                        .sort(sort)
                        .exec(function(err, total_result) {
                            if (err) {
                                throw err;
                            }
                            res.json({ status: 2, data: result, isResult: userId, total_result: total_result.length });
                        });
                });
        });

    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

// **************************************FRIEND PROFILE FILTER POSTS BY SCD AND POST TYPE*********************************
ctrl.post('/getFriendSearchPost/:friend_id/:post_type/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var post_type = req.params.post_type;
    var friend_id = req.params.friend_id;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var condition;
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var collegeIds = req.body.collegeIds;
        var degreeIds = req.body.degreeIds;
        var subjectIds = req.body.subjectIds;
        checkUserFriendId(userId, friend_id, function(data) {
            if (data.current_friend) {
                condition = {
                    $and: [{
                            $and: [
                                { 'created_by': friend_id, 'share_type': 1 },
                                { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] }
                            ]

                        },
                        {
                            $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegeIds } }, { 'degree_id': { $in: degreeIds } }]
                        },
                        { 'post_type': post_type }
                    ]
                };
            } else if (data.current_following && !data.current_friend) {
                condition = {
                    $and: [
                        { 'created_by': friend_id, 'share_type': 1 },
                        { 'privacy': { $in: [1, 4, 6] } },
                        { 'post_type': post_type },
                        {
                            $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegeIds } }, { 'degree_id': { $in: degreeIds } }]
                        }
                    ]
                };
            } else {
                condition = {
                    $and: [
                        { 'created_by': friend_id, 'share_type': 1 },
                        { 'privacy': 1 },
                        { 'post_type': post_type },
                        {
                            $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegeIds } }, { 'degree_id': { $in: degreeIds } }]
                        }
                    ]
                };
            }
            Post.find(condition)
                .select('name subject_id college_id degree_id types catagory created_by created_on post_type likes flag comments answer message question photo video link document audio privacy share original_post_id origin_creator shared_title custom')
                .populate({
                    path: 'created_by likes.user_id flag.user_id subject_id college_id degree_id comments.comment_by answer.created_by share.user_id origin_creator',
                    select: 'fname lname photo _id name'
                })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Post.find(condition)
                        .select('name types catagory created_by created_on post_type likes flag comments answer message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({
                            path: 'created_by likes.user_id flag.user_id subject_id college_id degree_id comments.comment_by answer.created_by share.user_id origin_creator',
                            select: 'fname lname photo _id name'
                        })
                        .sort(sort)
                        .exec(function(err, total_result) {
                            if (err) {
                                throw err;
                            }
                            res.json({ status: 2, data: result, isResult: userId, potForData: data, total_result: total_result.length });
                        });
                });
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

function getUserFriendsIds(id, callback) {
    User.findOne({ _id: id }, { friends: 1 },
        function(err, friends) {
            if (err)
                throw err;
            var data = friends.friends;
            var current_friend = [];
            for (var i in data) {
                if (data[i].status == 3) {
                    current_friend.push(data[i].friend_id);
                }
            }
            callback(current_friend);
        });

}

///*******************  get api for post of subject wall on the basis of post type ***************/

ctrl.get('/getSubjectWallPostById/:subjectId/:postType/:counter', function(req, res) {
    if (req.session.passport) {
        var subjectId = req.params.subjectId;
        var postType = req.params.postType;
        var counter = req.params.counter;
        var userId = req.session.passport.user;
        var limit = 10;
        var skip = limit * counter;
        var sort = { 'created_on': -1 };
        var postTypeCondition;
        getSubjectPostId(subjectId, function(postIds) {
            checkUserWalls(userId, function(userData) {
                getReportedPostIds(function(reportedPostIds) {
                    if (postType == 10) {
                        postTypeCondition = { $in: [1, 2, 3, 4, 5, 6, 7, 8] }; //post type
                    } else {
                        postTypeCondition = { $in: [postType] };
                    }
                    Post.find({
                            '_id': { $in: postIds, $nin: reportedPostIds },
                            'post_type': postTypeCondition,
                            'created_by': { $nin: userData.block_user },
                            $or: [{ privacy: 1 },
                                { created_by: userId, 'share_type': 1 },
                                {
                                    $and: [
                                        { created_by: { $in: userData.current_friend } },
                                        { $or: [{ privacy: { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                                    ]
                                },
                                {
                                    $and: [
                                        { created_by: { $in: userData.current_following } },
                                        { privacy: { $in: [1, 4, 6] } }
                                    ]
                                }
                            ]
                        })
                        .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share  subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .exec(function(err, result) {
                            Post.count({
                                '_id': { $in: postIds, $nin: reportedPostIds },
                                'post_type': postTypeCondition,
                                'created_by': { $nin: userData.block_user },
                                $or: [{ privacy: 1 },
                                    { created_by: userId, 'share_type': 1 },
                                    {
                                        $and: [
                                            { created_by: { $in: userData.current_friend } },
                                            { $or: [{ privacy: { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                                        ]
                                    },
                                    {
                                        $and: [
                                            { created_by: { $in: userData.current_following } },
                                            { privacy: { $in: [1, 4, 6] } }
                                        ]
                                    }
                                ]
                            }).exec(function(err, totalPost) {
                                if (err)
                                    throw err;
                                res.json({ status: 2, data: result, isResult: userId, total_post: totalPost });
                            });
                        });
                });
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

///*******************  get api for post of subject wall on the basis of ADVANCE SEARCH and post type  ***************/

ctrl.get('/getSubjectSearchedPostsById/:subjectId/:counter/:postType/:searchDateFrom/:searchDateTo/:category/:whoPostedValue/:status', function(req, res) {
    if (req.session.passport) {
        var limit = 10;
        var counter = req.params.counter;
        var skip = counter * limit;
        var sort = { 'created_on': -1 };
        var searchDateTo = req.params.searchDateTo;
        var searchDateFrom = req.params.searchDateFrom;
        var category = req.params.category;
        var whoPostedValue = req.params.whoPostedValue;
        var postType = req.params.postType;
        var userId = req.session.passport.user;
        var status = req.params.status;
        var subjectId = req.params.subjectId;
        getSubjectStatus(subjectId, status, function(postIds) {
            checkUserWalls(userId, function(userData) {
                getReportedPostIds(function(reportedPostIds) {
                    var dateCondition;
                    var categoryCondition;
                    var postTypeCondition;
                    if (category == 0) {
                        categoryCondition = { $in: [1, 2, 3, 4] }; //category type
                    } else {
                        categoryCondition = { $in: [category] };
                    }
                    if (postType == 10) {
                        postTypeCondition = { $in: [1, 2, 3, 4, 5, 6, 7, 8] }; //post type
                    } else {
                        postTypeCondition = { $in: [postType] };
                    }
                    if (searchDateFrom != "null" && searchDateTo != "null") {
                        dateCondition = { '$gte': searchDateFrom, '$lte': searchDateTo };
                    } else if (searchDateFrom != "null" && searchDateTo == "null") {
                        dateCondition = { '$gte': searchDateFrom };
                    } else if (searchDateFrom == "null" && searchDateTo == "null") {
                        dateCondition = { '$gte': new Date(1970, 0, 1) };
                    }
                    if (whoPostedValue == 1) {
                        Post.find({
                                '_id': { $in: postIds, $nin: reportedPostIds },
                                'catagory': categoryCondition,
                                'post_type': postTypeCondition,
                                'created_on': dateCondition,
                                'created_by': { $nin: userData.block_user },
                                $or: [{ privacy: 1 },
                                    { 'created_by': userId, 'share_type': 1 },
                                    {
                                        $and: [
                                            { 'created_by': { $in: userData.current_friend } },
                                            { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ 'privacy': 5, 'custom': { $in: [userId] } }] }] },
                                        ]
                                    },
                                    {
                                        $and: [
                                            { 'created_by': { $in: userData.current_following } },
                                            { 'privacy': { $in: [1, 4, 6] } }
                                        ]
                                    }
                                ]
                            })
                            .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                            .sort(sort)
                            .skip(skip)
                            .limit(limit)
                            .exec(function(err, result) {
                                Post.count({
                                    '_id': { $in: postIds, $nin: reportedPostIds },
                                    'catagory': categoryCondition,
                                    'post_type': postTypeCondition,
                                    'created_on': dateCondition,
                                    'created_by': { $nin: userData.block_user },
                                    $or: [{ privacy: 1 },
                                        { 'created_by': userId, 'share_type': 1 },
                                        {
                                            $and: [
                                                { 'created_by': { $in: userData.current_friend } },
                                                { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                                            ]
                                        },
                                        {
                                            $and: [
                                                { 'created_by': { $in: userData.current_following } },
                                                { 'privacy': { $in: [1, 4, 6] } }
                                            ]
                                        }
                                    ]
                                }).exec(function(err, totalPost) {
                                    res.json({ status: 2, data: result, isResult: userId, total_post: totalPost });
                                });
                            });
                    } else if (whoPostedValue == 2) {
                        Post.find({
                                '_id': { $in: postIds, $nin: reportedPostIds },
                                'catagory': categoryCondition,
                                'post_type': postTypeCondition,
                                'created_on': dateCondition,
                                'created_by': { $in: userData.current_friend },
                                $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [userId] }]
                            })
                            .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                            .sort(sort)
                            .skip(skip)
                            .limit(limit)
                            .exec(function(err, result) {
                                Post.count({
                                    '_id': { $in: postIds },
                                    'catagory': categoryCondition,
                                    'post_type': postTypeCondition,
                                    'created_on': dateCondition,
                                    'created_by': { $in: userData.current_friend },
                                    $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [userId] }]
                                }).exec(function(err, totalPost) {
                                    res.json({ status: 2, data: result, isResult: userId, total_post: totalPost });
                                });
                            });
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

function getUserDetail(id, calback) {
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('fname lname photo')
        .exec(function(err, user) {
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

ctrl.get('/test/:id/:status', function(req, res) {
    getSubjectStatus(req.params.id, req.params.status, function(data) {
        res.json(data);
    })
});

function getSubjectStatus(subject_id, status, callback) {
    /*
     *  Status{
     *    1 => All Students
     *    2 => Current Students 
     *    3 => Past Students
     *    4 => Future Students
     *    5 => Subject Expert
     *    6 => Subject Teacher
     *    7 => Just Interested
     * }
     * 
     */
    var currentDate = new Date().getTime();
    var currentMember = [];
    var pastMember = [];
    var futureMember = [];
    var subjectExpertMember = [];
    var subjectTeacherMember = [];
    var justIntrestedMember = [];
    var finalMembers = [];
    Subject.findOne({ '_id': subject_id })
        .select('members')
        .exec(function(err, subjectMembers) {
            if (err)
                throw err;
            for (var i in subjectMembers.members) {
                if (subjectMembers.members[i].subjects_user_type == 1) {
                    var start = new Date(subjectMembers.members[i].from).getTime();
                    var end = new Date(subjectMembers.members[i].to).getTime();
                    if (start <= currentDate && currentDate <= end) {
                        currentMember.push(subjectMembers.members[i].user_id);
                    } else if (end < currentDate) {
                        pastMember.push(subjectMembers.members[i].user_id);
                    } else if (start > currentDate) {
                        futureMember.push(subjectMembers.members[i].user_id);
                    }
                } else if (subjectMembers.members[i].subjects_user_type == 3) {
                    subjectExpertMember.push(subjectMembers.members[i].user_id);
                } else if (subjectMembers.members[i].subjects_user_type == 4) {
                    subjectTeacherMember.push(subjectMembers.members[i].user_id);
                } else if (subjectMembers.members[i].subjects_user_type == 5) {
                    justIntrestedMember.push(subjectMembers.members[i].user_id);
                }
            }
            if (status == 1) {
                finalMembers = currentMember.concat(pastMember, futureMember, subjectExpertMember, subjectTeacherMember, justIntrestedMember)
            } else if (status == 2) {
                finalMembers = currentMember;
            } else if (status == 3) {
                finalMembers = pastMember;
            } else if (status == 4) {
                finalMembers = futureMember;
            } else if (status == 5) {
                finalMembers = subjectExpertMember;
            } else if (status == 6) {
                finalMembers = subjectTeacherMember;
            } else if (status == 7) {
                finalMembers = justIntrestedMember;
            }
            Post.find({ 'created_by': { $in: finalMembers }, 'subject_id': subject_id })
                .distinct('_id')
                .exec(function(err, data) {
                    if (err)
                        throw err;
                    callback(data);
                });
        });
}

ctrl.get('/getLikeUserStatus/:id', function(req, res, next) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.params.id;
        var likes = [];
        getfriendIdslist(userId, function(userData) {
            Post.findOne({ '_id': postId })
                .select('likes')
                .populate({ path: 'likes.user_id', select: 'fname lname photo' })
                .exec(function(err, likesData) {
                    if (err)
                        return next(err);
                    for (var i in likesData.likes) {
                        if (userData.current.indexOf(likesData.likes[i].user_id._id) > -1) {
                            likes.push(makeData(likesData.likes[i].user_id, 3));
                        } else if (userData.pending.indexOf(likesData.likes[i].user_id._id) > -1) {
                            likes.push(makeData(likesData.likes[i].user_id, 2));
                        } else if (userData.request.indexOf(likesData.likes[i].user_id._id) > -1) {
                            likes.push(makeData(likesData.likes[i].user_id, 1));
                        } else if (userData.blocked.indexOf(likesData.likes[i].user_id._id) > -1) {
                            likes.push(makeData(likesData.likes[i].user_id, 4));
                        } else if (userData.blocked_me.indexOf(likesData.likes[i].user_id._id) > -1) {
                            likes.push(makeData(likesData.likes[i].user_id, 5));
                        } else if (likesData.likes[i].user_id._id == userId) {
                            likes.push(makeData(likesData.likes[i].user_id, 7));
                        } else {
                            likes.push(makeData(likesData.likes[i].user_id, 6));
                        }
                    }
                    likesData.likes = likes;
                    res.json({ status: 2, data: likesData })
                });
        });
    } else {
        res.json({ status: 0, mag: 'User not loggedIn' });
    }
});

function makeData(data, status) {
    return {
        'user_id': {
            '_id': data._id,
            'fname': data.fname,
            'lname': data.lname,
            'photo': data.photo,
            'status': status
        }
    };
}

function getfriendIdslist(userId, callback) {
    var current_friends = [];
    var pending_friends = [];
    var request_friends = [];
    var blocked_friends = [];
    var users_blocked_me = [];
    User.findOne({ '_id': userId })
        .exec(function(err, user) {
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

function getReportedPostIds(callback) {
    PostsFeedback.find({ 'report_count': { $gte: 10 } }).distinct('post_id')
        .exec(function(err, data) {
            callback(data);
        });
}