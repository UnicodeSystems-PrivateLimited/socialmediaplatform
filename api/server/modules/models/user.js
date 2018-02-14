var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'User';
/*
 * *
 * subjects_user_type-
 *   1     Currently Taking
     2     Will Take in Future
     3     Subject Expert
     4     Teacher of Subject
     5     Just Interested
     6     Past Student
 * friend
 *      Status{
 *          1 => UnApproved
 *          2 => WaitingApproval
 *          3 => Approved  
 *          4=>Bloker
 *          5=>Blocked           
 *      }  
 * followers->list of People following the current user
 * following->list of people followed by the user
 *                  
 */
var schema = db.Schema({
    local: {
        email: { type: String, required: true, unique: true },
        password: { type: String }

    },
    facebook: {
        id: String,
        token: String,
        email: String,
        username: String,
        facebook: String,
        photo: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        username: String,
        photo: String,
    },
    outlook: {
        id: String,
        token: String,
        email: String,
        username: String,
    },
    type: { type: Number, default: 1 },
    fname: { type: String },
    lname: { type: String },
    photo: { type: String },
    gender: { type: String },
    dob: { type: Date },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    college: [{ college_id: { type: Number, ref: 'College' }, from: Date, to: Date, last_visit: { type: Date, default: new Date() } }],
    subjects: [{ subject_id: { type: Number, ref: 'Subject' }, from: Date, to: Date, subjects_user_type: Number, last_visit: { type: Date, default: new Date() } }],
    degree: [{ degree_id: { type: Number, ref: 'Degree' }, from: Date, to: Date, last_visit: { type: Date, default: new Date() } }],
    program: [{ type: String, from: Date, to: Date }],
    expert: [{ type: String }],
    friends: [{ friend_id: { type: Number, ref: 'User' }, status: { type: Number, default: 1 }, date: Date }],
    followers: [{ follower_id: { type: Number, ref: 'User' }, date: Date }],
    following: [{ following_id: { type: Number, ref: 'User' }, date: Date }],

    social_link: { facebook: String, twitter: String, linkedin: String, google_plus: String, youtube: String, instagram: String, pinterest: String },
    snapshoot: [{ file_name: String, title: String }],
    activated: { type: Number, default: 0 },
    activation_code: { type: Number },
    is_active: { type: Number, default: 1 },//1=>active 2=>inactive
    forgot_password_code: { type: Number },
    status: { type: Number, default: 0 },
    updated_on: { type: Date, default: Date.now },
    created_on: { type: Date, default: Date.now },
    login_details: { total_login: Number, last_login: Date, current_login: Date },
    education: { type: String },
    location: { type: String },
    skills: { type: String },
    notes: { type: String },
    check_status: { type: Number, default: 1 },
    hidden_postIds: [{ type: Number, ref: 'Post' }],
    mobile_no:{type:String},
    isRegConEnable:{type:Number, default: 0}
});
//Pre save preperation
schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    // if(this.status === undefined){
    //     this.status=0;
    // }
    // if (!this.created_on) {
    //     this.created_on = cDate;
    // }
    next();
});
//Methods
//Hash generation
schema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Checking password validity
schema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

//Create the model for users
schema.plugin(autoIncrement.plugin, { model: name, startAt: 1 });
module.exports = db.model(name, schema);