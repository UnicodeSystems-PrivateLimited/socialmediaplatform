import {Component, OnInit} from '@angular/core';
import {GridDataService,PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var require: any;
declare var noty: any;

@Component({
    selector: 'master-setting',
    template: require('./scheduling.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class SchedulingComponent {
    public user;
    public errorMessage: string;
    private _dataUrlTemplate = 'api/template/getSchedules/';
    router: Router;
    public schedule;
    private paginate;
    public contentLoding: boolean = false;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.paginate = 0;
    }

    ngOnInit() {
        this.getTemplates('none');
        var currentdate = new Date(); 
        var datetime = "Todays date: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    }

    getTemplates(type) {
        if (type == 'none') {
            this.dataService.getData(this._dataUrlTemplate + this.paginate).subscribe(schedule => {
              this.schedule = schedule.data;
            });
        }
        if (type == 'next') {
            this.paginate++;
            this.dataService.getData(this._dataUrlTemplate + this.paginate).subscribe(schedule => {
                if (schedule.data[0]) this.schedule = schedule.data;
                else this.paginate--;
            });
        }
        if (type == 'pre') {
            if (this.paginate > 0)
                this.paginate--;
            this.dataService.getData(this._dataUrlTemplate + this.paginate).subscribe(schedule => {
               this.schedule = schedule.data;
            });
        }
    }

}

