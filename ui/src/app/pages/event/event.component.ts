import { Component, ViewEncapsulation, OnInit, AfterViewInit, ViewChild, ViewChildren } from '@angular/core';
import { BaFullCalendar } from '../../theme/components';
import { GridDataService, PageService } from '../../theme/services';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DateFormatPipe } from 'angular2-moment/DateFormatPipe';
import { TimeAgoPipe } from 'angular2-moment/TimeAgoPipe';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { CalendarPipe } from 'angular2-moment/CalendarPipe';
import { AddEditEvent, EventErrorMessage } from '../../theme/interfaces';
import { moment } from '../../moment.loder';
import { EventService } from './event.service';
import { ThumbnailFileReader } from '../../theme/components';


declare var jQuery: any;
declare var noty: any;
declare var require: any;
declare var $: any;

@Component({
    selector: 'event',
    template: require('./event.html'),
    directives: [BaFullCalendar, TOOLTIP_DIRECTIVES, ThumbnailFileReader],
    host: { 'class': 'ng-animate page1Container' },
    pipes: [DateFormatPipe, TimeAgoPipe, CalendarPipe],
    providers: [EventService],
})

export class Event {

    public _dataUrlUserEvents = '/api/groupevents/getEventsByUserId';
    public _dataUrlDeleteEvent = '/api/groupevents/deletegroup';
    public photosToUpload: Array<any> = [];
    public eventdate = { to: '', from: '', start: '', end: '' };
    router: Router;
    public sliceDescription = [];
    public isDescription = [];
    public thumbnail: File | string = null;
    //****************Add/Edit Event *******************/
    public addEditEvent: AddEditEvent = new AddEditEvent();
    public errorEventMessage: EventErrorMessage = new EventErrorMessage();
    public eventId: number = null;
    public privacyType: number = 1;
    public loggedUserId: number = null;
    public events: Array<any> = [];
    public event: any = null;
    public imageFile;
    public eventDeleteId;
    public isLoader: boolean = false;
    @ViewChildren(ThumbnailFileReader) thumbnailFileReader: ThumbnailFileReader;


    constructor(router: Router, private eventService: EventService, private dataService: GridDataService, private page: PageService, routeParams: RouteParams) {
        this.router = router;
    }

    ngOnInit() {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 300 });
        this.page.friendProfileId = '';
        this.page.wallId = '';
        this.getAllEvents();
    }

    getAllEvents() {
        this.isLoader = true;
        this.eventService.getAllEvents().subscribe(res => {
            if (res.status == 2) {
                if (res['data'].length)
                    this.events = res['data'];
                this.loggedUserId = res['logged'];
                for (var i = 0; i < this.events.length; i++) {
                    this.sliceDescription[i] = 142;
                    this.isDescription.push('true');
                }

            }
            this.isLoader = false;
        });
    }

    viewMoreDescription(i) {
        this.sliceDescription[i] = 10000;
        this.isDescription[i] = 'false';
    }
    viewLessDescription(i) {
        this.sliceDescription[i] = 142;
        this.isDescription[i] = 'true';
    }

    deleteModel(id) {
        this.eventId = id;
        jQuery("#eventDeleteModal").modal({ backdrop: false });
    }

    deleteEvent() {
        this.dataService.getData(this._dataUrlDeleteEvent + '/' + this.eventId).subscribe(res => {
            var n = noty({ text: '<div class="alert bg-theme-dark"><p> Event Deleted.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
            this.getAllEvents();
        });
    }

    createEvent() {
        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.addEditEvent.title && this.addEditEvent.title.match(letters)) {
            if (this.addEditEvent.tagline && this.addEditEvent.tagline.match(letters)) {
                if (this.addEditEvent.description) {
                    if (this.addEditEvent.location && this.addEditEvent.location.match(letters)) {
                        let startDate = jQuery("#scheduleDate1").val();
                        let endDate = jQuery("#scheduleDate2").val();
                        let startTime = jQuery("#scheduleTime1").val();
                        let endTime = jQuery("#scheduleTime2").val();
                        startDate = startDate.split('-');
                        endDate = endDate.split('-');
                        this.addEditEvent.event_date_from = moment(new Date(startDate[1] + '-' + startDate[0] + '-' + startDate[2] + ' ' + startTime)).format();
                        this.addEditEvent.event_date_to = moment(new Date(endDate[1] + '-' + endDate[0] + '-' + endDate[2] + ' ' + endTime)).format();
                        let currentDate = moment(new Date()).format();
                        if (startDate && endDate) {
                            if (moment(this.addEditEvent.event_date_from).isSameOrAfter(currentDate)) {
                                if (moment(this.addEditEvent.event_date_to).isSameOrAfter(this.addEditEvent.event_date_from)) {
                                    if (this.photosToUpload.length > 0) {
                                        this.addEditEvent.icon = this.photosToUpload;
                                        if (this.errorEventMessage.errorIcon == '') {
                                            jQuery('.spin-wrap.vision-spin').fadeIn();
                                            this.eventService.saveEventWithIcon(this.addEditEvent).subscribe((res) => {
                                                jQuery("#eventModal").modal('hide');
                                                this.photosToUpload = [];
                                                this.addEditEvent = new AddEditEvent();
                                                this.errorEventMessage = new EventErrorMessage();
                                                // this.imageFile.target.value = "";
                                                this.thumbnail = null;
                                                this.thumbnailFileReader['_results'][0].picture = null;
                                                this.thumbnailFileReader['_results'][1].picture = null;
                                                this.getAllEvents();
                                                jQuery("#scheduleDate1").val('');
                                                jQuery("#scheduleDate2").val('');
                                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>New Event Created.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                            });
                                        }
                                    } else {
                                        jQuery('.spin-wrap.vision-spin').fadeIn();
                                        this.eventService.saveEvent(this.addEditEvent).subscribe(res => {
                                            jQuery("#eventModal").modal('hide');
                                            this.photosToUpload = [];
                                            this.addEditEvent = new AddEditEvent();
                                            this.errorEventMessage = new EventErrorMessage();
                                            this.getAllEvents();
                                            jQuery("#scheduleDate1").val('');
                                            jQuery("#scheduleDate2").val('');
                                            jQuery('.spin-wrap.vision-spin').fadeOut();
                                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>New Event Created.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                        });
                                    }
                                } else {
                                    this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.errorEventMessage.errorIcon = this.errorEventMessage.errorFromDate = "";
                                    this.errorEventMessage.errorToDate = "End Date should be Greater than or equal to Start Date";
                                }
                            } else {
                                this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.errorEventMessage.errorIcon = this.errorEventMessage.errorToDate = "";
                                this.errorEventMessage.errorFromDate = "Start date should be greater than or equal to current date";
                            }


                        } else {
                            this.errorEventMessage.errorDate = "Select the event date";
                            this.errorEventMessage.errorTagline = this.errorEventMessage.errorToDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorIcon = this.errorEventMessage.errorFromDate = "";
                        }
                    } else {
                        this.errorEventMessage.errorToDate = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = this.errorEventMessage.errorTitle = this.errorEventMessage.errorDescription = this.errorEventMessage.errorFromDate = "";
                        this.errorEventMessage.errorLocation = "Location field cannot be blank.";
                    }
                } else {
                    this.errorEventMessage.errorToDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = this.errorEventMessage.errorTitle = this.errorEventMessage.errorFromDate = "";
                    this.errorEventMessage.errorDescription = " Event Description Required.";
                }
            } else {
                this.errorEventMessage.errorToDate = this.errorEventMessage.errorTitle = this.errorEventMessage.errorDescription = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorFromDate = "";
                this.errorEventMessage.errorTagline = "Event tag line cannot be blank.";
            }
        } else {
            this.errorEventMessage.errorToDate = this.errorEventMessage.errorDescription = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = this.errorEventMessage.errorFromDate = "";
            this.errorEventMessage.errorTitle = "Event name cannot be blank. ";
        }
        jQuery("#img-dub-btn").click(function () {
            jQuery(".up-btn-cust").trigger('click');
        });
    }

    closeEventModel() {
        this.thumbnail = null;
        this.thumbnailFileReader['_results'][0].picture = null;
        this.thumbnailFileReader['_results'][1].picture = null;
        jQuery("#scheduleDate1").val('');
        jQuery("#scheduleDate2").val('');
        this.addEditEvent = new AddEditEvent();
        this.errorEventMessage = new EventErrorMessage();
    }

    setDateFormat(date) {
        return (date < 10 ? '0' : '') + date;
    }

    setMonthFormat(month) {
        return (month < 10 ? '0' : '') + month;
    }
    public getTimeFormat(date: Date) {
        var ddfrom = "AM";
        var hhfrom = date.getHours();
        var mfrom = date.getMinutes();
        var hfrom = hhfrom;
        var ddto = "AM";
        if (hfrom >= 12) {
            hfrom = hhfrom - 12;
            ddfrom = "PM";
        }
        if (hfrom == 0) {
            hfrom = 12;
        }
        var mfrom1 = mfrom < 10 ? "0" + mfrom : mfrom;
        var hfrom1 = hfrom < 10 ? "0" + hfrom : hfrom;
        return hfrom1 + ':' + mfrom1 + ' ' + ddfrom;
    }

    updateId(events) {
        this.event = events;
        this.eventId = events._id;
        this.addEditEvent.title = events.title;
        this.addEditEvent.tagline = events.tagline;
        this.addEditEvent.description = events.description;
        this.addEditEvent.location = events.location;
        this.addEditEvent.event_date_from = events.event_date_from;
        this.addEditEvent.event_date_to = events.event_date_to;
        this.addEditEvent.privacy = this.privacyType = events.privacy;
        var to = new Date(events.event_date_to);
        var froms = new Date(events.event_date_from);
        let startTime = this.getTimeFormat(froms);
        let endTime = this.getTimeFormat(to);


        // var ddto = "AM";
        // var hhto = to.getHours();
        // var mto = to.getMinutes();
        // var hto = hhto;
        // if (hto >= 12) {
        //     hto = hhto - 12;
        //     ddto = "PM";
        // }
        // if (hto == 0) {
        //     hto = 12;
        // }
        // var mto1 = mto < 10 ? "0" + mto : mto;
        // var hto1 = hto < 10 ? "0" + hto : hto;
        // this.eventsdata.event_time_from = hfrom1 + ':' + mfrom1 + ' ' + ddfrom;
        // this.eventsdata.event_time_to = hto1 + ':' + mto1 + ' ' + ddto;
        var month = froms.getMonth() + 1;
        var Month = to.getMonth() + 1;
        this.eventdate.to = this.setDateFormat(to.getDate()) + '-' + this.setMonthFormat(Month) + '-' + to.getFullYear();
        this.eventdate.from = this.setDateFormat(froms.getDate()) + '-' + this.setMonthFormat(month) + '-' + froms.getFullYear();
        jQuery("#scheduleDate3").val(this.eventdate.from);
        jQuery("#scheduleDate4").val(this.eventdate.to);
        jQuery("#scheduleTime3").val(startTime);
        jQuery("#scheduleTime4").val(endTime);
        jQuery("#eventEditModal").modal({ backdrop: false });
    }

    updateEvent() {

        var letters = /^[a-z\d\-_\s]+$/i;
        if (this.addEditEvent.title && this.addEditEvent.title.match(letters)) {
            if (this.addEditEvent.tagline && this.addEditEvent.tagline.match(letters)) {
                if (this.addEditEvent.description) {
                    if (this.addEditEvent.location && this.addEditEvent.location.match(letters)) {
                        let startDate = jQuery("#scheduleDate3").val();
                        let endDate = jQuery("#scheduleDate4").val();
                        let startTime = jQuery("#scheduleTime3").val();
                        let endTime = jQuery("#scheduleTime4").val();
                        startDate = startDate.split('-');
                        endDate = endDate.split('-');
                        this.addEditEvent.event_date_from = moment(new Date(startDate[1] + '-' + startDate[0] + '-' + startDate[2] + ' ' + startTime)).format();
                        this.addEditEvent.event_date_to = moment(new Date(endDate[1] + '-' + endDate[0] + '-' + endDate[2] + ' ' + endTime)).format();
                        let currentDate = moment(new Date()).format();
                        if (startDate && endDate) {
                            if (moment(this.addEditEvent.event_date_from).isSameOrAfter(currentDate)) {
                                if (moment(this.addEditEvent.event_date_to).isSameOrAfter(this.addEditEvent.event_date_from)) {
                                    if (this.photosToUpload.length > 0) {
                                        if (this.errorEventMessage.errorIcon == '') {
                                            this.addEditEvent.icon = this.photosToUpload;
                                            jQuery('.spin-wrap.vision-spin').fadeIn();
                                            this.eventService.editEventWithIcon(this.eventId, this.addEditEvent).subscribe((res) => {
                                                jQuery("#eventEditModal").modal('hide');
                                                this.eventdate.from = this.eventdate.to = '';
                                                // this.photosToUpload = this.eventsdata.event_date_from = this.eventsdata.event_date_to = "";
                                                this.addEditEvent = new AddEditEvent();
                                                this.errorEventMessage = new EventErrorMessage();
                                                this.photosToUpload = [];
                                                this.event.icon = res['data'].icon + "?t=" + new Date().getTime();
                                                this.event.title = res['data'].title;
                                                this.event.description = res['data'].description;
                                                this.event.location = res['data'].location;
                                                this.event.tagline = res['data'].tagline;
                                                this.event.privacy = res['data'].privacy;
                                                this.event.event_date_from = res['data'].event_date_from;
                                                this.event.event_date_to = res['data'].event_date_to;
                                                // this.imageFile.target.value = "";
                                                this.thumbnail = null;
                                                this.thumbnailFileReader['_results'][0].picture = null;
                                                this.thumbnailFileReader['_results'][1].picture = null;
                                                jQuery('.spin-wrap.vision-spin').fadeOut();
                                                var n = noty({ text: '<div class="alert bg-theme-dark"><p>Event Updated Successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                            });
                                        }
                                    } else {
                                        jQuery('.spin-wrap.vision-spin').fadeIn();
                                        this.eventService.editEvent(this.eventId, this.addEditEvent).subscribe(post_event => {
                                            jQuery("#eventEditModal").modal('hide');
                                            this.eventdate.from = this.eventdate.to = '';
                                            // this.photosToUpload = this.eventsdata.event_date_from = this.eventsdata.event_date_to = "";
                                            this.addEditEvent = new AddEditEvent();
                                            this.errorEventMessage = new EventErrorMessage();
                                            this.event.title = post_event['data'].title;
                                            this.event.description = post_event['data'].description;
                                            this.event.tagline = post_event['data'].tagline;
                                            this.event.location = post_event['data'].location;
                                            this.event.privacy = post_event['data'].privacy;
                                            this.event.event_date_from = post_event['data'].event_date_from;
                                            this.event.event_date_to = post_event['data'].event_date_to;
                                            jQuery('.spin-wrap.vision-spin').fadeOut();
                                            var n = noty({ text: '<div class="alert bg-theme-dark"><p>Event Updated Successfully.</p></div>', layout: 'center', theme: 'made', maxVisible: 10, animation: { open: 'animated fadeInLeft', close: 'animated fadeOutDown' }, timeout: 3000 });
                                        }, (error) => {
                                            console.error(error);
                                        });
                                    }
                                } else {
                                    this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.errorEventMessage.errorIcon = "";
                                    this.errorEventMessage.errorToDate = "End Date should be Greater than or equal to Start Date";
                                }
                            } else {
                                this.errorEventMessage.errorDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorTagline = this.errorEventMessage.errorIcon = this.errorEventMessage.errorToDate = "";
                                this.errorEventMessage.errorFromDate = "Start date should be greater than or equal to current date";
                            }
                        } else {
                            this.errorEventMessage.errorDate = "Select the event date";
                            this.errorEventMessage.errorTagline = this.errorEventMessage.errorToDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDescription = this.errorEventMessage.errorTitle = this.errorEventMessage.errorIcon = "";
                        }
                    } else {
                        this.errorEventMessage.errorToDate = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = this.errorEventMessage.errorTitle = this.errorEventMessage.errorDescription = "";
                        this.errorEventMessage.errorLocation = "Location field cannot be blank.";
                    }
                } else {
                    this.errorEventMessage.errorToDate = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = this.errorEventMessage.errorTitle = "";
                    this.errorEventMessage.errorDescription = " Event Description Required.";
                }
            } else {
                this.errorEventMessage.errorToDate = this.errorEventMessage.errorTitle = this.errorEventMessage.errorDescription = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = "";
                this.errorEventMessage.errorTagline = "Event tag line cannot be blank.";
            }
        } else {
            this.errorEventMessage.errorToDate = this.errorEventMessage.errorDescription = this.errorEventMessage.errorLocation = this.errorEventMessage.errorDate = this.errorEventMessage.errorIcon = this.errorEventMessage.errorTagline = "";
            this.errorEventMessage.errorTitle = "Event name cannot be blank. ";
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

    getEventMembers(id) {
        this.router.navigate(['EventMember', { eventId: id }]);

    }

    photoChangeEvent(fileInput: any) {
        this.photosToUpload[0] = fileInput.file[0];
        this.thumbnail = fileInput.file[0];
        if (this.photosToUpload[0].type == 'image/jpeg' || this.photosToUpload[0].type == 'image/tif' || this.photosToUpload[0].type == 'image/tiff' || this.photosToUpload[0].type == 'image/jpg' || this.photosToUpload[0].type == 'image/png' || this.photosToUpload[0].type == 'image/gif') {
            this.errorEventMessage.errorIcon = '';
        }
        else {
            this.errorEventMessage = new EventErrorMessage();
            this.errorEventMessage.errorIcon = "Invalid image format";
        }

    }

    getProfileById(id) {
        if (this.page.userIdGlobal == id) {
            this.router.navigate(['UserProfile', { tab: 2 }]);
        }
        else {
            this.page.friendProfileId = id;
            this.router.navigate(['ProfileByUserComponent', { userId: id, post_type: 1 }]);
        }
    }
    public openAddEventModel() {
        jQuery("#eventModal").modal({ backdrop: false });
        let startTime = this.getTimeFormat(new Date(new Date().getTime() + 900000));
        let endTime = this.getTimeFormat(new Date(new Date().getTime() + 1800000));
        jQuery("#scheduleTime2").val(endTime);
        jQuery("#scheduleTime1").val(startTime);
    }

    ngAfterViewInit() {

        setTimeout(function () {
            jQuery('input[name="sub-date-from-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        }, 500);
        setTimeout(function () {
            jQuery('.timepicker').timepicker({ showInputs: false, minuteStep: 15 });
        }, 2000);
    }

    public onSelectionChange(type: number): void {
        this.addEditEvent.privacy = type;
    }

    public checkJoinUnjoin(member: any) {
        let count = 0;
        for (let i in member) {
            if (member[i].user_id == this.loggedUserId) {
                count++;
                break;
            }
        }
        return count == 0 ? false : true;
    }

    public joinMember(eventId: number, index: number): void {
        this.eventService.joinMember(eventId).subscribe((res) => {
            if (res.status == 2) {
                this.events[index] = res.data;
                this.page.showSuccess(res.msg);
            }
        });
    }
    public LeaveMember(eventId: number, index: number): void {
        this.eventService.unJoinMember(eventId).subscribe((res) => {
            if (res.status == 2) {
                this.events[index] = res.data;
                this.page.showSuccess(res.msg);
            }
        });
    }

    public deleteThumbnail(event: any) {
        this.thumbnail = null;
    }

}
