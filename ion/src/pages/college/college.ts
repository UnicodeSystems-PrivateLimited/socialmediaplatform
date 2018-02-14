import { Component } from '@angular/core';
import { NavController, PopoverController, Tabs, NavParams, ModalController, Platform, App, ToastController } from 'ionic-angular';
import { MoreactionPage } from '../more-action/more-action';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { SubjectpageTabPage } from '../subjectpage-tab/subjectpage-tab';
import { SubjectListPage } from '../subject-list/subject-list';
import { SinglePostPage } from '../single-post/single-post';
import { SearchListPage } from '../search-list/search-list';
import { Keyboard } from 'ionic-native';
import { SelectprivacyPage } from '../selectprivacy/selectprivacy';
import { CommentPage } from '../comment/comment';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';
import { CollegeUpdateStatusPagePage } from '../college-update-status-page/college-update-status-page';
import { PostEditPage } from '../post-edit/post-edit';
import { ChatPage } from '../chat/chat';
import { NotificationPage } from '../notification/notification';
import { TimelinePage } from '../timeline/timeline';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { FriendRequestNotificationPage } from '../friend-request-notification/friend-request-notification';
import { JoinSCDPage } from '../join-scd/join-scd';
import { MembersListPage } from '../members-list/members-list';
import moment from 'moment';
import { CheckWallService } from '../../providers/check-wall-service';
import { LikeMembersListPage } from '../like-members-list/like-members-list';
import { MyProfilePage } from '../my-profile/my-profile';
import { MorePopoverPostPage } from '../more-popover-post/more-popover-post';
import { GroupsPage } from '../groups/groups';
import { EventsPage } from '../events/events';
import { InvitePage } from '../invite/invite';
import {FlagPostPage} from '../flag-post/flag-post';
import { Storage } from '@ionic/storage';

/*
  Generated class for the College page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-college',
  templateUrl: 'college.html',
  providers: [UserService, CommonService, DataService, MyWallService]
})
export class CollegePage {
  public wallId: any;
  public deletePostUrl = "/api/college_post/delete";
  public loader: boolean = false;
  private counterList;
  public scrollController;
  public total_post: any;
  public isResult;
  public post_data: Array<any> = [];
  public sub;
  public parsep;
  public userSearchField = { name: "" };
  public postLike = { post_id: "" };
  private counterListForSpecificPost;
  public filteractive = [];
  public setPostType = '';
  public viewTab: boolean = true;
  public viewTabBottom: boolean = true;
  public searching: boolean = false;
  public accordian: boolean = false;
  public futureDate = null;
  public catagory = 0;
  public who_posted = 1;
  public searchDateFrom = new Date();
  public searchDateTo = new Date();
  public searchFrom = '';
  public searchTo = '';
  public user;
  public is_member: boolean = false;
  public selectStatus = 1;
  public membersCount: Array<any> = [];
  public showOverlay = false;

  /**
   * new api url
  */
  private _getDataByPostTypeUrl = '/api/college_post/getCollegeWallPostById/';
  private _getSearchUrl = '/api/college_post/getCollegeSearchedPostsById/';
  public postType: number = 10;
  constructor(
    private popoverCtrl: PopoverController,
    public commonService: CommonService,
    public myWallService: MyWallService,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public service: UserService,
    public toastCtrl: ToastController,
    public dataService: DataService,
    public pageService: PageService,
    public checkWallService: CheckWallService,
    public ionicStorage: Storage,
  ) {
    this.wallId = this.navParams.get('wallId');
    this.counterList = 0;
    this.total_post = 0;
    this.scrollController = 1;
    this.counterListForSpecificPost = 0;
    let todayDate = new Date();
    let year = todayDate.getFullYear();
    let month = todayDate.getMonth();
    let day = todayDate.getDate();
    this.futureDate = new Date(year + 25, month, day).toISOString();
    this.user = this.service.getSavedUser();
    this.service.getIonicStoredUser()
      .then((userSavedData) => {
        this.user = this.user ? this.user : userSavedData ? JSON.parse(userSavedData) : null;
      })
      .catch((err) => {
        console.log(err);
      });
    this.checkWallService.setActiveWall(2);  //2=> College Wall    
    this.checkWallService.setInviteActiveWall(2);  //2=> College Wall    
    this.checkWallService.getMember().subscribe(val => this.is_member = val);
  }

  ionViewDidLoad() {
    this.filteractive[0] = true;
    for (var i = 1; i <= 7; i++) {
      this.filteractive[i] = false;
    }
    this.counterList = 0;
    this.scrollController = 1;
    this.getPosts(this.postType, 0);
    this.myWallService.saveLastVisitTime(this.wallId, 2).subscribe((res) => { });
    this.getCollegeWallData();
    // this.myWallService.getNotification();
    this.ionicStorage.get('hideCollegeWallOverlay').then((hideCollegeWallOverlay) => {
      if(hideCollegeWallOverlay){
        this.showOverlay = false;
      }else{
        this.showOverlay = true;
      }
    });
  }

  ionViewWillEnter() {
    for (let i in this.filteractive) {
      if (this.filteractive[i]) {
        var arrayIndex = i;
      }
    }
    this.counterList = 0;
    this.scrollController = 1;
    this.getCollegeWallData();
    this.getPosts(this.postType, arrayIndex);
    // this.myWallService.getNotification();

  }

  onShareClick(data) {
    this.navCtrl.push(SelectprivacyPage, { postData: data });
  }

  showToast(position: string) {
    let toast = this.toastCtrl.create({
      message: this.sub.collegeDetails.name,
      duration: 2000,
      position: position
    });
    toast.present(toast);
  }

  gotoJournal(posts) {
    this.navCtrl.push(PostInJournalPage, { posts: posts });
  }

  morepopup(ev) {
    let popover = this.popoverCtrl.create(MoreactionPage, {
      wallId: this.wallId
      // contentEle: this.content.nativeElement,
      // textEle: this.text.nativeElement
    });
    popover.present({
      ev: ev
    });
  }

  getCollegeWallData() {
    this.loader = true;
    this.myWallService.getCollegeWallData(this.wallId)
      .then((res) => {
        this.loader = false;
        if (res) {
          this.sub = res;
          this.pageService.wall_type = "College";
          this.pageService.walldetails = this.sub.collegeDetails;
          this.membersCount = this.sub.collegeDetails.members;
          this.checkWallService.setMember(this.sub.is_member);
          this.checkWallService.setActiveWallName(this.sub.collegeDetails.name);
          this.is_member = this.sub.is_member;
          console.log('this.is_member');
          console.log(this.is_member);
          // if (!this.sub.is_member) {
          //   this.is_member = false;
          // }
        }
      }, (err) => {
        this.loader = false;
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getPosts(postType: number, arrayIndex) {
    this.postType = postType;
    for (var i = 0; i <= 7; i++) {
      if (i == arrayIndex) {
        this.filteractive[i] = true;
      }
      else {
        this.filteractive[i] = false;
      }
    }
    if (!this.searching) {
      this.clearScrollContent();
      this.searching = false;
      this.loader = true;
      this.dataService.getData(this._getDataByPostTypeUrl + this.wallId + '/' + this.postType + '/' + this.counterList).subscribe(res => {
        if (res.status == 2) {
          if (res.data) {
            this.post_data = res.data;
          }
          this.loader = false;
          this.isResult = res.isResult;
          this.total_post = res.total_post;
        }
      });
    } else {
      this.searchPost();
    }
  }

  doInfinite(infiniteScroll) {
    if (this.searching == false) {
      if (this.scrollController) {
        if (this.postType != null) {
          this.scrollController = 0;
          this.parsep = this.total_post / 10;
          var page = parseInt(this.parsep);
          if (this.counterList <= (page + 1)) {
            this.counterList++;
            this.loader = true;
            this.dataService.getData(this._getDataByPostTypeUrl + this.wallId + '/' + this.postType + '/' + this.counterList).subscribe(post => {
              if (post.status == 2) {
                if (post.data) {
                  this.post_data = this.post_data.concat(post.data);
                }
              }
              this.scrollController = 1;
              this.loader = false;
            });
          }
        }
      }
    } else {
      if (this.scrollController) {
        this.scrollController = 0;
        this.parsep = this.total_post / 10;
        var page = parseInt(this.parsep);
        if (this.counterList <= (page + 1)) {
          this.counterList++;
          this.loader = true;
          this.dataService.getData(this._getSearchUrl + this.wallId + '/' + this.counterList + '/' + this.postType + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.catagory + '/' + this.who_posted + '/' + this.selectStatus).subscribe(post => {
            if (post.status == 2) {
              if (post.data) {
                this.post_data = this.post_data.concat(post.data);
              }
            }
            this.scrollController = 1;
            this.loader = false;
          });
        }
      }
    }
    setTimeout(() => {
      infiniteScroll.complete();
    }, 500);
  }

  SubjecLlistPopover(ev, searchType) {
    this.navCtrl.push(SubjectListPage, { searchType: searchType });
  }

  presentPopover() {
    this.navCtrl.push(MoreactionPage);
  }

  goToSinglePost(data, postId) {
    if (data.photo.length > 0 || data.video.length > 0 || data.audio.length > 0) {
      let modal = this.modalCtrl.create(SinglePostPage, { post_data: data, postId: postId, wallId: this.wallId, redirectPage: "college" });
      modal.onDidDismiss(data => {
        for (let i in this.filteractive) {
          if (this.filteractive[i]) {
            var arrayIndex = i;
          }
        }
        this.counterList = 0;
        this.scrollController = 1;
        this.getCollegeWallData();
        this.getPosts(this.postType, arrayIndex);
      });
      modal.present();
    }
  }

  CommentModal(postId, characterNum, postLikes) {
    let modal = this.modalCtrl.create(CommentPage, { postId: postId, characterNum: characterNum, postLikes: postLikes });
    modal.onDidDismiss(data => {
      for (let i in this.filteractive) {
        if (this.filteractive[i]) {
          var arrayIndex = i;
        }
      }
      if (data && data.post_id) {
        for (let i = 0; i < this.post_data.length; i++) {
          if (this.post_data[i]._id == data.post_id) {
            this.post_data[i].comments = data.characterNum;
          }
        }
      }
      else {
        this.counterList = 0;
        this.scrollController = 1;
        this.getCollegeWallData();
        this.getPosts(this.postType, arrayIndex);
      }
    });
    modal.present();
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

  hidetab() {
    this.viewTab = !this.viewTab;
  }

  hideTabBottom() {
    this.viewTabBottom = !this.viewTabBottom;
  }

  advancesearch() {
    this.accordian = !this.accordian;
  }
  selectStatusType(event) {
    this.selectStatus = event;
  }

  public searchPost() {
    this.clearScrollContent();
    this.searching = true;
    if (this.searchFrom != '') {
      var searhFrom = this.searchFrom.split('-');
      this.searchDateFrom = new Date(parseInt(searhFrom[0]), parseInt(searhFrom[1]) - 1, parseInt(searhFrom[2]));
      if (this.searchTo != '') {
        var searhTo = this.searchTo.split('-');
        this.searchDateTo = new Date(parseInt(searhTo[0]), parseInt(searhTo[1]) - 1, parseInt(searhTo[2]));
        if (moment(this.searchDateTo).isSameOrAfter(this.searchDateFrom)) {
          this.searchDateTo.setDate(this.searchDateTo.getDate() + 1);
          this.loader = true;
          this.dataService.getData(this._getSearchUrl + this.wallId + '/' + this.counterList + '/' + this.postType + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.catagory + '/' + this.who_posted + '/' + this.selectStatus).subscribe(post => {
            if (post.status == 2) {
              if (post.data) {
                this.post_data = post.data;
              }
              this.isResult = post.isResult;
              this.total_post = post.total_post;
            }
            this.loader = false;
          });
        }
        else {
          this.commonService.showToast("To date should be greater than or equal to From date");
        }
      }
      else {
        this.searchDateTo = null;
        this.loader = true;
        this.dataService.getData(this._getSearchUrl + this.wallId + '/' + this.counterList + '/' + this.postType + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.catagory + '/' + this.who_posted + '/' + this.selectStatus).subscribe(post => {
          if (post.status == 2) {
            if (post.data) {
              this.post_data = post.data;
            }
            this.isResult = post.isResult;
            this.total_post = post.total_post;
          }
          this.loader = false;
        });
      }
    }
    else if (this.searchTo != '') {
      this.commonService.showToast("Please enter From date");
    }
    else {
      this.searchDateFrom = null;
      this.searchDateTo = null;
      this.loader = true;
      this.dataService.getData(this._getSearchUrl + this.wallId + '/' + this.counterList + '/' + this.postType + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.catagory + '/' + this.who_posted + '/' + this.selectStatus).subscribe(post => {
        if (post.status == 2) {
          if (post.data) {
            this.post_data = post.data;
          }
          this.isResult = post.isResult;
          this.total_post = post.total_post;
        }
        this.loader = false;
      });
    }
  }

  resetSearch() {
    this.who_posted = 1;
    this.selectStatus = 1;
    this.catagory = 0;
    this.searchFrom = '';
    this.searchTo = '';
    this.searching = false;
    this.getPosts(10, 0);
    this.filteractive[0] = true;
    for (var i = 1; i <= 7; i++) {
      this.filteractive[i] = false;
    }
  }

  selectCatagory(event) {
    this.catagory = event;
  }

  search_who_posted(event) {
    this.who_posted = event;
  }

  newpost(tabValue, postType) {
    let modal = this.modalCtrl.create(CollegeUpdateStatusPagePage, { sub: this.sub, collegeId: this.wallId, wallType: 'collegeWall', tabValue: tabValue, postType: postType });
    modal.onDidDismiss(data => {
      for (let i in this.filteractive) {
        if (this.filteractive[i]) {
          var arrayIndex = i;
        }
      }
      if (data && data.wallId) {
        this.wallId = data.wallId;
        this.counterList = 0;
        this.scrollController = 1;
        this.getCollegeWallData();
        this.getPosts(this.postType, arrayIndex);
      }
      else {
        console.log(data);
        this.counterList = 0;
        this.scrollController = 1;
        this.getCollegeWallData();
        this.getPosts(this.postType, arrayIndex);
      }
    });
    modal.present();
  }

  getCategory(category_id) {
    if (category_id == 1) return "General";
    else if (category_id == 2) return "Tip / Trick";
    else if (category_id == 3) return "Joke / Humor";
    else if (category_id == 4) return "Tutorial";
    else return "No Category";
  }

  public onDeleteClick(id, index) {
    this.commonService.showConfirm("", "Are you sure you want to delete this post ?", () => this.deletePostById(id, index));
  }

  public deletePostById(id, index) {
    this.dataService.getData(this.deletePostUrl + '/' + id + '/' + this.wallId).subscribe(res => {
      if (res.status == 2) {
        this.post_data.splice(index, 1);
        this.commonService.showToast('Post has been deleted successfully');
      } else {
        this.commonService.showToast(res['data'].message);
      }
    });
  }

  public clearScrollContent(): void {
    this.counterList = 0;
    this.scrollController = 1;
    this.counterListForSpecificPost = 0;
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

  public editPost(postData: any, index) {
    let modal = this.modalCtrl.create(PostEditPage, { post: postData });
    modal.onDidDismiss(data => {
      if (data) {
        for (var i = 0; i < this.post_data.length; i++) {
          if (this.post_data[i]._id == data._id) {
            this.post_data[i] = data;
          }
        }
      }
    });
    modal.present();
  }

  public getProfileById(id): void {
    if (id == DataService.userid) {
      this.navCtrl.push(TimelinePage)
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }
  public joinSCD() {
    let modal = this.modalCtrl.create(JoinSCDPage, { wallId: this.wallId, wallName: 'College' });
    modal.onDidDismiss(data => {
      for (let i in this.filteractive) {
        if (this.filteractive[i]) {
          var arrayIndex = i;
        }
      }
      if (data && data.is_member) {
        this.is_member = true;
        this.scrollController = 1;
        this.getCollegeWallData();
        this.getPosts(this.postType, arrayIndex);
      }
    });
    modal.present();
  }

  public onMemberClick() {
    this.navCtrl.push(MembersListPage, { id: this.wallId, type: 2 });
  }
  onViewLikeClick(id) {
    this.navCtrl.push(LikeMembersListPage, id);
  }

  public goToProfile() {
    this.navCtrl.push(MyProfilePage, { pageType: 1 });
  }

  public onMorePopover(data: any) {
    let popover = this.popoverCtrl.create(MorePopoverPostPage, {
      data: data
    });
    popover.present({

    });
  }

  onGroupClick() {
    this.checkWallService.setActiveWall(2);
    this.navCtrl.push(GroupsPage, { wallId: this.wallId });
  }

  onEventsClick() {
    this.navCtrl.push(EventsPage);
  }

  onInviteFriends() {
    this.navCtrl.push(InvitePage);

  }

  public onLeaveClick() {
    this.commonService.showConfirm("", 'Are you sure you want to leave this college ?', () => this.leaveCollege());
  }

   public leaveCollege(): void {
    let wall_type = 'College';
    this.service.leaveSCD(this.wallId, wall_type).subscribe((res) => {
      if (res.status == 2) {
        this.checkWallService.setMember(false);
        this.getCollegeWallData();
        this.commonService.showToast(res.message);
      }
    });
  }

  public onFlagClick(id){
    let popover = this.popoverCtrl.create(FlagPostPage, {data:id});
    popover.present({   
    });
  }

  public onHelpClick() {
    this.showOverlay = !this.showOverlay;
  }

  public onHideOverlay() {
    this.ionicStorage.set('hideCollegeWallOverlay', true);
    this.showOverlay = false;
  }
}
