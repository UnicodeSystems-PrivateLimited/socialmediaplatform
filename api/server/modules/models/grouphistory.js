var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Grouphistory';

/*
 * Member Status{
 *      1=>Current
 *      2=>Past
 * }
 * 
 */

var schema = db.Schema({
	_id:{ type:Number, required:true },
	to:{ type:Number, required:true, ref:'User' },
	from:{ type:Number, required:true,ref:'User' },
        group_id:{ type:Number, required:true, ref:'Group'},
        cdate:{type: Date},
        body:{type:String},
        is_viewed:{type: Number, default: 0} //0=>pending, 1=>viewed
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
