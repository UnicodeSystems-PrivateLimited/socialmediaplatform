import { Component, ViewEncapsulation } from '@angular/core';
import { GridDataService, PageService } from '../../theme/services';
import { RouteParams, Router, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
declare var require: any;

@Component({
    selector: 'subjectPastCurrentMember',
    template: require('./subjectPastCurrentMember.html'),
    host: { 'class': 'ng-animate page1Container' },
    directives: [ROUTER_DIRECTIVES]
})

export class SubjectPastCurrentComponent {

    private _dataUrlCurrentMembers: string = 'api/subject/getSubjectData/getCurrentMembers/';
    private _dataUrlFutureMembers: string = 'api/subject/getSubjectData/getFutureMembers/';
    private _dataUrlPastMembers: string = 'api/subject/getSubjectData/getPastMembers/';
    private _dataUrlFriendSubjectMembers: string = 'api/subject/getSubjectData/getFriendSubjectMembers/';
        private _dataUrlProfileByUser = 'api/subject/getSubjectData/';
    public subjectId: number = null;
    public connectionId: number = null;
    public current_member: Array<any> = [];
    public past_member: Array<any> = [];
    public future_member: Array<any> = [];
    public friend_member: Array<any> = [];
    public all_member: Array<any> = [];
    public currentMemberCount: number = 0;
    public pastMemberCount: number = 0;
    public futureMemberCount: number = 0;
    public friendMemberCount: number = 0;
    public allMemberCount: number = 0;
    public selectMembers: Array<any> = [{ label: 'Current students', value: 1 }, { label: 'Past students', value: 2 }, { label: 'Future students', value: 3 }, { label: 'Friend Students', value: 4 }, { label: 'All Members', value: 5 }];
    public selectedTypyMember: number = 1;
    public subjectName: string = '';
    public filterName: string = '';
    constructor(private dataService: GridDataService, private page: PageService, private routeParams: RouteParams, private router: Router) {
        this.subjectId = +routeParams.get('subjectId');
        this.connectionId = +routeParams.get('id');
        this.selectedTypyMember = this.connectionId;
    }

    public ngOnInit(): void {
        this.getSubjectData();
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        if (this.connectionId && this.connectionId == 1) {
            this.getCurrentMembers();
        } else if (this.connectionId && this.connectionId == 2) {
            this.getPastMembers();
        } else if (this.connectionId && this.connectionId == 3) {
            this.getFutureMembers();
        } else if (this.connectionId && this.connectionId == 4) {
            this.getFriendSubjectMembers();
        } else if (this.connectionId && this.connectionId == 5) {
            this.getAllSubjectMembers();
        }
    }


     getSubjectData() {
        this.dataService.getData(this._dataUrlProfileByUser + this.subjectId).subscribe(sub => {
            this.page.is_member = sub.is_member;
            this.page.wall_type = "Subject";
            this.page.walldetails = sub.subjectDetails;
            if (sub.subjectDetails.members) {
                this.page.member_count = sub.subjectDetails.members.length;
            }
        });
    }

    public getCurrentMembers(): void {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlCurrentMembers + this.subjectId).subscribe(res => {
            if (res.status == 2) {
                this.current_member = res.current_members;
                this.filterName = 'Current Students';
                this.subjectName = res.subjectDetails.name;
                this.currentMemberCount = this.current_member.length;
            }
            this.page.hideLoader();
        });
    }

    public getFutureMembers(): void {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlFutureMembers + this.subjectId).subscribe(res => {
            if (res.status == 2) {
                this.future_member = res.future_members;
                this.filterName = 'Future Students';
                this.subjectName = res.subjectDetails.name;
                this.futureMemberCount = this.future_member.length;
            }
            this.page.hideLoader();
        });
    }

    public getPastMembers(): void {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlPastMembers + this.subjectId).subscribe(res => {
            if (res.status == 2) {
                this.past_member = res.past_members;
                this.filterName = 'Past Students';
                this.subjectName = res.subjectDetails.name;
                this.pastMemberCount = this.past_member.length;
            }
            this.page.hideLoader();
        });
    }
    public getFriendSubjectMembers(): void {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlFriendSubjectMembers + this.subjectId).subscribe(res => {
            if (res.status == 2) {
                this.friend_member = res.friend_members;
                this.filterName = 'Friend Students';
                this.subjectName = res.subjectDetails.name;
                this.friendMemberCount = this.friend_member.length;
            }
            this.page.hideLoader();
        });
    }
    public getAllSubjectMembers(): void {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlCurrentMembers + this.subjectId).subscribe(res => {
            if (res.status == 2) {
                this.all_member = res.subjectDetails.members;
                this.allMemberCount = this.all_member.length;
                this.filterName = 'All Members';
                this.subjectName = res.subjectDetails.name;
            }
            this.page.hideLoader();
        });
    }
    public showStudents(type: number): void {
        this.selectedTypyMember = type;
        this.clearVariables();
        if (type == 1) {
            this.getCurrentMembers();
        } else if (type == 2) {
            this.getPastMembers();
        } else if (type == 3) {
            this.getFutureMembers();
        } else if (type == 4) {
            this.getFriendSubjectMembers();
        } else if (type == 5) {
            this.getAllSubjectMembers();
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
    public clearVariables(): void {
        this.current_member = [];
        this.past_member = [];
        this.future_member = [];
        this.friend_member = [];
        this.all_member = [];
        this.currentMemberCount = 0;
        this.pastMemberCount = 0;
        this.futureMemberCount = 0;
        this.friendMemberCount = 0;
        this.allMemberCount = 0;
    }

    getSubjectWall() {
        let id: any = this.subjectId
        this.page.wallId = id;
        this.router.navigate(['SubjectWallComponent', { subjectId: this.subjectId }]);
    }

}



