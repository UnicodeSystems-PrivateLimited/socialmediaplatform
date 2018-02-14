import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GridDataService, PageService } from '../../theme/services';




@Injectable()
export class EventService {

    private _saveEventWithIconUrl = "/api/groupevents/addEventWithIcon";
    private _saveEventUrl = "/api/groupevents/addEvent";
    private _editEventWithIconUrl = "/api/groupevents/editEventWithIcon";
    private _editEventUrl = "/api/groupevents/editEvent";
    private _getAllEvents = "/api/groupevents/getEvents";
    private _joinToEvent = "/api/groupevents/join";
    private _unJoinToEvent = "/api/groupevents/unjoin";

    constructor(private dataService: GridDataService, private pageService: PageService) {

    }

    public getAllEvents(): Observable<any> {
        return this.dataService.getData(this._getAllEvents);
    }
    public saveEventWithIcon(eventData): Observable<any> {
        return this.dataService.postFormData(this._saveEventWithIconUrl, eventData);
    }
    public saveEvent(eventData): Observable<any> {
        return this.dataService.postData(this._saveEventUrl, eventData);
    }
    public editEventWithIcon(eventId, eventData): Observable<any> {
        return this.dataService.postFormData(this._editEventWithIconUrl + '/' + eventId, eventData);
    }
    public editEvent(eventId, eventData): Observable<any> {
        return this.dataService.postData(this._editEventUrl + '/' + eventId, eventData);
    }
    public joinMember(eventId: number): Observable<any> {
        return this.dataService.postData(this._joinToEvent, { eventId: eventId });
    }
    public unJoinMember(eventId: number): Observable<any> {
        return this.dataService.postData(this._unJoinToEvent, { eventId: eventId });
    }
}