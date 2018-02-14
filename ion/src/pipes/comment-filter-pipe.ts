import { Injectable, Pipe } from '@angular/core';
import { DataService } from '../providers/data-service';
/*
  Generated class for the CommentFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'commentFilterPipe'
})
@Injectable()
export class CommentFilterPipe {
   public count: Array<boolean> = [false];
  transform(comments: any[], postId: number): string {
    let userId = DataService.userid;
    if (comments.length > 0) {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].comment_by._id == userId) {
          this.count[postId] = true;
          break;
        } else {
          this.count[postId] = false;
        }
      }
    } else {
      this.count[postId] = false;
    }
    if (this.count[postId]) {
      return 'fa fa-commenting color-orange';
    } else {
      return 'fa fa-commenting';
    }
  }
}
