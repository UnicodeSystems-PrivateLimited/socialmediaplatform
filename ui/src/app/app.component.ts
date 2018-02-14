import './app.loader.ts';
import './bootstrap.loader.ts';
//import './ckeditor.loader.ts';
import { Component, ViewEncapsulation, enableProdMode } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated'
import { Pages } from './pages';
import { AdminLayoutComponent } from './admin';
import { Login } from './pages/login';
import { ForgotPassword } from './pages/forgotPassword';
import { Register } from './pages/register';
import { AppState } from './app.state';
import { BaThemeConfigProvider, BaThemeConfig } from './theme';
import { BaThemeRun } from './theme/directives';
import { BaImageLoaderService, BaThemePreloader, BaThemeSpinner, GridDataService, PageService } from './theme/services';
import { layoutPaths } from './theme/theme.constants';
import { Logout } from './pages/logout';
import { TermOfUseLoginComponent } from './pages/termOfUseLogin';
import { PrivacyPolicyLoginComponent } from './pages/privacyPolicyLogin';
import { ContactUsLoginComponent } from './pages/contactUsLogin';
import { FaqLoginComponent } from './pages/faqLogin';


declare var ga: Function;
declare var window;

enableProdMode();
/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  pipes: [],
  directives: [BaThemeRun],
  providers: [BaThemeConfigProvider, BaThemeConfig, BaImageLoaderService, PageService, BaThemeSpinner, GridDataService],
  styles: [],
  template: `<router-outlet></router-outlet>`
})


@RouteConfig([

  {
    name: 'Login',
    component: Login,
    path: '/login',
    useAsDefault: true
  },

  {
    name: 'Register',
    component: Register,
    path: '/register'

  },
  {
    name: 'ForgotPassword',
    component: ForgotPassword,
    path: '/forgotPassword',

  },
  {
    name: 'Pages',
    component: Pages,
    path: '/pages/...',
    //  useAsDefault: true
  },
  {
    name: 'TermOfUseLoginComponent',
    component: TermOfUseLoginComponent,
    path: '/termOfUseLogin',
  },
  {
    name: 'PrivacyPolicyLoginComponent',
    component: PrivacyPolicyLoginComponent,
    path: '/privacyPolicyLogin',
  },
  {
    name: 'FaqLoginComponent',
    component: FaqLoginComponent,
    path: '/faqLogin',
  },
  {
    name: 'ContactUsLoginComponent',
    component: ContactUsLoginComponent,
    path: '/contactUsLogin',
  },
  {
    name: 'Admin',
    component: AdminLayoutComponent,
    path: '/admin/...'

  },

  {
    name: 'Logout',
    component: Logout,
    path: '/logout',
  },
  {
    path: '/**',
    redirectTo: ['Pages']
  }
])

export class App {

  isMenuCollapsed: boolean = false;
  private _dataUrl = '/api/ping';
  private _headerDataUrl = '/api/user/getHeaderData';
  private _router;

  constructor(router: Router, private dataService: GridDataService, private page: PageService, private _state: AppState, private _imageLoader: BaImageLoaderService, private _spinner: BaThemeSpinner, private _config: BaThemeConfig) {
    this._loadImages();
    this._router = router;
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
    router.subscribe((event) => {
      ga('set', 'page', window.location.pathname);
      ga('send', 'pageview');
    }, (err) => {
      console.log("+++++++++++++++++=", err);
    });
  }

  public ngAfterViewInit(): void {
    // hide spinner once all loaders are completed
    BaThemePreloader.load().then((values) => {
      this._spinner.hide();
      this.ping();
    });
  }

  private _loadImages(): void {
    // register some loaders
    BaThemePreloader.registerLoader(this._imageLoader.load(layoutPaths.images.root + 'sky-bg.jpg'));
  }
  ngOnInit() {
    this.ping();

  }
  ping() {
    this.dataService.getData(this._dataUrl).subscribe(res => {
      if (res.status == 1) {

        console.log(this.page.loggedInType);
        if (res.type == 2) {
          //          this._router.navigate(['Admin']);
        } else {

          console.log("getting URL");
          //last url parameter
          var final = window.location.href.match(/\/([^\/]+)\/?$/)[1];
          if (final.indexOf(';') !== -1)
          { final = final.substring(0, final.indexOf(';')); }
          //second last url parameter
          var secondfinal = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
          secondfinal = secondfinal.match(/\/([^\/]+)\/?$/)[1];
          //third last url parameter        
          var parts = window.location.href.split('/');
          var thirdfinal = parts[4];
          if (final === 'settings' || final === 'event' || final === 'eventMember' || final === 'group' || final === 'userDetail' || final === 'userList' || final === 'userProfile' || final === 'userSearch' || final === 'blogHome' || final == 'groupsInvite' || final == 'myWall' || final == 'list') {
          } else if (secondfinal === 'subject-wall') {
            // this.page.wallId = final;
            this.getScdJoinStatus('subject', final);
          } else if (secondfinal === 'bachelor-view') {
            // this.page.wallId = final;
            this.getScdJoinStatus('degree', final);
          } else if (secondfinal === 'college-wall') {
            this.page.wallId = final;
            this.getScdJoinStatus('college', final);
          } else if (
            secondfinal === 'masterWall' || secondfinal == 'groupWall') {
            this.page.wallId = final;
          } else if (secondfinal == 'blogPost' || secondfinal == 'connection' || secondfinal == 'blogHome' || secondfinal == 'eventDetail' || secondfinal == 'groupsMember' || secondfinal == 'journal' || secondfinal == 'profileAssetFriendDetails' || secondfinal == 'profileAssetDetails' || secondfinal == 'event-detail') {
          } else if (secondfinal == 'profileByUser') {
            this.page.friendProfileId = final;

          }
          else if (thirdfinal === 'degreePastCurrentMember' || thirdfinal === 'subjectPastCurrentMember' || thirdfinal === 'profileConnection' || thirdfinal === 'PastCurrentMember' || thirdfinal === 'collegePastCurrentMember') {
            this.page.wallId = secondfinal;
            console.log(" this.page.wallId", this.page.wallId);
          } else {
            this._router.navigate(['Pages']);
          }
        }
      }
      else
        this._router.navigate(['Login']);
      //  window.open('/','_self');

    });
  }

  public getScdJoinStatus(type: string, id: any) {
    this.dataService.getData(this._headerDataUrl).subscribe(header => {
      this.page.wallId = id;
      this.page.join = 0;
      if (type == 'subject') {
        for (var i = 0; i < header.data.subjects.length; i++) {
          if (header.data.subjects[i].subject_id._id == id) {
            this.page.join = 1;
          }
        }
      }
      if (type == 'college') {
        for (var i = 0; i < header.data.college.length; i++) {
          if (header.data.college[i].college_id._id == id) {
            this.page.join = 1;
          }
        }
      }
      if (type == 'degree') {
        for (var i = 0; i < header.data.degree.length; i++) {
          if (header.data.degree[i].degree_id._id == id) {
            this.page.join = 1;
          }
        }
      }
    });
  }
}
