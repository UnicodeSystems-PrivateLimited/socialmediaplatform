import {Component, OnInit} from '@angular/core';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'master-admin',
    template: require('./setting.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class SettingComponent {
    public user;
    public errorMessage: string;
    private _dataUrlUser = 'api/user/getAllUser/';
    private _dataUrlChangePassword = 'api/user/changePasswordAdmin/';
    private _dataUrlActivate = 'api/user/isActive/';
    private _userSearch = 'api/user/userSearchadgetUserSearchlistmin';
    router: Router;
    public settings;
    public counter = 1;
    public total_user;
    public total_pages;
    public total_page;
    public total_pages_float;
    public errorSearch;
    public total_pages_left = 0;
    public userId;
    public message = { currentPassword: { currentPassword: '' }, newPassword: { newPassword: '' }, confirmPassword: { confirmPassword: '' } };
    public username = { name: '' };
    public contentLoding: boolean = false;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.counter = 1;
        this.total_pages_left = 0;
    }

    ngOnInit() {
        this.total_pages_left = 0;
        this.getAllUser();
    }

    ngAfterViewInit() {

    }

    updateUserID(id) {
        this.userId = id;
        jQuery("#EditdetailModal").modal({ backdrop: false });
    }


    changePassword() {
        if (this.message.confirmPassword.confirmPassword != '' && this.message.newPassword.newPassword != '') {
            this.dataService.postData(this._dataUrlChangePassword + this.userId, this.message).subscribe(post_message => {
                this.message.currentPassword.currentPassword = '';
                this.message.confirmPassword.confirmPassword = '';
                this.message.newPassword.newPassword = '';
                this.counter = 1;
                this.getAllUser();
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_message.msg + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            });
        } else {
            var n = noty({ text: '<div class="alert bg-theme-error"><p>All Field Required.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        }
    }

    clearChangePasswordModal() {
        this.message.confirmPassword.confirmPassword = '';
        this.message.newPassword.newPassword = '';
    }

    isActiveAccount(Status, id) {
        this.dataService.getData(this._dataUrlActivate + id + '/' + Status).subscribe(active => {
            this.counter = 1;
            this.getAllUser();
        });
    }

    getUser(event) {
        if (!this.username.name) {
            this.counter = 1;
            this.errorSearch = "";
            this.getAllUser();
        }
        else {
            var nameValid = /^[a-z\d-_.(){}\,\s]+$/i;
            if (this.username.name.match(nameValid)) {
                this.dataService.postData(this._userSearch, this.username).subscribe(res => {
                    if (res.status == 2) {
                        this.settings = res.data;
                        this.errorSearch = "";
                    }
                });
            } else {
                this.errorSearch = "Invalid Search Input!.";
            }
        }
    }

    getAllUser() {
        this.contentLoding = true;
        this.dataService.getData(this._dataUrlUser + this.counter).subscribe(settings => {
            this.settings = settings.data;
            this.total_user = settings.total_user;
            this.total_pages_float = this.total_user / 50;
            this.total_pages = parseInt(this.total_pages_float);
            this.total_pages_left = this.total_pages - 1;
            this.contentLoding = false;
        });
    }

    getAllUserPaginationNext() {
        if (this.total_pages_left < this.total_pages && this.total_pages_left >= 0) {
            this.counter++;
            this.dataService.getData(this._dataUrlUser + this.counter).subscribe(settings => {
                this.settings = settings.data;
                this.total_pages_left = this.total_pages_left - 1;
            });
        }
        else {
            console.log("no more pages left");
        }
    }

    getAllUserPaginationPrevious() {
        if (this.total_pages_left + 1 !== this.total_pages) {
            this.counter--;
            this.dataService.getData(this._dataUrlUser + this.counter).subscribe(settings => {
                this.settings = settings.data;
                this.total_pages_left = this.total_pages_left + 1;
            });
        }
        else {
            console.log("no page left");
        }
    }

}
