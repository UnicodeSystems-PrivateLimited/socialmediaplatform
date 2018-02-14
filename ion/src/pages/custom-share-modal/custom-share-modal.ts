import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';

/*
  Generated class for the CustomShareModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-custom-share-modal',
  templateUrl: 'custom-share-modal.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class CustomShareModalPage {
  public friends;
  public members = [];
  public _userSearchUrl = '/api/user/userSearchByStatus';
  public userSearchField = { name: "", status: "" };
  public customPostId: any = [];
  public shareVisibility_status = 5;
  public loader: boolean = false;
  public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, shareCustom: [] };
  public selectedItem: boolean[] = [];
  public userSearchList;
  public userSearchCount;
  public singlePostData: any;
  public groupId: number = null;
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public myWallService: MyWallService,
    public dataService: DataService
  ) {
    console.log('navParams', navParams);
    if (navParams && navParams.data.postData) {
      this.singlePostData = navParams.data.postData;
    }
    if (navParams && navParams.data.groupId) {
      this.groupId = navParams.data.groupId;
    }
  }

  ionViewDidLoad() {
    if (this.groupId) {
      this.getMembers();
    } else {
      this.getAllTypeFriends();
    }
  }

  getAllTypeFriends() {
    this.loader = true;
    this.service.getAllTypeFriends()
      .then((res) => {
        this.friends = res.data;
        if (this.singlePostData) {
          for (var i = 0; i < this.friends.current.length; i++) {
            for (var j = 0; j < this.singlePostData.custom.length; j++) {
              if (this.friends.current[i].friend_id == this.singlePostData.custom[j]) {
                this.selectedItem[this.friends.current[i].friend_id] = true;
              }
            }
          }
        }
        this.loader = false;
      }, (err) => {
        this.commonService.showToast(err.msg);
        this.loader = false;
      })
      .catch((err) => {
        console.log(err);
      })
  }

  getMembers() {
    this.service.getAllMembers().subscribe((res) => {
      if (res.status == 2) {
        this.members = res.data;
      }
    })
  }


  shareCustomPost() {
    console.log('this.selectedItem', this.selectedItem);
    for (let i in this.selectedItem) {
      if (this.selectedItem[i]) {
        this.message.shareCustom.push({ custom_id: i });
      }
    }
  }

  dismiss(type) {
    if (type == 1) {
      let data = { taggedUserId: this.selectedItem };
      this.viewCtrl.dismiss(data);
    }
    else if (type == 2) {
      this.viewCtrl.dismiss();
    }
  }
}