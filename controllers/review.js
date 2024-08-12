
const Listing = require('../models/listing.js');
const Player = require('../models/player.js');
const Review = require('../models/review.js');


module.exports.createReview = async(req,res)=>{ // passing validateReview as middleware, wrapAsync function is for error handling
    let player = await Player.findById(req.params.id);
    let newReview = new Review(req.body.review);
    // console.log(req.params);
    // console.log(newReview);//nenu petta
    // console.log(listing);//
    newReview.author = req.user._id;
    console.log(newReview);
    player.reviews.push(newReview);
    await newReview.save();
    await player.save();
    console.log("new review saved");
    req.flash("success","new review saved");
    res.redirect(`/players/${player._id}`);

}


module.exports.distroyReview = async(req,res)=>{
    let {id ,reviewId}= req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("fail", "review DELETED");
    res.redirect(`/players/${id}`);

    
}