var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Journal';


var schema = db.Schema({
    title: {type: String},
    icon:String,
    created_on: {type: Date},
    user_id: {type:Number, ref: 'User'},
    posts: [{post_id: {type:Number, ref:'Post'}, description: {type:String}, created_on: {type: Date, default: new Date()}}],
});
//Pre save preperation
schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});

//Create the model for users
schema.plugin(autoIncrement.plugin, {model:name,startAt:1});
module.exports = db.model(name, schema);