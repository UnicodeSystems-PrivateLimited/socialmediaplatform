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
var Subject = require('../models/subject');
var Degree = require('../models/degree');
var Group = require('../models/group');
var User = require('../models/user');
var PostsFeedback = require('../models/postsfeedback');

//get posts
ctrl.get('/post/:id', function(req, res) {
    if (req.session.passport) {
        if (req.params.id && req.params.id > -1) {
            Post.find({ '_id': req.params.id })
                .select('name types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                .populate({ path: 'share.user_id likes.user_id comments.comment_by created_by origin_creator', select: 'fname lname photo _id' })
                .populate({ path: 'subject_id college_id degree_id group_id', select: 'name title' })
                .exec(function(err, post) {
                    if (err)
                        throw err;
                    return res.json({ status: 2, data: post });
                });
        } else {
            res.json({ status: 1, msg: 'Id not found' });
        }
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

function getGroupPostIds(group_id, callback) {
    var postIds = [];
    Group.findOne({ '_id': group_id })
        .select('post')
        .exec(function(err, group) {
            if (err)
                throw err;
            for (var i in group.post) {
                postIds.push(group.post[i].post_id);
            }
            callback(postIds);
        });
}

function checkUserWalls(user_id, callback) {
    var current_friend = [];
    var current_following = [];
    User.findOne({ _id: user_id }, { friends: 1, following: 1 },
        function(err, result) {
            if (err)
                throw err;
            for (var i in result.friends) {
                if (result.friends[i].status == 3) {
                    current_friend.push(result.friends[i].friend_id);
                }
            }
            for (var i in result.following) {
                current_following.push(result.following[i].following_id);
            }
            callback({ current_friend: current_friend, current_following: current_following });
        });
}

function friendFollowingIdsInGroup(groupId, userId, callback) {
    var current_friend = [];
    var current_following = [];
    var block_user = [];
    User.findOne({ _id: userId }, { friends: 1, following: 1 },
        function(err, result) {
            if (err)
                throw err;
            Group.findOne({ '_id': groupId }, function(err, groupMembers) {
                if (err)
                    throw err;
                for (var i in result.friends) {
                    if (result.friends[i].status == 3) {
                        for (var j in groupMembers.members) {
                            if (groupMembers.members[j].user_id == result.friends[i].friend_id) {
                                current_friend.push(result.friends[i].friend_id);
                                break;
                            }
                        }
                    }
                    if (result.friends[i].status == 4 || result.friends[i].status == 5) {
                        block_user.push(result.friends[i].friend_id);
                    }
                }
                for (var i in result.following) {
                    for (var j in groupMembers.members) {
                        if (groupMembers.members[j].user_id == result.following[i].following_id) {
                            current_following.push(result.following[i].following_id);
                            break;
                        }
                    }
                }
                callback({ current_friend: current_friend, current_following: current_following, block_user: block_user });
            });
        });
}

function checkUserIsGroupMember(group_id, user_id, callback) {
    var isMember = false;
    Group.findOne({ _id: group_id }, { members: 1 },
        function(err, result) {
            if (err)
                throw err;
            for (var i in result.members) {
                if (result.members[i].user_id == user_id) {
                    isMember = true;
                    break;
                }
            }
            callback(isMember);
        });
}

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


///*******************  get api for post of Group wall on the basis of post type ***************/
ctrl.get('/getGroupWallPostById/:groupId/:postType/:counter', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var postType = req.params.postType;
        var counter = req.params.counter;
        var userId = req.session.passport.user;
        var limit = 10;
        var skip = limit * counter;
        var sort = { 'created_on': -1 };
        var postTypeCondition;
        getGroupPostIds(groupId, function(postIds) {
            checkUserIsGroupMember(groupId, userId, function(isMember) {
                friendFollowingIdsInGroup(groupId, userId, function(userData) {
                    getReportedPostIds(function(reportedPostIds) {
                        if (isMember) {
                            if (postType == 10) {
                                postTypeCondition = { $in: [1, 2, 3, 4, 5, 6, 7, 8] }; //post type
                            } else {
                                postTypeCondition = { $in: [postType] };
                            }
                            Post.find({
                                    '_id': { $in: postIds, $nin: reportedPostIds },
                                    'post_type': postTypeCondition,
                                    'created_by': { $nin: userData.block_user },
                                    $or: [
                                        { 'privacy': 1 },
                                        { 'created_by': userId, 'share_type': 1 },
                                        {
                                            $and: [
                                                { created_by: { $in: userData.current_friend } },
                                                { privacy: { $in: [3, 6] } },
                                            ]
                                        },
                                        {
                                            $and: [
                                                { created_by: { $in: userData.current_following } },
                                                { privacy: { $in: [4, 6] } }
                                            ]
                                        },
                                        { 'created_by': { $nin: [userId] }, 'privacy': 5, 'custom': { $in: [userId] } }
                                    ]
                                })
                                .select('name post_type share types catagory created_by created_on likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator college_id', select: 'name fname lname photo _id' })
                                .sort(sort)
                                .limit(limit)
                                .skip(skip)
                                .exec(function(err, result) {
                                    if (err)
                                        throw err;
                                    Post.count({
                                            '_id': { $in: postIds, $nin: reportedPostIds },
                                            'post_type': postTypeCondition,
                                            'created_by': { $nin: userData.block_user },
                                            $or: [
                                                { 'privacy': 1 },
                                                { 'created_by': userId, 'share_type': 1 },
                                                {
                                                    $and: [
                                                        { created_by: { $in: userData.current_friend } },
                                                        { privacy: { $in: [3, 6] } },
                                                    ]
                                                },
                                                {
                                                    $and: [
                                                        { created_by: { $in: userData.current_following } },
                                                        { privacy: { $in: [4, 6] } }
                                                    ]
                                                },
                                                { 'created_by': { $nin: [userId] }, 'privacy': 5, 'custom': { $in: [userId] } },
                                            ]
                                        })
                                        .exec(function(err, totalPost) {
                                            if (err)
                                                throw err;
                                            res.json({ status: 2, data: result, isResult: userId, total_post: totalPost });
                                        });
                                });
                        } else {
                            res.json({ status: 2, data: [], isResult: userId, total_post: 0 });
                        }
                    });
                });
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

///*******************  get api for post of college wall on the basis of ADVANCE SEARCH and post type  ***************/

ctrl.get('/getGroupSearchedPostsById/:groupId/:counter/:postType/:searchDateFrom/:searchDateTo/:category/:whoPostedValue', function(req, res) {
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
        var groupId = req.params.groupId;
        checkUserIsGroupMember(groupId, userId, function(isMember) {
            friendFollowingIdsInGroup(groupId, userId, function(userData) {
                getReportedPostIds(function(reportedPostIds) {
                    if (isMember) {
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
                                    'group_id': groupId,
                                    'catagory': categoryCondition,
                                    'post_type': postTypeCondition,
                                    'created_on': dateCondition,
                                    'created_by': { $nin: userData.block_user },
                                    '_id': { $nin: reportedPostIds },
                                    $or: [
                                        { 'privacy': 1 },
                                        { 'created_by': userId, 'share_type': 1 },
                                        {
                                            $and: [
                                                { created_by: { $in: userData.current_friend } },
                                                { privacy: { $in: [3, 6] } },
                                            ]
                                        },
                                        {
                                            $and: [
                                                { created_by: { $in: userData.current_following } },
                                                { privacy: { $in: [4, 6] } }
                                            ]
                                        },
                                        { 'created_by': { $nin: [userId] }, 'privacy': 5, 'custom': { $in: [userId] } },
                                    ]
                                })
                                .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                .sort(sort)
                                .limit(limit)
                                .skip(skip)
                                .exec(function(err, result) {
                                    if (err)
                                        throw err;
                                    Post.count({
                                            'group_id': groupId,
                                            'catagory': categoryCondition,
                                            'post_type': postTypeCondition,
                                            'created_on': dateCondition,
                                            'created_by': { $nin: userData.block_user },
                                            '_id': { $nin: reportedPostIds },
                                            $or: [
                                                { 'privacy': 1 },
                                                { 'created_by': userId, 'share_type': 1 },
                                                {
                                                    $and: [
                                                        { created_by: { $in: userData.current_friend } },
                                                        { privacy: { $in: [3, 6] } },
                                                    ]
                                                },
                                                {
                                                    $and: [
                                                        { created_by: { $in: userData.current_following } },
                                                        { privacy: { $in: [4, 6] } }
                                                    ]
                                                },
                                                { 'created_by': { $nin: [userId] }, 'privacy': 5, 'custom': { $in: [userId] } },
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
                                    'group_id': groupId,
                                    'catagory': categoryCondition,
                                    'post_type': postTypeCondition,
                                    'created_on': dateCondition,
                                    'created_by': { $in: userData.current_friend },
                                    '_id': { $nin: reportedPostIds },
                                    $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [userId] }]
                                })
                                .select('name share types catagory created_by created_on post_type likes flag comments message question photo video link document audio privacy subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                                .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                                .sort(sort)
                                .limit(limit)
                                .skip(skip)
                                .exec(function(err, result) {
                                    if (err)
                                        throw err;
                                    Post.count({
                                        'group_id': groupId,
                                        'catagory': categoryCondition,
                                        'post_type': postTypeCondition,
                                        'created_on': dateCondition,
                                        'created_by': { $in: userData.current_friend },
                                        '_id': { $nin: reportedPostIds },
                                        $or: [{ 'privacy': { $in: [1, 3, 6] } }, { 'privacy': 5, 'custom': [userId] }]
                                    }).exec(function(err, totalPost) {
                                        if (err)
                                            throw err;
                                        res.json({ status: 2, data: result, isResult: userId, total_post: totalPost });
                                    });
                                });
                        }
                    } else {
                        res.json({ status: 2, data: [], isResult: userId, total_post: 0 });
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

//post any type of data 
ctrl.post('/postAllTypeData/:groupId', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var userId = req.session.passport.user;
        var title = '';
        var post_type = '';
        var newPost = new Post();
        if (req.body.link != '' || req.body.linkTitle != '' || req.body.message != '' || req.body.question != '') {
            newPost.created_on = req.body.created_on;
            newPost.types = req.body.types; //group
            newPost.catagory = req.body.catagory;
            newPost.privacy = req.body.privacy;
            newPost.custom = req.body.custom ? req.body.custom : [];
            newPost.created_by = userId;
            newPost.message = req.body.message;
            newPost.question = req.body.question;
            newPost.group_id = groupId;
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
                Group.findByIdAndUpdate(groupId, {
                    $push: {
                        post: {
                            post_id: newPost._id,
                            created_by: userId,
                        }
                    }
                }, function(err, newGroup) {
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
                        .select('types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
                        .populate({ path: 'created_by likes.user_id flag.user_id comments.comment_by share.user_id origin_creator', select: 'fname lname photo _id' })
                        .exec(function(err, result) {
                            if (err) {
                                throw err
                            }
                            return res.json({ status: 2, data_post: result, data_group: newGroup });
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

//post photo type post

ctrl.post('/postPhotosTypeFiles/:groupId', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var userId = req.session.passport.user;
        var post_type;
        var newFilePost = new Post();
        newFilePost.created_by = userId;
        newFilePost.post_type = 3;
        newFilePost.group_id = groupId;
        post_type = 3;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //group
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
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/GroupWall/Photos/" + userId);
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
                                //                                height: 256,
                                //                                cropwidth: 128, cropheight: 128,
                                //                                x: 0, y: 0
                            }).then(
                                function(image) {
                                    console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
                                },
                                function(err) {
                                    console.log(err);
                                }
                            );
                            Group.findByIdAndUpdate(groupId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newGroup) {
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
                                            .select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
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
                        //debug
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

ctrl.post('/postPhotoEmbedLink/:groupId', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var userId = req.session.passport.user;
        var post_type;
        var newFilePost = new Post();
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //group
        newFilePost.privacy = req.body.privacy;
        newFilePost.catagory = req.body.catagory;
        newFilePost.created_on = req.body.created_on;
        newFilePost.group_id = groupId;
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
            Group.findByIdAndUpdate(groupId, {
                $push: {
                    post: {
                        post_id: newFilePost._id,
                        created_by: userId,
                    }
                }
            }, function(err, newGroup) {
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
                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
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

ctrl.post('/postVideosTypeFiles/:groupId', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var userId = req.session.passport.user;
        var post_type;
        var newFilePost = new Post();
        newFilePost.created_by = userId;
        newFilePost.post_type = 4;
        newFilePost.group_id = groupId;
        post_type = 4;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //group
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
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/GroupWall/Videos/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        //do something with contents
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Group.findByIdAndUpdate(groupId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newGroup) {
                                if (err) {
                                    throw err
                                }
                                Post.findByIdAndUpdate(newFilePost._id, {
                                        video: {
                                            file_name: filename,
                                            //                                    title: filename
                                        }
                                    },
                                    function(err, userId1) {
                                        if (err)
                                            throw err;

                                        title = "posted a Video";
                                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});
                                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
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
                        //debug
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged In" });
    }
});

ctrl.post('/postVideoEmbedLink/:groupId', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var userId = req.session.passport.user;
        var post_type;
        var newFilePost = new Post();
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //group
        newFilePost.privacy = req.body.privacy;
        newFilePost.catagory = req.body.catagory;
        newFilePost.post_type = 4;
        newFilePost.created_on = req.body.created_on;
        newFilePost.group_id = groupId;
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
            Group.findByIdAndUpdate(groupId, {
                $push: {
                    post: {
                        post_id: newFilePost._id,
                        created_by: userId,
                    }
                }
            }, function(err, newGroup) {
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
                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
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

ctrl.post('/postAudiosTypeFiles/:groupId', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var userId = req.session.passport.user;
        var post_type;
        var newFilePost = new Post();
        newFilePost.created_by = userId;
        newFilePost.post_type = 6;
        newFilePost.group_id = groupId;
        post_type = 6;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //group
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
                // filename = newFilePost._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/GroupWall/Audios/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Group.findByIdAndUpdate(groupId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newGroup) {
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
                                            .select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
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
                        //do something with contents
                    } else {
                        //debug
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User not logged In" });
    }
});

ctrl.post('/postAudioEmbedLink/:groupId', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var userId = req.session.passport.user;
        var post_type;
        var newFilePost = new Post();
        newFilePost.created_by = userId;
        newFilePost.types = req.body.types; //group
        newFilePost.privacy = req.body.privacy;
        newFilePost.catagory = req.body.catagory;
        newFilePost.post_type = 6;
        newFilePost.created_on = req.body.created_on;
        newFilePost.group_id = groupId;
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
            Group.findByIdAndUpdate(groupId, {
                $push: {
                    post: {
                        post_id: newFilePost._id,
                        created_by: userId,
                    }
                }
            }, function(err, newGroup) {
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
                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
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

ctrl.post('/postDocumentsTypeFiles/:groupId', function(req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var userId = req.session.passport.user;
        var post_type;
        var newFilePost = new Post();
        newFilePost.created_by = userId;
        newFilePost.post_type = 7;
        newFilePost.group_id = groupId;
        post_type = 7;
        upload(req, res, function(err) {
            if (err) {
                return
            }
            newFilePost.created_on = req.body.created_on;
            newFilePost.types = req.body.types; //group
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
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/GroupWall/Documents/" + userId);
                fs.mkdir(uploadpath, function(e) {
                    if (!e || (e && e.code === 'EEXIST')) {
                        //do something with contents
                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function(err) {
                            if (err) {
                                return console.log(err);
                            }
                            Group.findByIdAndUpdate(groupId, {
                                $push: {
                                    post: {
                                        post_id: newFilePost._id,
                                        created_by: userId,
                                    }
                                }
                            }, function(err, newGroup) {
                                if (err) {
                                    throw err
                                }
                                Post.findByIdAndUpdate(newFilePost._id, {
                                        document: {
                                            file_name: filename,
                                            //                                    title: filename
                                        }
                                    },
                                    function(err, userId1) {
                                        if (err)
                                            throw err;

                                        title = "posted a Document";
                                        addpostevent(userId, newFilePost._id, req.body.types, post_type, title, function(req, res) {});

                                        Post.findOne({ '_id': newFilePost._id }).select('name types post_type catagory created_by created_on likes flag comments message question photo video link document audio privacy share subject_id college_id degree_id group_id original_post_id origin_creator shared_title custom')
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
                        //debug
                        console.log(e);
                    }
                });
            });
        });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});
ctrl.get('/deleteOne/:id', function(req, res) {
    Post.remove({ '_id': req.params.id }).exec(function(err, data) {
        res.json({ data: 'successfully deleted.' });
    })
})

ctrl.get('/delete/:id/:groupId', function(req, res) {
    var Journal = require('../models/journal');
    var PostsFeedback = require('../models/postsfeedback');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.params.id;
        var groupId = req.params.groupId;
        Post.find({ '_id': postId }, function(err, post) {
            if (err) {
                throw err;
            }
            if (post.length > 0) {
                if (post[0].created_by == userId) {
                    Post.remove({ '_id': postId }, function(err, post) {
                        if (err)
                            throw err;
                        PostsFeedback.find({ 'post_id': postId })
                            .remove()
                            .exec((err, data) => {});
                        Group.update({ _id: groupId }, { $pull: { post: { post_id: postId } } }, { multi: true }, function(err, post) {
                            if (err)
                                throw err;
                            Journal.update({ user_id: userId }, { $pull: { posts: { post_id: postId } } }, { multi: true }, function(err, journals) {
                                res.json({ status: 2, msg: 'Post deleted successFully.' });
                            });
                        });
                    });
                } else {
                    res.json({ status: 1, msg: 'Post Is Not Created By You' });
                }
            } else {
                res.json({ status: 1, msg: 'Post not found.' });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

function getReportedPostIds(callback) {
    PostsFeedback.find({ 'report_count': { $gte: 10 } }).distinct('post_id')
        .exec(function(err, data) {
            callback(data);
        });
}