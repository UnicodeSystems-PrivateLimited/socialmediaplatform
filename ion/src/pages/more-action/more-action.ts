import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, App, ViewController } from 'ionic-angular';
import { EventsPage } from '../events/events';
import { GroupsPage } from '../groups/groups';
import { MembersPage } from '../members/members';
import { FriendManagmentPage } from '../friend-managment/friend-managment';
import { ChatPage } from '../chat/chat';
import { PageService } from '../../providers/page-service';
import { CheckWallService } from '../../providers/check-wall-service';
import { UserService } from '../../providers/user-service';
import { CommonService } from '../../providers/common-service';
import { GroupWallService } from '../../providers/group-wall-service';


/*
  Generated class for the SubjectMenu page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-more-action',
  templateUrl: 'more-action.html'
})
export class MoreactionPage {
  public wallId: any;
  public groupId: any;
  subpages: Array<{ title: string, component: any, name: string }>;
  public currentWall: number;
  public leaveTitle: string;
  public isAdmin: boolean = false;
  public is_member: boolean ;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    protected app: App,
    public viewCtrl: ViewController,
    public page: PageService,
    private checkWallService: CheckWallService,
    private userService: UserService,
    private commonService: CommonService,
    private groupWallService: GroupWallService

  ) {
    this.checkWallService.getInviteActiveWall().subscribe(val => this.currentWall = val);
    this.checkWallService.getGroupAdmin().subscribe(val => this.isAdmin = val);
    this.checkWallService.getMember().subscribe(val => this.is_member = val);
    this.subpages = [
      { title: 'Events', component: EventsPage, name: 'calendar' },
      { title: 'Groups', component: GroupsPage, name: 'people' },
      { title: 'Members', component: MembersPage, name: 'friend-mngmt' },
      { title: 'Friends', component: FriendManagmentPage, name: 'friend' },
      // { title: 'Chat', component: ChatPage, name: 'chatbubbles' },
    ];
    if (navParams && navParams.data.wallId) {
      this.wallId = navParams.data.wallId;
    }
    if (navParams && navParams.data.groupId) {
      this.groupId = navParams.data.groupId;
    }
  }

  ionViewDidLoad() {
    this.leaveTitle = this.currentWall == 1 ? 'Subject' : this.currentWall == 2 ? 'College' : this.currentWall == 3 ? 'Degree' : this.currentWall == 4 ? 'Group' : '';
}

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if (page.component == GroupsPage) {
      this.viewCtrl.dismiss();
      this.app.getRootNav().push(GroupsPage, { wallId: this.wallId });
    }
    else {
      this.viewCtrl.dismiss();
      this.app.getRootNav().push(page.component);
    }
  }

  public onLeaveClick() {
    this.commonService.showConfirm("", 'Are you sure you want to leave this group ?', () => this.leaveGroup());
  }

  public onLeave() {
    if (this.currentWall == 1) {
      this.leaveSubject();
    } else if (this.currentWall == 2) {
      this.leaveCollege();
    } else if (this.currentWall == 3) {
      this.leaveDegree();
    } else if(this.currentWall == 4) {
      this.leaveGroup();
    }
  }

  public leaveSubject(): void {
    let wall_type = 'Subject';
    this.userService.leaveSCD(this.wallId, wall_type).subscribe((res) => {
      if (res.status == 2) {
        this.checkWallService.setMember(false);
        this.commonService.showToast(res.message);
         this.viewCtrl.dismiss();
      }
    });
  }

  public leaveGroup(): void {
    this.groupWallService.leaveGroup(this.groupId).subscribe((res) => {
      if (res.status == 2) {
        this.checkWallService.setMember(false);
        this.commonService.showToast(res.msg);
         this.viewCtrl.dismiss();
      }
    });
  }
  public leaveCollege(): void {
    let wall_type = 'College';
    this.userService.leaveSCD(this.wallId, wall_type).subscribe((res) => {
      if (res.status == 2) {
        this.checkWallService.setMember(false);
        this.commonService.showToast(res.message);
         this.viewCtrl.dismiss();
      }
    });
  }
  public leaveDegree(): void {
    let wall_type = 'Degree';
    this.userService.leaveSCD(this.wallId, wall_type).subscribe((res) => {
      if (res.status == 2) {
        this.checkWallService.setMember(false);
        this.commonService.showToast(res.message);
         this.viewCtrl.dismiss();
      }
    });
  }
}
