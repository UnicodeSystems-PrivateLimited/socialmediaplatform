import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, PopoverController, NavParams, ModalController, Tabs, App, MenuController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { MoreactionPage } from '../more-action/more-action';
import { SubjectListPage } from '../subject-list/subject-list';
import { CommentPage } from '../comment/comment';
import { SinglePostPage } from '../single-post/single-post';
import { SelectprivacyPage } from '../selectprivacy/selectprivacy';
import { Platform } from 'ionic-angular';
import { SearchListPage } from '../search-list/search-list';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';
import { Keyboard } from 'ionic-native';
import { DatePicker } from 'ionic-native';
import { TimelineUpdatestatusPage } from '../timeline-updatestatus/timeline-updatestatus';
import { ChatPage } from '../chat/chat';
import { NotificationPage } from '../notification/notification';
import { FriendRequestNotificationPage } from '../friend-request-notification/friend-request-notification';
import { SearchData, MyWallSearch } from '../../interfaces/common-interfaces';
import { PostEditPage } from '../post-edit/post-edit';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { GroupWallPage } from '../group-wall/group-wall';
import { EditJournalPage } from '../edit-journal/edit-journal';
import { ViewJournalPage } from '../view-journal/view-journal';
import { CheckWallService } from '../../providers/check-wall-service';
import { LikeMembersListPage } from '../like-members-list/like-members-list';
import {MyProfilePage} from '../my-profile/my-profile';
import { MorePopoverPostPage } from '../more-popover-post/more-popover-post';
import {FlagPostPage} from '../flag-post/flag-post';
import { Storage } from '@ionic/storage';

/*
  Generated class for the Timeline page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-timeline',
  templateUrl: 'timeline.html',
  providers: [UserService, CommonService, DataService, MyWallService]
})
export class TimelinePage {
  @ViewChild('popoverContent', { read: ElementRef }) content: ElementRef;
  @ViewChild('popoverText', { read: ElementRef }) text: ElementRef;
  public deletePostUrl = "/api/post/deleteTimelinePost";
  public wallId: any;
  public sub;
  public timelinedata = [];
  public counterListTimeline = 0;
  public total_timeline;
  public scrollControllerTimeline;
  public parset;
  public parameter;
  public userId;
  public JournalByUserId = [];
  public loader: boolean = false;
  public viewTab: boolean = true;
  public userSearchField = { name: "" };
  public postLike = { post_id: "" };
  public accordian: boolean = false;
  public filteractive = [];
  public viewTabBottom: boolean = true;
  public postDeleteData = { postId: '', wallId: '', wallType: '' };
  public searchData: MyWallSearch = new MyWallSearch();
  public searchedSubjectsList: Array<any> = [];
  public searchedCollegesList: Array<any> = [];
  public searchedDegreesList: Array<any> = [];
  public timelineSearchData: SearchData = new SearchData();
  public searchCounter: number = 0;
  public searchActive: boolean = false;
  public searchId: number = null;
  public postRemoveType: string = null;
  public searchStatus: boolean = false;
  public showFilterText: string = '';
  public showOverlay = false;

  constructor(
    private popoverCtrl: PopoverController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public myWallService: MyWallService,
    public modalCtrl: ModalController,
    public dataService: DataService,
    menu: MenuController,
    public checkWallService: CheckWallService,
    public ionicStorage: Storage,
  ) {
    menu.enable(true);
    this.parameter = navParams;
    this.parameter.data = 10;
    this.checkWallService.setActiveWall(0);
    this.checkWallService.setActiveWallName('Subjects/College/Degree');    
  }

  ionViewDidLoad() {
    this.pageService.walldetails = {};
    this.pageService.wall_type = '';
    this.filteractive[0] = true;
    for (var i = 1; i <= 8; i++) {
      this.filteractive[i] = false;
    }
    this.scrollControllerTimeline = 1;
    this.counterListTimeline = 0;
    this.getUserTimeline();
    let user = this.service.getSavedUser();
    this.service.getIonicStoredUser()
      .then((userSavedData) => {
        user = user ? user : userSavedData ? JSON.parse(userSavedData) : null;
      })
      .catch((err) => {
        console.log(err);
      });
    this.userId = user.userID;
    this.checkWallService.setInviteActiveWall(0);
    // this.myWallService.getNotification();
    this.ionicStorage.get('hideMyTimelineOverlay').then((hideMyTimelineOverlay) => {
      if(hideMyTimelineOverlay){
        this.showOverlay = false;
      }else{
        this.showOverlay = true;
      }
    });
    
  }

  ionViewWillEnter() {
        // this.myWallService.getNotification();

    let arrayIndex;
    for (let i in this.filteractive) {
      if (this.filteractive[i]) {
        this.filteractive[i] = true;
        arrayIndex = i;
      }
      else {
        this.filteractive[i] = false;
      }
    }
    this.scrollControllerTimeline = 1;
    this.counterListTimeline = 0;
    if (arrayIndex == 8) {
      this.getJournalByUserId();
    }
    else {
      this.getUserTimeline();
    }
    this.pageService.wall_type = '';
  }

  updateParameter(value, arrayIndex) {
    this.parameter.data = value;
    if (arrayIndex == 8) {
      this.getJournalByUserId();
    }
    else {
      this.getUserTimeline();
    }
    for (var i = 0; i <= 8; i++) {
      if (i == arrayIndex) {
        this.filteractive[i] = true;
      }
      else {
        this.filteractive[i] = false;
      }
    }
  }

  morepopup(ev) {
    let popover = this.popoverCtrl.create(MoreactionPage, {
      // contentEle: this.content.nativeElement,
      // textEle: this.text.nativeElement
    });
    popover.present({
      ev: ev
    });
  }

  advancesearch() {
    this.accordian = !this.accordian;
  }

  goToSinglePost(data, postId) {
    if (data.post_id.photo.length > 0 || data.post_id.video.length > 0 || data.post_id.audio.length > 0) {
      let modal = this.modalCtrl.create(SinglePostPage, { post_data: data.post_id, postId: postId, redirectPage: "mytimeline" });
      modal.onDidDismiss(data => {
        if (data && data.post_id) {
          for (let i = 0; i < this.timelinedata.length; i++) {
            if (this.timelinedata[i].post_id && this.timelinedata[i].post_id._id == data.post_id) {
              this.timelinedata[i].post_id = data.post_data;
            }
          }
        }
        else {
          this.myWallService.getSinglePostData(postId)
            .then((res) => {
              for (let i = 0; i < this.timelinedata.length; i++) {
                if (this.timelinedata[i].post_id && this.timelinedata[i].post_id._id == postId) {
                  this.timelinedata[i].post_id = res[0];
                }
              }
            })
            .catch((err) => {
              console.log(err);
            })
        }
      });
      modal.present();
    }
  }

  selectprivacy(data) {
    this.navCtrl.push(SelectprivacyPage, { postData: data.post_id, redirectPage: "mytimeline" });
  }

  newpost(tabValue, postType) {
    let modal = this.modalCtrl.create(TimelineUpdatestatusPage, { tabValue: tabValue, postType: postType });
    modal.onDidDismiss(data => {
      this.scrollControllerTimeline = 1;
      this.counterListTimeline = 0;
      this.myWallService.getNotification();
      this.getUserTimeline();
    });
    modal.present();
  }

  hideTabBottom() {
    this.viewTabBottom = !this.viewTabBottom;
  }

  SubjecLlistPopover(ev, searchType) {
    this.navCtrl.push(SubjectListPage, { searchType: searchType });
  }

  goTosubjectlist() {
    this.navCtrl.push(SubjectListPage);
  }

  like(post_id, data) {
    this.postLike.post_id = post_id;
    this.myWallService.addLike(this.postLike)
      .then((res) => {
        data.likes = res.data;
      }, (err) => {
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  CommentModal(postId, characterNum, postLikes) {
    let modal = this.modalCtrl.create(CommentPage, { postId: postId, characterNum: characterNum, postLikes: postLikes });
    modal.onDidDismiss(data => {
      if (data && data.post_id) {
        for (let i = 0; i < this.timelinedata.length; i++) {
          if (this.timelinedata[i].post_id && this.timelinedata[i].post_id._id == data.post_id) {
            this.timelinedata[i].post_id.comments = data.characterNum;
          }
        }
      }
      else {
        this.myWallService.getSinglePostData(postId)
          .then((res) => {
            for (let i = 0; i < this.timelinedata.length; i++) {
              if (this.timelinedata[i].post_id && this.timelinedata[i].post_id._id == postId) {
                this.timelinedata[i].post_id.comments = res[0].comments;
              }
            }
          })
          .catch((err) => {
            console.log(err);
          })
      }
    });
    modal.present();
  }

  logout() {
    this.service.logout()
      .then((res) => {
        this.pageService.loggedInType = 0;
        this.navCtrl.push(LoginPage);
      }, (err) => {
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  getUserTimeline() {
    this.loader = true;
    this.counterListTimeline = 0;
    if (!this.searchActive) {
      this.myWallService.getUserTimeline(this.counterListTimeline, this.parameter.data)
        .then((res) => {
          this.loader = false;
          this.timelinedata = res.data;
          this.total_timeline = res.total_timeline;
          this.JournalByUserId = [];
        }, (err) => {
          this.loader = false;
          this.commonService.showToast(err.msg);
        })
        .catch((err) => {
          console.log(err);
        })
    } else {
      this.searchPost();
    }
  }

  getFoldername(type) {
    if (type == 1) return "Subject";
    if (type == 2) return "College";
    if (type == 3) return "Degree";
    if (type == 5) return "Timeline";
    if (type == 6) return "GroupWall";

  }

  doInfinite(infiniteScroll) {
    if (!this.searchActive) {
      if (this.timelinedata.length > 0) {
        setTimeout(() => {
          if (this.scrollControllerTimeline) {
            this.scrollControllerTimeline = 0;
            this.parset = this.total_timeline / 10
            var page = parseInt(this.parset);
            if (this.counterListTimeline <= (page + 1)) {
              this.loader = true;
              this.counterListTimeline++;
              this.myWallService.getUserTimeline(this.counterListTimeline, this.parameter.data)
                .then((res) => {
                  this.loader = false;
                  if (res.data) {
                    this.timelinedata = this.timelinedata.concat(res.data);
                  }
                  this.scrollControllerTimeline = 1;
                }, (err) => {
                  this.loader = false;
                  this.commonService.showToast(err.msg);
                })
                .catch((err) => {
                  console.log(err);
                })
            }
          }
          infiniteScroll.complete();
        }, 500);
      }
    } else {
      if (this.timelinedata.length > 0) {
        setTimeout(() => {
          if (this.scrollControllerTimeline) {
            this.filterData();
            this.scrollControllerTimeline = 0;
            this.parset = this.total_timeline / 10
            var page = parseInt(this.parset);
            if (this.searchCounter <= (page + 1)) {
              this.loader = true;
              this.searchCounter++;
              this.myWallService.userTimelinesearchPost(this.timelineSearchData, this.searchCounter, this.parameter.data).subscribe((res) => {
                this.loader = false;
                if (res.status == 2) {
                  if (res.data) {
                    this.timelinedata = this.timelinedata.concat(res.data);
                  }
                  this.scrollControllerTimeline = 1;
                  this.timelineSearchData = new SearchData();
                } else {
                  this.commonService.showToast(res.msg);

                }
              })
            }
          }
          infiniteScroll.complete();
        }, 500);
      }
    }
  }

  gotoJournal(posts) {
    this.navCtrl.push(PostInJournalPage, { posts: posts });
  }

  hidetab() {
    this.viewTab = !this.viewTab;
  }

  getJournalByUserId() {
    this.loader = true;
    this.myWallService.getUserJournal(this.userId).subscribe((res) => {
      this.loader = false;
      if (res.status == 2) {
        this.JournalByUserId = res.data;
        this.timelinedata = [];
        this.total_timeline = 0;
      }
      else {
        this.commonService.showToast(res.msg);
      }
    });
  }

  public onDeleteClick(post, index, deleteType: string) {
    this.postRemoveType = deleteType;
    this.postDeleteData.postId = post._id;
    this.postDeleteData.wallType = post.types;
    if (post.subject_id && typeof post.subject_id === 'object') {
      this.postDeleteData.wallId = post.subject_id._id;
    }
    else if (post.college_id && typeof post.college_id === 'object') {
      this.postDeleteData.wallId = post.college_id._id;
    }
    else if (post.degree_id && typeof post.degree_id === 'object') {
      this.postDeleteData.wallId = post.degree_id._id;
    }
    else if (post.group_id && typeof post.group_id === 'object') {
      this.postDeleteData.wallId = post.group_id._id;
    }
    else {
      this.postDeleteData.wallId = '';
    }
    this.commonService.showConfirm("", "Are you sure you want to delete this post ?", () => this.deletePostById(index));
  }

  public deletePostById(index) {
    if (this.postRemoveType == 'user') {
      this.dataService.postData(this.deletePostUrl, this.postDeleteData).subscribe(res => {
        if (res.status == 2) {
          this.timelinedata.splice(index, 1);
          this.commonService.showToast('Post has been deleted successfully');
        } else {
          this.commonService.showToast(res['data'].message);
        }
      });
    } else {
      let postData = { postId: this.postDeleteData.postId };
      this.myWallService.removePostFromTimeline(postData).subscribe((res) => {
        if (res.status == 2) {
          this.timelinedata.splice(index, 1);
          this.commonService.showToast('Post has been deleted successfully');
        }
      });
    }
    this.postRemoveType = null;
  }

  /**Header */
  goToSearchPage() {
    // go to the SearchListPage component
    setTimeout(() => {
      Keyboard.close();
    }, 500);
    this.navCtrl.push(SearchListPage);
  }

  public onFriend(): void {
    this.navCtrl.push(FriendRequestNotificationPage);
  }

  gotochat() {
    this.navCtrl.push(ChatPage);
  }

  public onNotification(): void {
    this.navCtrl.push(NotificationPage);
  }

  getCategory(category_id) {
    if (category_id == 1) return "General";
    else if (category_id == 2) return "Tip / Trick";
    else if (category_id == 3) return "Joke / Humor";
    else if (category_id == 4) return "Tutorial";
    else return "No Category";
  }
  onShareClick(data) {
    this.navCtrl.push(SelectprivacyPage, { postData: data });
  }

  public subjectSearch(e: any): void {
    this.searchedCollegesList = [];
    this.searchedDegreesList = [];
    this.searchData.college_name = '';
    this.searchData.degree_name = '';
    this.showFilterText = '';
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.searchData.subject_name) {
      if (this.searchData.subject_name.match(nameValid)) {
        this.myWallService.getUserSubjects(this.searchData.subject_name).subscribe((res) => {
          if (res.status == 2) {
            this.searchedSubjectsList = res.data;
          }
        })
      }
    } else {
      this.searchData.subject_name = '';
      this.searchedSubjectsList = [];
      this.timelineSearchData.subjectIds = [];
    }
  }

  public selectSubject(id: number, name: string): void {
    this.searchStatus = false;
    this.searchId = id;
    this.searchData.subject_name = name;
    if (this.timelineSearchData.subjectIds.indexOf(id) == -1) {
      this.timelineSearchData.subjectIds.push(id);
    }
    this.searchedSubjectsList = [];
    this.timelineSearchData.collegeIds = [];
    this.timelineSearchData.degreeIds = [];
  }

  public collegeSearch(e: any): void {
    this.searchedSubjectsList = [];
    this.searchedDegreesList = [];
    this.searchData.subject_name = '';
    this.searchData.degree_name = '';
    this.showFilterText = '';
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.searchData.college_name) {
      if (this.searchData.college_name.match(nameValid)) {
        this.myWallService.getUserColleges(this.searchData.college_name).subscribe((res) => {
          if (res.status == 2) {
            this.searchedCollegesList = res.data;
          }
        })
      }
    } else {
      this.searchData.college_name = '';
      this.searchedCollegesList = [];
      this.timelineSearchData.collegeIds = [];
    }
  }

  public selectCollege(id: number, name: string): void {
    this.searchStatus = false;
    this.searchId = id;
    this.searchData.college_name = name;
    if (this.timelineSearchData.collegeIds.indexOf(id) == -1) {
      this.timelineSearchData.collegeIds.push(id);
    }
    this.searchedCollegesList = [];
    this.timelineSearchData.subjectIds = [];
    this.timelineSearchData.degreeIds = [];
  }

  public degreeSearch(e: any): void {
    this.searchedCollegesList = [];
    this.searchedSubjectsList = [];
    this.searchData.college_name = '';
    this.searchData.subject_name = '';
    this.showFilterText = '';
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.searchData.degree_name) {
      if (this.searchData.degree_name.match(nameValid)) {
        this.myWallService.getUserDegrees(this.searchData.degree_name).subscribe((res) => {
          if (res.status == 2) {
            this.searchedDegreesList = res.data;
          }
        })
      }
    } else {
      this.searchData.degree_name = '';
      this.searchedDegreesList = [];
      this.timelineSearchData.degreeIds = [];
    }
  }

  public selectDegree(id: number, name: string): void {
    this.searchStatus = false;
    this.searchId = id;
    this.searchData.degree_name = name;
    if (this.timelineSearchData.degreeIds.indexOf(id) == -1) {
      this.timelineSearchData.degreeIds.push(id);
    }
    this.searchedDegreesList = [];
    this.timelineSearchData.collegeIds = [];
    this.timelineSearchData.subjectIds = [];
  }

  public searchPost(): void {
    this.filterData();
    this.showFilterText = this.searchData.subject_name ? this.searchData.subject_name : this.searchData.college_name ? this.searchData.college_name : this.searchData.degree_name;
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.timelineSearchData.subjectIds.length || this.timelineSearchData.collegeIds.length || this.timelineSearchData.degreeIds.length) {
      if (this.showFilterText && this.showFilterText.match(nameValid)) {
        this.searchCounter = 0;
        this.searchActive = true;
        this.loader = true;
        this.myWallService.userTimelinesearchPost(this.timelineSearchData, this.searchCounter, this.parameter.data).subscribe((res) => {
          this.loader = false;
          if (res.status == 2) {
            if (res.data) {
              this.timelinedata = res.data;
            }
            this.searchStatus = true;
            this.total_timeline = res.total_timeline;
            this.timelineSearchData = new SearchData();

          }
        });
      } else {
        this.commonService.showToast('Please select valid subject,college or degree.');
        this.showFilterText = '';
      }
    } else {
      this.commonService.showToast('Please select valid subject,college or degree.');
      this.showFilterText = '';
    }
  }

  public searchReset(): void {
    this.showFilterText = '';
    this.searchActive = false;
    this.searchCounter = 0;
    this.counterListTimeline = 0;
    this.scrollControllerTimeline = 1;
    this.searchId = null;
    this.searchData = new MyWallSearch();
    this.timelineSearchData = new SearchData();
    this.getUserTimeline();
  }

  public filterData(): void {
    if (this.searchData.subject_name) {
      if (this.timelineSearchData.subjectIds.indexOf(this.searchId) == -1) {
        this.timelineSearchData.subjectIds.push(this.searchId);
      }
    } else if (this.searchData.college_name) {
      if (this.timelineSearchData.collegeIds.indexOf(this.searchId) == -1) {
        this.timelineSearchData.collegeIds.push(this.searchId);
      }
    } else if (this.searchData.degree_name) {
      if (this.timelineSearchData.degreeIds.indexOf(this.searchId) == -1) {
        this.timelineSearchData.degreeIds.push(this.searchId);
      }
    }
  }

  public editPost(postData: any, index) {
    let modal = this.modalCtrl.create(PostEditPage, { post: postData });
    modal.onDidDismiss(data => {
      if (data) {
        for (var i = 0; i < this.timelinedata.length; i++) {
          if (this.timelinedata[i].post_id && this.timelinedata[i].post_id._id == data._id) {
            this.timelinedata[i].post_id = data;
          }
        }
      }
    });
    modal.present();
  }

  public getProfileById(id): void {
    if (id != DataService.userid) {
      this.navCtrl.push(FriendProfilePage, { userId: id })
    }
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
  // journal methods
  public onJournalDeleteClick(journalId, index) {
    this.commonService.showConfirm("", "Are you sure you want to delete this Journal ?", () => this.deleteJournal(journalId, index));
  }

  public deleteJournal(journalId, index) {
    this.loader = true;
    this.myWallService.deleteUserJournal(journalId).subscribe((res) => {
      this.loader = false;
      if (res.status == 2) {
        this.JournalByUserId.splice(index, 1);
        this.commonService.showToast(res.msg);
      }
      else {
        this.commonService.showToast(res.msg);
      }
    });
  }

  public editJournal(Journal) {
    let modal = this.modalCtrl.create(EditJournalPage, { Journal: Journal });
    modal.onDidDismiss(data => {
      if (data) {
        if (data.data.icon) {
          Journal.icon = data.data.icon + "?t=" + new Date().getTime();
        }
        Journal.title = data.data.title;
      }
    });
    modal.present();
  }
  public viewJournal(Journal) {
    this.navCtrl.push(ViewJournalPage, { Journal: Journal });
  }

  getGroupWall(id: any) {
    this.navCtrl.push(GroupWallPage, { wallId: id });
  }
  onViewLikeClick(id) {
    this.navCtrl.push(LikeMembersListPage, id);
  }
     public goToProfile(){
    this.navCtrl.push(MyProfilePage,{pageType:1});
  }

   public onMorePopover(data:any){
    let popover = this.popoverCtrl.create(MorePopoverPostPage, {
      data:data
    });
    popover.present({
      
    });
}

public onFlagClick(id){
  let popover = this.popoverCtrl.create(FlagPostPage, {data:id});
  popover.present({   
  });
}
public onHelpClick(){
  this.showOverlay =!this.showOverlay;
  }

  public onHideOverlay() {
    this.ionicStorage.set('hideMyTimelineOverlay', true);
    this.showOverlay = false;
  }
}