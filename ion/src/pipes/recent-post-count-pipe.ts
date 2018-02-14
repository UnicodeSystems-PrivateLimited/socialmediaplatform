import { Injectable, Pipe } from '@angular/core';
import { DataService } from '../providers/data-service';
/*
  Generated class for the CommentFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'recentPostCountPipe'
})
@Injectable()
export class RecentPostCountPipe {
  transform(posts: Array<any>, last_visit: Date, LoggedId: number): number {
    let recentPost = posts.filter(function (post) {
      return new Date(post.post_id.created_on).getTime() > new Date(last_visit).getTime() && post.created_by!=LoggedId;
    });
    return recentPost.length;
  }
}
