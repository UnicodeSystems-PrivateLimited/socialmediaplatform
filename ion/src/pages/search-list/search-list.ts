import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Searchbar } from 'ionic-angular';
import { MyWallService } from '../../providers/my-wall-service';
import { Keyboard } from 'ionic-native';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { DataService } from '../../providers/data-service';
import { GlobalSearchListPage } from '../global-search-list/global-search-list';

/*
  Generated class for the SearchList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-search-list',
  templateUrl: 'search-list.html',
  providers: [MyWallService, DataService]

})

export class SearchListPage {
  @ViewChild('searchbar') searchbar: Searchbar;
  public userSearchField = { name: "" };
  public usersSearchList: Array<any> = [];
  public _globalSearchUrl = '/api/user/memberSearch';
  public loader: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataService: DataService,
    public myWallService: MyWallService
  ) { }

  ionViewDidLoad() {
    setTimeout(() => {
      Keyboard.show();
    }, 600);
  }

  public keyboardHide(event) {
    setTimeout(() => {
      Keyboard.close();
    }, 500);
  }

  getProfileById(id) {
    this.navCtrl.push(FriendProfilePage, { userId: id });
  }

  public globalSearch(): void {
    this.loader = true;
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.userSearchField.name && this.userSearchField.name.match(nameValid)) {
      this.dataService.postData(this._globalSearchUrl, this.userSearchField)
        .subscribe(res => {
          this.loader = false;
          if (res.status == 2) {
            this.usersSearchList = res.data;
          } else {
            this.usersSearchList = [];
          }
        });
    } else {
      if (!this.userSearchField.name) {
        this.usersSearchList = [];
      }
    }
  }

  public onSeeAll(): void {
    this.navCtrl.push(GlobalSearchListPage, { name: this.userSearchField.name });
  }
}
