var ctrl = require('express').Router();
module.exports = ctrl;
//var mailer = require('../../mailer/models');

var Subscriber = require('../models/subscriber');

//ctrl.post('/subscribe', function (req, res, next) {
//    var email = req.body.email;
//    Subscriber.findOne({email: email}, function (err, sub) {
//        if (err)
//            throw err;
//        if (!sub)
//        {
//            var subscriber = new Subscriber(req.body);
//            subscriber.save(function (err, subscriber) {
//                if (err)
//                    throw err;
//                getEmailData('subscribed_mail', function (data) {
//                    var fullUrl = "http://dev.stribein.com";
//                    locals = {
//                        email: req.body.email,
//                        subject: data.subject, //'Newsletter Subscription Confirmation',
//                        name: req.body.name,
//                        link: fullUrl,
//                        logo:''
//                    };
//                    res.json({status: 2, subscriber: subscriber, message: "You have subscribed successfully."});
//                    next();
//                });
//            });
//        } else
//        {
//            var status = req.body.status;
//            var name = req.body.name;
//            Subscriber.findOneAndUpdate({email: email}, {$set: {status: status, name: name}}, function (err, newSub) {
//                if (err)
//                    throw err;
//                getEmailData('subscribed_mail', function (data) {
//                    var fullUrl = "http://dev.stribein.com";
//                    locals = {
//                        email: req.body.email,
//                        subject: data.subject, //'Newsletter Subscription Confirmation',
//                        name: req.body.name,
//                        link: fullUrl,
//                        logo:''
//                    };
//                    console.log("locals++++++++="+JSON.stringify(locals));
//                    res.json({status: 2, subscriber: subscriber, message: "You have subscribed successfully."});
//                    next();
//                });
//            });
//        }
//    });
//}, function (req, res) {
//    mailer.sendOne('subscribed_mail', locals, function (err, responseStatus, html, text) {
//        if(err)
//            throw err;
//        console.log("responseStatus:"+responseStatus+"html:"+html);
//    });
//}
//);


//function getEmailData(tmp_name, callback) {
//    var Template = require('../models/template');
//    Template.find({type: 2, name: tmp_name})
//            .exec(function (err, template) {
//                if (err)
//                    throw err;
//                callback(template[0]);
//            });
//}
//ctrl.get('/userUnSubscribe/:email', function (req, res) {
//    var email = req.params.email;
//    var status =1;
//    Subscriber.findOneAndUpdate({email: email}, {$set: {status: status}}, function (err, newSub) {
//        if (err)
//            throw err;
//        return res.json({status: 2, data: newSub});
////       res.render('subscriber');
//    });
//});
//ctrl.get('/userSubscribeStatus', function (req, res) {
//    var User = require('../models/user');
//    var userId = req.session.passport.user;
//    User.findOne({_id: userId}, function (err, user) {
//        if (err)
//            throw err;
//        var email = user.local.email;
//        Subscriber.find({email: email}, function (err, subscriber) {
//            if (err)
//                throw err;
//            return res.json({status: 2, data: subscriber});
//        });
//    });
//});

ctrl.get('/unsubscribe/:id', function (req, res) {
    Subscriber.find({_id: req.params.id}).remove(function (err, subscriber) {
        if (err)
            throw err;
        return res.json({status: 2, subscriber: subscriber});
    });
});
ctrl.get('/approve/:id/:status', function (req, res) {
    Subscriber.findByIdAndUpdate({_id: req.params.id}, {$set: {status: req.params.status}}, function (err, subscriber) {
        if (err)
            throw err;
        Subscriber.findOne({_id: subscriber._id}, function (err, data) {
            return res.json({status: 2, data: data});
        });
    });
});

ctrl.get('/list/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        Subscriber.findById(req.params.id, function (err, subscriber) {
            if (err)
                throw err;
            return res.json({status: 2, subscriber: subscriber});
        });
    }
});
ctrl.get('/', function (req, res) {
    Subscriber.find({}, function (err, subscriber) {
        if (err)
            throw err;
        return res.json({status: 2, data: subscriber});
    });
});
ctrl.get('/getSubscribers/:limit', function (req, res) {
    var skip = req.params.limit * 20;
    Subscriber.find({})
            .skip(skip)
            .limit(20)
            .exec(function (err, subscriber) {
                if (err)
                    throw err;
                return res.json({status: 2, data: subscriber});
            });
});

ctrl.get('/delete/:id', function (req, res) {
    var subscriberId = req.params.id;
    Subscriber.find({'_id': subscriberId}, function (err, subscriber) {
        if (err) {
            throw err;
        }
        if (subscriber.length > 0) {
            Subscriber.remove({_id: subscriberId}, function (err, subscriber) {
                if (err)
                    throw err;
                data = {message: 'User deleted'};
                res.json(data);
            });
        } else {
            console.log("User not found");
            data = {message: 'User not found'};
            res.json(data);
        }
    });
//    }
});








