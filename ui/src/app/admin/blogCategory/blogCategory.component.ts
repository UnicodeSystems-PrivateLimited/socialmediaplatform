import {Component, OnInit} from '@angular/core';
import {GridDataService,PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var noty: any;
declare var require: any;



@Component({
    selector: 'admin-blogCategory',
    template: require('./blogCategroy.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class BlogCategoryComponent {
    public user;
    public errorMessage: string;
    private _dataUrlCategory = 'api/category/getCategory';
    private _dataUrlDeleteCategory = 'api/category/delete/';
    private _dataUrlAddCategory = 'api/category/add';
    private _dataUrlEditCategory = 'api/category/edit/';
    private _categorySearch = 'api/category/categorySearch/';
    router: Router;
    public cat;
    public category;
    public deleteCategory;
    public errorSearch;
    public errorAddCategory;
    public errorEditCategory;
    public title = { title: '' };
    public updateCatagoryId;
    public catagoryName;
    public categoriesName = { name: '' };
    public contentLoding: boolean = false;
    public deleteBlogCategoryId;
    public index;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
    }

    ngOnInit() {
        this.getAllCatagory();
    }

    ngAfterViewInit() {
        setTimeout(function() {
            jQuery("#detailBtn2").click(function() {
                jQuery("#detailModal").modal({ backdrop: false });
            });
        }, 100);
    }

    getAllCatagory() {
        this.contentLoding = true;
        this.dataService.getData(this._dataUrlCategory).subscribe(category => {
            this.category = category.data;
            this.contentLoding = false;
        });
    }


    getCategory(event) {
        if (!this.categoriesName.name) {
            this.errorSearch = "";
            this.getAllCatagory();
        }
        else {
            var nameValid = /^[a-z\d-_.(){}\,\s]+$/i;
            if (this.categoriesName.name.match(nameValid)) {
                this.dataService.postData(this._categorySearch, this.categoriesName).subscribe(res => {
                    if (res.status == 2) {
                        this.category = res.data;
                        this.errorSearch = "";
                    }
                });
            } else {
                this.errorSearch = "Invalid Search Input!.";
            }
        }
    }

    deleteCategoryModal(id,i){
    this.deleteBlogCategoryId=id;
    this.index=i;
    jQuery("#deleteCategoryModal").modal({ backdrop: false });
    }

    deleteCategoryById() {
        this.dataService.getData(this._dataUrlDeleteCategory + this.deleteBlogCategoryId).subscribe(deleteCategory => {
            this.deleteCategory = deleteCategory.data;
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Category Deleted.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        //    this.getAllCatagory();
        this.category.splice(this.index, 1);
        });

    }

    addCatagory() {
        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.title.title.match(letters) && this.title.title != '') {
            this.dataService.postData(this._dataUrlAddCategory, this.title).subscribe(post_category => {

                this.title.title = '';
                this.errorAddCategory = "";
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Category Added.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.getAllCatagory();
                jQuery("#detailModal").modal('hide');
            });
        } else {
            this.errorAddCategory = "Invalid Cateogry Name";
        }
    }

    clearDetailModal() {
        this.title.title = '';
        this.errorAddCategory = "";
    }

    updateId(cat) {
        this.cat = cat;
        this.updateCatagoryId = cat._id;
        this.catagoryName = cat.title;
        this.title.title = cat.title;
        this.errorEditCategory = "";
        setTimeout(function() {
            jQuery("#EditdetailModal").modal({ backdrop: false });
        }, 100);
    }

    editCatagory() {
        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.title.title.match(letters) && this.title.title != '') {
            this.dataService.postData(this._dataUrlEditCategory + this.updateCatagoryId, this.title).subscribe(post_category => {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Category Edited.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.title.title = '';
                this.errorEditCategory = "";
                this.cat.title = post_category['data'][0].title;
                jQuery("#EditdetailModal").modal('hide');
            });
        } else {
            this.errorEditCategory = "Invalid Category Name";
        }
    }
}
