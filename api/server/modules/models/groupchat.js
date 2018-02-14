var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Groupchat';

var schema = db.Schema({
    _id:{ type:Number, required:true },
    title:String,
    icon:String,
    created_on: {type: Date},
    created_by:{type:Number , ref : 'User'},
    members:[{user_id:{type:Number , ref : 'User'}}]    
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