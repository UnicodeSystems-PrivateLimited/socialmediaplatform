import { Component, ViewEncapsulation, Input, ElementRef, ViewChildren } from '@angular/core';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { YoutubeSafeUrlPipe } from '../../theme/pipes/youtube-safe-url';
import { BaCard } from '../../theme/components';
import { GridDataService, PageService } from '../../theme/services';
import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { ProfileAssetDetailsComponent } from '../profileAssetDetails';
import { TextFormattingPipe, DateTime, documentNameFilterPipe, LikeFilterPipe, FollowUnfollowStatus } from '../../theme/pipes';
import { nameFilterPipe } from '../../theme/pipes/name-filter';
import { BaPostShareModel } from '../../theme/components/baPostShareModel';
import { Post, PostComment, MyWallSearch, SearchData } from '../../theme/interfaces';
import { BaPostCustomPrivacyModel } from '../../theme/components/baPostCustomPrivacyModel';
import { lengthFilterPipe } from '../../theme/pipes/length-filter';
import { EmbedDirective } from "../embedVideo";
import { MyWallService } from '../myWall/myWall.service';
import { BaPostEditModel } from '../../theme/components/baPostEditModel';
import { BaPostExternalShareModel } from '../../theme/components/baPostExternalShareModal';
import { AddPostToJournalModal,LikeMemberListComponent } from '../../theme/components';
import { Angular2AutoScroll } from 'angular2-auto-scroll/lib/angular2-auto-scroll.directive';
import {BaScdPost} from '../../theme/components';
import { reportInfoComponent } from  '../../theme/components/reportInfo';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'data-profile',
    template: require('./userProfile.html'),
    pipes: [documentNameFilterPipe, DateTime, FollowUnfollowStatus, lengthFilterPipe, LikeFilterPipe, nameFilterPipe, DateFormatPipe, YoutubeSafeUrlPipe, TimeAgoPipe, CalendarPipe, TextFormattingPipe],
    host: { 'class': 'ng-animate page1Container' },
    providers: [MyWallService],
    directives: [RouterOutlet,reportInfoComponent, BaScdPost,LikeMemberListComponent, ROUTER_DIRECTIVES, BaPostExternalShareModel, BaPostCustomPrivacyModel, RouterLink, EmbedDirective, TOOLTIP_DIRECTIVES, ProfileAssetDetailsComponent, BaPostShareModel, BaPostEditModel, AddPostToJournalModal, Angular2AutoScroll]
})

export class UserProfileComponent {
    @ViewChildren('cmp') components;
    public postid;
    public dialogState = false;
    public user;
    public errorMessage: string;
    private _dataUrl = '/api/user/profile/full';
    private _dataUrlProfileDetail = '/api/user/getProfileData';
    private _dataUrlTimeline = '/api/event/getusertimeline/';
    public _getPostByPostId = '/api/post/post/';
    private _dataUrlpost = '/api/post/getuserpost/';
    private _dataUrlAllpost = '/api/post/getAllUserPost/';
    private _dataUrlSkill = 'api/skill/getuserskills';
    private _skillAdd = 'api/skill/addSkill';
    private _dataUrlAddSkill = 'api/skill/add/';
    private _skillRemove = 'api/skill/removeSkill/';
    private _skillSearch = 'api/skill/skillSearch';
    public _addShareUrl = '/api/post/shareOnTimeline/';
    public _createJournal = '/api/journal/createJournals';
    public _createOnlyJournal = '/api/journal/createJournal';
    public _getAllJournalByUserId = '/api/journal/getAllJournalByUserId/';
    public _getAllPostByJournalId = '/api/journal/getAllPostByJournalId/';
    public _addPostInJournal = '/api/journal/addPostInJournal/';
    public deletePostUrl = "/api/post/deleteTimelinePost";
    public JournalByUserId;
    public JournalByJournalId;
    public title = { title: '' };
    public description = { description: '' };
    public Error = { descriptionError: '' };
    public journal_id;
    public post_id;
    public select_journal = 'Select Journal';
    public _dataEditComment = '/api/post/editComment/';
    public postCollegeComment = [];
    public postCollegeComments = [];
    public _dataAddComment = '/api/post/addComment/';
    public _dataAddAnswer = '/api/post/addAnswer/';
    public _deleteComment = '/api/post/deleteComment/';
    public _deleteAnswer = '/api/post/deleteAnswer/';
    public _dataUrlEventsAdd = '/api/groupevents/addEvent';
    public _dataUrlEventsAddOnly = '/api/groupevents/addEventOnly';
    public _dataUrlDeleteJournal = '/api/journal/deleteJournalById';
    public _editJournal = '/api/journal/editJournalById';
    public _editOnlyJournal = '/api/journal/editOnlyJournalById';
    public _getAllJournalByPostId = '/api/journal/getAllJournalByPostId/';
    // public _dataUploadPhotosFiles = '/api/post/postTimelinePhotosTypeFiles/';
    // public _dataUploadAudiosFiles = '/api/post/postTimelineAudiosTypeFiles/';
    // public _dataUploadVideosFiles = '/api/post/postTimelineVideosTypeFiles/';
    // public _dataUploadDocumentsFiles = '/api/post/postTimelineDocumentsTypeFiles/';
    // public _dataUploadEmbedLink = 'api/post/postTimelineVideoEmbedLink/';
    // public _dataUploadAudioEmbedLink = 'api/post/postTimelineAudioEmbedLink/';
    // public _dataUploadPhotoEmbedLink = 'api/post/postTimelinePhotoEmbedLink/';
    public _friendListUrl = '/api/user/getAllTypeFriends';
    // public _addPostUrl = '/api/post/postTimelineAllTypeData/';
    public _headerDataUrl = '/api/user/getHeaderData';
    public relatedJournal;
    public togglePostComment: Array<boolean> = [];
    public editCommentToggle: number = null;
    public delcommentIndex: number = null;
    public postComment: Array<PostComment> = [];
    public prevComment: Array<any> = [];
    public oldComment: Array<any> = [];
    public postAnswer = { post_id: "", answer: "" };
    public postAnswerDiscription = [];
    public _dataAddLike = '/api/post/addLike/';
    public postLike = { post_id: "" };
    public userData;
    public friendCount = 0;
    public followingCount;
    public followerCount;
    public timelinedata: Array<any> = [];
    public postdata: Array<any> = [];
    public postdataAll = [];
    public counterList = 0;
    public counterListPost = 0;
    public counterListTimeline = 0;
    public total_result;
    public total_post;
    public total_timeline;
    public scrollController;
    public scrollControllerPost;
    public scrollControllerTimeline;
    public shared;
    public data;
    public shareCustomData;
    public initialPageStatus: boolean = false;
    router: Router;
    public errorCommentPost;
    public errorAnswerPost;
    public videoType;
    public errorAddJournal;
    public videoCreated;
    public Journal;
    public imageFile;
    public journalIndex;
    public videofileName;
    public skills = [];
    public parset;
    public parsep;
    public parsev;
    public tMessage = true;
    public tDashboard = false;
    public tActivity = false;
    public tTimeline = false;
    public tPhoto = false;
    public tVideo = false;
    public tAudio = false;
    public tJournal = false;
    public tDocument = false;
    public tLink = false;
    public tQuestion = false;
    public eventdate = { to: '', from: '', start: '', end: '' };
    public errorEventMessage = { errorDate: '', errorTitle: '', errorTagline: '', errorDescription: '', errorLocation: '', errorIcon: '', errorToDate: '', errorTime: '', errorFromDate: '' };
    public eventsdata = { title: '', tagline: '', description: '', location: '', event_date_to: '', event_date_from: '', event_time_from: '', event_time_to: '' };
    public modal_post_id;
    public modal_comment_id;
    public modal_answer_post_id;
    public modal_answer_id;
    public modal_delete_index;
    public tab_post_type;
    public create_journal = "Add New Journal";
    public openJournal: boolean = false;
    public journalmodalclose: boolean = true;
    public togClass = [];
    public prevId: number = 0;
    public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, custom: [], shareCustom: [] };
    public error = { photo: '', video: '', audio: '', document: '', videoSize: '', audioSize: '', documentSize: '' };
    public postMsgLinkQuesType = 1;
    public tmainVideo = true;
    public tlinkVideo = false;
    public tmainAudio = true;
    public tlinkAudio = false;
    public tmainPhoto = true;
    public tlinkPhoto = false;
    public photosToUpload: Array<any> = [];
    public videosToUpload: Array<any> = [];
    public audiosToUpload: Array<any> = [];
    public documentsToUpload: Array<any> = [];
    public subjectId = 0;
    public visibility_status = 1;
    public shareVisibility_status = 1;
    public types = 5;
    public catagory = 1;
    public photo = {};
    public video = {};
    public audio = {};
    public post_data: Array<any> = [];
    public document = {};
    public post = {};
    public subject = {};
    public timeMessage = true;
    public timePhoto = false;
    public timeVideo = false;
    public timeLink = false;
    public timeDocument = false;
    public timeAudio = false;
    public timeQuestion = false;
    public skillData;
    public skill = { name: "", id: null };
    public skillList = null;
    public skillModalId;
    public visibilityStatus = 'Public';
    public friends: any;
    public friendsName: any;
    public customPostId: any = [];
    public wallStatus: boolean = false;
    private _sharedFriendsAllPostCheckUrl = "/api/event/getusertimelineForSharedWithoutMatch/";
    private _sharedMatchFriendPostCheckUrl = "/api/event/getusertimelineForSharedWithMatch/";
    private _sharedFollowersAllPostCheckUrl = "/api/event/getusertimelineForSharedFollowersWithoutMatch/";
    private _sharedFollowersWithMatchPostCheckUrl = "/api/event/getusertimelineForSharedFollowersWithMatch/";
    private _checkPostStatusUrl = 'api/ruleofpost/getData';
    private _dataUrlDashboard = '/api/user/dashboard/getProfileData';
    private _dataProfileByUser = 'api/user/getUserProfileData/';
    public _addFriendUrl = '/api/user/addFriend';
    public _addFriendNotification = '/api/notification/addNotification/';
    public _dataUrlCancelFriend = '/api/user/cancelFriend';
    private _dataUrladdFollower = 'api/user/addFollower/';
    private _dataUrlUnFollow = 'api/user/unFollow/';
    public checkFollowersSharedPostStatus;
    public categoryValue = 'General';
    public notiMsg: string = 'Enter your message';
    public modal_likes_post_id;
    public modal_likes_posts = {};
    public modal_likes_index;
    public postPrivacyTypes: any = [{ label: "Public", value: 1 }, { label: "Private", value: 2 }, { label: "All Friends", value: 3 }, { label: "All Followers", value: 4 }, { label: "All Friends And Followers", value: 6 }, { label: "Custom", value: 5 }];
    public selectedPostPrivacyType: number = 1;
    public showCustomPrivacymodel: boolean = false;
    public taggedUsersIds: Array<number> = [];
    public subjectPostData: Post = new Post();
    /************  share post variable  **********************/
    public showPostShareModel: boolean = false;
    public showPostExternalShareModel: boolean = false;
    public sharePostData: any = null;
    public current_tab;
    public postDeleteData = { postId: '', wallId: '', wallType: '' };
    public postRemoveType: string = null;
    public sharing: Array<boolean> = [];
    public loader: boolean = false;
    /**Searching */
    public searchData: MyWallSearch = new MyWallSearch();
    public searchedSubjectsList: Array<any> = [];
    public searchedCollegesList: Array<any> = [];
    public searchedDegreesList: Array<any> = [];
    public timelineSearchData: SearchData = new SearchData();
    public searchCounter: number = 0;
    public searchActive: boolean = false;
    /************  edit post variable  **********************/
    public showPostEditModel: boolean = false;
    public editPostData: any = null;
    public addEditorView: Array<any> = [];
    public editEditorView: any = null;
    public postType: number;
    public searchId: number = null;
    public dashboardData: any;
    public msg: string;
    public currentUserId: number;
    public subscriber: any = null;
    public studentUser = {};
    public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
    private post_type = {
        SENDREQ: 0,
    };
    public searchStatus: boolean = false;
    public showFilterText: string = '';
    public addPostToJournal: boolean = false;
    public likeData: Array<any> = [];
    public likeMemberList: boolean = false;
    public addReportInfo: boolean = false;

    constructor(private sanitizer: DomSanitizationService, private dataService: GridDataService, private mywallservice: MyWallService, private page: PageService, routeParams: RouteParams, router: Router, private element: ElementRef) {
        this.router = router;
        if ((routeParams.get('post_type')) != null) {
            this.tab_post_type = routeParams.get('post_type');
        }
        else if ((routeParams.get('tab'))) {
            this.initialPageStatus = false;
            this.current_tab = routeParams.get('tab');
            if (this.current_tab == 2) {
                this.getUserTimeline();
            }
            else if (this.current_tab == 3) {
                if (routeParams.get('status') != null) {
                    this.getJournalByUserId(routeParams.get('status'));
                }
            } else if (this.current_tab == 1) {
                this.getUserDashboard();
            }
        } else {
            this.getUserTimeline();
        }
        this.counterList = 0;
        this.counterListPost = 0;
        this.counterListTimeline = 0;
        this.visibility_status = 1;
        this.types = 5;
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
        this.getSkillData();
        this.getUserProfile();
        this.getUserProfileData();
        this.page.friendProfileId = '';
        this.page.wallId = '';
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
            this.dataService.getData(this._dataUrlpost + this.tab_post_type + "/" + this.counterList).subscribe(user => {
                this.postdata = user.data;
                this.total_result = user.total_result;
            });
            if (this.tab_post_type == 3) {
                this.tPhoto = true;
                this.tDashboard = this.tTimeline = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tActivity = false;
            }
            else if (this.tab_post_type == 4) {
                this.tVideo = true;
                this.tDashboard = this.tTimeline = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tActivity = this.tQuestion = this.tPhoto = false;
            }
            else if (this.tab_post_type == 6) {
                this.tAudio = true;
                this.tDashboard = this.tTimeline = this.tActivity = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tPhoto = false;
            }
            else if (this.tab_post_type == 1) {
                this.tTimeline = true;
                this.tDashboard = this.tAudio = this.tActivity = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tPhoto = false;
                this.getUserTimeline();
            }
        }
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

    getSkillData() {
        this.dataService.getData(this._dataUrlSkill)
            .subscribe(res => {
                if (res.status === 2) {
                    this.skillData = res.data;
                }
            });
    }

    getSkill(event) {
        if (!event.target.value) {
            this.skillList = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (event.target.value.match(nameValid)) {
                this.dataService.postData(this._skillSearch, this.skill).subscribe(res => {
                    if (res.status == 2) {
                        this.skillList = res.data;
                    }
                });
            }
        }
    }

    selectSkill(id, title) {
        this.skill.name = title;
        this.skill.id = id;
        this.skillList = null;
    }

    hideSearchResult() {
        this.skillList = null;
    }

    addSkill() {
        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.skill.id != null) {
            this.dataService.postData(this._skillAdd, this.skill).subscribe(res => {
                if (res.status == 2) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.skill.name + '</strong> to your Skills</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    this.skill.name = null;
                    this.skill.id = null;
                    this.getSkillData();
                    this.userData.skills.splice(this.journalIndex, 1);
                } else if (res.status == 3) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p><strong>' + this.skill.name + '</strong> already added to skills</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    this.skill.name = null;
                    this.skill.id = null;
                }
            });
        }
        else if (this.skill.name != '' && this.skill.name != null && typeof (this.skill.name) != "undefined") {
            if (this.skill.name.match(letters)) {
                this.dataService.postData(this._dataUrlAddSkill, this.skill).subscribe(res => {
                    if (res.status == 2) {
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.skill.name + '</strong> to your Skills</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                        this.skill.name = null;
                        this.skill.id = null;
                        this.getSkillData();
                    }
                });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>Invalid Skill Name</strong> to your Skills</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        }
    }

    deleteSkillModel(id) {
        this.skillModalId = id;
        jQuery("#skillDeleteModal").modal({ backdrop: false });
    }

    deleteSkill() {
        this.dataService.getData(this._skillRemove + this.skillModalId).subscribe(res => {
            this.getSkillData();
            this.getUserProfileData();
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Skill removed successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        });
    }

    skillModalopen() {
        jQuery("#skillModal").modal({ backdrop: false });
    }

    closeSkillModel() {
        this.getUserProfileData();
    }

    evnet_dash() {
        jQuery("#eventModal2").modal({ backdrop: false });
        setTimeout(function () {
            jQuery('input[name="sub-date-from-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });

        }, 500);
        setTimeout(function () {
            jQuery('.timepicker').timepicker({ showInputs: false });
        }, 2000);
    }

    cleanJournal() {
        this.description.description = '';
        this.select_journal = 'Select Journal';
        this.title.title = '';
        this.errorAddJournal = "";
        this.errorEventMessage.errorIcon = "";
        this.openJournal = false;
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
    }

    cancelJournal() {
        this.openJournal = false;
        this.select_journal = 'Select Journal';
    }

    journalDeleteModel(id, index) {
        this.journal_id = id;
        this.journalIndex = index;
        jQuery("#journalDeleteModal").modal({ backdrop: false });
    }

    updateJournalModal(journal) {
        this.Journal = journal;
        this.journal_id = journal._id;
        this.title.title = this.Journal.title;
        jQuery("#edit-journal-modal").modal({ backdrop: false });
    }

    getUserTimeline() {
        this.tTimeline = true;
        this.tDashboard = this.tActivity = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tPhoto = false;
        this.loader = true;
        this.postdataAll = null;
        this.counterListTimeline = 0;
        if (!this.searchActive) {
            this.dataService.getData(this._dataUrlTimeline + this.counterListTimeline).subscribe(user => {
                this.loader = false;
                if (user.data.length) {
                    this.timelinedata = user.data;
                }
                this.total_timeline = user.total_timeline;
            });
        } else {
            this.searchPost();
        }
    }

    deleteJournal() {
        this.dataService.getData(this._dataUrlDeleteJournal + '/' + this.journal_id).subscribe(res => {
            if (res['status'] == 2) {
                this.JournalByUserId.splice(this.journalIndex, 1);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p> Journal Deleted.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-error"><p> No Journal Found.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
        });
    }

    editJournal() {
        if (this.title.title != '' && this.title.title != null) {
            if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
                if (this.errorEventMessage.errorIcon == '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.makeFileRequest(this._editJournal + '/' + this.journal_id + '/' + this.title.title, [], this.photosToUpload).then((res) => {
                        this.photosToUpload = [];
                        this.title.title = '';
                        this.errorAddJournal = "";
                        this.Journal.title = res['data'][0].title;
                        this.Journal.icon = res['data'][0].icon + "?t=" + new Date().getTime();
                        if (typeof (this.imageFile) != "undefined")
                            this.imageFile.target.value = "";
                        jQuery("#edit-journal-modal").modal('hide');
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>Journal Edited Successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    });
                }
            } else {
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.dataService.postData(this._editOnlyJournal + '/' + this.journal_id, this.title).subscribe(res => {
                    this.title.title = '';
                    this.errorAddJournal = "";
                    this.Journal.title = res['data'][0].title;
                    jQuery("#edit-journal-modal").modal('hide');
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                });
            }
        } else {
            this.errorAddJournal = "Field is required!";
        }
    }

    addJournal() {
        jQuery("#add-journal-modal").modal({ backdrop: false });
    }

    addPostJournal(user_id, Post_id) {
        this.post_id = Post_id;
        this.dataService.getData(this._getAllJournalByUserId + user_id).subscribe(res => {
            this.JournalByUserId = res.data;
        });
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
        if (this.title.title != '' && this.title.title != null) {
            if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
                if (this.errorEventMessage.errorIcon == '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.makeFileRequest(this._createJournal + '/' + this.title.title, [], this.photosToUpload).then((res) => {
                        this.photosToUpload = [];
                        this.JournalByUserId = this.JournalByUserId.concat(res['data']);
                        this.title.title = '';
                        this.errorAddJournal = "";
                        this.openJournal = false;
                        this.select_journal = 'Select Journal';
                        if (typeof (this.imageFile) != "undefined")
                            this.imageFile.target.value = "";
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        jQuery("#add-journal-modal").modal('hide');
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>New Journal Created.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    });
                }
            } else {
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.dataService.postData(this._createOnlyJournal, this.title).subscribe(res => {
                    this.JournalByUserId = this.JournalByUserId.concat(res.data);
                    this.title.title = '';
                    this.errorAddJournal = "";
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                    this.select_journal = 'Select Journal';
                });
                if (this.journalmodalclose == false) {
                    this.openJournal = false;
                    this.journalmodalclose = true;
                }
                else {
                    this.journalmodalclose = true;
                    jQuery("#add-journal-modal").modal('hide');
                    this.openJournal = false;
                }
            }
        } else {
            this.errorAddJournal = "Field is required!";
        }
    }

    // create event
    createEvent() {
        var letters = /^[a-z\d\-_\s]+$/i;
        var locationCheck = /^[a-z\d,\-_\s]+$/i;
        if (this.eventsdata.title != '' && this.eventsdata.title.match(letters)) {
            if (this.eventsdata.tagline != '' && this.eventsdata.tagline.match(letters)) {
                if (this.eventsdata.description != '') {
                    if (this.eventsdata.location != '' && this.eventsdata.location.match(locationCheck)) {
                        var date1 = jQuery("#scheduleDate1").val();
                        var date2 = jQuery("#scheduleDate2").val();
                        var time1 = jQuery("#scheduleTime1").val();
                        var time2 = jQuery("#scheduleTime2").val();
                        date1 = date1.split('-');
                        this.eventsdata.event_date_from = date1[1] + '-' + date1[0] + '-' + date1[2] + ' ' + time1;
                        var froms = date1[2] + date1[1] + date1[0];
                        date2 = date2.split('-');
                        this.eventsdata.event_date_to = date2[1] + '-' + date2[0] + '-' + date2[2] + ' ' + time2;
                        var tos = date2[2] + date2[1] + date2[0];
                        var currentDate = new Date();
                        var yesterday = new Date(currentDate.getTime());
                        yesterday.setDate(currentDate.getDate() - 1);
                        var fromDate = new Date(date1[2], date1[1] - 1, date1[0]);
                        if (date1 != '' && date2 != '') {
                            if (fromDate.getTime() > currentDate.getTime()) {
                                if (tos >= froms) {
                                    if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
                                        if (this.errorEventMessage.errorIcon == '') {
                                            jQuery('.spin-wrap.vision-spin').fadeIn();
                                            this.makeFileRequest(this._dataUrlEventsAdd + '/' + this.eventsdata.title + '/' + this.eventsdata.tagline + '/' + this.eventsdata.description + '/' + this.eventsdata.location + '/' + this.eventsdata.event_date_to + '/' + this.eventsdata.event_date_from, [], this.photosToUpload).then((res) => {
                                                jQuery("#eventModal").modal('hide');
                                                this.photosToUpload = [];
                                                this.eventsdata.event_date_from = this.eventsdata.event_date_to = "";
                                                this.eventsdata.title = this.errorEventMessage.errorToDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.eventsdata.tagline = this.eventsdata.description = this.eventsdata.location = this.errorEventMessage.errorFromDate = '';
                                                this.imageFile.target.value = "";
                                                jQuery("#scheduleDate1").val('');
                                                jQuery("#scheduleDate2").val('');
                                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>New Event Created.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                            });
                                        }
                                    } else {
                                        jQuery('.spin-wrap.vision-spin').fadeIn();
                                        this.dataService.postData(this._dataUrlEventsAddOnly, this.eventsdata).subscribe(res => {
                                            jQuery("#eventModal").modal('hide');
                                            this.photosToUpload = [];
                                            this.eventsdata.event_date_from = this.eventsdata.event_date_to = "";
                                            this.eventsdata.title = this.errorEventMessage.errorToDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.eventsdata.tagline = this.eventsdata.description = this.eventsdata.location = this.errorEventMessage.errorFromDate = '';
                                            jQuery("#scheduleDate1").val('');
                                            jQuery("#scheduleDate2").val('');
                                            jQuery('.spin-wrap.vision-spin').fadeOut();
                                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>New Event Created.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                        });
                                    }
                                } else {
                                    this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.errorEventMessage.errorIcon = this.errorEventMessage.errorFromDate = "";
                                    this.errorEventMessage.errorToDate = "End date is too short than start date";
                                }
                            } else {
                                this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.errorEventMessage.errorIcon = this.errorEventMessage.errorToDate = "";
                                this.errorEventMessage.errorFromDate = "Start date should be greater than or equal to current date";
                            }
                        } else {
                            this.errorEventMessage.errorDate = "Select the event date";
                            this.errorEventMessage.errorTagline = this.errorEventMessage.errorToDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorIcon = this.errorEventMessage.errorFromDate = "";
                        }
                    } else {
                        this.errorEventMessage.errorToDate = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = this.errorEventMessage.errorTitle = this.errorEventMessage.errorDescription = this.errorEventMessage.errorFromDate = "";
                        this.errorEventMessage.errorLocation = "Invalid event location";
                    }
                } else {
                    this.errorEventMessage.errorToDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = this.errorEventMessage.errorTitle = this.errorEventMessage.errorFromDate = "";
                    this.errorEventMessage.errorDescription = " Event Description Required.";
                }
            } else {
                this.errorEventMessage.errorToDate = this.errorEventMessage.errorTitle = this.errorEventMessage.errorDescription = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorFromDate = "";
                this.errorEventMessage.errorTagline = "Invalid event tag line";
            }
        } else {
            this.errorEventMessage.errorToDate = this.errorEventMessage.errorDescription = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = this.errorEventMessage.errorFromDate = "";
            this.errorEventMessage.errorTitle = "Invalid event name ";
        }
        jQuery("#img-dub-btn").click(function () {
            jQuery(".up-btn-cust").trigger('click');
        });
    }

    closeEventModel() {
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
        jQuery("#scheduleDate1").val('');
        jQuery("#scheduleDate2").val('');
        this.eventsdata.title = this.errorEventMessage.errorToDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.eventsdata.tagline = this.eventsdata.description = this.eventsdata.location = '';
    }

    photoChangeEvent(fileInput: any) {
        this.photosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
            this.errorEventMessage.errorIcon = '';
        }
        else {
            this.errorEventMessage.errorIcon = "Invalid image format";
            this.errorEventMessage.errorToDate = "";
            this.errorEventMessage.errorDescription = "";
            this.errorEventMessage.errorLocation = "";
            this.errorEventMessage.errorDate = "";
            this.errorEventMessage.errorTagline = "";
            this.errorEventMessage.errorTitle = "";
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

    //post journal
    addPostInJournal() {
        if (this.journal_id !== '' && this.journal_id != null && typeof (this.journal_id) !== 'undefined') {
            this.dataService.postData(this._addPostInJournal + this.post_id + '/' + this.journal_id, this.description).subscribe(res => {
                this.description.description = '';
                this.select_journal = 'Select Journal';
                this.journal_id = '';
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Journal Added</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
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
        this.tJournal = true;
        this.tDashboard = this.tTimeline = this.tAudio = this.tDocument = this.tQuestion = this.tLink = this.tVideo = this.tActivity = this.tPhoto = false;
    }

    openJournla(value) {
        this.openJournal = value;
        this.select_journal = 'Add Journal'
        this.journalmodalclose = false;
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

    onScrollListTimeline(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#timeline').css('display') !== 'none')) {
            if (!this.searchActive) {
                if (this.scrollControllerTimeline) {
                    this.scrollControllerTimeline = 0;
                    this.parset = this.total_timeline / 10
                    var page = parseInt(this.parset);
                    if (this.counterListTimeline <= (page + 1)) {
                        this.counterListTimeline++;
                        this.dataService.getData(this._dataUrlTimeline + this.counterListTimeline).subscribe(user => {
                            if (user.data) {
                                this.timelinedata = this.timelinedata.concat(user.data);
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
                        this.mywallservice.userTimelinesearchPost(this.timelineSearchData, this.searchCounter).subscribe((res) => {
                            if (res.status == 2) {
                                if (res.data) {
                                    this.timelinedata = this.timelinedata.concat(res.data);
                                }
                                for (var i = 0; i < this.timelinedata.length; i++) {
                                    this.togClass.push('true');
                                }
                                this.timelineSearchData = new SearchData();
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

    safeUrl(url) {
        var SafeUrl: SafeResourceUrl;
        SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return SafeUrl;
    }

    getclassList(user) {
        if (user.friend_id) {
            return "fa fa-user bg-aqua";
        } else if (user.post_id) {
            if (user.post_id.photo[0]) return "fa fa-camera bg-purple";
            else if (user.post_id.document[0]) return "fa fa-paperclip bg-green";
            else if (user.post_id.audio[0]) return "fa fa-music bg-yellow";
            else if (user.post_id.video[0]) return "fa fa-video-camera bg-purple";
            else if (user.post_id.link[0]) return "fa fa-link bg-maroon";
            else if (user.post_id.question) return "fa fa-question bg-aqua";
            else return "fa fa-envelope bg-blue";
        } else {
            return "fa fa-clock-o bg-gray";
        }
    }

    getUserPost(post_type) {
        this.loader = true;
        this.postType = post_type;
        this.counterList = 0;
        if (post_type == 3) {
            this.tPhoto = true;
            this.tDashboard = this.tTimeline = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tActivity = false;
        }
        else if (post_type == 4) {
            this.tVideo = true;
            this.tDashboard = this.tTimeline = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tActivity = this.tQuestion = this.tPhoto = false;
        }
        else if (post_type == 5) {
            this.tLink = true;
            this.tDashboard = this.tTimeline = this.tAudio = this.tDocument = this.tJournal = this.tActivity = this.tVideo = this.tQuestion = this.tPhoto = false;
        }
        else if (post_type == 7) {
            this.tDocument = true;
            this.tDashboard = this.tTimeline = this.tAudio = this.tActivity = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tPhoto = false;
        }
        else if (post_type == 6) {
            this.tAudio = true;
            this.tDashboard = this.tTimeline = this.tActivity = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tPhoto = false;
        }
        else if (post_type == 2) {
            this.tQuestion = true;
            this.tDashboard = this.tTimeline = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tActivity = this.tPhoto = false;
        }
        if (!this.searchActive) {
            this.dataService.getData(this._dataUrlpost + post_type + "/" + this.counterList).subscribe(user => {
                this.postdata = user.data;
                this.loader = false;
                this.total_result = user.total_result;
                this.timelinedata = [];
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
                        this.parsev = this.total_result / 10
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + post_type + "/" + this.counterList).subscribe(user => {
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
                        this.parsev = this.total_result / 10
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + post_type + "/" + this.counterList).subscribe(user => {
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
                        this.parsev = this.total_result / 10
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + post_type + "/" + this.counterList).subscribe(user => {
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
                        this.parsev = this.total_result / 10
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + post_type + "/" + this.counterList).subscribe(user => {
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
                        this.parsev = this.total_result / 10
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + post_type + "/" + this.counterList).subscribe(user => {
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
                        this.parsev = this.total_result / 10
                        var page = parseInt(this.parsev);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.dataService.getData(this._dataUrlpost + post_type + "/" + this.counterList).subscribe(user => {
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
                this.parsep = this.total_result / 10
                var page = parseInt(this.parsep);
                if (this.searchCounter <= (page + 1)) {
                    this.searchCounter++;
                    this.mywallservice.userSearchPost(this.timelineSearchData, post_type, this.searchCounter).subscribe((res) => {
                        if (res.status == 2) {
                            if (res.data) {
                                this.postdata = this.postdata.concat(res.data);
                            }
                            for (var i = 0; i < this.postdata.length; i++) {
                                this.togClass.push('true');
                            }
                            this.timelineSearchData = new SearchData();
                        }
                        this.scrollController = 1;
                    });
                }
            }
        }
    }

    getUserAllPost() {
        this.timelinedata = [];
        this.counterListPost = 0;
        this.dataService.getData(this._dataUrlAllpost + this.counterListPost).subscribe(AllPost => {
            if (AllPost.data) {
                this.postdataAll = AllPost.data;
            }
            for (var i = 0; i < this.postdataAll.length; i++) {
                this.togClass.push('true');
            }
            this.total_post = AllPost.total_post;
        });
        this.tActivity = true;
        this.tDashboard = this.tTimeline = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tPhoto = false;
    }

    deletePostModel(post: any, index: number, deleteType: string): void {
        this.postDeleteData.postId = post._id;
        this.postRemoveType = deleteType;
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
        this.modal_delete_index = index;
        jQuery("#postDeleteModal").modal({ backdrop: false });
    }

    deletePostById() {
        if (this.postRemoveType == 'user') {
            this.dataService.postData(this.deletePostUrl, this.postDeleteData).subscribe(res => {
                if (res.status == 2) {
                    this.timelinedata.splice(this.modal_delete_index, 1);
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + res['data'].message + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                } else {
                    var n = noty({ text: '<div class="alert bg-theme-error"><p>' + res['data'].message + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                }
            });
        } else {
            let postData = { postId: this.postDeleteData.postId };
            this.mywallservice.removePostFromTimeline(postData).subscribe((res) => {
                if (res.status == 2) {
                    this.timelinedata.splice(this.modal_delete_index, 1);
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + res.message + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                }
            });
        }
        this.postRemoveType = null;
    }

    deletePostPhotosById() {
        this.dataService.postData(this.deletePostUrl, this.postDeleteData).subscribe(res => {
            if (res.status == 2) {
                this.postdata.splice(this.modal_delete_index, 1);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + res['data'].message + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-error"><p>' + res['data'].message + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
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

    getUserProfile() {
        this.dataService.getData(this._dataUrl).subscribe(user => {
            this.user = user;
        });
    }

    getUserProfileData() {
        this.dataService.getData(this._dataUrlProfileDetail).subscribe(res => {
            this.userData = res;
            this.skills = res.skills;
            this.showskills();
        });
    }

    getUserDashboard() {
        this.tDashboard = true;
        this.tTimeline = this.tActivity = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tPhoto = false;
        this.loader = true;
        this.dataService.getData(this._dataUrlDashboard).subscribe(res => {
            this.dashboardData = res;
            this.loader = false;
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

    ngOnDestroy() {
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

    openCommentModal(comment, post_id) {
        this.postComment[post_id].editComment = comment.body;
        this.editCommentToggle = comment._id;
        this.initEditEditor(post_id, comment.body);
    }

    closeCommentModal(index) {
        this.errorCommentPost = "";
        this.editCommentToggle = null;
    }

    editComment(post_id, comment_id, posts, j) {
        this.postComment[post_id].post_id = post_id;
        this.postComment[post_id].editComment = this.editEditorView.html();
        let text = jQuery(this.postComment[post_id].editComment).text();
        if (this.postComment[post_id].editComment && text.trim()) {
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
            this.page.showError('Field is required!');
        }
    }

    //add comment to post
    addComment(post_id, posts) {
        this.postComment[post_id].post_id = post_id;
        this.postComment[post_id].comment = this.addEditorView[post_id].html();
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
            this.errorCommentPost = "Field is required!";
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
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Your answer has been deleted successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                }
            });
    }

    playVideo(type, created, fileName) {
        jQuery("#videoModal").modal({ backdrop: false });
        this.videoType = type;
        this.videoCreated = created;
        this.videofileName = fileName;
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
        });
    }

    addLike(post_id, posts, j) {
        if (this.togClass[j] == 'true') {
            jQuery(".toggleImage-" + j).attr("src", "public/dist/img/hand-like.png");
            this.togClass[j] = 'false';
        }
        else if (this.togClass[j] == 'false') {
            jQuery(".toggleImage-" + j).attr("src", "public/dist/img/hand2.png");
            this.togClass[j] = 'true';
        }
        this.postLike.post_id = post_id;
        this.dataService.postData(this._dataAddLike, this.postLike)
            .subscribe(res => {
                if (res.status == 2) {
                    posts.likes = res.data;
                }
            });
    }

    //***********************Add post section start ***************/
    // setMsgLinkQuesType(postType, tabType) {
    //     this.postMsgLinkQuesType = postType;
    //     this.message.message.message = '';
    //     this.message.question.question = '';
    //     this.message.link.description = '';
    //     this.message.link.title = '';
    //     this.message.name.name = '';
    //     this.message.embedLink.video = '';
    //     this.message.embedLink.audio = '';
    //     this.message.embedLink.photo = '';
    //     this.message.embedLink.title = '';
    //     this.error.photo = '';
    //     this.error.video = '';
    //     this.error.audio = '';
    //     this.error.videoSize = '';
    //     this.error.audioSize = '';
    //     this.error.document = '';
    //     this.error.documentSize = '';
    //     if (typeof (this.imageFile) != "undefined")
    //         this.imageFile.target.value = "";
    //     if (tabType == 1) {
    //         this.timeMessage = true;
    //         this.notiMsg = 'Enter your message';
    //         this.timePhoto = this.timeQuestion = this.timeAudio = this.timeVideo = this.timeLink = this.timeDocument = false;
    //     } else if (tabType == 2) {
    //         this.timePhoto = true;
    //         this.notiMsg = 'Select photo to upload';
    //         this.timeMessage = this.timeQuestion = this.timeAudio = this.timeVideo = this.timeLink = this.timeDocument = false;
    //     } else if (tabType == 3) {
    //         this.timeVideo = true;
    //         this.notiMsg = 'Select video to upload';
    //         this.timeMessage = this.timeQuestion = this.timeAudio = this.timePhoto = this.timeLink = this.timeDocument = false;
    //     } else if (tabType == 4) {
    //         this.timeLink = true;
    //         this.notiMsg = 'Paste link here';
    //         this.timeMessage = this.timeQuestion = this.timeAudio = this.timeVideo = this.timePhoto = this.timeDocument = false;
    //     } else if (tabType == 5) {
    //         this.timeDocument = true;
    //         this.notiMsg = 'Select document to upload';
    //         this.timeMessage = this.timeQuestion = this.timeAudio = this.timeVideo = this.timeLink = this.timePhoto = false;
    //     } else if (tabType == 6) {
    //         this.timeAudio = true;
    //         this.notiMsg = 'Select audio to upload';
    //         this.timeMessage = this.timeQuestion = this.timePhoto = this.timeVideo = this.timeLink = this.timeDocument = false;
    //     } else if (tabType == 7) {
    //         this.timeQuestion = true;
    //         this.notiMsg = 'Enter your question';
    //         this.timeMessage = this.timePhoto = this.timeAudio = this.timeVideo = this.timeLink = this.timeDocument = false;
    //     }
    //     var image = this.element.nativeElement.querySelector('.image');
    //     image.style.display = 'none';
    // }

    // photoChangePostEvent(fileInput: any, event) {
    //     var image = this.element.nativeElement.querySelector('.image');
    //     image.style.display = 'block';
    //     var reader: any, target: EventTarget;
    //     reader = new FileReader();
    //     reader.onload = function (e) {
    //         var src = e.target.result;
    //         image.src = src;
    //     };
    //     reader.readAsDataURL(event.target.files[0]);
    //     this.photosToUpload = <Array<File>>fileInput.target.files;
    //     this.imageFile = fileInput;
    //     if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
    //         if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
    //             this.error.photo = '';
    //         }
    //         else {
    //             this.error.photo = 'Invalid image format!';
    //         }
    //     }
    // }

    // validateImgURL(textval) {
    //     var urlregex = /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)$/;
    //     return urlregex.test(textval);
    // }

    // addPhotoEmbedLink() {
    //     if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
    //         if (this.validateImgURL(this.message.embedLink.title)) {
    //             this.message.embedLink.photo = this.message.embedLink.title;
    //             this.message.embedLink.title = "";
    //         } else {
    //             var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
    //         }
    //     } else {
    //         var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please paste the photo link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
    //     }
    // }

    // clearEmbedLink(activeVar) {
    //     this.message.name.name = '';
    //     this.message.embedLink.title = '';
    //     if (activeVar == 1) {
    //         if (this.message.embedLink.photo) {
    //             this.message.embedLink.photo = '';
    //         }
    //         this.tmainPhoto = !this.tmainPhoto;
    //         this.tlinkPhoto = !this.tlinkPhoto;
    //     }
    //     else if (activeVar == 2) {
    //         if (this.message.embedLink.video) {
    //             this.message.embedLink.video = '';
    //         }
    //         this.tmainVideo = !this.tmainVideo;
    //         this.tlinkVideo = !this.tlinkVideo;
    //         this.message.embedLink.video = '';
    //     }
    //     else {
    //         if (this.message.embedLink.audio) {
    //             this.message.embedLink.audio = '';
    //         }
    //         this.tmainAudio = !this.tmainAudio;
    //         this.tlinkAudio = !this.tlinkAudio;
    //     }
    // }

    // videoChangeEvent(fileInput: any) {
    //     this.videosToUpload = <Array<File>>fileInput.target.files;
    //     this.imageFile = fileInput;
    //     if (typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) {
    //         if (this.videosToUpload[0].type == 'video/mp4' || this.videosToUpload[0].type == 'video/webm' || this.videosToUpload[0].type == 'video/ogg') {
    //             this.error.video = '';
    //             if (this.videosToUpload[0].size < (1024 * 1024 * 15)) {
    //                 this.error.videoSize = "";
    //             } else {
    //                 this.error.video = '';
    //                 this.error.videoSize = "Video size should be less than 15 MB!.";
    //             }
    //         }
    //         else {
    //             this.error.videoSize = '';
    //             this.error.video = 'Invalid video format!';
    //         }
    //     }
    // }

    // getId(url) {
    //     var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    //     var match = url.match(regExp);
    //     if (match && match[2].length == 11) {
    //         return match[2];
    //     } else {
    //         return false;
    //     }
    // }

    // addVideoEmbedLink() {
    //     if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
    //         var myId = this.getId(this.message.embedLink.title);
    //         if (myId) {
    //             this.message.embedLink.video = myId;
    //             this.message.embedLink.title = "";
    //         } else {
    //             var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
    //         }
    //     } else {
    //         var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please paste the youtube link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
    //     }
    // }

    // documentChangeEvent(fileInput: any) {
    //     this.documentsToUpload = <Array<File>>fileInput.target.files;
    //     this.imageFile = fileInput;
    //     if (typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) {
    //         if (this.documentsToUpload[0].type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || this.documentsToUpload[0].type == 'application/msword' || this.documentsToUpload[0].type == 'application/pdf' || this.documentsToUpload[0].type == 'text/xml' || this.documentsToUpload[0].type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || this.documentsToUpload[0].type == 'application/vnd.ms-powerpoint' || this.documentsToUpload[0].type == 'application/vnd.ms-excel' || this.documentsToUpload[0].type == 'text/plain') {
    //             this.error.document = '';
    //             if (this.documentsToUpload[0].size < (1024 * 1024 * 15)) {
    //                 this.error.documentSize = "";
    //             } else {
    //                 this.error.document = '';
    //                 this.error.documentSize = "Document size should be less than 15 MB!.";
    //             }
    //         }
    //         else {
    //             this.error.documentSize = '';
    //             this.error.document = 'Invalid document format!';
    //         }
    //     }
    // }

    // audioChangeEvent(fileInput: any) {
    //     this.audiosToUpload = <Array<File>>fileInput.target.files;
    //     this.imageFile = fileInput;
    //     if (typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) {
    //         if (this.audiosToUpload[0].type == 'audio/mpeg' || this.audiosToUpload[0].type == 'audio/ogg' || this.audiosToUpload[0].type == 'audio/wav' || this.audiosToUpload[0].type == 'audio/mp3') {
    //             this.error.audio = '';
    //             if (this.audiosToUpload[0].size < (1024 * 1024 * 15)) {
    //                 this.error.audioSize = "";
    //             } else {
    //                 this.error.audio = '';
    //                 this.error.audioSize = "Audio size should be less than 15 MB!.";
    //             }
    //         }
    //         else {
    //             this.error.audioSize = '';
    //             this.error.audio = 'Invalid audio format!';
    //         }
    //     }
    // }

    // validateURL(textval) {
    //     var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    //     return urlregex.test(textval);
    // }

    // addAudioEmbedLink() {
    //     if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
    //         if (this.validateURL(this.message.embedLink.title)) {
    //             this.message.embedLink.audio = this.message.embedLink.title;
    //             this.message.embedLink.title = "";
    //         } else {
    //             var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
    //         }
    //     } else {
    //         var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please paste the audio link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
    //     }
    // }

    // onPostAllTypeData() {
    //     if (this.page.is_member) {
    //         this.subjectPostData.privacy = this.selectedPostPrivacyType;
    //         this.subjectPostData.types = this.types;
    //         this.subjectPostData.catagory = this.catagory;
    //         this.subjectPostData.created_on = new Date();
    //         this.subjectPostData.custom = this.selectedPostPrivacyType == 5 ? this.taggedUsersIds : [];
    //         if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
    //             if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
    //             { this.message.name.name = null; }
    //             if (this.error.photo == "") {
    //                 this.subjectPostData.photo = this.photosToUpload;
    //                 this.subjectPostData.name = this.message.name.name;
    //                 jQuery('.spin-wrap.vision-spin').fadeIn();
    //                 this.dataService.postFormData(this._dataUploadPhotosFiles, this.subjectPostData).subscribe((result) => {
    //                     if (result['status'] == 2) {
    //                         if (typeof (this.imageFile) != "undefined")
    //                             this.imageFile.target.value = "";
    //                         var image = this.element.nativeElement.querySelector('.image');
    //                         image.src = '';
    //                         image.style.display = 'none';
    //                         this.photosToUpload = [];
    //                         this.message.name.name = '';
    //                         this.categoryValue = 'General';
    //                         this.catagory = 1;
    //                         this.selectedPostPrivacyType = 1;
    //                         this.post_data.unshift(result['data']);
    //                         this.getUserTimeline();
    //                         this.taggedUsersIds = [];
    //                         this.subjectPostData = new Post();
    //                         this.page.showSuccess('Your post has been posted successfully.');
    //                         jQuery('.spin-wrap.vision-spin').fadeOut();
    //                     }
    //                 });
    //             }
    //         }
    //         else if (typeof (this.audiosToUpload) != 'undefined' && this.audiosToUpload.length > 0) {
    //             if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
    //             { this.message.name.name = null; }
    //             if (this.error.audio == '' && this.error.audioSize == '') {
    //                 jQuery('.spin-wrap.vision-spin').fadeIn();
    //                 this.subjectPostData.name = this.message.name.name;
    //                 this.subjectPostData.audio = this.audiosToUpload;
    //                 this.dataService.postFormData(this._dataUploadAudiosFiles, this.subjectPostData).subscribe((result) => {
    //                     if (result['status'] == 2) {
    //                         if (typeof (this.imageFile) != "undefined")
    //                             this.imageFile.target.value = "";
    //                         this.audiosToUpload = [];
    //                         this.message.name.name = '';
    //                         this.categoryValue = 'General';
    //                         this.catagory = 1;
    //                         this.selectedPostPrivacyType = 1;
    //                         this.taggedUsersIds = [];
    //                         this.post_data.unshift(result['data']);
    //                         this.getUserTimeline();
    //                         this.subjectPostData = new Post();
    //                         this.page.showSuccess('Your post has been posted successfully.');
    //                         jQuery('.spin-wrap.vision-spin').fadeOut();
    //                     }
    //                 });
    //             }
    //         }
    //         else if (typeof (this.videosToUpload) != 'undefined' && this.videosToUpload.length > 0) {
    //             if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
    //             { this.message.name.name = null; }
    //             if (this.error.video == '' && this.error.videoSize == '') {
    //                 jQuery('.spin-wrap.vision-spin').fadeIn();
    //                 this.subjectPostData.name = this.message.name.name;
    //                 this.subjectPostData.video = this.videosToUpload;
    //                 this.dataService.postFormData(this._dataUploadVideosFiles, this.subjectPostData).subscribe((result) => {
    //                     if (result['status'] == 2) {
    //                         if (typeof (this.imageFile) != "undefined")
    //                             this.imageFile.target.value = "";
    //                         this.taggedUsersIds = [];
    //                         this.videosToUpload = [];
    //                         this.message.name.name = '';
    //                         this.categoryValue = 'General';
    //                         this.catagory = 1;
    //                         this.selectedPostPrivacyType = 1;
    //                         this.subjectPostData = new Post();
    //                         this.post_data.unshift(result['data']);
    //                         this.getUserTimeline();
    //                         this.page.showSuccess('Your post has been posted successfully.');
    //                         jQuery('.spin-wrap.vision-spin').fadeOut();
    //                     }
    //                 });
    //             }
    //         }
    //         else if (typeof (this.documentsToUpload) != 'undefined' && this.documentsToUpload.length > 0) {
    //             if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
    //             { this.message.name.name = null; }
    //             if (this.error.document == '' && this.error.documentSize == '') {
    //                 jQuery('.spin-wrap.vision-spin').fadeIn();
    //                 this.subjectPostData.name = this.message.name.name;
    //                 this.subjectPostData.document = this.documentsToUpload;
    //                 this.subjectPostData.custom = this.selectedPostPrivacyType == 5 ? this.taggedUsersIds : [];
    //                 this.dataService.postFormData(this._dataUploadDocumentsFiles, this.subjectPostData).subscribe((result) => {
    //                     if (result['status'] == 2) {
    //                         if (typeof (this.imageFile) != "undefined")
    //                             this.imageFile.target.value = "";
    //                         this.documentsToUpload = [];
    //                         this.taggedUsersIds = [];
    //                         this.message.name.name = '';
    //                         this.categoryValue = 'General';
    //                         this.catagory = 1;
    //                         this.selectedPostPrivacyType = 1;
    //                         this.post_data.unshift(result['data']);
    //                         this.getUserTimeline();
    //                         this.subjectPostData = new Post();
    //                         this.page.showSuccess('Your post has been posted successfully.');
    //                         jQuery('.spin-wrap.vision-spin').fadeOut();
    //                     }
    //                 });
    //             }
    //         }
    //         else if (typeof (this.message.embedLink.video) != 'undefined' && this.message.embedLink.video != '') {
    //             if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
    //             { this.message.name.name = null; }
    //             jQuery('.spin-wrap.vision-spin').fadeIn();
    //             this.subjectPostData.name = this.message.name.name;
    //             this.subjectPostData.link = this.message.embedLink.video;
    //             this.dataService.postData(this._dataUploadEmbedLink, this.subjectPostData).subscribe(posts => {
    //                 if (posts['status'] == 2) {
    //                     this.taggedUsersIds = [];
    //                     this.message.embedLink.video = '';
    //                     this.message.name.name = '';
    //                     this.categoryValue = 'General';
    //                     this.catagory = 1;
    //                     this.selectedPostPrivacyType = 1;
    //                     this.post_data.unshift(posts['data']);
    //                     this.getUserTimeline();
    //                     this.subjectPostData = new Post();
    //                     this.page.showSuccess('Your post has been posted successfully.');
    //                     jQuery('.spin-wrap.vision-spin').fadeOut();
    //                 }
    //             });
    //         }
    //         else if (typeof (this.message.embedLink.audio) != 'undefined' && this.message.embedLink.audio != '') {
    //             if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
    //             { this.message.name.name = null; }
    //             jQuery('.spin-wrap.vision-spin').fadeIn();
    //             this.subjectPostData.name = this.message.name.name;
    //             this.subjectPostData.link = this.message.embedLink.audio;
    //             this.dataService.postData(this._dataUploadAudioEmbedLink, this.subjectPostData).subscribe(posts => {
    //                 if (posts['status'] == 2) {
    //                     this.message.embedLink.audio = '';
    //                     this.message.name.name = '';
    //                     this.categoryValue = 'General';
    //                     this.catagory = 1;
    //                     this.selectedPostPrivacyType = 1;
    //                     this.taggedUsersIds = [];
    //                     this.post_data.unshift(posts['data']);
    //                     this.getUserTimeline();
    //                     this.subjectPostData = new Post();
    //                     this.page.showSuccess('Your post has been posted successfully.');
    //                     jQuery('.spin-wrap.vision-spin').fadeOut();
    //                 }
    //             });
    //         }
    //         else if (typeof (this.message.embedLink.photo) != 'undefined' && this.message.embedLink.photo != '') {
    //             if (typeof this.message.name.name == 'undefined' || this.message.name.name == null || this.message.name.name == '')
    //             { this.message.name.name = null; }
    //             jQuery('.spin-wrap.vision-spin').fadeIn();
    //             this.subjectPostData.link = this.message.embedLink.photo;
    //             this.subjectPostData.name = this.message.name.name;
    //             this.dataService.postData(this._dataUploadPhotoEmbedLink, this.subjectPostData).subscribe(posts => {
    //                 if (posts['status'] == 2) {
    //                     this.message.embedLink.photo = '';
    //                     this.message.name.name = '';
    //                     this.categoryValue = 'General';
    //                     this.catagory = 1;
    //                     this.selectedPostPrivacyType = 1;
    //                     this.taggedUsersIds = [];
    //                     this.post_data.unshift(posts['data']);
    //                     this.getUserTimeline();
    //                     this.subjectPostData = new Post();
    //                     this.page.showSuccess('Your post has been posted successfully.');
    //                     jQuery('.spin-wrap.vision-spin').fadeOut();
    //                 }
    //             });
    //         }
    //         else {
    //             if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 1) && (this.message.message.message !== '')) {
    //                 this.subjectPostData.message = this.message.message.message;
    //                 this.dataService.postData(this._addPostUrl, this.subjectPostData).subscribe(posts => {
    //                     if (posts['status'] == 2) {
    //                         this.message.message.message = '';
    //                         this.categoryValue = 'General';
    //                         this.catagory = 1;
    //                         this.selectedPostPrivacyType = 1;
    //                         this.post = posts.data_post;
    //                         this.subject = posts.data_message;
    //                         this.post_data.unshift(posts.data_post);
    //                         this.getUserTimeline();
    //                         this.page.showSuccess('Your post has been posted successfully.');
    //                         this.subjectPostData = new Post();
    //                         this.taggedUsersIds = [];
    //                     }
    //                 });
    //             }
    //             else if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 2) && (this.message.question.question !== '')) {
    //                 this.subjectPostData.question = this.message.question.question;
    //                 this.dataService.postData(this._addPostUrl, this.subjectPostData).subscribe(posts => {
    //                     if (posts['status'] == 2) {
    //                         this.message.question.question = '';
    //                         this.categoryValue = 'General';
    //                         this.catagory = 1;
    //                         this.selectedPostPrivacyType = 1;
    //                         this.post = posts.data_post;
    //                         this.subject = posts.data_message;
    //                         this.post_data.unshift(posts.data_post);
    //                         this.getUserTimeline();
    //                         this.subjectPostData = new Post();
    //                         this.taggedUsersIds = [];
    //                         this.page.showSuccess('Your post has been posted successfully.');
    //                     }
    //                 });
    //             }
    //             else if ((this.postMsgLinkQuesType !== 0) && (this.postMsgLinkQuesType === 5) && (this.message.link.description !== '')) {
    //                 if (this.validateURL(this.message.link.description)) {
    //                     this.subjectPostData.link = this.message.link.description;
    //                     this.subjectPostData.linkTitle = this.message.link.title;
    //                     this.dataService.postData(this._addPostUrl, this.subjectPostData).subscribe(posts => {
    //                         if (posts['status'] == 2) {
    //                             this.message.link.description = '';
    //                             this.message.link.title = '';
    //                             this.categoryValue = 'General';
    //                             this.catagory = 1;
    //                             this.selectedPostPrivacyType = 1;
    //                             this.post = posts.data_post;
    //                             this.subject = posts.data_message;
    //                             this.taggedUsersIds = [];
    //                             this.subjectPostData = new Post();
    //                             this.post_data.unshift(posts.data_post);
    //                             this.getUserTimeline();
    //                             this.page.showSuccess('Your post has been posted successfully.');
    //                         }
    //                     });
    //                 }
    //                 else {
    //                     var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
    //                 }
    //             }
    //             else {
    //                 var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + this.notiMsg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
    //             }
    //         }
    //     } else {
    //         var n = noty({ text: '<div class="alert bg-theme-dark"><p>Please Join Subject For Posting</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 4000, });
    //     }
    // }
    //***********************Add post section end ***************/
    likesUserDetail(postId, posts, index) {
        this.modal_likes_post_id = postId;
        this.modal_likes_index = index;
        this.modal_likes_posts = posts;
        jQuery("#postLikesModal").modal({ backdrop: false });
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
        this.getUserTimeline();
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

    public onChangePostPrivacy(option: any): void {
        this.selectedPostPrivacyType = option.value;
        if (option.value == 5) {
            jQuery("#postCustomShareModel").modal({ backdrop: false });
            this.showCustomPrivacymodel = true;
        }
    }

    getCategory(category_id) {
        if (category_id == 1) return "General";
        else if (category_id == 2) return "Tip / Trick";
        else if (category_id == 3) return "Joke / Humor";
        else if (category_id == 4) return "Tutorial";
        else return "No Category";
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
        this.showFilterText = '';
        this.timelineSearchData.collegeIds = [];
        this.timelineSearchData.degreeIds = [];
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.subject_name) {
            if (this.searchData.subject_name.match(nameValid)) {
                this.mywallservice.getUserSubjects(this.searchData.subject_name).subscribe((res) => {
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
    }

    public collegeSearch(e: any): void {
        this.searchedSubjectsList = [];
        this.searchedDegreesList = [];
        this.searchData.subject_name = '';
        this.searchData.degree_name = '';
        this.timelineSearchData.subjectIds = [];
        this.timelineSearchData.degreeIds = [];
        this.showFilterText = '';
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.college_name) {
            if (this.searchData.college_name.match(nameValid)) {
                this.mywallservice.getUserColleges(this.searchData.college_name).subscribe((res) => {
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
    }

    public degreeSearch(e: any): void {
        this.searchedCollegesList = [];
        this.searchedSubjectsList = [];
        this.searchData.college_name = '';
        this.searchData.subject_name = '';
        this.timelineSearchData.subjectIds = [];
        this.timelineSearchData.collegeIds = [];
        this.showFilterText = '';
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.degree_name) {
            if (this.searchData.degree_name.match(nameValid)) {
                this.mywallservice.getUserDegrees(this.searchData.degree_name).subscribe((res) => {
                    if (res.status == 2) {
                        this.searchedDegreesList = res.data;
                    }
                });
            }
        }
        else {
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
    }

    public searchPost(): void {
        this.filterData();
        this.showFilterText = this.searchData.subject_name ? this.searchData.subject_name : this.searchData.college_name ? this.searchData.college_name : this.searchData.degree_name;
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.timelineSearchData.subjectIds.length || this.timelineSearchData.collegeIds.length || this.timelineSearchData.degreeIds.length) {
            if (this.showFilterText && this.showFilterText.match(nameValid)) {
                this.loader = true;
                this.searchCounter = 0;
                this.searchActive = true;
                if (this.tTimeline) {
                    this.mywallservice.userTimelinesearchPost(this.timelineSearchData, this.searchCounter).subscribe((res) => {
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
                    this.mywallservice.userSearchPost(this.timelineSearchData, this.postType, this.searchCounter).subscribe((res) => {
                        this.loader = false;
                        if (res.status == 2) {
                            if (res.data) {
                                this.postdata = res.data;
                            }
                            this.searchStatus = true;
                            this.total_result = res.total_result;
                            this.timelineSearchData = new SearchData();
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
        this.searchId = null;
        this.searchActive = false;
        this.searchCounter = 0;
        this.counterList = 0;
        this.scrollControllerPost = 1;
        this.scrollController = 1;
        this.searchData = new MyWallSearch();
        this.timelineSearchData = new SearchData();
        if (this.tTimeline) {
            this.getUserTimeline();
        } else {
            this.getUserPost(this.postType);
        }
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
        this.getUserTimeline();
    }
    public initEditor(post_Id: number) {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#inline-editor-" + post_Id);
            editorDiv.froalaEditor({
                toolbarInline: true,
                toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insertVideo', 'undo', 'redo'],
            });
            this.addEditorView[post_Id] = editorDiv.find(".fr-view");
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
    public onPostData(event: any): void {
        if (event.data) {
            this.getUserTimeline();
        }
    }

     onViewLikeClick(data) {
        this.post_id = data;
        jQuery("#like-member-list").modal({ backdrop: false });
        this.likeMemberList = true;
    }

     onLikeClose(event:any){
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

