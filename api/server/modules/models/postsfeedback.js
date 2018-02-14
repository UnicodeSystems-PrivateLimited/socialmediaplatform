var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
autoIncrement.initialize(db);
var name = 'PostsFeedback';
var schema = db.Schema({
    post_id: { type: Number, ref: 'Post' },
    given_by: [{ type: Number, ref: 'User' }],
    messages: [{ type: String }],
    created_on: { type: Date },
    updated_on: { type: Date },
    report_count: { type: Number, default: 1 }
});

//Pre save preperation
schema.pre('save', function(next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});

//Create the model for users
schema.plugin(autoIncrement.plugin, { startAt: 1, model: name });
module.exports = db.model(name, schema);