import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { MyWallPage } from '../my-wall/my-wall';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { SinglePostPage } from '../single-post/single-post';

/*
  Generated class for the CustomVisibilty page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-custom-visibilty',
  templateUrl: 'custom-visibilty.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class CustomVisibiltyPage {

  public friends;
  public userSearchField = { name: "" };
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
    console.log('ionViewDidLoad CustomVisibiltyPage');
    this.getAllTypeFriends();
  }

  getAllTypeFriends() {
    this.loader = true;
    this.service.getAllTypeFriends()
      .then((res) => {
        console.log("response", res);
        this.friends = res.data;
        console.log("this.friends", this.friends);
        this.loader = false;
      }, (err) => {
        console.log('not found', err);
        this.loader = false;
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      })
  }


  checkboxValue(ids) {
    console.log('ids', ids);
    if ((this.customPostId).includes(ids)) {
      this.customPostId.pop(ids);
      let index = this.customPostId.indexOf(ids);
      console.log(index);
      this.message.custom.splice(index);

    }
    else {
      this.customPostId.push(ids);
      this.message.custom.push({ custom_id: ids });

    }
    console.log(this.message.custom);
  }


  closeVisibility() {
    let data = { customPostId: this.customPostId, custom: this.message.custom };
    this.viewCtrl.dismiss(data);
  }



}
