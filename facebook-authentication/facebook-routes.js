const router = require('express').Router();
const passport = require('passport');

const jwtSeret = require('../config/jwtconfig');
const jwt =require('jsonwebtoken');

const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');


// initialize the strategy
require('./facebook-authentication')(passport);

// serialize user
passport.serializeUser(function(user, done) {
  
    done(null, user._id);
});
// deserialize user
passport.deserializeUser(async function(id, done) {
    await userDocument.findById(id, function(err, user) {
      
      done(err, user);
    });
});
// middleware to check if user logging in from facebook succeded or not
function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/login");
    }
}
// set facebook parameters to ask for from the user
router.get('/facebook', passport.authenticate('facebook',{ scope: ['user_birthday','user_gender','user_hometown','user_photos','user_friends','email']  }));

// set up the call back url that facebook will redirect to after authenticating the user
router.get('/facebook/callback',passport.authenticate('facebook', {  successRedirect: '/api/auth/facebookJWT',failureRedirect: '/login' }));

// custom route to generate jwt token for user if succeded to login from facebook
router.get('/facebookJWT',checkAuthentication,async (req,res)=>{
    const id = req.session.passport.user;
    const user = await userDocument.findById(id);
    
   var token = jwt.sign({ _id: id,product:user.product,userType:user.userType}, jwtSeret.secret, {

        expiresIn: '3209832702h'
     });
     
      // return the information including token as JSON
      res.json({ token: token});
     
});

// custom route to work with facebook sdk with android, where it set up the user in database when user login with facebook from android sdk
router.post('/facebookAndroid',async (req,res)=>{
    let email = req.body.email;
    if(!email){
        res.status(403).send("No Email");
        return 0;
    }
    const user = await userDocument.findOne({ email:email },(err,user)=>{

        if(err) return 0;
        return user;
    });
    if(user){
        // user in db
       
        const id = user._id;
   
   var token = jwt.sign({ _id: id,product:user.product,userType:user.userType}, jwtSeret.secret, {

        expiresIn: '3209832702h' 
     });
     
      // return the information including token as JSON
      res.json({ token: token});
    }else{

      
        // create user
        const newUser = await new userDocument({
            email:email,

            displayName:req.body.name,
            gender:req.body.gender,
            isFacebook:true,
            product:"free" ,
            userType:"user" ,
            type:"user" ,
            images:req.body.photos ,
            birthDate:req.body.birthday ,
            follow:[] ,
            followedBy:[] ,
            like:[] ,
            createPlaylist:[] ,
            saveAlbum:[] ,
            playHistory:[]


        }).save();
       
        var token = jwt.sign({ _id: newUser._id,product:newUser.product,userType:newUser.userType}, jwtSeret.secret, {

            expiresIn: '3209832702h'
         });
         
          // return the information including token as JSON
          res.status(200).json({ token: token});
    }
}




)

module.exports = router;