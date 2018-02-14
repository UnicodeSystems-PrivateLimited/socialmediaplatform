import {Component, ViewEncapsulation, OnInit, ElementRef} from '@angular/core';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {AdminProfileComponent} from './adminProfile';
import {BlogComponent} from './blog';
import {BlogCategoryComponent} from './blogCategory';
import {BlogItemsComponent} from './blogItems';
import {CollegeComponent} from './college';
import {DegreeComponent} from './degree';
import {EmailTemplateComponent} from './emailTemplate';
import {MasterAdminComponent} from './masterAdmin';
import {NewsletterComponent} from './newsletter';
import {NewsletterSubscriptionComponent} from './newsletterSubscription';
import {SchedulingComponent} from './scheduling';
import {SettingComponent} from './setting';
import {SkillsComponent} from './skills';
import {SubjectComponent} from './subject';
import {TemplateComponent} from './template';
import {GridDataService, PageService} from '../theme/services';
import {BlogDetailsComponent} from './blogDetails';
import { PostReportComponent } from './postReport';

declare var require: any;

@RouteConfig([
    {
        name: 'AdminProfile',
        component: AdminProfileComponent,
        path: '/adminProfile'
    },
    {
        name: 'Blog',
        component: BlogComponent,
        path: '/blog'
    },
    {
        name: 'BlogDetails',
        component: BlogDetailsComponent,
        path: '/blogDetails/:id'
    },
    {
        name: 'BlogCategory',
        component: BlogCategoryComponent,
        path: '/blogCategory'
    },
    {
        name: 'BlogItems',
        component: BlogItemsComponent,
        path: '/blogItems'
    },
    {
        name: 'College',
        component: CollegeComponent,
        path: '/college'
    },
    {
        name: 'Degree',
        component: DegreeComponent,
        path: '/degree'
    },
    {
        name: 'EmailTemplate',
        component: EmailTemplateComponent,
        path: '/emailTemplate'
    },
    {
        name: 'MasterAdmin',
        component: MasterAdminComponent,
        path: '/masterAdmin'
    },
    {
        name: 'Newsletter',
        component: NewsletterComponent,
        path: '/newsletter'
    },
    {
        name: 'NewsletterSubscription',
        component: NewsletterSubscriptionComponent,
        path: '/newsletterSubscription',
    },
    {
        name: 'Scheduling',
        component: SchedulingComponent,
        path: '/scheduling'
    },
    {
        name: 'Setting',
        component: SettingComponent,
        path: '/setting'
    },
    {
        name: 'Skills',
        component: SkillsComponent,
        path: '/skills'
    },
    {
        name: 'Subject',
        component: SubjectComponent,
        path: '/subject',
        useAsDefault: true
    },
    {
        name: 'Template',
        component: TemplateComponent,
        path: '/template'
    },
    {
        name: 'PostReportComponent',
        component: PostReportComponent,
        path: '/postreport'
    }
])

@Component({
    selector: 'sn-admin',
    template: require('./adminLayout.html'),
    providers: [PageService, GridDataService]
})

export class AdminLayoutComponent {
    router: Router;
    location: Location;
    toggleGroup: boolean = false;
    toggleBlog: boolean = false;
    toggleNewsletter: boolean = false;
    public toggleState: boolean = false;
    public mobMenuState: boolean = false;
    public elementRef: ElementRef;
    private _dataUrl = 'api/user/checktype/';
    public _headerDataUrl = '/api/user/getHeaderData';
    public generalInformation = { userName: null, userEmail: null, userPass: null, userConfirmPass: null };

    constructor(router: Router, private page: PageService, private dataService: GridDataService) {
        this.router = router;
    }

    getLinkStyle(path) {
        // return this.location.path() === path;
    }

    ngOnInit() {
        this.checkUser();
        this.getAccountData()
    }

    checkUser() {
        this.dataService.getData(this._dataUrl).subscribe(res => {
            if (res.status == 2) {
                if (res.data != 2) this.router.navigate(['../Logout']);
            } else {
                this.router.navigate(['../Logout']);
            }
        });
    }

    getAccountData() {
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            if (header['data'].fname != '' && header['data'].fname != null && typeof (header['data'].fname) != "undefined") {
                this.generalInformation.userName = header['data'].fname + ' ' + header['data'].lname;
                this.page.adminName = header['data'].fname + ' ' + header['data'].lname;
            }
            else {
                this.generalInformation.userName = '';
                this.page.adminName = '';
            }
            this.generalInformation.userEmail = header['data'].local.email;
            if (header['data'].photo != '' && header['data'].photo != null && typeof (header['data'].photo) != "undefined") {
                this.page.adminProfilePic = header['data'].photo + "?t=" + new Date().getTime();
            }
            else {
                this.page.adminProfilePic = '';
            }
        });
    }

    getProfile() {

    }

    signout() {
        this.router.navigate(['../Logout']);
    }




    ngAfterViewInit() {
        setTimeout(function () {
            jQuery("#join-modal-btn").click(function () {
                jQuery("#join-modal").modal();
            });
        }, 100);
        setTimeout(function () {
            jQuery('#date-from').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
            jQuery('#date-to').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        }, 500);
    }

    toggleNav() {
        this.toggleState = !this.toggleState;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = this.toggleState == true ? body.attr("class", "hold-transition skin-yellow-light sidebar-mini get-freeze") : body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
    }
    toggleMobileMenu() {
        this.mobMenuState = !this.mobMenuState;
    }

}
