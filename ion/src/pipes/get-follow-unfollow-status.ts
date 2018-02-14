import { Injectable, Pipe } from '@angular/core';
import { GetFollowUnfollowService } from '../providers/get-follow-unfollow-service';

/*
  Generated class for the GetFollowUnfollowStatus pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'followunfollowstatus',
  pure:false
})
@Injectable()
export class GetFollowUnfollowStatus {
  public staticFollowerList: typeof GetFollowUnfollowService = GetFollowUnfollowService;
  constructor(private service: GetFollowUnfollowService) {

  }
  transform(id: number): boolean {
    if (this.staticFollowerList.userFollowersList.indexOf(id) > -1) {
      return true;
    } else {
      return false;
    }
  }
}
