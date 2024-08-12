const mongoose = require('mongoose')    
const Schema = mongoose.Schema;
const Review = require('./review.js');
const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    location: String,
    image: {
        filename: {
            type: String,
            
        },
        url: {
            type: String, // Ensure image is of type String
        default: "https://imgs.search.brave.com/Wq51Zeml8crTBgE-VjpkgrCTrAq21yDroi_KyK8xetQ/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9oaXBz/LmhlYXJzdGFwcHMu/Y29tL2hiei5oLWNk/bi5jby9hc3NldHMv/MTYvMTYvZ2V0dHlp/bWFnZXMtMTE2MTQ3/NTEzLmpwZz9jcm9w/PTEuMHh3OjF4aDtj/ZW50ZXIsdG9wJnJl/c2l6ZT05ODA6Kg",
        set: (v) => v === "" ? "https://imgs.search.brave.com/Wq51Zeml8crTBgE-VjpkgrCTrAq21yDroi_KyK8xetQ/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9oaXBz/LmhlYXJzdGFwcHMu/Y29tL2hiei5oLWNk/bi5jby9hc3NldHMv/MTYvMTYvZ2V0dHlp/bWFnZXMtMTE2MTQ3/NTEzLmpwZz9jcm9w/PTEuMHh3OjF4aDtj/ZW50ZXIsdG9wJnJl/c2l6ZT05ODA6Kg" : v
        }
    },
    country: String,
    price: Number,
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
    category : {
        type: String,
        enum: ["mountains", "arctic", "farms","rooms","Iconic Cities", "castles","Amazing Pools", "camping","domes", "boats"],
    }
});

// mongoose middleware for handling : delete listing
listingSchema.post("findOneAndDelete", async function(listing){
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
})

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;// idi listing.js ni app.js lo vaadukovadaniki ila raayali
