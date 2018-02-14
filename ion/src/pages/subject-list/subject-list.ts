import { Component } from '@angular/core';
import { NavController, PopoverController, ModalController, NavParams, MenuController } from 'ionic-angular';
import { MoreactionPage } from '../more-action/more-action';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { JoinSCDPage } from '../join-scd/join-scd';
import { AddSCDNew } from '../add-scd-new/add-scd-new';
import { Storage } from '@ionic/storage';
import { GlobalSearchDetailPage } from '../global-search-detail/global-search-detail';
/*
  Generated class for the SubjectList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-subject-list',
  templateUrl: 'subject-list.html',
  providers: [UserService, CommonService, DataService, PageService]

})
export class SubjectListPage {
  public searchType;
  public currentSubject = [];
  public pastSubject = [];
  public futureSubject = [];
  public subjectExpertsList = [];
  public subjectTeacherList = [];
  public justInterestedList = [];
  public subjectLength = 1;

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

  public searchInput = { name: '', user_id: '' };
  public loader: boolean = false;
  public userDetails: any = null;
  public searchActive: boolean = false;
  public title: string = null;
  public wallName: string = null;
  public heading: string = null;
  public showOverlay = false;

  constructor(public navCtrl: NavController,
    private modalCtrl: ModalController,
    public navParams: NavParams,
    private popoverCtrl: PopoverController,
    menu: MenuController,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public ionicStorage: Storage,
    public dataService: DataService) {
    menu.enable(true);
    this.searchType = this.navParams.data.searchType;
    this.userDetails = this.service.getSavedUser();
    this.service.getIonicStoredUser()
      .then((userSavedData) => {
        this.userDetails = this.userDetails ? this.userDetails : userSavedData ? JSON.parse(userSavedData) : null;
      })
      .catch((err) => {
        console.log(err);
      });
    if (this.searchType == 1) {
      this.title = 'Search Subjects';
      this.wallName = 'Subject';
      this.heading = "Click the subjects you are enrolled in to take part in the conversation. If you want to enroll in a subject then click + sign to enroll and join the conversation.";
    } else if (this.searchType == 2) {
      this.title = 'Search Degrees';
      this.wallName = 'Degree';
      this.heading = "Click the degrees you are enrolled in to take part in the conversation. If you want to enroll in a degree then click + sign to enroll and join the conversation.";
    } else if (this.searchType == 3) {
      this.title = 'Search Colleges';
      this.wallName = 'College';
      this.heading = "Click the colleges you are enrolled in to take part in the conversation. If you want to enroll in a college then click + sign to enroll and join the conversation.";
    }
  }

  ionViewDidLoad() {
    this.getSubColDegList();
    if (this.searchType == 1) {
      this.ionicStorage.get('hideSubListOverlay').then((hideSubListOverlay) => {
          this.showOverlay = hideSubListOverlay ? false : true;
      });
    }
    else if (this.searchType == 2) {
      this.ionicStorage.get('hideDegListOverlay').then((hideDegListOverlay) => {
        this.showOverlay = hideDegListOverlay ? false : true ;
      });
    }
    else if (this.searchType == 3) {
      this.ionicStorage.get('hideColListOverlay').then((hideColListOverlay) => {
        this.showOverlay = hideColListOverlay ? false : true;
      });
    }
  }

  getSubColDegList() {
    if (this.searchType == 1) {
      this.loader = true;
      this.service.subjectData()
        .then((res) => {
          this.loader = false;
          this.currentSubject = res.current_subjects;
          this.pastSubject = res.past_subjects;
          this.futureSubject = res.future_subjects;
          this.subjectExpertsList = res.subject_experts_list;
          this.subjectTeacherList = res.subject_teacher_list;
          this.justInterestedList = res.just_interested_list;
          this.subjectLength = res.subjects.length;
          this.currentCollege = [];
          this.pastCollege = [];
          this.futureCollege = [];
          this.collegeLength = 1;
          this.currentDegree = [];
          this.pastDegree = [];
          this.futureDegree = [];
          this.degreeLength = 1;
        }, (err) => {
          this.commonService.showToast(err.msg);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (this.searchType == 2) {
      this.loader = true;
      this.service.degreeData()
        .then((res) => {
          this.loader = false;
          this.currentDegree = res.current_degrees;
          this.pastDegree = res.future_degrees;
          this.futureDegree = res.past_degrees;
          this.degreeLength = res.degree.length;
          this.currentSubject = [];
          this.pastSubject = [];
          this.futureSubject = [];
          this.subjectLength = 1;
          this.currentCollege = [];
          this.pastCollege = [];
          this.futureCollege = [];
          this.collegeLength = 1;
        }, (err) => {
          this.commonService.showToast(err.msg);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (this.searchType == 3) {
      this.loader = true;
      this.service.collegeData()
        .then((res) => {
          this.loader = false;
          this.currentCollege = res.current_colleges;
          this.pastCollege = res.past_colleges;
          this.futureCollege = res.future_colleges;
          this.collegeLength = res.colleges.length;
          this.currentSubject = [];
          this.pastSubject = [];
          this.futureSubject = [];
          this.subjectLength = 1;
          this.currentDegree = [];
          this.pastDegree = [];
          this.futureDegree = [];
          this.degreeLength = 1;
        }, (err) => {
          this.commonService.showToast(err.msg);
        })
        .catch((err) => {
          console.log(err);
        });
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
        if (this.searchType == 1) {
          this.loader = true;
          this.service.getSearchedSubjects(this.searchInput.name)
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

        } else if (this.searchType == 2) {
          this.loader = true;
          this.service.getSearchedDegrees(this.searchInput.name)
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
        } else if (this.searchType == 3) {
          this.loader = true;
          this.service.getSearchedColleges(this.searchInput.name)
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
      this.getSubColDegList();
      this.searchActive = false;
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

  presentPopover(ev) {
    let popover = this.popoverCtrl.create(MoreactionPage, {
      // contentEle: this.content.nativeElement,
      // textEle: this.text.nativeElement
    });
    popover.present({
      ev: ev
    });
  }

  public addSCD() {
    let modal = this.modalCtrl.create(JoinSCDPage, { wallName: this.wallName, searchType: 1 });
    modal.onDidDismiss(() => {
      this.getSubColDegList();
    });
    modal.present();
  }

  public onViewMore(type: number): void {
    this.navCtrl.push(GlobalSearchDetailPage, { type: type, name: this.searchInput.name });
  }

  public addItem(type: number): void {
    var wallName = (type == 1) ? 'Subject' : (type == 2) ? 'College' : 'Degree';
    let addSCDNewModal = this.modalCtrl.create(AddSCDNew, { wallName: wallName, type: type });
    addSCDNewModal.present();
  }

  public onHelpClick() {
    this.showOverlay = !this.showOverlay;
  }

  public onHideOverlay() {
    if(this.searchType == 1){
      this.ionicStorage.set('hideSubListOverlay', true);
    }
    if(this.searchType == 3){
      this.ionicStorage.set('hideColListOverlay', true);
    }
    if(this.searchType == 2){
      this.ionicStorage.set('hideDegListOverlay', true);
    }
    this.showOverlay = false;
  }
}
