import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MyWallPage } from '../my-wall/my-wall';
import {SubjectPage} from '../subject/subject';

/*
  Generated class for the SubjectpageTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-subjectpage-tab',
  templateUrl: 'subjectpage-tab.html',
  
})
export class SubjectpageTabPage {

  tab1Root: any;
  tab2Root: any = MyWallPage;
  tab3Root: any = MyWallPage;
  tab4Root: any = MyWallPage;
  tab5Root: any = MyWallPage;

  tabToShow: Array<boolean> = [true, true, true, true, true];
  scrollableTabsopts: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }

}
