var db=require('mongoose');
var config=require('./../../etc/dbconfig');
var dbUrl= 'mongodb://' + config.dbHost + ':' + config.dbPort + '/' + config.dbName;

db.connect(dbUrl,config.options);
// db.connect(dbUrl);
module.exports=db;
