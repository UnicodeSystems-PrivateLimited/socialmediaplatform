import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { CommonService } from '../../providers/common-service';

/*
  Generated class for the FlagPost page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-flag-post',
  templateUrl: 'flag-post.html'
})
export class FlagPostPage {
  public urlSendFlag = '/api/postsfeedback/sendfeedBack';
  public messages: any = [];
  public flagOptions: Array<String> = ["Nudity", "Violence", "Harassement","Suicide or Self-Injury", "Spam", "Unauthorized Sales", "Hate Speech"];
  public postId: number = null;
  public postData = { id: null, messages: []};
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public commonService: CommonService,    
    public dataService: DataService    
  ) {
    this.postId = navParams.data.data;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FlagPostPage');
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  checkFlagValue(value) {
    if (this.messages.indexOf(value) != -1) { // Make sure the value exists
      this.messages.splice(this.messages.indexOf(value), 1);
    }
    else {
      this.messages.push(value);
    }
  }

  sendFlag(){
    this.postData.id = this.postId;
    this.postData.messages = this.messages;
    this.dataService.postData(this.urlSendFlag,this.postData).subscribe(res=>{
      console.log('res',res);
      if(res.status == 2){
        this.commonService.showToast(res.msg);
      }
      this.dismiss();
    });
  }
}
