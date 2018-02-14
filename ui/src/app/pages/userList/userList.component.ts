import { Component, ViewEncapsulation, OnInit, ElementRef } from '@angular/core';
import { BaCard } from '../../theme/components';
import { GridDataService, PageService } from '../../theme/services';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { InviteFriendsModel } from '../../theme/components';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({

    selector: 'data-list',
    template: require('./userList.html'),
    pipes: [DateFormatPipe],
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES,InviteFriendsModel],
    host: { 'class': 'ng-animate page1Container' }
})

export class UserListComponent implements OnInit {
    public _dataUrl = '/api/user';
    public _friendListUrl = '/api/user/getAllTypeFriends';
    public _userSearchUrl = '/api/user/userSearch';
    public _addFriendUrl = '/api/user/addFriend';
    private _getUnblockedFriendsUrl = '/api/user/unblockFriend';
    private _getblockedFriendsUrl = '/api/user/blockFriend';
    public _dataUrlCancelFriend = '/api/user/cancelFriend';
    private _dataUrladdFollower = 'api/user/addFollower/';
    private _dataUrlUnFollower = 'api/user/unFollow/';
    private _dataUrlApproveFriend = 'api/user/approveFriend';
    private _dataUrlRemoveFriend = 'api/user/removeFriend';
    private _dataUrlRejectFriend = 'api/user/rejectFriend';
    public _acceptFriendNotification = '/api/notification/addNotification/';
    public acceptFriendTitle = { title: 'has accepted your friend request', recepient: [] };
    public _addFriendNotification = '/api/notification/addNotification/';
    public users;
    public errorMessage: string;
    public friends;
    public key = { name: "" };
    public userSearchList;
    public blocked_friends;
    public msg: string;
    public searchCount = null;
    public friendStatus = null;
    public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
    private post_type = {
        SENDREQ: 0,
        ACCEPTREQNOTIFY: 3,
    };
    public elementRef: ElementRef;
    router: Router;
    public showinviteFriendsModel: boolean = false;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router, elementRef: ElementRef) {
        this.router = router;
        this.elementRef = elementRef;
    }

    ngOnInit() {
          jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.getFriendList();
        this.page.friendProfileId = '';
        this.page.wallId = '';
    }

    getFriendList() {
        this.dataService.getData(this._friendListUrl).subscribe(user => {
            this.friends = user.data
        });
    }

    addAsFriend(id, friend) {
        this.addFriendTitle.recepient = friend;
        this.dataService.getData(this._addFriendUrl + "/" + id)
            .subscribe(res => {
                if (res.status == 2) {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request sent</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    this.friendStatus = res;
                    this.getFriendList();
                    this.dataService.postData(this._addFriendNotification + id + '/' + this.post_type.SENDREQ, this.addFriendTitle).subscribe(res => {
                    });
                } else {
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + res.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    this.getFriendList();
                }
            });
    }

    unblockFriend(friend_id, user) {
        this.dataService.getData(this._getUnblockedFriendsUrl + "/" + friend_id).subscribe(unblock => {
            if (unblock.status == 2) {
                user.status = 6;
                this.blocked_friends = 0;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend unblocked successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + unblock.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    blockFriend(friend_id, user) {
        this.dataService.getData(this._getblockedFriendsUrl + "/" + friend_id).subscribe(block => {
            if (block.status == 2) {
                user = [];
                user.status = 4;
                this.blocked_friends = friend_id;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend blocked successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.getFriendList();
            }
        });
    }

    friendRequestReject(friend_id, user) {
        this.dataService.getData(this._dataUrlRejectFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user = [];
                user.status = 6;
                var n = noty({ text: '<div class="alert alert-danger"><p>Friend request rejected</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
            } else {
                var n = noty({ text: '<div class="alert alert-danger"><p>' + friends.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    acceptFriendRequest(friend_id, user) {
        this.dataService.getData(this._dataUrlApproveFriend + "/" + friend_id).subscribe(friends => {
            this.acceptFriendTitle.recepient = user;
            if (friends.status == 2) {
                user.status = 3;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend Request Accepted</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
                this.dataService.postData(this._acceptFriendNotification + friend_id + '/' + this.post_type.ACCEPTREQNOTIFY, this.acceptFriendTitle).subscribe(res => {
                });
            } else {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + friends.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    cancelRequestedFriend(friend_id, user) {
        this.dataService.getData(this._dataUrlCancelFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user = [];
                user.status = 6;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request Cancelled</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
            else {
                user.status = friends.friendStatus;
                var n = noty({ text: '<div class="alert alert-danger"><p>' + friends.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    friendRemove(friend_id, user) {
        this.dataService.getData(this._dataUrlRemoveFriend + "/" + friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user = [];
                user.status = 6;
                var n = noty({ text: '<div class="alert alert-danger"><p>Friend Removed</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
            } else {
                user.status = friends.friendStatus;
                var n = noty({ text: '<div class="alert alert-danger"><p>' + friends.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
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

    mytoggle(id: number) {
        this.page.setChatUserId(id);
        this.page.chatToggleGlobal = !this.page.chatToggleGlobal;
        var body = jQuery(this.elementRef.nativeElement).parents("body");
        var togg = this.page.chatToggleGlobal == true ? body.attr("class", "hold-transition skin-yellow-light sidebar-mini get-freeze") : body.attr("class", "hold-transition skin-yellow-light sidebar-mini");
    }
    public inviteFriends(): void {
        jQuery("#inviteFriendsModel4").modal({ backdrop: false });
        this.showinviteFriendsModel = true;
    }
    public oninviteFriendsModelClose(event: any): void {
        this.showinviteFriendsModel = false;
        jQuery('#inviteFriendsModel4').modal('hide');
    }
}




