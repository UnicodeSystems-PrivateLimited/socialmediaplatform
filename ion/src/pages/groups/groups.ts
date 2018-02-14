import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ModalController } from 'ionic-angular';
import { CheckWallService } from '../../providers/check-wall-service';
import { GroupWallService } from '../../providers/group-wall-service';
import { DataService } from '../../providers/data-service';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { GroupWallPage } from '../group-wall/group-wall';
import { TimelinePage } from '../timeline/timeline';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { MembersListPage } from '../members-list/members-list';
import { CommonService } from "../../providers/common-service";
import { GroupAddModalPage } from '../group-add-modal/group-add-modal';
import { GroupSearch } from '../../interfaces/common-interfaces';
import { GroupInvitationPage } from '../group-invitation/group-invitation';
/*
  Generated class for the Groups page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html'
})
export class GroupsPage {

  public tab: string = "myEvent";
  isAndroid: boolean = false;
  public loader: boolean = false;
  public currentWall: number;
  public currentWallName: String;
  public scdId: any;
  public groupsList: Array<any> = [];
  public totalGroups: number = null;
  public counter: number = 0;
  public userData: typeof DataService = DataService;
  public scrollController: number = 1;
  public parsep;
  public accordian: boolean = false;
  public groupSearch: GroupSearch = new GroupSearch();
  public searchMember: any = { name: null };
  public searchedMemberList: Array<any> = [];
  public groupType = 1;
  public sortValue: number = 1;
  public sortOrder: number = 1;
  public searchActive: boolean = false;
  public searchText: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    platform: Platform,
    private checkWallService: CheckWallService,
    public groupWallService: GroupWallService,
    public dataService: DataService,
    public commonService: CommonService,
    public modalCtrl: ModalController
  ) {
    this.checkWallService.getActiveWall().subscribe(val => this.currentWall = val);
    this.checkWallService.getActiveWallName().subscribe(val => this.currentWallName = val);
    if (navParams && navParams.data.wallId) {
      this.scdId = navParams.data.wallId;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupsPage');
    this.checkWhichWallGroupsWillShow();
  }

  public checkWhichWallGroupsWillShow() {
    this.counter = 0;   
    this.scrollController = 1;    
    if (this.currentWall == 0) {
      this.getGroups();
    }
    else {
      this.getSCDGroups();
    }
  }

  public getGroups() {
    this.loader = true;
    this.groupWallService.getGroups(this.counter).subscribe((res) => {
      if (res.status == 2) {
        this.groupsList = res['data'];
        this.totalGroups = res['total'];
      }
      this.loader = false;
    });
  }

  // get SCD groups
  public getSCDGroups(): void {
    this.loader = true;
    this.groupWallService.getSCDGroups(this.currentWall, this.scdId, 0).subscribe(res => {
      if (res.status == 2) {
        if (res.data) {
          this.groupsList = res.data;
          this.totalGroups = res.total;
        }
      }
      this.loader = false;
    });
  }

  getGroupWall(id: any) {
    this.navCtrl.push(GroupWallPage, { wallId: id });
  }

  public getProfileById(id): void {
    if (id == DataService.userid) {
      this.navCtrl.push(TimelinePage);
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }

  getSubjectWall(id) {
    this.navCtrl.push(SubjectPage, { wallId: id });
  }

  getCollegeWall(id) {
    this.navCtrl.push(CollegePage, { wallId: id });
  }

  getDegreeWall(id) {
    this.navCtrl.push(DegreePage, { wallId: id });
  }

  public onMemberClick(id) {
    this.navCtrl.push(MembersListPage, { id: id, type: 4 });
  }

  public joinToGroup(id: number, index: number): void {
    this.groupWallService.joinGroup(id).subscribe((res) => {
      if (res.status == 2) {
        this.groupsList[index] = res['data'];
        this.commonService.showToast(res.msg);
      }
    });
  }

  public onClickleaveGroup(id: number, index: number) {
    this.commonService.showConfirm("", "Are you sure you want to leave this group ?", () => this.leaveFromGroup(id, index));
  }

  public leaveFromGroup(id, index): void {
    this.groupWallService.leaveGroup(id).subscribe((res) => {
      if (res.status == 2) {
        this.groupsList[index] = res['data'];
        this.commonService.showToast(res.msg);
      }
    });
  }

  doInfinite(infiniteScroll) {
    if (!this.searchActive) {
      if (this.scrollController) {
        this.scrollController = 0;
        this.parsep = this.totalGroups / 10
        var page = parseInt(this.parsep);
        if (this.counter <= (page + 1)) {
          this.counter++;
          this.loader = true;
          if ((this.currentWall != 0) && this.scdId) {
            this.groupWallService.getSCDGroups(this.currentWall, this.scdId, this.counter).subscribe(res => {
              if (res.status == 2) {
                if (res.data) {
                  this.groupsList = this.groupsList.concat(res.data);
                  this.totalGroups = res.total;
                }
                this.loader = false;
                this.scrollController = 1;
              }
            });
          } else {
            this.groupWallService.getGroups(this.counter).subscribe((res) => {
              if (res.status == 2) {
                this.groupsList = this.groupsList.concat(res['data']);
                this.totalGroups = res['total'];
              }
              this.loader = false;
              this.scrollController = 1;
            });
          }
        }
      }
    } else {
      if (this.scrollController) {
        this.scrollController = 0;
        this.parsep = this.totalGroups / 10
        var page = parseInt(this.parsep);
        if (this.counter <= (page + 1)) {
          this.counter++;
          this.loader = true;
          if ((this.currentWall != 0) && this.scdId) {
            this.groupWallService.scdGroupSearch(this.currentWall, this.scdId, this.counter, this.groupSearch).subscribe(res => {
              if (res.status == 2) {
                if (res.data) {
                  this.groupsList = this.groupsList.concat(res.data);
                }
                this.loader = false;
                this.groupSearch = new GroupSearch();
              }
              this.scrollController = 1;
            });
          } else {
            this.groupWallService.groupSearch(this.counter, this.groupSearch).subscribe(res => {
              if (res.status == 2) {
                if (res.data) {
                  this.groupsList = this.groupsList.concat(res.data);
                }
                this.loader = false;
                this.groupSearch = new GroupSearch();
              }
              this.scrollController = 1;
            });
          }
        }
      }
    }
    setTimeout(() => {
      infiniteScroll.complete();
    }, 500);
  }

  public onDeleteClick(id: number, index: number) {
    this.commonService.showConfirm("", "Are you sure you want to delete this group ?", () => this.deleteGroup(id, index));
  }

  public deleteGroup(id, index): void {
    this.groupWallService.deleteGroup(id).subscribe((res) => {
      if (res.status == 2) {
        this.groupsList.splice(index, 1);
        this.commonService.showToast(res.msg);
      }
    });
  }

  public addGroup() {
    let modal = this.modalCtrl.create(GroupAddModalPage);
    modal.onDidDismiss(data => {
      this.checkWhichWallGroupsWillShow();
    });
    modal.present();
  }
  public onEditClick(group: any) {
    let modal = this.modalCtrl.create(GroupAddModalPage, { group: group });
    modal.onDidDismiss(data => {
      this.checkWhichWallGroupsWillShow();
    });
    modal.present();
  }

  advancesearch() {
    this.accordian = !this.accordian;
  }

  public userSearch(event: any): void {
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.searchMember.name) {
      if (this.searchMember.name.match(nameValid)) {
        this.groupWallService.getAllUser(0, this.searchMember).subscribe((res) => {
          if (res.status == 2) {
            this.searchedMemberList = res.searchedMember;
          }
        })
      }
    } else {
      this.searchMember.name = null;
      this.searchedMemberList = [];
      this.groupSearch.memberId = null;
    }
  }
  public selectUser(member: any): void {
    this.groupSearch.memberId = member._id;
    this.searchMember.name = member.fname + ' ' + member.lname;
    this.searchedMemberList = [];
  }

  onSelectingGroupType(event) {
    console.log(event);
    this.groupSearch.groupTypes = event;
    this.groupType = event;
  }

  public onSelectingSortType(sortType: any): void {
    this.groupSearch.sortType = sortType.value;
    this.sortValue = sortType.value;
  }

  public onSelectingSortOrder(sortOrder: any): void {
    this.groupSearch.sortOrder = sortOrder.value;
    this.sortOrder = sortOrder.value;
  }

  public resetSearch(): void {
    this.searchText = false;
    this.groupSearch = new GroupSearch();
    this.counter = 0;
    this.searchActive = false;
    this.searchedMemberList = [];
    this.searchMember.name = '';
    this.scrollController = 1;
    this.groupType = 1;
    this.sortOrder = 1;
    this.sortValue = 1;
    if (this.currentWall == 0) {
      this.getGroups();
    }
    else {
      this.getSCDGroups();
    }
  }

  public onClickSearch(): void {
    this.loader = true;
    this.searchActive = true;
    this.searchText = true;
    if (this.currentWall == 0) {
      this.groupWallService.groupSearch(0, this.groupSearch).subscribe((res) => {
        if (res.status == 2) {
          if (res.data) {
            this.groupsList = res['data'];
          }
          this.totalGroups = res.total;
          this.loader = false;
        } else {
          this.commonService.showToast('No search result found');
        }
      });
    } else {
      this.groupWallService.scdGroupSearch(this.currentWall, this.scdId, 0, this.groupSearch).subscribe((res) => {
        if (res.status == 2) {
          if (res.data) {
            this.groupsList = res['data'];
          }
          this.totalGroups = res.total;
          this.loader = false;
        } else {
          this.commonService.showToast('No search result found');
        }
      });
    }
  }

  onGroupInvite(){
    this.navCtrl.push(GroupInvitationPage);
  }
}
