var ctrl = require('express').Router();
module.exports = ctrl;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: '/tmp',
});
var upload = multer().single('avatar');
var User = require('../models/user');


var Notification = require('../models/notification');
//var User = require('../models/user');
//var Blog = require('../models/blog');

ctrl.get('/', function (req, res) {
    // var userId = req.session.passport.user;
    Notification.find({}, function (err, events) {
        if (err)
            throw err;
        res.json({ data: events });
    });
});



ctrl.get('/getNotifications', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Notification.find({ 'userId': userId, is_viewed: 0 })
            .select('_id title userId from date is_viewed post_type groupId eventId blogId subject_id college_id degree_id post_id')
            .populate({ path: 'userId from groupId subject_id college_id degree_id', select: 'fname lname photo title name' })
            .populate({
                path: 'post_id',
                model: 'Post',
                select: '_id types name post_type message'
            })
            .sort({ date: -1 })
            .exec(function (err, events) {
                if (err)
                    throw err;
                res.json({ status: 2, 'data': events });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.', 'data': [] });
    }
});

ctrl.get('/getNotification', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        //    var notif=req.params.notifId;
        Notification.find({ 'userId': userId, is_viewed: 0, 'post_type': { $ne: 0 } })
            .select('_id title userId from date is_viewed post_type groupId eventId blogId subject_id college_id degree_id post_id')
            .populate({ path: 'userId from groupId subject_id college_id degree_id', select: 'fname lname photo title name' })
            .populate({
                path: 'post_id',
                model: 'Post',
                select: '_id types name post_type message'
            })
            .sort({ date: -1 })
            .exec(function (err, events) {
                if (err)
                    throw err;
                res.json({ status: 2, 'data': events });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.', 'data': [] });
    }
});

ctrl.get('/changeNotificationstatus/:notifId', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var notifId = req.params.notifId;
        Notification.update({ userId: userId, _id: notifId }, { $set: { is_viewed: 1 } }, function (err, events) {
            if (err)
                throw err;
            res.json({ status: 2, msg: 'Notification status changed successfully' });
        });
    } else {
        res.json({ status: 0, msg: 'User not LoggedIn' });
    }
});
ctrl.get('/changeFriendRequestNotificationstatus/:friendId', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var friendId = req.params.friendId;
        Notification.update({ userId: userId, from: friendId, post_type: 0, is_viewed: 0 }, { $set: { is_viewed: 1 } }, { multi: true }, function (err, events) {
            if (err)
                throw err;
            res.json({ status: 2, data: events });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});




ctrl.get('/getFriendRequestNotification', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Notification.find({ 'userId': userId, is_viewed: 0, post_type: 0 })
            .select('_id title userId from date is_viewed post_type')
            .populate({ path: 'userId from', select: 'fname lname photo', modal: 'User' })
            .exec(function (err, events) {
                if (err)
                    throw err;
                res.json({ status: 2, data: events });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }

});


ctrl.get('/deleteNotification', function (req, res) {
    Notification.remove(function (err, user) {
        if (err)
            throw err;
        data = { message: 'Notifications deleted' };
        res.json(data);
    });
});

ctrl.get('/deleteNotification/:id', function (req, res) {

    if (req.session.passport) {
        var notificationId = req.params.id;
        Notification.find({ '_id': notificationId }, function (err, notification) {
            if (err) {
                throw err;
            }
            if (notification.length > 0) {
                Notification.remove({ _id: notificationId }, function (err, blog) {
                    if (err)
                        throw err;
                    data = { message: 'blog deleted' };
                    res.json({ data: data });
                });
            }
        });
    } else {
        console.log("User not found");
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});


function getUserDetail(id, calback) {
    var User = require('../models/user');
    User.findOne({ '_id': id })
        .select('fname lname photo')
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



ctrl.post('/addNotification/:friendId/:notificationType', function (req, res) {
    console.log("in add notification")
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var friendId = req.params.friendId;
        console.log("friendId");
        console.log(friendId);
        var notificationType = req.params.notificationType;
        var cDate = new Date();
        //        var recepients = req.body.recepient;
        var recepients = [];
        recepients.push(friendId);


        getUserDetail(userId, function (data) {
            var notificationData = {
                title: req.body.title,
                date: cDate,
                userId: friendId,
                //                usersId:null,
                userdata: data,
                from: userId,
                groupId: 0,
                eventId: 0,
                post_type: notificationType,
                notifId: '',
            };
            console.log("notificationData");
            console.log(notificationData);
            var clManager = req.app.get('wsClient');
            clManager.sendNotification(recepients, notificationData);
            res.json({ code: 2, msg: "Notification Added" });
        });
    }
});


ctrl.post('/addGroupNotification/:notificationType/:groupId', function (req, res) {
    console.log("in addGroupNotification notification")
    if (req.session.passport) {
        var userId = req.session.passport.user;
        //        var friendId = req.params.friendId;
        //        console.log("friendId");
        var notificationType = req.params.notificationType;
        var groupId = req.params.groupId;
        var cDate = new Date();
        console.log('++++++++++++++++groupId' + groupId);
        //        var recepients = req.body.recepient;
        var memberIds = req.body.members;
        console.log("memberIds");
        console.log(memberIds);

        var recepients = [];
        for (i = 0; i < memberIds.length; i++) {
            recepients.push(memberIds[i]);
        }
        console.log("recepients group");
        console.log(recepients);

        getUserDetail(userId, function (data) {
            var notificationData = {
                title: req.body.title,
                date: cDate,
                //                userId: recepients[i],
                userdata: data,
                from: userId,
                post_type: notificationType,
                groupId: groupId,
                eventId: 0,
                notifId: '',
            };
            console.log("notificationData");
            console.log(notificationData);
            var clManager = req.app.get('wsClient');
            for (i = 0; i < recepients.length; i++) {
                notificationData.userId = recepients[i];
                //            .push(memberIds[i]);
                clManager.sendGroupNotification(recepients[i], notificationData);
                if (i + 1 == recepients.length) {
                    res.json({ code: 2, msg: "Notification Added" });
                }
            }
        });

    }
});
ctrl.post('/addCommentDeleteNotification/:notificationType/:blogId', function (req, res) {
    console.log("in comment Delete notification");
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var blogId = req.params.blogId;
        var notificationType = req.params.notificationType;
        var cDate = new Date();
        var defaultTitle = "A comment entered by you is Deleted by administrator.This happens when your comment is marked as inappropriate and confirmed to be reported.";
        if (req.body.title == '' || req.body.title == null || typeof (req.body.title) == 'undefined') {
            req.body.title = defaultTitle;
        }
        var memberIds = req.body.members;
        console.log("memberIds");
        console.log(memberIds);
        if (userId != memberIds) {
            getUserDetail(userId, function (data) {
                var notificationData = {
                    title: req.body.title,
                    date: cDate,
                    userdata: data,
                    from: userId,
                    blogId: blogId,
                    post_type: notificationType,
                    notifId: '',
                };
                console.log("notificationData");
                console.log(notificationData);
                var clManager = req.app.get('wsClient');
                notificationData.userId = memberIds;
                //            .push(memberIds[i]);
                clManager.sendCommentDeleteNotification(memberIds, notificationData);
                res.json({ code: 2, msg: "Notification Added" });
            });
        } else {
            res.json({ code: 0, msg: "Notification Not Added" });
        }
    }
});
ctrl.post('/addGroupChatNotification/:notificationType/:groupId', function (req, res) {
    console.log("in addGroupNotification notification")
    if (req.session.passport) {
        var userId = req.session.passport.user;
        //        var friendId = req.params.friendId;
        //        console.log("friendId");
        var notificationType = req.params.notificationType;
        var groupId = req.params.groupId;
        var cDate = new Date();
        console.log('++++++++++++++++groupId' + groupId);
        //        var recepients = req.body.recepient;
        var memberIds = req.body.members;
        console.log("memberIds");
        console.log(memberIds);

        var recepients = [];
        for (i = 0; i < memberIds.length; i++) {
            recepients.push(memberIds[i]);
        }
        console.log("recepients group");
        console.log(recepients);

        getUserDetail(userId, function (data) {
            var notificationData = {
                title: req.body.title,
                date: cDate,
                //                userId: recepients[i],
                userdata: data,
                from: userId,
                post_type: notificationType,
                groupId: groupId,
                eventId: 0,
                notifId: '',
            };
            console.log("notificationData");
            console.log(notificationData);
            var clManager = req.app.get('wsClient');
            for (i = 0; i < recepients.length; i++) {
                notificationData.userId = recepients[i];
                //            .push(memberIds[i]);
                if (recepients[i] != userId) {
                    clManager.sendGroupChatNotification(recepients[i], notificationData);
                }
                if (i + 1 == recepients.length) {
                    res.json({ code: 2, msg: "Notification Added" });
                }
            }
        });

    }
});
//ctrl.post('/removeGroupChatNotification/:notificationType/:groupId', function (req, res) {
//    console.log("in addGroupNotification notification")
//    if (req.session.passport) {
//        var userId = req.session.passport.user;
////        var friendId = req.params.friendId;
////        console.log("friendId");
//        var notificationType = req.params.notificationType;
//        var groupId = req.params.groupId;
//        var cDate = new Date();
//        console.log('++++++++++++++++groupId' + groupId);
////        var recepients = req.body.recepient;
//        var memberIds = req.body.members;
//        console.log("memberIds");
//        console.log(memberIds);
//
//        var recepients = [];
//        for (i = 0; i < memberIds.length; i++)
//        {
//            recepients.push(memberIds[i]);
//        }
//        console.log("recepients group");
//        console.log(recepients);
//
//        getUserDetail(userId, function (data) {
//            var notificationData = {
//                title: req.body.title,
//                date: cDate,
////                userId: recepients[i],
//                userdata: data,
//                from: userId,
//                post_type: notificationType,
//                groupId: groupId,
//                eventId: 0,
//                notifId: '',
//            };
//            console.log("notificationData");
//            console.log(notificationData);
//            var clManager = req.app.get('wsClient');
//            for (i = 0; i < recepients.length; i++)
//            {
//                notificationData.userId=recepients[i];
////            .push(memberIds[i]);
//                clManager.sendGroupChatNotification(recepients[i], notificationData);
//                if (i + 1 == recepients.length)
//                {
//                    res.json({code: 2, msg: "Notification Added"});
//                }
//            }
//        });
//
//    }
//});
ctrl.post('/addEventNotification/:notificationType/:eventId', function (req, res) {
    console.log("in addGroupNotification notification")
    if (req.session.passport) {
        var userId = req.session.passport.user;
        //        var friendId = req.params.friendId;
        //        console.log("friendId");
        var notificationType = req.params.notificationType;
        var eventId = req.params.eventId;
        var cDate = new Date();
        console.log('++++++++++++++++groupId' + eventId);
        //        var recepients = req.body.recepient;
        var memberIds = req.body.members;
        console.log("memberIds");
        console.log(memberIds);

        var recepients = [];
        for (i = 0; i < memberIds.length; i++) {
            recepients.push(memberIds[i]);
        }
        console.log("recepients events");
        console.log(recepients);

        getUserDetail(userId, function (data) {
            var notificationData = {
                title: req.body.title,
                date: cDate,
                //                    userId: recepients[i],
                userdata: data,
                from: userId,
                post_type: notificationType,
                groupId: 0,
                eventId: eventId,
                notifId: '',
            };
            console.log("notificationData");
            console.log(notificationData);
            var clManager = req.app.get('wsClient');
            for (i = 0; i < recepients.length; i++) {
                notificationData.userId = recepients[i];
                clManager.sendGroupNotification(recepients[i], notificationData);
                if (i + 1 == recepients.length) {
                    res.json({ code: 2, msg: "Notification Added" });
                }
            }
        });
    }
});

ctrl.get('/userGroupNoti/:counter', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var limit = 20;
        var skip = limit * counter;
        var sort = { 'date': -1 };
        Notification.find({ 'userId': userId, 'post_type': { $in: [8] } })
            .select('_id title userId from date is_viewed post_type groupId')
            .populate({
                path: 'userId from',
                select: 'fname lname photo',
                model: 'User'
            })
            .populate({
                path: ' groupId',
                select: 'title subject_id college_id degree_id',
                model: 'Group',
                populate: {
                    path: 'subject_id college_id degree_id',
                    select: 'name _id'
                }
            })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function (err, noti) {
                if (err)
                    throw err;
                Notification.count({ 'userId': userId, 'post_type': { $in: [8] } })
                    .exec(function (err, totalNoti) {
                        if (err)
                            throw err;
                        res.json({ status: 2, data: noti, total: totalNoti });
                    });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

ctrl.post('/sendScdInvite', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var scdId = req.body.scdId;
        var userIds = req.body.ids;
        var scdType = req.body.scdType;
        var post_type;
        var title;
        var scd_type;
        if (userIds.length) {
            if (scdType == 'Subject') {
                post_type = 9;
                scd_type = 1;
                title = ' has invited you to join the subject ';
            } else if (scdType == 'College') {
                post_type = 10;
                scd_type = 2;
                title = ' has invited you to join the college ';
            }
            else if (scdType == 'Degree') {
                post_type = 11;
                scd_type = 3;
                title = ' has invited you to join the degree ';
            }
            getUserDetail(userId, function (userDetail) {
                var recepients = userIds;
                var notificationData = {
                    title: title,
                    date: new Date(),
                    userdata: userDetail,
                    from: userId,
                    post_type: post_type,
                    scd_id: scdId,
                    scd_type: scd_type,
                    notifId: ''
                };
                var clManager = req.app.get('wsClient');
                clManager.sendSCDNotification(recepients, notificationData);
                res.json({ status: 2, msg: 'Invitations have sent successfully.' })
            });
        } else {
            res.json({ status: 1, msg: 'No user selected!' });
        }
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});
ctrl.post('/sendFriendInvite', function (req, res, next) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var friendIds = req.body.ids;
        getUserDetail(userId, function (data) {
            for (var i in friendIds) {
                var clManager = req.app.get('wsClient');
                saveFriendRequest(userId, friendIds[i], data, clManager);
            }
            res.json({ status: 2, msg: "Invitations have sent successfully." });
        });
    } else {
        res.json({ status: 0, msg: "User Not logged in." });
    }
});

function saveFriendRequest(userId, friendId, data, clManager) {
    getFriendStatus(userId, friendId, function (friend) {
        if (!(friend.status == 5 || friend.status == 2 || friend.status == 1)) {
            User.find({ "_id": userId, "friends.friend_id": friendId }, function (err, user) {
                if (!user.length) {
                    User.findByIdAndUpdate(userId, {
                        $push: {
                            friends: {
                                friend_id: friendId,
                                date: new Date(),
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
                                        date: new Date(),
                                        status: "2"
                                    }
                                }
                            },
                                function (err, friend) {
                                    if (err)
                                        throw err;
                                    var recepients = [friendId];
                                    var notificationData = {
                                        title: ' has sent you a friend request.',
                                        date: new Date(),
                                        userdata: data,
                                        userId: friendId,
                                        from: userId,
                                        post_type: 0,
                                        notifId: '',
                                    };
                                    clManager.sendNotification(recepients, notificationData);
                                }
                            );
                        });
                }
            });
        }
    });
}
function getFriendStatus(userId, friendId, callback) {
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

ctrl.get('/getAllNotification/:counter', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var limit = 10;
        var skip = limit * counter;
        Notification.find({ 'userId': userId, 'post_type': { $ne: 0 } })
            .select('_id title userId from date is_viewed post_type groupId eventId blogId subject_id college_id degree_id post_id')
            .populate({ path: 'userId from groupId subject_id college_id degree_id', select: 'fname lname photo title name' })
            .populate({
                path: 'post_id',
                model: 'Post',
                select: '_id types name post_type message'
            })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .exec(function (err, events) {
                if (err)
                    throw err;
                Notification.count({ 'userId': userId, 'post_type': { $ne: 0 } })
                    .exec(function (err, totalNoti) {
                        if (err)
                            throw err;
                        res.json({ status: 2, data: events, total: totalNoti });
                    });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});
ctrl.get('/getAllFriendRequestNoti/:counter', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var counter = req.params.counter;
        var limit = 10;
        var skip = counter * limit;
        Notification.find({ 'userId': userId, 'post_type': 0 })
            .select('_id title userId from date is_viewed post_type')
            .populate({ path: 'userId from', select: 'fname lname photo', modal: 'User' })
            .sort({ 'date': -1 })
            .skip(skip)
            .limit(limit)
            .exec(function (err, allFriendNoti) {
                if (err)
                    throw err;
                Notification.count({ 'userId': userId, 'post_type': 0 })
                    .exec(function (err, totalFriendNoti) {
                        if (err)
                            throw err;
                        res.json({ status: 2, data: allFriendNoti, total: totalFriendNoti });
                    });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' })
    }
});


