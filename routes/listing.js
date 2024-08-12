const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');

const Listing = require('../models/listing.js');
const {isLogggedin, isOwner,validateListing} = require('../middleware.js');
const listingController = require('../controllers/listing.js');
const multer = require('multer');
const {storage}= require('../cloudConfig.js');
const upload = multer({storage})// uploads ane folder ni create chesi only files ni save chestundi


// Server-side validation



//search Route
router.get('/search', wrapAsync(listingController.search));
router.get('/owner',isLogggedin, wrapAsync(listingController.owner));


// New Route
router.get('/new',isLogggedin,  wrapAsync(listingController.renderNewForm));
router.get('/arctic',wrapAsync(listingController.arctic));
router.get('/domes', wrapAsync(listingController.domes));

router.get('/mountains',wrapAsync(listingController.mountains));
router.get('/iconicCities', wrapAsync(listingController.iconicCities));
router.get('/castles',wrapAsync(listingController.castles));
router.get('/amazingPools', wrapAsync(listingController.amazingPools));
// router.get('/trending',wrapAsync(listingController.trending));
router.get('/rooms', wrapAsync(listingController.rooms));
router.get('/boats', wrapAsync(listingController.boats));
router.get('/camping', wrapAsync(listingController.camping));
router.get('/farms', wrapAsync(listingController.farms));


// Index Route
router.route('/')
.get( wrapAsync(listingController.index))
.post( isLogggedin,upload.single('listing[image][url]'), validateListing, wrapAsync(listingController.createListing));




router.route('/:id')
.get( wrapAsync(listingController.showListing))
// Update Route
.put(isLogggedin,isOwner,upload.single('listing[image][url]'), validateListing, wrapAsync(listingController.updateListing))
// Delete Route
.delete(isLogggedin,isOwner, wrapAsync(listingController.distroyListing));



// Edit Route
router.get('/:id/edit',isLogggedin, isOwner, wrapAsync(listingController.renderEditForm));





module.exports = router;




// const express = require('express');
// const router = express.Router();
// const wrapAsync = require('../utils/wrapAsync.js');
// const {listingSchema} = require('../schema.js'); // for sever side validation
// const ExpressError = require('../utils/expressError.js');
// const Listing = require('../models/listing.js');


// // for sever side validation
//     // const validateListing = (req, res,next) =>{
//     //     let {error}= listingSchema.validate(req.body);
//     //     if (error){
//     //         let errMsg = error.details.map((el)=>el.message).join(",");  
//     //         throw new ExpressError(400, errMsg); 
//     //     }else{
//     //         next();
//     //     }
//     // }
//     const validateListing = (req, res, next) => {
//         let { error } = listingSchema.validate(req.body);
//         if (error) {
//             let errMsg = error.details.map((el) => el.message).join(",");
//             return next(new ExpressError(400, errMsg)); // Use next() to pass the error to the error-handling middleware
//         } else {
//             next();
//         }
//     }
    
// //index Route
// router.get('/' ,wrapAsync(async(req, res) => {
//     const allListing =  await Listing.find({});
//     res.render("../views/listings/index.ejs",{allListing});
// }));
// // new Route
// router.get('/new',wrapAsync((req,res)=>{
//     res.render("../views/listings/new.ejs");
// }));
// //show Route
// router.get('/:id',wrapAsync(async(req,res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findOne({_id:id}).populate("reviews");
//     console.log(listing);
//         res.render("../views/listings/show.ejs",{listing});
//     }));

    
// // create route
// router.post('/',validateListing,wrapAsync(async(req,res,next)=>{

//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings")

//     // if(!req.body.listing){
//     //     throw new ExpressError(400, "send valid listing");
//     // }
//         // const result = listingSchema.validate(req.body);
//         // console.log(result);
//         // if(result.error){
//         //     throw new ExpressError(400, result.error);
//         // }
//     //     let {title, description,image,location,price, country} = req.body;
//     // let sampleListing = new Listing({
//     //             title : title,
//     //             description : description,
//     //             price :price,
//     //             location : location,
//     //             country : country,
//     //             image : image
//     //         });
//             // if(!req.body.image){
//             //     throw new ExpressError(400, "Image is Missing");
//             // }
//             // if(!req.body.title){
//             //     throw new ExpressError(400, "Title is Missing");
//             // }
//             // if(!req.body.description){
//             //     throw new ExpressError(400, "Description is Missing");
//             // }
//             // if(!req.body.country){
//             //     throw new ExpressError(400, "country is Missing");
//             // }
//             // if(!req.body.location){
//             //     throw new ExpressError(400, "Location is Missing");
//             // }
//             // if(!req.body.price){
//             //     throw new ExpressError(400, "Price is Missing");
//             // }

            
//             // .then((data)=>{
//             //     console.log(data);
//             // }).catch((err)=>{
//             //     console.log(err);
//             // })
            
   
// }));


// //edit route
// router.get('/:id/edit', wrapAsync(async(req, res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findOne({_id:id});
//     res.render('../views/listings/edit.ejs',{listing});
// }));
// //update route
// router.put('/:id',validateListing, wrapAsync(async(req, res)=>{
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate({_id:id},{...req.body.listing});// ikkada const listing = ani iste kotha listing tayaraidhi
//     res.redirect(`/listings/${id}`);// important
// }));
// //delete route
// router.delete('/:id', wrapAsync(async(req, res)=>{
//     let {id} = req.params;
//     await Listing.findByIdAndDelete({_id:id});
//     res.redirect('/listings');
// }));


// module.exports = router;
