import { Component, ViewEncapsulation, Input, ElementRef, ViewChildren } from '@angular/core';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { YoutubeSafeUrlPipe } from '../../theme/pipes/youtube-safe-url';
import { GridDataService, PageService } from '../../theme/services';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { ProfileAssetDetailsComponent } from '../profileAssetDetails';
import { TextFormattingPipe, DateTime, documentNameFilterPipe } from '../../theme/pipes';
import { nameFilterPipe } from '../../theme/pipes/name-filter';
import { BaPostShareModel } from '../../theme/components/baPostShareModel';
import { Post, PostComment } from '../../theme/interfaces';
import { EventWallService } from './eventWall.service';
import { BaPostCustomPrivacyModel } from '../../theme/components/baPostCustomPrivacyModel';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'event-wall',
    template: require('./eventWall.html'),
    pipes: [nameFilterPipe, DateFormatPipe, DateTime, YoutubeSafeUrlPipe, TimeAgoPipe, CalendarPipe, TextFormattingPipe, documentNameFilterPipe],
    providers: [EventWallService],
    directives: [RouterOutlet, ROUTER_DIRECTIVES, RouterLink, TOOLTIP_DIRECTIVES, ProfileAssetDetailsComponent, BaPostCustomPrivacyModel, BaPostShareModel]
})

export class EventWallComponent {
    public eventPost: Post = new Post();
    public event: any = {};
    public tMessage: boolean = true;
    public tPhoto: boolean = false;
    public tAudio: boolean = false;
    public tVideo: boolean = false;
    public tDocument: boolean = false;
    public tQuestion: boolean = false;
    public tLink: boolean = false;
    public notiMsg: string;
    public imageFile;
    public postMsgLinkQuesType = 1;
    public message = { name: { name: '' }, message: { message: '' }, link: { title: '', description: '' }, question: { question: '' }, date: { date: new Date() }, embedLink: { title: '', video: '', audio: '', photo: '' }, custom: [], shareCustom: [] };
    public error = { photo: '', video: '', audio: '', document: '', audioSize: '', videoSize: '', documentSize: '' };
    public postComment: Array<PostComment> = [];
    public visibilityStatus = 'Public';
    public categoryValue = 'General';
    public selectedPostPrivacyType: number = 1;
    public showCustomPrivacymodel: boolean = false;
    public postPrivacyTypes: any = [{ label: "Public", value: 1 }, { label: "Private(Only Me)", value: 2 }, { label: "All Friends", value: 3 }, { label: "All Followers", value: 4 }, { label: "All Friends And Followers", value: 6 }, { label: "Custom", value: 5 }];
    public catagory = 1;
    public visibility_status = 1;
    public taggedUsersIds: Array<number> = [];
    public searchCategoryValue = 'General';
    public whoPostedValue = 'All Members';
    public searchDateFrom = new Date();
    public searchDateTo = new Date();
    public category = 1;
    public who_posted = 1;
    private counterList: number;
    public scrollController: number;
    public allLinkActive: boolean = false;
    public statusLinkActive: boolean = false;
    public photosLinkActive: boolean = false;
    public videosLinkActive: boolean = false;
    public linksLinkActive: boolean = false;
    public documentsLinkActive: boolean = false;
    public audioLinkActive: boolean = false;
    public activeDataAll = 'all';
    public activeDataStatus = 'status';
    public activeDataPhotos = 'photos';
    public activeDataVideos = 'videos';
    public activeDataLinks = 'links';
    public activeDataDocument = 'documents';
    public activeDataAudio = 'audio';
    private counterListForSpecificPost: number;
    public contentLoding: boolean = false;
    public eventMemberCount: number = 0;
    public tmainVideo = true;
    public tlinkVideo = false;
    public tmainAudio = true;
    public tlinkAudio = false;
    public tmainPhoto = true;
    public tlinkPhoto = false;
    public user: any = {};
    public searching: boolean = false;
    public setPostType = '';
    public studentUser = {};
    public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
    private post_type = {
        SENDREQ: 0,
    };
    public currentUserId: number;
    public msg: string;

    constructor(
        private dataService: GridDataService,
        private page: PageService,
        routeParams: RouteParams,
        router: Router,
        private service: EventWallService,
        private element: ElementRef) {
    }

    ngOnInit() {
        this.getUserProfile();
        this.page.friendProfileId = '';
        this.postMsgLinkQuesType = 1;
        this.allLinkActive = true;
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


    /**Searching Start */
    closeSearchBox() {
        jQuery("#togglingSearch").toggle();
        jQuery("#changeClass").toggleClass('fa fa-plus', 'add');
        jQuery("#changeClass").toggleClass('fa fa-minus', 'remove');
    }
    search_catagories(catagory) {
        this.category = catagory;
        if (catagory == 1) {
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
    resetSearch() {
        this.searchCategoryValue = 'General';
        this.whoPostedValue = 'All Members';
        jQuery('input[name="search-date-from-2"]').val('');
        jQuery('input[name="search-date-to-2"]').val('');
        // this.getAllTypeOfPost();
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
    openStartEndTime() {
        jQuery('input[name="search-date-to-2"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        jQuery('input[name="search-date-from-2"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
    }

    getAllTypeOfSearchPost() {
        this.counterList = 0;
        this.searching = true;
        this.setPostType = '';
        var currentDate = new Date();
        var yesterday = new Date(currentDate.getTime());
        yesterday.setDate(currentDate.getDate() - 1);
        if (jQuery('input[name="search-date-from-2"]').val() == '') {
            this.searchDateFrom = yesterday;
        } else {
            var searchFrom = jQuery('input[name="search-date-from-2"]').val();
            searchFrom = searchFrom.split('-');
            this.searchDateFrom = new Date(searchFrom[2], searchFrom[1] - 1, searchFrom[0]);
        }
        if (jQuery('input[name="search-date-to-2"]').val() == '') {
            this.searchDateTo = currentDate;
        }
        else {
            var searchTo = jQuery('input[name="search-date-to-2"]').val();
            searchTo = searchTo.split('-');
            this.searchDateTo = new Date(searchTo[2], searchTo[1] - 1, searchTo[0]);
        }
        //want to extract full day post dat's y +1
        this.searchDateTo.setDate(this.searchDateTo.getDate() + 1);
        // this.dataService.getData(this._getSearchPostUrl + this.collegeId + '/' + this.counterList + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.category + '/' + this.who_posted).subscribe(post => {
        //     if (post.data) {
        //         this.post_data = post.data;
        //     }
        //     for (var i = 0; i < this.post_data.length; i++) {
        //         this.postSubjectEditMsg.push('true');
        //     }
        //     this.isResult = post.isResult;
        // });
        // this.dataService.getData(this._getSearchPostCountUrl + this.collegeId + '/' + this.searchDateFrom + '/' + this.searchDateTo + '/' + this.category + '/' + this.who_posted).subscribe(post => {
        //     if (post.status == 2)
        //         this.total_post = post.data;
        // });
    }
    /**Searching End */
    /** Events Post Listing */
    checkActiveClass(val) {
        this.clearScrollContent();
        if (val == this.activeDataAll) {
            this.allLinkActive = true;
            this.statusLinkActive = false;
            this.photosLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
        } else if (val == this.activeDataStatus) {
            this.allLinkActive = false;
            this.statusLinkActive = true;
            this.photosLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
        } else if (val == this.activeDataPhotos) {
            this.allLinkActive = false;
            this.photosLinkActive = true;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
        } else if (val == this.activeDataVideos) {
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = true;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
        } else if (val == this.activeDataLinks) {
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = true;
            this.documentsLinkActive = false;
        } else if (val == this.activeDataDocument) {
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = false;
            this.linksLinkActive = false;
            this.documentsLinkActive = true;
        } else if (val == this.activeDataAudio) {
            this.allLinkActive = false;
            this.photosLinkActive = false;
            this.statusLinkActive = false;
            this.videosLinkActive = false;
            this.audioLinkActive = true;
            this.linksLinkActive = false;
            this.documentsLinkActive = false;
        }
    }
    public clearScrollContent(): void {
        this.counterList = 0;
        this.scrollController = 1;
        this.counterListForSpecificPost = 0;
        // if (this.postSubjectEditMsg.indexOf('false') > -1) {
        //     this.postSubjectEditMsg[this.postSubjectEditMsg.indexOf('false')] = 'true';
        // }
    }
    addVideoEmbedLink() {
        if (typeof (this.message.embedLink.title) != 'undefined' && (this.message.embedLink.title != "" && this.message.embedLink.title != null)) {
            var myId = this.getId(this.message.embedLink.title);
            if (myId) {
                this.message.embedLink.video = myId;
                this.message.embedLink.title = "";
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Invalid url!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
            }
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>please paste the youtube link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
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
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>please paste the audio link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
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
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>please paste the photo link here!.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 2000, });
        }
    }

    clearEmbedLink(activeVar) {
        this.message.name.name = '';
        this.message.embedLink.title = '';
        if (activeVar == 1) {
            this.tmainPhoto = !this.tmainPhoto;
            this.tlinkPhoto = !this.tlinkPhoto;
        }
        else if (activeVar == 2) {
            this.tmainVideo = !this.tmainVideo;
            this.tlinkVideo = !this.tlinkVideo;
        }
        else {
            this.tmainAudio = !this.tmainAudio;
            this.tlinkAudio = !this.tlinkAudio;
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

    getUserProfile() {
        this.service.getUserProfile().subscribe(user => {
            this.user = user;
        });
    }

    userPopupOpen(e, _id) {
        this.currentUserId = _id;
        this.service.getProfileByUser(this.currentUserId).subscribe(user => {
            this.studentUser = user;
        });
    }

    addAsFriend(studentUser) {
        this.addFriendTitle.recepient = studentUser;
        this.service.addFriend(this.currentUserId).subscribe(res => {
            if (res.status == 2) {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request sent</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                studentUser.current_friends_status_code = 1;
                this.service.addFriendNoti(this.currentUserId, this.post_type.SENDREQ, this.addFriendTitle).subscribe(res => {
                });
            }
            else {
                studentUser.current_friends_status_code = res.friendStatus;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + res.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        });

    }
    cancelRequestedFriend(studentUser) {
        this.service.cancleFriendRequest(this.currentUserId).subscribe(friends => {
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

    setFollow(studentUser) {
        this.studentUser = studentUser;
        this.service.setFollow(this.currentUserId).subscribe(res => {
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
        this.service.setUnfollow(this.currentUserId).subscribe(res => {
            if (res.status == 2) {
                this.msg = res.msg;
                this.studentUser['followersCount'] = res.followersCount;
                this.studentUser['followers'] = res.followers;
                studentUser.following_friend_status_code = 6;
            } else this.msg = 'error';
        });
    }


}