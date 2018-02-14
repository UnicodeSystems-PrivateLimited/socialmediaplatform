var autoIncrement = require('mongoose-auto-increment');
var db=require('./db');
var name='Task';
autoIncrement.initialize(db);

var Schema = db.Schema;
var schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: String,
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
var Task = db.model(name, schema);
module.exports = Task;