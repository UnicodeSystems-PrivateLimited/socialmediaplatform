var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var name = 'RuleOfPost';
autoIncrement.initialize(db);
/*
 * type{
 *      1=>Post
 *      2=>friend
 * }
 * 
 */
var Schema = db.Schema;
var schema = new Schema({
    user_id:{type:Number, ref: 'User'},
    post_status:{type:Number},
    // friend_post_status:{type:Number},
    // followers_post_status:{type:Number},
    // shared_post_status:{type:Number},
    // followers_shared_post_status:{type:Number}
});


//Pre save preperation
schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});


schema.plugin(autoIncrement.plugin, {model:name,startAt:1});
var RuleOfPost = db.model(name, schema);
module.exports = RuleOfPost;