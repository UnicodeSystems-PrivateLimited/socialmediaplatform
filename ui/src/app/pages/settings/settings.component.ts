import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { GridDataService, PageService } from '../../theme/services';
import { SocialShareLink } from '../../theme/interfaces';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { moment } from '../../moment.loder';
declare var jQuery: any;
declare var noty: any;
declare var require: any;
declare var noty: any;
declare var datepicker: any;

@Component({
    selector: 'settings',
    template: require('./settings.html'),
    pipes: [DateFormatPipe, TimeAgoPipe, CalendarPipe],
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES],
    host: { 'class': 'ng-animate page1Container' }
})

export class SettingsComponent {
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
    private _dataUrlAddSubject = 'api/subject/addSubject';
    private _dataUrlAddOnlySubject = 'api/subject/addOnlySubject';
    private _dataUrlSubject = 'api/subject/getAllSubject/';
    private _dataUrlCollege = 'api/college/getAllCollege/';
    private _dataUrlAddOnlyCollege = 'api/college/addOnlyCollege';
    private _dataUrlAddCollege = 'api/college/addCollege';
    private _dataUrlDegree = 'api/degree/getAllDegree/';
    public _dataUrlAddOnlyDegree = 'api/degree/addOnlyDegree';
    private _dataUrlAddDegree = 'api/degree/addnewDegree';
    public _acceptFriendNotification = '/api/notification/addNotification/';
    private post_type = {
        SENDREQ: 0,
        ACCEPTREQNOTIFY: 3,
    };
    public acceptFriendTitle = { title: 'has accepted your friend request', recepient: [] };
    public friends;
    public friendStatus;
    public blocked_friends;
    public college = { name: "", _id: null, from: null, to: null, userOffset: null };
    public collegeList = null;
    public degree = { name: "", _id: null, from: null, to: null, userOffset: null };
    public degreeList = null;
    public subject = { name: "", _id: null, from: null, to: null, subjects_user_type: null, userOffset: null };
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
    public generalInformation = { userName: null, userEmail: null, userPass: null, userConfirmPass: null, checkStatus: 1 };
    public login_details;
    public _headerDataUrl = '/api/user/getHeaderData';
    public social_link = { facebook: '', twitter: '', linkedin: '', google_plus: '', bitbucket: '' };
    public update_social_link: SocialShareLink = new SocialShareLink();
    public old_social_link: SocialShareLink = new SocialShareLink();
    public skill = { name: "", id: null };
    public skillList = null;
    public skillData;
    public addSkillParam;
    public tAccount_settings = true;
    public tSocia_lLink = false;
    public tInvitation_mangement = false;
    public tPost_setting = false;
    public tskills = false;
    public tAll = true;
    public tPending = false;
    public tAccepted = false;
    public tBlocked = false;
    public subjectModalId;
    public collegeModalId;
    public degreeModalId;
    public skillModalId;
    public errorEventMessage = { errorDate: '', errorToDate: '', errorFromDate: '' };
    public searchUser;
    public userSearchField = { name: "", status: "" };
    public userSearchList;
    public _userSearchUrl = '/api/user/userSearchByStatus';
    private _postStatusUrl = '/api/ruleofpost/checkPostStatus';
    private _followersPostStatusUrl = '/api/ruleofpost/checkFollowersPostStatus';
    private _sharedPostStatusUrl = '/api/ruleofpost/checkSharedPostStatus';
    private _followersSharedPostStatusUrl = '/api/ruleofpost/checkFollowersSharedPostStatus';
    public userSearchCount;
    public postStatus = { post_status: "" };
    public postcheck;
    public followersPostCheck;
    public sharedPostCheck;
    public sharedFollowersPostCheck;
    private _checkPostStatusUrl = 'api/ruleofpost/getData';
    router: Router;
    public showLoader: boolean = false;
    public showAddNewSubject: boolean = false;
    public showAddNewCollege: boolean = false;
    public showAddNewDegree: boolean = false;
    public oldInformation: any = { userName: null, userEmail: null, userPass: null, userConfirmPass: null, checkStatus: 1 };
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

    constructor(private dataService: GridDataService, private page: PageService, private routeParams: RouteParams, router: Router) {
        this.categoryValueDefault = "Choose Category";
        this.router = router;
        this.postcheck = this.page.checkFriendPostGlobal;
        if ((routeParams.get('tab')) != null) {
            if ((routeParams.get('tab')) == '1') {
                this.settingTab(3);
            } else if ((routeParams.get('tab')) == '5') {
                this.settingTab(5);
            }
        }
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.getAccountData();
        this.getSkillData();
        this.getFriendList();
        this.dataService.getData(this.getSocialLinks)
            .subscribe(res => {
                if (res.status === 2) {
                    this.social_link = res.data;
                }
            });
        this.page.friendProfileId = '';
        this.page.wallId = '';
        this.types =
        [{ "type": 2, "name": 'Bachelor' },
            { "type": 6, "name": 'Master' }]
        // this.addSkillParam = this.routeParams.get('addSkill');
        // if (this.addSkillParam) {
        //     setTimeout(function () {
        //         jQuery("html, body").animate({ scrollTop: jQuery('#main-subject4').offset().top }, 1000);
        //     }, 200)
        // }
    }

    checkPostStatus(status) {
        this.postStatus.post_status = status;
        this.dataService.postData(this._postStatusUrl, this.postStatus)
            .subscribe(res => {
                if (res.status == 2) {
                    this.dataService.getData(this._checkPostStatusUrl)
                        .subscribe(res => {
                            if (res.status == 2) {
                                this.postcheck = res.data[0].post_status;
                                this.page.checkFriendPostGlobal = this.postcheck;
                            }
                        });
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

    getSkillData() {
        this.dataService.getData(this._dataUrlSkill)
            .subscribe(res => {
                if (res.status === 2) {
                    this.skillData = res.data;
                }
            });
    }

    hideSearchResult() {
        this.subjectList = null;
        this.collegeList = null;
        this.degreeList = null;
        this.skillList = null;
    }

    settingTab(tabType) {
        if (tabType == 1) {
            this.tAccount_settings = true;
            this.tSocia_lLink = this.tInvitation_mangement = this.tPost_setting = this.tskills = false;
        } else if (tabType == 2) {
            this.tSocia_lLink = true;
            this.tAccount_settings = this.tInvitation_mangement = this.tPost_setting = this.tskills = false;
        } else if (tabType == 3) {
            this.tInvitation_mangement = true;
            this.tAccount_settings = this.tSocia_lLink = this.tPost_setting = this.tskills = false;
            this.searchUser = 3;
        } else if (tabType == 4) {
            this.tPost_setting = true;
            this.tInvitation_mangement = this.tAccount_settings = this.tSocia_lLink = this.tskills = false;
        } else if (tabType == 5) {
            this.tskills = true;
            this.tInvitation_mangement = this.tAccount_settings = this.tSocia_lLink = this.tPost_setting = false;
        }
    }

    friendMgmtTab(tabType, searchStatus) {
        if (tabType == 1 && searchStatus == 3) {
            this.tAll = true;
            this.tPending = this.tAccepted = this.tBlocked = false;
            this.searchUser = searchStatus;
            this.userSearchField.name = '';
            this.userSearchList = null;
        } else if (tabType == 2 && searchStatus == 2) {
            this.tPending = true;
            this.tAll = this.tAccepted = this.tBlocked = false;
            this.searchUser = searchStatus;
            this.userSearchField.name = '';
            this.userSearchList = null;
        } else if (tabType == 3 && searchStatus == 1) {
            this.tAccepted = true;
            this.tAll = this.tPending = this.tBlocked = false;
            this.searchUser = searchStatus;
            this.userSearchField.name = '';
            this.userSearchList = null;
        } else if (tabType == 4 && searchStatus == 4) {
            this.tBlocked = true;
            this.tAll = this.tPending = this.tAccepted = false;
            this.searchUser = searchStatus;
            this.userSearchField.name = '';
            this.userSearchList = null;
        }
    }
    getFriendList() {
        this.dataService.getData(this._friendListUrl)
            .subscribe(
            user => {
                this.friends = user.data;
            });
    }
    userSearch(e, searchFriendStatus) {
        this.userSearchField.status = searchFriendStatus;
        if (this.userSearchField.name == '' || this.userSearchField.name == null) {
            this.userSearchList = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (this.userSearchField.name.match(nameValid)) {
                this.dataService.postData(this._userSearchUrl, this.userSearchField)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.userSearchList = res.data;
                            this.userSearchCount = this.userSearchList.length;
                        }
                        else this.userSearchList = null;
                    });
            }
        }
    }

    addAsFriend(id) {
        this.dataService.getData(this._addFriendUrl + "/" + id)
            .subscribe(res => {
                if (res.status == 2) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request sent</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    this.friendStatus = res;
                    this.getFriendList();
                }
            });
    }

    unblockFriend(friend_id, user) {
        this.dataService.getData(this._getUnblockedFriendsUrl + "/" + friend_id).subscribe(unblock => {
            if (unblock.status == 2) {
                user.status = 6;
                this.blocked_friends = 0;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend unblocked successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    blockFriend(friend_id, user) {
        this.dataService.getData(this._getblockedFriendsUrl + "/" + friend_id).subscribe(block => {
            if (block.status == 2) {
                user = [];
                user.status = 4;
                this.blocked_friends = friend_id;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend blocked successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.getFriendList();
            }
        });
    }

    friendRequestReject(friend_id, user) {
        this.dataService.getData(this._dataUrlRejectFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user = [];
                user.status = 6;
                var n = noty({ text: '<div class="alert alert-danger"><p>Friend request rejected</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    acceptFriendRequest(friend_id, user) {
        this.dataService.getData(this._dataUrlApproveFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user.status = 3;
                this.dataService.postData(this._acceptFriendNotification + friend_id + '/' + this.post_type.ACCEPTREQNOTIFY, this.acceptFriendTitle).subscribe(res => {
                });
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend Request Accepted</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    cancelRequestedFriend(friend_id, user) {
        this.dataService.getData(this._dataUrlCancelFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user = [];
                user.status = 6;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request Cancelled</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    friendRemove(friend_id, user) {
        this.dataService.getData(this._dataUrlRemoveFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user = [];
                user.status = 6;
                var n = noty({ text: '<div class="alert alert-danger"><p>Friend Removed</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    formSubmit() {
        let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        let checkUrl = [true, true, true, true];
        if (this.update_social_link.facebook) {
            if (!regexp.test(this.update_social_link.facebook)) {
                checkUrl[0] = false;
            }
        }
        if (this.update_social_link.twitter) {
            if (!regexp.test(this.update_social_link.twitter)) {
                checkUrl[1] = false;
            }
        }
        if (this.update_social_link.linkedin) {
            if (!regexp.test(this.update_social_link.linkedin)) {
                checkUrl[2] = false;
            }
        }
        if (this.update_social_link.google_plus) {
            if (!regexp.test(this.update_social_link.google_plus)) {
                checkUrl[3] = false;
            }
        }
        if (checkUrl.indexOf(false) == -1) {
            if (!this.isEquivalent(this.update_social_link, this.old_social_link)) {
                this.old_social_link.facebook = this.update_social_link.facebook;
                this.old_social_link.twitter = this.update_social_link.twitter;
                this.old_social_link.google_plus = this.update_social_link.google_plus;
                this.old_social_link.linkedin = this.update_social_link.linkedin;
                this.dataService.postData(this.socialPostUrl, this.update_social_link)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.social_link = res.data;
                            this.page.showSuccess('Social links updated successfully.');
                        }
                    });
            }
            jQuery("#myModal").modal('hide');
        } else {
            this.page.showError('Please enter a valid url. ');
        }
    }
    public openSociallinkModel(): void {
        this.update_social_link.facebook = this.social_link.facebook;
        this.update_social_link.twitter = this.social_link.twitter;
        this.update_social_link.google_plus = this.social_link.google_plus;
        this.update_social_link.linkedin = this.social_link.linkedin;
        this.old_social_link.facebook = this.social_link.facebook;
        this.old_social_link.twitter = this.social_link.twitter;
        this.old_social_link.google_plus = this.social_link.google_plus;
        this.old_social_link.linkedin = this.social_link.linkedin;
        jQuery("#myModal").modal({ backdrop: false });
    }

    ngAfterViewInit() {
        setTimeout(function () {
            jQuery('input[name="sub-date-from-0"]').datepicker({
                autoclose: true, format: 'mm-yyyy', startView: 'months',
                minViewMode: 'months'
            });

            jQuery('input[name="sub-date-to-0"]').datepicker({
                autoclose: true, format: 'mm-yyyy', startView: 'months',
                minViewMode: 'months'
            });
        }, 500);
    }

    public getCollegeStartDatePicker() {
        jQuery('input[name="col-date-from-0"]').datepicker({
            autoclose: true, format: 'mm-yyyy', startView: 'months',
            minViewMode: 'months'
        }).datepicker("show");
    }
    public getCollegeEndDatePicker() {
        jQuery('input[name="col-date-to-0"]').datepicker({
            autoclose: true, format: 'mm-yyyy', startView: 'months',
            minViewMode: 'months'
        }).datepicker("show");
    }
    public getDegreeStartDatePicker() {
        jQuery('input[name="deg-date-from-0"]').datepicker({
            autoclose: true, format: 'mm-yyyy', startView: 'months',
            minViewMode: 'months'
        }).datepicker("show");
    }

    public getDegreeEndDatePicker() {
        jQuery('input[name="deg-date-to-0"]').datepicker({
            autoclose: true, format: 'mm-yyyy', startView: 'months',
            minViewMode: 'months'
        }).datepicker("show");
    }

    getCollege(event) {
        if (!event.target.value) {
            this.collegeList = null;
            this.showAddNewCollege = false;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (event.target.value.match(nameValid)) {
                this.dataService.postData(this._collegeSearch, this.college).subscribe(res => {
                    if (res.status == 2) {
                        this.collegeList = res.data;
                        if(res.data == '') {
                            this.showAddNewCollege = true;
                        } else {
                            this.showAddNewCollege = false;
                        }
                    }
                });
            }
        }
    }

    getSubject(event) {
        if (!event.target.value) {
            this.subjectList = null;
            this.showAddNewSubject = false;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (event.target.value.match(nameValid)) {
                this.dataService.postData(this._subjectSearch, this.subject).subscribe(res => {
                    if (res.status == 2) {
                        this.subjectList = res.data;
                        if(res.data == '') {
                            this.showAddNewSubject = true;
                        } else {
                            this.showAddNewSubject = false;
                        }
                    }
                });
            }
        }
    }

    getDegree(event) {
        if (!event.target.value) {
            this.degreeList = null;
            this.showAddNewDegree = false;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (event.target.value.match(nameValid)) {
                this.dataService.postData(this._degreeSearch, this.degree).subscribe(res => {
                    if (res.status == 2) {
                        this.degreeList = res.data;
                        if(res.data == '') {
                            this.showAddNewDegree = true;
                        } else {
                            this.showAddNewDegree = false;
                        }
                    }
                });
            }
        }
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

    selectCollege(id, name) {
        this.college.name = name;
        this.college._id = id;
        this.collegeList = null;
    }

    selectSubject(id, name) {
        this.subject.name = name;
        this.subject._id = id;
        this.subjectList = null;
    }

    selectDegree(id, name) {
        this.degree.name = name;
        this.degree._id = id;
        this.degreeList = null;
    }

    saveUpdate() {
        var letters = /^[a-z\d\-_\s]+$/i;
        var emailLetters = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var regXExpression = /\d/;
        var regExpression = /([!,%,&,@,#,$,^,*,?,_,~])/;
        if (!this.isEquivalent(this.generalInformation, this.oldInformation)) {
            this.oldInformation.userName = this.generalInformation.userName;
            this.oldInformation.userEmail = this.generalInformation.userEmail;
            if (this.generalInformation.userName.match(letters) && this.generalInformation.userName != '') {
                if (this.generalInformation.userEmail.match(emailLetters) && this.generalInformation.userEmail != '') {
                    if (!this.generalInformation.userPass && !this.generalInformation.userConfirmPass) {
                        this.updateProfile();
                    }
                    else {
                        if (this.generalInformation.userPass && this.generalInformation.userPass.match(regXExpression) && this.generalInformation.userPass.match(regExpression) && this.generalInformation.userPass.length > 4) {
                            this.updateProfile();
                        } else {
                            this.generalErrorNotice = "Password must be 5 characters long, contain atleast 1 number and 1 special character";
                            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                        }
                    }
                }
                else {
                    this.generalErrorNotice = "Invalid User Email";
                    var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                }
            } else {
                this.generalErrorNotice = "Invalid User Name";
                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        }

    }

    public updateProfile(): void {
        this.dataService.postData(this._saveUpdateUrl, this.generalInformation).subscribe(res => {
            if (res.status == 2) {
                this.page.user.name = this.generalInformation.userName;
                this.generalErrorNotice = res.message;
                this.generalInformation.userConfirmPass = null;
                this.generalInformation.userPass = null;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
            else {
                this.generalErrorNotice = res.message;
                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        });
    }

    getHeaderData() {
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            if (header.data.college != '') {
                this.page.college = header.data.college;
            }
            else {
                this.page.college = null;
            }
            if (header.data.degree != '') {
                this.page.degree = header.data.degree;;
            }
            else {
                this.page.degree = null;
            }
            if (header.data.subjects != '') {
                this.page.subject = header.data.subjects;
            }
            else {
                this.page.subject = null;
            }
            if (header.data.program != '') {
                this.page.program = header.data.program;
            }
            else {
                this.page.program = null;
            }
            var degree = header.data.degree;
            if (header.data.degree != '') {
                for (var i = 0; i < degree.length; i++) {
                    if (degree[i].degree_id.type > 4) {
                        ;
                        this.page.masters = degree;
                    }
                    else {
                        this.page.bachelors = degree;;
                    }
                }
            }
            else {
                this.page.masters = null;
                this.page.bachelors = null;
            }
        });
    }

    addSubject() {
        if (this.subject._id != null) {
            this.subject.userOffset = new Date().getTimezoneOffset();
            if (this.catagory == 1) {
                let startDate = jQuery("#scheduleDate1").val();
                let endDate = jQuery("#scheduleDate2").val();
                if (startDate && endDate) {
                    startDate = startDate.split('-');
                    endDate = endDate.split('-');
                    this.subject.from = new Date(startDate[1], startDate[0] - 1, 1);
                    this.subject.to = new Date(endDate[1], endDate[0], 0);
                    var currentDate = new Date();
                    if (moment(this.subject.to).isSameOrAfter(this.subject.from)) {
                        if (this.subject.subjects_user_type) {
                            this.dataService.postData(this._subjectAdd, this.subject).subscribe(res => {
                                if (res.status == 2) {
                                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.subject.name + '</strong> to your Subjects</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                                    this.subject.name = null;
                                    this.subject._id = null;
                                    this.subject.from = null;
                                    this.subject.to = null;
                                    this.subject.subjects_user_type = null;
                                    this.subjectErrorNotice = null;
                                    this.categoryValue = this.categoryValueDefault;
                                    this.clearDate(1);
                                    this.getAccountData();
                                    this.getHeaderData();
                                }
                                else {
                                    this.subjectErrorNotice = res.message;
                                    var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                                }
                            });
                        }
                        else {
                            this.page.showError("All Fields Required.");
                        }
                        jQuery("#scheduleDate1").val('');
                        jQuery("#scheduleDate2").val('');
                    } else {
                        this.page.showError("To date should be greater than or equal to From date");
                    }
                } else {
                    this.page.showError("All Fields Required.");
                }
            } else {
                if (this.subject.subjects_user_type) {
                    this.dataService.postData(this._subjectAdd, this.subject).subscribe(res => {
                        if (res.status == 2) {
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.subject.name + '</strong> to your Subjects</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                            this.subject.name = null;
                            this.subject._id = null;
                            this.subject.from = null;
                            this.subject.to = null;
                            this.subject.subjects_user_type = null;
                            this.subjectErrorNotice = null;
                            this.categoryValue = this.categoryValueDefault;
                            this.clearDate(1);
                            this.getAccountData();
                            this.getHeaderData();
                        }
                        else {
                            this.subjectErrorNotice = res.message;
                            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                        }
                    });
                }
                else {
                    this.subjectErrorNotice = "All Fields Required.";
                    var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                }
            }
        } else {
            this.subjectErrorNotice = "All Fields Required.";
            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        }
    }

    addCollege() {
        if (this.college._id != null) {
            this.college.userOffset = new Date().getTimezoneOffset();
            let startDate = jQuery('input[name="col-date-from-0"]').val();
            let endDate = jQuery('input[name="col-date-to-0"]').val();
            if (startDate && endDate) {
                startDate = startDate.split('-');
                endDate = endDate.split('-');
                this.college.from = new Date(startDate[1], startDate[0] - 1, 1);
                this.college.to = new Date(endDate[1], endDate[0], 0);
                if (moment(this.college.to).isSameOrAfter(this.college.from)) {
                    this.dataService.postData(this._collegeAdd, this.college).subscribe(res => {
                        if (res.status == 2) {
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.college.name + '</strong> to your Colleges</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                            this.college.name = null;
                            this.college._id = null;
                            this.college.from = null;
                            this.college.to = null;
                            this.collegeErrorNotice = null;
                            this.clearDate(2);
                            this.getAccountData();
                            this.getHeaderData();
                        }
                        else {
                            this.collegeErrorNotice = res.message;
                            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.collegeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                        }
                    });
                } else {
                    this.page.showError("To date should be greater than or equal to From date.");
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
        if (this.degree._id != null) {
            this.degree.userOffset = new Date().getTimezoneOffset();
            let startDate = jQuery('input[name="deg-date-from-0"]').val();
            let endDate = jQuery('input[name="deg-date-to-0"]').val();
            if (startDate && endDate) {
                startDate = startDate.split('-');
                endDate = endDate.split('-');
                this.degree.from = new Date(startDate[1], startDate[0] - 1, 1);
                this.degree.to = new Date(endDate[1], endDate[0], 0);
                if (moment(this.degree.to).isSameOrAfter(this.degree.from)) {
                    this.dataService.postData(this._degreeAdd, this.degree).subscribe(res => {
                        if (res.status == 2) {
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.degree.name + '</strong> to your Colleges</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                            this.degree.name = null;
                            this.degree._id = null;
                            this.degree.from = null;
                            this.degree.to = null;
                            this.degreeErrorNotice = null;
                            this.clearDate(3);
                            this.getAccountData();
                            this.getHeaderData();
                        }
                        else {
                            this.degreeErrorNotice = res.message;
                            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.degreeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                        }
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

    addSkill() {
        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.skill.id != null) {
            this.dataService.postData(this._skillAdd, this.skill).subscribe(res => {
                if (res.status == 2) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Added <strong>' + this.skill.name + '</strong> to your Skills</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    this.skill.name = null;
                    this.skill.id = null;
                    this.getSkillData();
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
        else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Select Skills.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        }
    }

    getAccountData() {
        this.showLoader = true;
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            this.collegeData = header.data.college;
            this.degreeData = header.data.degree;
            this.subjectData = header.data.subjects;
            this.generalInformation.userName = header.data.fname + ' ' + header.data.lname;
            this.generalInformation.userEmail = header.data.local.email;
            this.type = header.Type;
            this.login_details = header.data.login_details;
            this.oldInformation.userName = header.data.fname + ' ' + header.data.lname;
            this.oldInformation.userEmail = header.data.local.email;
            this.showLoader = false;
        });
    }

    deleteCollegeModel(id) {
        this.collegeModalId = id;
        jQuery("#collegeDeleteModal").modal({ backdrop: false });
    }

    deleteCollege() {
        this.dataService.getData(this._collegeRemove + this.collegeModalId).subscribe(res => {
            this.getAccountData();
            this.getHeaderData();
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>College removed successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        });
    }

    deleteSubjectModel(id) {
        this.subjectModalId = id;
        jQuery("#subjectDeleteModal").modal({ backdrop: false });
    }

    deleteSubject() {
        this.dataService.getData(this._subjectRemove + this.subjectModalId).subscribe(res => {
            this.getAccountData();
            this.getHeaderData();
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Subject removed successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        });
    }

    deleteDegreeModel(id) {
        this.degreeModalId = id;
        jQuery("#degreeDeleteModal").modal({ backdrop: false });
    }

    deleteDegree() {
        this.dataService.getData(this._degreeRemove + this.degreeModalId).subscribe(res => {
            this.getAccountData();
            this.getHeaderData();
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Degree removed successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        });
    }

    deleteSkillModel(id) {
        this.skillModalId = id;
        jQuery("#skillDeleteModal").modal({ backdrop: false });
    }

    deleteSkill() {
        this.dataService.getData(this._skillRemove + this.skillModalId).subscribe(res => {
            this.getSkillData();
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Skill removed successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        });
    }
    subjectDate() {
        var subFr = jQuery('input[name="sub-date-from-0"]').val();
        var dateFr = subFr.split('-');
        var subTo = jQuery('input[name="sub-date-to-0"]').val();
        var dateTo = subTo.split('-');
        dateFr = dateFr[2] + dateFr[1] + dateFr[0];
        dateTo = dateTo[2] + dateTo[1] + dateTo[0];
        if (dateTo != 'NaN' && dateFr != 'NaN') {
            if (dateTo > dateFr) {
                this.subject.from = subFr == '' || subFr == null ? subFr : this.toDate(subFr);
                this.subject.to = subTo == '' || subTo == null ? subTo : this.toDate(subTo);
            } else {
                this.subjectErrorNotice = "To date should be greater than or equal to From date.";
                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        } else {
            this.subjectErrorNotice = "Select The Date.";
            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.subjectErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        }
    }

    collegeDate() {
        var subFr = jQuery('input[name="col-date-from-0"]').val();
        var dateFr = subFr.split('-');
        var subTo = jQuery('input[name="col-date-to-0"]').val();
        var dateTo = subTo.split('-');
        dateFr = dateFr[2] + dateFr[1] + dateFr[0];
        dateTo = dateTo[2] + dateTo[1] + dateTo[0];
        if (dateTo != 'NaN' && dateFr != 'NaN') {
            if (dateTo > dateFr) {
                this.college.from = subFr == '' || subFr == null ? subFr : this.toDate(subFr);
                this.college.to = subTo == '' || subTo == null ? subTo : this.toDate(subTo);
            } else {
                this.collegeErrorNotice = "To date should be greater than or equal to From date.";
                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.collegeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        } else {
            this.collegeErrorNotice = "Select The Date.";
            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.collegeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        }
    }

    degreeDate() {
        var subFr = jQuery('input[name="deg-date-from-0"]').val();
        var dateFr = subFr.split('-');
        var subTo = jQuery('input[name="deg-date-to-0"]').val();
        var dateTo = subTo.split('-');
        dateFr = dateFr[2] + dateFr[1] + dateFr[0];
        dateTo = dateTo[2] + dateTo[1] + dateTo[0];
        if (dateTo != 'NaN' && dateFr != 'NaN') {
            if (dateTo > dateFr) {
                this.degree.from = subFr == '' || subFr == null ? subFr : this.toDate(subFr);
                this.degree.to = subTo == '' || subTo == null ? subTo : this.toDate(subTo);
            } else {
                this.degreeErrorNotice = "To date should be greater than or equal to From date.";
                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.degreeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        } else {
            this.degreeErrorNotice = "Select The Date.";
            var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.degreeErrorNotice + '</strong></p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
        }
    }

    clearDate(dateType) {
        if (dateType == 1) {
            jQuery('input[name="sub-date-from-0"]').val('');
            jQuery('input[name="sub-date-to-0"]').val('');
        }
        else if (dateType == 2) {
            jQuery('input[name="col-date-from-0"]').val('');
            jQuery('input[name="col-date-to-0"]').val('');
        }
        else if (dateType == 3) {
            jQuery('input[name="deg-date-from-0"]').val('');
            jQuery('input[name="deg-date-to-0"]').val('');
        }
    }

    toDate(dateStr) {
        var parts = dateStr.split("-");
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    catagories(catagory) {
        this.catagory = catagory;
        if (catagory == 1) {
            this.categoryValue = 'Currently Taking / Future / Past Student';
            this.subject.subjects_user_type = catagory;
            setTimeout(function () {
                jQuery('input[name="sub-date-from-0"]').datepicker({
                    autoclose: true, format: 'mm-yyyy', startView: 'months',
                    minViewMode: 'months'
                });
                jQuery('input[name="sub-date-to-0"]').datepicker({
                    autoclose: true, format: 'mm-yyyy', startView: 'months',
                    minViewMode: 'months'
                });
            }, 500);
        }
        else if (catagory == 3) {
            this.categoryValue = 'Subject Expert';
            this.subject.subjects_user_type = catagory;
        }
        else if (catagory == 4) {
            this.categoryValue = 'Teacher of Subject';
            this.subject.subjects_user_type = catagory;
        }
        else if (catagory == 5) {
            this.categoryValue = 'Just Interested';
            this.subject.subjects_user_type = catagory;
        }
        else if (catagory == 0) {
            this.categoryValue = null;
            this.subject.subjects_user_type = null;
        }
    }

    public isEquivalent(a, b) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }
    
    openAddNewSubjectModel() {
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
                                this.imageFile.target.value = "";
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                jQuery("#addSubjectModal").modal('hide');
                                this.showAddNewSubject = false;
                                this.selectSubject(result['data']['_id'], result['data']['name']);
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
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                jQuery("#addSubjectModal").modal('hide');
                                this.showAddNewSubject = false;
                                this.selectSubject(post_subject['data']['_id'], post_subject['data']['name']);
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
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        jQuery("#addCollegeModal").modal('hide');
                    } else if (result['status'] = 2) {
                        this.photosToUpload = '';
                        this.message.name.name = '';
                        this.errorAddCollege = '';
                        if (typeof (this.imageFile) != "undefined")
                        this.imageFile.target.value = "";
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        jQuery("#addCollegeModal").modal('hide');
                        this.showAddNewCollege = false;
                        this.selectCollege(result['data']['_id'], result['data']['name']);
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
                            this.getAllColleges();
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#addCollegeModal").modal('hide');
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_college['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        } else if (post_college['status'] = 2) {
                            this.message.name.name = '';
                            this.errorAddCollege = '';
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#addCollegeModal").modal('hide');
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_college['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            this.showAddNewCollege = false;
                            this.selectCollege(post_college['data']['_id'], post_college['data']['name']);
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
                            this.getAllDegrees();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#addDegreeModal").modal('hide');
                        } else if (result['status'] = 2) {
                            this.photosToUpload = '';
                            this.messageDegree.name.name = '';
                            this.messageDegree.type.type = '';
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            jQuery("#addDegreeModal").modal('hide');
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            this.showAddNewDegree = false;
                            this.selectDegree(result['data']['_id'], result['data']['name']);
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
                                this.getAllDegrees();
                                jQuery("#addDegreeModal").modal('hide');
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            } else if (post_subject['status'] = 2) {
                                this.messageDegree.name.name = '';
                                this.messageDegree.type.type = '';
                                this.error.degreename = '';
                                this.error.degreeOption = '';
                                jQuery("#addDegreeModal").modal('hide');
                                var n = noty({ text: '<div clas s="alert bg-theme-dark"><p>Degree Added.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                this.showAddNewDegree = false;
                                this.selectDegree(post_subject['data']['_id'], post_subject['data']['name']);
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
            this.subjectList = subject.data;
        });
    }
    
    getAllColleges() {
        this.dataService.getData(this._dataUrlCollege + 1).subscribe(colleges => {
            this.collegeList = colleges.data;
        });

    }
    
    getAllDegrees() {
        this.dataService.getData(this._dataUrlDegree + 1).subscribe(degrees => {
            this.degreeList = degrees.data;
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

}
