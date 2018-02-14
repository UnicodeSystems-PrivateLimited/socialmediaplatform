import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from "../../providers/user-service";
import { DataService } from "../../providers/data-service";
import { CommonService } from "../../providers/common-service";
import { TimelinePage } from '../timeline/timeline';
import { FriendProfilePage } from '../friend-profile/friend-profile';
/*
  Generated class for the MembersList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-members-list',
  templateUrl: 'members-list.html'
})
export class MembersListPage {
  public type: any; //1=>subject,2=>college,3=>Degree,4=>Group
  public id: any;
  public filterName: string = null;
  public memberType: any = 5;
  public members: Array<any> = [];
  public allMembers: Array<any> = [];
  public loader: boolean = false;
  public name: string;
  public groupname: string;
  public pendingMember: Array<any> = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public service: UserService,
    public dataService: DataService,
    private commonService: CommonService
  ) {
    if (this.navParams.data) {
      this.id = this.navParams.data.id;
      this.type = this.navParams.data.type;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MembersListPage');
    if (this.type == 1) {
      this.getAllSubjectMembers();
    } else if (this.type == 2) {
      this.getAllCollegeMembers();
    } else if (this.type == 3) {
      this.getAllDegreeMembers();
    } else if (this.type == 4) {
      this.getGroupMembersList();
    }
  }

  onChangeStudent($event) {
    console.log($event);
    if (this.type == 1) {
      if ($event == 1) {
        this.getSubjectCurrentMembers();
      } else if ($event == 2) {
        this.getSubjectPastMembers();
      }
      else if ($event == 3) {
        this.getSubjectFutureMembers();

      } else if ($event == 4) {
        this.getFriendSubjectMembers();

      } else if ($event == 5) {
        this.getAllSubjectMembers();
      }
    } else if (this.type == 2) {
      if ($event == 1) {
        this.getCollegeCurrentMembers();
      } else if ($event == 2) {
        this.getCollegePastMembers();
      }
      else if ($event == 3) {
        this.getCollegeFutureMembers();

      } else if ($event == 4) {
        this.getFriendCollegeMembers();

      } else if ($event == 5) {
        this.getAllCollegeMembers();
      }
    } else if (this.type == 3) {
      if ($event == 1) {
        this.getDegreeCurrentMembers();
      } else if ($event == 2) {
        this.getDegreePastMembers();
      }
      else if ($event == 3) {
        this.getDegreeFutureMembers();

      } else if ($event == 4) {
        this.getFriendDegreeMembers();

      } else if ($event == 5) {
        this.getAllDegreeMembers();
      }
    }
  }

  public getSubjectCurrentMembers(): void {
    this.loader = true;
    this.service.getSubjectCurrentMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.current_members;
        this.filterName = 'Current Students';
        this.name = res.subjectDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  public getSubjectFutureMembers(): void {
    this.loader = true;
    this.service.getSubjectFutureMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.future_members;
        this.filterName = 'Future Students';
        this.name = res.subjectDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  public getSubjectPastMembers(): void {
    this.loader = true;
    this.service.getSubjectPastMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.past_members;
        this.filterName = 'Past Students';
        this.name = res.subjectDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }
  public getFriendSubjectMembers(): void {
    this.loader = true;
    this.service.getSubjectFriendMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.friend_members;
        this.filterName = 'Friend Students';
        this.name = res.subjectDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }
  public getAllSubjectMembers(): void {
    this.loader = true;
    this.service.getSubjectCurrentMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.allMembers = res.subjectDetails.members;
        this.filterName = 'All Members';
        this.name = res.subjectDetails.name;
        this.groupname = '';
        this.members = [];
      }
      this.loader = false;
    });
  }

  /**College */
  public getCollegeCurrentMembers(): void {
    this.loader = true;
    this.service.getCollegeCurrentMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.current_members;
        this.filterName = 'Current Students';
        this.name = res.collegeDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  public getCollegeFutureMembers(): void {
    this.loader = true;
    this.service.getCollegeFutureMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.future_members;
        this.filterName = 'Future Students';
        this.name = res.collegeDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  public getCollegePastMembers(): void {
    this.loader = true;
    this.service.getCollegePastMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.past_members;
        this.filterName = 'Past Students';
        this.name = res.collegeDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  public getFriendCollegeMembers(): void {
    this.loader = true;
    this.service.getCollegeFriendMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.friend_members;
        this.filterName = 'Friend Students';
        this.name = res.collegeDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }
  public getAllCollegeMembers(): void {
    this.loader = true;
    this.service.getCollegePastMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.allMembers = res.collegeDetails.members;
        this.filterName = 'All Members';
        this.name = res.collegeDetails.name;
        this.groupname = '';
        this.members = [];
      }
      this.loader = false;
    });
  }

  /**Degree */

  getDegreeCurrentMembers() {
    this.loader = true;
    this.service.getDegreeCurrentMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.current_members;
        this.filterName = 'Current Students';
        this.name = res.degreeDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  getDegreePastMembers() {
    this.loader = true;
    this.service.getDegreePastMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.past_members;
        this.filterName = 'Past Students';
        this.name = res.degreeDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  getDegreeFutureMembers() {
    this.loader = true;
    this.service.getDegreeFutureMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.future_members;
        this.filterName = 'Future Students';
        this.name = res.degreeDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  public getFriendDegreeMembers(): void {
    this.loader = true;
    this.service.getDegreeFriendMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.members = res.friend_members;
        this.filterName = 'Friend Students';
        this.name = res.degreeDetails.name;
        this.groupname = '';
        this.allMembers = [];
      }
      this.loader = false;
    });
  }

  getAllDegreeMembers() {
    this.loader = true;
    this.service.getDegreeCurrentMembers(this.id).subscribe(res => {
      if (res.status == 2) {
        this.allMembers = res.degreeDetails.members;
        this.filterName = 'All Members';
        this.name = res.degreeDetails.name;
        this.groupname = '';
        this.members = [];
      }
      this.loader = false;
    });
  }

  /**Group */

  public getGroupMembersList(): void {
    this.loader = true;
    this.service.getGroupMembers(this.id).subscribe(
      res => {
        this.loader = false;
        if (res.status == 2) {
          this.allMembers = res.data.members;
          this.filterName = 'Members';
          this.groupname = res.data.title
          this.name = res.data.subject_id ? res.data.subject_id.name : res.data.college_id ? res.data.college_id.name : res.data.degree_id.name;
          this.members = [];
          if (res.data.created_by == DataService.userid) {
            this.getGroupPendingMember();
          }
        }
      });
  }

  public getGroupPendingMember(): void {
    this.service.getGroupPendingMember(this.id).subscribe((res) => {
      if (res.status == 2) {
        this.pendingMember = res.data;
      }
    })
  }

  public onClickReInvite(member: any): void {
    this.service.sendGroupInvite([member._id], this.id).subscribe((res) => {
      if (res.status == 2) {
        this.commonService.showToast("Re-invite sent successfully.");
      }
    });
  }

  public getProfileById(id): void {
    if (id == DataService.userid) {
      this.navCtrl.push(TimelinePage)
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }
}
