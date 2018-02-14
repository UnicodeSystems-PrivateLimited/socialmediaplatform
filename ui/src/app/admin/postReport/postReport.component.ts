import {Component, OnInit} from '@angular/core';
import {PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
import {PostReportService} from './postReport.service';
import {PostViewComponent} from '../../theme/components';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
declare var jQuery: any;
declare var noty: any;
declare var require: any;


@Component({
    selector: 'master-post-report',
    template: require('./postReport.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    providers: [PostReportService],
    directives: [RouterOutlet, TOOLTIP_DIRECTIVES, PostViewComponent, RouterLink, ROUTER_DIRECTIVES]
})

export class PostReportComponent {

    public postList: Array<any> = [];
    public contentLoding: boolean = false;
    public showPostComponent: boolean = false;
    public postId: number = null;
    public listId: number = null;

    constructor(
        private page: PageService,
        routeParams: RouteParams,
        private service: PostReportService,
        router: Router
    ) {

    }

    ngOnInit() {

        this.getPostList();
    }

    public getPostList(): void {
        this.contentLoding = true;
        this.service.getReportedPostList().subscribe((res) => {
            if (res.status == 2) {
                this.postList = res.data;
            }
            this.contentLoding = false;
        });
    }

    public openDeletePostModal(id: number, postId: number) {
        this.listId = id;
        this.postId = postId;
        jQuery("#post-delete-modal").modal({ backdrop: false });
    }

    public deletePost(): void {
        this.service.deletePostByAdmin(this.listId, this.postId).subscribe((res) => {
            if (res.status == 2) {
                this.page.showSuccess(res.msg);
                this.getPostList();
            }
        });
    }
    public viewPost(id: number): void {
        this.postId = id;
        jQuery("#single-post-view").modal({ backdrop: false });
        this.showPostComponent = true;
    }
    public onCloseModal(e: any) {
        if (e.data) {
            jQuery("#single-post-view").modal('hide');
            this.showPostComponent = false;
        }
    }
}