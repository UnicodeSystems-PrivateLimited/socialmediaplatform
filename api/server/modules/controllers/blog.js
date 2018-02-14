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

ctrl.get('/', function (req, res) {
    Blog.find({}, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});


ctrl.get('/getBlog/:counterList', function (req, res) {
    var limit = 10;
    var counterList = req.params.counterList;
    var skip = counterList * limit;
    sort = {'created_on': -1};
    Blog.find({'publish': 1})
            .select('title body category_id created_by created_on photo privacy publish')
            .populate({path: 'category_id', select: 'title created_on status', modal: 'Category'})
            .populate({path: 'created_by', select: 'fname lname photo', modal: 'User'})
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .exec(function (err, events) {
                if (err)
                    throw err;
                Blog.find({'publish': 1})
                        .count()
                        .exec(function (err, total_blog) {
                            if (err)
                                throw err;
                            res.json({data: events, total_blog: total_blog.length});
                        });
            });
});

ctrl.post('/blogSearch', function (req, res) {
    if (req.body.name) {
        getBlogSearchlist(req.body.name, function (data) {
            res.json({status: 2, msg: "Search complete!", data: data});
        });
    } else {
        res.json({status: 0, msg: "No search parameters provided!"});
    }
});

function getBlogSearchlist(search_name, callback) {
    Blog.find({
        title: new RegExp('^' + search_name, "i")
    }, {title: 1, _id: 1})
            .select('title body category_id created_by created_on photo privacy publish')
            .populate({path: 'category_id', select: 'title created_on status', modal: 'Category'})
            .populate({path: 'created_by', select: 'fname lname photo', modal: 'User'})
            .limit(10)
            .exec(function (err, blog) {
                callback(blog);
            });
}



ctrl.get('/getBlogData/:counter', function (req, res) {
    var sort = {'created_on': -1};
    var counter = req.params.counter;
    var limit = 10;
    var skip = (counter - 1) * 10;
    console.log("req.session.passport.type");
    console.log(req.session.passport.type);
        if (req.session.passport && req.session.passport.type==2) {
    Blog.find({})
            .select('title body category_id created_by created_on photo privacy publish')
            .populate({path: 'category_id', select: 'title created_on status', modal: 'Category'})
            .populate({path: 'created_by', select: 'fname lname photo', modal: 'User'})
            .sort(sort)
            .skip(skip)
            .limit(10)
            .exec(function (err, events) {
                if (err)
                    throw err;
                Blog.find({}, function (err, total_blogs) {
                    if (err)
                        throw err;
                    res.json({data: events, total_blogs: total_blogs.length});
                });
            });
                }
    else {
                console.log("User not found");
                data = {message: 'User not found'};
                res.json({data:data});
            }
});
ctrl.get('/getBlogByCategoryId/:CategoryId', function (req, res) {
    var category_id = (req.params.CategoryId!='null' && req.params.CategoryId!='')?req.params.CategoryId:'';
    sort = {'timestamp': -1};
    Blog.find({'category_id': category_id,'publish': 1})
            .select('title body category_id created_by created_on photo privacy publish')
            .populate({path: 'category_id', select: 'title created_on status', modal: 'Category'})
            .populate({path: 'created_by', select: 'fname lname photo', modal: 'User'})
            .sort(sort)
            .limit(10)
            .exec(function (err, events) {
                if (err)
                    throw err;
                res.json({data: events});
            });
});

ctrl.get('/getRecentBlog', function (req, res) {
    sort = {'created_on': -1};
    Blog.find({'publish': 1})
            .select('title body category_id created_by created_on photo privacy publish')
            .populate({path: 'category_id', select: 'title created_on status', modal: 'Category'})
            .populate({path: 'created_by', select: 'fname lname photo', modal: 'User'})
            .sort(sort)
            .limit(5)
            .exec(function (err, events) {
                if (err)
                    throw err;
                res.json({data: events});
            });
});


ctrl.get('/blogCommentAll', function (req, res) {
    var Blogcomment = require('../models/blogcomment');
    Blogcomment.find({}, function (err, blogcomment) {
        if (err)
            throw err;
        res.json(blogcomment);
    });
});


ctrl.get('/blogCommentById/:id', function (req, res) {
    var Blogcomment = require('../models/blogcomment');
    var blog_id = req.params.id;
    var logged = req.session.passport.user;
    Blogcomment.find({'blog_id': blog_id})
            .select('body blog_id comment_by comment_on')
            .populate({path: 'blog_id', select: 'body blog_id comment_by comment_on', modal: 'Blogcomment'})
            .populate({path: 'comment_by', select: 'fname lname photo', modal: 'User'})
            .exec(function (err, blogcomment) {
                if (err)
                    throw err;
                res.json({data: blogcomment, logged: logged});
            });
});

ctrl.get('/deleteBlog', function (req, res) {
    Blog.remove(function (err, user) {
        if (err)
            throw err;
        data = {message: 'Blog deleted'};
        res.json(data);
    });
});

ctrl.get('/delete/:id', function (req, res) {
    var Blog = require('../models/blog');
    if (req.session.passport && req.session.passport.type==2) {
    var blogId = req.params.id;
    Blog.find({'_id': blogId}, function (err, blog) {
        if (err) {
            throw err;
        }
        if (blog.length > 0) {
            Blog.remove({_id: blogId}, function (err, blog) {
                if (err)
                    throw err;
                data = {message: 'blog deleted'};
                res.json({data: data});
            });
        }
    });
    }
    else {
                console.log("User not found");
                data = {message: 'User not found'};
                res.json({data:data});
            }
});




//ctrl.get('/list/:id', function (req, res) {
//    if (req.params.id && req.params.id > -1) {
//        Blog.findById(req.params.id, function (err, blog) {
//            if (err) throw err;
//            return res.json({data:blog});
//        });
//    }
//});

ctrl.get('/list/:id', function (req, res) {

    if (req.params.id && req.params.id > -1) {
        Blog.findById(req.params.id)
                .select('title body category_id created_by created_on photo privacy publish')
                .populate({path: 'category_id', select: 'title created_on status', modal: 'Category'})
                .populate({path: 'created_by', select: 'fname lname photo', modal: 'User'})
                .exec(function (err, blog) {
                    if (err)
                        throw err;
                    return res.json({data: blog});
                });
    }
});




ctrl.post('/add', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var blog = new Blog();
        var cDate = new Date();
        blog.title = req.body.title;
        blog.body = req.body.body;
        blog.category_id = req.body.category_id;
        blog.created_on = cDate;
        blog.created_by = userId;

        blog.save(function (err, newFilePost) {
            if (err)
                throw err;
            res.json({status: 2, msg: "Blog Added", data: newFilePost});

        });
    }
});
ctrl.post('/addBlog', function (req, res) {
    if (req.session.passport && req.session.passport.type == 2) {
        var userId = req.session.passport.user;

        var blog = new Blog();
        var cDate = new Date();
        console.log("req.body.title.title");
        console.log(req.body.title.title);
        console.log("req.body.description.description");
        console.log(req.body.description.description.replace(/^\s+|\s+$/g, ''));
        console.log("req.body.Id.Id");
        console.log(req.body.Id.Id);

        blog.title = req.body.title.title;
        blog.body = req.body.description.description.replace(/^\s+|\s+$/g, '');
        if (req.body.Id.Id != '' && req.body.Id.Id != null)
        {
            blog.category_id = req.body.Id.Id;
        }
        blog.created_on = cDate;
        blog.created_by = userId;

        blog.save(function (err, newFilePost) {
            if (err)
                throw err;
            res.json({status: 2, msg: "Blog Added", data: newFilePost});

        });
     } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});
ctrl.post('/editBlog/:id', function (req, res) {
    if (req.session.passport && req.session.passport.type == 2) {
        var userId = req.session.passport.user;
        var Blog = require('../models/blog');
        var blog = new Blog();
        var cDate = new Date();
        var ID='';
        var title = req.body.title.title;
        var body = req.body.description.description;
        if (req.params.id != '' && req.params.id != null)
        {
            ID = req.params.id;
        }
        var created_on = cDate;
        var created_by = userId;

        Blog.findByIdAndUpdate(ID,
                {$set: {
                        title: title,
                        body: body,
                        created_on: created_on,
                        created_by: created_by,
                        category_id: req.body.category.category
                    }
                }, function (err, newSub) {
            if (err)
                throw err;
            Blog.find({_id:ID})
                .select('title body category_id created_by created_on photo privacy publish')
                .populate({path: 'category_id', select: 'title created_on status', modal: 'Category'})
                .populate({path: 'created_by', select: 'fname lname photo', modal: 'User'})
                .exec(function (err, events) {
                    if (err)
                        throw err;
                     res.json({status: 2, msg: "Blog updated", data: events});
        });
        });
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});


ctrl.get('/publishBlog/:id/:publish_status', function (req, res) {
    var Blog = require('../models/blog');
    if (req.params.id != '' && req.params.id != null)
    {
        var ID = req.params.id;
        console.log("ID");
        console.log(ID);
    }
    if (req.params.publish_status != '' && req.params.publish_status != null)
    {
        var publish_status = req.params.publish_status;
        console.log("publish_status");
        console.log(publish_status);
    }
    if (req.session.passport && req.session.passport.type == 2) {
    Blog.findByIdAndUpdate(ID,
            {$set: {
                    publish: publish_status
                }
            }, function (err, newSub) {
        if (err) {
            throw err
        }
        res.json({status: 2, msg: "Blog updated", data: newSub});
    });
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});


ctrl.post('/addComment', function (req, res) {
    var Blogcomment = require('../models/blogcomment');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var blogcomment = new Blogcomment();
        var cDate = new Date();
        if (req.body.parent_comment) {
            blogcomment.parent_id = req.body.parent_comment;
        }
        blogcomment.body = req.body.body;
        blogcomment.blog_id = req.body.blog_id;
        blogcomment.comment_on = cDate;
        blogcomment.comment_by = userId;
        if (req.body.parent_comment) {
            blogcomment.parent_id = req.body.parent_comment;
        }
        blogcomment.save(function (err, newFilePost) {
            if (err)
                throw err;
            res.json({status: 2, msg: "Comment Added to Blog", data: newFilePost});

        });
    }
});
ctrl.post('/addCommentByBlogId/:blogId', function (req, res) {
    var Blogcomment = require('../models/blogcomment');
    console.log("req.body.message");
    console.log(req.body.message);
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var blogcomment = new Blogcomment();
        var cDate = new Date();
        blogcomment.body = req.body.message;
        blogcomment.blog_id = req.params.blogId;
        blogcomment.comment_on = cDate;
        blogcomment.comment_by = userId;
        if (req.body.parent_comment) {
            blogcomment.parent_id = req.body.parent_comment;
        }
        blogcomment.save(function (err, newFilePost) {
            if (err)
                throw err;
            res.json({status: 2, msg: "Comment Added to Blog", data: newFilePost});

        });
    }
});

ctrl.get('/deleteComment/:blogid/:commentId', function (req, res, next) {
    var Blogcomment = require('../models/blogcomment');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var commentId = req.params.commentId;
        var blogid = req.params.blogid;
        Blogcomment.remove({_id: commentId, blog_id: blogid, comment_by: userId},
                function (err, blogcomment) {
                    if (err)
                        throw err;
                    return res.json({msg: "Comment Removed", status: 2});
                });
    }

});
ctrl.get('/deleteBlogCommentById/:commentId/:blogId', function (req, res, next) {
    var Blogcomment = require('../models/blogcomment');
    if (req.session.passport) {
        var userId = req.session.passport.user;
        var commentId = req.params.commentId;
        var blogId = req.params.blogId;
        Blogcomment.find({$and: [{_id: commentId}, {blog_id: blogId}]}, function (err, bolgComments) {
            if (err)
                throw err;
            if (bolgComments.length > 0) {
                User.findOne({_id: userId}, function (err, users) {
                    if (err)
                        throw err;
//                    if (bolgComments[0].comment_by == userId || users.type == 2) {
                    Blogcomment.remove({_id: commentId}, function (err, bolgcomment) {
                        if (err)
                            throw err;
                        data = {msg: 'blog comment deleted'};
                        res.json({status: 2, data: data});
                    });
//                } else {
//                    data = {msg: 'Comment is not added by you!'};
//                    res.json({status: 0, data: data});
//                }
                });
            } else {
                data = {msg: 'No Blog Comment Found!'};
                res.json({status: 0, data: data});
            }
        });

    }

});
ctrl.post('/editCommentById/:commentId', function (req, res) {
    var Blogcomment = require('../models/blogcomment');
    console.log("req.body.body");
    console.log(req.body.messages);
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Blogcomment.findOne({_id: req.params.commentId}, function (err, blogComment) {
            if (err)
                throw err;
            console.log("++++((()))))))))" + JSON.stringify(blogComment))
            if (blogComment.comment_by == userId) {
                Blogcomment.update({_id: blogComment._id}, {$set: {body: req.body.messages}}, function (err, updateComment) {
                    if (err)
                        throw err;
                    Blogcomment.find({_id: req.params.commentId}, function (err, updatedComment) {
                        if (err)
                            throw err;
                        res.json({status: 2, data: updatedComment});
                    });
                });
            } else {
                res.json({status: 0, msg: 'no blog comment  found'});
            }
        });
    }
});
