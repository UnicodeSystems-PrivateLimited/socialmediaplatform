import { Component } from '@angular/core';
import { NavController, ToastController, NavParams, ViewController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { CommonService } from '../../providers/common-service';
import { ChatService } from '../../providers/chat-service';
import { PageService } from '../../providers/page-service';
import { Camera, FileChooser, File, FilePath } from 'ionic-native';
declare function unescape(s: string): string;

/*
  Generated class for the AddGroupModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-group-modal',
  templateUrl: 'add-group-modal.html',
  providers: [CommonService, DataService, ChatService, PageService]

})
export class AddGroupModalPage {
  public photosToUpload;
  public groups = [];
  public imageFile;
  public groupDeleteId;
  public errorGroupMsg = { errorName: '', errorIcon: '' };
  public groupdata = { title: '' };
  public _dataUrlGroupAdd = '/api/groupchat/addGroup';
  public _addloginMemberUrl = '/api/groupchat/addloginmembers/';
  public base64Image: string;
  private imageSrc: string;
  public loader: boolean = false;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private dataService: DataService,
    private commonService: CommonService,
    private chatService: ChatService,
    private pageService: PageService,
    public toastCtrl: ToastController, ) {
  }
  ionViewDidLoad() {
    this.imageSrc = this.dataService.apiBaseUrl + "public/files/ProfilePicture/no_image.png";
  }


  dismiss() {
    this.viewCtrl.dismiss();
    if (typeof (this.imageFile) != "undefined") {
      this.imageFile.target.value = "";
      this.groupdata.title = "";
      this.photosToUpload = this.errorGroupMsg.errorName = this.errorGroupMsg.errorIcon = "";
    }
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

  photoChangeEvent(fileInput: any) {
    this.photosToUpload = <Array<File>>fileInput.target.files;
    this.imageFile = fileInput;
    if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
      this.errorGroupMsg.errorIcon = '';
    }
    else {
      this.errorGroupMsg.errorIcon = "Invalid image format";
      this.errorGroupMsg.errorName = "";
    }
  }

  createGroup() {
    this.loader = true;
    var letters = /^[a-z\d\-_\s]+$/i;
    if (this.groupdata.title != '' && this.groupdata.title.match(letters)) {
      if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
        if (this.errorGroupMsg.errorIcon == '') {
          this.chatService.addChatGroup(this._dataUrlGroupAdd + '/' + this.groupdata.title, [], this.photosToUpload).then((res) => {
            this.dataService.getData(this._addloginMemberUrl + res['data']._id).subscribe(res => {
              console.log("default user added" + JSON.stringify(res.data));
            });
            this.loader = false;
            this.commonService.showToast('Group Created');
            this.dismiss();
            this.photosToUpload = this.errorGroupMsg.errorName = this.errorGroupMsg.errorIcon = "";
            this.groupdata.title = "";
           if(this.imageFile){
            this.imageFile.target.value = "";
           }
          });

        }
      } else {
        this.errorGroupMsg.errorName = "";
        this.commonService.showToast('Select The Chat Group Image.');
        this.loader = false;
      }
    } else {
      this.errorGroupMsg.errorIcon = "";
      this.commonService.showToast('Group Name Required.');
      this.loader = false;
    }
  }

}
