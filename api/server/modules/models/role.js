var autoIncrement = require('mongoose-auto-increment');
var db=require('./db');
var name='Role';
autoIncrement.initialize(db);

var Schema = db.Schema;
var schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    members:[
        {
            user_id:Number,
            roles:[{role_id:Number}],
            added_on:Date,
            added_by:Number,
            removed_on:Date
        }
    ],
    status:{type:Number, required:true, default:1},
    created_on: Date,
    updated_on: Date,
    created_by:{type: Number, required:true, default: 1}
});

schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;    
    if (!this.created_on) {
        this.members.push({
            user_id:this.created_by,
            roles:[0],
            added_on:new Date(),
            added_by:this.created_by,
            });
        this.created_on = cDate;
    }    
    next();
});

schema.plugin(autoIncrement.plugin,name);
var Project = db.model(name, schema);
module.exports = Project;