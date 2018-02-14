import { Injectable, Pipe } from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
/*
  Generated class for the YoutubeSafeUrl pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'youtubeSafeUrl'
})
@Injectable()
export class YoutubeSafeUrl {
    constructor(private sanitizer: DomSanitizer){

  }
  transform(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?autoplay=0`);
  }
}