import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { UserService } from "../../providers/user-service";
import { CommonService } from "../../providers/common-service";
import { DataService } from '../../providers/data-service';
import { PageService } from '../../providers/page-service';
import { MyWallService } from '../../providers/my-wall-service';
import { AddJournal, AddPostToJournal } from '../../interfaces';
import { AddJournalPage } from '../add-journal/add-journal';

/*
  Generated class for the PostInJournal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-post-in-journal',
  templateUrl: 'post-in-journal.html',
  providers: [UserService, CommonService, DataService, PageService, MyWallService]
})
export class PostInJournalPage {
  public postId: number = null;
  // @Output() complete = new EventEmitter<any>();
  public allJournalOfPost: Array<any> = [];
  public allJournalOfUser: Array<any> = [];
  public selectedJournal: string = 'Select Journal';
  public addJournalData: AddJournal = new AddJournal();
  public addPostToJournalData: AddPostToJournal = new AddPostToJournal();
  public isEditJournal: boolean = false;
  public descId: any = null;
  public userId: number = null;
  public loader: boolean = false;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public service: UserService,
    public commonService: CommonService,
    public pageService: PageService,
    public myWallService: MyWallService,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public dataService: DataService,
  ) {
    console.log(navParams);
    this.postId = navParams.data.posts._id;
    this.userId = DataService.userid;
  }

  ionViewDidLoad() {
    this.getAllJournalByPostId();
    this.getAllJournalOfUser();
  }
  ionViewDidEnter(){
    this.getAllJournalOfUser();
    this.getAllJournalByPostId();
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }

  public getAllJournalByPostId(): void {
    this.myWallService.getJournalByPostId(this.postId).subscribe((res) => {
      if (res.status == 2) {
        this.allJournalOfPost = res.data;
      }
    });
  }

  public getAllJournalOfUser(): void {
    this.myWallService.getJournalOfUser().subscribe((res) => {
      if (res.status == 2) {
        this.allJournalOfUser = res.data;
      }
    });
  }

  public addUpdatePostInJournal(): void {
    this.addPostToJournalData.postId = this.postId;
    if (this.addPostToJournalData.journalId) {
      if (this.isEditJournal) {
   this.loader = true;
        this.myWallService.editPostToJournal(this.addPostToJournalData).subscribe((res) => {
          if (res.status == 2) {
   this.loader = false;
            
            this.commonService.showToast(res.msg);
            this.selectedJournal = null;
            this.isEditJournal = false;
            this.addPostToJournalData = new AddPostToJournal();
            this.dismiss();
          }
        });
      } else {
   this.loader = true;
        
        this.myWallService.addPostToJournal(this.addPostToJournalData).subscribe((res) => {
   this.loader = false;
          if (res.status == 3) {
            this.commonService.showToast(res.msg);
          } else if (res.status == 2) {
            this.commonService.showToast(res.msg);
            this.selectedJournal = null;
            this.addPostToJournalData = new AddPostToJournal();
            this.dismiss();
          }
        });
      }
    }
    else {
      this.commonService.showToast('Please Select a Journal!');
    }
  }

  public onClickEditJournal(journal: any) {
    this.isEditJournal = true;
    this.addPostToJournalData.journalId = journal._id;
    this.addPostToJournalData.description = this.getPostDescription(journal);
    this.selectedJournal = journal.title;
    this.addPostToJournalData._id = this.descId;
  }
  public getPostDescription(journal: any): string {
    for (let post of journal.posts) {
      if (post.post_id == this.postId) {
        this.descId = post._id;
        return post.description ? post.description : '';
      }
    }
  }
  public getJournalDate(journal: any): string {
    for (let post of journal.posts) {
      if (post.post_id == this.postId) {
        this.descId = post._id;
        return post.created_on ? post.created_on : '';
      }
    }
  }

  public addJournal() {
    let modal = this.modalCtrl.create(AddJournalPage);
     modal.onDidDismiss(() => {
      //  if(data){
       this.getAllJournalOfUser();
      //  }
     });
    modal.present();
  }
}
