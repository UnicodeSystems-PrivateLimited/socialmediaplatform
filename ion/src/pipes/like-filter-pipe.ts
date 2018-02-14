import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DataService } from '../providers/data-service';

/*
  Generated class for the LikeFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'likeFilterPipe'
})
@Injectable()
export class LikeFilterPipe implements PipeTransform {
  public count: Array<boolean> = [false];
  transform(likes: any[], postId: number): string {
    let userId = DataService.userid;
    if (likes.length > 0) {
      for (let i = 0; i < likes.length; i++) {
        if (likes[i].user_id._id == userId) {
          this.count[postId] = true;
          break;
        } else {
          this.count[postId] = false;
        }
      }
    } else {
      this.count[postId] = false;
    }
    // if (this.count[postId]) {
    //   return 'like icon icon-md ion-md-thumbs-up'
    // } else {
    //   return 'icon icon-md ion-md-thumbs-up';
    // }
    if (this.count[postId]) {
      return 'like-select.png';
    } else {
      return 'like.png';
    }
  }
}
