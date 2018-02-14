import { Component, ViewEncapsulation } from '@angular/core';
import { BaFullCalendar } from '../../theme/components';
import { GridDataService, PageService } from '../../theme/services';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { DateTime } from '../../theme/pipes';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'blogPost',
    template: require('./blogPost.html'),
    directives: [BaFullCalendar, ROUTER_DIRECTIVES, RouterLink],
    pipes: [TimeAgoPipe, DateFormatPipe, CalendarPipe, DateTime]
})

export class BlogPost {
    public category;
    public selectedBlog;
    public selectedComment;
    public post_message_data;
    public message = { message: '', messages: '' };
    public Recentblog;
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
    public blogId;
    public logged;
    router: Router;
    public contentLoding: boolean = false;
    public modal_blog_id;
    public modal_comment_id;
    public modal_index;

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

    deleteCommentModel(commentId, blogId, index) {
        this.modal_blog_id = blogId;
        this.modal_comment_id = commentId;
        this.modal_index = index;
        jQuery("#commentDeleteModal").modal({ backdrop: false });
    }

    deleteBlogComment() {
        this.dataService.getData(this._dataUrlDeleteBlogCommentById + '/' + this.modal_comment_id + '/' + this.modal_blog_id).subscribe(Comment => {
            if (Comment['status'] == 2) {
                this.post_message_data.splice(this.modal_index, 1);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Comment Deleted Successfully.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
        });
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
