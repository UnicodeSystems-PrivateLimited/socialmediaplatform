import {Component, OnInit} from '@angular/core';
import {GridDataService,PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var require: any;
declare var noty: any;

@Component({
    selector: 'admin-profile',
    template: require('./adminProfile.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class AdminProfileComponent {
    public user;
    public errorMessage: string;
    public _saveUpdateUrl = 'api/user/saveUpdate';
    public _headerDataUrl = '/api/user/getHeaderData';
    router: Router;
    public _saveAdminUpdateUrl = 'api/user/saveAdminUpdate';
    public generalInformation = { userName: '', userEmail: '', userPass: '', userConfirmPass: '' };
    public login_details;
    public generalErrorNotice = '';
    public photosToUpload;
    public imageFile;
    public errorProfilePic = '';

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
    }

    ngOnInit() {
        this.getAccountData();
    }

    getAccountData() {
        this.dataService.getData(this._headerDataUrl).subscribe(header => {
                this.generalInformation.userName = header['data'].fname + ' ' + header['data'].lname;
                this.page.adminName = header['data'].fname + ' ' + header['data'].lname;
            this.generalInformation.userEmail = header['data'].local.email;
            this.page.adminProfilePic = header['data'].photo;
            this.login_details = header['data'].login_details;
        });
    }


    saveUpdate() {
        var letters = /^[a-z\d\-_\s]+$/i;
        var emailLetters = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (typeof (this.photosToUpload) != 'undefined' && this.photosToUpload.length > 0) {
            if (this.errorProfilePic == '') {
                if (this.generalInformation.userName.match(letters) && this.generalInformation.userName != '') {
                    if (this.generalInformation.userEmail.match(emailLetters) && this.generalInformation.userEmail != '') {
                        this.generalInformation.userPass = this.generalInformation.userPass ? this.generalInformation.userPass : '9@9@9@9@';
                        this.generalInformation.userConfirmPass = (this.generalInformation.userPass && this.generalInformation.userConfirmPass) ? this.generalInformation.userConfirmPass : '9@9@9@9@';
                            this.makeFileRequest(this._saveAdminUpdateUrl + '/' + this.generalInformation.userName + '/' + this.generalInformation.userEmail + '/' + this.generalInformation.userPass + '/' + this.generalInformation.userConfirmPass, [], this.photosToUpload).then((result) => {
                                if (result['status'] == 2) {
                                if (typeof (this.imageFile) != "undefined") {
                                    this.imageFile.target.value = "";
                                    }
                                this.generalInformation.userConfirmPass = this.generalInformation.userPass = '';
                                this.page.adminName = result['data'].fname + ' ' + result['data'].lname;
                                this.page.adminProfilePic = result['data'].photo + "?t=" + new Date().getTime();
                                    this.generalErrorNotice = result['message'];
                                    var n = noty({ text: '<div class="alert bg-theme-dark"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                                    }
                                else {
                                    this.generalErrorNotice = result['message'];
                                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                                }
                            });
                    } else {
                        this.generalErrorNotice = "Invalid User Email";
                        var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    }
                } else {
                    this.generalErrorNotice = "Invalid User Name";
                    var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                }
            }
        }
        else {
            if (this.errorProfilePic == '') {
                if (this.generalInformation.userName.match(letters) && this.generalInformation.userName != '') {
                    if (this.generalInformation.userEmail.match(emailLetters) && this.generalInformation.userEmail != '') {
                        this.dataService.postData(this._saveUpdateUrl, this.generalInformation).subscribe(result => {
                            if (result['status'] == 2) {
                                if (result['data'].fname != null && result['data'].fname != '' && typeof (result['data'].fname) != "undefined") {
                                    this.page.adminName = result['data'].fname + ' ' + result['data'].lname;
                                }
                                if (result['data'].photo != null && result['data'].photo != '' && typeof (result['data'].photo) != "undefined") {
                                    this.page.adminProfilePic = result['data'].photo + "?t=" + new Date().getTime();
                                }
                                this.generalErrorNotice = result['message'];

                                var n = noty({ text: '<div class="alert bg-theme-dark"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                            }
                            else {
                                this.generalErrorNotice = result['message'];
                                var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                            }
                        });
                    } else {
                        this.generalErrorNotice = "Invalid User Email";
                        var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                    }
                } else {
                    this.generalErrorNotice = "Invalid User Name";
                    var n = noty({ text: '<div class="alert bg-theme-error"><p><strong>' + this.generalErrorNotice + '</strong> </p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000, });
                }
            }
        }
    }



    photoChangeEvent(fileInput: any) {
        this.photosToUpload = <Array<File>>fileInput.target.files;
        this.imageFile = fileInput;
        if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
            this.errorProfilePic = '';
        }
        else {
            this.errorProfilePic = "Invalid image format";
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
