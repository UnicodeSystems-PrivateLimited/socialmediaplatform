var ctrl = require('express').Router();
module.exports = ctrl;
var fs = require('fs');
var path = require('path');
var mailer = require('../../mailer/models');

var Template = require('../models/template');
var moment = require('moment-timezone');
moment().tz("America/Los_Angeles").format();

ctrl.post('/add', function (req, res) {
    var template = new Template(req.body);
    var content = req.body.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    template.ceated_on = new Date();
    template.save(function (err, template) {
        if (err)
            throw err;
        var uploadpath = path.resolve(__dirname, "../../../templates/view/template_" + template._id + "/");
        fs.mkdir(uploadpath, function (e) {
            if (!e || (e && e.code === 'EEXIST')) {
                var filename = "html.ejs";
                fs.writeFile(uploadpath + '/' + filename, req.body.content, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    return res.json({ status: 2, data: template });
                });
            }
        });

    });
});
ctrl.get('/getTemplate', function (req, res) {
    //    Template.findOne({name: 'default_template'}, function (err, template) {
    //        if (err)
    //            throw err;
    //        if (template)
    //        {
    var uploadpath = path.resolve(__dirname, "../../../templates/view/default_template" + "/");
    var filename = "html.ejs";
    fs.readFile(uploadpath + '/' + filename, function (err, content) {
        if (err) {
            return console.log(err);
        }
        return res.json(content.toString());
    });
    //        }
    //    });
});
ctrl.post('/getTemplateDataToEdit', function (req, res) {
    // Template.find({_id: {$in:[1,2,3,4,5,6,7,8,9]}}).remove().exec(function(err, data) {});
    Template.findOne({ _id: req.body.id }, function (err, template) {
        if (err)
            throw err;
        if (template) {
            var uploadpath = path.resolve(__dirname, "../../../templates/view/template_" + template._id + "/");
            var filename = "html.ejs";
            fs.readFile(uploadpath + '/' + filename, function (err, content) {
                if (err) {
                    return console.log(err);
                }
                return res.json({ status: 2, data: { id: template._id, content: content.toString(), name: template.name, subject: template.subject } });
            });
        }
    });
});
ctrl.post('/editTemplate', function (req, res) {
    var updated_on = new Date();
    var content = req.body.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    Template.findByIdAndUpdate(req.body.id, { $set: { name: req.body.name, subject: req.body.subject, updated_on: updated_on } }, function (err, updated) {
        if (err)
            throw err;
        Template.findOne({ _id: updated._id }, function (err, template) {
            if (err)
                throw err;
            var uploadpath = path.resolve(__dirname, "../../../templates/view/template_" + template._id + "/");
            fs.mkdir(uploadpath, function (e) {
                if (!e || (e && e.code === 'EEXIST')) {
                    var filename = "html.ejs";
                    fs.writeFile(uploadpath + '/' + filename, req.body.content, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        return res.json({ status: 2, data: template });
                    });
                }
            });
        });
    });
});
ctrl.get('/remove/:id', function (req, res) {
    if (req.session.passport) {
        var tmp_id = req.params.id;
        var uploadpath = path.resolve(__dirname, "../../../templates/view/template_" + tmp_id + "/");
        fs.unlink(uploadpath + "html.ejs", function () {
            fs.rmdir(uploadpath, function (err) {
                Template.find({ _id: tmp_id }).remove(function (err, template) {
                    if (err)
                        throw err;
                    return res.json({ status: 2, data: template });
                });
            });
        });
    }
});
ctrl.get('/sender/:id', function (req, res) {
    if (req.session.passport) {
        var userId = req.session.passport.user;
        Template.findByIdAndUpdate({ _id: req.params.id }, { $push: { sender: { sender_id: userId } } }, function (err, template) {
            if (err)
                throw err;
            return res.json({ status: 2, message: 'sent' });
        });
    } else
        return res.json({ status: 0, message: 'Not logged In!' });
});

ctrl.post('/createSchedule/:id', function (req, res) {
    var d = new Date(req.body.date);
    var d2 = new Date(req.body.date);
    console.log("d");
    console.log(d);
    d2.setHours(d.getHours() - 10);
    d2.setMinutes(d.getMinutes() - 30);
    //
    //
    console.log("d2");
    console.log(d2);
    //    var template = {date: new Date(req.body.date)};
    var template = { date: d2 };
    Template.findByIdAndUpdate({ _id: req.params.id }, { $push: { schedule: template } }, function (err, template) {
        if (err)
            throw err;
        return res.json({ status: 2, template: template });
    });
});

ctrl.get('/list/:id', function (req, res) {
    if (req.params.id && req.params.id > -1) {
        Template.findById(req.params.id, function (err, template) {
            if (err)
                throw err;
            return res.json({ status: 2, template: template });
        });
    }
});
ctrl.get('/', function (req, res) {
    Template.find({}, function (err, template) {
        if (err)
            throw err;
        return res.json({ status: 2, data: template });
    });
});
ctrl.get('/getTamplates/:limit', function (req, res) {
    var skip = req.params.limit * 20;
    Template.find({ type: { $ne: 2 } })
        .skip(skip)
        .limit(20)
        .populate({ path: 'sender.sender_id', select: 'fname' })
        .exec(function (err, subscriber) {
            if (err)
                throw err;
            return res.json({ status: 2, data: subscriber });
        });
});
ctrl.get('/getOtherTamplates/:limit', function (req, res) {
    var skip = req.params.limit * 20;
    Template.find({ type: 2 })
        .skip(skip)
        .limit(20)
        .populate({ path: 'sender.sender_id', select: 'fname' })
        .exec(function (err, subscriber) {
            if (err)
                throw err;
            return res.json({ status: 2, data: subscriber });
        });
});
ctrl.post('/addOtherTemplate', function (req, res) {
    var template = new Template(req.body);
    template.ceated_on = new Date();
    template.type = 2;
    template.save(function (err, template) {
        if (err)
            throw err;
        return res.json({ status: 2, data: template });
    });
});
ctrl.post('/getOtherTemplateDataToEdit', function (req, res) {
    // Template.find({_id: {$in:[1,2,3,4,5,6,7,8,9]}}).remove().exec(function(err, data) {});
    Template.findOne({ _id: req.body.id }, function (err, template) {
        if (err)
            throw err;
        if (template) {
            var uploadpath = path.resolve(__dirname, "../../../templates/view/" + template.name + "/");
            var filename = "html.ejs";
            fs.readFile(uploadpath + '/' + filename, function (err, content) {
                if (err) {
                    return console.log(err);
                }
                return res.json({ status: 2, data: { id: template._id, content: content.toString(), name: template.name, subject: template.subject } });
            });
        }
    });
});
ctrl.post('/editOtherTemplate', function (req, res) {
    var updated_on = new Date();
    var content = req.body.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    Template.findByIdAndUpdate(req.body.id, { $set: { name: req.body.name, subject: req.body.subject, updated_on: updated_on } }, function (err, updated) {
        if (err)
            throw err;
        Template.findOne({ _id: updated._id }, function (err, template) {
            if (err)
                throw err;
            var uploadpath = path.resolve(__dirname, "../../../templates/view/" + template.name + "/");
            fs.mkdir(uploadpath, function (e) {
                if (!e || (e && e.code === 'EEXIST')) {
                    var filename = "html.ejs";
                    fs.writeFile(uploadpath + '/' + filename, req.body.content, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        return res.json({ status: 2, data: template });
                    });
                }
            });
        });
    });
});
ctrl.get('/sendMailToSubscribers', function (req, res) {
    var emails = [];
    var scheduledTime;
    var self = this;
    subscribers(function (emails) {
        self.emails = emails.data;
        getScheduledTimeSlot(function (scheduledTime) {
            self.scheduledTime = scheduledTime.data;
            var currentTime = new Date();
            var d2 = new Date(currentTime);
            var scheduledTimeSlot;
            var templateName;
            var locals;
            var fullUrl = "http://dev.stribein.com";
            for (var i in self.scheduledTime) {
                scheduledTimeSlot = new Date(self.scheduledTime[i].date);
                var d1 = new Date(scheduledTimeSlot);
                d1.setHours(scheduledTimeSlot.getHours() + 10);
                d1.setMinutes(scheduledTimeSlot.getMinutes() + 30);
                if (d1.getTime() >= d2.getTime() && d1.getTime() <= d2.getTime() + 86400000) {
                    templateName = "template_" + self.scheduledTime[i].id;
                    for (var j = 0; j < self.emails.length; j++) {
                        locals = {
                            email: self.emails[j],
                            from:'notifications@stribein.com',
                            subject: self.scheduledTime[i].subject,
                            name: self.scheduledTime[i].name,
                            logo: fullUrl + '/public/files/logo/StribeIN-logo.png',
                            unsubscribe_url: fullUrl + '/userUnSubscribe/' + self.emails[j],
                            siteLink: fullUrl,
                            link: fullUrl,
                        };
                        mailer.sendOne(templateName, locals, function (err, responseStatus, html, text) {
                            console.log("++++++++++=" + html);
                        });
                    }
                }
            }
            return res.json({ status: 2, msg: "Mail sent" });
        });
    })
});
function subscribers(callback) {
    var Subscriber = require('../models/subscriber');
    Subscriber.find({ status: 2 }, function (err, subscriber) {
        if (err)
            throw err;
        var emails = [];
        for (var i in subscriber) {
            emails.push(subscriber[i].email);
        }
        //        emails = emails.join(',');
        callback({ data: emails });
    });
}
function getScheduledTimeSlot(callback) {
    var scheduleData = [];
    Template.find({ type: { $ne: 2 } })
        .select()
        .exec(function (err, template) {
            if (err)
                throw err;
            for (var i in template) {
                for (var j in template[i].schedule) {
                    if (template[i].schedule[j].date) {
                        scheduleData.push({ id: template[i]._id, name: template[i].name, subject: template[i].subject, date: template[i].schedule[j].date });
                    }
                }
            }
            callback({ data: scheduleData });

        });
}

ctrl.get('/getSchedules/:limit', function (req, res) {
    var skip = req.params.limit * 1;
    var scheduleData = [];
    Template.find({ type: { $ne: 2 } })
        .skip(skip)
        .limit(1)
        .populate({ path: 'sender.sender_id', select: 'fname' })
        .exec(function (err, template) {
            if (err)
                throw err;
            for (var i in template) {
                var senders = '';
                for (var k in template[i].sender) {
                    if (template[i].sender[k].sender_id) {
                        if (k > 0 && k < template[i].sender[k].length - 1)
                            senders += ',';
                        senders += template[i].sender[k].sender_id.fname;
                    }
                }
                for (var j in template[i].schedule) {
                    if (template[i].schedule[j].date) {
                        scheduleData.push({ id: template[i]._id, name: template[i].name, subject: template[i].subject, date: template[i].schedule[j].date, category: template[i].schedule[j].category, sender: senders });
                    }
                }
            }
            res.json({ status: 2, data: scheduleData });

        });
});

ctrl.get('/deleteSchedule', function (req, res) {
    Template.update({}, { $pull: { schedule: {} } }, { multi: true }, function (err, template) {
        if (err)
            throw err;
        data = { message: 'All Schedule Deleted!' };
        return res.json(data);
    });
});


ctrl.get('/setDefaultTemplate', function (req, res) {
    tempData = [{ "_id": 1, "name": "activation_email", "subject": "Welcome to StribeIN!", "type": 2 },
    { "_id": 2, "name": "account_activate", "subject": "Just one more step to get started with StribeIN", "type": 2 },
    { "_id": 3, "name": "change_password_email", "subject": "Somebody requested a new password for your StribeIN Account", "type": 2 }
    ];
    Template.create(tempData, function (err, tempData) {
        if (err) throw err;
        res.json(tempData);
    });
});



