import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { TimelinePage } from '../timeline/timeline';
/*
  Generated class for the Follower page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-follower',
  templateUrl: 'follower.html',
  providers: [DataService]
})
export class FollowerPage {
  private _dataUrlFollower = '/api/user/dashboard/getFollower';
  public followers;
  public loader: boolean = false;
  public followersOfFriend;
  public dataServiceData: typeof DataService = DataService;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataService: DataService
  ) {
    if (navParams.data.followers) {
      this.followersOfFriend = navParams.data.followers;
    }
  }

  ionViewDidLoad() {
    this.getFollower();
  }

  getFollower() {
    this.loader = true;
    this.dataService.getData(this._dataUrlFollower).subscribe(followers => {
      this.loader = false;
      this.followers = followers.followers;
    });
  }

  getProfileById(id) {
    this.navCtrl.push(FriendProfilePage, { userId: id });
  }

  getfollowersOfFriendProfileById(id) {
    if (id == this.dataServiceData.userid) {
      this.navCtrl.push(TimelinePage);
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }
}
