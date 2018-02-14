import { GridDataService, PageService } from '../../theme/services';
import { Component, ViewEncapsulation, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Router, RouteParams, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

@Component({
    selector: 'globalSearchList',
    directives: [],
    template: require('./globalSearchList.html')
})
export class GlobalSearchList {
    router: Router;
    public _headerDataUrl = '/api/user/getHeaderData';
    public _allMembersDataUrl = '/api/user/getAllSearchedMember/';
    public _allSubjectsDataUrl = '/api/user/getAllSearchedSubject/';
    public _allCollegesDataUrl = '/api/user/getAllSearchedCollege/';
    public _allDegreesDataUrl = '/api/user/getAllSearchedDegree/';
    public _allGroupDataUrl = '/api/user/getAllSearchedGroups/';
    public _allEventDataUrl = '/api/user/getAllSearchedEvents/';
    public type: any;
    public heading: string;
    public name: string;
    public searchField = { name: "" };
    public dataList: Array<any> = [];
    public counter: number = 0;
    public scrollActive: boolean = false;
    public loader: boolean = false;
    constructor(private dataService: GridDataService, private page: PageService, router: Router, routeParams: RouteParams, elementRef: ElementRef) {
        this.router = router;
        this.page.join = 1;
        this.type = routeParams.get('type'); // 1=members,2=subjects,3=college,4=degree
        this.name = routeParams.get('name');
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.heading = this.type == 1 ? 'Member' : this.type == 2 ? 'Subject' : this.type == 3 ? 'College' : this.type == 4 ? 'Degree' : this.type == 5 ? 'Groups' : 'Events';

        if (this.type == 1) {
            this.searchedMemberList();
        } else if (this.type == 2) {
            this.searchedSubjectList();
        } else if (this.type == 3) {
            this.searchedCollegeList();
        } else if (this.type == 4) {
            this.searchedDegreeList();
        } else if (this.type == 5) {
            this.searchedGroupList();
        } else if (this.type == 6) {
            this.searchedEventList();
        }

    }


    public searchedMemberList(): void {
        this.searchField.name = this.name;
        this.loader = true;
        if (this.searchField.name) {
            this.dataService.postData(this._allMembersDataUrl + this.counter, this.searchField)
                .subscribe(res => {
                    this.loader = false;
                    if (res.status == 2) {
                        if (res.searchedMember.length == 0) {
                            this.scrollActive = false;
                        } else {
                            this.scrollActive = true;
                        }

                        if (res.searchedMember.length && this.counter == 0) {
                            this.dataList = res.searchedMember;
                        }
                        if (res.searchedMember.length && this.counter !== 0) {
                            this.dataList = this.dataList.concat(res.searchedMember);
                        }
                        this.counter++;
                    }
                });
        } else {
            console.log('name not found');
        }
    }
    public searchedSubjectList(): void {
        this.loader = true;
        this.searchField.name = this.name;
        if (this.searchField.name) {
            this.dataService.postData(this._allSubjectsDataUrl + this.counter, this.searchField)
                .subscribe(res => {
                    this.loader = false;
                    if (res.status == 2) {
                        if (res.searchedSubjects.length == 0) {
                            this.scrollActive = false;
                        } else {
                            this.scrollActive = true;
                        }
                        if (res.searchedSubjects.length && this.counter == 0) {
                            this.dataList = res.searchedSubjects;
                        }
                        if (res.searchedSubjects.length && this.counter !== 0) {
                            this.dataList = this.dataList.concat(res.searchedSubjects);
                        }
                        this.counter++;
                    }
                });
        } else {
            console.log('name not found');
        }
    }
    public searchedCollegeList(): void {
        this.loader = true;
        this.searchField.name = this.name;
        if (this.searchField.name) {
            this.dataService.postData(this._allCollegesDataUrl + this.counter, this.searchField)
                .subscribe(res => {
                    this.loader = false;
                    if (res.status == 2) {
                        if (res.searchedCollege.length == 0) {
                            this.scrollActive = false;
                        } else {
                            this.scrollActive = true;
                        }
                        if (res.searchedCollege.length && this.counter == 0) {
                            this.dataList = res.searchedCollege;
                        }
                        if (res.searchedCollege.length && this.counter !== 0) {
                            this.dataList = this.dataList.concat(res.searchedCollege);
                        }
                        this.counter++;
                    }
                });
        } else {
            console.log('name not found');
        }
    }
    public searchedDegreeList(): void {
        this.loader = true;
        this.searchField.name = this.name;
        if (this.searchField.name) {
            this.dataService.postData(this._allDegreesDataUrl + this.counter, this.searchField)
                .subscribe(res => {
                    this.loader = false;
                    if (res.status == 2) {
                        if (res.searchedDegree.length == 0) {
                            this.scrollActive = false;
                        } else {
                            this.scrollActive = true;
                        }
                        if (res.searchedDegree.length && this.counter == 0) {
                            this.dataList = res.searchedDegree;
                        }
                        if (res.searchedDegree.length && this.counter !== 0) {
                            this.dataList = this.dataList.concat(res.searchedDegree);
                        }
                        this.counter++;
                    }
                });
        } else {
            console.log('name not found');
        }
    }

    public getSubjectWall(id): void {
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

    public getCollegeWall(id): void {
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

    public getDegreeWall(id): void {
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

    public getProfileById(id): void {
        if (this.page.userIdGlobal == id) {
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else {
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }
    public onBackClick(): void {
        this.router.navigate(['GlobalSearch', { name: this.name }]);
    }

    public onItemClick(id): void {
        if (this.type == 1) {
            this.getProfileById(id);
        } else if (this.type == 2) {
            this.getSubjectWall(id);
        } else if (this.type == 3) {
            this.getCollegeWall(id);
        } else if (this.type == 4) {
            this.getDegreeWall(id);
        } else if (this.type == 5) {
            this.goToGroupWall(id);
        } else if (this.type == 6) {
            this.goToEventWall(id);
        }

    }
    public goToGroupWall(id): void {
        this.page.wallId = id;
        this.router.navigate(['GroupWallComponent', { id: id }]);
    }
    public goToEventWall(id): void {
        this.page.wallId = "";
        this.router.navigate(['EventWallComponent', { eventId: id }]);
    }

    onScrollSearch(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50))) {
            if (this.scrollActive) {
                this.scrollActive = false;
                if (this.type == 1) {
                    this.searchedMemberList();
                } else if (this.type == 2) {
                    this.searchedSubjectList();
                } else if (this.type == 3) {
                    this.searchedCollegeList();
                } else if (this.type == 4) {
                    this.searchedDegreeList();
                }
                else if (this.type == 5) {
                    this.searchedGroupList();
                }
                else if (this.type == 6) {
                    this.searchedEventList();
                }
            }

        }
    }

    public searchedGroupList(): void {
        this.loader = true;
        this.searchField.name = this.name;
        if (this.searchField.name) {
            this.dataService.postData(this._allGroupDataUrl + this.counter, this.searchField)
                .subscribe(res => {
                    this.loader = false;
                    if (res.status == 2) {
                        if (res.searchedGroup.length == 0) {
                            this.scrollActive = false;
                        } else {
                            this.scrollActive = true;
                        }
                        if (res.searchedGroup.length && this.counter == 0) {
                            this.dataList = res.searchedGroup;
                        }
                        if (res.searchedGroup.length && this.counter !== 0) {
                            this.dataList = this.dataList.concat(res.searchedGroup);
                        }
                        this.counter++;
                    }
                });
        } else {
            console.log('name not found');
        }
    }

    public searchedEventList(): void {
        this.loader = true;
        this.searchField.name = this.name;
        if (this.searchField.name) {
            this.dataService.postData(this._allEventDataUrl + this.counter, this.searchField)
                .subscribe(res => {
                    this.loader = false;
                    if (res.status == 2) {
                        if (res.searchedEvent.length == 0) {
                            this.scrollActive = false;
                        } else {
                            this.scrollActive = true;
                        }
                        if (res.searchedEvent.length && this.counter == 0) {
                            this.dataList = res.searchedEvent;
                        }
                        if (res.searchedEvent.length && this.counter !== 0) {
                            this.dataList = this.dataList.concat(res.searchedEvent);
                        }
                        this.counter++;
                    }
                });
        } else {
            console.log('name not found');
        }
    }


}

