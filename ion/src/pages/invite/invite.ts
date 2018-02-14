import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { CheckWallService } from '../../providers/check-wall-service';
import { CommonService } from '../../providers/common-service';
import { InviteFriendsService } from '../../providers/invite-friends-service';
import { SocialSharing } from 'ionic-native';
import { MembersPage } from '../members/members';
import { GroupInviteUserSearch } from '../../interfaces';


/*
  Generated class for the Invite page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html',
})

export class InvitePage {
  public subject: string = '';
  public apiBaseUrl: string;
  public wallType: string;
  public searchInput: string = '';
  public data: typeof DataService = DataService;
  public modalTitle: string = "Add to my friends";
  public currentWall: any;
  public searchUserType: GroupInviteUserSearch = new GroupInviteUserSearch();
  public searchedMemeberList: Array<any> = [];
  public inviteTitle: string = '';
  public selectedMemberIds: Array<any> = [];
  public selectedMemberlist: Array<any> = [];
  public url:string = '';
  public tab: string = 'internal';
  public isRegister:boolean = false;
  constructor(private navCtrl: NavController,
    private navParams: NavParams,
    private pageService: PageService,
    private platform: Platform,
    private dataService: DataService,
    private checkWallService: CheckWallService,
    private service: InviteFriendsService,
    private commonService: CommonService,
  ) {
    this.apiBaseUrl = dataService.apiBaseUrl;
    this.checkWallService.getInviteActiveWall().subscribe(val => this.currentWall = val);
    this.isRegister = navParams.data.isRegister;
    if(this.isRegister){
      this.tab = 'external';
    }
       if (this.platform.is('android')) {
         this.url ='https://play.google.com/store/apps/details?id=com.ionicframework.stribein';
       }
       if (this.platform.is('ios')) {
         this.url ='https://itunes.apple.com/lc/app/stribein-social-network/id1316410675?mt=8';
       }
  }

  ionViewDidLoad() {
    this.setData();
  }
  ionViewWillEnter() {
    this.setData();
  }

  public setData() {
    if (this.currentWall != 0) {
      if (this.currentWall == 1) {
        this.modalTitle = "Add friends to this subject";
        this.inviteTitle = DataService.userFullName + ' has invited you to join StribeIN to connect with other students who are networking around ' + this.pageService.walldetails.name + '. Please click on the link to join the conversation. Thanks. ';
        // this.url = 'https://market://details?id=com.itouch.tappit';
      }
      if (this.currentWall == 2) {
        this.modalTitle = "Add friends to this college";
        this.inviteTitle = DataService.userFullName + ' has invited you to join StribeIN to connect with other students who are involved with ' + this.pageService.walldetails.name + '. Please click on the link to join the conversation. Thanks.';
        // this.url = 'Please click on the link to join the conversation http://stribein.com. Thanks.';
      }
      if (this.currentWall == 3) {
        this.modalTitle = "Add friends to this degree";
        this.inviteTitle = DataService.userFullName + ' has invited you to join StribeIN to connect with other students who are pursuing ' + this.pageService.walldetails.name + '. Please click on the link to join the conversation. Thanks.';
        // this.url = 'Please click on the link to join the conversation http://stribein.com. Thanks.';
      }
      if (this.currentWall == 4) {
        this.modalTitle = "Add friends to this group";
        this.inviteTitle = DataService.userFullName + ' has invited you to Join StribeIN to connect with others who are the members of the Group ' + this.pageService.walldetails.title + ' under ' + (this.pageService.walldetails.subject_id ? this.pageService.walldetails.subject_id.name : this.pageService.walldetails.college_id ? this.pageService.walldetails.college_id.name : this.pageService.walldetails.degree_id.name) +'. Please click on the link to join the conversation. Thanks.';
        // this.url = 'Please Click on the link to join the conversation http://stribein.com. Thanks.';
      }
    } else {
      this.modalTitle = "Add to my friends";
      this.searchUserType.friends = false;
      this.searchUserType.allMembers = true;
      this.inviteTitle = DataService.userFullName + ' invites you to join StribeIN. A networking platform for students to connect, make friends & learn from each other. To see the details on StribeIN click on the link below (or copy and paste the URL into your browser). Thanks.';
    }
  }

  public searchMembers(event: any): void {
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.searchUserType.name) {
      if (this.searchUserType.name.match(nameValid)) {
        if (this.currentWall != 0) {
          this.service.getUserList(this.searchUserType).subscribe((res) => {
            if (res.status == 2) {
              this.searchedMemeberList = res.data;
            }
          });
        } else {
          this.service.getNonFriendsList(this.searchUserType).subscribe((res) => {
            if (res.status == 2) {
              this.searchedMemeberList = res.data;
            }
          })
        }
      }
    } else {
      this.searchedMemeberList = [];
      this.searchUserType.name = null;
    }
  }

  public selectUser(member: any): void {
    this.selectedMemberIds.push(member._id);
    this.selectedMemberlist.push(member);
    this.searchedMemeberList = [];
    this.searchUserType.name = null;
  }

  public deleteSelectedMember(userId: number): void {
    let index = this.selectedMemberIds.indexOf(userId);
    this.selectedMemberIds.splice(index, 1);
    this.selectedMemberlist.splice(index, 1);
  }

  public onInviteFriend(): void {
    if (!this.selectedMemberIds.length) {
      this.commonService.showToast('Please select member');
    } else {
      if (this.currentWall == 4) {
        this.service.sendGroupInvite(this.selectedMemberIds, this.pageService.walldetails._id).subscribe((res) => {
          if (res.status == 2) {
            this.commonService.showToast("Invitation sent successfully.");
            this.selectedMemberIds = [];
            this.selectedMemberlist = [];
            this.searchUserType = new GroupInviteUserSearch();
          }
        });
      } else if (this.pageService.walldetails._id && (this.currentWall == 1 || this.currentWall == 2 || this.currentWall == 3)) {
        this.service.sendSCDInvite(this.selectedMemberIds, this.pageService.walldetails._id, this.pageService.wall_type).subscribe((res) => {
          if (res.status == 2) {
            this.commonService.showToast("Invitation sent successfully.");
            this.selectedMemberIds = [];
            this.selectedMemberlist = [];
            this.searchUserType = new GroupInviteUserSearch();
          }
        });
      } else {
        this.service.sendFriendInvite(this.selectedMemberIds).subscribe((res) => {
          if (res.status == 2) {
            this.commonService.showToast("Invitation sent successfully.");
            this.selectedMemberIds = [];
            this.selectedMemberlist = [];
            this.searchUserType = new GroupInviteUserSearch();
            this.searchUserType.friends = false;
            this.searchUserType.allMembers = true;
          }
        })

      }
    }
  }
  public onExternalInvite(event: any) {
    this.subject = DataService.userFullName + ' invites you to join & connect StribeIN.';
    SocialSharing.share(this.inviteTitle, this.subject,'',this.url)
      .then((data) => {
        console.log('Shared via SharePicker');
        // this.inviteTitle = '';
      })
      .catch((err) => {
        console.log('Was not shared via SharePicker');
        // this.inviteTitle = '';
      });

  }
}
