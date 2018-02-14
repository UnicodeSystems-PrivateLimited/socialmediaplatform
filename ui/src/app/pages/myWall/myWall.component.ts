import { Component, ViewEncapsulation, Input, ElementRef, ViewChildren } from '@angular/core';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { YoutubeSafeUrlPipe } from '../../theme/pipes/youtube-safe-url';
import { BaCard, AddPostToJournalModal, SinglePostComponent} from '../../theme/components';
import { GridDataService, PageService } from '../../theme/services';
import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { ProfileAssetDetailsComponent } from '../profileAssetDetails';
import { TextFormattingPipe, DateTime, documentNameFilterPipe, LikeFilterPipe } from '../../theme/pipes';
import { nameFilterPipe } from '../../theme/pipes/name-filter';
import { BaPostShareModel } from '../../theme/components/baPostShareModel';
import { BaPostExternalShareModel } from '../../theme/components/baPostExternalShareModal';
import { MyWallSearch, SearchData, Post, PostComment } from '../../theme/interfaces';
import { MyWallService } from './myWall.service';
import { Angular2AutoScroll } from 'angular2-auto-scroll/lib/angular2-auto-scroll.directive';
import { BaScdPost, LikeMemberListComponent } from '../../theme/components';
import { FollowUnfollowStatus } from '../../theme/pipes';
import { EmbedDirective } from "../embedVideo";
import { BaPostEditModel } from '../../theme/components/baPostEditModel';
import { reportInfoComponent } from  '../../theme/components/reportInfo';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'my-wall',
    template: require('./myWall.html'),
    pipes: [nameFilterPipe, FollowUnfollowStatus, DateFormatPipe, DateTime, LikeFilterPipe, YoutubeSafeUrlPipe, TimeAgoPipe, CalendarPipe, TextFormattingPipe, documentNameFilterPipe],
    host: { 'class': 'ng-animate page1Container' },
    providers: [MyWallService],
    directives: [RouterOutlet, BaPostEditModel, EmbedDirective, SinglePostComponent, BaScdPost, LikeMemberListComponent, AddPostToJournalModal, ROUTER_DIRECTIVES, RouterLink, TOOLTIP_DIRECTIVES, BaPostExternalShareModel, ProfileAssetDetailsComponent, BaPostShareModel, Angular2AutoScroll, reportInfoComponent]
})

export class MyWallComponent {
    public dialogState = false;
    public title = { title: '' };
    public description = { description: '' };
    public Error = { descriptionError: '' };
    public post_id: number = null;
    public togglePostComment: Array<boolean> = [];
    public editCommentToggle: number = null;
    public userDashboardData;
    public timelinedata;
    public postdata;
    public photosToUpload;
    public postdataAll = [];
    public counterListPost = 0;
    public counterListTimeline = 0;
    public total_post: number;
    public total_timeline;
    public scrollController: number = 1;
    public scrollControllerPost: number = 1;
    public shared;
    public data;
    public shareCustomData;
    public initialPageStatus: boolean = true;
    router: Router;
    public errorCommentPost;
    public errorAnswerPost;
    public errorAddJournal;
    public Journal;
    public imageFile;
    public journalIndex;
    public parset;
    public parsep;
    public parsev;
    public tMessage = true;
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
    public modal_delete_post_id;
    public modal_delete_index;
    public delcommentIndex;
    public deletePost;
    public selectionOfSharing: number = 1;
    public posts;
    public togClass = [];
    public prevId: number = 0;
    public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, shareCustom: [] };
    public subjectId = 0;
    public visibility_status = 1;
    public shareVisibility_status = 1;
    public types = 1;
    public catagory = 1;
    public post_data;
    public visibilityStatus = 'Public';
    public friends: any;
    public friendsName: any;
    public customPostId: any = [];
    public wallStatus: boolean = false;
    public getAllPostsResult = [];
    public counterList = 0;
    public postsList = [];
    public tActivity = true;
    public postid: number = null;
    public userData;
    public currentlySubjectData: any;
    public user: any;
    public subjects = [];
    public cSubjectCount: number;
    public pSubjectCount: number;
    public fSubjectCount: number;
    public modal_likes_post_id;
    public modal_likes_posts = {};
    public modal_likes_index;
    public postLike = { post_id: "" };
    public postComment: Array<PostComment> = [];
    public searchData: MyWallSearch = new MyWallSearch();
    /************  share post variable  **********************/
    public showPostShareModel: boolean = false;
    public showPostExternalShareModel: boolean = false;
    public sharePostData: any = null;
    public searchedSubjectsList: Array<any> = [];
    public searchedCollegesList: Array<any> = [];
    public searchedDegreesList: Array<any> = [];
    public myWallSearchData: SearchData = new SearchData();
    public searchCounter: number = 0;
    public searchActive: boolean = false;
    public loader: boolean = false;
    public studentUser = {};
    public searchId: number = null;
    public searchStatus: boolean = false;
    public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
    private post_type = {
        SENDREQ: 0,
    };
    public msg: string;
    public sharing: Array<boolean> = [];
    public currentUserId: number;
    public prevComment: Array<any> = [];
    public oldComment: Array<any> = [];
    public addEditorView: Array<any> = [];
    public editEditorView: any = null;
    public subscriber: any = null;
    public showFilterText: string = '';
    public addPostToJournal: boolean = false;
    public addReportInfo: boolean = false;
    
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
    public postType: number = 10;
    public contentLoding: boolean = false;
    @ViewChildren('cmp') components;
    public likeData: Array<any> = [];
    public likeMemberList: boolean = false;

    /**
     * API URLs
     */
    private _dataUrlGetAllpost = '/api/post/getMyWallPosts/';
    private _dataUrl = '/api/user/profile/full';
    private _dataUrlProfileDetail = '/api/user/getProfileData';
    public _dataAddLike = '/api/post/addLike/';
    public _dataAddComment = '/api/post/addComment/';
    public _dataEditComment = '/api/post/editComment/';
    public _deleteComment = '/api/post/deleteComment/';
    private _dataUrlDashboardProfileDetail = '/api/user/dashboard/getProfileData';
    public _getPostByPostId = '/api/post/post/';
    public _addShareUrl = '/api/post/shareOnTimeline/';
    public _friendListUrl = '/api/user/getAllTypeFriends';
    private _dataProfileByUser = 'api/user/getUserProfileData/';
    public _addFriendUrl = '/api/user/addFriend';
    public _addFriendNotification = '/api/notification/addNotification/';
    public _dataUrlCancelFriend = '/api/user/cancelFriend';
    private _dataUrladdFollower = 'api/user/addFollower/';
    private _dataUrlUnFollow = 'api/user/unFollow/';
    public _headerDataUrl = '/api/user/getHeaderData';
    private deletePostUrl = "/api/post/deleteTimelinePost";

    public ptype: number = null;
    public pi: number = null;
    public showSinglePostModel: boolean = false;
    public editPostData: any = null;
    public showPostEditModel: boolean = false;
    public postDeleteData = { postId: '', wallId: '', wallType: '' };

    constructor(
        private sanitizer: DomSanitizationService,
        private dataService: GridDataService,
        private page: PageService,
        routeParams: RouteParams,
        router: Router,
        private service: MyWallService,
        private element: ElementRef) {
        this.router = router;
        this.page.join = 1;

        if (routeParams.get('ptype')) {
            this.ptype = +routeParams.get('ptype');
        }
        if (routeParams.get('pi')) {
            this.pi = +routeParams.get('pi');
            if (this.ptype == 1 || this.ptype == 2 || this.ptype == 5 || this.ptype == 7 || this.ptype == 8) {
                setTimeout(() => {
                    this.singlePost(this.pi);
                }, 2000);
            } else {
                setTimeout(() => {
                    this.getDetailView(this.pi);
                }, 2000);
            }
        }
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.page.friendProfileId = '';
        this.page.wallId = '';
        this.getPosts(this.postType);
        this.getUserProfileDashboardData();
        this.getUserProfile();
        this.getUserProfileData();
        this.allLinkActive = true;

    }

    public getPosts(postType: number): void {
        this.postType = postType;
        if (!this.searchActive) {
            this.clearScrollContent();
            this.loader = true;
            this.searchActive = false;
            this.dataService.getData(this._dataUrlGetAllpost + this.postType + '/' + this.counterList).subscribe(res => {
                this.loader = false;
                if (res.status == 2) {
                    if (res.data.length) {
                        this.postsList = res.data;
                    }
                    this.total_post = res.total_post;
                } else {
                    console.log('no data found');
                }
            });
        } else {
            this.searchPost();
        }
    }

    public getUserProfile(): void {
        this.dataService.getData(this._dataUrl).subscribe(user => {
            this.user = user;
        });
    }

    public getUserProfileData(): void {
        this.dataService.getData(this._dataUrlProfileDetail).subscribe(res => {
            this.userData = res;
            this.currentlySubjectData = (this.userData.current_subjects.length) - 1;
            this.subjects = res.subjects;
            this.cSubjectCount = res.current_subjects.length;
            this.pSubjectCount = res.past_subjects.length;
            this.fSubjectCount = res.future_subjects.length;
        });
    }

    public getDetailView(id): void {
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

    public getFoldername(type) {
        if (type == 1) return "Subject";
        if (type == 2) return "College";
        if (type == 3) return "Degree";
        if (type == 5) return "Timeline";
        if (type == 6) return "GroupWall";
    }

    public addLike(post_id, posts, j): void {
        this.postLike.post_id = post_id;
        this.dataService.postData(this._dataAddLike, this.postLike)
            .subscribe(res => {
                if (res.status == 2) {
                    posts.likes = res.data;
                }
            });
    }

    public toggleCommentPost(comments: any, post_Id: number): void {
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

    public getProfileById(id): void {
        if (this.page.userIdGlobal == id) {
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else {
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }

    public openCommentModal(comment, post_id): void {
        this.postComment[post_id].editComment = comment.body;
        this.editCommentToggle = comment._id;
        this.initEditEditor(post_id, comment.body);
    }

    public closeCommentModal(): void {
        this.errorCommentPost = "";
        this.editCommentToggle = null;
    }

    public editComment(post_id, comment_id, posts, j): void {
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
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Field is required.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        }
    }

    public addComment(post_id, posts): void {
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
            this.errorCommentPost = "Field is required";
        }
    }
    public deleteCommentModel(post_id, comment_id, j, posts): void {
        this.modal_post_id = post_id;
        this.modal_comment_id = comment_id;
        this.delcommentIndex = j;
        this.deletePost = posts;
        jQuery("#commentDeleteModal").modal({ backdrop: false });
    }

    public deleteComment(): void {
        this.dataService.getData(this._deleteComment + this.modal_post_id + '/' + this.modal_comment_id)
            .subscribe(res => {
                if (res['status'] === 2) {
                    this.deletePost.comments = res.data;
                    this.oldComment[this.modal_post_id] = [];
                    this.oldComment[this.modal_post_id] = this.deletePost.comments;
                    this.postComment[this.modal_post_id] = new PostComment();
                    this.prevComment[this.modal_post_id].splice(this.delcommentIndex, 1);
                    this.page.showSuccess(res.msg);
                }
            });
    }






    checkboxValue(ids) {
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





    getUserProfileDashboardData() {
        this.dataService.getData(this._dataUrlDashboardProfileDetail).subscribe(res => {
            this.userDashboardData = res;
        });
    }




    onScrollListPost(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#activity').css('display') !== 'none')) {
            if (!this.searchActive) {
                if (this.scrollControllerPost) {
                    if (this.postType != null) {
                        this.scrollControllerPost = 0;
                        this.parsep = this.total_post / 10
                        var page = parseInt(this.parsep);
                        if (this.counterList <= (page + 1)) {
                            this.counterList++;
                            this.contentLoding = true;
                            this.dataService.getData(this._dataUrlGetAllpost + this.postType + '/' + this.counterList).subscribe(res => {
                                if (res.data.length) {
                                    this.postsList = this.postsList.concat(res.data);
                                }
                                for (var i = 0; i < this.postsList.length; i++) {
                                    this.togClass.push('true');
                                }
                                this.scrollControllerPost = 1;
                                this.contentLoding = false;
                            });
                        }
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
                        this.contentLoding = true;
                        this.service.searchPost(this.myWallSearchData, this.postType, this.searchCounter).subscribe(res => {
                            if (res.status == 2) {
                                if (res.data) {
                                    this.postsList = this.postsList.concat(res.data);
                                }
                                for (var i = 0; i < this.postsList.length; i++) {
                                    this.togClass.push('true');
                                }
                                this.myWallSearchData = new SearchData();
                            }
                            this.scrollControllerPost = 1;
                            this.contentLoding = false;
                        });
                    }
                }
            }
        }
    }

    initialPage() {
        this.initialPageStatus = false;
    }

    ngOnDestroy() {
        this.initialPageStatus = true;
    }

    closeStateDialog(post_id) {
        this.dialogState = false;
        if (!this.ptype && !this.pi) {
            this.dataService.getData(this._getPostByPostId + post_id).subscribe(post => {
                if (this.postsList != null) {
                    for (var j = 0; j < this.postsList.length; j++) {
                        if (this.postsList[j]._id == post_id) {
                            this.postsList[j] = post[0];
                        }
                    }
                }
            });
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
        this.searchedCollegesList = [];
        this.searchedDegreesList = [];
        this.searchData.college_name = '';
        this.searchData.degree_name = '';
        this.showFilterText = '';
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.subject_name) {
            if (this.searchData.subject_name.match(nameValid)) {
                this.service.getSearchSubjects(this.searchData.subject_name).subscribe((res) => {
                    if (res.status == 2) {
                        this.searchedSubjectsList = res.data;
                    }
                })
            }
        } else {
            this.searchData.subject_name = '';
            this.searchedSubjectsList = [];
            this.myWallSearchData.subjectIds = [];
        }
    }

    public selectSubject(id: number, name: string): void {
        this.searchStatus = false;
        this.searchId = id;
        this.searchData.subject_name = name;
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
        this.searchData.degree_name = '';
        this.searchData.subject_name = '';
        this.showFilterText = '';
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.college_name) {
            if (this.searchData.college_name.match(nameValid)) {
                this.service.getSearchColleges(this.searchData.college_name).subscribe((res) => {
                    if (res.status == 2) {
                        this.searchedCollegesList = res.data;
                    }
                })
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
        this.searchData.college_name = '';
        this.searchData.subject_name = '';
        this.showFilterText = '';
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.searchData.degree_name) {
            if (this.searchData.degree_name.match(nameValid)) {
                this.service.getSearchDegrees(this.searchData.degree_name).subscribe((res) => {
                    if (res.status == 2) {
                        this.searchedDegreesList = res.data;
                    }
                })
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
                this.searchCounter = 0;
                this.searchActive = true;
                this.loader = true;
                this.service.searchPost(this.myWallSearchData, this.postType, this.searchCounter).subscribe((res) => {
                    this.loader = false;
                    if (res.status == 2) {
                        if (res.data) {
                            this.postsList = res.data;
                        }
                        this.searchStatus = true;
                        this.myWallSearchData = new SearchData();
                        this.total_post = res.total_post;
                    }
                });
            }
            else {
                this.showFilterText = '';
                this.page.showError('Please select valid subject,college or degree name.');
            }
        } else {
            this.page.showError('Please select valid subject,college or degree name.');
            this.showFilterText = '';
        }
    }

    public searchReset(): void {
        this.showFilterText = '';
        this.searchActive = false;
        this.searchCounter = 0;
        this.counterList = 0;
        this.scrollControllerPost = 1;
        this.searchId = null;
        this.searchData = new MyWallSearch();
        this.myWallSearchData = new SearchData();
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

    public getGroupWall(id: any) {
        this.router.navigate(['GroupWallComponent', { id: id }]);
    }
    public clearScrollContent(): void {
        this.counterList = 0;
        this.scrollControllerPost = 1;
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
    public onPostData(event: any): void {
        if (event.data) {
            this.counterList = 0;
            this.getPosts(this.postType);
        }
    }

    onViewLikeClick(data) {
        this.post_id = data;
        jQuery("#like-member-list").modal({ backdrop: false });
        this.likeMemberList = true;
    }

    public singlePost(id): void {
        this.postid = id;
        jQuery("#singlePostMywallModel").modal({ backdrop: false });
        this.showSinglePostModel = true;
    }
    public closeSinglePostDialog(): void {
        this.showSinglePostModel = false;
        jQuery("#singlePostMywallModel").modal('hide');
    }

    public onLikeClose(event: any) {
        this.likeMemberList = false;
        jQuery("#like-member-list").modal('hide');
    }
    /**********   Edit Post Methods  *************************/
    public editPost(postData: any): void {
        console.log(postData);
        this.editPostData = postData;
        jQuery("#postEditModel").modal({ backdrop: false });
        this.showPostEditModel = true;
    }
    public onPostEditModelClose(event: any): void {
        this.showPostEditModel = false;
        jQuery('#postEditModel').modal('hide');
        this.editPostData = null;
        if (event.data != null) {
            for (var i = 0; i < this.postsList.length; i++) {
                if (this.postsList[i]._id == event.data.result._id) {
                    this.postsList[i] = event.data.result;
                }
            }
        }
    }
    deletePostModel(post, index) {
        this.postDeleteData.postId = post._id;
        this.postDeleteData.wallType = post.types;
        this.modal_delete_index=index;
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
        this.dataService.postData(this.deletePostUrl ,this.postDeleteData).subscribe(res => {
            if (res.status == 2) {
                this.postsList.splice(this.modal_delete_index, 1);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Post has been deleted successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-error"><p>' + res['data'].message + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
        });
    }
}

