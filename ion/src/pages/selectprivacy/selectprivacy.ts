import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, Platform, ModalController } from 'ionic-angular';
import { CustomShareModalPage } from '../custom-share-modal/custom-share-modal';
import { MyWallPage } from '../my-wall/my-wall';
import { SocialSharing } from 'ionic-native';
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service'
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { SinglePostPage } from '../single-post/single-post';
import { PostShare } from '../../interfaces/common-interfaces';
/*
  Generated class for the Selectprivacy page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-selectprivacy',
  templateUrl: 'selectprivacy.html',
  providers: [CommonService, DataService, PageService, MyWallService]
})

export class SelectprivacyPage {
  public subject: string = '';
  public messages: string = '';
  public image: string = '';
  public uri: string = '';
  public getFolderName;
  public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, shareCustom: [] };
  public loader: boolean = false;
  public selectedPostType: number = 1;
  public selectedsharePrivacyType: number = 1;
  public userSearchField = { name: "", status: 3 };
  public userSearchList: Array<any> = [];
  public taggedUsersIds: Array<number> = [];
  public taggedUsersList: Array<any> = [];
  public postSharedData: PostShare = new PostShare();
  public showCustomPrivacymodel: boolean = false;
  public postData: any = {};
  public groupId: number = null;
  public userName: string = '';;
  public title: string = '';
  public msg: string = '';
  public tab: string = 'internal';
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private popoverCtrl: PopoverController, public platform: Platform,
    public commonService: CommonService, public pageService: PageService,
    public myWallService: MyWallService, public dataService: DataService,
    public modalCtrl: ModalController) {
    this.postData = this.navParams.data.postData;
    this.groupId = (this.postData.group_id && typeof this.postData.group_id === 'object') ? (this.postData.group_id._id ? this.postData.group_id._id : null) : (this.postData.group_id ? this.postData.group_id : null);
    this.userName = DataService.userFullName;
  }

  ionViewDidLoad() {
    this.subject = 'StribeIN – ' + this.userName + ' shared an interesting post with you';
    this.getFolderName = this.getFoldername(this.navParams.data.postData.types);
    this.messages = this.navParams.data.postData.name ? this.navParams.data.postData.name : this.navParams.data.postData.message ? this.navParams.data.postData.message : this.navParams.data.postData.question ? this.navParams.data.postData.question : '';
    if (this.navParams.data.postData.photo[0]) {
      if (this.navParams.data.postData.photo[0].file_name) {
        this.image = this.dataService.apiBaseUrl + "public/files/" + this.getFolderName + "/Photos/" + this.navParams.data.postData.created_by._id + "/" + this.navParams.data.postData.photo[0].file_name;
        this.uri = this.dataService.apiBaseUrl + "public/files/" + this.getFolderName + "/Photos/" + this.navParams.data.postData.created_by._id + "/" + this.navParams.data.postData.photo[0].file_name;
      } else {
        this.image = this.navParams.data.postData.photo[0].title;
        this.uri = this.navParams.data.postData.photo[0].title;
      }
      this.title = this.userName + ' shared an interesting post with you on StribeIn.com.'
    }
    else if (this.navParams.data.postData.video[0]) {
      if (this.navParams.data.postData.video[0].file_name) {
        this.uri = this.dataService.apiBaseUrl + "public/files/" + this.getFolderName + "/Videos/" + this.navParams.data.postData.created_by._id + "/" + this.navParams.data.postData.video[0].file_name;
      } else {
        this.uri = `https://www.youtube.com/embed/${this.navParams.data.postData.video[0].title}?autoplay=0`;
      }
      this.title = this.userName + ' shared an interesting post with you on StribeIn.com. Click on the given link to view post.'

    }
    else if (this.navParams.data.postData.audio[0]) {
      if (this.navParams.data.postData.audio[0].file_name) {
        this.uri = this.dataService.apiBaseUrl + "public/files/" + this.getFolderName + "/Audios/" + this.navParams.data.postData.created_by._id + "/" + this.navParams.data.postData.audio[0].file_name;
      } else {
        this.uri = this.navParams.data.postData.audio[0].title;
      }
      this.title = this.userName + ' shared an interesting post with you on StribeIn.com. Click on the given link to view post.'
    }
    else if (this.navParams.data.postData.document[0]) {
      if (this.navParams.data.postData.document[0].file_name) {
        this.uri = this.dataService.apiBaseUrl + "public/files/" + this.getFolderName + "/Documents/" + this.navParams.data.postData.created_by._id + "/" + this.navParams.data.postData.document[0].file_name;
      } else {
        this.uri = this.navParams.data.postData.document[0].title;
      }
      this.title = this.userName + ' shared an interesting post with you on StribeIn.com. Click on the given link to view post.'
    }
    else if (this.navParams.data.postData.link[0]) {
      this.uri = this.navParams.data.postData.link[0].description;
      this.messages = this.navParams.data.postData.link[0].title ? this.navParams.data.postData.link[0].title : ' ';
      this.title = this.userName + ' shared an interesting post with you on StribeIn.com. Click on the given link to view post.'
    } else {
      this.title = this.userName + ' shared an interesting post with you on StribeIn.com.'
    }

  }

  getFoldername(type) {
    if (type == 1) return "Subject";
    if (type == 2) return "College";
    if (type == 3) return "Degree";
    if (type == 5) return "Timeline";
    if (type == 6) return "GroupWall";

  }

  customshare() {
    let modal = this.modalCtrl.create(CustomShareModalPage, { groupId: this.groupId ? this.groupId : null });
    modal.onDidDismiss(data => {
      console.log('data', data);
      if (data && data.taggedUserId.length > 0) {
        for (let i in data.taggedUserId) {
          if (data.taggedUserId[i]) {
            this.taggedUsersIds.push(+i);
          }
        }
      } else {
        this.selectedsharePrivacyType = 1;
      }
    });
    modal.present();
  }

  sharePicker() {
    this.msg = this.title + '\n' + this.messages;
    this.platform.ready()
      .then(() => {

        SocialSharing.share(this.msg, this.subject, this.image, this.uri)
          .then((data) => {
            console.log('Shared via SharePicker');
            // if (this.navParams.data.redirectPage == 'mywall') {
            //   this.navCtrl.push(MyWallPage, 1);
            // }
            // if (this.navParams.data.redirectPage == 'subject') {
            //   this.navCtrl.push(SubjectPage, { wallId: this.navParams.data.wallId });
            // }
            // if (this.navParams.data.redirectPage == 'degree') {
            //   this.navCtrl.push(DegreePage, { wallId: this.navParams.data.wallId });
            // }
            // if (this.navParams.data.redirectPage == 'college') {
            //   this.navCtrl.push(CollegePage, { wallId: this.navParams.data.wallId });
            // }
            // if (this.navParams.data.redirectPage == 'singlePost') {
            //   this.navCtrl.push(SinglePostPage, { postId: this.navParams.data.postId, parentPage: this.navParams.data.parentPage, parentWallId: this.navParams.data.parentWallId });
            // }
          })
          .catch((err) => {
            console.log('Was not shared via SharePicker');
          });

      })
      .catch((err) => {
        console.log(err);
      });
  }


  public onChangeShareType($event): void {
    // this.selectedPostType = $event;
    if ($event == 2) {
      this.customshare();
    }
    this.clearVariables();
  }

  public clearVariables(): void {
    this.taggedUsersIds = [];
    this.taggedUsersList = [];
  }

  public onChangeSharePrivacy($event): void {
    // this.selectedsharePrivacyType = $event;
    // if ($event == 7) {
    // this.sharePicker();
    // } else
    if ($event == 5) {
      this.customshare();
    }
  }

  public onSharePost(): void {
    this.postSharedData.post_type = this.postData.post_type;
    this.postSharedData.audio = this.postData.audio ? this.postData.audio : [];
    this.postSharedData.catagory = this.postData.catagory;
    this.postSharedData.subject_id = (this.postData.subject_id && typeof this.postData.subject_id === 'object') ? (this.postData.subject_id._id ? this.postData.subject_id._id : null) : (this.postData.subject_id ? this.postData.subject_id : null);
    this.postSharedData.college_id = (this.postData.college_id && typeof this.postData.college_id === 'object') ? (this.postData.college_id._id ? this.postData.college_id._id : null) : (this.postData.college_id ? this.postData.college_id : null);
    this.postSharedData.degree_id = (this.postData.degree_id && typeof this.postData.degree_id === 'object') ? (this.postData.degree_id._id ? this.postData.degree_id._id : null) : (this.postData.degree_id ? this.postData.degree_id : null);
    this.postSharedData.group_id = (this.postData.group_id && typeof this.postData.group_id === 'object') ? (this.postData.group_id._id ? this.postData.group_id._id : null) : (this.postData.group_id ? this.postData.group_id : null);
    this.postSharedData.name = this.postData.name ? this.postData.name : null;
    this.postSharedData.types = this.postData.types;
    this.postSharedData.message = this.postData.message ? this.postData.message : null;
    this.postSharedData.question = this.postData.question ? this.postData.question : null;
    this.postSharedData.photo = this.postData.photo ? this.postData.photo : [];
    this.postSharedData.video = this.postData.video ? this.postData.video : [];
    this.postSharedData.link = this.postData.video ? this.postData.link : [];
    this.postSharedData.document = this.postData.document ? this.postData.document : [];
    this.postSharedData.origin_creator = this.postData.origin_creator ? this.postData.origin_creator : this.postData.created_by._id;
    this.postSharedData.original_post_id = this.postData.original_post_id ? this.postData.original_post_id : this.postData._id;
    this.postSharedData.share_type = this.selectedPostType;
    if (this.selectedPostType == 1) {
      this.postSharedData.custom = this.selectedsharePrivacyType == 5 ? this.taggedUsersIds : [];
      this.postSharedData.privacy = this.selectedsharePrivacyType;
      this.savePost();
    } else {
      this.postSharedData.custom = this.taggedUsersIds;
      this.postSharedData.privacy = 5;
      if (this.postSharedData.custom.length > 0) {
        this.savePost();
      } else {
        this.commonService.showToast('Please select at least one friend.');
      }
    }

  }
  public savePost(): void {
    this.myWallService.sharePostOnTimeLine(this.postSharedData).subscribe((res) => {
      if (res.status == 2) {
        this.commonService.showToast(res.msg);
        this.navCtrl.pop();
        this.taggedUsersIds = [];
      }
    });
  }

}
