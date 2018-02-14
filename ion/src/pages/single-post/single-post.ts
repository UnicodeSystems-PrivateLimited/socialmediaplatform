import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, Platform } from 'ionic-angular';
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { CommentPage } from '../comment/comment';
import { SelectprivacyPage } from '../selectprivacy/selectprivacy';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { MyWallPage } from '../my-wall/my-wall';
import { TabsPage } from '../tabs/tabs';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';
import { UserService } from "../../providers/user-service";
import { TimelinePage } from '../timeline/timeline';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { Transfer, FileUploadOptions, File } from 'ionic-native';
declare var cordova;
/*
  Generated class for the SinglePost page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-single-post',
  templateUrl: 'single-post.html'
})
export class SinglePostPage {
  public postId;
  public post_data;
  public loader: boolean = false;
  public privacy = 1;
  public redirectPage;
  public wallId;
  public postLike = { post_id: "" };
  public user;
  public isEmbedPost: boolean = false;
  public dataServiceData: typeof DataService = DataService;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public commonService: CommonService,
    public pageService: PageService,
    public myWallService: MyWallService,
    public modalCtrl: ModalController,
    public service: UserService,
    public dataService: DataService,
    private platform: Platform
  ) {
    this.postId = this.navParams.data.postId;
    if (this.navParams.data.redirectPage) {
      this.redirectPage = this.navParams.data.redirectPage;
    }
    if (this.navParams.data.wallId) {
      this.wallId = this.navParams.data.wallId;
    }
    if (this.navParams.data.post_data) {
      this.post_data = this.navParams.data.post_data;
    }
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
    this.getSinglePostData();
  }

  ionViewWillEnter() {
    this.getSinglePostData();
  }

  dismiss() {
    let data = { post_id: this.postId, post_data: this.post_data };
    this.viewCtrl.dismiss(data);
  }

  gotoJournal() {
    this.navCtrl.push(PostInJournalPage);
  }

  getSinglePostData() {
    this.loader = true;
    this.myWallService.getSinglePostData(this.postId)
      .then((res) => {
        this.loader = false;
        this.post_data = res[0];
        this.checkEmbedPost();
      }, (err) => {
        this.loader = false;
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
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

  CommentModal(postId, characterNum, postLikes) {
    let modal = this.modalCtrl.create(CommentPage, { postId: postId, characterNum: characterNum, postLikes: postLikes });
    modal.onDidDismiss(data => {
      if (data && data.post_id) {
        for (let i = 0; i < this.post_data.comments.length; i++) {
          if (this.postId && this.postId == data.post_id) {
            this.post_data.comments = data.characterNum;
          }
        }
      }
      else {
        this.ionViewWillEnter();
      }
    });
    modal.present();
  }

  selectprivacy(data) {
    this.navCtrl.push(SelectprivacyPage, { postData: this.post_data, postId: this.postId, redirectPage: "singlePost", parentPage: this.redirectPage, parentWallId: this.wallId });
  }

  like(post_id, data) {
    this.postLike.post_id = post_id;
    this.myWallService.addLike(this.postLike)
      .then((res) => {
        data.likes = res.data;
      }, (err) => {
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  getCategory(category_id) {
    if (category_id == 1) return "General";
    else if (category_id == 2) return "Tip / Trick";
    else if (category_id == 3) return "Joke / Humor";
    else if (category_id == 4) return "Tutorial";
    else return "No Category";
  }

  getProfileById(id) {
    if (id == this.dataServiceData.userid) {
      this.navCtrl.push(TimelinePage);
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }
  public downLoad() {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        this.downLoadInAndroid();
      } else if (this.platform.is('ios')) {
        this.downloadInIphone();
      }

    });
  }

  public downLoadInAndroid() {
    const fileTransfer = new Transfer();
    let url;
    let fileName;
    let targetDirectory = cordova.file.externalRootDirectory;
    if (this.post_data != null && this.post_data.photo[0]) {
      if (this.post_data.photo[0].title) {
        url = this.post_data.photo[0].title;
        fileName = targetDirectory + "StribeIN/Media/photo/" + this.getFilename(this.post_data.photo[0].title);
      } else {
        url = this.dataService.apiBaseUrl + "public/files/" + this.getFoldername(this.post_data.types) + "/Photos/" + (this.post_data.origin_creator ? this.post_data.origin_creator._id : this.post_data.created_by._id) + "/" + this.post_data.photo[0].file_name;
        fileName = targetDirectory + "StribeIN/Media/photo/" + this.post_data.photo[0].file_name;
      }
    } else if (this.post_data != null && this.post_data.video[0]) {
      if (!this.post_data.video[0].title) {
        url = this.dataService.apiBaseUrl + "public/files/" + this.getFoldername(this.post_data.types) + "/Videos/" + (this.post_data.origin_creator ? this.post_data.origin_creator._id : this.post_data.created_by._id) + "/" + this.post_data.video[0].file_name;
        fileName = targetDirectory + "StribeIN/Media/video/" + this.post_data.video[0].file_name;
      }
    } else if (this.post_data != null && this.post_data.audio[0]) {
      if (!this.post_data.audio[0].title) {
        url = this.dataService.apiBaseUrl + "public/files/" + this.getFoldername(this.post_data.types) + "/Audios/" + (this.post_data.origin_creator ? this.post_data.origin_creator._id : this.post_data.created_by._id) + "/" + this.post_data.audio[0].file_name;
        fileName = targetDirectory + "StribeIN/Media/audio/" + this.post_data.audio[0].file_name;
      }
    } else if (this.post_data != null && this.post_data.document[0]) {
      if (!this.post_data.document[0].title) {
        url = this.dataService.apiBaseUrl + "public/files/" + this.getFoldername(this.post_data.types) + "/Documents/" + (this.post_data.origin_creator ? this.post_data.origin_creator._id : this.post_data.created_by._id) + "/" + this.post_data.document[0].file_name;
        fileName = targetDirectory + "StribeIN/Media/document/" + this.post_data.document[0].file_name;
      }
    }
    url = encodeURI(url);
    fileTransfer.download(url, fileName, true).then((entry) => {
      this.commonService.showToast("File Downloaded Successfully.");
    }, (error) => {
      console.log("error", error);
    });
  }

  public downloadInIphone() {
    const fileTransfer = new Transfer();
    let url;
    let fileName;
    let targetDirectory = cordova.file.dataDirectory + 'Documents/';
    if (this.post_data != null && this.post_data.photo[0]) {
      if (this.post_data.photo[0].title) {
        url = this.post_data.photo[0].title;
        fileName = "StribeIN/Media/Photos";
        cordova.plugins.photoLibrary.requestAuthorization(() => {
          cordova.plugins.photoLibrary.saveImage(url, fileName, (libraryItem) => {
            console.log("libraryItem", libraryItem);
            this.commonService.showToast("File Downloaded Successfully.");
          }, (err) => {
            console.log("err", err);
          });
        }, (err) => {
          console.log("err", err);
        },
          {
            read: true,
            write: true
          }
        );

      } else {
        url = this.dataService.apiBaseUrl + "public/files/" + this.getFoldername(this.post_data.types) + "/Photos/" + (this.post_data.origin_creator ? this.post_data.origin_creator._id : this.post_data.created_by._id) + "/" + this.post_data.photo[0].file_name;
        fileName = "StribeIN/Media/Photos";
        cordova.plugins.photoLibrary.requestAuthorization(() => {
          cordova.plugins.photoLibrary.saveImage(url, fileName, (libraryItem) => {
            console.log("libraryItem", libraryItem);
            this.commonService.showToast("File Downloaded Successfully.");
          }, (err) => {
            console.log("err", err);
          });
        }, (err) => {
          console.log("err", err);
        },
          {
            read: true,
            write: true
          }
        );
      }
    } else if (this.post_data != null && this.post_data.video[0]) {
      if (!this.post_data.video[0].title) {
        fileName = "StribeIN/Media/Videos";
        url = this.dataService.apiBaseUrl + "public/files/" + this.getFoldername(this.post_data.types) + "/Videos/" + (this.post_data.origin_creator ? this.post_data.origin_creator._id : this.post_data.created_by._id) + "/" + this.post_data.video[0].file_name;
        let targetPath = targetDirectory + "StribeIN/Media/video/" + this.post_data.video[0].file_name;
        fileTransfer.download(url, targetPath, true).then((entry) => {
          this.commonService.showToast("File Downloaded Successfully.");
          cordova.plugins.photoLibrary.requestAuthorization(() => {
            cordova.plugins.photoLibrary.saveVideo(targetPath, fileName, (libraryItem) => {
              console.log("libraryItem", libraryItem);
              // this.commonService.showToast("File Downloaded Successfully.");
              File.removeFile(targetDirectory + "StribeIN/Media/video", this.post_data.video[0].file_name).then((data) => {
                   console.log("data",data);
              }, (err) => {
                 console.log(err);
              })
            }, (err) => {
              console.log("err", err);
            });
          }, (err) => {
            console.log("err", err);
          },
            {
              read: true,
              write: true
            }
          );
        }, (error) => {
          console.log("error", error);
        });

      }
    } else if (this.post_data != null && this.post_data.audio[0]) {
      if (!this.post_data.audio[0].title) {
        url = this.dataService.apiBaseUrl + "public/files/" + this.getFoldername(this.post_data.types) + "/Audios/" + (this.post_data.origin_creator ? this.post_data.origin_creator._id : this.post_data.created_by._id) + "/" + this.post_data.audio[0].file_name;
        fileName = targetDirectory + "StribeIN/Media/audio/" + this.post_data.audio[0].file_name;
        url = encodeURI(url);
        fileTransfer.download(url, fileName, true).then((entry) => {
          this.commonService.showToast("File Downloaded Successfully.");
        }, (error) => {
          console.log("error", error);
        });
      }
    } else if (this.post_data != null && this.post_data.document[0]) {
      if (!this.post_data.document[0].title) {
        url = this.dataService.apiBaseUrl + "public/files/" + this.getFoldername(this.post_data.types) + "/Documents/" + (this.post_data.origin_creator ? this.post_data.origin_creator._id : this.post_data.created_by._id) + "/" + this.post_data.document[0].file_name;
        fileName = targetDirectory + "StribeIN/Media/document/" + this.post_data.document[0].file_name;
        url = encodeURI(url);
        fileTransfer.download(url, fileName, true).then((entry) => {
          this.commonService.showToast("File Downloaded Successfully.");
        }, (error) => {
          console.log("error", error);
        });
      }
    }

  }

  public getFilename(url) {
    url = url.split('/').pop().replace(/\#(.*?)$/, '').replace(/\?(.*?)$/, '');
    url = url.split('.');
    return url[0] + "." + url[1];
  }
  public checkEmbedPost() {
    if (this.post_data) {
      if (this.post_data.video[0] && this.post_data.video[0].title) {
        this.isEmbedPost = true;
      }
      if (this.post_data.audio[0] && this.post_data.audio[0].title) {
        this.isEmbedPost = true;
      }
    }
  }
}
