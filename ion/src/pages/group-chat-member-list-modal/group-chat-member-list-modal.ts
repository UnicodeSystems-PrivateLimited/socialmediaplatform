import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ChatService } from '../../providers/chat-service';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
/*
  Generated class for the GroupChatMemberListModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-group-chat-member-list-modal',
  templateUrl: 'group-chat-member-list-modal.html',
  providers: [CommonService, DataService,]

})
export class GroupChatMemberListModalPage {
  public memberList = [];
  public profile: any;
  public chatGroupData: any;
  public _dataUrlRemoveGroupChatFriend = '/api/groupchat/RemoveGroupChatFriend';
  public _addGroupChatMemberNotification = '/api/notification/addGroupChatNotification';
  public _dataUrlGetUserGroup = '/api/groupchat/getUserGroup/';
  public _dataUrlUserGroup = '/api/groupchat/getGroupsByUserId';
  public _dataUrlgetGroup = '/api/groupchat/listGroupById';

  public removeGroupMemberTitle;
  private post_type = {
    SENDREQ: 0,
    GROUPNOTIFY: 1,
    GROUPCHATNOTIFY: 5
  };
  public groupIdCollection = [];

  constructor(public navCtrl: NavController,
    private dataService: DataService,
    public commonService: CommonService,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController) {
    // this.memberList = navParams.data.chatGroupData.members;
    this.profile = navParams.data.profile;
    this.chatGroupData = navParams.data.chatGroupData;
    this.groupIdCollection = navParams.data.groupIdCollection;
    this.getMembers();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  public getMembers(): void {
    this.dataService.getData(this._dataUrlgetGroup + '/' + this.chatGroupData._id).subscribe(res => {
      if (res.status == 2) {
        console.log('res');
        this.memberList = res.data.members;
        console.log(res);
      }
    });

  }

  public onDeleteClick(friendId, fname, i): void {
    let prompt = this.alertCtrl.create({
      title: 'Delete Member',
      message: "Are you sure you want to delete this member?",
      enableBackdropDismiss: false,
      buttons: [
        { text: 'NO' },
        { text: 'YES', handler: data => this.removeGroupMember(friendId, fname, i) }
      ]
    });
    prompt.present();
  }

  public removeGroupMember(friendId, fname, i): void {
    this.dataService.getData(this._dataUrlRemoveGroupChatFriend + "/" + friendId + "/" + this.chatGroupData._id).subscribe(friends => {
      if (friends.status == 2) {
        var unique = this.groupIdCollection.filter(function (elem, index, self) {
          return index == self.indexOf(elem);
        });
        let msg = fname + ' has been removed from chat group ' + this.chatGroupData.title;
        this.commonService.showToast(msg);
        this.removeGroupMemberTitle = ' deleted ' + fname + ' from chat group ' + this.chatGroupData.title;
        this.dataService.postData(this._addGroupChatMemberNotification + '/' + this.post_type.GROUPCHATNOTIFY + '/' + this.chatGroupData._id, { members: unique, title: this.removeGroupMemberTitle }).subscribe(res => {
          console.log("remove member notification********************************" + JSON.stringify(res.msg));
        });
        this.memberList.splice(i, 1);
      }
    });
  }
}
