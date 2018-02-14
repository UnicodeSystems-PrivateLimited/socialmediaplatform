import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { EventViewPage } from '../event-view/event-view';
import { EventAddPage } from '../event-add/event-add';

/*
  Generated class for the Events page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {

  public tab: string = "myEvent";
  isAndroid: boolean = false;
  public eventAction = 1;
  public accordian: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, platform: Platform) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventsPage');
  }

  openeventview(){
    this.navCtrl.push(EventViewPage);
  }

  openAddEvent(){
    this.navCtrl.push(EventAddPage);
  }

  advancesearch() {
    this.accordian = !this.accordian;
  }

}
