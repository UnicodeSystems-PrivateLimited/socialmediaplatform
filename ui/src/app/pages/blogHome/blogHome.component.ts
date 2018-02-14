import {Component, ViewEncapsulation,ElementRef} from '@angular/core';
import {BaFullCalendar} from '../../theme/components';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {GridDataService,PageService} from '../../theme/services';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
  selector: 'blogHome',
  template: require('./blogHome.html'),
  directives: [BaFullCalendar,ROUTER_DIRECTIVES, RouterLink],
  pipes: [TimeAgoPipe,DateFormatPipe]
})

export class BlogHome {
    public category;
    public blog;
    public blogbyCategory;
    public Recentblog;
    public errorMessage: string;
    private _dataUrlAllCategory = 'api/category/getCategoryBlog';
    private _dataUrlAllBlog = 'api/blog/getBlog/';
    private _dataUrlAllBlogByCategoryId = 'api/blog/getBlogByCategoryId/';
    private _dataUrlRecentBlog = 'api/blog/getRecentBlog';
    public catagoryID;
    public router;
    public scrollController;
    private counterList = 0;
    public parseVar;
    public total_blog;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.catagoryID = routeParams.get('id');
        this.counterList = 0;
    }

    ngOnInit() {
        this.scrollController = 1;
        this.getCategory();
        this.getBlog();
        this.getRecentBlog();
        if (this.catagoryID != null && this.catagoryID != '' && typeof this.catagoryID != 'undefined') {
            this.getBlogByPassedCategoryId();
        }
        this.page.friendProfileId = '';
        this.page.wallId = '';
        this.counterList = 0;
        this.total_blog = 0;
    }

    getCategory() {
        this.dataService.getData(this._dataUrlAllCategory).subscribe(category => {
            this.category = category.data;
       });
    }

    getBlog() {
        this.dataService.getData(this._dataUrlAllBlog + this.counterList).subscribe(blog => {
            this.blog = blog.data;
            this.total_blog = blog.total_blog;
        });
    }

    getBlogByCategoryId(id) {
        this.dataService.getData(this._dataUrlAllBlogByCategoryId + id).subscribe(blog => {
            this.blogbyCategory = blog.data;
         });
    }

    getBlogByPassedCategoryId() {
        this.dataService.getData(this._dataUrlAllBlogByCategoryId + this.catagoryID).subscribe(blog => {
            this.blogbyCategory = blog.data;
        });
    }

    getRecentBlog() {
        this.dataService.getData(this._dataUrlRecentBlog).subscribe(Recentblog => {
            this.Recentblog = Recentblog.data;
        });    
    }


    onScrollList(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 100)) && (jQuery('#tab1_1').css('display') !== 'none')) {
            if (this.scrollController) {
                this.scrollController = 0;
                this.parseVar=this.total_blog / 10;
                var page = parseInt(this.parseVar);
                if (this.counterList <= (page + 1)) {
                    this.counterList++;
                    this.dataService.getData(this._dataUrlAllBlog + this.counterList).subscribe(blog => {
                        this.blog = this.blog.concat(blog.data);
                        this.scrollController = 1;
                    });
                }

            }

        }
    }

}
