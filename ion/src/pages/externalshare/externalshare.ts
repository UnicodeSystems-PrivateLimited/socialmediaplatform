import { Component } from '@angular/core';
import { NavController, NavParams ,Platform } from 'ionic-angular';
import { SocialSharing } from 'ionic-native';

/*
  Generated class for the Externalshare page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-externalshare',
  templateUrl: 'externalshare.html'
})
export class ExternalsharePage {

  public sendTo   : any;
   public subject  : string = 'Message from Social Sharing App';
   public message  : string = 'Take your app development skills to the next level with Mastering Ionic 2 - the definitive guide';
   public image    : string	= 'http://masteringionic2.com/perch/resources/mastering-ionic-2-cover-1-w320.png';
   public uri      : string	= 'http://masteringionic2.com/products/product-detail/s/mastering-ionic-2-e-book';


  constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform) {
    console.log("this.navParams",this.navParams);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExternalsharePage');
  }

  shareViaEmail()
   {
      this.platform.ready()
      .then(() =>
      {
         SocialSharing.canShareViaEmail()
         .then(() =>
         {
            SocialSharing.shareViaEmail(this.message, this.subject, this.sendTo)
            .then((data) =>
            {
               console.log('Shared via Email');
            })
            .catch((err) =>
            {
               console.log('Not able to be shared via Email');
            });
         })
         .catch((err) =>
         {
            console.log('Sharing via Email NOT enabled');
         });
      });
   }

   shareViaSMS()
   {
      this.platform.ready()
      .then(() =>
      {

         SocialSharing.shareViaSMS(this.message,"+919336216743")
         .then((data) =>
         {
            console.log('Shared via shareViaSMS');
         })
         .catch((err) =>
         {
            console.log('Was not shared via shareViaSMS');
         });

      });
   }



   shareViaFacebook()
   {
      this.platform.ready()
      .then(() =>
      {
         SocialSharing.canShareVia('com.apple.social.facebook', this.message, this.image, this.uri)
         .then((data) =>
         {

            SocialSharing.shareViaFacebook(this.message, this.image, this.uri)
            .then((data) =>
            {
               console.log('Shared via Facebook');
            })
            .catch((err) =>
            {
               console.log('Was not shared via Facebook');
            });

         })
         .catch((err) =>
         {
            console.log('Not able to be shared via Facebook');
         });

      });
   }




   shareViaInstagram()
   {
      this.platform.ready()
      .then(() =>
      {

         SocialSharing.shareViaInstagram(this.message, this.image)
         .then((data) =>
         {
            console.log('Shared via shareViaInstagram');
         })
         .catch((err) =>
         {
            console.log('Was not shared via Instagram');
         });

      });
   }


   shareViaWhatsApp()
   {
      this.platform.ready()
      .then(() =>
      {

         SocialSharing.shareViaWhatsApp(this.message, this.image, this.uri)
         .then((data) =>
         {
            console.log('Shared via shareViaWhatsApp');
         })
         .catch((err) =>
         {
            console.log('Was not shared via shareViaWhatsApp');
         });

      });
   }

   

   shareViaTwitter()
   {
      this.platform.ready()
      .then(() =>
      {

         SocialSharing.canShareVia('com.apple.social.twitter', this.message, this.image, this.uri)
         .then((data) =>
         {

            SocialSharing.shareViaTwitter(this.message, this.image, this.uri)
            .then((data) =>
            {
               console.log('Shared via Twitter');
            })
            .catch((err) =>
            {
               console.log('Was not shared via Twitter');
            });

         });

      })
      .catch((err) =>
      {
         console.log('Not able to be shared via Twitter');
      });
   }


    sharePicker()
   {
      this.platform.ready()
      .then(() =>
      {

         SocialSharing.share(this.message, this.subject, this.image, this.uri)
         .then((data) =>
         {
            console.log('Shared via SharePicker');
         })
         .catch((err) =>
         {
            console.log('Was not shared via SharePicker');
         });

      });
   }


}
