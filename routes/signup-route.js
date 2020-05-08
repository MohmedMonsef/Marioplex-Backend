const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const spotifySchema = require('../models/db');
const bcrypt = require('bcrypt');
const { auth: checkAuth } = require('../middlewares/is-me');
const Joi = require('joi');
const jwtSeret = require('../config/jwtconfig');
var sendmail = require('../forget-password/sendmail');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/is-me')
require('../config/passport');
const User = require('../source/user-api')
const passport = require('passport');
const rateLimit = require("express-rate-limit");
// add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 2

});

// route for user sign up
router.post('/sign_up', limiter, async(req, res) => {
    // set Joi validation schema to check correctness of data
    const shcema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required(),
        gender: Joi.string().required(),
        country: Joi.string().required(),
        birthday: Joi.date().raw().required(),
        username: Joi.string().required()
    });

    Joi.validate(req.body, shcema, async(err, result) => {
        if (err) {
            // if not valid set status to 500
            res.status(500).json({
                error: err
            })

        } else {
            // if valid check that email didnt exist before
            spotifySchema.user.findOne({ email: req.body.email }).exec().then(async user => {
                if (user) {

                    res.status(403).json({
                        message: 'Mail exists'
                    });

                } else {
                    // if new email then set user up in database and hash the password
                    const user = await User.createUser(req.body.username, req.body.password, req.body.email, req.body.gender, req.body.country, req.body.birthday);
                    if (!user) return res.status(500).json({ error: err });
                    user.save().then(result => {
                            // set jwt then send it as response
                            var token = jwt.sign({ _id: user._id, product: user.product, userType: user.userType }, jwtSeret.secret, {
                                expiresIn: '9043809348h'
                            });
                            sendmail(user.email, String(user._id), "confirm");
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
});

router.post('/login/confirm', limiter, async(req, res) => {
    if (!req.query.id || req.query.id == "") { return res.status(403).send("user id is not given"); }
    let user = await users.getUserById(req.query.id);

    let checkConfirm = await users.confirmEmail(user);
    if (checkConfirm) {
        return res.status(200).send("user is confirmed");
    } else {
        return res.status(403).send("user isnot confirmed");
    }



});
module.exports = router;