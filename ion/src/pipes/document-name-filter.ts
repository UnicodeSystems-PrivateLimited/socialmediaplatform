import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the DocumentNameFilter pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'documentNameFilter'
})
@Injectable()
export class DocumentNameFilter {
  /*
    Takes a value and makes it lowercase.
   */
  transform(input:string): string {
    if(input){
        var name = input.slice(0,input.lastIndexOf('-'))+""+input.slice(input.lastIndexOf('.'),input.length);
        return name;
    }
    else{
        return input;
    }
  }
}