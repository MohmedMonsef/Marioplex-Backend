const router = require('express').Router();

const Library = require('../source/library-api');
const User = require('../source/user-api')
const { auth: checkAuth } = require('../middlewares/is-me');
const rateLimit = require("express-rate-limit");
// add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30

});
//GET USER'S FOLLOWING ARTISTS
router.get('/me/followingArtist', checkAuth, limiter, async(req, res) => {

    const userID = req.user._id;
    const checks = await User.getUserFollowingArtist(userID);
    if (!checks) res.sendStatus(403); //not found user
    else res.status(200).json({ 'Artists': checks });

});
//CHECK IF A USER FOLLOW ARTISTS
router.get('/me/following/contains/:id', checkAuth, limiter, async(req, res) => {

    const userID = req.user._id;
    console.log(userID)
    if (req.params.id == undefined) {
        res.sendStatus(500).json({ message: "id is not defined" });
    } else {
        const checks = await User.checkIfUserFollowArtist(userID, req.params.id);
        if (checks == -1) res.sendStatus(500)
        else {
            res.status(200).json({ 'follow': checks });
        }
    }

});
//USER FOLLOW ARTISTS
router.put('/me/following', checkAuth, limiter, async(req, res) => {

    const userID = req.user._id;
    const artistIds = req.body.id;
    if (artistIds == undefined) {
        res.sendStatus(404);
    } else {
        const checks = await User.userFollowArtist(userID, artistIds);
        if (!checks) res.sendStatus(404); //not found
        else res.sendStatus(200);
    }
});
//USER UNFOLLOW ARTISTS
router.delete('/me/following', checkAuth, limiter, async(req, res) => {

    const userID = req.user._id;
    const artistIds = req.body.id;
    if (artistIds == undefined) {
        res.sendStatus(404);
    } else {
        const checks = await User.userUnfollowArtist(userID, artistIds);
        if (!checks) res.sendStatus(404); //not found
        else res.sendStatus(200);

    }

});

//CHECK IF USER SAVES ALBUMS - QUERY PARAMS: albums_ids
router.get('/me/albums/contains', checkAuth, limiter, async(req, res) => {
    if (req.query.albums_ids == undefined || req.query.albums_ids == "") { return res.status(403).send("No Album ids given"); }
    const userID = req.user._id;
    const albumsIDs = req.query.albums_ids.split(',');
    const checks = await Library.checkSavedAlbums(albumsIDs, userID);
    if (!checks) res.sendStatus(404); //not found
    else res.status(200).json(checks);

});

//CHECK IF USER SAVES TRACKS - QUERY PARAMS: tracks_ids
router.get('/me/tracks/contains', checkAuth, limiter, async(req, res) => {
    if (req.query.tracks_ids == undefined || req.query.tracks_ids == "") { return res.status(403).send("No Tracks ids given"); }
    const userID = req.user._id;
    const tracksIDs = req.query.tracks_ids.split(',');
    const checks = await Library.checkSavedTracks(tracksIDs, userID);
    if (!checks) res.sendStatus(404); //not found
    else res.status(200).json(checks);

});

//GET USER'S SAVED ALBUMS - QUERY PARAMS: limit, offset
router.get('/me/albums', checkAuth, limiter, async(req, res) => {

    const userID = req.user._id;
    const albums = await Library.getSavedAlbums(userID, req.query.limit, req.query.offset);
    if (!albums) res.sendStatus(404); //not found
    else res.status(200).json({ savedAlbums: albums });

});

//GET USER'S SAVED TRACKS - QUERY PARAMS: limit, offset
router.get('/me/tracks', checkAuth, limiter, async(req, res) => {

    const userID = req.user._id;
    const tracks = await Library.getSavedTracks(userID, req.query.limit, req.query.offset);

    if (!tracks) res.sendStatus(404); //not found
    else res.status(200).json(tracks);

});



module.exports = router;