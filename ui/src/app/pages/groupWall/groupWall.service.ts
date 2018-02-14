import { Injectable } from '@angular/core';
import { GridDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';

@Injectable()

export class GroupWallService {

    private _dataUrl = '/api/user/profile/full';
    private _dataProfileByUser = 'api/user/getUserProfileData/';
    private _getGroupDetailUrl = 'api/group/getGroupData/';
    private _getGroupPostUrl = 'api/group_post/getGroupWallPostById/';
    private _getDeleteGroupPostUrl = 'api/group_post/delete/';
    private _getSearchUrl = '/api/group_post/getGroupSearchedPostsById/';
    private _updateLastVisitCounter = '/api/group/updateLastVisit';
    private _headerDataUrl = '/api/user/getHeaderData';

    constructor(private dataService: GridDataService) {

    }
    public getUserProfile(): Observable<any> {
        return this.dataService.getData(this._dataUrl);
    }
    public getProfileByUser(id: number): Observable<any> {
        return this.dataService.getData(this._dataProfileByUser + id);
    }
    public deletePost(id: number, groupId: number): Observable<any> {
        return this.dataService.getData(this._getDeleteGroupPostUrl + id + '/' + groupId);
    }

    public getGroupDetails(id: number): Observable<any> {
        return this.dataService.getData(this._getGroupDetailUrl + id);
    }
    public getGroupPosts(id: number, postType: number, counter: number): Observable<any> {
        return this.dataService.getData(this._getGroupPostUrl + id + '/' + postType + '/' + counter);
    }
    public searchPost(groupId: number, counter: number, postType: number, searchFromDate: any, searchToDate: any, category: number, who_posted: any): Observable<any> {
        return this.dataService.getData(this._getSearchUrl + groupId + '/' + counter + '/' + postType + '/' + searchFromDate + '/' + searchToDate + '/' + category + '/' + who_posted);
    }
    public updateLastVisit(id: number): Observable<any> {
        return this.dataService.getData(this._updateLastVisitCounter + '/' + id);
    }
    public getHeaderData(): Observable<any> {
        return this.dataService.getData(this._headerDataUrl);
    }
}