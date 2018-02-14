import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {GridDataService, PageService} from '../../theme/services';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
import {CalendarPipe} from 'angular2-moment/CalendarPipe';
declare var jQuery: any;
declare var noty: any;
declare var require: any;
declare var noty: any;
declare var datepicker: any;

@Component({
    selector: 'contactUsLogin',
    template: require('./contactUsLogin.html'),
    pipes: [DateFormatPipe, TimeAgoPipe,CalendarPipe],
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES],
    host: { 'class': 'ng-animate page1Container' }
})

export class ContactUsLoginComponent {
    public user;
    public socialPostUrl = '/api/user/postSocialLink';
    public getSocialLinks = '/api/user/getSocialLink';
    public errorMessage: string;
    private _collegeSearch = 'api/college/collegeSearch';
    private _degreeSearch = 'api/degree/degreeSearch';
    private _subjectSearch = 'api/subject/subjectSearch';
    private _skillSearch = 'api/skill/skillSearch';
    public _saveUpdateUrl = 'api/user/saveUpdate';
    private _collegeAdd = 'api/user/addCollege';
    private _degreeAdd = 'api/user/addDegree';
    private _subjectAdd = 'api/user/addSubject';
    private _skillAdd = 'api/skill/addSkill';
    private _dataUrlAddSkill = 'api/skill/add/';
    private _subjectRemove = 'api/user/removeSubject/';
    private _collegeRemove = 'api/user/removeCollege/';
    private _degreeRemove = 'api/user/removeDegree/';
    private _skillRemove = 'api/skill/removeSkill/';
    public _friendListUrl = '/api/user/getAllTypeFriends';
    public _addFriendUrl = '/api/user/addFriend';
    private _getUnblockedFriendsUrl = '/api/user/unblockFriend';
    private _getblockedFriendsUrl = '/api/user/blockFriend';
    public _dataUrlCancelFriend = '/api/user/cancelFriend';
    private _dataUrlApproveFriend = 'api/user/approveFriend';
    private _dataUrlRemoveFriend = 'api/user/removeFriend';
    private _dataUrlRejectFriend = 'api/user/rejectFriend';
    private _dataUrlSkill = 'api/skill/getuserskills';
    public friends;
    public friendStatus;
    public blocked_friends;
    public college = { name: "", _id: null, from: null, to: null };
    public collegeList = null;
    public degree = { name: "", _id: null, from: null, to: null };
    public degreeList = null;
    public subject = { name: "", _id: null, from: null, to: null, subjects_user_type: null };
    public categoryValue;
    public subjectList = null;
    public collegeData;
    public degreeData;
    public subjectData;
    public type;
    public categoryValueDefault;
    public collegeErrorNotice = null;
    public subjectErrorNotice = null;
    public degreeErrorNotice = null;
    public generalErrorNotice = null;
    public catagory = null;
    public generalInformation = { userName: null, userEmail: null, userPass: null, userConfirmPass: null };
    public login_details;
    public _headerDataUrl = '/api/user/getHeaderData';
    public social_link = { facebook: '', twitter: '', linkedin: '', google_plus: '', bitbucket: '' };
    public update_social_link=0;
    public skill = { name: "", id: null };
    public skillList = null;
    public skillData;
    public addSkillParam;
    public tAccount_settings = true;
    public tSocia_lLink = false;
    public tInvitation_mangement = false;
    public tAll = true;
    public tPending = false;
    public tAccepted = false;
    public tBlocked = false;
    public subjectModalId;
    public collegeModalId;
    public degreeModalId;
    public skillModalId;
    public errorEventMessage = { errorDate: '',  errorToDate: '',errorFromDate:'' };
    public searchUser;
    public userSearchField = { name: "" , status:""};
    public userSearchList;
    public _userSearchUrl = '/api/user/userSearchByStatus';
    public userSearchCount;
    router: Router;

    constructor(private dataService: GridDataService, private page: PageService, private routeParams: RouteParams, router: Router) {
        this.categoryValueDefault = "Choose Category";
        this.router = router;

    }

    ngOnInit() {
       
    }


}
