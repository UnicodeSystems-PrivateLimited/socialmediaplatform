import { Injectable, Pipe } from '@angular/core';
import moment from 'moment';
/*
  Generated class for the DateTimeFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'datetimefilterpipe'
})
@Injectable()
export class DateTimeFilterPipe {
  transform(date): string {
    let currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    let postCreatedDate = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate());
    if (moment(currentDate).isAfter(postCreatedDate)) {
      return moment(date).format('D MMMM YYYY') + " at " + moment(date).format('hh:mm a');
    } else {
      return moment(date).calendar();
    }
  }
}