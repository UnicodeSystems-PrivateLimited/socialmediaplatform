var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var name = 'Todo';
autoIncrement.initialize(db);

var Schema = db.Schema;
var schema = new Schema({
    title: { type: String, required: true },
    note: String,
    assigned_to: Number,
    shared_to: [Number],
    attachments: [String],
    due_date: Date,
    estimate: Number,
    reminder: { type: Number },
    comments: [{ body: String, date: Date, comment_by:Number }],
    status:{type:Number,required:true, default:1},
    project_id:{type:Number},
    re_create: { type: Boolean, required: true, default: false },
    created_on: Date,
    updated_on: Date,
    created_by: { type: Number, required: true, default: 1 }
});

schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    if (!this.created_on) {
        this.created_on = cDate;
    }
    next();
});

schema.plugin(autoIncrement.plugin, name);
var Project = db.model(name, schema);
module.exports = Project;