const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const {saveRedirectUrl, isloggedIn} = require('../middleware.js');
const userController = require('../controllers/user.js');

// signup
router.route('/signup')
.get( userController.renderSignupForm)
.post( wrapAsync(userController.registerUser));


// Login
router.route('/login')
.get(userController.showLoginForm)
.post(  saveRedirectUrl,  passport.authenticate('local',{failureRedirect:'/login', failureFlash: true}),userController.userRegistered)

// logout
router.get("/logout", userController.logout);

// to send mail
// router.get('/send-active-users-email',isloggedIn, userController.sendActiveUsersEmail);

router.get('/sendEmail', userController.sendActiveUsersEmail);

module.exports = router;