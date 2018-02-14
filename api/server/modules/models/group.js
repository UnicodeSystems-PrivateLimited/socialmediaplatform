var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Group';

var schema = db.Schema({
    _id: { type: Number, required: true },
    title: { type: String },
    description: { type: String },
    icon: { type: String },
    privacy: { type: Number, default: 1 },//1=>public , 2=>private
    subject_id: { type: String, ref: 'Subject' },
    college_id: { type: String, ref: 'College' },
    degree_id: { type: String, ref: 'Degree' },
    members: [{ user_id: { type: Number, ref: 'User' }, last_visit: { type: Date, default: new Date() } }],
    post: [{ post_id: { type: Number, ref: 'Post' }, post_date: Date, created_by: { type: Number, ref: 'User' } }],
    created_on: { type: Date },
    created_by: { type: Number, ref: 'User' }
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