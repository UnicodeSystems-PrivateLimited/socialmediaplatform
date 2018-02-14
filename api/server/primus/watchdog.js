var clientMgr = require("./client_manager");
var path = require('path');
clientMgr._();
module.exports = function (primus, app) {
    // use the same session middleware for primus
    var cookies = app.get('cookies');
    var session = app.get('session');    
    primus.before('cookies', cookies);
    primus.before('session', session);
    
    /***************Connection logic************ */
    app.set('wsClient',clientMgr);
    primus.on('connection', function (spark) {
        console.log("New CLient Connected");
        clientMgr.handleClient(spark);        
//        clientMgr.loadBuddies(spark);        
    });
    
    // Primus client library generation DONT DELETE
    // primus.save(path.resolve(__dirname,'../../','client/app/public/primus/primus.js'), function save(err) {
    //     if (err)
    //         throw err;
    //     console.log("Library generated and saved to path:" + __dirname + '/public/primus/primus.js');
    // });
}