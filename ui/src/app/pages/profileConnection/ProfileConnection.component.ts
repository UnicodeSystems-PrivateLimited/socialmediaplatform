import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { NgClass } from '@angular/common';
import { GridDataService, PageService } from '../../theme/services';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'data-profile',
    template: require('./ProfileConnection.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES],
})

export class ProfileConnectionComponent {
    public user;
    public errorMessage: string;
    private _dataUrlProfileData = '/api/user/currentFriendDetail/';
    private _dataUrlFriends = '/api/user/getUserProfileData/getFriends/';
    private _dataUrlFollowers = 'api/user/getUserProfileData/getFollowers/';
    private _dataUrlFollowings = 'api/user/getUserProfileData/getFollowings/';
    public followers;
    public followings;
    public friends;
    public userId;
    public connectionId;
    public currentProfileData;
    router: Router;
    public initialPageStatus: boolean = true;

    constructor(private dataService: GridDataService, routeParams: RouteParams, private page: PageService, router: Router) {
        this.userId = routeParams.get('userId');
        this.connectionId = routeParams.get('id');
        this.router = router;
    }

    ngOnInit() {
        this.getProfileDetail(this.userId);
        if (this.connectionId != null && this.connectionId != '' && typeof this.connectionId != 'undefined' && this.connectionId == 1) {
            this.getFriends();
        }
        if (this.connectionId != null && this.connectionId != '' && typeof this.connectionId != 'undefined' && this.connectionId == 2) {
            this.getFollowers();
        }
        if (this.connectionId != null && this.connectionId != '' && typeof this.connectionId != 'undefined' && this.connectionId == 3) {
            this.getFollowings();
        }
    }

    getProfileDetail(id) {
        this.dataService.getData(this._dataUrlProfileData + id).subscribe(profile => {
            this.currentProfileData = profile.data;
        });
    }

    getFriends() {
        this.dataService.getData(this._dataUrlFriends + this.userId).subscribe(friends => {
            this.friends = friends.friends;
        });
    }

    getFollowers() {
        this.dataService.getData(this._dataUrlFollowers + this.userId).subscribe(followers => {
            this.followers = followers.followers;
        });
    }

    getFollowings() {
        this.dataService.getData(this._dataUrlFollowings + this.userId).subscribe(followings => {
            this.followings = followings.followings;
        });
    }

    getProfileById(id) {
        if (this.page.userIdGlobal == id) {
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else {
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, random: 0 }]);
        }
    }
}
