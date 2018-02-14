import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { FriendManagmentPage } from '../friend-managment/friend-managment';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { SinglePostPage } from '../single-post/single-post';
import { GroupInvitationPage } from '../group-invitation/group-invitation';
/*
  Generated class for the Notification page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
  providers: [DataService, PageService]

})
export class NotificationPage {
  public _notificationDataUrl = 'api/notification/getAllNotification/';
  private _changeNotificationstatus = 'api/notification/changeNotificationstatus';
  public _notificationCountDataUrl = 'api/notification/getNotification';
  public loader: boolean = false;
  public counter: number = 0;
  public notificationData: Array<any> = [];
  public totalNotiCount: any = 0;
  public scrollController: number = 1;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public page: PageService,
    public dataService: DataService,
    private modalCtrl: ModalController) {
    this.getNotification();
    this.getNotificationCount();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationPage');
  }

  public getNotification() {
    this.loader = true;
    this.dataService.getData(this._notificationDataUrl + this.counter).subscribe(res => {
      this.loader = false;
      if (res.data) {
        this.notificationData = res.data;
      }
      this.totalNotiCount = res.total;
    });
  }

  public getNotificationCount() {
    this.dataService.getData(this._notificationCountDataUrl).subscribe(res => {
      this.page.notificationData = res.data;
    });
  }

  arriveNotification(notification) {
    this.changeNoficationStatus(notification._id);
    if (notification.post_type == 1) {
      this.navCtrl.push(GroupInvitationPage);
    }
    if (notification.post_type == 8) {
      this.navCtrl.push(GroupInvitationPage);
    }

    if (notification.post_type == 9) {
      this.navCtrl.push(SubjectPage, { wallId: notification.subject_id._id });
    }
    if (notification.post_type == 10) {
      this.navCtrl.push(CollegePage, { wallId: notification.college_id._id });

    }
    if (notification.post_type == 11) {
      this.navCtrl.push(DegreePage, { wallId: notification.degree_id._id });
    }
    if (notification.post_type == 12) {
      let modal = this.modalCtrl.create(SinglePostPage, { postId: notification.post_id._id });
      modal.present();

    }
  }

  changeNoficationStatus(notifId) {
    this.dataService.getData(this._changeNotificationstatus + '/' + notifId).subscribe(res => {
      if (res.status == 2) {
        this.getNotificationCount();
        this.updateNotificationStatus(notifId);
      }
    });
  }

  public updateNotificationStatus(notifId: number) {
    for (let i in this.notificationData) {
      if (this.notificationData[i]._id == notifId) {
        this.notificationData[i].is_viewed = 1;
        break;
      }
    }
  }

  public onFriendReqAccept(notification): void {
    this.navCtrl.push(FriendManagmentPage);
    this.arriveNotification(notification);
  }

  doInfinite(infiniteScroll) {
    if (this.scrollController) {
      this.scrollController = 0;
      let parsep = this.totalNotiCount / 20;
      let page = Math.round(parsep);
      if (this.counter <= (page)) {
        this.counter++;
        this.dataService.getData(this._notificationDataUrl + this.counter).subscribe(res => {
          if (res.status == 2) {
            if (res.data.length)
              this.notificationData = this.notificationData.concat(res.data);
            this.totalNotiCount = res.total;
            this.scrollController = 1;
          }
        });
      }
    }
  }

}
