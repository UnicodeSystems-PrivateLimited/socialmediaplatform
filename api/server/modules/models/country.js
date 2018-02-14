var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Country';

var schema = db.Schema({
	name:{ type:String, required:true },
	iso2:{ type:String, required:true },
	iso3:{ type:String, required:true }
});
//Pre save preperation
schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});

//Create the model for users
schema.plugin(autoIncrement.plugin, name);
module.exports = db.model(name, schema);