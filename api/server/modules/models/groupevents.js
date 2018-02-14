var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Groupevents';

var schema = db.Schema({
    _id: { type: Number, required: true },
    title: { type: String },
    tagline: { type: String },
    description: { type: String },
    location: { type: String },
    icon: { type: String },
    event_date_from: { type: Date },
    event_date_to: { type: Date },
    privacy: { type: Number, default: 1 },   //2=>private,1=>public
    created_by: { type: Number, ref: 'User' },
    members: [{user_id:{type:Number , ref : 'User'}}],
    invited_members: [{user_id:{type:Number , ref : 'User'}}],
    posts: [{ type: Number }],
    created_on: { type: Date },
    updated_on: { type: Date },
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