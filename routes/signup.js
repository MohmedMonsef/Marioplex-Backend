const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const spotifySchema = require('../models/DB');
const bcrypt = require('bcrypt');
const joi = require('joi');

//requet
router.post('/signup',(req,res)=>{
    const shcema = joi.object().keys({

        email: joi.string().trim().email().required() ,
        password: joi.string().required(),
        gender: joi.string().required() ,
        country: joi.string().required() ,
        birthDate: joi.string().required()

    });
    joi.validate(req.body,shcema,(err,result)=>{
        if(err){
            res.send("error occured");

        } else {
            spotifySchema.user.findOne({email:req.body.email}).exec().then(user=>{
                if(user){  //email must be unique
                    res.send("Mail exists");
                }
                else{
                    bcrypt.hash(req.body.password,10,(err,hash)=>{
                        if(err) {
                            return res.status(500).json({
                                error:err
                            });
                        } else {
                            const user=new spotifySchema.user({
                                _id: mongoose.Types.ObjectId(),
                                email: req.body.email ,
                                password: hash,
                                gender: req.body.gender ,
                                country :req.body.country ,
                                birthDate:req.body.birthDate
                            });
                            user
                                .save()
                                .then(result =>{
                
                                    res.status(201).json({
                                        message:'User created'
                                        
                               
                                    });
                                    Console.log(result);
                                })
                                .catch(err=>{
                                    Console.log(err);
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