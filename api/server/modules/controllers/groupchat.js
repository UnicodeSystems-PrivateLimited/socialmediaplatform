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
var Groupchat = require('../models/groupchat');
var User = require('../models/user');

ctrl.get('/RemoveGroupChatFriend/:friendId/:groupId', function (req, res) {
    if (req.session.passport) {
        if ((req.params.friendId && req.params.friendId > -1)) {
            var groupId = req.params.groupId;
            var friendId = req.params.friendId;
            console.log("groupId");
            console.log(groupId);
            console.log("friendId");
            console.log(friendId);

            Groupchat.update(
                    {"_id": groupId, "members.user_id": friendId},
                    {$pull: {members: {user_id: friendId}}},
                    {safe: true},
                    function (err, obj) {
                        if (err)
                            throw err;
                        return res.json({status: 2, data: obj});
                    });

        } else {
            res.json({status: 0, msg: "No User Selected"});
        }
    } else {
        res.json({status: 0, msg: "Not logged in"});
    }
});


ctrl.get('/', function (req, res) {
    Groupchat.find({}, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});

ctrl.get('/getUserGroup/:groupId', function (req, res) {
    Groupchat.find({_id:req.params.groupId}, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});

ctrl.get('/deleteEve', function (req, res) {
    Groupchat.remove(function (err, user) {
        if (err)
            throw err;
        data = {message: 'Group deleted'};
        res.json({message: 'Group deleted'});
    });
});

ctrl.get('/deletegroup/:id', function (req, res) {
    var groupId = req.params.id;
    if (req.session.passport) {
        var userid = req.session.passport.user;
        if (groupId != '') {
            Groupchat.remove({_id: groupId, created_by: userid}, function (err, user) {
                if (err)
                    throw err;
                data = {message: 'Group deleted'};
                res.json({message: 'Group deleted'});
            });
        }
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});

ctrl.get('/list/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        Groupchat.findById(req.params.id, function (err, skill) {
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
            m.push({user_id: members[i]});
        }

        if (members != '') {

            Groupchat.update({_id: groupId, created_by: userid},
                    {$push: {
                            members: {
                                $each: m,
                            }
                        }},
                    function (err, usr) {
                        if (err)
                            throw err;
                        res.json({status: 2, msg: "Member Added To Group", data: usr});
                    });
        }
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});
ctrl.get('/addloginmembers/:groupId', function (req, res) {

    if (req.session.passport) {
        var userid = req.session.passport.user;
        var groupId = req.params.groupId;
        var members = [];
//        members = req.body.members;
        var m = [];
//        for (var i in members) {
            m.push({user_id: userid});
//        }

        if (userid != '') {

            Groupchat.update({_id: groupId, created_by: userid},
                    {$push: {
                            members: {
                                $each: m,
                            }
                        }},
                    function (err, usr) {
                        if (err)
                            throw err;
                        res.json({status: 2, msg: "Member Added To Group", data: usr});
                    });
        }
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});

ctrl.get('/listGroupById/:id', function (req, res) {
    var groupId = req.params.id;
    Groupchat.findOne({'_id': groupId})
            .populate({path: 'members.user_id created_by', select: 'fname lname photo _id'})
            .exec(function (err, grp) {
                if (err)
                    throw err;
                res.json({status: 2, data: grp});
            });
});

ctrl.get('/getGroupsByUserId', function (req, res) {
    if (req.session.passport) {
        var userid = req.session.passport.user;
        Groupchat.find({'created_by': userid})
                .populate({path: 'members.user_id created_by', select: 'fname lname photo _id'})
                .exec(function (err, grp) {
                    if (err)
                        throw err;
                    res.json({status: 2, data: grp});
                });
    }
});
ctrl.get('/getOtherGroupsByUserId', function (req, res) {
    if (req.session.passport) {
        var userid = req.session.passport.user;
        Groupchat.find({'members.user_id': userid, 'created_by': {$ne: userid}})
                .populate({path: 'members.user_id created_by', select: 'fname lname photo _id'})
                .exec(function (err, grp) {
                    if (err)
                        throw err;
                    res.json({status: 2, data: grp});
                });
    }
});

ctrl.post('/add', function (req, res) {
    var group = new Groupchat();
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
                for (var i in members)
                {
                    m.push({user_id: members[i]});
                }

                if (members != '') {

                    Groupchat.findByIdAndUpdate(newGroup._id,
                            {$push: {
                                    members: {
                                        $each: m,
                                    }
                                }},
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

                                        var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Groupchat/");
                                        fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                                            if (err) {
                                                return console.log(err);
                                            }
                                            Groupchat.findByIdAndUpdate(newGroup._id,
                                                    {$push: {
                                                            icon: filename,
                                                        }
                                                    }, function (err, newSub) {
                                                if (err) {
                                                    throw err
                                                }

                                                res.json({status: 2, msg: "Group Added", data: newSub});
                                            });
                                        });
                                    });
                                } else {
                                    res.json({status: 2, msg: "Group Added", data: usr});
                                }
                            });
                }
            });
        }
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});
ctrl.post('/addGroup/:title', function (req, res) {
    var Groupchat = require('../models/groupchat');
    var group = new Groupchat();
    var userId = req.session.passport.user;
    group.title = req.params.title;
    group.created_on = new Date;
    group.created_by = userId;

    if (req.session.passport) {
        group.save(function (err, newGroup) {
            if (err) {
                throw err;
            }
            upload(req, res, function (err) {
                if (err) {
                    return
                }
                var ext = req.file.originalname.split('.').pop();
                filename = newGroup._id + '.' + ext;

                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Groupchat");
//                fs.mkdir(uploadpath, function (e) {
//                    if (!e || (e && e.code === 'EEXIST')) {
                //do something with contents                   

                fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    Groupchat.findByIdAndUpdate(newGroup._id,
                            {$push: {
                                    icon: filename,
                                }
                            }, function (err, newSub) {
                        if (err) {
                            throw err
                        }
                        res.json({status: 2, msg: "group Added", data: newSub});
                    });
                });
            });
        });
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }

});
//
//ctrl.get('/getOtherGroupsByUserId', function (req, res) {
//    if (req.session.passport) {
//        var userid = req.session.passport.user;
//        Groupchat.find({'members.user_id': userid})
//                .populate({path: 'members.user_id created_by', select: 'fname lname photo _id'})
//                .exec(function (err, grp) {
//                    if (err)
//                        throw err;
//                    res.json({status: 2, data: grp});
//                });
//    }
//});

ctrl.post('/groupSearch', function (req, res) {
    if (req.body.name) {
        if (req.session.passport) {
            var userid = req.session.passport.user;
            getGroupSearchlist(req.body.name, userid, function (data) {
                res.json({status: 2, msg: "Search complete!", data: data});
            });
        }
    } else {
        res.json({status: 0, msg: "No search parameters provided!"});
    }
});

function getGroupSearchlist(search_name, userid, callback) {
    var Group = require('../models/groupchat');
    var d = [];

    Group.find({
        title: new RegExp('^' + search_name, "i"),
        created_by: userid
    }, {title: 1, _id: 1, created_on: 1})
            .limit(20)
            .exec(function (err, group) {
                callback(group);
            });

}


ctrl.post('/userSearch', function (req, res) {
    if (req.body.name) {
        if (req.session.passport) {
            var userid = req.session.passport.user;
            getUserSearchlist(req.body.name, userid, function (data) {
                res.json({status: 2, msg: "Search complete!", data: data});
            });
        }
    } else {
        res.json({status: 0, msg: "No search parameters provided!"});
    }
});

function getUserSearchlist(search_name, userid, callback) {
    var User = require('../models/user');
    var d = [];
    User.findById(userid, {friends: 1, followers: 1, following: 1}, function (err, user) {
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
            _id: {$in: d}
        }, {fname: 1, _id: 1, photo: 1, lname: 1})
                .limit(20)
                .exec(function (err, user) {
                    callback(user);
                });
    });
}