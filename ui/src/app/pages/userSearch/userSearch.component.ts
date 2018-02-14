import { Component, ViewEncapsulation, ElementRef } from '@angular/core';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { BaCard } from '../../theme/components';
import { GridDataService, PageService } from '../../theme/services';
import { nameFilterPipe } from '../../theme/pipes/name-filter';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'user-search',
    template: require('./userSearch.html'),
    pipes: [nameFilterPipe, DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, ROUTER_DIRECTIVES, RouterLink]
})

export class UserSearchComponent {
    public errorMessage: string;
    private _router;
    router: Router;
    public elementRef: ElementRef;
    public _dataUrl = '/api/user/friendlistByUser';
    public _userSearchUrl = '/api/user/userSearching';
    public _addFriendUrl = '/api/user/addFriend';
    private _getUnblockedFriendsUrl = '/api/user/unblockFriend';
    private _getblockedFriendsUrl = '/api/user/blockFriend';
    public _dataUrlCancelFriend = '/api/user/cancelFriend';
    private _dataUrladdFollower = 'api/user/addFollower/';
    private _dataUrlUnFollower = 'api/user/unFollow/';
    private _dataUrlApproveFriend = 'api/user/approveFriend';
    private _dataUrlRemoveFriend = 'api/user/removeFriend';
    private _dataUrlRejectFriend = 'api/user/rejectFriend';
    public key = { name: "" };
    public userSearchList;
    public blocked_friends;
    public msg: string;
    public searchCount = null;
    public friendStatus = null;

    constructor(private dataService: GridDataService, private page: PageService, router: Router, elementRef: ElementRef, routeParams: RouteParams) {
        this._router = router;
        this.router = router;
        this.elementRef = elementRef;
        this.key.name = routeParams.get('id');
        this.page.friendProfileId = '';
        this.page.wallId = '';
    }

    ngOnInit() {
        this.showUserList()
    }

    showUserList() {
        if (this.key.name != '' && this.key.name != null) {
            this.dataService.postData(this._userSearchUrl, this.key)
                .subscribe(res => {
                    if (res.status === 2) {
                        this.userSearchList = res.data;
                        this.searchCount = res.data.length;
                    }
                });
        }
    }

    addAsFriend(id) {
        this.dataService.getData(this._addFriendUrl + "/" + id)
            .subscribe(res => {
                if (res.status == 2) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request sent</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    this.friendStatus = res;
                    this.showUserList();
                }
            });
    }

    unblockFriend(friend_id, user) {
        this.dataService.getData(this._getUnblockedFriendsUrl + "/" + friend_id).subscribe(unblock => {
            if (unblock.status == 2) {
                user.status = 6;
                this.blocked_friends = 0;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend unblocked successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        });
    }

    blockFriend(friend_id, user) {
        this.dataService.getData(this._getblockedFriendsUrl + "/" + friend_id).subscribe(block => {
            if (block.status == 2) {
                user.status = 4;
                this.blocked_friends = friend_id;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend blocked successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            }
        });
    }

    friendRequestReject(friend_id, user) {
        this.dataService.getData(this._dataUrlRejectFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user.status = 6;
                var n = noty({ text: '<div class="alert alert-danger"><p>Friend request rejected</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
            }
        });
    }

    acceptFriendRequest(friend_id, user) {
        this.dataService.getData(this._dataUrlApproveFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user.status = 3;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend Request Accepted</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        });
    }

    cancelRequestedFriend(friend_id, user) {
        this.dataService.getData(this._dataUrlCancelFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user.status = 6;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request Cancelled</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        });
    }

    friendRemove(friend_id, user) {
        this.dataService.getData(this._dataUrlRemoveFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user.status = 6;
                var n = noty({ text: '<div class="alert alert-danger"><p>Friend Removed</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
            }
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

    setFollow(id, user) {
        this.dataService.getData(this._dataUrladdFollower + id).subscribe(res => {
            if (res.status == 2) {
                user.forgot_password_code = 3;
            }
            if (res.data == 2) {
                this.msg = res.msg
            } else this.msg = 'error';
        });
    }

    setUnFollow(id, user) {
        this.dataService.getData(this._dataUrlUnFollower + id).subscribe(res => {
            if (res.status == 2) {
                user.forgot_password_code = 6;
            }
            if (res.data == 2) {
                this.msg = res.msg
            } else this.msg = 'error';
        });
    }
}
