import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
/*
  Generated class for the CommentEditModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-comment-edit-modal',
  templateUrl: 'comment-edit-modal.html',
  providers: [DataService, MyWallService, CommonService, PageService]
})
export class CommentEditModalPage {
  public postId: number = null;
  public commentId: number = null;
  public commentData = {};
  public action: number = 0;
  public postComment = { post_id: -1, comment: "", editComment: "", date: new Date() };
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public myWallService: MyWallService,
    public commonService: CommonService,
  ) {
    this.postId = navParams.data.postId;
    this.commentId = navParams.data.commentId;
  }

  ionViewDidLoad() {
    this.myWallService.getSinglePostData(this.postId)
      .then(res => {
        for (let i = 0; i < res[0].comments.length; i++) {
          if (res[0].comments[i]._id == this.commentId) {
            this.postComment.editComment = res[0].comments[i].body;
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  editComment(type) {
    this.postComment.post_id = this.postId;
    if (this.postComment.editComment != '' && this.postComment.editComment != null) {
      this.myWallService.editComment(this.commentId, this.postComment)
        .subscribe(res => {
          if (res.status === 2) {
            this.action = type;
            this.dismiss();
          }
        });
    }
    else {
      this.commonService.showToast('Text cannot be empty');
    }
  }

  dismiss() {
    let data = { commentId: this.commentId, postComment: this.postComment, action: this.action };
    this.viewCtrl.dismiss(data);
  }

}
