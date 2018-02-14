import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CommonService } from '../../providers/common-service';
import {
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapsLatLng,
  CameraPosition,
  GoogleMapsMarkerOptions,
  CallNumber,
  LaunchNavigator,
  SocialSharing,
  Calendar,
  Camera,
  Device,
} from 'ionic-native';
/*
  Generated class for the Contact page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  public toMail: string = 'admin@stribein.com';
  public fname: string;
  public from: string;
  public subject: string;
  public message: string;
  public map: GoogleMap;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private commonService: CommonService, ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactPage');
    this.loadMap();
  }

  public onSubmit() {
    SocialSharing.shareViaEmail(this.message, this.subject, [this.toMail]).then(() => {
      this.commonService.showToast('Thank you for contacting StribeIN. Please allow us some time to reconnect to address your  reason for connecting.Wish you have a wonderful day. Smile & Enjoy Life!');
      // this.navCtrl.pop();
      this.message = '';
      this.subject = '';
    }).catch(() => {
      console.log('Could not send mail');
    });
  }

  public loadMap(): void {
    this.map = new GoogleMap('map');
    let lat = 40.806678;
    let long = -74.103263;
    let latLong: GoogleMapsLatLng = new GoogleMapsLatLng(lat, long);
    this.map.clear();
    let position: CameraPosition = {
      target: latLong,
      zoom: 15,
    };
    let markerOptions: GoogleMapsMarkerOptions = {
      position: latLong
    };

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.map.moveCamera(position);
      this.map.addMarker(markerOptions);
      this.map.setOptions({
        controls: {
          zoom: true,
        }
      });
    }, err => {
      console.log(err);
    });
  }
}
