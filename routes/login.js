const spotifySchema = require('../models/DB');
const jwtSeret = require('../config/jwtconfig');
const jwt =require('jsonwebtoken');
const passport =require('passport');
User= spotifySchema.User
var express = require('express');
const validateLoginInput = require("../validation/login");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
require('../config/passport');

const router=express.Router();





router.post("/signin", (req, res) => {
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
        return res.status(400).json({ emailnotfound: "Email not found" });
      }
  
      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name
          };
  
          // Sign token
          jwt.sign(
            payload,
            jwtSeret.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    });
  });
  module.exports = router;