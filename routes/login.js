const spotifySchema = require('../models/db');
const jwtSeret = require('../config/jwtconfig');
const jwt =require('jsonwebtoken');
const passport =require('passport');
var express = require('express');
const validateLoginInput = require("../validation/login");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const router=express.Router();
require('../config/passport');
User= spotifySchema.User

//request
router.post("/login", (req, res) => {
    // Form validation
  
    const { errors, isValid } = validateLoginInput(req.body);
  
    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    const email = req.body.email;
    const password = req.body.password;
  
    // Find user by email
    spotifySchema.user.findOne({email:req.body.email}).exec().then(user=>{
       // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
  
      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            
          };
          var token = jwt.sign({ _id: user._id,product: user.product,userType:user.userType}, jwtSeret.secret, {
            expiresIn: '874024h' // 1 day
          });
         
          // return the information including token as JSON
          //res.json({success: true, token: 'JWT ' + token});
          res.send({token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    });
  });
  module.exports = router;