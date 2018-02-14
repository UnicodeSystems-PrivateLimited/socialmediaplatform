import { Component, ViewEncapsulation, Input, ElementRef, ViewChildren } from '@angular/core';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { MemberFilterPipe } from '../../theme/pipes';
import { GridDataService, PageService } from '../../theme/services';
import { InviteFriendsModel } from '../../theme/components';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { ProfileAssetDetailsComponent } from '../profileAssetDetails';
import { Post, PostComment } from '../../theme/interfaces';
import { EventWallService } from '../eventWall/eventWall.service';

declare var jQuery: any;
declare var noty: any;
declare var require: any;
declare var FB: any;

@Component({
    selector: 'member-list',
    template: require('./memberList.html'),
    pipes: [DateFormatPipe, MemberFilterPipe],
    providers: [EventWallService],
    directives: [RouterOutlet, ROUTER_DIRECTIVES, RouterLink, TOOLTIP_DIRECTIVES, InviteFriendsModel]
})

export class MemberListComponent {
    public friends = [];
    public members: Array<any> = [];
    public tAll = true;
    public tPending = false;
    public tMembers = false;
    router: Router;
    public _userSearchUrl = '/api/user/userSearch';
    public userSearchField = { name: "", status: "" };
    public userSearchList: Array<any> = [];
    public counter: number = 0;
    public scrollActive: boolean = true;
    public loader: boolean = false;
    public currentFriendTab: boolean = false;
    public pendingFriendTab: boolean = false;
    public memberSearch: string;
    public msg: string;
    public member = {};
    public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
    private post_type = {
        SENDREQ: 0,
        ACCEPTREQNOTIFY: 3,
    };
    public _acceptFriendNotification = '/api/notification/addNotification/';
    public acceptFriendTitle = { title: 'has accepted your friend request', recepient: [] };
    public showinviteFriendsModel: boolean = false;
    public tabType: any;
    public showLoader: boolean = false;
    public showMemberDropDown: Array<any> = [{ label: 'All Members', value: 1 }, { label: 'Followers', value: 2 }, { label: 'Me Following', value: 3 }];
    public selectedMemberType: number = 1;
    public totalMembers: number = null;
    public parseVar: any;
    constructor(private dataService: GridDataService,
        private page: PageService,
        private service: EventWallService,
        private routeParams: RouteParams,
        router: Router) {
        this.router = router;
        this.tabType = routeParams.get('tab');
    }

    ngOnInit() {
        if (this.tabType == 3) {
            this.tAll = false;
            this.tPending = false;
            this.tMembers = true;
            this.getMembersList();
        } else if (this.tabType == 2) {
            this.tAll = false;
            this.tPending = true;
            this.tMembers = false;
        }
        this.getFriendList();
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
    }

    onTabclick(tabType) {
        if (tabType == 1) {
            this.tAll = true;
            this.tPending = false;
            this.tMembers = false;
        } else if (tabType == 2) {
            this.tPending = true;
            this.tAll = false;
            this.tMembers = false;
        } else {
            this.tAll = false;
            this.tPending = false;
            this.tMembers = true;
            this.getMembersList();
        }
    }

    getFriendList() {
        this.loader = true;
        this.showLoader = true;
        this.service.getFriendList().subscribe(
            user => {
                this.friends = user.data;
                if (!user.data.current.length) {
                    this.currentFriendTab = true;
                }
                if (!user.data.pending.length) {
                    this.pendingFriendTab = true;
                }
                this.loader = false;
                this.showLoader = false;
            }
        );
    }

    getMembersList() {
        this.loader = true;
        this.service.getMemberList(this.counter, this.selectedMemberType).subscribe(
            res => {
                if (res.status == 2) {
                    this.members = res.members;
                    this.totalMembers = res.userCount;
                }
                this.loader = false;
            }
        );
    }

    friendRemove(friend_id, user) {
        this.service.unfriend(friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user = [];
                user.status = 6;
                var n = noty({ text: '<div class="alert alert-danger"><p>Friend Removed</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    unblockFriend(friend_id, user) {
        this.service.unblockFriend(friend_id).subscribe(unblock => {
            if (unblock.status == 2) {
                user.status = 6;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend unblocked successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    blockFriend(friend_id, user) {
        this.service.blockFriend(friend_id).subscribe(block => {
            if (block.status == 2) {
                user = [];
                user.status = 4;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend blocked successfully</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.getFriendList();
            }
        });
    }

    acceptFriendRequest(friend_id, user) {
        this.service.acceptFriendRequest(friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user.status = 3;
                this.dataService.postData(this._acceptFriendNotification + friend_id + '/' + this.post_type.ACCEPTREQNOTIFY, this.acceptFriendTitle).subscribe(res => {
                });
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend Request Accepted</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    cancelRequestedFriend(friend_id, member) {
        this.service.cancleFriendRequest(friend_id).subscribe(friends => {
            if (friends.status == 2) {
                member.status = 6;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request Cancelled</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    friendRequestReject(friend_id, user) {
        this.service.rejectFriendRequest(friend_id).subscribe(friends => {
            if (friends.status == 2) {
                user = [];
                user.status = 6;
                var n = noty({ text: '<div class="alert alert-danger"><p>Friend request rejected</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated bounceInLeft', close: 'animated bounceOutDown' }, timeout: 3000, });
                this.getFriendList();
            }
        });
    }

    addAsFriend(id, member, index) {
        this.counter = 0;
        this.service.addFriend(id).subscribe(res => {
            if (res.status == 2) {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Friend request sent</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                this.service.addFriendNoti(id, this.post_type.SENDREQ, this.addFriendTitle).subscribe(res => {
                });
                this.getMembersList();
            }
            else {
                member.status = 6;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + res.msg + '</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
            }
        });
    }

    setFollow(member, id) {
        this.member = member;
        this.service.setFollow(id).subscribe(res => {
            if (res.status == 2) {
                this.msg = res.msg;
                member.followingStatus = 3;
            } else this.msg = 'error';
        });
    }
    setUnFollow(member, id) {
        this.member = member;
        this.service.setUnfollow(id).subscribe(res => {
            if (res.status == 2) {
                this.msg = res.msg;
                member.followingStatus = 6;
            } else this.msg = 'error';
        });
    }

    getProfileById(id) {
        this.userSearchList = [];
        this.page.friendProfileId = id;
        this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
    }

    userSearch() {
        if (this.userSearchField.name == '' || this.userSearchField.name == null) {
            this.userSearchList = [];
        }
        else {
            var nameValid = /^[a-z\d\-_\s]+$/i;
            if (this.userSearchField.name.match(nameValid)) {
                this.dataService.postData(this._userSearchUrl, this.userSearchField)
                    .subscribe(res => {
                        if (res.status === 2) {
                            this.userSearchList = res.data;
                        } else {
                            this.userSearchList = [];
                        }
                    });
            }
        }
    }

    onScroll(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50))) {
            if (this.scrollActive) {
                this.scrollActive = false;
                this.parseVar = this.totalMembers / 20;
                var page = parseInt(this.parseVar);
                this.counter++;
                if (this.counter <= page) {
                    this.loader = true;
                    this.service.getMemberList(this.counter, this.selectedMemberType).subscribe(
                        res => {
                            if (res.status == 2) {
                                this.members = this.members.concat(res.members);
                                this.totalMembers = res.userCount;
                                this.scrollActive = true;
                            }
                            this.loader = false;
                        }
                    );
                }
            }
        }
    }

    public inviteFriends(): void {
        jQuery("#inviteFriendsModel1").modal({ backdrop: false });
        this.showinviteFriendsModel = true;
    }
    public oninviteFriendsModelClose(event: any): void {
        this.showinviteFriendsModel = false;
        jQuery('#inviteFriendsModel1').modal('hide');
    }
    public onChangeMember(option: any) {
        this.selectedMemberType = option.value;
        this.counter = 0;
        this.getMembersList();
    }
}