import { Injectable } from '@angular/core';
import { GridDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { MyWallSearch, SearchData } from '../../theme/interfaces';

@Injectable()

export class MyWallService {

    private _getUserSubjects = '/api/subject/getUserSearchSubject';
    private _getUserColleges = '/api/college/getUserSearchCollege';
    private _getUserDegrees = '/api/degree/getUserSearchDegree';
    private _getSearchPosts = '/api/post/myWallSearch';
    private _getTimelineSearchPosts = '/api/event/timeLineAdvanceSearch';
    private _getFriendTimelineSearch = '/api/event/friendTimeLineAdvanceSearch';
    private _getFriendPostSearch = '/api/post/getfriendSearchedPost';
    private _getPostSearch = '/api/post/getFriendSearchPost';
    private _getUserSearchPosts = '/api/post/getUserSearchPost';
    private _getSearchSubject = 'api/subject/getMyWallSearchSubject';
    private _getSearchCollege = 'api/college/getMyWallSearchCollege';
    private _getSearchDegree = 'api/degree/getMyWallSearchDegree';
    private _removePostFromTimeLineUrl = '/api/user/removeOthersPostTimeline';
    private _getSearchedSubject = 'api/user/getSubjectSearchList';
    private _getSearchedCollege = 'api/user/getCollegeSearchList';
    private _getSearchedDegree = 'api/user/getDegreeSearchList';

    constructor(private dataService: GridDataService) {

    }

    public getUserSubjects(subject_name: string): Observable<any> {
        return this.dataService.getData(this._getUserSubjects + '/' + subject_name);
    }
    public getUserColleges(college_name: string): Observable<any> {
        return this.dataService.getData(this._getUserColleges + '/' + college_name);
    }
    public getUserDegrees(degree_name: string): Observable<any> {
        return this.dataService.getData(this._getUserDegrees + '/' + degree_name);
    }
    public searchPost(data: SearchData, postType: number, counter: number): Observable<any> {
        return this.dataService.postData(this._getSearchPosts + '/' + postType + '/' + counter, data);
    }
    public userTimelinesearchPost(data: SearchData, counter: number): Observable<any> {
        return this.dataService.postData(this._getTimelineSearchPosts + '/' + counter, data);
    }
    public userSearchPost(data: SearchData, postType: number, counter: number): Observable<any> {
        return this.dataService.postData(this._getUserSearchPosts + '/' + postType + '/' + counter, data);
    }
    public friendTimelineSearch(data: SearchData, counter: number, friendId: number): Observable<any> {
        return this.dataService.postData(this._getFriendTimelineSearch + '/' + counter + '/' + friendId, data);
    }
    public friendPostSearch(data: SearchData, friendId: number, counter: number): Observable<any> {
        return this.dataService.postData(this._getFriendPostSearch + '/' + friendId + '/' + counter, data);
    }
    public friendSearchPost(data: SearchData, friendId: number, postType: number, counter: number): Observable<any> {
        return this.dataService.postData(this._getPostSearch + '/' + friendId + '/' + postType + '/' + counter, data);
    }
    public getSearchSubjects(subject_name: string): Observable<any> {
        return this.dataService.getData(this._getSearchSubject + '/' + subject_name);
    }
    public getSearchColleges(college_name: string): Observable<any> {
        return this.dataService.getData(this._getSearchCollege + '/' + college_name);
    }
    public getSearchDegrees(degree_name: string): Observable<any> {
        return this.dataService.getData(this._getSearchDegree + '/' + degree_name);
    }

    public removePostFromTimeline(postData: any): Observable<any> {
        return this.dataService.postData(this._removePostFromTimeLineUrl, postData);
    }

     public getSearchedSubjects(subject_name: string): Observable<any> {
        return this.dataService.getData(this._getSearchedSubject + '/' + subject_name);
    }

     public getSearchedColleges(college_name: string): Observable<any> {
        return this.dataService.getData(this._getSearchedCollege + '/' + college_name);
    }
    public getSearchedDegrees(degree_name: string): Observable<any> {
        return this.dataService.getData(this._getSearchedDegree + '/' + degree_name);
    }
}