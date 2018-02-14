import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Splashscreen } from 'ionic-native';

/*
  Generated class for the Slider page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-slider',
  templateUrl: 'slider.html'
})
export class SliderPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
  ) { 
  
  }

  ionViewDidLoad() {
    Splashscreen.hide();
  }


  public onClickSkip() {
    this.navCtrl.setRoot(LoginPage);
  }
}
