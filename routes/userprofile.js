const express = require('express');
const router = express.Router();
const joi = require('joi');
const User = require('../public-api/user-api');
const spotifySchema = require('../models/db');
const {auth:checkAuth} = require('../middlewares/isMe');

router.get('/users/:id',checkAuth,(req,res,next)=>{
    spotifySchema.user.find({_id:req.params.id}).exec().then(user=>{
        if(user){
            res.status(200);
            res.send(user);
        }     
    }).catch(next);
})

router.put('/me/Update',checkAuth,(req,res,next)=>{
    const shcema = joi.object().keys({
        Email: joi.string().trim().email() ,
        Password: joi.string(),
        Country: joi.string() ,
        Display_Name:joi.string()
    });
    joi.validate(req.body,shcema,(err,result)=>{
        if(err){
            res.status(500).json({
                error:err
            })
        } 
        else{
            const userID = req.user._id; 
            const user=  User.update(userID,req.body.Display_Name,req.body.Password,req.body.Email,req.body.Country);
            if(user){
                res.status(200).json({
                    message:"information has been updated successfully"
                });
            }           
        } 
    })
})

router.get('/me',checkAuth,(req,res,next)=>{
    const userID = req.user._id; // get it from desierialize auth 
    spotifySchema.user.find({_id:userID},{
        displayName:1,
        email:1,
        birthDate:1,
        country:1,
        product:1,
        gender:1,
        images:1
    }).exec().then(user=>{
        if(user){
            res.status(200);
            res.send(user);   
        }     
    }).catch(next);
})

router.delete('/remove',checkAuth,(req,res,next)=>{
    const userID = req.user._id; // get it from desierialize auth 
    const user=User.deleteAccount(userID)
        if(user){
            res.send(user);
        }        
})

module.exports=router;