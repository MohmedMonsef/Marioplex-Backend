const express = require('express');
const router = express.Router();
const Joi = require('joi');
const profileNotification = require('../source/notification-api');
const User = require('../source/user-api');
const spotifySchema = require('../models/db');
const { auth: checkAuth } = require('../middlewares/is-me');
const rateLimit = require("express-rate-limit");
// add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30

});

//GET USER'S PUBLIC PROFILE, PATH PARAMS: id
router.get('/users/:id', checkAuth, limiter, async(req, res) => {

    const user = await User.me(req.params.id, req.user._id);
    if (user) {
        let curUser = await User.getUserById(req.user._id);
        let profUser = await User.getUserById(req.params.id);
        await profileNotification.sendProfileNotification(curUser, profUser);
        res.send(user);
    } else {
        res.sendStatus(404)
    }
})
router.put('/me/promote', checkAuth, limiter, async(req, res) => {
    const prmoteData = Joi.object().keys({
        expiresDate: Joi.date().min(Date.now()).raw().required(),
        cardNumber: Joi.string().creditCard().required(),
        isMonth: Joi.boolean().required()
    });
    Joi.validate(req.body, prmoteData, async(err, result) => {
        if (err) {
            // if not valid set status to 500
            res.status(400).json({
                error: err
            })

        } else {
            const isPromote = await User.promoteToPremium(req.user._id, req.body.cardNumber, req.body.isMonth, req.body.expiresDate);
            if (isPromote) res.status(200).send({ success: 'promote to premium ' });
            else res.status(400).send({ error: 'can not promote' })
        }
    });
});

router.put('/me/free', checkAuth, limiter, async(req, res) => {
    const isPromote = await User.promoteToFree(req.user._id);
    if (isPromote) res.status(200).send({ success: 'become free ' });
    else res.status(400).send({ error: 'you are not a premium' })
});


//GET USER'S PRIVATE PROFILE WITH PLAYER with player info
router.get('/me-player', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id; // get it from desierialize auth 
    await spotifySchema.user.find({ _id: userId }, {
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
router.put('/me/update', checkAuth, limiter, (req, res) => {

    const shcema = Joi.object().keys({
        email: Joi.string().trim().email(),
        gender: Joi.string(),
        birthday: Joi.date().raw().optional(),
        password: Joi.string().required(),
        newpassword: Joi.string(),
        repeatedPassword: Joi.string(),
        country: Joi.string(),
        displayName: Joi.string(),
        expiresDate: Joi.date().min(Date.now()).raw().optional(),
        cardNumber: Joi.string().creditCard().optional(),
        isMonth: Joi.boolean().optional()
    });
    Joi.validate(req.body.user, shcema, async(err, result) => {
        if (err) {
            res.status(400).json({
                error: err
            })
        } 
        else {
            const userId = req.user._id;
            const user = await User.update(req.body.user.repeatedPassword, userId, req.body.user.gender, req.body.user.birthday, req.body.user.displayName, req.body.user.password, req.body.user.email, req.body.user.country, req.body.expiresDate, req.body.cardNumber, req.body.isMonth, req.body.user.newpassword);
            if (user) {
                res.status(200).json({
                    "success": "information has been updated successfully"
                });
            } else res.sendStatus(404);
        }
    })

})

//GET USER PRIVATE PROFILE INFORMATION
router.get('/me', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id; // get it from desierialize auth 
    await spotifySchema.user.find({ _id: userId }, {
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
router.delete('/remove', checkAuth, limiter, async(req, res, next) => {
    const userId = req.user._id; // get it from desierialize auth 
    const user = await User.deleteAccount(userId)
    if (user) {
        res.status(200).json({ "success": "user deleted" });
    } else {
        res.status(400).json({ "error": "delete failed" });
    }
})

//User logs out
router.post("/user/logout", limiter, checkAuth, async(req, res) => {

    let userId = req.user._id;
    let user = await User.getUserById(userId);
    if (!user) { return res.status(404).send({ error: "User IS NOT FOUND" }) }
    if (!user.fcmToken) user.fcmToken = "none";
    user.fcmToken = "none";
    await user.save();
    User.updatePlayerInfoLogOut(user, req.body.currentTimeStampe, req.body.isRepeatTrack, req.body.volume);
    return res.status(202).send({ Success: "Token is set successfully" })

});

module.exports = router;