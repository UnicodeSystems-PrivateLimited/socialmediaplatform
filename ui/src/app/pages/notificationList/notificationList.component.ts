import { Component, ViewEncapsulation } from '@angular/core';
import { PageService, GridDataService } from '../../theme/services';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DateTime} from '../../theme/pipes';
import {  SinglePostComponent } from '../../theme/components';
import { ProfileAssetDetailsComponent } from '../profileAssetDetails';



declare var require: any;
declare var jQuery: any;

@Component({
    selector: 'notification-list',
    template: require('./notificationList.html'),
    pipes: [DateTime],
    directives: [RouterLink, RouterOutlet, ROUTER_DIRECTIVES, SinglePostComponent, ProfileAssetDetailsComponent],
    providers: []
})

export class NotificationListComponent {

    private _getAllFriendNotisUrl = '/api/notification/getAllFriendRequestNoti';
    private _notificationDataUrl = 'api/notification/getAllNotification';
    private _changeFriendNotificationstatus = 'api/notification/changeFriendRequestNotificationstatus'
    private _getUnreadFriendNotificationCount = 'api/notification/getFriendRequestNotification';
    private _changeNotificationstatus = 'api/notification/changeNotificationstatus';
    private _getUnreadNotificationCount = 'api/notification/getNotification';
    private _headerDataUrl = '/api/user/getHeaderData';

    public counter: number = 0;
    public friendRequestnotificationData: Array<any> = [];
    public notificationData: Array<any> = [];
    public totalNotification: number = 0;
    public notitype: number = 1;
    public scrollController: number = 1;
    public router: Router;
    public postId: number = null;
    public showSinglePostModel: boolean = false;
    public dialogState: boolean = false;

    constructor(router: Router, private pageService: PageService, private routeParams: RouteParams, private dataService: GridDataService) {
        this.router = router;
        this.notitype = +this.routeParams.get('type');
    }

    ngOnInit() {
        if (this.notitype == 1) {
            this.getAllFriendNotifications();
        } else if (this.notitype == 2) {
            this.getAllNotifications();
        }
    }

    public getAllNotifications() {
        this.dataService.getData(this._notificationDataUrl + '/' + this.counter).subscribe(res => {
            if (res.status == 2) {
                if (this.notificationData.length) {
                    this.notificationData = this.notificationData.concat(res.data);
                } else {
                    this.notificationData = res.data;
                }
                this.totalNotification = res.total;
                this.scrollController = 1;
            }
        });
    }
    public getAllFriendNotifications() {
        this.dataService.getData(this._getAllFriendNotisUrl + '/' + this.counter).subscribe((res) => {
            if (res.status == 2) {
                if (this.friendRequestnotificationData.length) {
                    this.friendRequestnotificationData = this.friendRequestnotificationData.concat(res.data);
                } else {
                    this.friendRequestnotificationData = res.data;
                }
                this.totalNotification = res.total;
                this.scrollController = 1;
            }
        });
    }

    public changeFriendNoficationStatus(friendId, notifId) {
        this.dataService.getData(this._changeFriendNotificationstatus + '/' + friendId).subscribe((res) => {
            if (res.status == 2) {
                this.updateFriendNotificationCount();
                this.updateFriendNotificationStatus(notifId);
            }
        });
    }
    public updateFriendNotificationCount() {
        this.dataService.getData(this._getUnreadFriendNotificationCount).subscribe((res) => {
            if (res.status == 2) {
                this.pageService.friendRequestnotificationData = res.data;
            }
        })
    }
    public updateFriendNotificationStatus(notifId: number) {
        for (let i in this.friendRequestnotificationData) {
            if (this.friendRequestnotificationData[i]._id == notifId) {
                this.friendRequestnotificationData[i].is_viewed = 1;
                break;
            }
        }
    }

    public onScrollFriendNoti() {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#activity').css('display') !== 'none')) {
            if (this.scrollController) {
                this.scrollController = 0;
                let parsep = this.totalNotification / 10;
                let page = Math.round(parsep);
                if (this.counter <= (page)) {
                    this.counter++;
                    this.getAllFriendNotifications();
                }
            }
        }
    }
    public onScrollNoti() {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#activity').css('display') !== 'none')) {
            if (this.scrollController) {
                this.scrollController = 0;
                let parsep = this.totalNotification / 10;
                let page = Math.round(parsep);
                if (this.counter <= (page)) {
                    this.counter++;
                    this.getAllNotifications();
                }
            }
        }
    }
    public arriveNotification(notification) {

        this.changeNoficationStatus(notification._id);
        if (notification.post_type == 9) {
            this.getSubjectWall(notification.subject_id._id);
        }
        if (notification.post_type == 10) {
            this.getCollegeWall(notification.college_id._id);
        }
        if (notification.post_type == 11) {
            this.getDegreeWall(notification.degree_id._id);
        }
        if (notification.post_type == 5) {
            this.pageService.setIsGroupChatNotiStatus(true);
        }
        if (notification.post_type == 12) {
            if (notification.post_id.post_type == 1 || notification.post_id.post_type == 2 || notification.post_id.post_type == 5 || notification.post_id.post_type == 7 || notification.post_id.post_type == 8) {
                this.singlePost(notification.post_id._id);
            } else {
                this.getDetailView(notification.post_id._id);
            }

        }

    }
    public changeNoficationStatus(notifId) {
        this.dataService.getData(this._changeNotificationstatus + '/' + notifId).subscribe(res => {
            if (res.status == 2) {
                this.updateNotificationCount();
                this.updateNotificationStatus(notifId);
            }
        });
    }
    public updateNotificationStatus(notifId: number) {
        for (let i in this.notificationData) {
            if (this.notificationData[i]._id == notifId) {
                this.notificationData[i].is_viewed = 1;
                break;
            }
        }
    }
    public updateNotificationCount() {
        this.dataService.getData(this._getUnreadNotificationCount).subscribe((res) => {
            if (res.status == 2) {
                this.pageService.notificationData = res.data;
            }
        })
    }

    public getSubjectWall(id) {
        this.pageService.wallId = id;
        this.pageService.join = 0;
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            for (var i = 0; i < header.data.subjects.length; i++) {
                if (header.data.subjects[i].subject_id._id == id) {
                    this.pageService.join = 1;
                }
            }
        });
        var random_no = Math.floor(Math.random() * 100);
        this.router.navigate(['SubjectWallComponent', { subjectId: id, random: random_no }]);
    }

    public getCollegeWall(id) {
        this.pageService.wallId = id;
        this.pageService.join = 0;
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            for (var i = 0; i < header.data.college.length; i++) {
                if (header.data.college[i].college_id._id == id) {
                    this.pageService.join = 1;
                }
            }
        });
        var random_no = Math.floor(Math.random() * 100);
        this.router.navigate(['CollegeWall', { collegeId: id, random: random_no }]);
    }
    public getDegreeWall(id) {
        this.pageService.wallId = id;
        this.pageService.join = 0;
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
            for (var i = 0; i < header.data.degree.length; i++) {
                if (header.data.degree[i].degree_id._id == id) {
                    this.pageService.join = 1;
                }
            }
        });
        var random_no = Math.floor(Math.random() * 100);
        this.router.navigate(['BachelorView', { degreeId: id, random: random_no }]);
    }

    public singlePost(id): void {
        this.postId = id;
        jQuery("#singlePostNotiModel").modal({ backdrop: false });
        this.showSinglePostModel = true;
    }
    public closeSinglePostDialog(): void {
        this.showSinglePostModel = false;
        jQuery("#singlePostNotiModel").modal('hide');
    }
    public getDetailView(id): void {
        this.postId = id;
        this.dialogState = true;
        jQuery("#profile-page-Asset-detail-noti-Modal").modal({ backdrop: false });
    }
    public closeImageDialog(): void {
        this.dialogState = false;
        jQuery("#profile-page-Asset-detail-noti-Modal").modal('hide');
    }
}