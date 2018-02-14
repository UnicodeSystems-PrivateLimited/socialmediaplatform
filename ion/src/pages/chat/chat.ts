import { Component, ElementRef, OnInit, OnChanges, AfterViewChecked, Input, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { ChatDescPage } from '../chat-desc/chat-desc'
import { GroupChatPage } from '../group-chat/group-chat'
import { ChatService } from '../../providers/chat-service';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { ChatGlobalService } from '../../providers/chat-global-service';
import { AddGroupModalPage } from '../add-group-modal/add-group-modal';
declare var Primus: any;

/*
  Generated class for the Chat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-chat',
    templateUrl: 'chat.html',
    providers: [UserService, CommonService, ChatService]

})

export class ChatPage {

    public groupSearch: string = '';
    public chatGlobalService: any;
    public searchText: string = '';
   
    constructor(private elementRef: ElementRef,
        public navCtrl: NavController,
        public chatService: ChatService,
        public commonService: CommonService,
        private dataService: DataService,
        private page: PageService,
        private modalCtrl: ModalController,
        private alertCtrl: AlertController,
        private chatGloService: ChatGlobalService,
        private navParams: NavParams) {
        let type = navParams;
        this.chatGlobalService = this.chatGloService;
        console.log("this.chatGlobalService", this.chatGlobalService);
        console.log("this.chatGlobalService.friends", this.chatGlobalService.friends);
    }

    getCurrentBuddy(cBuddy, j) {
        this.chatGlobalService.cBuddy = cBuddy;
        if (this.chatGlobalService.cBuddy.mCounter > 0) { this.page.totPendUserMsg--; }
        this.chatGlobalService.cBuddy.mCounter = 0;
        this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id] = [];
        this.chatGlobalService.CUser = j;
        this.chatGlobalService.getDefaultChatById(this.chatGlobalService.cBuddy.id);
        this.chatGlobalService.postChangePendingMessageStatus(this.chatGlobalService.cBuddy.id);
        if (this.chatGlobalService.cBuddy) {
            this.friendChat(this.chatGlobalService.cBuddy);
        }
    }

    public friendChat(cBuddy: any): void {
        this.navCtrl.push(ChatDescPage);
    }

    /**
     * Add Group
     */

    public onAddGroup(): void {
        console.log('add group')
        let modal = this.modalCtrl.create(AddGroupModalPage);
        modal.present();
        modal.onDidDismiss(() => {
            this.chatGlobalService.getUserGroups1();
        })
    }

    public onGroup(chatGroupData: any): void {
        this.navCtrl.push(GroupChatPage);
    }

    onGroupClick(group) {
        if (group.mCounter > 0) {
            group.mCounter = 0;
            --this.page.totPendGroupUserMsg;
        }
        this.chatGlobalService.groupchathistory = [];
        this.chatGlobalService.chatGroupData = group;
        this.chatGlobalService.groupIdCollection = [];
        if (this.chatGlobalService.chatGroupData != null && this.chatGlobalService.chatGroupData !== '' && typeof (this.chatGlobalService.chatGroupData) !== "undefined") {
            for (var i = 0; i < this.chatGlobalService.chatGroupData.members.length; i++) {
                this.chatGlobalService.groupIdCollection.push(this.chatGlobalService.chatGroupData.members[i].user_id._id);
            }
        }
        for (var k = 0; k < this.chatGlobalService.groups.length; k++) {
            if (this.chatGlobalService.groups[k]._id == this.chatGlobalService.chatGroupData._id) {
                this.chatGlobalService.groups[k]['mCounter'] = 0;
            }
        }

        for (var p = 0; p < this.chatGlobalService.otherGroup.length; p++) {
            if (this.chatGlobalService.otherGroup[p]._id == this.chatGlobalService.chatGroupData._id) {
                this.chatGlobalService.otherGroup[p]['mCounter'] = 0;
            }
        }
        if (this.chatGlobalService.chatGroupData) {
            this.onGroup(this.chatGlobalService.chatGroupData);
        }
        this.chatGlobalService.getDefaultGroupChatById(this.chatGlobalService.chatGroupData._id);
    }


    public onDeleteClick(id: number, name: string): void {
        this.chatGlobalService.groupId = id;
        this.chatGlobalService.groupName = name;
        let prompt = this.alertCtrl.create({
            title: 'Delete Group',
            message: "Are you sure you want to delete this group?",
            enableBackdropDismiss: false,
            buttons: [
                { text: 'NO' },
                { text: 'YES', handler: data => this.deleteGroup() }
            ]
        });
        prompt.present();
    }

    public deleteGroup(): void {
        var unique = this.chatGlobalService.groupIdCollection.filter(function (elem, index, self) {
            return index == self.indexOf(elem);
        });
        if (this.chatGlobalService.chatGroupData.created_by._id == this.chatGlobalService.profile.id) {
            this.dataService.getData(this.chatGlobalService._dataUrlDeleteGroup + '/' + this.chatGlobalService.groupId).subscribe(res => {
                this.chatGlobalService.removeGroupTitle = " Deleted Chat Group " + this.chatGlobalService.groupName;
                this.chatGlobalService.commonService.showToast(this.chatGlobalService.groupName + ' Group Deleted Successfully.');
                this.chatGlobalService.getUserGroups();
                this.dataService.postData(this.chatGlobalService._addGroupChatMemberNotification + '/' + this.chatGlobalService.post_type.GROUPCHATNOTIFY + '/' + this.chatGlobalService.groupId, { members: unique, title: this.chatGlobalService.removeGroupTitle }).subscribe(res => {
                    console.log("group chat group deleted notification********************************" + JSON.stringify(res.msg));
                });
            });
        } else {
            this.commonService.showToast('You cannot delete this group');
        }
    }
}
