import {Injectable}from '@angular/core';
import {GridDataService, PageService} from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import 'rxjs';

@Injectable()

export class PostReportService {

    private _getReportedPostListUrl = '/api/postsfeedback/list';
    private _getDeletePostUrl = '/api/postsfeedback/delete/';

    constructor(
        private dataservice: GridDataService
    ) {

    }

    public getReportedPostList(): Observable<any> {
        return this.dataservice.getData(this._getReportedPostListUrl);
    }

    public deletePostByAdmin(id: number, postId: number): Observable<any> {
        return this.dataservice.getData(this._getDeletePostUrl + id + '/' + postId);
    }
}
