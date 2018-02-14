import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { DataService } from '../../providers/data-service';
import { CommonService } from '../../providers/common-service';
import { CheckWallService } from '../../providers/check-wall-service';
import { FriendProfilePage } from '../friend-profile/friend-profile';
import { TimelinePage } from '../timeline/timeline';
import { InvitePage } from '../invite/invite';

/*
  Generated class for the Members page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-members',
  templateUrl: 'members.html'
})
export class MembersPage {
  public tab: string = 'friends';
  public loader: boolean = false;
  public friends: Array<any> = [];
  public members: Array<any> = [];
  public addFriendTitle = { title: 'has sent you a friend request.', recepient: [] };
  private post_type = {
    SENDREQ: 0,
  };
  public scrollCounter: number = 0;
  public scrollControllerMember: number = 1;
  public total_member: any = 0;
  public prepage: any;
  public memberSearchName: string = null;
  public selectedMemberType: number = 1;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userService: UserService,
    private dataService: DataService,
    private commonService: CommonService,
    private checkWallService: CheckWallService) {
    if (navParams.data.tab) {
      this.tab = navParams.data.tab;
    }
    this.checkWallService.setInviteActiveWall(0);

  }

  ionViewDidLoad() {
    this.getFriendAndRequestList();
    this.getMemberList(0);
  }

  public getFriendAndRequestList(): void {
    this.loader = true;
    this.userService.getAllTypeFriends().then(res => {
      if (res.status == 2) {
        this.friends = res.data;
      }
      this.loader = false;
    });
  }

  public getProfileById(id): void {
    if (id == DataService.userid) {
      this.navCtrl.push(TimelinePage)
    }
    else {
      this.navCtrl.push(FriendProfilePage, { userId: id });
    }
  }

  public friendRemove(friend_id, user): void {
    this.userService.friendRemove(friend_id)
      .then(res => {
        if (res.status == 2) {
          user.status = 6;
          this.commonService.showToast('Friend Removed');
          this.getFriendAndRequestList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public blockFriend(friend_id, user): void {
    this.userService.blockFriend(friend_id)
      .then(res => {
        if (res.status == 2) {
          user.status = 4;
          this.commonService.showToast('Friend blocked successfully');
          this.getFriendAndRequestList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public unblockFriend(friend_id, user): void {
    this.userService.unblockFriend(friend_id)
      .then(res => {
        if (res.status == 2) {
          user.status = 6;
          this.commonService.showToast('Friend unblocked successfully');
          this.getFriendAndRequestList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  public acceptFriendRequest(friend_id, user): void {
    this.userService.acceptFriendRequest(friend_id)
      .then(res => {
        if (res.status == 2) {
          user.status = 3;
          this.commonService.showToast('Friend Request Accepted');
          this.getFriendAndRequestList();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public friendRequestReject(friend_id, user): void {
    this.userService.friendRequestReject(friend_id)
      .then(res => {
        if (res.status == 2) {
          user.status = 6;
          this.commonService.showToast('Friend Request rejected');
          this.getFriendAndRequestList();
        }

      })
      .catch((err) => {
        console.log(err);
      });
  }

  public getMemberList(counter): void {
    this.userService.getMemberList(counter, this.selectedMemberType).subscribe((res) => {
      if (res.status == 2) {
        if (this.members) {
          this.members = res.members;
        }
        this.total_member = res.userCount;
        this.scrollControllerMember = 1;
      }
    });
  }

  public addAsFriend(id, member, index): void {
    this.userService.addAsFriend(id).then(res => {
      if (res.status == 2) {
        this.commonService.showToast('Friend request sent');
        this.userService.addFriendNoti(id, this.post_type.SENDREQ, this.addFriendTitle).subscribe(res => {
        });
        this.members.splice(index, 1);
      }
      else {
        member.status = 6;
        this.commonService.showToast(res.msg);
      }
    });
  }
  public setFollow(member, id): void {
    this.userService.setFollow(id).subscribe(res => {
      if (res.status == 2) {
        member.followingStatus = 3;
      }
    });
  }
  public setUnFollow(member, id): void {
    this.userService.setUnfollow(id).subscribe(res => {
      if (res.status == 2) {
        member.followingStatus = 6;
      }
    });
  }
  public doInfinite(event: any): void {
    if (this.scrollControllerMember) {
      this.scrollControllerMember = 0;
      this.prepage = this.total_member / 20;
      let page = parseInt(this.prepage);
      this.scrollCounter++;
      if (this.scrollCounter <= (page + 1)) {
        this.userService.getMemberList(this.scrollCounter, this.selectedMemberType).subscribe((res) => {
          if (res.status == 2) {
            if (this.members.length) {
              this.members = this.members.concat(res.members);
            }
            this.total_member = res.userCount;
            this.scrollControllerMember = 1;
          }
        });
      }
    }
    setTimeout(() => {
      event.complete();
    }, 500);
  }

  inviteFriends() {
    this.navCtrl.push(InvitePage);
  }

  onChangeMember(event) {
    this.selectedMemberType = event;
    this.getMemberList(0);
  }
}
