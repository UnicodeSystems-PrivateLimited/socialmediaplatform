import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { GridDataService, PageService } from '../../theme/services';
import { GroupService } from '../group/group.service';
import { GroupMemberFilterPipe, TrimPipe, MemberFilterPipe} from '../../theme/pipes';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'groups',
    template: require('./groupsMember.html'),
    pipes: [GroupMemberFilterPipe, TrimPipe, MemberFilterPipe],
    host: { 'class': 'ng-animate page1Container' },
    providers: [GroupService],
})

export class GroupsMemberComponent {
    router: Router;
    public groupId: any;
    public members: Array<any> = [];
    public groupData: any;
    public pendingMember: Array<any> = [];
    public memberSearch: string;
    public counter: number = 0;
    public pageType;
    public scdIds: any = null;
    public showLoader: boolean = true;
    constructor(private dataService: GridDataService,
        private page: PageService,
        private service: GroupService,
        routeParams: RouteParams,
        router: Router) {
        this.groupId = routeParams.get('groupId');
        this.router = router;
        if (routeParams.get('type')) {
            this.pageType = routeParams.get('type');
        }
        if (routeParams.get('id')) {
            this.scdIds = routeParams.get('id');
        }
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.getMembersList();
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

    public getMembersList(): void {
        this.service.getGroupMembers(this.groupId).subscribe(
            res => {
                if (res.status == 2) {
                    this.groupData = res.data;
                    if (this.groupData.created_by == this.page.userIdGlobal) {
                        this.getGroupPendingMember();
                    }
                }
                this.showLoader = false;
            });
    }
    public getGroupPendingMember(): void {
        this.service.getGroupPendingMember(this.groupId).subscribe((res) => {
            if (res.status == 2) {
                this.pendingMember = res.data;
            }
        })
    }

    goToPreviousPage() {
        if (this.pageType == 1) {
            this.router.navigate(['GroupsComponent']);
        }
        else if (this.pageType == 2) {
            this.page.wallId = this.groupId;
            this.router.navigate(['GroupWallComponent', { id: this.groupId }]);
        } else if (this.pageType == 3) {
            this.page.wallId = this.scdIds;
            this.router.navigate(['SubjectWallComponent', { subjectId: this.page.wallId }]);
        } else if (this.pageType == 4) {
            this.page.wallId = this.scdIds;
            this.router.navigate(['CollegeWall', { collegeId: this.page.wallId }]);
        } else if (this.pageType == 5) {
            this.page.wallId = this.scdIds;
            this.router.navigate(['BachelorView', { degreeId: this.page.wallId }]);
        }
    }
    public getSubjectWall(id) {
        this.page.wallId = id;
        this.page.join = 0;
        this.service.getHeaderData().subscribe(header => {
            for (var i = 0; i < header.data.subjects.length; i++) {
                if (header.data.subjects[i].subject_id._id == id) {
                    this.page.join = 1;
                }
            }
        });
        this.router.navigate(['SubjectWallComponent', { subjectId: id }]);
    }

    public getCollegeWall(id) {
        this.page.wallId = id;
        this.page.join = 0;
        this.service.getHeaderData().subscribe(header => {
            for (var i = 0; i < header.data.college.length; i++) {
                if (header.data.college[i].college_id._id == id) {
                    this.page.join = 1;
                }
            }
        });
        this.router.navigate(['CollegeWall', { collegeId: id }]);
    }

    public getDegreeWall(id) {
        this.page.wallId = id;
        this.page.join = 0;
        this.service.getHeaderData().subscribe(header => {
            for (var i = 0; i < header.data.degree.length; i++) {
                if (header.data.degree[i].degree_id._id == id) {
                    this.page.join = 1;
                }
            }
        });
        this.router.navigate(['BachelorView', { degreeId: id }]);
    }
    public onClickReInvite(member: any): void {
        this.service.sendGroupInvite([member._id], this.groupId).subscribe((res) => {
            if (res.status == 2) {
                this.page.showSuccess("Re-invite sent successfully.");
            }
        });
    }
}
