var ctrl = require('express').Router();
module.exports = ctrl;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: '/tmp',
});
var upload = multer().single('avatar');


var Category = require('../models/category');
var User = require('../models/user');
var Blog = require('../models/blog');
var Journal = require('../models/journal');
var Post = require('../models/post');


ctrl.get('/', function (req, res) {
    Journal.find({}, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});

ctrl.post('/createJournal', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        if (req.body.title) {
            var journal = new Journal(req.body);
            journal.created_on = new Date();
            journal.user_id = userId;
            journal.save(function (err, newJournal) {
                if (err)
                    throw err;
                Journal.findOne({ _id: newJournal._id }).exec(function (err, journal) {
                    res.json({ status: 2, msg: "Journal Added Successfully", data: journal });
                });
            });
        } else {
            res.json({ status: 1, msg: 'title is required!' });
        }
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});
ctrl.post('/createJournals/:title', function (req, res) {
    var Journal = require('../models/journal');
    var journal = new Journal();
    var userId = req.session.passport.user;
    journal.title = req.params.title;
    journal.created_on = new Date;
    journal.user_id = userId;
    if (req.session.passport) {
        journal.save(function (err, newJournal) {
            if (err) {
                throw err;
            }
            upload(req, res, function (err) {
                if (err) {
                    return
                }
                var ext = req.file.originalname.split('.').pop();
                filename = newJournal._id + '.' + ext;

                var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Journal");          
                fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    Journal.findByIdAndUpdate(newJournal._id,
                        {
                            $push: {
                                icon: filename,
                            }
                        }, function (err, newSub) {
                            if (err) {
                                throw err;
                            }
                            Journal.find({ _id: newSub._id }, function (err, newJournal) {
                                if (err)
                                    throw err;
                                res.json({ status: 2, msg: "Journal Added", data: newJournal });
                            });
                        });
                });
            });
        });
    } else {
        data = { message: 'User not found' };
        res.json({ data: data });
    }
});


ctrl.get('/getAllJournalByUserId/:userId', function (req, res) {
    var User = require('../models/user');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Journal.find({ user_id: userId })
        .sort({'created_on': -1})        
        .exec(function (err, Journals) {
            if (err)
                throw err;
            res.json({ status: 2, data: Journals });
        });
    }
    else{
        res.json({ status: 0, msg: 'User not loggedIn' });    
    }
});
ctrl.get('/getJournalOfUser', function (req, res) {
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Journal.find({ user_id: userId })
            .sort(sort)
            .exec(function (err, data) {
                if (err)
                    throw err;
                res.json({ status: 2, data: data });
            });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

ctrl.get('/getAllPostByJournalId/:journalId', function (req, res) {
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var journalId = req.params.journalId;
        Journal.findOne({ 'user_id': userId, _id: journalId })
            .select('title icon created_on posts user_id')
            .populate({ path: 'user_id', select: 'fname lname photo _id' })
            .populate({
                path: 'posts.post_id',
                select: 'name types catagory post_type created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title', model: 'Post',
                populate: { path: 'created_by origin_creator', select: 'fname lname photo _id' }
            })
            .sort(sort)
            .exec(function (err, post_journal) {
                if (err) {
                    throw err;
                }
                var data = post_journal.posts.filter(function (posts) {
                    return posts.post_id;
                });
                post_journal.posts = data;
                res.json({ status: 2, data: post_journal });
            });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

ctrl.get('/getAllJournalByPostId/:postId', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.params.postId;
        Journal.find({ 'posts.post_id': postId })
            .sort({'posts.created_on': -1})
            .exec(function (err, post_journal) {
                if (err) {
                    throw err;
                }
                res.json({ status: 2, data: post_journal });
            });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});

ctrl.post('/addPostInJournal/:post_id/:journal_id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var cDate = new Date();
        var journal_id = req.params.journal_id;
        var post_id = req.params.post_id;
        var description = req.body.description;
        if (journal_id && post_id) {
            Journal.findOne({ '_id': journal_id, 'posts.post_id': post_id }).exec(function (err, journal) {
                if (err)
                    throw err;
                if (!journal) {
                    Journal.update({ _id: journal_id, user_id: userId },
                        {
                            $push: {
                                posts: {
                                    post_id: post_id,
                                    description: description,
                                    created_on: cDate
                                }
                            }
                        }, function (err, newJournalPost) {
                            if (err) {
                                throw err
                            }
                            res.json({ status: 2, msg: "Post added successfully in journal.", data: newJournalPost });
                        });
                } else {
                    res.json({ status: 3, msg: 'Post already added in journal!' });
                }
            });
        } else {
            res.json({ status: 1, msg: 'Ids not found' });
        }
    } else {
        res.json({ status: 0, msg: 'User not loggedIn' });
    }
});

ctrl.post('/updateJournalDescription/:post_id/:journal_id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var journal_id = req.params.journal_id;
        var post_id = req.params.post_id;
        var description = req.body.description;
        var descId = req.body._id;
        if (journal_id && post_id) {
            Journal.update({ _id: journal_id, 'posts._id': descId },
                {
                    "posts.$.description": req.body.description
                }, function (err, updateJournal) {
                    if (err)
                        throw err;
                    Journal.findOne({ _id: journal_id })
                        .exec(function (err, data) {
                            if (err)
                                throw err;
                            res.json({ status: 2, msg: "Journal Post Updated", data: data });
                        });
                });
        } else {
            res.json({ status: 1, msg: 'Ids not found' });
        }
    } else {
        res.json({ status: 0, msg: 'User not LoggedIn.' });
    }
});

ctrl.get('/deleteJournal', function (req, res) {
    Journal.remove(function (err, deleted_journal) {
        if (err)
            throw err;
        data = { message: 'Journals deleted' };
        res.json({ data: data });
    });
});
ctrl.get('/deleteJournalById/:journalId', function (req, res) {
    if (req.session.passport) {
    Journal.find({ _id: req.params.journalId }, function (err, journal) {
        if (err)
            throw err;
            if (journal.length > 0) {
                Journal.remove({ _id: req.params.journalId }, function (err, journals) {
                    if (err)
                        throw err;
                    res.json({ status: 2, msg: 'Journal deleted successfully' });
                });
            } else {
                res.json({ status: 0, msg: 'No Journal Found' });
            }
        });
    }
    else{
        res.json({ status: 0, msg: 'User not loggedIn' });    
    }
});
ctrl.post('/editJournalById/:journalId/:title', function (req, res) {
    var Journal = require('../models/journal');
    var journalId = req.params.journalId;
    var title = req.params.title;
    if (req.session.passport) {
        upload(req, res, function (err) {
            if (err) {
                return;
            }
            var ext = req.file.originalname.split('.').pop();
            filename = journalId + '.' + ext;
            var uploadpath = path.resolve(__dirname, "../../../client/app/public/files/Journal");           
            fs.writeFile(uploadpath + '/' + filename, req.file.buffer, function (err) {
                if (err) {
                    return console.log(err);
                }
                Journal.findByIdAndUpdate(journalId,
                    {
                        $set: {
                            icon: filename,
                            title: title
                        }
                    }, function (err, newSub) {
                        if (err) {
                            throw err;
                        }
                        Journal.find({ _id: journalId }, function (err, editJournal) {
                            if (err)
                                throw err;
                            res.json({ status: 2, msg: "Journal Edited Successfully", data: editJournal });
                        });
                    });
            });
        });

    } else {
        data = { message: 'User not found' };
        res.json({ status: 0, data: data });
    }
});
ctrl.post('/editOnlyJournalById/:journalId', function (req, res) {
    if (req.session.passport) {
        var journalId = req.params.journalId;
        var title = req.body.title;
        Journal.findByIdAndUpdate(journalId,
            {
                $set: {
                    title: title,
                }
            }, function (err, newSub) {
                if (err) {
                    throw err;
                }
                Journal.find({ _id: journalId }, function (err, editJournal) {
                    if (err)
                        throw err;
                    res.json({ status: 2, msg: "Journal Edited Successfully", data: editJournal });
                });
            });
    } else {
        data = { message: 'User not found' };
        res.json({ status: 0, data: data });
    }
});

ctrl.post('/deletePostInJournal', function (req, res) {
    var Journal = require('../models/journal');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var postId = req.body._id;
        Journal.find({ _id: req.body.journal_id }, function (err, journal) {
            if (err)
                throw err;
            if (journal.length > 0) {
                Journal.update({ 'user_id': userId, '_id': req.body.journal_id }, { $pull: { 'posts': { '_id': postId } } }, function (err, journals) {
                    data = { message: 'Post deleted successfully' };
                    res.json({ status: 2, data: data });
                });
            } else {
                data = { message: 'No Journal Found' };
                res.json({ status: 0, data: data });
            }
        });
    }
    else {
        data = { message: 'User not found' };
        res.json({ status: 0, data: data });
    }
});

ctrl.get('/getAllPostByPostType/:post_type/:journal_id', function (req, res) {
    var sort = { 'created_on': -1 };
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var journalId = req.params.journal_id;
        var post_type = req.params.post_type;
        Journal.findOne({ 'user_id': userId, _id: journalId })
            .select('title icon created_on posts user_id')
            .populate({ path: 'user_id', select: 'fname lname photo _id' })
            .populate({
                path: 'posts.post_id',
                match: { 'post_type': post_type },
                select: 'name types catagory post_type created_by created_on likes flag comments message question photo video link document audio privacy share original_post_id origin_creator shared_title', model: 'Post',
                populate: { path: 'created_by origin_creator', select: 'fname lname photo _id' }
            })
            .sort(sort)
            .exec(function (err, post_journal) {
                if (err) {
                    throw err;
                }
                var data = post_journal.posts.filter(function (posts) {
                    return posts.post_id;
                });
                post_journal.posts = data;
                res.json({ status: 2, data: post_journal });
            });
    } else {
        res.json({ status: 0, msg: "User Not Logged In" });
    }
});