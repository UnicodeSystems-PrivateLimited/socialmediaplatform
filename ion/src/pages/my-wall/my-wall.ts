import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, PopoverController, NavParams, ModalController,ViewController, Tabs, App, MenuController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { ChatService } from '../../providers/chat-service';
import { MoreactionPage } from '../more-action/more-action';
import { SubjectListPage } from '../subject-list/subject-list';
import { CommentPage } from '../comment/comment';
import { SinglePostPage } from '../single-post/single-post';
import { SelectprivacyPage } from '../selectprivacy/selectprivacy';
import { Platform } from 'ionic-angular';
import { SearchListPage } from '../search-list/search-list';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';
import { Keyboard, Splashscreen } from 'ionic-native';
import { DatePicker } from 'ionic-native';
import { EditJournalPage } from '../edit-journal/edit-journal';
import { ChatPage } from '../chat/chat';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { NotificationPage } from '../notification/notification';
import { SearchData, MyWallSearch } from '../../interfaces/common-interfaces';
import { TimelinePage } from '../timeline/timeline';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { GroupWallPage } from '../group-wall/group-wall';
import { FriendRequestNotificationPage } from '../friend-request-notification/friend-request-notification';
import { CheckWallService } from '../../providers/check-wall-service';
import { LikeMembersListPage } from '../like-members-list/like-members-list';
import { TimelineUpdatestatusPage } from '../timeline-updatestatus/timeline-updatestatus';
import {MyProfilePage} from '../my-profile/my-profile';
import { MorePopoverPostPage } from '../more-popover-post/more-popover-post';
import { PostEditPage } from '../post-edit/post-edit';
import {FlagPostPage} from '../flag-post/flag-post';
import { Storage } from '@ionic/storage';

/*
  Generated class for the MyWall page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-my-wall',
  templateUrl: 'my-wall.html'
})
export class MyWallPage {
  private _dataUrlGetAllpost = '/api/post/getMyWallPosts/';
  private _dataUrl = '/api/user/profile/full';
  private _dataUrlProfileDetail = '/api/user/getProfileData';
  private deletePostUrl = "/api/post/deleteTimelinePost";  
  public searchActive: boolean = false;
  public parsep;
  public togClass = [];
  public searchedSubjectsList: Array<any> = [];
  public searchedCollegesList: Array<any> = [];
  public searchedDegreesList: Array<any> = [];
  public myWallSearchData: SearchData = new SearchData();
  public searchData: MyWallSearch = new MyWallSearch();
  @ViewChild('popoverContent', { read: ElementRef }) content: ElementRef;
  @ViewChild('popoverText', { read: ElementRef }) text: ElementRef;
  public _getGroupChatCounter = '/api/grouphistory/getGroupChatCounter/';
  public _dataUrlUserGroup = '/api/groupchat/getGroupsByUserId';
  public _dataUrlOtherUserGroup = '/api/groupchat/getOtherGroupsByUserId/';
  public groups;
  public otherGroup;
  public friends;
  public wallId: any;
  public sub;
  public total_timeline;
  public parset;
  public parameter;
  public user: any;
  public userId;
  public JournalByUserId = [];
  public loader: boolean = false;
  public viewTab: boolean = true;
  public userSearchField = { name: "" };
  public postLike = { post_id: "" };
  public accordian: boolean = false;
  public filteractive = [];
  public viewTabBottom: boolean = true;
  public postdataAll: any[] = [];
  public counterList = 0;
  public total_result;
  public total_post;
  public scrollController;
  public postdata;
  public checkFriendPostGlobal;
  public checkFollowersPostGlobal;
  public checkSharedPostGlobal;
  public checkPostStatusId;
  public userGlobalData;
  public searchId: number = null;
  public showFilterText: string = '';
  public searchStatus: boolean = false;
  public postType: number = 10;
  public postDeleteData = { postId: '', wallId: '', wallType: '' };  
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
    public chatService: ChatService,
    public ionicStorage: Storage,
    menu: MenuController,
    public checkWallService: CheckWallService,
    private viewCtrl:ViewController
  ) {
    menu.enable(true);
    this.parameter = navParams;
    let user = this.service.getSavedUser();
    this.service.getIonicStoredUser()
      .then((userSavedData) => {
        user = user ? user : userSavedData ? JSON.parse(userSavedData) : null;

      })
      .catch((err) => {
        console.log(err);
      });
    this.userId = user.userID;
    this.checkWallService.setActiveWall(0);
    this.checkWallService.setActiveWallName('Subjects/College/Degree');
    this.checkWallService.setInviteActiveWall(0);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      Splashscreen.hide();
    }, 500);
    this.filteractive[0] = true;
    for (var i = 1; i <= 7; i++) {
      this.filteractive[i] = false;
    }
    this.clearScrollContent();
    // this.getUserGroups();
    // this.myWallService.getNotification();
    this.getPosts(10, 0);
    this.pageService.wall_type = '';
    this.ionicStorage.get('hideMyWallOverlay').then((hideMyWallOverlay) => {
      if(hideMyWallOverlay){
        this.showOverlay = false;
      }else{
        this.showOverlay = true;
      }
    });
    
  }

  public getUserProfile(): void {
    this.dataService.getData(this._dataUrl).subscribe(user => {
      this.user = user;
    });
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
  getCategory(category_id) {
    if (category_id == 1) return "General";
    else if (category_id == 2) return "Tip / Trick";
    else if (category_id == 3) return "Joke / Humor";
    else if (category_id == 4) return "Tutorial";
    else return "No Category";
  }

  goToSinglePost(data, postId) {
    if (data.photo.length > 0 || data.video.length > 0 || data.audio.length > 0) {
      let modal = this.modalCtrl.create(SinglePostPage, { post_data: data, postId: postId, redirectPage: "mywall" });
      modal.onDidDismiss(data => {
        if (data && data.post_id) {
          for (let i = 0; i < this.postdataAll.length; i++) {
            if (this.postdataAll[i] && this.postdataAll[i]._id == data.post_id) {
              this.postdataAll[i] = data.post_data;
            }
          }
        }
        else {
          this.myWallService.getSinglePostData(postId)
            .then((res) => {
              for (let i = 0; i < this.postdataAll.length; i++) {
                if (this.postdataAll[i] && this.postdataAll[i]._id == postId) {
                  this.postdataAll[i] = res[0];
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
      });
  }

  CommentModal(postId, characterNum, postLikes) {
    let modal = this.modalCtrl.create(CommentPage, { postId: postId, characterNum: characterNum, postLikes: postLikes });
    modal.onDidDismiss(data => {
      if (data && data.post_id) {
        for (let i = 0; i < this.postdataAll.length; i++) {
          if (this.postdataAll[i] && this.postdataAll[i]._id == data.post_id) {
            this.postdataAll[i].comments = data.characterNum;
          }
        }
      }
      else {
        this.myWallService.getSinglePostData(postId)
          .then((res) => {
            for (let i = 0; i < this.postdataAll.length; i++) {
              if (this.postdataAll[i] && this.postdataAll[i]._id == postId) {
                this.postdataAll[i].comments = res[0].comments;
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
        this.navCtrl.setRoot(LoginPage);
      }, (err) => {
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  getFoldername(type) {
    if (type == 1) return "Subject";
    if (type == 2) return "College";
    if (type == 3) return "Degree";
    if (type == 5) return "Timeline";
    if (type == 6) return "GroupWall";
  }

  gotoJournal(posts) {
    this.navCtrl.push(PostInJournalPage, { posts: posts });
  }

  goToSearchPage() {
    // go to the SearchListPage component
    setTimeout(() => {
      Keyboard.close();
    }, 500);
    this.navCtrl.push(SearchListPage);
  }

  hidetab() {
    this.viewTab = !this.viewTab;
  }

  public getPosts(postType: number, arrayIndex): void {
    this.postType = postType;
    for (var i = 0; i <= 7; i++) {
      if (i == arrayIndex) {
        this.filteractive[i] = true;
      }
      else {
        this.filteractive[i] = false;
      }
    }
    if (!this.searchActive) {
      this.clearScrollContent();
      this.searchActive = false;
      this.loader = true;
      this.dataService.getData(this._dataUrlGetAllpost + this.postType + '/' + this.counterList).subscribe(res => {
        if (res.status == 2) {
          this.loader = false;
          if (res.data.length) {
            this.postdataAll = res.data;
          }
          this.total_post = res.total_post;
        } else {
          this.logout();
        }
      });
    }
    else {
      this.searchPost();
    }
  }

  gotochat() {
    this.navCtrl.push(ChatPage);
  }

  public onNotification(): void {
    this.navCtrl.push(NotificationPage);
  }

  public onFriend(): void {
    this.navCtrl.push(FriendRequestNotificationPage);
  }

  getGroupChatCounter() {
    this.dataService.totPendGroupUserMsg = 0;
    this.dataService.getData(this._getGroupChatCounter).subscribe(res => {
      if (this.groups.length > 0) {
        for (var j = 0; j < this.groups.length; j++) {
          for (var i = 0; i < res.data.length; i++) {
            if (this.userId) {
              if (this.groups[j]._id == res.data[i].group_id && res.data[i].is_viewed == 0 && res.data[i].to == this.userId && res.data[i].from != this.userId) {
                let val = this.groups[j].mCounter++;
                val++;
                if (val == 1) {
                  ++this.dataService.totPendGroupUserMsg;
                }
              }
            }
          }
        }
      }
      if (this.otherGroup.length > 0) {
        for (var j = 0; j < this.otherGroup.length; j++) {
          for (var i = 0; i < res.data.length; i++) {
            if (this.userId) {
              if (this.otherGroup[j]._id == res.data[i].group_id && res.data[i].is_viewed == 0 && res.data[i].to == this.userId && res.data[i].from != this.userId) {
                let vals = this.otherGroup[j].mCounter++;
                vals++;
                if (vals == 1) {
                  this.dataService.totPendGroupUserMsg++;
                }
              }
            }
          }
        }
      }
    });
  }

  getUserGroups() {
    this.dataService.getData(this._dataUrlUserGroup).subscribe(res => {
      if (res.status == 2) {
        this.groups = res.data;
        console.log(this.groups);
        for (var k = 0; k < this.groups.length; k++) {
          this.groups[k]['mCounter'] = 0;
        }
      }
      this.getOtherUserGroups();
    });
  }

  getOtherUserGroups() {
    this.dataService.getData(this._dataUrlOtherUserGroup).subscribe(res => {
      if (res.status == 2) {
        this.otherGroup = res.data;
        for (var k = 0; k < this.otherGroup.length; k++) {
          this.otherGroup[k]['mCounter'] = 0;
        }
      }
      this.getGroupChatCounter();
    });
  }

  doInfinite(infiniteScroll) {
    if (!this.searchActive) {
      if (this.scrollController) {
        if (this.postType != null) {
          this.scrollController = 0;
          this.parsep = this.total_post / 10
          let page = parseInt(this.parsep);
          if (this.counterList <= (page + 1)) {
            this.counterList++;
            this.dataService.getData(this._dataUrlGetAllpost + this.postType + '/' + this.counterList).subscribe(res => {
              if (res.data.length) {
                this.postdataAll = this.postdataAll.concat(res.data);
              }
              for (var i = 0; i < this.postdataAll.length; i++) {
                this.togClass.push('true');
              }
              this.scrollController = 1;
            });
          }
        }
      }
    } else {
      if (this.scrollController) {
        this.filterData();
        this.scrollController = 0;
        this.parsep = this.total_post / 10
        var page = parseInt(this.parsep);
        if (this.counterList <= (page + 1)) {
          this.counterList++;
          this.myWallService.searchPost(this.myWallSearchData, this.postType, this.counterList).subscribe(res => {
            if (res.status == 2) {
              if (res.data.length) {
                this.postdataAll = this.postdataAll.concat(res.data);
              }
              this.myWallSearchData = new SearchData();
              for (var i = 0; i < this.postdataAll.length; i++) {
                this.togClass.push('true');
              }
            }
            this.scrollController = 1;
          });
        }
      }
    }
    setTimeout(() => {
      infiniteScroll.complete();
    }, 500);
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
        this.myWallService.getSearchSubjects(this.searchData.subject_name).subscribe((res) => {
          if (res.status == 2) {
            this.searchedSubjectsList = res.data;
          }
        });
      }
    } else {
      this.searchData.subject_name = '';
      this.searchedSubjectsList = [];
      this.myWallSearchData.subjectIds = [];
    }
  }

  public selectSubject(id: number, name: string): void {
    this.searchStatus = false;
    this.searchData.subject_name = name;
    this.searchId = id;
    if (this.myWallSearchData.subjectIds.indexOf(id) == -1) {
      this.myWallSearchData.subjectIds.push(id);
    }
    this.searchedSubjectsList = [];
    this.myWallSearchData.collegeIds = [];
    this.myWallSearchData.degreeIds = [];
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
        this.myWallService.getSearchColleges(this.searchData.college_name).subscribe((res) => {
          if (res.status == 2) {
            this.searchedCollegesList = res.data;
          }
        });
      }
    } else {
      this.searchData.college_name = '';
      this.searchedCollegesList = [];
      this.myWallSearchData.collegeIds = [];
    }
  }
  public selectCollege(id: number, name: string): void {
    this.searchStatus = false;
    this.searchId = id;
    this.searchData.college_name = name;
    if (this.myWallSearchData.collegeIds.indexOf(id) == -1) {
      this.myWallSearchData.collegeIds.push(id);
    }
    this.searchedCollegesList = [];
    this.myWallSearchData.subjectIds = [];
    this.myWallSearchData.degreeIds = [];
  }

  public degreeSearch(e: any): void {
    this.searchedCollegesList = [];
    this.searchedSubjectsList = [];
    this.searchData.subject_name = '';
    this.searchData.college_name = '';
    this.showFilterText = '';
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.searchData.degree_name) {
      if (this.searchData.degree_name.match(nameValid)) {
        this.myWallService.getSearchDegrees(this.searchData.degree_name).subscribe((res) => {
          if (res.status == 2) {
            this.searchedDegreesList = res.data;
          }
        });
      }
    } else {
      this.searchData.degree_name = '';
      this.searchedDegreesList = [];
      this.myWallSearchData.degreeIds = [];
    }
  }
  public selectDegree(id: number, name: string): void {
    this.searchStatus = false;
    this.searchId = id;
    this.searchData.degree_name = name;
    if (this.myWallSearchData.degreeIds.indexOf(id) == -1) {
      this.myWallSearchData.degreeIds.push(id);
    }
    this.searchedDegreesList = [];
    this.myWallSearchData.subjectIds = [];
    this.myWallSearchData.collegeIds = [];
  }

  public searchPost(): void {
    this.clearScrollContent();
    this.filterData();
    this.showFilterText = this.searchData.subject_name ? this.searchData.subject_name : this.searchData.college_name ? this.searchData.college_name : this.searchData.degree_name;
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.myWallSearchData.subjectIds.length || this.myWallSearchData.collegeIds.length || this.myWallSearchData.degreeIds.length) {
      if (this.showFilterText && this.showFilterText.match(nameValid)) {
        this.counterList = 0;
        this.searchActive = true;
        this.loader = true;
        this.myWallService.searchPost(this.myWallSearchData, this.postType, this.counterList).subscribe((res) => {
          this.loader = false;
          if (res.status == 2) {
            if (res.data) {
              this.postdataAll = res.data;
            }
            this.searchStatus = true;
            this.myWallSearchData = new SearchData();
            this.total_post = res.total_post;
          }
        });
      } else {
        this.showFilterText = '';
        this.commonService.showToast('Please select valid subject,college or degree.');
      }
    } else {
      this.showFilterText = '';
      this.commonService.showToast('Please select valid subject,college or degree.');
    }
  }

  public filterData(): void {
    if (this.searchData.subject_name) {
      if (this.myWallSearchData.subjectIds.indexOf(this.searchId) == -1) {
        this.myWallSearchData.subjectIds.push(this.searchId);
      }
    } else if (this.searchData.college_name) {
      if (this.myWallSearchData.collegeIds.indexOf(this.searchId) == -1) {
        this.myWallSearchData.collegeIds.push(this.searchId);
      }
    } else if (this.searchData.degree_name) {
      if (this.myWallSearchData.degreeIds.indexOf(this.searchId) == -1) {
        this.myWallSearchData.degreeIds.push(this.searchId);
      }
    }
  }

  public searchReset(): void {
    this.showFilterText = '';
    this.searchActive = false;
    this.counterList = 0;
    this.scrollController = 1;
    this.searchId = null;
    this.searchData = new MyWallSearch();
    this.myWallSearchData = new SearchData();
    this.getPosts(10, 0);
  }

  /**
   * Post share
   */

  onShareClick(data) {
    this.navCtrl.push(SelectprivacyPage, { postData: data });
  }

  public getProfileById(id): void {
    if (id == DataService.userid) {
      this.navCtrl.push(TimelinePage)
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
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

  getGroupWall(id: any) {
    this.navCtrl.push(GroupWallPage, { wallId: id });
  }

  onViewLikeClick(id) {
    this.navCtrl.push(LikeMembersListPage, id);
  }
  public clearScrollContent(): void {
    this.counterList = 0;
    this.scrollController = 1;
  }
  newpost(tabValue, postType) {
    let modal = this.modalCtrl.create(TimelineUpdatestatusPage, { tabValue: tabValue, postType: postType });
    modal.onDidDismiss(data => {
      this.clearScrollContent();
      // this.getUserGroups();
      // this.myWallService.getNotification();
      this.getPosts(10, 0);
    });
    modal.present();
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

  public editPost(postData: any, index) {
    let modal = this.modalCtrl.create(PostEditPage, { post: postData });
    modal.onDidDismiss(data => {
      if (data) {
        for (var i = 0; i < this.postdataAll.length; i++) {
          if (this.postdataAll[i] && this.postdataAll[i]._id == data._id) {
            this.postdataAll[i] = data;
          }
        }
      }
    });
    modal.present();
  }

  public onDeleteClick(post, index) {
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
      this.dataService.postData(this.deletePostUrl, this.postDeleteData).subscribe(res => {
        if (res.status == 2) {
          this.postdataAll.splice(index, 1);
          this.commonService.showToast('Post has been deleted successfully');
        } else {
          this.commonService.showToast(res['data'].message);
        }
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
    this.ionicStorage.set('hideMyWallOverlay', true);
    this.showOverlay = false;
  }
}