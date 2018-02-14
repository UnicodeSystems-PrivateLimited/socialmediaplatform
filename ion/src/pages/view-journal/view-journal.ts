import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { SinglePostPage } from '../single-post/single-post';
import { TimelinePage } from '../timeline/timeline';
import { FriendProfilePage } from '../friend-profile/friend-profile';
/*
  Generated class for the ViewJournal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-view-journal',
  templateUrl: 'view-journal.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class ViewJournalPage {
  public _getAllPostByPostType = '/api/journal/getAllPostByPostType/';
  public _deletePostUrl = '/api/journal/deletePostInJournal';
  public journalData;
  public posts;
  public JournalByJournalId;
  public JournalPost;
  public selectedPostType = 0;
  public loader: boolean = false;
  public postDeleteData = { _id: "", journal_id: "" };
  public index;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public dataService: DataService,
    public myWallService: MyWallService
  ) {
    this.journalData = navParams.data.Journal;
    if(navParams.data.posts){
      this.posts = navParams.data.posts;
    }
  }

  ionViewDidLoad() {
    this.getAllPostByJournalId();
  }

  postInJournal() {
    let modal = this.modalCtrl.create(PostInJournalPage, { Journal: this.journalData, posts: this.posts });
    modal.onDidDismiss(data => {
      if (data && typeof data != 'undefined') {
        this.journalData._id = data.data;
      }
      this.getAllPostByJournalId();
      this.selectedPostType = 0;
    });
    modal.present();
  }

  getAllPostByJournalId() {
    this.loader = true;
    this.myWallService.getAllPostByJournalId(this.journalData._id)
      .then((res) => {
        this.loader = false;
        this.JournalByJournalId = res.data;
        let JournalPost1 = res.data.posts;
        let sortedArray = JournalPost1.sort(function (a, b) {
          return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
        });
        this.JournalPost = sortedArray;
      })
      .catch((err) => {
        this.loader = false;
        console.log(err);
      })
  }

  getFoldername(type) {
    if (type == 1) return "Subject";
    if (type == 2) return "College";
    if (type == 3) return "Degree";
    if (type == 5) return "Timeline";
        if (type == 6) return "GroupWall";

  }

  public onChangePostType(value): void {
    this.selectedPostType = value;
    if (value == 0) {
      this.getAllPostByJournalId();
    }
    else {
      this.getAllPostByPostType();
    }
  }

  public getAllPostByPostType() {
    this.loader = true;
    this.dataService.getData(this._getAllPostByPostType + this.selectedPostType + '/' + this.journalData._id).subscribe(res => {
      this.loader = false;
      this.JournalByJournalId = res.data;
      let JournalPost2 = res.data.posts;
      let sortedArray1 = JournalPost2.sort(function (a, b) {
        return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
      });
      this.JournalPost = sortedArray1;
    });
  }

  public onDeleteClick(postId, index) {
    this.index = index;
    this.postDeleteData._id = postId;
    this.postDeleteData.journal_id = this.journalData._id;
    this.commonService.showConfirm("", "Are you sure you want to remove this post from the Journal?", () => this.deletePostFromJournal());
  }

  public deletePostFromJournal() {
    this.dataService.postData(this._deletePostUrl, this.postDeleteData)
      .subscribe(res => {
        if (res.status == 2) {
          this.JournalPost.splice(this.index, 1);
          this.postDeleteData._id = '';
          this.postDeleteData.journal_id = '';
          this.commonService.showToast(res.data.message);
        }
      });
  }

  goToSinglePost(data, postId) {
    if (data.photo.length > 0 || data.video.length > 0 || data.audio.length > 0) {
      let modal = this.modalCtrl.create(SinglePostPage, { post_data: data, postId: postId });
      modal.onDidDismiss(data => {
        this.getAllPostByJournalId();
      });
      modal.present();
    }
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
