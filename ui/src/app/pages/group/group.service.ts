import { Injectable } from '@angular/core';
import { GridDataService } from '../../theme/services';
import { AddGroups, GroupSearch } from '../../theme/interfaces';
import { Observable } from 'rxjs/Observable';


@Injectable()

export class GroupService {
    private _addNewGroupUrl = '/api/group/addGroup';
    private _getGroupListUrl = '/api/group/getGroups';
    private _deleteGroupUrl = '/api/group/delete';
    private _joinGroupUrl = '/api/group/join';
    private _leaveGroupUrl = '/api/group/leave';
    private _editGroupUrl = '/api/group/editGroup';
    private _headerDataUrl = '/api/user/getHeaderData';
    private _getGroupMember = '/api/group/getGroupMembers';
    private _getAllUserUrl = '/api/user/getAllSearchedMember';
    private _getSearchedGroupUrl = '/api/group/groupSearch';
    private _getSCDGroups = '/api/group/getGroups/scd/';
    private _getSCDSearchedGroupUrl = '/api/group/groupSearch/scd/';
    private _getUserGroupNotificationUrl = '/api/notification/userGroupNoti';
    private _acceptInviteUrl = '/api/group/acceptInvite';
    private _rejectInviteUrl = '/api/group/rejectInvite';
    private _removeScdUrl = '/api/user/leaveScd';
    private _getGroupPendingMemberUrl = '/api/group/pendingInvites';
    private _sendInviteUrl = "/api/group/sendUsersGroupInvite";

    constructor(private dataService: GridDataService) {

    }

    public addNewGroup(groupData: AddGroups): Observable<any> {
        return this.dataService.postFormData(this._addNewGroupUrl, groupData);
    }
    public getGroups(count: number): Observable<any> {
        return this.dataService.getData(this._getGroupListUrl + '/' + count);
    }
    public deleteGroup(id: number): Observable<any> {
        return this.dataService.getData(this._deleteGroupUrl + '/' + id);
    }
    public joinGroup(id: number): Observable<any> {
        return this.dataService.getData(this._joinGroupUrl + '/' + id);
    }
    public leaveGroup(id: number): Observable<any> {
        return this.dataService.getData(this._leaveGroupUrl + '/' + id);
    }
    public editGroup(groupData: AddGroups, id: number): Observable<any> {
        return this.dataService.postFormData(this._editGroupUrl + '/' + id, groupData);
    }
    public getHeaderData(): Observable<any> {
        return this.dataService.getData(this._headerDataUrl);
    }
    public getGroupMembers(id: number): Observable<any> {
        return this.dataService.getData(this._getGroupMember + '/' + id);
    }
    public getAllUser(counter: number, searchData: any): Observable<any> {
        return this.dataService.postData(this._getAllUserUrl + '/' + counter, searchData);
    }
    public groupSearch(counter: number, searchData: GroupSearch): Observable<any> {
        return this.dataService.postData(this._getSearchedGroupUrl + '/' + counter, searchData);
    }
    public getSCDGroups(type: number, id: number, count: number): Observable<any> {
        return this.dataService.getData(this._getSCDGroups + type + '/' + id + '/' + count);
    }
    public scdGroupSearch(type: number, id: number, counter: number, searchData: GroupSearch): Observable<any> {
        return this.dataService.postData(this._getSCDSearchedGroupUrl + type + '/' + id + '/' + counter, searchData);
    }
    public getUserGroupNotification(counter: number): Observable<any> {
        return this.dataService.getData(this._getUserGroupNotificationUrl + '/' + counter);
    }
    public acceptInvite(groupId: number, from: number): Observable<any> {
        return this.dataService.getData(this._acceptInviteUrl + '/' + groupId + '/' + from);
    }
    public rejectInvite(groupId: number, from: number): Observable<any> {
        return this.dataService.getData(this._rejectInviteUrl + '/' + groupId + '/' + from);
    }
    public leaveSCD(scdId: number, scdType: string): Observable<any> {
        return this.dataService.getData(this._removeScdUrl + '/' + scdId + '/' + scdType);
    }
    public getGroupPendingMember(id: number): Observable<any> {
        return this.dataService.getData(this._getGroupPendingMemberUrl + '/' + id);
    }
    public sendGroupInvite(ids: Array<any>, groupId): Observable<any> {
        return this.dataService.postData(this._sendInviteUrl + '/' + groupId, { ids: ids });
    }
}
