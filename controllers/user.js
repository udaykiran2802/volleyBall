
const User = require('../models/user.js');
const nodemailer = require('nodemailer');

// Create an in-memory object to store active users
const activeUsers = {};

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.registerUser = async (req, res) => {
    try {
        let { username, password, email } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        req.logIn(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            // Store the sessionID and username in activeUsers
            activeUsers[req.sessionID] = registeredUser.username;
            // console.log(activeUsers[req.sessionID]);
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
                subject: `"${username}" - USER Signed IN `,
                text: `"${username}" is logged in at ${new Date().toLocaleString()} ` // Use newline for email formatting
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
            

            req.flash('success', "Welcome to VolleyBall Club");
            res.redirect("/players");
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect("/signup");
    }
};



module.exports.showLoginForm = (req, res) =>{
    res.render("users/login.ejs");
}
module.exports.userRegistered = async (req, res) => {
    // Store the sessionID and username in activeUsers
    const userId = req.body.username;
    req.session.user = userId;

    // Store the user by sessionID in activeUsers
    activeUsers[req.sessionID] = {
        username: userId,
        timestamp: Date.now()  // Storing the login timestamp
    };

    // Logging the correct information
    console.log(activeUsers[req.sessionID]);  // This should now print the active user with sessionID
    console.log(".......");
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
        subject: `"${userId}" - USER logged IN  `,
        text: `"${userId}" is logged in at ${new Date().toLocaleString()} ` // Use newline for email formatting
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

    req.flash("success", "Welcome to VolleyBall club! You are now logged in successfully!");
    let redirectUrl = res.locals.redirectUrl || "/players";
    res.redirect(redirectUrl);
};


// module.exports.userRegistered = async (req, res) => {
//     if (req.session.passport && req.session.passport.user) {
//         const username = await User.findById(req.session.passport.user).select('username'); // get user details from DB
//         activeUsers[req.sessionID] = username.username;
//     }
//     // console.log(activeUsers[req.sessionID]);
//     console.log(".......");
//     req.flash("success", "Welcome to VolleyBall club! You are now logged in successfully!");
//     let redirectUrl = res.locals.redirectUrl || "/players";
//     res.redirect(redirectUrl);
// };


module.exports.logout = (req, res, next)=>{
    const userId = req.user.username;
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        // Remove the sessionID from activeUsers when the user logs out
        delete activeUsers[req.sessionID];
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
            subject: `"${userId}" - USER logged OUT `,
            text: `"${userId}" is logged OUT at ${new Date().toLocaleString()} ` // Use newline for email formatting
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
    
        req.flash("encourage", "Now , you are logged out!");
        res.redirect("/players");
    });
}



module.exports.sendActiveUsersEmail = async (req, res) => {
    // Create an array to hold detailed user information
    const activeUserDetails = Object.entries(activeUsers).map(([sessionId, userInfo]) => {
        const { username, timestamp } = userInfo;  // Destructure the user info
        const loginTime = new Date(timestamp).toLocaleString();  // Format login time
        return `Username: ${username}, Login Time: ${loginTime}`;
    });

    // Join the detailed user info into a single string
    const activeUserList = activeUserDetails.join("\n"); // Use newline for better readability
    console.log("Active Users:", activeUsers);  // Check the content
    console.log("Active User List:", activeUserList);  // Check the final string

    if (!activeUserList) {
        console.log('No active users');
        req.flash('encourage', 'No active users to send.');
        return res.redirect('/players');
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'udaykiran2822@gmail.com',
            pass: 'tewpljiypykejagr' // Use the app password here
        }
    });

    let mailOptions = {
        from: 'udaykiran2822@gmail.com',
        to: 'udaykiran2802@gmail.com',
        subject: 'Current Active Users',
        text: `The following users are currently active on the website:\n\n${activeUserList}` // Use newline for email formatting
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            req.flash('error', 'Error sending email');
            return res.redirect('/players');
        }
        req.flash('success', 'Active users list has been emailed successfully!');
        res.redirect('/players');
    });
};
