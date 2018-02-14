export class PostShare {
    public name: string = null;
    public types: number = null;
    public catagory: number = null;
    public message: String = null;
    public question: String = null;
    public photo: Array<any> = [];
    public video: Array<any> = [];
    public link: Array<any> = [];
    public custom: Array<number> = [];
    public document: Array<any> = [];
    public audio: Array<any> = [];
    public privacy: number = null;
    public shared_title: string = null;
    public share_type: number = null;
    public origin_creator: number = null;
    public original_post_id: number = null;
    public subject_id: number = null;
    public college_id: number = null;
    public degree_id: number = null;
    public group_id: number = null;
    public post_type: number = null;
}

export class Post {
    public name: string = null;
    public types: number = null;
    public catagory: number = null;
    public post_type: number = null;
    public message: string = null;
    public question: string = null;
    public photo: Array<any> = [];
    public video: Array<any> = [];
    public link: string = null;
    public linkTitle: string = null;
    public custom: Array<number> = [];
    public document: Array<any> = [];
    public audio: Array<any> = [];
    public privacy: number = null;
    public created_on: Date = new Date();
}

export class MyWallSearch {
    public subject_name: string = null;
    public college_name: string = null;
    public degree_name: string = null;
}
export class SearchData {
    public subjectIds: Array<number> = [];
    public collegeIds: Array<number> = [];
    public degreeIds: Array<number> = [];
}
export class Setting {
    public post_status: boolean | number = false;
}
export class AddSCD {
    public userOffset:any= null 
    public to: any = null;
    public from: any = null;
    public _id: number = null;
    public subjects_user_type: number = 2;
}
export class AddJournal {
    public title: string = null;
}
export class AddPostToJournal {
    public description: string = null;
    public postId: number = null;
    public journalId: number = null;
    public _id: any = null;
}
export class AddGroups {
    public title: string = null;
    public description: string = null;
    public icon: Array<File> = [];
    public privacy: number = 1;//1=>public , 2=>private
    public subject_id: number = null;
    public college_id: number = null;
    public degree_id: number = null;
}
export class GroupError {
    public groupTitle: string = null;
    public groupDescription: string = null;
    public groupIcon: string = null;
    public groupSCD: string = null;
}
export class GroupSearch {
    public title: string = null;
    public groupTypes: number = 1;
    public memberId: number = null;
    public sortType: number = 1;
    public sortOrder: number = 1;
}
export class GroupInviteUserSearch {
    public name: string = null;
    public friends: boolean = true;
    public followers: boolean = false;
    public followings: boolean = false;
    public allMembers: boolean = false;
}
export class SocialShareLink {
    public facebook: string = '';
    public twitter: string = '';
    public linkedin: string = '';
    public google_plus: string = '';
}