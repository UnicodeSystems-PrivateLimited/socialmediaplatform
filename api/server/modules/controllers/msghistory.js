var ctrl = require('express').Router();
module.exports = ctrl;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: '/tmp',
});
var upload = multer().single('avatar');


var msghistory = require('../models/msghistory');

ctrl.get('/', function (req, res) {
    msghistory.find({}, function (err, history) {
        if (err)
            throw err;
        res.json(history);
    });
});

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
