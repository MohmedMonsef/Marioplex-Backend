const express = require('express');
const router = express.Router();
const joi = require('joi');
const User = require('../public-api/user-api');
const spotifySchema = require('../models/db');
const { auth: checkAuth } = require('../middlewares/is-me');

//GET USER'S PUBLIC PROFILE, PATH PARAMS: id
router.get('/users/:id', checkAuth, async(req, res) => {

    const user = await User.me(req.params.id, req.user._id);
    if (user) {
        res.send(user);
    } else {
        res.sendStatus(404)
    }
})

//GET USER'S PRIVATE PROFILE WITH PLAYER with player info
router.get('/me-player', checkAuth, async(req, res) => {
    const userID = req.user._id; // get it from desierialize auth 
    await spotifySchema.user.find({ _id: userID }, {
        displayName: 1,
        email: 1,
        birthDate: 1,
        country: 1,
        product: 1,
        gender: 1,
        images: 1,
        player: 1
    }).exec().then(user => {
        if (user) {
            return res.status(200).send(user);
        }
    });

})

//UPDATE USER PROFILE INFORMATION 
router.put('/me/update', checkAuth, (req, res) => {

    const shcema = joi.object().keys({
        Email: joi.string().trim().email(),
        Password: joi.string(),
        Country: joi.string(),
        Display_Name: joi.string()
    });
    joi.validate(req.body, shcema, async(err, result) => {
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
router.get('/me', checkAuth, async(req, res) => {
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
router.delete('/remove', checkAuth, async(req, res, next) => {
    const userID = req.user._id; // get it from desierialize auth 
    const user = await User.deleteAccount(userID)
    if (user) {
        res.status(200).json({ "success": "user deleted" });
    } else {
        res.status(500).json({ "error": "delete failed" });
    }
})

module.exports = router;