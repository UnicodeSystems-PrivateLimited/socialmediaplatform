import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { Post } from '../../interfaces/common-interfaces';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { CustomVisibiltyPage } from '../custom-visibilty/custom-visibilty';
import { Camera, FileChooser, File, FilePath, MediaCapture, MediaFile, CaptureVideoOptions, CaptureAudioOptions} from 'ionic-native';
declare function unescape(s: string): string;
/*
  Generated class for the UpdateStatus page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-update-status',
  templateUrl: 'update-status.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class UpdateStatusPage {
  public videoembed: boolean = true;
  public photoembed: boolean = true;
  public audioembed: boolean = true;
  public postMsgLinkQuesType = 1;
  public base64Image: string;
  private imageSrc: string;
  public photosToUpload: any[] = [];
  public documentsToUpload: any[] = [];
  public audiosToUpload: any[] = [];
  public videosToUpload: any[] = [];
  public pet: string = "Status";
  public isAndroid: boolean = false;
  public loader: boolean = false;
  public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, custom: [], shareCustom: [] };
  public error = { photo: '', video: '', audio: '', document: '', videoSize: '', audioSize: '', documentSize: '' };
  public catagory = 1;
  public types = 1;
  public subjectId;
  public isMember;
  public wallType = '';
  public fileData;
  public filename: string = '';
  /**Posts */
  public _dataUploadPhotosFiles = '/api/post/postPhotosTypeFiles/';
  public _dataUploadDocumentsFiles = '/api/post/postDocumentsTypeFiles/';
  public _dataUploadAudiosFiles = '/api/post/postAudiosTypeFiles/';
  public _dataUploadVideosFiles = '/api/post/postVideosTypeFiles/';
  public _addPostUrl = '/api/post/postAllTypeData/';
  public _dataUploadEmbedLink = 'api/post/postVideoEmbedLink/';
  public _dataUploadAudioEmbedLink = 'api/post/postAudioEmbedLink/';
  public _dataUploadPhotoEmbedLink = 'api/post/postPhotoEmbedLink/';
  public notiMsg: string = 'Enter your message';
  public subjectPostData: Post = new Post();
  public selectedPostPrivacyType: number = 1;
  public taggedUsersIds: Array<number> = [];
  constructor
    (
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public commonService: CommonService,
    public myWallService: MyWallService,
    public viewCtrl: ViewController,
    public dataService: DataService
    ) {
    console.log('navParams.datanavParams.datanavParams.datanavParams.data',navParams.data);
    this.postMsgLinkQuesType = 1;
    this.types = 1;
    this.photosToUpload = [];
    this.documentsToUpload = [];
    this.audiosToUpload = [];
    this.videosToUpload = [];
    this.subjectId = navParams.data.subjectId;
    this.isMember = navParams.data.sub.is_member;
    this.wallType = navParams.data.wallType;
    this.pet = navParams.data.tabValue;
    this.postMsgLinkQuesType = navParams.data.postType;
  }

  ionViewDidLoad() {
    this.imageSrc = this.dataService.apiBaseUrl + "public/files/ProfilePicture/no_image.png";
  }

  cancel() {
    if (this.wallType == 'subjectWall') {
      let data = { wallId: this.subjectId };
      this.viewCtrl.dismiss(data);
    }
  }

  setMsgLinkQuesType(postType) {
    this.postMsgLinkQuesType = postType;
    this.message.message.message = '';
    this.message.question.question = '';
    this.message.link.description = '';
    this.message.link.title = '';
    this.message.name.name = '';
    this.message.embedLink.video = '';
    this.message.embedLink.audio = '';
    this.message.embedLink.photo = '';
    this.message.embedLink.title = '';
    this.photosToUpload = [];
    this.videosToUpload = [];
    this.audiosToUpload = [];
    this.documentsToUpload = [];
    this.error.photo = '';
    this.error.video = '';
    this.error.audio = '';
    this.error.videoSize = '';
    this.error.audioSize = '';
    this.error.document = '';
    this.error.documentSize = '';
  }

  pastevideoembed() {
    this.videoembed = false;
    this.photoembed = true;
    this.audioembed = true;
  }

  pastephotoembed() {
    this.videoembed = true;
    this.photoembed = false;
    this.audioembed = true;
  }

  pasteaudioembed() {
    this.videoembed = true;
    this.photoembed = true;
    this.audioembed = false;
  }

  canclevideoembed() {
    this.videoembed = true;
    this.photoembed = true;
    this.audioembed = true;
    this.message.name.name = '';
    this.message.embedLink.title = '';
    this.message.embedLink.video = '';
  }

  canclephotoembed() {
    this.videoembed = true;
    this.photoembed = true;
    this.audioembed = true;
    this.message.name.name = '';
    this.message.embedLink.title = '';
    this.message.embedLink.photo = '';
  }

  cancleaudioembed() {
    this.videoembed = true;
    this.photoembed = true;
    this.audioembed = true;
    this.message.name.name = '';
    this.message.embedLink.title = '';
    this.message.embedLink.audio = '';
  }

  addPhotoEmbedLink() {
    if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
      if (this.validateImgURL(this.message.embedLink.title)) {
        this.message.embedLink.photo = this.message.embedLink.title;
        this.message.embedLink.title = "";
        this.commonService.showToast("Photo link added successfully.");
      } else {
        this.commonService.showToast("Invalid url!");
      }
    } else {
      this.commonService.showToast("Please paste the photo link here!");
    }
  }

  validateImgURL(textval) {
    var urlregex = /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)$/;
    return urlregex.test(textval);
  }

  addVideoEmbedLink() {
    if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
      var myId = this.getId(this.message.embedLink.title);
      if (myId) {
        this.message.embedLink.video = myId;
        this.message.embedLink.title = "";
        this.commonService.showToast("Video link added successfully.");
      } else {
        this.commonService.showToast("Invalid url!");
      }
    } else {
      this.commonService.showToast("Please paste the youtube link here!");
    }
  }

  getId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return false;
    }
  }

  addAudioEmbedLink() {
    if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
      if (this.validateURL(this.message.embedLink.title)) {
        this.message.embedLink.audio = this.message.embedLink.title;
        this.message.embedLink.title = "";
        this.commonService.showToast("Audio link added successfully.");
      } else {
        this.commonService.showToast("Invalid url!");
      }
    } else {
      this.commonService.showToast("Please paste the audio link here!");
    }
  }

  onPostAllTypeData() {
    if (this.isMember) {
      this.subjectPostData.privacy = this.selectedPostPrivacyType;
      this.subjectPostData.types = this.types;
      this.subjectPostData.catagory = this.catagory;
      this.subjectPostData.created_on = new Date();
      this.subjectPostData.custom = this.selectedPostPrivacyType == 5 ? this.taggedUsersIds : [];
      if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
        if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
        { this.message.name.name = null; }
        this.loader = true;
        this.subjectPostData.photo = this.photosToUpload;
        this.subjectPostData.post_type = 3;
        this.subjectPostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
        this.dataService.wallPostFormData(this._dataUploadPhotosFiles + this.subjectId, this.subjectPostData)
          .subscribe((result) => {
            if (result['status'] == 2) {
              this.loader = false;
              this.photosToUpload = [];
              this.subjectPostData = new Post();
              this.message.name.name = '';
              this.catagory = 1;
              this.selectedPostPrivacyType = 1;
              this.taggedUsersIds = [];
              if (this.wallType == 'subjectWall') {
                let data = { wallId: this.subjectId };
                this.viewCtrl.dismiss(data);
              }
              this.commonService.showToast(result.msg);
            }
          });
      }
      else if (typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) {
        if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
        { this.message.name.name = null; }
        this.loader = true;
        this.subjectPostData.post_type = 4;
        this.subjectPostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
        this.subjectPostData.video = this.videosToUpload;
        this.dataService.wallPostFormData(this._dataUploadVideosFiles + this.subjectId, this.subjectPostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.taggedUsersIds = [];
            this.selectedPostPrivacyType = 1;
            this.subjectPostData = new Post();
            this.loader = false;
            this.videosToUpload = [];
            this.message.name.name = '';
            this.catagory = 1;
            if (this.wallType == 'subjectWall') {
              let data = { wallId: this.subjectId };
              this.viewCtrl.dismiss(data);
            }
            this.commonService.showToast(result.msg);
          }
        })
      }
      else if (typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) {
        if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
        { this.message.name.name = null; }
        this.loader = true;
        this.subjectPostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
        this.subjectPostData.audio = this.audiosToUpload;
        this.subjectPostData.post_type = 6;
        this.dataService.wallPostFormData(this._dataUploadAudiosFiles + this.subjectId, this.subjectPostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.taggedUsersIds = [];
            this.selectedPostPrivacyType = 1;
            this.subjectPostData = new Post();
            this.loader = false;
            this.audiosToUpload = [];
            this.message.name.name = '';
            this.catagory = 1;
            if (this.wallType == 'subjectWall') {
              let data = { wallId: this.subjectId };
              this.viewCtrl.dismiss(data);
            }
            this.commonService.showToast(result.msg);
          }
        })
      }
      else if (typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) {
        if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
        { this.message.name.name = null; }
        this.loader = true;
        this.subjectPostData.post_type = 7;
        this.subjectPostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
        this.subjectPostData.document = this.documentsToUpload;
        this.dataService.wallPostFormData(this._dataUploadDocumentsFiles + this.subjectId, this.subjectPostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.taggedUsersIds = [];
            this.selectedPostPrivacyType = 1;
            this.subjectPostData = new Post();
            this.loader = false;
            this.documentsToUpload = [];
            this.message.name.name = '';
            this.catagory = 1;
            if (this.wallType == 'subjectWall') {
              let data = { wallId: this.subjectId };
              this.viewCtrl.dismiss(data);
            }
            this.commonService.showToast(result.msg);
          }
        })
      }
      else if (typeof (this.message.embedLink.video) != 'undefined' && this.message.embedLink.video != '') {
        if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
        { this.message.name.name = null; }
        this.loader = true;
        this.subjectPostData.post_type = 5;
        this.subjectPostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
        this.subjectPostData.link = this.message.embedLink.video;
        this.dataService.postData(this._dataUploadEmbedLink + this.subjectId, this.subjectPostData).subscribe(posts => {
          if (posts['status'] == 2) {
            this.taggedUsersIds = [];
            this.selectedPostPrivacyType = 1;
            this.subjectPostData = new Post();
            this.message.embedLink.video = '';
            this.message.name.name = '';
            this.loader = false;
            this.catagory = 1;
            if (this.wallType == 'subjectWall') {
              let data = { wallId: this.subjectId };
              this.viewCtrl.dismiss(data);
            }
            this.commonService.showToast('Video uploaded successfully');
          }
        })
      } else if (typeof (this.message.embedLink.audio) != 'undefined' && this.message.embedLink.audio != '') {
        if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
        { this.message.name.name = null; }
        this.loader = true;
        this.subjectPostData.post_type = 5;
        this.subjectPostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
        this.subjectPostData.link = this.message.embedLink.audio;
        this.dataService.postData(this._dataUploadAudioEmbedLink + this.subjectId, this.subjectPostData).subscribe(posts => {
          if (posts['status'] == 2) {
            this.taggedUsersIds = [];
            this.selectedPostPrivacyType = 1;
            this.subjectPostData = new Post();
            this.message.embedLink.audio = '';
            this.message.name.name = '';
            this.loader = false;
            this.catagory = 1;
            if (this.wallType == 'subjectWall') {
              let data = { wallId: this.subjectId };
              this.viewCtrl.dismiss(data);
            }
            this.commonService.showToast('Audio uploaded successfully');
          }
        });
      } else if (typeof (this.message.embedLink.photo) != 'undefined' && this.message.embedLink.photo != '') {
        if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
        { this.message.name.name = null; }
        this.loader = true;
        this.subjectPostData.link = this.message.embedLink.photo;
        this.subjectPostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
        this.subjectPostData.post_type = 5;
        this.dataService.postData(this._dataUploadPhotoEmbedLink + this.subjectId, this.subjectPostData)
          .subscribe((posts) => {
            if (posts['status'] == 2) {
              this.taggedUsersIds = [];
              this.selectedPostPrivacyType = 1;
              this.subjectPostData = new Post();
              this.message.embedLink.photo = '';
              this.message.name.name = '';
              this.loader = false;
              this.catagory = 1;
              if (this.wallType == 'subjectWall') {
                let data = { wallId: this.subjectId };
                this.viewCtrl.dismiss(data);
              }
              this.commonService.showToast('Photo uploaded successfully');
            }
          });
      }
      else {
        if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 1) && (this.message.message.message !== '')) {
          this.subjectPostData.message = this.message.message.message ? this.message.message.message.replace(/(^[ \t]*\n)/gm, "") : '';
          this.subjectPostData.post_type = 1;
           this.loader = true;
          this.dataService.postData(this._addPostUrl + this.subjectId, this.subjectPostData)
            .subscribe((posts) => {
              if (posts['status'] == 2) {
                this.message.message.message = '';
                this.selectedPostPrivacyType = 1;
                this.catagory = 1;
                this.taggedUsersIds = [];
                this.subjectPostData = new Post();
                if (this.wallType == 'subjectWall') {
                  let data = { wallId: this.subjectId };
                  this.viewCtrl.dismiss(data);
                }
                this.commonService.showToast('Your Post has been posted successfully.');
                  this.loader = false;
              }
            });

        }
        else if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 2) && (this.message.question.question !== '')) {
          this.subjectPostData.question = this.message.question.question ? this.message.question.question.replace(/(^[ \t]*\n)/gm, ""): '';
          this.subjectPostData.post_type = 2;
          this.loader = true;
          this.dataService.postData(this._addPostUrl + this.subjectId, this.subjectPostData)
            .subscribe((posts) => {
              if (posts['status'] == 2) {
                this.message.question.question = '';
                this.catagory = 1;
                this.selectedPostPrivacyType = 1;
                this.taggedUsersIds = [];
                this.subjectPostData = new Post();
                if (this.wallType == 'subjectWall') {
                  let data = { wallId: this.subjectId };
                  this.viewCtrl.dismiss(data);
                }
                this.commonService.showToast('Your Post has been posted successfully.');
                  this.loader = false;
              }
            });
        }
        else if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 5) && (this.message.link.description !== '')) {
          if (this.validateLinkURL(this.message.link.description)) {
            this.subjectPostData.link = this.message.link.description;
            this.subjectPostData.linkTitle = this.message.link.title ? this.message.link.title.replace(/(^[ \t]*\n)/gm, "") : '';
            this.subjectPostData.post_type = 5;
            this.loader = true;
            this.dataService.postData(this._addPostUrl + this.subjectId, this.subjectPostData)
              .subscribe((posts) => {
                if (posts['status'] == 2) {
                  this.message.link.description = '';
                  this.message.link.title = '';
                  this.catagory = 1;
                  this.selectedPostPrivacyType = 1;
                  this.taggedUsersIds = [];
                  this.subjectPostData = new Post();
                  if (this.wallType == 'subjectWall') {
                    let data = { wallId: this.subjectId };
                    this.viewCtrl.dismiss(data);
                  }
                  this.commonService.showToast('Your Post has been posted successfully.');
                  this.loader = false;
                }
              });
          }
          else {
            this.commonService.showToast("Invalid url!");
          }
        }
        else {
          this.commonService.showToast('Please fill the field');
        }
      }
    } else {
      this.commonService.showToast("Please Join Subject For Posting!");
    }
  }

  validateLinkURL(textval) {
    if(!textval.includes('http://') && !textval.includes('https://')){
      textval = 'http://'+textval;
      this.message.link.description = textval;
    }
    var urlregex = /^(https?|Https?|HTtps?|HTTps?|HTTPs?|HTTPS?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
  }

  validateURL(textval) {
    var urlregex = /^(https?|Https?|HTtps?|HTTps?|HTTPs?|HTTPS?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
  }

  selectCatagory($event) {
    this.catagory = $event;
  }

  selectVisibility($event) {
    this.subjectPostData.privacy = $event;
  }

  customVisiblity(visibility) {
    this.subjectPostData.privacy = visibility;
    let modal = this.modalCtrl.create(CustomVisibiltyPage);
    modal.onDidDismiss(data => {
      if (data && data.customPostId && data.custom) {
        this.message.custom = data.custom;
        this.taggedUsersIds = data.customPostId;
      }
    });
    modal.present();
  }

  private openGallery(): void {
    this.photosToUpload = [];
    let cameraOptions = {
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.FILE_URI,
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: Camera.EncodingType.JPEG,
      correctOrientation: true
    }
    Camera.getPicture(cameraOptions)
      .then((file_uri) => {
        this.imageSrc = file_uri;
        this.commonService.getFileFromUri(this.imageSrc)
          .then((file) => {
            this.photosToUpload.push(file);
          })
          .catch((err) => {
            console.log(err);
          })
      })
      .catch((err) => {
        console.log(err);
      })
  }

  takePicture() {
    this.photosToUpload = [];
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    }).then((imageData) => {
      // imageData is a base64 encoded string
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.imageSrc = "data:image/jpeg;base64," + imageData;
      this.photosToUpload = [this.dataURItoBlob(this.base64Image)];
    })
      .catch((err) => {
        console.log(err);
      })
  }

  public dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], { type: "image/jpeg" });
  }

  documentChangeEvent(fileInput: any) {
    this.documentsToUpload = <Array<File>>fileInput.target.files;
    this.fileData = fileInput;
    if (typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) {
      if (this.documentsToUpload[0].type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || this.documentsToUpload[0].type == 'application/msword' || this.documentsToUpload[0].type == 'application/pdf' || this.documentsToUpload[0].type == 'text/xml' || this.documentsToUpload[0].type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || this.documentsToUpload[0].type == 'application/vnd.ms-powerpoint' || this.documentsToUpload[0].type == 'application/vnd.ms-excel' || this.documentsToUpload[0].type == 'text/plain') {
        if (this.documentsToUpload[0].size > (1024 * 1024 * 40)) {
          this.commonService.showToast("Document size should be less than 40 MB!.");
          this.documentsToUpload = [];
          this.fileData.target.value = '';
        }
      }
      else {
        this.commonService.showToast('Invalid document format!');
        this.documentsToUpload = [];
        this.fileData.target.value = '';
      }
    }
  }

  videoChangeEvent(fileInput: any) {
    this.videosToUpload = <Array<File>>fileInput.target.files;
    this.fileData = fileInput;
    if (typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) {
      if (this.videosToUpload[0].type == 'video/mp4' || this.videosToUpload[0].type == 'video/webm' || this.videosToUpload[0].type == 'video/ogg' || this.videosToUpload[0].type == 'video/quicktime' || this.videosToUpload[0].type == 'video/3gpp') {
        if (this.videosToUpload[0].size > (1024 * 1024 * 40)) {
          this.commonService.showToast("Video size should be less than 40 MB!.");
          this.videosToUpload = [];
          this.fileData.target.value = '';
        }
      }
      else {
        this.commonService.showToast('Invalid video format!');
        this.videosToUpload = [];
        this.fileData.target.value = '';
      }
    }
  }

  audioChangeEvent(fileInput: any) {
    this.audiosToUpload = <Array<File>>fileInput.target.files;
    this.fileData = fileInput;
    if (typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) {
      if (this.audiosToUpload[0].type == 'audio/mpeg' || this.audiosToUpload[0].type == 'audio/ogg' || this.audiosToUpload[0].type == 'audio/wav' || this.audiosToUpload[0].type == 'audio/mp3') {
        if (this.audiosToUpload[0].size > (1024 * 1024 * 40)) {
          this.commonService.showToast("Audio size should be less than 40 MB!.");
          this.audiosToUpload = [];
          this.fileData.target.value = '';
        }
      }
      else {
        this.commonService.showToast('Invalid audio format!');
        this.audiosToUpload = [];
        this.fileData.target.value = '';
      }
    }
  }

  private openGalleryVideo(): void {
    let cameraOptions = {
      mediaType: Camera.MediaType.VIDEO,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.FILE_URI,
      quality: 100,
    }
    Camera.getPicture(cameraOptions)
      .then((file_uri) => {
        console.log('file_urinnnnnnnnnnn',file_uri);
        this.commonService.getFileFromUri(file_uri)

        .then((file) => {
          this.videosToUpload.push(file);
        })
        .catch((err) => {
          console.log(err);
        })
      })
      .catch((err) => {
        console.log(err);
      })
  }

 private takeVideo():void {
   let options: CaptureVideoOptions = { duration: 300 };
    MediaCapture.captureVideo(options).then((data: MediaFile[]) =>{
       this.commonService.getFileFromUri(data[0].fullPath)
        .then((file) => {
          this.videosToUpload.push(file);
        })
        .catch((err) => {
          console.log(err);
        })
    }).catch((err)=>{
      console.log(err);
    })
  }

  private recordAudio():void{
    let options: CaptureAudioOptions = { duration: 300 };
    MediaCapture.captureAudio().then((data:MediaFile[]) =>{
      this.commonService.getFileFromUri(data[0].fullPath)
      .then((file)=>{
        this.audiosToUpload.push(file);
      }).catch((err)=>{
        console.log(err);
      })
    }).catch((err) =>{
      console.log(err);
    });
  }
}
