import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the MemberSearchPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
    name: 'membersearchpipe'
})
@Injectable()
export class MemberSearchPipe {
    /*
      Takes a value and makes it lowercase.
     */
    transform(list: any[], args: any): any {
        var val = args;

        return list.filter((list) => {
            if (val === undefined || val == null) {
                return true;
            }
            else {
                if (list.name) {
                    return (list.name.toLowerCase().indexOf(val.toLowerCase()) !== -1);
                } else {
                    return ((list.fname + '' + list.lname).toLowerCase().indexOf(val.toLowerCase()) !== -1);
                }
            }
        });
    }
}
