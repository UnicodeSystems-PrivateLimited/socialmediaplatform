var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Skill';

var schema = db.Schema({
    _id:{ type:Number, required:true },
    title:{ type:String, required:true }        
});
//Pre save preperation
schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});

//Create the model for users
schema.plugin(autoIncrement.plugin, {startAt:1,model:name});
module.exports = db.model(name, schema);