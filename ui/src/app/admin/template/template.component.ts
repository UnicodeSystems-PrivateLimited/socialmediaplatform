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
    selector: 'master-template',
    template: require('./template.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class TemplateComponent {
    public user;
    public errorMessage: string;
    private _postUrlTemplate = 'api/template/add/';
    private _createSchedule = 'api/template/createSchedule/';
    private _dataUrlDeleteTemplate = 'api/template/remove/';
    private _getEditTemplate = 'api/template/getTemplateDataToEdit/';
    private _setEditTemplate = '/api/template/editTemplate/';
    private _dataUrlGetTemplate = 'api/template/getTemplate';
    router: Router;
    public template;
    public templateEdit = { name: '', subject: '', content: '', id: null };
    public templateData = { name: '', subject: '', content: '' };
    public schedule = { date: '', category: '' };
    private _dataUrlTemplate = 'api/template/getTamplates/';
    public paginate;
    private templateId;
    public contentLoding: boolean = false;
    public deleteTemplateId;
    
    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.paginate = 0;
    }

    ngOnInit() {
        this.getTemplates('none');
    }

    getTemplates(type) {
        if (type == 'none') {
            this.dataService.getData(this._dataUrlTemplate + this.paginate).subscribe(template => {
              this.template = template.data;
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
                jQuery("#detailModal").modal('hide');
                this.templateData.content = CKEDITOR.instances.editor1.setData('');
                this.templateData.name = '';
                this.templateData.subject = '';
            });
        }
        else {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p>All fields Required!</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
        }
    }

    clearTemplateData() {
        this.templateData.content = CKEDITOR.instances.editor1.setData('');
        this.templateData.name = '';
        this.templateData.subject = '';
    }

    addTemplateModal() {
        this.dataService.getData(this._dataUrlGetTemplate).subscribe(template => {
            CKEDITOR.instances.editor1.setData(template);
        });
        jQuery("#detailModal").modal({ backdrop: false });
    }

    setSchedule(object) {
    
    var date = new Date(object.ceated_on);
    var month = date.getUTCMonth() + 1; //months from 1-12
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();
    jQuery("#scheduleDate").val(day + '-' + month + '-' + year);
         this.templateId = object._id;
        jQuery("#EditdetailModal").modal({ backdrop: false });
    }

    deleteTemplateModal(object){
    this.deleteTemplateId=object._id;
    jQuery("#deleteTemplateModal").modal({ backdrop: false });
    }

    

    deleteTemplate() {
        this.dataService.getData(this._dataUrlDeleteTemplate + this.deleteTemplateId).subscribe(template => {
            if (template.status == 2) {
                for (var i = 0; i < this.template.length; i++) {
                    var obj = this.template[i];

                    if (obj._id == this.deleteTemplateId) {
                        this.template.splice(i, 1);
                    }
                }
            }
        });
    }

    refreshDate(){
    jQuery("#scheduleDate").val('');
    }

    saveSchedule() {
        var date = jQuery("#scheduleDate").val();
        var time = jQuery("#scheduleTime").val();
        date = date.split('-');
        this.schedule.date = date[1] + '-' + date[0] + '-' + date[2] + ' ' + time;
        if (this.schedule.date) {
            this.dataService.postData(this._createSchedule + this.templateId, this.schedule).subscribe(template => {
                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Schedule Created.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                this.schedule = { date: '', category: '' };
                jQuery("#scheduleDate").val('');
            });
        }
        else {
            jQuery("#EditdetailModal").modal({ backdrop: false });
        }
    }

    ngAfterViewInit() {
        setTimeout(function() {
            jQuery('input[name="sub-date-from-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        }, 500);
        setTimeout(function() {
            CKEDITOR.replace('editor1');
            CKEDITOR.replace('editor2');
            jQuery('.timepicker').timepicker({ showInputs: false });
        }, 200);
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
        jQuery("#EditTemplateModal").modal({ backdrop: false });
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
