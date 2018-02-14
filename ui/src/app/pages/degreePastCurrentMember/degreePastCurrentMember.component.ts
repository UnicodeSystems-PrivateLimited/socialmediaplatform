import { Component, OnInit } from '@angular/core';
import { GridDataService, PageService } from '../../theme/services';
import { Router, RouteParams, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

@Component({
    selector: 'bachelor-list',
    template: require('./degreePastCurrentMember.html'),
    host: { 'class': 'ng-animate page1Container' },
    directives: [ROUTER_DIRECTIVES]
})

export class BachelorPastCurrentComponent {

    private _dataUrlCurrentMembers: string = 'api/degree/getDegreeData/getCurrentMembers/';
    private _dataUrlPastMembers: string = 'api/degree/getDegreeData/getPastMembers/';
    private _dataUrlFutureMembers: string = 'api/degree/getDegreeData/getFutureMembers/';
    private _dataUrlFriendDegreeMembers: string = 'api/degree/getDegreeData/getFriendDegreeMembers/';
    private _dataUrlDegree = '/api/degree/getDegreeData/';
    public degreeId: number = null;
    public connectionId: number = null;
    public current_member: Array<any> = [];
    public future_member: Array<any> = [];
    public past_member: Array<any> = [];
    public friend_member: Array<any> = [];
    public all_member: Array<any> = [];
    public currentMemberCount: number = 0;
    public pastMemberCount: number = 0;
    public futureMemberCount: number = 0;
    public friendMemberCount: number = 0;
    public allMemberCount: number = 0;
    public selectMembers: Array<any> = [{ label: 'Current students', value: 1 }, { label: 'Past students', value: 2 }, { label: 'Future students', value: 3 }, { label: 'Friend Students', value: 4 }, { label: 'All Members', value: 5 }];
    public selectedTypyMember: number = 1;
    public degreeName: string = '';
    public filterName: string = '';
    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, private router: Router) {
        this.degreeId = +routeParams.get('degreeId');
        this.connectionId = +routeParams.get('id');
        this.selectedTypyMember = this.connectionId;
    }

    ngOnInit() {
        this.getBachelorWall();
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        if (this.connectionId && this.connectionId == 1) {
            this.getCurrentMembers();
        } else if (this.connectionId && this.connectionId == 2) {
            this.getPastMembers();
        } else if (this.connectionId && this.connectionId == 3) {
            this.getFutureMembers();
        } else if (this.connectionId && this.connectionId == 4) {
            this.getFriendDegreeMembers();
        } else if (this.connectionId && this.connectionId == 5) {
            this.getAllDegreeMembers();
        }
    }

    getBachelorWall() {
        this.dataService.getData(this._dataUrlDegree + this.degreeId).subscribe(sub => {
            this.page.is_member = sub.is_member;
            this.page.wall_type = "Degree";
            this.page.walldetails = sub.degreeDetails;
            if (sub.degreeDetails.members) {
                this.page.member_count = sub.degreeDetails.members.length;
            }
        });
    }

    getCurrentMembers() {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlCurrentMembers + this.degreeId).subscribe(res => {
            if (res.status == 2) {
                this.current_member = res.current_members;
                this.filterName = 'Current Students';
                this.degreeName = res.degreeDetails.name;
                this.currentMemberCount = this.current_member.length;
            }
            this.page.hideLoader();
        });
    }

    getPastMembers() {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlPastMembers + this.degreeId).subscribe(res => {

            if (res.status == 2) {
                this.past_member = res.past_members;
                this.filterName = 'Past Students';
                this.degreeName = res.degreeDetails.name;
                this.pastMemberCount = this.past_member.length;
            }
            this.page.hideLoader();
        });
    }

    getFutureMembers() {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlFutureMembers + this.degreeId).subscribe(res => {
            if (res.status == 2) {
                this.future_member = res.future_members;
                this.filterName = 'Future Students';
                this.degreeName = res.degreeDetails.name;
                this.futureMemberCount = this.future_member.length;
            }
            this.page.hideLoader();
        });
    }

    public getFriendDegreeMembers(): void {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlFriendDegreeMembers + this.degreeId).subscribe(res => {
            if (res.status == 2) {
                this.friend_member = res.friend_members;
                this.filterName = 'Friend Students';
                this.degreeName = res.degreeDetails.name;
                this.friendMemberCount = this.friend_member.length;
            }
            this.page.hideLoader();
        });
    }

    getAllDegreeMembers() {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlCurrentMembers + this.degreeId).subscribe(res => {
            if (res.status == 2) {
                this.all_member = res.degreeDetails.members;
                this.allMemberCount = this.all_member.length;
                this.filterName = 'All Members';
                this.degreeName = res.degreeDetails.name;
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
            this.getFriendDegreeMembers();
        } else if (type == 5) {
            this.getAllDegreeMembers();
        }
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

    getDegreeWall() {
        let id: any = this.degreeId;
        this.page.wallId = id;
        this.router.navigate(['BachelorView', { degreeId: this.degreeId }]);
    }
}
