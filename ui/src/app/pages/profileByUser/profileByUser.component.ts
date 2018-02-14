import { Component, OnInit, ElementRef, Input, ViewChildren } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated'
import { NgClass } from '@angular/common';
import { GridDataService, PageService } from '../../theme/services';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser'
import { YoutubeSafeUrlPipe } from '../../theme/pipes/youtube-safe-url';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { ProfileAssetFriendDetailsComponent } from '../profileAssetFriendDetails';
import { TextFormattingPipe, DateTime, documentNameFilterPipe, LikeFilterPipe, FollowUnfollowStatus} from '../../theme/pipes';
import { nameFilterPipe } from '../../theme/pipes/name-filter';
import { BaPostShareModel } from '../../theme/components/baPostShareModel';
import { lengthFilterPipe } from '../../theme/pipes/length-filter';
import { Post, PostComment, MyWallSearch, SearchData } from '../../theme/interfaces';
import { MyWallService } from '../myWall/myWall.service';
import { BaPostExternalShareModel } from '../../theme/components/baPostExternalShareModal';
import { EventWallService } from '../eventWall/eventWall.service';
import { AddPostToJournalModal, LikeMemberListComponent } from '../../theme/components';
import { Angular2AutoScroll } from 'angular2-auto-scroll/lib/angular2-auto-scroll.directive';
import { EmbedDirective } from "../embedVideo";
import { reportInfoComponent } from  '../../theme/components/reportInfo';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'data-profile',
    template: require('./profileByUser.html'),
    pipes: [documentNameFilterPipe, LikeFilterPipe, DateTime, FollowUnfollowStatus, lengthFilterPipe, nameFilterPipe, DateFormatPipe, YoutubeSafeUrlPipe, TimeAgoPipe, CalendarPipe, TextFormattingPipe],
    host: { 'class': 'ng-animate page1Container' },
    providers: [MyWallService, EventWallService],
    directives: [RouterOutlet,reportInfoComponent, EmbedDirective, BaPostExternalShareModel, LikeMemberListComponent, RouterLink, ROUTER_DIRECTIVES, TOOLTIP_DIRECTIVES, ProfileAssetFriendDetailsComponent, BaPostShareModel, AddPostToJournalModal, Angular2AutoScroll],
})

export class ProfileByUserComponent {
    @ViewChildren('cmp') components;
    private deletePostUrl = "/api/post/deleteTimelinePost";
    private _dataUrlProfileByUser = 'api/user/getUserProfileData/';
    private _getPostByPostId = '/api/post/post/';
    private _dataUrladdFollower = 'api/user/addFollower/';
    private _dataUrlUnFollow = 'api/user/unFollow/';
    private _addFriendUrl = '/api/user/addFriend';
    private _getUnblockedFriendsUrl = '/api/user/unblockFriend';
    private _getblockedFriendsUrl = '/api/user/blockFriend';
    private _dataUrlCancelFriend = '/api/user/cancelFriend';
    private _dataUrlApproveFriend = 'api/user/approveFriend';
    private _dataUrlTimeline = '/api/event/getfriendtimeline/';
    private _dataUrlpost = '/api/post/getfriendpost/';
    private _dataUrlAllpost = '/api/post/getfriendAllpost/';
    private _addShareUrl = '/api/post/shareOnTimeline/';
    private _dataUrlendorseSkill = '/api/skill/endorseSkill/';
    private _dataUrlSkill = '/api/user/getUserSkills/';
    private _headerDataUrl = '/api/user/getHeaderData';
    private _createJournal = '/api/journal/createJournal';
    private _getAllJournalByUserId = '/api/journal/getAllJournalByUserId/';
    private _getAllPostByJournalId = '/api/journal/getAllPostByJournalId/';
    private _addPostInJournal = '/api/journal/addPostInJournal/';
    private _addFriendNotification = '/api/notification/addNotification/';
    private _addEndorseNotification = '/api/notification/addNotification/';
    private _dataAddAnswer = '/api/post/addAnswer/';
    private _deleteAnswer = '/api/post/deleteAnswer/';
    private _getAllJournalByPostId = '/api/journal/getAllJournalByPostId/';
    private deleteSubjectPostUrl = "/api/post/delete";
    private deleteDegreePostUrl = "/api/degree_post/delete";
    private deleteCollegePostUrl = "/api/college_post/delete";
    private _dataProfileByUser = 'api/user/getUserProfileData/';
    private _getFriendSearchSubject = 'api/subject/getFriendSearchSubject/';
    private _getFriendSearchCollege = 'api/college/getFriendSearchCollege/';
    private _getFriendSearchDegree = 'api/degree/getFriendSearchDegree/';
    private _dataAddComment = '/api/post/addComment/';
    private _deleteComment = '/api/post/deleteComment/';
    private _dataAddLike = '/api/post/addLike/';
    private _friendListUrl = '/api/user/getAllTypeFriends';
    private _getUserStatusUrl = '/api/user/checkUserStatus';
    public postid;
    public dialogState = false;
    public user;
    public errorMessage: string;
    public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
    public relatedJournal;
    public addEndorseTitle = { title: 'added skill' };
    public JournalByUserId;
    public JournalByJournalId;
    public title = { title: '' };
    public description = { description: '' };
    public journal_id;
    public post_id;
    public select_journal = 'Select Journal';
    public postComment: Array<PostComment> = [];
    public togCommentPost: boolean = false;
    public togglePostComment: Array<boolean> = [];
    public errorCommentPost: string = null;
    public delcommentIndex: string = null;
    public prevComment: Array<any> = [];
    public oldComment: Array<any> = [];
    public thisPostElement: number;
    public postLike = { post_id: "" };
    public shared;
    public data;
    public userData;
    public friendCount = 0;
    public followingCount;
    public followerCount;
    public userId;
    public msg: string;
    public timelinedata: Array<any> = [];
    public postdata: Array<any> = [];;
    public counterList = 0;
    public counterListPost = 0;
    public counterListTimeline = 0;
    public total_timeline;
    public scrollController;
    public scrollControllerPost;
    public scrollControllerTimeline;
    public total_result;
    public total_post;
    public tActivity = false;
    public tDashboard = false;
    public tTimeline = false;
    public tPhoto = false;
    public tVideo = false;
    public tAudio = false;
    public tDocument = false;
    public tLink = false;
    public tQuestion = false;
    public postdataAll: Array<any> = [];
    router: Router;
    public initialPageStatus: boolean = true;
    public endorsedata = { skill: null, user_id: '', type: '' };
    public postAnswer = { post_id: "", answer: "" };
    public postAnswerDiscription = [];
    public errorAnswerPost;
    public skills;
    public lu;
    private post_type = {
        SENDREQ: 0,
        SKILLNOTIFY: 4,
    };
    public parset;
    public parsep;
    public parsev;
    public modal_post_id;
    public modal_comment_id;
    public modal_answer_post_id;
    public modal_answer_id;
    public elementRef: ElementRef;
    public tab_post_type;
    public create_journal = "Add New Journal";
    public openJournal: boolean = false;
    public journalmodalclose: boolean = true;
    public togClass = [];
    public modal_likes_post_id;
    public modal_likes_index;
    public modal_likes_posts = {};
    public shareCustomData;
    public shareVisibility_status = 1;
    public wallStatus: boolean = false;
    public selectionOfSharing: number = 1;
    public friends: any;
    public friendsName: any;
    public customPostId: any = [];
    public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, custom: [], shareCustom: [] };
    public postDeleteData = { postId: '', wallId: '', wallType: '' };
    public postDeleteIndex: number = null;
    /************  share post variable  **********************/
    public showPostShareModel: boolean = false;
    public sharePostData: any = null;
    public showPostExternalShareModel: boolean = false;
    public sharing: Array<boolean> = [];
    public loader: boolean = false;
    public timeLoader: boolean = false;
    /**Searching */
    public searchData: MyWallSearch = new MyWallSearch();
    public searchedSubjectsList: Array<any> = [];
    public searchedCollegesList: Array<any> = [];
    public searchedDegreesList: Array<any> = [];
    public postSearchData: SearchData = new SearchData();
    public searchCounter: number = 0;
    public searchActive: boolean = false;
    public addEditorView: Array<any> = [];
    public editEditorView: any = null;
    public currentUserId: number;
    public studentUser = {};
    public postType: number;
    public subscriber: any = null;
    public searchId: number = null;
    public searchStatus: boolean = false;
    public showFilterText: string = '';
    public addPostToJournal: boolean = false;
    public likeData: Array<any> = [];
    public likeMemberList: boolean = false;
    public isUserBlocked: boolean = false;
    public addReportInfo: boolean = false;
    constructor(private sanitizer: DomSanitizationService,
        private dataService: GridDataService,
        private mywallservice: MyWallService,
        private service: EventWallService,
        private page: PageService, routeParams: RouteParams, router: Router, elementRef: ElementRef) {
        this.userId = routeParams.get('userId');
        this.router = router;
        if ((routeParams.get('post_type')) != null) {
            this.tab_post_type = routeParams.get('post_type');
        }
        this.page.wallId = '';
        this.counterList = 0;
        this.counterListPost = 0;
        this.counterListTimeline = 0;
        this.elementRef = elementRef;
        this.getUserStatus();
        this.page.getOnUserFollow().subscribe((res) => {
            if (res) {
                this.dataService.getData(this._dataUrlProfileByUser + this.userId).subscribe(user => {
                    this.user = user;
                    this.skills = user.skills;
                    this.page.userdetails = user.userDetails;
                    this.showskills();
                });
            }
        })
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.getUserProfile();
        this.counterList = 0;
        this.counterListPost = 0;
        this.counterListTimeline = 0;
        this.scrollController = 1;
        this.scrollControllerPost = 1;
        this.scrollControllerTimeline = 1;
        if (this.tab_post_type != null) {
            this.counterList = 0;
            this.initialPageStatus = false;
            this.tDashboard = true;
            this.dataService.getData(this._dataUrlpost + this.userId + "/" + this.tab_post_type + "/" + this.counterList).subscribe(user => {
                this.postdata = user.data;
                this.total_result = user.total_result;
                this.lu = user.isResult;
            });
            if (this.tab_post_type == 1) {
                this.tTimeline = true;
                this.tDashboard = this.tAudio = this.tPhoto = this.tActivity = this.tVideo = this.tLink = this.tDocument = this.tQuestion = false;
                this.getUserTimeline();
            }
        }
    }

    public getUserStatus(): void {
        this.dataService.getData(this._getUserStatusUrl + '/' + this.userId).subscribe((res) => {
            if (res.status == 2) {
                this.isUserBlocked = res.isBlocked;
            }
        });
    }

    shareVisibility(visible, post) {
        this.shareCustomData = post;
        this.shareVisibility_status = visible;
        if (visible == 1) {
            jQuery("#shareOptions1_" + post._id).hide();
            this.wallStatus = false;
        }
        else
            if (visible == 2) {
                jQuery("#shareOptions1_" + post._id).hide();
                this.wallStatus = false;
            }
            else
                if (visible == 3) {
                    jQuery("#shareOptions1_" + post._id).hide();
                    this.wallStatus = false;
                }
                else
                    if (visible == 4) {
                        jQuery("#shareOptions1_" + post._id).hide();
                        this.wallStatus = false;
                    }
                    else
                        if (visible == 6) {
                            jQuery("#shareOptions1_" + post._id).hide();
                            this.wallStatus = false;
                        }
                        else
                            if (visible == 5) {
                                jQuery("#shareOptions1_" + post._id).hide();
                                this.wallStatus = false;
                                this.dataService.getData(this._friendListUrl)
                                    .subscribe(user => {
                                        this.friends = user.data;
                                        this.friendsName = this.friends.current;
                                        jQuery("#friendlist").modal({ backdrop: false });
                                    });
                            }
        if (visible != 5) {
            this.data = post;
            this.dataService.postData(this._addShareUrl + post.types + '/' + post.post_type + '/' + this.shareVisibility_status + '/' + post._id, this.message).subscribe(share => {
                if (share.status == 2) {
                    this.data.share.splice(0, 0, share['data'].share);
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Post shared on your timeline</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
                } else {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Post already shared</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
                }
            });
        }
    }

    shareCheckboxValue(ids) {
        if (jQuery.inArray(ids, this.customPostId) == -1) {
            this.customPostId.push(ids);
            this.message.shareCustom.push({ custom_id: ids });
        }
        else {
            this.customPostId.pop(ids);
            let index = this.customPostId.indexOf(ids);
            this.message.shareCustom.splice(index);
        }
    }

    checkboxValue(ids) {
        if (jQuery.inArray(ids, this.customPostId) == -1) {
            this.customPostId.push(ids);
            this.message.custom.push({ custom_id: ids });
        }
        else {
            this.customPostId.pop(ids);
            let index = this.customPostId.indexOf(ids);
            this.message.custom.splice(index);
        }
    }

    shareCustomPost() {
        let post = this.shareCustomData;
        this.data = post;
        this.dataService.postData(this._addShareUrl + post.types + '/' + post.post_type + '/' + this.shareVisibility_status + '/' + post._id, this.message).subscribe(share => {
            if (share.status == 2) {
                this.data.share.splice(0, 0, share['data'].share);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Post shared on your timeline</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Post already shared</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
            }
        });
    }
    safeUrl(url) {
        var SafeUrl: SafeResourceUrl;
        SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return SafeUrl;
    }

    getUserProfile() {
        this.dataService.getData(this._dataUrlProfileByUser + this.userId).subscribe(user => {
            this.user = user;
            this.skills = user.skills;
            this.page.userdetails = user.userDetails;
            this.showskills();
        });
        this.tDashboard = true;
        this.tTimeline = this.tActivity = this.tPhoto = this.tAudio = this.tVideo = this.tLink = this.tDocument = this.tQuestion = false;
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

    endorseSkill(id, type) {
        this.endorsedata.skill = id;
        this.endorsedata.type = type;
        this.endorsedata.user_id = this.page.friendProfileId;
        this.dataService.postData(this._dataUrlendorseSkill, this.endorsedata).subscribe(res => {
            if (res.status == 2) {
                this.dataService.postData(this._addEndorseNotification + this.endorsedata.user_id + '/' + this.post_type.SKILLNOTIFY, this.addEndorseTitle).subscribe(res => {
                });
                this.getSkillsonEndorse();
            } else this.msg = 'error';
        });
    }

    getUserTimeline() {
        this.tTimeline = true;
        this.tDashboard = this.tActivity = this.tPhoto = this.tAudio = this.tVideo = this.tLink = this.tDocument = this.tQuestion = false;
        this.timeLoader = true;
        this.clearCommentToggleVariable();
        this.togCommentPost = false;
        this.thisPostElement = null;
        this.counterListTimeline = 0;
        if (!this.searchActive) {
            this.dataService.getData(this._dataUrlTimeline + this.counterListTimeline + '/' + this.userId).subscribe(user => {
                this.timelinedata = user.data;
                this.timeLoader = false;
                for (var i = 0; i < this.timelinedata.length; i++) {
                    this.togClass.push('true');
                }
                this.total_timeline = user.total_timeline;
            });
        } else {
            this.searchPost();
        }
    }

    onScrollListTimeline(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#timeline').css('display') !== 'none')) {
            if (!this.searchActive) {
                if (this.scrollControllerTimeline) {
                    this.scrollControllerTimeline = 0;
                    this.parset = this.total_timeline / 10;
                    var page = parseInt(this.parset);
                    if (this.counterListTimeline <= (page + 1)) {
                        this.counterListTimeline++;
                        this.dataService.getData(this._dataUrlTimeline + this.counterListTimeline + '/' + this.userId).subscribe(user => {
                            this.timelinedata = this.timelinedata.concat(user.data);
                            for (var i = 0; i < this.timelinedata.length; i++) {
                                this.togClass.push('true');
                            }
                            this.scrollControllerTimeline = 1;
                        });
                    }
                }
            } else {
                if (this.scrollControllerTimeline) {
                    this.filterData();
                    this.scrollControllerTimeline = 0;
                    this.parsep = this.total_timeline / 10
                    var page = parseInt(this.parsep);
                    if (this.searchCounter <= (page + 1)) {
                        this.searchCounter++;
                        this.mywallservice.friendTimelineSearch(this.postSearchData, this.searchCounter, this.userId).subscribe((res) => {
                            if (res.status == 2) {
                                if (res.data) {
                                    this.timelinedata = this.timelinedata.concat(res.data);
                                }
                                for (var i = 0; i < this.timelinedata.length; i++) {
                                    this.togClass.push('true');
                                }
                                this.postSearchData = new SearchData();
                            }
                            this.scrollControllerTimeline = 1;
                        });
                    }
                }
            }
        }
    }

    getFoldername(type) {
        if (type == 1) return "Subject";
        if (type == 2) return "College";
        if (type == 3) return "Degree";
        if (type == 5) return "Timeline";
        if (type == 6) return "GroupWall";
    }

    getclassList(user) {
        if (user.friend_id) {
            return "fa fa-user bg-aqua";
        } else if (user.post_id) {
            if (user.post_id.photo[0]) return "fa fa-camera bg-purple";
            else if (user.post_id.document[0]) return "fa fa-paperclip bg-green";
            else if (user.post_id.audio[0]) return "fa fa-music bg-purple";
            else if (user.post_id.video[0]) return "fa fa-video-camera bg-purple";
            else return "fa fa-envelope bg-blue";
        } else {
            return "";
        }
    }

    getUserPost(post_type) {
        if (post_type == 2) {
            this.tQuestion = true;
            this.tDashboard = this.tTimeline = this.tPhoto = this.tAudio = this.tVideo = this.tLink = this.tDocument = this.tActivity = false;
        } else if (post_type == 3) {
            this.tPhoto = true;
            this.tDashboard = this.tTimeline = this.tActivity = this.tAudio = this.tVideo = this.tLink = this.tDocument = this.tQuestion = false;
        } else if (post_type == 4) {
            this.tVideo = true;
            this.tDashboard = this.tTimeline = this.tPhoto = this.tAudio = this.tActivity = this.tLink = this.tDocument = this.tQuestion = false;
        } else if (post_type == 5) {
            this.tLink = true;
            this.tDashboard = this.tTimeline = this.tPhoto = this.tAudio = this.tVideo = this.tActivity = this.tDocument = this.tQuestion = false;
        }
        else if (post_type == 6) {
            this.tAudio = true;
            this.tDashboard = this.tTimeline = this.tPhoto = this.tActivity = this.tVideo = this.tLink = this.tDocument = this.tQuestion = false;
        } else if (post_type == 7) {
            this.tDocument = true;
            this.tDashboard = this.tTimeline = this.tPhoto = this.tAudio = this.tVideo = this.tLink = this.tActivity = this.tQuestion = false;
        }
        this.postType = post_type;
        this.counterList = 0;
        this.loader = true;
        if (!this.searchActive) {
            this.dataService.getData(this._dataUrlpost + this.userId + "/" + post_type + "/" + this.counterList).subscribe(user => {
                this.postdata = user.data;
                this.loader = false;
                this.total_result = user.total_result;
                this.lu = user.isResult;
            });
        } else {
            this.searchPost();
        }
    }

    onScrollList(event, post_type) {
        if (!this.searchActive) {
            if (post_type == 3) {
                if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#photos').css('display') !== 'none')) {
                    if (this.scrollController) {
                        this.scrollController = 0;
                        this.parsev = this.total_result / 10;
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + this.userId + "/" + post_type + "/" + this.counterList).subscribe(user => {
                                this.postdata = this.postdata.concat(user.data);
                                this.scrollController = 1;
                            });
                        }
                    }
                }
            }
            else if (post_type == 2) {
                if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#questions').css('display') !== 'none')) {
                    if (this.scrollController) {
                        this.scrollController = 0;
                        this.parsev = this.total_result / 10;
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + this.userId + "/" + post_type + "/" + this.counterList).subscribe(user => {
                                this.postdata = this.postdata.concat(user.data);
                                this.scrollController = 1;
                            });
                        }
                    }
                }
            }
            else if (post_type == 4) {
                if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#videos').css('display') !== 'none')) {
                    if (this.scrollController) {
                        this.scrollController = 0;
                        this.parsev = this.total_result / 10;
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + this.userId + "/" + post_type + "/" + this.counterList).subscribe(user => {
                                this.postdata = this.postdata.concat(user.data);
                                this.scrollController = 1;
                            });
                        }
                    }
                }
            }
            else if (post_type == 5) {
                if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#links').css('display') !== 'none')) {
                    if (this.scrollController) {
                        this.scrollController = 0;
                        this.parsev = this.total_result / 10;
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + this.userId + "/" + post_type + "/" + this.counterList).subscribe(user => {
                                this.postdata = this.postdata.concat(user.data);
                                this.scrollController = 1;
                            });
                        }
                    }
                }
            }
            else if (post_type == 6) {
                if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#audios').css('display') !== 'none')) {
                    if (this.scrollController) {
                        this.scrollController = 0;
                        this.parsev = this.total_result / 10;
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + this.userId + "/" + post_type + "/" + this.counterList).subscribe(user => {
                                this.postdata = this.postdata.concat(user.data);
                                this.scrollController = 1;
                            });
                        }
                    }
                }
            }
            else if (post_type == 7) {
                if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#documents').css('display') !== 'none')) {
                    if (this.scrollController) {
                        this.scrollController = 0;
                        this.parsev = this.total_result / 10;
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + this.userId + "/" + post_type + "/" + this.counterList).subscribe(user => {
                                this.postdata = this.postdata.concat(user.data);
                                this.scrollController = 1;
                            });
                        }
                    }
                }
            }
        } else {
            if (this.scrollController) {
                this.filterData();
                this.scrollController = 0;
                this.parsev = this.total_result / 10;
                var page = parseInt(this.parsev);
                this.loader = true;
                if (this.counterList <= (page + 1)) {
                    this.counterList++;
                    this.mywallservice.friendSearchPost(this.postSearchData, this.userId, post_type, this.searchCounter).subscribe((res) => {
                        this.loader = false;
                        if (res.status == 2) {
                            if (res.data) {
                                this.postdata = this.postdata.concat(res.data);
                            }
                            this.total_result = res.total_result;
                            this.postSearchData = new SearchData();
                        }
                    });
                }
            }
        }
    }

    getFriendPost() {
        this.tActivity = true;
        this.tDashboard = this.tTimeline = this.tPhoto = this.tAudio = this.tVideo = this.tLink = this.tDocument = this.tQuestion = false;
        this.loader = true;
        this.clearCommentToggleVariable();
        this.timelinedata = null;
        this.togCommentPost = false;
        this.thisPostElement = null;
        this.counterListPost = 0;
        if (!this.searchActive) {
            this.dataService.getData(this._dataUrlAllpost + this.userId + "/" + this.counterListPost).subscribe(user => {
                this.postdataAll = user.data;
                this.loader = false;
                for (var i = 0; i < this.postdataAll.length; i++) {
                    this.togClass.push('true');
                }
                this.total_post = user.total_post;
                this.lu = user.result;
            });
        } else {
            this.searchPost();
        }
    }

    onScrollListPost(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#activity').css('display') !== 'none')) {
            if (!this.searchActive) {
                if (this.scrollControllerPost) {
                    this.scrollControllerPost = 0;
                    this.parsep = this.total_post / 10;
                    var page = parseInt(this.parsep);
                    if (this.counterListPost <= (page + 1)) {
                        this.counterListPost++;
                        this.dataService.getData(this._dataUrlAllpost + this.userId + "/" + this.counterListPost).subscribe(AllPost => {
                            this.postdataAll = this.postdataAll.concat(AllPost.data);
                            for (var i = 0; i < this.postdataAll.length; i++) {
                                this.togClass.push('true');
                            }
                            this.scrollControllerPost = 1;
                        });
                    }
                }
            } else {
                if (this.scrollControllerPost) {
                    this.filterData();
                    this.scrollControllerPost = 0;
                    this.parsep = this.total_post / 10
                    var page = parseInt(this.parsep);
                    if (this.searchCounter <= (page + 1)) {
                        this.searchCounter++;
                        this.mywallservice.friendPostSearch(this.postSearchData, this.userId, this.searchCounter).subscribe((res) => {
                            if (res.status == 2) {
                                if (res.data) {
                                    this.postdataAll = this.postdataAll.concat(res.data);
                                }
                                for (var i = 0; i < this.postdataAll.length; i++) {
                                    this.togClass.push('true');
                                }
                                this.postSearchData = new SearchData();
                            }
                            this.scrollControllerPost = 1;
                        });
                    }
                }
            }
        }
    }

    setFollow(user) {
        this.user = user;
        this.dataService.getData(this._dataUrladdFollower + this.userId).subscribe(res => {
            if (res.status == 2) {
                this.msg = res.msg;
                this.user.followersCount = res.followersCount;
                this.user.followers = res.followers;
                user.following_friend_status_code = 3;
            } else this.msg = 'error';
            this.page.setOnUserFollow(true);
        });
    }

    setUnFollow(user) {
        this.user = user;
        this.dataService.getData(this._dataUrlUnFollow + this.userId).subscribe(res => {
            if (res.status == 2) {
                this.msg = res.msg;
                this.user.followersCount = res.followersCount;
                this.user.followers = res.followers;
                user.following_friend_status_code = 6;
            } else this.msg = 'error';
            this.page.setOnUserFollow(true);
        });
    }

    getSubjectWall(id) {
        this.page.wallId = id;
        this.page.join = 0;
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            for (var i = 0; i < header.data.subjects.length; i++) {
                if (header.data.subjects[i].subject_id._id == id) {
                    this.page.join = 1;
                }
            }
        });
        this.router.navigate(['SubjectWallComponent', { subjectId: id }]);
    }

    getCollegeWall(id) {
        this.page.wallId = id;
        this.page.join = 0;
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            for (var i = 0; i < header.data.college.length; i++) {
                if (header.data.college[i].college_id._id == id) {
                    this.page.join = 1;
                }
            }
        });
        this.router.navigate(['CollegeWall', { collegeId: id }]);
    }

    getDegreeWall(id) {
        this.page.wallId = id;
        this.page.join = 0;
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            for (var i = 0; i < header.data.degree.length; i++) {
                if (header.data.degree[i].degree_id._id == id) {
                    this.page.join = 1;
                }
            }
        });
        this.router.navigate(['BachelorView', { degreeId: id }]);
    }

    getFriendListPage() {
        this.router.navigate(['UserList']);
    }

    addAsFriend(user) {
        this.addFriendTitle.recepient = user;
        this.dataService.getData(this._addFriendUrl + "/" + this.userId)
            .subscribe(res => {
                if (res.status == 2) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request sent</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    user.current_friends_status_code = 1;
                    this.dataService.postData(this._addFriendNotification + this.userId + '/' + this.post_type.SENDREQ, this.addFriendTitle).subscribe(noti => {
                    });
                }
                else {
                    user.current_friends_status_code = res.friendStatus;
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + res.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                }
            });
    }

    cancelRequestedFriend(user) {
        this.dataService.getData(this._dataUrlCancelFriend + "/" + this.userId).subscribe(friends => {
            if (friends.status == 2) {
                user.current_friends_status_code = 6;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request Cancelled</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
            else {
                user.current_friends_status_code = friends.friendStatus;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + friends.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        });
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

    initialPage() {
        this.initialPageStatus = false;
    }

    toggleComment(comments: any, post_Id: number) {
        this.oldComment[post_Id] = [];
        this.prevComment[post_Id] = [];
        this.oldComment[post_Id] = comments;
        this.postComment[post_Id] = new PostComment();
        this.errorCommentPost = "";
        for (var i = this.oldComment[post_Id].length - 10; i < this.oldComment[post_Id].length; i++) {
            if (i < this.oldComment[post_Id].length && typeof this.oldComment[post_Id][i] !== 'undefined') {
                this.prevComment[post_Id].push(this.oldComment[post_Id][i]);
            }
        }
        if (this.togglePostComment[post_Id]) {
            this.togglePostComment[post_Id] = false;
            this.addEditorView[post_Id].html('');
        } else {
            this.togglePostComment[post_Id] = true;
        }
        this.initEditor(post_Id);
    }

    loadPrevComment(post_id: number) {
        if (this.prevComment[post_id].length != this.oldComment[post_id].length) {
            var prevCommentLength = this.prevComment[post_id].length;
            for (var k = (this.oldComment[post_id].length - 1) - prevCommentLength; k > (this.oldComment[post_id].length - prevCommentLength) - 8; k--) {
                if (typeof this.oldComment[post_id][k] !== 'undefined') {
                    this.prevComment[post_id].unshift(this.oldComment[post_id][k]);
                }
            }
        }
    }

    toggleCommentPost(comments: any, post_Id: number) {
        this.oldComment[post_Id] = [];
        this.prevComment[post_Id] = [];
        this.oldComment[post_Id] = comments;
        this.postComment[post_Id] = new PostComment();
        this.errorCommentPost = "";
        for (var i = this.oldComment[post_Id].length - 10; i < this.oldComment[post_Id].length; i++) {
            if (i < this.oldComment[post_Id].length && typeof this.oldComment[post_Id][i] !== 'undefined') {
                this.prevComment[post_Id].push(this.oldComment[post_Id][i]);
            }
        }
        if (this.togglePostComment[post_Id]) {
            this.togglePostComment[post_Id] = false;
            this.addEditorView[post_Id].html('');
        } else {
            this.togglePostComment[post_Id] = true;
        }
        this.initEditor(post_Id);
    }

    addPostJournal(user_id, Post_id) {
        this.post_id = Post_id;
        this.getJournalByUserId(user_id);
        jQuery("#add-post-journal").modal({ backdrop: false });
    }

    addJournalActivity(user_id, Post_id) {
        this.post_id = Post_id;
        this.getJournalByUserId(user_id);
        jQuery('.spin-wrap.vision-spin').fadeIn();
        this.dataService.getData(this._getAllJournalByPostId + Post_id).subscribe(res => {
            this.relatedJournal = res.data;
            jQuery('.spin-wrap.vision-spin').fadeOut();
            jQuery("#add-journal-activity").modal({ backdrop: false });
        });
    }

    //create journal
    createJournal() {
        this.dataService.postData(this._createJournal, this.title).subscribe(res => {
            this.JournalByUserId = this.JournalByUserId.concat(res.data);
            this.title.title = '';
            this.openJournal = false;
            this.select_journal = 'Select Journal';
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>New Journal Created.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        });
    }

    cleanJournal() {
        this.description.description = '';
        this.select_journal = 'Select Journal';
        this.openJournal = false;
    }
    cancelJournal() {
        this.openJournal = false;
        this.select_journal = 'Select Journal';
    }

    openJournla(value) {
        this.openJournal = value;
        this.select_journal = 'Add Journal'
        this.journalmodalclose = false;
    }

    //post journal
    addPostInJournal() {
        if (this.journal_id !== '' && this.journal_id != null && typeof (this.journal_id) !== 'undefined') {
            this.dataService.postData(this._addPostInJournal + this.post_id + '/' + this.journal_id, this.description).subscribe(res => {
                this.description.description = '';
                this.select_journal = 'Select Journal'
                this.journal_id = '';
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Journal Added.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                jQuery("#add-post-journal").modal('hide');
            });
        }
        else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please Select a Journal.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            this.description.description = '';
            this.select_journal = 'Select Journal'
        }
    }

    //get Journal By UserId
    getJournalByUserId(user_id) {
        this.dataService.getData(this._getAllJournalByUserId + user_id).subscribe(res => {
            this.JournalByUserId = res.data;
        });
    }

    saveJournalId(Journal_id, title) {
        this.select_journal = title;
        this.journal_id = Journal_id;
        this.openJournal = false;
    }

    //get All Post By JournalId
    getAllPostByJournalId(journal_id) {
        this.dataService.getData(this._getAllPostByJournalId + journal_id).subscribe(res => {
            this.JournalByJournalId = res.data;
        });
    }

    //add comment to post
    addComment(post_id, posts) {
        this.postComment[post_id].comment = this.addEditorView[post_id].html();
        this.postComment[post_id].post_id = post_id;
        let text = jQuery(this.postComment[post_id].comment).text();
        if (this.postComment[post_id].comment && text.trim()) {
            this.postComment[post_id].date = new Date();
            this.dataService.postData(this._dataAddComment, this.postComment[post_id])
                .subscribe(res => {
                    if (res['status'] === 2) {
                        posts.comments = res['data'];
                        this.oldComment[post_id] = [];
                        this.oldComment[post_id] = posts.comments;
                        this.errorCommentPost = "";
                        this.postComment[post_id] = new PostComment();
                        this.addEditorView[post_id].html('');
                        this.prevComment[post_id].push(res.data[res.data.length - 1]);
                        this.initEditor(post_id);
                    }
                });
        } else {
            this.errorCommentPost = "Field is required";
        }
    }

    // add question's answer
    addAnswer(post_id, posts) {
        this.postAnswer.post_id = post_id;
        this.postAnswer.answer = this.postAnswerDiscription[post_id];
        if (this.postAnswer.answer != '' && this.postAnswer.answer != null) {
            this.dataService.postData(this._dataAddAnswer, this.postAnswer)
                .subscribe(res => {
                    if (res['status'] === 2) {
                        posts.answer = res['data'];
                        this.errorAnswerPost = "";
                        this.postAnswer.answer = null;
                        this.postAnswerDiscription[post_id] = '';
                    }
                });
        } else {
            this.errorAnswerPost = "Field is required!";
        }
    }

    deleteCommentModel(post_id, comment_id, j) {
        this.modal_post_id = post_id;
        this.modal_comment_id = comment_id;
        this.delcommentIndex = j;
        jQuery("#commentDeleteModal").modal({ backdrop: false });
    }

    deleteComment(posts) {
        this.dataService.getData(this._deleteComment + this.modal_post_id + '/' + this.modal_comment_id)
            .subscribe(res => {
                if (res['status'] === 2) {
                    posts.comments = res['data'];
                    this.oldComment[this.modal_post_id] = [];
                    this.oldComment[this.modal_post_id] = posts.comments;
                    this.postComment[this.modal_post_id] = new PostComment();
                    this.prevComment[this.modal_post_id].splice(this.delcommentIndex, 1);
                    this.page.showSuccess(res.msg);
                }
            });
    }

    deleteAnswerModel(post_id, answer_id) {
        this.modal_answer_post_id = post_id;
        this.modal_answer_id = answer_id;
        jQuery("#answerDeleteModal").modal({ backdrop: false });
    }

    deleteAnswer(posts) {
        this.dataService.getData(this._deleteAnswer + this.modal_answer_post_id + '/' + this.modal_answer_id)
            .subscribe(res => {
                if (res['status'] === 2) {
                    posts.answer = res['data'];
                    this.postAnswer.answer = null;
                    this.postAnswerDiscription[this.modal_answer_post_id] = '';
                }
            });
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

    closeStateDialog(post_id) {
        this.dialogState = false;
        this.dataService.getData(this._getPostByPostId + post_id).subscribe(post => {
            if (this.timelinedata.length) {
                for (var i = 0; i < this.timelinedata.length; i++) {
                    if (this.timelinedata[i].post_id) {
                        if (this.timelinedata[i].post_id._id == post_id) {
                            this.timelinedata[i].post_id = post[0];
                        }
                    }
                }
            }
            if (this.postdataAll.length) {
                for (var j = 0; j < this.postdataAll.length; j++) {
                    if (this.postdataAll[j]._id == post_id) {
                        this.postdataAll[j] = post[0];
                    }
                }
            }
        });
    }

    addLike(post_id, posts, j) {
        this.postLike.post_id = post_id;
        this.dataService.postData(this._dataAddLike, this.postLike)
            .subscribe(res => {
                if (res.status == 2) {
                    posts.likes = res.data;
                }
            });
    }

    mytoggle(id: number) {
        this.page.setChatUserId(id);
        this.page.chatToggleGlobal = !this.page.chatToggleGlobal;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = this.page.chatToggleGlobal == true ? body.attr("class", "hold-transition skin-yellow-light sidebar-mini get-freeze") : body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
    }

    deletePostModel(post, index) {
        this.postDeleteIndex = index;
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
        jQuery("#postDeleteModal").modal({ backdrop: false });
    }

    deletePostById() {
        this.dataService.postData(this.deletePostUrl, this.postDeleteData).subscribe(res => {
            if (res.status == 2) {
                this.timelinedata.splice(this.postDeleteIndex, 1);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Post has been deleted successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-error"><p>' + res['data'].message + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
        });
    }

    /**********   Share Post Methods  *************************/
    public onShareClick(post_Id: number): void {
        if (this.sharing[post_Id]) {
            this.sharing[post_Id] = false;
        } else {
            this.sharing[post_Id] = true;
        }
    }
    public share(postData: any): void {
        this.sharePostData = postData;
        this.sharing[postData._id] = false;
        jQuery("#postShareModel").modal({ backdrop: false });
        this.showPostShareModel = true;
    }
    public onPostShareModelClose(event: any): void {
        this.showPostShareModel = false;
        jQuery('#postShareModel').modal('hide');
        this.sharePostData = null;
    }

    public externalShare(postData: any): void {
        this.sharing[postData._id] = false;
        this.sharePostData = postData;
        jQuery("#postExternalShareModel").modal({ backdrop: false });
        this.showPostExternalShareModel = true;
    }
    public onExternalShareModelClose(event: any): void {
        this.showPostExternalShareModel = false;
        jQuery('#postExternalShareModel').modal('hide');
        this.sharePostData = null;
    }

    public clearCommentToggleVariable(): void {
        this.oldComment = [];
        this.prevComment = [];
        this.postComment = [];
        this.togglePostComment = [];
        this.errorCommentPost = null;
        this.delcommentIndex = null;
    }

    /**Searching*/
    closeSearchBox() {
        jQuery("#togglingSearch").toggle();
        jQuery("#changeClass").toggleClass('fa fa-plus', 'add');
        jQuery("#changeClass").toggleClass('fa fa-minus', 'remove');
    }

    public subjectSearch(e: any): void {
        this.searchData.college_name = '';
        this.searchData.degree_name = '';
        this.searchedCollegesList = [];
        this.searchedDegreesList = [];
        this.postSearchData.degreeIds = [];
        this.postSearchData.collegeIds = [];
        this.showFilterText = '';
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.subject_name) {
            if (this.searchData.subject_name.match(nameValid)) {
                this.dataService.getData(this._getFriendSearchSubject + this.userId + '/' + this.searchData.subject_name).subscribe((res) => {
                    if (res.status == 2) {
                        this.searchedSubjectsList = res.data;
                    }
                });
            }
        } else {
            this.searchData.subject_name = '';
            this.searchedSubjectsList = [];
            this.postSearchData.subjectIds = [];
        }
    }

    public selectSubject(id: number, name: string): void {
        this.searchStatus = false;
        this.searchId = id;
        this.searchData.subject_name = name;
        if (this.postSearchData.subjectIds.indexOf(id) == -1) {
            this.postSearchData.subjectIds.push(id);
        }
        this.searchedSubjectsList = [];
    }

    public collegeSearch(e: any): void {
        this.searchData.subject_name = '';
        this.searchData.degree_name = '';
        this.searchedSubjectsList = [];
        this.searchedDegreesList = [];
        this.postSearchData.degreeIds = [];
        this.postSearchData.subjectIds = [];
        this.showFilterText = '';
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.college_name) {
            if (this.searchData.college_name.match(nameValid)) {
                this.dataService.getData(this._getFriendSearchCollege + this.userId + '/' + this.searchData.college_name).subscribe((res) => {
                    if (res.status == 2) {
                        this.searchedCollegesList = res.data;
                    }
                });
            }
        } else {
            this.searchData.college_name = '';
            this.searchedCollegesList = [];
            this.postSearchData.collegeIds = [];
        }
    }

    public selectCollege(id: number, name: string): void {
        this.searchStatus = false;
        this.searchId = id;
        this.searchData.college_name = name;
        if (this.postSearchData.collegeIds.indexOf(id) == -1) {
            this.postSearchData.collegeIds.push(id);
        }
        this.searchedCollegesList = [];
    }

    public degreeSearch(e: any): void {
        this.searchData.college_name = '';
        this.searchData.subject_name = '';
        this.searchedCollegesList = [];
        this.searchedSubjectsList = [];
        this.postSearchData.subjectIds = [];
        this.postSearchData.collegeIds = [];
        this.showFilterText = '';
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.degree_name) {
            if (this.searchData.degree_name.match(nameValid)) {
                this.dataService.getData(this._getFriendSearchDegree + this.userId + '/' + this.searchData.degree_name).subscribe((res) => {
                    if (res.status == 2) {
                        this.searchedDegreesList = res.data;
                    }
                });
            }
        } else {
            this.searchData.degree_name = '';
            this.searchedDegreesList = [];
            this.postSearchData.degreeIds = [];
        }
    }

    public selectDegree(id: number, name: string): void {
        this.searchStatus = false;
        this.searchId = id;
        this.searchData.degree_name = name;
        if (this.postSearchData.degreeIds.indexOf(id) == -1) {
            this.postSearchData.degreeIds.push(id);
        }
        this.searchedDegreesList = [];
    }

    public searchPost(): void {
        this.showFilterText = this.searchData.subject_name ? this.searchData.subject_name : this.searchData.college_name ? this.searchData.college_name : this.searchData.degree_name;
        this.filterData();
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.postSearchData.subjectIds.length || this.postSearchData.collegeIds.length || this.postSearchData.degreeIds.length) {
            if (this.showFilterText && this.showFilterText.match(nameValid)) {
                this.searchCounter = 0;
                this.searchActive = true;
                if (this.tTimeline) {
                    this.timeLoader = true;
                    this.mywallservice.friendTimelineSearch(this.postSearchData, this.searchCounter, this.userId).subscribe((res) => {
                        this.timeLoader = false;
                        if (res.status == 2) {
                            if (res.data) {
                                this.timelinedata = res.data;
                            }
                            this.searchStatus = true;
                            this.total_timeline = res.total_timeline;
                            this.postSearchData = new SearchData();
                        }
                    });
                } else if (this.tActivity) {
                    this.loader = true;
                    this.mywallservice.friendPostSearch(this.postSearchData, this.userId, this.searchCounter).subscribe((res) => {
                        this.loader = false;
                        if (res.status == 2) {
                            if (res.data) {
                                this.postdataAll = res.data;
                            }
                            this.searchStatus = true;
                            this.total_post = res.total_post;
                            this.postSearchData = new SearchData();
                        }
                    });
                } else {
                    this.loader = true;
                    this.mywallservice.friendSearchPost(this.postSearchData, this.userId, this.postType, this.searchCounter).subscribe((res) => {
                        this.loader = false;
                        if (res.status == 2) {
                            if (res.data) {
                                this.postdata = res.data;
                            }
                            this.searchStatus = true;
                            this.total_result = res.total_result;
                            this.postSearchData = new SearchData();
                        }
                    });
                }
            } else {
                this.showFilterText = '';
                this.page.showError('Please select valid subject,college or degree name.');
            }
        } else {
            this.page.showError('Please select valid subject,college or degree name.');
            this.showFilterText = '';
        }
    }
    public filterData(): void {
        if (this.searchData.subject_name) {
            if (this.postSearchData.subjectIds.indexOf(this.searchId) == -1) {
                this.postSearchData.subjectIds.push(this.searchId);
            }
        } else if (this.searchData.college_name) {
            if (this.postSearchData.collegeIds.indexOf(this.searchId) == -1) {
                this.postSearchData.collegeIds.push(this.searchId);
            }
        } else if (this.searchData.degree_name) {
            if (this.postSearchData.degreeIds.indexOf(this.searchId) == -1) {
                this.postSearchData.degreeIds.push(this.searchId);
            }
        }
    }

    public searchReset(): void {
        this.showFilterText = '';
        this.searchId = null;
        this.searchActive = false;
        this.searchCounter = 0;
        this.counterList = 0;
        this.counterListPost = 0;
        this.counterListTimeline = 0;
        this.scrollControllerPost = 1;
        this.scrollController = 1;
        this.scrollControllerTimeline = 1;
        this.searchData = new MyWallSearch();
        this.postSearchData = new SearchData();
        if (this.tTimeline) {
            this.getUserTimeline();
        } else if (this.tActivity) {
            this.getFriendPost();
        } else {
            this.getUserPost(this.postType);
        }
    }

    public initEditor(post_Id: number) {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#inline-editor-" + post_Id);
            editorDiv.froalaEditor({
                toolbarInline: true,
                toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insertVideo', 'undo', 'redo'],
            });
            this.addEditorView[post_Id] = editorDiv.find(".fr-view");
        }, 0);
    }

    public initEditEditor(post_Id: number, message: any) {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#edit-inline-editor-" + post_Id);
            editorDiv.froalaEditor({
                toolbarInline: true,
                toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insertVideo', 'undo', 'redo'],
            });
            editorDiv.froalaEditor('placeholder.hide')
            this.editEditorView = editorDiv.find(".fr-view");
            this.editEditorView.html(message);
        }, 100);
    }

    /**user popup */
    UserPopupOpen(e, _id) {
        this.currentUserId = _id;
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
        this.subscriber = this.dataService.getData(this._dataProfileByUser + this.currentUserId).subscribe(user => {
            this.studentUser = user;
        });
    }

    addFriend(studentUser) {
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
    cancelRequest(studentUser) {
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
    onFollow(studentUser) {
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

    onUnFollow(studentUser) {
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

    public openAddPostToJournalModal(postId: number) {
        this.postid = postId;
        jQuery("#add-post-journal-modal").modal({ backdrop: false });
        this.addPostToJournal = true;
    }

    public onCloseAddPostToJournal(e: any) {
        if (e.data) {
            this.addPostToJournal = false;
            jQuery("#add-post-journal-modal").modal('hide');
        }
    }

    public getGroupWall(id: any) {
        this.router.navigate(['GroupWallComponent', { id: id }]);
    }

    onViewLikeClick(data) {
        this.post_id = data;
        jQuery("#like-member-list").modal({ backdrop: false });
        this.likeMemberList = true;
    }

    onLikeClose(event: any) {
        this.likeMemberList = false;
        jQuery("#like-member-list").modal('hide');
    }
    public onReportClickModal(postId: number) {
        this.postid = postId;
        jQuery("#add-report-modal").modal({ backdrop: false });
        this.addReportInfo = true;
    }

    public onCloseAddReport(e: any) {
        if (e.data) {
            this.addReportInfo = false;
            jQuery("#add-report-modal").modal('hide');
        }
    }
}