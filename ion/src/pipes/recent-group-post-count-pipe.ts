import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the RecentGroupPostCountPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'recentGroupPostCountPipe'
})
@Injectable()
export class RecentGroupPostCountPipe {
  transform(posts: any, type: number, loggedId: number): number {
    let recentPost = [];
    if (type == 1) {
      recentPost = posts.subject_id.post.filter((post) => {
        return new Date(post.post_id.created_on).getTime() > new Date(posts.last_visit).getTime() && post.created_by != loggedId;
      });
    } else if (type == 2) {
      recentPost = posts.college_id.post.filter((post) => {
        return new Date(post.post_id.created_on).getTime() > new Date(posts.last_visit).getTime() && post.created_by != loggedId;
      });
    } else if (type == 3) {
      recentPost = posts.degree_id.post.filter((post) => {
        return new Date(post.post_id.created_on).getTime() > new Date(posts.last_visit).getTime() && post.created_by != loggedId;
      });
    } else if (type == 4) {
      let visitedData = posts.members.filter((member) => {
        return member.user_id == loggedId;
      });
      if (visitedData.length) {
        recentPost = posts.post.filter((post) => {
          return new Date(post.post_id.created_on).getTime() > new Date(visitedData[0].last_visit).getTime() && post.created_by._id != loggedId;
        });
      }
    }

    return recentPost.length;
  }
}
