var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Category';


var schema = db.Schema({
    title: {type: String},
    created_on: {type: Date},    
    status: {type:Number , Default: 1} //1=>Active 2=>Inactive
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