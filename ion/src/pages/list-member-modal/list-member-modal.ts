import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { CommonService } from '../../providers/common-service';
/*
  Generated class for the ListMemberModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-list-member-modal',
  templateUrl: 'list-member-modal.html',
  providers: [DataService, CommonService]
})
export class ListMemberModalPage {
  public _addMemberUrl = '/api/list/addmembers/';
  public _userSearchUrl = '/api/user/userSearchByStatus';
  public friends;
  public memberId: any[] = [];
  public listId;
  public selectedItem: boolean[] = [];
  public list;
  public members: any[] = [];
  public userSearchField = { name: "", status: "" };
  public userSearchList;
  public userSearchCount;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public dataService: DataService,
    public commonService: CommonService
  ) {
    this.friends = navParams.data.friends;
    this.listId = navParams.data.listId;
    this.list = navParams.data.list;
    this.members = this.list.members;
  }

  ionViewDidLoad() {
    for (var i = 0; i < this.friends.length; i++) {
      for (var j = 0; j < this.members.length; j++) {
        if (this.friends[i].friend_id == this.members[j].user_id._id) {
          this.selectedItem[this.friends[i].friend_id] = true;
        }
      }
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  saveMembers() {
    for (let i in this.selectedItem) {
      if (this.selectedItem[i]) {
        this.memberId.push(i);
      }
    }
    this.dataService.postData(this._addMemberUrl + this.listId, { members: this.memberId }).subscribe(res => {
      if (res.status === 2) {
        this.memberId = [];
        this.dismiss();
      }
    });
  }

  userSearch(e) {
    this.userSearchField.status = '3'; //3 for current friend
    if (this.userSearchField.name == '' || this.userSearchField.name == null) {
      this.userSearchList = null;
    }
    else {
      var nameValid = /^[a-z\d\-_\s]+$/i;
      if (this.userSearchField.name.match(nameValid)) {
        this.dataService.postData(this._userSearchUrl, this.userSearchField)
          .subscribe(res => {
            if (res.status === 2) {
              this.userSearchList = res.data;
              this.userSearchCount = this.userSearchList.length;
            }
            else { this.userSearchList = null; }
          });
      }
    }
  }

}
