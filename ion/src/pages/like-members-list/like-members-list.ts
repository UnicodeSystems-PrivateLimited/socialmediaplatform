import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TimelinePage } from '../timeline/timeline';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { DataService } from '../../providers/data-service';
import { UserService } from '../../providers/user-service';
import { CommonService } from "../../providers/common-service";
/*
  Generated class for the LikeMembersList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-like-members-list',
  templateUrl: 'like-members-list.html'
})
export class LikeMembersListPage {
  public postId: number = null;
  public likeData: Array<any> = [];
  private _getLikesMemeberUrl = '/api/post/getLikeUserStatus';
  
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public dataService: DataService,
    public userService: UserService,
    public commonService: CommonService    
  ) {
    if (this.navParams.data) {
      this.postId = this.navParams.data;
    }
  }
  ionViewDidLoad() {
    this.getFriendList();
  }

  public getProfileById(id): void {
    if (id == DataService.userid) {
      this.navCtrl.push(TimelinePage)
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }

  getFriendList() {
    this.dataService.getData(this._getLikesMemeberUrl + '/' + this.postId).subscribe((res) => {
      if (res.status == 2) {
        this.likeData = res.data['likes'];
      }
    })
  }

  onCancelClick(friend_id, member){
    this.commonService.showConfirm("", "Are you sure you want to cancel this friend request?", () => this.cancelRequestedFriend(friend_id, member));
  } 

  cancelRequestedFriend(friend_id, member) {
    this.userService.cancelRequestedFriend(friend_id)
      .then(res => {
        if (res.status == 2) {
          member.user_id.status = 6;
          this.commonService.showToast('Friend request cancelled.');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  addAsFriend(id, member) {
    this.userService.addAsFriend(id)
      .then(res => {
        if (res.status == 2) {
          this.commonService.showToast('Friend request sent.');
          member.user_id.status = 1;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}