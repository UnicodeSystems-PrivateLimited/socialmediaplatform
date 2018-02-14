import { Component, ViewEncapsulation, ElementRef, ViewChild, Directive, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common'
import { BaPageTop, BaContentTop, BaSidebar, BaBackTop, InviteFriendsModel, SinglePostComponent } from '../theme/components';
import { DashboardHome } from './dashboardHome';
import { BachelorView } from './bachelor-view';
import { BlogHome } from './blogHome';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated'
import { BlogPost } from './blogPost';
import { Location } from '@angular/common';
import { CollegeWall } from './college-wall';
import { CollegePastCurrentMember } from './collegePastCurrentMember';
import { Event } from './event';
import { EventMember } from './eventMember';
import { GroupsComponent } from './group';
import { GroupsMemberComponent } from './groupsMember';
import { Connection } from './connection';
import { PastCurrentMember } from './pastCurrentMember';
import { JournalComponent } from './journal';
import { Logout } from './logout';
import { ProfileAssetDetailsComponent } from './profileAssetDetails';
import { ProfileAssetFriendDetailsComponent } from './profileAssetFriendDetails';
import { ProfileByUserComponent } from './profileByUser';
import { ProfileConnectionComponent } from './profileConnection';
import { SettingsComponent } from './settings';
import { SubjectWallComponent } from './subject-wall';
import { UserDetail } from './userDetail';
import { UserListComponent } from './userList';
import { UserProfileComponent } from './userProfile';
import { MasterWallComponent } from './masterWall';
import { AutoBoatComponent } from './autoBoat';
import { SubjectPastCurrentComponent } from './subjectPastCurrentMember';
import { BachelorPastCurrentComponent } from './degreePastCurrentMember';
import { UserSearchComponent } from './userSearch';
import { PageService, GridDataService, CommonService} from '../theme/services'
import { EventDetailComponent } from './eventDetail';
import { GroupInvitationComponent } from './groupInvitationPage';
import { NotificationListComponent } from './notificationList';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ng2-img-cropper';
import { Ng2InputFile } from '../theme/components/ng2-input-file/ng2-input-file.component';
import { nameFilterPipe } from '../theme/pipes/name-filter/name_filter.pipe';
import { PrivacyPolicyComponent } from './privacyPolicy';
import { TermOfUseComponent } from './termOfUse';
import { FaqComponent } from './faq';
import { ContactUsComponent } from './contactUs';
import { MyWallComponent } from './myWall';
import { GlobalSearch } from './globalSearch';
import { GlobalSearchList } from './globalSearchList';
import { EventWallComponent } from './eventWall';
import { GroupWallComponent } from './groupWall';
import { MemberListComponent } from './memberList';
import { RecentPostCountPipe, SCDJoinStatus, NotificationCountPipe, DateTime} from '../theme/pipes';
import { moment } from '../moment.loder';
import { AddSCD, JoinSCD } from '../theme/interfaces';
import { MyWallService } from './myWall/myWall.service';
import { GroupService } from './group/group.service';
import { FollowUnfollowStatusService} from '../theme/pipes/getFollowUnFollowStatus/getFollowUnfollowStatus.service';
import {ListComponent} from './list';
import {ListMemberComponent} from './listMember';
import { AboutComponent } from './about';

declare var jQuery: any;
declare var noty: any;
declare var require: any;
declare var window: any;

declare var datepicker: any;
declare function unescape(s: string): string;

@Directive({
    selector: '[infinite-scroll]',
    host: { '(scroll)': 'track($event)' }
})
class InfiniteScrollerDirective {
    @Output() scrolled = new EventEmitter();
    track(event: Event) {
        this.scrolled.emit({
            value: event
        });
    }

}

@RouteConfig([
    {
        name: 'Connection',
        component: Connection,
        path: '/connection/:id'
    },
    {
        name: 'DashboardHome',
        component: DashboardHome,
        path: '/dashboardHome'
    },
    {
        name: 'BachelorView',
        component: BachelorView,
        path: '/bachelor-view/:degreeId',
    },
    {
        name: 'BlogHome',
        component: BlogHome,
        path: '/blogHome/:id',
    },
    {
        name: 'BlogPost',
        component: BlogPost,
        path: '/blogPost/:id',
    },
    {
        name: 'CollegeWall',
        component: CollegeWall,
        path: '/college-wall/:collegeId',
    },
    {
        name: 'CollegePastCurrentMember',
        component: CollegePastCurrentMember,
        path: '/collegePastCurrentMember/:collegeId/:id',
    },
    {
        name: 'Event',
        component: Event,
        path: '/event',
    },
    {
        name: 'EventMember',
        component: EventMember,
        path: '/eventMember',
    },
    {
        name: 'EventDetail',
        component: EventDetailComponent,
        path: '/eventDetail/:eventId',
    },
    {
        name: 'GroupsComponent',
        component: GroupsComponent,
        path: '/group',
    },
    {
        name: 'GroupsMemberComponent',
        component: GroupsMemberComponent,
        path: '/groupsMember/:groupId',
    },
    {
        name: 'GroupInvitation',
        component: GroupInvitationComponent,
        path: '/groupsInvite',
    },
    {
        name: 'Journal',
        component: JournalComponent,
        path: '/journal/:journal_id',
    },
    {
        name: 'MasterWall',
        component: MasterWallComponent,
        path: '/masterWall',
    },
    {
        name: 'PastCurrentMember',
        component: PastCurrentMember,
        path: '/pastCurrentMember/:degreeId/:id',
    },
    {
        name: 'ProfileAssetFriendDetailsComponent',
        component: ProfileAssetFriendDetailsComponent,
        path: '/profileAssetFriendDetails/:postId',
    },
    {
        name: 'ProfileAssetDetailsComponent',
        component: ProfileAssetDetailsComponent,
        path: '/profileAssetDetails/:postId',
    },
    {
        name: 'ProfileByUserComponent',
        component: ProfileByUserComponent,
        path: '/profileByUser/:userId',
    },
    {
        name: 'ProfileConnectionComponent',
        component: ProfileConnectionComponent,
        path: '/profileConnection/:userId/:id',
    },
    {
        name: 'Settings',
        component: SettingsComponent,
        path: '/settings',
    },
    {
        name: 'Profile',
        component: SettingsComponent,
        path: '/profile',
    },
    {
        name: 'SubjectWallComponent',
        component: SubjectWallComponent,
        path: '/subject-wall/:subjectId',
    },
    {
        name: 'SubjectPastCurrentComponent',
        component: SubjectPastCurrentComponent,
        path: '/subjectPastCurrentMember/:subjectId/:id',
    },
    {
        name: 'DegreePastCurrentMemberComponent',
        component: BachelorPastCurrentComponent,
        path: '/degreePastCurrentMember/:degreeId/:id',
    },
    {
        name: 'UserDetail',
        component: UserDetail,
        path: '/userDetail',
    },
    {
        name: 'UserList',
        component: UserListComponent,
        path: '/userList'
    },
    {
        name: 'UserProfile',
        component: UserProfileComponent,
        path: '/userProfile',
    },
    {
        name: 'User.UserSearch',
        component: UserSearchComponent,
        path: '/userSearch',
    },
    {
        name: 'EventDetail',
        component: EventDetailComponent,
        path: '/event-detail/:eventId',
    },
    {
        name: 'TermOfUseComponent',
        component: TermOfUseComponent,
        path: '/termOfUse',
    },
    {
        name: 'PrivacyPolicyComponent',
        component: PrivacyPolicyComponent,
        path: '/privacyPolicy',
    },
    {
        name: 'FaqComponent',
        component: FaqComponent,
        path: '/faq',
    },
    {
        name: 'ContactUsComponent',
        component: ContactUsComponent,
        path: '/contactUs',
    },
    {
        name: 'MyWallComponent',
        component: MyWallComponent,
        path: '/myWall',
        useAsDefault: true
    },
    {
        name: 'GlobalSearch',
        component: GlobalSearch,
        path: '/globalSearch',
    },
    {
        name: 'GlobalSearchList',
        component: GlobalSearchList,
        path: '/globalSearchList',
    },
    {
        name: 'EventWallComponent',
        component: EventWallComponent,
        path: '/eventWall',
    },
    {
        name: 'MemberListComponent',
        component: MemberListComponent,
        path: '/memberList',
    },
    {
        name: 'GroupWallComponent',
        component: GroupWallComponent,
        path: '/groupWall/:id',
    },
    {
        name: 'NotificationList',
        component: NotificationListComponent,
        path: '/notificationList',
    },
    {
        name: 'List',
        component: ListComponent,
        path: '/list',
    },
    {
        name: 'ListMember',
        component: ListMemberComponent,
        path: '/listMember/:id',
    },
    {
        name: 'AboutComponent',
        component: AboutComponent,
        path: '/about',
    }
])



@Component({
    selector: 'layout',
    styles: [],
    pipes: [nameFilterPipe, RecentPostCountPipe, SCDJoinStatus, NotificationCountPipe, DateTime],
    directives: [Ng2InputFile, InfiniteScrollerDirective, ProfileAssetDetailsComponent, BaPageTop, BaSidebar, BaContentTop, InviteFriendsModel, SinglePostComponent, BaBackTop, AutoBoatComponent, TOOLTIP_DIRECTIVES, ImageCropperComponent],
    template: require('./page.html'),
    providers: [GridDataService, CommonService, MyWallService, GroupService, FollowUnfollowStatusService]
})

export class Pages {

    public staticFollowStatus: typeof FollowUnfollowStatusService = FollowUnfollowStatusService;
    public profilePic = '';
    router: Router;
    location: Location;
    private dataService;
    private user;
    private _dataUrl = '/api/ping';
    private _logoutUrl = '/logout';
    public userStatus = { logout: function () { } };
    chatOpen = false;
    private dispay_image;
    public userSearchField = { name: "" };
    public userSearchList;
    public usersSearchList: Array<any> = [];
    private _profileUrl = '/api/user/profile/minimal';
    private _userSearchUrl = '/api/user/userSearch';
    private _globalSearchUrl = '/api/user/memberSearch';
    private _subjectSearchUrl = '/api/subject/subjectSearchByUser';
    private _collegeSearchUrl = '/api/college/collegeSearchByUser';
    private _degreeSearchUrl = '/api/degree/degreeSearchByUser';
    private _headerDataUrl = '/api/user/getHeaderData';
    private _dataUrlTimeline = '/api/event/getusertimeline/';
    private _checkPostStatusUrl = 'api/ruleofpost/getData';
    public type;
    private _subjectAdd = 'api/user/addSubject';
    private _collegeAdd = 'api/user/addCollege';
    private _degreeAdd = 'api/user/addDegree';
    private _collegeSearch = 'api/college/collegeSearch';
    private _degreeSearch = 'api/degree/degreeSearch';
    private _subjectSearch = 'api/subject/subjectSearch';
    private _notificationDataUrl = 'api/notification/getAllNotification';
    private _getUnreadNotificationCount = 'api/notification/getNotification';
    private _changeNotificationstatus = 'api/notification/changeNotificationstatus';
    private _changeFriendNotificationstatus = 'api/notification/changeFriendRequestNotificationstatus'
    private _getUnreadFriendNotificationCount = 'api/notification/getFriendRequestNotification';
    private _getAllFriendNotisUrl = '/api/notification/getAllFriendRequestNoti';
    private _dataUrlAddSubject = 'api/subject/addSubject';
    private _dataUrlAddOnlySubject = 'api/subject/addOnlySubject';
    private _dataUrlSubject = 'api/subject/getAllSubject/';
    private _dataUrlCollege = 'api/college/getAllCollege/';
    private _dataUrlAddOnlyCollege = 'api/college/addOnlyCollege';
    private _dataUrlAddCollege = 'api/college/addCollege';
    private _dataUrlDegree = 'api/degree/getAllDegree/';
    public _dataUrlAddOnlyDegree = 'api/degree/addOnlyDegree';
    private _dataUrlAddDegree = 'api/degree/addnewDegree';
    public college;
    public degree;
    public subject;
    public bachelors;
    public masters;
    public program;
    public filesToUpload;
    private _dataUploadProfilePicture = '/api/user/addProfilePicture/';
    private _removeProfileImageUrl = '/api/user/removeProfileImage';
    public newsubject: AddSCD = new AddSCD();
    public toggleState: boolean | any = false;
    public mobMenuState: boolean = false;
    public elementRef: ElementRef;
    public userSubscribeStatus;
    public activeItem;
    toggleSubject: boolean = false;
    toggleCollege: boolean = false;
    toggleBechlour: boolean = false;
    toggleMaster: boolean = false;
    toggleProfile: boolean = false;
    public valPhoto: boolean = false;
    public errorIcon = '';
    public imageRefresh;
    public togFrndReq: boolean = false;
    public togNotiReq: boolean = false;
    public randomCounter = 0;
    public subjectSearchField = { name: "", user_id: "" };
    public subjectSearchList;
    public collegeSearchField = { name: "", user_id: "" };
    public collegeSearchList;
    public degreeSearchField = { name: "", user_id: "" };
    public degreeSearchList;
    public wallStatus: boolean = false;
    public counterListTimeline = 0;
    public postdataAll;
    public timelinedata;
    public total_timeline;
    public tTimeline = false;
    public tActivity = false;
    public tPhoto = false;
    public tVideo = false;
    public tAudio = false;
    public tJournal = false;
    public tDocument = false;
    public tLink = false;
    public tQuestion = false;
    public subjectSearchData: any;
    public subjectSearchCount;
    public collegeSearchData: any;
    public collegeSearchCount;
    public degreeSearchData: any;
    public degreeSearchCount;
    public selectSubjectType: Array<any> = [{ label: 'Choose Category', value: 2 }, { label: 'Currently Taking / Future / Past Student', value: 1 }, { label: 'Subject Expert', value: 3 }, { label: 'Teacher of Subject', value: 4 }, { label: 'Just Interested', value: 5 }];
    public categoryValue: number = 2;
    public subjectLists = [];
    public collegeLists = [];
    public degreeLists = [];
    public showinviteFriendsModel: boolean = false;
    public showSinglePostModel: boolean = false;
    public wallType: string = null;
    public wallId: number = null;
    public collegeErrorNotice = null;
    public subjectErrorNotice = null;
    public degreeErrorNotice = null;
    public postId: number = null;
    public joinData: JoinSCD = new JoinSCD();
    public dialogState: boolean = false;
    public notiCounter: number = 0;
    public friendNotiCounter: number = 0;
    public totalNotiCount: any = 0;
    public totalFriendNotiCount: any = 0;
    public notificationData: Array<any> = [];
    public friendRequestnotificationData: Array<any> = [];
    public notiType: number = null;public errorMessage: string;
    public message = { name: { name: '' } };
    public errorAddSubject;
    public errorEditSubject;
    public errorSubjectIcon = '';
    public imageFile;
    public photosToUpload;
    public errorAddCollege;
    public errorCollegeIcon = '';
    public error = { degreeIcon: '', degreename: '', degreeOption: '' };
    public messageDegree = { name: { name: '' }, type: { type: '' } };
    public types;

    constructor(
        router: Router,
        location: Location,
        private page: PageService,
        dataService: GridDataService,
        elementRef: ElementRef,
        private myWallService: MyWallService,
        private groupService: GroupService,
        private followService: FollowUnfollowStatusService
    ) {
        this.router = router;
        this.location = location;
        this.dataService = dataService;
        this.filesToUpload = [];
        this.page = page;
        this.elementRef = elementRef;
        this.name = 'Angular2'
        this.cropperSettings1 = new CropperSettings();
        this.cropperSettings1.width = 400;
        this.cropperSettings1.height = 400;
        this.cropperSettings1.croppedWidth = 400;
        this.cropperSettings1.croppedHeight = 400;
        this.cropperSettings1.canvasWidth = window.innerWidth < 768 ? 340 : 500;
        this.cropperSettings1.canvasHeight = 200;
        this.cropperSettings1.minWidth = 400;
        this.cropperSettings1.minHeight = 400;
        this.cropperSettings1.rounded = false;
        this.cropperSettings1.noFileInput = true;
        this.cropperSettings1.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
        this.cropperSettings1.cropperDrawSettings.strokeWidth = 2;
        this.data1 = {};
        this.page.getNotiArriveStatus().subscribe((res) => {
            if (res) {
                this.getNotification();
            }
        });
        this.page.getFriendNotiArriveStatus().subscribe((res) => {
            if (res) {
                this.getFriendRequestNotifications();
            }
        });
        this.page.getIsGroupAddedStatus().subscribe((res) => {
            if (res) {
                this.inviteFriends();
            }
        });
        this.page.getIsGroupChatNotiStatus().subscribe((res) => {
            if (res) {
                setTimeout(() => {
                    this.mytoggle();
                }, 200)
                this.togReq(3);
                this.closeMobileMenu();
            }
        });
        this.page.getOnUserFollow().subscribe((res) => {
            if (res) {
                this.getUserFollowingIds();
            }
        });
        this.getUserFollowingIds();
    }
    name: string;
    data1: any;
    cropperSettings1: CropperSettings;
    public imageWidth = null;
    public imageHeight = null;
    public _URL = window['URL'];

    @ViewChild('cropper', undefined) cropper: ImageCropperComponent;

    cropped(bounds: Bounds) {
        console.log(bounds);
    }

    wallModalopen() {
        if (this.wallStatus) {
            jQuery("#wallListsModal").hide();
            this.wallStatus = false;
        }
        else {
            jQuery("#wallListsModal").show();
            this.wallStatus = true;
        }
    }

    getUserTimeline() {
        this.postdataAll = null;
        this.counterListTimeline = 0;
        this.dataService.getData(this._dataUrlTimeline + this.counterListTimeline).subscribe(user => {
            this.timelinedata = user.data;
            this.total_timeline = user.total_timeline;
        });
        this.tTimeline = true;
        this.tActivity = this.tAudio = this.tDocument = this.tJournal = this.tLink = this.tVideo = this.tQuestion = this.tPhoto = false;

    }


    subjectModalopen() {
        this.getHeaderData();
        if (this.subjectSearchField.name != '') {
            this.subjectSearchList = null;
            this.subjectSearchField.name = null;
        }
        jQuery("#subjectListsModal").modal();
    }
    subjectList() {
        if (this.subjectSearchField.name != '') {
            this.subjectSearchList = null;
            this.subjectSearchField.name = null;
            jQuery("#subjectListsModal").modal('hide');

        }
    }

    // closeSubjectListModal() {
    //     jQuery("#subjectListsModal").modal('hide');
    //     this.page.wall_type = '';
    //     this.navType = false;
    // }
    subjectSearch(event, userId) {
        if (this.subjectSearchField.name == '' || this.subjectSearchField.name == null) {
            this.subjectSearchList = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (this.subjectSearchField.name.match(nameValid)) {
                this.subjectSearchField.user_id = userId;
                this.myWallService.getSearchedSubjects(this.subjectSearchField.name)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.subjectSearchList = res.subjects;
                        } else {
                            this.subjectSearchList = null;
                        }
                    });
            }
        }
    }
    collegeModalopen() {
        this.getHeaderData();
        if (this.collegeSearchField.name != '') {
            this.collegeSearchList = null;
            this.collegeSearchField.name = null;
        }
        jQuery("#collegeListsModal").modal('show');
    }
    collegeList() {
        if (this.collegeSearchField.name != '') {
            this.collegeSearchList = null;
            this.collegeSearchField.name = null;
            jQuery("#collegeListsModal").modal('hide');

        }
    }

    collegeSearch(event, userId) {
        if (this.collegeSearchField.name == '' || this.collegeSearchField.name == null) {
            this.collegeSearchList = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (this.collegeSearchField.name.match(nameValid)) {
                this.collegeSearchField.user_id = userId;
                this.myWallService.getSearchedColleges(this.collegeSearchField.name)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.collegeSearchList = res.colleges;
                        } else this.collegeSearchList = null;
                    });
            }
        }
    }
    degreeModalopen() {
        this.getHeaderData();
        if (this.degreeSearchField.name != '') {
            this.degreeSearchList = null;
            this.degreeSearchField.name = null;
        }
        jQuery("#degreeListsModal").modal('show');
    }
    degreeList() {
        if (this.degreeSearchField.name != '') {
            this.degreeSearchList = null;
            this.degreeSearchField.name = null;
            jQuery("#degreeListsModal").modal('hide');
        }
    }
    degreeSearch(event, userId) {
        if (this.degreeSearchField.name == '' || this.degreeSearchField.name == null) {
            this.degreeSearchList = null;
        }
        else {
            var nameValid = /^[a-z|A-Z|.]+$/i;
            if (this.degreeSearchField.name.match(nameValid)) {
                this.degreeSearchField.user_id = userId;
                this.myWallService.getSearchedDegrees(this.degreeSearchField.name)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.degreeSearchList = res.degrees;
                        } else this.degreeSearchList = null;
                    });
            }
        }
    }

    ClearSubjectSearch() {
        if (this.subjectSearchField.name != '') {
            this.subjectSearchList = null;
            this.subjectSearchField.name = null;
        }
    }
    ClearCollegeSearch() {
        if (this.collegeSearchField.name != '') {
            this.collegeSearchList = null;
            this.collegeSearchField.name = null;
        }
    }
    ClearDegreeSearch() {
        if (this.degreeSearchField.name != '') {
            this.degreeSearchList = null;
            this.degreeSearchField.name = null;
        }
    }

    fileChangeListener($event) {
        this.valPhoto = false;
        var self = this;
        this.filesToUpload = <Array<File>>$event.target.files;
        this.imageRefresh = $event;
        if (typeof (this.filesToUpload) != 'undefined' && this.filesToUpload.length > 0) {
            if (this.filesToUpload[0].type == 'image/jpeg' || this.filesToUpload[0].type == 'image/tif' || this.filesToUpload[0].type == 'image/tiff' || this.filesToUpload[0].type == 'image/jpg' || this.filesToUpload[0].type == 'image/png' || this.filesToUpload[0].type == 'image/gif') {
                this.errorIcon = '';
                var filez, img;
                if ((filez = <Array<File>>$event.target.files[0])) {
                    img = new Image();
                    img.onload = function () {

                        self.imageHeight = this.height;
                        self.imageWidth = this.width;
                        // if (self.imageWidth < 400) {
                        //     self.errorIcon = 'Please upload image size more than 400x400 resolution.'
                        // }
                        // else {
                        self.errorIcon = '';
                        var image: any = new Image();
                        var file: File = $event.target.files[0];
                        var myReader: FileReader = new FileReader();
                        var that = this;
                        myReader.onloadend = function (loadEvent: any) {
                            image.src = loadEvent.target.result;
                            self.cropper.setImage(image);
                        };
                        myReader.readAsDataURL(file);
                        // };
                    };
                    img.onerror = function () {
                        alert("not a valid file: " + filez.type);
                    };

                    img.src = this._URL.createObjectURL(filez);
                }
            } else {
                this.errorIcon = "Invalid image format";
                this.valPhoto = true;
            }
        }
        else {
            this.errorIcon = "Please select image";
            this.valPhoto = true;
        }

    }

    doToggleSubject() {
        this.toggleSubject = !this.toggleSubject;
        this.toggleCollege = this.toggleBechlour = this.toggleMaster = false;
        this.togFrndReq = false; this.togNotiReq = false
    }

    doToggleCollege() {
        this.toggleCollege = !this.toggleCollege;
        this.toggleSubject = this.toggleBechlour = this.toggleMaster = false;
        this.togFrndReq = false; this.togNotiReq = false
    }

    doToggleBechlour() {
        this.toggleBechlour = !this.toggleBechlour;
        this.toggleCollege = this.toggleSubject = this.toggleMaster = false;
        this.togFrndReq = false; this.togNotiReq = false
    }

    doToggleMaster() {
        this.toggleMaster = !this.toggleMaster;
        this.toggleCollege = this.toggleSubject = this.toggleBechlour = false;
        this.togFrndReq = false; this.togNotiReq = false
    }

    getLinkStyle(path) {
        return this.location.path() === path;
    }

    ngOnInit() {
        this.ping();
        this.getHeaderData();
        this.getProfile();
        this.getGlobalUser();
        this.page.college = null;
        this.page.degree = null;
        this.page.subject = null;
        this.page.bachelors = null;
        this.page.masters = null;
        this.page.program = null;
        this.types =
        [{ "type": 2, "name": 'Bachelor' },
            { "type": 6, "name": 'Master' }]
    }

    randomCounterMethod() {
        ++this.randomCounter;
    }

    ping() {
        this.dataService.getData(this._dataUrl).subscribe(res => {
            if (res.status == 1) {
                if (res.type == 2) {
                    this.router.navigate(['Admin']);
                }
            }
            else window.open('/', '_self');
        });
    }

    // getGlobalUser(){
    //     this.dataService.getData(this._checkPostStatusUrl)
    //     .subscribe(res => {
    //         if(res.status == 2){
    //             this.page.checkFriendPostGlobal = res.data[0].friend_post_status;
    //             this.page.checkFollowersPostGlobal = res.data[0].followers_post_status;
    //             this.page.checkSharedPostGlobal = res.data[0].shared_post_status;
    //             this.page.checkFollowersSharedPostGlobal = res.data[0].followers_shared_post_status;
    //             this.page.checkPostStatusId = res.data[0]._id;
    //           
    //         }
    //     });
    // }
    getGlobalUser() {
        this.dataService.getData(this._checkPostStatusUrl)
            .subscribe(res => {
                if (res.status == 2) {
                    if (res.data.length) {
                        this.page.checkFriendPostGlobal = res.data[0].post_status;
                        // this.page.checkFollowersPostGlobal = res.data[0].followers_post_status;
                        // this.page.checkSharedPostGlobal = res.data[0].shared_post_status;
                        // this.page.checkFollowersSharedPostGlobal = res.data[0].followers_shared_post_status;
                        this.page.checkPostStatusId = res.data[0]._id;
                    }
                }
            });
    }

    getProfile() {
        this.dataService.getData(this._profileUrl).subscribe(user => {
            this.user = user;
            this.page.userIdGlobal = user._id;
            PageService.userid = user._id;
            if (user.type == 1) {
                if (user.login_details.total_login == 1) {
                    this.router.navigate(['DashboardHome']);
                    this.inviteFriends();
                } else {
                    if (user.login_details.total_login > 1 && !user.college.length && !user.subjects.length && !user.degree.length) {
                        this.router.navigate(['Settings']);
                    }
                }
            }

            if (user.lname != null && user.lname != '' && typeof (user.lname) != undefined) {
                this.page.user.name = user.fname + ' ' + user.lname;
            } else {
                this.page.user.name = user.fname;
            }
            if (user.photo != "" && typeof (user.photo) != 'undefined' && user.photo != null) {
                this.user.photo = user.photo;
                this.profilePic = user.photo;
            }
            //            else if (this.type == "facebook") {
            //                this.user.photo = user.facebook.photo;
            //                this.profilePic = user.facebook.photo;
            //            }
            //              else if (this.type == "google") {
            //                this.user.photo = user.google.photo;
            //                this.profilePic = user.google.photo;
            //            } 
            else {
                this.dispay_image = 'public/files/ProfilePicture/no_image.png';
                this.profilePic = '';
            }
        });
    }

    tChat() {
        if (this.page.chatToggleGlobal) {
            return "control-sidebar-open"
        }
        else return ""
    }

    getNotification() {
        this.notiCounter = 0;
        this.dataService.getData(this._notificationDataUrl + '/' + this.notiCounter).subscribe(res => {
            if (res.status == 2) {
                this.notificationData = res.data;
                this.totalNotiCount = res.total;
                this.page.setNotiArriveStatus(false);
            }
        });
    }

    arriveNotification(notification) {
        // this.getFriendRequestNotification();
        // this.getNotification();
        this.changeNoficationStatus(notification._id);
        if (notification.post_type == 9) {
            this.getSubjectWall(notification.subject_id._id);
        }
        if (notification.post_type == 10) {
            this.getCollegeWall(notification.college_id._id);
        }
        if (notification.post_type == 11) {
            this.getDegreeWall(notification.degree_id._id);
        }
        if (notification.post_type == 5) {
            // this.mytoggle();
            this.page.setIsGroupChatNotiStatus(true);
        }
        if (notification.post_type == 12) {
            if (notification.post_id.post_type == 1 || notification.post_id.post_type == 2 || notification.post_id.post_type == 5 || notification.post_id.post_type == 7 || notification.post_id.post_type == 8) {
                this.singlePost(notification.post_id._id);
            } else {
                this.getDetailView(notification.post_id._id);
            }

        }

    }

    getFriendRequestNotifications() {
        this.friendNotiCounter = 0;
        this.dataService.getData(this._getAllFriendNotisUrl + '/' + this.friendNotiCounter).subscribe((res) => {
            if (res.status == 2) {
                this.friendRequestnotificationData = res.data;
                this.totalFriendNotiCount = res.total;
                this.page.setFriendNotiArriveStatus(false);
            }
        });
    }

    changeNoficationStatus(notifId) {
        this.dataService.getData(this._changeNotificationstatus + '/' + notifId).subscribe(res => {
            if (res.status == 2) {
                this.updateNotificationCount();
                this.updateNotificationStatus(notifId);
            }
        });
    }

    public updateNotificationStatus(notifId: number) {
        for (let i in this.notificationData) {
            if (this.notificationData[i]._id == notifId) {
                this.notificationData[i].is_viewed = 1;
                break;
            }
        }
    }
    public updateNotificationCount() {
        this.dataService.getData(this._getUnreadNotificationCount).subscribe((res) => {
            if (res.status == 2) {
                this.page.notificationData = res.data;
            }
        })
    }
    public updateFriendNotificationCount() {
        this.dataService.getData(this._getUnreadFriendNotificationCount).subscribe((res) => {
            if (res.status == 2) {
                this.page.friendRequestnotificationData = res.data;
            }
        })
    }

    changeFriendNoficationStatus(friendId, notifId) {
        this.dataService.getData(this._changeFriendNotificationstatus + '/' + friendId).subscribe((res) => {
            if (res.status == 2) {
                this.updateFriendNotificationCount();
                this.updateFriendNotificationStatus(notifId);
            }
        });
    }
    public updateFriendNotificationStatus(notifId: number) {
        for (let i in this.friendRequestnotificationData) {
            if (this.friendRequestnotificationData[i]._id == notifId) {
                this.friendRequestnotificationData[i].is_viewed = 1;
                break;
            }
        }
    }

    updatePic() {
        // if (!(this.type == 'Facebook' || this.type == 'Google')) {
        jQuery('#myModal1').modal('show');
        // }
    }

    getHeaderData() {
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            this.type = header.Type;
            if (header.data.college != '') {
                this.college = header.data.college;
                this.page.college = this.college
            }
            if (header.data.degree != '') {
                this.degree = header.data.degree;
                this.page.degree = this.degree;
            }
            if (header.data.subjects != '') {
                this.subject = header.data.subjects;
                this.page.subject = this.subject
            }
            if (header.data.program != '') {
                this.program = header.data.program;
                this.page.program = this.program;
            }
            var degree = header.data.degree;
            for (var i = 0; i < degree.length; i++) {
                if (degree[i].degree_id.type > 4) {
                    this.masters = degree;
                    this.page.masters = this.masters
                }
                else {
                    this.bachelors = degree;
                    this.page.bachelors = this.bachelors;
                }
            }
        });
    }

    uploadProfileImage(id) {
        var mod = jQuery('.' + id + '.upload-model').modal(); //confirmation modal trigger
    }

    removeProfileImage() {
        jQuery('.spin-wrap.vision-spin').fadeIn();
        this.dataService.getData(this._removeProfileImageUrl).subscribe(res => {
            this.user.photo = null;
            this.profilePic = '';
            this.filesToUpload = '';
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Profile Picture Is Removed.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            jQuery('.spin-wrap.vision-spin').fadeOut();
        }, (error) => {
            console.error(error);
        });
    }

    closeRefresh() {
        if (typeof (this.imageRefresh) != 'undefined') {
            this.imageRefresh.target.value = '';
        }
        this.errorIcon = '';
    }

    dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        return new Blob([ab], { type: "image/jpeg" });
    }

    upload(user_id, userObj) {
        if (this.data1.image) {
            var file = this.dataURItoBlob(this.data1.image);
            jQuery('.spin-wrap.vision-spin').fadeIn();
            this.makeFileRequestUpload(this._dataUploadProfilePicture + user_id, [], file, user_id).then((result) => {
                this.user.photo = userObj.photo + "?t=" + new Date().getTime();
                this.profilePic = userObj.photo;
                if (result['data']) {
                    userObj.photo = result['data'] + '?t=' + new Date().getTime();
                    // this.page.profilePicture = result['data'] + '?t=' + new Date().getTime();
                }
                jQuery('#myModal1').modal('hide');
                // jQuery('#img_upload').val('');
                jQuery('.spin-wrap.vision-spin').fadeOut();
            }, (error) => {
                console.error(error);
            });
        }







        // if (typeof (this.filesToUpload) != 'undefined' && this.filesToUpload.length > 0) {
        //     if (this.filesToUpload[0].type == 'image/jpeg' || this.filesToUpload[0].type == 'image/tif' || this.filesToUpload[0].type == 'image/tiff' || this.filesToUpload[0].type == 'image/jpg' || this.filesToUpload[0].type == 'image/png' || this.filesToUpload[0].type == 'image/gif') {
        //         this.errorIcon = ''
        //         jQuery('.spin-wrap.vision-spin').fadeIn();
        //         this.makeFileRequest(this._dataUploadProfilePicture + user_id, [], this.filesToUpload, user_id).then((result) => {
        //            
        //             userObj.photo = result['data'];
        //             this.filesToUpload = '';
        //           
        //             jQuery('.' + user_id + '.upload-model').modal('hide');
        //             jQuery('#img_upload').val('');
        //             this.user.photo = userObj.photo + "?t=" + new Date().getTime();
        //             this.profilePic = userObj.photo;
        //             jQuery('#myModal1').modal('hide');
        //             jQuery('.spin-wrap.vision-spin').fadeOut();

        //             var n = noty({ text: '<div class="alert bg-theme-dark"><p>Profile Picture Is Uploaded.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        //         }, (error) => {
        //             console.error(error);
        //         });
        //         this.errorIcon = '';
        //         this.imageRefresh.target.value = '';
        //     }
        //     else {
        //         this.errorIcon = "Invalid Image Format!";
        //     }
        // }
        // else {
        //     this.errorIcon = "Choose Image!";
        // }
    }

    makeFileRequestUpload(url: string, params: Array<string>, files: any, user_id) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append("avatar", files);
            //            formData.append("user_id",user_id);
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


    makeFileRequest(url: string, params: Array<string>, files: Array<File>, user_id) {
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

    //  fileChangeEvent(fileInput: any) {
    //      this.filesToUpload = <Array<File>>fileInput.target.files;
    //      this.imageRefresh = fileInput;
    //      if (typeof (this.filesToUpload) != 'undefined' && this.filesToUpload.length > 0) {
    //          if (this.filesToUpload[0].type == 'image/jpeg' || this.filesToUpload[0].type == 'image/tif' || this.filesToUpload[0].type == 'image/tiff' || this.filesToUpload[0].type == 'image/jpg' || this.filesToUpload[0].type == 'image/png' || this.filesToUpload[0].type == 'image/gif') {
    //              this.errorIcon = '';
    //          }
    //          else {
    //              this.errorIcon = "Invalid Image Format";
    //          }
    //      } else {
    //          this.errorIcon = "Choose Image";
    //      }
    //  }

    mytoggle() {
        this.page.chatToggleGlobal = !this.page.chatToggleGlobal;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = this.page.chatToggleGlobal == true ? body.attr("class", "hold-transition skin-yellow-light sidebar-mini get-freeze") : body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
        this.page.setIsGroupChatNotiStatus(false);
    }

    chatBoxClose() {
        this.page.chatToggleGlobal = false;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
    }
    public clickOnNoti(notiType: string) {
        if (notiType == 'friendNoti')
            this.notiType = 1;
        if (notiType == 'normalNoti')
            this.notiType = 2;
        this.chatBoxClose();
    }

    clearUserSearchDropDown() {
        this.userSearchList = null;
        this.userSearchField.name = null;
    }

    userSearch() {
        if (this.userSearchField.name == '' || this.userSearchField.name == null) {
            this.userSearchList = null;
            this.subjectSearchData = null;
            this.subjectSearchCount = null;
            this.collegeSearchData = null;
            this.collegeSearchCount = null;
            this.degreeSearchData = null;
            this.degreeSearchCount = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (this.userSearchField.name.match(nameValid)) {
                this.dataService.postData(this._userSearchUrl, this.userSearchField)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.userSearchList = res.data;
                            this.subjectSearchData = res.subjectData;
                            this.subjectSearchCount = this.subjectSearchData.length;
                            this.collegeSearchData = res.collegeData;
                            this.collegeSearchCount = this.collegeSearchData.length;
                            this.degreeSearchData = res.degreeData;
                            this.degreeSearchCount = this.degreeSearchData.length;
                        } else {
                            this.userSearchList = null;
                            this.subjectSearchData = null;
                            this.subjectSearchCount = null;
                            this.collegeSearchData = null;
                            this.collegeSearchCount = null;
                            this.degreeSearchData = null;
                            this.degreeSearchCount = null;
                        }

                    });
            }
        }
    }

    public globalSearch(): void {
        var nameValid = /^[a-z\d\-_\s]+$/i;
        if (this.userSearchField.name && this.userSearchField.name.match(nameValid)) {
            this.dataService.postData(this._globalSearchUrl, this.userSearchField)
                .subscribe(res => {
                    if (res.status == 2) {
                        this.usersSearchList = res.data;
                    } else {
                        this.usersSearchList = [];
                    }
                });
        } else {
            if (!this.userSearchField.name) {
                this.usersSearchList = [];
            }
        }
    }

    userList() {
        if (this.userSearchField.name != '') {
            this.userSearchList = null;
            this.router.navigate(['User.UserSearch', { id: this.userSearchField.name }]);
            this.userSearchField.name = null;
        }
    }

    demo(obj) {
    }

    public clearSearch(): void {
        this.usersSearchList = [];
        this.userSearchField.name = null;
    }

    getProfileById(id) {
        this.userSearchList = null;
        this.usersSearchList = [];
        this.userSearchField.name = null;
        this.page.friendProfileId = id;
        this.router.navigate(['ProfileByUserComponent', { userId: id }]);
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
        var random_no = Math.floor(Math.random() * 100);
        this.router.navigate(['SubjectWallComponent', { subjectId: id, random: random_no }]);
        this.mobMenuState = false;
        this.subjectList();
        this.subjectSearchData = null;
        this.subjectSearchCount = null;
        this.collegeSearchData = null;
        this.collegeSearchCount = null;
        this.degreeSearchData = null;
        this.degreeSearchCount = null;
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
        var random_no = Math.floor(Math.random() * 100);
        this.router.navigate(['CollegeWall', { collegeId: id, random: random_no }]);
        this.mobMenuState = false;
        this.collegeList();
        this.subjectSearchData = null;
        this.subjectSearchCount = null;
        this.collegeSearchData = null;
        this.collegeSearchCount = null;
        this.degreeSearchData = null;
        this.degreeSearchCount = null;
    }

    degreeType(typeValue) {
        return typeValue > 4 ? true : false;
    }

    subMenu(item) {
        this.activeItem = item;
    }

    getDegreeWall(id) {
        this.mobMenuState = false;
        this.page.wallId = id;
        this.page.join = 0;
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            for (var i = 0; i < header.data.degree.length; i++) {
                if (header.data.degree[i].degree_id._id == id) {
                    this.page.join = 1;
                }
            }
        });
        var random_no = Math.floor(Math.random() * 100);
        this.router.navigate(['BachelorView', { degreeId: id, random: random_no }]);
        this.degreeList();
        this.subjectSearchData = null;
        this.subjectSearchCount = null;
        this.collegeSearchData = null;
        this.collegeSearchCount = null;
        this.degreeSearchData = null;
        this.degreeSearchCount = null;
    }

    ngAfterViewInit() {
        let self = this;
        setTimeout(function () {
            jQuery('#date-from').datepicker({
                autoclose: true, format: 'mm-yyyy', startView: 'months',
                minViewMode: 'months'
            });
            jQuery('#date-to').datepicker({
                autoclose: true, format: 'mm-yyyy', startView: 'months',
                minViewMode: 'months'
            });
            jQuery('#from-date').datepicker({
                autoclose: true, format: 'mm-yyyy', startView: 'months',
                minViewMode: 'months'
            });
            jQuery('#to-date').datepicker({
                autoclose: true, format: 'mm-yyyy', startView: 'months',
                minViewMode: 'months'
            });
        }, 500);
    }

    openSubjectAddModel() {
        jQuery("#join-modal").modal({ backdrop: false });
        this.ngAfterViewInit();
    }


    joinSubject() {
        if (this.page.wallId) {
            this.newsubject._id = +this.page.wallId;
            this.newsubject.userOffset = new Date().getTimezoneOffset();
            if (this.page.wall_type == "Subject") {
                if (this.categoryValue != 2) {
                    this.newsubject.subjects_user_type = this.categoryValue;
                    if (this.categoryValue == 1) {
                        let startDate = jQuery('input[name="date-from-sub"]').val();
                        let endDate = jQuery('input[name="date-to-sub"]').val();
                        if (startDate && endDate) {
                            startDate = startDate.split('-');
                            endDate = endDate.split('-');
                            var currentDate = new Date();
                            var yesterday = new Date(currentDate.getTime());
                            this.newsubject.from = new Date(startDate[1], startDate[0] - 1, 1);
                            this.newsubject.to = new Date(endDate[1], endDate[0], 0);
                            // if (this.newsubject.from.getTime() > yesterday.getTime()) {
                            if (moment(this.newsubject.to).isSameOrAfter(this.newsubject.from)) {
                                this.addSubject();
                                this.clearDate();
                            } else {
                                this.page.showError("End date is too short than start date.");
                            }
                            // } else {
                            //     this.page.showError("Start date should be greater than or equal to current date");
                            // }
                        } else {
                            this.page.showError("All Fields Are Required.");
                        }
                    } else {
                        this.addSubject();
                    }
                } else {
                    this.page.showError("All Fields Are Required.");
                }
            } else {
                let postUrl = this.page.wall_type == "College" ? this._collegeAdd : this._degreeAdd;
                let startDate = jQuery('input[name="date-from-sub"]').val();
                let endDate = jQuery('input[name="date-to-sub"]').val();
                delete this.newsubject.subjects_user_type;
                if (startDate && endDate) {
                    startDate = startDate.split('-');
                    endDate = endDate.split('-');
                    this.newsubject.from = new Date(startDate[1], startDate[0] - 1, 1);
                    this.newsubject.to = new Date(endDate[1], endDate[0], 0);
                    if (moment(this.newsubject.to).isSameOrAfter(this.newsubject.from)) {
                        jQuery('.spin-wrap.vision-spin').fadeIn();
                        this.dataService.postData(postUrl, this.newsubject).subscribe(res => {
                            if (res.status == 2) {
                                this.page.is_member = true;
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added  <strong>' + this.page.wall_type + ' </strong> to your ' + this.page.wall_type + 's</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                                this.getHeaderData();
                                this.clearAddSCD();
                                this.clearDate();
                            }
                            jQuery("#join-modal").modal('hide');
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                        });
                    } else {
                        this.page.showError("End date is too short than start date.");
                    }
                } else {
                    this.page.showError("All Fields Are Required.");
                }
            }
        }
    }
    public addSubject(): void {
        jQuery('.spin-wrap.vision-spin').fadeIn();
        this.dataService.postData(this._subjectAdd, this.newsubject).subscribe(res => {
            if (res.status == 2) {
                this.page.is_member = true;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added  <strong>' + this.page.wall_type + ' </strong> to your ' + this.page.wall_type + 's</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getHeaderData();
                this.clearAddSCD();
            }
            jQuery("#join-modal").modal('hide');
            jQuery('.spin-wrap.vision-spin').fadeOut();
        });
    }

    public clearAddSCD() {
        this.newsubject = new AddSCD();
        this.categoryValue = 2;
    }

    public clearDate() {
        jQuery('input[name="date-from-sub"]').val('');
        jQuery('input[name="date-to-sub"]').val('');
    }
    public closeAddScdModal() {
        if (this.categoryValue == 1 && this.page.wall_type == 'Subject')
            this.clearDate();
        if (this.page.wall_type != 'Subject')
            this.clearDate();
        this.clearAddSCD();
        jQuery("#join-modal").modal('hide');
    }

    toggleNav() {
        this.toggleState = !this.toggleState;
        this.mobMenuState = false;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = this.toggleState == true ? body.attr("class", "hold-transition skin-yellow-light sidebar-mini get-freeze") : body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
    }

    closeSideMenu() {
        this.toggleState = false;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = this.toggleState == true ? body.attr("class", "hold-transition skin-yellow-light sidebar-mini get-freeze") : body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
    }

    toggleMobileMenu() {
        this.mobMenuState = !this.mobMenuState;
        this.toggleState = false;
    }

    closeMobileMenu() {
        this.mobMenuState = false;
        this.toggleState = false;
    }

    togReq(value) {
        if (value == 2) {
            this.togFrndReq = false; this.togNotiReq = true
        }
        else if (value == 1) {
            this.togFrndReq = true; this.togNotiReq = false
        }
        else {
            this.togFrndReq = false; this.togNotiReq = false
        }
        this.toggleSubject = this.toggleCollege = this.toggleBechlour = this.toggleMaster = false;
    }
    refreshMywall(): void {
        var random_no = Math.floor(Math.random() * 100);
        this.router.navigate(['MyWallComponent', { 'random': random_no }]);
        this.page.wallId = null;
    }

    onLogout() {
        document.cookie = 'email=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'password=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        // document.cookie = 'remember=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.dataService.getData(this._logoutUrl).subscribe(res => {
            this.page.loggedInType = 0;
            window.location = window.location.origin + '/login';
            // window.open(, '_self');
        });
    }
    public changeCatagories(subCatg: any): void {
        this.categoryValue = subCatg.value;
        if (subCatg.value == 1) {
            this.ngAfterViewInit();
        }
    }



    public inviteFriends(): void {
        jQuery("#inviteFriendsModel").modal({ backdrop: false });
        this.showinviteFriendsModel = true;
    }
    public oninviteFriendsModelClose(event: any): void {
        this.showinviteFriendsModel = false;
        jQuery('#inviteFriendsModel').modal('hide');
        this.page.setIsGroupAddedStatus(false);
    }

    selectSubject(id, name) {
        this.joinData._id = id;
        this.joinData.name = name;
        this.subjectLists = [];
        this.collegeLists = [];
        this.degreeLists = [];
    }

    public addSCD(): void {
        this.joinData.userOffset = new Date().getTimezoneOffset();
        if (this.wallType == 'Subject') {
            this.joinData.subjects_user_type = this.categoryValue;
            if (this.joinData._id != null && this.categoryValue != 2) {
                if (this.categoryValue == 1) {
                    let startDate = jQuery('input[name="date-from-subject"]').val();
                    let endDate = jQuery('input[name="date-to-subject"]').val();
                    if (startDate && endDate) {
                        startDate = startDate.split('-');
                        endDate = endDate.split('-');
                        this.joinData.from = new Date(startDate[1], startDate[0] - 1, 1);
                        this.joinData.to = new Date(endDate[1], endDate[0], 0);
                        var currentDate = new Date();
                        if (moment(this.joinData.to).isSameOrAfter(this.joinData.from)) {
                            if (this.joinData.subjects_user_type) {
                                jQuery('.spin-wrap.vision-spin').fadeIn();
                                this.dataService.postData(this._subjectAdd, this.joinData).subscribe(res => {
                                    if (res.status == 2) {
                                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.joinData.name + '</strong> to your Subjects</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                                        this.joinData = new JoinSCD();
                                        this.subjectErrorNotice = null;
                                        this.getHeaderData();
                                        this.clearDate();
                                        this.categoryValue = 2;
                                        this.closeJoinAddModel();
                                    }
                                    else {
                                        this.subjectErrorNotice = res.message;
                                        var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                                    }
                                    jQuery('.spin-wrap.vision-spin').fadeOut();
                                });
                            }
                            else {
                                this.page.showError("All Fields Are Required.");
                            }
                        } else {
                            this.page.showError("End date is too short than start date.");
                        }
                    } else {
                        this.page.showError("All Fields Are Required.");
                    }
                } else {
                    if (this.joinData.subjects_user_type) {
                        jQuery('.spin-wrap.vision-spin').fadeIn();
                        this.dataService.postData(this._subjectAdd, this.joinData).subscribe(res => {
                            if (res.status == 2) {
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.joinData.name + '</strong> to your Subjects</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                                this.subjectErrorNotice = null;
                                this.getHeaderData();
                                this.categoryValue = 2;
                                this.clearDate();
                                this.closeJoinAddModel();
                                this.joinData = new JoinSCD();
                            }
                            else {
                                this.subjectErrorNotice = res.message;
                                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                            }
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                        });
                    }
                    else {
                        this.subjectErrorNotice = "All Fields Are Required.";
                        var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    }
                }
            } else {
                this.subjectErrorNotice = "All Fields Are Required.";
                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        } else if (this.wallType == 'College') {
            this.addCollege();
        } else if (this.wallType == 'Degree') {
            this.addDegree();
        }
    }

    openJoinAddModel(wallType: string) {
        this.wallType = wallType;
        this.ngAfterViewInit();
        jQuery("#join-scd-modal").modal({ backdrop: false });
    }
    
    openAddNewSubjectModel() {
        jQuery("#subjectListsModal").modal('hide');
        jQuery("#addSubjectModal").modal({ backdrop: false });
    }

    clearAddNewSubject() {
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
        this.photosToUpload = '';
        this.message.name.name = '';
        this.errorSubjectIcon = '';
        this.errorAddSubject = '';
        this.errorEditSubject = '';
    }

    addNewSubject() { 
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
            if (this.errorSubjectIcon == '') {
                if (this.message.name.name != '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                        this.makeFileRequestItems(this._dataUrlAddSubject + '/' + this.message.name.name, [], this.photosToUpload).then((result) => {
                            if (result['status'] == 3) {
                                this.message.name.name = '';
                                this.photosToUpload = '';
                                this.errorAddSubject = '';
                                if (typeof (this.imageFile) != "undefined")
                                    this.imageFile.target.value = "";
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                jQuery("#addSubjectModal").modal('hide');
                            } else if (result['status'] = 2) {
                                this.photosToUpload = '';
                                this.message.name.name = '';
                                this.errorAddSubject = '';
                                this.subjectSearchList.splice(0, 0, result['data']);
                                // this.getAllSubject();
                                this.imageFile.target.value = "";
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                jQuery("#addSubjectModal").modal('hide');
                                this.getSubjectWall(result['data']['_id']);
                            }
                    }, (error) => {
                        console.error(error);
                    });
                } else {
                    this.errorSubjectIcon = '';
                    this.errorAddSubject = "Subject Name Required!.";
                }
            }
        } else {
            if (this.errorSubjectIcon == '') {
                if (this.message.name.name != '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.dataService.postData(this._dataUrlAddOnlySubject, this.message.name).subscribe(post_subject => {
                            if (post_subject['status'] == 3) {
                                this.message.name.name = '';
                                this.errorAddSubject = '';
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                jQuery("#addSubjectModal").modal('hide');
                            } else if (post_subject['status'] = 2) {
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                this.message.name.name = '';
                                this.errorAddSubject = '';
                                this.subjectSearchList.splice(0, 0, post_subject.data);
                                // this.getAllSubject();
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                jQuery("#addSubjectModal").modal('hide');
                                this.getSubjectWall(post_subject['data']['_id']);
                            }
                    }, (error) => {
                        console.error(error);
                    });
                } else {
                    this.errorSubjectIcon = '';
                    this.errorAddSubject = "Subject Name Required!.";
                }
            }
        }
    }
    
    photoChangeEvent(fileInput: any) {
        this.photosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
            this.errorSubjectIcon = '';
    }
        else {
            this.errorSubjectIcon = "Invalid image format";
            this.errorAddSubject = '';
            this.errorEditSubject = '';
        }
    }
    
    openAddNewCollegeModel() {
        jQuery("#collegeListsModal").modal('hide');
        jQuery("#addCollegeModal").modal({ backdrop: false });
    }
    
    clearAddNewCollege() {
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
        this.message.name.name = '';
        this.errorCollegeIcon = '';
        this.photosToUpload = '';
        this.errorAddCollege = '';
    }
    
    addNewCollege() {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.errorCollegeIcon == '') {
            if (typeof (this.message.name.name) != 'undefined' && this.message.name.name != null && this.message.name.name != '') {
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.makeFileRequestItems(this._dataUrlAddCollege + '/' + this.message.name.name, [], this.photosToUpload).then((result) => {
                    if (result['status'] == 3) {
                        this.message.name.name = '';
                        this.errorAddCollege = '';
                        this.photosToUpload = '';
                        if (typeof (this.imageFile) != "undefined")
                            this.imageFile.target.value = "";
                        // this.getAllColleges();
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        jQuery("#addCollegeModal").modal('hide');
                    } else if (result['status'] = 2) {
                        this.photosToUpload = '';
                        this.message.name.name = '';
                        this.errorAddCollege = '';
                        if (typeof (this.imageFile) != "undefined")
                        this.imageFile.target.value = "";
                        this.collegeSearchList.splice(0, 0, result['data']);
                        // this.getAllColleges();
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        jQuery("#addCollegeModal").modal('hide');
                        this.getCollegeWall(result['data']['_id']);
                    }
                }, (error) => {
                    console.error(error);
                });
            } else {
                this.errorCollegeIcon = '';
                this.errorAddCollege = "College Name Required!.";
            }
        } else {
            if (this.errorCollegeIcon == '') {
                if (this.message.name.name != '' && this.message.name.name!=null) {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                        this.dataService.postData(this._dataUrlAddOnlyCollege, this.message.name).subscribe(post_college => {
                        if (post_college['status'] == 3) {
                            this.message.name.name = '';
                            this.errorAddCollege = '';
                            // this.getAllColleges();
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#addCollegeModal").modal('hide');
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_college['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        } else if (post_college['status'] = 2) {
                            this.message.name.name = '';
                            this.errorAddCollege = '';
                            this.collegeSearchList.splice(0, 0, post_college.data);
                            // this.getAllColleges();
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#addCollegeModal").modal('hide');
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_college['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            this.getCollegeWall(post_college['data']['_id']);
                        }
                    }, (error) => {
                        console.error(error);
                    });
                } else {
                    this.errorCollegeIcon = '';
                    this.errorAddCollege = "Subject Name Required!.";
                }
            }
        }
    }
    
    openAddNewDegreeModel() {
        jQuery("#degreeListsModal").modal('hide');
        jQuery("#addDegreeModal").modal({ backdrop: false });
    }
    
    clearAddNewDegree() {
        this.messageDegree.name.name = '';
        this.error.degreeIcon = "";
        this.error.degreename = '';
        this.error.degreeOption = '';
        this.messageDegree.type.type = '';
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
    }
    
    addNewDegree() {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.error.degreeIcon == '') {
            if (typeof this.messageDegree.name.name != 'undefined' && this.messageDegree.name.name != null && this.messageDegree.name.name != '') {
                if (typeof this.messageDegree.type.type != 'undefined' || this.messageDegree.type.type != null || this.messageDegree.type.type != '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.makeFileRequestItems(this._dataUrlAddDegree + '/' + this.messageDegree.name.name + '/' + this.messageDegree.type.type, [], this.photosToUpload).then((result) => {
                        if (result['status'] == 3) {
                            this.messageDegree.name.name = '';
                            this.messageDegree.type.type = '';
                            this.photosToUpload = '';
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            // this.getAllDegrees();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#addDegreeModal").modal('hide');
                        } else if (result['status'] = 2) {
                            this.photosToUpload = '';
                            this.messageDegree.name.name = '';
                            this.messageDegree.type.type = '';
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            this.degreeSearchList.splice(0, 0, result['data']);
                            // this.getAllDegrees();
                            jQuery("#addDegreeModal").modal('hide');
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            this.getDegreeWall(result['data']['_id']);
                        }
                    }, (error) => {
                        console.error(error);
                    });
                }
                else {
                    this.error.degreeIcon = '';
                    this.error.degreeOption = "Select the degree option!";
                    this.error.degreename = '';
                }
            } else {
                this.error.degreeIcon = '';
                this.error.degreeOption = '';
                this.error.degreename = "Degree name is required!.";
            }
        } else {
            if (this.error.degreeIcon == '') {
                if (typeof this.messageDegree.name.name != 'undefined' && this.messageDegree.name.name != null && this.messageDegree.name.name != '') {
                    if (typeof this.messageDegree.type.type != 'undefined' && this.messageDegree.type.type != null && this.messageDegree.type.type != '') {
                        this.dataService.postData(this._dataUrlAddOnlyDegree, this.messageDegree).subscribe(post_subject => {
                            if (post_subject['status'] == 3) {
                                this.messageDegree.name.name = '';
                                this.messageDegree.type.type = '';
                                this.error.degreename = '';
                                this.error.degreeOption = '';
                                // this.getAllDegrees();
                                jQuery("#addDegreeModal").modal('hide');
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            } else if (post_subject['status'] = 2) {
                                this.messageDegree.name.name = '';
                                this.messageDegree.type.type = '';
                                this.error.degreename = '';
                                this.error.degreeOption = '';
                                this.degreeSearchList.splice(0, 0, post_subject.data);
                                // this.getAllDegrees();
                                jQuery("#addDegreeModal").modal('hide');
                                var n = noty({ text: '<div clas s="alert bg-theme-dark"><p>Degree Added.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                this.getDegreeWall(post_subject['data']['_id']);
                            }
                        }, (error) => {
                            console.error(error);
                        });
                    }
                    else {
                        this.error.degreeIcon = '';
                        this.error.degreeOption = "Select the degree option!";
                        this.error.degreename = '';
                    }
                } else {
                    this.error.degreeIcon = '';
                    this.error.degreeOption = '';
                    this.error.degreename = "Degree name is required!.";
                }
            }
        }
    }
    
    getAllSubject() {
        this.dataService.getData(this._dataUrlSubject + 1).subscribe(subject => {
            this.subjectSearchList = subject.data;
        });
    }
    
    getAllColleges() {
        this.dataService.getData(this._dataUrlCollege + 1).subscribe(colleges => {
            this.collegeSearchList = colleges.data;
        });

    }
    
    getAllDegrees() {
        this.dataService.getData(this._dataUrlDegree + 1).subscribe(degrees => {
            this.degreeSearchList = degrees.data;
        });
    }
    
    makeFileRequestItems(url: string, params: Array<string>, files: Array<File>) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append("avatar", files[0]);
            xhr.onreadystatechange = function() {
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

    closeJoinAddModel() {
        jQuery("#join-scd-modal").modal('hide');
        this.joinData = new JoinSCD();
        this.categoryValue = 2;
        jQuery('input[name="date-from-subject"]').val("");
        jQuery('input[name="date-to-subject"]').val("");
    }

    addCollege() {
        if (this.joinData._id != null) {
            let startDate = jQuery('input[name="date-from-subject"]').val();
            let endDate = jQuery('input[name="date-to-subject"]').val();
            if (startDate && endDate) {
                startDate = startDate.split('-');
                endDate = endDate.split('-');
                this.joinData.from = new Date(startDate[1], startDate[0] - 1, 1);
                this.joinData.to = new Date(endDate[1], endDate[0], 0);
                if (moment(this.joinData.to).isSameOrAfter(this.joinData.from)) {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.dataService.postData(this._collegeAdd, this.joinData).subscribe(res => {
                        if (res.status == 2) {
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.joinData.name + '</strong> to your Colleges</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                            this.collegeErrorNotice = null;
                            this.clearDate();
                            this.getHeaderData();
                            this.categoryValue = 2;
                            this.closeJoinAddModel();
                            this.joinData = new JoinSCD();
                        }
                        else {
                            this.collegeErrorNotice = res.message;
                            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.collegeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                        }
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                    });
                } else {
                    this.page.showError("To date should be greater than or equal to From date");
                }
            } else {
                this.page.showError("Select The Date.");
            }
        } else {
            this.collegeErrorNotice = "Select college.";
            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.collegeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });

        }
    }

    addDegree() {
        if (this.joinData._id != null) {
            let startDate = jQuery('input[name="date-from-subject"]').val();
            let endDate = jQuery('input[name="date-to-subject"]').val();
            if (startDate && endDate) {
                startDate = startDate.split('-');
                endDate = endDate.split('-');
                this.joinData.from = new Date(startDate[1], startDate[0] - 1, 1);
                this.joinData.to = new Date(endDate[1], endDate[0], 0);
                if (moment(this.joinData.to).isSameOrAfter(this.joinData.from)) {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.dataService.postData(this._degreeAdd, this.joinData).subscribe(res => {
                        if (res.status == 2) {
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.joinData.name + '</strong> to your Degrees</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                            this.degreeErrorNotice = null;
                            this.clearDate();
                            this.closeJoinAddModel();
                            this.categoryValue = 2;
                            this.getHeaderData();
                            this.joinData = new JoinSCD();
                        }
                        else {
                            this.degreeErrorNotice = res.message;
                            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.degreeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                        }
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                    });
                } else {
                    this.page.showError("To date should be greater than or equal to From date.");
                }
            } else {
                this.page.showError("Select The Date.");
            }
        } else {
            this.degreeErrorNotice = "Select degree.";
            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.degreeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        }
    }

    getSubject(event) {
        if (!event.target.value) {
            this.subjectLists = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (event.target.value.match(nameValid)) {
                this.dataService.postData(this._subjectSearch, this.joinData).subscribe(res => {
                    if (res.status == 2) {
                        this.subjectLists = res.data;
                    }
                });
            }
        }
    }



    getCollege(event) {
        if (!event.target.value) {
            this.collegeLists = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (event.target.value.match(nameValid)) {
                this.dataService.postData(this._collegeSearch, this.joinData).subscribe(res => {
                    if (res.status == 2) {
                        this.collegeLists = res.data;
                    }
                });
            }
        }
    }

    getDegree(event) {
        if (!event.target.value) {
            this.degreeLists = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (event.target.value.match(nameValid)) {
                this.dataService.postData(this._degreeSearch, this.joinData).subscribe(res => {
                    if (res.status == 2) {
                        this.degreeLists = res.data;
                    }
                });
            }
        }
    }

    public onList(id: number, wallType: string) {
        if (id) {
            if (wallType == 'Subject') {
                this.router.navigate(['SubjectPastCurrentComponent', { subjectId: id, id: 5 }]);
            } else if (wallType == 'College') {
                this.router.navigate(['CollegePastCurrentMember', { collegeId: id, id: 5 }]);
            } else if (wallType == 'Degree') {
                this.router.navigate(['DegreePastCurrentMemberComponent', { degreeId: id, id: 5 }]);
            } else if (wallType == 'Group') {
                this.router.navigate(['GroupsMemberComponent', { groupId: id, type: 2 }]);
            }
        }
    }
    public onGroupClick(id: number, wallType: string): any {
        if ((wallType == 'Subject') && (id != null)) {
            return { id: id, wallType: 1 };
        } else if ((wallType == 'College') && (id != null)) {
            return { id: id, wallType: 2 };
        } else if ((wallType == 'Degree') && (id != null)) {
            return { id: id, wallType: 3 };
        } else {
            return {};
        }
    }

    public joinGroup(id: number): void {
        this.groupService.joinGroup(id).subscribe((res) => {
            if (res.status == 2) {
                this.page.is_member = true;
                this.page.showSuccess(res.msg);
            }
        });
    }

    public onSeeAllClick(type: number, name: string): void {
        if (type == 2) {
            jQuery("#subjectListsModal").modal('hide');
        } else if (type == 3) {
            jQuery("#collegeListsModal").modal('hide');
        } else {
            jQuery("#degreeListsModal").modal('hide');
        }
        this.router.navigate(['GlobalSearchList', { type: type, name: name }]);

    }
    public leaveGroupModal(): void {
        jQuery("#groupLeaveModal").modal({ backdrop: false });
    }
    public leaveFromGroup(): void {
        this.groupService.leaveGroup(+this.page.wallId).subscribe((res) => {
            if (res.status == 2) {
                this.page.is_member = false;
                this.page.showSuccess(res.msg);
            }
        });
    }
    public isGroupAdmin(): boolean {
        return this.page.walldetails['created_by']._id == this.page.userIdGlobal;
    }
    public openSCDLeaveModel(): void {
        jQuery("#scdLeaveModal").modal({ backdrop: false });
    }
    public leaveFromSCD(): void {
        this.groupService.leaveSCD(+this.page.wallId, this.page.wall_type).subscribe((res) => {
            if (res.status == 2) {
                this.page.is_member = false;
                this.page.join = 0;
                this.page.showSuccess(res.message);
                this.getHeaderData();
            }
        });
    }
    public singlePost(id): void {
        this.postId = id;
        jQuery("#singlePostModel").modal({ backdrop: false });
        this.showSinglePostModel = true;
    }
    public closeSinglePostDialog(): void {
        this.showSinglePostModel = false;
        jQuery("#singlePostModel").modal('hide');
    }
    public closeImageDialog(): void {
        this.dialogState = false;
        jQuery("#profile-page-Asset-detail-Modal").modal('hide');
    }
    public getDetailView(id): void {
        this.postId = id;
        this.dialogState = true;
        jQuery("#profile-page-Asset-detail-Modal").modal({ backdrop: false });
    }
    recentActivity(val) {
        this.onScrollPayNotiList(val);
    }
    onScrollPayNotiList(event) {
        let scrollController = 1;
        if (((event.target.scrollTop + 400) >= (event.target.scrollHeight))) {
            if (this.notiType == 2 || this.togNotiReq) {
                let page = parseInt(this.totalNotiCount);
                page = (page / 10);
                if (scrollController) {
                    scrollController = 0;
                    this.notiCounter++;
                    if (this.notiCounter <= (page + 1)) {
                        // this.nSpin = true;
                        this.dataService.getData(this._notificationDataUrl + '/' + this.notiCounter).subscribe(res => {
                            if (res.status == 2) {
                                if (res.data.length)
                                    this.notificationData = this.notificationData.concat(res.data);
                                this.totalNotiCount = res.total;
                                scrollController = 1;
                            }
                        });
                    }
                }
            } else if (this.notiType == 1 || this.togFrndReq) {
                let page = parseInt(this.totalFriendNotiCount);
                page = (page / 10);
                if (scrollController) {
                    scrollController = 0;
                    this.friendNotiCounter++;
                    if (this.friendNotiCounter <= (page + 1)) {
                        // this.nSpin = true;
                        this.dataService.getData(this._getAllFriendNotisUrl + '/' + this.friendNotiCounter).subscribe(res => {
                            if (res.status == 2) {
                                if (res.data.length)
                                    this.friendRequestnotificationData = this.friendRequestnotificationData.concat(res.data);
                                this.totalFriendNotiCount = res.total;
                                scrollController = 1;
                            }
                        });
                    }
                }
            }
        }

    }

    public getGroupWall(id: number) {
        this.router.navigate(['GroupWallComponent', { id: id }]);
    }

    public onSCDClick(id: number, wallType: string) {
        if (wallType == 'Subject') {
            this.getSubjectWall(id);
        } else if (wallType == 'College') {
            this.getCollegeWall(id);
        } else if (wallType == 'Degree') {
            this.getDegreeWall(id);
        }
    }
    public getUserFollowingIds() {
        this.followService.getUserFollowingIds().subscribe((res) => {
            if (res.status == 2) {
                this.staticFollowStatus.userFollowersList = res.following;
            }
        });
    }
}

