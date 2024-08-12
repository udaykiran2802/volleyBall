
const express = require('express');
// const fetch = require('node-fetch');
// import fetch from 'node-fetch';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const router = express.Router();
// cloud lo photo store cheydaniki - output oka link vastundi
const multer = require('multer');
const {storage}= require('../cloudConfig.js');
const upload = multer({storage});
// 
const wrapAsync = require('../utils/wrapAsync.js');
const {isLogggedin, isVideoOwner, validatePlayer} = require('../middleware.js');
// 
const Player = require('../models/player.js');
const Video = require('../models/video.js'); 



app.use(express.urlencoded({ extended: true }));

router.get('/',wrapAsync(async (req, res) => {
    
    const allVideos = await Video.find({});
    console.log(res.locals.currPath);
    res.render("../views/videos/index.ejs", { allVideos });
}));
router.post('/', wrapAsync(async (req, res) => {
    const { url, video } = req.body; // Assume video contains title, team1, team2, and mvp

    console.log('Received URL:', url);
    // let player = Player.findById(req.user._id);

    // Validate the input
    if (!url || !video || !video.title || !video.team1 || !video.team2 || !video.mvp) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/videos/new');
    }

    // Extract the video ID from the YouTube URL
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
    if (!videoIdMatch) {
        req.flash('error', 'Invalid YouTube video URL');
        return res.redirect('/videos/new');
    }
    const videoId = videoIdMatch[1];

    try {
        // Fetch video details from YouTube API
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`);
        const data = await response.json();

        console.log('YouTube API Response:', data);

        if (data.items.length === 0) {
            req.flash('error', 'Invalid YouTube video ID');
            return res.redirect('/videos/new');
        }

        const videoData = data.items[0].snippet;

        // Create a new video document
        const newVideo = new Video({
            title: video.title,
            team1: video.team1,
            team2: video.team2,
            mvp: video.mvp,
            
            url: url,
            embedHtml: `<iframe width="512" height="288" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
            author: req.user._id ,// Assuming you want to associate the video with the logged-in user
            category: video.category,
        });
        // player.videos.push(newVideo);
        // Save the video document to the database
        await newVideo.save();
        // await player.save();
        req.flash("success", "New Video added successfully!");
        res.redirect("/videos");
    } catch (e) {
        console.error(e);
        req.flash('error', 'Failed to fetch YouTube video details');
        res.redirect('/videos/new');
    }
}));

router.get('/exercise',async (req, res) => {
    const allVideos = await Video.find({category: 'exercise'});
    res.render("../views/videos/index.ejs", { allVideos });
}
);
router.get('/match',async (req, res) => {
    const allVideos = await Video.find({category: 'match'});
    res.render("../views/videos/index.ejs", { allVideos });
}
);
router.get('/others',async (req, res) => {
    const allVideos = await Video.find({category: 'others'});
    res.render("../views/videos/index.ejs", { allVideos });
}
);
router.get('/search',wrapAsync(async (req, res) => {
    // console.log(req.query.query);
    let videoTitle = req.query.query;
    const allVideos = await Video.find({title: { $regex:videoTitle,$options: 'i' }});
    console.log(allVideos);
    if (allVideos.length === 0) {
        req.flash("error", "The Profile you requested for does not exists!");
        res.redirect("/videos");
    }else{
    
    res.render("../views/videos/index.ejs", { allVideos });
    }

} ))



router.get('/new',isLogggedin, wrapAsync((req, res) => {
    
    res.render("../views/videos/new.ejs");
}
));

router.get('/:id',wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const video = await Video.findById(id).populate("author");
    if (!video) {
        req.flash("error", "The Video you requested for does not exists!");
        res.redirect("/videos");
    }
    console.log(video);
    res.render("../views/videos/show.ejs", { video });
}));

router.get('/:id/edit',isLogggedin, isVideoOwner,wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        req.flash("error", "The Video you requested does not exist. Please try searching for a different Video");
        res.redirect("/videos");
    }
    // let originalImageUrl = player.image.url;
    // originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");

    res.render('../views/videos/edit.ejs', { video });
}));

router.put('/:id',isLogggedin,isVideoOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let video = await Video.findByIdAndUpdate(id, { ...req.body.video });
    
    await video.save();
    
    console.log("------------------------------------------------");
    // console.log(req.body.listing);
    req.flash("success", "video description UPDATED successfully!");
    res.redirect(`/videos/${id}`);
}));
router.delete('/:id',isLogggedin,isVideoOwner,wrapAsync(async (req, res) => {
    let { id } = req.params;
    try {
        await Video.findByIdAndDelete(id);
        req.flash("fail", "Video Deleted!");
        res.redirect('/videos');
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video.' });
    }
    
}));


module.exports = router;