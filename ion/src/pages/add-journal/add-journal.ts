import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
declare function unescape(s: string): string;
/*
  Generated class for the AddJournal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-journal',
  templateUrl: 'add-journal.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class AddJournalPage {

  public title = { title: '' };
  public base64Image: string;
  private imageSrc: string;
  public photosToUpload: any[] = [];
  // public fileToUpload: any[] = [];
  // public CamerafileToUpload: any;
  public _createJournal = '/api/journal/createJournals';
  public data;
  public addData
  public loader: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public myWallService: MyWallService,
    public viewCtrl: ViewController,
    public dataService: DataService
  ) {

  }

  ionViewDidLoad() {
    this.imageSrc = this.dataService.apiBaseUrl + "public/files/ProfilePicture/no_image.png";
    console.log('ionViewDidLoad AddJournalPage');
  }

  addTitle() {
    if (this.title.title != '' && this.title.title != null) {
      if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
        this.loader = true;
        this.myWallService.addJournalPhoto(this.photosToUpload, this.title.title, this._createJournal)
          .then((res) => {
            this.data = res['data'];
            this.loader = false;
            this.title.title = '';
            this.commonService.showToast(res.msg);
            this.dismiss();
          }, (err) => {
            this.loader = false;
            this.commonService.showToast(err.msg);
          })
          .catch((err) => {
            console.log(err);
          })
      }
      else {
        this.loader = true;
        this.myWallService.addJournalTitle(this.title)
          .then((res) => {
            this.data = res.data;
            this.loader = false;
            this.title.title = '';
            this.commonService.showToast(res.msg);
            this.dismiss();
          }, (err) => {
            this.loader = false;
            this.commonService.showToast(err.msg);
          })
          .catch((err) => {
            console.log(err);
          })
      }
    } else {
      this.commonService.showToast('Title is required');
    }
  }

  private openGallery(): void {
    this.photosToUpload = [];
    console.log("openGallery");
    let cameraOptions = {
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.FILE_URI,
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: Camera.EncodingType.JPEG,
      correctOrientation: true
    }
    console.log("cameraOptions", cameraOptions);

    Camera.getPicture(cameraOptions)
      .then((file_uri) => {
        this.imageSrc = file_uri;
        this.commonService.getFileFromUri(this.imageSrc)
          .then((file) => {
            this.photosToUpload.push(file);
            console.log(this.photosToUpload);
          })
          .catch((err) => {
            console.log(err);
          })
      })
      .catch((err) => {
        console.log(err);
      });
  }

  takePicture() {
    this.photosToUpload = [];

    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    }).then((imageData) => {
      console.log("imageData", imageData);
      // imageData is a base64 encoded string
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.imageSrc = "data:image/jpeg;base64," + imageData;
      this.photosToUpload = [this.dataURItoBlob(this.base64Image)];
    }, (err) => {
      console.log(err);
    })
      .catch((err) => {
        console.log(err);
      });
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

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
