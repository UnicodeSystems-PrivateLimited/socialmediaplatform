import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the FriendSearchPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'friendsearchpipe'
})
export class FriendSearchPipe {
  /*
    Takes a value and makes it lowercase.
   */
  transform(list: any[], args: any): any {
    var val = args;
    return list.filter((friend) => {
      if (val === undefined || val == null) {
        return true;
      }
      else {
        if (friend.user.lname) {
          return ((friend.user.fname + '' + friend.user.lname).toLowerCase().indexOf(val.toLowerCase()) !== -1);
        } else {
          return (friend.user.fname.toLowerCase().indexOf(val.toLowerCase()) !== -1);
        }
      }
    });
  }
}
