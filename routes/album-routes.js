const router = require('express').Router();

const albumApi = require('../source/album-api');
const userApi = require('../source/user-api');
const { auth: checkAuth } = require('../middlewares/is-me');
const { auth: checkIfAuth } = require('../middlewares/check-if-auth');
const rateLimit = require("express-rate-limit");
const limitOffset = require('../middlewares/limitOffset');
// add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30

});
router.delete('/me/albums', checkAuth, limiter, async(req, res, next) => {
    if (req.body.ids == undefined) {
        res.status(403).json({
            message: "These albums can't be Unsaved"
        });
    }
    const albumId = req.body.ids.split(',');
    const userId = req.user._id;
    const user = await userApi.getUserById(userId);
    if (!user) res.status(403);
    else {
        const album = await albumApi.unsaveAlbum(user, albumId).catch(next);
        if (!album) res.status(404).json({
            message: "album hasn't been saved before"

        }); //not found
        else res.status(200).json({
            message: "album has been unsaved suceesfully"
        })
    }
 
})

router.put('/me/Albums', checkAuth, limiter, async(req, res, next) => {
    if (req.body.ids == undefined) {
        res.status(403).json({
            message: "These albums can't be saved"
        });
    }
    const albumId = req.body.ids.split(',');
    const userId = req.user._id;
    const user = await userApi.getUserById(userId);
    if (!user) res.status(403);
    else {
        const album = await albumApi.saveAlbum(user, albumId).catch(next);
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
router.get('/albums/:album_id', checkIfAuth, limiter, async(req, res, next) => {

    const albumId = req.params.album_id;
    const userId = req.user._id;
    const album = await albumApi.getAlbumArtist(albumId, userId, req.isAuth).catch(next);
    if (!album) res.status(404).send("NO Albums found"); //not found
    else res.status(200).send(album);

})

router.get('/albums', limiter, async(req, res, next) => {
    if (req.body.ids == undefined) {
        res.status(404).json({
            message: "no albums found"
        });
    }
    var albumIds = req.body.ids.split(',');

    album = await albumApi.getAlbums(albumIds).catch(next);
    if (!album) res.status(404).json({
        message: "no albums found"
    }); //not found
    else {
        specifiedAlbums = limitOffset(req.limit, req.offset, album);
        res.status(200).send(specifiedAlbums);
    }

})

router.get('/albums/:id/tracks', checkIfAuth, limiter, async(req, res, next) => {

    const albumId = req.params.id;
    let user = await userApi.getUserById(req.user._id);
    const tracks = await albumApi.getTracksAlbum(albumId, user, req.isAuth).catch(next);
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