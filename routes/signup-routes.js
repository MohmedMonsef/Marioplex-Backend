const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const spotifySchema = require('../models/db');
const bcrypt = require('bcrypt');
const joi = require('joi');
const jwtSeret = require('../config/jwtconfig');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/is-me')
require('../config/passport');

const passport = require('passport');

// route for user sign up
router.post('/sign_up', (req, res) => {
    // set joi validation schema to check correctness of data
    const shcema = joi.object().keys({
        email: joi.string().trim().email().required(),
        password: joi.string().required(),
        gender: joi.string().required(),
        country: joi.string().required(),
        birthday: joi.string().required(),
        username: joi.string().required()
    });

    joi.validate(req.body, shcema, (err, result) => {
        if (err) {
            // if not valid set status to 500
            res.status(500).json({
                error: err
            })

        } else {
            // if valid check that email didnt exist before
            spotifySchema.user.findOne({ email: req.body.email }).exec().then(user => {
                if (user) {

                    res.status(403).json({
                        message: 'Mail exists'
                    });

                } else {
                    // if new email then set user up in database and hash the password
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {

                            return res.status(500).json({ error: err });

                        } else {

                            const user = new spotifySchema.user({
                                _id: mongoose.Types.ObjectId(),
                                email: req.body.email,
                                password: hash,
                                displayName: req.body.username,
                                gender: req.body.gender,
                                country: req.body.country,
                                birthDate: req.body.birthday,
                                product: "free",
                                userType: "user",
                                type: "user",
                                isFacebook: false,
                                images: [],
                                follow: [],
                                followedBy: [],
                                like: [],
                                createPlaylist: [],
                                saveAlbum: [],
                                playHistory: [],
                                player: {}

                            });
                            user.player["is_shuffled"] = false;
                            user.player["volume"] = 4;
                            user.player["is_repeat"] = false;
                            user
                                .save()
                                .then(result => {
                                    // set jwt then send it as response
                                    var token = jwt.sign({ _id: user._id, product: user.product, userType: user.userType }, jwtSeret.secret, {
                                        expiresIn: '9043809348h'
                                    });

                                    res.status(201).json({
                                        token
                                    });

                                })
                                .catch(err => {
                                    // if error send 500 status code something went wrong
                                    res.status(500).json({
                                        error: err
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