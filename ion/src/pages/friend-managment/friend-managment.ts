import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { CommonService } from "../../providers/common-service";
import { CheckWallService } from "../../providers/check-wall-service";
import { DataService } from '../../providers/data-service';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { InvitePage } from '../invite/invite';

/*
  Generated class for the FriendManagment page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-friend-managment',
  templateUrl: 'friend-managment.html',
  providers: [UserService, CommonService, DataService]
})
export class FriendManagmentPage {
  public _friendListUrl = '/api/user/getAllTypeFriends';
  public _userSearchUrl = '/api/user/userSearchByStatus';
  public _acceptFriendNotification = '/api/notification/addNotification/';
  public friends;
  public tab: string = "allFriends";
  public blocked_friends;
  public friendStatus;
  public userSearchField = { name: "", status: "" };
  public acceptFriendTitle = { title: 'has accepted your friend request', recepient: [] };
  public userSearchList;
  public userSearchCount;
  public searchUser = 3;
  private post_type = {
    SENDREQ: 0,
    ACCEPTREQNOTIFY: 3,
  };
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userService: UserService,
    public commonService: CommonService,
    public dataService: DataService,
    private checkWallService:CheckWallService

  ) {
    if (navParams.data.tab) {
      this.tab = navParams.data.tab;
    }
    this.checkWallService.setInviteActiveWall(0);

  }

  ionViewDidLoad() {
    this.getFriendList();
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

  onBlockClick(friend_id, user){
    this.commonService.showConfirm("", "Are you sure you want to block this friend ?", () => this.blockFriend(friend_id, user));
  }
  onRemoveClick(friend_id, user){
    this.commonService.showConfirm("", "Are you sure you want to remove this friend ?", () => this.friendRemove(friend_id, user));
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
          this.blocked_friends = friend_id;
          this.commonService.showToast('Friend blocked successfully');
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

 onUnBlockClick(friend_id, user){
    this.commonService.showConfirm("", "Are you sure you want to unblock this user ?", () => this.unblockFriend(friend_id, user));
  }

  unblockFriend(friend_id, user) {
    this.userService.unblockFriend(friend_id)
      .then(res => {
        if (res.status == 2) {
          user.status = 6;
          this.blocked_friends = 0;
          this.commonService.showToast('Friend unblocked successfully');
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }


  acceptFriendRequest(friend_id, user) {
    this.userService.acceptFriendRequest(friend_id)
      .then(res => {
        this.acceptFriendTitle.recepient = user;
        if (res.status == 2) {
          user.status = 3;
          this.dataService.postData(this._acceptFriendNotification + friend_id + '/' + this.post_type.ACCEPTREQNOTIFY, this.acceptFriendTitle).subscribe(res => {
          });
          this.commonService.showToast('Friend request accepted');
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onRejectClick(friend_id, user){
    this.commonService.showConfirm("", "Are you sure you want to reject this friend request ?", () => this.friendRequestReject(friend_id, user));
  } 

  friendRequestReject(friend_id, user) {
    this.userService.friendRequestReject(friend_id)
      .then(res => {
        if (res.status == 2) {
          user = [];
          user.status = 6;
          this.commonService.showToast('Friend request rejected');
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

 onCancelClick(friend_id, user){
    this.commonService.showConfirm("", "Are you sure you want to cancel this friend request?", () => this.cancelRequestedFriend(friend_id, user));
  } 

  cancelRequestedFriend(friend_id, user) {
    this.userService.cancelRequestedFriend(friend_id)
      .then(res => {
        if (res.status == 2) {
          user = [];
          user.status = 6;
          this.commonService.showToast('Friend request cancelled.');
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  addAsFriend(id) {
    this.userService.addAsFriend(id)
      .then(res => {
        if (res.status == 2) {
          this.commonService.showToast('Friend request sent.');
          this.friendStatus = res;
          this.getFriendList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  friendMgmtTab(tabType, searchStatus) {
    if (tabType == 1 && searchStatus == 3) {
      this.searchUser = searchStatus;
      this.userSearchField.name = '';
      this.userSearchList = null;
    } else if (tabType == 2 && searchStatus == 2) {
      this.searchUser = searchStatus;
      this.userSearchField.name = '';
      this.userSearchList = null;
    } else if (tabType == 3 && searchStatus == 1) {
      this.searchUser = searchStatus;
      this.userSearchField.name = '';
      this.userSearchList = null;
    } else if (tabType == 4 && searchStatus == 4) {
      this.searchUser = searchStatus;
      this.userSearchField.name = '';
      this.userSearchList = null;
    }
  }

  userSearch(e, searchFriendStatus) {
    this.userSearchField.status = searchFriendStatus;
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
              this.userSearchCount = this.userSearchList.length;
            }
            else this.userSearchList = null;
          });
      }
    }
  }

  getProfileById(id) {
    this.navCtrl.push(FriendProfilePage, { userId: id });
  }
 inviteFriends(){
    this.navCtrl.push(InvitePage);
  }
}
