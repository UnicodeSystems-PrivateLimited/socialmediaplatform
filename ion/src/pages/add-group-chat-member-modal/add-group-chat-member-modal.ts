import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { ChatService } from '../../providers/chat-service';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
/*
  Generated class for the AddGroupChatMemberModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-group-chat-member-modal',
  templateUrl: 'add-group-chat-member-modal.html',
  providers: [UserService, CommonService, DataService, PageService, ChatService]

})
export class AddGroupChatMemberModalPage {
  public friends = [];
  public search = { text: '' };
  public memberId: any[] = [];
  public listId;
  public selectedItem: boolean[] = [];
  public list;
  public addGroupMemberTitle = ' added you to group';
  public _addMemberUrl = '/api/groupchat/addmembers/';
  public _addGroupChatMemberNotification = '/api/notification/addGroupChatNotification';
  public _userSearchUrl = '/api/groupchat/userSearch';
  public errorAddMember;
  public _dataUrlGetUserGroup = '/api/groupchat/getUserGroup/';
  public groupchattext = { groupchatmsg: '', error: '' };
  public loader: boolean = false;
  public members: any[] = [];
  public chatGroupData;
  private post_type = {
    SENDREQ: 0,
    GROUPNOTIFY: 1,
    GROUPCHATNOTIFY: 5
  };
  public userSearchField = { name: "" };
  public userSearchList;
  public tmpMemberIds = [];
  public tmpMembers = [];
  constructor(
    public navCtrl: NavController,
    public chatService: ChatService,
    public commonService: CommonService,
    public dataService: DataService,
    private page: PageService,
    private viewCtrl: ViewController,
    private navParams: NavParams,
  ) {
    this.chatGroupData = navParams.data
    if (this.chatGroupData) {
      this.members = this.chatGroupData.members;
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
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
        this.commonService.showToast('This member is already added');
      }
      this.errorAddMember = "";
    });
    this.userSearchList = null;
    this.userSearchField.name = "";
  }

  addMembers() {
    this.loader = true;
    if (this.tmpMemberIds.length > 0) {
      this.groupchattext.error = '';
      this.dataService.postData(this._addMemberUrl + this.chatGroupData._id, { members: this.tmpMemberIds }).subscribe(res => {
        if (res.status === 2) {
          this.commonService.showToast("Member added to chat group ");
          this.addGroupMemberTitle = 'added you to chat group ' + this.chatGroupData.title;
          this.dataService.postData(this._addGroupChatMemberNotification + '/' + this.post_type.GROUPCHATNOTIFY + '/' + this.chatGroupData._id, { members: this.tmpMemberIds, title: this.addGroupMemberTitle }).subscribe(res => {
            console.log("add member notification********************************" + JSON.stringify(res.msg));
          });
          this.dismiss();
          console.log("add member********************************" + JSON.stringify(res.data));
          this.tmpMemberIds = [];
          this.loader = false;
          this.tmpMembers = [];
          this.errorAddMember = "";
          this.userSearchField.name = "";
          this.userSearchList = null;
        } else this.userSearchList = null;
      });
    } else {
      this.errorAddMember = "select the member";
      this.commonService.showToast(this.errorAddMember);
    }
  }
}
