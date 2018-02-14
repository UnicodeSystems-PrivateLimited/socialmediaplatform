var ctrl = require('express').Router();
module.exports = ctrl;
var Event = require('../models/event');
var User = require('../models/user');
var Post = require('../models/post');
var Group = require('../models/group');
var Subject = require('../models/subject');
var College = require('../models/college');
var Degree = require('../models/degree');
var PostsFeedback = require('../models/postsfeedback');
var allSubjects = [];
var allDegrees = [];
var allColleges = [];
ctrl.get('/', function(req, res) {
    Event.find({}, function(err, events) {
        if (err)
            throw err;
        //        console.log(events);
        res.json(events);
    });
});

ctrl.get('/deleteEve', function(req, res) {
    Event.remove(function(err, user) {
        if (err)
            throw err;
        data = { message: 'Events deleted' };
        res.json(data);
    });
});


ctrl.get('/getEventsByUserId/:id', function(req, res) {
    var id = req.params.id;
    var Focus = require('../models/focus');
    var User = require('../models/user');

    Event.find({ 'created_by': id }).populate({
        path: 'focus_id',
        model: 'Focus',
        populate: {
            path: 'comments.comment_by',
            select: 'fname lname photo',
            model: 'User'
        }
    }).exec(function(err, result) {
        res.json(result);
    });
});


ctrl.get('/getfriendtimeline/:counterListTimeline/:friend_id', function(req, res) {
    if (req.session.passport) {
        var friendId = req.params.friend_id;
        var counterListTimeline = req.params.counterListTimeline;
        var userId = req.session.passport.user;
        getfriendtimelinescroll(userId, friendId, counterListTimeline, function(data) {
            res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.get('/getusertimeline/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        getUserFriendsIds(id, function(friends) {
            getusertimelinescroll(id, friends.friends, counterListTimeline, friends.hidden_postIds, function(data) {
                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
            });
        })
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});


ctrl.get('/getusertimelineForFriendsWithMatch/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var subjectPosts;
        var current_friend;
        loggedUserAllSubjects(id, function(data2) {
            allSubjects = data2.all_subjects;
            loggedUserAllDegree(id, function(data2) {
                allDegrees = data2.all_degrees;
                loggedUserAllCollege(id, function(data2) {
                    allColleges = data2.all_colleges;
                    getAllSubjectDegreeCollegePostId(allSubjects, allColleges, allDegrees, function(data) {

                        checkUserWalls(id, function(data1) {
                            data1.current_friend.push(id);
                            //   getusertimelinescroll(id, counterListTimeline, function (data) {
                            getusertimelineForWallonlyFriends(id, data, data1.current_friend, counterListTimeline, function(data) {
                                // console.log("helllo",data.result);
                                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
                            });
                        });
                    });
                });
            });
        });
    }
});


ctrl.get('/getusertimelineForFollowersWithMatch/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var subjectPosts;
        loggedUserAllSubjects(id, function(data2) {
            allSubjects = data2.all_subjects;
            loggedUserAllDegree(id, function(data2) {
                allDegrees = data2.all_degrees;
                loggedUserAllCollege(id, function(data2) {
                    allColleges = data2.all_colleges;
                    getAllSubjectDegreeCollegePostId(allSubjects, allColleges, allDegrees, function(data) {

                        checkUserWalls(id, function(data1) {
                            data1.current_following.push(id);
                            //   getusertimelinescroll(id, counterListTimeline, function (data) {
                            getusertimelineForWallonlyFollowersWithMatch(id, data, data1.current_following, counterListTimeline, function(data) {
                                // console.log("helllo",data.result);
                                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
                            });
                        });
                    });
                });
            });
        });
    }
});


ctrl.get('/getusertimelineForSharedWithMatch/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var subjectPosts;
        loggedUserAllSubjects(id, function(data2) {
            allSubjects = data2.all_subjects;
            loggedUserAllDegree(id, function(data2) {
                allDegrees = data2.all_degrees;
                loggedUserAllCollege(id, function(data2) {
                    allColleges = data2.all_colleges;
                    getAllSubjectDegreeCollegePostId(allSubjects, allColleges, allDegrees, function(data) {

                        checkUserWalls(id, function(data1) {
                            // data1.current_friend.push(id);
                            //   getusertimelinescroll(id, counterListTimeline, function (data) {
                            getusertimelineForWallonlyShared(id, data, data1.current_friend, counterListTimeline, function(data) {
                                console.log("helllo", data.result);
                                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
                            });
                        });
                    });
                });
            });
        });
    }
});

ctrl.get('/getusertimelineForSharedFollowersWithMatch/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var subjectPosts;
        loggedUserAllSubjects(id, function(data2) {
            allSubjects = data2.all_subjects;
            loggedUserAllDegree(id, function(data2) {
                allDegrees = data2.all_degrees;
                loggedUserAllCollege(id, function(data2) {
                    allColleges = data2.all_colleges;
                    getAllSubjectDegreeCollegePostId(allSubjects, allColleges, allDegrees, function(data) {

                        checkUserWalls(id, function(data1) {
                            // data1.current_friend.push(id);
                            //   getusertimelinescroll(id, counterListTimeline, function (data) {
                            getusertimelineForWallonlySharedFollowersWithMatch(id, data, data1.current_following, counterListTimeline, function(data) {
                                console.log("helllo with ", data.result);
                                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
                            });
                        });
                    });
                });
            });
        });
    }
});


ctrl.get('/getusertimelineForSharedWithoutMatch/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var subjectPosts;
        checkUserWalls(id, function(data1) {
            // data1.current_friend.push(id);
            //   getusertimelinescroll(id, counterListTimeline, function (data) {
            getusertimelineForWallonlySharedWithoutMatch(id, data1.current_friend, counterListTimeline, function(data) {
                console.log("helllo without", data.result);
                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
            });
        });
    }
});

ctrl.get('/getusertimelineForSharedFollowersWithoutMatch/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var subjectPosts;
        checkUserWalls(id, function(data1) {
            getusertimelineForWallonlySharedForFollowersWithoutMatch(id, data1.current_following, counterListTimeline, function(data) {
                console.log("hello ritu", data.result);
                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
            });
        });
    }
});


ctrl.get('/getusertimelineForFriendsWithoutMatch/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var subjectPosts;
        var current_friend;

        checkUserWalls(id, function(data1) {
            data1.current_friend.push(id);
            //   getusertimelinescroll(id, counterListTimeline, function (data) {
            getusertimelineForWallonlyFriendswithoutMatch(id, data1.current_friend, counterListTimeline, function(data) {
                // console.log("helllo",data.result);
                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
            });
        });
    }
});


ctrl.get('/getusertimelineForFollowersWithoutMatch/:counterListTimeline', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var subjectPosts;
        var current_friend;
        checkUserWalls(id, function(data1) {
            data1.current_following.push(id);
            //   getusertimelinescroll(id, counterListTimeline, function (data) {
            getusertimelineForWallonlyFollowerswithoutMatch(id, data1.current_following, counterListTimeline, function(data) {
                // console.log("helllo",data.result);
                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
            });
        });
    }
});



ctrl.get('/getusertimelinescroll/:counterList', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterList = req.params.counterList;
        getusertimelinescroll(id, counterList, function(data) {
            res.json({ status: 2, data: data });
        });
    }
});

ctrl.get('/getusertimelinephone/:counterListTimeline/:post_type', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var post_type = req.params.post_type;
        getUserFriendsIds(id, function(friends) {
            getusertimelinephonescroll(id, friends.friends, counterListTimeline, post_type, friends.hidden_postIds, function(data) {
                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
            });
        });
    }
});
ctrl.get('/getFriendTimelinePhone/:counterListTimeline/:post_type/:friendId', function(req, res) {
    if (req.session.passport) {
        var friendId = req.params.friendId;
        var counterListTimeline = req.params.counterListTimeline;
        var userId = req.session.passport.user;
        var post_type = req.params.post_type;
        getfriendtimelinephonescroll(userId, friendId, counterListTimeline, post_type, function(data) {
            res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getfriendtimelinescroll(userId, friendId, counterList, callback) {
    var limit = 10;
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    var condition;
    checkUserFriendId(userId, friendId, function(data) {
        if (data.current_friend) {
            condition = {
                $or: [{
                        $and: [
                            { 'created_by': friendId, 'share_type': 1 },
                            { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] }
                        ]
                    },
                    {
                        $and: [
                            { 'created_by': userId, 'share_type': 2 },
                            { 'custom': { $in: [friendId] } },
                        ]
                    }
                ]
            };
        } else if (data.current_following && !data.current_friend) {
            condition = {
                $and: [
                    { 'created_by': friendId, 'share_type': 1 },
                    { 'privacy': { $in: [1, 4, 6] } }
                ]
            };
        } else {
            condition = {
                $and: [
                    { 'created_by': friendId, 'share_type': 1 },
                    { 'privacy': 1 }
                ]
            };
        }

        var conditionForComment = { '_id': friendId };
        // var conditionForSCD = { 'members.user_id': { $in: [friendId] } };

        Event.find({})
            .populate({ path: 'created_by', select: 'fname lname photo _id' })
            .populate({
                path: 'post_id',
                model: 'Post',
                match: condition,
                select: 'name college_id subject_id degree_id group_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom share_type',
                populate: {
                    path: 'comments.comment_by college_id subject_id degree_id group_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                    select: 'fname lname photo name title subject_id college_id degree_id',
                }
            })
            .populate({
                path: 'friend_id',
                model: 'User',
                match: conditionForComment,
                select: 'fname lname photo _id'
            })
            // .populate({
            //     path: 'subject_id',
            //     model: 'Subject',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'college_id',
            //     model: 'College',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'degree_id',
            //     model: 'Degree',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            .sort(sort)
            // .limit(limit)
            // .skip(skip)
            .exec(function(err, result) {
                if (err) {
                    throw err;
                }
                Event.find({})
                    .populate({ path: 'created_by', select: 'fname lname photo _id' })
                    .populate({
                        path: 'post_id',
                        model: 'Post',
                        match: condition,
                        select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy college_id subject_id degree_id original_post_id origin_creator shared_title custom share_type',
                        populate: {
                            path: 'comments.comment_by likes.user_id flag.user_id share.user_id created_by origin_creator',
                            select: 'fname lname photo',
                            model: 'User'
                        }
                    })
                    .populate({
                        path: 'friend_id',
                        model: 'User',
                        match: conditionForComment,
                        select: 'fname lname photo _id'
                    })
                    // .populate({
                    //     path: 'subject_id',
                    //     model: 'Subject',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'college_id',
                    //     model: 'College',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'degree_id',
                    //     model: 'Degree',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    .sort(sort)
                    .exec(function(err, total_timeline) {
                        if (err) {
                            throw err;
                        }
                        Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                            if (err)
                                throw err;
                            College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    var data = result.filter(function(timeline) {

                                        return timeline.post_id || timeline.friend_id;
                                    });
                                    var total_data = total_timeline.filter(function(timeline) {
                                        return timeline.post_id || timeline.friend_id;
                                    });
                                    data = data.slice(skip, skip + limit);
                                    callback({ result: data, total_timeline: total_data.length });
                                });
                            });
                        });
                    });
            });
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
            console.log("SCD SCD SCD", all_subjects);
            callback({ all_subjects: all_subjects });
        }
    );
}

function loggedUserAllDegree(logged, callback) {

    var User = require('../models/user');
    User.find({ "_id": logged }, { degree: 1 },
        function(err, result) {
            var degrees = result[0].degree;
            var all_degrees = [];
            for (var i in degrees) {
                all_degrees.push(degrees[i].degree_id);

            }
            console.log("SCD SCD SCD", all_degrees);

            callback({ all_degrees: all_degrees });
        }
    );
}

function loggedUserAllCollege(logged, callback) {

    var User = require('../models/user');
    User.find({ "_id": logged }, { college: 1 },
        function(err, result) {
            var colleges = result[0].college;
            var all_colleges = [];
            for (var i in colleges) {
                all_colleges.push(colleges[i].college_id);

            }
            console.log("SCD SCD SCD", all_colleges);
            callback({ all_colleges: all_colleges });
        }
    );
}


function getAllSubjectDegreeCollegePostId(subject_id, college_id, degree_id, callback) {
    var post_IDs = [];
    Subject.find({ '_id': { $in: subject_id } })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function(err, subject) {
            var all_subjects = [];
            var all_subjects1 = [];

            for (var i in subject) {
                all_subjects.push(subject[i].post);
            }
            for (var i in all_subjects) {
                console.log(all_subjects[i]);
                all_subjects1 = all_subjects[i];
                for (var j in all_subjects1) {
                    post_IDs.push(all_subjects1[j].post_id);
                }
            }
        });
    console.log('collegesss list', college_id);
    College.find({ '_id': { $in: college_id } })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function(err, college) {

            var all_colleges = [];
            var all_colleges1 = [];

            for (var i in college) {
                all_colleges.push(college[i].post);
            }
            for (var i in all_colleges) {
                all_colleges1 = all_colleges[i];
                for (var j in all_colleges1) {
                    post_IDs.push(all_colleges1[j].post_id);
                }
            }
        });

    Degree.find({ '_id': { $in: degree_id } })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function(err, degree) {
            var all_degrees = [];
            var all_degrees1 = [];


            for (var i in degree) {
                all_degrees.push(degree[i].post);
            }

            for (var i in all_degrees) {
                all_degrees1 = all_degrees[i];
                for (var j in all_degrees1) {
                    post_IDs.push(all_degrees1[j].post_id);
                }
            }
            callback(post_IDs);
        });
}

function checkUserWalls(user_id, callback) {
    console.log("hello saurabh");
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
            for (var i in data) {
                if (data[i].status == 3) {
                    current_friend.push(data[i].friend_id);

                }
            }
            for (var i in subjects) {
                current_subjects.push(subjects[i].subject_id);
            }
            for (var i in following) {
                current_following.push(following[i].following_id);
            }
            for (var i in followers) {
                current_followers.push(followers[i].follower_id);
            }
            callback({ current_friend: current_friend, current_subjects: current_subjects, current_following: current_following, current_followers: current_followers });
        });
}

function getusertimelinescroll(id, friends, counterList, hidden_postIds, callback) {
    getReportedPostIds(function(reportedPostIds) {
        var limit = 10;
        var skip = counterList * limit;
        var sort = { 'timestamp': -1 };
        var condition = {
            '_id': { $nin: hidden_postIds, $nin: reportedPostIds },
            $or: [{ 'created_by': id, 'share_type': 1 },
                {
                    $and: [
                        { 'created_by': { $in: friends }, 'share_type': 2 },
                        { privacy: 5, custom: { $in: [id] } },
                    ]
                }
            ]
        };
        var conditionForComment = { '_id': id };
        // var conditionForSCD = { 'members.user_id': { $in: [id] } };

        Event.find({})
            .populate({ path: 'created_by', select: 'fname lname photo _id' })
            .populate({
                path: 'post_id',
                model: 'Post',
                match: condition,
                select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom share_type',
                populate: {
                    path: 'comments.comment_by college_id subject_id degree_id group_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                    select: 'fname lname photo name title college_id subject_id degree_id ',
                }
            })
            .populate({
                path: 'friend_id',
                model: 'User',
                match: conditionForComment,
                select: 'fname lname photo _id'
            })
            // .populate({
            //     path: 'subject_id',
            //     model: 'Subject',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'college_id',
            //     model: 'College',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'degree_id',
            //     model: 'Degree',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            .sort(sort)
            .exec(function(err, result) {
                if (err) {
                    throw err;
                }
                Event.find({})
                    .populate({ path: 'created_by', select: 'fname lname photo _id' })
                    .populate({
                        path: 'post_id',
                        model: 'Post',
                        match: condition,
                        select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom share_type',
                        populate: {
                            path: 'comments.comment_by likes.user_id flag.user_id share.user_id created_by origin_creator',
                            select: 'fname lname photo',
                            model: 'User'
                        }
                    })
                    .populate({
                        path: 'friend_id',
                        match: conditionForComment,
                        select: 'fname lname photo _id'
                    })
                    // .populate({
                    //     path: 'subject_id',
                    //     model: 'Subject',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'college_id',
                    //     model: 'College',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'degree_id',
                    //     model: 'Degree',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    .sort(sort)
                    .exec(function(err, total_timeline) {
                        if (err) {
                            throw err;
                        }
                        Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                            if (err)
                                throw err;
                            College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    var data = result.filter(function(timeline) {
                                        return timeline.post_id || timeline.friend_id;
                                    });
                                    var total_data = total_timeline.filter(function(timeline) {
                                        return timeline.post_id || timeline.friend_id;
                                    });

                                    data = data.slice(skip, skip + limit);
                                    callback({ result: data, total_timeline: total_data.length });
                                })
                            });
                        });
                    });
            });
    });

}

function getusertimelinephonescroll(id, friends, counterList, post_type, hidden_postIds, callback) {
    var limit = 10;
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    var condition;
    if (post_type == 10) {
        condition = {
            '_id': { $nin: hidden_postIds },
            $or: [{ 'created_by': id, 'share_type': 1 },
                {
                    $and: [
                        { 'created_by': { $in: friends }, 'share_type': 2 },
                        { privacy: 5, custom: { $in: [id] } },
                    ]
                }
            ]
        };
    } else {
        condition = {
            '_id': { $nin: hidden_postIds },
            $or: [{ 'created_by': id, 'post_type': post_type, 'share_type': 1 },
                {
                    $and: [
                        { 'created_by': { $in: friends }, 'share_type': 2 },
                        { privacy: 5, custom: { $in: [id] } },
                    ]
                }
            ]
        };
    }

    var conditionForComment = { '_id': id };
    // var conditionForSCD = { 'members.user_id': { $in: [id] } };
    if (post_type == 10) {
        Event.find({})
            .populate({ path: 'created_by', select: 'fname lname photo _id' })
            .populate({
                path: 'post_id',
                model: 'Post',
                match: condition,
                select: 'name college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom share_type',
                populate: {
                    path: 'comments.comment_by college_id subject_id degree_id group_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                    select: 'fname lname photo name title college_id subject_id degree_id',
                    // model: 'User'
                }
            })
            .populate({
                path: 'friend_id',
                model: 'User',
                match: conditionForComment,
                select: 'fname lname photo _id'
            })
            // .populate({
            //     path: 'subject_id',
            //     model: 'Subject',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'college_id',
            //     model: 'College',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'degree_id',
            //     model: 'Degree',
            //     match: conditionForSCD,
            //     select: 'name'
            // })
            .sort(sort)
            .exec(function(err, result) {
                if (err) {
                    throw err;
                }
                Event.find({})
                    .populate({ path: 'created_by', select: 'fname lname photo _id' })
                    .populate({
                        path: 'post_id',
                        model: 'Post',
                        match: condition,
                        select: 'name college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type',
                        populate: {
                            path: 'comments.comment_by college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                            select: 'fname lname photo name',
                            // model: 'User'
                        }
                    })
                    .populate({
                        path: 'friend_id',
                        model: 'User',
                        match: conditionForComment,
                        select: 'fname lname photo _id'
                    })
                    // .populate({
                    //     path: 'subject_id',
                    //     model: 'Subject',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'college_id',
                    //     model: 'College',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'degree_id',
                    //     model: 'Degree',
                    //     match: conditionForSCD,
                    //     select: 'name'
                    // })
                    .sort(sort)
                    .exec(function(err, total_timeline) {
                        if (err) {
                            throw err;
                        }
                        Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                            if (err)
                                throw err;
                            College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    var data = result.filter(function(timeline) {
                                        return timeline.post_id || timeline.friend_id;
                                    });
                                    var total_data = total_timeline.filter(function(timeline) {
                                        return timeline.post_id || timeline.friend_id;
                                    });

                                    data = data.slice(skip, skip + limit);
                                    callback({ result: data, total_timeline: total_data.length });
                                });
                            });
                        });
                    });
            });
    } else {
        Event.find({})
            .populate({ path: 'created_by', select: 'fname lname photo _id' })
            .populate({
                path: 'post_id',
                model: 'Post',
                match: condition,
                select: 'name college_id subject_id degree_id group_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type',
                populate: {
                    path: 'comments.comment_by group_id college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                    select: 'fname lname photo name title college_id subject_id degree_id',
                    // model: 'User'
                }
            })
            .sort(sort)
            .exec(function(err, result) {
                if (err) {
                    throw err;
                }
                Event.find({})
                    .populate({ path: 'created_by', select: 'fname lname photo _id' })
                    .populate({
                        path: 'post_id',
                        model: 'Post',
                        match: condition,
                        select: 'name college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type',
                        populate: {
                            path: 'comments.comment_by college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                            select: 'fname lname photo name',
                            // model: 'User'
                        }
                    })
                    .sort(sort)
                    .exec(function(err, total_timeline) {
                        if (err) {
                            throw err;
                        }
                        Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                            if (err)
                                throw err;
                            College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    var data = result.filter(function(timeline) {
                                        return timeline.post_id;
                                    });
                                    var total_data = total_timeline.filter(function(timeline) {
                                        return timeline.post_id;
                                    });

                                    data = data.slice(skip, skip + limit);
                                    callback({ result: data, total_timeline: total_data.length });
                                });
                            });
                        });
                    });
            });
    }
}

function getfriendtimelinephonescroll(userId, friendId, counterList, post_type, callback) {
    var limit = 10;
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    var condition;
    var postCondtionForUserPost;
    var postCondtionForSharePost;
    if (post_type == 10) {
        postCondtionForUserPost = { 'created_by': friendId, 'share_type': 1 };
        postCondtionForSharePost = { 'created_by': userId, 'share_type': 2 };
    } else {
        postCondtionForUserPost = { 'created_by': friendId, 'post_type': post_type, 'share_type': 1 };
        postCondtionForSharePost = { 'created_by': userId, 'post_type': post_type, 'share_type': 2 };
    }
    checkUserFriendId(userId, friendId, function(data) {
        if (data.current_friend) {
            condition = {
                $or: [{
                        $and: [
                            postCondtionForUserPost,
                            { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] }
                        ]
                    },
                    {
                        $and: [
                            postCondtionForSharePost,
                            { 'custom': { $in: [friendId] } },
                        ]
                    }
                ]
            };
        } else if (data.current_following && !data.current_friend) {
            condition = {
                $and: [
                    postCondtionForUserPost,
                    { 'privacy': { $in: [1, 4, 6] } }
                ]
            };
        } else {
            condition = {
                $and: [
                    postCondtionForUserPost,
                    { 'privacy': 1 }
                ]
            };
        }

        var conditionForComment = { '_id': friendId };
        // var conditionForSCD = { 'members.user_id': { $in: [friendId] } };
        if (post_type == 10) {
            Event.find({})
                .populate({ path: 'created_by', select: 'fname lname photo _id' })
                .populate({
                    path: 'post_id',
                    model: 'Post',
                    match: condition,
                    select: 'name college_id subject_id degree_id group_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom share_type',
                    populate: {
                        path: 'comments.comment_by group_id college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                        select: 'fname lname photo name title college_id subject_id degree_id',
                    }
                })
                .populate({
                    path: 'friend_id',
                    model: 'User',
                    match: conditionForComment,
                    select: 'fname lname photo _id'
                })
                // .populate({
                //     path: 'subject_id',
                //     model: 'Subject',
                //     match: conditionForSCD,
                //     select: 'name'
                // })
                // .populate({
                //     path: 'college_id',
                //     model: 'College',
                //     match: conditionForSCD,
                //     select: 'name'
                // })
                // .populate({
                //     path: 'degree_id',
                //     model: 'Degree',
                //     match: conditionForSCD,
                //     select: 'name'
                // })
                .sort(sort)
                // .limit(limit)
                // .skip(skip)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Event.find({})
                        .populate({ path: 'created_by', select: 'fname lname photo _id' })
                        .populate({
                            path: 'post_id',
                            model: 'Post',
                            match: condition,
                            select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy college_id subject_id degree_id original_post_id origin_creator shared_title custom share_type',
                            populate: {
                                path: 'comments.comment_by likes.user_id flag.user_id share.user_id created_by origin_creator',
                                select: 'fname lname photo',
                                model: 'User'
                            }
                        })
                        .populate({
                            path: 'friend_id',
                            model: 'User',
                            match: conditionForComment,
                            select: 'fname lname photo _id'
                        })
                        // .populate({
                        //     path: 'subject_id',
                        //     model: 'Subject',
                        //     match: conditionForSCD,
                        //     select: 'name'
                        // })
                        // .populate({
                        //     path: 'college_id',
                        //     model: 'College',
                        //     match: conditionForSCD,
                        //     select: 'name'
                        // })
                        // .populate({
                        //     path: 'degree_id',
                        //     model: 'Degree',
                        //     match: conditionForSCD,
                        //     select: 'name'
                        // })
                        .sort(sort)
                        .exec(function(err, total_timeline) {
                            if (err) {
                                throw err;
                            }
                            Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                        if (err)
                                            throw err;
                                        var data = result.filter(function(timeline) {

                                            return timeline.post_id || timeline.friend_id;
                                        });
                                        var total_data = total_timeline.filter(function(timeline) {
                                            return timeline.post_id || timeline.friend_id;
                                        });
                                        data = data.slice(skip, skip + limit);
                                        callback({ result: data, total_timeline: total_data.length });
                                    });
                                });
                            });
                        });
                });
        } else {
            Event.find({})
                .populate({ path: 'created_by', select: 'fname lname photo _id' })
                .populate({
                    path: 'post_id',
                    model: 'Post',
                    match: condition,
                    select: 'name college_id group_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom share_type',
                    populate: {
                        path: 'comments.comment_by group_id college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                        select: 'fname lname photo name title college_id subject_id degree_id',
                    }
                })
                .sort(sort)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Event.find({})
                        .populate({ path: 'created_by', select: 'fname lname photo _id' })
                        .populate({
                            path: 'post_id',
                            model: 'Post',
                            match: condition,
                            select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy college_id subject_id degree_id original_post_id origin_creator shared_title custom share_type',
                            populate: {
                                path: 'comments.comment_by likes.user_id flag.user_id share.user_id created_by origin_creator',
                                select: 'fname lname photo',
                                model: 'User'
                            }
                        })
                        .sort(sort)
                        .exec(function(err, total_timeline) {
                            if (err) {
                                throw err;
                            }
                            Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                        if (err)
                                            throw err;
                                        var data = result.filter(function(timeline) {

                                            return timeline.post_id;
                                        });
                                        var total_data = total_timeline.filter(function(timeline) {
                                            return timeline.post_id;
                                        });
                                        data = data.slice(skip, skip + limit);
                                        callback({ result: data, total_timeline: total_data.length });
                                    });
                                });
                            });
                        });
                });
        }
    });
}

function getusertimelineForWallonlyFriends(id, subjectPosts, current_friend, counterList, callback) {
    var limit = 10;
    // console.log("hello saurabh",subjectPosts);
    // console.log("current_friend",current_friend);
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    Event.find({ 'created_by': { $in: current_friend }, 'post_id': { $in: subjectPosts }, "title": { $not: /^shared/i } })
        .populate({ path: 'created_by', select: 'fname lname photo _id ' })
        .populate({
            path: 'post_id',
            model: 'Post',
            // match : {"created_by": {$in: [7,6,13,14]}},
            select: 'name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom',
            populate: {
                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator',
                select: 'fname lname photo _id',
                // model: 'User'
            }
        })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            callback({ result: result });
        });
}

function getusertimelineForWallonlyShared(id, subjectPosts, current_friend, counterList, callback) {
    var limit = 10;
    // console.log("hello saurabh",subjectPosts);
    // console.log("current_friend",current_friend);
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    Event.find({ 'created_by': { $in: current_friend }, 'post_id': { $in: subjectPosts }, "title": { $regex: /^shared/i } })
        .populate({ path: 'created_by', select: 'fname lname photo _id ' })
        .populate({
            path: 'post_id',
            model: 'Post',
            match: { "share": { $elemMatch: { "user_id": { $in: current_friend } } }, "share_privacy": { $in: [1, 3, 6] } },
            select: 'name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom',
            populate: {
                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator',
                select: 'fname lname photo _id',
                // model: 'User'
            }
        })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            callback({ result: result });
        });
}


function getusertimelineForWallonlySharedFollowersWithMatch(id, subjectPosts, current_following, counterList, callback) {
    var limit = 10;
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    Event.find({ 'created_by': { $in: current_following }, 'post_id': { $in: subjectPosts }, "title": { $regex: /^shared/i } })
        .populate({ path: 'created_by', select: 'fname lname photo _id ' })
        .populate({
            path: 'post_id',
            model: 'Post',
            match: { "share": { $elemMatch: { "user_id": { $in: current_following } } }, "share_privacy": { $in: [1, 4, 6] } },
            select: 'name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom',
            populate: {
                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator',
                select: 'fname lname photo _id',
                // model: 'User'
            }
        })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            callback({ result: result });
        });
}



function getusertimelineForWallonlySharedWithoutMatch(id, current_friend, counterList, callback) {
    var limit = 10;
    // console.log("hello saurabh",subjectPosts);
    // console.log("current_friend",current_friend);
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    Event.find({ 'created_by': { $in: current_friend }, "title": { $regex: /^shared/i } })
        .populate({ path: 'created_by', select: 'fname lname photo _id ' })
        .populate({
            path: 'post_id',
            model: 'Post',
            match: { "share": { $elemMatch: { "user_id": { $in: current_friend } } }, "share_privacy": { $in: [1, 3, 6] } },
            select: 'name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom',
            populate: {
                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator',
                select: 'fname lname photo _id',
                // model: 'User'
            }
        })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            callback({ result: result });
        });
}


function getusertimelineForWallonlySharedForFollowersWithoutMatch(id, current_friend, counterList, callback) {
    var limit = 10;
    // console.log("hello saurabh",subjectPosts);
    console.log("current_friend", current_friend);
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    Event.find({ 'created_by': { $in: current_friend }, "title": { $regex: /^shared/i } })
        .populate({ path: 'created_by', select: 'fname lname photo _id ' })
        .populate({
            path: 'post_id',
            model: 'Post',
            match: { "share": { $elemMatch: { "user_id": { $in: current_friend } } }, "share_privacy": { $in: [1, 4, 6] } },
            select: 'name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom',
            populate: {
                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator',
                select: 'fname lname photo _id',
                // model: 'User'
            }
        })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            callback({ result: result });
        });
}


function getusertimelineForWallonlyFollowersWithMatch(id, subjectPosts, current_following, counterList, callback) {
    var limit = 10;
    // console.log("hello saurabh",subjectPosts);
    // console.log("current_friend",current_friend);
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    Event.find({ 'created_by': { $in: current_following }, 'post_id': { $in: subjectPosts }, "title": { $not: /^shared/i } })
        .populate({ path: 'created_by', select: 'fname lname photo _id ' })
        .populate({
            path: 'post_id',
            model: 'Post',
            // match : {"created_by": {$in: [7,6,13,14]}},
            select: 'name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom',
            populate: {
                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator',
                select: 'fname lname photo _id',
                // model: 'User'
            }
        })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            callback({ result: result });
        });
}


function getusertimelineForWallonlyFriendswithoutMatch(id, current_friend, counterList, callback) {
    var limit = 10;
    // console.log("hello saurabh",subjectPosts);
    // console.log("current_friend",current_friend);
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    Event.find({ 'created_by': { $in: current_friend }, "title": { $not: /^shared/i } })
        .populate({ path: 'created_by', select: 'fname lname photo _id ' })
        .populate({
            path: 'post_id',
            model: 'Post',
            // match : {"created_by": {$in: [7,6,13,14]}},
            select: 'name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom',
            populate: {
                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id subject_id college_id degree_id origin_creator',
                select: 'fname lname photo _id name',
                // model: 'User'
            }
        })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            callback({ result: result });
        });
}


function getusertimelineForWallonlyFollowerswithoutMatch(id, current_following, counterList, callback) {
    var limit = 10;
    // console.log("hello saurabh",subjectPosts);
    // console.log("current_friend",current_friend);
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    Event.find({ 'created_by': { $in: current_following }, "title": { $not: /^shared/i } })
        .populate({ path: 'created_by', select: 'fname lname photo _id ' })
        .populate({
            path: 'post_id',
            model: 'Post',
            // match : {"created_by": {$in: [7,6,13,14]}},
            select: 'name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy',
            populate: {
                path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id',
                select: 'fname lname photo _id',
                // model: 'User'
            }
        })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            callback({ result: result });
        });
}





function getEventsByUserId(id, callback) {
    Event.find({ 'created_by': id }).populate({
        path: 'focus_id',
        model: 'Focus',
        populate: {
            path: 'comments.comment_by',
            select: 'fname lname photo',
            model: 'User'
        }
    }).exec(function(err, result) {
        callback(result);
    });
}

function getUserFriendsIds(id, callback) {
    User.findOne({ _id: id }, { friends: 1, hidden_postIds: 1 },
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
            callback({ friends: current_friend, hidden_postIds: friends.hidden_postIds });
        });

}

function checkUserFriendId(id, friendId, callback) {
    var User = require('../models/user');
    User.findOne({ '_id': id }, { 'friends': 1, 'following': 1 },
        function(err, users) {
            var current_friend = false;
            var current_following = false;
            for (var user of users.friends) {
                if (user.status == 3 && user.friend_id == friendId) {
                    current_friend = true;
                    break;
                }
            }
            for (var user of users.following) {
                if (user.following_id == friendId) {
                    current_following = true;
                    break;
                }
            }
            callback({ current_friend: current_friend, current_following: current_following });
        });

}

/************** Advanced User TimeLine SCD Post Search ***************/

ctrl.post('/timeLineAdvanceSearch/:counter', function(req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var collegesIds = req.body.collegeIds;
        var degreeIds = req.body.degreeIds;
        var subjectIds = req.body.subjectIds;
        var counterList = req.params.counter;
        getUserFriendsIds(userId, function(friends) {
            getusertimelineAdvanceSearchScroll(userId, subjectIds, collegesIds, degreeIds, friends.friends, counterList, friends.hidden_postIds, function(data) {
                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getusertimelineAdvanceSearchScroll(id, subjectIds, collegeIds, degreeIds, friends, counterList, hidden_postIds, callback) {
    var limit = 10;
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    var condition = {
        '_id': { $nin: hidden_postIds },
        $and: [{
                $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegeIds } }, { 'degree_id': { $in: degreeIds } }]
            },
            {
                $or: [{ 'created_by': id, 'share_type': 1 },
                    {
                        $and: [
                            { 'created_by': { $in: friends }, 'share_type': 2 },
                            { privacy: 5, custom: { $in: [id] } },
                        ]
                    }
                ]
            }
        ]

    };
    // var conditionForS = {
    //     $and: [{ 'members.user_id': { $in: [id] } },
    //     {
    //         $or: [
    //             { '_id': { $in: subjectIds } }
    //         ]
    //     }
    //     ]
    // };
    // var conditionForC = {
    //     $and: [{ 'members.user_id': { $in: [id] } },
    //     {
    //         $or: [
    //             { '_id': { $in: collegeIds } }
    //         ]
    //     }
    //     ]
    // };
    // var conditionForD = {
    //     $and: [{ 'members.user_id': { $in: [id] } },
    //     {
    //         $or: [
    //             { '_id': { $in: degreeIds } }
    //         ]
    //     }
    //     ]
    // };
    Event.find({})
        .populate({ path: 'created_by', select: 'fname lname photo _id' })
        .populate({
            path: 'post_id',
            model: 'Post',
            match: condition,
            select: 'name college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom share_type',
            populate: {
                path: 'comments.comment_by college_id group_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                select: 'fname lname photo name title subject_id college_id degree_id',
                // model: 'User'
            }
        })
        // .populate({
        //     path: 'subject_id',
        //     model: 'Subject',
        //     match: conditionForS,
        //     select: 'name'
        // })
        // .populate({
        //     path: 'college_id',
        //     model: 'College',
        //     match: conditionForC,
        //     select: 'name'
        // })
        // .populate({
        //     path: 'degree_id',
        //     model: 'Degree',
        //     match: conditionForD,
        //     select: 'name'
        // })
        .sort(sort)
        .exec(function(err, result) {
            if (err) {
                throw err;
            }
            Event.find({})
                .populate({ path: 'created_by', select: 'fname lname photo _id' })
                .populate({
                    path: 'post_id',
                    model: 'Post',
                    match: condition,
                    select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type',
                    populate: {
                        path: 'comments.comment_by likes.user_id flag.user_id share.user_id created_by origin_creator',
                        select: 'fname lname photo',
                        model: 'User'
                    }
                })
                // .populate({
                //     path: 'subject_id',
                //     model: 'Subject',
                //     match: conditionForS,
                //     select: 'name'
                // })
                // .populate({
                //     path: 'college_id',
                //     model: 'College',
                //     match: conditionForC,
                //     select: 'name'
                // })
                // .populate({
                //     path: 'degree_id',
                //     model: 'Degree',
                //     match: conditionForD,
                //     select: 'name'
                // })
                .sort(sort)
                .exec(function(err, total_timeline) {
                    if (err) {
                        throw err;
                    }
                    Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                        if (err)
                            throw err;
                        College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                            if (err)
                                throw err;
                            Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                var data = result.filter(function(timeline) {
                                    return timeline.post_id;
                                });
                                var total_data = total_timeline.filter(function(timeline) {
                                    return timeline.post_id;
                                });
                                data = data.slice(skip, skip + limit);
                                callback({ result: data, total_timeline: total_data.length });
                            });
                        });
                    });
                });
        });

}

/************** Advanced Friend TimeLine SCD Post Search ***************/

ctrl.post('/friendTimeLineAdvanceSearch/:counter/:friendId', function(req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var collegesIds = req.body.collegeIds;
        var degreeIds = req.body.degreeIds;
        var subjectIds = req.body.subjectIds;
        var counterList = req.params.counter;
        var friendId = req.params.friendId;
        getFriendTimelineAdvanceSearchscroll(userId, friendId, subjectIds, collegesIds, degreeIds, counterList, function(data) {
            res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getFriendTimelineAdvanceSearchscroll(userId, friendId, subjectIds, collegesIds, degreeIds, counterList, callback) {
    var limit = 10;
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    var condition;
    checkUserFriendId(userId, friendId, function(data) {
        if (data.current_friend) {
            condition = {
                $and: [{
                        $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }]
                    },
                    {
                        $or: [{
                                $and: [
                                    { 'created_by': friendId, 'share_type': 1 },
                                    { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] }
                                ]
                            },
                            {
                                $and: [
                                    { 'created_by': userId, 'share_type': 2 },
                                    { 'custom': { $in: [friendId] } },
                                ]
                            }
                        ]

                    }
                ]
            };
        } else if (data.current_following && !data.current_friend) {
            condition = {
                $and: [
                    { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] },
                    { 'created_by': friendId, 'share_type': 1 },
                    { 'privacy': { $in: [1, 4, 6] } }
                ]
            };
        } else {
            condition = {
                $and: [
                    { $or: [{ 'subject_id': { $in: subjectIds } }, { 'college_id': { $in: collegesIds } }, { 'degree_id': { $in: degreeIds } }] },
                    { 'created_by': friendId, 'share_type': 1 },
                    { 'privacy': 1 }
                ]
            };
        }

        // var conditionForS = {
        //     $and: [
        //         { 'members.user_id': { $in: [friendId] } },
        //         {
        //             $or: [
        //                 { '_id': { $in: subjectIds } }
        //             ]
        //         }
        //     ]
        // };
        // var conditionForC = {
        //     $and: [
        //         { 'members.user_id': { $in: [friendId] } },
        //         {
        //             $or: [
        //                 { '_id': { $in: collegesIds } }
        //             ]
        //         }
        //     ]
        // };
        // var conditionForD = {
        //     $and: [
        //         { 'members.user_id': { $in: [friendId] } },
        //         {
        //             $or: [
        //                 { '_id': { $in: degreeIds } }
        //             ]
        //         }
        //     ]
        // };
        Event.find({})
            .populate({ path: 'created_by', select: 'fname lname photo _id' })
            .populate({
                path: 'post_id',
                model: 'Post',
                match: condition,
                select: 'name college_id subject_id degree_id group_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom share_type',
                populate: {
                    path: 'comments.comment_by group_id college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                    select: 'fname lname photo name title subject_id college_id degree_id',
                }
            })
            // .populate({
            //     path: 'subject_id',
            //     model: 'Subject',
            //     match: conditionForS,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'college_id',
            //     model: 'College',
            //     match: conditionForC,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'degree_id',
            //     model: 'Degree',
            //     match: conditionForD,
            //     select: 'name'
            // })
            .sort(sort)
            .exec(function(err, result) {
                if (err) {
                    throw err;
                }
                Event.find({})
                    .populate({ path: 'created_by', select: 'fname lname photo _id' })
                    .populate({
                        path: 'post_id',
                        model: 'Post',
                        match: condition,
                        select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy college_id subject_id degree_id original_post_id origin_creator shared_title custom share_type',
                        populate: {
                            path: 'comments.comment_by likes.user_id flag.user_id share.user_id created_by origin_creator',
                            select: 'fname lname photo',
                            model: 'User'
                        }
                    })
                    // .populate({
                    //     path: 'subject_id',
                    //     model: 'Subject',
                    //     match: conditionForS,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'college_id',
                    //     model: 'College',
                    //     match: conditionForC,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'degree_id',
                    //     model: 'Degree',
                    //     match: conditionForD,
                    //     select: 'name'
                    // })
                    .sort(sort)
                    .exec(function(err, total_timeline) {
                        if (err) {
                            throw err;
                        }
                        Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                            if (err)
                                throw err;
                            College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    var data = result.filter(function(timeline) {

                                        return timeline.post_id;
                                    });
                                    var total_data = total_timeline.filter(function(timeline) {
                                        return timeline.post_id;
                                    });
                                    data = data.slice(skip, skip + limit);
                                    callback({ result: data, total_timeline: total_data.length });
                                });
                            });
                        });
                    });
            });
    });
}


/************** Advanced Phone User TimeLine SCD Post Search ***************/


ctrl.post('/getusertimelinesearchphone/:counterListTimeline/:post_type', function(req, res) {
    if (req.session.passport) {
        var id = req.session.passport.user;
        var counterListTimeline = req.params.counterListTimeline;
        var post_type = req.params.post_type;
        var collegesIds = req.body.collegeIds;
        var degreeIds = req.body.degreeIds;
        var subjectIds = req.body.subjectIds;
        getUserFriendsIds(id, function(friends) {
            getusertimelinephonesearchscroll(id, friends.friends, counterListTimeline, subjectIds, collegesIds, degreeIds, post_type, friends.hidden_postIds, function(data) {
                res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
            });
        });
    } else {
        res.status({ status: 0, msg: 'User not loggedIn.' });
    }
});

function getusertimelinephonesearchscroll(id, friends, counterList, subjectIds, collegesIds, degreeIds, post_type, hidden_postIds, callback) {
    var limit = 10;
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    var condition;
    if (post_type == 10) {
        condition = {
            '_id': { $nin: hidden_postIds },
            $or: [{ 'created_by': id, 'share_type': 1 },
                {
                    $and: [
                        { 'created_by': { $in: friends }, 'share_type': 2 },
                        { privacy: 5, custom: { $in: [id] } },
                    ]
                }
            ],
            $or: [
                { 'subject_id': { $in: subjectIds } },
                { 'college_id': { $in: collegesIds } },
                { 'degree_id': { $in: degreeIds } }
            ]
        };
    } else {
        condition = {
            '_id': { $nin: hidden_postIds },
            $and: [
                { 'post_type': post_type },
                {
                    $or: [{ 'created_by': id, 'share_type': 1 },
                        {
                            $and: [
                                { 'created_by': { $in: friends }, 'share_type': 2 },
                                { privacy: 5, custom: { $in: [id] } },
                            ]
                        }
                    ]
                },
                {
                    $or: [
                        { 'subject_id': { $in: subjectIds } },
                        { 'college_id': { $in: collegesIds } },
                        { 'degree_id': { $in: degreeIds } }
                    ]
                },
            ]
        };
    }
    // var conditionForS = {
    //     $and: [{ 'members.user_id': { $in: [id] } },
    //     {
    //         $or: [
    //             { '_id': { $in: subjectIds } }
    //         ]
    //     }
    //     ]
    // };
    // var conditionForC = {
    //     $and: [{ 'members.user_id': { $in: [id] } },
    //     {
    //         $or: [
    //             { '_id': { $in: collegesIds } }
    //         ]
    //     }
    //     ]
    // };
    // var conditionForD = {
    //     $and: [{ 'members.user_id': { $in: [id] } },
    //     {
    //         $or: [
    //             { '_id': { $in: degreeIds } }
    //         ]
    //     }
    //     ]
    // };
    if (post_type == 10) {
        Event.find({})
            .populate({ path: 'created_by', select: 'fname lname photo _id' })
            .populate({
                path: 'post_id',
                model: 'Post',
                match: condition,
                select: 'name group_id college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type',
                populate: {
                    path: 'comments.comment_by group_id college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                    select: 'fname lname photo name title college_id subject_id degree_id',
                    // model: 'User'
                }
            })
            // .populate({
            //     path: 'subject_id',
            //     model: 'Subject',
            //     match: conditionForS,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'college_id',
            //     model: 'College',
            //     match: conditionForC,
            //     select: 'name'
            // })
            // .populate({
            //     path: 'degree_id',
            //     model: 'Degree',
            //     match: conditionForD,
            //     select: 'name'
            // })
            .sort(sort)
            .exec(function(err, result) {
                if (err) {
                    throw err;
                }
                Event.find({})
                    .populate({ path: 'created_by', select: 'fname lname photo _id' })
                    .populate({
                        path: 'post_id',
                        model: 'Post',
                        match: condition,
                        select: 'name college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type',
                        populate: {
                            path: 'comments.comment_by college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                            select: 'fname lname photo name',
                            // model: 'User'
                        }
                    })
                    // .populate({
                    //     path: 'subject_id',
                    //     model: 'Subject',
                    //     match: conditionForS,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'college_id',
                    //     model: 'College',
                    //     match: conditionForC,
                    //     select: 'name'
                    // })
                    // .populate({
                    //     path: 'degree_id',
                    //     model: 'Degree',
                    //     match: conditionForD,
                    //     select: 'name'
                    // })
                    .sort(sort)
                    .exec(function(err, total_timeline) {
                        if (err) {
                            throw err;
                        }
                        Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                            if (err)
                                throw err;
                            College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    var data = result.filter(function(timeline) {
                                        return timeline.post_id;
                                    });
                                    var total_data = total_timeline.filter(function(timeline) {
                                        return timeline.post_id;
                                    });

                                    data = data.slice(skip, skip + limit);
                                    callback({ result: data, total_timeline: total_data.length });
                                });
                            });
                        });
                    });
            });
    } else {
        Event.find({})
            .populate({ path: 'created_by', select: 'fname lname photo _id' })
            .populate({
                path: 'post_id',
                model: 'Post',
                match: condition,
                select: 'name group_id college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type',
                populate: {
                    path: 'comments.comment_by group_id college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                    select: 'fname lname photo name title subject_id college_id degree_id',
                    // model: 'User'
                }
            })
            .sort(sort)
            .exec(function(err, result) {
                if (err) {
                    throw err;
                }
                Event.find({})
                    .populate({ path: 'created_by', select: 'fname lname photo _id' })
                    .populate({
                        path: 'post_id',
                        model: 'Post',
                        match: condition,
                        select: 'name college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom share_type',
                        populate: {
                            path: 'comments.comment_by college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                            select: 'fname lname photo name',
                            // model: 'User'
                        }
                    })
                    .sort(sort)
                    .exec(function(err, total_timeline) {
                        if (err) {
                            throw err;
                        }
                        Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                            if (err)
                                throw err;
                            College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    var data = result.filter(function(timeline) {
                                        return timeline.post_id;
                                    });
                                    var total_data = total_timeline.filter(function(timeline) {
                                        return timeline.post_id;
                                    });

                                    data = data.slice(skip, skip + limit);
                                    callback({ result: data, total_timeline: total_data.length });
                                });
                            });
                        });
                    });
            });
    }
}

ctrl.post('/getFriendTimelinePhoneSearch/:counterListTimeline/:post_type/:friendId', function(req, res) {
    if (req.session.passport) {
        var friendId = req.params.friendId;
        var counterListTimeline = req.params.counterListTimeline;
        var userId = req.session.passport.user;
        var post_type = req.params.post_type;
        var collegesIds = req.body.collegeIds;
        var degreeIds = req.body.degreeIds;
        var subjectIds = req.body.subjectIds;
        getfriendtimelinephonesearchscroll(userId, friendId, counterListTimeline, post_type, subjectIds, collegesIds, degreeIds, function(data) {
            res.json({ status: 2, data: data.result, total_timeline: data.total_timeline });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getfriendtimelinephonesearchscroll(userId, friendId, counterList, post_type, subjectIds, collegesIds, degreeIds, callback) {
    var limit = 10;
    var skip = counterList * limit;
    var sort = { 'timestamp': -1 };
    var condition;
    var postCondtionForUserPost;
    var postCondtionForSharePost;
    if (post_type == 10) {
        postCondtionForUserPost = { 'created_by': friendId, 'share_type': 1 };
        postCondtionForSharePost = { 'created_by': userId, 'share_type': 2 };
    } else {
        postCondtionForUserPost = { 'created_by': friendId, 'post_type': post_type, 'share_type': 1 };
        postCondtionForSharePost = { 'created_by': userId, 'post_type': post_type, 'share_type': 2 };
    }
    checkUserFriendId(userId, friendId, function(data) {
        if (data.current_friend) {
            condition = {
                $or: [{
                        $and: [
                            postCondtionForUserPost,
                            { $or: [{ 'privacy': { $in: [1, 3, 6] } }, { $and: [{ privacy: 5, custom: { $in: [userId] } }] }] },
                            {
                                $or: [
                                    { 'subject_id': { $in: subjectIds } },
                                    { 'college_id': { $in: collegesIds } },
                                    { 'degree_id': { $in: degreeIds } }
                                ]
                            }
                        ]
                    },
                    {
                        $and: [
                            postCondtionForSharePost,
                            { 'custom': { $in: [friendId] } },
                            {
                                $or: [
                                    { 'subject_id': { $in: subjectIds } },
                                    { 'college_id': { $in: collegesIds } },
                                    { 'degree_id': { $in: degreeIds } }
                                ]
                            }
                        ]
                    }
                ]

            };
        } else if (data.current_following && !data.current_friend) {
            condition = {
                $and: [
                    postCondtionForUserPost,
                    { 'privacy': { $in: [1, 4, 6] } },
                    {
                        $or: [
                            { 'subject_id': { $in: subjectIds } },
                            { 'college_id': { $in: collegesIds } },
                            { 'degree_id': { $in: degreeIds } }
                        ]
                    }
                ]
            };
        } else {
            condition = {
                $and: [
                    postCondtionForUserPost,
                    { 'privacy': 1 },
                    {
                        $or: [
                            { 'subject_id': { $in: subjectIds } },
                            { 'college_id': { $in: collegesIds } },
                            { 'degree_id': { $in: degreeIds } }
                        ]
                    }
                ]
            };
        }
        // var conditionForS = {
        //     $and: [
        //         { 'members.user_id': { $in: [friendId] } },
        //         {
        //             $or: [
        //                 { '_id': { $in: subjectIds } }
        //             ]
        //         }
        //     ]
        // };
        // var conditionForC = {
        //     $and: [
        //         { 'members.user_id': { $in: [friendId] } },
        //         {
        //             $or: [
        //                 { '_id': { $in: collegesIds } }
        //             ]
        //         }
        //     ]
        // };
        // var conditionForD = {
        //     $and: [
        //         { 'members.user_id': { $in: [friendId] } },
        //         {
        //             $or: [
        //                 { '_id': { $in: degreeIds } }
        //             ]
        //         }
        //     ]
        // };
        if (post_type == 10) {
            Event.find({})
                .populate({ path: 'created_by', select: 'fname lname photo _id' })
                .populate({
                    path: 'post_id',
                    model: 'Post',
                    match: condition,
                    select: 'name group_id college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom share_type',
                    populate: {
                        path: 'comments.comment_by group_id college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                        select: 'fname lname photo name title subject_id college_id degree_id',
                    }
                })
                // .populate({
                //     path: 'subject_id',
                //     model: 'Subject',
                //     match: conditionForS,
                //     select: 'name'
                // })
                // .populate({
                //     path: 'college_id',
                //     model: 'College',
                //     match: conditionForC,
                //     select: 'name'
                // })
                // .populate({
                //     path: 'degree_id',
                //     model: 'Degree',
                //     match: conditionForD,
                //     select: 'name'
                // })
                .sort(sort)
                // .limit(limit)
                // .skip(skip)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Event.find({})
                        .populate({ path: 'created_by', select: 'fname lname photo _id' })
                        .populate({
                            path: 'post_id',
                            model: 'Post',
                            match: condition,
                            select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy college_id subject_id degree_id original_post_id origin_creator shared_title custom share_type',
                            populate: {
                                path: 'comments.comment_by likes.user_id flag.user_id share.user_id created_by origin_creator',
                                select: 'fname lname photo',
                                model: 'User'
                            }
                        })
                        // .populate({
                        //     path: 'subject_id',
                        //     model: 'Subject',
                        //     match: conditionForS,
                        //     select: 'name'
                        // })
                        // .populate({
                        //     path: 'college_id',
                        //     model: 'College',
                        //     match: conditionForC,
                        //     select: 'name'
                        // })
                        // .populate({
                        //     path: 'degree_id',
                        //     model: 'Degree',
                        //     match: conditionForD,
                        //     select: 'name'
                        // })
                        .sort(sort)
                        .exec(function(err, total_timeline) {
                            if (err) {
                                throw err;
                            }
                            Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                        if (err)
                                            throw err;
                                        var data = result.filter(function(timeline) {

                                            return timeline.post_id;
                                        });
                                        var total_data = total_timeline.filter(function(timeline) {
                                            return timeline.post_id;
                                        });
                                        data = data.slice(skip, skip + limit);
                                        callback({ result: data, total_timeline: total_data.length });
                                    });
                                });
                            });
                        });
                });
        } else {
            Event.find({})
                .populate({ path: 'created_by', select: 'fname lname photo _id' })
                .populate({
                    path: 'post_id',
                    model: 'Post',
                    match: condition,
                    select: 'name group_id college_id subject_id degree_id share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy original_post_id origin_creator shared_title custom share_type',
                    populate: {
                        path: 'comments.comment_by group_id college_id subject_id degree_id likes.user_id flag.user_id share.user_id created_by origin_creator',
                        select: 'fname lname photo name title subject_id college_id degree_id',
                    }
                })
                .sort(sort)
                .exec(function(err, result) {
                    if (err) {
                        throw err;
                    }
                    Event.find({})
                        .populate({ path: 'created_by', select: 'fname lname photo _id' })
                        .populate({
                            path: 'post_id',
                            model: 'Post',
                            match: condition,
                            select: 'name share created_on created_by types catagory post_type likes flag comments message question photo video link document audio privacy college_id subject_id degree_id original_post_id origin_creator shared_title custom share_type',
                            populate: {
                                path: 'comments.comment_by likes.user_id flag.user_id share.user_id created_by origin_creator',
                                select: 'fname lname photo',
                                model: 'User'
                            }
                        })
                        .sort(sort)
                        .exec(function(err, total_timeline) {
                            if (err) {
                                throw err;
                            }
                            Subject.populate(result, { path: 'post_id.group_id.subject_id' }, function(err, result) {
                                if (err)
                                    throw err;
                                College.populate(result, { path: 'post_id.group_id.college_id' }, function(err, result) {
                                    if (err)
                                        throw err;
                                    Degree.populate(result, { path: 'post_id.group_id.degree_id' }, function(err, result) {
                                        if (err)
                                            throw err;
                                        var data = result.filter(function(timeline) {

                                            return timeline.post_id;
                                        });
                                        var total_data = total_timeline.filter(function(timeline) {
                                            return timeline.post_id;
                                        });
                                        data = data.slice(skip, skip + limit);
                                        callback({ result: data, total_timeline: total_data.length });
                                    });
                                });
                            });
                        });
                });
        }
    });
}

function getReportedPostIds(callback) {
    PostsFeedback.find({ 'report_count': { $gte: 10 } }).distinct('post_id')
        .exec(function(err, data) {
            callback(data);
        });
}