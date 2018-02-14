import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { PageService } from '../../providers/page-service';
import { DataService } from '../../providers/data-service';
import { Component, ElementRef, OnInit, OnChanges, AfterViewChecked, Input, ViewChild } from '@angular/core';
import { ChatOptionPopupPage } from '../chat-option-popup/chat-option-popup';
import { ChatGlobalService } from '../../providers/chat-global-service';
declare var Primus: any;

/*
  Generated class for the ChatDesc page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-chat-desc',
  templateUrl: 'chat-desc.html'
})
export class ChatDescPage {

  public loader: boolean = false;

  constructor(public navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private page: PageService,
    private dataService: DataService,
    private chatGlobalService: ChatGlobalService,
    public navParams: NavParams) {
    this.loader = true;
    setTimeout(() => {
      this.loader = false;
    }, 300);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatDescPage');
    
  }

  presentPopover(ev) {

    let popover = this.popoverCtrl.create(ChatOptionPopupPage, {

    });

    popover.present({
      ev: ev
    });
  }

  ngOnChanges() {
    if (this.chatGlobalService.cBuddy) {
      if (typeof (this.chatGlobalService.chatGroupData) != "undefined" && this.chatGlobalService.chatGroupData != null) { this.chatGlobalService.getDefaultGroupChatById(this.chatGlobalService.chatGroupData._id); }
      if (this.chatGlobalService.defaultHistory[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].messages) {
        for (var i = 0; i < this.chatGlobalService.defaultHistory[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].messages.length; i++) {
          if (this.chatGlobalService.defaultHistory[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].messages[i].from._id == this.chatGlobalService.profile.id) {
            this.chatGlobalService.defaultHistory[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].messages[i].from.photo = this.chatGlobalService.profilePic;
          }
        }
      }
      if (this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id]) {
        for (var i = 0; i < this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id].length; i++) {
          if (this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id]) {
            if (this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id][i].from == this.chatGlobalService.profile.id) {
              this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id][i].avatar = this.chatGlobalService.profilePic;
            }
          }
        }

      }
    }
  }

  sendData() {
    var outText = this.chatGlobalService.textBoxes.outBoxes[this.chatGlobalService.clientPref + this.chatGlobalService.cBuddy.id];
    if (outText && outText.text.trim() != "") {
      var msg = {
        from: this.chatGlobalService.profile.id,
        to: this.chatGlobalService.cBuddy.id,
        date: new Date(),
        data: {
          type: this.chatGlobalService.dataType.TEXT,
          body: outText.text
        }
      };
      msg['self'] = true;
      if (this.chatGlobalService.profilePic)
        msg['avatar'] = this.chatGlobalService.profilePic;
      else
        msg['avatar'] = '';
      this.chatGlobalService.client.write(msg);
      this.chatGlobalService.textBoxes.inBoxes[this.chatGlobalService.clientPref + msg.to].push(msg);
      outText.text = "";
    }
  }

  chatInputAction(e) {
    if (e.keyCode === 13 && !e.shiftKey) {
      this.sendData();
      return false;
    }
  }
}
