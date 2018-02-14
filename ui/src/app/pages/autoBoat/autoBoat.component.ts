import {Component, AfterViewChecked, ViewChild, ElementRef, OnInit, Input, OnChanges, SimpleChange} from "@angular/core";
import {NgClass} from '@angular/common';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
import {CalendarPipe} from 'angular2-moment/CalendarPipe';
import {MyFilterPipe, MyGroupFilterPipe, DateTime} from '../../theme/pipes';
import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

declare var Primus: any;
declare var jQuery: any;
declare var require: any;
declare var noty: any;
@Component({
    selector: "auto-boat",
    template: require('./autoBoat.html'),
    inputs: ['userStatus'],
    pipes: [DateFormatPipe, TimeAgoPipe, DateTime, MyFilterPipe, MyGroupFilterPipe, CalendarPipe],
    directives: [NgClass, RouterOutlet, RouterLink, ROUTER_DIRECTIVES, TOOLTIP_DIRECTIVES]
})

export class AutoBoatComponent implements OnInit, OnChanges, AfterViewChecked {

    @Input() profilePic: string;
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    private client;
    private profile;
    public userStatus;
    public channels;
    private clientPref = "cl_";
    private channelPref = "ch_";
    public cBuddy;
    public defaultHistory = {};
    public totalPendingUserMessage;
    public ChangePendingStatus;
    public selChannel;
    public friends;
    public userIdGlobal;
    public friendObjs = {};
    private outText;
    private cInBox;
    public searchtxt;
    public search = { text: '' };
    private textBoxes = { inBoxes: {}, outBoxes: {} };
    // private conUrl = "http://dev.socialsn.ml:5000";
    private conUrl = "http://ssn.local.com:5000";
    // private conUrl = "http://stage.socialsn.tk:4001";
    // private conUrl = "https://stribein.com:5000";
    public _defaultChatHistoryUrl = '/api/msghistory/defaultChat/';
    public _gettotalPendingUserMessageUrl = '/api/msghistory/totalPendingUserMessage';
    public _postChangePendingMessageStatus = '/api/msghistory/postChangePendingMessageStatus/';
    public _postChangePendingGroupMessageStatus = '/api/msghistory/postChangePendingMessageStatus/';
    public _dataUrlGroupAdd = '/api/groupchat/addGroup';
    public _dataUrlDeleteGroup = '/api/groupchat/deletegroup';
    public _dataUrlUserGroup = '/api/groupchat/getGroupsByUserId';
    public _dataUrlUserGroupChat = '/api/groupchat/getGroupHistoryById/';
    public _dataUrlRemoveGroupChatFriend = '/api/groupchat/RemoveGroupChatFriend';
    public photosToUpload;
    public groups = [];
    public imageFile;
    public groupDeleteId;
    public errorGroupMsg = { errorName: '', errorIcon: '' };
    public groupdata = { title: '' };
    public chatGroupData;
    public groupSearchField = { name: '' };
    public _groupSearchUrl = '/api/groupchat/groupSearch';
    public groupId: number;
    public friendId: number;
    public fname: string;
    public groupIdCollection = [];
    public errorAddMember;
    public userSearchField = { name: "" };
    public userSearchList;
    public tmpMemberIds = [];
    public tmpMembers = [];
    private post_type = {
        SENDREQ: 0,
        GROUPNOTIFY: 1,
        GROUPCHATNOTIFY: 5
    };
    public _groupChatMsg = '/api/grouphistory/addGroupChat/';
    public _getGroupChatCounter = '/api/grouphistory/getGroupChatCounter/';
    public groupchattext = { groupchatmsg: '', error: '' };
    public singlechattext = { error: '' };
    public groupchatdefaulthistory = [];
    public groupchathistory = [];
    public addmember = { error: '' }
    public socialPostUrl = '/api/user/postSocialLink';
    public group;
    public _dataUrlGetUserGroup = '/api/groupchat/getUserGroup/';
    public _userSearchUrl = '/api/groupchat/userSearch';
    public _addMemberUrl = '/api/groupchat/addmembers/';
    public _addloginMemberUrl = '/api/groupchat/addloginmembers/';
    public _addGroupMemberNotification = '/api/notification/addGroupNotification';
    public _addGroupChatMemberNotification = '/api/notification/addGroupChatNotification';
    public addGroupMemberTitle = ' added you to group';
    public removeGroupMemberTitle = ' removed you from group';
    public removeGroupTitle = 'Admin deleted chat group';
    public otherGroup = [];
    public _dataUrlOtherUserGroup = '/api/groupchat/getOtherGroupsByUserId/';
    public stateMain: boolean = true;
    public stateSide: boolean = false;
    public stateEditor: boolean = false;

    private dataType = {
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
        PHOTO_NAME_CHANGE: 16
    };
    private notifType = {
        PUSH_NOTI: 1,
        NORMAL_NOTI: 2
    };
    private actType = {
        HST: 1,
        CHSTATUS: 2,
        NOTIF: 3,
        GRPHST: 4
    };
    private searchName = { searchName: '' };
    private statusType = {
        OFFLINE: 0,
        ONLINE: 1,
        AWAY: 2,
        DND: 3,
    };
    ison = true;
    public CUser = 0;
    public singleChatTab: boolean = true;
    public groupChatTab: boolean = false;

    constructor(private elementRef: ElementRef, private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.page.getIsGroupChatNotiStatus().subscribe((res) => {
            if (res) {
                this.changeTab2();
            }
        });
        this.page.getChatUserId().subscribe((res) => {
            if (res) {
                for (let i in this.friends) {
                    if (this.friends[i].id == res) {
                        this.getCurrentBuddy(this.friends[i], i);
                        break;
                    }
                }
            }
        })
    }

    ngOnChanges() {
        if (this.cBuddy) {
            if (typeof (this.chatGroupData) != "undefined" && this.chatGroupData != null)
            { this.getDefaultGroupChatById(this.chatGroupData._id); }
            if (this.defaultHistory[this.clientPref + this.cBuddy.id].messages) {
                for (var i = 0; i < this.defaultHistory[this.clientPref + this.cBuddy.id].messages.length; i++) {
                    if (this.defaultHistory[this.clientPref + this.cBuddy.id].messages[i].from._id == this.profile.id) {
                        this.defaultHistory[this.clientPref + this.cBuddy.id].messages[i].from.photo = this.profilePic;
                    }
                }
            }
            if (this.textBoxes.inBoxes[this.clientPref + this.cBuddy.id]) {
                for (var i = 0; i < this.textBoxes.inBoxes[this.clientPref + this.cBuddy.id].length; i++) {
                    if (this.textBoxes.inBoxes[this.clientPref + this.cBuddy.id]) {
                        if (this.textBoxes.inBoxes[this.clientPref + this.cBuddy.id][i].from == this.profile.id) {
                            this.textBoxes.inBoxes[this.clientPref + this.cBuddy.id][i].avatar = this.profilePic;
                        }
                    }
                }

            }
        }
    }

    ngOnInit() {
        this.getUserGroups();
        this.userIdGlobal = this.page.userIdGlobal;
        var self = this;
        this.client = new Primus(this.conUrl);
        this.client.on('data', function (data) {
            if (data.data) {
                switch (data.data.type) {
                    case self.dataType.PHOTO_NAME_CHANGE:
                        self.getUserGroups1();
                        if (data.from) {
                            for (var i = 0; i < self.friends.length; i++) {
                                if (self.friends[i].id == data.from) {
                                    if (data.data.field == 'photo') {
                                        self.friends[i].user.photo = data.data.value ? data.data.value + "?t=" + new Date().getTime() : '';
                                        if (self.cBuddy && self.cBuddy.user._id == data.from) {
                                            self.cBuddy = self.friends[i];
                                        }
                                        if (self.cBuddy.id && self.defaultHistory[self.clientPref + self.cBuddy.id] && self.defaultHistory[self.clientPref + self.cBuddy.id].messages) {
                                            for (var k = 0; k < self.defaultHistory[self.clientPref + self.cBuddy.id].messages.length; k++) {
                                                if (self.defaultHistory[self.clientPref + self.cBuddy.id].messages[k].from._id == data.from) {
                                                    self.defaultHistory[self.clientPref + self.cBuddy.id].messages[k].from.photo = data.data.value ? data.data.value + "?t=" + new Date().getTime() : '';
                                                }
                                            }
                                        }
                                        if (self.cBuddy.id && self.textBoxes.inBoxes[self.clientPref + self.cBuddy.id] && self.textBoxes.inBoxes[self.clientPref + self.cBuddy.id].length) {
                                            for (var J = 0; J < self.textBoxes.inBoxes[self.clientPref + self.cBuddy.id].length; J++) {
                                                if (self.textBoxes.inBoxes[self.clientPref + self.cBuddy.id][J].from == data.from) {
                                                    self.textBoxes.inBoxes[self.clientPref + self.cBuddy.id][J].avatar = data.data.value ? data.data.value + "?t=" + new Date().getTime() : '';
                                                }
                                            }
                                        }
                                    }
                                    else if (data.data.field == 'name') {
                                        self.friends[i].user.fname = data.data.value;
                                        self.friends[i].user.lname = data.data.lname;
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                    case self.dataType.CURRENT_FRIEND_STATUS:
                        self.getUserGroups1();
                        for (var i = 0; i < self.friends.length; i++) {
                            if (self.friends[i].id == data.from) {
                                if (self.cBuddy && self.cBuddy.user._id == data.from) {
                                    if (self.friends.length > 1) {
                                        if (i == 0) {
                                            self.cBuddy = self.friends[1];
                                            if (!self.defaultHistory[self.clientPref + self.cBuddy.id].messages) {
                                                self.getCurrentBuddy(self.cBuddy, 1)
                                            }
                                        }
                                        else {
                                            self.cBuddy = self.friends[0];
                                        }
                                    }
                                    else {
                                        self.cBuddy = {};
                                        self.defaultHistory = {};
                                        self.friendObjs = {};
                                        self.textBoxes.inBoxes = {};
                                        self.textBoxes.outBoxes = {};
                                    }
                                }
                                if (self.friends.length > 1) {
                                    self.defaultHistory[self.clientPref + data.from].messages = [];
                                    self.friendObjs[self.clientPref + data.from] = [];
                                    self.textBoxes.inBoxes[self.clientPref + data.from] = {};
                                    self.textBoxes.outBoxes[self.clientPref + data.from] = {};
                                }
                                self.friends.splice(i, 1);
                                break;
                            }
                        }
                        break;
                    case self.dataType.NOTIF:
                        if (data.data.friendNotification) {
                            if (data.data.friendNotification.length > 0) {
                                self.page.setFriendNotiArriveStatus(true);
                                if (self.notifType.NORMAL_NOTI == data.data.notifType) {
                                    self.page.friendRequestnotificationData = data.data.friendNotification;
                                } else {
                                    self.page.friendRequestnotificationData.unshift(data.data.friendNotification[0]);
                                }
                            }
                        }
                        if (data.data.notification) {
                            if (data.data.notification.post_type == 0) {
                                self.page.setFriendNotiArriveStatus(true);
                                if (self.notifType.NORMAL_NOTI == data.data.notifType) {
                                    self.page.friendRequestnotificationData = data.data.notification;
                                } else {
                                    self.page.friendRequestnotificationData.unshift(data.data.notification[0]);
                                }
                            }
                            else {
                                self.getUserGroups1();
                                if (data.data.notification.length > 0) {
                                    self.page.setNotiArriveStatus(true);
                                    if (self.notifType.NORMAL_NOTI == data.data.notifType) {
                                        self.page.notificationData = data.data.notification;
                                    } else {
                                        self.page.notificationData.unshift(data.data.notification[0]);
                                    }
                                }
                            }
                        }
                        break;
                    case self.dataType.INFO:
                        if (data.data.channels != undefined) {
                            self.channels = data.data.channels;
                            for (var i = 0; i < self.channels.length; i++) {
                                self.textBoxes.inBoxes[self.channelPref + self.channels[i]._id] = [];
                                self.textBoxes.outBoxes[self.channelPref + self.channels[i]._id] = { text: "" };
                                if (i == 0) {
                                    self.selChannel = self.channels[i];
                                }
                            }
                        }

                        if (data.data.profile != undefined) {
                            self.profile = data.data.profile;
                            self.getAppNotifications();
                        }

                        if (data.data.friends != undefined) {
                            self.friends = data.data.friends;

                            for (var i = 0; i < self.friends.length; i++) {
                                self.friends[i]['mCounter'] = 0;
                                self.page.totPendUserMsg = 0;
                                self.friendObjs[self.clientPref + self.friends[i].id] = self.friends[i];
                                self.textBoxes.inBoxes[self.clientPref + self.friends[i].id] = [];
                                self.textBoxes.outBoxes[self.clientPref + self.friends[i].id] = { text: "" };
                                self.defaultHistory[self.clientPref + self.friends[i].id] = { messages: [] };
                                self.defaultHistory[self.clientPref + self.friends[i].id] = { loaded: false };
                                if (i == 0) {
                                    self.cBuddy = self.friends[i];
                                    self.getDefaultChatById(self.cBuddy.id);
                                    if (self.chatGroupData) {
                                        self.getDefaultGroupChatById(self.chatGroupData._id);
                                    }
                                    self.postChangePendingMessageStatus(self.cBuddy.id);
                                }
                            }
                        }

                        if (data.data.history != undefined) {
                            if (self.cBuddy) {
                                self.defaultHistory[self.clientPref + self.cBuddy.id].messages = data.data.history;
                                self.defaultHistory[self.clientPref + self.cBuddy.id].loaded = true;
                            }
                        }

                        if (data.data.grphistory != undefined) {

                            self.groupchatdefaulthistory = data.data.grphistory;
                            for (var i = 0; i < self.groupchatdefaulthistory.length; i++) {
                                if (self.groupchatdefaulthistory[i].from._id == self.profile.id) {
                                    if (typeof (self.groupchatdefaulthistory[i].from.photo) != "undefined" && self.groupchatdefaulthistory[i].from.photo != null && self.groupchatdefaulthistory[i].from.photo != '') {
                                        self.groupchatdefaulthistory[i].from.photo = self.profilePic;
                                    }
                                    else {
                                        self.groupchatdefaulthistory[i].from.photo = '';
                                    }
                                }
                                else {
                                    if (typeof (self.groupchatdefaulthistory[i].from.photo) != 'undefined' && self.groupchatdefaulthistory[i].from.photo != null && self.groupchatdefaulthistory[i].from.photo != '')
                                        self.groupchatdefaulthistory[i].from.photo = self.groupchatdefaulthistory[i].from.photo + "?t=" + new Date().getTime();
                                    else
                                        self.groupchatdefaulthistory[i].from.photo = '';

                                }
                                self.groupchathistory = [];
                            }
                        }
                        break;

                    case self.dataType.GROUPTEXT:
                        if (data.data.groupchatData) {
                            for (var i = 0; i < data.data.groupchatData.length; i++) {
                                if (data.data.groupchatData[i].groupId == self.chatGroupData._id) {
                                    self.groupchathistory.push(data.data.groupchatData[0]);
                                } else {
                                    if (self.groups.length > 0) {
                                        for (var k = 0; k < self.groups.length; k++) {
                                            if (data.data.groupchatData[i].groupId == self.groups[k]._id) {
                                                if (self.groups[k].mCounter == 0) {
                                                    ++self.groups[k].mCounter
                                                    ++self.page.totPendGroupUserMsg;
                                                }
                                                else {
                                                    ++self.groups[k].mCounter;
                                                }
                                            }
                                        }
                                    }

                                    if (self.otherGroup.length > 0) {
                                        for (var l = 0; l < self.otherGroup.length; l++) {
                                            if (data.data.groupchatData[i].groupId == self.otherGroup[l]._id) {
                                                if (self.otherGroup[l].mCounter == 0) {
                                                    ++self.otherGroup[l].mCounter;
                                                    ++self.page.totPendGroupUserMsg;
                                                } else {
                                                    ++self.otherGroup[l].mCounter;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;


                    case self.dataType.TEXT:
                        data.self = (data.from == self.profile.id);
                        if (!data.self) {
                            if (data.avatar)
                                data.avatar = data.avatar + "?t=" + new Date().getTime();
                            else
                                data.avatar = '';
                            self.textBoxes.inBoxes[self.clientPref + data.from].push(data);
                            if (data.from != self.cBuddy.id) {
                                self.friendObjs[self.clientPref + data.from].mCounter++;
                            }
                            self.page.totPendUserMsg = 0;
                            for (var i = 0; i < self.friends.length; i++) {
                                if (self.friends[i]['mCounter'] > 0) {
                                    self.page.totPendUserMsg++;
                                }
                            }
                        }
                        break;

                    case self.dataType.STATUS:
                        if (self.friendObjs[self.clientPref + data.from])
                            self.friendObjs[self.clientPref + data.from].status = data.data.status;
                        break;
                }
            } else {
                console.log("Invalid chat packet:" + JSON.stringify(data));
            }
        });
        this.userStatus.logout = function () {
            if (self.profile && self.profile.id) {
                var msg = {
                    close: self.profile.id,
                };
                self.client.write(msg);
            }
        };
        this.scrollToBottom();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    chatBoxClose() {
        this.page.chatToggleGlobal = false;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
    }

    getUserGroups() {
        this.dataService.getData(this._dataUrlUserGroup).subscribe(res => {
            if (res.status == 2) {
                this.groups = res.data;
                this.chatGroupData = this.groups[0];
                if (this.chatGroupData != null && this.chatGroupData !== '' && typeof (this.chatGroupData) !== "undefined") {
                    for (var i = 0; i < this.chatGroupData.members.length; i++) {
                        this.groupIdCollection.push(this.chatGroupData.members[i].user_id._id);
                    }
                }
                this.getOtherUserGroups();
            }
            for (var k = 0; k < this.groups.length; k++) {
                this.groups[k]['mCounter'] = 0;
            }
        });
    }

    getOtherUserGroups() {
        this.dataService.getData(this._dataUrlOtherUserGroup).subscribe(res => {
            if (res.status == 2) {
                this.otherGroup = res.data;
                if (this.groups[0] == null || this.groups[0] == '' || typeof (this.groups[0]) == 'undefined') {
                    if (this.otherGroup[0] != null && this.otherGroup[0] != '' && typeof (this.otherGroup[0]) != 'undefined') {
                        this.chatGroupData = this.otherGroup[0];
                    } else {
                        this.chatGroupData = null;
                    }
                }

                if (this.chatGroupData != null && this.chatGroupData !== '' && typeof (this.chatGroupData) !== "undefined") {
                    for (var i = 0; i < this.chatGroupData.members.length; i++) {
                        this.groupIdCollection.push(this.chatGroupData.members[i].user_id._id);
                    }
                }

                for (var k = 0; k < this.otherGroup.length; k++) {
                    this.otherGroup[k]['mCounter'] = 0;
                }
                this.getGroupChatCounter();
            }
        });
    }

    getUserGroups1() {
        this.dataService.getData(this._dataUrlUserGroup).subscribe(res => {
            if (res.status == 2) {
                this.groups = res.data;
                this.chatGroupData = this.groups[0];
                if (this.chatGroupData != null && this.chatGroupData !== '' && typeof (this.chatGroupData) !== "undefined") {
                    for (var i = 0; i < this.chatGroupData.members.length; i++) {
                        this.groupIdCollection.push(this.chatGroupData.members[i].user_id._id);
                    }
                    this.groupchatdefaulthistory = [];
                    this.groupchathistory = [];
                    this.getDefaultGroupChatById(this.chatGroupData._id);
                }
                this.getOtherUserGroups1();
            }

            for (var k = 0; k < this.groups.length; k++) {
                this.groups[k]['mCounter'] = 0;
            }
        });
    }

    getOtherUserGroups1() {
        this.dataService.getData(this._dataUrlOtherUserGroup).subscribe(res => {
            if (res.status == 2) {
                this.otherGroup = res.data;
                if (this.groups[0] == null || this.groups[0] == '' || typeof (this.groups[0]) == 'undefined') {
                    if (this.otherGroup[0] != null && this.otherGroup[0] != '' && typeof (this.otherGroup[0]) != 'undefined') {
                        this.chatGroupData = this.otherGroup[0];
                        this.getDefaultGroupChatById(this.chatGroupData._id);
                    } else {
                        this.chatGroupData = null;
                        this.groupchatdefaulthistory = [];
                        this.groupchathistory = [];
                    }
                }

                if (this.chatGroupData != null && this.chatGroupData !== '' && typeof (this.chatGroupData) !== "undefined") {
                    for (var i = 0; i < this.chatGroupData.members.length; i++) {
                        this.groupIdCollection.push(this.chatGroupData.members[i].user_id._id);
                    }
                }

                for (var k = 0; k < this.otherGroup.length; k++) {
                    this.otherGroup[k]['mCounter'] = 0;
                }
                this.getGroupChatCounter();
            }
        });
    }


    getGroupChatCounter() {
        this.page.totPendGroupUserMsg = 0;
        this.dataService.getData(this._getGroupChatCounter).subscribe(res => {
            if (this.groups.length > 0) {
                for (var j = 0; j < this.groups.length; j++) {
                    for (var i = 0; i < res.data.length; i++) {
                        if (this.groups[j]._id == res.data[i].group_id && res.data[i].is_viewed == 0 && res.data[i].to == this.profile.id && res.data[i].from != this.profile.id) {
                            ++this.groups[j].mCounter;
                            if (this.groups[j].mCounter == 1) {
                                ++this.page.totPendGroupUserMsg;
                            }
                        }
                    }
                }
            }
            if (this.otherGroup.length > 0) {
                for (var j = 0; j < this.otherGroup.length; j++) {
                    for (var i = 0; i < res.data.length; i++) {
                        if (this.otherGroup[j]._id == res.data[i].group_id && res.data[i].is_viewed == 0 && res.data[i].to == this.profile.id && res.data[i].from != this.profile.id) {
                            ++this.otherGroup[j].mCounter;
                            if (this.otherGroup[j].mCounter == 1) {
                                ++this.page.totPendGroupUserMsg;
                            }
                        }
                    }
                }
            }

        });
    }

    groupData(group) {
        if (group.mCounter > 0) {
            group.mCounter = 0;
            --this.page.totPendGroupUserMsg;
        }
        this.groupchathistory = [];
        this.chatGroupData = group;
        this.groupIdCollection = [];
        if (this.chatGroupData != null && this.chatGroupData !== '' && typeof (this.chatGroupData) !== "undefined") {
            for (var i = 0; i < this.chatGroupData.members.length; i++) {
                this.groupIdCollection.push(this.chatGroupData.members[i].user_id._id);
            }
        }
        for (var k = 0; k < this.groups.length; k++) {
            if (this.groups[k]._id == this.chatGroupData._id) {
                this.groups[k]['mCounter'] = 0;
            }
        }

        for (var p = 0; p < this.otherGroup.length; p++) {
            if (this.otherGroup[p]._id == this.chatGroupData._id) {
                this.otherGroup[p]['mCounter'] = 0;
            }
        }
        this.getDefaultGroupChatById(this.chatGroupData._id);
    }


    createGroup() {
        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.groupdata.title != '' && this.groupdata.title.match(letters)) {
            if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
                if (this.errorGroupMsg.errorIcon == '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.makeFileRequest(this._dataUrlGroupAdd + '/' + this.groupdata.title, [], this.photosToUpload).then((res) => {
                        this.dataService.getData(this._addloginMemberUrl + res['data']._id).subscribe(res => {

                        });
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>Chat Group Created.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        this.getUserGroups1();
                        this.photosToUpload = this.errorGroupMsg.errorName = this.errorGroupMsg.errorIcon = "";
                        this.groupdata.title = "";
                        this.imageFile.target.value = "";
                    });
                    jQuery("#groupModal").modal('hide');
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                }
            } else {
                this.errorGroupMsg.errorName = "";
                this.errorGroupMsg.errorIcon = "Select The Chat Group Image.";
            }
        } else {
            this.errorGroupMsg.errorName = "Group Name Required.";
            this.errorGroupMsg.errorIcon = "";
        }
    }


    deleteGroup() {
        var unique = this.groupIdCollection.filter(function (elem, index, self) {
            return index == self.indexOf(elem);
        });
        if (this.chatGroupData.created_by._id == this.profile.id) {
            this.dataService.getData(this._dataUrlDeleteGroup + '/' + this.groupDeleteId).subscribe(res => {
                this.removeGroupTitle = " Deleted Chat Group " + this.chatGroupData.title;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p><b>' + this.chatGroupData.title + '</b> Chat Group Deleted Successfully.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.dataService.postData(this._addGroupChatMemberNotification + '/' + this.post_type.GROUPCHATNOTIFY + '/' + this.chatGroupData._id, { members: unique, title: this.removeGroupTitle }).subscribe(res => {
                });
                this.getUserGroups1();
            });
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>You cannot delete this group</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        }
    }
    makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append("avatar", files[0]);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            }
            xhr.open("POST", url, true);
            xhr.send(formData);
        });
    }

    photoChangeEvent(fileInput: any) {
        this.photosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
            this.errorGroupMsg.errorIcon = '';
        }
        else {
            this.errorGroupMsg.errorIcon = "Invalid image format";
            this.errorGroupMsg.errorName = "";
        }
    }

    closeGroupModel() {
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
        this.groupdata.title = "";
        this.photosToUpload = this.errorGroupMsg.errorName = this.errorGroupMsg.errorIcon = "";
    }

    onSelect(channel) {
        this.selChannel = channel;
    }

    chatInputAction(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            this.sendData();
            return false;
        }
    }

    groupchatInputAction(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            this.sendGroupData();
            return false;
        }
    }

    getAppNotifications() {
        var msg = {
            from: this.profile.id,
            data: {
                type: this.dataType.ACT,
                action: this.actType.NOTIF
            }
        };
        this.client.write(msg);
    }

    //get Default Chat By Id
    getDefaultChatById(friendId) {
        var self = this;
        if (friendId && friendId != "") {
            var msg = {
                from: this.profile.id,
                data: {
                    type: self.dataType.ACT,
                    action: self.actType.HST,
                    participant: friendId
                }
            };
            this.client.write(msg);
        }
    }


    //get Default Group Chat By Id
    getDefaultGroupChatById(groupId) {
        var self = this;
        if (typeof (self.profile.id) != "undefined" && self.profile.id != null && self.profile.id != '') {
            if (groupId && groupId != "") {
                var msg = {
                    from: self.profile.id,
                    data: {
                        type: self.dataType.ACT,
                        action: self.actType.GRPHST,
                        groupId: groupId
                    }
                };
                this.client.write(msg);
            }
        }
    }


    //postChange Pending Message Status
    postChangePendingMessageStatus(friend_id) {
        var self = this;
        if (friend_id && friend_id != "") {
            var msg = {
                data: {
                    type: self.dataType.ACT,
                    action: self.actType.HST,
                    participant: friend_id
                }
            };
            this.client.write(msg);
        }
    }

    getCurrentBuddy(cBuddy, j) {
        this.cBuddy = cBuddy;
        if (this.cBuddy.mCounter > 0)
        { this.page.totPendUserMsg--; }
        this.cBuddy.mCounter = 0;
        this.textBoxes.inBoxes[this.clientPref + this.cBuddy.id] = [];
        this.getDefaultChatById(this.cBuddy.id);
        this.postChangePendingMessageStatus(this.cBuddy.id);
        this.CUser = j;
    }


    sendData() {
        var outText = this.textBoxes.outBoxes[this.clientPref + this.cBuddy.id];
        if (outText && outText.text.trim() != "") {
            this.singlechattext.error = '';
            var msg = {
                from: this.profile.id,
                to: this.cBuddy.id,
                date: new Date(),
                data: {
                    type: this.dataType.TEXT,
                    body: outText.text
                }
            };
            msg['self'] = true;
            if (this.profilePic)
                msg['avatar'] = this.profilePic;
            else
                msg['avatar'] = '';
            this.client.write(msg);
            this.textBoxes.inBoxes[this.clientPref + msg.to].push(msg);
            outText.text = "";
        } else {
            this.singlechattext.error = '*Please enter the message';
        }
    }
    sendGroupData() {
        if (this.chatGroupData.members.length > 1) {
            this.addmember.error = '';
            if (this.groupchattext.groupchatmsg != '' && this.groupchattext.groupchatmsg != null && typeof (this.groupchattext.groupchatmsg) != "undefined") {
                this.groupchattext.error = '';
                var groupoutText = this.groupchattext.groupchatmsg;
                if (groupoutText && groupoutText.trim() != "") {
                    var unique = this.groupIdCollection.filter(function (elem, index, self) {
                        return index == self.indexOf(elem);
                    });
                    this.dataService.postData(this._groupChatMsg + this.chatGroupData._id + '/', { members: unique, groupchatmsg: groupoutText }).subscribe(res => {
                    });
                    groupoutText = "";
                    this.groupchattext.groupchatmsg = '';
                }
            } else {
                this.groupchattext.error = '*Please enter the message';
            }
        } else {
            this.addmember.error = '*Please add members';
        }
    }

    optionToggle(newSet) {
        this.ison = newSet;
    }

    changeTab() {
        this.singleChatTab = true;
        this.groupChatTab = false;
        jQuery(".tab-pane.active.chat-main-tab").addClass("tab-active");
        jQuery(".tab-pane.active.chat-main-tab").removeClass("tab-active-2");
    }

    changeTab2() {
        this.singleChatTab = false;
        this.groupChatTab = true;
        jQuery(".tab-pane.active.chat-main-tab").addClass("tab-active-2");
        jQuery(".tab-pane.active.chat-main-tab").removeClass("tab-active");
    }

    deleteModel(id) {
        this.addmember.error = '';
        this.groupchattext.error = '';
        this.groupDeleteId = id;
        jQuery("#groupDeleteModal").modal({ backdrop: false });
    }

    clearGroupMemberList() {
        this.userSearchList = null;
        this.userSearchField.name = null;
    }

    friendSearch() {
        if (this.userSearchField.name == '' || this.userSearchField.name == null) {
            this.userSearchList = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (this.userSearchField.name.match(nameValid)) {
                this.dataService.postData(this._userSearchUrl, this.userSearchField)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.userSearchList = res.data;
                        } else this.userSearchList = null;
                    });
            }
        }
    }

    addToGroup(userId, obj) {
        var t = obj;
        var m, n;
        for (var i = 0; i < this.tmpMemberIds.length; i++) {
            if (this.tmpMemberIds[i] == userId) {
                n = userId;
            }
        }
        this.dataService.getData(this._dataUrlGetUserGroup + this.chatGroupData._id).subscribe(res => {
            for (var i = 0; i < res[0].members.length; i++) {
                if (res[0].members[i].user_id == userId) {
                    m = userId;
                }
            }
            if (!m && !n) {
                this.tmpMemberIds.push(userId);
                this.tmpMembers.push(t);
            } else {
                this.page.showError('Member already exists in the member list.');
            }
            this.errorAddMember = "";
        });
        this.userSearchList = null;
    }

    addMembers() {
        if (this.tmpMemberIds.length > 0) {
            this.groupchattext.error = '';
            this.dataService.postData(this._addMemberUrl + this.chatGroupData._id, { members: this.tmpMemberIds }).subscribe(res => {
                if (res.status === 2) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Member added to ' + this.chatGroupData.title + ' chat group <b>' + '</b> successfully.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    this.getUserGroups();
                    this.addGroupMemberTitle = 'added you to chat group ' + this.chatGroupData.title;
                    this.dataService.postData(this._addGroupChatMemberNotification + '/' + this.post_type.GROUPCHATNOTIFY + '/' + this.chatGroupData._id, { members: this.tmpMemberIds, title: this.addGroupMemberTitle }).subscribe(res => {
                    });
                    this.tmpMemberIds = [];
                    this.tmpMembers = [];
                    this.errorAddMember = "";
                    this.userSearchField.name = "";
                    this.userSearchList = null;
                    jQuery("#addGroupMember").modal('hide');
                } else this.userSearchList = null;
            });
        } else {
            this.errorAddMember = "Select the member";
        }
    }

    public onMemberDelete(friendId, groupId, fname): void {
        this.friendId = friendId;
        this.groupId = groupId;
        this.fname = fname;
        jQuery("#memberDeleteModal").modal('show');
    }

    removeGroupMember() {
        this.dataService.getData(this._dataUrlRemoveGroupChatFriend + "/" + this.friendId + "/" + this.groupId).subscribe(friends => {
            if (friends.status == 2) {
                var unique = this.groupIdCollection.filter(function (elem, index, self) {
                    return index == self.indexOf(elem);
                });
                jQuery("#memberDeleteModal").modal('hide');
                var n = noty({ text: '<div class="alert bg-theme-dark"><p><b>' + this.fname + '</b> deleted from ' + this.chatGroupData.title + ' chat group <b>' + '</b> successfully.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.removeGroupMemberTitle = ' deleted ' + this.fname + ' from chat group ' + this.chatGroupData.title;
                this.dataService.postData(this._addGroupChatMemberNotification + '/' + this.post_type.GROUPCHATNOTIFY + '/' + this.chatGroupData._id, { members: unique, title: this.removeGroupMemberTitle }).subscribe(res => {
                });
                this.getUserGroups1();
                jQuery("#listMember").modal('hide');
            }
        });
    }

    listMember() {
        this.addmember.error = '';
        this.groupchattext.error = '';
        jQuery("#listMember").modal();
    }

    openAddMemberModal() {
        this.addmember.error = '';
        this.groupchattext.error = '';
        jQuery("#addGroupMember").modal({ backdrop: false });
    }

    openGroupModal() {
        jQuery("#groupModal").modal({ backdrop: false });
    }

    ngAfterViewInit() {

    }

    togContactList() {
        this.stateMain = !this.stateMain;
        this.stateSide = !this.stateSide;
        this.stateEditor = !this.stateEditor;
    }

}
