import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { SocialShareLink } from '../../interfaces/common-interfaces';
import { DataService } from '../../providers/data-service';
import { CommonService } from "../../providers/common-service";

/*
  Generated class for the AddSocialLink page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-social-link',
  templateUrl: 'add-social-link.html'
})
export class AddSocialLinkPage {
  public socialPostUrl = '/api/user/postSocialLink';  
  public update_social_link: SocialShareLink = new SocialShareLink();  
  public loader: boolean = false;  
  public activeUpdate: boolean = true;  
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public dataService: DataService,
    public commonService: CommonService    
  ) {
    console.log('navparams',navParams);
    this.update_social_link.facebook = navParams.data.social_link.facebook;
    this.update_social_link.twitter = navParams.data.social_link.twitter;
    this.update_social_link.google_plus = navParams.data.social_link.google_plus;
    this.update_social_link.linkedin = navParams.data.social_link.linkedin;
   }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddSocialLinkPage');

  }

  formSubmit() {
    let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    let checkUrl = [true, true, true, true];
    if (this.update_social_link.facebook) {
      if (!regexp.test(this.update_social_link.facebook)) {
        checkUrl[0] = false;
      }
    }
    if (this.update_social_link.twitter) {
      if (!regexp.test(this.update_social_link.twitter)) {
        checkUrl[1] = false;
      }
    }
    if (this.update_social_link.linkedin) {
      if (!regexp.test(this.update_social_link.linkedin)) {
        checkUrl[2] = false;
      }
    }
    if (this.update_social_link.google_plus) {
      if (!regexp.test(this.update_social_link.google_plus)) {
        checkUrl[3] = false;
      }
    }
    if (checkUrl.indexOf(false) == -1) {
      this.loader = true;
      this.dataService.postData(this.socialPostUrl, this.update_social_link)
        .subscribe(res => {
          this.loader = false;
          if (res.status === 2) {
            this.commonService.showToast('Social links updated successfully.');
            this.dismiss();
          }
        });
    } else {
      this.commonService.showToast('Please enter a valid url.');
    }
  }

  detectInputChanges(){
    this.activeUpdate = false;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
