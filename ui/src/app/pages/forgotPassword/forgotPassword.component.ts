import {Component, ViewEncapsulation} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl} from '@angular/common';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated'
import {NgClass} from '@angular/common';
import {GridDataService,PageService} from '../../theme/services';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
  selector: 'forgot-password',
  template: require('./forgotPassword.html'),
})

export class ForgotPassword {
    private _loginUrl = '/api/user/forgetPassword';
    private _router;
    public loginMsg = null;
    private forget = { email: "" };
    submitted = false;

    constructor(private dataService: GridDataService, router: Router) {
        this._router = router;
    }

    onSubmit() {
        this.submitted = true;
        this.userLogin();
    }

    userLogin() {
        this.dataService.postData(this._loginUrl, this.forget)
            .subscribe(res => {  if (res.status === 1) { 
            var n = noty({ text: '<div class="alert alert-success"><p>' + res['msg']+'</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 5000 });
            this._router.navigate(['Login']); 
            } else { this.loginMsg = res.msg; this.forget.email = ''; } });
    }
}
