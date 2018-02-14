import { Component, OnInit, AfterViewInit, ViewChildren } from '@angular/core';
import { Router, ROUTER_DIRECTIVES, RouteParams } from '@angular/router-deprecated';
import {ListMemberService } from './listMember.service';
import { PageService } from '../../theme/services';
import {ListNameFilterPipe} from '../../theme/pipes';


declare var jQuery;

@Component({
    selector: 'listMember',
    template: require('./listMember.html'),
    pipes: [ListNameFilterPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [ROUTER_DIRECTIVES],
    providers: [ListMemberService],
})

export class ListMemberComponent {
    public showLoader: boolean = false;
    public listId: number = null;
    public listInfo: any = null;
    public userSearchField = { name: "", status: 3 };
    public userSearchList: Array<any> = [];
    public taggedUsersList: Array<any> = [];
    public taggedUsersIds: Array<number> = [];
    public memberId: number;
    public searchMember: string = null;

    constructor(
        private service: ListMemberService,
        private pageService: PageService,
        private routeParams: RouteParams,
        private router: Router
    ) {
        this.listId = +routeParams.get('id');
        this.getListInfo();
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
    }

    public getListInfo() {
        this.service.getListInfo(this.listId).subscribe((res) => {
            if (res.status == 2) {
                this.listInfo = res.data;
            }
        })
    }

    public goToPreviousPage() {
        this.router.navigate(['List']);
    }

    public openAddNewMemeberModal() {
        jQuery("#addListMemberModal").modal({ backdrop: false });
    }

    public closeAddModel() {

    }

    public friendSearch(): void {
        if (this.userSearchField.name == '' || this.userSearchField.name == null) {
            this.userSearchList = [];
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (this.userSearchField.name.match(nameValid)) {
                this.service.friendSearch(this.userSearchField).subscribe(res => {
                    if (res.status === 2) {
                        this.userSearchList = res.data;
                    } else {
                        this.userSearchList = [];
                    }
                });
            }
        }
    }

    public tagFriends(user: any): void {
        let isAdded = false;
        for (let i in this.listInfo.members) {
            if (this.listInfo.members[i].user_id._id == user._id) {
                this.pageService.showError('Member already added.');
                isAdded = true;
                break;
            }
        }
        if (!isAdded) {
            if (this.taggedUsersIds.indexOf(user._id) == -1) {
                this.taggedUsersIds.push(user._id);
                this.taggedUsersList.push(user);
            }
        }
        this.userSearchList = [];
        this.userSearchField.name = "";
    }

    public deleteTaggedMember(userId: number): void {
        let index = this.taggedUsersIds.indexOf(userId);
        this.taggedUsersIds.splice(index, 1);
        this.taggedUsersList.splice(index, 1);
    }
    public addMemberToList() {
        if (this.taggedUsersIds.length) {
            this.pageService.showLoader();
            this.service.addMembersToList(this.listId, { members: this.taggedUsersIds }).subscribe((res) => {
                if (res.status == 2) {
                    this.pageService.showSuccess(res.msg);
                    this.getListInfo();
                    this.closeAddList();
                    jQuery("#addListMemberModal").modal('hide');
                }
                this.pageService.hideLoader();
            })
        } else {
            this.pageService.showError('Please select a member.');
        }
    }
    public closeAddList(): void {
        this.taggedUsersIds = [];
        this.taggedUsersList = [];
        this.userSearchList = [];
        this.userSearchField.name = null;
    }
    public openDeleteListMember(id: number) {
        this.memberId = id;
        jQuery("#listMemberDeleteModal").modal({ backdrop: false });
    }

    public deleteListMember(): void {
        this.pageService.showLoader();
        this.service.deleteMember(this.listId, this.memberId).subscribe((res) => {
            if (res.status == 2) {
                this.pageService.showSuccess(res.msg);
                this.getListInfo();
            }
            this.pageService.hideLoader();
        })
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
}

