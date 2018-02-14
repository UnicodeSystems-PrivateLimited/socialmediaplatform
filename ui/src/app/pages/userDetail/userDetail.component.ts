import {Component, ViewEncapsulation} from '@angular/core';
import {BaCard} from '../../theme/components';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated'

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    pipes: [],
    directives: [BaCard],
    selector: 'data-detail',
    template: require('./userDetail.html'),
})

export class UserDetail {
    public user;
    public errorMessage: string;
    private _dataUrl = '/api/user';
    isOpen = false;

    constructor(private dataService: GridDataService, private routeParam: RouteParams, private page: PageService) {
    }

    ngOnInit() {
        var params = this.routeParam.params;
        if (params['id']) {
            this.getUserDetail(params['id']);
        }
        this.page.friendProfileId = '';
        this.page.wallId = '';
    }

    getUserDetail(id) {
        this.dataService.getData(this._dataUrl + "/" + id).subscribe(user => this.user = user);
    }

}


