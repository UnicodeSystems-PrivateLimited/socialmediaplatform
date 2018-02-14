import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { GroupWallPage } from '../group-wall/group-wall';
import { FriendProfilePage } from '../friend-profile/friend-profile';

/*
  Generated class for the GlobalSearchDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-global-search-detail',
  templateUrl: 'global-search-detail.html'
})
export class GlobalSearchDetailPage {
  public _allMembersDataUrl = '/api/user/getAllSearchedMember/';
  public _allSubjectsDataUrl = '/api/user/getAllSearchedSubject/';
  public _allCollegesDataUrl = '/api/user/getAllSearchedCollege/';
  public _allDegreesDataUrl = '/api/user/getAllSearchedDegree/';
  public _allGroupDataUrl = '/api/user/getAllSearchedGroups/';
  public _allEventDataUrl = '/api/user/getAllSearchedEvents/';
  public type: any;
  public heading: string;
  public name: string;
  public searchField = { name: "" };
  public dataList: Array<any> = [];
  public counter: number = 0;
  public scrollActive: boolean = false;
  public loader: boolean = false;
  constructor(public navCtrl: NavController,
    public dataService: DataService,
    public navParams: NavParams) {
    this.name = this.navParams.data.name;
    this.type = this.navParams.data.type; // 1=members,2=subjects,3=college,4=degree
  }


  ngOnInit() {
    this.heading = this.type == 1 ? 'Member' : this.type == 2 ? 'Subject' : this.type == 3 ? 'College' : this.type == 4 ? 'Degree' : this.type == 5 ? 'Group' : 'Events';

    if (this.type == 1) {
      this.searchedMemberList();
    } else if (this.type == 2) {
      this.searchedSubjectList();
    } else if (this.type == 3) {
      this.searchedCollegeList();
    } else if (this.type == 4) {
      this.searchedDegreeList();
    } else if (this.type == 5) {
      this.searchedGroupList();
    } else if (this.type == 6) {
      this.searchedEventList();

    }

  }


  public searchedMemberList(): void {
    this.searchField.name = this.name;
    this.loader = true;
    if (this.searchField.name) {
      this.dataService.postData(this._allMembersDataUrl + this.counter, this.searchField)
        .subscribe(res => {
          this.loader = false;
          if (res.status == 2) {
            if (res.searchedMember.length == 0) {
              this.scrollActive = false;
            } else {
              this.scrollActive = true;
            }

            if (res.searchedMember.length && this.counter == 0) {
              this.dataList = res.searchedMember;
            }
            if (res.searchedMember.length && this.counter !== 0) {
              this.dataList = this.dataList.concat(res.searchedMember);
            }
            this.counter++;
          }
        });
    } else {
      console.log('name not found');
    }
  }
  public searchedSubjectList(): void {
    this.loader = true;
    this.searchField.name = this.name;
    if (this.searchField.name) {
      this.dataService.postData(this._allSubjectsDataUrl + this.counter, this.searchField)
        .subscribe(res => {
          this.loader = false;
          if (res.status == 2) {
            if (res.searchedSubjects.length == 0) {
              this.scrollActive = false;
            } else {
              this.scrollActive = true;
            }
            if (res.searchedSubjects.length && this.counter == 0) {
              this.dataList = res.searchedSubjects;
            }
            if (res.searchedSubjects.length && this.counter !== 0) {
              this.dataList = this.dataList.concat(res.searchedSubjects);
            }
            this.counter++;
          }
        });
    } else {
      console.log('name not found');
    }
  }
  public searchedCollegeList(): void {
    this.loader = true;
    this.searchField.name = this.name;
    if (this.searchField.name) {
      this.dataService.postData(this._allCollegesDataUrl + this.counter, this.searchField)
        .subscribe(res => {
          this.loader = false;
          if (res.status == 2) {
            if (res.searchedCollege.length == 0) {
              this.scrollActive = false;
            } else {
              this.scrollActive = true;
            }
            if (res.searchedCollege.length && this.counter == 0) {
              this.dataList = res.searchedCollege;
            }
            if (res.searchedCollege.length && this.counter !== 0) {
              this.dataList = this.dataList.concat(res.searchedCollege);
            }
            this.counter++;
          }
        });
    } else {
      console.log('name not found');
    }
  }
  public searchedDegreeList(): void {
    this.loader = true;
    this.searchField.name = this.name;
    if (this.searchField.name) {
      this.dataService.postData(this._allDegreesDataUrl + this.counter, this.searchField)
        .subscribe(res => {
          this.loader = false;
          if (res.status == 2) {
            if (res.searchedDegree.length == 0) {
              this.scrollActive = false;
            } else {
              this.scrollActive = true;
            }
            if (res.searchedDegree.length && this.counter == 0) {
              this.dataList = res.searchedDegree;
            }
            if (res.searchedDegree.length && this.counter !== 0) {
              this.dataList = this.dataList.concat(res.searchedDegree);
            }
            this.counter++;
          }
        });
    } else {
      console.log('name not found');
    }
  }

  public searchedGroupList(): void {
    this.loader = true;
    this.searchField.name = this.name;
    if (this.searchField.name) {
      this.dataService.postData(this._allGroupDataUrl + this.counter, this.searchField)
        .subscribe(res => {
          this.loader = false;
          if (res.status == 2) {
            if (res.searchedGroup.length == 0) {
              this.scrollActive = false;
            } else {
              this.scrollActive = true;
            }
            if (res.searchedGroup.length && this.counter == 0) {
              this.dataList = res.searchedGroup;
            }
            if (res.searchedGroup.length && this.counter !== 0) {
              this.dataList = this.dataList.concat(res.searchedGroup);
            }
            this.counter++;
          }
        });
    } else {
      console.log('name not found');
    }
  }

  public searchedEventList(): void {
    this.loader = true;
    this.searchField.name = this.name;
    if (this.searchField.name) {
      this.dataService.postData(this._allEventDataUrl + this.counter, this.searchField)
        .subscribe(res => {
          this.loader = false;
          if (res.status == 2) {
            if (res.searchedEvent.length == 0) {
              this.scrollActive = false;
            } else {
              this.scrollActive = true;
            }
            if (res.searchedEvent.length && this.counter == 0) {
              this.dataList = res.searchedEvent;
            }
            if (res.searchedEvent.length && this.counter !== 0) {
              this.dataList = this.dataList.concat(res.searchedEvent);
            }
            this.counter++;
          }
        });
    } else {
      console.log('name not found');
    }
  }

  getProfileById(id) {
    this.navCtrl.push(FriendProfilePage, { userId: id });
  }

  getSubjectWall(wallId) {
    this.navCtrl.push(SubjectPage, { wallId: wallId });
  }

  getCollegeWall(wallId) {
    this.navCtrl.push(CollegePage, { wallId: wallId });
  }

  getDegreeWall(wallId) {
    this.navCtrl.push(DegreePage, { wallId: wallId });
  }
  getGroupWall(wallId) {
    this.navCtrl.push(GroupWallPage, { wallId: wallId });
  }


  public onItemClick(id): void {
    if (this.type == 1) {
      this.getProfileById(id);
    } else if (this.type == 2) {
      this.getSubjectWall(id);
    } else if (this.type == 3) {
      this.getCollegeWall(id);
    } else if (this.type == 4) {
      this.getDegreeWall(id);
    } else if (this.type == 5) {
      this.getGroupWall(id);
    }

  }

  doInfinite(infiniteScroll) {
    if (this.scrollActive) {
      this.scrollActive = false;
      if (this.type == 1) {
        this.searchedMemberList();
      } else if (this.type == 2) {
        this.searchedSubjectList();
      } else if (this.type == 3) {
        this.searchedCollegeList();
      } else if (this.type == 4) {
        this.searchedDegreeList();
      } else if (this.type == 5) {
        this.searchedGroupList();
      } else if (this.type == 6) {
        this.searchedEventList();
      }
    }

  }



}
