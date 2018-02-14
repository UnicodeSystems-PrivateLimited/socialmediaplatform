import {Component, OnInit} from '@angular/core';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'admin-skill',
    template: require('./skills.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class SkillsComponent {
    public user;
    public errorMessage: string;
    private _dataUrlSkills = 'api/skill/getAllSkills/';
    private _dataUrlDeleteSkill = 'api/skill/delete/';
    private _dataUrlAddSkill = 'api/skill/add/';
    private _dataUrlEditSkill = 'api/skill/updateSkillById/';
    private _skillSearch = 'api/skill/skillSearch/';
    public counter = 1;
    public skills;
    public errorAddSkill;
    public errorUpdateSkill;
    public deleteSkill;
    public total_skills;
    public errorSearch;
    public sub;
    public parseVar;
    public total_pages;
    public total_pages_left = 0;
    public message = { name: '' };
    public skillname = { name: '' };
    public skillId;
    router: Router;
    public contentLoding: boolean = false;
    public errorCsvFile = ''
    public fileToUpload;
    public csvFile;
    public _dataUrlAddBulkSkill = 'api/skill/addBulkSkill';
    public deleteSkillId;
    public index;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
    }

    ngOnInit() {
        this.getAllSkills();
    }

    ngAfterViewInit() {

    }

    getAllSkills() {
        this.contentLoding = true;
        this.dataService.getData(this._dataUrlSkills + this.counter).subscribe(subject => {
            this.skills = subject.data;
            this.total_skills = subject.total_skills;
            this.parseVar=this.total_skills / 50;
            this.total_pages = parseInt(this.parseVar);
            this.counter = 2;
            this.total_pages_left = this.total_pages - 1;
            this.contentLoding = false;
        });
    }
    
    fileChangeEvent(fileInput: any) {
        this.fileToUpload = <Array<File>>fileInput.target.files;
        this.csvFile = fileInput;
        if (this.fileToUpload[0].type == 'text/csv') {
            this.errorCsvFile = '';
        }
        else {
            this.errorCsvFile = "Choose only CSV file";
        }
    }

    skillBulkUpload() {
        if (typeof (this.fileToUpload) != 'undefined' && this.fileToUpload.length > 0) {
        if (this.errorCsvFile == '') {
                jQuery('.spin-wrap.vision-spin').fadeIn();
            this.makeFileRequest(this._dataUrlAddBulkSkill, [], this.fileToUpload).then((result) => {
                this.errorCsvFile = '';
                this.csvFile.target.value = '';
                    this.getAllSkills();
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    jQuery('.spin-wrap.vision-spin').fadeOut();
            }, (error) => {
                console.error(error);
            });
        };
        } else {
            var n = noty({ text: '<div class="alert bg-theme-error"><p>Please Select CSV-FILE</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
    }
    }

    makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append("avatar", files[0]);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            }
            xhr.open("POST", url, true);
            xhr.send(formData);
        });
    }
    
    
    getAllSkillPaginationNext() {
        if (this.total_pages_left < this.total_pages && this.total_pages_left >= 0) {
            this.counter++;
            this.dataService.getData(this._dataUrlSkills + this.counter).subscribe(skill => {
                this.skills = skill['data'];
                this.total_pages_left = this.total_pages_left - 1;
            });
        }
        else {
            console.log("no more pages left");
        }
    }
    getAllSkillPaginationPrevious() {
        if (this.total_pages_left + 1 !== this.total_pages) {
            this.counter--;
            this.dataService.getData(this._dataUrlSkills + this.counter).subscribe(skill => {
                this.skills = skill['data'];
                this.total_pages_left = this.total_pages_left + 1;
            });
        }
        else {
            console.log("no page left");
        }
    }
    
    deleteSkillModal(id,i){
    this.deleteSkillId=id;
    this.index=i;
    jQuery("#skillDeleteModal").modal({ backdrop: false });
    }

    deleteSkillById() {
        this.dataService.getData(this._dataUrlDeleteSkill + this.deleteSkillId).subscribe(deleteSubject => {
            this.deleteSkill = deleteSubject.data;
            this.counter = 1;
            
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + deleteSubject.message + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
          //  this.getAllSkills();
          this.skills.splice(this.index, 1);
        });

    }

    getSkill() {
        if (!this.skillname.name) {
            this.counter = 1;
            this.errorSearch = "";
            this.getAllSkills();
        }
        else {
            var nameValid = /^[a-z\d-_.(){}\,\s]+$/i;
            if (this.skillname.name.match(nameValid)) {
                this.dataService.postData(this._skillSearch, this.skillname).subscribe(res => {
                    if (res.status == 2) {
                        this.skills = res['data'];
                        this.errorSearch = "";
                    }
                });
            } else {
                this.errorSearch = "Invalid Search Input!.";
            }
        }
    }

    editSkill(sub) {
        this.sub = sub;
        this.message.name = sub.title;
        this.skillId = sub._id;
        this.errorUpdateSkill = '';
        jQuery("#edit-skill-modal").modal({ backdrop: false });
    }

    addSkill() {
        if (this.message.name != "") {
            jQuery('.spin-wrap.vision-spin').fadeIn();
            this.dataService.postData(this._dataUrlAddSkill, this.message).subscribe((result) => {
                if (result['status'] == 3) {
                this.message.name = '';
                this.counter = 1;
                this.errorAddSkill = '';
                this.getAllSkills();
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                jQuery('.spin-wrap.vision-spin').fadeOut();
                jQuery('#add-skill-modal').modal('hide');
                } else if (result['status'] = 2) {
                    this.message.name = '';
                    this.counter = 1;
                    this.errorAddSkill = '';
                    this.getAllSkills();
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                    jQuery('#add-skill-modal').modal('hide');
                }
            }, (error) => {
                console.error(error);
            });

        } else {
            this.errorAddSkill = "Skill Name Required!.";
        }
    }
    clearAddSkill() {
        this.message.name = '';
        this.errorAddSkill = '';
    }

    updateSkill() {
        if (this.message.name != "") {
            jQuery('.spin-wrap.vision-spin').fadeIn();
            this.dataService.postData(this._dataUrlEditSkill + this.skillId, this.message).subscribe((result) => {
                if (result['status'] == 3) {
                this.message.name = '';
                this.errorUpdateSkill = '';
                this.skillId = '';
                    var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                    jQuery('#edit-skill-modal').modal('hide');
                } else if (result['status'] = 2) {
                    this.message.name = '';
                    this.errorUpdateSkill = '';
                    this.skillId = '';
                this.sub.title = result['data'][0].title;
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                jQuery('.spin-wrap.vision-spin').fadeOut();
                jQuery('#edit-skill-modal').modal('hide');
                }
            }, (error) => {
                console.error(error);
            });
        } else {
            this.errorUpdateSkill = "Skill Name Required!.";
        }
    }

    openSkill(event) {
        jQuery("#add-skill-modal").modal({ backdrop: false });
    }
}
