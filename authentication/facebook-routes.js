const router = require('express').Router();
const passport = require('passport');

const jwtSeret = require('../config/jwtconfig');
const jwt =require('jsonwebtoken');

const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');


// initialize the strategy
require('./facebook-authentication')(passport);

// serialize user
passport.serializeUser(function(user, done) {
  
    done(null, user.id);
});
  
passport.deserializeUser(async function(id, done) {
    await userDocument.findById(id, function(err, user) {
      
      done(err, user);
    });
});

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/login");
    }
}
router.get('/facebook', passport.authenticate('facebook',{ scope: ['user_birthday','user_gender','user_hometown','user_photos','user_friends','email']  }));

router.get('/facebook/callback',passport.authenticate('facebook', {  successRedirect: '/auth/facebookJWT',failureRedirect: '/login' }));

router.get('/facebookJWT',checkAuthentication,(req,res)=>{
    const id = req.session.passport.user;
    //res.send('hh')
   var token = jwt.sign({ _id: id,product:req.session.passport.user.product}, jwtSeret.secret, {

        expiresIn: '3209832702h' // 1 day
     });
     
      // return the information including token as JSON
      res.json({ token: token});
     // res.send(token);
});

module.exports = router;