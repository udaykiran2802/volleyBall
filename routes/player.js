
const express = require('express');
const app = express();
const router = express.Router();
// cloud lo photo store cheydaniki - output oka link vastundi
const multer = require('multer');
const {storage}= require('../cloudConfig.js');
const upload = multer({storage});
// 
const wrapAsync = require('../utils/wrapAsync.js');
const {isLogggedin, isOwner,validateListing, validatePlayer} = require('../middleware.js');
// 
const Player = require('../models/player.js');
const Subscription = require('../models/subscription.js'); 
const webpush = require('web-push'); 

app.use(express.urlencoded({ extended: true }));

router.get('/',wrapAsync(async (req, res) => {
    
    const allPlayers = await Player.find({});
    console.log(res.locals.currPath);
    res.render("../views/players/index.ejs", { allPlayers });
}));
router.post('/',isLogggedin, upload.single('image'), wrapAsync(async (req, res) => {
    console.log("hi");
    console.log(req.body);  // Log the body of the request
    console.log(req.file);  // Log the file object

    if (!req.file) {
        req.flash("error", "File upload failed");
        return res.redirect("/players/new");
      }

    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url);
    console.log(filename);
    const newPlayer = new Player(req.body.player);
    newPlayer.owner = req.user._id;// prarti listing lo owner name display cheydAaniki use avthundi, user by defualt passport a create chestundi
    newPlayer.image= {url, filename};
    await newPlayer.save();
    const subscriptions = await Subscription.find({}); // Assuming you have a Subscription model 
 
    if (subscriptions.length > 0) { 
        const payload = JSON.stringify({ 
            title: 'NEW Profile Created!', 
            body: `A NEW Profile is created by ${req.user.username}`, 
            icon: '/images/volleyballA.png' 
        }); 
 
        // Send notification to each subscription 
        const notificationPromises = subscriptions.map(sub => { 
            return webpush.sendNotification(sub, payload).catch(err => { 
                console.error('Error sending push notification:', err); 
            }); 
        }); 
 
        // Wait for all notifications to be sent 
        await Promise.all(notificationPromises); 
    }
    req.flash("success", "new Player saved successfully!");
    res.redirect("/players");
}));
router.get('/search',wrapAsync(async (req, res) => {
    // console.log(req.query.query);
    let playerName = req.query.query;
    const allPlayers = await Player.find({name: { $regex:playerName,$options: 'i' }});
    console.log(allPlayers);
    if (allPlayers.length === 0) {
        req.flash("error", "The Profile you requested for does not exists!");
        res.redirect("/players");
    }else{
    
    res.render("../views/players/index.ejs", { allPlayers });
    }

} ))



router.get('/new',isLogggedin, wrapAsync((req, res) => {
    
    res.render("../views/players/new.ejs");
}
));

router.get('/:id',wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const searchTerm = req.query.bar;
    const player = await Player.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner").populate("videos").populate('progress');
    if (!player) {
        req.flash("error", "The Player profile you requested for does not exists!");
        res.redirect("/players");
    }
//   if(player.progress) {
//     const Data = player.progress[player.progress.length - 1];
    
//     const preData={
//         serve:Data.servePoints,
//         receive : Data.receivePoints,
//         hitting:Data.hittingPoints,
//         blocking : Data.blockingPoints,
//         setting : Data.settingPoints,
//         defense : Data.defensePoints
//     }
//     const pointsMap = {
//         serve: 'servePoints',
//         receive: 'receivePoints',
//         hitting: 'hittingPoints',
//         blocking: 'blockingPoints',
//         setting: 'settingPoints',
//         defense: 'defensePoints'
//     };

//     // Determine which points to extract based on searchTerm
//     const pointsKey = pointsMap[searchTerm] || 'servePoints'; // Default to servePoints if searchTerm is invalid
//     const servePointsArray = player.progress.map(progressEntry => progressEntry[pointsKey]);
//     const labels = servePointsArray.map((_, index) => `${index + 1}`);
//   }

//     // console.log(player);

    res.render("../views/players/show.ejs", { player});
}));
router.get('/:id/progress', async (req, res) => {
    let { id } = req.params;
    const searchTerm = req.query.bar;
    const player = await Player.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner").populate("videos").populate('progress');
    if (!player) {
        req.flash("error", "The Player profile you requested for does not exists!");
        res.redirect("/players");
    }
     // Check if the progress array is not empty
     if (!player.progress || player.progress.length === 0) {
        req.flash("error", "No progress data available for this player.");
        return res.redirect(`/players/${id}`);
    }
  
    const Data = player.progress[player.progress.length - 1];
    
    const preData={
        serve:Data.servePoints,
        receive : Data.receivePoints,
        hitting:Data.hittingPoints,
        blocking : Data.blockingPoints,
        setting : Data.settingPoints,
        defense : Data.defensePoints
    }
    const pointsMap = {
        serve: 'servePoints',
        receive: 'receivePoints',
        hitting: 'hittingPoints',
        blocking: 'blockingPoints',
        setting: 'settingPoints',
        defense: 'defensePoints'
    };

    // Determine which points to extract based on searchTerm
    const pointsKey = pointsMap[searchTerm] || 'servePoints'; // Default to servePoints if searchTerm is invalid
    const servePointsArray = player.progress.map(progressEntry => progressEntry[pointsKey]);
    const labels = servePointsArray.map((_, index) => `${index + 1}`);
    console.log("--------------------------------")
    console.log(preData);
    console.log("--------------------------------")
    console.log(servePointsArray);
    console.log("--------------------------------")
    console.log(labels);
    console.log("--------------------------------")
    console.log(searchTerm);
  
  res.render("../views/players/progress.ejs", { player, preData,servePointsArray ,labels,searchTerm});

});
router.post('/:id', isLogggedin,isOwner,wrapAsync(async function (req, res) {
    let { id } = req.params;
    const { servePoints, receivePoints, hittingPoints, blockingPoints, defensePoints, settingPoints } = req.body;

    const player = await Player.findById(id); 
    player.progress.push({
        servePoints,
        receivePoints,
        hittingPoints,
        blockingPoints,
        defensePoints,
        settingPoints
    });
    await player.save();
    // const searchTerm = req.query.bar;
    const Data = player.progress[player.progress.length - 1];
    
    const preData={
        serve:Data.servePoints,
        receive : Data.receivePoints,
        hitting:Data.hittingPoints,
        blocking : Data.blockingPoints,
        setting : Data.settingPoints,
        defense : Data.defensePoints
    }
    // const pointsMap = {
    //     serve: 'servePoints',
    //     receive: 'receivePoints',
    //     hitting: 'hittingPoints',
    //     blocking: 'blockingPoints',
    //     setting: 'settingPoints',
    //     defense: 'defensePoints'
    // };
    searchTerm = 'serve'
    // Determine which points to extract based on searchTerm
    const pointsKey = 'servePoints'; // Default to servePoints if searchTerm is invalid
    const servePointsArray = player.progress.map(progressEntry => progressEntry[pointsKey]);
    const labels = servePointsArray.map((_, index) => `${index + 1}`);


  
    // res.render("../views/players/show.ejs", { player, preData });
    // res.redirect(`/players/${id}`);
    res.render("../views/players/progress.ejs", { player, preData,servePointsArray ,labels});
}));






router.get('/:id/edit',isLogggedin, isOwner,wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const player = await Player.findById(id);
    if (!player) {
        req.flash("error", "The Players profile you requested does not exist. Please try searching for a different profile");
        res.redirect("/players");
    }
    let originalImageUrl = player.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");

    res.render('../views/players/edit.ejs', { player , originalImageUrl});
}));

router.put('/:id',isLogggedin,isOwner, upload.single('image'), wrapAsync(async (req, res) => {
    let { id } = req.params;
    let player = await Player.findByIdAndUpdate(id, { ...req.body.player });
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    player.image= {url, filename};
    await player.save();
    }
    const subscriptions = await Subscription.find({}); // Assuming you have a Subscription model 
 
    if (subscriptions.length > 0) { 
        const payload = JSON.stringify({ 
            title: 'Profile is Edited!', 
            body: `"${req.body.player.name}" Profile is Edited by ${req.user.username}`, 
            icon: '/images/volleyballA.png' 
        }); 
 
        // Send notification to each subscription 
        const notificationPromises = subscriptions.map(sub => { 
            return webpush.sendNotification(sub, payload).catch(err => { 
                console.error('Error sending push notification:', err); 
            }); 
        }); 
 
        // Wait for all notifications to be sent 
        await Promise.all(notificationPromises); 
    }
    console.log("------------------------------------------------");
    // console.log(req.body.listing);
    req.flash("success", "Player profile UPDATED successfully!");
    res.redirect(`/players/${id}`);
}));
router.delete('/:id',isLogggedin,isOwner,wrapAsync(async (req, res) => {
    let { id } = req.params;
    try {
        await Player.findByIdAndDelete(id);
        req.flash("fail", "Player profile deleted!");
        res.redirect('/players');
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ error: 'Failed to delete profile.' });
    }
    
}));


module.exports = router;