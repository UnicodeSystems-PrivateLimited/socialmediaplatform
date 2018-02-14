var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Subject';

/*
 * Member Status{
 *      1=>Current
 *      2=>Past
 *       * }
 *      
 *      subjects_user_type-
 *      
 * 1     Currently Taking
   2     Will Take in Future
   3     Subject Expert
   4     Teacher of Subject
   5     Just Interested
   6     Past Student

 * 
 */

var schema = db.Schema({
	_id:{ type:Number, required:true },
	name:{ type:String, required:true, unique: true},
	icon:String,
        members:[{user_id:{type:Number , ref: 'User'},from:Date,to:Date,subjects_user_type:Number,status:{type:Number, Default: 1} }],
	//current_members:[{user_id:{type:Number , ref: 'User'},from:Date,to:Date}],
	//past_members:[{user_id:{type:Number , ref: 'User'},from:Date,to:Date}],
        post:[{post_id:{type:Number , ref : 'Post'}, post_date : Date, created_by:{type:Number , ref: 'User'}}],
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