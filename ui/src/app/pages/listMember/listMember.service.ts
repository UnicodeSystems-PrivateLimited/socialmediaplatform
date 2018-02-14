import { Injectable } from '@angular/core';
import { GridDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';


@Injectable()

export class ListMemberService {

    private _getListUrl = '/api/list/list';
    private _userSearchUrl = '/api/user/userSearchByStatus';
    private _addMemeberToListUrl = '/api/list/addmembers';
    private _deleteMemeberFromListUrl = '/api/list/deleteMemeber';

    constructor(private dataService: GridDataService) {

    }

    public getListInfo(id: number): Observable<any> {
        return this.dataService.getData(this._getListUrl + '/' + id);
    }
    public friendSearch(searchData: any): Observable<any> {
        return this.dataService.postData(this._userSearchUrl, searchData);
    }
    public addMembersToList(id: number, data: any): Observable<any> {
        return this.dataService.postData(this._addMemeberToListUrl + '/' + id, data);
    }
    public deleteMember(id: number, memberId: number): Observable<any> {
        return this.dataService.getData(this._deleteMemeberFromListUrl + '/' + id + '/' + memberId);
    }
}
