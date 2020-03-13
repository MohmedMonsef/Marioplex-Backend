const passport = require('passport');
const app = require('express')();
const session = require("express-session");
const bodyParser = require("body-parser");


module.exports = passport =>{// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id); 
   // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
   
        done(null, true);
 
});
}