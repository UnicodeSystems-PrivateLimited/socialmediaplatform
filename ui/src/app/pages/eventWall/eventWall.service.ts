import { Injectable } from '@angular/core';
import { GridDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { MyWallSearch, SearchData } from '../../theme/interfaces';

@Injectable()

export class EventWallService {

    private _friendListUrl = '/api/user/getAllTypeFriends';
    private _dataUrl = '/api/user/profile/full';
    private _dataProfileByUser = 'api/user/getUserProfileData/';
    private _addFriendUrl = '/api/user/addFriend/';
    private _addFriendNotification = '/api/notification/addNotification/';
    private _dataUrlCancelFriend = '/api/user/cancelFriend/';
    private _dataUrladdFollower = 'api/user/addFollower/';
    private _dataUrlUnFollow = 'api/user/unFollow/';
    private _dataUrlRemoveFriend = 'api/user/removeFriend/';
    private _getUnblockedFriendsUrl = '/api/user/unblockFriend/';
    private _getblockedFriendsUrl = '/api/user/blockFriend/';
    private _dataUrlApproveFriend = 'api/user/approveFriend/';
    private _dataUrlRejectFriend = 'api/user/rejectFriend/';
    private _getMembersList = '/api/user/getMembersList';


    constructor(private dataService: GridDataService) {

    }
    public getFriendList(): Observable<any> {
        return this.dataService.getData(this._friendListUrl);
    }
    public getUserProfile(): Observable<any> {
        return this.dataService.getData(this._dataUrl);
    }
    public getProfileByUser(id: number): Observable<any> {
        return this.dataService.getData(this._dataProfileByUser + id);
    }
    public addFriend(id: number): Observable<any> {
        return this.dataService.getData(this._addFriendUrl + id);
    }
    public addFriendNoti(id: number, postType: number, data: any): Observable<any> {
        return this.dataService.postData(this._addFriendNotification + id + '/' + postType, data);
    }
    public cancleFriendRequest(id: number): Observable<any> {
        return this.dataService.getData(this._dataUrlCancelFriend + id);
    }
    public setFollow(id: number): Observable<any> {
        return this.dataService.getData(this._dataUrladdFollower + id);
    }
    public setUnfollow(id: number): Observable<any> {
        return this.dataService.getData(this._dataUrlUnFollow + id);
    }
    public unfriend(id: number): Observable<any> {
        return this.dataService.getData(this._dataUrlRemoveFriend + id);
    }
    public unblockFriend(id: number): Observable<any> {
        return this.dataService.getData(this._getUnblockedFriendsUrl + id);
    }
    public blockFriend(id: number): Observable<any> {
        return this.dataService.getData(this._getblockedFriendsUrl + id);
    }
    public acceptFriendRequest(id: number): Observable<any> {
        return this.dataService.getData(this._dataUrlApproveFriend + id);
    }
    public rejectFriendRequest(id: number): Observable<any> {
        return this.dataService.getData(this._dataUrlRejectFriend + id);
    }
    public getMemberList(counter: number, memberType: number): Observable<any> {
        return this.dataService.getData(this._getMembersList + '/' + counter + '/' + memberType);
    }
}