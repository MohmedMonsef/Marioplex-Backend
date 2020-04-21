const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const spotifySchema = require('../models/db');
const jwtSeret = require('../config/jwtconfig');
const jwt =require('jsonwebtoken');
const Users = require('../public-api/user-api');
const Notifications = require('../public-api/notification-api');
const passport =require('passport');
var express = require('express');
const validateLoginInput = require("../validation/login");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const router=express.Router();
const {auth:checkAuth} = require('../middlewares/is-me');
require('../config/passport');
User= spotifySchema.User

//request to log in the user
router.post("/login", (req, res) => {
    // Form validation
  
    const { errors, isValid } = validateLoginInput(req.body);
  
    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  // get element and password from body of the request
    const email = req.body.email;
    const password = req.body.password;
  
    // Find user by email
    spotifySchema.user.findOne({email:email}).exec().then(user=>{
       // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
  
      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          var token = jwt.sign({ _id: user._id,product: user.product,userType:user.userType}, jwtSeret.secret, {
            expiresIn: '874024h' 
          });
         
          // return the information including token as JSON
          res.send({token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    });
  });

  //Notification Token Set
  router.post("/notification/token",checkAuth,async (req, res) => {
    
  if(!req.body.fcmToken||req.body.fcmToken==""){return res.status(404).send({error:"FCM TOKEN IS NOT PROVIDED"})}
    let userId=req.user._id;
    let user=await Users.getUserById(userId);
    if(!user){return res.status(404).send({error:"User IS NOT FOUND"})}
    if(!user.fcmToken){user.fcmToken="none";
    await user.save();}
    user.fcmToken=req.body.fcmToken;
  await user.save();
    if(user.offlineNotifications&&user.offlineNotifications.length>0){
      console.log(user.fcmToken);
      await Notifications.sendOfflineNotifications(user.offlineNotifications,user);

    }
    return res.status(200).send({Success:"Token is set successfully"})

  });

    //User logs out
    router.post("/user/logout",checkAuth,async (req, res) => {
    
        let userId=req.user._id;
        let user=await Users.getUserById(userId);
        if(!user){return res.status(404).send({error:"User IS NOT FOUND"})}
        await userDocument.updateOne({ _id:user._id }, {
          fcmToken:"none"
      });
        return res.status(202).send({Success:"Token is set successfully"})
    
      });
  module.exports = router;