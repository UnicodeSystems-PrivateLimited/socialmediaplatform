import {Component, OnInit} from '@angular/core';
import {GridDataService,PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var CKEDITOR: any;
declare var noty: any;
declare var require: any;


@Component({
    selector: 'admin-blogItem',
    template: require('./blogItems.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class BlogItemsComponent {
    public user;
    public errorMessage: string;
    private _dataUrlBlog = 'api/blog/getBlogData/';
    private _dataUrlDeleteBlog = 'api/blog/delete/';
    private _dataUrlCategory = 'api/category/getCategory';
    private _dataUrlAddBlog = 'api/blog/addBlog';
    private _dataUrlEditBlog = 'api/blog/editBlog/';
    private _dataUrlPublishBlog = 'api/blog/publishBlog/';
    private _blogSearch = 'api/blog/blogSearch/';
    router: Router;
    public blogItem;
    public deleteBlog;
    public category;
    public BlogId;
    public item;
    public BlogName;
    public errorSearch;
    public counter = 1;
    public total_pages_left = 0;
    public total_blog;
    public total_pages;
    public error = { title: '', description: '', Id: '' };
    public errorEdit = { title: '', description: '', Id: '' };
    public total_pages_float;
    public body = { title: { title: '' }, description: { description: '' }, Id: { Id: '' }, category: { category: '' } };
    public blogname = { name: '' };
    public contentLoding: boolean = false;
    public deleteBlogItemsId;
    public index;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
    }

    ngOnInit() {
        this.getAllBlog();
        this.getAllCatagory();
        this.counter = 1;
        this.total_pages_left = 1;
    }

    ngAfterViewInit() {
        setTimeout(function() {
            jQuery("#detailBtn2").click(function() {
                jQuery("#detailModal").modal({ backdrop: false });
            });
        }, 100);
        setTimeout(function() {
            jQuery("#detailBtn3").click(function() {
                jQuery("#EditdetailModal").modal({ backdrop: false });
            });
        }, 100);
        setTimeout(function() {
            CKEDITOR.replace('editor1');
        }, 100);
        setTimeout(function() {
            CKEDITOR.replace('editor2');
        }, 100);
    }

    getBlog(event) {
        if (!this.blogname.name) {
            this.counter = 1;
            this.errorSearch = "";
            this.getAllBlog();
        }
        else {
            var nameValid = /^[a-z\d-_.(){}\,\s]+$/i;
            if (this.blogname.name.match(nameValid)) {
                this.dataService.postData(this._blogSearch, this.blogname).subscribe(res => {
                    if (res.status == 2) {
                        this.blogItem = res.data;
                        this.errorSearch = "";
                    }
                });
            } else {
                this.errorSearch = "Invalid Search Input!.";
            }
        }
    }


    getAllBlog() {
        this.contentLoding = true;
        this.dataService.getData(this._dataUrlBlog + this.counter).subscribe(blogItem => {
            this.blogItem = blogItem.data;
            this.total_blog = blogItem.total_blogs;
            this.total_pages_float = this.total_blog / 10;
            this.total_pages = parseInt(this.total_pages_float);        
            this.total_pages_left = this.total_pages - 1;
            this.contentLoding = false;
        });

    }

    getAllBlogPaginationNext() {
        if (this.total_pages_left < this.total_pages && this.total_pages_left >= 0) {
            this.contentLoding = true;
            this.counter++;
            this.dataService.getData(this._dataUrlBlog + this.counter).subscribe(blogItem => {
                this.blogItem = blogItem.data;
                this.total_pages_left = this.total_pages_left - 1;
                this.contentLoding = false;
            });
        }
        else {
            console.log("no more pages left");
        }
    }

    getAllBlogPaginationPrevious() {
        if (this.total_pages_left + 1 !== this.total_pages) {
            this.counter--;
            this.contentLoding = true;
            this.dataService.getData(this._dataUrlBlog + this.counter).subscribe(blogItem => {
                this.blogItem = blogItem.data;
                this.total_pages_left = this.total_pages_left + 1;
                this.contentLoding = false;
            });
        }
        else {
            console.log("no page left");
        }
    }


    getAllCatagory() {
        this.dataService.getData(this._dataUrlCategory).subscribe(category => {
            this.category = category.data;
        });
    }

    updateBlogId(item) {
        setTimeout(function() {
            jQuery("#EditdetailModal").modal({ backdrop: false });
        }, 100);
        this.item = item;
        this.BlogId = item._id;
        this.BlogName = item.title;
        this.body.title.title = item.title;
        this.body.description.description = item.body;
        if (item.category_id) this.body.category.category = item.category_id._id;
        this.errorEdit.title = '';
        this.errorEdit.Id = '';
        this.errorEdit.description = "";
        CKEDITOR.instances.editor2.setData(this.body.description.description);
    }

    onChangecategory(categoryval) {
        this.body.category.category = categoryval;
    }

    deleteBlogItemsModal(id,i){
    this.deleteBlogItemsId=id;
    this.index=i;
    jQuery("#deleteBlogItemsId").modal({ backdrop: false });
    }

    deleteBlogById() {
        this.dataService.getData(this._dataUrlDeleteBlog + this.deleteBlogItemsId).subscribe(deleteBlog => {
            this.deleteBlog = deleteBlog.data;
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Blog Deleted.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            this.counter = 1;
         //   this.getAllBlog();
         this.blogItem.splice(this.index, 1);
        });
    }

    addBlog() {
        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.body.title.title != '' && this.body.title.title.match(letters)) {
            if (this.body.Id.Id != '') {
                if (this.body.description.description != '') {
                    this.dataService.postData(this._dataUrlAddBlog, this.body).subscribe(post_blog => {
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>Blog Added.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        this.body.title.title = '';
                        this.body.description.description = '';
                        this.body.Id.Id = '';
                        this.error.title = '';
                        this.error.Id = '';
                        this.error.description = "";
                        this.counter = 1;
                        this.getAllBlog();
                        jQuery("#detailModal").modal('hide');
                    });
                } else {
                    this.error.title = '';
                    this.error.Id = '';
                    this.error.description = "Write Some Description";
                }
            } else {
                this.error.title = '';
                this.error.Id = 'Select The Category';
                this.error.description = "";
            }
        } else {
            this.error.title = 'Invalid title';
            this.error.Id = '';
            this.error.description = "";
        }
    }

    clearBlogAddModal() {
        this.body.title.title = '';
        this.body.description.description = '';
        this.body.Id.Id = '';
        this.error.title = '';
        this.error.Id = '';
        this.error.description = "";
    }

    publishBlog(id, publish_status) {
        this.dataService.getData(this._dataUrlPublishBlog + id + '/' + publish_status).subscribe(publish_blog => {
            this.counter = 1;
            this.getAllBlog();
        });
    }

    editBlog() {
        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.body.title.title != '' && this.body.title.title.match(letters)) {
            if (this.body.description.description != '') {
                this.dataService.postData(this._dataUrlEditBlog + this.BlogId, this.body).subscribe(post_blog => {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Blog Edited.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    this.body.title.title = '';
                    this.body.description.description = '';
                    this.body.Id.Id = '';
                    this.errorEdit.title = '';
                    this.errorEdit.Id = '';
                    this.errorEdit.description = "";
                    this.item.title = post_blog['data'][0].title;
                    this.item.category_id._id = post_blog['data'][0].category_id._id;
                    this.item.category_id.title = post_blog['data'][0].category_id.title;
                    this.item.body = post_blog['data'][0].body;
                    jQuery("#EditdetailModal").modal('hide');
                });
            } else {
                this.errorEdit.title = '';
                this.errorEdit.Id = '';
                this.errorEdit.description = "Write Some Description";
            }
        } else {
            this.errorEdit.title = 'Invalid title';
            this.errorEdit.Id = '';
            this.errorEdit.description = "";
        }
    }

    updateEditor1Value() {
        this.body.description.description = CKEDITOR.instances.editor1.getData();
    }

    updateEditor2Value() {
        this.body.description.description = CKEDITOR.instances.editor2.getData();
    }

    getBlogItemDetail(id) {
        this.router.navigate(['BlogDetails', { id: id }]);
    }
}
