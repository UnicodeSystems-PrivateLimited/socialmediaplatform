import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MyWallService } from '../../providers/my-wall-service';
import { DataService } from '../../providers/data-service';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';

/*
  Generated class for the MorePopoverPost page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-more-popover-post',
  templateUrl: 'more-popover-post.html'
})
export class MorePopoverPostPage {
  public data: any;
  public userId: number;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private myWallService: MyWallService,
    private dataService: DataService) {
    this.userId = DataService.userid;
    this.data = navParams.data.data;
    console.log(this.data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MorePopoverPostPage');
  }


  gotoJournal(posts) {
    this.navCtrl.push(PostInJournalPage, { posts: posts });
    
  }
}
