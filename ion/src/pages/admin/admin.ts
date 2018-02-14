import { Component } from '@angular/core';
import { NavController, NavParams,ModalController } from 'ionic-angular';

import { LoginPage } from '../login/login';

import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
/*
  Generated class for the Admin page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html',
  providers: [UserService,CommonService,DataService,PageService]
})
export class AdminPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,public service: UserService, public commonService: CommonService, public pageService: PageService, public modalCtrl: ModalController) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminPage');
  }

  logout(){
  console.log("logout");
  // this.commonService.presentLoading();
  this.service.logout()
      .then((res) => {        
        console.log("response",res); 
        this.pageService.loggedInType=0;
        this.navCtrl.push(LoginPage);        
      }, (err) => {
        console.log('not found', err);
        
        this.commonService.showToast(err.msg);
      })
    }


}
