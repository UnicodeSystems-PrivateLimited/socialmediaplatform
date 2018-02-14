var ctrl = require('express').Router();
module.exports = ctrl;

var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: '/tmp',
});
var upload = multer().single('avatar');
var im = require('imagemagick');
var Post = require('../models/post');
var College = require('../models/college');
var PostsFeedback = require('../models/postsfeedback');

function addpostevent(user_id, post_id, type, post_type, title, callback) {
    var Event = require('../models/event');
    var newEvent = new Event();
    newEvent.created_by = user_id;
    newEvent.post_id = post_id;
    newEvent.type = type;
    newEvent.post_type = post_type;
    newEvent.timestamp = new Date();
    newEvent.title = title;
    //    newEvent.save(function (err, newEvent) {
    //        if (err) throw err;
    //        callback();
    //    });

    Event.update({ post_id: post_id }, newEvent, { upsert: true }, function(err) {
        callback();
    });

}

ctrl.get('/', function(req, res) {
    Post.find({}, function(err, post) {
        if (err)
            throw err;
        res.json(post);
    });
});

//get posts
ctrl.get('/post/:id', function(req, res) {
    if (req.params.id && req.params.id > -1) {
        var Post = require('../models/post');
        Post.findById(req.params.id, function(err, post) {
            if (err)
                throw err;
            return res.json(post);
        });
    }
});

ctrl.get('/deleteAllPost', function(req, res) {
    Post.remove(function(err, post) {
        if (err)
            throw err;
        data = { message: 'All posts deleted' };
        res.json(data);
    });
});

ctrl.get('/countPostsByCollegeId/:id/', function(req, res) {
    var id = req.params.id;
    getCollegePostId(id, function(data) {
        Post.count({ '_id': { $in: data } }, function(err, count) {
            res.json({ satus: 2, total_post: count });;
        });
    });
});
ctrl.get('/getAllPostsByCollegeId/:id/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var id = req.params.id;
    if (req.session.passport)
        var logged = req.session.passport.user;
    getCollegePostId(id, function(data) {
        checkUserWalls(logged, function(data1) {
            Post.find({
                    '_id': { $in: data },
                    $or: [{ privacy: 1 },
                        { created_by: logged },
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
                .select('name post_type share types catagory created_by created_on likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator college_id', select: 'name fname lname photo _id' })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(function(err, result) {
                    res.json({ data: result, isResult: logged });
                });
        });
    });
});

ctrl.get('/getAllPostsByCollegeIdForWall/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var id = req.params.id;
    if (req.session.passport)
        var logged = req.session.passport.user;
    loggedUserAllCollege(logged, function(data2) {
        getAllCollegePostId(data2.all_colleges, function(data) {
            checkUserWalls(logged, function(data1) {
                Post.find({ "share": { $elemMatch: { "user_id": { $in: data1.current_friend } } }, "share_privacy": 3 })
                    .select('name post_type share types catagory created_by created_on likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
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
});

ctrl.get('/getAllPostsByCollegeIdForWallOnlyFriends/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var friendsIds = [];
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        loggedUserAllCollege(logged, function(data2) {
            allColleges = data2.all_colleges;
            getAllCollegePostId(allColleges, function(data) {
                var match_filter = [];
                match_filter.push(1);
                checkUserWalls(logged, function(data1) {
                    friendsIds = data1.current_friend;
                    friendsIds.push(parseInt(logged));
                    Post.find({
                            '_id': { $in: data },
                            "created_by": { $in: friendsIds }
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
            });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

ctrl.get('/getAllPostsByCollegeIdForWallOnlyFollowings/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var followingIds = [];
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var logged = req.session.passport.user;
        var id = req.params.id;
        loggedUserAllCollege(logged, function(data2) {
            allColleges = data2.all_colleges;
            getAllCollegePostId(allColleges, function(data) {
                var match_filter = [];
                match_filter.push(1);
                checkUserWalls(logged, function(data1) {
                    followingIds = data1.current_following;
                    followingIds.push(parseInt(logged));
                    Post.find({
                            '_id': { $in: data },
                            "created_by": { $in: followingIds }
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
            });
        });
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});

ctrl.get('/getAllScrollPostsByCollegeId/:id/:counterList/:post_type', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var id = req.params.id;
    var post_type = req.params.post_type;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        getCollegePostId(id, function(data) {
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
                    .select('name post_type share types catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
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

ctrl.get('/getAllCollegePostsByTitle/:id/:search_name/:counterList', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var search_name = req.params.search_name;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var id = req.params.id;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        getCollegePostId(id, function(data) {
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
                                    { 'custom.custom_id': { $in: logged } },
                                    { 'share_custom.custom_id': { $in: logged } },
                                    { created_by: logged },
                                    {
                                        $and: [
                                            { created_by: { $in: data1.current_friend } },
                                            { privacy: 3 },
                                            { college_id: { $in: data1.current_college } }
                                        ]
                                    },
                                    {
                                        $and: [
                                            { created_by: { $in: data1.current_following } },
                                            { privacy: 4 },
                                            { college_id: { $in: data1.current_college } }
                                        ]
                                    },
                                    {
                                        $and: [{
                                                $or: [{ created_by: { $in: data1.current_friend } },
                                                    { created_by: { $in: data1.current_following } }
                                                ]
                                            },
                                            { privacy: 6 },
                                            { college_id: { $in: data1.current_college } }
                                        ]
                                    },
                                    {
                                        $and: [{
                                                $or: [{ created_by: { $in: data1.current_friend } },
                                                    { created_by: { $in: data1.current_following } }
                                                ]
                                            },
                                            { share_privacy: 6 },
                                            { college_id: { $in: data1.current_college } }
                                        ]
                                    },
                                    {
                                        $and: [
                                            { created_by: { $in: data1.current_friend } },
                                            { share_privacy: 3 },
                                            { college_id: { $in: data1.current_college } }
                                        ]
                                    },
                                    {
                                        $and: [
                                            { created_by: { $in: data1.current_following } },
                                            { share_privacy: 4 },
                                            { college_id: { $in: data1.current_college } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    })
                    .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
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

ctrl.get('/getAllPostsByPostType/:id/:counterList/:post_type', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var post_type = req.params.post_type
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    var id = req.params.id;
    if (req.session.passport) {
        var logged = req.session.passport.user;
        getCollegePostId(id, function(data) {
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
                    .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
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

function checkUserWalls(user_id, callback) {
    var User = require('../models/user');
    User.findOne({ _id: user_id }, { friends: 1, subjects: 1, degree: 1, college: 1, following: 1 },
        function(err, result) {
            var data = result.friends;
            var subjects = result.subjects;
            var following = result.following;
            var college = result.college;
            var degree = result.degree;
            var current_friend = [];
            var current_subjects = [];
            var current_following = [];
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
            for (var i in college) {
                current_college.push(college[i].college_id);
            }
            for (var i in following) {
                current_following.push(following[i].following_id);
            }
            callback({ current_friend: current_friend, current_college: current_college, current_following: current_following, block_user: block_user });
        });
}

function getCollegePostId(college_id, callback) {
    College.findOne({ '_id': college_id })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function(err, college) {
            if (err)
                throw err;

            var data = college.post;
            var post_IDs = [];
            for (var i in data) {
                post_IDs.push(data[i].post_id);
            }
            callback(post_IDs);
        });
}

function getAllCollegePostId(college_id, callback) {
    College.find({ '_id': { $in: college_id } })
        .select('name icon members post')
        .populate({ path: 'members.user_id', select: 'fname lname photo _id' })
        .exec(function(err, college) {
            var all_colleges = [];
            var all_colleges1 = [];
            var post_IDs = [];
            for (var i in college) {
                all_colleges.push(college[i].post);
            }
            for (var i in all_colleges) {
                all_colleges1 = all_colleges[i];
                for (var j in all_colleges1) {
                    post_IDs.push(all_colleges1[j].post_id);
                }
            }
            callback(post_IDs);
        });
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
            callback({ all_colleges: all_colleges });
        });
}

//post any type of data 
ctrl.post('/postAllTypeData/:collegeId', function(req, res) {
    var Post = require('../models/post');
    var College = require('../models/college');
    var collegeId = req.params.collegeId;
    var userId = req.session.passport.user;
    var title = '';
    var post_type = '';
    var newPost = new Post();
    if (req.session.passport) {
        if (req.body.link != '' || req.body.linkTitle != '' || req.body.message != '' || req.body.question != '') {
            newPost.created_on = req.body.created_on;
            newPost.types = req.body.types; //college
            newPost.catagory = req.body.catagory;
            newPost.privacy = req.body.privacy;
            newPost.custom = req.body.custom ? req.body.custom : [];
            newPost.created_by = userId;
            newPost.message = req.body.message;
            newPost.question = req.body.question;
            newPost.college_id = collegeId;
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
            newPost.save(function(err, newPost) {
                if (err) {
                    throw err;
                }
                College.findByIdAndUpdate(collegeId, {
                    $push: {
                        post: {
                            post_id: newPost._id,
                            created_by: userId,
                        }
                    }
                }, function(err, newCollege) {
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
                        .select('types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .exec(function(err, result) {
                            if (err) {
                                throw err
                            }
                            return res.json({ status: 2, data_post: result, data_subject: newCollege });
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

ctrl.post('/postPhotosTypeFiles/:collegeId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var College = require('../models/college');
    var collegeId = req.params.collegeId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 3;
        newFilePost.college_id = collegeId;
        post_type = 3;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //college
            newFilePost.catagory = req.body.catagory;
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            if (req.body.name) {
                newFilePost.name = req.body.name;
            }
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
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/College/Photos/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        //do something with contents
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
                            College.findByIdAndUpdate(collegeId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newCollege) {
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

ctrl.post('/postVideosTypeFiles/:collegeId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var College = require('../models/college');
    var collegeId = req.params.collegeId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 4;
        newFilePost.college_id = collegeId;
        post_type = 4;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //college
            newFilePost.catagory = req.body.catagory;
            newFilePost.privacy = req.body.privacy;
            newFilePost.custom = req.body.custom ? req.body.custom : [];
            if (req.body.name) {
                newFilePost.name = req.body.name;
            }
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
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/College/Videos/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        //do something with contents
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            College.findByIdAndUpdate(collegeId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newCollege) {
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

ctrl.post('/postAudiosTypeFiles/:collegeId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var College = require('../models/college');
    var collegeId = req.params.collegeId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 6;
        newFilePost.college_id = collegeId;
        post_type = 6;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //college
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
                // var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                // var ext = req.file.originalname.split('.').pop();
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/College/Audios/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            College.findByIdAndUpdate(collegeId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newCollege) {
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

ctrl.post('/postDocumentsTypeFiles/:collegeId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var College = require('../models/college');
    var collegeId = req.params.collegeId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.post_type = 7;
        newFilePost.college_id = collegeId;
        post_type = 7;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //college
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
                var f_name = req.file.originalname.substr(0, req.file.originalname.lastIndexOf('.'));
                var ext = req.file.originalname.split('.').pop();
                filename = f_name + '-' + newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/College/Documents/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        //do something with contents
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            College.findByIdAndUpdate(collegeId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newCollege) {
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
ctrl.post('/postVideoEmbedLink/:collegeId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var College = require('../models/college');
    var collegeId = req.params.collegeId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //college
        newFilePost.privacy = req.body.privacy;
        newFilePost.catagory = req.body.catagory;
        newFilePost.post_type = 4;
        newFilePost.created_on = req.body.created_on;
        newFilePost.college_id = collegeId;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        var link = req.body.link;
        if (req.body.name != '' && req.body.name != "null") {
            newFilePost.name = req.body.name;
        }
        post_type = 4;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            College.findByIdAndUpdate(collegeId, {
                $push: {
                    post: {
                        post_id: newFilePost._id,
                        created_by: userId,
                    }
                }
            }, function(err, newSubject) {
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
ctrl.post('/postAudioEmbedLink/:collegeId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var College = require('../models/college');
    var collegeId = req.params.collegeId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //college
        newFilePost.privacy = req.body.privacy;
        newFilePost.catagory = req.body.catagory;
        newFilePost.post_type = 6;
        newFilePost.created_on = req.body.created_on;
        newFilePost.college_id = collegeId;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        var link = req.body.link;
        if (req.body.name != '' && req.body.name != "null") {
            newFilePost.name = req.body.name;
        }
        post_type = 6;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            College.findByIdAndUpdate(collegeId, {
                $push: {
                    post: {
                        post_id: newFilePost._id,
                        created_by: userId,
                    }
                }
            }, function(err, newSubject) {
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
ctrl.post('/postPhotoEmbedLink/:collegeId', function(req, res) {
    var User = require('../models/user');
    var Post = require('../models/post');
    var College = require('../models/college');
    var collegeId = req.params.collegeId;
    var userId = req.session.passport.user;
    var post_type;
    var newFilePost = new Post();
    if (req.session.passport) {
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //college
        newFilePost.privacy = req.body.privacy;
        newFilePost.catagory = req.body.catagory;
        newFilePost.created_on = req.body.created_on;
        newFilePost.college_id = collegeId;
        newFilePost.custom = req.body.custom ? req.body.custom : [];
        var link = req.body.link;
        if (req.body.name != '' && req.body.name != "null") {
            newFilePost.name = req.body.name;
        }
        newFilePost.post_type = 3;
        post_type = 3;
        newFilePost.save(function(err, newFilePost) {
            if (err) {
                throw err;
            }
            College.findByIdAndUpdate(collegeId, {
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
ctrl.get('/delete/:id/:collegeId', function(req, res) {
    var Post = require('../models/post');
    var Journal = require('../models/journal');
    var PostsFeedback = require('../models/postsfeedback');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.params.id;
        var collegeId = req.params.collegeId;
        Post.find({ '_id': postId }, function(err, post) {
            if (err) {
                throw err;
            }
            if (post.length > 0) {
                if (post[0].created_by == userId) {
                    Post.remove({ '_id': postId }, function(err, post) {
                        if (err)
                            throw err;
                        College.update({ _id: collegeId }, { $pull: { post: { post_id: postId } } }, { multi: true }, function(err, post) {
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

/***********************************  Advanced College search **********************************/

ctrl.get('/getAllSearchPostsByCollegeId/:id/:counterList/:searchDateFrom/:searchDateTo/:category/:whoPostedValue', function(req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var searchDateFrom = req.params.searchDateFrom;
    var searchDateTo = req.params.searchDateTo;
    var category = req.params.category;
    var whoPostedValue = req.params.whoPostedValue;
    var skip = counterList * limit;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var id = req.params.id;
        var logged = req.session.passport.user;
        checkUserWalls(logged, function(data1) {
            var categoryCondition;
            if (category == 0) {
                categoryCondition = { $in: [1, 2, 3, 4] };
            } else {
                categoryCondition = { $in: [category] };
            }
            if (whoPostedValue == 1) {
                Post.find({
                        'college_id': id,
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
                            'college_id': id,
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

ctrl.get('/countSearchPostsByCollegeId/:id/:searchDateFrom/:searchDateTo/:category/:whoPostedValue', function(req, res) {
    var searchDateFrom = req.params.searchDateFrom;
    var searchDateTo = req.params.searchDateTo;
    var category = req.params.category;
    var whoPostedValue = req.params.whoPostedValue;
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var id = req.params.id;
        var logged = req.session.passport.user;
        checkUserWalls(logged, function(data1) {
            var categoryCondition;
            if (category == 0) {
                categoryCondition = { $in: [1, 2, 3, 4] };
            } else {
                categoryCondition = { $in: [category] };
            }
            if (whoPostedValue == 1) {
                Post.count({
                        'college_id': id,
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
                    .exec(function(err, result) {
                        res.json({ data: result, isResult: logged });
                    });
            } else if (whoPostedValue == 2) {
                getFriendsEmailIds(logged, function(data) {

                    Post.find({
                            'catagory': id,
                            catagory: catcategoryConditionegory,
                            created_on: { '$gte': searchDateFrom, '$lt': searchDateTo },
                            created_by: { $in: data.ids },
                            $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [logged] }]
                        })
                        .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .sort(sort)
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

ctrl.get('/getAllScrollSearchPostsByCollegeId/:id/:counterList/:searchDateFrom/:searchDateTo/:category/:whoPostedValue', function(req, res) {
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
                        'college_id': id,
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
                            'college_id': id,
                            catagory: categoryCondition,
                            created_on: { '$gte': searchDateFrom, '$lt': searchDateTo },
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
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

///*******************  get api for post of college wall on the basis of post type ***************/
ctrl.get('/getCollegeWallPostById/:collegeId/:postType/:counter', function(req, res) {
    if (req.session.passport) {
        var collegeId = req.params.collegeId;
        var postType = req.params.postType;
        var counter = req.params.counter;
        var userId = req.session.passport.user;
        var limit = 10;
        var skip = limit * counter;
        var sort = { 'created_on': -1 };
        var postTypeCondition;
        getCollegePostId(collegeId, function(postIds) {
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
                        .select('name post_type share types catagory created_by created_on likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator college_id', select: 'name fname lname photo _id' })
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .exec(function(err, result) {
                            if (err)
                                throw err;
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
                                })
                                .exec(function(err, totalPost) {
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

///*******************  get api for post of college wall on the basis of ADVANCE SEARCH and post type  ***************/

ctrl.get('/getCollegeSearchedPostsById/:collegeId/:counter/:postType/:searchDateFrom/:searchDateTo/:category/:whoPostedValue/:status', function(req, res) {
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
        var status = req.params.status;
        var userId = req.session.passport.user;
        var collegeId = req.params.collegeId;
        getCollegeStatus(collegeId, status, function(postIds) {
            checkUserWalls(userId, function(userData) {
                getReportedPostIds(function(reportedPostIds) {
                    var categoryCondition;
                    var postTypeCondition;
                    var dateCondition;
                    if (category == 0) {
                        categoryCondition = { $in: [1, 2, 3, 4] };
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
                            .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id original_post_id origin_creator shared_title custom')
                            .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                            .sort(sort)
                            .skip(skip)
                            .limit(limit)
                            .exec(function(err, result) {
                                if (err)
                                    throw err;
                                Post.count({
                                        '_id': { $in: postIds, $nin: reportedPostIds },
                                        'catagory': categoryCondition,
                                        'post_type': postTypeCondition,
                                        'created_on': dateCondition,
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
                                    .exec(function(err, totalPost) {
                                        if (err)
                                            throw err;
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
                                if (err)
                                    throw err;
                                Post.count({
                                    '_id': { $in: postIds },
                                    'catagory': categoryCondition,
                                    'post_type': postTypeCondition,
                                    'created_on': dateCondition,
                                    'created_by': { $in: userData.current_friend },
                                    $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [userId] }]
                                }).exec(function(err, totalPost) {
                                    if (err)
                                        throw err;
                                    res.json({ status: 2, data: result, isResult: userId, total_post: totalPost });
                                });
                            });
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

function getCollegeStatus(college_id, status, callback) {
    /*
     *  Status{
     *    1 => All Students
     *    2 => Current Students 
     *    3 => Past Students
     *    4 => Future Students
     * }
     * 
     */
    var currentDate = new Date().getTime();
    var currentMember = [];
    var pastMember = [];
    var futureMember = [];
    var finalMembers = [];
    College.findOne({ '_id': college_id })
        .select('members')
        .exec(function(err, collegeMembers) {
            if (err)
                throw err;
            for (var i in collegeMembers.members) {
                if (collegeMembers.members[i].from && collegeMembers.members[i].to) {
                    var start = new Date(collegeMembers.members[i].from).getTime();
                    var end = new Date(collegeMembers.members[i].to).getTime();
                    if (start <= currentDate && currentDate <= end) {
                        currentMember.push(collegeMembers.members[i].user_id);
                    } else if (end < currentDate) {
                        pastMember.push(collegeMembers.members[i].user_id);
                    } else if (start > currentDate) {
                        futureMember.push(collegeMembers.members[i].user_id);
                    }
                }
            }
            if (status == 1) {
                finalMembers = currentMember.concat(pastMember, futureMember)
            } else if (status == 2) {
                finalMembers = currentMember;
            } else if (status == 3) {
                finalMembers = pastMember;
            } else if (status == 4) {
                finalMembers = futureMember;
            }
            Post.find({ 'created_by': { $in: finalMembers }, 'college_id': college_id })
                .distinct('_id')
                .exec(function(err, data) {
                    if (err)
                        throw err;
                    callback(data);
                });
        });
}

function getReportedPostIds(callback) {
    PostsFeedback.find({ 'report_count': { $gte: 10 } }).distinct('post_id')
        .exec(function(err, data) {
            callback(data);
        });
}