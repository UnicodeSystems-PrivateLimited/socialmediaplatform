import { Component, OnInit, AfterViewInit, ElementRef} from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { GridDataService, PageService } from '../../theme/services';
import { MapLoader } from './mapLoader';
declare var noty: any;
declare var require: any;
// declare var google;

export class ContactData {
    public fname: string = null;
    public email: string = null;
    public subject: string = null;
    public message: string = null;
}

@Component({
    selector: 'contactus',
    template: require('./contactus.html'),
    pipes: [],
    directives: [RouterOutlet, RouterLink, ROUTER_DIRECTIVES],
    host: { 'class': 'ng-animate page1Container' }
})

export class ContactUsComponent {

    public contactData: ContactData = new ContactData();
    private _sendContactUrl: string = '/api/user/send/contactInformation';
    public gMap: any;
    public mapElement: HTMLElement;

    constructor(
        private dataService: GridDataService,
        private page: PageService,
        private routeParams: RouteParams,
        router: Router,
        private _elementRef: ElementRef
    ) {

    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });

    }
    ngAfterViewInit() {
        this.mapElement = document.getElementById('map');
        this.loadMap();
    }

    public onSubmit() {

        if (this.contactData.fname && this.contactData.email && this.contactData.message && this.contactData.subject) {
            if (this.page.validateEmail(this.contactData.email)) {
                this.page.showLoader();
                this.dataService.postData(this._sendContactUrl, this.contactData).subscribe((res) => {
                    if (res.status == 2) {
                        this.contactData = new ContactData();
                        this.page.showSuccess("Thank you for contacting StribeIN. Please allow us some time to reconnect to address your  reason for connecting.Wish you have a wonderful day. Smile & Enjoy Life!");
                    }
                    this.page.hideLoader();
                })
            } else {
                this.page.showError('Please enter a valid email!');
            }
        } else {
            this.page.showError('All Fields Required!');
        }
    }
    public loadMap() {
        MapLoader.load().then((gMap) => {
            this.gMap = gMap;
            console.log("gMap", gMap);
            let user_latitude:number=40.806678;
            let user_longitude:number=-74.103263;
            let options: any = {
                center: new gMap.LatLng(user_latitude, user_longitude),
                zoom: 15,
                mapTypeId: gMap.MapTypeId.ROADMAP
            };
            let map = new gMap.Map(this.mapElement,options );
            // console.log("map", map);
            let marker = new gMap.Marker({
                map: map,
                position:new gMap.LatLng(user_latitude, user_longitude)
            });
        });
    }


}
