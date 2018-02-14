import { Injectable } from '@angular/core';
import { GridDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';


@Injectable()

export class ListService {

    private _addNewListUrl = '/api/list/addList';
    private _updateListUrl = '/api/list/updateList';
    private _getListUrl = '/api/list/getListsByUserId';
    private _deleteListUrl = '/api/list/deleteList';

    constructor(private dataService: GridDataService) {

    }

    public addNewList(data: any): Observable<any> {
        return this.dataService.postData(this._addNewListUrl, data);
    }

    public updateList(data: any): Observable<any> {
        return this.dataService.postData(this._updateListUrl, data);
    }
    public getLists(count: number): Observable<any> {
        return this.dataService.getData(this._getListUrl + '/' + count);
    }
    public deleteList(id: number): Observable<any> {
        return this.dataService.getData(this._deleteListUrl + '/' + id);
    }

}
