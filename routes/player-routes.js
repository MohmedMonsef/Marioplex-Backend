const router = require('express').Router();
const Player = require('../source/player-api');
const User = require('../source/user-api');
const Track = require('../source/track-api')
const { auth: checkAuth } = require('../middlewares/is-me');
const checkId = require('../validation/mongoose-objectid');
const stateValidation = require('../validation/validate-boolean');
const rateLimit = require('express-rate-limit');
// add rate limiting
const limiter = rateLimit({
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
    if (!user) return res.status(403).send('user is not correct');
    const player = user.player;
    if (!player || !player.currentTrack) return res.status(400).json({ error: 'there is no current playing track .' });
    var currentPlayingTrack = await Track.getFullTrack(player.currentTrack.trackId, user);
    if (!currentPlayingTrack) return res.status(404).json({ error: 'track not found' });
    currentPlayingTrack['isPlaylist'] = player.currentTrack.isPlaylist;
    currentPlayingTrack['playlistId'] = player.currentTrack.playlistId;
    currentPlayingTrack['isPlayable'] = true;
    res.send(currentPlayingTrack);
})

//get next track playing
router.get('/me/player/next-playing', checkAuth, limiter, async(req, res) => {
    const user = await User.getUserById(req.user._id);
    if (!user) return res.status(403).send('user is not correct');
    const player = user.player;
    if (!player || !player.nextTrack) return res.status(400).json({ error: 'there is no next  track .' });
    var nextPlayingTrack = await Track.getFullTrack(player.nextTrack.trackId, user);
    if (!nextPlayingTrack) return res.status(404).json({ error: 'track not found' });
    nextPlayingTrack['isPlaylist'] = player.nextTrack.isPlaylist;
    nextPlayingTrack['playlistId'] = player.nextTrack.playlistId;
    nextPlayingTrack['isPlayable'] = false;
    res.send(nextPlayingTrack);
})

//get prev track playing
router.get('/me/player/prev-playing', checkAuth, limiter, async(req, res) => {
    const user = await User.getUserById(req.user._id);
    if (!user) return res.status(403).send('user is not correct');
    const player = user.player;
    if (!player || !player.prevTrack) return res.status(400).json({ error: 'there is no previous track .' });
    var prevPlayingTrack = await Track.getFullTrack(player.prevTrack.trackId, user);
    if (!prevPlayingTrack) return res.status(404).json({ error: 'track not found' });
    prevPlayingTrack['isPlaylist'] = player.prevTrack.isPlaylist;
    prevPlayingTrack['playlistId'] = player.prevTrack.playlistId;
    prevPlayingTrack['pisPlayable'] = false;
    res.send(prevPlayingTrack);
})

// create queue fo player
router.post('/createQueue/:source_id/:track_id', checkAuth, limiter, async(req, res) => {
    if (!req.body.tracksIds || !req.body.sourceType) {
        if (!checkId([req.params.source_id, req.params.track_id])) return res.status(400).send('Enter correct ids ');
        if (!stateValidation(req.query.isPlaylist)) return res.status(400).send('isPlaylist is required');
        const sourceId = req.params.source_id;
        const trackId = req.params.track_id;
        const isPlaylist = req.query.isPlaylist;
        const userId = req.user._id;
        const createQueue = await User.updateUserPlayer(userId, isPlaylist, sourceId, trackId, undefined, undefined)
            //console.log(await Track.getTrack(trackId));
        if (createQueue) res.send(' Queue is created successfully');
        else res.status(403).send('can not create queue');
    } else {
        if (!checkId(req.body.tracksIds) || !checkId([req.params.track_id]) || !req.body.sourceType) return res.status(403).send('Enter correct ids ');
        const userID = req.user._id;
        const createQueue = await User.updateUserPlayer(userID, undefined, undefined, req.params.track_id, req.body.tracksIds, req.body.sourceType)
        if (createQueue) res.send(' Queue is created successfully');
        else res.status(403).send('can not create queue');
    }
})
router.post('/player/add-to-queue/:playlist_id/:track_id', checkAuth, limiter, async(req, res) => {
    if (!checkId([req.params.playlist_id, req.params.track_id])) return res.status(400).send('Enter correct ids');
    if (!stateValidation(req.query.isPlaylist)) return res.status(400).send('isPlaylist is required');
    const trackId = req.params.track_id;
    const addToQueue = await User.addToQueue(req.user._id, trackId, req.query.isPlaylist, req.params.playlist_id);
    if (addToQueue == 0) res.status(403).send('can not add queue ! ');
    else res.send('add successfully');
})

// skip to next track 
router.post('/me/player/next-playing', checkAuth, nextLimiter, async(req, res) => {
    // allow for 6 requests per hour only
    if (req.user.product == 'free') {
        if (req.rateLimit.current > 6) {
            res.status(429).json({ 'error': 'rate limit reached for free user skip tracks' });
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
    if (req.user.product == 'free') {
        if (req.rateLimit.current > 6) {
            res.status(429).json({ 'error': 'rate limit reached for free user skip tracks' });
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
    if (!tracks) res.status(404).json({ error: 'NOT FOUND QUEUE' });
    else res.status(200).json(tracks);
})

//to repeat
router.put('/player/repeat', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    if (stateValidation(req.query.state)) {
        const repeat = User.repreatPlaylist(userId, req.query.state);
        if (!repeat) res.status(403).json({ error: 'could not repeat playlist' });
        else res.status(200).json({ success: 'is_repeat playlist: ' + req.query.state })
    } else req.status(400).send('state is required');
})

// resume player 
router.put('/me/player/play', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    const player = User.resumePlaying(userId);
    if (!player) res.status(403).json({ error: 'could not resume playing' });
    else res.status(204).json({ success: 'resumed playing' })
})

// pause player 
router.put('/me/player/pause', checkAuth, limiter, async(req, res) => {
    const userId = req.user._id;
    const player = User.pausePlaying(userId);
    if (!player) res.status(403).json({ error: 'could not resume playing' });
    else res.status(204).json({ success: 'paused playing' })
})

//toggle shuffle
router.put('/me/player/shuffle', checkAuth, limiter, async(req, res) => {
    if (stateValidation(req.query.state)) {
        const userId = req.user._id;
        const state = req.query.state;
        const isShuffle = await User.setShuffle(state, userId);
        if (!isShuffle) res.status(403).json({ error: 'can not shuffle ' });
        else res.status(200).json({ success: 'Do successfully' });
    } else res.status(400).send('state is required');
})

// get recent played
router.get('/me/player/recently-played', checkAuth, limiter, async(req, res) => {
    const user = await User.getUserById(req.user._id);
    if (!user) return res.status(403).send('this user is deleted');
    const playHistory = await Player.getRecentTracks(user, req.query.limit);
    if (!playHistory) res.status(404).json({ error: 'can not found playhistory' });
    else res.status(200).json(playHistory);

})

// add to recent played
router.put('/me/player/recently-played/:source_id/:track_id', checkAuth, limiter, async(req, res) => {
    if (!checkId([req.params.track_id, req.params.source_id])) return res.status(400).send('Enter correct ids');
    const user = await User.getUserById(req.user._id);
    if (!user) return res.status(403).send('user is not correct');
    const playHistory = await Player.addRecentTrack(user, req.params.track_id, req.query.sourceType, req.params.source_id);
    if (!playHistory) res.status(403).json({ error: 'can not add to playhistory ' });
    else res.status(203).json({ 'success': 'added successfully' });
})

module.exports = router;