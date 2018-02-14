import { Component, ElementRef, OnInit, OnChanges, AfterViewChecked, Input, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { ChatGlobalService } from '../../providers/chat-global-service';
declare var Primus: any;

@Component({
    selector: "auto-boot",
    templateUrl: 'auto-boot.html'
})

export class AutoBoatComponent {


    constructor(private page: PageService, private dataService: DataService, private chatGlobalService: ChatGlobalService) {
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++=");
    }

    ngOnChanges() {
        if (this.chatGlobalService.cBuddy) {
            if (typeof (this.chatGlobalService.chatGroupData) != "undefined" && this.chatGlobalService.chatGroupData != null) { this.chatGlobalService.getDefaultGroupChatById(this.chatGlobalService.chatGroupData._id); }
            if (this.chatGlobalService.defaultHistory[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].messages) {
                for (var i = 0; i < this.chatGlobalService.defaultHistory[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].messages.length; i++) {
                    if (this.chatGlobalService.defaultHistory[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].messages[i].from._id == this.chatGlobalService.profile.id) {
                        this.chatGlobalService.defaultHistory[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].messages[i].from.photo = this.chatGlobalService.profilePic;
                    }
                }
            }
            if (this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id]) {
                for (var i = 0; i < this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].length; i++) {
                    if (this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id]) {
                        if (this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id][i].from == this.chatGlobalService.profile.id) {
                            this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id][i].avatar = this.chatGlobalService.profilePic;
                        }
                    }
                }

            }
        }
    }

    ngOnInit() {
        this.chatGlobalService.getUserGroups();
        this.chatGlobalService.userIdGlobal = this.page.userIdGlobal;
        setTimeout(() => {
            var self = this;
            this.chatGlobalService.client = new Primus(this.chatGlobalService.conUrl);
            this.chatGlobalService.client.on('data', function (data) {
                if (data.data) {
                    switch (data.data.type) {
                        case self.chatGlobalService.dataType.PHOTO_NAME_CHANGE:
                            self.chatGlobalService.getUserGroups1();
                            if (data.from) {
                                for (var i = 0; i < self.chatGlobalService.friends.length; i++) {
                                    if (self.chatGlobalService.friends[i].id == data.from) {
                                        if (data.data.field == 'photo') {
                                            self.chatGlobalService.friends[i].user.photo = data.data.value ? data.data.value + "?t=" + new Date().getTime() : '';
                                            if (self.chatGlobalService.cBuddy && self.chatGlobalService.cBuddy.user._id == data.from) {
                                                self.chatGlobalService.cBuddy = self.chatGlobalService.friends[i];
                                            }
                                            if (self.chatGlobalService.cBuddy.id && self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id] && self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].messages) {
                                                for (var k = 0; k < self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].messages.length; k++) {
                                                    if (self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].messages[k].from._id == data.from) {
                                                        self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].messages[k].from.photo = data.data.value ? data.data.value + "?t=" + new Date().getTime() : '';
                                                    }
                                                }
                                            }
                                            if (self.chatGlobalService.cBuddy.id && self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id] && self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].length) {
                                                for (var J = 0; J < self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].length; J++) {
                                                    if (self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id][J].from == data.from) {
                                                        self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id][J].avatar = data.data.value ? data.data.value + "?t=" + new Date().getTime() : '';
                                                    }
                                                }
                                            }
                                        }
                                        else if (data.data.field == 'name') {
                                            self.chatGlobalService.friends[i].user.fname = data.data.value;
                                            self.chatGlobalService.friends[i].user.lname = data.data.lname;
                                        }
                                        break;
                                    }
                                }
                            }
                            break;
                        case self.chatGlobalService.dataType.CURRENT_FRIEND_STATUS:
                            self.chatGlobalService.getUserGroups1();
                            for (var i = 0; i < self.chatGlobalService.friends.length; i++) {
                                if (self.chatGlobalService.friends[i].id == data.from) {
                                    if (self.chatGlobalService.cBuddy && self.chatGlobalService.cBuddy.user._id == data.from) {
                                        if (self.chatGlobalService.friends.length > 1) {
                                            if (i == 0) {
                                                self.chatGlobalService.cBuddy = self.chatGlobalService.friends[1];
                                                if (!self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].messages) {
                                                    self.chatGlobalService.getCurrentBuddy(self.chatGlobalService.cBuddy, 1)
                                                }
                                            }
                                            else {
                                                self.chatGlobalService.cBuddy = self.chatGlobalService.friends[0];
                                            }
                                        }
                                        else {
                                            self.chatGlobalService.cBuddy = {};
                                            self.chatGlobalService.defaultHistory = {};
                                            self.chatGlobalService.friendObjs = {};
                                            self.chatGlobalService.textBoxes.inBoxes = {};
                                            self.chatGlobalService.textBoxes.outBoxes = {};
                                        }
                                    }
                                    if (self.chatGlobalService.friends.length > 1) {
                                        self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + data.from].messages = [];
                                        self.chatGlobalService.friendObjs[self.chatGlobalService.clientPref + data.from] = [];
                                        self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.clientPref + data.from] = {};
                                        self.chatGlobalService.textBoxes.outBoxes[self.chatGlobalService.clientPref + data.from] = {};
                                    }
                                    self.chatGlobalService.friends.splice(i, 1);
                                    break;
                                }
                            }
                            break;
                        case self.chatGlobalService.dataType.NOTIF:
                            if (data.data.friendNotification) {
                                if (data.data.friendNotification.length > 0) {
                                    if (self.chatGlobalService.notifType.NORMAL_NOTI == data.data.notifType) {
                                        self.page.friendRequestnotificationData = data.data.friendNotification;
                                    } else {
                                        self.page.friendRequestnotificationData.unshift(data.data.friendNotification[0]);
                                    }
                                }
                            }
                            if (data.data.notification) {
                                if (data.data.notification.post_type == 0) {
                                    if (self.chatGlobalService.notifType.NORMAL_NOTI == data.data.notifType) {
                                        self.page.friendRequestnotificationData = data.data.notification;
                                    } else {
                                        self.page.friendRequestnotificationData.unshift(data.data.notification[0]);
                                    }
                                }
                                else {
                                    self.chatGlobalService.getUserGroups1();
                                    if (data.data.notification.length > 0) {
                                        if (self.chatGlobalService.notifType.NORMAL_NOTI == data.data.notifType) {
                                            self.page.notificationData = data.data.notification;
                                        } else {
                                            self.page.notificationData.unshift(data.data.notification[0]);
                                        }
                                    }
                                }
                            }
                            break;
                        case self.chatGlobalService.dataType.INFO:
                            if (data.data.channels != undefined) {
                                self.chatGlobalService.channels = data.data.channels;
                                for (var i = 0; i < self.chatGlobalService.channels.length; i++) {
                                    self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.channelPref + self.chatGlobalService.channels[i]._id] = [];
                                    self.chatGlobalService.textBoxes.outBoxes[self.chatGlobalService.channelPref + self.chatGlobalService.channels[i]._id] = { text: "" };
                                    if (i == 0) {
                                        self.chatGlobalService.selChannel = self.chatGlobalService.channels[i];
                                    }
                                }
                            }

                            if (data.data.profile != undefined) {
                                self.chatGlobalService.profile = data.data.profile;
                                self.getAppNotifications();
                            }

                            if (data.data.friends != undefined) {
                                self.chatGlobalService.friends = data.data.friends;

                                for (var i = 0; i < self.chatGlobalService.friends.length; i++) {
                                    self.chatGlobalService.friends[i]['mCounter'] = 0;
                                    self.page.totPendUserMsg = 0;
                                    self.chatGlobalService.friendObjs[self.chatGlobalService.clientPref + self.chatGlobalService.friends[i].id] = self.chatGlobalService.friends[i];
                                    self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.clientPref + self.chatGlobalService.friends[i].id] = [];
                                    self.chatGlobalService.textBoxes.outBoxes[self.chatGlobalService.clientPref + self.chatGlobalService.friends[i].id] = { text: "" };
                                    self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.friends[i].id] = { messages: [] };
                                    self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.friends[i].id] = { loaded: false };
                                    if (i == 0) {
                                        self.chatGlobalService.cBuddy = self.chatGlobalService.friends[i];
                                        self.chatGlobalService.getDefaultChatById(self.chatGlobalService.cBuddy.id);
                                        if (self.chatGlobalService.chatGroupData) {
                                            self.chatGlobalService.getDefaultGroupChatById(self.chatGlobalService.chatGroupData._id);
                                        }
                                        self.chatGlobalService.postChangePendingMessageStatus(self.chatGlobalService.cBuddy.id);
                                    }
                                }
                            }

                            if (data.data.history != undefined) {
                                if (self.chatGlobalService.cBuddy) {
                                    self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].messages = data.data.history;
                                    self.chatGlobalService.defaultHistory[self.chatGlobalService.clientPref + self.chatGlobalService.cBuddy.id].loaded = true;
                                }
                            }

                            if (data.data.grphistory != undefined) {

                                self.chatGlobalService.groupchatdefaulthistory = data.data.grphistory;
                                for (var i = 0; i < self.chatGlobalService.groupchatdefaulthistory.length; i++) {
                                    if (self.chatGlobalService.groupchatdefaulthistory[i].from._id == self.chatGlobalService.profile.id) {
                                        if (typeof (self.chatGlobalService.groupchatdefaulthistory[i].from.photo) != "undefined" && self.chatGlobalService.groupchatdefaulthistory[i].from.photo != null && self.chatGlobalService.groupchatdefaulthistory[i].from.photo != '') {
                                            self.chatGlobalService.groupchatdefaulthistory[i].from.photo = self.chatGlobalService.profilePic;
                                        }
                                        else {
                                            self.chatGlobalService.groupchatdefaulthistory[i].from.photo = '';
                                        }
                                    }
                                    else {
                                        if (typeof (self.chatGlobalService.groupchatdefaulthistory[i].from.photo) != 'undefined' && self.chatGlobalService.groupchatdefaulthistory[i].from.photo != null && self.chatGlobalService.groupchatdefaulthistory[i].from.photo != '')
                                            self.chatGlobalService.groupchatdefaulthistory[i].from.photo = self.chatGlobalService.groupchatdefaulthistory[i].from.photo + "?t=" + new Date().getTime();
                                        else
                                            self.chatGlobalService.groupchatdefaulthistory[i].from.photo = '';

                                    }
                                    self.chatGlobalService.groupchathistory = [];
                                }
                            }
                            break;

                        case self.chatGlobalService.dataType.GROUPTEXT:
                            console.log("data.data.groupchatData", data.data.groupchatData);
                            if (data.data.groupchatData) {
                                for (var i = 0; i < data.data.groupchatData.length; i++) {
                                    console.log("self.chatGlobalService.chatGroupData._id", self.chatGlobalService.chatGroupData._id);
                                    if (data.data.groupchatData[i].groupId == self.chatGlobalService.chatGroupData._id) {
                                        self.chatGlobalService.groupchathistory.push(data.data.groupchatData[0]);
                                    } else {
                                        if (self.chatGlobalService.groups.length > 0) {
                                            console.log("data.data.groupchatData[i]", data.data.groupchatData[i]);
                                            for (var k = 0; k < self.chatGlobalService.groups.length; k++) {
                                                console.log("self.chatGlobalService.groups[k]", self.chatGlobalService.groups[k]);
                                                if (data.data.groupchatData[i].groupId == self.chatGlobalService.groups[k]._id) {
                                                    if (self.chatGlobalService.groups[k].mCounter == 0) {
                                                        ++self.chatGlobalService.groups[k].mCounter
                                                        ++self.page.totPendGroupUserMsg;
                                                    }
                                                    else {
                                                        ++self.chatGlobalService.groups[k].mCounter;
                                                    }
                                                }
                                            }
                                        }

                                        if (self.chatGlobalService.otherGroup.length > 0) {
                                            for (var l = 0; l < self.chatGlobalService.otherGroup.length; l++) {
                                                console.log("self.chatGlobalService.otherGroup[l]", self.chatGlobalService.otherGroup[l]);
                                                if (data.data.groupchatData[i].groupId == self.chatGlobalService.otherGroup[l]._id) {
                                                    if (self.chatGlobalService.otherGroup[l].mCounter == 0) {
                                                        ++self.chatGlobalService.otherGroup[l].mCounter;
                                                        ++self.page.totPendGroupUserMsg;
                                                    } else {
                                                        ++self.chatGlobalService.otherGroup[l].mCounter;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            break;


                        case self.chatGlobalService.dataType.TEXT:
                            data.self = (data.from == self.chatGlobalService.profile.id);
                            console.log("data", data);
                            console.log("data.self ", data.self);
                            if (!data.self) {
                                if (data.avatar)
                                    data.avatar = data.avatar + "?t=" + new Date().getTime();
                                else
                                    data.avatar = '';
                                self.chatGlobalService.textBoxes.inBoxes[self.chatGlobalService.clientPref + data.from].push(data);
                                console.log("self.chatGlobalService.cBuddy.id", self.chatGlobalService.cBuddy.id);
                                if (data.from != self.chatGlobalService.cBuddy.id) {
                                    self.chatGlobalService.friendObjs[self.chatGlobalService.clientPref + data.from].mCounter++;
                                }
                                self.page.totPendUserMsg = 0;
                                for (var i = 0; i < self.chatGlobalService.friends.length; i++) {
                                    console.log("self.chatGlobalService.friends", self.chatGlobalService.friends[i]);
                                    if (self.chatGlobalService.friends[i]['mCounter'] > 0) {
                                        self.page.totPendUserMsg++;
                                    }
                                }
                            }
                            break;

                        case self.chatGlobalService.dataType.STATUS:
                            if (self.chatGlobalService.friendObjs[self.chatGlobalService.clientPref + data.from])
                                self.chatGlobalService.friendObjs[self.chatGlobalService.clientPref + data.from].status = data.data.status;
                            break;
                    }
                } else {
                    console.log("Invalid chat packet:" + JSON.stringify(data));
                }
            });
        }, 500);
        // this.chatGlobalService.userStatus.logout = function () {
        //     if (self.chatGlobalService.profile && self.chatGlobalService.profile.id) {
        //         var msg = {
        //             close: self.chatGlobalService.profile.id,
        //         };
        //         self.chatGlobalService.client.write(msg);
        //     }
        // };
    }


    getAppNotifications() {
        var msg = {
            from: this.chatGlobalService.profile.id,
            data: {
                type: this.chatGlobalService.dataType.ACT,
                action: this.chatGlobalService.actType.NOTIF
            }
        };
        this.chatGlobalService.client.write(msg);
    }



}

