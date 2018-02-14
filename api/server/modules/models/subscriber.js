var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
autoIncrement.initialize(db);
var name = 'Subscriber';
/* 
 * satus 
 *    2 approve
 *    1 unApprove
 */
var schema = db.Schema({
    name:String,
    email:String,
    status:{type:Number,default:1}
});

schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});


schema.plugin(autoIncrement.plugin, {startAt:1,model:name});
module.exports = db.model(name, schema);