const passport = require('passport');
const app = require('express')();
const session = require("express-session");
const bodyParser = require("body-parser");

// TO DO
// DONT SAVE COOKIES
// IMPLEMENT JWT
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
   
      done(null, id);
   
});