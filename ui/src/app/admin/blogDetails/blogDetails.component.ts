import { Component, OnInit } from '@angular/core';
import { GridDataService, PageService } from '../../theme/services';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { DateTime } from '../../theme/pipes';
declare var jQuery: any;
declare var require: any;
declare var noty: any;


@Component({
    selector: 'admin-blogDetails',
    template: require('./blogDetails.html'),
    pipes: [DateFormatPipe, TimeAgoPipe, CalendarPipe,DateTime],
    host: { 'class': 'ng-animate page1Container' },
    directives: [ROUTER_DIRECTIVES, RouterLink]
})

export class BlogDetailsComponent {
    public category;
    public selectedBlog;
    public selectedComment;
    public post_message_data;
    public message = { message: '', messages: '', commentMessage: '' };
    public Recentblog;
    public index;
    public postComment = [];
    public postComments = [];
    public errorMessage: string;
    public post;
    private _dataUrlAllCategory = 'api/category/getCategoryBlog';
    private _dataUrlSelectedBlog = 'api/blog/list/';
    private _dataUrlRecentBlog = 'api/blog/getRecentBlog/';
    private _dataUrlAddComment = 'api/blog/addCommentByBlogId/';
    private _dataUrlBlogCommentById = 'api/blog/blogCommentById/';
    private _dataUrlDeleteBlogCommentById = 'api/blog/deleteBlogCommentById';
    private _dataUrlEditComment = 'api/blog/editCommentById/';
    private _addCommentDeleteNotification = '/api/notification/addCommentDeleteNotification';
    public blogId;
    public logged;
    private post_type = {
        COMMENTDELETENOTIFY: 6
    };
    router: Router;
    public contentLoding: boolean = false;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.blogId = routeParams.get('id');
    }

    ngOnInit() {
        this.getCategory();
        this.getRecentBlog();
        this.getBlogByID();
        this.getcommentByID();
        this.page.friendProfileId = '';
        this.page.wallId = '';
    }

    getCategory() {
        this.dataService.getData(this._dataUrlAllCategory).subscribe(category => {
            this.category = category.data;
        });
    }

    getBlogByID() {
        this.dataService.getData(this._dataUrlSelectedBlog + this.blogId).subscribe(selectedBlog => {
            this.selectedBlog = selectedBlog.data;
        });
    }

    getBlogByPassedID(id) {
        this.dataService.getData(this._dataUrlSelectedBlog + id).subscribe(selectedBlog => {
            this.selectedBlog = selectedBlog.data;
            this.getcommentByPassedID(id);
        });
    }

    getRecentBlog() {
        this.dataService.getData(this._dataUrlRecentBlog).subscribe(Recentblog => {
            this.Recentblog = Recentblog.data;
        });
    }

    getcommentByID() {
        this.contentLoding = true;
        this.dataService.getData(this._dataUrlBlogCommentById + this.blogId).subscribe(selectedComment => {
            this.post_message_data = selectedComment.data;
            for (var i = 0; i < this.post_message_data.length; i++) {
                this.postComment.push('true');
            }
            this.contentLoding = false;
            this.logged = selectedComment['logged'];
        });
    }

    getcommentByPassedID(id) {
        this.dataService.getData(this._dataUrlBlogCommentById + id).subscribe(selectedComment => {
            this.post_message_data = selectedComment.data;
            this.logged = selectedComment['logged'];
        });
    }

    addCommentByBlogID() {
        if (this.message.message != '') {
            this.dataService.postData(this._dataUrlAddComment + this.blogId, this.message).subscribe(post_message => {
                this.message.message = '';
                this.getcommentByID();
            });
        }
    }

    deleteBlogComment(commentId, blogId, index) {
        this.dataService.getData(this._dataUrlDeleteBlogCommentById + '/' + commentId + '/' + blogId).subscribe(Comment => {
            if (Comment['status'] == 2) {
                this.post_message_data.splice(index, 1);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Comment Deleted Successfully.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + Comment['data'].msg + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
        });
    }

    //delete comment and send notification 
    deleteAndNotifyBlogComment() {
        var commentId = this.post._id;
        var blogId = this.post.blog_id._id;
        this.dataService.getData(this._dataUrlDeleteBlogCommentById + '/' + commentId + '/' + blogId).subscribe(Comment => {
            if (Comment['status'] == 2) {
                this.dataService.postData(this._addCommentDeleteNotification + '/' + this.post_type.COMMENTDELETENOTIFY + '/' + blogId, { members: this.post.comment_by._id, title: this.message.commentMessage }).subscribe(res => {
                });
                this.message.commentMessage = '';
                this.post_message_data.splice(this.index, 1);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Comment Deleted Successfully.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + Comment['data'].msg + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
        });
    }

    //send notifiction to user for deletion of comment 
    notifyBlogComment() {
        var blogId = this.post.blog_id._id;
        this.dataService.postData(this._addCommentDeleteNotification + '/' + this.post_type.COMMENTDELETENOTIFY + '/' + blogId, { members: this.post.comment_by._id, title: this.message.commentMessage }).subscribe(res => {
            this.message.commentMessage = '';
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Notification send Successfully.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });

        });
    }

    openDeleteCommentModal(post, index) {
        this.index = index;
        this.post = post;
        jQuery("#commentDeleteModal").modal({ backdrop: false });
    }

    openCommentModal(post, index) {
        this.message.messages = post.body;
        this.postComment[index] = false;
        this.postComments[index] = true;
    }

    closeCommentModal(index) {
        this.postComment[index] = true;
        this.postComments[index] = false;
    }

    editComment(post, index) {
        this.post = post;
        var blogCommentId = post._id;
        if (this.message.messages != '') {
            this.dataService.postData(this._dataUrlEditComment + blogCommentId, this.message).subscribe(post_message => {
                if (post_message['status'] == 2) {
                    this.message.message = '';
                    this.post.body = post_message['data'][0].body;
                    this.postComment[index] = true;
                    this.postComments[index] = false;
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Comment Updated Successfully.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                } else {
                    var n = noty({ text: '<div class="alert bg-theme-error"><p> Comment Not Created By You.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                }
            });
        }
    }
}
