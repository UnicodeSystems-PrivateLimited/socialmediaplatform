import { Injectable, Pipe } from '@angular/core';
import { DataService } from '../providers/data-service';


/*
  Generated class for the GetSCDJoinStatusFlter pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'getscdjoinstatusflter'
})
@Injectable()
export class GetSCDJoinStatusFlter {
  /*
    Takes a value and makes it lowercase.
   */
  transform(members: any): string {
    let userId = DataService.userid;
    let joined = '';
    if (members.length) {
      for (let member of members) {
        if (member.user_id == userId) {
          joined = 'Joined';
          break;
        }
      }
    }
    return joined;
  }

}
