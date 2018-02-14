var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Blogcomment';


var schema = db.Schema({
    body: {type: String},
    blog_id: {type:Number, ref: 'Blog'},
    comment_by: {type: Number, ref: 'User'},
    comment_on: {type: Date}, 
    parent_id: {type:Number, ref:'Blogcomment'}
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