var autoIncrement = require('mongoose-auto-increment');
var db=require('./db');
var name='Project';
autoIncrement.initialize(db);

var Schema = db.Schema;
var schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    members:[
        {
            user_id:Number,
            roles:[Number],
            added_on:Date,
            added_by:Number,
            can_remove:{type:Boolean, required:true, default:true},
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
            user_id: this.created_by,
            roles:[1],
            added_on:cDate,
            added_by:this.created_by,
            can_remove:false
        });
        this.created_on = cDate;
    }    
    next();
});

schema.plugin(autoIncrement.plugin,name);
var Project = db.model(name, schema);
module.exports = Project;