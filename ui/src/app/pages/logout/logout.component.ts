import { Component, ViewEncapsulation } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl } from '@angular/common';
import { GridDataService, PageService } from '../../theme/services';
import { Router, RouteParams, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'logout',
    template: require('./logout.html'),
})
export class Logout {
    public errorMessage: string;
    public _dataUrl = '/logout';
    constructor(private dataService: GridDataService, private page: PageService, private _router: Router) { }

    ngOnInit() {
        this.getUsers();
    }

    getUsers() {
        document.cookie = 'email=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'password=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'remember=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.dataService.getData(this._dataUrl).subscribe(res => {
            this.page.loggedInType = 0;
            window.open('/login', '_self');

        });
    }
}
