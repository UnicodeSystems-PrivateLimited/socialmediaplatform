module.exports = {
    clientPref: "cl_",
    channelPref: "ch_",
    buddyList: [],
    buddyObjs: {},
    friendLists: {},
    channels: [],
    cSpark: null,
    userId: null,
    channelObjs: {},
    dataType: {
        TEXT: 1,
        STATUS: 2,
        TODO: 3,
        TASK: 4,
        FILE: 5,
        RING: 6,
        ALERT: 7,
        CALL_A: 8,
        CALL_V: 9,
        CALL_SCR: 10,
        INFO: 11,
        NOTIF: 12,
        ACT: 13,
        GROUPTEXT: 14,
        CURRENT_FRIEND_STATUS: 15,
        PHOTO_NAME_CHANGE: 16,
    },
    notifType: {
        PUSH_NOTI: 1,
        NORMAL_NOTI: 2
    },
    actType: {
        HST: 1,
        CHSTATUS: 2,
        NOTIF: 3,
        GRPHST: 4,
        FRNDADD: 5,
        FRNDREMOVE: 6
    },
    statusType: {
        OFFLINE: 0,
        ONLINE: 1,
        AWAY: 2,
        DND: 3,
    },
    viewType: {
        IS_VIEWED: 1,
        IS_NOT_VIEWED: 0
    },
    post_type: {
        SENDREQ: 0,
        NOTIFY: 1,
        GROUPCHATNOTIFY: 5
    },
    _: function () {
        var self = this;
        this.loadBuddies();
        //        this.getChannels(false, function (err, channels) {
        //            console.log("All Channels:" + JSON.stringify(channels));
        //            self.channels = channels;
        //            for (var i = 0; i < channels.length; i++) {
        //                var participants = [];
        //                var mems = channels[i].members;
        //                for (var j = 0; j < mems.length; j++) {
        //                    participants.push(mems[j].user_id);
        //                }
        //                self.channelObjs[self.channelPref + channels[i]._id] = {
        //                    channelId: channels[i]._id,
        //                    participants: participants,
        //                    name: channels[i].name,
        //                    info: channels[i]
        //                };
        //            }
        //        });
    },
    getChannels: function (userId, callback) {
        //        var Project = require('../modules/models/project');
        //        if (userId) {
        //            Project.getAssignedProjects(userId, callback);
        //        } else {
        //            Project.find({}, callback);
        //        }
    },
    loadBuddies: function () {
        var self = this;
        console.log("loadBuddeis");
        var User = require('../modules/models/user');
        //        var msghistory = require('../modules/models/msghistory');
        //        var userId = this.getUserId(spark);
        //        console.log('userId');
        //        console.log(userId);

        User.find({}, function (err, users) {
            if (err)
                throw err;
            //            console.log("users");
            //            console.log(users[0]);
            for (var i = 0; i < users.length; i++) {

                //                msghistory.find({
                //                    $or: [
                //                        {$and: [{to: userId}, {from: users[i]._id},{is_viewed: 0}]},                
                //                    ]})
                //                .select('_id is_viewed')
                //                .exec(function (err, totalPending) {
                //                    console.log("totalPending");
                //                    console.log(totalPending.length);
                //                    
                //                });
                var buddy = { id: users[i]._id, status: self.statusType.OFFLINE, user: users[i], spark: null };
                self.buddyList.push(buddy);
                self.buddyObjs[self.clientPref + buddy.id] = buddy;
                console.log("buddy.length" + buddy.length);


            }
            //            console.log("this.buddyList");
            //            console.log(self.buddyList);
        });
    },
    addBuddyToList: function (user) {
        var buddy = { id: user._id, status: this.statusType.OFFLINE, user: user, spark: null };
        this.buddyList.push(buddy);
        this.buddyObjs[this.clientPref + buddy.id] = buddy;
    },
    getFriendList: function (userId, callback) {
        var self = this;
        var User = require('../modules/models/user');
        var current_friends = [];
        User.find({ '_id': userId })
            .populate({ path: 'friends.friend_id', select: 'fname lname photo _id' })
            .exec(function (err, users) {
                if (err)
                    throw err;
                data = users[0];
                var friends = [];
                for (var attributename in data.friends) {
                    if (data.friends[attributename].friend_id != null) {
                        if (data.friends[attributename].status === 3) {
                            var friend = {
                                name: data.friends[attributename].friend_id.fname + ' ' + data.friends[attributename].friend_id.lname,
                                id: data.friends[attributename].friend_id._id,
                                photo: data.friends[attributename].friend_id.photo
                            }
                            friends.push(self.buddyObjs[self.clientPref + friend.id]);
                        }
                    }
                }
                callback(friends);
            });
    },
    getClients: function () {
        return this.buddyList;
    },
    handleClient: function (spark) {
        var userId = this.getUserId(spark);
        if (userId !== false) {
            //Add client to online list
            var client = {
                userId: userId,
                spark: spark,
            };
            //            this.addClient(client);
            //            this.buddyObjs[this.clientPref + userId] = client;
            this.buddyObjs[this.clientPref + userId].status = this.statusType.ONLINE;

            this.buddyObjs[this.clientPref + userId].spark = spark;
            this.startListening(spark);
            //Send available channels for particular client
            var self = this;
            this.getChannels(userId, function (err, channels) {
                if (err)
                    throw err;
                spark.write({
                    from: 'server',
                    data: {
                        type: self.dataType.INFO,
                        channels: channels,
                        userId: userId
                    }
                });
            });
            this.getFriendList(userId, function (friends) {
                self.friendLists[self.clientPref + userId] = friends;
                self.multicastStatus(userId);
                var msghistory = require('../modules/models/msghistory');


                //friend list calculation
                console.log("userId");
                console.log(userId);
                console.log(self.clientPref);
                console.log("self.buddyObjs[self.clientPref + userId]");
                console.log(self.buddyObjs[self.clientPref + userId]);
                spark.write({
                    from: 'server',
                    data: {
                        type: self.dataType.INFO,
                        friends: friends,
                        profile: self.buddyObjs[self.clientPref + userId],
                    }
                });
            });
        } else {
            console.log("::::User not logged in yet!");
        }
    },
    multicastStatus: function (userId) {
        //        console.log("this.friendLists[this.clientPref + userId]");
        //        console.log(JSON.stringify(this.friendLists[this.clientPref + userId]));
        var friends = this.friendLists[this.clientPref + userId];
        var msg = {
            from: userId,
            date: new Date(),
            data: {
                type: this.dataType.STATUS,
                status: this.buddyObjs[this.clientPref + userId].status
            }
        };
        for (var i = 0; i < friends.length; i++) {
            var friend = friends[i];
            if (friend.status == this.statusType.ONLINE) {
                msg.to = friend.id;
                friend.spark.write(msg);
            }
        }
    },
    addClient: function (client) {
        //        console.log("client");
        //        console.log(client);
        this.buddyList.push(client);
        //        console.log("this.clientList");
        //        console.log(this.buddyList);
        var self = this;
        //        client.spark.on("end", function () {
        //            console.log("Client disconnected:" + JSON.stringify(self.buddyList));
        ////            console.log("self.clientList");
        ////            console.log(self.buddyList);
        //        });
    },
    removeClient: function (client) {
        //        console.log("Index:" + this.buddyList.indexOf(client));
        this.buddyList.push(client);
    },
    startListening: function (spark) {
        var self = this;
        userId = self.getUserId(spark);
        spark.on('data', function (data) {
            //            spark.write(msg);
            if (userId !== false) {
                if (data.channelId) {
                    data.from = userId;
                    var clients = self.getParticipants(data.channelId);
                    if (clients) {
                        self.sendGroupMessage(clients, data);
                    } else {
                        console.log("No participants found!");
                    }
                }
                console.log("Message from:" + data.from);

                if (data.data && data.data.type == self.dataType.ACT && data.data.action == self.actType.CHSTATUS) {
                    console.log("data.friend_status_id");
                    console.log(data.friend_status_id);
                    var client = self.buddyObjs[self.clientPref + data.data.participant];
                    if (client) {
                        console.log("myClient");
                        self.postChangePendingMessageStatus([client], data);
                    } else {
                        console.log("No participants found!");
                    }
                }
                if (data.data && data.data.type == self.dataType.ACT && data.data.action == self.actType.HST) {
                    var client = self.buddyObjs[self.clientPref + data.from];
                    if (client) {
                        console.log("myClient");
                        self.getDefaultChatById([client], data);
                    } else {
                        console.log("No participants found!");
                    }
                }
                if (data.data && data.data.type == self.dataType.ACT && data.data.action == self.actType.GRPHST) {
                    console.log("data.data.groupId");
                    console.log(data.data.groupId);
                    var client = self.buddyObjs[self.clientPref + data.from];
                    if (data.data.groupId != '') {
                        self.getDefaultGroupChatById([client], data);
                    } else {
                        console.log("No group found!");
                    }
                }

                if (data.data && data.data.type == self.dataType.ACT && data.data.action == self.actType.NOTIF) {
                    var client = self.buddyObjs[self.clientPref + data.from];
                    if (client) {
                        self.getNotificationsId([client], data);
                        self.getFriendNotificationsId([client], data);
                    } else {
                        console.log("No participants found!");
                    }
                }

                if (data.to) {
                    var client = self.buddyObjs[self.clientPref + data.to];
                    if (client) {
                        self.sendMessage([client], data);
                    } else {
                        console.log("No participants found!");
                    }
                }


                if (data.close) {
                    var uid = self.getUserId(spark);
                    console.log("$$$$$$$$$$$$$$$$$$$Client disconnected$$$$$$$$$$$$$$$$$$$$$$$$:" + userId + "|UserID:" + uid);
                    self.buddyObjs[self.clientPref + uid].status = self.statusType.OFFLINE;
                    self.multicastStatus(uid);
                }

                //                if(data.userId)
                //                {
                //                    console.log("data.userId");
                //                    console.log(data.userId);
                //                    var client = self.buddyObjs[self.clientPref + data.userId];
                //                    if (client) {
                //                        self.sendNotification([client], data);
                //                    } else {
                //                        console.log("No participants found!");
                //                    }
                //                }
            }
        });
        spark.on("end", function (e) {
            var uid = self.getUserId(spark);
            console.log("$$$$$$$$$$$$$$$$$$$Client disconnected$$$$$$$$$$$$$$$$$$$$$$$$:" + userId + "|UserID:" + uid + "|E:" + e);
            self.buddyObjs[self.clientPref + uid].status = self.statusType.OFFLINE;
            self.multicastStatus(uid);
            //            console.log("self.clientList");
            //            console.log(self.buddyList);
        });
        //        self.sendNotification([self.userId], "You connected!:" + self.userId);
    },
    changeFriendStatus: function (data) {
        for (var i = 0, j = data.recepients.length - 1; i < data.recepients.length; i++ , j--) {
            var client = this.buddyObjs[this.clientPref + data.recepients[i]];
            if (client.status === this.statusType.ONLINE) {
                var message;
                // {
                //     from: data.recepients[j],
                //     data: {
                //         type: this.dataType.CURRENT_FRIEND_STATUS,
                //     }
                // };
                if (data.action == 'add') {
                    var friend = this.buddyObjs[this.clientPref + data.recepients[j]];
                    message = {
                        from: data.recepients[j],
                        data: {
                            type: this.dataType.CURRENT_FRIEND_STATUS,
                            action: this.actType.FRNDADD,
                            friend: friend
                        }
                    }
                } else if (data.action == 'remove') {
                    message = {
                        from: data.recepients[j],
                        data: {
                            type: this.dataType.CURRENT_FRIEND_STATUS,
                            action: this.actType.FRNDREMOVE
                        }
                    };
                }
                client.spark.write(message);
            }
        }
    },
    changeNameOrPhoto: function (data) {
        if (data.from && this.buddyObjs[this.clientPref + data.from]) {
            if (data.field == 'photo')
                this.buddyObjs[this.clientPref + data.from].user.photo = data.value;
            else if (data.field == 'name')
                this.buddyObjs[this.clientPref + data.from].user.fname = data.value;
            this.buddyObjs[this.clientPref + data.from].user.lname = data.lname ? data.lname : '';
        }
        this.buddyObjs[this.clientPref + data.from];
        for (var i = 0; i < data.recepients.length; i++) {
            var client = this.buddyObjs[this.clientPref + data.recepients[i]];
            if (client.status === this.statusType.ONLINE) {
                var message = {
                    from: data.from,
                    data: {
                        field: data.field,
                        value: data.value,
                        lname: data.lname,
                        type: this.dataType.PHOTO_NAME_CHANGE,
                    }
                };
                client.spark.write(message);

            }
        }
    },
    sendGroupMessage: function (participants, data) {
        for (var i = 0; i < participants.length; i++) {
            var client = this.buddyObjs[this.clientPref + participants[i]];
            if (client) {
                console.log("Found Participant:" + client.userId);
                switch (data.data.type) {
                    case this.dataType.TEXT:
                        //                        var msg = {
                        //                            from: data.from,
                        //                            channelId: data.channelId,
                        //                            data: data.data
                        //                        }
                        client.spark.write(data);
                        break;
                }
            }
        }
    },
    sendMessage: function (recepients, message) {

        console.log("recepients[0]");
        console.log(recepients[0]);
        for (var i = 0; i < recepients.length; i++) {
            console.log("Message sending to:" + recepients[i].id + ":MSG:" + JSON.stringify(message));
            var Msghistory = require('../modules/models/msghistory');
            var msghistory = new Msghistory();
            if (recepients[i].status == this.statusType.ONLINE) {
                recepients[i].spark.write(message);
                msghistory.is_viewed = this.viewType.IS_VIEWED;
            } else if (recepients[i].status == this.statusType.OFFLINE) {
                msghistory.is_viewed = this.viewType.IS_NOT_VIEWED;
            }
            msghistory.to = message.to;
            msghistory.from = message.from;
            msghistory.body = message.data.body;
            msghistory.date = message.date;
            msghistory.save(function (err, history) {
                console.log("pending history");
                console.log(history);
            });
        }
    },
    getDefaultChatById: function (recepients, message) {
        console.log("recepients");
        console.log(recepients);
        var self = this;
        var msghistory = require('../modules/models/msghistory');
        if (message.data.participant && message.data.participant != null) {
            for (var i = 0; i < recepients.length; i++) {
                var client = recepients[i];
                msghistory.find({
                    $or: [
                        { $and: [{ to: message.data.participant }, { from: client.id }] },
                        { $and: [{ from: message.data.participant }, { to: client.id }] }
                    ]
                })
                    .select('_id to from date cdate body is_viewed')
                    .populate({ path: 'to from', select: 'fname lname photo _id' })
                    .exec(function (err, history) {
                        if (err)
                            throw err;
                        console.log("message.data.participant of:" + client.id);
                        console.log(message.data.participant + JSON.stringify(history));
                        client.spark.write({
                            from: client.id,
                            data: {
                                type: self.dataType.INFO,
                                history: history,
                                friend_id: message.data.participant
                            }
                        });

                    });
            }


        }
    },
    getDefaultGroupChatById: function (recepients, message) {
        console.log("recepients");
        console.log(recepients);
        var self = this;
        var grouphistory = require('../modules/models/grouphistory');
        if (message.data.groupId && message.data.groupId != null) {
            for (var i = 0; i < recepients.length; i++) {
                var client = recepients[i];
                grouphistory.update(
                    { 'group_id': message.data.groupId, 'to': message.from },
                    {
                        "$set": {
                            "is_viewed": 1
                        }
                    },
                    {
                        multi: true
                    },
                    function (err, pendingStatus) {
                        if (err)
                            throw err;


                        grouphistory.find({ 'group_id': message.data.groupId, 'to': message.from, is_viewed: 1 })
                            .populate({ path: 'from', select: 'fname lname photo _id' })
                            .exec(function (err, grphistory) {
                                if (err)
                                    throw err;
                                console.log("message.data.participant of:" + client.id);
                                console.log(message.data.from + JSON.stringify(grphistory));
                                client.spark.write({
                                    from: client.id,
                                    data: {
                                        type: self.dataType.INFO,
                                        grphistory: grphistory,
                                    }
                                });

                            });
                        //                    res.json({data: pendingStatus});
                    });
            }


        }
    },
    getNotificationsId: function (recepients, message) {
        var self = this;
        var Notification = require('../modules/models/notification');
        Notification.find({ 'userId': message.from, is_viewed: this.viewType.IS_NOT_VIEWED, post_type: { $ne: this.post_type.SENDREQ } })
            .select('_id title userId from date is_viewed post_type groupId eventId blogId subject_id college_id degree_id post_id')
            .populate({ path: 'userId from groupId subject_id college_id degree_id', select: 'fname lname photo title name' })
            .populate({
                path: 'post_id',
                model: 'Post',
                select: '_id types name post_type message'
            })
            .sort({ date: -1 })
            .exec(function (err, events) {
                if (err)
                    throw err;
                for (var i = 0; i < recepients.length; i++) {
                    var client = recepients[i];
                    //                        var client = this.buddyObjs[this.clientPref + recepients[i].id];
                    if (client.status == self.statusType.ONLINE) {
                        var message = {
                            from: 'app',
                            data: {
                                type: self.dataType.NOTIF,
                                notification: events,
                                notifType: self.notifType.NORMAL_NOTI
                            }
                        };
                        client.spark.write(message);
                    }
                }
            });
    },
    getFriendNotificationsId: function (recepients, message) {
        var self = this;
        var Notification = require('../modules/models/notification');
        Notification.find({ 'userId': message.from, is_viewed: this.viewType.IS_NOT_VIEWED, post_type: this.post_type.SENDREQ })
            .select('_id title userId from date is_viewed post_type')
            .populate({ path: 'userId from', select: 'fname lname photo', modal: 'User' })
            .sort({ date: -1 })
            .exec(function (err, events) {
                if (err)
                    throw err;
                for (var i = 0; i < recepients.length; i++) {
                    var client = recepients[i];
                    //                        var client = this.buddyObjs[this.clientPref + recepients[i].id];
                    if (client.status == self.statusType.ONLINE) {
                        var message = {
                            from: 'app',
                            data: {
                                type: self.dataType.NOTIF,
                                friendNotification: events,
                                notifType: self.notifType.NORMAL_NOTI
                            }
                        };
                        client.spark.write(message);
                    }
                }
            });
    },
    postChangePendingMessageStatus: function (recepients, message) {
        console.log("recepien");
        console.log(recepients);

        console.log("message.data.participant");
        console.log(message.data.participant);
        var self = this;
        var msghistory = require('../modules/models/msghistory');
        if (message.friend_status_id && message.friend_status_id != null) {
            for (var i = 0; i < recepients.length; i++) {
                var client = recepients[i];
                msghistory.update(
                    {
                        $or: [
                            { $and: [{ to: client.id }, { from: message.data.participant }] },
                            //                        {$and: [{from: to}, {to: from}]},
                        ]
                    },
                    {
                        "$set": {
                            "is_viewed": 1
                        }
                    },
                    {
                        multi: true
                    },
                    function (err, pendingStatus) {
                        if (err)
                            throw err;
                        console.log("pendingStatus");
                        console.log(pendingStatus);
                        client.spark.write({
                            from: 'server',
                            data: {
                                type: self.dataType.INFO,
                                pendingStatus: pendingStatus
                            }
                        });
                        //                    res.json({data: pendingStatus});
                    });
            }


            //                                    });
            //         }    


        }
    },
    sendNotification: function (recepient, notifications) {
        var self = this;
        var Notification = require('../modules/models/notification');
        for (var i = 0; i < recepient.length; i++) {
            var notification = new Notification();
            notification.title = notifications.title;
            notification.date = notifications.date;
            notification.userId = recepient[i];
            notification.from = notifications.from;
            notification.post_type = notifications.post_type;
            notification.is_viewed = this.viewType.IS_NOT_VIEWED;
            notification.save(function (err, notify) {
                if (notify._id) {
                    var client = self.buddyObjs[self.clientPref + notify.userId];
                    if (client.status == self.statusType.ONLINE) {
                        if (notifications.post_type == 0) {
                            var message = {
                                from: 'app',
                                data: {
                                    type: self.dataType.NOTIF,
                                    notification: notifications,
                                    notifType: self.notifType.PUSH_NOTI
                                }
                            };
                            client.spark.write(message);
                        } else {
                            notifications.notifId = notify._id;
                            var message = {
                                from: 'app',
                                data: {
                                    type: self.dataType.NOTIF,
                                    notification: [notifications],
                                    notifType: self.notifType.PUSH_NOTI
                                }
                            };
                            client.spark.write(message);
                        }
                    }
                }

            });
            this.getFriendList(notifications.from, function (friends) {
                client = self.buddyObjs[self.clientPref + notifications.from];
                self.friendLists[self.clientPref + notifications.from] = friends;
                self.multicastStatus(notifications.from);

                //friend list calculation
                console.log("notifications.from");
                console.log(notifications.from);
                console.log(self.buddyObjs[self.clientPref + notifications.from]);
                if (client.status == self.statusType.ONLINE) {
                    client.spark.write({
                        from: 'server',
                        data: {
                            type: self.dataType.INFO,
                            friends: friends,
                            // profile: self.buddyObjs[self.clientPref + notifications.from],
                        }
                    });
                }
            });
            this.getFriendList(notifications.userId, function (friends) {
                client = self.buddyObjs[self.clientPref + notifications.userId];
                self.friendLists[self.clientPref + notifications.userId] = friends;
                self.multicastStatus(notifications.userId);
                if (client.status == self.statusType.ONLINE) {
                    client.spark.write({
                        from: 'server',
                        data: {
                            type: self.dataType.INFO,
                            friends: friends,
                            // profile: self.buddyObjs[self.clientPref + notifications.userId],
                        }
                    });
                }
            });


        }
    },
    refreshFriend: function (userId, friendId) {
        var self = this;
        this.getFriendList(friendId, function (friends) {
            client = self.buddyObjs[self.clientPref + friendId];
            self.friendLists[self.clientPref + friendId] = friends;
            self.multicastStatus(friendId);

            //friend list calculation
            console.log("friendId");
            console.log(friendId);
            console.log(self.buddyObjs[self.clientPref + friendId]);
            if (client.status == self.statusType.ONLINE) {
                client.spark.write({
                    from: 'server',
                    data: {
                        type: self.dataType.INFO,
                        friends: friends,
                        //                        profile: self.buddyObjs[self.clientPref + notifications.from],
                    }
                });
            }
        });
        this.getFriendList(userId, function (friends) {
            client = self.buddyObjs[self.clientPref + userId];
            self.friendLists[self.clientPref + userId] = friends;
            self.multicastStatus(userId);

            //friend list calculation
            console.log("userId");
            console.log(userId);
            console.log(self.clientPref);
            console.log("self.buddyObjs[self.clientPref + userId]");
            console.log(self.buddyObjs[self.clientPref + userId]);
            if (client.status == self.statusType.ONLINE) {
                client.spark.write({
                    from: 'server',
                    data: {
                        type: self.dataType.INFO,
                        friends: friends,
                        //                        profile: self.buddyObjs[self.clientPref + notifications.userId],
                    }
                });
            }
        });
    },
    sendGroupNotification: function (recepient, notifications) {
        var self = this;
        var Notifications = require('../modules/models/notification');
        for (var i = 0; i < recepient.length; i++) {
            var notification = new Notifications();
            notification.title = notifications.title;
            notification.date = notifications.date;
            notification.from = notifications.from;
            notification.post_type = notifications.post_type;
            notification.is_viewed = this.viewType.IS_NOT_VIEWED;
            if (notifications.groupId != 0)
                notification.groupId = notifications.groupId;
            if (notifications.eventId != 0)
                notification.eventId = notifications.eventId;
            notification.userId = recepient[i];
            var client = this.buddyObjs[this.clientPref + recepient[i]];
            if (notifications.post_type !== '') {
                notification.save(function (err, notify) {
                    if (err)
                        throw err;
                    if (client.status == self.statusType.ONLINE) {
                        if (notify._id) {
                            notifications.notifId = notify._id;
                            Notifications.findOne({ '_id': notify._id })
                                .select('_id title userId from date is_viewed post_type groupId eventId blogId post_id')
                                .populate({ path: 'userId from groupId', select: 'fname lname photo title' })
                                .populate({
                                    path: 'post_id',
                                    model: 'Post',
                                    select: '_id types name post_type message'
                                })
                                .exec(function (err, events) {
                                    if (err)
                                        throw err;
                                    var message = {
                                        from: 'app',
                                        data: {
                                            type: self.dataType.NOTIF,
                                            notification: [events],
                                            notifType: self.notifType.PUSH_NOTI
                                        }
                                    };
                                    client.spark.write(message);
                                });
                        }
                    }
                });
            }
        }
    },
    sendSCDNotification: function (recepient, notifications) {
        var self = this;
        var Notifications = require('../modules/models/notification');
        for (var i = 0; i < recepient.length; i++) {
            var notification = new Notifications();
            notification.title = notifications.title;
            notification.date = notifications.date;
            notification.from = notifications.from;
            notification.post_type = notifications.post_type;
            notification.is_viewed = this.viewType.IS_NOT_VIEWED;
            if (notifications.scd_type == 1)
                notification.subject_id = notifications.scd_id;
            if (notifications.scd_type == 2)
                notification.college_id = notifications.scd_id;
            if (notifications.scd_type == 3)
                notification.degree_id = notifications.scd_id;
            notification.userId = recepient[i];
            var client = this.buddyObjs[this.clientPref + recepient[i]];
            if (notifications.post_type !== '') {
                notification.save(function (err, notify) {
                    if (err)
                        throw err;
                    if (client.status == self.statusType.ONLINE) {
                        if (notify._id) {
                            notifications.notifId = notify._id;
                            Notifications.findOne({ '_id': notify._id })
                                .select('_id title userId from date is_viewed post_type subject_id college_id degree_id post_id')
                                .populate({ path: 'userId from subject_id college_id degree_id', select: 'fname lname photo name' })
                                .populate({
                                    path: 'post_id',
                                    model: 'Post',
                                    select: '_id types name post_type message'
                                })
                                .exec(function (err, events) {
                                    if (err)
                                        throw err;
                                    var message = {
                                        from: 'app',
                                        data: {
                                            type: self.dataType.NOTIF,
                                            notification: [events],
                                            notifType: self.notifType.PUSH_NOTI
                                        }
                                    };
                                    client.spark.write(message);
                                });
                        }
                    }
                });
            }
        }
    },
    sendCommentNotification: function (recepient, notifications) {
        var self = this;
        var Notifications = require('../modules/models/notification');
        for (var i = 0; i < recepient.length; i++) {
            var notification = new Notifications();
            notification.title = notifications.title;
            notification.date = notifications.date;
            notification.from = notifications.from;
            notification.post_type = notifications.post_type;
            notification.is_viewed = this.viewType.IS_NOT_VIEWED;
            notification.post_id = notifications.post_id;
            notification.userId = recepient[i];
            var client = this.buddyObjs[this.clientPref + recepient[i]];
            if (notifications.post_type !== '') {
                notification.save(function (err, notify) {
                    if (err)
                        throw err;
                    if (client.status == self.statusType.ONLINE) {
                        if (notify._id) {
                            notifications.notifId = notify._id;
                            Notifications.findOne({ '_id': notify._id })
                                .select('_id title userId from date is_viewed post_type subject_id college_id degree_id post_id')
                                .populate({ path: 'userId from subject_id college_id degree_id', select: 'fname lname photo name' })
                                .populate({
                                    path: 'post_id',
                                    model: 'Post',
                                    select: '_id types name post_type message'
                                })
                                .exec(function (err, events) {
                                    if (err)
                                        throw err;
                                    var message = {
                                        from: 'app',
                                        data: {
                                            type: self.dataType.NOTIF,
                                            notification: [events],
                                            notifType: self.notifType.PUSH_NOTI
                                        }
                                    };
                                    client.spark.write(message);
                                });
                        }
                    }
                });
            }
        }
    },
    sendGroupChatNotification: function (recepient, notifications) {
        var self = this;
        console.log("in sendGroupChatNotification");
        var Notifications = require('../modules/models/notification');
        var notification = new Notifications();
        console.log("notifications");
        console.log(notifications);
        console.log("recepient");
        console.log(recepient);
        notification.title = notifications.title;
        notification.date = notifications.date;
        //        notification.usersId = notifications.usersId;
        notification.from = notifications.from;
        notification.post_type = notifications.post_type;
        notification.is_viewed = this.viewType.IS_NOT_VIEWED;
        if (notifications.groupId != 0)
            notification.groupId = notifications.groupId;
        if (notifications.eventId != 0)
            notification.eventId = notifications.eventId;
        console.log("notification");
        console.log(notification);
        console.log("recepient");
        console.log(recepient);
        notification.userId = recepient;
        console.log("notification");
        console.log(notification);
        recepient = [recepient];
        console.log("recepient");
        console.log(recepient);
        console.log('++++++++++++++++----------------groupId' + notifications.groupId);
        console.log('++++++++++++++++----------------eventId' + notifications.eventId);
        for (var i = 0; i < recepient.length; i++) {
            console.log("i am in");
            var client = this.buddyObjs[this.clientPref + recepient[i]];
            console.log("client.status");
            console.log(client.status);
            //            console.log("notification.userId");
            //            console.log(notification.userId);
            if (client.status == this.statusType.ONLINE) {
                if (notifications.post_type !== '') {


                    notification.save(function (err, notify) {
                        console.log("notification online");
                        console.log(notify);
                        if (notify._id) {
                            notifications.notifId = notify._id;
                            console.log("notifications.notifId");
                            console.log(notifications.notifId);
                            var message = {
                                from: 'app',
                                data: {
                                    type: self.dataType.NOTIF,
                                    notification: [notifications],
                                    notifType: self.notifType.PUSH_NOTI
                                }
                            };
                            client.spark.write(message);
                        }

                    });
                }

            } else if (client.status == this.statusType.OFFLINE) {
                notification.save(function (err, notify) {
                    console.log("notification offline");
                    console.log(notify);
                });


            }


        }
    },
    sendCommentDeleteNotification: function (recepient, notifications) {
        var self = this;
        console.log("in sendCommentDeleteNotification");
        var Notifications = require('../modules/models/notification');
        var notification = new Notifications();
        console.log("notifications");
        console.log(notifications);
        console.log("recepient");
        console.log(recepient);
        notification.title = notifications.title;
        notification.blogId = notifications.blogId;
        notification.date = notifications.date;
        notification.from = notifications.from;
        notification.post_type = notifications.post_type;
        notification.is_viewed = this.viewType.IS_NOT_VIEWED;
        console.log("notification");
        console.log(notification);
        console.log("recepient");
        console.log(recepient);
        notification.userId = recepient;
        console.log("notification");
        console.log(notification);
        //        for (var i = 0; i < recepient.length; i++) {
        console.log("i am in");
        var client = this.buddyObjs[this.clientPref + recepient];
        console.log("client.status");
        console.log(client.status);
        //            console.log("notification.userId");
        //            console.log(notification.userId);
        if (client.status == this.statusType.ONLINE) {
            if (notifications.post_type !== '') {


                notification.save(function (err, notify) {
                    console.log("notification online");
                    console.log(notify);
                    if (notify._id) {
                        notifications.notifId = notify._id;
                        console.log("notifications.notifId");
                        console.log(notifications.notifId);
                        var message = {
                            from: 'app',
                            data: {
                                type: self.dataType.NOTIF,
                                notification: [notifications],
                                notifType: self.notifType.PUSH_NOTI
                            }
                        };
                        client.spark.write(message);
                    }

                });
            }

        } else if (client.status == this.statusType.OFFLINE) {
            notification.save(function (err, notify) {
                console.log("notification offline");
                console.log(notify);
            });


        }
    },
    sendGroupChat: function (recepient, notifications) {
        var self = this;
        console.log("in sendGroupNotification");
        var Grouphistory = require('../modules/models/grouphistory');
        var grouphistory = new Grouphistory();
        console.log("notifications");
        console.log(notifications);
        console.log("recepient");
        console.log(recepient);
        grouphistory.body = notifications.body;
        grouphistory.cdate = notifications.date;
        //        notification.usersId = notifications.usersId;
        grouphistory.from = notifications.from;
        //        notification.post_type = notifications.post_type;
        grouphistory.is_viewed = this.viewType.IS_NOT_VIEWED;
        if (notifications.groupId != 0)
            grouphistory.group_id = notifications.groupId;
        //        if (notifications.eventId != 0)
        //            notification.eventId = notifications.eventId;
        //        console.log("grouphistory");
        //        console.log(grouphistory);
        //        console.log("recepient");
        //        console.log(recepient);

        recepient = [recepient];
        //        console.log("recepient");
        //        console.log(recepient);
        console.log('++++++++++++++++----------------groupId' + notifications.groupId);
        //        console.log('++++++++++++++++----------------eventId' + notifications.eventId);
        for (var i = 0; i < recepient.length; i++) {
            console.log("i am in");
            var client = this.buddyObjs[this.clientPref + recepient[i]];
            grouphistory.to = recepient[i];
            console.log("grouphistory");
            console.log(grouphistory);
            console.log("client.status");
            console.log(client.status);
            //            console.log("notification.userId");
            //            console.log(notification.userId);
            if (client.status == this.statusType.ONLINE) {
                //                if (notifications.post_type !== '') {


                grouphistory.save(function (err, grphistory) {
                    console.log("notification online");
                    console.log(grphistory);
                    if (grphistory._id) {
                        notifications.chatId = grphistory._id;
                        console.log("notifications.chatId");
                        console.log(notifications.chatId);
                        console.log("notifications.mCounter");
                        console.log(notifications.mCounter);
                        var message = {
                            from: 'app',
                            data: {
                                type: self.dataType.GROUPTEXT,
                                groupchatData: [notifications]
                            }
                        };
                        client.spark.write(message);
                    }

                });
                //                }

            } else if (client.status == this.statusType.OFFLINE) {
                grouphistory.is_viewed = this.viewType.IS_NOT_VIEWED;
                grouphistory.save(function (err, notify) {
                    console.log("notification offline");
                    console.log(notify);
                });


            }


        }
    },
    getParticipants: function (channelId) {
        return this.channelObjs[this.channelPref + channelId].participants;
    },
    getUserId: function (spark) {
        var req = spark.request;
        //        console.log("req");
        //        console.log(req);
        if (req.session.passport) {
            //            console.log("req.session.passport");
            //            console.log(req.session.passport);
            var userId = req.session.passport.user;
            console.log("New User connected:" + userId);
            return userId;
        }
        return false;
    }
};
