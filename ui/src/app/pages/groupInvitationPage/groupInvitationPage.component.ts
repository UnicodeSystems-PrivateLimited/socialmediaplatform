import { Component, ViewEncapsulation } from '@angular/core';
import { PageService } from '../../theme/services';
import { Router } from '@angular/router-deprecated';
import { GroupService } from '../group/group.service';



declare var require: any;

@Component({
    selector: 'group-invite',
    template: require('./groupInvitationPage.html'),
    pipes: [],
    providers: [GroupService]
})

export class GroupInvitationComponent {

    public counter: number = 0;
    public totalNotification: number = 0;
    public notificationList: Array<any> = [];
    public scrollController: number = 1;

    constructor(private router: Router, private pageService: PageService, private service: GroupService) {
        this.router = router;
    }

    ngOnInit() {
        this.getUserGroupNotification();
    }

    public getUserGroupNotification(): void {
        this.service.getUserGroupNotification(this.counter).subscribe((res) => {
            if (res.status == 2) {
                this.notificationList = res.data;
                this.totalNotification = res.tottal;
                this.scrollController = 1;
            }
        })
    }

    onScrollUserGroupNoti(event) {
        if (((jQuery(window).scrollTop() + jQuery(window).height()) >= (jQuery(document).height() - 50)) && (jQuery('#activity').css('display') !== 'none')) {
            if (this.scrollController) {
                this.scrollController = 0;
                let parsep = this.totalNotification / 20;
                let page = Math.round(parsep);
                if (this.counter <= (page)) {
                    this.counter++;
                    this.getUserGroupNotification();
                }
            }
        }
    }

    public onAcceptClick(noti: any): void {
        this.service.acceptInvite(noti.groupId._id, noti.from._id).subscribe((res) => {
            if (res.status == 2) {
                this.pageService.showSuccess(res.msg);
                this.pageService.wallId = noti.groupId._id;
                this.router.navigate(['GroupWallComponent', { id: noti.groupId._id }]);
            }
        });
    }
    public onRejectClick(noti: any): void {
        this.service.rejectInvite(noti.groupId._id, noti.from._id).subscribe((res) => {
            if (res.status == 2) {
                this.counter = 0;
                this.getUserGroupNotification();
                this.pageService.showSuccess(res.msg);
            }
        });
    }
}