import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ModalController } from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { UserService } from "../../providers/user-service";
import { CommentEditModalPage } from '../comment-edit-modal/comment-edit-modal';
import { TimelinePage } from '../timeline/timeline';
import { FriendProfilePage } from '../friend-profile/friend-profile';
/*
  Generated class for the Comment page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-comment',
  templateUrl: 'comment.html',
  providers: [DataService, MyWallService, CommonService, PageService, UserService]
})
export class CommentPage {
  public comments: any[] = [];
  public postId: number = null;
  public postLikes: number = null;
  public postComment = { post_id: -1, comment: "", editComment: "", date: new Date() };
  public loader: boolean = false;
  public _deleteComment = '/api/post/deleteComment/';
  public user;
  public dataServiceData: typeof DataService = DataService;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public platform: Platform,
    public commonService: CommonService,
    public myWallService: MyWallService,
    public pageService: PageService,
    public service: UserService,
    public dataService: DataService,
    public modalCtrl: ModalController
  ) {
    console.log('navParams', navParams);
    this.postId = navParams.data.postId;
    this.comments = navParams.data.characterNum;
    this.postLikes = navParams.data.postLikes;
    this.user = this.service.getSavedUser();
    this.service.getIonicStoredUser()
      .then((userSavedData) => {
        this.user = this.user ? this.user : userSavedData ? JSON.parse(userSavedData) : null;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CommentPage');
  }
  dismiss() {
    let data = { post_id: this.postId, characterNum: this.comments };
    this.viewCtrl.dismiss(data);
  }

  public onClickOutside() {
    if (this.platform.is('ios') || this.platform.is('android'))
      Keyboard.close();
  }

  public addComment() {
    if (this.postComment.comment) {
      this.loader = true;
      this.postComment.post_id = this.postId;
      this.myWallService.addPostComment(this.postComment)
        .subscribe(res => {
          this.postComment.comment = '';
          this.comments = res.data;
          this.loader = false;
          this.commonService.showToast('Comment was added successfully.');
        });
    }
    else {
      this.commonService.showToast('Please fill the field.');
    }
  }

  deleteComment(id) {
    this.loader = true;
    this.dataService.getData(this._deleteComment + this.postId + '/' + id)
      .subscribe(res => {
        if (res.status === 2) {
          this.postComment.comment = '';
          this.comments = res.data;
          this.loader = false;
          this.commonService.showToast('Comment was deleted successfully.');
        }
      });
  }

  public onDeleteClick(id) {
    this.commonService.showConfirm("", "Are you sure you want to delete this comment ?", () => this.deleteComment(id));
  }

  CommentEditModal(postId, commentId) {
    let modal = this.modalCtrl.create(CommentEditModalPage, { postId: postId, commentId: commentId });
    modal.onDidDismiss(data => {
      if (data && data.postComment.post_id && data.action == 1) {
        for (let i = 0; i < this.comments.length; i++) {
          if (this.comments[i]._id && this.comments[i]._id == data.commentId) {
            this.comments[i].body = data.postComment.editComment;
            this.commonService.showToast('Comment was edited successfully.');
          }
        }
      }
      else {
        console.log(data);
      }
    });
    modal.present();
  }

  getProfileById(id) {
    if (id == this.dataServiceData.userid) {
      this.navCtrl.push(TimelinePage);
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }
}