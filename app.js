if(process.env.NODE_EN != 'production'){
    require("dotenv").config();
}


const express = require('express');

const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ExpressError = require('./utils/expressError.js');


const listingRouter = require('./routes/listing.js');
const reviewsRouter = require('./routes/review.js'); 
const userRouter = require('./routes/user.js'); 
const playersRouter =require('./routes/player.js');
const videosRouter = require('./routes/video.js'); 

const Player = require('./models/player.js');


const session = require('express-session');
const MongoStore = require('connect-mongo');

const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingController = require('./controllers/listing.js');//1
const wrapAsync = require('./utils/wrapAsync.js');//2

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
const methodOverride = require('method-override');
app.use(methodOverride("_method")); 
const ejsMate = require('ejs-mate');
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, 'public')));//static files anevi public folder lo vunnai  avi use cheskodaniki

const dbURL = process.env.ATLAS_URL;
const port = 9000;
const localDBurl = "mongodb://127.0.0.1:27017/VOLLEYBALL";

main()
.then(()=>{
    console.log("Mongo database is connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbURL );  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
// online store 
const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE!",err);
})
 
const sessionOptns= {
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookies: {
        expires: Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000, 
        httpOnly: true,
    },
};

app.use(session(sessionOptns));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




  
  
  
  


app.listen(port,()=>{
    console.log(`app is listening on port ${port}`);
});
// connectToDatabase().then((db) => {
//     app.listen(port, () => {
//       console.log(`App is listening on port ${port}`);
//     });
//   }).catch(err => {
//     console.error('Failed to connect to the database:', err);
//   });

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.fail = req.flash("fail");
    res.locals.error = req.flash("error");
    res.locals.encourage = req.flash("encourage");
    res.locals.currUser = req.user;
    res.locals.currPath = req.url;
    

    next();
})

app.get('/',wrapAsync(async (req, res) => {
    
    const allPlayers = await Player.find({});
    console.log(res.locals.currPath);
    res.render("../views/players/index.ejs", { allPlayers });
}));//3

app.get('/privacy',(req, res) => {
    res.render("../views/privacyAndTerms/privacy.ejs");
});
app.get('/terms',(req, res) => {
    res.render("../views/privacyAndTerms/terms.ejs")
});

app.use("/listings",listingRouter);
app.use("/players",playersRouter);
app.use('/videos',videosRouter);
app.use("/players/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/service-worker.js')
//     .then(function(registration) {
//         console.log('Service Worker registered with scope:', registration.scope);
//     })
//     .catch(function(error) {
//         console.error('Service Worker registration failed:', error);
//     });
// }
// function askNotificationPermission() {
//     return new Promise(function(resolve, reject) {
//         const permissionResult = Notification.requestPermission(function(result) {
//             resolve(result);
//         });

//         if (permissionResult) {
//             permissionResult.then(resolve, reject);
//         }
//     }).then(function(permissionResult) {
//         if (permissionResult !== 'granted') {
//             throw new Error('Permission not granted for notifications');
//         }
//     });
// }

// askNotificationPermission();
// function subscribeUserToPush() {
//     return navigator.serviceWorker.ready.then(function(registration) {
//         return registration.pushManager.subscribe({
//             userVisibleOnly: true,
//             applicationServerKey: urlBase64ToUint8Array('<Your Public VAPID Key>')
//         });
//     }).then(function(subscription) {
//         console.log('User is subscribed:', subscription);
//         // Send the subscription object to your server for storage
//         // Use a POST request to save this subscription on your server
//     }).catch(function(error) {
//         console.error('Failed to subscribe the user: ', error);
//     });
// }

// subscribeUserToPush();






app.all("*", (req, res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})





app.use((err, req, res, next) =>{
    let{statusCode=500,message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
});











