var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'College';

/*
 * Member Status{
 *      1=>Current
 *      2=>Past
 * }
 * 
 */

var schema = db.Schema({
	name:{ type:String, required:true, unique: true},
        country_id:{type:Number,ref: 'country'},
	url:String,
	icon:String,
        members:[{user_id:{type:Number , ref: 'User'},from:Date,to:Date,status:{type:Number, Default: 1} }],
	//current_members:[{user_id:{type:Number,ref: 'user'},join_date:Date}],
	//past_members:[{user_id:{type:Number,ref: 'user'},join_date:Date}],
        subjects:[{type:Number,ref: 'subject'}],
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