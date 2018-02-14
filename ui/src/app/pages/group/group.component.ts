import { Component, OnInit, AfterViewInit, ViewChildren } from '@angular/core';
import { Router, ROUTER_DIRECTIVES, RouteParams } from '@angular/router-deprecated';
import { PageService } from '../../theme/services';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { ThumbnailFileReader } from '../../theme/components';
import { AddGroups, MyWallSearch, GroupError, GroupSearch } from '../../theme/interfaces';
import { DateTime, MemberStatus, RecentPostCountPipe } from '../../theme/pipes';
import { MyWallService } from '../myWall/myWall.service';
import { GroupService } from './group.service';

declare var jQuery;

@Component({
    selector: 'group',
    template: require('./group.html'),
    pipes: [DateTime, MemberStatus, RecentPostCountPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [ROUTER_DIRECTIVES, TOOLTIP_DIRECTIVES, ThumbnailFileReader],
    providers: [GroupService],
})

export class GroupsComponent {
    public showLoader: boolean = false;
    public addGroup: AddGroups = new AddGroups();
    public thumbnail: File | string = null;
    public selectGroupType: Array<any> = [{ label: 'My Created and Joined Groups', value: 1 }, { label: 'My Created Groups', value: 2 }, { label: 'My Private Joined', value: 3 }, { label: 'My Public Joined', value: 4 }, { label: 'All Public Groups', value: 5 }, { label: 'My Left Groups', value: 6 }];
    public groupValue: number = 1;
    public selectSortType: Array<any> = [{ label: 'Sort By', value: 1 }, { label: 'Latest Posts', value: 2 }, { label: 'Group Names', value: 3 }, { label: 'Latest Created Groups', value: 4 }];
    public sortValue: number = 1;
    public selectSortOrder: Array<any> = [{ label: 'Sort Order', value: 1 }, { label: 'Ascending', value: 2 }, { label: 'Descending', value: 3 }];
    public sortOrder: number = 1;
    public scdType: number = 1;
    public searchedSubjectsList: Array<any> = [];
    public searchedCollegesList: Array<any> = [];
    public searchedDegreesList: Array<any> = [];
    public searchData: MyWallSearch = new MyWallSearch();
    public groupError: GroupError = new GroupError();
    public counter: number = 0;
    public groupsList: Array<any> = [];
    public totalGroups: number = null;
    public groupId: number = null;
    public searchActive: boolean = false;
    public scrollController: number = 1;
    public parsep;
    public index: number = null;
    public loader: boolean = false;
    public modalHeadertitle: string = null;
    public isEdit: boolean = false;
    public searchClick: boolean = false;
    public groupSearch: GroupSearch = new GroupSearch();
    public searchMember: any = { name: null };
    public searchedMemeberList: Array<any> = [];
    public scdId: any;
    public wallType: any;

    @ViewChildren(ThumbnailFileReader) thumbnailFileReader: ThumbnailFileReader;

    constructor(private pageService: PageService,
        private myWallService: MyWallService,
        private service: GroupService,
        private router: Router,
        routeParams: RouteParams) {
        this.scdId = routeParams.get('id');
        this.wallType = routeParams.get('wallType');
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.pageService.friendProfileId = '';
        this.pageService.wallId = '';
        this.checkWhichWallGroupsWillShow();
    }

    public checkWhichWallGroupsWillShow() {
        if (this.wallType && this.scdId) {
            this.getSCDGroups();
        } else {
            if (this.pageService.wall_type == "Group" && this.pageService.wallId) {
                this.pageService.wallId = '';
                if (this.pageService.walldetails) {
                    if (this.pageService.walldetails['subject_id']) {
                        this.scdId = this.pageService.walldetails['subject_id']._id;
                        this.wallType = 1;
                        this.getSCDGroups();
                    } else if (this.pageService.walldetails['college_id']) {
                        this.scdId = this.pageService.walldetails['college_id']._id;
                        this.wallType = 2;
                        this.getSCDGroups();
                    } else if (this.pageService.walldetails['degree_id']) {
                        this.scdId = this.pageService.walldetails['degree_id']._id;
                        this.wallType = 3;
                        this.getSCDGroups();
                    } else {
                        this.getGroups();
                    }
                } else {
                    this.getGroups();
                }
            } else {
                this.getGroups();
            }
        }
    }

    public getGroups() {
        this.showLoader = true;
        this.service.getGroups(this.counter).subscribe((res) => {
            if (res.status == 2) {
                this.groupsList = res['data'];
                this.totalGroups = res['total'];
            }
            this.showLoader = false;
        });
    }

    // get groups
    public getSCDGroups(): void {
        this.service.getSCDGroups(this.wallType, this.scdId, 0).subscribe(res => {
            if (res.status == 2) {
                if (res.data) {
                    this.groupsList = res.data;
                    this.totalGroups = res.total;
                }
            }
        });
    }

    public openAddGroupModal(): void {
        this.modalHeadertitle = "Add Group";
        jQuery("#addGroupModal").modal({ backdrop: false });
    }

    public onSelectionChange(privacy: number): void {
        this.addGroup.privacy = privacy;
    }

    photoChangeEvent(fileInput: any): void {
        this.addGroup.icon[0] = fileInput.file[0];
        if (this.addGroup.icon[0].type == 'image/jpeg' || this.addGroup.icon[0].type == 'image/tif' || this.addGroup.icon[0].type == 'image/tiff' || this.addGroup.icon[0].type == 'image/jpg' || this.addGroup.icon[0].type == 'image/png' || this.addGroup.icon[0].type == 'image/gif') {
            this.groupError.groupIcon = null;
        }
        else {
            this.groupError.groupIcon = "Invalid image format";
        }
    }

    public deleteThumbnail(event: any): void {
        this.thumbnail = null;
    }
    public closeSearchBox(): void {
        jQuery("#togglingSearch").toggle();
        jQuery("#changeClass").toggleClass('fa fa-plus', 'add');
        jQuery("#changeClass").toggleClass('fa fa-minus', 'remove');
    }

    //********** search for scd during add edit Group Start****************/

    public onChangeSCD(type: number): void {
        this.scdType = type;
        this.searchData = new MyWallSearch();
        this.addGroup.college_id = null;
        this.addGroup.subject_id = null;
        this.addGroup.degree_id = null;
    }
    public subjectSearch(e: any): void {
        this.searchedCollegesList = [];
        this.searchedDegreesList = [];
        this.searchData.college_name = '';
        this.searchData.degree_name = '';
        if (this.searchData.subject_name) {
            this.myWallService.getUserSubjects(this.searchData.subject_name).subscribe((res) => {
                if (res.status == 2) {
                    this.searchedSubjectsList = res.data;
                }
            })
        } else {
            this.searchData.subject_name = '';
            this.searchedSubjectsList = [];
            this.addGroup.subject_id = null;
        }
    }
    public selectSubject(id: number, name: string): void {
        this.searchData.subject_name = name;
        this.addGroup.subject_id = id;
        this.searchedSubjectsList = [];
    }
    public collegeSearch(e: any): void {
        this.searchedSubjectsList = [];
        this.searchedDegreesList = [];
        this.searchData.degree_name = '';
        this.searchData.subject_name = '';
        if (this.searchData.college_name) {
            this.myWallService.getUserColleges(this.searchData.college_name).subscribe((res) => {
                if (res.status == 2) {
                    this.searchedCollegesList = res.data;
                }
            })
        } else {
            this.searchData.college_name = '';
            this.searchedCollegesList = [];
            this.addGroup.college_id = null;
        }
    }
    public degreeSearch(e: any): void {
        this.searchedCollegesList = [];
        this.searchedSubjectsList = [];
        this.searchData.college_name = '';
        this.searchData.subject_name = '';
        if (this.searchData.degree_name) {
            this.myWallService.getUserDegrees(this.searchData.degree_name).subscribe((res) => {
                if (res.status == 2) {
                    this.searchedDegreesList = res.data;
                }
            })
        } else {
            this.searchData.degree_name = '';
            this.searchedDegreesList = [];
            this.addGroup.degree_id = null;
        }
    }
    public selectCollege(id: number, name: string): void {
        this.searchData.college_name = name;
        this.addGroup.college_id = id;
        this.searchedCollegesList = [];
    }
    public selectDegree(id: number, name: string): void {
        this.searchData.degree_name = name;
        this.addGroup.degree_id = id;
        this.searchedDegreesList = [];
    }
    //**************************End ****************************/

    public createGroup(): void {
        this.addGroup.title = this.addGroup.title ? this.addGroup.title.trim() : null;
        this.addGroup.description = this.addGroup.description ? this.addGroup.description.trim() : null;
        if (this.addGroup.title) {
            if (this.addGroup.description) {
                if (this.addGroup.subject_id || this.addGroup.college_id || this.addGroup.degree_id) {
                    if (!this.isEdit) {
                        if (this.addGroup.icon.length) {
                            jQuery('.spin-wrap.vision-spin').fadeIn();
                            this.service.addNewGroup(this.addGroup).subscribe((res) => {
                                if (res.status == 2) {
                                    this.clearResoures();
                                    this.counter = 0;
                                    // if (this.wallType && this.scdId) {
                                    //     this.getSCDGroups();
                                    // } else {
                                    //     this.getGroups();
                                    // }
                                    this.goToGroupWall(res.data._id);
                                    setTimeout(() => {
                                        this.pageService.setIsGroupAddedStatus(true);
                                    }, 2000);
                                    this.pageService.showSuccess(res.msg);
                                    jQuery("#addGroupModal").modal('hide');
                                }
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                            });
                        } else {
                            this.groupError = new GroupError();
                            this.groupError.groupIcon = "Select The Group Image.";
                        }
                    } else {
                        jQuery('.spin-wrap.vision-spin').fadeIn();
                        this.service.editGroup(this.addGroup, this.groupId).subscribe((res) => {
                            if (res.status == 2) {
                                this.clearResoures();
                                this.counter = 0;
                                if (this.wallType && this.scdId) {
                                    this.getSCDGroups();
                                } else {
                                    this.getGroups();
                                }
                                this.pageService.showSuccess(res.msg);
                                jQuery("#addGroupModal").modal('hide');
                            }
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                        });
                    }
                } else {
                    this.groupError = new GroupError();
                    this.groupError.groupSCD = "Select subject or college or degree.";
                }
            } else {
                this.groupError = new GroupError();
                this.groupError.groupDescription = "Group Description Required.";
            }
        } else {
            this.groupError = new GroupError();
            this.groupError.groupTitle = "Group Name Required.";
        }
    }
    public clearResoures(): void {
        this.addGroup = new AddGroups();
        this.groupError = new GroupError();
        this.searchData = new MyWallSearch();
        this.scdType = 1;
        this.thumbnailFileReader['_results'][0].picture = null;
        this.modalHeadertitle = null;
        this.isEdit = false;
    }

    public onDeleteClick(id: number, index: number): void {
        this.groupId = id;
        this.index = index;
        jQuery("#groupDeleteModal").modal({ backdrop: false });
    }

    public getProfileById(id): void {
        if (this.pageService.userIdGlobal == id) {
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else {
            this.pageService.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }

    onScrollGroup(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#activity').css('display') !== 'none')) {
            if (!this.searchActive) {
                if (this.scrollController) {
                    this.scrollController = 0;
                    this.parsep = this.totalGroups / 10
                    var page = parseInt(this.parsep);
                    if (this.counter <= (page + 1)) {
                        this.counter++;
                        this.loader = true;
                        if (this.wallType && this.scdId) {
                            this.service.getSCDGroups(this.wallType, this.scdId, this.counter).subscribe(res => {
                                if (res.status == 2) {
                                    if (res.data) {
                                        this.groupsList = this.groupsList.concat(res.data);
                                        this.totalGroups = res.total;
                                    }
                                    this.loader = false;
                                    this.scrollController = 1;
                                }
                            });
                        } else {
                            this.service.getGroups(this.counter).subscribe((res) => {
                                if (res.status == 2) {
                                    this.groupsList = this.groupsList.concat(res['data']);
                                    this.totalGroups = res['total'];
                                }
                                this.loader = false;
                                this.scrollController = 1;
                            });
                        }
                    }
                }
            } else {
                if (this.scrollController) {
                    this.scrollController = 0;
                    this.parsep = this.totalGroups / 10
                    var page = parseInt(this.parsep);
                    if (this.counter <= (page + 1)) {
                        this.counter++;
                        this.loader = true;
                        if (this.wallType && this.scdId) {
                            this.service.scdGroupSearch(this.wallType, this.scdId, this.counter, this.groupSearch).subscribe(res => {
                                if (res.status == 2) {
                                    if (res.data) {
                                        this.groupsList = this.groupsList.concat(res.data);
                                    }
                                    this.loader = false;
                                    this.groupSearch = new GroupSearch();
                                }
                                this.scrollController = 1;
                            });
                        } else {
                            this.service.groupSearch(this.counter, this.groupSearch).subscribe(res => {
                                if (res.status == 2) {
                                    if (res.data) {
                                        this.groupsList = this.groupsList.concat(res.data);
                                    }
                                    this.loader = false;
                                    this.groupSearch = new GroupSearch();
                                }
                                this.scrollController = 1;
                            });
                        }
                    }
                }
            }
        }
    }

    public deleteGroup(): void {
        this.service.deleteGroup(this.groupId).subscribe((res) => {
            if (res.status == 2) {
                this.groupsList.splice(this.index, 1);
                this.pageService.showSuccess(res.msg);
            }
        });
    }
    public joinToGroup(id: number, index: number): void {
        this.service.joinGroup(id).subscribe((res) => {
            if (res.status == 2) {
                this.groupsList[index] = res['data'];
                this.pageService.showSuccess(res.msg);
            }
        });
    }
    public onClickleaveGroup(id: number, index: number): void {
        this.groupId = id;
        this.index = index;
        jQuery("#groupLeaveModal").modal({ backdrop: false });
    }
    public leaveFromGroup(): void {
        this.service.leaveGroup(this.groupId).subscribe((res) => {
            if (res.status == 2) {
                this.groupsList[this.index] = res['data'];
                this.pageService.showSuccess(res.msg);
            }
        });
    }

    public onEditClick(group: any): void {
        this.modalHeadertitle = "Edit Group";
        this.isEdit = true;
        this.groupId = group._id;
        this.addGroup.title = group.title;
        this.addGroup.description = group.description;
        this.addGroup.privacy = group.privacy;
        this.addGroup.icon = [];
        if (group.subject_id) {
            this.addGroup.subject_id = group.subject_id._id;
            this.scdType = 1;
            this.searchData.subject_name = group.subject_id.name;
        }
        if (group.college_id) {
            this.addGroup.college_id = group.college_id._id;
            this.scdType = 2;
            this.searchData.college_name = group.college_id.name;
        }
        if (group.degree_id) {
            this.addGroup.degree_id = group.degree_id._id;
            this.scdType = 3;
            this.searchData.degree_name = group.degree_id.name;
        }
        jQuery("#addGroupModal").modal({ backdrop: false });
    }
    public getSubjectWall(id) {
        this.pageService.wallId = id;
        this.pageService.join = 0;
        this.service.getHeaderData().subscribe(header => {
            for (var i = 0; i < header.data.subjects.length; i++) {
                if (header.data.subjects[i].subject_id._id == id) {
                    this.pageService.join = 1;
                }
            }
        });
        this.router.navigate(['SubjectWallComponent', { subjectId: id }]);
    }

    public getCollegeWall(id) {
        this.pageService.wallId = id;
        this.pageService.join = 0;
        this.service.getHeaderData().subscribe(header => {
            for (var i = 0; i < header.data.college.length; i++) {
                if (header.data.college[i].college_id._id == id) {
                    this.pageService.join = 1;
                }
            }
        });
        this.router.navigate(['CollegeWall', { collegeId: id }]);
    }

    public getDegreeWall(id) {
        this.pageService.wallId = id;
        this.pageService.join = 0;
        this.service.getHeaderData().subscribe(header => {
            for (var i = 0; i < header.data.degree.length; i++) {
                if (header.data.degree[i].degree_id._id == id) {
                    this.pageService.join = 1;
                }
            }
        });
        this.router.navigate(['BachelorView', { degreeId: id }]);
    }

    public onMemberClick(id: number): void {
        this.router.navigate(['GroupsMemberComponent', { groupId: id, type: 1 }]);
    }

    /*********************Search for group  **************************/

    public onSelectingGroupType(groupType: any): void {
        this.groupSearch.groupTypes = groupType.value;
        this.groupValue = groupType.value;
    }
    public onSelectingSortType(sortType: any): void {
        this.groupSearch.sortType = sortType.value;
        this.sortValue = sortType.value;
    }
    public onSelectingSortOrder(sortOrder: any): void {
        this.groupSearch.sortOrder = sortOrder.value;
        this.sortOrder = sortOrder.value;
    }
    public userSearch(event: any): void {
        var nameValid = /^[a-z\d\-_\s]+$/i;

        if (this.searchMember.name) {
            if (this.searchMember.name.match(nameValid)) {
                this.service.getAllUser(0, this.searchMember).subscribe((res) => {
                    if (res.status == 2) {
                        this.searchedMemeberList = res.searchedMember;
                    }
                })
            }
        } else {
            this.searchMember.name = null;
            this.searchedMemeberList = [];
            this.groupSearch.memberId = null;
        }

    }
    public selectUser(member: any): void {
        this.groupSearch.memberId = member._id;
        this.searchMember.name = member.fname + ' ' + member.lname;
        this.searchedMemeberList = [];
    }

    public onClickSearch(): void {
        this.loader = true;
        this.searchActive = true;
        this.searchClick = true;
        if (this.wallType && this.scdId) {
            this.service.scdGroupSearch(this.wallType, this.scdId, 0, this.groupSearch).subscribe((res) => {
                if (res.status == 2) {
                    if (res.data) {
                        this.groupsList = res['data'];
                    }
                    this.totalGroups = res.total;
                    this.loader = false;
                } else {
                    this.pageService.showSuccess('No Search result found');
                }
            });
        } else {
            this.service.groupSearch(0, this.groupSearch).subscribe((res) => {
                if (res.status == 2) {
                    if (res.data) {
                        this.groupsList = res['data'];
                    }
                    // this.groupSearch = new GroupSearch();
                    this.totalGroups = res.total;
                    this.loader = false;
                } else {
                    this.pageService.showSuccess('No Search result found');
                }
            });
        }
    }

    public resetSearch(): void {
        this.groupSearch = new GroupSearch();
        this.counter = 0;
        this.searchActive = false;
        this.searchedMemeberList = [];
        this.searchMember.name = '';
        this.scrollController = 1;
        this.searchClick = false;
        this.groupValue = 1;
        this.sortOrder = 1;
        this.sortValue = 1;
        if (this.wallType && this.scdId) {
            this.getSCDGroups();
        } else {
            this.getGroups();
        }
        this.closeSearchBox();
    }

    /********************* Search end *********/

    public goToGroupWall(id): void {
        this.pageService.wallId = id;
        this.router.navigate(['GroupWallComponent', { id: id }]);
    }

    public gotoGroupInvitationPage(): void {
        this.router.navigate(['GroupInvitation']);
    }
}

