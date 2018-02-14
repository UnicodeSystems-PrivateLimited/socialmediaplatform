import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the DemoPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'groupSearchPipe'
})
@Injectable()
export class DemoPipe {
  /*
    Takes a value and makes it lowercase.
   */
   transform(list: any[], args: any): any {
        var val = args;

        return list.filter((list) => {
            if (val === undefined || val == null) {
                return (list.title);
            }
            else {
                return (list.title.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            }
        });
    }
}
