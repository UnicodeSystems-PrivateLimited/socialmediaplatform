import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';

import { RegisterPage } from '../register/register';

/*
  Generated class for the ForgotPassword page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
  providers: [UserService, CommonService, DataService, PageService]
})
export class ForgotPasswordPage {

  private forget = { email: "" };
  private forgetForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, public service: UserService, public commonService: CommonService, public pageService: PageService, public modalCtrl: ModalController, private formBuilder: FormBuilder,private dataService:DataService) {

    this.forgetForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      ])],
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage');
  }



  forgetPassword() {
    console.log("forgetPassword", this.forget);
    this.service.forgetPassword(this.forget)
      .then((res) => {
        console.log("response", res);
        this.commonService.showToast(res['msg']);
        this.forget.email = "";
      }, (err) => {
        console.log('not found', err);
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  goToRegisterPage() {
    //   this.commonService.presentLoading();
    console.log("goToRegisterPage");
    this.navCtrl.push(RegisterPage);
  }


}
