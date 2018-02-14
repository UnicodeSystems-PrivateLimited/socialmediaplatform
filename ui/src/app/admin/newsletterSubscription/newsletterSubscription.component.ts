import {Component, OnInit} from '@angular/core';
import {GridDataService,PageService} from '../../theme/services';
import {Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {DateFormatPipe} from 'angular2-moment/DateFormatPipe';
import {TimeAgoPipe} from 'angular2-moment/TimeAgoPipe';
declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'master-newsletterSubscription',
    template: require('./newsletterSubscription.html'),
    pipes: [DateFormatPipe, TimeAgoPipe],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES]
})

export class NewsletterSubscriptionComponent {
    public user;
    public errorMessage: string;
    private _dataUrlSubscribers = 'api/subscriber/getSubscribers/';
    private _approveUrl = 'api/subscriber/approve/';
    router: Router;
    public subscribers;
    private paginate;
    public saveType;

    constructor(private dataService: GridDataService, private page: PageService, routeParams: RouteParams, router: Router) {
        this.router = router;
        this.paginate = 0;
    }

    ngOnInit() {
        this.getSubscribers('none');
    }

    getSubscribers(type) {
        this.saveType=type;
        if (type == 'none') {
            this.dataService.getData(this._dataUrlSubscribers + this.paginate).subscribe(subscribers => {
             this.subscribers = subscribers.data; });
        }
        if (type == 'next') {
            this.paginate++;
            this.dataService.getData(this._dataUrlSubscribers + this.paginate).subscribe(subscribers => {
              if(subscribers.data[0]) this.subscribers = subscribers.data;
              else this.paginate--;
             });    
        }
        if (type == 'pre') {
            if(this.paginate>0)
            this.paginate--;
            this.dataService.getData(this._dataUrlSubscribers + this.paginate).subscribe(subscribers => {
          this.subscribers = subscribers.data; });
        }
    }
    aprove(obj,status) {
        this.dataService.getData(this._approveUrl + obj._id + '/'+ status).subscribe(
            res => {
                if(res['status']==2){
                    obj.status=res['data'].status;
                    this.getSubscribers(this.saveType);
                    if(obj.status==2) var n = noty({ text: '<div class="alert bg-theme-dark"><p>User Subscribed.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                    else var n = noty({ text: '<div class="alert bg-theme-dark"><p>User Unsubscribed.</p></div>', layout: 'topRight', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                } 
        });
    }

}
