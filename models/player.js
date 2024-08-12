const { required } = require('joi');
const mongoose = require('mongoose')    
const Schema = mongoose.Schema;
const Review = require('./review.js');
const Vedio = require('./video.js');

const playerSchema = new Schema({
    name:{
        type : String,
        required: true,
    },
    scholarID:{
        type : String,
        required:  true
    },
    position: {
        type: String,
        enum: ['Hitter', 'Setter', 'Libero','AllRounder'],
        required: true
      },
    size:{
        type: String,
        enum:['S','L','M','XL','XS'],
    },
      image: {
        filename: {
            type: String,
            
        },
        url: {
            type: String, // Ensure image is of type String
        default: "https://imgs.search.brave.com/iQge4e3b4CfBDGM5Zh-oJZrz_fLRpBD8S9xgXjWwdk0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL1Yvdm9sbGV5/YmFsbC1wbGF5ZXIt/bG9nby1BNkM4Mjky/QTlDLXNlZWtsb2dv/LmNvbS5wbmc",
        set: (v) => v === "" ? "https://imgs.search.brave.com/iQge4e3b4CfBDGM5Zh-oJZrz_fLRpBD8S9xgXjWwdk0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL1Yvdm9sbGV5/YmFsbC1wbGF5ZXIt/bG9nby1BNkM4Mjky/QTlDLXNlZWtsb2dv/LmNvbS5wbmc" : v
        }
    },
    videos: [
        {
            type:Schema.Types.ObjectId,
            ref:"Video",
        },
    ],
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner : {
        type: Schema.Types.ObjectId,
        ref:"User",
    },
    branch: {
        type: String,
        required: true
      },

        progress: [
            {
                date: { type: Date, default: Date.now },
                servePoints: Number,
                receivePoints: Number,
                hittingPoints: Number,
                blockingPoints: Number,
                defensePoints: Number,
                settingPoints: Number
            }
        ]

    

});
playerSchema.post("findOneAndDelete", async function(player){
    if(player){
        await Review.deleteMany({_id:{$in:player.reviews}});
    }
})

const Player = mongoose.model('Player', playerSchema);    
module.exports = Player;