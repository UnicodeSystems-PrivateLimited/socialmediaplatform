import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { SettingService } from '../../providers/setting-service';
import { CommonService } from '../../providers/common-service';
import { Setting } from '../../interfaces';
import { AddSocialLinkPage } from '../add-social-link/add-social-link';
import { DataService } from '../../providers/data-service';
import { MyWallService } from '../../providers/my-wall-service';
import { UserService } from '../../providers/user-service';
import { Camera } from 'ionic-native';
import { Storage } from '@ionic/storage';


/*
  Generated class for the Setting page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  public getSocialLinks = '/api/user/getSocialLink';
  public postSettingStatus: Setting = new Setting();
  public loader: boolean = true;
  public tab: string = "accountSetting";
  public social_link = { facebook: '', twitter: '', linkedin: '', google_plus: '', bitbucket: '' };
  public generalInformation = { userName: null, userEmail: null, userPass: null, userConfirmPass: null, checkStatus: 1 };
  private user;
  private _profileUrl = '/api/user/profile/minimal';
  public photosToUpload: any[] = [];
  public _dataUploadProfilePicture = '/api/user/addProfilePicture/';
  public _saveUpdateUrl = '/api/user/saveUpdate';
  private _skillSearch = 'api/skill/skillSearch';
  public skillList = null;
  public dataToStore: Object = null;
  public skillData;
  private _skillAdd = 'api/skill/addSkill';
  private _dataUrlAddSkill = 'api/skill/add/';
  private _dataUrlSkill = 'api/skill/getuserskills';
  private _skillRemove = 'api/skill/removeSkill/';
  public userId;
  public skill = { name: "", id: null };
  public oldInformation: any = { userName: null, userEmail: null, userPass: null, userConfirmPass: null, checkStatus: 1 };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public service: SettingService,
    public ionicStorage: Storage,
    public commonService: CommonService,
    public modalCtrl: ModalController,
    public dataService: DataService,
    private myWallService: MyWallService,
    private userService: UserService
  ) { }

  ionViewDidLoad() {
    this.getPostSettingData();
    this.getUserSocialLinks();
    this.getProfile();
    this.getSkillData();
    let user = this.userService.getSavedUser();
    this.userService.getIonicStoredUser()
      .then((userSavedData) => {
        user = user ? user : userSavedData ? JSON.parse(userSavedData) : null;

      });
    this.generalInformation.userName = user.userFullName;
    this.generalInformation.userEmail = user.email;
    this.oldInformation.userName = user.userFullName;
    this.oldInformation.userEmail = user.email;
    this.userId = user.userID;
  }

  public getUserSocialLinks() {
    this.loader = true;
    this.dataService.getData(this.getSocialLinks)
      .subscribe(res => {
        if (res.status === 2) {
          this.social_link = res.data;
        }
        this.loader = false;
      });
  }
  public getPostSettingData(): void {
    this.loader = true;
    this.service.getInitData().subscribe((res) => {
      if (res.status == 2) {
        this.postSettingStatus.post_status = res.data[0].post_status;
      }
      this.loader = false;
    });
  }

  public onUpdateStatus(): void {
    this.postSettingStatus.post_status = this.postSettingStatus.post_status ? 1 : 0;
    this.service.updatePostSetting(this.postSettingStatus).subscribe((res) => {
      if (res.status == 2) {
        this.commonService.showToast('Setting updated successfully');
      }
    });
  }
  public editSocialLinks() {
    let modal = this.modalCtrl.create(AddSocialLinkPage, { social_link: this.social_link });
    modal.onDidDismiss(data => {
      this.getUserSocialLinks();
    });
    modal.present();
  }

  public getProfile() {
    this.dataService.getData(this._profileUrl).subscribe(user => {
      this.user = user;
      if (user.photo != "" && typeof (user.photo) != 'undefined' && user.photo != null) {
        this.user.photo = user.photo;
      }
      else {
        this.user.photo = '';
      }
    });
  }

  public onUploadIconClick(event: any): void {
    event.stopPropagation();
    this.myWallService.showProfileActionSheet(
      () => this.openGallery(),
      () => this.takePicture()
    );
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
        this.commonService.getFileFromUri(file_uri)
          .then((file) => {
            this.photosToUpload.push(file);
            this.uploadPhoto();
          })
          .catch((err) => {
            console.log(err);
          })
      }, (err) => {
        console.log(err);
      });
  }

  takePicture() {
    this.photosToUpload = [];
    Camera.getPicture({
      destinationType: Camera.DestinationType.FILE_URI,
      targetWidth: 1000,
      targetHeight: 1000
    })
      .then((file_uri) => {
        this.commonService.getFileFromUri(file_uri)
          .then((file) => {
            this.photosToUpload.push(file);
            this.uploadPhoto();
          })
          .catch((err) => {
            console.log(err);
          })
      }, (err) => {
        console.log(err);
      });

  }
  uploadPhoto() {
    if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
      this.loader = true;
      this.dataService.postFormData(this._dataUploadProfilePicture + this.userId, this.photosToUpload).then((result) => {
        this.loader = false;
        if (result['data']) {
          this.user.photo = result['data'] + '?t=' + new Date().getTime();
        }
      }, (error) => {
        console.error(error);
      });
    }
  }

  public saveUpdate() {
    var letters = /^[a-z\d\-_\s]+$/i;
    var emailLetters = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var regXExpression = /\d/;
    var regExpression = /([!,%,&,@,#,$,^,*,?,_,~])/;
    if (this.generalInformation.userName !== this.oldInformation.userName || this.generalInformation.userEmail !== this.oldInformation.userEmail || this.generalInformation.userPass !== this.oldInformation.userPass || this.generalInformation.userConfirmPass !== this.oldInformation.userConfirmPass) {
      this.oldInformation.userName = this.generalInformation.userName;
      this.oldInformation.userEmail = this.generalInformation.userEmail;
      if (this.generalInformation.userName.match(letters) && this.generalInformation.userName != '') {
        if (this.generalInformation.userEmail.match(emailLetters) && this.generalInformation.userEmail != '') {
          if (!this.generalInformation.userPass && !this.generalInformation.userConfirmPass) {
            this.updateProfile();
          } else {
            if (this.generalInformation.userPass && this.generalInformation.userPass.match(regXExpression) && this.generalInformation.userPass.match(regExpression) && this.generalInformation.userPass.length > 4) {
              this.updateProfile();
            } else {
              this.commonService.showToast("Password must be 5 characters long, contain atleast 1 number and 1 special character");
            }
          }
        } else {
          this.commonService.showToast("Invalid User Email");
        }
      } else {
        this.commonService.showToast("Invalid User Name");
      }
    }
  }

  public updateProfile(): void {
    this.loader = true;
    this.dataService.postData(this._saveUpdateUrl, this.generalInformation).subscribe(res => {
      if (res.status == 2) {
        this.loader = false;
        this.dataToStore = { userFullName: this.generalInformation.userName, email: this.generalInformation.userEmail, password: this.generalInformation.userPass };
        window.localStorage.setItem('user', JSON.stringify(this.dataToStore));
        this.ionicStorage.set('user', JSON.stringify(this.dataToStore));
        this.commonService.showToast(res.message);
      }
      else {
        this.commonService.showToast(res.message);
      }
    });
  }

  public getSkill(event) {
    if (this.skill.name == '' || this.skill.name == null) {
      this.skillList = null;
    }
    else {
      var nameValid = /^[a-z\d\-_\s]+$/i;
      if (this.skill.name.match(nameValid)) {
        this.dataService.postData(this._skillSearch, this.skill).subscribe(res => {
          if (res.status == 2) {
            this.skillList = res.data;
          }
        });
      }
    }
  }
  public selectSkill(id, title) {
    this.skill.name = title;
    this.skill.id = id;
    this.skillList = null;
  }

  public addSkill() {
    var letters = /^[a-z\d\-_\s]+$/i;
    if (this.skill.id != null) {
      this.loader = true;
      this.dataService.postData(this._skillAdd, this.skill).subscribe(res => {
        this.loader = false;
        if (res.status == 2) {
          this.commonService.showToast("Added " + this.skill.name + " to your Skills");
          this.skill.name = null;
          this.skill.id = null;
          this.skillList = null;
          this.getSkillData();
        } else if (res.status == 3) {
          this.commonService.showToast(this.skill.name + " already added to skills");
          this.skill.name = null;
          this.skill.id = null;
          this.skillList = null;
        }
      });
    }
    else if (this.skill.name != '' && this.skill.name != null && typeof (this.skill.name) != "undefined") {
      if (this.skill.name.match(letters)) {
        this.loader = true;
        this.dataService.postData(this._dataUrlAddSkill, this.skill).subscribe(res => {
          if (res.status == 2) {
            this.commonService.showToast("Added " + this.skill.name + " to your Skills");
            this.skill.name = null;
            this.skill.id = null;
            this.loader = false;
            this.skillList = null;
            this.getSkillData();
          }
        });
      } else {
        this.commonService.showToast("Added Invalid Skill Name to your Skills");
      }
    } else {
      this.commonService.showToast('Select skill');
    }
  }
  public getSkillData() {
    this.dataService.getData(this._dataUrlSkill)
      .subscribe(res => {
        if (res.status === 2) {
          this.skillData = res.data;
        }
      });
  }

  public onSkillDeleteClick(id) {
    this.commonService.showConfirm("", "Are you sure you want to delete this skill ?", () => this.deleteSkill(id));
  }

  public deleteSkill(id) {
    this.dataService.getData(this._skillRemove + id).subscribe(res => {
      this.getSkillData();
      this.commonService.showToast("Skill removed successfully.");
    });
  }
}
