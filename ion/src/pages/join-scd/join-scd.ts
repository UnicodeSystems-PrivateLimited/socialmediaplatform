import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { CommonService } from "../../providers/common-service";
import { UserService } from "../../providers/user-service";
import { AddSCD } from "../../interfaces/common-interfaces"
import moment from 'moment';

/*
  Generated class for the JoinSCD page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-join-scd',
  templateUrl: 'join-scd.html'
})
export class JoinSCDPage {
  public _subjectAdd = 'api/user/addSubject';
  public _collegeAdd = 'api/user/addCollege';
  public _degreeAdd = 'api/user/addDegree';
  public futureDate = null;
  public wallId: number;
  public wallName: string = '';
  public newsubject: AddSCD = new AddSCD();
  public selectCategory: Array<any> = [{ label: 'Currently Taking / Future / Past Student', value: 1 }, { label: 'Subject Expert', value: 3 }, { label: 'Teacher of Subject', value: 4 }, { label: 'Just Interested', value: 5 }];
  public categoryValue: number = 2;
  public searchType: number = 0;
  public userDetails: any = null;
  public searchInput = { name: '', user_id: '' };
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
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public dataService: DataService,
    public commonService: CommonService,
    private userService: UserService
  ) {
    this.wallId = navParams.data.wallId;
    this.wallName = navParams.data.wallName;
    this.searchType = navParams.data.searchType;
    let todayDate = new Date();
    let year = todayDate.getFullYear();
    let month = todayDate.getMonth();
    let day = todayDate.getDate();
    this.futureDate = new Date(year + 25, month, day).toISOString();
    this.userDetails = this.userService.getSavedUser();
    this.userService.getIonicStoredUser()
      .then((userSavedData) => {
        this.userDetails = this.userDetails ? this.userDetails : userSavedData ? JSON.parse(userSavedData) : null;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  ionViewDidLoad() {
  }

  public Time = {
    timeStarts: new Date().toISOString(),
    timeEnds: new Date().toISOString()
  }

  joinSCD() {
    if (this.wallId) {
      this.newsubject._id = +this.wallId;
      this.newsubject.userOffset = new Date().getTimezoneOffset();
      if (this.wallName == "Subject") {
        if (this.categoryValue != 2) {
          this.newsubject.subjects_user_type = this.categoryValue;
          if (this.categoryValue == 1) {
            if (this.Time.timeStarts && this.Time.timeEnds) {
              let year = new Date(this.Time.timeStarts).getFullYear();
              let month = new Date(this.Time.timeStarts).getMonth();
              let year1 = new Date(this.Time.timeEnds).getFullYear();
              let month1 = new Date(this.Time.timeEnds).getMonth();
              this.newsubject.from = new Date(year, month, 1);
              this.newsubject.to = new Date(year1, month1 + 1, 0);
              var currentDate = new Date();
              var yesterday = new Date(currentDate.getTime());
              if (moment(this.newsubject.to).isSameOrAfter(this.newsubject.from)) {
                this.addSubject();
                this.clearDate();
              } else {
                this.commonService.showToast("End date is too short than start date.");
              }
            } else {
              this.commonService.showToast("All Fields are Required.");
            }
          } else {
            this.addSubject();
          }
        } else {
          this.commonService.showToast("All Fields are Required.");
        }
      } else {
        let postUrl = this.wallName == "College" ? this._collegeAdd : this._degreeAdd;
        delete this.newsubject.subjects_user_type;
        if (this.Time.timeStarts && this.Time.timeEnds) {
          let year = new Date(this.Time.timeStarts).getFullYear();
          let month = new Date(this.Time.timeStarts).getMonth();
          let year1 = new Date(this.Time.timeEnds).getFullYear();
          let month1 = new Date(this.Time.timeEnds).getMonth();
          this.newsubject.from = new Date(year, month, 1);
          this.newsubject.to = new Date(year1, month1 + 1, 0);
          if (moment(this.newsubject.to).isSameOrAfter(this.newsubject.from)) {
            this.loader = true;
            this.dataService.postData(postUrl, this.newsubject).subscribe(res => {
              if (res.status == 2) {
                this.loader = false;
                this.commonService.showToast("Added " + this.wallName + " to your " + this.wallName + "'s");
                this.clearAddSCD();
                this.clearDate();
                this.dismiss(2);
              }
            });
          } else {
            this.commonService.showToast("End date is too short than start date.");
          }
        } else {
          this.commonService.showToast("All Fields are Required.");
        }
      }
    }else{
          this.commonService.showToast("All Fields are Required.");
    }
  }

  public addSubject(): void {
    this.loader = true;
    this.dataService.postData(this._subjectAdd, this.newsubject).subscribe(res => {
      if (res.status == 2) {
        this.loader = false;
        this.commonService.showToast("Added " + this.wallName + " to your " + this.wallName + "'s");
        this.clearAddSCD();
        this.dismiss(2);
      }
    });
  }

  public clearDate() {
    this.Time.timeStarts = new Date().toISOString();
    this.Time.timeEnds = new Date().toISOString();
  }

  public clearAddSCD() {
    this.newsubject = new AddSCD();
    this.categoryValue = 2;
  }

  public changeCatagories(subCatg: any): void {
    this.categoryValue = subCatg
  }

  dismiss(status: number) {
    if (status == 2) {
      this.viewCtrl.dismiss({ is_member: true });
    }
    else {
      this.viewCtrl.dismiss();
    }
  }

  onInput() {
    if (this.searchInput.name != '' && this.searchInput.name != null) {
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
        if (this.wallName == 'Subject') {
          this.loader = true;
          this.userService.getSearchedSubjects(this.searchInput.name)
            .subscribe((res) => {
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

        } else if (this.wallName == 'Degree') {
          this.loader = true;
          this.userService.getSearchedDegrees(this.searchInput.name)
            .subscribe((res) => {
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
        } else if (this.wallName == 'College') {
          this.loader = true;
          this.userService.getSearchedColleges(this.searchInput.name)
            .subscribe((res) => {
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
    }
    else {
      this.searchCollege = [];
      this.searchSubjectLength = 1;
      this.searchDegreeLength = 1;
      this.searchCollegeLength = 1;
      this.searchDegree = [];
      this.searchSubject = [];
      this.searchActive = false;
    }
  }

  public onSCDClick(id: number,name:string) {
    this.wallId = id;
    this.searchInput.name = name;
    if (this.wallName == 'Subject') {
      this.searchSubject = [];
    }
    else if (this.wallName == 'College') {
      this.searchCollege = [];
    } else if (this.wallName == 'Degree') {
      this.searchDegree = [];
    }
  }
}
