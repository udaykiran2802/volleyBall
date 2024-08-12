
const Listing = require('../models/listing.js');
module.exports.index = async (req, res) => {
    
    const allListing = await Listing.find({});
    console.log(res.locals.currPath);
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.arctic = async (req, res) => {
    
    const allListing = await Listing.find({category: 'arctic'});
    res.render("../views/listings/index.ejs", { allListing});
}
module.exports.domes = async (req, res) => {
    const allListing = await Listing.find({category: 'domes'});
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.mountains = async (req, res) => {
    console.log(res.locals.currPath);
    const allListing = await Listing.find({category: 'mountains'});
    console.log(allListing);
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.iconicCities = async (req, res) => {
    const allListing = await Listing.find({category: 'Iconic Cities'});
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.castles = async (req, res) => {
    const allListing = await Listing.find({category: 'castles'});
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.amazingPools = async (req, res) => {
    const allListing = await Listing.find({category: 'Amazing Pools'});
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.camping = async (req, res) => {
    const allListing = await Listing.find({category: 'camping'});
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.farms = async (req, res) => {
    const allListing = await Listing.find({category: 'farms'});
    console.log(allListing)
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.boats = async (req, res) => {
    const allListing = await Listing.find({category: 'boats'});
    res.render("../views/listings/index.ejs", { allListing });
}
module.exports.rooms = async (req, res) => {
    const allListing = await Listing.find({category: 'rooms'});
    res.render("../views/listings/index.ejs", { allListing });
}

module.exports.renderNewForm = (req, res) => {
    
    res.render("../views/listings/new.ejs");
}

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if (!listing) {
        req.flash("error", "The Listing you requested for does not exists!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("../views/listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;// prarti listing lo owner name display cheydAaniki use avthundi, user by defualt passport a create chestundi
    newListing.image= {url, filename};
    await newListing.save();
    req.flash("success", "new Listing saved successfully!");
    res.redirect("/listings");
}
// search
module.exports.search = async (req, res) => {
    // console.log(req.query.query);
    let searchListingName = req.query.query;
    const allListing = await Listing.find({title: { $regex:searchListingName,$options: 'i' }});
    console.log(allListing);
    if (allListing.length === 0) {
        req.flash("error", "The Listing you requested for does not exists!");
        res.redirect("/listings");
    }else{
    console.log(listing);
    res.render("../views/listings/index.ejs", { allListing });
    }

} 
//owner listings
module.exports.owner = async (req, res) => {
    const allListing = await Listing.find({owner: req.user._id });
    // if (allListing.length === 0) {
    //     req.flash("encourage", "You currently have no listings. Why not create your first one today and start your adventure?");
    //   return  res.redirect("/listings");
    // }
    
    res.render("../views/listings/index.ejs", { allListing });


}

module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "The listing you requested does not exist. Please try searching for a different listing");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");

    res.render('../views/listings/edit.ejs', { listing , originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    // let listing = await Listing.findById(id);
    
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image= {url, filename};
    await listing.save();
    }
    req.flash("success", "new Listing UPDATED successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.distroyListing = async (req, res) => {
    let { id } = req.params;
    try {
        await Listing.findByIdAndDelete(id);
        req.flash("fail", "Listing deleted!");
        res.redirect('/listings');
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ error: 'Failed to delete listing.' });
    }
    
}