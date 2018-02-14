import { Component } from '@angular/core';
import { NavController, NavParams, ModalController,PopoverController } from 'ionic-angular';
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { MyWallService } from '../../providers/my-wall-service';
import { PageService } from '../../providers/page-service';
import { UserService } from "../../providers/user-service";
import { FriendManagmentPage } from '../friend-managment/friend-managment';
import { ChatPage } from '../chat/chat';
import { SubjectPage } from '../subject/subject';
import { CollegePage } from '../college/college';
import { DegreePage } from '../degree/degree';
import { FollowerPage } from '../follower/follower';
import { FollowingPage } from '../following/following';
import { MyFriendPage } from '../my-friend/my-friend';
import { SelectprivacyPage } from '../selectprivacy/selectprivacy';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';
import { CommentPage } from '../comment/comment';
import { SearchData, MyWallSearch } from '../../interfaces/common-interfaces';
import { SinglePostPage } from '../single-post/single-post';
import { TimelinePage } from '../timeline/timeline';
import { GroupWallPage } from '../group-wall/group-wall';
import { LikeMembersListPage } from '../like-members-list/like-members-list';
import { MorePopoverPostPage } from '../more-popover-post/more-popover-post';
import { CheckWallService } from '../../providers/check-wall-service';
import {FlagPostPage} from '../flag-post/flag-post';


/*
  Generated class for the FriendProfile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-friend-profile',
  templateUrl: 'friend-profile.html',
  providers: [CommonService, DataService, UserService]
})
export class FriendProfilePage {
  private _dataUrlProfileByUser = 'api/user/getUserProfileData/';
  public _addFriendNotification = '/api/notification/addNotification/';
  private _dataUrladdFollower = 'api/user/addFollower/';
  private _dataUrlUnFollow = 'api/user/unFollow/';
  public _dataUrlendorseSkill = '/api/skill/endorseSkill/';
  public _addEndorseNotification = '/api/notification/addNotification/';
  public _dataUrlSkill = '/api/user/getUserSkills/';
  public deleteSubjectPostUrl = "/api/post/delete";
  public deleteDegreePostUrl = "/api/degree_post/delete";
  public deleteCollegePostUrl = "/api/college_post/delete";
  public deletePostUrl = "/api/post/deleteTimelinePost"; 
  private _getUserStatusUrl = '/api/user/checkUserStatus';
  public postType: number;
  public userId;
  public tab: string = "Profile";
  public user;
  public skills;
  public viewTab: boolean = true;
  public filteractive = [];
  public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
  public endorsedata = { skill: null, user_id: '', type: '' };
  public addEndorseTitle = { title: 'skill added' };
  private post_type = {
    SENDREQ: 0,
    SKILLNOTIFY: 4,
  };
  public loader: boolean = false;
  public timelinedata: Array<any> = [];
  public counterListTimeline: number = 0;
  public total_timeline: number = 0;
  public searchActive: boolean = false;
  public scrollControllerTimeline;
  public parset;
  public postLike = { post_id: "" };
  public loggedInUserId: number = null;
  public searchData: MyWallSearch = new MyWallSearch();
  public searchedSubjectsList: Array<any> = [];
  public searchedCollegesList: Array<any> = [];
  public searchedDegreesList: Array<any> = [];
  public timelineSearchData: SearchData = new SearchData();
  public searchCounter: number = 0;
  public accordian: boolean = false;
  public parameter;
  public JournalByUserId = [];
  public postDeleteData = { postId: '', wallId: '', wallType: '' };
  public postDeleteIndex: number = null;
  public searchId: number = null;
  public searchStatus: boolean = false;
  public showFilterText: string = '';
  public isUserBlocked: boolean = false;
  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    public dataService: DataService,
    public commonService: CommonService,
    public pageService: PageService,
    public service: UserService,
    public myWallService: MyWallService,
    public modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public checkWallService: CheckWallService    
  ) {
    this.userId = navParams.data.userId;
    this.parameter = navParams;
    this.parameter.data = 10;
    if (DataService.userid) {
      this.loggedInUserId = DataService.userid;
    }
    this.getUserStatus();
    this.myWallService.getOnUserFollow().subscribe((res) => {
      if (res) {
          this.dataService.getData(this._dataUrlProfileByUser + this.userId).subscribe(user => {
              this.user = user;
              this.skills = user.skills;
              this.showskills();
          });
      }
  })
  }

  ionViewDidLoad() {
    this.getUserProfile();
    this.getUserTimeline();
    this.scrollControllerTimeline = 1;
    this.counterListTimeline = 0;
    this.filteractive[0] = true;
    for (var i = 1; i <= 7; i++) {
      this.filteractive[i] = false;
    }
    this.pageService.wall_type = '';
  }

  ionViewWillEnter() {
    this.scrollControllerTimeline = 1;
    this.counterListTimeline = 0;
    this.getUserTimeline();
    this.filteractive[0] = true;
    for (var i = 1; i <= 7; i++) {
      this.filteractive[i] = false;
    }
    this.pageService.wall_type = '';
  }

  getUserProfile() {
    this.loader = true;
    this.dataService.getData(this._dataUrlProfileByUser + this.userId).subscribe(user => {
      this.loader = false;
      this.user = user;
      this.skills = user.skills;
      this.showskills();
    });
  }

   public getUserStatus(): void {
        this.dataService.getData(this._getUserStatusUrl + '/' + this.userId).subscribe((res) => {
            if (res.status == 2) {
                this.isUserBlocked = res.isBlocked;
            }
        });
    }

  addAsFriend(user) {
    this.addFriendTitle.recepient = user;
    this.service.addAsFriend(this.userId)
      .then(res => {
        if (res.status == 2) {
          this.commonService.showToast('Friend Request Sent');
          user.current_friends_status_code = 1;
          this.dataService.postData(this._addFriendNotification + this.userId + '/' + this.post_type.SENDREQ, this.addFriendTitle).subscribe(noti => {
          });
        }
        else {
          user.current_friends_status_code = res.friendStatus;
          this.commonService.showToast(res.msg);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  cancelRequestedFriend(user) {
    this.service.cancelRequestedFriend(this.userId)
      .then(res => {
        if (res.status == 2) {
          user.current_friends_status_code = 6;
          this.commonService.showToast('Friend Request Cancelled');
        }
        else {
          user.current_friends_status_code = res.friendStatus;
          this.commonService.showToast(res.msg);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getFriendManagementPage() {
    this.navCtrl.push(FriendManagmentPage);
  }

  setFollow(user) {
    this.user = user;
    this.dataService.getData(this._dataUrladdFollower + this.userId).subscribe(res => {
      if (res.status == 2) {
        this.commonService.showToast(res.msg);
        this.user.followersCount = res.followersCount;
        this.user.followers = res.followers;
        user.following_friend_status_code = 3;
      }
      else {
        this.commonService.showToast(res.msg);
      }
      this.myWallService.setOnUserFollow(true);
    });
  }

  setUnFollow(user) {
    this.user = user;
    this.dataService.getData(this._dataUrlUnFollow + this.userId).subscribe(res => {
      if (res.status == 2) {
        this.user.followersCount = res.followersCount;
        this.user.followers = res.followers;
        user.following_friend_status_code = 6;
      } else {
        this.commonService.showToast(res.msg);
      }
      this.myWallService.setOnUserFollow(true);
    });
  }

  gotochat() {
    this.navCtrl.push(ChatPage);
  }

  endorseSkill(id, type) {
    this.endorsedata.skill = id;
    this.endorsedata.type = type;
    this.endorsedata.user_id = this.userId;
    this.dataService.postData(this._dataUrlendorseSkill, this.endorsedata).subscribe(res => {
      if (res.status == 2) {
        this.dataService.postData(this._addEndorseNotification + this.endorsedata.user_id + '/' + this.post_type.SKILLNOTIFY, this.addEndorseTitle).subscribe(res => {
        });
        this.getSkillsonEndorse();
      } else {
        this.commonService.showToast(res.msg);
      }
    });
  }

  getSkillsonEndorse() {
    this.dataService.getData(this._dataUrlSkill + this.userId).subscribe(user => {
      this.skills = user.skills;
      this.showskills();
    });
  }

  showskills() {
    for (var i = 0; i < this.skills.length; i++) {
      this.skills[i].listedusers = [];
      this.skills[i].is_endorsed = false;
      var k = 0;
      for (var j = 0; j < this.skills[i].endorse.length; j++) {
        if (this.skills[i].endorse[j] != '' && this.skills[i].endorse[j] != undefined) {
          if (this.skills[i].endorse[j]._id != '') {
            if (this.user.ui == this.skills[i].endorse[j].user_id._id)
              this.skills[i].is_endorsed = true;
            if (k < 8) {
              this.skills[i].listedusers.push(this.skills[i].endorse[j]);
              k++;
            }
          }
        }
      }
    }
  }

  getUserTimeline() {
    this.loader = true;
    this.counterListTimeline = 0;
    if (!this.searchActive) {
      this.myWallService.getFriendTimeline(this.counterListTimeline, this.parameter.data, this.userId)
        .subscribe((res) => {
          if (res.status == 2) {
            this.loader = false;
            if (res.data) {
              this.timelinedata = res.data;
            }
            this.total_timeline = res.total_timeline;
          }
          else {
            this.commonService.showToast(res.msg);
          }
        });
    } else {
      this.searchPost();
    }
  }

  updateParameter(value, arrayIndex) {
    this.parameter.data = value;
    this.getUserTimeline();
    for (var i = 0; i <= 7; i++) {
      if (i == arrayIndex) {
        this.filteractive[i] = true;
      }
      else {
        this.filteractive[i] = false;
      }
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

  goToFriendPage(friends) {
    this.navCtrl.push(MyFriendPage, { friends: friends });
  }

  goToFollowersPage(followers) {
    this.navCtrl.push(FollowerPage, { followers: followers });
  }

  goToFollowingPage(followings) {
    this.navCtrl.push(FollowingPage, { followings: followings });
  }

  hidetab() {
    this.viewTab = !this.viewTab;
  }

  getFoldername(type) {
    if (type == 1) return "Subject";
    if (type == 2) return "College";
    if (type == 3) return "Degree";
    if (type == 5) return "Timeline";
    if (type == 6) return "GroupWall";
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
              this.myWallService.getFriendTimeline(this.counterListTimeline, this.parameter.data, this.userId)
                .subscribe((res) => {
                  this.loader = false;
                  if (res.status == 2) {
                    if (res.data) {
                      this.timelinedata = this.timelinedata.concat(res.data);
                    }
                    this.scrollControllerTimeline = 1;
                    this.total_timeline = res.total_timeline;
                  }
                  else {
                    this.commonService.showToast(res.msg);
                  }
                });
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
              this.myWallService.friendTimelinesearchPost(this.timelineSearchData, this.searchCounter, this.parameter.data, this.userId).subscribe((res) => {
                this.loader = false;
                if (res.status == 2) {
                  if (res.data.length) {
                    this.timelinedata = this.timelinedata.concat(res.data);
                  }
                  this.scrollControllerTimeline = 1;
                  this.timelineSearchData = new SearchData();
                } else {
                  this.commonService.showToast(res.msg);
                }
              });
            }
          }
          infiniteScroll.complete();
        }, 500);
      }
    }
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

  gotoJournal(posts) {
    this.navCtrl.push(PostInJournalPage, { posts: posts });
  }

  goToSinglePost(data, postId) {
    if (data.post_id.photo.length > 0 || data.post_id.video.length > 0 || data.post_id.audio.length > 0) {
      let modal = this.modalCtrl.create(SinglePostPage, { post_data: data.post_id, postId: postId, redirectPage: "friendtimeline" });
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

  /**Searching */
  public subjectSearch(e: any): void {
    this.searchedCollegesList = [];
    this.searchedDegreesList = [];
    this.searchData.college_name = '';
    this.searchData.degree_name = '';
    this.showFilterText = '';
    var nameValid = /^[a-z\d\-_\s]+$/i;
    if (this.searchData.subject_name) {
      if (this.searchData.subject_name.match(nameValid)) {
        this.myWallService.getFriendSearchSubject(this.userId, this.searchData.subject_name).subscribe((res) => {
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
        this.myWallService.getFriendSearchCollege(this.userId, this.searchData.college_name).subscribe((res) => {
          if (res.status == 2) {
            this.searchedCollegesList = res.data;
          }
        });
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
        this.myWallService.getFriendSearchDegree(this.userId, this.searchData.degree_name).subscribe((res) => {
          if (res.status == 2) {
            this.searchedDegreesList = res.data;
          }
        });
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
        this.myWallService.friendTimelinesearchPost(this.timelineSearchData, this.searchCounter, this.parameter.data, this.userId).subscribe((res) => {
          this.loader = false;
          if (res.status == 2) {
            if (res.data) {
              this.timelinedata = res.data;
            } else {
              this.commonService.showToast('No search result found');
            }
            this.total_timeline = res.total_timeline;
            this.timelineSearchData = new SearchData();
            this.searchStatus = true;
          }
        });
      } else {
        this.commonService.showToast('Please select subject,college or degree.');
        this.showFilterText = '';
      }
    } else {
      this.commonService.showToast('Please select subject,college or degree.');
      this.showFilterText = '';
    }
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

  public searchReset(): void {
    this.showFilterText = '';
    this.searchActive = false;
    this.searchCounter = 0;
    this.searchId = null;
    this.counterListTimeline = 0;
    this.scrollControllerTimeline = 1;
    this.searchData = new MyWallSearch();
    this.timelineSearchData = new SearchData();
    this.getUserTimeline();
  }

  advancesearch() {
    this.accordian = !this.accordian;
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
        this.timelinedata.splice(index, 1);
        this.commonService.showToast('Post has been deleted successfully');
      } else {
        this.commonService.showToast(res['data'].message);
      }
    });
  }

  public getProfileById(id): void {
    if (id == DataService.userid) {
      this.navCtrl.push(TimelinePage);
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }
  getGroupWall(id: any) {
    this.navCtrl.push(GroupWallPage, { wallId: id });
  }
  onViewLikeClick(id) {
    this.navCtrl.push(LikeMembersListPage, id);
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
}

