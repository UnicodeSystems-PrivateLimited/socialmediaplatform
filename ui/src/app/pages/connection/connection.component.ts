import { Component, ViewEncapsulation, OnInit, ElementRef } from '@angular/core';
import { BaFullCalendar } from '../../theme/components';
import { GridDataService, PageService } from '../../theme/services';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';

declare var jQuery: any;
declare var noty: any;
declare var require: any;


@Component({
    selector: 'connection',
    template: require('./connection.html'),
    directives: [BaFullCalendar, RouterOutlet, RouterLink, ROUTER_DIRECTIVES],
    host: { 'class': 'ng-animate page1Container' },
    pipes: [TimeAgoPipe, DateFormatPipe]
})

export class Connection implements OnInit {
    private _dataUrlFriends = '/api/user/dashboard/getFriends';
    private _dataUrlFollowing = '/api/user/dashboard/getFollowing';
    private _dataUrlFollower = '/api/user/dashboard/getFollower';
    public elementRef: ElementRef;
    private _router;
    public connectionId;
    public friends;
    public followers;
    public followings;
    public user;
    public connectionPageType;
    router: Router;

    constructor(private dataService: GridDataService, private page: PageService, router: Router, routeParams: RouteParams, elementRef: ElementRef) {
        this.elementRef = elementRef;
        this.router = router;
        this.connectionId = routeParams.get('id');
        if (routeParams.get('pageType')) {
            this.connectionPageType = routeParams.get('pageType');
        }
    }

    ngOnInit() {
          jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        if (this.connectionId != null && this.connectionId != '' && typeof this.connectionId != 'undefined' && this.connectionId == 1) {
            this.getFriends();
        }
        if (this.connectionId != null && this.connectionId != '' && typeof this.connectionId != 'undefined' && this.connectionId == 2) {
            this.getFollowing();
        }
        if (this.connectionId != null && this.connectionId != '' && typeof this.connectionId != 'undefined' && this.connectionId == 3) {
            this.getFollower();
        }
        this.page.friendProfileId = '';
        this.page.wallId = '';
    }

    getFriends() {
        this.dataService.getData(this._dataUrlFriends).subscribe(friends => {
            this.friends = friends.friends;
        });
    }

    getFollowing() {
        this.dataService.getData(this._dataUrlFollowing).subscribe(followings => {
            this.followings = followings.followings;
        });
    }

    getFollower() {
        this.dataService.getData(this._dataUrlFollower).subscribe(followers => {
            this.followers = followers.followers;
        });
    }

    getProfileById(id) {
        if (this.page.userIdGlobal == id) {
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else {
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }

    getOwnProfileById() {
        if (this.connectionPageType == 1) {
            this.router.navigate(['DashboardHome']);
        }
        else if (this.connectionPageType == 2) {
            this.router.navigate(['UserProfile', { tab: 1 }]);
        }
        else if (this.connectionPageType == 3) {
            this.router.navigate(['MyWallComponent']);
        }else{
            this.router.navigate(['MyWallComponent']);
        }
    }
}