var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Notification';

/*
 * Member Status{
 *      1=>Current
 *      2=>Past
 * }
 * 
 */
/*
 *   Viewed Status{
 *      0=>pending, 
 *      1=>viewed
 * }
 * 
 */
/*
 * Post Type{
 *      0=> send request 
 *      1=> group join notification
 *      2=> eventnotification
 *      3=> acceptrequestnotification 
 *      4=> skill notification 
 *      5=> groupchat notification  
 *      6=> comment delete notification  
 *      8=> group member invite notification 
 *      9=> subject member invite notification 
 *      10=> college member invite notification 
 *      11=> degree member invite notification
 *      12=> comment add notification
 * }
 * 
 */


var schema = db.Schema({
    _id: { type: Number, required: true },
    userId: { type: Number, required: true, ref: 'User', default: null },
    title: { type: String },
    from: { type: Number, required: true, ref: 'User' },
    date: { type: Date },
    post_id: { type: Number, ref: 'Post' },
    groupId: { type: Number, ref: 'Group' },
    eventId: { type: Number, ref: 'Groupevents' },
    blogId: { type: Number, ref: 'Blog' },
    subject_id: { type: Number, ref: 'Subject' },
    college_id: { type: Number, ref: 'College' },
    degree_id: { type: Number, ref: 'Degree' },
    is_viewed: { type: Number, default: 0 },
    post_type: { type: Number, default: 1 }
});
//Pre save preperation
schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});

//Create the model for users
schema.plugin(autoIncrement.plugin, { model: name, startAt: 1 });
module.exports = db.model(name, schema);