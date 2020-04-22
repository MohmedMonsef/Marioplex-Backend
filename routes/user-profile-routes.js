const express = require('express');
const router = express.Router();
const Joi = require('joi');
const profileNotification = require('../public-api/notification-api');
const User = require('../public-api/user-api');
const spotifySchema = require('../models/db');
const { auth: checkAuth } = require('../middlewares/is-me');
const rateLimit = require("express-rate-limit");
// add rate limiting
const limiter = rateLimit({
    windowMs:  60 * 1000, 
    max: 30

});

//GET USER'S PUBLIC PROFILE, PATH PARAMS: id
router.get('/users/:id', checkAuth,limiter, async(req, res) => {

    const user = await User.me(req.params.id, req.user._id);
    if (user) {
        let curUser=await User.getUserById(req.user._id);
        let profUser=await User.getUserById(req.params.id);
        await profileNotification.sendProfileNotification(curUser,profUser);
        res.send(user);
    } else {
        res.sendStatus(404)
    }
})
router.put('/me/promote', checkAuth,limiter, async(req, res) => {
    const prmoteData = Joi.object().keys({
        expiresDate: Joi.date().min(Date.now()).raw().required(),
        cardNumber: Joi.string().creditCard().required(),
        isMonth: Joi.boolean().required()
    });
    Joi.validate(req.body, prmoteData, async(err, result) => {
        if (err) {
            // if not valid set status to 500
            res.status(500).json({
                error: err
            })

        } else {
            const isPromote = await User.promoteToPremium(req.user._id, req.body.cardNumber, req.body.isMonth, req.body.expiresDate);
            if (isPromote) res.status(200).send({ success: 'promote to premium ' });
            else res.status(400).send({ error: 'can not promote' })
        }
    });
});



//GET USER'S PRIVATE PROFILE WITH PLAYER with player info
router.get('/me-player', checkAuth,limiter, async(req, res) => {
    const userID = req.user._id; // get it from desierialize auth 
    await spotifySchema.user.find({ _id: userID }, {
        displayName: 1,
        email: 1,
        birthDate: 1,
        country: 1,
        product: 1,
        gender: 1,
        images: 1,
        player: 1,
        userType: 1
    }).exec().then(user => {
        if (user) {
            return res.status(200).send(user);
        }
    });

})

//UPDATE USER PROFILE INFORMATION 
router.put('/me/update', checkAuth,limiter, (req, res) => {

    const shcema = Joi.object().keys({
        Email: Joi.string().trim().email(),
        Password: Joi.string(),
        Country: Joi.string(),
        Display_Name: Joi.string()
    });
    Joi.validate(req.body, shcema, async(err, result) => {
        if (err) {
            res.status(500).json({
                error: err
            })
        } else {
            const userID = req.user._id;
            const user = await User.update(userID, req.body.Display_Name, req.body.Password, req.body.Email, req.body.Country);
            if (user) {
                res.status(200).json({
                    "success": "information has been updated successfully"
                });
            } else res.status(404).json({ "error": "user not found" });
        }
    })

})

//GET USER PRIVATE PROFILE INFORMATION
router.get('/me', checkAuth,limiter, async(req, res) => {
    console.log(req.rateLimit.current)
    const userID = req.user._id; // get it from desierialize auth 
    await spotifySchema.user.find({ _id: userID }, {
        displayName: 1,
        email: 1,
        birthDate: 1,
        country: 1,
        product: 1,
        gender: 1,
        images: 1
    }).exec().then(user => {
        if (user) {
            return res.status(200).send(user);
        }
    });

})

//REMOVE USER ACCOUNT
router.delete('/remove', checkAuth,limiter, async(req, res, next) => {
    const userID = req.user._id; // get it from desierialize auth 
    const user = await User.deleteAccount(userID)
    if (user) {
        res.status(200).json({ "success": "user deleted" });
    } else {
        res.status(500).json({ "error": "delete failed" });
    }
})

module.exports = router;