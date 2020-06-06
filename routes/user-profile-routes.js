const express = require('express');
const router = express.Router();
const Joi = require('joi');
var sendmail = require('../source/sendmail');
const profileNotification = require('../source/notification-api');
const User = require('../source/user-api');
const spotifySchema = require('../models/db');
const { auth: checkAuth } = require('../middlewares/is-me');
const { auth: checkIfAuth } = require('../middlewares/check-if-auth');
const rateLimit = require("express-rate-limit");
// add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30

});

//GET USER'S PUBLIC PROFILE, PATH PARAMS: id
router.get('/users/:id', checkIfAuth, limiter, async(req, res) => {
    try{
    if (req.isAuth) {
        const user = await User.me(req.params.id, req.user._id);
        if (user) {
            let curUser = await User.getUserById(req.user._id);
            let profUser = await User.getUserById(req.params.id);
            await profileNotification.sendProfileNotification(curUser, profUser);
            res.send(user);
        } else {
            res.sendStatus(404)
        }
    } else {
        const user = await User.getUnAuthUser(req.params.id);
        if (!user) res.sendStatus(404);
        else res.status(200).json(user);
    }
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})
router.put('/me/promote', checkAuth, limiter, async(req, res) => {
    try{
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
            if (isPromote) {
                let user = await User.getUserById(req.user._id);
                sendmail(user.email, String(user._id), "premium");
                res.status(200).send({ success: 'check your mail for confirmation ' });
            } else res.status(400).send({ error: 'can not promote' })
        }
    });
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
});
router.post('/premium/confirm', limiter, async(req, res) => {
    try{
    if (!req.query.id || req.query.id == "") { return res.status(400).send("user id is not given"); }
    let user = await User.getUserById(req.query.id);

    let checkConfirm = await User.confirmPremium(user);
    if (checkConfirm) {
        return res.status(200).send("user is confirmed");
    } else {
        return res.status(403).send("user is not confirmed");
    }

}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}

});
router.put('/me/free', checkAuth, limiter, async(req, res) => {
    try{
    const isPromote = await User.promoteToFree(req.user._id);
    if (isPromote) res.status(200).send({ success: 'become free ' });
    else res.status(400).send({ error: 'you are not a premium' })
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
});


//GET USER'S PRIVATE PROFILE WITH PLAYER with player info
router.get('/me-player', checkAuth, limiter, async(req, res) => {
    try{
    const userId = req.user._id; // get it from desierialize auth 
    const user = await spotifySchema.user.find({ _id: userId });
    let userOut = [{
        displayName: user[0].displayName,
        email: user[0].email,
        birthDate: user[0].birthDate,
        country: user[0].country,
        product: user[0].product,
        gender: user[0].gender,
        images: user[0].images,
        userType: user[0].userType
    }];
    userOut[0]['player'] = {};
    userOut[0].player['source_name'] = user[0].player['sourceName'];
    userOut[0].player['is_shuffled'] = user[0].player['isShuffled'];
    userOut[0].player['volume'] = user[0].player['volume'];
    userOut[0].player['is_repeat'] = user[0].player['isRepeat'];
    userOut[0].player['current_source'] = user[0].player['currentSource'];
    userOut[0].player['isPlaylist'] = user[0].player['isPlaylist'];
    userOut[0].player['currentTimeStampe'] = user[0].player['currentTimeStampe'];
    userOut[0].player['isRepeatTrack'] = user[0].player['isRepeatTrack'];
    userOut[0].player['haveQueue'] = user[0].player['currentTrack'] && user[0].player['currentTrack'].trackId ? true : false;
    return res.status(200).send(userOut);
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})

//UPDATE USER PROFILE INFORMATION 
router.put('/me/update', checkAuth, limiter, (req, res) => {
    try{

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
        } else {
            const userId = req.user._id;
            console.log(req.body.user);
            const user = await User.update(req.body.user.repeatedPassword, userId, req.body.user.gender, req.body.user.birthday, req.body.user.displayName, req.body.user.password, req.body.user.email, req.body.user.country, req.body.expiresDate, req.body.cardNumber, req.body.isMonth, req.body.user.newpassword);
            if (user) {
                res.status(200).json({
                    "success": "information has been updated successfully"
                });
            } else res.sendStatus(404);
        }
    })
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})

//GET USER PRIVATE PROFILE INFORMATION
router.get('/me', checkAuth, limiter, async(req, res) => {
    try{
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
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})

//REMOVE USER ACCOUNT
router.delete('/remove', checkAuth, limiter, async(req, res) => {
    try{
    const userId = req.user._id; // get it from desierialize auth 
    const user = await User.deleteAccount(userId)
    if (user) {
        res.status(200).json({ "success": "user deleted" });
    } else {
        res.status(400).json({ "error": "delete failed" });
    }
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})

//User logs out
router.post("/user/logout", limiter, checkAuth, async(req, res) => {
    try{

    let userId = req.user._id;
    let user = await User.getUserById(userId);
    if (!user) { return res.status(404).send({ error: "User IS NOT FOUND" }) }
    if (!user.fcmToken) user.fcmToken = "none";
    user.fcmToken = "none";
    await user.save();
    User.updatePlayerInfoLogOut(user, req.body.currentTimeStampe, req.body.isRepeatTrack, req.body.volume);
    return res.status(202).send({ Success: "Token is set successfully" })
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
});
//GET USER PRIVATE PROFILE INFORMATION
router.get('/me/notifications', checkAuth, limiter, async(req, res) => {
    try{
  
    const userId = req.user._id; // get it from desierialize auth 
    let user =await User.getUserById(userId);
    let notifications=user.notifications;
    if(!notifications||notifications.length==0){
        return res.status(404).send("No notifications");
    }
    return res.status(200).send(notifications);
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})
module.exports = router;