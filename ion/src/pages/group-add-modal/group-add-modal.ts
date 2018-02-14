import { Component } from '@angular/core';
import { NavController, NavParams, ViewController,App } from 'ionic-angular';
import { MyWallService } from '../../providers/my-wall-service';
import { AddGroups, MyWallSearch, GroupError } from '../../interfaces/common-interfaces';
import { DataService } from '../../providers/data-service';
import { Camera } from 'ionic-native';
import { CommonService } from "../../providers/common-service";
import { GroupWallService } from '../../providers/group-wall-service';
import { CheckWallService } from '../../providers/check-wall-service';
import {GroupWallPage} from '../group-wall/group-wall';
/*
  Generated class for the GroupAddModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-group-add-modal',
  templateUrl: 'group-add-modal.html'
})
export class GroupAddModalPage {
  public scdType: number = 1;
  public searchedSubjectsList: Array<any> = [];
  public searchedCollegesList: Array<any> = [];
  public searchedDegreesList: Array<any> = [];  
  public searchData: MyWallSearch = new MyWallSearch();
  public addGroup: AddGroups = new AddGroups();  
  public groupError: GroupError = new GroupError();  
  public modalHeadertitle: string = null;
  public photosToUpload: any[] = [];  
  private imageSrc: string;
  public base64Image: string;
  public loader:boolean = false;
  public isEdit: boolean = false;  
  public groupId: number = null;  
  constructor(
    public navCtrl: NavController,
     public navParams: NavParams,
     public viewCtrl: ViewController,
     public myWallService: MyWallService,
     public dataService: DataService,
     public commonService: CommonService,    
     public groupWallService: GroupWallService,     
     public checkWallService: CheckWallService, 
     protected app:App    
    ) {
        console.log('navParams',navParams);    
        if(navParams && navParams.data.group){
            this.modalHeadertitle = "Edit Group";         
            this.isEdit = true;
            this.groupId = navParams.data.group._id;
            this.addGroup.title = navParams.data.group.title;
            this.addGroup.description = navParams.data.group.description;
            this.addGroup.privacy = navParams.data.group.privacy;
            this.addGroup.icon = [];
            if (navParams.data.group.subject_id) {
                this.addGroup.subject_id = navParams.data.group.subject_id._id;
                this.scdType = 1;
                this.searchData.subject_name = navParams.data.group.subject_id.name;
            }
            if (navParams.data.group.college_id) {
                this.addGroup.college_id = navParams.data.group.college_id._id;
                this.scdType = 2;
                this.searchData.college_name = navParams.data.group.college_id.name;
            }
            if (navParams.data.group.degree_id) {
                this.addGroup.degree_id = navParams.data.group.degree_id._id;
                this.scdType = 3;
                this.searchData.degree_name = navParams.data.group.degree_id.name;
            }   
        }
        else{
            this.modalHeadertitle = "Add Group";            
        }
            // this.checkWallService.setInviteActiveWall(4); //4=> Group Wall
    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupAddModalPage');    
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  public onChangeSCD(type: number): void {
    console.log('onChangeSCD type',type);
    this.scdType = type;
    console.log('onChangeSCD this.scdType',this.scdType);
    this.searchData = new MyWallSearch();
    this.addGroup.college_id = null;
    this.addGroup.subject_id = null;
    this.addGroup.degree_id = null;
}

public subjectSearch(e: any): void {
  this.searchedCollegesList = [];
  this.searchedDegreesList = [];
  this.searchData.college_name = '';
  this.searchData.degree_name = '';
  if (this.searchData.subject_name) {
      this.myWallService.getUserSubjects(this.searchData.subject_name).subscribe((res) => {
          if (res.status == 2) {
              this.searchedSubjectsList = res.data;
          }
      })
  } else {
      this.searchData.subject_name = '';
      this.searchedSubjectsList = [];
      this.addGroup.subject_id = null;
  }
}
public selectSubject(id: number, name: string): void {
  this.searchData.subject_name = name;
  this.addGroup.subject_id = id;
  this.searchedSubjectsList = [];
}
public collegeSearch(e: any): void {
  this.searchedSubjectsList = [];
  this.searchedDegreesList = [];
  this.searchData.degree_name = '';
  this.searchData.subject_name = '';
  if (this.searchData.college_name) {
      this.myWallService.getUserColleges(this.searchData.college_name).subscribe((res) => {
          if (res.status == 2) {
              this.searchedCollegesList = res.data;
          }
      })
  } else {
      this.searchData.college_name = '';
      this.searchedCollegesList = [];
      this.addGroup.college_id = null;
  }
}
public degreeSearch(e: any): void {
  this.searchedCollegesList = [];
  this.searchedSubjectsList = [];
  this.searchData.college_name = '';
  this.searchData.subject_name = '';
  if (this.searchData.degree_name) {
      this.myWallService.getUserDegrees(this.searchData.degree_name).subscribe((res) => {
          if (res.status == 2) {
              this.searchedDegreesList = res.data;
          }
      })
  } else {
      this.searchData.degree_name = '';
      this.searchedDegreesList = [];
      this.addGroup.degree_id = null;
  }
}
public selectCollege(id: number, name: string): void {
  this.searchData.college_name = name;
  this.addGroup.college_id = id;
  this.searchedCollegesList = [];
}
public selectDegree(id: number, name: string): void {
  this.searchData.degree_name = name;
  this.addGroup.degree_id = id;
  this.searchedDegreesList = [];
}

public onSelectionChange(privacy: number): void {
  this.addGroup.privacy = privacy;
}

private openGallery(): void {
  let cameraOptions = {
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: Camera.DestinationType.FILE_URI,
    quality: 100,
    targetWidth: 1000,
    targetHeight: 1000,
    encodingType: Camera.EncodingType.JPEG,
    correctOrientation: true
  }
  Camera.getPicture(cameraOptions)
    .then((file_uri) => {
      this.imageSrc = file_uri;
      this.commonService.getFileFromUri(this.imageSrc)
        .then((file) => {
          console.log('file',file);
          this.addGroup.icon[0] = file;
          if (this.addGroup.icon[0].type == 'image/jpeg' || this.addGroup.icon[0].type == 'image/tif' || this.addGroup.icon[0].type == 'image/tiff' || this.addGroup.icon[0].type == 'image/jpg' || this.addGroup.icon[0].type == 'image/png' || this.addGroup.icon[0].type == 'image/gif') {
              this.groupError.groupIcon = null;
          }
          else {
              this.groupError.groupIcon = "Invalid image format";
          }
        })
        .catch((err) => {
          console.log(err);
        })
    })
    .catch((err) => {
      console.log(err);
    })
}

public createGroup(): void {
  this.addGroup.title = this.addGroup.title ? this.addGroup.title.trim() : null;
  this.addGroup.description = this.addGroup.description ? this.addGroup.description.trim() : null;
  if (this.addGroup.title) {
      if (this.addGroup.description) {
          if (this.addGroup.subject_id || this.addGroup.college_id || this.addGroup.degree_id) {
            if (!this.isEdit) {      
            if (this.addGroup.icon.length) {
                      this.loader = true;
                      this.groupWallService.addNewGroup(this.addGroup).subscribe((res) => {
                          if (res.status == 2) {
                              this.clearResoures();
                              this.commonService.showToast(res.msg);
                              this.app.getRootNav().push(GroupWallPage, { wallId: res.data._id, isGroupAdded:1 });
                              this.dismiss();
                          }
                          this.loader = false;
                        });
                  } else {
                      this.groupError = new GroupError();
                      this.groupError.groupIcon = "Select The Group Image.";
                  }
                } else {
                    this.loader = true;
                    this.groupWallService.editGroup(this.addGroup, this.groupId).subscribe((res) => {
                        if (res.status == 2) {
                            this.clearResoures();                            
                            this.commonService.showToast(res.msg);
                            this.dismiss();
                        }
                        this.loader = false;
                    });
                }
          } else {
              this.groupError = new GroupError();
              this.groupError.groupSCD = "Select subject or college or degree.";
          }
      } else {
          this.groupError = new GroupError();
          this.groupError.groupDescription = "Group Description Is Required.";
      }
  } else {
      this.groupError = new GroupError();
      this.groupError.groupTitle = "Group Name Is Required.";
  }
}

public clearResoures(): void {
  this.addGroup = new AddGroups();
  this.groupError = new GroupError();
  this.searchData = new MyWallSearch();
  this.scdType = 1;
  this.modalHeadertitle = null;
  this.isEdit = false;
}
}
