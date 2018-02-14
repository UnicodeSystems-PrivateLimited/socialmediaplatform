import { Component, ViewEncapsulation, ElementRef } from '@angular/core';
import { Router, RouteParams, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl } from '@angular/common';
import { EmailValidator, EqualPasswordsValidator } from '../../theme/validators';
import { GridDataService, PageService } from '../../theme/services';

declare var jQuery: any;
declare var noty: any;
declare var require: any;

@Component({
    selector: 'register',
    template: require('./register.html')
})

export class Register {
    private _registerUrl = '/api/user/register';
    private _collegesListUrl = 'api/college/dropDownList'
    private _subjectsListUrl = 'api/subject/dropDownList';
    private _degreeListUrl = 'api/degree/dropDownList';
    private _emailCheckUrl = 'api/user/checkEmail';
    private _collegeSearch = 'api/college/collegeSearch';
    private _degreeSearch = 'api/degree/degreeSearch';
    private _subjectSearch = 'api/subject/subjectSearch';
    private _loginUrl = '/api/user/login';
    public subjects;
    public colleges;
    public degree;
    private _router;
    public regMsg = null;
    public regStep = 1;
    public form1 = 1;
    public subject_count = [];
    public college_count = [];
    public degree_count = [];
    public i;
    public elementRef: ElementRef;
    private register = { fname: "", lname: "", gender: "", college: [], subjects: [], zip: "", expert: "", degree: [], email: "", password: "", collages_start_date: [], collages_end_date: [], subjects_start_date: [], subjects_end_date: [], subjects_user_type: [], degrees_start_date: [], degrees_end_date: [], collegeName: [], degreeName: [], subjectName: [] };
    submitted = false;
    public errorMsg;
    public subF: string;
    public subT: string;
    public errordatemsg = [];
    public errordateblankmsg = [];
    public errorCollegeDateMsg = [];
    public errorDegreeDateMsg = [];
    public collegeFields = { name: "" };
    public collegeList = [];
    public degreeFields = { name: "" };
    public degreeList = [];
    public subjectFields = { name: "" };
    public subjectList = [];
    public categoryValue = [];
    public categoryValueDefault;
    public catagory = [];
    public loginMsg;
    public SubjectSelected: boolean = false;
    public CollegeSelected: boolean = false;
    public DegreeSelected: boolean = false;
    constructor(private dataService: GridDataService, router: Router, private page: PageService, elementRef: ElementRef) {
        this._router = router;
        this.categoryValueDefault = 'Choose Category';
    }

    ngOnInit() {
        this.getUsers();
    }

    getUsers() {
        this.dataService.getData(this._subjectsListUrl).subscribe(subjects => {
            this.subjects = subjects;
        });
        this.dataService.getData(this._degreeListUrl).subscribe(degree => {
            this.degree = degree;
        });
    }

    onChangeGender(genderval) {
        this.register.gender = genderval;
    }
    onSubmit() {
        this.regStep = 2;
    }

    onSubmit1() {
        this.regStep = 3;
    }

    onSubmit2() {
        this.submitted = true;
        this.userRegister();
    }

    userRegister() {
        jQuery('.spin-wrap.vision-spin').fadeIn();
        this.dataService.postData(this._registerUrl, this.register)
            .subscribe(res => {
                this.page.college = '';
                this.page.degree = '';
                this.page.subject = '';
                this.page.program = '';
                if (res.status === 1) {
                    this._router.parent.navigate(['Pages']);
                } else if (res.status === 2) {
                    this.page.reg_msg = "success";
                    this.dataService.postData(this._loginUrl, { newUserOneTimelogin: 1, email: res.newUser.local.email, password: this.register.password, agree: true })
                        .subscribe(res => {
                            if (res.status === 1) {
                                if (res.type == 2) {
                                    this._router.parent.navigate(['Admin']);
                                } else { this._router.parent.navigate(['Pages']); }
                            } else {
                                this.loginMsg = res.msg
                            }
                        });
                    //                    this._router.parent.navigate(['/User.login']);
                    jQuery('.spin-wrap.vision-spin').fadeOut();
                } else {
                    this.regMsg = res.msg;
                }
            });
    }

    clearRegiterDropdown() {
        this.collegeList = [];
        this.subjectList = [];
        this.degreeList = [];
    }

    formSubmit() {
        if (this.register.fname != null || this.register.fname != "") {
            this.register.fname = (this.register.fname).trim();
        }
        if (this.register.password.length >= 6) {
            jQuery('.spin-wrap.vision-spin').fadeIn();
            this.dataService.postData(this._emailCheckUrl, { email: this.register.email })
                .subscribe(res => {
                    if (res.status === 2) {
                        this.regMsg = "";
                        this.form1 = 2;
                        this.errorMsg = "";
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                    } else {
                        this.regMsg = res.msg;
                        jQuery('.spin-wrap.vision-spin').fadeOut();
                    }
                });
        } else {
            this.errorMsg = "Enter minimum six character";
        }
    }

    addSubject() {
        this.subject_count.push(this.subject_count.length + 1);
    }
    onChangeSubject(subjectval, i) {
        this.register.subjects[i] = subjectval;
    }
    subDateFrom(subfrom, i) {
    }
    subDateTo(subto, i) {
        this.register.subjects_end_date[i] = this.toDate(subto);
    }

    subjectDate() {
        var subCt = this.register.subjects;
        var count = 0;
        for (var i = 0; i < subCt.length; i++) {
            if (this.catagory[i] == 1 || this.catagory[i] == 2) {
                var subFr = jQuery('input[name="sub-date-from-' + i + '"]').val();
                var dateFr = subFr.split('-');
                var subTo = jQuery('input[name="sub-date-to-' + i + '"]').val();
                var dateTo = subTo.split('-');
                dateFr = dateFr[2] + dateFr[1] + dateFr[0];
                dateTo = dateTo[2] + dateTo[1] + dateTo[0];
                if (dateTo != 'NaN' && dateFr != 'NaN') {
                    if (dateTo > dateFr) {
                        this.register.subjects_start_date[i] = subFr == '' || subFr == null ? subFr : this.toDate(subFr);
                        this.register.subjects_end_date[i] = subTo == '' || subTo == null ? subTo : this.toDate(subTo);
                        this.errordatemsg[i] = "";
                        this.errordateblankmsg[i] = "";
                    } else {
                        count++;
                        this.errordateblankmsg[i] = "";
                        this.errordatemsg[i] = "To date is too short than From Date";
                    }
                } else {
                    count++;
                    this.errordatemsg[i] = "";
                    this.errordateblankmsg[i] = "Select the date ";
                }
            }
        }
        if (!count) {
            this.regStep = 2;
        }
    }

    removeSubject(i) {
        this.subject_count.splice(i, 1)
        this.register.subjects.splice(i + 1, 1)
        this.catagory.splice(i + 1, 1)
        this.register.subjectName.splice(i + 1, 1)
        this.register.subjects_start_date.splice(i + 1, 1)
        this.register.subjects_end_date.splice(i + 1, 1);
    }

    showSubjectSelect(i) {
        jQuery('input[name="sub-date-from-' + (i + 1) + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        jQuery('input[name="sub-date-to-' + (i + 1) + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        if (this.subject_count[i] != 0) return true;
        else return false;

    }

    addCollege() {
        this.college_count.push(this.college_count.length + 1);
    }
    onChangeCollege(collegeval, i) {
        this.register.college[i] = collegeval;
    }

    collegeDateFrom(collegeFrom, i) {
        this.register.collages_start_date[i] = this.toDate(collegeFrom);
    }

    collegeDateTo(collegeTo, i) {
        this.register.collages_end_date[i] = this.toDate(collegeTo);
    }

    collegeDate() {
        var subCt = this.register.college;
        var count = 0;
        for (var i = 0; i < subCt.length; i++) {
            var subFr = jQuery('input[name="col-date-from-' + i + '"]').val();
            var dateFr = subFr.split('-');
            var subTo = jQuery('input[name="col-date-to-' + i + '"]').val();
            var dateTo = subTo.split('-');
            dateFr = dateFr[2] + dateFr[1] + dateFr[0];
            dateTo = dateTo[2] + dateTo[1] + dateTo[0];
            if (dateTo != 'NaN' && dateFr != 'NaN') {
                if (dateTo > dateFr) {
                    this.register.collages_start_date[i] = subFr == '' || subFr == null ? subFr : this.toDate(subFr);
                    this.register.collages_end_date[i] = subTo == '' || subTo == null ? subTo : this.toDate(subTo);
                    this.errorCollegeDateMsg[i] = "";
                    this.errordateblankmsg[i] = "";
                } else {
                    count++;
                    this.errordateblankmsg[i] = "";
                    this.errorCollegeDateMsg[i] = "To date is too short than From Date";
                }
            } else {
                count++;
                this.errorCollegeDateMsg[i] = "";
                this.errordateblankmsg[i] = "Select the date ";
            }
        }
        if (!count) {
            this.regStep = 3;
        }
    }
    removeCollege(i) {
        this.college_count.splice(i, 1);
        this.register.college.splice(i + 1, 1);
        this.register.collegeName.splice(i + 1, 1);
        this.register.collages_start_date.splice(i + 1, 1);
        this.register.collages_end_date.splice(i + 1, 1);
    }
    showCollegeSelect(i) {
        jQuery('input[name="col-date-from-' + (i + 1) + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        jQuery('input[name="col-date-to-' + (i + 1) + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        if (this.college_count[i] != 0) return true;
        else return false;
    }

    addDegree() {
        this.degree_count.push(this.degree_count.length + 1);
    }

    onChangeDegree(degreeval, i) {
        this.register.degree[i] = degreeval;
    }

    degreeDateFrom(degreeFrom, i) {
        this.register.degrees_start_date[i] = this.toDate(degreeFrom);
    }

    degreeDateTo(degreeTo, i) {
        this.register.degrees_end_date[i] = this.toDate(degreeTo);
    }

    degreeDate() {
        var subCt = this.register.degree;
        var count = 0;
        for (var i = 0; i < subCt.length; i++) {
            var subFr = jQuery('input[name="deg-date-from-' + i + '"]').val();
            var dateFr = subFr.split('-');
            var subTo = jQuery('input[name="deg-date-to-' + i + '"]').val();
            var dateTo = subTo.split('-');
            dateFr = dateFr[2] + dateFr[1] + dateFr[0];
            dateTo = dateTo[2] + dateTo[1] + dateTo[0];
            if (dateTo != 'NaN' && dateFr != 'NaN') {
                if (dateTo > dateFr) {
                    this.register.degrees_start_date[i] = subFr == '' || subFr == null ? subFr : this.toDate(subFr);
                    this.register.degrees_end_date[i] = subTo == '' || subTo == null ? subTo : this.toDate(subTo);
                    this.errorDegreeDateMsg[i] = "";
                    this.errordateblankmsg[i] = "";
                } else {
                    count++;
                    this.errordateblankmsg[i] = "";
                    this.errorDegreeDateMsg[i] = "To date is too short than From Date";
                }
            } else {
                count++;
                this.errorDegreeDateMsg[i] = "";
                this.errordateblankmsg[i] = "Select the date ";
            }
        }
        if (!count) {
            this.onSubmit2();
        }
    }

    removeDegree(i) {
        this.degree_count.splice(i, 1)
        this.register.degree.splice(i + 1, 1)
        this.register.degreeName.splice(i + 1, 1)
        this.register.degrees_start_date.splice(i + 1, 1)
        this.register.degrees_end_date.splice(i + 1, 1);
    }

    showDegreeSelect(i) {
        jQuery('input[name="deg-date-from-' + (i + 1) + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        jQuery('input[name="deg-date-to-' + (i + 1) + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        if (this.degree_count[i] != 0) return true;
        else return false;
    }

    //convet dd/mm/yyyy @string to Date @object
    toDate(dateStr) {
        var parts = dateStr.split("-");
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    //search college
    getCollege(key, i) {
        if (!this.register.collegeName[i]) {
            this.CollegeSelected = false;
            //  
            // if (this.college_count.length > 0) {
            //     let len: number = this.college_count.length;
            //     for (var j = 0; j < len; j++) {
            //        
            //         this.college_count.pop();
            //     }
            // }
        }
        this.colleges = [];
        this.collegeFields.name = key;
        this.dataService.postData(this._collegeSearch, this.collegeFields).subscribe(res => {
            if (res.status == 2) {
                this.colleges[i] = res.data;
                this.collegeList[i] = res.data;
            }
        });
    }

    //select college
    selectCollege(college: string, college_id: number, i: number) {
        this.register.college[i] = college_id;
        this.register.collegeName[i] = college;
        this.collegeList[i] = null;
        this.colleges[i] = null;
        if (this.register.collegeName[i]) {
            this.CollegeSelected = true;
        }
    }

    //search degree
    getDegree(key: string, i: number) {
        if (!this.register.degreeName[i]) {
            this.DegreeSelected = false;
            //  
            // if (this.degree_count.length > 0) {
            //     let len: number = this.degree_count.length;
            //     for (var k = 0; k < len; k++) {
            //     
            //         this.degree_count.pop();
            //     }
            // }
        }
        this.degree = [];
        if (jQuery("#selectDegree-" + i).val() == "") {
            this.register.degree.splice(i, 1);
        }
        this.degreeFields.name = key;
        this.dataService.postData(this._degreeSearch, this.degreeFields).subscribe(res => {
            if (res.status == 2) {
                this.degree[i] = res.data;
                this.degreeList[i] = res.data;
                for (var j = 0; j < this.register.degree.length; j++) {
                    for (var k = 0; k < this.degree[i].length; k++) {
                        if (this.register.degree[j] == this.degree[i][k]._id) {
                            this.degree[i].splice(k, 1);
                            this.degreeList[i].splice(k, 1);
                        }
                    }
                }
            }
        });

    }

    //select degree
    selectDegree(degree: string, degree_id: number, i: number) {
        this.register.degree[i] = degree_id;
        this.register.degreeName[i] = degree;
        this.degreeList[i] = null;
        this.degree[i] = null;
        if (this.register.degreeName[i]) {
            this.DegreeSelected = true;
        }
    }
    //search subject
    getSubject(key: string, i: number) {
        if (!this.register.subjectName[0]) {
            this.SubjectSelected = false;
            // 
            // if (this.subject_count.length > 0) {
            //     let len: number = this.subject_count.length;
            //     for (var i = 0; i < len; i++) {
            //        
            //         this.subject_count.pop();
            //     }
            // }
        }
        this.subjects = [];
        if (jQuery("#selectSub-" + i).val() == "") {
            this.register.subjects.splice(i, 1);
        }
        this.subjectFields.name = key;
        this.dataService.postData(this._subjectSearch, this.subjectFields).subscribe(res => {
            if (res.status == 2) {
                this.subjects[i] = res.data;
                this.subjectList[i] = res.data;
                for (var j = 0; j < this.register.subjects.length; j++) {
                    for (var k = 0; k < this.subjects[i].length; k++) {

                        if (this.register.subjects[j] == this.subjects[i][k]._id) {
                            this.subjects[i].splice(k, 1);
                            this.subjectList[i].splice(k, 1);
                        }
                    }
                }
            }
        });

    }

    //select subject
    selectSubject(subject: string, subject_id: number, i: number) {
        this.register.subjects[i] = subject_id;
        this.register.subjectName[i] = subject;
        this.subjectList[i] = null;
        this.subjects[i] = null;
        if (this.register.subjectName[0]) {
            this.SubjectSelected = true;
        }

    }

    catagories(catagory, index) {
        this.catagory[index] = catagory;
        if (catagory == 1) {
            this.categoryValue[index] = 'Currently Taking / Future / Past Student';
            this.register.subjects_user_type[index] = catagory;
            setTimeout(function () {
                jQuery('input[name="sub-date-from-' + index + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
                jQuery('input[name="sub-date-to-' + index + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
            }, 500);
        }
        // else
        //     if (catagory == 2) {
        //         this.categoryValue[index] = 'Will Take in Future';
        //         this.register.subjects_user_type[index] = catagory;
        //         setTimeout(function () {
        //             jQuery('input[name="sub-date-from-' + index + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        //             jQuery('input[name="sub-date-to-' + index + '"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        //         }, 500);
        //     }
            else
                if (catagory == 3) {
                    this.categoryValue[index] = 'Subject Expert';
                    this.register.subjects_user_type[index] = catagory;
                }
                else
                    if (catagory == 4) {
                        this.categoryValue[index] = 'Teacher of Subject';
                        this.register.subjects_user_type[index] = catagory;
                    }
                    else
                        if (catagory == 5) {
                            this.categoryValue[index] = 'Just Interested';
                            this.register.subjects_user_type[index] = catagory;
                        }

                        // else
                        //     if (catagory == 6) {
                        //         this.categoryValue[index] = 'Past Student';
                        //         this.register.subjects_user_type[index] = catagory;
                        //     }
                            else
                                if (catagory == 0) {
                                    this.categoryValue[index] = null;
                                    this.register.subjects_user_type[index] = null;
                                }
    }

    ngAfterViewInit() {
        setTimeout(function () {
            jQuery('input[name="sub-date-from-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
            jQuery('input[name="sub-date-to-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
            jQuery('input[name="col-date-from-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
            jQuery('input[name="col-date-to-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
            jQuery('input[name="deg-date-from-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
            jQuery('input[name="deg-date-to-0"]').datepicker({ autoclose: true, format: 'dd-mm-yyyy' });
        }, 500);
    }
}
