
const Listing = require('../models/listing.js');
const Player = require('../models/player.js');
const Review = require('../models/review.js');
const nodemailer = require('nodemailer');

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
    // delete activeUsers[req.sessionID];
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'udaykiran2822@gmail.com',
                pass: 'tewpljiypykejagr' // Use the app password here
            }
        });
    
        let mailOptions = {
            from: 'udaykiran2802@gmail.com',
            to: 'udaykiran2822@gmail.com',
            subject: 'Review ADDED ',
            text: `"${req.user.username}" is Added Review for player "${player.name}" at  ${new Date().toLocaleString()} 
            Review is "${newReview.comment}" ` // Use newline for email formatting
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                req.flash('error', 'Error sending email');
                return res.redirect('/players');
            }
            // req.flash('success', 'Active users list has been emailed successfully!');
            // res.redirect('/players');
        });
    console.log("new review saved");
    req.flash("success","new review saved");
    res.redirect(`/players/${player._id}`);

}


module.exports.distroyReview = async(req,res)=>{
    let {id ,reviewId}= req.params;
    let player = await Player.findById(id);
    let review = await Review.findById(reviewId);
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'udaykiran2822@gmail.com',
            pass: 'tewpljiypykejagr' // Use the app password here
        }
    });

    let mailOptions = {
        from: 'udaykiran2802@gmail.com',
        to: 'udaykiran2822@gmail.com',
        subject: `Review DELETED from player "${player.name}" `,
        text: `"${req.user.username}"  DELETED Review for player "${player.name}" at  ${new Date().toLocaleString()} 
        Deleted Review is "${review.comment}" ` // Use newline for email formatting
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            req.flash('error', 'Error sending email');
            return res.redirect('/players');
        }
        // req.flash('success', 'Active users list has been emailed successfully!');
        // res.redirect('/players');
    });
    req.flash("fail", "review DELETED");
    res.redirect(`/players/${id}`);

    
}