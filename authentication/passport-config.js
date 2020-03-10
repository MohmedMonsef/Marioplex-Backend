const passport = require('passport');
const app = require('express')();
const session = require("express-session");
const bodyParser = require("body-parser");
app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});