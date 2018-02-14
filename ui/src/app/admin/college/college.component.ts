import {Component, OnInit} from '@angular/core';
import {GridDataService,PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'admin-college',
    template: require('./college.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class CollegeComponent {
    public user;
    public errorMessage: string;
    private _dataUrlCollege = 'api/college/getAllCollege/';
    private _dataUrlAddCollege = 'api/college/addCollege';
    private _dataUrlUpdateCollege = 'api/college/updateCollegeById/';
    private _dataUrlDeleteCollege = 'api/college/delete/';
    private _collegeSearch = 'api/college/collegeSearch/';
    private _dataUrlAddOnlyCollege = 'api/college/addOnlyCollege';
    private _dataUrlUpdateOnlyCollege = 'api/college/updateOnlyCollegeById';
    public message = { name: { name: '' } };
    public deleteCollege;
    public photosToUpload;
    public colleges;
    public imageFile;
    public updateCollegeId;
    public collegeName;
    public counter = 1;
    public col;
    public total_colleges;
    public total_page;
    public total_colleges_var;
    public errorAddCollege;
    public errorSearch;
    public errorCollegeIcon='';
    public errorUpdateCollege;
    public total_pages;
    public total_pages_left = 0;
    public total_pages_more = 0;
    public collegename = { name: '' };
    public contentLoding: boolean = false;
    router: Router;
    public errorCsvFile = ''
    public fileToUpload;
    public csvFile;
    public _dataUrlAddBulkCollege = 'api/college/addBulkCollege';
    public deleteColId;
    public index;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
    }

    ngOnInit() {
        this.getAllColleges();
        this.total_pages_left = 0;
    }

    ngAfterViewInit() {
        setTimeout(function() {
            jQuery("#detailBtn2").click(function() {
                jQuery("#detailModal").modal({ backdrop: false });
            });
        }, 100);
        setTimeout(function() {
            jQuery("#detailBtn3").click(function() {
                jQuery("#EditdetailModal").modal({ backdrop: false });
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


    collegeBulkUpload() {
        if (typeof (this.fileToUpload) != 'undefined' && this.fileToUpload.length > 0) {
        if (this.errorCsvFile == '') {
                jQuery('.spin-wrap.vision-spin').fadeIn();
            this.makeFileRequest(this._dataUrlAddBulkCollege, [], this.fileToUpload).then((result) => {
                this.errorCsvFile = '';
                this.csvFile.target.value = '';
                    this.getAllColleges();
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

    getCollege(event) {
        if (!this.collegename.name) {
            this.counter = 1;
            this.errorSearch = "";
            this.getAllColleges();
        }
        else {
            var nameValid =  /^[a-z\d-_.(){}\,\s]+$/i;
            if (this.collegename.name.match(nameValid)) {
                this.dataService.postData(this._collegeSearch, this.collegename).subscribe(res => {
                    if (res.status == 2) {
                        this.colleges = res.data;
                        this.errorSearch = "";
                    }
                });
            } else {
                this.errorSearch = "Invalid Search Input!.";
            }
        }
    }

    getAllColleges() {
        this.counter = 1;
        this.contentLoding = true;
        this.dataService.getData(this._dataUrlCollege + this.counter).subscribe(colleges => {
            this.colleges = colleges.data;
            this.total_colleges = colleges.total_colleges;
            this.total_colleges_var=this.total_colleges / 50;
            this.total_pages = parseInt( this.total_colleges_var);
            this.total_pages_left = this.total_pages - 1;
            this.contentLoding = false;
        });

    }

    getAllCollegePaginationNext() {
        if (this.total_pages_left < this.total_pages && this.total_pages_left >= 0) {
            this.counter++;
            this.dataService.getData(this._dataUrlCollege + this.counter).subscribe(colleges => {
                this.colleges = colleges.data;
                this.total_pages_left = this.total_pages_left - 1;
            });
        }
        else {
            console.log("no more pages left");
        }
    }

    getAllCollegePaginationPrevious() {
        if (this.total_pages_left + 1 !== this.total_pages) {
            this.counter--;
            this.dataService.getData(this._dataUrlCollege + this.counter).subscribe(colleges => {
                this.colleges = colleges.data;
                this.total_pages_left = this.total_pages_left + 1;
            });
        }
        else {
            console.log("no page left");
        }
    }

    deleteCollegeModal(id,i){
    this.deleteColId=id;
    this.index=i;
    jQuery("#collegeDeleteModal").modal({ backdrop: false });
    }

    deleteCollegeById() {
        this.dataService.getData(this._dataUrlDeleteCollege + this.deleteColId).subscribe(deleteSubject => {
            this.deleteCollege = deleteSubject.data;
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>College Deleted.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
          //  this.getAllColleges();
          this.colleges.splice(this.index, 1);
        });
    }

    addCollege() {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.errorCollegeIcon == '') {
            if (typeof (this.message.name.name) != 'undefined' && this.message.name.name != null && this.message.name.name != '') {
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.makeFileRequest(this._dataUrlAddCollege + '/' + this.message.name.name, [], this.photosToUpload).then((result) => {
                    if (result['status'] == 3) {
                        this.message.name.name = '';
                        this.errorAddCollege = '';
                        this.photosToUpload = '';
                        if (typeof (this.imageFile) != "undefined")
                            this.imageFile.target.value = "";
                        this.getAllColleges();
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        jQuery("#detailModal").modal('hide');
                    } else if (result['status'] = 2) {
                    this.photosToUpload = '';
                    this.message.name.name = '';
                    this.errorAddCollege = '';
                        if (typeof (this.imageFile) != "undefined")
                    this.imageFile.target.value = "";
                    this.colleges.splice(0, 0, result['data']);
                    this.getAllColleges();
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    jQuery("#detailModal").modal('hide');
                    }
                }, (error) => {
                    console.error(error);
                });
            } else {
                this.errorCollegeIcon = '';
                this.errorAddCollege = "College Name Required!.";
            }
        } else {
            if (this.errorCollegeIcon == '') {
                if (this.message.name.name != '' && this.message.name.name!=null) {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                        this.dataService.postData(this._dataUrlAddOnlyCollege, this.message.name).subscribe(post_college => {
                        if (post_college['status'] == 3) {
                            this.message.name.name = '';
                            this.errorAddCollege = '';
                            this.getAllColleges();
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#detailModal").modal('hide');
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_college['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        } else if (post_college['status'] = 2) {
                        this.message.name.name = '';
                        this.errorAddCollege = '';
                        this.colleges.splice(0, 0, post_college.data);
                        this.getAllColleges();
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                        jQuery("#detailModal").modal('hide');
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_college['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        }
                    }, (error) => {
                        console.error(error);
                    });
                } else {
                    this.errorCollegeIcon = '';
                    this.errorAddCollege = "Subject Name Required!.";
                }
            }
        }
    }

    clearAddModal() {
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
        this.message.name.name = '';
        this.errorCollegeIcon = '';
        this.photosToUpload = '';
        this.errorAddCollege = '';
        this.errorUpdateCollege = '';
    }

    updateId(col) {
        this.col=col;
        this.updateCollegeId = col._id;
        this.collegeName = col.name;
        this.message.name.name = col.name;
        this.errorUpdateCollege = '';
        this.errorCollegeIcon = '';
        jQuery("#EditdetailModal").modal({ backdrop: false });
    }


    updateCollegeById() {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.errorCollegeIcon == '') {
            if (typeof (this.message.name.name) != 'undefined' && this.message.name.name != null && this.message.name.name != '') {
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.makeFileRequest(this._dataUrlUpdateCollege + this.updateCollegeId + '/' + this.message.name.name, [], this.photosToUpload).then((result) => {
                    if (result['status'] == 3) {
                        this.message.name.name = '';
                        this.errorUpdateCollege = '';
                        this.photosToUpload = '';
                        if (typeof (this.imageFile) != "undefined")
                            this.imageFile.target.value = "";
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                        jQuery("#EditdetailModal").modal('hide');
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    } else if (result['status'] = 2) {
                    this.photosToUpload = '';
                    this.message.name.name = '';
                    this.errorUpdateCollege = '';
                        if (typeof (this.imageFile) != "undefined")
                    this.imageFile.target.value = "";
                    this.col.name=result['data'][0].name;
                    this.col.icon = result['data'][0].icon + "?t=" + new Date().getTime();
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                    jQuery("#EditdetailModal").modal('hide');
                        var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    }
                }, (error) => {
                    console.error(error);
                });
            } else {
                this.errorCollegeIcon = '';
                this.errorUpdateCollege = "College Name Required!.";
            }
        } else {
            if (this.errorCollegeIcon == '') {
                if (this.message.name.name != '' && this.message.name.name!=null) {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                        this.dataService.postData(this._dataUrlUpdateOnlyCollege + '/' + this.updateCollegeId, this.message.name).subscribe(post_college => {
                        if (post_college['status'] == 3) {
                            this.message.name.name = '';
                            this.errorUpdateCollege = '';
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#EditdetailModal").modal('hide');
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_college['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        } else if (post_college['status'] = 2) {
                        this.message.name.name = '';
                        this.errorUpdateCollege = '';
                        this.col.name=post_college['data'][0].name;
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                        jQuery("#EditdetailModal").modal('hide');
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>College Updated.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        }
                    }, (error) => {
                        console.error(error);
                    });
                } else {
                    this.errorCollegeIcon = '';
                    this.errorUpdateCollege = "Subject Name Required!.";
                }
            }
        }
    }



    photoChangeEvent(fileInput: any) {
        this.photosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
            this.errorCollegeIcon = '';
        }
        else {
            this.errorCollegeIcon = "Invalid image format";
            this.errorAddCollege = '';
            this.errorUpdateCollege = '';
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
