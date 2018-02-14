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
var Groupevents = require('../models/groupevents');
var User = require('../models/user');
ctrl.get('/', function (req, res) {
    Groupevents.find({}, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});
ctrl.get('/getUserGroup/:groupId', function (req, res) {
    Groupevents.find({ _id: req.params.groupId }, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});
ctrl.get('/deleteEve', function (req, res) {
    Groupevents.remove(function (err, user) {
        if (err)
            throw err;
        data = { message: 'Events deleted' };
        res.json({ message: 'Events deleted' });
    });
});
ctrl.get('/deleteEventMember/:eventId/:eventMemberId', function (req, res) {
    var eventId = req.params.eventId;
    var eventMemberId = req.params.eventMemberId;
    if (req.session.passport) {
        if (eventId != '' && eventMemberId != '') {
            Groupevents.findByIdAndUpdate({ "_id": eventId }, { $pull: { members: { user_id: eventMemberId } } }, function (err, user) {
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
ctrl.get('/deletegroup/:id', function (req, res) {
    var groupeventId = req.params.id;
    if (req.session.passport) {
        var userid = req.session.passport.user;
        if (groupeventId != '') {
            Groupevents.remove({ _id: groupeventId, created_by: userid }, function (err, user) {
                if (err)
                    throw err;
                data = { message: 'Event deleted' };
                res.json({ message: 'Event deleted' });
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
        Groupevents.findById(req.params.id, function (err, skill) {
            if (err)
                throw err;
            return res.json(skill);
        });
    }
});
ctrl.post('/addmembers/:groupId', function (req, res) {

    if (req.session.passport) {
        var userid = req.session.passport.user;
        var groupId = req.params.groupId;
        var members = [];
        members = req.body.members;
        var m = [];
        var groups = [];
        groups = req.body.groups;
        var g = [];
        for (var i in members) {
            m.push({ user_id: members[i] });
        }
        for (var i in groups) {
            g.push({ group_id: groups[i] });
        }
        if (members != '' || groups != '') {
            Groupevents.update({ _id: groupId, created_by: userid },
                {
                    $push: {
                        members: {
                            $each: m,
                        },
                        groups: {
                            $each: g,
                        }
                    }
                },
                function (err, usr) {
                    if (err)
                        throw err;
                    res.json({ status: 2, msg: "Member Added To Events", data: usr });
                });
        }
    }
});
ctrl.get('/listEventsById/:id', function (req, res) {
    var eventId = req.params.id;
    Groupevents.findOne({ '_id': eventId })
        .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
        .populate({
            path: 'groups.group_id',
            model: 'Group',
            select: 'title description icon created_on created_by members',
            populate: {
                path: 'members.user_id created_by',
                select: 'fname lname photo',
                model: 'User'
            }
        })
        .exec(function (err, grp) {
            if (err)
                throw err;
            res.json({ status: 2, data: grp });
        });
});
ctrl.get('/getEventsByUserId', function (req, res) {
    if (req.session.passport) {
        var userid = req.session.passport.user;
        var currentDate = new Date();
        var yesterday = new Date(currentDate.getTime());
        yesterday.setDate(currentDate.getDate() - 1);
        yesterday.setHours(yesterday.getHours() + 10);
        yesterday.setMinutes(yesterday.getMinutes() + 30);
        console.log("yesterday", yesterday);
        sort = { 'event_date_from': 1 };
        Groupevents.find({
            'created_by': userid,
            event_date_from: { $gt: yesterday }
        })
            .populate({ path: 'members.user_id created_by', select: 'fname lname photo _id' })
            .populate({
                path: 'groups.group_id',
                model: 'Group',
                select: 'title description icon created_on created_by members',
                populate: {
                    path: 'members.user_id created_by',
                    select: 'fname lname photo',
                    model: 'User'
                }
            })
            .sort(sort)
            .exec(function (err, grp) {
                if (err)
                    throw err;
                res.json({ status: 2, data: grp });
            });
    }
});
ctrl.post('/add', function (req, res) {
    var groupevents = new Groupevents();
    members = req.body.members;
    groups = req.body.groups;
    if (req.session.passport) {
        var userid = req.session.passport.user;
        var dateFrom = new Date(req.body.event_date_from);
        var dateFrom1 = new Date(req.body.event_date_from);
        var dateTo = new Date(req.body.event_date_to);
        var dateTo1 = new Date(req.body.event_date_to);
        dateFrom.setHours(dateFrom1.getHours() - 11);
        dateFrom.setMinutes(dateFrom1.getMinutes() - 30);
        dateTo.setHours(dateTo1.getHours() - 11);
        dateTo.setMinutes(dateTo1.getMinutes() - 30);
        if (req.body.title) {
            groupevents.title = req.body.title;
            groupevents.description = req.body.description;
            groupevents.tagline = req.body.tagline;
            groupevents.location = req.body.location;
            groupevents.event_date_to = dateTo;
            groupevents.event_date_from = dateFrom;
            //            groupevents.event_date_to = req.body.event_date_to;
            //            groupevents.event_date_from = req.body.event_date_from;
            groupevents.created_on = new Date;
            groupevents.created_by = userid;
            groupevents.save(function (err, newGroup) {
                if (err)
                    throw err;
                var m = [];
                for (var i in members) {
                    m.push({ user_id: members[i] });
                }
                var g = [];
                for (var i in groups) {
                    g.push({ group_id: groups[i] });
                }

                if (members != '') {
                    Groupevents.findByIdAndUpdate(newGroup._id,
                        {
                            $push: {
                                members: {
                                    $each: m,
                                },
                                groups: {
                                    $each: g,
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
                                    var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Groupevents/");
                                    fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                                        if (err) {
                                            return console.log(err);
                                        }
                                        Groupevents.findByIdAndUpdate(newGroup._id,
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
ctrl.post('/addEventWithIcon', function (req, res) {
    var Groupevents = require('../models/groupevents');
    var groupevents = new Groupevents();
    var userId = req.session.passport.user;

    // var dateFrom = new Date(req.params.event_date_from);
    // var dateFrom1 = new Date(req.params.event_date_from);
    // var dateTo = new Date(req.params.event_date_to);
    // var dateTo1 = new Date(req.params.event_date_to);
    // dateFrom.setHours(dateFrom1.getHours() - 11);
    // dateFrom.setMinutes(dateFrom1.getMinutes() - 30);
    // dateTo.setHours(dateTo1.getHours() - 11);
    // dateTo.setMinutes(dateTo1.getMinutes() - 30);
    //    var To=new Date(req.params.event_date_to);
    //    dateFrom.setHours(From.getHours() - 10);
    //    dateFrom.setMinutes(From.getMinutes() - 30);
    //    dateTo.setHours(To.getHours() - 10);
    //    dateTo.setMinutes(To.getMinutes() - 30);


    if (req.session.passport) {
        upload(req, res, function (err) {
            if (err) {
                return
            }
            groupevents.title = req.body.title;
            groupevents.description = req.body.description;
            groupevents.tagline = req.body.tagline;
            groupevents.location = req.body.location;
            groupevents.privacy = req.body.privacy;
            groupevents.event_date_to = new Date(req.body.event_date_to);
            groupevents.event_date_from = new Date(req.body.event_date_from);
            groupevents.created_on = new Date();
            groupevents.created_by = userId;
            groupevents.save(function (err, newEvent) {
                if (err) {
                    throw err;
                }
                var ext = req.file.originalname.split('.').pop();
                filename = newEvent._id + '.' + ext;
                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Groupevents");
                //                fs.mkdir(uploadpath, function (e) {
                //                    if (!e || (e && e.code === 'EEXIST')) {
                //do something with contents                   

                fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    Groupevents.findByIdAndUpdate(newEvent._id,
                        {
                            $push: {
                                icon: filename,
                            }
                        }, function (err, newEvnt) {
                            if (err) {
                                throw err
                            }
                            res.json({ status: 2, msg: "Event Added", data: newEvnt });
                        });
                });
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }

});


//*****************************************    Add/Edit Event *****************/


ctrl.post('/addEvent', function (req, res) {
    var groupevents = new Groupevents();
    var userId = req.session.passport.user;
    console.log("req.body________________", req.body);
    // var dateFrom = new Date(req.body.event_date_from);
    // var dateFrom1 = new Date(req.body.event_date_from);
    // var dateTo = new Date(req.body.event_date_to);
    // var dateTo1 = new Date(req.body.event_date_to);
    // dateFrom.setHours(dateFrom1.getHours() - 11);
    // dateFrom.setMinutes(dateFrom1.getMinutes() - 30);
    // dateTo.setHours(dateTo1.getHours() - 11);
    // dateTo.setMinutes(dateTo1.getMinutes() - 30);
    // //    var From=new Date(req.params.event_date_from);
    // //    var To=new Date(req.params.event_date_to);
    // //    dateFrom.setHours(From.getHours() - 10);
    // //    dateFrom.setMinutes(From.getMinutes() - 30);
    // //    dateTo.setHours(To.getHours() - 10);
    // //    dateTo.setMinutes(To.getMinutes() - 30);
    groupevents.title = req.body.title;
    groupevents.description = req.body.description;
    groupevents.tagline = req.body.tagline;
    groupevents.location = req.body.location;
    groupevents.privacy = req.body.privacy;
    groupevents.event_date_to = new Date(req.body.event_date_to);
    groupevents.event_date_from = new Date(req.body.event_date_from);
    groupevents.created_on = new Date();
    groupevents.created_by = userId;
    if (req.session.passport) {
        groupevents.save(function (err, newEvent) {
            if (err) {
                throw err;
            }
            res.json({ status: 2, msg: "Event Added", data: newEvent });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/editEventWithIcon/:id', function (req, res) {
    var GroupEvents = require('../models/groupevents');
    var id = req.params.id;
    if (req.session.passport) {
        upload(req, res, function (err) {
            if (err) {
                return
            }
            var ext = req.file.originalname.split('.').pop();
            var title = req.body.title;
            var description = req.body.description;
            var tagline = req.body.tagline;
            var location = req.body.location;
            var dateTo = new Date(req.body.event_date_to);
            var dateFrom = new Date(req.body.event_date_from);
            var privacy = req.body.privacy;
            filename = id + '.' + ext;
            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Groupevents");
            //                fs.mkdir(uploadpath, function (e) {
            //                    if (!e || (e && e.code === 'EEXIST')) {
            //do something with contents                   

            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                if (err) {
                    return console.log(err);
                }
                GroupEvents.findByIdAndUpdate(id,
                    {
                        $set: {
                            title: title,
                            icon: filename,
                            description: description,
                            tagline: tagline,
                            location: location,
                            event_date_to: dateTo,
                            event_date_from: dateFrom,
                            privacy: privacy
                        }
                    }, function (err, newEvnt) {
                        if (err) {
                            throw err
                        }
                        GroupEvents.findOne({ _id: id }, function (err, groupevent) {
                            if (err)
                                throw err;
                            res.json({ status: 2, msg: "Event updated", data: groupevent });
                        });
                    });
            });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }

});
ctrl.post('/editEvent/:id', function (req, res) {
    var GroupEvents = require('../models/groupevents');
    //    var userId = req.session.passport.user;
    var id = req.params.id;

    if (req.session.passport) {
        var title = req.body.title;
        var description = req.body.description;
        var tagline = req.body.tagline;
        var location = req.body.location;
        var dateTo = new Date(req.body.event_date_to);
        var dateFrom = new Date(req.body.event_date_from);
        var privacy = req.body.privacy;
        GroupEvents.findByIdAndUpdate(id,
            {
                $set: {
                    title: title,
                    description: description,
                    tagline: tagline,
                    location: location,
                    event_date_to: dateTo,
                    event_date_from: dateFrom,
                    privacy: privacy
                }
            }, function (err, newEvnt) {
                if (err) {
                    throw err;
                }
                GroupEvents.findOne({ _id: id }, function (err, groupevent) {
                    if (err)
                        throw err;
                    res.json({ status: 2, msg: "Event updated", data: groupevent });
                });
            });

    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }

});

ctrl.get('/getEvents', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Groupevents.find({})
            .populate({ path: 'created_by', select: 'fname lname photo _id' })
            .sort({ 'event_date_from': 1 })
            .exec(function (err, data) {
                if (err)
                    throw err;
                res.json({ status: 2, msg: 'getting data successfully!', data: data, logged: userId });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/join', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var eventId = req.body.eventId;
        Groupevents.findOne({ '_id': eventId, 'members.user_id': { $nin: [userId] } }, function (err, event) {
            if (err)
                throw err;
            if (event) {
                Groupevents.update({ '_id': eventId }, {
                    $push: {
                        members: {
                            user_id: userId
                        }
                    }
                }, function (err, data) {
                    if (err)
                        throw err;
                    Groupevents.findOne({ '_id': eventId })
                        .populate({ path: 'created_by', select: 'fname lname photo _id' })
                        .exec(function (err, updatedEvent) {
                            if (err)
                                throw err;
                            res.json({ status: 2, msg: 'You have successfully joined an event.', data: updatedEvent });
                        })
                });
            } else {
                res.json({ status: 0, msg: 'User Already Added.' });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/unjoin', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var eventId = req.body.eventId;
        Groupevents.findOne({ '_id': eventId, 'members.user_id': { $in: [userId] } }, function (err, event) {
            if (err)
                throw err;
            if (event) {
                Groupevents.update({ '_id': eventId }, {
                    $pull: {
                        members: {
                            user_id: userId
                        }
                    }
                }, function (err, data) {
                    if (err)
                        throw err;
                    Groupevents.findOne({ '_id': eventId })
                        .populate({ path: 'created_by', select: 'fname lname photo _id' })
                        .exec(function (err, updatedEvent) {
                            if (err)
                                throw err;
                            res.json({ status: 2, msg: 'You have unjoined an event.', data: updatedEvent });
                        })
                });
            } else {
                res.json({ status: 0, msg: 'User Already Leaved.' });
            }
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});