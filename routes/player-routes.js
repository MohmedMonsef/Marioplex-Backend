const router = require('express').Router();
const Player = require('../public-api/player-api');
const User = require('../public-api/user-api');
const Track = require('../public-api/track-api')
const { auth: checkAuth } = require('../middlewares/is-me');
const checkID = require('../validation/mongoose-objectid');
const stateValidation = require('../validation/validate-boolean');

// update the player api instance
// just for test route
router.get('/me/updatePlayer', async(req, res) => {
    const userID = '5e70351bc6367c46a08c255a';
    const playlistID = '5e756a10c8bb822d60284aef';
    const trackID = '5e6e6c8ed9ee6b2f70d3b7d5'
    const p = await User.updateUserPlayer(userID, true, playlistID, trackID);
    if (!p) return res.status(404).send({ error: 'wrong' });
    else return res.json({ 'success': 'updated user player' });
})

//get current track playing
router.get('/me/player/currently-playing', checkAuth, async(req, res) => {
    const user = await User.getUserById(req.user._id);
    if (user) {
        const player = user.player;
        if (player && player.current_track) {
            var currentPlayingTrack = await Track.getFullTrack(player.current_track.trackId, user);
            if (currentPlayingTrack) {
                currentPlayingTrack['isPlaylist'] = player.current_track.isPlaylist;
                currentPlayingTrack['playlistId'] = player.current_track.playlistId;
                currentPlayingTrack['isPlayable'] = true;
                res.send(currentPlayingTrack);
            } else res.status(404).json({ error: 'track not found' });
        } else res.status(400).json({ error: 'there is no current playing track .' });
    } else res.status(403).send('user is npt correct');
})

//get next track playing
router.get('/me/player/next-playing', checkAuth, async(req, res) => {
    const user = await User.getUserById(req.user._id);
    if (user) {
        const player = user.player;
        if (player && player.next_track) {
            var nextPlayingTrack = await Track.getFullTrack(player.next_track.trackId, user);
            if (nextPlayingTrack) {
                nextPlayingTrack['isPlaylist'] = player.next_track.isPlaylist;
                nextPlayingTrack['playlistId'] = player.next_track.playlistId;
                nextPlayingTrack['isPlayable'] = false;
                res.send(nextPlayingTrack);
            } else res.status(404).json({ error: 'track not found' });
        } else res.status(400).json({ error: 'there is no next  track .' });
    } else res.status(403).send('user is not correct');

})

//get prev track playing
router.get('/me/player/prev-playing', checkAuth, async(req, res) => {
        const user = await User.getUserById(req.user._id);
        if (user) {
            const player = user.player;
            if (player && player.prev_track) {
                var prevPlayingTrack = await Track.getFullTrack(player.prev_track.trackId, user);
                if (prevPlayingTrack) {
                    prevPlayingTrack['isPlaylist'] = player.prev_track.isPlaylist;
                    prevPlayingTrack['playlistId'] = player.prev_track.playlistId;
                    prevPlayingTrack['pisPlayable'] = false;
                    res.send(prevPlayingTrack);
                } else res.status(404).json({ error: 'track not found' });
            } else res.status(400).json({ error: 'there is no previous track .' });
        } else res.status(403).send('user is not correct');
    })
    // create queue fo player
router.post('/createQueue/:playlist_id/:trackId', checkAuth, async(req, res) => {
    if (checkID([req.params.playlist_id, req.params.trackId])) {
        if (stateValidation(req.query.isPlaylist)) {
            const sourceId = req.params.playlist_id;
            const trackId = req.params.trackId;
            const isPlaylist = req.query.isPlaylist;
            const userID = req.user._id;
            const createQueue = await User.updateUserPlayer(userID, isPlaylist, sourceId, trackId)
            if (createQueue) res.send(' Queue is created successfully');
            else res.status(400).send('can not create queue');
        } else res.status(400).send('isPlaylist is required');
    } else res.status(403).send('Enter correct ids ');
})
router.post('/player/add-to-queue/:playlistId/:trackId', checkAuth, async(req, res) => {
        if (checkID([req.params.playlistId, req.params.trackId])) {
            if (stateValidation(req.query.isPlaylist)) {
                const trackId = req.params.trackId;
                const addToQueue = await User.addToQueue(req.user._id, trackId, req.query.isPlaylist, req.params.playlistId);
                if (addToQueue == 0) res.status(400).send('can not add queue ! ');
                else res.send('add successfully');
            } else res.status(400).send('isPlaylist is required');
        } else res.status(403).send('Enter correct ids');
    })
    // skip to next track 
router.post('/me/player/next-playing', checkAuth, async(req, res) => {
        const user = await User.getUserById(req.user._id);
        if (user) {
            const player = user.player;
            if (player && player.current_track) {
                var nextPlayingTrack = await Track.getFullTrack(player.next_track.trackId, user);
                const skip = await Player.skipNext(user)
                if (nextPlayingTrack) {
                    if (skip == 2)
                        nextPlayingTrack['fristInSource'] = true;
                    nextPlayingTrack['isPlaylist'] = player.next_track.isPlaylist;
                    nextPlayingTrack['playlistId'] = player.next_track.playlistId;
                    nextPlayingTrack['isPlayable'] = true;
                    res.send(nextPlayingTrack);
                } else res.status(404).json({ error: 'track not found' })

            } else res.status(400).send('next does not exist')
        } else res.status(403).send('user is not correct')
    })
    // skip to prev track
router.post('/me/player/prev-playing', checkAuth, async(req, res) => {
        const user = await User.getUserById(req.user._id);
        if (user) {
            const player = user.player;
            if (player && player.prev_track) {
                var prevPlayingTrack = await Track.getFullTrack(player.prev_track.trackId, user);
                const skip = await Player.skipPrevious(user);
                if (prevPlayingTrack) {
                    prevPlayingTrack['isPlaylist'] = player.prev_track.isPlaylist;
                    prevPlayingTrack['playlistId'] = player.prev_track.playlistId;
                    prevPlayingTrack['isPlayable'] = true;
                    res.send(prevPlayingTrack);
                } else res.status(404).json({ error: 'track not found' })
            } else res.status(400).send('previous does not exist')
        } else res.status(403).send('user is not correct')
    })
    // get user queue 
router.get('/me/queue', checkAuth, async(req, res) => {
        const userID = req.user._id;
        const tracks = await User.getQueue(userID);
        if (!tracks) res.status(400).json({ error: 'couldnt get queue' });
        else res.status(200).json(tracks);
    })
    //to repeat
router.put('/player/repeat', checkAuth, async(req, res) => {
    const userID = req.user._id;
    if (stateValidation(req.query.state)) {
        const repeat = User.repreatPlaylist(userID, req.query.state);
        if (!repeat) res.status(400).json({ error: 'could not repeat playlist' });
        else res.status(200).json({ success: 'is_repeat playlist: ' + req.query.state })
    } else req.status(400).send('state is required');
})

// resume player 
router.put('/me/player/play', checkAuth, async(req, res) => {
        const userID = req.user._id;
        const player = User.resumePlaying(userID);
        if (!player) res.status(404).json({ error: 'could not resume playing' });
        else res.status(204).json({ success: 'resumed playing' })
    })
    // pause player 
router.put('/me/player/pause', checkAuth, async(req, res) => {
        const userID = req.user._id;
        const player = User.pausePlaying(userID);
        if (!player) res.status(404).json({ error: 'could not resume playing' });
        else res.status(204).json({ success: 'paused playing' })
    })
    //toggle shuffle
router.put('/me/player/shuffle', checkAuth, async(req, res) => {
        if (stateValidation(req.query.state)) {
            const userID = req.user._id;
            const state = req.query.state;
            const isShuffle = await User.setShuffle(state, userID);
            if (!isShuffle) res.status(400).json({ error: 'can not shuffle ' });
            else res.status(200).json({ success: 'Do successfully' });
        } else res.status(400).send('state is required');
    })
    // get recent played
router.get('/me/player/recently-played', checkAuth, async(req, res) => {
        const user = await User.getUserById(req.user._id);
        if (user) {
            const playHistory = await Player.getRecentTracks(user, req.query.limit);
            if (!playHistory) res.status(400).json({ error: 'can not get playhistory' });
            else res.status(200).json(playHistory);
        } else res.status(403).send('this user is deleted');
    })
    // add to recent played
router.put('/me/player/recently-played/:source_id/:track_id', checkAuth, async(req, res) => {
    if (checkID([req.params.track_id, req.params.source_id])) {
        const user = await User.getUserById(req.user._id);
        if (user) {
            const playHistory = await Player.addRecentTrack(user, req.params.track_id, req.query.sourceType, req.params.source_id);
            if (!playHistory) res.status(400).json({ error: 'can not add to playhistory ' });
            else res.status(203).json({ 'success': 'added successfully' });
        } else res.status(403).send('user is not correct')
    } else res.status(403).send('Enter correct ids');
})

module.exports = router;