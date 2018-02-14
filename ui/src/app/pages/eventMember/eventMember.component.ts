import {Component, ViewEncapsulation} from '@angular/core';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {GridDataService,PageService} from '../../theme/services';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
  selector: 'eventMember',
  template: require('./eventMember.html'),
  pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' }
})

export class EventMember {
    public socialPostUrl = '/api/user/postSocialLink';
    public events;
    public _dataUrlUserGroup = '/api/groupevents/listEventsById/';
    public _userSearchUrl = '/api/group/userSearch';
    public _groupSearchUrl = '/api/group/groupSearch';
    public _addMemberUrl = '/api/groupevents/addmembers/';
    public _dataUrlGetUserGroup = '/api/groupevents/getUserGroup/';
    public _addEventMemberNotification = '/api/notification/addEventNotification';
    public _dataUrlDeleteEventMember='/api/groupevents/deleteEventMember';
    public addEventMemberTitle = 'added you to event';
    public groupId;
    public error = { eventMember: ""};
    public userSearchField = { name: "" };
    public userSearchField1 = { name: "" };
    public userSearchList;
    public userSearchList1;
    public eventMemberId;
    public tmpMemberIds = [];
    public tmpMembers = [];
    public tmpGroupIds = [];
    public tmpGroup = [];
    private post_type = {
        SENDREQ: 0,
        EVENTNOTIFY: 2,
    };
    router: Router;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.groupId = routeParams.get('eventId');
        this.router = router;
    }

    ngOnInit() {
        this.getGroupdata();
    }

    getProfileById(id) {
        if(this.page.userIdGlobal == id){
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else{
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }

    getGroupdata() {
        this.dataService.getData(this._dataUrlUserGroup + this.groupId).subscribe(res => {
            if (res.status == 2) {
                this.events = res.data;
            }
        });
    }

    deleteEventMemberModal(groupId, eventMemberId) {
        this.groupId = groupId;
        this.eventMemberId = eventMemberId;
        jQuery("#eventMemberRemoveModal").modal({ backdrop: false });
    }

    deleteEventMember() {
        this.dataService.getData(this._dataUrlDeleteEventMember + '/' + this.groupId + '/' +  this.eventMemberId).subscribe(res => {
            this.getGroupdata();
        });
    }

    friendSearch() {
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
                        } else this.userSearchList = null;
                    });
            }
        }
    }

    clearEventMember() {
        this.userSearchList = null;
        this.userSearchList1 = null;
    }

    groupSearch() {
        if (this.userSearchField1.name == '' || this.userSearchField1.name == null) {
            this.userSearchList1 = null;
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (this.userSearchField1.name.match(nameValid)) {
                this.dataService.postData(this._groupSearchUrl, this.userSearchField1)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.userSearchList1 = res.data;

                        } else this.userSearchList1 = null;

                    });
            }
        }
    }

    addToGroup(userId, obj) {
        var t = obj;
        var m, n;
        for (var i = 0; i < this.tmpMemberIds.length; i++) {
            if (this.tmpMemberIds[i] == userId) {
                n = userId;
            }
        }
        this.dataService.getData(this._dataUrlGetUserGroup + this.groupId).subscribe(res => {
            for (var i = 0; i < res[0].members.length; i++) {
                if (res[0].members[i].user_id == userId) {
                    m = userId;
                }
            }
            if (!m && !n) {
                this.tmpMemberIds.push(userId);
                this.tmpMembers.push(t);
            }
        });
        this.userSearchList = null;
    }

    addGrToGroup(groupId, obj) {
        var t = obj;
        var m, n;
        for (var i = 0; i < this.tmpGroupIds.length; i++) {
            if (this.tmpGroupIds[i] == groupId) {
                n = groupId;
            }
        }
        this.dataService.getData(this._dataUrlGetUserGroup + this.groupId).subscribe(res => {
            for (var i = 0; i < res[0].groups.length; i++) {
                if (res[0].groups[i].group_id == groupId) {
                    m = groupId;
                }
            }
            if (!m && !n) {
                this.tmpGroupIds.push(groupId);
                this.tmpGroup.push(t);
            }
        });
        this.userSearchList1 = null;
    }

    addMembers() {
        if (this.tmpMemberIds.length > 0 || this.tmpGroupIds.length > 0) {
                this.dataService.postData(this._addMemberUrl + this.groupId, { members: this.tmpMemberIds, groups: this.tmpGroupIds }).subscribe(res => {
                    if (res.status === 2) {
                        this.getGroupdata();
                        this.dataService.postData(this._addEventMemberNotification + '/' + this.post_type.EVENTNOTIFY + '/' + this.groupId, { members: this.tmpMemberIds, title: this.addEventMemberTitle }).subscribe(res => {
                        });
                        this.tmpMemberIds = [];
                        this.tmpMembers = [];
                        this.tmpGroupIds = [];
                        this.tmpGroup = [];
                        this.userSearchField1.name = this.userSearchField.name = this.error.eventMember = "";
                        jQuery("#addEventMember").modal('hide');
                    } else {
                        this.userSearchList = null;
                        this.userSearchList1 = null;
                    }
                });
            } else {
            this.error.eventMember = "Add at least one member or group!.";
            }
        }

    closeEventMemberModel() {
        this.tmpMemberIds = [];
        this.tmpMembers = [];
        this.tmpGroupIds = [];
        this.tmpGroup = [];
        this.userSearchList = null;
        this.userSearchList1 = null;
        this.userSearchField.name = this.error.eventMember = this.userSearchField1.name = "";
    }

    ngAfterViewInit() {
        setTimeout(function() {
            jQuery("#event-add-mem").click(function() {
                jQuery("#addEventMember").modal({ backdrop: false });
            });
        }, 100);


    }



}