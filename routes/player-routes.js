const router = require('express').Router();
const Player = require('../source/player-api');
const User = require('../source/user-api');
const Track = require('../source/track-api')
const { auth: checkAuth } = require('../middlewares/is-me');
const CheckId = require('../validation/mongoose-objectid');
const StateValidation = require('../validation/validate-boolean');
const RateLimit = require("express-rate-limit");
// add rate limiting
const limiter = RateLimit({
    windowMs: 60 * 1000,
    max: 30

});
const nextLimiter = RateLimit({
    windowMs: 60 * 60 * 1000,
    max: 300

});
// update the player api instance
// just for test route
router.get('/me/updatePlayer', async(req, res) => {
    const userId = '5e70351bc6367c46a08c255a';
    const playlistId = '5e756a10c8bb822d60284aef';
    const trackId = '5e6e6c8ed9ee6b2f70d3b7d5'
    const p = await User.updateUserPlayer(userId, true, playlistId, trackId);
    if (!p) return res.status(404).send({ error: 'wrong' });
    else return res.json({ 'success': 'updated user player' });
})

//get current track playing
router.get('/me/player/currently-playing', checkAuth, limiter, async(req, res) => {
    const user = await User.getUserById(req.user._id);
    if (user) {
        const player = user.player;
        if (player && player.currentTrack) {
            var currentPlayingTrack = await Track.getFullTrack(player.currentTrack.trackId, user);
            if (currentPlayingTrack) {
                currentPlayingTrack['isPlaylist'] = player.currentTrack.isPlaylist;
                currentPlayingTrack['playlistId'] = player.currentTrack.playlistId;
                currentPlayingTrack['isPlayable'] = true;
                res.send(currentPlayingTrack);
            } else res.status(404).json({ error: 'track not found' });
        } else res.status(400).json({ error: 'there is no current playing track .' });
    } else res.status(403).send('user is not correct');
})

//get next track playing
router.get('/me/player/next-playing', checkAuth, limiter, async(req, res) => {
    const user = await User.getUserById(req.user._id);
    if (user) {
        const player = user.player;
        if (player && player.nextTrack) {
            var nextPlayingTrack = await Track.getFullTrack(player.nextTrack.trackId, user);
            if (nextPlayingTrack) {
                nextPlayingTrack['isPlaylist'] = player.nextTrack.isPlaylist;
                nextPlayingTrack['playlistId'] = player.nextTrack.playlistId;
                nextPlayingTrack['isPlayable'] = false;
                res.send(nextPlayingTrack);
            } else res.status(404).json({ error: 'track not found' });
        } else res.status(400).json({ error: 'there is no next  track .' });
    } else res.status(403).send('user is not correct');

})

//get prev track playing
router.get('/me/player/prev-playing', checkAuth, limiter, async(req, res) => {
        const user = await User.getUserById(req.user._id);
        if (user) {
            const player = user.player;
            if (player && player.prevTrack) {
                var prevPlayingTrack = await Track.getFullTrack(player.prevTrack.trackId, user);
                if (prevPlayingTrack) {
                    prevPlayingTrack['isPlaylist'] = player.prevTrack.isPlaylist;
                    prevPlayingTrack['playlistId'] = player.prevTrack.playlistId;
                    prevPlayingTrack['pisPlayable'] = false;
                    res.send(prevPlayingTrack);
                } else res.status(404).json({ error: 'track not found' });
            } else res.status(400).json({ error: 'there is no previous track .' });
        } else res.status(403).send('user is not correct');
    })
    // create queue fo player
router.post('/createQueue/:sourceId/:trackId', checkAuth, limiter, async(req, res) => {
    if (!req.body.tracksIds || !req.body.sourceType) {
        if (CheckId([req.params.sourceId, req.params.trackId])) {
            if (StateValidation(req.query.isPlaylist)) {
                const sourceId = req.params.sourceId;
                const trackId = req.params.trackId;
                const isPlaylist = req.query.isPlaylist;
                const userId = req.user._id;
                const createQueue = await User.updateUserPlayer(userId, isPlaylist, sourceId, trackId, undefined, undefined)
                if (createQueue) res.send(' Queue is created successfully');
                else res.status(400).send('can not create queue');
            } else res.status(400).send('isPlaylist is required');
        } else res.status(403).send('Enter correct ids ');
    } else {
        if (!CheckId(req.body.tracksIds) || !CheckId([req.params.trackId]) || !req.body.sourceType) return res.status(403).send('Enter correct ids ');
        const userID = req.user._id;
        const createQueue = await User.updateUserPlayer(userID, undefined, undefined, req.params.trackId, req.body.tracksIds, req.body.sourceType)
        if (createQueue) res.send(' Queue is created successfully');
        else res.status(400).send('can not create queue');
    }
})
router.post('/player/add-to-queue/:playlistId/:trackId', checkAuth, limiter, async(req, res) => {
        if (CheckId([req.params.playlistId, req.params.trackId])) {
            if (StateValidation(req.query.isPlaylist)) {
                const trackId = req.params.trackId;
                const addToQueue = await User.addToQueue(req.user._id, trackId, req.query.isPlaylist, req.params.playlistId);
                if (addToQueue == 0) res.status(400).send('can not add queue ! ');
                else res.send('add successfully');
            } else res.status(400).send('isPlaylist is required');
        } else res.status(403).send('Enter correct ids');
    })
    // skip to next track 
router.post('/me/player/next-playing', checkAuth, nextLimiter, async(req, res) => {
        // allow for 6 requests per hour only
        if (req.user.product == "free") {
            if (req.rateLimit.current > 6) {
                res.status(429).json({ "error": "rate limit reached for free user skip tracks" });
                return 0;
            }
        }
        const user = await User.getUserById(req.user._id);
        if (!user) return res.status(403).send('user is not correct');
        const skip = await Player.skipNext(user)
        if (!skip) res.status(404).json({ error: 'track not found' })
        else return res.send(skip);
    })
    // skip to prev track
router.post('/me/player/prev-playing', checkAuth, nextLimiter, async(req, res) => {
        if (req.user.product == "free") {
            if (req.rateLimit.current > 6) {
                res.status(429).json({ "error": "rate limit reached for free user skip tracks" });
                return 0;
            }
        }
        const user = await User.getUserById(req.user._id);
        if (!user) return res.status(403).send('user is not correct');
        const skip = await Player.skipPrevious(user);
        if (skip) return res.send(skip);
        else res.status(404).json({ error: 'track not found' })
    })
    // get user queue 
router.get('/me/queue', checkAuth, limiter, async(req, res) => {
        const userId = req.user._id;
        const tracks = await User.getQueue(userId);
        if (!tracks) res.status(400).json({ error: 'couldnt get queue' });
        else res.status(200).json(tracks);
    })
    //to repeat
router.put('/player/repeat', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    if (StateValidation(req.query.state)) {
        const repeat = User.repreatPlaylist(userId, req.query.state);
        if (!repeat) res.status(400).json({ error: 'could not repeat playlist' });
        else res.status(200).json({ success: 'is_repeat playlist: ' + req.query.state })
    } else req.status(400).send('state is required');
})

// resume player 
router.put('/me/player/play', checkAuth, limiter, async(req, res) => {
        const userId = req.user._id;
        const player = User.resumePlaying(userId);
        if (!player) res.status(404).json({ error: 'could not resume playing' });
        else res.status(204).json({ success: 'resumed playing' })
    })
    // pause player 
router.put('/me/player/pause', checkAuth, limiter, async(req, res) => {
        const userId = req.user._id;
        const player = User.pausePlaying(userId);
        if (!player) res.status(404).json({ error: 'could not resume playing' });
        else res.status(204).json({ success: 'paused playing' })
    })
    //toggle shuffle
router.put('/me/player/shuffle', checkAuth, limiter, async(req, res) => {
        if (StateValidation(req.query.state)) {
            const userId = req.user._id;
            const state = req.query.state;
            const isShuffle = await User.setShuffle(state, userId);
            if (!isShuffle) res.status(400).json({ error: 'can not shuffle ' });
            else res.status(200).json({ success: 'Do successfully' });
        } else res.status(400).send('state is required');
    })
    // get recent played
router.get('/me/player/recently-played', checkAuth, limiter, async(req, res) => {
        const user = await User.getUserById(req.user._id);
        if (user) {
            const playHistory = await Player.getRecentTracks(user, req.query.limit);
            if (!playHistory) res.status(400).json({ error: 'can not get playhistory' });
            else res.status(200).json(playHistory);
        } else res.status(403).send('this user is deleted');
    })
    // add to recent played
router.put('/me/player/recently-played/:source_id/:track_id', checkAuth, limiter, async(req, res) => {
    if (CheckId([req.params.track_id, req.params.source_id])) {
        const user = await User.getUserById(req.user._id);
        if (user) {
            const playHistory = await Player.addRecentTrack(user, req.params.track_id, req.query.sourceType, req.params.source_id);
            if (!playHistory) res.status(400).json({ error: 'can not add to playhistory ' });
            else res.status(203).json({ 'success': 'added successfully' });
        } else res.status(403).send('user is not correct')
    } else res.status(403).send('Enter correct ids');
})

module.exports = router;