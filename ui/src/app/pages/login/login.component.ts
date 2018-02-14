import {Component, ViewEncapsulation} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl} from '@angular/common';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import { TermOfUseLoginComponent } from '../termOfUseLogin';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'login',
    template: require('./login.html'),
    providers: [GridDataService, PageService]
})

export class Login {
    public form: ControlGroup;
    public email: AbstractControl;
    public password: AbstractControl;
    public submitted: boolean = false;
    private _loginUrl = '/api/user/login';
    private _router;
    public loginMsg = null;
    public successMsg = null;
    private login = { email: "", password: "", agree: false };
    public contentLoding: boolean = false;

    constructor(fb: FormBuilder, private dataService: GridDataService, router: Router, params: RouteParams, private page: PageService) {
        this.form = fb.group({
            'email': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
        });
        this.email = this.form.controls['email'];
        this.password = this.form.controls['password'];
        this._router = router;
        var msg = this.page.reg_msg;
        if (msg == "success") this.successMsg = "Activation Mail has been send to your email account";
        this.page.reg_msg = '';
        }

    onSubmit() {
        this.submitted = true;
        this.userLogin();
    }
    termsopen(){
        //  [routerLink]="['TermOfUseComponent']"
         this._router.navigate(['/termOfUse']);
    }

    userLogin() {
        this.contentLoding = true;
        this.dataService.postData(this._loginUrl, this.login)
            .subscribe(res => {
                if (res.status === 1) {
                     this.page.loggedInType=res.type;
                    if (res.type == 2) {
                        this._router.parent.navigate(['Admin']);
                    } else { this._router.parent.navigate(['Pages']); }
                } else {
                    this.loginMsg = res.msg
                }
                this.contentLoding = false;
            });
    }

    sociallogin(url) {
        window.open(url, "Login", "width=700,height=500,left=150,top=200,toolbar=0,status=0");
    }

}


