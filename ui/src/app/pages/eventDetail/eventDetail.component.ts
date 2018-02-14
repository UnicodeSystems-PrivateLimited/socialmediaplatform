import {Component, ViewEncapsulation} from '@angular/core';
import {BaFullCalendar} from '../../theme/components';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';

declare var jQuery: any;
declare var noty: any;
declare var require: any;
declare var $: any;

@Component({
    selector: 'event-detail',
    template: require('./eventDetail.html'),
    pipes: [DateFormatPipe, TimeAgoPipe]
})

export class EventDetailComponent {
    public eventId;
    public events;
    public _dataUrlUserGroup = '/api/groupevents/listEventsById/';
    router: Router;

    constructor(router: Router, private dataService: GridDataService, private page: PageService, routeParams: RouteParams) {
        this.eventId = routeParams.get('eventId');
        this.router = router;
    }

    ngOnInit() {
        this.getEventDataById();
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

    getEventDataById() {
        this.dataService.getData(this._dataUrlUserGroup + this.eventId).subscribe(res => {
            if (res.status == 2) {
                this.events = res.data;
            }
        });
    }

}