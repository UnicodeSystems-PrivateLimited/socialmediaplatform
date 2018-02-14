var ctrl = require('express').Router();
module.exports = ctrl;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: '/tmp',
});
var upload = multer().single('avatar');


var Grouphistory = require('../models/grouphistory');

ctrl.get('/', function (req, res) {
    Grouphistory.find({}, function (err, history) {
        if (err)
            throw err;
        res.json(history);
    });
});
ctrl.get('/getGroupChatCounter', function (req, res) {
    Grouphistory.find({'is_viewed':0}, function (err, history) {
        if (err)
            throw err;
        res.json({data:history});
    });
});

ctrl.get('/getGroupHistoryById/:groupId', function (req, res) {
    var groupId = req.params.groupId;
    Grouphistory.find({'group_id': groupId})
            .populate({path: 'from', select: 'fname lname photo _id'})
            .exec(function (err, history) {
                if (err)
                    throw err;
                res.json({data: history});
            });
});



ctrl.get('/deleteEve', function (req, res) {
    Grouphistory.remove(function (err, user) {
        if (err)
            throw err;
        data = {message: 'All Group Chat deleted'};
        res.json({message: 'All Group Chat deleted'});
    });
});



ctrl.get('/postChangePendingMessageStatus/:groupId', function (req, res) {
    var to = req.session.passport.user;

    if (req.params.from && req.params.from != null) {
        var groupId = req.params.groupId;
        Grouphistory.update(
                {'group_id': groupId},
                {
                    "$set": {
                        "is_viewed": 1
                    }
                },
                {
                    multi:true
                },
                function (err, pendingStatus) {
                    if (err)
                        throw err;
                    res.json({data: pendingStatus});
                });
    }
});




ctrl.post('/addGroupChat/:groupId', function (req, res) {
    console.log("in addGroupChat")
    if (req.session.passport) {
        var userId = req.session.passport.user;
//        var friendId = req.params.friendId;
//        console.log("friendId");
//        var notificationType = req.params.notificationType;
        var groupId = req.params.groupId;
        var cDate = new Date();
        console.log('++++++++++++++++groupId' + groupId);
        console.log('++++++++++++++++cDate' + cDate);
//        var recepients = req.body.recepient;
        var memberIds = req.body.members;
        var body = req.body.groupchatmsg;
        console.log("body");
        console.log(body);
        console.log("memberIds");
        console.log(memberIds);

        var recepients = [];
        for (i = 0; i < memberIds.length; i++)
        {
            recepients.push(memberIds[i]);
        }
        console.log("recepients group");
        console.log(recepients);

        getUserDetail(userId, function (data) {
            var notificationData = {
//                title: req.body.title,
                date: cDate,
//                userId: recepients[i],
                userdata: data,
                from: userId,
                body:body,
//                post_type: notificationType,
                groupId: groupId,
//                eventId: 0,
                chatId: '',
                mCounter:0,
            };
            console.log("notificationData");
            console.log(notificationData);
            var clManager = req.app.get('wsClient');
            for (i = 0; i < recepients.length; i++)
            {
                notificationData.to=recepients[i];
//            .push(memberIds[i]);
                clManager.sendGroupChat(recepients[i], notificationData);
                if (i + 1 == recepients.length)
                {
                    res.json({code: 2, msg: "Notification Added"});
                }
            }
        });

    }
});

function getUserDetail(id, calback)
{
    var User = require('../models/user');
    User.findOne({'_id': id})
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


//ctrl.get('/defaultChat/:from', function (req, res) {
//    var to = req.session.passport.user;
////    console.log("to");
////    console.log(to);
//    if (req.params.from && req.params.from != null) {
//        var from = req.params.from;
//        msghistory.find({
//            $or: [
//                {$and: [{to: to}, {from: from}]},
//                {$and: [{from: to}, {to: from}]}
//            ]})
//                .select('_id to from date cdate body is_viewed')
//                .populate({path: 'to', select: 'fname lname photo _id'})
//                .exec(function (err, history) {
//                    if (err)
//                        throw err;
//                    res.json({data: history});
//                });
//    }
//});


//ctrl.get('/totalPendingUserMessage', function (req, res) {
//    var to = req.session.passport.user;
//    var msghistory = require('../models/msghistory');
//    var f=[];
//    getFriendList(to, function (data) {     
//        console.log(data);
//        msghistory.find({'to': to, is_viewed: 0})
//            .exec(function (err, totalPendingUserMessage) {
//                if (err) throw err;
//                for (var i in totalPendingUserMessage) {
//                    var index = data.friendId.indexOf(totalPendingUserMessage[i].from); 
//                    if(index > -1){
//                        data.friends[index].msgcount+=1;
//                    }
//                }
//        
//                res.json({friends:data.friends});
//            });
//    });
//});
//
//function getFriendList(userId, callback) {
//        var self = this;
//        var User = require('../models/user');
//        var current_friends = [];
//        User.find({'_id': userId})
//                .populate({path: 'friends.friend_id', select: 'fname lname photo _id'})
//                .exec(function (err, users) {
//                    if (err)
//                        throw err;
//                    data = users[0];
//                    var friends = [];
//                    for (var attributename in data.friends) {
//                        if (data.friends[attributename].friend_id != null) {
//                            if (data.friends[attributename].status === 3) {
//                                var friend = {
//                                    name: data.friends[attributename].friend_id.fname + ' ' + data.friends[attributename].friend_id.lname,
//                                    id: data.friends[attributename].friend_id._id,
//                                    photo: data.friends[attributename].friend_id.photo,
//                                    msgcount:0,
//                                }
//                                current_friends.push(data.friends[attributename].friend_id._id);
//                                friends.push(friend);
//                            }
//                        }
//                    }
//                    callback({friends:friends,friendId:current_friends});
//                });
//                
//}


//ctrl.get('/postChangePendingMessageStatus/:from', function (req, res) {
//    var to = req.session.passport.user;
////    console.log("to");
////    console.log(to);
//    if (req.params.from && req.params.from != null) {
//        var from = req.params.from;
//        msghistory.update(
//                {
//                    $or: [
//                        {$and: [{to: to}, {from: from}]},
////                        {$and: [{from: to}, {to: from}]},
//                    ]
//                },
//                {
//                    "$set": {
//                        "is_viewed": 1
//                    }
//                },
//                {
//                    multi:true
//                },
//                function (err, pendingStatus) {
//                    if (err)
//                        throw err;
//                    res.json({data: pendingStatus});
//                });
//    }
//});
