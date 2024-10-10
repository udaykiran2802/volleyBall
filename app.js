if(process.env.NODE_EN != 'production'){
    require("dotenv").config();
}


const express = require('express');

const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ExpressError = require('./utils/expressError.js');

const webpush = require('web-push'); 
const bodyParser = require('body-parser'); 
const PushNotifications = require("node-pushnotifications");

const listingRouter = require('./routes/listing.js');
const reviewsRouter = require('./routes/review.js'); 
const userRouter = require('./routes/user.js'); 
const playersRouter =require('./routes/player.js');
const videosRouter = require('./routes/video.js'); 

const Player = require('./models/player.js');
const Subscription = require('./models/subscription.js'); 
const {isLogggedin, isVideoOwner} = require('./middleware.js');


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


app.use(bodyParser.json()); 
app.use(function (req, res, next) { 
    // Website you wish to allow to connect 
    res.setHeader("Access-Control-Allow-Origin", "*"); 
   
    // Request methods you wish to allow 
    res.setHeader( 
      "Access-Control-Allow-Methods", 
      "GET, POST, OPTIONS, PUT, PATCH, DELETE" 
    ); 
   
    // Request headers you wish to allow 
    res.setHeader("Access-Control-Allow-Headers", "*"); 
   
    // Set to true if you need the website to include cookies in the requests sent 
    // to the API (e.g. in case you use sessions) 
    res.setHeader("Access-Control-Allow-Credentials", true); 
   
    // Pass to next layer of middleware 
    next(); 
  }); 
const publicVapidKey = 'BCxb0euQVTNhGOanwQGkhmLp31SB-5LMaZjcrtF6-NspJ10rOWxHchg6Um8ahBxrlz7SwG-pvyVZbQstFlxdSOo'; 
const privateVapidKey = process.env.PRIVATE_VAPID_KEY; 
// identify who is sending push notifications 
webpush.setVapidDetails('mailto:udaykiran2822@gmail.com', publicVapidKey,privateVapidKey); 

app.post('/subscribe',isLogggedin,  async (req, res) => { 
    const subscription = req.body;  // Get the subscription object sent from the frontend 
    const userId =  req.user._id;   
     
    try { 
        // Check if a subscription already exists for this user 
        let existingSubscription = await Subscription.findOne({ userId: userId }); 
 
        if (existingSubscription) { 
            // If subscription exists, update it 
            existingSubscription.endpoint = subscription.endpoint; 
            existingSubscription.keys = subscription.keys; 
            await existingSubscription.save(); 
        } else { 
            // If no subscription exists, create a new one 
            const newSubscription = new Subscription({ 
                endpoint: subscription.endpoint, 
                keys: subscription.keys, 
                userId: userId 
            }); 
            await newSubscription.save(); 
        } 
 
        res.status(201).json({ message: 'Subscription saved successfully!' }); 
    } catch (error) { 
        console.error('Error saving subscription:', error); 
        res.status(500).json({ error: 'Failed to save subscription' }); 
    } 
});  
app.post('/unsubscribe',isLogggedin, async (req, res) => { 
    const userId =  req.user._id;  
    try { 
        await Subscription.findOneAndDelete({ userId: userId }); 
        res.status(200).json({ message: 'Subscription deleted successfully!' }); 
    } catch (error) { 
        console.error('Error deleting subscription:', error); 
        res.status(500).json({ error: 'Failed to delete subscription' }); 
    } 
}); 


  
  
  
  


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




app.all("*", (req, res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})





app.use((err, req, res, next) =>{
    let{statusCode=500,message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
});











