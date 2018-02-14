var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var name = 'Event';
autoIncrement.initialize(db);
/*
 * type{
 *      1=>Post
 *      2=>friend
 *      6=>scd joined
 * }
 * 
 */
var Schema = db.Schema;
var schema = new Schema({
    title: { type: String },
    type: { type: Number },
    timestamp: Date,
    created_by: { type: Number, ref: 'User' },
    post_type: { type: Number },
    post_id: { type: Number, ref: 'Post' },
    friend_id: { type: Number, ref: 'User' },
    // subject_id: { type: Number, ref: 'Subject' },
    // college_id: { type: Number, ref: 'College' },
    // degree_id: { type: Number, ref: 'Degree' },
    is_viewed: { type: Number, Default: 0 }
});


//Pre save preperation
schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});


schema.plugin(autoIncrement.plugin, { model: name, startAt: 1 });
var Event = db.model(name, schema);
module.exports = Event;