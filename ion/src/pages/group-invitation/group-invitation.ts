import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GroupWallService } from '../../providers/group-wall-service';
import { CommonService } from '../../providers/common-service';
import { PageService } from '../../providers/page-service';
import { GroupWallPage } from '../group-wall/group-wall';
/*
  Generated class for the GroupInvitation page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-group-invitation',
  templateUrl: 'group-invitation.html'
})
export class GroupInvitationPage {
  public counter: number = 0;
  public totalNotification: number = 0;
  public notificationList: Array<any> = [];
  public scrollController: number = 1;
  public loader: boolean = false;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private service: GroupWallService,
    private commonService: CommonService,
    private pageService: PageService) {

  }

  ionViewDidLoad() {
    this.getUserGroupNotification();
  }

  public getUserGroupNotification(): void {
    this.loader = true;
    this.service.getUserGroupNotification(this.counter).subscribe((res) => {
      if (res.status == 2) {
        this.loader = false;
        console.log("res", res);
        this.notificationList = res.data;
        this.totalNotification = res.tottal;
        this.scrollController = 1;
      }
    });
  }

  doInfinite(infiniteScroll) {
    if (this.scrollController) {
      this.scrollController = 0;
      let parsep = this.totalNotification / 20;
      let page = Math.round(parsep);
      if (this.counter <= (page)) {
        this.counter++;
        this.getUserGroupNotification();
      }
    }
  }

  public onAcceptClick(noti: any): void {
    this.service.acceptInvite(noti.groupId._id, noti.from._id).subscribe((res) => {
      if (res.status == 2) {
        this.commonService.showToast(res.msg);
        this.pageService.wallId = noti.groupId._id;
        this.navCtrl.push(GroupWallPage, { wallId: noti.groupId._id });
      }
    });
  }

  public onRejectClick(noti: any): void {
    this.service.rejectInvite(noti.groupId._id, noti.from._id).subscribe((res) => {
      if (res.status == 2) {
        this.counter = 0;
        this.getUserGroupNotification();
        this.commonService.showToast(res.msg);
      }
    });
  }
}
