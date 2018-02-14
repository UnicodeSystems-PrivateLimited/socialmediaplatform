import { Component, ViewEncapsulation } from '@angular/core';
import { GridDataService, PageService } from '../../theme/services';
import { Router, RouteParams, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
declare var require: any;

@Component({
    selector: 'collegePastCurrentMembers',
    template: require('./collegePastCurrentMember.html'),
    directives: [ROUTER_DIRECTIVES],
})

export class CollegePastCurrentMember {

    private _dataUrlCurrentMembers: string = 'api/college/getcollegeData/getCurrentMembers/';
    private _dataUrlFutureMembers: string = 'api/college/getcollegeData/getFutureMembers/';
    private _dataUrlPastMembers: string = 'api/college/getcollegeData/getPastMembers/';
    private _dataUrlFriendCollegeMembers: string = 'api/college/getcollegeData/getFriendCollegeMembers/';
    private _dataUrlCollege = '/api/college/getcollegeData/';
    public collegeId: number = null;
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
    public collegeName: string = '';
    public filterName: string = '';
    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, private router: Router) {
        this.collegeId = +routeParams.get('collegeId');
        this.connectionId = +routeParams.get('id');
        this.selectedTypyMember = this.connectionId;
    }

    ngOnInit() {
        this.getCollegeData();
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        if (this.connectionId && this.connectionId == 1) {
            this.getCurrentMembers();
        } else if (this.connectionId && this.connectionId == 2) {
            this.getPastMembers();
        } else if (this.connectionId && this.connectionId == 3) {
            this.getFutureMembers();
        } else if (this.connectionId && this.connectionId == 4) {
            this.getFriendCollegeMembers();
        } else if (this.connectionId && this.connectionId == 5) {
            this.getAllCollegeMembers();
        }
    }

    getCollegeData() {
        this.dataService.getData(this._dataUrlCollege + this.collegeId).subscribe(sub => {
            if (sub.status == 2) {
                this.page.is_member = sub.is_member;
                this.page.wall_type = "College";
                this.page.walldetails = sub.collegeDetails;
                if (sub.collegeDetails.members) {
                    this.page.member_count = sub.collegeDetails.members.length;
                }
            }
        });
    }

    getCurrentMembers() {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlCurrentMembers + this.collegeId).subscribe(res => {
            if (res.status == 2) {
                this.current_member = res.current_members;
                this.filterName = 'Current Students';
                this.collegeName = res.collegeDetails.name;
                this.currentMemberCount = this.current_member.length;
            }
            this.page.hideLoader();
        });
    }
    getFutureMembers() {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlFutureMembers + this.collegeId).subscribe(res => {
            if (res.status == 2) {
                this.future_member = res.future_members;
                this.filterName = 'Future Students';
                this.collegeName = res.collegeDetails.name;
                this.futureMemberCount = this.future_member.length;
            }
            this.page.hideLoader();
        });
    }

    getPastMembers() {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlPastMembers + this.collegeId).subscribe(res => {
            if (res.status == 2) {
                this.past_member = res.past_members;
                this.filterName = 'Past Students';
                this.collegeName = res.collegeDetails.name;
                this.pastMemberCount = this.past_member.length;
            }
            this.page.hideLoader();
        });
    }
    public getFriendCollegeMembers(): void {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlFriendCollegeMembers + this.collegeId).subscribe(res => {
            if (res.status == 2) {
                this.friend_member = res.friend_members;
                this.filterName = 'Friend Students';
                this.collegeName = res.collegeDetails.name;
                this.friendMemberCount = this.friend_member.length;
            }
            this.page.hideLoader();
        });
    }
    public getAllCollegeMembers(): void {
        this.page.showLoader();
        this.dataService.getData(this._dataUrlPastMembers + this.collegeId).subscribe(res => {
            if (res.status == 2) {
                this.all_member = res.collegeDetails.members;
                this.allMemberCount = this.all_member.length;
                this.filterName = 'All Members';
                this.collegeName = res.collegeDetails.name;
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
            this.getFriendCollegeMembers();
        } else if (type == 5) {
            this.getAllCollegeMembers();
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

    getCollegeWall() {
        let id: any = this.collegeId;
        this.page.wallId = id;
        this.router.navigate(['CollegeWall', { collegeId: this.collegeId }]);
    }


}
