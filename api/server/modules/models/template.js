var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
autoIncrement.initialize(db);
var name = 'Template';

var schema = db.Schema({
    type:{type: Number, default: 1},
    sender:[{sender_id:{type:Number , ref: 'User'}}],
    name:String,
    subject:String,
    ceated_on:{ type: Date},
    updated_on:{ type: Date, default: Date.now},
    schedule:[{date:Date,category:String}]
});

schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});

schema.plugin(autoIncrement.plugin, {startAt:1,model:name});
module.exports = db.model(name, schema);