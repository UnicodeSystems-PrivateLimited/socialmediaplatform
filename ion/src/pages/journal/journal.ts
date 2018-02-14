import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { EditJournalPage } from '../edit-journal/edit-journal';
import { AddJournalPage } from '../add-journal/add-journal';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { PostInJournalPage } from '../post-in-journal/post-in-journal';
import { ViewJournalPage } from '../view-journal/view-journal';
/*
  Generated class for the Journal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-journal',
  templateUrl: 'journal.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class JournalPage {
  public viewTab: boolean = true;
  public userId;
  public JournalByUserId = [];
  public loader: boolean = false;
  public posts;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public myWallService: MyWallService,
    public dataService: DataService
  ) {
    if(navParams && navParams.data.posts){
      this.posts = navParams.data.posts;
    }
  }

  ionViewDidEnter() {
    let user = this.service.getSavedUser();
    this.service.getIonicStoredUser()
      .then((userSavedData) => {
        user = user ? user : userSavedData ? JSON.parse(userSavedData) : null;
      })
      .catch((err) => {
        console.log(err);
      });
    this.userId = user.userID;
    this.getJournalByUserId();
  }

  public hidetab() {
    this.viewTab = !this.viewTab;
  }

  public editJournal(Journal) {
    let modal = this.modalCtrl.create(EditJournalPage, { Journal: Journal });
    modal.onDidDismiss(data => {
      if (data) {
        if (data.data.icon) {
          Journal.icon = data.data.icon + "?t=" + new Date().getTime();
        }
        Journal.title = data.data.title;
      }
      else {
        this.ionViewDidEnter();
      }
    });
    modal.present();
  }

  public viewJournal(Journal) {
    this.navCtrl.push(ViewJournalPage, { Journal: Journal, posts: this.posts });
  }

  public addJournal() {
    let modal = this.modalCtrl.create(AddJournalPage);
    modal.onDidDismiss(data => {
        this.ionViewDidEnter();
    });
    modal.present();
  }

  getJournalByUserId() {
    this.loader = true;
    this.myWallService.getUserJournal(this.userId).subscribe((res)=>{
      if(res.status == 2){
        this.JournalByUserId = res.data;
      }
      else{
        this.commonService.showToast(res.msg);        
      }
      this.loader = false;
    });
  }

  public onDeleteClick(journalId, index) {
    this.commonService.showConfirm("", "Are you sure you want to delete this Journal ?", () => this.deleteJournal(journalId, index));
  }

  public deleteJournal(journalId, index) {
    this.loader = true;
    this.myWallService.deleteUserJournal(journalId).subscribe((res) => {
      if (res.status == 2) {
        this.JournalByUserId.splice(index, 1);
        this.commonService.showToast(res.msg);        
      }
      else {
        this.commonService.showToast(res.msg);
      }
      this.loader = false;
    });
  }
}
