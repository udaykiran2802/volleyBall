const express = require('express');
const router = express.Router({mergeParams: true}); 
const wrapAsync = require('../utils/wrapAsync.js');

const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const {validateReview, isLogggedin, isReviewAuthor} = require('../middleware.js');
const reviewController = require('../controllers/review.js');



//reviews
//post route
router.post('/',isLogggedin,wrapAsync(reviewController.createReview));

// delete review route
router.delete('/:reviewId',isLogggedin,isReviewAuthor, wrapAsync(reviewController.distroyReview));

module.exports = router;
