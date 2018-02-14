import { GridDataService, PageService } from '../../theme/services';
import { Component, ViewEncapsulation, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Router, RouteParams, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

@Component({
    selector: 'globalSearch',
    directives: [],
    template: require('./globalSearch.html')
})
export class GlobalSearch {
    router: Router;
    public _headerDataUrl = '/api/user/getHeaderData';
    public _searchDataUrl = '/api/user/search';
    public name: string;
    public searchField = { name: "" };
    public members: Array<any> = [];
    public subjects: Array<any> = [];
    public colleges: Array<any> = [];
    public degrees: Array<any> = [];
    public groups: Array<any> = [];
    public events: Array<any> = [];
    constructor(private dataService: GridDataService, private page: PageService, router: Router, routeParams: RouteParams, elementRef: ElementRef) {
        this.router = router;
        this.page.join = 1;
        this.name = routeParams.get('name');
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.page.wallId = "";
        this.searchList();
    }

    public searchList(): void {
        this.searchField.name = this.name;
        if (this.searchField.name) {
            this.dataService.postData(this._searchDataUrl, this.searchField)
                .subscribe(res => {
                    if (res.status == 2) {
                        if (res.members) {
                            this.members = res.members;
                        }
                        if (res.subjects) {
                            this.subjects = res.subjects;
                        }
                        if (res.colleges) {
                            this.colleges = res.colleges;
                        }
                        if (res.degrees) {
                            this.degrees = res.degrees;
                        }
                        if (res.groups) {
                            this.groups = res.groups;
                        }
                        if (res.events) {
                            this.events = res.events;
                        }
                    }
                });
        } else {
            console.log('name not found');
        }
    }
    public getGroupWall(id): void {
        this.page.wallId = id;
        this.router.navigate(['GroupWallComponent', { id: id }]);
    }
    public getEventWall(id): void {
        this.page.wallId = "";
        this.router.navigate(['EventWallComponent', { eventId: id }]);
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

    getProfileById(id) {
        if (this.page.userIdGlobal == id) {
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else {
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }

    onSeeAllClick(type: number): void {
        this.router.navigate(['GlobalSearchList', { type: type, name: this.name }]);
    }

}

