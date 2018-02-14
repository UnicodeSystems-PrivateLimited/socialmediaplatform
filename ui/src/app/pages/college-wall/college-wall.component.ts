import { Component, ViewEncapsulation, ElementRef, AfterViewInit, Input, ViewChildren } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { GridDataService, PageService, CommonService } from '../../theme/services';
import { BaCard } from '../../theme/components';
import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser'
import { YoutubeSafeUrlPipe } from '../../theme/pipes/youtube-safe-url';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { EmbedDirective } from "../embedVideo";
import { ProfileAssetDetailsComponent } from '../profileAssetDetails';
import { TextFormattingPipe, DateTime, documentNameFilterPipe, LikeFilterPipe, FollowUnfollowStatus } from '../../theme/pipes';
import { BaPostShareModel } from '../../theme/components/baPostShareModel';
import { Post, PostComment } from '../../theme/interfaces';
import { BaPostCustomPrivacyModel } from '../../theme/components/baPostCustomPrivacyModel';
import { nameFilterPipe } from '../../theme/pipes/name-filter';
import { BaPostEditModel } from '../../theme/components/baPostEditModel';
import { BaPostExternalShareModel } from '../../theme/components/baPostExternalShareModal';
import { moment } from '../../moment.loder';
import { AddPostToJournalModal, LikeMemberListComponent } from '../../theme/components';
import { Angular2AutoScroll } from 'angular2-auto-scroll/lib/angular2-auto-scroll.directive';
import {EmojiIcons} from '../../theme/components/baEmojiIcons';
import { reportInfoComponent } from  '../../theme/components/reportInfo';
declare var jQuery: any;
declare var noty: any;
declare var require: any;
declare var datepicker: any;

@Component({
    selector: 'collegeWall',
    pipes: [documentNameFilterPipe, FollowUnfollowStatus, LikeFilterPipe, TimeAgoPipe, DateTime, YoutubeSafeUrlPipe, DateFormatPipe, CalendarPipe, TextFormattingPipe, nameFilterPipe],
    directives: [BaCard, reportInfoComponent, RouterOutlet, EmojiIcons, RouterLink, LikeMemberListComponent, ROUTER_DIRECTIVES, TOOLTIP_DIRECTIVES, BaPostExternalShareModel, EmbedDirective, ProfileAssetDetailsComponent, BaPostShareModel, BaPostCustomPrivacyModel, BaPostEditModel, AddPostToJournalModal, Angular2AutoScroll],
    template: require('./college-wall.html')
})

export class CollegeWall {
    public postid;
    public dialogState = false;
    public user;
    public errorMessage: string;
    private _dataUrlCollege = '/api/college/getcollegeData/';
    public msg: string;
    public collegeId: any;
    public sub;
    public current_member: Array<any> = [];
    public future_member: Array<any> = [];
    public past_member: Array<any> = [];
    private _addPostUrl = '/api/college_post/postAllTypeData/';
    private _dataUploadPhotosFiles = '/api/college_post/postPhotosTypeFiles/';
    private _dataUploadVideosFiles = '/api/college_post/postVideosTypeFiles/';
    private _dataUploadAudiosFiles = '/api/college_post/postAudiosTypeFiles/';
    private _dataUploadDocumentsFiles = '/api/college_post/postDocumentsTypeFiles/';
    private _addFriendUrl = '/api/user/addFriend';
    private _addFriendNotification = '/api/notification/addNotification/';
    private _dataUrlCancelFriend = '/api/user/cancelFriend';
    private _dataUrladdFollower = 'api/user/addFollower/';
    private _dataUrlUnFollow = 'api/user/unFollow/';
    private _dataProfileByUser = 'api/user/getUserProfileData/';
    private _getPostByPostId = '/api/post/post/';
    private _addShareUrl = '/api/post/shareOnTimeline/';
    private _postSearchUrl = '/api/college_post/getAllCollegePostsByTitle/';
    private deletePostUrl = "/api/college_post/delete";
    private _dataUploadEmbedLink = 'api/college_post/postVideoEmbedLink/';
    private _dataUploadAudioEmbedLink = 'api/college_post/postAudioEmbedLink/';
    private _dataUploadPhotoEmbedLink = 'api/college_post/postPhotoEmbedLink/';
    private _dataUrl = '/api/user/profile/full';
    private _saveLastVisitUrl = '/api/user/updateCollegeLastVisit';
    @ViewChildren('cmp') components;
    public relatedJournal;
    public setPostType = '';
    public JournalByUserId;
    public JournalByJournalId;
    public title = { title: '' };
    public description = { description: '' };
    public error = { photo: '', video: '', audio: '', document: '', audioSize: '', videoSize: '', documentSize: '' };
    public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, custom: [], shareCustom: [] };
    public post = {};
    public college = {};
    public post_again = {};
    public photo = {};
    public video = {};
    public audio = {};
    public document = {};
    public parseVar;
    public parseVarb;
    public photosToUpload: Array<any> = [];
    public videosToUpload: Array<any> = [];
    public audiosToUpload: Array<any> = [];
    public documentsToUpload: Array<any> = [];
    public visibility_status = 1;
    public types;
    public isResult;
    public scrollController;
    public catagory = 1;
    public post_data: Array<any> = [];
    private counterList;
    private counterListForSpecificPost;
    public total_post;
    public togglePostComment: Array<boolean> = [];
    public editCommentToggle: number = null;
    public _dataAddLike = '/api/post/addLike/';
    public postLike = { post_id: "" }
    public _dataAddComment = '/api/post/addComment/';
    public _dataEditComment = '/api/post/editComment/';
    public _deleteComment = '/api/post/deleteComment/';
    public _friendListUrl = '/api/user/getAllTypeFriends';
    public postComment: Array<PostComment> = [];
    public visibilityStatus = 'Public';
    public categoryValue = 'General';
    public shared;
    public posts;
    public tMessage = true;
    public tPhoto = false;
    public tAudio = false;
    public tVideo = false;
    public tDocument = false;
    public tQuestion = false;
    public tLink = false;
    router: Router;
    public errorCommentPost;
    public currentMemberCount: number = 0;
    public futureMemberCount: number = 0;
    public pastMemberCount: number = 0;
    public contentLoding = false;
    public post_id;
    public postSearchField = { name: null };
    public imageFile;
    public postMsgLinkQuesType = 1;
    public tmainVideo = true;
    public tlinkVideo = false;
    public tmainAudio = true;
    public tlinkAudio = false;
    public tmainPhoto = true;
    public tlinkPhoto = false;
    public postCollegeComment = [];
    public postCollegeComments = [];
    public _popupImage = '';
    public _popImageId = null;
    public modal_post_id;
    public modal_comment_id;
    public modal_delete_post_id;
    public modal_delete_index;
    public searchCategoryValue = 'All';
    public whoPostedValue = 'All Members';
    public searchDateFrom = new Date();
    public searchDateTo = new Date();
    public category = 0;
    public who_posted = 1;
    public searching: boolean = false;
    public togClass = [];
    public prevComment: Array<any> = [];
    public oldComment: Array<any> = [];
    public delcommentIndex;
    public currentUserId;
    public studentUser = {};
    public friends: any;
    public friendsName: any;
    public customPostId: any = [];
    public shareCustomData;
    public shareVisibility_status = 1;
    public wallStatus: boolean = false;
    public loader: boolean = false;
    public data: any;
    public selectionOfSharing: number = 1;
    public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
    private post_type = {
        SENDREQ: 0,
    };
    public studentVisibilityStatus;
    public collegeFriendCount: number = 0;
    public collegeFriend: Array<any> = [];
    public notiMsg: string = 'Enter your message';
    public modal_likes_post_id;
    public modal_likes_posts = {};
    public modal_likes_index;
    public taggedUsersIds: Array<number> = [];
    public collegePostData: Post = new Post();
    public selectedPostPrivacyType: number = 1;
    public showCustomPrivacymodel: boolean = false;
    public postPrivacyTypes: any = [{ label: "Public", value: 1 }, { label: "Private(Only Me)", value: 2 }, { label: "All Friends", value: 3 }, { label: "All Followers", value: 4 }, { label: "All Friends And Followers", value: 6 }, { label: "Custom", value: 5 }];
    /************  share post variable  **********************/
    public sharing: Array<boolean> = [];
    public showPostExternalShareModel: boolean = false;
    public showPostShareModel: boolean = false;
    public sharePostData: any = null;
    public getAllTypePost: boolean = false;
    public allLinkActive: boolean = false;
    public statusLinkActive: boolean = false;
    public photosLinkActive: boolean = false;
    public videosLinkActive: boolean = false;
    public linksLinkActive: boolean = false;
    public documentsLinkActive: boolean = false;
    public audioLinkActive: boolean = false;
    public questionLinkActive: boolean = false;
    public activeDataAll = 'all';
    public activeDataStatus = 'status';
    public activeDataPhotos = 'photos';
    public activeDataVideos = 'videos';
    public activeDataLinks = 'links';
    public activeDataDocument = 'documents';
    public activeDataAudio = 'audio';
    public activeDataQuestion = 'question';
    /************  edit post variable  **********************/
    public showPostEditModel: boolean = false;
    public editPostData: any = null;
    public addEditorView: Array<any> = [];
    public editEditorView: any = null;
    public subscriber: any = null;
    /**
         * new api url
         */
    private _getDataByPostTypeUrl = '/api/college_post/getCollegeWallPostById/';
    private _getSearchUrl = '/api/college_post/getCollegeSearchedPostsById/';
    private _getGroups = '/api/group/getGroups/scd/';
    public groups: Array<any> = [];
    public postType: number = 10;
    public startSearchDate: any;
    public endSearchDate: any;
    public addPostToJournal: boolean = false;
    public selectStatus: Array<any> = [{ label: 'All Students', value: 1 }, { label: 'Current Students', value: 2 }, { label: 'Past Students', value: 3 }, { label: 'Future Students', value: 4 }];
    public selectedCollegeStatus: number = 1;
    public likeData: Array<any> = [];
    public likeMemberList: boolean = false;

    public emojicomponent: boolean = false;
    public addReportInfo: boolean = false;

    constructor(private sanitizer: DomSanitizationService, private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router, private element: ElementRef, private commonService: CommonService) {
        this.collegeId = routeParams.get('collegeId');
        this.photosToUpload = [];
        this.videosToUpload = [];
        this.audiosToUpload = [];
        this.documentsToUpload = [];
        this.visibility_status = 1;
        this.types = 2;
        this.counterList = 0;
        this.scrollController = 1;
        this.counterListForSpecificPost = 0;
        this.total_post = 0;
        this.router = router;
        this.postMsgLinkQuesType = 1;
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
    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.getCollegeWall();
        this.getUserProfile();
        this.getGroups();
        this.getPosts(this.postType);
        this.saveLastVisitTime();
        this.page.friendProfileId = '';
        this.postMsgLinkQuesType = 1;
        this.allLinkActive = true;
    }

    ngAfterViewInit() {
        setTimeout(function () {
            jQuery('input[name="search-date-to-2"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
            jQuery('input[name="search-date-from-2"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        }, 5000);
    }

    openStartEndTime() {
        jQuery('input[name="search-date-to-2"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        jQuery('input[name="search-date-from-2"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
    }

    resetSearch() {
        this.startSearchDate = null;
        this.endSearchDate = null;
        this.searchCategoryValue = 'All';
        this.whoPostedValue = 'All Members';
        this.selectedCollegeStatus = 1;
        jQuery('input[name="search-date-from-2"]').val('');
        jQuery('input[name="search-date-to-2"]').val('');
        this.searching = false;
        this.getPosts(10);
        this.allLinkActive = true;
        this.statusLinkActive = false;
        this.photosLinkActive = false;
        this.videosLinkActive = false;
        this.audioLinkActive = false;
        this.linksLinkActive = false;
        this.documentsLinkActive = false;
        this.questionLinkActive = false;
    }


    currentStudentPopupOpen(e, _id) {
        this.currentUserId = _id;
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
        this.subscriber = this.dataService.getData(this._dataProfileByUser + this.currentUserId).subscribe(user => {
            this.studentUser = user;
        });
    }
    futureStudentPopupOpen(e, _id) {
        this.currentUserId = _id;
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
        this.subscriber = this.dataService.getData(this._dataProfileByUser + this.currentUserId).subscribe(user => {
            this.studentUser = user;
        });
    }
    pastStudentPopupOpen(e, _id) {
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

    deletePostModel(postId, index) {
        this.modal_delete_post_id = postId;
        this.modal_delete_index = index;
        jQuery("#postDeleteModal").modal({ backdrop: false });
    }

    deletePostById() {
        this.dataService.getData(this.deletePostUrl + '/' + this.modal_delete_post_id + '/' + this.collegeId).subscribe(res => {
            if (res.status == 2) {
                this.post_data.splice(this.modal_delete_index, 1);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Post has been deleted successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-error"><p>' + res['data'].message + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
        });
    }

    getCollegeWall() {
        this.dataService.getData(this._dataUrlCollege + this.collegeId).subscribe(sub => {
            if (sub.status == 2) {
                this.sub = sub;
                this.current_member = sub.current_members;
                this.currentMemberCount = this.current_member.length;
                this.future_member = sub.future_members;
                this.futureMemberCount = this.future_member.length;
                this.past_member = sub.past_members;
                this.pastMemberCount = this.past_member.length;
                this.collegeFriend = sub.friend_members;
                this.collegeFriendCount = this.collegeFriend.length;
                this.page.is_member = sub.is_member;
                this.page.wall_type = "College";
                this.page.walldetails = sub.collegeDetails;
                if (sub.collegeDetails.members) {
                    this.page.member_count = sub.collegeDetails.members.length;
                }
            }
        });
    }

    postSearch() {
        if (this.postSearchField.name == '' || this.postSearchField.name == null) {
            this.postSearchField.name = null;
            this.getPosts(this.postType);
        }
        else {
            this.dataService.getData(this._postSearchUrl + this.page.wallId + "/" + this.postSearchField.name + "/" + this.counterList)
                .subscribe(res => {
                    if (res.status === 2) {
                        this.post_data = res.data;
                        this.counterList = 0;
                    }
                });
        }
    }

    getPosts(postType: number) {
        this.postType = postType;
        if (!this.searching) {
            this.contentLoding = true;
            this.clearScrollContent();
            this.searching = false;
            this.dataService.getData(this._getDataByPostTypeUrl + this.collegeId + '/' + this.postType + '/' + this.counterList).subscribe(res => {
                if (res.status == 2) {
                    if (res.data) {
                        this.post_data = res.data;
                    }
                    this.contentLoding = false;
                    this.isResult = res.isResult;
                    this.total_post = res.total_post;
                }
            });
        } else {
            this.searchPost();
        }
    }

    searchPost() {
        this.contentLoding = true;
        this.clearScrollContent();
        this.searching = true;
        let startDate = jQuery("#scheduleDate1").val();
        let endDate = jQuery("#scheduleDate2").val();
        if (startDate) {
            startDate = startDate.split('-');
            this.searchDateFrom = new Date(startDate[2], startDate[1] - 1, startDate[0]);
            if (endDate) {
                endDate = endDate.split('-');
                this.searchDateTo = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                if (moment(this.searchDateTo).isSameOrAfter(this.searchDateFrom)) {
                    //want to extract full day post dat's y +1
                    this.searchDateTo.setDate(this.searchDateTo.getDate() + 1);
                    this.dataService.getData(this._getSearchUrl + this.collegeId + '/' + this.counterList + '/' + this.postType + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.category + '/' + this.who_posted + '/' + this.selectedCollegeStatus).subscribe(post => {
                        if (post.status == 2) {
                            if (post.data) {
                                this.post_data = post.data;
                            }
                            this.contentLoding = false;
                            this.isResult = post.isResult;
                            this.total_post = post.total_post;
                        }
                        if (!post.data.length) {
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>No search results found!</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
                        }
                    });
                }
                else {
                    this.page.showError("To date should be greater than or equal to From date");
                }
            }
            else {
                this.searchDateTo = null;
                this.dataService.getData(this._getSearchUrl + this.collegeId + '/' + this.counterList + '/' + this.postType + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.category + '/' + this.who_posted + '/' + this.selectedCollegeStatus).subscribe(post => {
                    if (post.status == 2) {
                        if (post.data) {
                            this.post_data = post.data;
                        }
                        this.contentLoding = false;
                        this.isResult = post.isResult;
                        this.total_post = post.total_post
                    }
                    if (!post.data.length) {
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>No search results found!</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
                    }
                });
            }
        }
        else if (endDate) {
            this.page.showError("Please enter From date");
        }
        else {
            this.searchDateFrom = null;
            this.searchDateTo = null;
            this.dataService.getData(this._getSearchUrl + this.collegeId + '/' + this.counterList + '/' + this.postType + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.category + '/' + this.who_posted + '/' + this.selectedCollegeStatus).subscribe(post => {
                if (post.status == 2) {
                    if (post.data) {
                        this.post_data = post.data;
                    }
                    this.contentLoding = false;
                    this.isResult = post.isResult;
                    this.total_post = post.total_post
                }
                if (!post.data.length) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>No search results found!</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
                }
            });
        }
    }

    safeUrl(url) {
        var SafeUrl: SafeResourceUrl;
        SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return SafeUrl;
    }

    addVideoEmbedLink() {
        if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
            var myId = this.getId(this.message.embedLink.title);
            if (myId) {
                this.message.embedLink.video = myId;
                this.message.embedLink.title = "";
                this.page.showSuccess("Youtube link accepted.");
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
            }
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please paste the youtube link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
        }
    }

    addAudioEmbedLink() {
        if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
            if (!this.message.embedLink.title.startsWith("http") && !this.message.embedLink.title.startsWith("ftp")) {
                this.message.embedLink.title = 'http://' + this.message.embedLink.title;
            }
            if (this.validateURL(this.message.embedLink.title)) {
                this.message.embedLink.audio = this.message.embedLink.title;
                this.message.embedLink.title = "";
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
            }
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please paste the audio link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
        }
    }

    addPhotoEmbedLink() {
        if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
            if (this.validateImgURL(this.message.embedLink.title)) {
                this.message.embedLink.photo = this.message.embedLink.title;
                this.message.embedLink.title = "";
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
            }
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please paste the photo link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
        }
    }

    clearEmbedLink(activeVar) {
        this.message.name.name = '';
        this.message.embedLink.title = '';
        if (activeVar == 1) {
            if (this.message.embedLink.photo) {
                this.message.embedLink.photo = '';
            }
            this.tmainPhoto = !this.tmainPhoto;
            this.tlinkPhoto = !this.tlinkPhoto;
        }
        else if (activeVar == 2) {
            if (this.message.embedLink.video) {
                this.message.embedLink.video = '';
            }
            this.tmainVideo = !this.tmainVideo;
            this.tlinkVideo = !this.tlinkVideo;
        }
        else {
            if (this.message.embedLink.audio) {
                this.message.embedLink.audio = '';
            }
            this.tmainAudio = !this.tmainAudio;
            this.tlinkAudio = !this.tlinkAudio;
        }
    }

    //post all type college data
    onPostAllTypeCollegeData() {
        if (this.page.is_member) {
            this.collegePostData.privacy = this.selectedPostPrivacyType;
            this.collegePostData.types = this.types;
            this.collegePostData.catagory = this.catagory;
            this.collegePostData.created_on = new Date();
            this.collegePostData.custom = this.selectedPostPrivacyType == 5 ? this.taggedUsersIds : [];
            if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
                if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
                { this.message.name.name = null; }
                if (this.error.photo == "") {
                    this.collegePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
                    this.collegePostData.photo = this.photosToUpload;
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.dataService.postFormData(this._dataUploadPhotosFiles + this.collegeId, this.collegePostData).subscribe((result) => {
                        if (result['status'] == 2) {
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            var image = this.element.nativeElement.querySelector('.image');
                            image.src = '';
                            image.style.display = 'none';
                            this.photosToUpload = [];
                            this.message.name.name = '';
                            this.selectedPostPrivacyType = 1;
                            this.catagory = 1;
                            this.categoryValue = 'General';
                            this.post_data.unshift(result['data']);
                            this.taggedUsersIds = [];
                            this.collegePostData = new Post();
                            this.page.showSuccess('Your post has been posted successfully.');
                        }
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                    });
                }
            }
            else if (typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) {
                if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
                { this.message.name.name = null; }
                if (this.error.audio == '' && this.error.audioSize == '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.collegePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
                    this.collegePostData.audio = this.audiosToUpload;
                    this.dataService.postFormData(this._dataUploadAudiosFiles + this.collegeId, this.collegePostData).subscribe((result) => {
                        if (result['status'] == 2) {
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            this.audiosToUpload = [];
                            this.message.name.name = '';
                            this.catagory = 1;
                            this.selectedPostPrivacyType = 1;
                            this.categoryValue = 'General';
                            this.post_data.unshift(result['data']);
                            this.taggedUsersIds = [];
                            this.collegePostData = new Post();
                            this.page.showSuccess('Your post has been posted successfully.');
                        }
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                    });
                }
            }
            else if (typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) {
                if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
                { this.message.name.name = null; }
                if (this.error.video == '' && this.error.videoSize == '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.collegePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
                    this.collegePostData.video = this.videosToUpload;
                    this.dataService.postFormData(this._dataUploadVideosFiles + this.collegeId, this.collegePostData).subscribe((result) => {
                        if (result['status'] == 2) {
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            this.videosToUpload = [];
                            this.message.name.name = '';
                            this.catagory = 1;
                            this.selectedPostPrivacyType = 1;
                            this.categoryValue = 'General';
                            this.post_data.unshift(result['data']);
                            this.taggedUsersIds = [];
                            this.collegePostData = new Post();
                            this.page.showSuccess('Your post has been posted successfully.');
                        }
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                    });
                }
            }
            else if (typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) {
                if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
                { this.message.name.name = null; }
                if (this.error.document == '' && this.error.documentSize == '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.collegePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
                    this.collegePostData.document = this.documentsToUpload;
                    this.dataService.postFormData(this._dataUploadDocumentsFiles + this.collegeId, this.collegePostData).subscribe((result) => {
                        if (result['status'] == 2) {
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            this.documentsToUpload = [];
                            this.message.name.name = '';
                            this.selectedPostPrivacyType = 1;
                            this.categoryValue = 'General';
                            this.catagory = 1;
                            this.post_data.unshift(result['data']);
                            this.taggedUsersIds = [];
                            this.collegePostData = new Post();
                            this.page.showSuccess('Your post has been posted successfully.');
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                        }
                    });
                }
            }
            else if (typeof (this.message.embedLink.video) != 'undefined' && this.message.embedLink.video != '') {
                if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
                { this.message.name.name = null; }
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.collegePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
                this.collegePostData.link = this.message.embedLink.video;
                this.dataService.postData(this._dataUploadEmbedLink + this.collegeId, this.collegePostData).subscribe(posts => {
                    if (posts['status'] == 2) {
                        this.message.embedLink.video = '';
                        this.message.name.name = '';
                        this.selectedPostPrivacyType = 1;
                        this.categoryValue = 'General';
                        this.catagory = 1;
                        this.post_data.unshift(posts['data']);
                        this.taggedUsersIds = [];
                        this.collegePostData = new Post();
                        this.page.showSuccess('Your post has been posted successfully.');
                    }
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                });
            }
            else if (typeof (this.message.embedLink.audio) != 'undefined' && this.message.embedLink.audio != '') {
                if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
                { this.message.name.name = null; }
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.collegePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
                this.collegePostData.link = this.message.embedLink.audio;
                this.dataService.postData(this._dataUploadAudioEmbedLink + this.collegeId, this.collegePostData).subscribe(posts => {
                    if (posts['status'] == 2) {
                        this.message.embedLink.audio = '';
                        this.message.name.name = '';
                        this.selectedPostPrivacyType = 1;
                        this.categoryValue = 'General';
                        this.catagory = 1;
                        this.post_data.unshift(posts['data']);
                        this.taggedUsersIds = [];
                        this.collegePostData = new Post();
                        this.page.showSuccess('Your post has been posted successfully.');
                    }
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                });
            }
            else if (typeof (this.message.embedLink.photo) != 'undefined' && this.message.embedLink.photo != '') {
                if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
                { this.message.name.name = null; }
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.collegePostData.name = this.message.name.name ? this.message.name.name.replace(/(^[ \t]*\n)/gm, "") : '';
                this.collegePostData.link = this.message.embedLink.photo;
                this.dataService.postData(this._dataUploadPhotoEmbedLink + this.collegeId, this.collegePostData).subscribe(posts => {
                    if (posts['status'] == 2) {
                        this.message.embedLink.photo = '';
                        this.message.name.name = '';
                        this.selectedPostPrivacyType = 1;
                        this.categoryValue = 'General';
                        this.catagory = 1;
                        this.post_data.unshift(posts['data']);
                        this.taggedUsersIds = [];
                        this.collegePostData = new Post();
                        this.page.showSuccess('Your post has been posted successfully.');
                    }
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                });
            }
            else {
                if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 1) && (this.message.message.message !== '')) {
                    this.collegePostData.message = this.message.message.message ? this.message.message.message.replace(/(^[ \t]*\n)/gm, "") : '';
                    this.dataService.postData(this._addPostUrl + this.collegeId, this.collegePostData).subscribe(posts => {
                        if (posts['status'] == 2) {
                            this.message.message.message = '';
                            this.selectedPostPrivacyType = 1;
                            this.categoryValue = 'General';
                            this.catagory = 1;
                            this.post = posts.data_post;
                            this.college = posts.data_message;
                            this.post_data.unshift(posts.data_post);
                            this.taggedUsersIds = [];
                            this.collegePostData = new Post();
                            this.page.showSuccess('Your post has been posted successfully.');
                            for (var i = 0; i < this.post_data.length; i++) {
                                this.togClass.push('true');
                            }
                        }
                    });
                }
                else if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 2) && (this.message.question.question !== '')) {
                    this.collegePostData.question = this.message.question.question ? this.message.question.question.replace(/(^[ \t]*\n)/gm, "") : '';
                    this.dataService.postData(this._addPostUrl + this.collegeId, this.collegePostData).subscribe(posts => {
                        if (posts['status'] == 2) {
                            this.message.question.question = '';
                            this.selectedPostPrivacyType = 1;
                            this.categoryValue = 'General';
                            this.catagory = 1;
                            this.post = posts.data_post;
                            this.college = posts.data_message;
                            this.post_data.unshift(posts.data_post);
                            this.taggedUsersIds = [];
                            this.collegePostData = new Post();
                            this.page.showSuccess('Your post has been posted successfully.');
                        }
                    });
                }
                else if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 5) && (this.message.link.description !== '')) {
                    if (!this.message.link.description.startsWith("http") && !this.message.link.description.startsWith("ftp")) {
                        this.message.link.description = 'http://' + this.message.link.description;
                    }
                    if (this.validateURL(this.message.link.description)) {
                        this.collegePostData.link = this.message.link.description;
                        this.collegePostData.linkTitle = this.message.link.title ? this.message.link.title.replace(/(^[ \t]*\n)/gm, "") : '';
                        this.dataService.postData(this._addPostUrl + this.collegeId, this.collegePostData).subscribe(posts => {
                            if (posts['status'] == 2) {
                                this.message.link.description = '';
                                this.message.link.title = '';
                                this.selectedPostPrivacyType = 1;
                                this.categoryValue = 'General';
                                this.catagory = 1;
                                this.post = posts.data_post;
                                this.college = posts.data_message;
                                this.post_data.unshift(posts.data_post);
                                this.taggedUsersIds = [];
                                this.collegePostData = new Post();
                                this.page.showSuccess('Your post has been posted successfully.');
                            }
                        });
                    }
                    else {
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
                    }
                }
                else {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + this.notiMsg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
                }
            }
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please Join College For Posting</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 4000, });
        }
    }

    validateURL(textval) {
        var urlregex = /^(https?|Https?|HTtps?|HTTps?|HTTPs?|HTTPS?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(textval);
    }

    validateImgURL(textval) {
        var urlregex = /^((https?|Https?|HTtps?|HTTps?|HTTPs?|HTTPS?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)$/;
        return urlregex.test(textval);
    }

    getId(url) {
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return false;
        }
    }

    setMsgLinkQuesType(postType, tabType) {
        this.postMsgLinkQuesType = postType;
        this.message.message.message = '';
        this.message.question.question = '';
        this.message.link.description = '';
        this.message.link.title = '';
        this.message.name.name = '';
        this.message.embedLink.video = '';
        this.message.embedLink.audio = '';
        this.message.embedLink.photo = '';
        this.message.embedLink.title = '';
        this.error.photo = '';
        this.error.video = '';
        this.error.audio = '';
        this.error.audioSize = '';
        this.error.videoSize = '';
        this.error.document = '';
        this.error.documentSize = '';
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
        if (tabType == 1) {
            this.tMessage = true;
            this.notiMsg = 'Enter your message';
            this.tPhoto = this.tQuestion = this.tAudio = this.tVideo = this.tLink = this.tDocument = false;
        } else if (tabType == 2) {
            this.tPhoto = true;
            this.notiMsg = 'Select photo to upload';
            this.tMessage = this.tQuestion = this.tAudio = this.tVideo = this.tLink = this.tDocument = false;
        } else if (tabType == 3) {
            this.tVideo = true;
            this.notiMsg = 'Select video to upload';
            this.tMessage = this.tQuestion = this.tAudio = this.tPhoto = this.tLink = this.tDocument = false;
        } else if (tabType == 4) {
            this.tLink = true;
            this.notiMsg = 'Paste link here';
            this.tMessage = this.tQuestion = this.tAudio = this.tVideo = this.tPhoto = this.tDocument = false;
        } else if (tabType == 5) {
            this.tDocument = true;
            this.notiMsg = 'Select document to upload';
            this.tMessage = this.tQuestion = this.tAudio = this.tVideo = this.tLink = this.tPhoto = false;
        } else if (tabType == 6) {
            this.tAudio = true;
            this.notiMsg = 'Select audio to upload';
            this.tMessage = this.tQuestion = this.tPhoto = this.tVideo = this.tLink = this.tDocument = false;
        } else if (tabType == 7) {
            this.tQuestion = true;
            this.notiMsg = 'Enter your question';
            this.tMessage = this.tPhoto = this.tAudio = this.tVideo = this.tLink = this.tDocument = false;
        }
        var image = this.element.nativeElement.querySelector('.image');
        image.style.display = 'none';
    }

    search_who_posted(who_posted) {
        this.who_posted = who_posted;
        if (who_posted == 1) {
            this.whoPostedValue = 'All Members';
        }
        else if (who_posted == 2) {
            this.whoPostedValue = 'All Friends';
        }
    }

    search_catagories(catagory) {
        this.category = catagory;
        if (catagory == 0) {
            this.searchCategoryValue = 'All'
        }
        else if (catagory == 1) {
            this.searchCategoryValue = 'General'
        }
        else if (catagory == 2) {
            this.searchCategoryValue = 'Tip / Trick'
        }
        else if (catagory == 3) {
            this.searchCategoryValue = 'Joke / Humor'
        }
        else if (catagory == 4) {
            this.searchCategoryValue = 'Tutorial'
        }
    }

    getCategory(category_id) {
        if (category_id == 1) return "General";
        else if (category_id == 2) return "Tip / Trick";
        else if (category_id == 3) return "Joke / Humor";
        else if (category_id == 4) return "Tutorial";
        else return "No Category";
    }

    photoChangeEvent(fileInput: any, event) {
        var image = this.element.nativeElement.querySelector('.image');
        image.style.display = 'block';
        var reader: any, target: EventTarget;
        reader = new FileReader();
        reader.onload = function (e) {
            var src = e.target.result;
            image.src = src;
        };
        reader.readAsDataURL(event.target.files[0]);
        this.photosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        // if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
        //     if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
        //         this.error.photo = '';
        //     }
        //     else {
        //         this.error.photo = 'Invalid image format!';
        //     }
        // }
        this.error.photo = this.commonService.validateImageSizeAndFormat(this.photosToUpload);
    }

    videoChangeEvent(fileInput: any) {
        this.videosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        // if (typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) {
        //     if (this.videosToUpload[0].type == 'video/mp4' || this.videosToUpload[0].type == 'video/webm' || this.videosToUpload[0].type == 'video/ogg') {
        //         this.error.video = '';
        //         if (this.videosToUpload[0].size < (1024 * 1024 * 15)) {
        //             this.error.videoSize = "";
        //         } else {
        //             this.error.video = '';
        //             this.error.videoSize = "Video size should be less than 15 MB!.";
        //         }
        //     }
        //     else {
        //         this.error.videoSize = '';
        //         this.error.video = 'Invalid video format!';
        //     }
        // }
        let err = this.commonService.validateVideoSizeAndFormat(this.videosToUpload);
        this.error.video = err.video;
        this.error.videoSize = err.videoSize;
    }

    audioChangeEvent(fileInput: any) {
        this.audiosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        // if (typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) {
        //     if (this.audiosToUpload[0].type == 'audio/mpeg' || this.audiosToUpload[0].type == 'audio/ogg' || this.audiosToUpload[0].type == 'audio/wav' || this.audiosToUpload[0].type == 'audio/mp3') {
        //         this.error.audio = '';
        //         if (this.audiosToUpload[0].size <= (1024 * 1024 * 15)) {
        //             this.error.audioSize = "";
        //         } else {
        //             this.error.audio = '';
        //             this.error.audioSize = "Audio size should be less than 15 MB!.";
        //         }
        //     }
        //     else {
        //         this.error.audioSize = '';
        //         this.error.audio = 'Invalid audio format!';
        //     }
        // }
        let err = this.commonService.validateAudioSizeAndFormat(this.audiosToUpload);
        this.error.audio = err.audio;
        this.error.audioSize = err.audioSize;
    }

    documentChangeEvent(fileInput: any) {
        this.documentsToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        // if (typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) {
        //     if (this.documentsToUpload[0].type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || this.documentsToUpload[0].type == 'application/msword' || this.documentsToUpload[0].type == 'application/pdf' || this.documentsToUpload[0].type == 'text/xml' || this.documentsToUpload[0].type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || this.documentsToUpload[0].type == 'application/vnd.ms-powerpoint' || this.documentsToUpload[0].type == 'application/vnd.ms-excel' || this.documentsToUpload[0].type == 'text/plain') {
        //         this.error.document = '';
        //         if (this.documentsToUpload[0].size < (1024 * 1024 * 15)) {
        //             this.error.documentSize = "";
        //         } else {
        //             this.error.document = '';
        //             this.error.documentSize = "Document size should be less than 15 MB!.";
        //         }
        //     }
        //     else {
        //         this.error.documentSize = '';
        //         this.error.document = 'Invalid document format!';
        //     }
        // }
        let err = this.commonService.validateDocumentSizeAndFormat(this.documentsToUpload);
        this.error.document = err.document;
        this.error.documentSize = err.documentSize;
    }

    catagories(catagory) {
        this.catagory = catagory;
        if (catagory == 1) {
            this.categoryValue = 'General'
        }
        else if (catagory == 2) {
            this.categoryValue = 'Tip / Trick'
        }
        else if (catagory == 3) {
            this.categoryValue = 'Joke / Humor'
        }
        else if (catagory == 4) {
            this.categoryValue = 'Tutorial'
        }
    }

    makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append("avatar", files[0]);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            }
            xhr.open("POST", url, true);
            xhr.send(formData);
        });
    }

    //toggle comment
    toggleComment(comments, post_Id) {
        this.oldComment[post_Id] = [];
        this.prevComment[post_Id] = [];
        this.oldComment[post_Id] = comments;
        this.errorCommentPost = "";
        this.postComment[post_Id] = new PostComment();
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

    addComment(post_id, posts) {
        this.postComment[post_id].post_id = post_id;
        this.postComment[post_id].comment = this.addEditorView[post_id].html();
        let text = jQuery(this.postComment[post_id].comment).text();
        if (this.postComment[post_id].comment && text.trim()) {
            this.postComment[post_id].date = new Date();
            this.dataService.postData(this._dataAddComment, this.postComment[post_id])
                .subscribe(res => {
                    this.postComment[post_id] = new PostComment();
                    if (res.status === 2) {
                        this.errorCommentPost = "";
                        posts.comments = res.data;
                        this.oldComment[post_id] = [];
                        this.oldComment[post_id] = posts.comments;
                        this.addEditorView[post_id].html('');
                        this.prevComment[post_id].push(res.data[res.data.length - 1]);
                        this.initEditor(post_id);
                    }
                });
        } else {
            this.errorCommentPost = "Field is required!";
        }
    }

    openCommentModal(comment: any, post_id: number) {
        this.postComment[post_id].editComment = comment.body;
        this.editCommentToggle = comment._id;
        this.initEditEditor(post_id, comment.body);
    }
    closeCommentModal() {
        this.errorCommentPost = "";
        this.editCommentToggle = null;
    }

    editComment(post_id, comment_id, posts, j) {
        this.postComment[post_id].post_id = post_id;
        this.postComment[post_id].editComment = this.editEditorView.html();
        let text = jQuery(this.postComment[post_id].editComment).text();
        if (this.postComment[post_id].editComment) {
            this.dataService.postData(this._dataEditComment + comment_id, this.postComment[post_id])
                .subscribe(res => {
                    this.postComment[post_id] = new PostComment();
                    if (res.status === 2) {
                        this.editCommentToggle = null;
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>Comment Updated Successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        posts.comments[j] = res['data'][j];
                        this.oldComment[post_id] = [];
                        this.oldComment[post_id] = posts.comments;
                        for (var i = 0; i < res['data'].length; i++) {
                            if (res['data'][i]._id == comment_id) {
                                this.prevComment[post_id][j] = res['data'][i];
                            }
                        }
                    }
                });
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Field is required!</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
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
                if (res.status === 2) {
                    posts.comments = res.data;
                    this.oldComment[this.modal_post_id] = [];
                    this.oldComment[this.modal_post_id] = posts.comments;
                    this.postComment[this.modal_post_id] = new PostComment();
                    this.prevComment[this.modal_post_id].splice(this.delcommentIndex, 1);
                    this.page.showSuccess(res.msg);
                }
            });
    }

    addLike(post_id, posts, j) {
        this.postLike.post_id = post_id;
        this.dataService.postData(this._dataAddLike, this.postLike)
            .subscribe(res => {
                if (res.status === 2) {
                    posts.likes = res.data;
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

    onScrollList(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 100)) && (jQuery('#tab1_1').css('display') !== 'none')) {
            if (this.searching == false) {
                if (this.scrollController) {
                    if (this.postType != null) {
                        this.scrollController = 0;
                        this.parseVar = this.total_post / 10;
                        var page = parseInt(this.parseVar);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.contentLoding = true;
                            this.dataService.getData(this._getDataByPostTypeUrl + this.collegeId + '/' + this.postType + '/' + this.counterList).subscribe(post => {
                                if (post.status == 2) {
                                    if (post.data) {
                                        this.post_data = this.post_data.concat(post.data);
                                    }
                                }
                                this.scrollController = 1;
                                this.contentLoding = false;
                                for (var i = 0; i < post.data.length; i++) {
                                    this.togClass.push('true');
                                }
                            });
                        }
                    }
                }
            }
            else {
                if (this.scrollController) {
                    this.scrollController = 0;
                    this.parseVarb = this.total_post / 10;
                    var page = parseInt(this.parseVarb);
                    if (this.counterList <= (page + 1)) {
                        this.counterList++;
                        this.contentLoding = true;
                        this.dataService.getData(this._getSearchUrl + this.collegeId + '/' + this.counterList + '/' + this.postType + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.category + '/' + this.who_posted + '/' + this.selectedCollegeStatus).subscribe(post => {
                            if (post.status == 2) {
                                if (post.data) {
                                    this.post_data = this.post_data.concat(post.data);
                                }
                            }
                            this.scrollController = 1;
                            this.contentLoding = false;
                            for (var i = 0; i < post.data.length; i++) {
                                this.togClass.push('true');
                            }
                        });
                    }
                }
            }
        }
    }

    openPhotoPopUp(id) {
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
            for (var i = 0; i < this.post_data.length; i++) {
                if (this.post_data[i]._id == post_id) {
                    this.post_data[i] = post[0];
                }
            }
        });
    }
    closeSearchBox() {
        jQuery("#togglingSearch").toggle();
        jQuery("#changeClass").toggleClass('fa fa-plus', 'add');
        jQuery("#changeClass").toggleClass('fa fa-minus', 'remove');
    }

    likesUserDetail(postId, posts, index) {
        this.modal_likes_post_id = postId;
        this.modal_likes_index = index;
        this.modal_likes_posts = posts;
        jQuery("#postLikesModal").modal({ backdrop: false });
    }

    public onChangePostPrivacy(option: any): void {
        this.selectedPostPrivacyType = option.value;
        if (option.value == 5) {
            jQuery("#postCustomShareModel").modal({ backdrop: false });
            this.showCustomPrivacymodel = true;
        }
    }

    public onCloseCustomPrivacyModel(event: any): void {
        if (!event.status) {
            jQuery('#postCustomShareModel').modal('hide');
            this.showCustomPrivacymodel = false;
        } else {
            this.taggedUsersIds = event.data;
            jQuery('#postCustomShareModel').modal('hide');
            this.showCustomPrivacymodel = false;
        }
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
        this.sharing[postData._id] = false;
        this.sharePostData = postData;
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

    public clearScrollContent(): void {
        this.counterList = 0;
        this.scrollController = 1;
        this.counterListForSpecificPost = 0;
    }

    checkActiveClass(val) {
        this.clearScrollContent();
        if (val == this.activeDataAll) {
            this.postType = 10;
            this.allLinkActive = true;
            this.statusLinkActive = false;
            this.photosLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
            this.questionLinkActive = false;
        } else if (val == this.activeDataStatus) {
            this.postType = 1;
            this.allLinkActive = false;
            this.statusLinkActive = true;
            this.photosLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
            this.questionLinkActive = false;
        } else if (val == this.activeDataPhotos) {
            this.postType = 3;
            this.allLinkActive = false;
            this.photosLinkActive = true;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
            this.questionLinkActive = false;
        } else if (val == this.activeDataVideos) {
            this.postType = 4;
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = true;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
            this.questionLinkActive = false;
        } else if (val == this.activeDataLinks) {
            this.postType = 5;
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = true;
            this.documentsLinkActive = false;
            this.questionLinkActive = false;
        } else if (val == this.activeDataDocument) {
            this.postType = 7;
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = true;
            this.questionLinkActive = false;
        } else if (val == this.activeDataAudio) {
            this.postType = 6;
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = true;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
            this.questionLinkActive = false;
        } else if (val == this.activeDataQuestion) {
            this.postType = 2;
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
            this.questionLinkActive = true;
        }
    }

    getUserProfile() {
        this.dataService.getData(this._dataUrl).subscribe(user => {
            this.user = user;
        });
    }

    /**********   Edit Post Methods  *************************/
    public editPost(postData: any): void {
        this.editPostData = postData;
        jQuery("#postEditModel").modal({ backdrop: false });
        this.showPostEditModel = true;
    }
    public onPostEditModelClose(event: any): void {
        this.showPostEditModel = false;
        jQuery('#postEditModel').modal('hide');
        this.editPostData = null;
        if (event.data != null) {
            for (var i = 0; i < this.post_data.length; i++) {
                if (this.post_data[i]._id == event.data.result._id) {
                    this.post_data[i] = event.data.result;
                }
            }
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
            // this.addEditorView[post_Id].html('');
        }, 100);
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
    public saveLastVisitTime(): void {
        this.dataService.getData(this._saveLastVisitUrl + '/' + this.collegeId).subscribe((res) => {
        });
    }
    public onFromDateSelect() {
        this.startSearchDate = jQuery("#scheduleDate1").val();
    }
    public onToDateSelect() {
        this.endSearchDate = jQuery("#scheduleDate2").val();
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

    // get groups
    public getGroups(): void {
        this.dataService.getData(this._getGroups + 2 + '/' + this.collegeId + '/' + 0).subscribe(res => {
            if (res.status == 2) {
                if (res.data) {
                    this.groups = res.data;
                }
            }
        });
    }

    public getGroupWall(id: any) {
        this.router.navigate(['GroupWallComponent', { id: id }]);
    }
    public getGroupMember(id: number) {
        this.router.navigate(['GroupsMemberComponent', { groupId: id, type: 4, id: this.collegeId }]);
    }
    public selectCollegeStatus(data: any) {
        this.selectedCollegeStatus = data.value;
    }
    onViewLikeClick(data) {
        this.post_id = data;
        jQuery("#like-member-list").modal({ backdrop: false });
        this.likeMemberList = true;
    }

    public onLikeClose(event: any) {
        this.likeMemberList = false;
        jQuery("#like-member-list").modal('hide');
    }

    public onAddEmoji(event: any): void {
        this.emojicomponent = !this.emojicomponent;
        if (this.tMessage) {
            if (this.message.message.message) {
                this.message.message.message = this.message.message.message.concat(event.title);
            } else {
                this.message.message.message = event.title;
            }
        }
        if (this.tPhoto || this.tVideo || this.tDocument || this.tAudio) {
            if (this.message.name.name) {
                this.message.name.name = this.message.name.name.concat(event.title);
            } else {
                this.message.name.name = event.title;
            }
        }
        if (this.tLink) {
            if (this.message.link.title) {
                this.message.link.title = this.message.link.title.concat(event.title);
            } else {
                this.message.link.title = event.title;
            }
        }
        if (this.tQuestion) {
            if (this.message.question.question) {
                this.message.question.question = this.message.question.question.concat(event.title);
            } else {
                this.message.question.question = event.title;
            }
        }
    }
    public getEmojiIcon() {
        this.emojicomponent = !this.emojicomponent;
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
