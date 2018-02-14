var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Userskills';

var schema = db.Schema({
    _id:{ type:Number, required:true },
    skill_id:{type:Number , ref : 'Skill'},
    user_id:{type:Number , ref : 'User'},
    endorse:[{user_id:{type:Number , ref : 'User'}}]    
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