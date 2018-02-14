import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { UserService } from '../../providers/user-service';
import { CheckWallService } from '../../providers/check-wall-service';
import { CreateListModalPage } from '../create-list-modal/create-list-modal';
import { ListMemberModalPage } from '../list-member-modal/list-member-modal';
import { CommonService } from "../../providers/common-service";
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { MyProfilePage } from '../my-profile/my-profile';
import { ChatPage } from '../chat/chat';
import { InvitePage } from '../invite/invite';
/*
  Generated class for the MyFriend page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-my-friend',
  templateUrl: 'my-friend.html',
  providers: [DataService]
})
export class MyFriendPage {
  private _dataUrlFriends = '/api/user/dashboard/getFriends';
  public _dataUrlUserList = '/api/list/getListsByUserId';
  public _dataUrlDeleteList = '/api/list/deleteList';
  public _listSearchUrl = '/api/list/listSearch';
  public _userSearchUrl = '/api/user/userSearchByStatus';
  public friends;
  public loader: boolean = false;
  public tab: string = "allFriends";
  public lists;
  public listSearchField = { title: "" };
  public searchList;
  public searchListCount;
  public userSearchField = { name: "", status: "" };
  public userSearchList;
  public userSearchCount;
  public friendOfFriend;
  public dataServiceData: typeof DataService = DataService;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataService: DataService,
    public modalCtrl: ModalController,
    public commonService: CommonService,
    private userService:UserService,
    private checkWallService:CheckWallService
  ) {
    if (navParams.data.friends) {
      this.friendOfFriend = navParams.data.friends;
    }
    this.checkWallService.setInviteActiveWall(0);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyFriendPage');
    this.getFriendList();
    // this.getUserLists();
  }

    getFriendList() {
    this.userService.getAllTypeFriends()
      .then(res => {
        this.friends = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getFriends() {
    this.loader = true;
    this.dataService.getData(this._dataUrlFriends).subscribe(friends => {
      this.loader = false;
      this.friends = friends.friends;
      console.log("***************friends*****************", this.friends);
    });
  }

  getUserLists() {
    console.log('hi');
    this.loader = true;
    this.dataService.getData(this._dataUrlUserList).subscribe(res => {
      this.loader = false;
      console.log("***************res*****************", res);
      if (res.status == 2) {
        this.lists = res.data;
        console.log("***************lists*****************", this.lists);
      }
    });
  }

  CreateListModal() {
    let modal = this.modalCtrl.create(CreateListModalPage);
    modal.onDidDismiss(data => {
      console.log('data', data);
      this.commonService.showToast(data.list.msg);
      this.getUserLists();
    });
    modal.present();
  }

  onDeleteClick(id) {
    this.commonService.showConfirm("", "Are you sure you want to delete this list ?", () => this.deleteList(id));
  }

  deleteList(id) {
    this.loader = true;
    this.dataService.getData(this._dataUrlDeleteList + '/' + id)
      .subscribe(res => {
        console.log("delete res:", res);
        if (res.status === 2) {
          this.getUserLists();
          this.loader = false;
          this.commonService.showToast(res.message);
        }
      });
  }

  listEditModal(list, listId) {
    let modal = this.modalCtrl.create(CreateListModalPage, { list: list, listId: listId });
    modal.onDidDismiss(data => {
      console.log('data', data);
      this.commonService.showToast(data.list.msg);
      this.getUserLists();
    });
    modal.present();
  }

  listMemberModal(list, listId) {
    let modal = this.modalCtrl.create(ListMemberModalPage, { friends: this.friends, list: list, listId: listId });
    modal.onDidDismiss(data => {
      this.getUserLists();
    });
    modal.present();
  }

  listSearch(e) {
    if (this.listSearchField.title == '' || this.listSearchField.title == null) {
      this.searchList = null;
    }
    else {
      var nameValid = /^[a-z\d\-_\s]+$/i;
      if (this.listSearchField.title.match(nameValid)) {
        this.dataService.postData(this._listSearchUrl, this.listSearchField)
          .subscribe(res => {
            console.log("list search:", res.data);
            if (res.status === 2) {
              this.searchList = res.data;
              this.searchListCount = this.searchList.length;
              console.log('searchList', this.searchList);
              console.log('searchListCount', this.searchListCount);
            }
            else this.searchList = null;
          });
      }
    }
  }

  userSearch(e) {
    this.userSearchField.status = '3'; //3 for current friend
    if (this.userSearchField.name == '' || this.userSearchField.name == null) {
      this.userSearchList = null;
    }
    else {
      var nameValid = /^[a-z\d\-_\s]+$/i;
      if (this.userSearchField.name.match(nameValid)) {
        this.dataService.postData(this._userSearchUrl, this.userSearchField)
          .subscribe(res => {
            console.log("userSearch:", res.data);
            if (res.status === 2) {
              this.userSearchList = res.data;
              this.userSearchCount = this.userSearchList.length;
              console.log('userSearchCount', this.userSearchCount);
              console.log('userSearchList', this.userSearchList);
            }
            else this.userSearchList = null;
          });
      }
    }
  }

  getProfileById(id) {
    this.userSearchList = null;
    this.userSearchField.name = null;
    this.navCtrl.push(FriendProfilePage, { userId: id });
  }

  getfriendOfFriendProfileById(id) {
    console.log('this.dataServiceData.userid', this.dataServiceData.userid);
    console.log('id', id);
    if (id == this.dataServiceData.userid) {
      this.navCtrl.push(MyProfilePage);
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }

   onRemoveClick(friend_id, user){
    this.commonService.showConfirm("", "Are you sure you want to remove this friend ?", () => this.friendRemove(friend_id, user));
  }

   onBlockClick(friend_id, user){
    this.commonService.showConfirm("", "Are you sure you want to block this friend ?", () => this.blockFriend(friend_id, user));
  }
   onUnBlockClick(friend_id, user){
    this.commonService.showConfirm("", "Are you sure you want to unblock this user ?", () => this.unblockFriend(friend_id, user));
  }

   friendRemove(friend_id, user) {
    this.userService.friendRemove(friend_id)
      .then(res => {
        if (res.status == 2) {
          user = [];
          user.status = 6;
          this.commonService.showToast('Friend removed successfully');
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  blockFriend(friend_id, user) {
    this.userService.blockFriend(friend_id)
      .then(res => {
        if (res.status == 2) {
          user = [];
          user.status = 4;
          this.commonService.showToast('Friend blocked successfully');
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  unblockFriend(friend_id, user) {
    this.userService.unblockFriend(friend_id)
      .then(res => {
        if (res.status == 2) {
          user.status = 6;
          this.commonService.showToast('Friend unblocked successfully');
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  gotochat() {
    this.navCtrl.push(ChatPage);
  }

  inviteFriends(){
    this.navCtrl.push(InvitePage);
  }
}

