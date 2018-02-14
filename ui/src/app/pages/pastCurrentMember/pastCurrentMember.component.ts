import {Component, ViewEncapsulation} from '@angular/core';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {GridDataService,PageService} from '../../theme/services';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
  selector: 'PastCurrentMember',
  template: require('./pastCurrentMember.html'),
  directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES],
   host: { 'class': 'ng-animate page1Container' }
})

export class PastCurrentMember {
    public user;
    public errorMessage: string;
    private _dataUrlCurrentMembers = '/api/degree/getDegreeData/getCurrentMembers/';
    private _dataUrlPastMembers = '/api/degree/getDegreeData/getPastMembers/';
    public degreeId;
    public sub;
    public current_member;
    public past_member;
    router: Router;
    public connectionId;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.degreeId = routeParams.get('degreeId');
        this.connectionId = routeParams.get('id');
        this.router = router;
    }

    ngOnInit() {
        if (this.connectionId != null && this.connectionId != '' && typeof this.connectionId != 'undefined' && this.connectionId == 1) {
            this.getCurrentMembers();
        }
        if (this.connectionId != null && this.connectionId != '' && typeof this.connectionId != 'undefined' && this.connectionId == 2) {
            this.getPastMembers();
        }
    }

    getCurrentMembers() {
        this.dataService.getData(this._dataUrlCurrentMembers + this.degreeId).subscribe(sub => {
            this.sub = sub;
            this.current_member = sub.current_members;
        });
    }

    getPastMembers() {
        this.dataService.getData(this._dataUrlPastMembers + this.degreeId).subscribe(sub => {
            this.sub = sub;
            this.past_member = sub.past_members;
        });
    }

    getProfileById(id) {
        if(this.page.userIdGlobal == id){
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else{
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }
}
