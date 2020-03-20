const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const spotifySchema = require('../models/DB');
const bcrypt = require('bcrypt');
const joi = require('joi');
const jwtSeret = require('../config/jwtconfig');
const jwt =require('jsonwebtoken');
const auth=require('../middlewares/isMe')
require('../config/passport');

const passport =require('passport');


router.post('/sign_up',(req,res)=>{

    const shcema = joi.object().keys({
        email: joi.string().trim().email().required() ,
        password: joi.string().required(),
        gender: joi.string().required() ,
        country: joi.string().required() ,
        birthDate: joi.string().required() ,
        displayName:joi.string().required()

    });

    joi.validate(req.body,shcema,(err,result)=>{
        if(err){

            res.status(500).json({
                error:err
            })

        } else {

            spotifySchema.user.findOne({email:req.body.email}).exec().then(user=>{
                if(user){
                    
                    res.status(409).json({
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
                                userType:"user"
                            });
                            
                            user
                                .save()
                                .then(result =>{
                
                                    res.status(201).json({
                                        message:'User created'
                                    });
                                    
                                })
                                .catch(err=>{
                                    res.status(500).json({
                                        error:err
                                    });
                                });
                                const payload = {
                                    id: user.id,
                                    
                                  };
                                  var token = jwt.sign({ _id: user._id,product: user.product}, jwtSeret.secret, {
                                    expiresIn: '24h' // 1 week
                                  });
                                 
                                  // return the information including token as JSON
                                  //res.json({success: true, token: 'JWT ' + token});
                                  res.send(token.sign(_id));
                           // res.redirect('/login');
                        }
                    })
                }
            });          
        }
    });
});






module.exports = router;

