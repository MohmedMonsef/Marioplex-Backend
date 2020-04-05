const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const spotifySchema = require('../models/db');
const bcrypt = require('bcrypt');
const joi = require('joi');
const jwtSeret = require('../config/jwtconfig');
const jwt =require('jsonwebtoken');
const auth=require('../middlewares/is-me')
require('../config/passport');

const passport =require('passport');


router.post('/sign_up',(req,res)=>{

    const shcema = joi.object().keys({
        email: joi.string().trim().email().required() ,
        password: joi.string().required(),
        gender: joi.string().required() ,
        country: joi.string().required() ,
        birthday: joi.string().required() ,
        username:joi.string().required()
    });

    joi.validate(req.body,shcema,(err,result)=>{
        if(err){

            res.status(500).json({
                error:err
            })

        } else {

            spotifySchema.user.findOne({email:req.body.email}).exec().then(user=>{
                if(user){
                    
                    res.status(403).json({
                        message:'Mail exists'
                    });

                }
                else{

                    bcrypt.hash(req.body.password,10,(err,hash)=>{
                        if(err) {

                            return res.status(500).json({error:err});

                        } else {

                            const user=new spotifySchema.user({
                                _id: mongoose.Types.ObjectId(),
                                email: req.body.email ,
                                password: hash,
                                displayName: req.body.username ,
                                gender: req.body.gender ,
                                country :req.body.country ,
                                birthDate:req.body.birthday ,
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
                            
                            user
                                .save()
                                .then(result =>{
                
                                    var token = jwt.sign({ _id: user._id,product: user.product,userType:user.userType}, jwtSeret.secret, {
                                        expiresIn: '9043809348h'
                                      });
                                      
                                    res.status(201).json({
                                        token
                                    });
                                    
                                })
                                .catch(err=>{
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
