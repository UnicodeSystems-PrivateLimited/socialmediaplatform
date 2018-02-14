import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { CustomShareModalPage } from '../custom-share-modal/custom-share-modal';
import { Camera, FileChooser, File, FilePath,MediaCapture,MediaFile } from 'ionic-native';
declare function unescape(s: string): string;
/*
  Generated class for the PostEdit page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-post-edit',
  templateUrl: 'post-edit.html'
})
export class PostEditPage {
  public _editPostUrl = '/api/post/editPost';
  public postEditData = { post_id: null, name: null, fileData: [], custom: [], privacy: null, post_type: null, type: 1, link: null, linkTitle: null, wallType: null }
  public editPrivacyTypes: any = [{ label: "Public", value: 1 }, { label: "Private(Only Me)", value: 2 }, { label: "All Friends", value: 3 }, { label: "All Followers", value: 4 }, { label: "All Friends And Followers", value: 6 }, { label: "Custom", value: 5 }];
  public selectedPrivacyType: number = 1;
  public userSearchField = { name: "", status: 3 };
  public userSearchList: Array<any> = [];
  public taggedUsersIds: Array<number> = [];
  public taggedUsersList: Array<any> = [];
  public showCustomPrivacymodel: boolean = false;
  public singlePostData: any;
  public error = { photo: '', video: '', audio: '', document: '', videoSize: '', audioSize: '', documentSize: '', showError: '' };
  public photosToUpload: Array<any> = [];
  public videosToUpload: Array<any> = [];
  public audiosToUpload: Array<any> = [];
  public documentsToUpload: Array<any> = [];
  public base64Image: string;
  public loader: boolean = false;
  private imageSrc: string;
  public customStatus: boolean = false;
  public embedLink = { title: '', video: '', audio: '', photo: '' };
  public groupId: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public commonService: CommonService,
    public dataService: DataService,
    public modalCtrl: ModalController
  ) {
    this.singlePostData = JSON.parse(JSON.stringify(navParams.data.post));
    this.selectedPrivacyType = this.singlePostData.privacy;
    this.groupId = (this.singlePostData.group_id && typeof this.singlePostData.group_id === 'object') ? (this.singlePostData.group_id._id ? this.singlePostData.group_id._id : null) : (this.singlePostData.group_id ? this.singlePostData.group_id : null);

  }

  ionViewDidLoad() {
  }

  public getFoldername(type): string {
    if (type == 1) return "Subject";
    if (type == 2) return "College";
    if (type == 3) return "Degree";
    if (type == 5) return "Timeline";
    if (type == 6) return "GroupWall";
  }

  public onChangeSharePrivacy(event): void {
    this.selectedPrivacyType = event;
    if (event == 5) {
      this.customshare();
    }
  }

  public customshare() {
    let modal = this.modalCtrl.create(CustomShareModalPage, { postData: this.singlePostData, groupId: this.groupId ? this.groupId : null });
    modal.onDidDismiss(data => {
      if (data && data.taggedUserId.length > 0) {
        for (let i in data.taggedUserId) {
          if (data.taggedUserId[i]) {
            this.taggedUsersIds.push(+i);
          }
        }
        this.customStatus = true;
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

  videoChangeEvent(fileInput: any) {
    this.videosToUpload = <Array<File>>fileInput.target.files;
    if (typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) {
      if (this.videosToUpload[0].type == 'video/mp4' || this.videosToUpload[0].type == 'video/webm' || this.videosToUpload[0].type == 'video/ogg' || this.videosToUpload[0].type == 'video/quicktime' || this.videosToUpload[0].type == 'video/3gpp') {
        this.error.video = '';
        if (this.videosToUpload[0].size < (1024 * 1024 * 40)) {
          this.error.videoSize = "";
        } else {
          this.error.video = '';
          this.error.videoSize = "Video size should be less than 40 MB!.";
        }
      }
      else {
        this.error.videoSize = '';
        this.error.video = 'Invalid video format!';
      }
    }
  }

  audioChangeEvent(fileInput: any) {
    this.audiosToUpload = <Array<File>>fileInput.target.files;
    if (typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) {
      if (this.audiosToUpload[0].type == 'audio/mpeg' || this.audiosToUpload[0].type == 'audio/ogg' || this.audiosToUpload[0].type == 'audio/wav' || this.audiosToUpload[0].type == 'audio/mp3') {
        this.error.audio = '';
        if (this.audiosToUpload[0].size <= (1024 * 1024 * 40)) {
          this.error.audioSize = "";
        } else {
          this.error.audio = '';
          this.error.audioSize = "Audio size should be less than 40 MB!.";
        }
      }
      else {
        this.error.audioSize = '';
        this.error.audio = 'Invalid audio format!';
      }
    }
  }

  documentChangeEvent(fileInput: any) {
    this.documentsToUpload = <Array<File>>fileInput.target.files;
    if (typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) {
      if (this.documentsToUpload[0].type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || this.documentsToUpload[0].type == 'application/msword' || this.documentsToUpload[0].type == 'application/pdf' || this.documentsToUpload[0].type == 'text/xml' || this.documentsToUpload[0].type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || this.documentsToUpload[0].type == 'application/vnd.ms-powerpoint' || this.documentsToUpload[0].type == 'application/vnd.ms-excel' || this.documentsToUpload[0].type == 'text/plain') {
        this.error.document = '';
        if (this.documentsToUpload[0].size < (1024 * 1024 * 40)) {
          this.error.documentSize = "";
        } else {
          this.error.document = '';
          this.error.documentSize = "Document size should be less than 40 MB!.";
        }
      }
      else {
        this.error.documentSize = '';
        this.error.document = 'Invalid document format!';
      }
    }
  }

  public onEditPost(): void {
    this.postEditData.post_id = this.singlePostData._id;
    this.postEditData.post_type = this.singlePostData.post_type;
    this.postEditData.fileData = (this.photosToUpload && typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) ? this.photosToUpload : (this.audiosToUpload && typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) ? this.audiosToUpload : (this.documentsToUpload && typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) ? this.documentsToUpload : (this.videosToUpload && typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) ? this.videosToUpload : [];
    // for original post => type=1, for shared post => type=2
    this.postEditData.type = this.singlePostData.origin_creator ? 2 : 1;
    if (this.singlePostData.origin_creator) {
      this.postEditData.name = this.singlePostData.shared_title ? this.singlePostData.shared_title.replace(/(^[ \t]*\n)/gm, "") : '';
    }
    else if (this.singlePostData.post_type == 1) {
      this.postEditData.name = this.singlePostData.message ? this.singlePostData.message.replace(/(^[ \t]*\n)/gm, "") : '';
    }
    else if (this.singlePostData.post_type == 2) {
      this.postEditData.name = this.singlePostData.question ? this.singlePostData.question.replace(/(^[ \t]*\n)/gm, "") : '';
    }
    else if (this.singlePostData.post_type == 5) {
      this.postEditData.linkTitle = this.singlePostData.link[0].title ? this.singlePostData.link[0].title.replace(/(^[ \t]*\n)/gm, "") : '';
      this.postEditData.link = this.singlePostData.link[0].description;
    }
    else if (this.singlePostData.post_type == 3 || this.singlePostData.post_type == 4 || this.singlePostData.post_type == 6 || this.singlePostData.post_type == 7) {
      this.postEditData.name = this.singlePostData.name ? this.singlePostData.name.replace(/(^[ \t]*\n)/gm, "") : '';
    }
    if (this.selectedPrivacyType == 5) {
      if (this.customStatus) {
        this.postEditData.custom = this.taggedUsersIds;
      }
      else {
        this.postEditData.custom = this.singlePostData.custom;
      }
    }
    if ((this.singlePostData.post_type == 3) && (this.singlePostData.photo[0].title) && (typeof (this.embedLink.photo) != 'undefined') && (this.embedLink.photo != '')) {
      this.postEditData.link = this.embedLink.photo;
    }
    if ((this.singlePostData.post_type == 4) && (this.singlePostData.video[0].title) && (typeof (this.embedLink.video) != 'undefined') && (this.embedLink.video != '')) {
      this.postEditData.link = this.embedLink.video;
    }
    if ((this.singlePostData.post_type == 6) && (this.singlePostData.audio[0].title) && (typeof (this.embedLink.audio) != 'undefined') && (this.embedLink.audio != '')) {
      this.postEditData.link = this.embedLink.audio;
    }
    this.postEditData.privacy = this.selectedPrivacyType;
    this.postEditData.wallType = this.singlePostData.types;
    this.editPost();
  }

  validateLinkURL(textval) {
    if(!textval.includes('http://') && !textval.includes('https://')){
      textval = 'http://'+textval;
      this.postEditData.link = textval;
    }
    var urlregex = /^(https?|Https?|HTtps?|HTTps?|HTTPs?|HTTPS?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
  }

  public validateURL(textval) {
    var urlregex = /^(https?|Https?|HTtps?|HTTps?|HTTPs?|HTTPS?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
  }

  public editPost(): void {
    if (this.postEditData.privacy == 5 && this.postEditData.custom.length == 0) {
      this.commonService.showToast('Please select at least one friend.');
    }
    else if (this.postEditData.type == 1 && this.postEditData.post_type == 1 && this.postEditData.name == '') {
      this.error.showError = 'Message cannot be empty.';
    }
    else if (this.postEditData.type == 1 && this.postEditData.post_type == 2 && this.postEditData.name == '') {
      this.error.showError = 'Question cannot be empty.';
    }
    else if (this.postEditData.type == 1 && this.postEditData.post_type == 5 && this.postEditData.link == '') {
      this.error.showError = 'Link cannot be empty.';
    }
    else if (this.postEditData.type == 1 && this.postEditData.post_type == 5 && !this.validateLinkURL(this.postEditData.link)) {
      this.error.showError = 'Invalid url!.';
    }
    else if (this.error.photo == '' && this.error.video == '' && this.error.videoSize == "" && this.error.audio == '' && this.error.audioSize == '' && this.error.documentSize == '' && this.error.document == '') {
      this.error.showError = '';
      this.loader = true;
      this.dataService.wallPostFormData(this._editPostUrl, this.postEditData).subscribe((res) => {
        this.loader = false;
        if (res.status == 2) {
          this.commonService.showToast(res.msg);
          this.dismiss(res.data);
        }
      });
    }
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  public addPhotoEmbedLink() {
    if (typeof (this.embedLink.title) != 'undefined' && (this.embedLink.title != "" && this.embedLink.title != null)) {
      if (this.validateImgURL(this.embedLink.title)) {
        this.embedLink.photo = this.embedLink.title;
        this.embedLink.title = "";
      } else {
        this.commonService.showToast("Invalid url!.");
      }
    } else {
      this.commonService.showToast("Please paste the photo link here!.");
    }
  }

  public addVideoEmbedLink() {
    if (typeof (this.embedLink.title) != 'undefined' && (this.embedLink.title != "" && this.embedLink.title != null)) {
      var myId = this.getId(this.embedLink.title);
      if (myId) {
        this.embedLink.video = myId;
        this.embedLink.title = "";
      } else {
        this.commonService.showToast("Invalid url!.");
      }
    } else {
      this.commonService.showToast("Please paste the youtube link here!.");
    }
  }

  public addAudioEmbedLink() {
    if (typeof (this.embedLink.title) != 'undefined' && (this.embedLink.title != "" && this.embedLink.title != null)) {
      if (this.validateURL(this.embedLink.title)) {
        this.embedLink.audio = this.embedLink.title;
        this.embedLink.title = "";
      } else {
        this.commonService.showToast("Invalid url!.");
      }
    } else {
      this.commonService.showToast("Please paste the audio link here!.");
    }
  }

  public validateImgURL(textval) {
    var urlregex = /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)$/;
    return urlregex.test(textval);
  }

  public getId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return false;
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
    MediaCapture.captureVideo().then((data: MediaFile[]) =>{
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
