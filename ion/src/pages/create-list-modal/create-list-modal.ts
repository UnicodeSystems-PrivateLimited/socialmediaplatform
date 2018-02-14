import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
/*
  Generated class for the CreateListModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-create-list-modal',
  templateUrl: 'create-list-modal.html',
  providers: [DataService, CommonService, PageService]
})
export class CreateListModalPage {
  public _dataUrlListAdd = '/api/list/addList';
  public _dataUrlListEdit = 'api/list/updateList';
  public listData = { id: -1, title: '' };
  public listId;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public dataService: DataService,
    public commonService: CommonService
  ) {
    if (typeof (navParams.data.list) != "undefined") {
      this.listData.title = navParams.data.list.title;
    }
    else {
      this.listData.title = '';
    }

    this.listId = navParams.data.listId;
    console.log('navParams', navParams);
    console.log('this.listData.title', this.listData.title);
    console.log('this.listId', this.listId);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateListModalPage');
  }

  dismiss() {
    let data = { list: this.listData };
    this.viewCtrl.dismiss(data);
  }

  addList() {
    var letters = /^[a-z\d\-_\s]+$/i;
    console.log('this.listData.title', this.listData.title);
    if (this.listData.title != '' && this.listData.title.match(letters)) {
      this.dataService.postData(this._dataUrlListAdd, this.listData)
        .subscribe(res => {
          console.log("add res:", res);
          if (res.status === 2) {
            this.listData = res;
            this.dismiss();
          }
        });
    } else {
      this.commonService.showToast('Title cannot be empty');
    }
  }

  editList() {
    var letters = /^[a-z\d\-_\s]+$/i;
    console.log('this.listData.title', this.listData.title);
    this.listData.id = this.listId;
    if (this.listData.title != '' && this.listData.title.match(letters)) {
      this.dataService.postData(this._dataUrlListEdit, this.listData)
        .subscribe(res => {
          console.log("edit res:", res);
          if (res.status === 2) {
            this.listData = res;
            this.dismiss();
          }
        });
    } else {
      this.commonService.showToast('Title cannot be empty');
    }
  }
}
