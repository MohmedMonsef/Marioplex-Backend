const router = require('express').Router();

const Album = require('../source/album-api');
const User = require('../source/user-api');
const { auth: checkAuth } = require('../middlewares/is-me');
const rateLimit = require("express-rate-limit");
// add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30

});
router.delete('/me/albums', checkAuth, limiter, async(req, res) => {
    if (req.body.ids == undefined) {
        res.status(403).json({
            message: "These albums can't be Unsaved"
        });
    }
    const albumID = req.body.ids.split(',');
    const userID = req.user._id;
    const user = await User.getUserById(userID);
    if (!user) res.status(403);
    else {
        const album = await Album.unsaveAlbum(user, albumID);
        if (!album) res.status(404).json({
            message: "album hasn't been saved before"

        }); //not found
        else res.status(200).json({
            message: "album has been unsaved suceesfully"
        })
    }

})

router.put('/me/Albums', checkAuth, limiter, async(req, res) => {
    if (req.body.ids == undefined) {
        res.status(403).json({
            message: "These albums can't be saved"
        });
    }
    const albumID = req.body.ids.split(',');
    const userID = req.user._id;
    const user = await User.getUserById(userID);
    if (!user) res.status(403);
    else {

        const album = await Album.saveAlbum(user, albumID);
        if (!album) res.status(404).json({
            message: "album has been already saved"
        }); //not found
        else if (album == 2) {
            res.status(403).json({
                message: "These albums can't be saved"
            });
        } else res.status(200).json({
            message: "album has been save suceesfully"
        })
    }
})

// get album
router.get('/albums/:album_id', checkAuth, limiter, async(req, res) => {

    const albumID = req.params.album_id;
    const UserID = req.user._id;
    const album = await Album.getAlbumArtist(albumID, UserID);
    if (!album) res.status(404).send("NO Albums found"); //not found
    else res.status(200).send(album);

})

router.get('/albums', limiter, async(req, res) => {
    if (req.body.ids == undefined) {
        res.status(404).json({
            message: "no albums found"
        });
    }
    var albumIDs = req.body.ids.split(',');

    album = await Album.getAlbums(albumIDs, req.body.limit, req.body.offset);
    if (!album) res.status(404).json({
        message: "no albums found"
    }); //not found
    else res.status(200).send(album);

})

router.get('/albums/:id/tracks', checkAuth, limiter, async(req, res) => {

    const albumID = req.params.id;
    let user = await User.getUserById(req.user._id);
    const tracks = await Album.getTracksAlbum(albumID, user);
    if (!tracks) {
        res.status(404).json({
            message: "no tracks found"
        });
    } //not found
    else {
        res.status(200).json({ tracks });
    }

})

module.exports = router;