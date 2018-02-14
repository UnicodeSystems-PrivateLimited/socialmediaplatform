import { Component } from "@angular/core";
import { NavController, NavParams, ViewController } from "ionic-angular";
import { DataService } from "../../providers/data-service";
import { CommonService } from "../../providers/common-service";
import { UserService } from "../../providers/user-service";
import { AddSCD } from "../../interfaces/common-interfaces";
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import {
  Camera,
  MediaCapture,
  MediaFile,
  CaptureVideoOptions,
  CaptureAudioOptions
} from "ionic-native";
declare function unescape(s: string): string;
/*
  Generated class for the JoinSCD page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: "add-scd-new",
  templateUrl: "add-scd-new.html"
})
export class AddSCDNew {
  public _subjectAdd = "api/user/addSubject";
  public _collegeAdd = "api/user/addCollege";
  public _degreeAdd = "api/user/addDegree";
  private _dataUrlAddSubject = 'api/subject/addSubject';
  private _dataUrlAddOnlySubject = 'api/subject/addOnlySubject';
  private _dataUrlAddOnlyCollege = 'api/college/addOnlyCollege';
  private _dataUrlAddCollege = 'api/college/addCollege';
  public _dataUrlAddOnlyDegree = 'api/degree/addOnlyDegree';
  private _dataUrlAddDegree = 'api/degree/addnewDegree';
  public futureDate = null;
  public wallId: number;
  public wallName: string = "";
  public newsubject: AddSCD = new AddSCD();
  public selectCategory: Array<any> = [
    { label: "Currently Taking / Future / Past Student", value: 1 },
    { label: "Subject Expert", value: 3 },
    { label: "Teacher of Subject", value: 4 },
    { label: "Just Interested", value: 5 }
  ];
  public categoryValue: number = 2;
  public type: number = 0;
  public userDetails: any = null;
  public searchInput = { name: "", user_id: "" };
  public searchActive: boolean = false;
  public currentSubject = [];
  public pastSubject = [];
  public futureSubject = [];
  public subjectExpertsList = [];
  public subjectTeacherList = [];
  public justInterestedList = [];
  public subjectLength = 1;
  public loader: boolean = false;

  public currentCollege = [];
  public pastCollege = [];
  public futureCollege = [];
  public collegeLength = 1;

  public currentDegree = [];
  public pastDegree = [];
  public futureDegree = [];
  public degreeLength = 1;

  public searchSubject = [];
  public searchSubjectLength = 1;
  public searchCollege = [];
  public searchCollegeLength = 1;
  public searchDegree = [];
  public searchDegreeLength = 1;

  public photosToUpload: any[] = [];
  public base64Image: string;
  private imageSrc: string;
  public message = { name: { name: '' } };
  public errorAddSubject;
  public errorEditSubject;
  public errorSubjectIcon = '';
  public imageFile;
  public errorAddCollege;
  public errorCollegeIcon = '';
  public error = { degreeIcon: '', degreename: '', degreeOption: '' };
  public messageDegree = { name: { name: '' }, type: { type: '' } };
  public types;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public dataService: DataService,
    public commonService: CommonService,
    private userService: UserService
  ) {
    this.wallName = navParams.data.wallName;
    this.type = navParams.data.type;
    let todayDate = new Date();
    let year = todayDate.getFullYear();
    let month = todayDate.getMonth();
    let day = todayDate.getDate();
    this.futureDate = new Date(year + 25, month, day).toISOString();
    this.userDetails = this.userService.getSavedUser();
    this.userService
      .getIonicStoredUser()
      .then(userSavedData => {
        this.userDetails = this.userDetails
          ? this.userDetails
          : userSavedData ? JSON.parse(userSavedData) : null;
      })
      .catch(err => {
        console.log(err);
      });
      this.types =
      [{ "type": 2, "name": 'Bachelor' },
          { "type": 6, "name": 'Master' }]
  }

  ionViewDidLoad() {}

  public Time = {
    timeStarts: new Date().toISOString(),
    timeEnds: new Date().toISOString()
  };

  public clearDate() {
    this.Time.timeStarts = new Date().toISOString();
    this.Time.timeEnds = new Date().toISOString();
  }

  public clearAddSCD() {
    this.newsubject = new AddSCD();
    this.categoryValue = 2;
  }

  public changeCatagories(subCatg: any): void {
    this.categoryValue = subCatg;
  }

  dismiss(status: number) {
    if (status == 2) {
      this.viewCtrl.dismiss({ is_member: true });
    } else {
      this.viewCtrl.dismiss();
    }
  }

  onInput() {
    if (this.searchInput.name != "" && this.searchInput.name != null) {
      this.searchActive = true;
      var nameValid = /^[a-z\d\-_\s]+$/i;
      if (this.searchInput.name.match(nameValid)) {
        this.searchInput.user_id = this.userDetails.userID;
        this.currentSubject = [];
        this.pastSubject = [];
        this.futureSubject = [];
        this.subjectLength = 1;
        this.currentCollege = [];
        this.pastCollege = [];
        this.futureCollege = [];
        this.collegeLength = 1;
        this.currentDegree = [];
        this.pastDegree = [];
        this.futureDegree = [];
        this.degreeLength = 1;
        if (this.wallName == "Subject") {
          this.loader = true;
          this.userService
            .getSearchedSubjects(this.searchInput.name)
            .subscribe(res => {
              this.loader = false;
              if (res.status == 2) {
                this.searchSubject = res.subjects;
                this.searchSubjectLength = this.searchSubject.length;
                this.searchDegreeLength = 1;
                this.searchCollegeLength = 1;
                this.searchDegree = [];
                this.searchCollege = [];
              }
            });
        } else if (this.wallName == "Degree") {
          this.loader = true;
          this.userService
            .getSearchedDegrees(this.searchInput.name)
            .subscribe(res => {
              this.loader = false;
              if (res.status) {
                this.searchDegree = res.degrees;
                this.searchSubjectLength = 1;
                this.searchDegreeLength = this.searchDegree.length;
                this.searchCollegeLength = 1;
                this.searchSubject = [];
                this.searchCollege = [];
              }
            });
        } else if (this.wallName == "College") {
          this.loader = true;
          this.userService
            .getSearchedColleges(this.searchInput.name)
            .subscribe(res => {
              this.loader = false;
              if (res.status) {
                this.searchCollege = res.colleges;
                this.searchSubjectLength = 1;
                this.searchDegreeLength = 1;
                this.searchCollegeLength = this.searchCollege.length;
                this.searchDegree = [];
                this.searchSubject = [];
              }
            });
        }
      }
    } else {
      this.searchCollege = [];
      this.searchSubjectLength = 1;
      this.searchDegreeLength = 1;
      this.searchCollegeLength = 1;
      this.searchDegree = [];
      this.searchSubject = [];
      this.searchActive = false;
    }
  }

  public onSCDClick(id: number, name: string) {
    this.wallId = id;
    this.searchInput.name = name;
    if (this.wallName == "Subject") {
      this.searchSubject = [];
    } else if (this.wallName == "College") {
      this.searchCollege = [];
    } else if (this.wallName == "Degree") {
      this.searchDegree = [];
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
    };
    Camera.getPicture(cameraOptions)
      .then(file_uri => {
        this.imageSrc = file_uri;
        this.commonService
          .getFileFromUri(this.imageSrc)
          .then(file => {
            this.photosToUpload.push(file);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  }

  takePicture() {
    this.photosToUpload = [];
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    })
      .then(imageData => {
        // imageData is a base64 encoded string
        this.base64Image = "data:image/jpeg;base64," + imageData;
        this.imageSrc = "data:image/jpeg;base64," + imageData;
        this.photosToUpload = [this.dataURItoBlob(this.base64Image)];
      })
      .catch(err => {
        console.log(err);
      });
  }

  public dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString;
    if (dataURI.split(",")[0].indexOf("base64") >= 0)
      byteString = atob(dataURI.split(",")[1]);
    else byteString = unescape(dataURI.split(",")[1]);
    // separate out the mime component
    var mimeString = dataURI
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], { type: "image/jpeg" });
  }

  public addSubject(): void {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
          if (this.errorSubjectIcon == '') {
              if (this.message.name.name != '') {
                      this.loader = true;
                      this.dataService.postFormData(this._dataUrlAddSubject + '/' + this.message.name.name, this.photosToUpload).then((result) => {
                          if (result['status'] == 3) {
                              this.loader = false;
                              this.message.name.name = '';
                              this.photosToUpload = [];
                              this.errorAddSubject = '';
                              this.commonService.showToast(result['msg']);
                          } else if (result['status'] = 2) {
                              this.loader = false;
                              this.photosToUpload = [];
                              this.message.name.name = '';
                              this.errorAddSubject = '';
                              this.commonService.showToast("Subject Added Successfully");
                              this.dismiss(2);
                              this.goTosubject(result['data']['_id']);
                          }
                  }, (error) => {
                      console.error(error);
                  });
              } else {
                  this.errorSubjectIcon = '';
                  this.errorAddSubject = "Subject Name Required!.";
                  this.commonService.showToast("Subject Name Required!.");
              }
          }
      } else {
          if (this.errorSubjectIcon == '') {
              if (this.message.name.name != '') {
                  this.loader = true;
                  this.dataService.postData(this._dataUrlAddOnlySubject, this.message.name).subscribe(post_subject => {
                    this.loader = false;
                      if (post_subject['status'] == 3) {
                          this.message.name.name = '';
                          this.errorAddSubject = '';
                          this.commonService.showToast(post_subject['msg']);
                      } else if (post_subject['status'] = 2) {
                          this.message.name.name = '';
                          this.errorAddSubject = '';
                          this.commonService.showToast("Subject Added Successfully");
                          this.dismiss(2);
                          this.goTosubject(post_subject['data']['_id']);
                      }
                  }, (error) => {
                      console.error(error);
                  });
              } else {
                  this.errorSubjectIcon = '';
                  this.errorAddSubject = "Subject Name Required!.";
                  this.commonService.showToast("Subject Name Required!.");
              }
          }
      }
  }

  public addCollege(): void {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.errorCollegeIcon == '') {
          if (typeof (this.message.name.name) != 'undefined' && this.message.name.name != null && this.message.name.name != '') {
              this.loader = true;
              this.dataService.postFormData(this._dataUrlAddCollege + '/' + this.message.name.name, this.photosToUpload).then((result) => {
                this.loader = false;
                  if (result['status'] == 3) {
                      this.message.name.name = '';
                      this.errorAddCollege = '';
                      this.photosToUpload = [];
                      if (typeof (this.imageFile) != "undefined")
                          this.imageFile.target.value = "";
                      this.commonService.showToast(result['msg']);
                  } else if (result['status'] = 2) {
                      this.photosToUpload = [];
                      this.message.name.name = '';
                      this.errorAddCollege = '';
                      if (typeof (this.imageFile) != "undefined")
                      this.imageFile.target.value = "";
                      this.commonService.showToast("College Added Successfully");
                      this.dismiss(2);
                      this.goTocollege(result['data']['_id']);
                  }
              }, (error) => {
                  console.error(error);
              });
          } else {
              this.errorCollegeIcon = '';
              this.errorAddCollege = "College Name Required!.";
              this.commonService.showToast("College Name Required!.");
          }
      } else {
          if (this.errorCollegeIcon == '') {
              if (this.message.name.name != '' && this.message.name.name!=null) {
                    this.loader = true;
                      this.dataService.postData(this._dataUrlAddOnlyCollege, this.message.name).subscribe(post_college => {
                        this.loader = false;
                      if (post_college['status'] == 3) {
                          this.message.name.name = '';
                          this.errorAddCollege = '';
                          this.commonService.showToast(post_college['msg']);
                      } else if (post_college['status'] = 2) {
                          this.message.name.name = '';
                          this.errorAddCollege = '';
                          this.commonService.showToast("College Added Successfully");
                          this.dismiss(2);
                          this.goTocollege(post_college['data']['_id']);
                      }
                  }, (error) => {
                      console.error(error);
                  });
              } else {
                  this.errorCollegeIcon = '';
                  this.errorAddCollege = "College Name Required!.";
                  this.commonService.showToast("College Name Required!.");
              }
          }
      }
  }

  public addDegree(): void {
      if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.error.degreeIcon == '') {
        if (typeof this.messageDegree.name.name != 'undefined' && this.messageDegree.name.name != null && this.messageDegree.name.name != '') {
              this.loader = true;
                this.dataService.postFormData(this._dataUrlAddDegree + '/' + this.messageDegree.name.name + '/' + this.messageDegree.type.type, this.photosToUpload).then((result) => {
                  this.loader = false;
                    if (result['status'] == 3) {
                        this.messageDegree.name.name = '';
                        this.messageDegree.type.type = '';
                        this.photosToUpload = [];
                        if (typeof (this.imageFile) != "undefined")
                            this.imageFile.target.value = "";
                        this.commonService.showToast(result['msg']);
                    } else if (result['status'] = 2) {
                        this.photosToUpload = [];
                        this.messageDegree.name.name = '';
                        this.messageDegree.type.type = '';
                        if (typeof (this.imageFile) != "undefined")
                            this.imageFile.target.value = "";
                        this.commonService.showToast("Degree Added Successfully");
                        this.dismiss(2);
                        this.goTodegree(result['data']['_id']);
                    }
                }, (error) => {
                    console.error(error);
                });
            } else {
            this.error.degreeIcon = '';
            this.error.degreeOption = '';
            this.error.degreename = "Degree name is required!.";
            this.commonService.showToast("Degree Name Required!.");
        }
    } else {
        if (this.error.degreeIcon == '') {
            if (typeof this.messageDegree.name.name != 'undefined' && this.messageDegree.name.name != null && this.messageDegree.name.name != '') {
                  this.loader = true;
                    this.dataService.postData(this._dataUrlAddOnlyDegree, this.messageDegree).subscribe(post_subject => {
                      this.loader = false;
                        if (post_subject['status'] == 3) {
                            this.messageDegree.name.name = '';
                            this.messageDegree.type.type = '';
                            this.error.degreename = '';
                            this.error.degreeOption = '';
                            this.commonService.showToast(post_subject['msg']);
                        } else if (post_subject['status'] = 2) {
                            this.messageDegree.name.name = '';
                            this.messageDegree.type.type = '';
                            this.error.degreename = '';
                            this.error.degreeOption = '';
                            this.commonService.showToast("Degree Added Successfully");
                            this.dismiss(2);
                            this.goTodegree(post_subject['data']['_id']);
                        }
                    }, (error) => {
                        console.error(error);
                    });
                } else {
                this.error.degreeIcon = '';
                this.error.degreeOption = '';
                this.error.degreename = "Degree name is required!.";
                this.commonService.showToast("Degree Name Required!.");
            }
        }
    }
  }
  
  goTosubject(wallId) {
    this.navCtrl.push(SubjectPage, { wallId: wallId });
  }

  goTocollege(wallId) {
    this.navCtrl.push(CollegePage, { wallId: wallId });
  }

  goTodegree(wallId) {
    this.navCtrl.push(DegreePage, { wallId: wallId });
  }
}
