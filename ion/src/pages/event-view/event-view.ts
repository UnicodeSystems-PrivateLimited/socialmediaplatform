import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the EventView page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-event-view',
  templateUrl: 'event-view.html'
})
export class EventViewPage {

  public filteractive = [];
  public viewTab: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventViewPage');
    this.filteractive[0] = true;
    for (var i = 1; i <= 6; i++) {
      this.filteractive[i] = false;
    }
  }

  hidetab() {
    this.viewTab = !this.viewTab;
  }

}
