const router = require('express').Router();
const Library = require('../source/library-api');
const User = require('../source/user-api')
const Notifications = require('../source/notification-api');
const { auth: checkAuth } = require('../middlewares/is-me');
const RateLimit = require("express-rate-limit");
// add rate limiting
const limiter = RateLimit({
    windowMs: 60 * 1000,
    max: 30

});
// GET USER'S FOLLOWING ARTISTS
router.get('/me/followingArtist', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    const checks = await User.getUserFollowingArtist(userId);
    if (!checks) res.sendStatus(403); //not found user
    else res.status(200).json({ 'Artists': checks });
});
//CHECK IF A USER FOLLOW ARTISTS
router.get('/me/following/contains/:id', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    if (req.params.id == undefined) return res.sendStatus(400).json({ message: "id is not defined" });
    const checks = await User.checkIfUserFollowArtist(userId, req.params.id);
    if (!checks) return res.sendStatus(403).json({ message: "not user or not artist" });
    res.status(200).json({ 'follow': checks });

});
//USER FOLLOW ARTISTS
router.put('/me/following', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    const artistIds = req.body.id;
    if (artistIds == undefined) return res.sendStatus(400);
    const checks = await User.userFollowArtist(userId, artistIds);
    if (!checks) res.sendStatus(403); //not user and not artist
    else res.sendStatus(200);

});
//USER UNFOLLOW ARTISTS
router.delete('/me/following', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    const artistIds = req.body.id;
    if (artistIds == undefined) return res.sendStatus(400);
    const checks = await User.userUnfollowArtist(userId, artistIds);
    if (!checks) res.sendStatus(403); //not user , artist or not follow this 
    else res.sendStatus(200);
});

//CHECK IF USER SAVES ALBUMS - QUERY PARAMS: albums_ids
router.get('/me/albums/contains', checkAuth, limiter, async(req, res) => {
    if (req.query.albums_ids == undefined || req.query.albums_ids == "") return res.status(400).send("No Album ids given");
    const userId = req.user._id;
    const albumsIds = req.query.albums_ids.split(',');
    const checks = await Library.checkSavedAlbums(albumsIds, userId);
    if (!checks) res.sendStatus(403); //not found user or albums
    else res.status(200).json(checks);
});

//CHECK IF USER SAVES TRACKS - QUERY PARAMS: tracks_ids
router.get('/me/tracks/contains', checkAuth, limiter, async(req, res) => {
    if (req.query.tracks_ids == undefined || req.query.tracks_ids == "") return res.status(400).send("No Tracks ids given");
    const userId = req.user._id;
    const tracksIds = req.query.tracks_ids.split(',');
    const checks = await Library.checkSavedTracks(tracksIds, userId);
    if (!checks) res.sendStatus(404); //not found
    else res.status(200).json(checks);

});

//GET USER'S SAVED ALBUMS - QUERY PARAMS: limit, offset
router.get('/me/albums', checkAuth, limiter, async(req, res) => {

    const userId = req.user._id;
    const albums = await Library.getSavedAlbums(userId, req.query.limit, req.query.offset);
    if (!albums) res.sendStatus(404); //not found saved album
    else res.status(200).json({ savedAlbums: albums });
});

//GET USER'S SAVED TRACKS - QUERY PARAMS: limit, offset
router.get('/me/tracks', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    const tracks = await Library.getSavedTracks(userId, req.query.limit, req.query.offset);
    if (!tracks) res.sendStatus(404); //not found saved album
    else res.status(200).json(tracks);
});

// user follow another user
router.put("/me/follow/user/:user_id", checkAuth, limiter, async(req, res) => {
    const user1Id = req.user._id;
    const user2Id = req.params.user_id;
    const followUser = await User.userFollowUser(user1Id, user2Id);
    if (!followUser) return res.status(403).send("cannot follow user");
    let currentUser = await User.getUserById(user1Id);
    let followedUser = await User.getUserById(user2Id);
    Notifications.sendUserFollowNotification(currentUser, followedUser);
    res.status(200).send("followed user successfully");

});
// user unfollow another user
router.delete("/me/unfollow/user/:user_id", checkAuth, limiter, async(req, res) => {
    const user1Id = req.user._id;
    const user2Id = req.params.user_id;
    const unfollowUser = await User.userUnfollowUser(user1Id, user2Id);
    if (!unfollowUser) res.status(403).send("cannot unfollow user");
    else res.status(200).send("unfollowed user successfully")
});
// get user followings
router.get("/me/following/user", checkAuth, async(req, res) => {
    const userId = req.user._id;
    const usersUserFollow = await User.getUserFollowingUser(userId);
    if (!usersUserFollow) res.status(404).send("the user doesn't follow anyone");
    else res.status(200).json(usersUserFollow)
});
// get user followers
router.get("/me/followers/user", checkAuth, async(req, res) => {
    const userId = req.user._id;
    const usersFollowers = await User.getUserFollowers(userId);
    if (!usersFollowers) res.status(404).send("no one  follow this user");
    else res.status(200).json(usersFollowers)
});
module.exports = router;