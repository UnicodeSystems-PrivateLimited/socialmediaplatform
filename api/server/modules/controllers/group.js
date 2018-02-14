var ctrl = require('express').Router();
module.exports = ctrl;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: '/tmp',
});
var upload = multer().single('avatar');
var locals;
var Group = require('../models/group');
var User = require('../models/user');
var Notifications = require('../models/notification');
var Post = require('../models/post');

ctrl.get('/', function (req, res) {
    Group.find({}, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});
ctrl.get('/getUserGroup/:groupId', function (req, res) {
    Group.find({ _id: req.params.groupId }, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});
ctrl.get('/deleteEve', function (req, res) {
    Group.remove(function (err, user) {
        if (err)
            throw err;
        data = { message: 'Group deleted' };
        res.json({ message: 'Group deleted' });
    });
});

ctrl.get('/leaveGroup/:id', function (req, res) {
    var leaveGroupId = req.params.id;
    if (req.session.passport) {
        var userid = req.session.passport.user;
        if (leaveGroupId != '') {
            Group.findByIdAndUpdate({ "_id": leaveGroupId }, { $pull: { members: { user_id: userid } } }, function (err, user) {
                if (err)
                    throw err;
                res.json({ message: 'Member Removed', data: user });
            });
        }
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.get('/deleteGroupMember/:groupId/:groupMemberId', function (req, res) {
    var groupId = req.params.groupId;
    var groupMemberId = req.params.groupMemberId;
    if (req.session.passport) {
        if (groupId != '' && groupMemberId != '') {
            Group.findByIdAndUpdate({ "_id": groupId }, { $pull: { members: { user_id: groupMemberId } } }, function (err, user) {
                if (err)
                    throw err;
                res.json({ message: 'Member Removed', data: user });
            });
        }
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.get('/list/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        Group.findById(req.params.id, function (err, skill) {
            if (err)
                throw err;
            return res.json(skill);
        });
    }
    //res.end();
});
ctrl.post('/addmembers/:groupId', function (req, res) {

    if (req.session.passport) {
        var userid = req.session.passport.user;
        var groupId = req.params.groupId;
        var members = [];
        members = req.body.members;
        var m = [];
        for (var i in members) {
            m.push({ user_id: members[i] });
        }

        if (members != '') {

            Group.update({ _id: groupId, created_by: userid },
                {
                    $push: {
                        members: {
                            $each: m,
                        }
                    }
                },
                function (err, usr) {
                    if (err)
                        throw err;
                    res.json({ status: 2, msg: "Member Added To Group", data: usr });
                });
        }
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});
ctrl.get('/listGroupById/:id', function (req, res) {
    var groupId = req.params.id;
    Group.findOne({ '_id': groupId })
        .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
        .exec(function (err, grp) {
            if (err)
                throw err;
            res.json({ status: 2, data: grp });
        });
});
ctrl.get('/getGroupsByUserId', function (req, res) {
    if (req.session.passport) {
        var userid = req.session.passport.user;
        Group.find({ 'created_by': userid })
            .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
            .exec(function (err, grp) {
                if (err)
                    throw err;
                res.json({ status: 2, data: grp });
            });
    }
});
ctrl.get('/getOtherGroupsByUserId', function (req, res) {
    if (req.session.passport) {
        var userid = req.session.passport.user;
        Group.find({ 'members.user_id': userid })
            .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
            .exec(function (err, grp) {
                if (err)
                    throw err;
                res.json({ status: 2, data: grp });
            });
    }
});
ctrl.post('/add', function (req, res) {
    var group = new Group();
    var members = [];
    members = req.body.members;
    if (req.session.passport) {
        var userid = req.session.passport.user;
        if (req.body.title) {
            group.title = req.body.title;
            group.description = req.body.description;
            group.created_on = new Date;
            group.created_by = userid;
            group.save(function (err, newGroup) {
                if (err)
                    throw err;
                var m = [];
                for (var i in members) {
                    m.push({ user_id: members[i] });
                }

                if (members != '') {

                    Group.findByIdAndUpdate(newGroup._id,
                        {
                            $push: {
                                members: {
                                    $each: m,
                                }
                            }
                        },
                        function (err, usr) {
                            if (err)
                                throw err;
                            if (req.file) {
                                upload(req, res, function (err) {
                                    if (err) {
                                        return
                                    }
                                    var ext = req.file.originalname.split('.').pop();
                                    filename = newGroup._id + '.' + ext;
                                    var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Group/");
                                    fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                                        if (err) {
                                            return console.log(err);
                                        }
                                        Group.findByIdAndUpdate(newGroup._id,
                                            {
                                                $push: {
                                                    icon: filename,
                                                }
                                            }, function (err, newSub) {
                                                if (err) {
                                                    throw err
                                                }

                                                res.json({ status: 2, msg: "Group Added", data: newSub });
                                            });
                                    });
                                });
                            } else {
                                res.json({ status: 2, msg: "Group Added", data: usr });
                            }
                        });
                }
            });
        }
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});

ctrl.post('/updateGroup/:id/:title/:description', function (req, res) {
    var Groups = require('../models/group');
    var userId = req.session.passport.user;
    var id = req.params.id;
    var title = req.params.title;
    var description = req.params.description;
    if (req.session.passport) {
        upload(req, res, function (err) {
            if (err) {
                return
            }
            var ext = req.file.originalname.split('.').pop();
            filename = id + '.' + ext;
            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Group");
            //                fs.mkdir(uploadpath, function (e) {
            //                    if (!e || (e && e.code === 'EEXIST')) {
            //do something with contents                   

            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                if (err) {
                    return console.log(err);
                }
                Groups.findByIdAndUpdate({ _id: id },
                    {
                        $set: {
                            title: title,
                            description: description,
                            icon: filename,
                        }
                    }, function (err, newSub) {
                        if (err) {
                            throw err
                        }
                        Groups.findOne({ _id: id }, function (err, group) {
                            if (err)
                                throw err;
                            res.json({ status: 2, msg: "group updated", data: group });
                        });
                    });
            });
        });

    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }

});
ctrl.post('/updateOnly/:id', function (req, res) {
    var Groups = require('../models/group');
    var userId = req.session.passport.user;
    var id = req.params.id;
    var title = req.body.title;
    var description = req.body.description;
    if (req.session.passport) {
        Groups.findByIdAndUpdate({ _id: id },
            {
                $set: {
                    title: title,
                    description: description,
                }
            }, function (err, newSub) {
                if (err) {
                    throw err
                }
                Groups.findOne({ _id: id }, function (err, group) {
                    if (err)
                        throw err;
                    res.json({ status: 2, msg: "group updated", data: group });
                });
            });
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }

});
// ctrl.post('/groupSearch', function (req, res) {
//     if (req.body.name) {
//         if (req.session.passport) {
//             var userid = req.session.passport.user;
//             getGroupSearchlist(req.body.name, userid, function (data) {
//                 res.json({ status: 2, msg: "Search complete!", data: data });
//             });
//         }
//     } else {
//         res.json({ status: 0, msg: "No search parameters provided!" });
//     }
// });
// function getGroupSearchlist(search_name, userid, callback) {
//     var Group = require('../models/group');
//     var d = [];
//     Group.find({
//         title: new RegExp('^' + search_name, "i"),
//         created_by: userid
//     }, { title: 1, icon: 1, _id: 1, created_on: 1 })
//         .limit(20)
//         .exec(function (err, group) {
//             callback(group);
//         });
// }


ctrl.post('/userSearch', function (req, res) {
    if (req.body.name) {
        if (req.session.passport) {
            var userid = req.session.passport.user;
            getUserSearchlist(req.body.name, userid, function (data) {
                res.json({ status: 2, msg: "Search complete!", data: data });
            });
        }
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});
function getUserSearchlist(search_name, userid, callback) {
    var User = require('../models/user');
    var d = [];
    User.findById(userid, { friends: 1, followers: 1, following: 1 }, function (err, user) {
        for (var i in user.friends) {
            var t = user.friends[i];
            d.push(t.friend_id);
        }
        for (var i in user.followers) {
            var t = user.followers[i];
            d.push(t.follower_id);
        }
        for (var i in user.following) {
            var t = user.following[i];
            d.push(t.following_id);
        }
        User.find({
            fname: new RegExp('^' + search_name, "i"),
            _id: { $in: d }
        }, { fname: 1, _id: 1, photo: 1, lname: 1 })
            .limit(20)
            .exec(function (err, user) {
                callback(user);
            });
    });
}

/*****************    Api for group creation and others, created by kuldeep *************************/

// get groupBy id
ctrl.get('/getGroupData/:id', function (req, res) {
    if (req.session.passport) {
        var currentDate = new Date().getTime();
        var logged = req.session.passport.user;
        var groupId = req.params.id;
        var isMember = false;
        Group.findOne({ '_id': groupId })
            .populate({ path: 'created_by members.user_id subject_id college_id degree_id post.created_by', select: 'fname lname photo name' })
            .populate({ path: 'post.post_id', model: 'Post', select: 'created_on' })
            .exec(function (err, group) {
                if (err)
                    throw err;
                if (group) {
                    for (var i in group.members) {
                        if (group.members[i].user_id && group.members[i].user_id._id == logged) {
                            isMember = true;
                        }
                    }
                    res.json({ status: 2, data: group, isMember: isMember });
                } else {
                    res.json({ status: 1, msg: 'Group Not Found.' });
                }
            });
    } else {
        res.json({ status: 0, msg: "User not logged in" });
    }
});

//add group
ctrl.post('/addGroup', function (req, res) {
    var Groups = require('../models/group');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        upload(req, res, function (err) {
            if (err)
                throw err;
            var group = new Groups(req.body);
            group.created_by = userId;
            group.created_on = new Date();
            group.save(function (err, newGroup) {
                if (err)
                    throw err;
                Groups.findByIdAndUpdate(newGroup._id,
                    {
                        "$push": {
                            'members': { 'user_id': userId, 'last_visit': new Date() },
                        }
                    }, function (err, updateGroup) {
                        if (err)
                            throw err
                    });
                if (req.file) {
                    var ext = req.file.originalname.split('.').pop();
                    var filename = newGroup._id + '.' + ext;
                    var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Group");
                    fs.mkdir(uploadpath, function (e) {
                        if (!e || (e && e.code === 'EEXIST')) {
                            //  do something with contents                   
                            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                                if (err) {
                                    return console.log(err);
                                }
                                Groups.findByIdAndUpdate(newGroup._id,
                                    {
                                        $set: {
                                            icon: filename,
                                        }
                                    }, function (err, updateGroup) {
                                        if (err) {
                                            throw err
                                        }
                                        res.json({ status: 2, msg: "Group Added Successfully.", data: updateGroup });
                                    });
                            });
                        }
                    });
                } else {
                    res.json({ status: 2, msg: 'Group Added Successfully.', data: newGroup });
                }
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

//edit group
ctrl.post('/editGroup/:id', function (req, res) {
    var Groups = require('../models/group');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var groupId = req.params.id;
        upload(req, res, function (err) {
            if (err)
                throw err;
            Groups.findByIdAndUpdate({ '_id': groupId, 'created_by': userId },
                {
                    $set: {
                        'title': req.body.title,
                        'description': req.body.description,
                        'privacy': req.body.privacy
                    }
                },
                function (err, updatedGroup) {
                    if (err)
                        throw err;
                    if (req.file) {
                        var ext = req.file.originalname.split('.').pop();
                        var filename = groupId + '.' + ext;
                        var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Group");
                        fs.mkdir(uploadpath, function (e) {
                            if (!e || (e && e.code === 'EEXIST')) {
                                //  do something with contents                   
                                fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    Groups.findByIdAndUpdate(groupId,
                                        {
                                            $set: {
                                                icon: filename,
                                            }
                                        }, function (err, updateGroup) {
                                            if (err) {
                                                throw err
                                            }
                                            res.json({ status: 2, msg: "Group Edited Successfully.", data: updateGroup });
                                        });
                                });
                            }
                        });
                    } else {
                        res.json({ status: 2, msg: 'Group Edited Successfully.', data: updatedGroup });
                    }
                });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

//get groups
ctrl.get('/getGroups/:counter', function (req, res) {
    if (req.session.passport) {
        var counter = req.params.counter;
        var limit = 10;
        var skip = limit * counter;
        // var sort = { created_on: -1 };
        var userId = req.session.passport.user;
        checkUserWalls(userId, function (userScdIds) {
            console.log("userScdIds", userScdIds);
            var condition = {
                $or: [
                    { 'created_by': userId },
                    {
                        $and: [
                            { 'created_by': { $nin: [userId] } },
                            { 'privacy': 1 },
                            {
                                $or: [
                                    {
                                        'subject_id': { $in: userScdIds.subjects }
                                    },
                                    {
                                        'college_id': { $in: userScdIds.colleges }
                                    },
                                    {
                                        'degree_id': { $in: userScdIds.degrees }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        $and: [
                            { 'created_by': { $nin: [userId] } },
                            { 'privacy': 2 },
                            { 'members.user_id': { $in: [userId] } },
                            {
                                $or: [
                                    {
                                        'subject_id': { $in: userScdIds.subjects }
                                    },
                                    {
                                        'college_id': { $in: userScdIds.colleges }
                                    },
                                    {
                                        'degree_id': { $in: userScdIds.degrees }
                                    }
                                ]
                            }
                        ]
                    },
                    { 'members.user_id': { $in: [userId] } }
                ]
            };
            Group.find(condition)
                .populate({ path: 'created_by subject_id college_id degree_id post.created_by', select: 'fname lname photo name' })
                .populate({ path: 'post.post_id', model: 'Post', select: 'created_on' })
                // .sort(sort)
                // .limit(limit)
                // .skip(skip)
                .exec(function (err, groups) {
                    if (err)
                        throw err;
                    Group.count(condition).exec(function (err, total) {
                        if (err)
                            throw err;
                        var sortedGroups = recentPostGroupsSort(groups, 3);
                        sortedGroups = sortedGroups.slice(skip, skip + limit);
                        res.json({ status: 2, data: sortedGroups, total: total });
                    });
                });
        });
    } else {
        res.json({ status: 0, msg: 'User Not LoggedIn.' });
    }
});

//delete group

ctrl.get('/delete/:id', function (req, res) {
    if (req.session.passport) {
        var groupId = req.params.id;
        var userId = req.session.passport.user;
        if (groupId) {
            Group.remove({ _id: groupId, created_by: userId }, function (err, group) {
                if (err)
                    throw err;
                Post.find({ 'group_id': groupId }).remove().exec(function (err, posts) {
                    if (err)
                        throw err;
                });
                Notifications.find({ 'groupId': groupId }).remove().exec(function (err, data) {
                    if (err)
                        throw err;
                });
                res.json({ status: 2, msg: 'Group deleted Successfully.' });
            });
        } else {
            res.json({ status: 1, msg: 'Ids not found.' });
        }
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

// join group 

ctrl.get('/join/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var groupId = req.params.id;
        getUserDetail(userId, function (userDetail) {
            Group.findOne({ '_id': groupId, 'members.user_id': { $nin: [userId] } }, function (err, group) {
                if (err)
                    throw err;
                if (group) {
                    Group.update({ '_id': groupId }, { "$push": { 'members': { 'user_id': userId, 'last_visit': new Date() } } }, function (err, updatedGroup) {
                        if (err)
                            throw err;
                        Group.findOne({ _id: groupId })
                            .populate({ path: 'created_by subject_id college_id degree_id post.created_by', select: 'fname lname photo name' })
                            .populate({ path: 'post.post_id', model: 'Post', select: 'created_on' })
                            .exec(function (err, data) {
                                var recepients = [data.created_by._id];
                                var notificationData = {
                                    title: ' has joined the group ',
                                    date: new Date(),
                                    userdata: userDetail,
                                    from: userId,
                                    post_type: 1,
                                    groupId: groupId,
                                    eventId: 0,
                                    notifId: '',
                                };
                                var clManager = req.app.get('wsClient');
                                clManager.sendGroupNotification(recepients, notificationData);
                                res.json({ status: 2, msg: 'You have succesfully joined the group.', data: data });
                            });
                    });
                } else {
                    res.json({ status: 1, mag: 'Group not found!' });
                }
            });
        });
    } else {
        res.json({ status: 0, mag: 'User not loggedIn!' });
    }
});

// leave group 
ctrl.get('/leave/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var groupId = req.params.id;
        Group.findOne({ '_id': groupId, 'members.user_id': { $in: [userId] } }, function (err, group) {
            if (err)
                throw err;
            if (group) {
                Group.update({ '_id': groupId }, { '$pull': { 'members': { 'user_id': userId } } }, function (err, update) {
                    if (err)
                        throw err;
                    Notifications.remove({ 'groupId': groupId, 'from': userId }, function (err, noti) { });
                    Group.findOne({ _id: groupId })
                        .populate({ path: 'created_by subject_id college_id degree_id post.created_by', select: 'fname lname photo name' })
                        .populate({ path: 'post.post_id', model: 'Post', select: 'created_on' })
                        .exec(function (err, data) {
                            if (err)
                                throw err;
                            res.json({ status: 2, msg: 'You have unjoined the group.', data: data });
                        });
                });
            } else {
                res.json({ status: 1, msg: 'User already leave the group' });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

//get groups member 

ctrl.get('/getGroupMembers/:id', function (req, res) {
    if (req.session.passport.user) {
        var groupId = req.params.id;
        Group.findOne({ '_id': groupId })
            .populate({ path: 'members.user_id subject_id college_id degree_id', select: 'fname lname photo name' })
            .exec(function (err, group) {
                if (err)
                    throw err;
                res.json({ status: 2, data: group });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});



//method to check current members belong to which subject
function checkUserWalls(user_id, callback) {
    var User = require('../models/user');
    User.findOne({ _id: user_id }, { subjects: 1, degree: 1, college: 1 },
        function (err, result) {
            if (err)
                throw err;
            var subjects = [];
            var colleges = [];
            var degrees = [];

            for (var i in result.subjects) {
                subjects.push(result.subjects[i].subject_id);
            }
            for (var i in result.college) {
                colleges.push(result.college[i].college_id);
            }
            for (var i in result.degree) {
                degrees.push(result.degree[i].degree_id);
            }
            callback({ subjects: subjects, colleges: colleges, degrees: degrees });
        });
}

//get user details
function getUserDetail(id, callback) {
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('fname lname photo')
        .exec(function (err, user) {
            if (err)
                throw err;
            callback(user);
        });
}

ctrl.post('/groupSearch/:counter', function (req, res) {
    /*
    sortOrder{
        1=>select sort order
        2=>Asc
        3=>desc
    }
    sortType{
        1=>Sort By
        2=>Latest Posts
        3=>Group Names
        4=>Latest Created Groups
    }
    groupTypes{
        1=>My Created and Joined Groups
        2=>My Created Groups
        3=>My Private Joined
        4=>My Public Joined
        5=>All Public Groups
        6=>My Left Groups
    }
    */

    if (req.session.passport) {
        var userId = req.session.passport.user;
        var title = req.body.title;
        var sortType = req.body.sortType;
        var sortOrder = req.body.sortOrder;
        var groupTypes = req.body.groupTypes;
        var memberId = req.body.memberId;
        var counter = req.params.counter;
        var limit = 10;
        var skip = limit * counter;
        var searchCondition;
        var finalCondition;
        checkUserWalls(userId, function (userScdIds) {
            if (groupTypes == 1) {
                searchCondition = {
                    $or: [
                        { 'created_by': userId },
                        {
                            $and: [
                                { 'created_by': { $nin: [userId] } },
                                { 'members.user_id': { $in: [userId] } },
                                {
                                    $or: [{ 'subject_id': { $in: userScdIds.subjects } }, { 'college_id': { $in: userScdIds.colleges } }, { 'degree_id': { $in: userScdIds.degrees } }]
                                }
                            ]
                        }
                    ]
                }
            } else if (groupTypes == 2) {
                searchCondition = { 'created_by': userId }
            } else if (groupTypes == 3) {
                searchCondition = {
                    $and: [
                        { 'created_by': { $nin: [userId] } },
                        { 'privacy': 2 },
                        { 'members.user_id': { $in: [userId] } },
                        {
                            $or: [{ 'subject_id': { $in: userScdIds.subjects } }, { 'college_id': { $in: userScdIds.colleges } }, { 'degree_id': { $in: userScdIds.degrees } }]
                        }
                    ]
                }
            } else if (groupTypes == 4) {
                searchCondition = {
                    $and: [
                        { 'created_by': { $nin: [userId] } },
                        { 'privacy': 1 },
                        { 'members.user_id': { $in: [userId] } },
                        {
                            $or: [{ 'subject_id': { $in: userScdIds.subjects } }, { 'college_id': { $in: userScdIds.colleges } }, { 'degree_id': { $in: userScdIds.degrees } }]
                        }
                    ]
                }
            } else if (groupTypes == 5) {
                searchCondition = {
                    $or: [
                        {
                            'created_by': userId, 'privacy': 1
                        },
                        {
                            $and: [
                                { 'created_by': { $nin: [userId] } },
                                { 'privacy': 1 },
                                {
                                    $or: [{ 'subject_id': { $in: userScdIds.subjects } }, { 'college_id': { $in: userScdIds.colleges } }, { 'degree_id': { $in: userScdIds.degrees } }]
                                }
                            ]
                        }]

                }
            } else if (groupTypes == 6) {
                searchCondition = {
                    $and: [
                        { 'created_by': { $nin: [userId] } },
                        { 'privacy': 1 },
                        { 'members.user_id': { $nin: [userId] } },
                        {
                            $or: [{ 'subject_id': { $in: userScdIds.subjects } }, { 'college_id': { $in: userScdIds.colleges } }, { 'degree_id': { $in: userScdIds.degrees } }]
                        }
                    ]
                }
            }
            if (title && memberId) {
                finalCondition = {
                    $and: [
                        { 'title': new RegExp('^' + title, "i") },
                        { 'members.user_id': { $in: [memberId] } },
                        searchCondition
                    ]
                }
            } else if (!title && memberId) {
                finalCondition = {
                    $and: [
                        { 'members.user_id': { $in: [memberId] } },
                        searchCondition
                    ]
                }
            } else if (title && !memberId) {
                finalCondition = {
                    $and: [
                        { 'title': new RegExp('^' + title, "i") },
                        searchCondition
                    ]
                }
            } else {
                finalCondition = searchCondition;
            }
            Group.find(finalCondition)
                .populate({ path: 'created_by subject_id college_id degree_id post.created_by', select: 'fname lname photo name' })
                .populate({ path: 'post.post_id', model: 'Post', select: 'created_on' })
                .exec(function (err, result) {
                    if (err)
                        throw err;
                    Group.count(finalCondition)
                        .exec(function (err, total) {
                            if (err)
                                throw err;
                            var sortedGroups;
                            if (sortType == 3) {
                                sortedGroups = sortGroupByName(result, sortOrder);
                            } else if (sortType == 4) {
                                sortedGroups = sortGroupByCreatedOn(result, sortOrder);
                            } else {
                                sortedGroups = recentPostGroupsSort(result, sortOrder);
                            }
                            sortedGroups = sortedGroups.slice(skip, skip + limit);
                            res.json({ status: 2, data: sortedGroups, total: total });
                        });
                });
        });
    }
    else {
        res.json({ status: 0, msg: "User is not logged in." });
    }
});

ctrl.get('/updateLastVisit/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var groupId = req.params.id;
        Group.update({ '_id': groupId, 'members.user_id': userId }, { $set: { 'members.$.last_visit': new Date() } }, function (err, data) {
            if (err)
                throw err;
            res.json({ status: 2, msg: 'Visit Successfully Updated.', data: data });
        })
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

function recentPostGroupsSort(groups, sortType) {
    /*
    sortType{
        2=>Asc
        3=>Desc
    }
    */
    console.log("groups", groups);
    for (var i in groups) {
        var posts = groups[i].post.filter(function (posts) {
            return posts.post_id
        });
        groups[i].post = posts;
        groups[i].post.sort(function (a, b) {
            var textA = new Date(a.post_id.created_on).getTime();
            var textB = new Date(b.post_id.created_on).getTime();
            return textB - textA;
        });
    }
    groups.sort(function (a, b) {
        var textA = new Date(a.post.length > 0 ? a.post[0].post_id.created_on : '1970/01/01').getTime();
        var textB = new Date(b.post.length > 0 ? b.post[0].post_id.created_on : '1970/01/01').getTime();
        if (sortType == 2) {
            return textA - textB;
        } else {
            return textB - textA;
        }

    });
    return groups;
}

function sortGroupByName(groups, sortType) {
    /*
 sortType{
     2=>Asc
     3=>Desc
 }
 */
    groups.sort(function (a, b) {
        var textA = a.title.toUpperCase();
        var textB = b.title.toUpperCase();
        if (sortType == 2) {
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        } else {
            return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
        }

    });
    return groups;
}
function sortGroupByCreatedOn(groups, sortType) {
    /*
 sortType{
     2=>Asc
     3=>Desc
 }
 */
    groups.sort(function (a, b) {
        var textA = new Date(a.created_on).getTime();
        var textB = new Date(b.created_on).getTime();
        if (sortType == 2) {
            return textA - textB;
        } else {
            return textB - textA;
        }

    });
    return groups;
}

/**
 * Get groups of SCD
 * type{
 * 1=>subject
 * 2=>college
 * 3=>degree
 * }
 * */
ctrl.get('/getGroups/scd/:type/:id/:counter', function (req, res) {
    if (req.session.passport) {
        var counter = req.params.counter;
        var limit = 10;
        var skip = limit * counter;
        var userId = req.session.passport.user;
        var type = req.params.type;
        var id = req.params.id;
        var scdCondition;
        if (type == 1) {
            scdCondition = {
                'subject_id': { $in: [id] }
            }
        } else if (type == 2) {
            scdCondition = {
                'college_id': { $in: [id] }
            }
        } else {
            scdCondition = {
                'degree_id': { $in: [id] }
            }
        }
        var condition = {
            $or: [
                {
                    $and: [
                        {
                            'created_by': userId,
                        },
                        scdCondition
                    ]
                },
                {
                    $and: [
                        { 'created_by': { $nin: [userId] } },
                        { 'privacy': 1 },
                        scdCondition
                    ]
                },
                {
                    $and: [
                        { 'created_by': { $nin: [userId] } },
                        { 'privacy': 2 },
                        { 'members.user_id': { $in: [userId] } },
                        scdCondition
                    ]
                }
            ]
        };
        Group.find(condition)
            .populate({ path: 'created_by subject_id college_id degree_id post.created_by', select: 'fname lname photo name' })
            .populate({ path: 'post.post_id', model: 'Post', select: 'created_on' })
            // .sort(sort)
            // .limit(limit)
            // .skip(skip)
            .exec(function (err, groups) {
                if (err)
                    throw err;
                Group.count(condition).exec(function (err, total) {
                    if (err)
                        throw err;
                    var sortedGroups = recentPostGroupsSort(groups, 3);
                    sortedGroups = sortedGroups.slice(skip, skip + limit);
                    res.json({ status: 2, data: sortedGroups, total: total });
                });
            });
    } else {
        res.json({ status: 0, msg: 'User Not LoggedIn.' });
    }
});

ctrl.post('/groupSearch/scd/:type/:id/:counter', function (req, res) {
    /*
    sortOrder{
        1=>select sort order
        2=>Asc
        3=>desc
    }
    sortType{
        1=>Sort By
        2=>Latest Posts
        3=>Group Names
        4=>Latest Created Groups
    }
    groupTypes{
        1=>My Created and Joined Groups
        2=>My Created Groups
        3=>My Private Joined
        4=>My Public Joined
        5=>All Public Groups
        6=>My Left Groups
    }
    */

    if (req.session.passport) {
        var userId = req.session.passport.user;
        var title = req.body.title;
        var sortType = req.body.sortType;
        var sortOrder = req.body.sortOrder;
        var groupTypes = req.body.groupTypes;
        var memberId = req.body.memberId;
        var counter = req.params.counter;
        var limit = 10;
        var skip = limit * counter;
        var scdType = req.params.type;
        var scdId = req.params.id;
        var searchCondition;
        var finalCondition;
        var scdCondition;
        if (scdType == 1) {
            scdCondition = {
                'subject_id': { $in: [scdId] }
            }
        } else if (scdType == 2) {
            scdCondition = {
                'college_id': { $in: [scdId] }
            }
        } else {
            scdCondition = {
                'degree_id': { $in: [scdId] }
            }
        }
        if (groupTypes == 1) {
            searchCondition = {
                $or: [
                    {
                        $and: [
                            {
                                'created_by': userId,
                            },
                            scdCondition
                        ]
                    },
                    {
                        $and: [
                            { 'created_by': { $nin: [userId] } },
                            { 'members.user_id': { $in: [userId] } },
                            scdCondition
                        ]
                    }
                ]
            }
        } else if (groupTypes == 2) {
            searchCondition = {
                $and: [
                    {
                        'created_by': userId,
                    },
                    scdCondition
                ]
            }
        } else if (groupTypes == 3) {
            searchCondition = {
                $and: [
                    { 'created_by': { $nin: [userId] } },
                    { 'privacy': 2 },
                    { 'members.user_id': { $in: [userId] } },
                    scdCondition
                ]
            }
        } else if (groupTypes == 4) {
            searchCondition = {
                $and: [
                    { 'created_by': { $nin: [userId] } },
                    { 'privacy': 1 },
                    { 'members.user_id': { $in: [userId] } },
                    scdCondition
                ]
            }
        } else if (groupTypes == 5) {
            searchCondition = {
                $or: [
                    {
                        $and: [
                            {
                                'created_by': userId, 'privacy': 1
                            },
                            scdCondition
                        ]

                    },
                    {
                        $and: [
                            { 'created_by': { $nin: [userId] } },
                            { 'privacy': 1 },
                            scdCondition
                        ]
                    }]

            }
        } else if (groupTypes == 6) {
            searchCondition = {
                $and: [
                    { 'created_by': { $nin: [userId] } },
                    { 'privacy': 1 },
                    { 'members.user_id': { $nin: [userId] } },
                    scdCondition
                ]
            }
        }
        if (title && memberId) {
            finalCondition = {
                $and: [
                    { 'title': new RegExp('^' + title, "i") },
                    { 'members.user_id': { $in: [memberId] } },
                    searchCondition
                ]
            }
        } else if (!title && memberId) {
            finalCondition = {
                $and: [
                    { 'members.user_id': { $in: [memberId] } },
                    searchCondition
                ]
            }
        } else if (title && !memberId) {
            finalCondition = {
                $and: [
                    { 'title': new RegExp('^' + title, "i") },
                    searchCondition
                ]
            }
        } else {
            finalCondition = searchCondition;
        }
        Group.find(finalCondition)
            .populate({ path: 'created_by subject_id college_id degree_id post.created_by', select: 'fname lname photo name' })
            .populate({ path: 'post.post_id', model: 'Post', select: 'created_on' })
            .exec(function (err, result) {
                if (err)
                    throw err;
                Group.count(finalCondition)
                    .exec(function (err, total) {
                        if (err)
                            throw err;
                        var sortedGroups;
                        if (sortType == 3) {
                            sortedGroups = sortGroupByName(result, sortOrder);
                        } else if (sortType == 4) {
                            sortedGroups = sortGroupByCreatedOn(result, sortOrder);
                        } else {
                            sortedGroups = recentPostGroupsSort(result, sortOrder);
                        }
                        sortedGroups = sortedGroups.slice(skip, skip + limit);
                        res.json({ status: 2, data: sortedGroups, total: total });
                    });
            });
    }
    else {
        res.json({ status: 0, msg: "User is not logged in." });
    }
});
ctrl.post('/inviteUserList', function (req, res) {
    if (req.session.passport) {
        var friends = req.body.friends;
        var followers = req.body.followers;
        var followings = req.body.followings;
        var allMembers = req.body.allMembers;
        var name = req.body.name;
        var userId = req.session.passport.user;
        getUserDetails(userId, function (userDetils) {
            if (allMembers) {
                User.find({ $and: [{ "fname": new RegExp('^' + name, "i") }, { '_id': { $nin: userDetils.blocked } }, { '_id': { $nin: userDetils.blocked_me } }, { '_id': { $nin: [userId] } }] })
                    .select('_id fname lname photo')
                    .exec(function (err, searchedData) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Search complete!', data: searchedData });
                    });
            } else if (friends && followers && followings) {
                User.find({
                    $and: [
                        { "fname": new RegExp('^' + name, "i") },
                        {
                            $or: [
                                { '_id': { $in: userDetils.current } },
                                { '_id': { $in: userDetils.followers } },
                                { '_id': { $in: userDetils.following } }
                            ]
                        }
                    ]
                })
                    .select('_id fname lname photo')
                    .exec(function (err, searchedData) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Search complete!', data: searchedData });
                    });
            } else if (friends && followers && !followings) {

                User.find({
                    $and: [
                        { "fname": new RegExp('^' + name, "i") },
                        {
                            $or: [
                                { '_id': { $in: userDetils.current } },
                                { '_id': { $in: userDetils.followers } }
                            ]
                        }
                    ]
                })
                    .select('_id fname lname photo')
                    .exec(function (err, searchedData) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Search complete!', data: searchedData });
                    });
            } else if (friends && !followers && followings) {
                User.find({
                    $and: [
                        { "fname": new RegExp('^' + name, "i") },
                        {
                            $or: [
                                { '_id': { $in: userDetils.current } },
                                { '_id': { $in: userDetils.following } }
                            ]
                        }
                    ]
                })
                    .select('_id fname lname photo')
                    .exec(function (err, searchedData) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Search complete!', data: searchedData });
                    });
            }
            else if (!friends && followers && followings) {
                User.find({
                    $and: [
                        { "fname": new RegExp('^' + name, "i") },
                        {
                            $or: [
                                { '_id': { $in: userDetils.followers } },
                                { '_id': { $in: userDetils.following } }
                            ]
                        }
                    ]
                })
                    .select('_id fname lname photo')
                    .exec(function (err, searchedData) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Search complete!', data: searchedData });
                    });
            } else if (!friends && !followers && followings) {
                User.find({
                    $and: [
                        { "fname": new RegExp('^' + name, "i") },
                        {
                            '_id': { $in: userDetils.following }
                        }
                    ]
                })
                    .select('_id fname lname photo')
                    .exec(function (err, searchedData) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Search complete!', data: searchedData });
                    });
            }
            else if (friends && !followers && !followings) {
                User.find({
                    $and: [
                        { "fname": new RegExp('^' + name, "i") },
                        {
                            '_id': { $in: userDetils.current }
                        }
                    ]
                })
                    .select('_id fname lname photo')
                    .exec(function (err, searchedData) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Search complete!', data: searchedData });
                    });
            }
            else if (!friends && followers && !followings) {
                User.find({
                    $and: [
                        { "fname": new RegExp('^' + name, "i") },
                        {
                            '_id': { $in: userDetils.followers }
                        }
                    ]
                })
                    .select('_id fname lname photo')
                    .exec(function (err, searchedData) {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Search complete!', data: searchedData });
                    });
            } else {
                res.json({ status: 2, msg: 'Search complete!', data: [] });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
function getUserDetails(userId, callback) {
    var current_friends = [];
    var pending_friends = [];
    var request_friends = [];
    var blocked_friends = [];
    var users_blocked_me = [];
    var followers = [];
    var following = [];
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
            for (var i in user.followers) {
                if (user.followers[i].follower_id) {
                    followers.push(user.followers[i].follower_id);
                }
            }
            for (var i in user.following) {
                if (user.following[i].following_id) {
                    following.push(user.following[i].following_id);
                }
            }
            callback({ current: current_friends, pending: pending_friends, request: request_friends, blocked: blocked_friends, blocked_me: users_blocked_me, followers: followers, following: following });
        });
}

ctrl.post('/sendUsersGroupInvite/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var groupId = req.params.id;
        var userIds = req.body.ids;
        if (userIds.length) {
            Group.findOne({ '_id': groupId }, function (err, group) {
                if (err)
                    throw err;
                if (group) {
                    getUserDetail(userId, function (userDetail) {
                        var recepients = userIds;
                        var notificationData = {
                            title: ' has invited you to join the group ',
                            date: new Date(),
                            userdata: userDetail,
                            from: userId,
                            post_type: 8,
                            groupId: groupId,
                            eventId: 0,
                            notifId: '',
                        };
                        var clManager = req.app.get('wsClient');
                        clManager.sendGroupNotification(recepients, notificationData);
                        res.json({ status: 2, msg: 'Invitations have sent successfully.' })
                    });
                } else {
                    res.json({ status: 1, msg: 'No group found!' });
                }
            });
        } else {
            res.json({ status: 1, msg: 'No user selected!' });
        }
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});
ctrl.get('/acceptInvite/:groupId/:from', function (req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var from = req.params.from;
        var to = req.session.passport.user;
        Group.findOne({ '_id': groupId, 'members.user_id': { $in: [to] } })
            .exec(function (err, group) {
                if (err)
                    throw err;
                Notifications.find({ 'groupId': groupId, 'from': from, 'userId': to, 'post_type': 8 }).remove().exec(function (err, data) { });
                if (!group) {
                    Group.update({ '_id': groupId }, { "$push": { 'members': { 'user_id': to, 'last_visit': new Date() } } }, function (err, updatedGroup) {
                        if (err)
                            throw err;
                        getUserDetails(to, function (userDetail) {
                            var recepients = [from];
                            var notificationData = {
                                title: ' has joined the group ',
                                date: new Date(),
                                userdata: userDetail,
                                from: to,
                                post_type: 1,
                                groupId: groupId,
                                eventId: 0,
                                notifId: '',
                            };
                            var clManager = req.app.get('wsClient');
                            clManager.sendGroupNotification(recepients, notificationData);
                            res.json({ status: 2, msg: 'You have succesfully joined the group.' });
                        });
                    });
                } else {
                    res.json({ status: 2, msg: 'You have already joined this group.' });
                }
            });
    } else {
        res.json({ status: 0, msg: 'user not loggedin!' });
    }
});
ctrl.get('/rejectInvite/:groupId/:from', function (req, res) {
    if (req.session.passport) {
        var groupId = req.params.groupId;
        var from = req.params.from;
        var to = req.session.passport.user;
        Notifications.find({ 'groupId': groupId, 'from': from, 'userId': to, 'post_type': 8 }).remove().exec(function (err, data) {
            if (err)
                throw err;
            res.json({ status: 2, msg: 'Invitation removed successfully' });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

ctrl.get('/pendingInvites/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var groupId = req.params.id;
        getGroupMemberIds(groupId, userId, function (memberIds) {
            Notifications.find({ 'groupId': groupId, 'from': userId, 'userId': { $nin: memberIds } })
                .distinct('userId')
                .exec(function (err, data) {
                    if (err)
                        throw err;
                    User.find({ '_id': { $in: data } })
                        .select('fname lname photo _id')
                        .exec(function (err, pendingUsers) {
                            if (err)
                                throw err;
                            res.json({ status: 2, data: pendingUsers });
                        });
                });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

function getGroupMemberIds(id, userId, callback) {
    var memberIds = [];
    Group.findOne({ '_id': id, 'created_by': userId })
        .exec(function (err, data) {
            if (err)
                throw err;
            for (var i in data.members) {
                if (data.members[i].user_id) {
                    memberIds.push(data.members[i].user_id);
                }
            }
            callback(memberIds);
        });
}