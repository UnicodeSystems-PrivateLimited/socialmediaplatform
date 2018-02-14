import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { GlobalSearchDetailPage } from '../global-search-detail/global-search-detail';
import { GroupWallPage } from '../group-wall/group-wall';

/*
  Generated class for the GlobalSearchList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-global-search-list',
  templateUrl: 'global-search-list.html'
})
export class GlobalSearchListPage {
  public _searchDataUrl = '/api/user/search';
  public name: string;
  public loader: boolean = false;
  public searchField = { name: "" };
  public members: Array<any> = [];
  public subjects: Array<any> = [];
  public colleges: Array<any> = [];
  public degrees: Array<any> = [];
  public groups: Array<any> = [];
  public events: Array<any> = [];
  constructor(public navCtrl: NavController,
    public dataService: DataService,
    public navParams: NavParams) {
    this.name = this.navParams.data.name;
  }


  ngOnInit() {
    this.searchList();
  }

  public searchList(): void {
    this.searchField.name = this.name;
    this.loader = true;
    if (this.searchField.name) {
      this.dataService.postData(this._searchDataUrl, this.searchField)
        .subscribe(res => {
          this.loader = false;
          if (res.status == 2) {
            if (res.members) {
              this.members = res.members;
            }
            if (res.subjects) {
              this.subjects = res.subjects;
            }
            if (res.colleges) {
              this.colleges = res.colleges;
            }
            if (res.degrees) {
              this.degrees = res.degrees;
            }
            if (res.groups) {
              this.groups = res.groups;
            }
            if (res.events) {
              this.events = res.events;
            }
          }
        });
    } else {
      console.log('name not found');
    }
  }

  getProfileById(id) {
    this.navCtrl.push(FriendProfilePage, { userId: id });
  }

  goTosubject(wallId) {
    this.navCtrl.push(SubjectPage, { wallId: wallId });
  }

  goTocollege(wallId) {
    this.navCtrl.push(CollegePage, { wallId: wallId });
  }

  goTodegree(wallId) {
    this.navCtrl.push(DegreePage, { wallId: wallId });
  }

   getGroupWall(wallId) {
    this.navCtrl.push(GroupWallPage, { wallId: wallId });
  }


  onSeeAllClick(type: number): void {
    this.navCtrl.push(GlobalSearchDetailPage, { type: type, name: this.name });
  }

}
