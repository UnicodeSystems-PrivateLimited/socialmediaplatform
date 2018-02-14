import { Component } from '@angular/core';
import { NavController, PopoverController, Tabs, NavParams, ModalController, MenuController, Platform, App, ToastController } from 'ionic-angular';
import { MoreactionPage } from '../more-action/more-action';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { MyWallService } from "../../providers/my-wall-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { GroupWallService } from '../../providers/group-wall-service';
import { SubjectpageTabPage } from '../subjectpage-tab/subjectpage-tab';
import { SubjectListPage } from '../subject-list/subject-list';
import { SinglePostPage } from '../single-post/single-post';
import { SelectprivacyPage } from '../selectprivacy/selectprivacy';
import { SearchListPage } from '../search-list/search-list';
import { Keyboard } from 'ionic-native';
import { CommentPage } from '../comment/comment';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';
import { NewGroupPostPage } from '../new-group-post/new-group-post';
import { PostEditPage } from '../post-edit/post-edit';
import { ChatPage } from '../chat/chat';
import { NotificationPage } from '../notification/notification';
import { FriendRequestNotificationPage } from '../friend-request-notification/friend-request-notification';
import { TimelinePage } from '../timeline/timeline';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { Post } from '../../interfaces/common-interfaces';
import { MembersListPage } from '../members-list/members-list';
import moment from 'moment';
import { CheckWallService } from '../../providers/check-wall-service';
import { LikeMembersListPage } from '../like-members-list/like-members-list';
import {InvitePage} from '../invite/invite';
import {MyProfilePage} from '../my-profile/my-profile';
import { MorePopoverPostPage } from '../more-popover-post/more-popover-post';
import { GroupsPage } from '../groups/groups';
import { EventsPage } from '../events/events';
import {FlagPostPage} from '../flag-post/flag-post';
import { Storage } from '@ionic/storage';

/*
  Generated class for the GroupWall page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-group-wall',
  templateUrl: 'group-wall.html'
})
export class GroupWallPage {
  public groupPost: Post = new Post();
  public group: any = {};
  public wallId: any = null;
  public deletePostUrl = "/api/post/delete";
  public loader: boolean = false;
  private counterList;
  public scrollController;
  public total_post: any;
  public isResult;
  public post_data: Array<any> = [];
  public parsep;
  public userSearchField = { name: "" };
  public postLike = { post_id: "" };
  public viewTab: boolean = true;
  public viewTabBottom: boolean = true;
  private counterListForSpecificPost;
  public setPostType = '';
  public accordian: boolean = false;
  public futureDate = null;
  public catagory = 0;
  public who_posted = 1;
  public searching: boolean = false;
  public searchDateFrom = new Date();
  public searchDateTo = new Date();
  public searchFrom = '';
  public searchTo = '';
  public filteractive = [];
  public user;
  public is_member: boolean = true;
  public isAdmin: boolean = false;
  public postType: number = 10;
  public scdId: any;
  public userId: any;
  public isGroupAdded: number = 0;
  public membersCount: Array<any> = [];
  public showOverlay = false;
  
  constructor(
    private popoverCtrl: PopoverController,
    private commonService: CommonService,
    private groupWallService: GroupWallService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private service: UserService,
    private toastCtrl: ToastController,
    private dataService: DataService,
    private pageService: PageService,
    private myWallService: MyWallService,
    private checkWallService: CheckWallService,
    private menu: MenuController,
    public ionicStorage: Storage,
  ) {
    this.wallId = this.navParams.get('wallId');
    this.isGroupAdded = this.navParams.get('isGroupAdded');
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
    this.userId = DataService.userid;
    this.checkWallService.setInviteActiveWall(4); //4=> Group Wall
    this.checkWallService.getMember().subscribe(val => this.is_member = val);
    this.menu.enable(true);
    if (this.isGroupAdded == 1) {
      this.navCtrl.push(InvitePage);
    }
  }

  ionViewDidLoad() {
    this.filteractive[0] = true;
    for (var i = 1; i <= 7; i++) {
      this.filteractive[i] = false;
    }
    this.scrollController = 1;
    this.getGroupDetail();
    this.getPosts(this.postType, 0);
    this.updateLastVisit();
    // this.myWallService.getNotification();
    this.ionicStorage.get('hideGroupWallOverlay').then((hideGroupWallOverlay) => {
      if(hideGroupWallOverlay){
        this.showOverlay = false;
      }else{
        this.showOverlay = true;
      }
    });
  }

  ionViewWillEnter() {
    this.getGroupDetail();
    // this.myWallService.getNotification();
    for (let i in this.filteractive) {
      if (this.filteractive[i]) {
        var arrayIndex = i;
      }
    }
    this.counterList = 0;
    this.scrollController = 1;
    this.getPosts(this.postType, 0);
    this.updateLastVisit();
  }

  public updateLastVisit() {
    this.groupWallService.updateLastVisit(this.wallId).subscribe((res) => {
    });
  }

  /**Header */
  goToSearchPage() {
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

  public getGroupDetail() {
    this.groupWallService.getGroupDetails(this.wallId).subscribe(group => {
      if (group.status == 2) {
        this.group = group.data;
        this.pageService.walldetails = this.group;
        this.membersCount = this.group.members;        
        this.pageService.wall_type = "Group";
        this.checkWallService.setMember(group.isMember);                    
        if (this.group.created_by._id == DataService.userid) {
          this.isAdmin = true;
          this.checkWallService.setGroupAdmin(true); 
        }
        if (this.group['subject_id']) {
          this.scdId = this.group['subject_id']._id;
          this.checkWallService.setActiveWall(1); //1=> Subject Wall      
          this.checkWallService.setActiveWallName(this.group['subject_id'].name);
        } else if (this.group['college_id']) {
          this.scdId = this.group['college_id']._id;
          this.checkWallService.setActiveWall(2); //2=> College Wall   
          this.checkWallService.setActiveWallName(this.group['college_id'].name);
        } else if (this.group['degree_id']) {
          this.scdId = this.group['degree_id']._id;
          this.checkWallService.setActiveWall(3); //3=> Degree Wall    
          this.checkWallService.setActiveWallName(this.group['degree_id'].name);
        }
        this.is_member = group.isMember;
      }
    });
  }

  SubjecLlistPopover(ev, searchType) {
    this.navCtrl.push(SubjectListPage, { searchType: searchType });
  }

  advancesearch() {
    this.accordian = !this.accordian;
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
    if (!this.searching) {
      this.loader = true;
      this.clearScrollContent();
      this.searching = false;
      this.groupWallService.getGroupPosts(this.wallId, this.postType, this.counterList).subscribe(res => {
        if (res.status == 2) {
          if (res.data) {
            this.post_data = res.data;
          }
          this.loader = false;
          this.isResult = res.isResult;
          this.total_post = res.total_post;
        }
      });
    }
    else {
      this.searchPost();
    }
  }
  public clearScrollContent(): void {
    this.counterList = 0;
    this.scrollController = 1;
  }

  selectCatagory(event) {
    this.catagory = event;
  }

  search_who_posted(event) {
    this.who_posted = event;
  }

  resetSearch() {
    this.who_posted = 1;
    this.catagory = 0;
    this.searchFrom = '';
    this.searchTo = '';
    this.searching = false;
    this.getPosts(this.postType, 0);
    this.filteractive[0] = true;
    for (var i = 1; i <= 7; i++) {
      this.filteractive[i] = false;
    }
  }

  morepopup(ev) {
    let popover = this.popoverCtrl.create(MoreactionPage, {
      wallId: this.scdId,
      groupId:this.wallId
    });
    popover.present({
      ev: ev
    });
  }

  showToast(position: string) {
    let toast = this.toastCtrl.create({
      message: this.group.title,
      duration: 2000,
      position: position
    });

    toast.present(toast);
  }

  onShareClick(data) {
    this.navCtrl.push(SelectprivacyPage, { postData: data });
  }
  gotoJournal(posts) {
    this.navCtrl.push(PostInJournalPage, { posts: posts });
  }

  hidetab() {
    this.viewTab = !this.viewTab;
  }

  hideTabBottom() {
    this.viewTabBottom = !this.viewTabBottom;
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
            this.groupWallService.getGroupPosts(this.wallId, this.postType, this.counterList).subscribe(post => {
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
    }
    else {
      if (this.scrollController) {
        this.scrollController = 0;
        this.parsep = this.total_post / 10;
        var page = parseInt(this.parsep);
        if (this.counterList <= (page + 1)) {
          this.counterList++;
          this.loader = true;
          this.groupWallService.searchPost(this.wallId, this.counterList, this.postType, this.searchDateFrom, this.searchDateTo, this.catagory, this.who_posted).subscribe(post => {
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
      console.log('Async operation has ended');
      infiniteScroll.complete();
    }, 500);
  }

  goToSinglePost(data, postId) {
    if (data.photo.length > 0 || data.video.length > 0 || data.audio.length > 0) {
      let modal = this.modalCtrl.create(SinglePostPage, { post_data: data, postId: postId, wallId: this.wallId, redirectPage: "groupWall" });
      modal.onDidDismiss(data => {
        for (let i in this.filteractive) {
          if (this.filteractive[i]) {
            var arrayIndex = i;
          }
        }
        this.counterList = 0;
        this.scrollController = 1;
        this.getGroupDetail();
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
        console.log(data);
        this.counterList = 0;
        this.scrollController = 1;
        this.getPosts(this.postType, arrayIndex);
      }
    });
    modal.present();
  }

  like(post_id, data) {
    this.loader = true;
    this.postLike.post_id = post_id;
    this.myWallService.addLike(this.postLike)
      .then((res) => {
        data.likes = res.data;
        this.loader = false;
      }, (err) => {
        this.commonService.showToast(err.msg);
        this.loader = false;
      })
      .catch((err) => {
        console.log(err);
      })
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
          this.groupWallService.searchPost(this.wallId, this.counterList, this.postType, this.searchDateFrom, this.searchDateTo, this.catagory, this.who_posted).subscribe(post => {
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
        this.groupWallService.searchPost(this.wallId, this.counterList, this.postType, this.searchDateFrom, this.searchDateTo, this.catagory, this.who_posted).subscribe(post => {
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
      this.groupWallService.searchPost(this.wallId, this.counterList, this.postType, this.searchDateFrom, this.searchDateTo, this.catagory, this.who_posted).subscribe(post => {
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
    this.groupWallService.deletePost(id, this.wallId).subscribe(res => {
      if (res.status == 2) {
        this.post_data.splice(index, 1);
        this.commonService.showToast('Post has been deleted successfully');
      } else {
        this.commonService.showToast(res['data'].message);
      }
    });
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

  newpost(tabValue, postType) {
    let modal = this.modalCtrl.create(NewGroupPostPage, { isMember: this.is_member, groupId: this.wallId, wallType: 'groupWall', tabValue: tabValue, postType: postType });
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
        this.getGroupDetail();
        this.getPosts(this.postType, arrayIndex);
      }
      else {
        console.log(data);
        this.counterList = 0;
        this.scrollController = 1;
        this.getGroupDetail();
        this.getPosts(this.postType, arrayIndex);
      }
    });
    modal.present();
  }

  public onMemberClick() {
    this.navCtrl.push(MembersListPage, { id: this.wallId, type: 4 });
  }

  public joinGroup(): void {
    this.groupWallService.joinGroup(this.wallId).subscribe((res) => {
      if (res.status == 2) {
        this.is_member = true;
        this.checkWallService.setMember(true);
        this.commonService.showToast(res.msg);
        this.filteractive[0] = true;
        // this.getPosts(this.postType,0);
      }
    });
  }

  // public onClickleaveGroup() {
  //   this.commonService.showConfirm("", "Are you sure you want to leave this group ?", () => this.leaveGroup());
  // }

  // public leaveGroup(): void {
  //   this.groupWallService.leaveGroup(this.wallId).subscribe((res) => {
  //     if (res.status == 2) {
  //       this.is_member = false;
  //       this.commonService.showToast(res.msg);
  //     }
  //   });
  // }

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

public onLeaveClick() {
  this.commonService.showConfirm("", 'Are you sure you want to leave this group ?', () => this.leaveGroup());
}

public leaveGroup(): void {
  this.groupWallService.leaveGroup(this.wallId).subscribe((res) => {
    if (res.status == 2) {
      this.is_member = false;
      this.commonService.showToast(res.msg);
    }
  });
}

onGroupClick() {
      this.navCtrl.push(GroupsPage, { wallId: this.scdId });
}

onEventsClick() {
  this.navCtrl.push(EventsPage);
}

onInviteFriends() {
  this.navCtrl.push(InvitePage);
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
    this.ionicStorage.set('hideGroupWallOverlay', true);
    this.showOverlay = false;
  }
}