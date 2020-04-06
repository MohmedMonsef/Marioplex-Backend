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

router.get('/facebookJWT',checkAuthentication,async (req,res)=>{
    const id = req.session.passport.user;
    const user = await userDocument.findById(id);
    //console.log(user);
   var token = jwt.sign({ _id: id,product:user.product,userType:user.userType}, jwtSeret.secret, {

        expiresIn: '3209832702h'
     });
     
      // return the information including token as JSON
      res.json({ token: token});
     // res.send(token);
});

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
    //res.send('hh')
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