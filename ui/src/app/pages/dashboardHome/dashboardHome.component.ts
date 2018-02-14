import { Component, ViewEncapsulation, OnInit, ElementRef, AfterViewInit, ViewChildren } from '@angular/core';
import { BaCard } from '../../theme/components';
import { GridDataService, PageService } from '../../theme/services';
import { Router, RouteParams, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { YoutubeSafeUrlPipe } from '../../theme/pipes/youtube-safe-url';
import { ProfileAssetDetailsComponent } from '../profileAssetDetails';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'dashboardHome',
    pipes: [TimeAgoPipe, DateFormatPipe, YoutubeSafeUrlPipe],
    directives: [BaCard, RouterOutlet, RouterLink, ROUTER_DIRECTIVES, TOOLTIP_DIRECTIVES, ProfileAssetDetailsComponent],
    template: require('./dashboardHome.html'),
    host: { 'class': 'ng-animate page1Container' }
})

export class DashboardHome implements OnInit {
    @ViewChildren('cmp') components;
    private _dataUrl = '/api/user/profile/full';
    private _dataUrlskills = '/api/skill/getuserskills';
    private _dataUrlProfileDetail = '/api/user/dashboard/getProfileData';
    private _dataUrlProfile = '/api/user/getProfileData';
    private _photosVideosDetail = '/api/post/postById';
    private _dataProfileByUser = 'api/user/getUserProfileData/';
    public _addFriendUrl = '/api/user/addFriend';
    public _addFriendNotification = '/api/notification/addNotification/';
    public _dataUrlCancelFriend = '/api/user/cancelFriend';
    private _dataUrladdFollower = 'api/user/addFollower/';
    private _dataUrlUnFollow = 'api/user/unFollow/';
    public elementRef: ElementRef;
    private _router;
    public userData;
    public postid;
    public dialogState = false;
    public user;
    public profilepercent = 0;
    public media = [];
    public photoData = [];
    public videoData = [];
    public studentUser = {};
    public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
    private post_type = {
        SENDREQ: 0,
    };
    public msg: string;
    router: Router;
    public currentUserId: number;
    public skills = [];
    public subscriber: any = null;

    constructor(private sanitizer: DomSanitizationService, private dataService: GridDataService, private page: PageService, router: Router, routeParams: RouteParams, elementRef: ElementRef) {
        this.elementRef = elementRef;
        this.router = router;
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.getUserProfile();
        this.getUserProfileData();
        this.getUserPhotosVideos();
        this.getUserSkills();
        this.page.friendProfileId = '';
        this.page.wallId = '';
    }

    safeUrl(url) {
        var SafeUrl: SafeResourceUrl;
        SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return SafeUrl;
    }

    getUserProfile() {
        this.dataService.getData(this._dataUrl).subscribe(user => {
            this.user = user;
            var profilepercent = 0;
            if (user.college.length > 0) profilepercent++;
            if (user.subjects.length > 0) profilepercent++;
            if (user.degree.length > 0) profilepercent++;
            if (user.photo != '' && user.photo != null && typeof (user.photo) != "undefined") profilepercent++;
            this.dataService.getData(this._dataUrlskills).subscribe(skill => {
                if (skill['data'].length > 0) {
                    profilepercent++;
                    this.profilepercent = profilepercent * 20;
                }
            });
        });
    }

    mytoggle() {
        this.page.chatToggleGlobal = !this.page.chatToggleGlobal;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = this.page.chatToggleGlobal == true ? body.attr("class", "hold-transition skin-yellow-light sidebar-mini get-freeze") : body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
    }

    getUserProfileData() {
        this.dataService.getData(this._dataUrlProfileDetail).subscribe(res => {
            this.userData = res;
        });
    }
    getUserSkills() {
        this.dataService.getData(this._dataUrlProfile).subscribe(res => {
            if (res.skills.length) {
                this.skills = res.skills;
            }
        });
    }

    getUserPhotosVideos() {
        this.dataService.getData(this._photosVideosDetail).subscribe(media => {
            this.media = media.data;
            this.photoData = media.data.photo;
            this.videoData = media.data.video;
        });
    }

    getSubjectWall(id) {
        this.page.wallId = id;
        this.router.navigate(['SubjectWallComponent', { subjectId: id }]);
    }

    getCollegeWall(id) {
        this.page.wallId = id;
        this.router.navigate(['CollegeWall', { collegeId: id }]);
    }

    getDegreeWall(id) {
        this.page.wallId = id;
        this.router.navigate(['BachelorView', { degreeId: id }]);
    }

    getProfileById(id) {
        if (this.page.userIdGlobal == id) {
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else {
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }

    getDetailView(id) {
        this.postid = id;
        this.dialogState = true;
        jQuery("#profileAssetImgModal").modal({ backdrop: false });
    }

    public getDetailVideoView(id): void {
        this.postid = id;
        this.dialogState = true;
        for (let i = 0; i < this.components._results.length; i++) {
            let startIndex = this.components._results[i].nativeElement.currentSrc.lastIndexOf('-');
            let endIndex = this.components._results[i].nativeElement.currentSrc.lastIndexOf('.');
            let postId = this.components._results[i].nativeElement.currentSrc.slice(startIndex + 1, endIndex);
            if (postId == id) {
                this.components._results[i].nativeElement.pause();
            }
        }
        jQuery("#profileAssetImgModal").modal({ backdrop: false });
    }

    updateId(postId) {
        this.postid = postId;
        this.dialogState = true;
        jQuery("#profileAssetImgModal").modal({ backdrop: false });
    }
    closeStateDialog() {
        this.dialogState = false;
    }

    getTimelineProfileById(post_type) {
        this.page.friendProfileId = this.page.userIdGlobal;
        this.router.navigate(['UserProfile', { userId: this.page.userIdGlobal, post_type: post_type }]);
    }

    /*****************************User PopUp ************************/

    UserPopupOpen(e, _id) {
        this.currentUserId = _id;
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
        this.subscriber = this.dataService.getData(this._dataProfileByUser + this.currentUserId).subscribe(user => {
            this.studentUser = user;
        });
    }

    addAsFriend(studentUser) {
        this.addFriendTitle.recepient = studentUser;
        this.dataService.getData(this._addFriendUrl + "/" + this.currentUserId)
            .subscribe(res => {
                if (res.status == 2) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request sent</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    studentUser.current_friends_status_code = 1;
                    this.dataService.postData(this._addFriendNotification + this.currentUserId + '/' + this.post_type.SENDREQ, this.addFriendTitle).subscribe(res => {
                    });
                }
                else {
                    studentUser.current_friends_status_code = res.friendStatus;
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + res.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                }
            });
    }
    cancelRequestedFriend(studentUser) {
        this.dataService.getData(this._dataUrlCancelFriend + "/" + this.currentUserId).subscribe(friends => {
            if (friends.status == 2) {
                studentUser.current_friends_status_code = 6;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request Cancelled</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
            else {
                studentUser.current_friends_status_code = friends.friendStatus;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + friends.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        });
    }
    getFriendList() {
        this.router.navigate(['UserList']);
    }
    setFollow(studentUser) {
        this.studentUser = studentUser;
        this.dataService.getData(this._dataUrladdFollower + this.currentUserId).subscribe(res => {
            if (res.status == 2) {
                this.msg = res.msg;
                this.studentUser['followersCount'] = res.followersCount;
                this.studentUser['followers'] = res.followers;
                studentUser.following_friend_status_code = 3;
            } else this.msg = 'error';
        });
    }
    setUnFollow(studentUser) {
        this.studentUser = studentUser;
        this.dataService.getData(this._dataUrlUnFollow + this.currentUserId).subscribe(res => {
            if (res.status == 2) {
                this.msg = res.msg;
                this.studentUser['followersCount'] = res.followersCount;
                this.studentUser['followers'] = res.followers;
                studentUser.following_friend_status_code = 6;
            } else this.msg = 'error';
        });
    }
    public onClickEditSkills(){
        this.router.navigate(['Settings',{tab:5}])
    }
}