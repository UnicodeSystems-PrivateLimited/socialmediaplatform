var autoIncrement = require('mongoose-auto-increment');
var db=require('./db');
var name='File';
autoIncrement.initialize(db);

var Schema = db.Schema;
var schema = new Schema({
    title: { type: String, required: true},
    description: String,
    file_name: { type:String, required: true},
    category: String,
    created_on: Date,
    updated_on: Date,
    created_by:{type: Number, required:true, default: 1}
});

schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;    
    if (!this.created_on) {
        this.created_on = cDate;
    }    
    next();
});

schema.plugin(autoIncrement.plugin,name);
var File = db.model(name, schema);
module.exports = File;