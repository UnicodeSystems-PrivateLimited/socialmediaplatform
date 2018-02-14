import { Component, Input } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { GroupChatMemberListModalPage } from '../group-chat-member-list-modal/group-chat-member-list-modal'
import { AddGroupChatMemberModalPage } from '../add-group-chat-member-modal/add-group-chat-member-modal'
import { ChatService } from '../../providers/chat-service';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { ChatGlobalService } from '../../providers/chat-global-service';
declare var Primus: any;

/*
  Generated class for the GroupChat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-group-chat',
  templateUrl: 'group-chat.html',
  providers: [UserService, CommonService, DataService, ChatService]

})
export class GroupChatPage {
  public addmember = { error: '' };
  public groupchattext = { groupchatmsg: '', error: '' };
  public _groupChatMsg = '/api/grouphistory/addGroupChat/';
  public loggedInUserId: number;
  public loader: boolean = false;
  constructor(
    public navCtrl: NavController,
    public chatService: ChatService,
    public commonService: CommonService,
    private dataService: DataService,
    private page: PageService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private chatGlobalService: ChatGlobalService,
    private navParams: NavParams) {
    if (DataService.userid) {
      this.loggedInUserId = DataService.userid;
    }
    console.log("this.loggedInUserId", this.loggedInUserId)
    this.loader = true;
    setTimeout(() => {
      this.loader = false;
    }, 300);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupChatPage');
  }

  public onAddMember(): void {
    let modal = this.modalCtrl.create(AddGroupChatMemberModalPage, this.chatGlobalService.chatGroupData);
    modal.onDidDismiss(data => {
      this.chatGlobalService.getUserGroups();
    });
    modal.present();
  }

  public onMemberList(): void {
    let data = { chatGroupData: this.chatGlobalService.chatGroupData, profile: this.chatGlobalService.profile, groupIdCollection: this.chatGlobalService.groupIdCollection };
    let modal = this.modalCtrl.create(GroupChatMemberListModalPage, data);
    modal.onDidDismiss(() => {
      // this.getUserGroups1();
    });
    modal.present();
  }

  public sendGroupData(): void {
    if (this.chatGlobalService.chatGroupData.members.length > 1) {
      this.addmember.error = '';
      if (this.groupchattext.groupchatmsg != '' && this.groupchattext.groupchatmsg != null && typeof (this.groupchattext.groupchatmsg) != "undefined") {
        this.groupchattext.error = '';
        var groupoutText = this.groupchattext.groupchatmsg;
        if (groupoutText && groupoutText.trim() != "") {
          var unique = this.chatGlobalService.groupIdCollection.filter(function (elem, index, self) {
            return index == self.indexOf(elem);
          });
          this.dataService.postData(this._groupChatMsg + this.chatGlobalService.chatGroupData._id + '/', { members: unique, groupchatmsg: groupoutText }).subscribe(res => {
          });
          groupoutText = "";
          this.groupchattext.groupchatmsg = '';
        }
      } else {
        this.groupchattext.error = '*Field is Required';
        this.commonService.showToast(this.groupchattext.error);
      }
    } else {
      this.addmember.error = '*Please add members';
      this.commonService.showToast(this.addmember.error);
    }
  }
}
