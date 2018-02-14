
var ctrl = require('express').Router();
module.exports = ctrl;
var RuleOfPost = require('../models/ruleofpost');
var User = require('../models/user');

ctrl.post('/checkPostStatus', function (req, res) {
    var userId = req.session.passport.user;
    var postStatus = req.body.post_status;
    if (req.session.passport) {
        if (postStatus == 1) {
            RuleOfPost.update({ 'user_id': userId },
                {
                    $set: {
                        post_status: 0,
                    }
                }, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    res.json({ status: 2, msg: "Post Status Change 1 Successfully", data: result });
                });
        } else if (postStatus == 0) {
            RuleOfPost.update({ 'user_id': userId },
                {
                    $set: {
                        post_status: 1,
                    }
                }, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    res.json({ status: 2, msg: "Post Status Change 0 Successfully", data: result });
                });
        }
    } else {
        res.json({ status: 2, msg: "User Not Logged In" });
    }
});
// ctrl.post('/checkPostStatus', function (req, res) {
//     var userId = req.session.passport.user;
//     // var _id = req.body._id;
//     console.log('request bodyyyyyyyyyyyyyyyy',req.body.friend_post_status);
//     console.log('request userId',userId);
//     // console.log('request Id',_id);
//     var postStatus = req.body.friend_post_status;
//     if (req.session.passport) {
//         if(postStatus == 1){
//             RuleOfPost.update({'user_id' : userId},
//             {$set: {
//                         friend_post_status: '0',
//                     }
//             }, function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json({ status: 2, msg: "Post Status Change 1 Successfully", data: result });
//             });
//         } else if(postStatus == 0){
//             RuleOfPost.update({'user_id' : userId},
//             {$set: { 
//                         friend_post_status: '1',
//                 }
//             }, function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json({ status: 2, msg: "Post Status Change 0 Successfully", data: result });
//             });
//         }
//     } else {
//         res.json({ status: 2, msg: "User Not Logged In" });
//     }
// });

// ctrl.post('/checkFollowersPostStatus', function (req, res) {
//     var userId = req.session.passport.user;
//     // var _id = req.body._id;
//     console.log('request bodyyyyyyyyyyyyyyyy',req.body.followers_post_status);
//     console.log('request userId',userId);
//     // console.log('request Id',_id);
//     var followersPost = req.body.followers_post_status;
//     if (req.session.passport) {
//         if(followersPost == 1){
//             RuleOfPost.update({'user_id' : userId},
//             {$set: {
//                         followers_post_status: '0',
//                     }
//             }, function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json({ status: 2, msg: "Followers Status Change 1 Successfully", data: result });
//             });
//         } else if(followersPost == 0){
//             RuleOfPost.update({'user_id' : userId},
//             {$set: { 
//                         followers_post_status: '1',
//                 }
//             }, function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json({ status: 2, msg: "Followers Status Change 0 Successfully", data: result });
//             });
//         }
//     } else {
//         res.json({ status: 2, msg: "User Not Logged In" });
//     }
// });
// ctrl.post('/checkFollowersSharedPostStatus', function (req, res) {
//     var userId = req.session.passport.user;
//     // var _id = req.body._id;
//     console.log('request bodyyyyyyyyyyyyyyyy',req.body.followers_shared_post_status);
//     console.log('request userId',userId);
//     // console.log('request Id',_id);
//     var followersSharedPost = req.body.followers_shared_post_status;
//     if (req.session.passport) {
//         if(followersSharedPost == 1){
//             RuleOfPost.update({'user_id' : userId},
//             {$set: {
//                         followers_shared_post_status: '0',
//                     }
//             }, function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json({ status: 2, msg: "Followers Status Change 1 Successfully", data: result });
//             });
//         } else if(followersSharedPost == 0){
//             RuleOfPost.update({'user_id' : userId},
//             {$set: { 
//                         followers_shared_post_status: '1',
//                 }
//             }, function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json({ status: 2, msg: "Followers Status Change 0 Successfully", data: result });
//             });
//         }
//     } else {
//         res.json({ status: 2, msg: "User Not Logged In" });
//     }
// });

// ctrl.post('/checkSharedPostStatus', function (req, res) {
//     var userId = req.session.passport.user;
//     // var _id = req.body._id;
//     console.log('request bodyyyyyyyyyyyyyyyy',req.body.shared_post_status);
//     console.log('request userId',userId);
//     // console.log('request Id',_id);
//     var sharedPost = req.body.shared_post_status;
//     if (req.session.passport) {
//         if(sharedPost == 1){
//             RuleOfPost.update({'user_id' : userId},
//             {$set: {
//                         shared_post_status: '0',
//                     }
//             }, function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json({ status: 2, msg: "Shared Status Change 1 Successfully", data: result });
//             });
//         } else if(sharedPost == 0){
//             RuleOfPost.update({'user_id' : userId},
//             {$set: {
//                         shared_post_status: '1',
//                 }
//             }, function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.json({ status: 2, msg: "Shared Status Change 0 Successfully", data: result });
//             });
//         }
//     } else {
//         res.json({ status: 2, msg: "User Not Logged In" });
//     }
// });

//get api for post by ID
// ctrl.get('/getData', function (req, res) {
//     if (req.session.passport) {
//         var userId = req.session.passport.user;
//         console.log('Logged user detailllllll userId',userId);
//         RuleOfPost.find({'user_id': userId})
//                 .select('_id friend_post_status followers_post_status shared_post_status followers_shared_post_status user_id')
//                 .exec(function (err,result) {
//                     if (err)
//                         throw err;
//                         // return res.json(post);
//                     res.json({status: 2, data: result});
//                 });
//     } else {
//         res.json({status: 1, msg: "User Not Logged In"});
//     }
// });
ctrl.get('/getData', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        RuleOfPost.find({ 'user_id': userId })
            .select('_id post_status  user_id')
            .exec(function (err, result) {
                if (err)
                    throw err;
                res.json({ status: 2, data: result });
            });
    } else {
        res.json({ status: 1, msg: "User Not Logged In" });
    }
});
ctrl.get('/', function (req, res) {
    RuleOfPost.find({})
        .exec(function (err, result) {
            if (err)
                throw err;
            res.json({ status: 2, data: result });
        });
});
ctrl.get('/dlelete/:id', function (req, res) {
    var id = req.params.id;
    RuleOfPost.remove({ '_id': id })
        .exec(function (err, result) {
            if (err)
                throw err;
            res.json({ status: 2, data: result });
        });
});