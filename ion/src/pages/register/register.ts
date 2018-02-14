import { Component } from '@angular/core';
import { NavController, NavParams,ModalController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { LoginPage } from '../login/login';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';

import { MyProfilePage } from '../my-profile/my-profile';
import { AdminPage } from '../admin/admin';
import { Facebook, GooglePlus, Splashscreen } from 'ionic-native';
import {CountaryNameModalPage } from '../countary-name-modal/countary-name-modal';
import { TermPage } from '../term/term';

/*
  Generated class for the Register page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  providers: [UserService, CommonService, DataService, PageService]
})
export class RegisterPage {

  FB_APP_ID: number = 996536043767719;
  private register = { fname: "", email: "", password: "", subjects: [], colleges: [], degrees: [], dob: null, gender: "", postalCode: null, mobile_no: null };
  public user = { email: "", password: "", agree: true, loggedInType: '', newUserOneTimelogin: 1 };
  private registerForm: FormGroup;
  public loader: boolean = false;
  public term: boolean = false;

  constructor(public navCtrl: NavController,private modalCtrl:ModalController, public navParams: NavParams, public service: UserService, public commonService: CommonService, public pageService: PageService, private formBuilder: FormBuilder, private dataService: DataService) {
    Facebook.browserInit(this.FB_APP_ID);
    this.registerForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      ])],
      password: ['', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
      ])],
      fname: ['', Validators.compose([
        Validators.required,
      ])],
      dob: ['', Validators.compose([
        // Validators.required,
      ])],
      gender: ['', Validators.compose([
        // Validators.required,
      ])],
      postalCode: ['', Validators.compose([
        // Validators.minLength(6),
        // Validators.pattern(/^\d{6}$/)
      ])],
      mobile_no: ['', Validators.compose([
        Validators.minLength(6),
        // Validators.pattern(/^\d{20}$/)
      ])],
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  goBack() {
    this.navCtrl.pop();
  }

  goToloign() {
    this.navCtrl.push(LoginPage);
  }


  login(type) {
    this.user.loggedInType = type;
    this.user.email = (this.user.email).toLowerCase();
    this.service.login(this.user)
      .then((res) => {
        console.log("response", res);
        console.log('login success type' + type);
        if (res['status'] == 1 && res['type'] == 1) {
          this.loader = false;
          this.navCtrl.setRoot(MyProfilePage, { type: 1 });
        } else if (res['status'] == 1 && res['type'] == 2) {
          this.loader = false;
          this.navCtrl.setRoot(AdminPage);
        }
      }, (err) => {
        this.loader = false;
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  userRegister() {
    this.loader = true;
    this.register.email = (this.register.email).toLowerCase();
    console.log(this.register);
    this.service.register(this.register)
      .then((res) => {
        if (res.status === 1) {
          this.loader = false;
          this.navCtrl.setRoot(MyProfilePage, { type: 1 });
        } else if (res.status === 2) {
          this.commonService.showToast(res.msg);
          this.user.email = res['newUser'].local.email;
          this.user.password = this.register.password;
          this.login('');
        }
      }, (err) => {
        this.loader = false;
        this.commonService.showToast(err.msg);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  facebookSignIn() {
    let self = this;
    Facebook.getLoginStatus()
      .then((success) => {
        console.log('success+++++', success);
        if (success.status === 'connected') {
          // Check if we have our user saved
          let user = self.service.getSavedUser();
          console.log('user data', user);
          self.service.getIonicStoredUser()
            .then((userSavedData) => {
              user = user ? user : userSavedData ? JSON.parse(userSavedData) : null;
              console.log('user data+++', user);
              if (user == null) {
                self.getFacebookProfileInfo(success.authResponse)
                  .then((profileInfo) => {
                    console.log('profileInfo');
                    console.log(profileInfo);
                    this.loader = true;
                    self.service.setUser({
                      id: profileInfo.id,
                      name: profileInfo.name,
                      fname: profileInfo.givenName,
                      lname: profileInfo.familyName,
                      email: profileInfo.email,
                      accessToken: success.authResponse.accessToken,
                      photo: profileInfo.picture ? profileInfo.picture.data ? profileInfo.picture.data.url : '' : '',
                      type: 'facebook'
                    }).then((success) => {
                      console.log('authorized id not found facebook' + JSON.stringify(success))
                      self.user = success;
                      this.loader = false;
                      self.login('facebook');
                    })
                      .catch((err) => {
                        this.loader = false;
                        console.log('err', err)
                      })
                  })
                  .catch((fail) => {
                    this.loader = false;
                    console.log('profile info fail', fail);
                  });
              } else {
                self.user.email = user.email;
                self.user.password = user.password;
                self.user.loggedInType = user.loggedInType;
                this.loader = false;
                self.login('facebook');
              }
            });
        } else {
          console.log('getLoginStatus', success.status);
          Facebook.login(['email', 'public_profile'])
            .then((response) => {

              if (!response.authResponse) {
                console.log("Cannot find the authResponse");
                return;
              }

              let authResponse = response.authResponse;
              self.getFacebookProfileInfo(authResponse)
                .then((profileInfo) => {
                  console.log('profileInfo fbLoginSuccess');
                  console.log(profileInfo);
                  this.loader = true;
                  self.service.setUser({
                    id: profileInfo.id,
                    name: profileInfo.name,
                    fname: profileInfo.givenName,
                    lname: profileInfo.familyName,
                    email: profileInfo.email,
                    accessToken: authResponse.accessToken,
                    photo: profileInfo.picture ? profileInfo.picture.data ? profileInfo.picture.data.url : '' : '',
                    type: 'facebook'
                  }).then((success) => {
                    this.loader = false;
                    console.log('first time facebook', JSON.stringify(success))
                    self.user = success;

                    self.login('facebook');
                  })
                    .catch((err) => {
                      this.loader = false;
                      self.commonService.showToast('err ++++++++++++' + err)
                    })
                })
                .catch((fail) => {
                  this.loader = false;
                  console.log('profile info fail ', fail);
                });
            })
            .catch((error) => {

              console.log('fbLoginError ', error);
            });
        }
      })
      .catch((fail) => {

        console.log('profile info fail ', fail);
      });
  };

  getFacebookProfileInfo(authResponse): any {
    let p = new Promise((resolve, reject) => {
      Facebook.api('/me?fields=email,name,picture.type(large)&access_token=' + authResponse.accessToken, null)
        .then((profileInfo) => {
          console.log('JSON.stringify(profileInfo)');
          console.log(JSON.stringify(profileInfo));
          resolve(profileInfo);
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
          reject(err);
        });
    });
    return p;
  };

  googlePlusSignIn() {
    let self = this;
    GooglePlus.login(
      {
        scope: 'profile https://www.googleapis.com/auth/plus.profile.emails.read https://www.googleapis.com/auth/contacts.readonly'
      }).then(
      (user_data) => {
        self.service.setUser({
          id: user_data.userId,
          name: user_data.displayName,
          fname: user_data.givenName,
          lname: user_data.familyName ? user_data.familyName : '',
          email: user_data.email,
          photo: user_data.imageUrl,
          accessToken: user_data.accessToken,
          type: 'google-plush'
        }).then((success) => {
          console.log('first time google' + JSON.stringify(success))
          self.user = success;

          self.login('google-plush');
        })
          .catch((msg) => {

            self.commonService.showToast('user LoggedIn fail 1' + msg);
            console.log('user LoggedIn fail 2', msg);
          }
          );
      })
      .catch(
      (msg) => {

        self.commonService.showToast('user LoggedIn fail 3 ' + msg);
        console.log('user LoggedIn fail 4', msg);
      });
  }

  // onContactClick(){
  // let modal = this.modalCtrl.create(CountaryNameModalPage);
  // modal.present();
  // }

  updateTerm(){
    console.log('term',this.term);
  }
  goToTermPage() {
    this.navCtrl.push(TermPage);
  }
}
