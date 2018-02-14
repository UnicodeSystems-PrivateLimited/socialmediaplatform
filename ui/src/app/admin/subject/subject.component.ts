import {Component, OnInit} from '@angular/core';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var noty: any;
declare var require: any;


@Component({
    selector: 'master-subject',
    template: require('./subject.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class SubjectComponent {
    public user;
    public errorMessage: string;
    private _dataUrlSubject = 'api/subject/getAllSubject/';
    private _dataUrlAddSubject = 'api/subject/addSubject';
    private _dataUrlAddOnlySubject = 'api/subject/addOnlySubject';
    private _dataUrlUpdateSubject = 'api/subject/updateSubjectById/';
    private _dataUrlUpdateOnlySubject = 'api/subject/updateOnlySubjectById/';
    private _dataUrlDeleteSubject = 'api/subject/delete/';
    private _subjectSearch = 'api/subject/subjectSearch/';
    public message = { name: { name: '' } };
    router: Router;
    public subjects;
    public deleteSubject;
    public errorSearch;
    public photosToUpload;
    public updateSubjectId;
    public subjectName;
    public counter = 1;
    public total_subject;
    public errorAddSubject;
    public errorEditSubject;
    public errorSubjectIcon = '';
    public imageFile;
    public parseVar;
    public total_pages;
    public sub;
    public total_pages_left = 0;
    public subjectname = { name: '' };
    public contentLoding: boolean = false;
    public errorCsvFile = ''
    public fileToUpload;
    public csvFile;
    public _dataUrlAddBulkSubject='api/subject/addBulkSubject';
    public deleteSubId;
    public index;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.counter = 1;
        this.total_pages_left = 0;
    }

    ngOnInit() {
        this.getAllSubject();
    }

    ngAfterViewInit() {
        setTimeout(function() {
            jQuery("#detailBtn2").click(function() {
                jQuery("#detailModal").modal({ backdrop: false });
            });
        }, 100);
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


    subjectBulkUpload() {
        if (typeof (this.fileToUpload) != 'undefined' && this.fileToUpload.length > 0) {
        if (this.errorCsvFile == '') {
                jQuery('.spin-wrap.vision-spin').fadeIn();
            this.makeFileRequest(this._dataUrlAddBulkSubject, [], this.fileToUpload).then((result) => {
                    this.errorCsvFile = '';
                    this.csvFile.target.value = '';
                this.getAllSubject();
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

    getSubject(event) {
        if (!this.subjectname.name) {
            this.errorSearch = "";
            this.getAllSubject();
        }
        else {
            var nameValid = /^[a-z\d-_.(){}\,\s]+$/i;
            if (this.subjectname.name.match(nameValid)) {
                this.dataService.postData(this._subjectSearch, this.subjectname).subscribe(res => {
                    if (res.status == 2) {
                        this.subjects = res.data;
                        this.errorSearch = "";
                    }
                });
            } else {
                this.errorSearch = "Invalid Search Input!.";
            }
        }
    }

    getAllSubject() {
        this.counter = 1;
        this.contentLoding = true;
        this.dataService.getData(this._dataUrlSubject + this.counter).subscribe(subject => {
            this.subjects = subject.data;
            this.total_subject = subject.total_subjects;
            this.parseVar=this.total_subject / 50;
            this.total_pages = parseInt(this.parseVar);
            this.total_pages_left = this.total_pages - 1;
            this.contentLoding = false;
        });
    }

    getAllSubjectPaginationNext() {
        if (this.total_pages_left < this.total_pages && this.total_pages_left >= 0) {
            this.counter++;
            this.dataService.getData(this._dataUrlSubject + this.counter).subscribe(subject => {
                this.subjects = subject.data;
                this.total_pages_left = this.total_pages_left - 1;
            });
        }
        else {
            console.log("no more pages left");
        }
    }

    getAllSubjectPaginationPrevious() {
        if (this.total_pages_left + 1 !== this.total_pages) {
            this.counter--;
            this.dataService.getData(this._dataUrlSubject + this.counter).subscribe(subject => {
                this.subjects = subject.data;
                this.total_pages_left = this.total_pages_left + 1;
            });
        }
        else {
            console.log("no page left");
        }
    }
    
    deleteSubjectModal(id,i){
    this.deleteSubId=id;
    this.index=i;
    jQuery("#subjectDeleteModal").modal({ backdrop: false });
    }

    deleteSubjectById() {
        this.dataService.getData(this._dataUrlDeleteSubject + this.deleteSubId).subscribe(deleteSubject => {
            this.deleteSubject = deleteSubject.data;
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Subject Deleted.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
          //  this.getAllSubject();
          this.subjects.splice(this.index, 1);
        });
    }

    addSubject() {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
            if (this.errorSubjectIcon == '') {
                if (this.message.name.name != '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.makeFileRequest(this._dataUrlAddSubject + '/' + this.message.name.name, [], this.photosToUpload).then((result) => {
                        if (result['status'] == 3) {
                            this.message.name.name = '';
                            this.photosToUpload = '';
                            this.errorAddSubject = '';
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            this.getAllSubject();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#detailModal").modal('hide');
                        } else if (result['status'] = 2) {
                    this.photosToUpload = '';
                    this.message.name.name = '';
                    this.errorAddSubject = '';
                    this.subjects.splice(0, 0, result['data']);
                            this.imageFile.target.value = "";
                    this.getAllSubject();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                    jQuery("#detailModal").modal('hide');
                        }
                }, (error) => {
                    console.error(error);
                });
            } else {
                    this.errorSubjectIcon = '';
                    this.errorAddSubject = "Subject Name Required!.";
            }
            }
        } else {
            if (this.errorSubjectIcon == '') {
                if (this.message.name.name != '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                this.dataService.postData(this._dataUrlAddOnlySubject, this.message.name).subscribe(post_subject => {
                        if (post_subject['status'] == 3) {
                            this.message.name.name = '';
                            this.errorAddSubject = '';
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#detailModal").modal('hide');
                        } else if (post_subject['status'] = 2) {
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    this.message.name.name = '';
                    this.errorAddSubject = '';
                    this.subjects.splice(0, 0, post_subject.data);
                    this.getAllSubject();
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                    jQuery("#detailModal").modal('hide');
                        }
                }, (error) => {
                    console.error(error);
                });
            } else {
                    this.errorSubjectIcon = '';
                    this.errorAddSubject = "Subject Name Required!.";
            }
        }
    }
    }

    clearAddSubject() {
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
        this.photosToUpload = '';
        this.message.name.name = '';
        this.errorSubjectIcon = '';
        this.errorAddSubject = '';
        this.errorEditSubject = '';
    }

    updateId(sub) {
        this.sub = sub;
        this.updateSubjectId = sub._id;
        this.subjectName = sub.name;
        this.message.name.name = sub.name;
        this.errorEditSubject = '';
        jQuery("#EditdetailModal").modal({ backdrop: false });
    }


    updateSubjectById() {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.errorSubjectIcon == '') {
            if (this.message.name.name != '') {
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.makeFileRequest(this._dataUrlUpdateSubject + this.updateSubjectId + '/' + this.message.name.name, [], this.photosToUpload).then((result) => {
                    if (result['status'] == 3) {
                        this.message.name.name = '';
                    this.photosToUpload = '';
                        this.errorEditSubject = '';
                        if (typeof (this.imageFile) != "undefined")
                            this.imageFile.target.value = "";
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        jQuery("#EditdetailModal").modal('hide')
                    } else if (result['status'] = 2) {
                        this.photosToUpload = '';
                    this.message.name.name = '';
                    this.errorEditSubject = '';
                    this.imageFile.target.value = "";
                    this.sub.name = result['data'][0].name;
                    this.sub.icon = result['data'][0].icon + "?t=" + new Date().getTime();
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    jQuery("#EditdetailModal").modal('hide');
                    }
                }, (error) => {
                    console.error(error);
                });
            } else {
                this.errorEditSubject = "Subject Name Required!.";
            }

        } else {
            if (this.errorSubjectIcon == '') {
                if (this.message.name.name != '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                this.dataService.postData(this._dataUrlUpdateOnlySubject + this.updateSubjectId, this.message.name).subscribe(post_subject => {
                        if (post_subject['status'] == 3) {
                            this.message.name.name = '';
                            this.errorEditSubject = '';
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            jQuery("#EditdetailModal").modal('hide');
                            jQuery('.spin-wrap.vision-spin').fadeOut();

                        } else if (post_subject['status'] = 2) {
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    this.message.name.name = '';
                    this.errorEditSubject = '';
                        this.sub.name = post_subject['data'][0].name;
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                    jQuery("#EditdetailModal").modal('hide');
                        }
                }, (error) => {
                    console.error(error);
                });
            } else {
                    this.errorEditSubject = "Subject Name Required!.";
            }
        }
    }
    }


    photoChangeEvent(fileInput: any) {
        this.photosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
            this.errorSubjectIcon = '';
    }
        else {
            this.errorSubjectIcon = "Invalid image format";
            this.errorAddSubject = '';
            this.errorEditSubject = '';
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

}