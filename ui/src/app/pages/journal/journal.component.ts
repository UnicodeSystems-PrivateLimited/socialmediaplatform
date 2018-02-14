import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated'
import { NgClass } from '@angular/common';
import { GridDataService, PageService } from '../../theme/services';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser'
import { YoutubeSafeUrlPipe } from '../../theme/pipes/youtube-safe-url';
import { TextFormattingPipe, DateTime, documentNameFilterPipe } from '../../theme/pipes';
import { nameFilterPipe } from '../../theme/pipes/name-filter';
import { ProfileAssetDetailsComponent } from '../profileAssetDetails';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { EmbedDirective } from "../embedVideo";
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'data-journal',
    template: require('./journal.html'),
    pipes: [documentNameFilterPipe, DateFormatPipe, TimeAgoPipe, YoutubeSafeUrlPipe, DateTime, TextFormattingPipe, nameFilterPipe],
    directives: [RouterOutlet, EmbedDirective, RouterLink, ROUTER_DIRECTIVES, ProfileAssetDetailsComponent, TOOLTIP_DIRECTIVES],
    host: { 'class': 'ng-animate page1Container' }
})

export class JournalComponent implements OnInit {
    public _getAllPostByJournalId = '/api/journal/getAllPostByJournalId/';
    public _deletePostUrl = '/api/journal/deletePostInJournal';
    public _getAllPostByPostType = '/api/journal/getAllPostByPostType/';
    public users;
    public errorMessage: string;
    public JournalByJournalId;
    public journal_id;
    public JournalPost: Array<any> = [];
    public dialogState = false;
    public postid;
    public postDeleteData = { _id: "", journal_id: "" };
    public index;
    public filterText = 'All';
    public filterValue = 0;
    public loader: boolean = false;
    router: Router;

    constructor(private sanitizer: DomSanitizationService, private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.journal_id = routeParams.get('journal_id');
    }

    ngOnInit() {
        this.page.friendProfileId = '';
        this.getAllPostByJournalId();
    }

    //get All Post By JournalId
    getAllPostByJournalId() {
        this.loader = true;
        this.dataService.getData(this._getAllPostByJournalId + this.journal_id).subscribe(res => {
            this.loader = false;
            this.JournalByJournalId = res.data;
            let JournalPost1 = res.data.posts;
            let sortedArray = JournalPost1.sort(function (a, b) {
                return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
            });
            this.JournalPost = sortedArray;
        });
    }

    getFoldername(type) {
        if (type == 1) return "Subject";
        if (type == 2) return "College";
        if (type == 3) return "Degree";
        if (type == 5) return "Timeline";
        if (type == 6) return "GroupWall";
    }

    getclassList(user) {
        if (user.post_id) {
            if (user.post_id.photo[0]) return "fa fa-camera bg-purple";
            else if (user.post_id.document[0]) return "fa fa-paperclip bg-green";
            else if (user.post_id.audio[0]) return "fa fa-music bg-yellow";
            else if (user.post_id.video[0]) return "fa fa-video-camera bg-purple";
            else if (user.post_id.link[0]) return "fa fa-link bg-maroon";
            else if (user.post_id.question) return "fa fa-question bg-aqua";
            else return "fa fa-envelope bg-blue";
        }
    }

    safeUrl(url) {
        var SafeUrl: SafeResourceUrl;
        SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return SafeUrl;
    }

    public goToUserProfile(): void {
        this.router.navigate(['UserProfile', { tab: 3, status: this.page.userIdGlobal }]);
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

    public getDetailView(data, id): void {
        if (data.photo.length > 0 || data.video.length > 0 || data.audio.length > 0) {
            this.postid = id;
            this.dialogState = true;
            jQuery("#profileAssetImgModal").modal({ backdrop: false });
        }
    }

    public closeStateDialog(post_id) {
        this.dialogState = false;
        this.getAllPostByJournalId();
    }

    deletePostModel(data, index) {
        this.index = index;
        this.postDeleteData._id = data._id;
        this.postDeleteData.journal_id = this.journal_id;
        jQuery("#postDeleteModal").modal({ backdrop: false });
    }

    public deletePostFromJournal() {
        this.dataService.postData(this._deletePostUrl, this.postDeleteData)
            .subscribe(res => {
                if (res.status == 2) {
                    this.JournalPost.splice(this.index, 1);
                    this.postDeleteData._id = '';
                    this.postDeleteData.journal_id = '';
                    this.page.showSuccess(res.data.message);
                }
            });
    }

    public filter(value) {
        this.filterValue = value;
        if (value == 0) {
            this.filterText = 'All';
            this.getAllPostByJournalId();
        }
        else {
            this.filterText = value == 1 ? 'Posts' : value == 2 ? 'Questions' : value == 3 ? 'Photos' : value == 4 ? 'Videos' : value == 5 ? 'Links' : value == 6 ? 'Audios' : 'Documents';
            this.getAllPostByPostType();
        }
    }

    public getAllPostByPostType() {
        this.loader = true;
        this.dataService.getData(this._getAllPostByPostType + this.filterValue + '/' + this.journal_id).subscribe(res => {
            this.loader = false;
            this.JournalByJournalId = res.data;
            let JournalPost2 = res.data.posts;
            let sortedArray1 = JournalPost2.sort(function (a, b) {
                return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
            });
            this.JournalPost = sortedArray1;
        });
    }
}
