var autoIncrement = require('mongoose-auto-increment');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
autoIncrement.initialize(db);
var name = 'Post';

/*
 * Member Status{
 *      1=>Current
 *      2=>Past
 * }
 * 
 */
/*post_type
 *      message:1,
 *     question:2,
 *     photo:3,
 *     video:4,
 *     link:5,
 *     audio:6,
 *     document:7,
 * 
 */

var schema = db.Schema({
    name: String,
    //types catagory post_type created_by created_on likes flag comments message question photo video link document audio privacy share
    types: Number, //1=>Subject,2=>collage,3=>Bachelors/degree program,4=>Masters program, 5=>user timeline,6=>groups
    catagory: Number, //1=>General,2=>tip/trick,3=>Joke/humar,4=>tutorial5=>unknown category
    post_type: Number,//1=>message,2=>question,3=>photos,4=>videos,5=>link,6=>audios,document=>7,joinscd=>8
    created_by: { type: Number, ref: 'User' },
    likes: [{ user_id: { type: Number, ref: 'User' } }],
    flag: [{ user_id: { type: Number, ref: 'User' } }],
    comments: [{
        body: String,
        date: { type: Date },
        comment_by: { type: Number, ref: 'User' }
    }],
    message: String,
    question: String,
    answer: [{
        body: String,
        ques_id: { type: Number },
        created_by: { type: Number, ref: 'User' },
        date: { type: Date },
    }],
    photo: [{ file_name: String, title: String, description: String }],
    video: [{ file_name: String, title: String, description: String }],
    link: [{ title: { type: String }, description: { type: String } }],
    custom: [{ type: Number, ref: 'User' }],
    // share_custom:[{ custom_id: {type:Number, ref: 'User'}, date: Date}],
    document: [{ file_name: String, title: String, description: String }],
    audio: [{ file_name: String, title: String, description: String }],
    privacy: Number, //1=>public 2=>private 3=>friends_only,4=>All Followers,5=>Custom,6=>All Friends And Followers
    // share_privacy: {type: Number, default: 0}, //1=>public 2=>private 3=>friends_only,4=>All Followers,5=>Custom,6=>All Friends And Followers
    share: [{ user_id: { type: Number, ref: 'User' }, date: { type: Date } }],
    shared_title: { type: String },
    share_type: { type: Number, default: 1 },//1=>show on own timeline,2=> show on other timeline
    origin_creator: { type: Number, ref: 'User' }, //used when any one share post
    original_post_id: { type: Number, ref: 'Post' }, //used when any one share post
    subject_id: { type: Number, ref: 'Subject' },
    college_id: { type: Number, ref: 'College' },
    degree_id: { type: Number, ref: 'Degree' },
    group_id: { type: Number, ref: 'Group' },
    created_on: { type: Date },
    updated_on: { type: Date }
});
//Pre save preperation
schema.pre('save', function (next) {
    var cDate = new Date();
    this.updated_on = cDate;
    next();
});

//Create the model for users
schema.plugin(autoIncrement.plugin, { startAt: 1, model: name });
module.exports = db.model(name, schema);