import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, MenuController, Platform } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { Facebook, GooglePlus, Splashscreen } from 'ionic-native';


import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { RegisterPage } from '../register/register';
import { MyWallPage } from '../my-wall/my-wall';
import { AdminPage } from '../admin/admin';
import { TabsPage } from '../tabs/tabs';
import { UpdateStatusPage } from '../update-status/update-status';
import { JournalPage } from '../journal/journal';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { SliderPage } from '../slider/slider';




/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [UserService, CommonService, DataService, PageService]
})

export class LoginPage {

  public user = { email: "", password: "", agree: false, loggedInType: '' };
  public self: this = this;
  public apiBaseUrl: string = '';
  private loginForm: FormGroup;
  public loader: boolean = false;
  FB_APP_ID: number = 996536043767719;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public modalCtrl: ModalController,
    public ionicStorage: Storage,
    private formBuilder: FormBuilder,
    public menuCtrl: MenuController,
    public dataService: DataService) {
    this.menuCtrl.enable(false, 'myMenu');
    this.apiBaseUrl = service.apiBaseUrl;
    Facebook.browserInit(this.FB_APP_ID);
    platform.ready().then(() => {
      ionicStorage.ready().then(() => {
        // Or to get a key/value pair
        ionicStorage.get('isAppOpenPrevious').then((isAppOpenPrevious) => {
          if (isAppOpenPrevious) {
            ionicStorage.get('user').then((val) => {
              console.log('Your user is', JSON.parse(val));
              if (val) {
                //  let values = JSON.parse(val);
                // DataService.userFullName = values.userFullName;
                // DataService.userid = values.userID;
                // console.log('DataService.userFullName',DataService.userFullName);
                // console.log('DataService.userid',DataService.userid);
                // this.navCtrl.setRoot(MyWallPage);
                let values = JSON.parse(val);
                DataService.userFullName = values.userFullName;
                DataService.userid = values.userID;
                console.log('DataService.userFullName', DataService.userFullName);
                console.log('DataService.userid', DataService.userid);
                this.user.email = values.email;
                this.user.password = values.password;
                this.user.loggedInType = values.loggedInType;
                console.log('this.user+++++', this.user);
                this.login(this.user.loggedInType);
              }
              else {
                Splashscreen.hide();
              }
            });
          } else {
            ionicStorage.set('isAppOpenPrevious', true);
            this.navCtrl.setRoot(SliderPage);
          }
        });
      });
    });

    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      ])],
      password: ['', Validators.compose([
        // Validators.minLength(6),
        Validators.required,
      ])],
    });

  }

  goToForgetPassPage() {
    this.navCtrl.push(ForgotPasswordPage);
  }

  goToRegisterPage() {
    this.navCtrl.push(RegisterPage);
  }

  // login(type){
  //   //  this.navCtrl.setRoot(MyWallPage);
  //    this.navCtrl.push(UpdateStatusPage);
  // }

  login(type) {
    console.log("validation error message", this.loginForm.value)
    this.loader = true;
    this.user.loggedInType = type;
    this.user.email = (this.user.email).toLowerCase();
    console.log("this.user", this.user);
    this.service.login(this.user)
      .then((res) => {
        console.log("login response", res);
        if (res['status'] == 1 && res['type'] == 1) {
          this.loader = false;
          this.navCtrl.setRoot(MyWallPage);
        } else if (res['status'] == 1 && res['type'] == 2) {
          this.loader = false;
          this.navCtrl.setRoot(AdminPage);
        }
      }, (err) => {
        console.log('not found+++++++++++++++++++=', err);
        this.loader = false;
        this.commonService.showToast(err['msg']);
      })
  }

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
}
