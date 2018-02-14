import {Component, OnInit} from '@angular/core';
import {GridDataService,PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';

declare var jQuery: any;
declare var noty: any;
declare var require: any;
 
@Component({
    selector: 'master-wall',
    template: require('./masterWall.html'),
    pipes: [DateFormatPipe],
     host: { 'class': 'ng-animate page1Container' }
})

export class MasterWallComponent {
    public user;
    public errorMessage: string;
    private _dataUrlDegree = 'api/subject/getSubjectData/';
    public msg:string;
    public degreeId:any;
    public degree;
    public togComment:boolean=false;
    public thisElement:number;
    router: Router; 
    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams,router: Router) {
         this.degreeId = routeParams.get('degreeId');
         this.router=router;
    }

    ngOnInit() {
       // this.getMasterWall();
        if(this.page.wallId==''){
            this.router.navigate(['DashboardHome']);
        }
        this.page.friendProfileId='';
    }

    getMasterWall() {
        this.dataService.getData(this._dataUrlDegree + this.degreeId).subscribe(sub => {
            this.degree = sub;
        });

    }
      toggleComment(tog,key){
        
        this.togComment = tog;
        this.thisElement = key;
    }

}
