var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Degree';

/*
 * Member Status{
 *      1=>Current
 *      2=>Past
 * }
 * 
 */

var schema = db.Schema({
	_id:{ type:Number, required:true },
	type:{ type:Number},
	name:{ type:String, required:true, unique: true },
        icon:String,
	members:[{user_id:{type:Number , ref: 'User'},from:Date,to:Date,status:{type:Number, Default: 1} }],
        post:[{post_id:{type:Number , ref : 'Post'}, post_date : Date, created_by:{type:Number , ref: 'User'}}]
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