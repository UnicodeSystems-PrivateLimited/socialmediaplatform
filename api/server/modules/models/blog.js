var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Blog';


var schema = db.Schema({
    title: {type: String},
    body: {type: String},
    category_id: {type:Number, ref: 'Category'},
    created_by: {type: Number, ref: 'User'},
    created_on: {type: Date},
    photo: [{file_name: String, title: String}],
    privacy: Number, //1=>public 2=>private 3=>friends_only
    publish: {type: Number, default: 0},//0=>not publish 1=>publish
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
