import {Component, OnInit} from '@angular/core';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'master-degree',
    template: require('./degree.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class DegreeComponent {
    public user;
    public errorMessage: string;
    private _dataUrlDegree = 'api/degree/getAllDegree/';
    private _dataUrlAddDegree = 'api/degree/addnewDegree';
    private _dataUrlUpdateDegree = 'api/degree/updateNewDegreeById/';
    private _dataUrlDeleteDegree = 'api/degree/delete/';
    private _degreeSearch = 'api/degree/degreeSearch/';
    public _dataUrlAddOnlyDegree = 'api/degree/addOnlyDegree';
    public _dataUrlUpdateOnlyDegree = 'api/degree/updateOnlyDegree/';
    public imageFile;
    public message = { name: { name: '' }, type: { type: '' } };
    public deleteDegree;
    public photosToUpload;
    public degrees;
    public error = { degreeIcon: '', degreename: '', degreeOption: '' };
    public updateDegreeId;
    public degreeName;
    public counter = 1;
    public total_degrees;
    public total_pages;
    public total_pages_left = 0;
    public total_pages_more = 0;
    public errorSearch;
    public degreename = { name: '' };
    public contentLoding: boolean = false;
    public types;
    public deg;
    public type = { type: '' };
    router: Router;
    public errorCsvFile = ''
    public fileToUpload;
    public csvFile;
    public _dataUrlAddBulkDegree = 'api/degree/addBulkDegree';
    public parseVar;
    public deleteDegId;
    public index;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
    }

    ngOnInit() {
        this.getAllDegrees();
        this.total_pages_left = 0;
        this.types =
            [{ "type": 2, "name": 'Bachelor' },
                { "type": 6, "name": 'Master' }]
    }

    ngAfterViewInit() {
        setTimeout(function () {
            jQuery("#detailBtn2").click(function () {
                jQuery("#detailModal").modal({ backdrop: false });
            });
        }, 100);
        setTimeout(function () {
            jQuery("#detailBtn3").click(function () {
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

    degreeBulkUpload() {
        if (typeof (this.fileToUpload) != 'undefined' && this.fileToUpload.length > 0) {
            if (this.errorCsvFile == '') {
                jQuery('.spin-wrap.vision-spin').fadeIn();
                this.makeFileRequest(this._dataUrlAddBulkDegree, [], this.fileToUpload).then((result) => {
                    this.errorCsvFile = '';
                    this.csvFile.target.value = '';
                    this.getAllDegrees();
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

    getDegree(event) {
        if (!this.degreename.name) {
            this.counter = 1;
            this.errorSearch = "";
            this.getAllDegrees();
        }
        else {
            var nameValid = /^[a-z\d-_.(){}\,\s]+$/i;
            if (this.degreename.name.match(nameValid)) {
                this.dataService.postData(this._degreeSearch, this.degreename).subscribe(res => {
                    if (res.status == 2) {
                        this.degrees = res.data;
                        this.errorSearch = "";
                    }
                });
            } else {
                this.errorSearch = "Invalid Search Input!.";
            }
        }
    }

    getAllDegrees() {
        this.counter = 1;
        this.contentLoding = true;
        this.dataService.getData(this._dataUrlDegree + this.counter).subscribe(degrees => {
            this.degrees = degrees.data;
            this.total_degrees = degrees.total_degrees;
            this.parseVar = this.total_degrees / 50;
            this.total_pages = parseInt(this.parseVar);
            this.total_pages_left = this.total_pages - 1;
            this.contentLoding = false;
        });
    }


    getAllDegreePaginationNext() {
        if (this.total_pages_left < this.total_pages && this.total_pages_left >= 0) {
            this.counter++;
            this.dataService.getData(this._dataUrlDegree + this.counter).subscribe(degrees => {
                this.degrees = degrees.data;
                this.total_pages_left = this.total_pages_left - 1;
            });
        }
        else {
            console.log("no more pages left");
        }
    }

    getAllDegreePaginationPrevious() {
        if (this.total_pages_left + 1 !== this.total_pages) {
            this.counter--;
            this.dataService.getData(this._dataUrlDegree + this.counter).subscribe(degrees => {
                this.degrees = degrees.data;
                this.total_pages_left = this.total_pages_left + 1;
            });
        }
        else {
            console.log("no page left");
        }
    }

    deleteDegreeModal(id, i) {
        this.deleteDegId = id;
        this.index = i;
        jQuery("#degreeDeleteModal").modal({ backdrop: false });
    }

    deleteDegreeById() {
        this.dataService.getData(this._dataUrlDeleteDegree + this.deleteDegId).subscribe(deleteDegree => {
            this.deleteDegree = deleteDegree.data;
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Degree Deleted.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            //  this.getAllDegrees();
            this.degrees.splice(this.index, 1);
        });

    }
    refreshModal() {
        this.message.name.name = '';
        this.error.degreeIcon = "";
        this.error.degreename = '';
        this.error.degreeOption = '';
        this.message.type.type = '';
        if (typeof (this.imageFile) != "undefined")
            this.imageFile.target.value = "";
    }

    addDegree() {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.error.degreeIcon == '') {
            if (typeof this.message.name.name != 'undefined' && this.message.name.name != null && this.message.name.name != '') {
                if (typeof this.message.type.type != 'undefined' || this.message.type.type != null || this.message.type.type != '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.makeFileRequest(this._dataUrlAddDegree + '/' + this.message.name.name + '/' + this.message.type.type, [], this.photosToUpload).then((result) => {
                        if (result['status'] == 3) {
                            this.message.name.name = '';
                            this.message.type.type = '';
                            this.photosToUpload = '';
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            this.getAllDegrees();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            jQuery("#detailModal").modal('hide');
                        } else if (result['status'] = 2) {
                            this.photosToUpload = '';
                            this.message.name.name = '';
                            this.message.type.type = '';
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            this.degrees.splice(0, 0, result['data']);
                            this.getAllDegrees();
                            jQuery("#detailModal").modal('hide');
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        }
                    }, (error) => {
                        console.error(error);
                    });
                }
                else {
                    this.error.degreeIcon = '';
                    this.error.degreeOption = "Select the degree option!";
                    this.error.degreename = '';
                }
            } else {
                this.error.degreeIcon = '';
                this.error.degreeOption = '';
                this.error.degreename = "Degree name is required!.";
            }
        } else {
            if (this.error.degreeIcon == '') {
                if (typeof this.message.name.name != 'undefined' && this.message.name.name != null && this.message.name.name != '') {
                    if (typeof this.message.type.type != 'undefined' && this.message.type.type != null && this.message.type.type != '') {
                        this.dataService.postData(this._dataUrlAddOnlyDegree, this.message).subscribe(post_subject => {
                            if (post_subject['status'] == 3) {
                                this.message.name.name = '';
                                this.message.type.type = '';
                                this.error.degreename = '';
                                this.error.degreeOption = '';
                                this.getAllDegrees();
                                jQuery("#detailModal").modal('hide');
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            } else if (post_subject['status'] = 2) {
                                this.message.name.name = '';
                                this.message.type.type = '';
                                this.error.degreename = '';
                                this.error.degreeOption = '';
                                this.degrees.splice(0, 0, post_subject.data);
                                this.getAllDegrees();
                                jQuery("#detailModal").modal('hide');
                                var n = noty({ text: '<div clas s="alert bg-theme-dark"><p>Degree Added.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            }
                        }, (error) => {
                            console.error(error);
                        });
                    }
                    else {
                        this.error.degreeIcon = '';
                        this.error.degreeOption = "Select the degree option!";
                        this.error.degreename = '';
                    }
                } else {
                    this.error.degreeIcon = '';
                    this.error.degreeOption = '';
                    this.error.degreename = "Degree name is required!.";
                }
            }
        }
    }

    updateId(deg) {
        this.deg = deg;
        this.updateDegreeId = deg._id;
        this.degreeName = deg.name;
        this.message.name.name = deg.name;
        if (deg.type == 1 || deg.type == 2 || deg.type == 3 || deg.type == 4) {
            deg.type = 2;
            this.message.type.type = deg.type;
        }
        else if (deg.type == 5 || deg.type == 6) {
            deg.type = 6;
            this.message.type.type = deg.type;

        }
        this.error.degreeOption = '';
        this.error.degreename = "";
        jQuery("#EditdetailModal").modal({ backdrop: false });
    }

    onChangetype(typeval) {
        this.message.type.type = typeval;
    }

    updateDegreeById() {
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0 && this.error.degreeIcon == '') {
            if (typeof this.message.name.name != 'undefined' && this.message.name.name != null && this.message.name.name != '') {
                if (typeof this.message.type.type != 'undefined' || this.message.type.type != null || this.message.type.type != '') {
                    jQuery('.spin-wrap.vision-spin').fadeIn();
                    this.makeFileRequest(this._dataUrlUpdateDegree + this.updateDegreeId + '/' + this.message.name.name + '/' + this.message.type.type, [], this.photosToUpload).then((result) => {
                        if (result['status'] == 3) {
                            this.message.name.name = '';
                            this.message.type.type = '';
                            this.photosToUpload = '';
                            if (typeof (this.imageFile) != "undefined")
                                jQuery("#EditdetailModal").modal('hide');
                            this.imageFile.target.value = "";
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                        } else if (result['status'] = 2) {
                            this.photosToUpload = '';
                            this.message.name.name = '';
                            this.message.type.type = '';
                            if (typeof (this.imageFile) != "undefined")
                                this.imageFile.target.value = "";
                            this.deg.name = result['data'][0].name;
                            this.deg.icon = result['data'][0].icon + "?t=" + new Date().getTime();
                            this.deg.type = result['data'][0].type;
                            jQuery("#EditdetailModal").modal('hide');
                            jQuery('.spin-wrap.vision-spin').fadeOut();
                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + result['msg'] + '</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                        }
                    }, (error) => {
                        console.error(error);
                    });
                } else {
                    this.error.degreeIcon = '';
                    this.error.degreeOption = "Select the degree option!";
                    this.error.degreename = '';
                }
            } else {
                this.error.degreeIcon = '';
                this.error.degreeOption = '';
                this.error.degreename = "Degree name is required!.";
            }
        } else {
            if (this.error.degreeIcon == '') {
                if (typeof this.message.name.name != 'undefined' && this.message.name.name != null && this.message.name.name != '') {
                    if (typeof this.message.type.type != 'undefined' && this.message.type.type != null && this.message.type.type != '') {
                        jQuery('.spin-wrap.vision-spin').fadeIn()
                        this.dataService.postData(this._dataUrlUpdateOnlyDegree + this.updateDegreeId, this.message).subscribe(post_subject => {
                            if (post_subject['status'] == 3) {
                                this.message.name.name = '';
                                this.message.type.type = '';
                                this.error.degreename = '';
                                this.error.degreeOption = '';
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                jQuery("#EditdetailModal").modal('hide');
                            } else if (post_subject['status'] = 2) {
                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>' + post_subject['msg'] + '.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                this.message.name.name = '';
                                this.message.type.type = '';
                                this.error.degreename = '';
                                this.error.degreeOption = '';
                                this.deg.name = post_subject['data'][0].name;
                                this.deg.type = post_subject['data'][0].type;
                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                jQuery("#EditdetailModal").modal('hide');
                            }
                        }, (error) => {
                            console.error(error);
                        });
                    }
                    else {
                        this.error.degreeIcon = '';
                        this.error.degreeOption = "Select the degree option!";
                        this.error.degreename = '';
                    }
                } else {
                    this.error.degreeIcon = '';
                    this.error.degreeOption = '';
                    this.error.degreename = "Degree name is required!.";
                }
            }
        }
    }


    photoChangeEvent(fileInput: any) {
        this.photosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
            this.error.degreeIcon = '';
        }
        else {
            this.error.degreeIcon = "Invalid image format";
            this.error.degreename = '';
            this.error.degreeOption = '';
        }
    }

    makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append("avatar", files[0]);
            xhr.onreadystatechange = function () {
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
