import { Component, OnInit, AfterViewInit, ViewChildren } from '@angular/core';
import { Router, ROUTER_DIRECTIVES, RouteParams } from '@angular/router-deprecated';
import {ListService } from './list.service';
import { PageService } from '../../theme/services';
import {ListNameFilterPipe} from '../../theme/pipes';


declare var jQuery;

@Component({
    selector: 'list',
    template: require('./list.html'),
    pipes: [ListNameFilterPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [ROUTER_DIRECTIVES],
    providers: [ListService],
})

export class ListComponent {
    public showLoader: boolean = false;
    public listTitle: string = null;
    public listTitleError: string = null;
    public addedList: Array<any> = [];
    public scrollController: boolean = true;
    public counter: number = 0;
    public totalList: number = null;
    public isAdd: boolean = true;
    public listId: number = null;
    public parsep: any = null;
    public showScrollLoader: boolean = false;
    public searchTitle: string = null;

    constructor(
        private service: ListService,
        private pageService: PageService,
        private router: Router
    ) {

    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.pageService.friendProfileId = '';
        this.pageService.wallId = '';
        this.getLists();
    }

    public getLists() {
        this.showLoader = true;
        this.service.getLists(this.counter).subscribe((res) => {
            if (res.status == 2) {
                this.addedList = res.data;
                this.totalList = res.total;
            }
            this.showLoader = false;
        })

    }

    public openAddNewListModal(): void {
        this.isAdd = true;
        jQuery("#addListModal").modal({ backdrop: false });
    }

    public closeAddList(): void {
        this.listTitle = null;
        this.listTitleError = null;
    }

    public createAddList(): void {
        if (this.listTitle) {
            this.pageService.showLoader();
            if (this.isAdd) {
                this.service.addNewList({ title: this.listTitle }).subscribe((res) => {
                    if (res.status == 2) {
                        this.addedList.unshift(res.data);
                        this.pageService.showSuccess(res.msg);
                        jQuery("#addListModal").modal('hide');
                        this.closeAddList();
                    } else if (res.status == 1) {
                        this.listTitleError = res.msg;
                    }
                    this.pageService.hideLoader();
                });
            } else {
                this.service.updateList({ id: this.listId, title: this.listTitle }).subscribe((res) => {
                    if (res.status == 2) {
                        for (let i in this.addedList) {
                            if (this.addedList[i]._id == this.listId) {
                                this.addedList[i] = res.data;
                            }
                        }
                        this.pageService.showSuccess(res.msg);
                        jQuery("#addListModal").modal('hide');
                        this.listId = null;
                        this.closeAddList();
                    } else if (res.status == 1) {
                        this.listTitleError = res.msg;
                    }
                    this.pageService.hideLoader();
                });
            }
        } else {
            this.listTitleError = "Field is required.";
        }
    }
    public onClickEdit(list: any): void {
        this.isAdd = false;
        this.listTitle = list.title;
        this.listId = list._id;
        jQuery("#addListModal").modal({ backdrop: false });
    }

    public onScrollList(event: any): void {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#activity').css('display') !== 'none')) {
            if (this.scrollController) {
                this.scrollController = false;
                this.parsep = this.totalList / 20;
                var page = parseInt(this.parsep);
                if (this.counter <= (page)) {
                    this.counter++;
                    this.showScrollLoader = true;
                    this.service.getLists(this.counter).subscribe(res => {
                        if (res.status == 2) {
                            this.addedList = this.addedList.concat(res.data);
                            this.totalList = res.total;
                            this.scrollController = true;
                        }
                        this.showScrollLoader = false;
                    });
                }
            }
        }
    }

    public onClickDelete(id: number): void {
        this.listId = id;
        jQuery("#listDeleteModal").modal({ backdrop: false });
    }
    public deleteList() {
        this.pageService.showLoader();
        this.service.deleteList(this.listId).subscribe((res) => {
            if (res.status == 2) {
                for (let i in this.addedList) {
                    if (this.addedList[i]._id == this.listId) {
                        this.addedList.splice(+i, 1);
                    }
                }
                this.pageService.showSuccess(res.msg);
            }
            this.pageService.hideLoader();
        });
    }

    public goToListMember(id: number): void {
        this.router.navigate(['ListMember', { id: id }]);
    }

}

