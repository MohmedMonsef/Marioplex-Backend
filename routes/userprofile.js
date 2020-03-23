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
        else {
            res.status(404).json({
                message:'user not found'
            });
            
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
            const user= User.update(userID,Display_Name,Password,Email,Country);
            if(user){
                res.status(200).json({
                    message:"information has been updated successfully"
                });
            }
            else{
                res.status(404).json({
                    message:'user not found'
                });
                
            }   
        }
    })
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
router.delete('/remove',checkAuth,(req,res,next)=>{
    const userID = req.user._id; // get it from desierialize auth 
    const user=User.deleteAccount(userID)
        if(user){
            res.send(user);
            
        }
        else {
            res.status(403).json({
                message:'user not found'
            });
            
        }        

})
module.exports=router;