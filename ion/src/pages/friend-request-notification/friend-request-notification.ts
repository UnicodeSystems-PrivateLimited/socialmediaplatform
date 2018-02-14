import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { FriendManagmentPage } from '../friend-managment/friend-managment';

/*
  Generated class for the FriendRequestNotification page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-friend-request-notification',
  templateUrl: 'friend-request-notification.html'
})
export class FriendRequestNotificationPage {
  public _friendRequestNotificationDataUrl = 'api/notification/getFriendRequestNotification';
  public _changeFriendNotificationstatus = 'api/notification/changeFriendRequestNotificationstatus';
  private _getAllFriendNotisUrl = '/api/notification/getAllFriendRequestNoti';
  public loader: boolean = false;
  public friendNotiCounter: number = 0;
  public totalFriendNotiCount: any = 0;
  public friendRequestnotificationData: Array<any> = [];
  public scrollController: number = 1;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public page: PageService,
    public dataService: DataService, ) {
    this.getFriendRequestNotificationCount();
    this.getFriendRequestNotifications();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendRequestNotificationPage');
  }

  getFriendRequestNotifications() {
    this.friendNotiCounter = 0;
    this.dataService.getData(this._getAllFriendNotisUrl + '/' + this.friendNotiCounter).subscribe((res) => {
      if (res.status == 2) {
        this.friendRequestnotificationData = res.data;
        this.totalFriendNotiCount = res.total;
      }
    });
  }


  getFriendRequestNotificationCount() {
    this.loader = true;
    this.dataService.getData(this._friendRequestNotificationDataUrl).subscribe(res => {
      this.loader = false;
      this.page.friendRequestnotificationData = res.data;
    });
  }


  changeFriendNoficationStatus(friendId, notifId) {
    this.dataService.getData(this._changeFriendNotificationstatus + '/' + friendId).subscribe((res) => {
      if (res.status == 2) {
        this.getFriendRequestNotificationCount();
        this.updateFriendNotificationStatus(notifId);
        this.goToFriendManagement();
      }
    });
  }

  public updateFriendNotificationStatus(notifId: number) {
    for (let i in this.friendRequestnotificationData) {
      if (this.friendRequestnotificationData[i]._id == notifId) {
        this.friendRequestnotificationData[i].is_viewed = 1;
        break;
      }
    }
  }

  public goToFriendManagement(): void {
    this.navCtrl.push(FriendManagmentPage, {
      tab: 'frndpending'
    });
  }

  doInfinite(infiniteScroll) {
    if (this.scrollController) {
      this.scrollController = 0;
      let parsep = this.totalFriendNotiCount / 20;
      let page = Math.round(parsep);
      if (this.friendNotiCounter <= (page)) {
        this.friendNotiCounter++;
        this.loader = true;
        this.dataService.getData(this._getAllFriendNotisUrl + '/' + this.friendNotiCounter).subscribe(res => {
          if (res.status == 2) {
            if (res.data.length) {
              this.friendRequestnotificationData = this.friendRequestnotificationData.concat(res.data);
            }
            this.friendNotiCounter = res.total;
            this.scrollController = 1;
            this.loader = false;
          }
        });
      }
    }
  }

}
