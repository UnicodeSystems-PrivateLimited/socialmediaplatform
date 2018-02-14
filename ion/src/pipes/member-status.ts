import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the MemberStatus pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'isMember'
})
@Injectable()
export class MemberStatus {
  transform(members: Array<any>, loggedId: number): boolean {
    let count = 0;
    for (let i in members) {
        if (members[i].user_id == loggedId) {
            count++;
            break;
        }
    }
    return count == 0 ? false : true;
}
}
