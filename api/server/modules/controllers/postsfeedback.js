var ctrl = require('express').Router();
module.exports = ctrl;
var PostsFeedback = require('../models/postsfeedback');
var Post = require('../models/post');
var College = require('../models/college');
var Degree = require('../models/degree');
var Subject = require('../models/subject');
var Subject = require('../models/subject');
var Journal = require('../models/journal');
var Group = require('../models/group');

ctrl.get('/', function(req, res) {
    PostsFeedback.find({})
        .exec((err, data) => {
            if (err)
                throw err;
            res.json({ status: 2, data: data });
        })
});
ctrl.get('/delete/:id/:postId', function(req, res) {
    console.log(req.session.passport);
    if (req.session.passport && req.session.passport.type == 2) {
        deletePost(req.params.postId, (data1) => {
            PostsFeedback.find({ '_id': req.params.id })
                .remove()
                .exec((err, data) => {
                    if (err)
                        throw err;
                    if (data1) {
                        res.json({ status: 2, msg: 'Post deleted successfully.' });
                    } else {
                        res.json({ status: 2, msg: 'Post not found.' });
                    }
                });
        });
    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});


function deletePost(post_id, callback) {
    Post.findOne({ '_id': post_id }, (err, data) => {
        if (err)
            throw err;
        if (data) {
            Post.remove({ '_id': post_id }, function(err, post) {
                if (err)
                    throw err;
                if (data.types == 1) {
                    Subject.update({ _id: data.subject_id }, { $pull: { post: { post_id: post_id } } }, { multi: true }, function(err, post) {
                        if (err)
                            throw err;
                    });
                } else if (data.types == 2) {
                    College.update({ _id: data.college_id }, { $pull: { post: { post_id: post_id } } }, { multi: true }, function(err, post) {
                        if (err)
                            throw err;
                    });
                } else if (data.types == 3 || data.types == 4) {
                    Degree.update({ _id: data.degree_id }, { $pull: { post: { post_id: post_id } } }, { multi: true }, function(err, post) {
                        if (err)
                            throw err;
                    });
                } else if (data.types == 6) {
                    Group.update({ _id: data.group_id }, { $pull: { post: { post_id: post_id } } }, { multi: true }, function(err, post) {
                        if (err)
                            throw err;
                    });
                }
                Journal.update({ user_id: data.created_by }, { $pull: { posts: { post_id: post_id } } }, { multi: true }, function(err, journals) {
                    callback(true);
                });
            });
        } else {
            callback(false);
        }
    });
}

ctrl.post('/sendfeedBack', function(req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        PostsFeedback.findOne({ 'post_id': req.body.id })
            .exec((err, data) => {
                if (err)
                    throw err;
                if (data) {
                    var count = data.report_count ? data.report_count + 1 : 1;
                    PostsFeedback.update({ '_id': data._id }, { "$addToSet": { 'messages': { "$each": req.body.messages }, 'given_by': { "$each": [userId] } }, '$set': { 'report_count': count } }, (err, data) => {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Thanks! Your feedback helps make StribeIN better.' });
                    })
                } else {
                    var postsFeedback = new PostsFeedback();
                    postsFeedback.post_id = req.body.id;
                    postsFeedback.messages = req.body.messages;
                    postsFeedback.given_by = [userId];
                    postsFeedback.created_on = new Date();
                    postsFeedback.save((err, data) => {
                        if (err)
                            throw err;
                        res.json({ status: 2, msg: 'Thanks! Your feedback helps make StribeIN better.' });
                    });
                }
            })

    } else {
        res.json({ status: 0, msg: 'User not loggedIn.' });
    }
});

ctrl.get('/list', function(req, res) {
    if (req.session.passport) {
        PostsFeedback.find({})
            .populate({
                path: 'post_id',
                select: 'created_by',
                model: 'Post',
                populate: {
                    path: 'created_by',
                    select: 'fname lname photo',
                    model: 'User'
                }
            })
            .exec((err, data) => {
                if (err)
                    throw err;
                var postData = data.filter((post) => {
                    return post.post_id;
                });
                res.json({ status: 2, data: postData });
            })
    } else {
        res.json({ status: 0, msg: 'User not loggedIn!' });
    }
});