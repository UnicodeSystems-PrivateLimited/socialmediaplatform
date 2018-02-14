import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MyWallPage } from '../my-wall/my-wall';
// import { AdminPage } from '../admin/admin';
// import { MyProfilePage } from '../my-profile/my-profile';

/*
  Generated class for the Tabs page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

    // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = MyWallPage;
  tab2Root: any = MyWallPage;
  tab3Root: any = MyWallPage;
  tab4Root: any = MyWallPage;
  tab5Root: any = MyWallPage;
  tab6Root: any = MyWallPage;
  tab7Root: any = MyWallPage;

  tabToShow: Array<boolean> = [true, true, true, true, true, true, true, true, true];
  scrollableTabsopts: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }
  

}
