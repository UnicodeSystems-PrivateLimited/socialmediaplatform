import {Component, OnInit} from '@angular/core';
import {GridDataService, PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var CKEDITOR: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'email-template',
    template: require('./emailTemplate.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class EmailTemplateComponent {
    public user;
    public errorMessage: string;
    private _postUrlTemplate = 'api/template/add/';
    private _createSchedule = 'api/template/createSchedule/';
    private _dataUrlDeleteTemplate = 'api/template/remove/';
    private _getEditTemplate = 'api/template/getOtherTemplateDataToEdit/';
    private _setEditTemplate = '/api/template/editOtherTemplate/';
    private _getRegEmailConfirmationStatusUrl = '/api/user/emailStatus';
    private _enableRegEmailConfirmationStatusUrl = '/api/user/enableEmailStatus';
    private _disableRegEmailConfirmationStatusUrl = '/api/user/disableEmailStatus';
    router: Router;
    public template;
    public templateEdit = { name: '', subject: '', content: '', id: null };
    public templateData = { name: '', subject: '', content: '' };
    public schedule = { date: '', category: '' };
    private _dataUrlTemplate = 'api/template/getOtherTamplates/';
    public paginate;
    private templateId;
    public contentLoding: boolean = false;
    public isRegConEnable: boolean | number = 0;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.paginate = 0;
    }

    ngOnInit() {
        this.getTemplates('none');
        this.getRegEmailConfirmationStatus();
    }

    public getRegEmailConfirmationStatus() {
        this.dataService.getData(this._getRegEmailConfirmationStatusUrl).subscribe((res) => {
            if (res.status == 2) {
                if (res.data) {
                    this.isRegConEnable = res.data.isRegConEnable;
                }
            }
        })
    }

    public enableRegEmail() {
        this.dataService.getData(this._enableRegEmailConfirmationStatusUrl).subscribe((res) => {
            if (res.status == 2) {
                this.isRegConEnable = 1;
                this.page.showSuccess('Register confirmation email enable successfully!');
            }
        });
    }

    public disableRegEmail() {
        this.dataService.getData(this._disableRegEmailConfirmationStatusUrl).subscribe((res) => {
            if (res.status == 2) {
                this.isRegConEnable = 0;
                this.page.showSuccess('Register confirmation email disable successfully!');
            }
        });
    }

    getTemplates(type) {
        if (type == 'none') {
            this.dataService.getData(this._dataUrlTemplate + this.paginate).subscribe(template => {
                this.template = template.data
            });
        }
        if (type == 'next') {
            this.paginate++;
            this.dataService.getData(this._dataUrlTemplate + this.paginate).subscribe(template => {
                if (template.data[0]) this.template = template.data;
                else this.paginate--;
            });
        }
        if (type == 'pre') {
            if (this.paginate > 0)
                this.paginate--;
            this.dataService.getData(this._dataUrlTemplate + this.paginate).subscribe(template => {
                this.template = template.data;
            });
        }
    }
    setTemplates() {
        this.templateData.content = CKEDITOR.instances.editor1.getData();
        if (this.templateData.name && this.templateData.subject && this.templateData.content) {
            this.dataService.postData(this._postUrlTemplate, this.templateData).subscribe(template => {
                this.template.push(template.data);
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>New Template Added.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.templateData = { name: '', subject: '', content: '' };
                CKEDITOR.instances.editor1.setData('');
            });
        }
        else {
            jQuery("#detailModal").modal({ backdrop: false });
        }
    }

    updateId() {
        jQuery("#EditdetailModal").modal({ backdrop: false });
    }

    ngAfterViewInit() {
        setTimeout(function () {
            jQuery("#detailBtn2").click(function () {
                jQuery("#detailModal").modal({ backdrop: false });
            });
        }, 100);
        setTimeout(function () {
            jQuery('input[name="sub-date-from-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        }, 500);

        setTimeout(function () {
            CKEDITOR.replace('editor1');
        }, 100);
        setTimeout(function () {
            CKEDITOR.replace('editor2');
        }, 100);
    }

    getEditTemplate(object) {
        this.templateEdit.id = object._id;
        this.dataService.postData(this._getEditTemplate, this.templateEdit).subscribe(template => {
            this.templateEdit.id = template.data.id;
            this.templateEdit.name = template.data.name;
            this.templateEdit.subject = template.data.subject;
            this.templateEdit.content = template.data.content;
            CKEDITOR.instances.editor2.setData(this.templateEdit.content);
        });
        jQuery("#EditdetailModal").modal({ backdrop: false });
    }

    setEditTemplate() {
        this.templateEdit.content = CKEDITOR.instances.editor2.getData();
        this.dataService.postData(this._setEditTemplate, this.templateEdit).subscribe(template => {
            for (var i in this.template) {
                if (this.template[i]._id == this.templateEdit.id) {
                    this.template[i] = template.data;
                }
            }
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Updated.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            this.templateEdit = { name: '', subject: '', content: '', id: null };
            CKEDITOR.instances.editor2.setData('');

        });
    }

}
