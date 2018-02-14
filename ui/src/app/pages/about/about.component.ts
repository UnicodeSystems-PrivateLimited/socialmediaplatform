import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { GridDataService, PageService } from '../../theme/services';


@Component({
    selector: 'about',
    template: require('./about.html'),
    pipes: [],
    host: { 'class': 'ng-animate page1Container' },
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES, ]
})


export class AboutComponent {
    router: Router;
    public page;

    constructor(router: Router, page: PageService, dataService: GridDataService) {
        this.router = router;
        this.page = page;
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
    }


}