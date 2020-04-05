const router = require('express').Router();

const Library = require('../public-api/library-api');
const User = require('../public-api/user-api')
const { auth: checkAuth } = require('../middlewares/is-me');


router.get('/me/followingArtist', checkAuth, async(req, res) => {

    const userID = req.user._id;
    const checks = await User.getUserFollowingArtist(userID);
    if (!checks) res.sendStatus(404); //not found
    else res.status(200).json(checks);

});
router.get('/me/albums/contains', checkAuth, async(req, res) => {

    const userID = req.user._id;
    const albumsIDs = req.query.albums_ids.split(',');
    const checks = await Library.checkSavedAlbums(albumsIDs, userID);
    if (!checks) res.sendStatus(404); //not found
    else res.status(200).json(checks);

});

router.get('/me/tracks/contains', checkAuth, async(req, res) => {

    const userID = req.user._id;
    const tracksIDs = req.query.tracks_ids.split(',');
    const checks = await Library.checkSavedTracks(tracksIDs, userID);
    if (!checks) res.sendStatus(404); //not found
    else res.status(200).json(checks);

});

router.get('/me/albums', checkAuth, async(req, res) => {

    const userID = req.user._id;
    const albums = await Library.getSavedAlbums(userID, req.query.limit, req.query.offset);
    if (!albums) res.sendStatus(404); //not found
    else res.status(200).json(albums);
    //console.log(albums)

});

router.get('/me/tracks', checkAuth, async(req, res) => {

    const userID = req.user._id;
    const tracks = await Library.getSavedTracks(userID, req.query.limit, req.query.offset);
    if (!tracks) res.sendStatus(404); //not found
    else res.status(200).json(tracks);

});



module.exports = router;