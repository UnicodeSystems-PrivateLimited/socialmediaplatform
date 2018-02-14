import { Component } from '@angular/core';
import { NavController, NavParams, Platform, MenuController } from 'ionic-angular';
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { MyWallService } from '../../providers/my-wall-service';
import { PageService } from '../../providers/page-service';
import { UserService } from "../../providers/user-service";
import { Storage } from '@ionic/storage';
import { MyWallPage } from '../my-wall/my-wall';
import moment from 'moment';
import { Camera } from 'ionic-native';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { InvitePage } from '../invite/invite';
declare function unescape(s: string): string;
/*
  Generated class for the MyProfile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-my-profile',
  templateUrl: 'my-profile.html',
  providers: [CommonService, DataService, MyWallService, PageService, UserService]
})
export class MyProfilePage {
  public _saveUpdateUrl = '/api/user/saveUpdate';
  public _headerDataUrl = '/api/user/getHeaderData';
  private _subjectSearch = 'api/subject/subjectSearch';
  private _collegeSearch = 'api/college/collegeSearch';
  private _degreeSearch = 'api/degree/degreeSearch';
  private _skillSearch = 'api/skill/skillSearch';
  private _skillAdd = 'api/skill/addSkill';
  private _dataUrlAddSkill = 'api/skill/add/';
  private _dataUrlSkill = 'api/skill/getuserskills';
  private _skillRemove = 'api/skill/removeSkill/';
  private _subjectAdd = 'api/user/addSubject';
  private _subjectRemove = 'api/user/removeSubject/';
  private _collegeRemove = 'api/user/removeCollege/';
  private _degreeRemove = 'api/user/removeDegree/';
  private _collegeAdd = 'api/user/addCollege';
  private _degreeAdd = 'api/user/addDegree';
  public _dataUploadProfilePicture = '/api/user/addProfilePicture/';
  private _profileUrl = '/api/user/profile/minimal';
  public tab: string = "Academics";
  public dataToStore: Object = null;
  public subjectList = null;
  public subject = { name: "", _id: null, from: null, to: null, subjects_user_type: null, userOffset: null };
  public generalInformation = { userName: null, userEmail: null, userPass: null, userConfirmPass: null, checkStatus: 1 };
  public categoryValue: string = null;
  public catagory = null;
  public college = { name: "", _id: null, from: null, to: null, userOffset: null };
  public degree = { name: "", _id: null, from: null, to: null, userOffset: null };
  public collegeList = null;
  public degreeList = null;
  public skill = { name: "", id: null };
  public skillList = null;
  public skillData;
  public collegeData;
  public degreeData;
  public subjectData;
  public type;
  public login_details;
  public futureDate = null;
  public photosToUpload: any[] = [];
  private imageSrc: string;
  public base64Image: string;
  public userId;
  public registerType: string = null;
  public parameter;
  private user;
  public loader: boolean = false;
  public pageType: number = 2;
  public heading: string = null;
  public oldInformation: any = { userName: null, userEmail: null, userPass: null, userConfirmPass: null, checkStatus: 1 };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataService: DataService,
    public commonService: CommonService,
    public pageService: PageService,
    public service: UserService,
    public ionicStorage: Storage,
    public myWallService: MyWallService,
    public platform: Platform,
    public menu: MenuController
  ) {
    this.pageType = navParams.data.pageType;
    let todayDate = new Date();
    let year = todayDate.getFullYear();
    let month = todayDate.getMonth();
    let day = todayDate.getDate();
    this.futureDate = new Date(year + 25, month, day).toISOString();
    this.registerType = navParams.data.type;
    this.parameter = navParams;
    this.parameter.data = 10;
    if (this.registerType == '1') {
      this.menu.enable(true);
      this.heading = 'My Dashboard';
      this.tab = "Academics";
    }
    if (this.pageType == 1) {
      this.heading = 'My Profile';
      this.tab = "Profile";
    } else {
      this.heading = 'My Dashboard';
      this.tab = "Academics";
    }

  }


  ionViewDidLoad() {
    this.getAccountData();
    this.getProfile();
    this.getSkillData();
    console.log('ionViewDidLoad MyProfilePage');
    let user = this.service.getSavedUser();
    this.service.getIonicStoredUser()
      .then((userSavedData) => {
        user = user ? user : userSavedData ? JSON.parse(userSavedData) : null;

      });
    this.generalInformation.userName = user.userFullName;
    this.generalInformation.userEmail = user.email;
    this.userId = user.userID;
  }

  public subjectTime = {
    timeStarts: new Date().toISOString(),
    timeEnds: new Date().toISOString()
  }

  public degreeTime = {
    timeStarts: new Date().toISOString(),
    timeEnds: new Date().toISOString()
  }

  public collegeTime = {
    timeStarts: new Date().toISOString(),
    timeEnds: new Date().toISOString()
  }

  public getAccountData() {
    this.dataService.getData(this._headerDataUrl).subscribe(header => {
      console.log('header data', header);
      this.collegeData = header.data.college;
      this.degreeData = header.data.degree;
      this.subjectData = header.data.subjects;
      this.generalInformation.userName = header.data.fname + ' ' + header.data.lname;
      this.generalInformation.userEmail = header.data.local.email;
      this.type = header.Type;
      this.login_details = header.data.login_details;
      this.oldInformation.userName = header.data.fname + ' ' + header.data.lname;
      this.oldInformation.userEmail = header.data.local.email;
    });
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
    this.dataService.postData(this._saveUpdateUrl, this.generalInformation).subscribe(res => {
      console.log('res+++++++++++++++++++', res)
      if (res.status == 2) {
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

  public getSubject(event) {
    if (this.subject.name == '' || this.subject.name == null) {
      this.subjectList = null;
    }
    else {
      var nameValid = /^[a-z\d\-_\s]+$/i;
      if (this.subject.name.match(nameValid)) {
        this.dataService.postData(this._subjectSearch, this.subject).subscribe(res => {
          if (res.status == 2) {
            this.subjectList = res.data;
          }
        });
      }
    }
  }

  public getCollege(event) {
    if (this.college.name == '' || this.college.name == null) {
      this.collegeList = null;
    }
    else {
      var nameValid = /^[a-z\d\-_\s]+$/i;
      if (this.college.name.match(nameValid)) {
        this.dataService.postData(this._collegeSearch, this.college).subscribe(res => {
          if (res.status == 2) {
            this.collegeList = res.data;
          }
        });
      }
    }
  }

  public getDegree(event) {
    if (this.degree.name == '' || this.degree.name == null) {
      this.degreeList = null;
    }
    else {
      var nameValid = /^[a-z\d\-_\s]+$/i;
      if (this.degree.name.match(nameValid)) {
        this.dataService.postData(this._degreeSearch, this.degree).subscribe(res => {
          if (res.status == 2) {
            this.degreeList = res.data;
          }
        });
      }
    }
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

  public selectCollege(id, name) {
    this.college.name = name;
    this.college._id = id;
    this.collegeList = null;
  }

  public selectSubject(id, name) {
    this.subject.name = name;
    this.subject._id = id;
    this.subjectList = null;
  }

  public selectDegree(id, name) {
    this.degree.name = name;
    this.degree._id = id;
    this.degreeList = null;
  }

  public catagories(catagory) {
    this.catagory = catagory;
    if (catagory == 1) {
      this.categoryValue = 'Currently Taking / Future / Past Student';
      this.subject.subjects_user_type = catagory;
    }
    else if (catagory == 3) {
      this.categoryValue = 'Subject Expert';
      this.subject.subjects_user_type = catagory;
    }
    else if (catagory == 4) {
      this.categoryValue = 'Teacher of Subject';
      this.subject.subjects_user_type = catagory;
    }
    else if (catagory == 5) {
      this.categoryValue = 'Just Interested';
      this.subject.subjects_user_type = catagory;
    }
    else {
      this.categoryValue = '';
      this.subject.subjects_user_type = null;
    }
  }

  public addSkill() {
    var letters = /^[a-z\d\-_\s]+$/i;
    if (this.skill.id != null) {
      this.dataService.postData(this._skillAdd, this.skill).subscribe(res => {
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
        this.dataService.postData(this._dataUrlAddSkill, this.skill).subscribe(res => {
          if (res.status == 2) {
            this.commonService.showToast("Added " + this.skill.name + " to your Skills");
            this.skill.name = null;
            this.skill.id = null;
            this.skillList = null;
            this.getSkillData();
          }
        });
      } else {
        this.commonService.showToast("Added Invalid Skill Name  to your Skills");
      }
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

  public addSubject() {
    if (this.subject._id != null) {
      this.subject.userOffset = new Date().getTimezoneOffset();
      if (this.catagory == 1 || this.catagory == 2) {
        let fromYear = new Date(this.subjectTime.timeStarts).getFullYear();
        let fromMonth = new Date(this.subjectTime.timeStarts).getMonth();
        let toYear = new Date(this.subjectTime.timeEnds).getFullYear();
        let toMonth = new Date(this.subjectTime.timeEnds).getMonth();
        this.subject.from = new Date(fromYear, fromMonth, 1);
        this.subject.to = new Date(toYear, toMonth + 1, 0);
        var currentDate = new Date();
        var yesterday = new Date(currentDate.getTime());
        yesterday.setDate(currentDate.getDate() - 1);
        if (this.subject.from != '' && this.subject.to != '') {
          // if (this.subject.from.getTime() > yesterday.getTime()) {
          if (moment(this.subject.to).isSameOrAfter(this.subject.from)) {
            if (this.subject.subjects_user_type) {
              this.dataService.postData(this._subjectAdd, this.subject).subscribe(res => {
                if (res.status == 2) {
                  this.commonService.showToast("Added " + this.subject.name + " to your Subjects");
                  this.subject.name = null;
                  this.subject._id = null;
                  this.subject.from = null;
                  this.subject.to = null;
                  this.subject.subjects_user_type = null;
                  this.categoryValue = null;
                  this.clearDate(1);
                  this.getAccountData();
                }
                else {
                  this.commonService.showToast(res.message);
                }
              });
            }
            else {
              this.commonService.showToast("All Fields Required.");
            }
            this.clearDate(1);
          } else {
            this.commonService.showToast("End date is too short than start date");
          }
          // } else {
          //   this.commonService.showToast("Start date should be greater than or equal to current date");
          // }
        }
        else {
          this.commonService.showToast("Select The Date.");
        }
      }
      else {
        if (this.subject.subjects_user_type) {
          this.dataService.postData(this._subjectAdd, this.subject).subscribe(res => {
            if (res.status == 2) {
              this.commonService.showToast("Added " + this.subject.name + " to your Subjects");
              this.subject.name = null;
              this.subject._id = null;
              this.subject.from = null;
              this.subject.to = null;
              this.subject.subjects_user_type = null;
              this.categoryValue = null;

              this.clearDate(1);
              this.getAccountData();
            }
            else {
              this.commonService.showToast(res.message);
            }
          });
        }
        else {
          this.commonService.showToast("All Fields Required.");
        }
      }
    } else {
      this.commonService.showToast('Select subject to add');
    }
  }

  public onSubjectDeleteClick(id) {
    this.commonService.showConfirm("", "Are you sure you want to delete this subject ?", () => this.deleteSubject(id));
  }

  public deleteSubject(id) {
    this.dataService.getData(this._subjectRemove + id).subscribe(res => {
      this.getAccountData();
      this.commonService.showToast("Subject removed successfully.");
    });
  }

  public onDegreeDeleteClick(id) {
    this.commonService.showConfirm("", "Are you sure you want to delete this degree ?", () => this.deleteDegree(id));
  }

  public deleteDegree(id) {
    this.dataService.getData(this._degreeRemove + id).subscribe(res => {
      this.getAccountData();
      this.commonService.showToast("Degree removed successfully.");
    });
  }

  public onCollegeDeleteClick(id) {
    this.commonService.showConfirm("", "Are you sure you want to delete this college ?", () => this.deleteCollege(id));
  }

  public deleteCollege(id) {
    this.dataService.getData(this._collegeRemove + id).subscribe(res => {
      this.getAccountData();
      this.commonService.showToast("College removed successfully.");
    });
  }

  public clearDate(dateType) {
    if (dateType == 1) {
      this.subjectTime.timeStarts = new Date().toISOString();
      this.subjectTime.timeEnds = new Date().toISOString();
    }
    else if (dateType == 3) {
      this.degreeTime.timeStarts = new Date().toISOString();
      this.degreeTime.timeEnds = new Date().toISOString();
    }
    else if (dateType == 2) {
      this.collegeTime.timeStarts = new Date().toISOString();
      this.collegeTime.timeEnds = new Date().toISOString();
    }
  }

  public addCollege() {
    if (this.college._id != null) {
      this.college.userOffset = new Date().getTimezoneOffset();
      let fromYear = new Date(this.collegeTime.timeStarts).getFullYear();
      let fromMonth = new Date(this.collegeTime.timeStarts).getMonth();
      let toYear = new Date(this.collegeTime.timeEnds).getFullYear();
      let toMonth = new Date(this.collegeTime.timeEnds).getMonth();
      this.college.from = new Date(fromYear, fromMonth, 1);
      this.college.to = new Date(toYear, toMonth + 1, 0);
      if (this.college.to && this.college.from) {
        if (moment(this.college.to).isSameOrAfter(this.college.from)) {
          this.dataService.postData(this._collegeAdd, this.college).subscribe(res => {
            if (res.status == 2) {
              this.commonService.showToast("Added " + this.college.name + " to your Colleges");
              this.college.name = null;
              this.college._id = null;
              this.college.from = null;
              this.college.to = null;
              this.clearDate(2);
              this.getAccountData();
            }
            else {
              this.commonService.showToast(res.message);
            }
          });
        } else {
          this.commonService.showToast("To date is too short than From Date.");
        }
      } else {
        this.commonService.showToast("Select The Date.");
      }
    }
    else {
      this.commonService.showToast('Select college to add');
    }
  }

  public addDegree() {
    if (this.degree._id != null) {
      this.degree.userOffset = new Date().getTimezoneOffset();
      let fromYear = new Date(this.degreeTime.timeStarts).getFullYear();
      let fromMonth = new Date(this.degreeTime.timeStarts).getMonth();
      let toYear = new Date(this.degreeTime.timeEnds).getFullYear();
      let toMonth = new Date(this.degreeTime.timeEnds).getMonth();
      this.degree.from = new Date(fromYear, fromMonth, 1);
      this.degree.to = new Date(toYear, toMonth + 1, 0);
      if (this.degree.from && this.degree.to) {
        if (moment(this.degree.to).isSameOrAfter(this.degree.from)) {
          this.dataService.postData(this._degreeAdd, this.degree).subscribe(res => {
            if (res.status == 2) {
              this.commonService.showToast("Added " + this.degree.name + " to your Degrees");
              this.degree.name = null;
              this.degree._id = null;
              this.degree.from = null;
              this.degree.to = null;
              this.clearDate(3);
              this.getAccountData();
            }
            else {
              this.commonService.showToast(res.message);
            }
          });
        } else {
          this.commonService.showToast("To date is too short than From Date.");
        }
      } else {
        this.commonService.showToast("Select The Date.");
      }
    } else {
      this.commonService.showToast('Select degree to add');
    }
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
        console.log("file_uri", file_uri);
        this.commonService.getFileFromUri(file_uri)
          .then((file) => {
            this.photosToUpload.push(file);
            console.log('this.photosToUpload getImage');
            console.log(this.photosToUpload);
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
            console.log('this.photosToUpload getImage');
            console.log(this.photosToUpload);
            this.uploadPhoto();
          })
          .catch((err) => {
            console.log(err);
          })
      }, (err) => {
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

  uploadPhoto() {
    if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
      this.loader = true;
      this.dataService.postFormData(this._dataUploadProfilePicture + this.userId, this.photosToUpload).then((result) => {
        this.loader = false;
        if (result['data']) {
          this.user.photo = result['data'] + '?t=' + new Date().getTime();
          this.commonService.showToast("Profile photo updated successfully");                    
        }
      }, (error) => {
        console.error(error);
      });
    }
  }

  public onUploadIconClick(event: any): void {
    event.stopPropagation();
    this.myWallService.showProfileActionSheet(
      () => this.openGallery(),
      () => this.takePicture()
    );
  }

  getProfile() {
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

  goToMyWall() {
    this.navCtrl.push(MyWallPage);
  }
  getSubjectWall(id) {
    this.navCtrl.push(SubjectPage, { wallId: id });
  }

  getCollegeWall(id) {
    this.navCtrl.push(CollegePage, { wallId: id });
  }

  getDegreeWall(id) {
    this.navCtrl.push(DegreePage, { wallId: id });
  }

  inviteFriends(){
    this.navCtrl.push(InvitePage,{isRegister:true});
  }
}
