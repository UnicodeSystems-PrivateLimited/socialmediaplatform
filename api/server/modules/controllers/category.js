var ctrl = require('express').Router();
module.exports = ctrl;
var Category = require('../models/category');
var Blog = require('../models/blog');
var User = require('../models/user');


ctrl.get('/', function (req, res) {
    Category.find({}, function (err, events) {
        if (err)
            throw err;
        res.json(events);
    });
});

ctrl.get('/getCategory', function (req, res) {
    if (req.session.passport ) {
        Category.find({}, function (err, events) {
            if (err)
                throw err;
            res.json({data: events});
        });
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});

ctrl.get('/getCategoryBlog', function (req, res) {
    if (req.session.passport ) {
        Blog.distinct("category_id").exec( function (err, categories) {
            Category.find({'_id': {$in: categories}}, function (err, events) {
                if (err)
                    throw err;
                res.json({data: events});
            });
        });
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});

ctrl.post('/categorySearch', function (req, res) {
    if (req.body.name) {
        getCategorySearchlist(req.body.name, function (data) {
            res.json({status: 2, msg: "Search complete!", data: data});
        });
    } else {
        res.json({status: 0, msg: "No search parameters provided!"});
    }
});

function getCategorySearchlist(search_name, callback) {
    Category.find({
        title: new RegExp('^' + search_name, "i")
    }, {title: 1, _id: 1})
            .limit(10)
            .exec(function (err, category) {
                callback(category);
            });
}


//ctrl.get('/deleteCat', function (req, res) {
//     if (req.session.passport) {
//        Category.remove( function (err, user) {
//            if (err) throw err;
//            data = {message: 'Category deleted'};
//            res.json(data);
//        });
//     }
//});

ctrl.get('/list/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        Category.findById(req.params.id, function (err, category) {
            if (err)
                throw err;
            return res.json(category);
        });
    }
});

ctrl.post('/add', function (req, res) {
    if (req.session.passport && req.session.passport.type == 2) {
    var category = new Category();
    var cDate = new Date();
    category.title = req.body.title;
//        console.log("req.body.title");
//        console.log(req.body.title);
//        console.log("req.body.title.title");
//        console.log(req.body.title.title);
    category.created_on = cDate;
    category.save(function (err, category) {
        if (err)
            throw err;
        res.json({status: 2, msg: "Category Added", data: category});
    });
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});


ctrl.post('/edit/:id', function (req, res) {
    var Category = require('../models/category');
    var ID = req.params.id;
    var title = req.body.title;
    console.log("title");
    console.log(title);
    console.log("ID");
    console.log(ID);
    if (req.session.passport && req.session.passport.type == 2) { 
    Category.findByIdAndUpdate(ID,
            {$set: {
                    title: title,
                }
            }, function (err, newSub) {
        if (err) {
                throw err;
        }
            Category.find({_id: ID}, function (err, updBlog) {
                if (err)
                    throw err;
                res.json({status: 2, msg: "Category updated", data: updBlog});
    });
        });
    } else {
        console.log("User not found");
        data = {message: 'User not found'};
        res.json({data: data});
    }
});


ctrl.get('/delete/:id', function (req, res) {
    var Category = require('../models/category');
    if (req.session.passport && req.session.passport.type == 2) {
    var categoryId = req.params.id;
    console.log("categoryId");
    console.log(categoryId);
    Category.find({'_id': categoryId}, function (err, category) {
        if (err) {
            throw err;
        }
        console.log("category.length");
        console.log(category.length);
        if (category.length > 0) {
            Category.remove({_id: categoryId}, function (err, category) {
                if (err)
                    throw err;
                data = {message: 'category deleted'};
                res.json({data: data});
            });
        }
    });
    }else {
                console.log("User not found");
                data = {message: 'User not found'};
                res.json({data:data});
            }
});
