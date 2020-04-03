const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const spotifySchema = require('../models/db');
const bcrypt = require('bcrypt');
const joi = require('joi');
const jwtSeret = require('../config/jwtconfig');
const jwt =require('jsonwebtoken');
const auth=require('../middlewares/isMe')
require('../config/passport');

const passport =require('passport');


router.post('/api/signup',(req,res)=>{
console.log(req.body.user);
    const shcema = joi.object().keys({
        email: joi.string().trim().email().required() ,
        password: joi.string().required(),
        gender: joi.string().required() ,
        country: joi.string().required() ,
        birthday: joi.string().required() ,
        username:joi.string().required()
    });

    joi.validate(req.body.user,shcema,(err,result)=>{
        if(err){
            console.log("first");
            res.status(500).json({
                error:err
            })

        } else {

            spotifySchema.user.findOne({email:req.body.user.email}).exec().then(user=>{
                if(user){
                    
                    res.status(403).json({
                        message:'Mail exists'
                    });

                }
                else{

                    bcrypt.hash(req.body.user.password,10,(err,hash)=>{
                        if(err) {
                            console.log("second");

                            return res.status(500).json({error:err});

                        } else {

                            const user=new spotifySchema.user({
                                _id: mongoose.Types.ObjectId(),
                                email: req.body.user.email ,
                                password: hash,
                                displayName: req.body.user.username ,
                                gender: req.body.user.gender ,
                                country :req.body.user.country ,
                                birthDate:req.body.user.birthday ,
                                product:"free" ,
                                userType:"user" ,
                                type:"user" ,
                                isFacebook:false,
                                images:[] ,
                                follow:[] ,
                                followedBy:[] ,
                                like:[] ,
                                createPlaylist:[] ,
                                saveAlbum:[] ,
                                playHistory:[],
                                player:{}

                            });
                            
                            
                            user.save()
                                .then(result =>{
                
                                    var token = jwt.sign({ _id: user._id,product: user.product,userType:user.userType}, jwtSeret.secret, {
                                        expiresIn: '24h' // 1 day
                                      });
                                      
                                    res.status(201).json({
                                        token
                                    });
                                    
                                })
                                .catch(err=>{
                                    console.log("third");

                                    res.status(500).json({
                                        error:err
                                    });
                                });
                              
                                  

                        }

                    })

                }


            });
        
        }

    });

});

module.exports = router;
