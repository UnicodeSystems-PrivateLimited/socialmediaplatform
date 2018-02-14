import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated'
import { NgClass } from '@angular/common';
import { GridDataService, PageService } from '../../theme/services';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser'
import { YoutubeSafeUrlPipe } from '../../theme/pipes/youtube-safe-url';
import { Angular2AutoScroll } from 'angular2-auto-scroll/lib/angular2-auto-scroll.directive';
import { TextFormattingPipe, DateTime, LikeFilterPipe, nameFilterPipe } from '../../theme/pipes';
import { BaPostShareModel } from '../../theme/components/baPostShareModel';
import { BaPostExternalShareModel } from '../../theme/components/baPostExternalShareModal';
import { AddPostToJournalModal, LikeMemberListComponent } from '../../theme/components';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'data-profile-Pic-friends',
    template: require('./profileAssetFriendDetails.html'),
    pipes: [DateTime, LikeFilterPipe, DateFormatPipe, YoutubeSafeUrlPipe, nameFilterPipe, TimeAgoPipe, CalendarPipe, TextFormattingPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, LikeMemberListComponent, BaPostExternalShareModel, BaPostShareModel, ROUTER_DIRECTIVES, Angular2AutoScroll, AddPostToJournalModal],
})

export class ProfileAssetFriendDetailsComponent {
    @ViewChild('myVideo') myVideo;
    public post: any;
    public posts;
    private _dataUrl = '/api/post/postFriends/';
    public _dataAddComment = '/api/post/addComment/';
    public _deleteComment = '/api/post/deleteComment/';
    public _addShareUrl = '/api/post/shareOnTimeline/';
    public _dataEditComment = '/api/post/editComment/';
    public _dataAddLike = '/api/post/addLike/';
    public _headerDataUrl = '/api/user/getHeaderData';
    public postComment = { post_id: "", comment: "", editComment: "", date: new Date() };
    public postCollegeComment = [];
    public postCollegeComments = [];
    public postLike = { post_id: "" };
    public post_id;
    public lu;
    router: Router;
    public modal_post_id;
    public modal_comment_id;
    public prevComment = [];
    public delcommentIndex;
    public modal_likes_post_id;
    public modal_likes_index;
    public modal_likes_posts = {};
    @Input() postId: number;
    /************  share post variable  **********************/
    public showPostShareModel: boolean = false;
    public showPostExternalShareModel: boolean = false;
    public sharePostData: any = null;
    public sharing: Array<boolean> = [];
    public addEditorView: any = null;
    public editEditorView: any = null;
    public addPostToJournal: boolean = false;
    public likeMemberList: boolean = false;

    constructor(private sanitizer: DomSanitizationService,
        private page: PageService,
        private dataService: GridDataService,
        routeParams: RouteParams,
        router: Router) {
        this.router = router;
    }

    ngOnInit() {
        this.getPostDetail();
    }

    public getPostDetail(): void {
        this.dataService.getData(this._dataUrl + this.postId).subscribe(post => {
            this.post = post.data[0];
            this.lu = post.result;
            for (var i = this.post.comments.length - 10; i < this.post.comments.length; i++) {
                if (i < this.post.comments.length && typeof this.post.comments[i] !== 'undefined') {
                    this.prevComment.push(this.post.comments[i]);
                    this.postCollegeComment.push('true');
                }
            }
            setTimeout(() => {
                if (this.post.post_type == 4) {
                    if (this.myVideo) {
                        this.myVideo.nativeElement.play();
                    } else {
                        jQuery("#iframeVideo")[0].src = this.setCharAt(jQuery("#iframeVideo")[0].src, jQuery("#iframeVideo")[0].src.indexOf("autoplay") + 8, 1);
                        jQuery("#iframeVideo")[0].src += "&autoplay=1";
                    }
                }
            });
            this.initEditor();
        });
    }

    likesUserDetail(postId, posts) {
        this.post_id = postId;
        // this.modal_likes_posts = posts;
        jQuery("#postLikesModalProfile").modal({ backdrop: false });
        this.likeMemberList = true;
    }
    public onLikeClose(event: any) {
        this.likeMemberList = false;
        jQuery("#postLikesModalProfile").modal('hide');
    }

    public closeLikeModal() {
        jQuery("#postLikesModalProfile").modal('hide');
    }
    public setCharAt(str, index, chr) {
        if (index > str.length - 1) return str;
        return str.substr(0, index) + chr + str.substr(index + 1);
    }

    loadPrevComment() {
        if (this.prevComment.length != this.post.comments.length) {
            var prevCommentLength = this.prevComment.length;
            for (var k = (this.post.comments.length - 1) - prevCommentLength; k > (this.post.comments.length - prevCommentLength) - 8; k--) {
                if (typeof this.post.comments[k] !== 'undefined') {
                    this.prevComment.push(this.post.comments[k]);
                    this.postCollegeComment.push('true');
                }
            }
        }
    }

    getFoldername(type) {
        if (type == 1) return "Subject";
        if (type == 2) return "College";
        if (type == 3) return "Degree";
        if (type == 5) return "Timeline";
        if (type == 6) return "GroupWall";
    }

    //add comment to post
    addComment(post_id, posts) {
        this.postComment.post_id = post_id;
        this.postComment.comment = this.addEditorView.html();
        let text = jQuery(this.postComment.comment).text();
        if (this.postComment.comment != '' && this.postComment.comment != null && text.trim()) {
            this.postComment.date = new Date();
            this.dataService.postData(this._dataAddComment, this.postComment)
                .subscribe(res => {
                    if (res.status === 2) {
                        posts.comments = res.data;
                        this.postComment.comment = null;
                        this.addEditorView.html('');
                        this.prevComment.push(res.data[res.data.length - 1]);
                        this.postCollegeComment[this.prevComment.length - 1] = 'true';
                        this.initEditor();
                    }
                });
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Field is required.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        }
    }

    deleteCommentModel(post_id, comment_id, j, posts) {
        this.modal_post_id = post_id;
        this.modal_comment_id = comment_id;
        this.delcommentIndex = j;
        var yes = window.confirm("Are you sure you want to delete this comment?");
        if (yes) {
            this.deleteComment(posts);
        }
    }

    deleteComment(posts) {
        this.dataService.getData(this._deleteComment + this.modal_post_id + '/' + this.modal_comment_id)
            .subscribe(res => {
                if (res.status === 2) {
                    posts.comments = res.data;
                    this.postComment.comment = null;
                    this.prevComment.splice(this.delcommentIndex, 1);
                    this.page.showSuccess(res.msg);
                }
            });
    }
    closeDeleteConfirmPopup() {
        jQuery("#commentDeleteModal").modal('hide');
    }

    addLike(post_id, posts) {
        this.postLike.post_id = post_id;
        this.dataService.postData(this._dataAddLike, this.postLike)
            .subscribe(res => {
                if (res.status == 2) {
                    posts.likes = res.data;
                }
            });
    }

    safeUrl(url) {
        var SafeUrl: SafeResourceUrl;
        SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return SafeUrl;
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

    openCommentModal(comment, index) {
        this.postComment.editComment = comment.body;
        for (var i = 0; i < this.postCollegeComment.length; i++) {
            if (i == index) {
                this.postCollegeComments[i] = true;
                this.postCollegeComment[i] = false;
            }
            else {
                this.postCollegeComments[i] = false;
                this.postCollegeComment[i] = true;
            }
        }
        this.initEditEditor(comment.body);
    }

    closeCommentModal(index) {
        for (var i = 0; i < this.postCollegeComment.length; i++) {
            if (i == index) {
                this.postCollegeComment[i] = true;
                this.postCollegeComments[i] = false;
            }
            else {
                this.postCollegeComments[i] = false;
            }
        }
    }

    editComment(post_id, comment_id, posts, j) {
        this.postComment.post_id = post_id;
        this.postComment.editComment = this.editEditorView.html();
        let text = jQuery(this.postComment.editComment).text();
        if (this.postComment.editComment != '' && this.postComment.editComment != null && text.trim()) {
            this.dataService.postData(this._dataEditComment + comment_id, this.postComment)
                .subscribe(res => {
                    this.postComment.comment = null;
                    if (res.status === 2) {
                        this.postCollegeComment[j] = true;
                        this.postCollegeComments[j] = false;
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>Comment Updated Successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        posts.comments[j] = res['data'][j];
                        this.prevComment[j] = res['data'][j];
                    }
                });
        } else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Field is required.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        }
    }
    /**********   Share Post Methods  *************************/
    public onShareClick(post_Id: number): void {
        if (this.sharing[post_Id]) {
            this.sharing[post_Id] = false;
        } else {
            this.sharing[post_Id] = true;
        }
    }
    public share(postData: any): void {
        this.sharing[postData._id] = false;
        this.sharePostData = postData;
        jQuery("#postShareModel").modal({ backdrop: false });
        this.showPostShareModel = true;
    }
    public onPostShareModelClose(event: any): void {
        this.showPostShareModel = false;
        jQuery('#postShareModel').modal('hide');
        this.sharePostData = null;
    }
    public externalShare(postData: any): void {
        this.sharing[postData._id] = false;
        this.sharePostData = postData;
        jQuery("#postExternalShareModel").modal({ backdrop: false });
        this.showPostExternalShareModel = true;
    }
    public onExternalShareModelClose(event: any): void {
        this.showPostExternalShareModel = false;
        jQuery('#postExternalShareModel').modal('hide');
        this.sharePostData = null;
    }

    public initEditor() {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#friend-profile-inline-editor");
            editorDiv.froalaEditor({
                toolbarInline: true,
                toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insertVideo', 'undo', 'redo'],
            });
            this.addEditorView = editorDiv.find(".fr-view");
        }, 100);
    }

    public initEditEditor(message: any) {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#friend-profile-edit-inline-editor");
            editorDiv.froalaEditor({
                toolbarInline: true,
                toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insertVideo', 'undo', 'redo'],
            });
            editorDiv.froalaEditor('placeholder.hide')
            this.editEditorView = editorDiv.find(".fr-view");
            this.editEditorView.html(message);
        }, 100);
    }

    public openAddPostToJournalModal(postId: number) {
        this.postId = postId;
        jQuery("#add-post-journal-modal").modal({ backdrop: false });
        this.addPostToJournal = true;
    }

    public onCloseAddPostToJournal(e: any) {
        if (e.data) {
            this.addPostToJournal = false;
            jQuery("#add-post-journal-modal").modal('hide');
        }
    }

    public getGroupWall(id: any) {
        this.router.navigate(['GroupWallComponent', { id: id }]);
    }
}

