const mongoose = require('mongoose')    
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    team1 : String,
    team2 : String,
    url : String,
    mvp : String,
    title : String,
    embedHtml: {
        type: String,
        required: true
    },
    createdAt :{
        type : Date,
        default : Date.now()
    },
    author:{
        type: Schema.Types.ObjectId,
        ref : "User",
    },
    category:{
        type : String,
        enum : ["exercise","match", "others"]
    }

});
module.exports = mongoose.model('Video', videoSchema);