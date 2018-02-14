import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {GridDataService,PageService} from '../../theme/services';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'termOfUseLogin',
    template: require('./termOfUseLogin.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES,TOOLTIP_DIRECTIVES]
})

export class TermOfUseLoginComponent {
     public socialPostUrl = '/api/user/postSocialLink';
    public groups;
    public group;
    public otherGroups;
    public imageFile;
    public groupDeleteId;
    public groupLeaveId;
    public _dataUrlUserGroup = '/api/group/getGroupsByUserId';
    public _dataUrlOtherUserGroup = '/api/group/getOtherGroupsByUserId';
    public _dataUrlGroupAdd = '/api/group/addGroup';
    public _dataUrlDeleteGroup = '/api/group/deletegroup';
    public _dataUrlLeaveGroup = 'api/group/leaveGroup';
    public _dataUrlUpdateOnly = 'api/group/updateOnly';
    public _dataUrlUpdate = 'api/group/updateGroup';
    public photosToUpload;
    public errorGroupMsg = { errorName: '', errorDiscription: '', errorIcon: '' };
    public groupdata = { title: '', description: '' };
    router: Router;
    location: Location;
    private dataService;
    public page;

    constructor(router: Router, page: PageService, dataService: GridDataService) {
        this.router = router;
        this.location = location;
        this.dataService = dataService;
        this.page = page;
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
    }


}