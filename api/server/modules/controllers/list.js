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
var List = require('../models/list');
var User = require('../models/user');
ctrl.get('/', function (req, res) {
    List.find({}, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});

ctrl.get('/getListsByUserId/:count', function (req, res) {
    if (req.session.passport) {
        var counter = req.params.count;
        var sort = { 'created_on': -1 };
        var limit = 20;
        var skip = limit * counter;
        var userId = req.session.passport.user;
        List.find({ 'created_by': userId })
            .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(function (err, list) {
                if (err)
                    throw err;
                List.count({ 'created_by': userId })
                    .exec(function (err, total) {
                        if (err)
                            throw err;
                        res.json({ status: 2, data: list, total: total });
                    });
            });
    }
    else {
        res.json({ status: 0, msg: "user not logged in" });
    }
});
ctrl.get('/list/:id', function (req, res) {
    if (req.session.passport) {
        var id = req.params.id;
        List.findOne({ '_id': id })
            .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
            .exec(function (err, list) {
                if (err)
                    throw err;
                res.json({ status: 2, data: list });
            });
    }
    else {
        res.json({ status: 0, msg: "user not logged in" });
    }
});

ctrl.post('/addList', function (req, res) {
    if (req.session.passport) {
        var list = new List(req.body);
        var userId = req.session.passport.user;
        list.created_on = new Date();
        list.created_by = userId;
        List.findOne({ 'created_by': userId, 'title': req.body.title })
            .exec(function (err, data) {
                if (err)
                    throw err;
                if (!data) {
                    list.save(function (err, newList) {
                        if (err) {
                            throw err;
                        }
                        List.findOne({ '_id': newList._id })
                            .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
                            .exec(function (err, newData) {
                                if (err)
                                    throw err;
                                res.json({ status: 2, msg: "list Added successfully.", data: newData });
                            })
                    });
                } else {
                    res.json({ status: 1, msg: 'List name has already taken.' })
                }
            });

    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

ctrl.get('/deleteList/:id', function (req, res) {
    if (req.session.passport) {
        var listId = req.params.id;
        var userid = req.session.passport.user;
        List.remove({ _id: listId, created_by: userid }, function (err, user) {
            if (err)
                throw err;
            res.json({ status: 2, msg: "List deleted successfully." });
        });
    } else {
        res.json({ status: 0, msg: 'User not LoggedIn.' });
    }
});

ctrl.post('/updateList', function (req, res) {
    if (req.session.passport) {
        var List = require('../models/list');
        var id = req.body.id;
        var title = req.body.title;
        var userId = req.session.passport.user;
        List.findOne({ 'created_by': userId, 'title': title })
            .exec(function (err, data) {
                if (!data) {
                    List.findByIdAndUpdate({ _id: id },
                        {
                            $set: {
                                title: title,
                            }
                        }, function (err, newSub) {
                            if (err) {
                                throw err;
                            }
                            List.findOne({ _id: id })
                                .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
                                .exec(function (err, list) {
                                    if (err)
                                        throw err;
                                    res.json({ status: 2, msg: "list updated successfully.", data: list });
                                });
                        });
                } else {
                    res.json({ status: 1, msg: 'List name has already taken.' })
                }
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

ctrl.post('/addmembers/:listId', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var listId = req.params.listId;
        var members = req.body.members;
        var m = [];
        for (var i in members) {
            m.push({ user_id: members[i] });
        }
        console.log("members", members);
        List.update({ '_id': listId, 'created_by': userId },
            {
                $addToSet: {
                    'members': { $each: m }
                }
            },
            function (err, usr) {
                if (err)
                    throw err;
                res.json({ status: 2, msg: "Members Added To List SuccessFully.", data: usr });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

ctrl.post('/listSearch', function (req, res) {
    var userId = req.session.passport.user;
    var searchData = [];
    if (req.body.title) {
        getSearchlist(req.body.title, function (data) {
            for (i = 0; i < data.length; i++) {
                searchData.push(data[i]);
            }
            res.json({ status: 2, msg: "Search complete!", data: searchData });
        });
    } else {
        res.json({ status: 0, msg: "No search parameters provided!" });
    }
});

ctrl.get('/deleteMemeber/:id/:memberId', function (req, res) {
    if (req.session.passport) {
        var listId = req.params.id;
        var memberId = req.params.memberId;
        var userId = req.session.passport.user;
        List.update({ '_id': listId, 'members.user_id': memberId, 'created_by': userId }, { $pull: { 'members': { 'user_id': memberId } } }, function (err, data) {
            if (err)
                throw err;
            res.json({ status: 2, msg: 'Member removed successfully.' });
        })
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

function getSearchlist(search_name, callback) {
    var List = require('../models/list');
    List.find({
        title: new RegExp('^' + search_name, "i")
    }, { title: 1, _id: 1, members: 1 })
        .exec(function (err, list) {
            callback(list);
        });
}

