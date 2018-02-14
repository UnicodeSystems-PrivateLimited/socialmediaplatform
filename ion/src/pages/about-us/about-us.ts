import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
/*
  Generated class for the AboutUs page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-about-us',
  templateUrl: 'about-us.html'
})
export class AboutUsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private dataService: DataService) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutUsPage');
  }

}
