const express = require('express');
const router = express.Router();

const spotifySchema = require('../models/db');
const {auth:checkAuth} = require('../middlewares/isMe');

router.get('/users/:id',checkAuth,(req,res,next)=>{
    spotifySchema.user.find({_id:req.params.id}).exec().then(user=>{
        if(user){
            res.status(200);
            res.send(user);
            
        }
        else {
            res.status(404).json({
                message:'user not found'
            });
            
        }        
}).catch(next);
})

router.get('/me',checkAuth,(req,res,next)=>{
    const userID = req.user._id; // get it from desierialize auth 
    spotifySchema.user.find({_id:userID}).exec().then(user=>{
        if(user){

            res.status(200);
            res.send(user);
            
        }
        else {
            res.status(403).json({
                message:'user not found'
            });
            
        }        
}).catch(next);
})