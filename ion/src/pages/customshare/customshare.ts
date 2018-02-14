import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { MyWallPage } from '../my-wall/my-wall';
/*
  Generated class for the Customshare page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-customshare',
  templateUrl: 'customshare.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class CustomsharePage {

  public members: Array<any> = [];
  public userSearchField = { name: "", status: "" };
  public customPostId: any = [];
  public shareVisibility_status = 5;
  public loader: boolean = false;
  public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, shareCustom: [], custom: [] };
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public myWallService: MyWallService,
    public dataService: DataService
  ) { }

  ionViewDidLoad() {
    this.getMembers();
  }

  public getMembers() {
    this.service.getAllMembers().subscribe((res) => {
      if (res.status == 2) {
        this.members = res.data;
      }
    });
  }

  checkboxValue(ids) {
    if ((this.customPostId).includes(ids)) {
      this.customPostId.pop(ids);
      let index = this.customPostId.indexOf(ids);
      this.message.custom.splice(index);
    }
    else {
      this.customPostId.push(ids);
      this.message.custom.push({ custom_id: ids });
    }
  }

  closeVisibility() {
    let data = { customPostId: this.customPostId, custom: this.message.custom };
    this.viewCtrl.dismiss(data);
  }
}