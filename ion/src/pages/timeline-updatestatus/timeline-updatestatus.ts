import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { MyWallPage } from '../my-wall/my-wall';
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
import { Camera, MediaCapture, MediaFile, CaptureVideoOptions, CaptureAudioOptions } from 'ionic-native';
import { MyWallSearch } from '../../interfaces/common-interfaces';

declare function unescape(s: string): string;

/*
  Generated class for the MywallUpdatestatus page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'timeline-update-status',
  templateUrl: 'timeline-updatestatus.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class TimelineUpdatestatusPage {
  public fileData;
  public filename: string = '';
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
  public wallType: string = '';
  public notiMsg: string = 'Enter your message';
  public timelinePostData: Post = new Post();
  public selectedPostPrivacyType: number = 1;
  public taggedUsersIds: Array<number> = [];
  public selectedSCD: number = 0;
  public searchData: MyWallSearch = new MyWallSearch();
  public searchedSubjectsList: Array<any> = [];
  public searchedCollegesList: Array<any> = [];
  public searchedDegreesList: Array<any> = [];
  public scdId: number = null;

  // apis to upload photo
  private _subjectUploadPhotosFiles: string = '/api/post/postPhotosTypeFiles/';
  private _collegeUploadPhotosFiles: string = '/api/college_post/postPhotosTypeFiles/';
  private _degreeUploadPhotosFiles: string = '/api/degree_post/postPhotosTypeFiles/';
  private _timelineUploadPhotosFiles: string = '/api/post/postTimelinePhotosTypeFiles';
  // apis to upload video
  private _subjectUploadVideoFiles: string = '/api/post/postVideosTypeFiles/';
  private _collegeUploadVideoFiles: string = '/api/college_post/postVideosTypeFiles/';
  private _degreeUploadVideoFiles: string = '/api/degree_post/postVideosTypeFiles/';
  private _timelineUploadVideoFiles: string = '/api/post/postTimelineVideosTypeFiles';
  // apis to upload audio
  private _subjectUploadAudioFiles: string = '/api/post/postAudiosTypeFiles/';
  private _collegeUploadAudioFiles: string = '/api/college_post/postAudiosTypeFiles/';
  private _degreeUploadAudioFiles: string = '/api/degree_post/postAudiosTypeFiles/';
  private _timelineUploadAudioFiles: string = '/api/post/postTimelineAudiosTypeFiles';
  // apis to upload document
  private _subjectUploadDocumentFiles: string = '/api/post/postDocumentsTypeFiles/';
  private _collegeUploadDocumentFiles: string = '/api/college_post/postDocumentsTypeFiles/';
  private _degreeUploadDocumentFiles: string = '/api/degree_post/postDocumentsTypeFiles/';
  private _timelineUploadDocumentFiles: string = '/api/post/postTimelineDocumentsTypeFiles';
  // apis to upload embed video
  private _subjectUploadEmbedVideoFiles: string = '/api/post/postVideoEmbedLink/';
  private _collegeUploadEmbedVideoFiles: string = '/api/college_post/postVideoEmbedLink/';
  private _degreeUploadEmbedVideoFiles: string = '/api/degree_post/postVideoEmbedLink/';
  private _timelineUploadEmbedVideoFiles: string = '/api/post/postTimelineVideoEmbedLink';
  // apis to upload embed audio
  private _subjectUploadEmbedAudioFiles: string = '/api/post/postAudioEmbedLink/';
  private _collegeUploadEmbedAudioFiles: string = '/api/college_post/postAudioEmbedLink/';
  private _degreeUploadEmbedAudioFiles: string = '/api/degree_post/postAudioEmbedLink/';
  private _timelineUploadEmbedAudioFiles: string = '/api/post/postTimelineAudioEmbedLink';
  // apis to upload embed photo
  private _subjectUploadEmbedPhotoFiles: string = '/api/post/postPhotoEmbedLink/';
  private _collegeUploadEmbedPhotoFiles: string = '/api/college_post/postPhotoEmbedLink/';
  private _degreeUploadEmbedPhotoFiles: string = '/api/degree_post/postPhotoEmbedLink/';
  private _timelineUploadEmbedPhotoFiles: string = '/api/post/postTimelinePhotoEmbedLink';
  // apis to upload other data
  private _subjectUploadOtherFiles: string = '/api/post/postAllTypeData/';
  private _collegeUploadOtherFiles: string = '/api/college_post/postAllTypeData/';
  private _degreeUploadOtherFiles: string = '/api/degree_post/postAllTypeData/';
  private _timelineUploadOtherFiles: string = '/api/post/postTimelineAllTypeData';

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public commonService: CommonService,
    public myWallService: MyWallService,
    public viewCtrl: ViewController,
    public dataService: DataService,
  ) {
    this.postMsgLinkQuesType = 1;
    this.photosToUpload = [];
    this.documentsToUpload = [];
    this.audiosToUpload = [];
    this.videosToUpload = [];
    this.pet = navParams.data.tabValue;
    this.postMsgLinkQuesType = navParams.data.postType;
  }

  ionViewDidLoad() {
    this.imageSrc = this.dataService.apiBaseUrl + "public/files/ProfilePicture/no_image.png";
  }

  cancel() {
    this.viewCtrl.dismiss();
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
    this.timelinePostData.privacy = this.selectedPostPrivacyType;
    this.timelinePostData.catagory = this.catagory;
    this.timelinePostData.created_on = new Date();
    this.timelinePostData.custom = this.selectedPostPrivacyType == 5 ? this.taggedUsersIds : [];
    if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
      if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
      { this.message.name.name = null; }
      this.loader = true;
      this.timelinePostData.photo = this.photosToUpload;
      this.timelinePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
      if (this.searchData.subject_name && this.scdId) {
        this.timelinePostData.types = 1;
        this.dataService.wallPostFormData(this._subjectUploadPhotosFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.college_name && this.scdId) {
        this.timelinePostData.types = 2;
        this.dataService.wallPostFormData(this._collegeUploadPhotosFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.degree_name && this.scdId) {
        this.timelinePostData.types = 3;
        this.dataService.wallPostFormData(this._degreeUploadPhotosFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else {
        this.timelinePostData.types = 5;
        this.dataService.wallPostFormData(this._timelineUploadPhotosFiles, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      }
    }
    else if (typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) {
      if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
      { this.message.name.name = null; }
      this.loader = true;
      this.timelinePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
      this.timelinePostData.video = this.videosToUpload;
      if (this.searchData.subject_name && this.scdId) {
        this.timelinePostData.types = 1;
        this.dataService.wallPostFormData(this._subjectUploadVideoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.college_name && this.scdId) {
        this.timelinePostData.types = 2;
        this.dataService.wallPostFormData(this._collegeUploadVideoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.degree_name && this.scdId) {
        this.timelinePostData.types = 3;
        this.dataService.wallPostFormData(this._degreeUploadVideoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else {
        this.timelinePostData.types = 5;
        this.dataService.wallPostFormData(this._timelineUploadVideoFiles, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      }
    }
    else if (typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) {
      if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
      { this.message.name.name = null; }
      this.loader = true;
      this.timelinePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
      this.timelinePostData.audio = this.audiosToUpload;
      if (this.searchData.subject_name && this.scdId) {
        this.timelinePostData.types = 1;
        this.dataService.wallPostFormData(this._subjectUploadAudioFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.college_name && this.scdId) {
        this.timelinePostData.types = 2;
        this.dataService.wallPostFormData(this._collegeUploadAudioFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.degree_name && this.scdId) {
        this.timelinePostData.types = 3;
        this.dataService.wallPostFormData(this._degreeUploadAudioFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else {
        this.timelinePostData.types = 5;
        this.dataService.wallPostFormData(this._timelineUploadAudioFiles, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      }
    }
    else if (typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) {
      if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
      { this.message.name.name = null; }
      this.loader = true;
      this.timelinePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
      this.timelinePostData.document = this.documentsToUpload;
      if (this.searchData.subject_name && this.scdId) {
        this.timelinePostData.types = 1;
        this.dataService.wallPostFormData(this._subjectUploadDocumentFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.college_name && this.scdId) {
        this.timelinePostData.types = 2;
        this.dataService.wallPostFormData(this._collegeUploadDocumentFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.degree_name && this.scdId) {
        this.timelinePostData.types = 3;
        this.dataService.wallPostFormData(this._degreeUploadDocumentFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else {
        this.timelinePostData.types = 5;
        this.dataService.wallPostFormData(this._timelineUploadDocumentFiles, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      }
    }
    else if (typeof (this.message.embedLink.video) != 'undefined' && this.message.embedLink.video != '') {
      if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
      { this.message.name.name = null; }
      this.loader = true;
      this.timelinePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
      this.timelinePostData.link = this.message.embedLink.video;
      if (this.searchData.subject_name && this.scdId) {
        this.timelinePostData.types = 1;
        this.dataService.postData(this._subjectUploadEmbedVideoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.college_name && this.scdId) {
        this.timelinePostData.types = 2;
        this.dataService.postData(this._collegeUploadEmbedVideoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.degree_name && this.scdId) {
        this.timelinePostData.types = 3;
        this.dataService.postData(this._degreeUploadEmbedVideoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else {
        this.timelinePostData.types = 5;
        this.dataService.postData(this._timelineUploadEmbedVideoFiles, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      }
    }
    else if (typeof (this.message.embedLink.audio) != 'undefined' && this.message.embedLink.audio != '') {
      if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
      { this.message.name.name = null; }
      this.loader = true;
      this.timelinePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
      this.timelinePostData.link = this.message.embedLink.audio;
      if (this.searchData.subject_name && this.scdId) {
        this.timelinePostData.types = 1;
        this.dataService.postData(this._subjectUploadEmbedAudioFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.college_name && this.scdId) {
        this.timelinePostData.types = 2;
        this.dataService.postData(this._collegeUploadEmbedAudioFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.degree_name && this.scdId) {
        this.timelinePostData.types = 3;
        this.dataService.postData(this._degreeUploadEmbedAudioFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else {
        this.timelinePostData.types = 5;
        this.dataService.postData(this._timelineUploadEmbedAudioFiles, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      }
    }
    else if (typeof (this.message.embedLink.photo) != 'undefined' && this.message.embedLink.photo != '') {
      if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
      { this.message.name.name = null; }
      this.loader = true;
      this.timelinePostData.link = this.message.embedLink.photo;
      this.timelinePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
      if (this.searchData.subject_name && this.scdId) {
        this.timelinePostData.types = 1;
        this.dataService.postData(this._subjectUploadEmbedPhotoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.college_name && this.scdId) {
        this.timelinePostData.types = 2;
        this.dataService.postData(this._collegeUploadEmbedPhotoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else if (this.searchData.degree_name && this.scdId) {
        this.timelinePostData.types = 3;
        this.dataService.postData(this._degreeUploadEmbedPhotoFiles + this.scdId, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      } else {
        this.timelinePostData.types = 5;
        this.dataService.postData(this._timelineUploadEmbedPhotoFiles, this.timelinePostData).subscribe((result) => {
          if (result['status'] == 2) {
            this.commonService.showToast('Your post has been posted successfully.');
            this.viewCtrl.dismiss();
          }
          this.loader = false;
        });
      }
    }
    else {
      if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 1) && (this.message.message.message !== '')) {
        console.log('this.this.message.message.message', this.message.message.message);
        this.timelinePostData.message = this.message.message.message ? this.message.message.message.replace(/(^[ \t]*\n)/gm, "") : '';
        this.loader = true;
        if (this.searchData.subject_name && this.scdId) {
          this.timelinePostData.types = 1;
          this.dataService.postData(this._subjectUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
            if (result['status'] == 2) {
              this.commonService.showToast('Your post has been posted successfully.');
              this.viewCtrl.dismiss();
            }
            this.loader = false;
          });
        } else if (this.searchData.college_name && this.scdId) {
          this.timelinePostData.types = 2;
          this.dataService.postData(this._collegeUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
            if (result['status'] == 2) {
              this.commonService.showToast('Your post has been posted successfully.');
              this.viewCtrl.dismiss();
            }
            this.loader = false;
          });
        } else if (this.searchData.degree_name && this.scdId) {
          this.timelinePostData.types = 3;
          this.dataService.postData(this._degreeUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
            if (result['status'] == 2) {
              this.commonService.showToast('Your post has been posted successfully.');
              this.viewCtrl.dismiss();
            }
            this.loader = false;
          });
        } else {
          console.log('this.timelinePostData', this.timelinePostData);
          this.timelinePostData.types = 5;
          this.dataService.postData(this._timelineUploadOtherFiles, this.timelinePostData).subscribe((result) => {
            if (result['status'] == 2) {
              this.commonService.showToast('Your post has been posted successfully.');
              this.viewCtrl.dismiss();
            }
            this.loader = false;
          });
        }
      }
      else if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 2) && (this.message.question.question !== '')) {
        this.timelinePostData.question = this.message.question.question ? this.message.question.question.replace(/(^[ \t]*\n)/gm, "") : '';
        this.loader = true;
        if (this.searchData.subject_name && this.scdId) {
          this.timelinePostData.types = 1;
          this.dataService.postData(this._subjectUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
            if (result['status'] == 2) {
              this.commonService.showToast('Your post has been posted successfully.');
              this.viewCtrl.dismiss();
            }
            this.loader = false;
          });
        } else if (this.searchData.college_name && this.scdId) {
          this.timelinePostData.types = 2;
          this.dataService.postData(this._collegeUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
            if (result['status'] == 2) {
              this.commonService.showToast('Your post has been posted successfully.');
              this.viewCtrl.dismiss();
            }
            this.loader = false;
          });
        } else if (this.searchData.degree_name && this.scdId) {
          this.timelinePostData.types = 3;
          this.dataService.postData(this._degreeUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
            if (result['status'] == 2) {
              this.commonService.showToast('Your post has been posted successfully.');
              this.viewCtrl.dismiss();
            }
            this.loader = false;
          });
        } else {
          this.timelinePostData.types = 5;
          this.dataService.postData(this._timelineUploadOtherFiles, this.timelinePostData).subscribe((result) => {
            if (result['status'] == 2) {
              this.commonService.showToast('Your post has been posted successfully.');
              this.viewCtrl.dismiss();
            }
            this.loader = false;
          });
        }
      }
      else if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 5) && (this.message.link.description !== '')) {
        if (this.validateLinkURL(this.message.link.description)) {
          this.timelinePostData.link = this.message.link.description;
          this.timelinePostData.linkTitle = this.message.link.title ? this.message.link.title.replace(/(^[ \t]*\n)/gm, "") : '';
          if (this.searchData.subject_name && this.scdId) {
            this.timelinePostData.types = 1;
            this.dataService.postData(this._subjectUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
              if (result['status'] == 2) {
                this.commonService.showToast('Your post has been posted successfully.');
                this.viewCtrl.dismiss();
              }
              this.loader = false;
            });
          } else if (this.searchData.college_name && this.scdId) {
            this.timelinePostData.types = 2;
            this.dataService.postData(this._collegeUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
              if (result['status'] == 2) {
                this.commonService.showToast('Your post has been posted successfully.');
                this.viewCtrl.dismiss();
              }
              this.loader = false;
            });
          } else if (this.searchData.degree_name && this.scdId) {
            this.timelinePostData.types = 3;
            this.dataService.postData(this._degreeUploadOtherFiles + this.scdId, this.timelinePostData).subscribe((result) => {
              if (result['status'] == 2) {
                this.commonService.showToast('Your post has been posted successfully.');
                this.viewCtrl.dismiss();
              }
              this.loader = false;
            });
          } else {
            this.timelinePostData.types = 5;
            this.dataService.postData(this._timelineUploadOtherFiles, this.timelinePostData).subscribe((result) => {
              if (result['status'] == 2) {
                this.commonService.showToast('Your post has been posted successfully.');
                this.viewCtrl.dismiss();
              }
              this.loader = false;
            });
          }
        }
        else {
          this.commonService.showToast("Invalid url!");
        }
      }
      else {
        this.commonService.showToast("Please fill the fields");
      }
    }
  }

  validateLinkURL(textval) {
    if (!textval.includes('http://') && !textval.includes('https://')) {
      textval = 'http://' + textval;
      this.message.link.description = textval;
    }
    var urlregex = /^(https?|Https?|HTtps?|HTTps?|HTTPs?|HTTPS?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
  }

  validateURL(textval) {
    var urlregex = /^(https?|Https?|HTtps?|HTTps?|HTTPs?|HTTPS?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
  }

  selectCatagory(event) {
    this.catagory = event;
  }

  selectVisibility($event) {
    this.timelinePostData.privacy = $event;
  }

  customVisiblity(visibility) {
    this.timelinePostData.privacy = visibility;
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

  public onChangeSCD(value): void {
    this.selectedSCD = value;
    this.searchedSubjectsList = [];
    this.searchedCollegesList = [];
    this.searchedDegreesList = [];
    this.searchData.college_name = '';
    this.searchData.degree_name = '';
    this.searchData.subject_name = '';
  }

  public subjectSearch(e: any): void {
    this.searchedCollegesList = [];
    this.searchedDegreesList = [];
    this.searchData.college_name = '';
    this.searchData.degree_name = '';
    if (this.searchData.subject_name) {
      this.myWallService.getUserSubjects(this.searchData.subject_name).subscribe((res) => {
        if (res.status == 2) {
          this.searchedSubjectsList = res.data;
        }
      })
    } else {
      this.searchData.subject_name = '';
      this.searchedSubjectsList = [];
      this.scdId = null;
    }
  }
  public selectSubject(id: number, name: string): void {
    this.searchData.subject_name = name;
    this.scdId = id;
    this.searchedSubjectsList = [];
  }
  public collegeSearch(e: any): void {
    this.searchedSubjectsList = [];
    this.searchedDegreesList = [];
    this.searchData.degree_name = '';
    this.searchData.subject_name = '';
    if (this.searchData.college_name) {
      this.myWallService.getUserColleges(this.searchData.college_name).subscribe((res) => {
        if (res.status == 2) {
          this.searchedCollegesList = res.data;
        }
      })
    } else {
      this.searchData.college_name = '';
      this.searchedCollegesList = [];
      this.scdId = null;
    }
  }
  public degreeSearch(e: any): void {
    this.searchedCollegesList = [];
    this.searchedSubjectsList = [];
    this.searchData.college_name = '';
    this.searchData.subject_name = '';
    if (this.searchData.degree_name) {
      this.myWallService.getUserDegrees(this.searchData.degree_name).subscribe((res) => {
        if (res.status == 2) {
          this.searchedDegreesList = res.data;
        }
      })
    } else {
      this.searchData.degree_name = '';
      this.searchedDegreesList = [];
      this.scdId = null;
    }
  }
  public selectCollege(id: number, name: string): void {
    this.searchData.college_name = name;
    this.scdId = id;
    this.searchedCollegesList = [];
  }
  public selectDegree(id: number, name: string): void {
    this.searchData.degree_name = name;
    this.scdId = id;
    this.searchedDegreesList = [];
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

  private takeVideo(): void {
    let options: CaptureVideoOptions = { duration: 300 };
    MediaCapture.captureVideo(options).then((data: MediaFile[]) => {
      this.commonService.getFileFromUri(data[0].fullPath)
        .then((file) => {
          this.videosToUpload.push(file);
        })
        .catch((err) => {
          console.log(err);
        })
    }).catch((err) => {
      console.log(err);
    })
  }
  private recordAudio(): void {
    let options: CaptureAudioOptions = { duration: 300 };
    MediaCapture.captureAudio().then((data: MediaFile[]) => {
      this.commonService.getFileFromUri(data[0].fullPath)
        .then((file) => {
          this.audiosToUpload.push(file);
        }).catch((err) => {
          console.log(err);
        })
    }).catch((err) => {
      console.log(err);
    });
  }
}