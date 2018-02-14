import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { TimelinePage } from '../timeline/timeline';
import { CommonService } from "../../providers/common-service";
import { MembersPage } from '../members/members';

/*
  Generated class for the Following page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-following',
  templateUrl: 'following.html',
  providers: [DataService]
})
export class FollowingPage {
  private _dataUrlFollowing = '/api/user/dashboard/getFollowing';
  private _dataUrlUnFollow = 'api/user/unFollow/';  
  public followings;
  public loader: boolean = false;
  public followingsOfFriend;
  public dataServiceData: typeof DataService = DataService;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataService: DataService,
    public commonService: CommonService    
  ) {
    if (navParams.data.followings) {
      this.followingsOfFriend = navParams.data.followings;
    }
  }

  ionViewDidEnter() {
    this.getFollowing();
  }

  getFollowing() {
    this.loader = true;
    this.dataService.getData(this._dataUrlFollowing).subscribe(followings => {
      this.loader = false;
      this.followings = followings.followings;
    });
  }

  getProfileById(id) {
    this.navCtrl.push(FriendProfilePage, { userId: id });
  }

  getfollowingsOfFriendProfileById(id) {
    if (id == this.dataServiceData.userid) {
      this.navCtrl.push(TimelinePage);
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }

  setUnFollow(followingId,index) {
    this.loader = true;
    this.dataService.getData(this._dataUrlUnFollow + followingId).subscribe(res => {
      if (res.status == 2) {
        this.followings.splice(index,1);
        this.commonService.showToast(res.msg);
      } else {
        this.commonService.showToast(res.msg);
      }
      this.loader = false;
    });
  }

  goToMemberPage(){
    this.navCtrl.push(MembersPage, {tab: 'member'});
  }
}
