const router = require('express').Router();
const Playlist = require('../public-api/playlist-api');
const User = require('../public-api/user-api');
const { auth: checkAuth } = require('../middlewares/is-me');
const validatePlaylistInput = require('../validation/playlist');
const { content: checkContent } = require('../middlewares/content');
const checkID = require('../validation/mongoose-objectid');
//GET PLAYLIST - PATH PARAMS: playlist_id
router.get('/playlists/:playlist_id', checkAuth, async(req, res) => {
    if (checkID([req.params.playlist_id])) {
        const playlistId = req.params.playlist_id;
        const playlist = await User.getPlaylist(playlistId, req.query.snapshot, req.user._id);
        if (!playlist) res.status(400).send('Not found !');
        else res.send(playlist);
    } else res.status(403).send('Id is not correct !')
})

// CURRENT USER CREATE PLAYLIST - BODY PARAMS : name-Description
router.post('/users/playlists', checkAuth, async(req, res) => {
        const userId = req.user._id;
        const { errors, isValid } = validatePlaylistInput(req.body);
        // Check validation
        if (!isValid) {
            return res.status(400).json(errors);
        }
        let details = req.body;
        //if (details.name == undefined) { return res.status(400).json('Invalid Input'); } //  the same validatePlaylistInput
        // to create playlist &add it to user
        const createPlaylist = await User.createdPlaylist(userId, details.name, details.Description);
        if (createPlaylist) res.send(createPlaylist);
        else res.send({ error: 'can not create' }); // if can not create for unexpected reason

    })
    // FOLLOW PLAYLIST - PATH PARAMS : playlist_id - BODY PARAMS:isPrivate
router.put('/playlists/:playlist_id/followers', checkAuth, async(req, res) => {
    if (checkID([req.params.playlist_id])) {
        const userId = req.user._id; // get it from desierialize auth 
        const playlistId = req.params.playlist_id;
        const isPrivate = req.body.isPrivate || false;
        const updatedUser = await User.followPlaylist(userId, playlistId, isPrivate);
        if (updatedUser) res.status(200).send({ success: ' followed this playlist successfully' });
        else res.status(400).send({ 'error': 'this playlist cant be followed' });
    } else res.status(403).send({ error: 'error in Id' });
})

// USER UNFOLLOW PLAYLIST - PATH PARAMS : playlist_id
router.delete('/playlists/:playlist_id/followers', checkAuth, async(req, res) => {
    if (checkID([req.params.playlist_id])) {
        const userId = req.user._id; // get it from desierialize auth
        const playlistId = req.params.playlist_id;
        const updatedUser = await User.unfollowPlaylist(userId, playlistId);
        if (updatedUser) res.status(200).send({ success: 'unfollowed this playlist successfully' });
        else res.status(400).send({ 'error': 'user did not follow this playlist ' });
    } else res.status(403).send({ error: 'error in Id' });

});
// DELETE PLAYLIST -  PATH PARAMS : playlist_id
router.delete('/me/delete/playlists/:playlist_id', checkAuth, async(req, res) => {
        if (checkID([req.params.playlist_id])) {
            const userId = req.user._id; // get it from desierialize auth
            const playlistId = req.params.playlist_id;
            const updatedUser = await User.deletePlaylist(userId, playlistId);
            if (!updatedUser) res.status(400).send({ error: 'can not delete !' });
            else res.status(200).send({ success: 'Delete successfully' });
        } else res.status(403).send({ error: 'error in Id' });


    })
    //ADD TRACK TO PLAYLIST - PATH PARAMS:playlist_id -BODY PARAMS:tracks (Array of ids)
router.post('/playlists/:playlist_id/tracks', checkAuth, async(req, res) => {
        if (req.body.tracks == undefined) {
            return res.status(401).send('Bad Request');
        }
        let tracksIds = req.body.tracks.split(',');
        // console.log(tracksIds);
        if (checkID([req.params.playlist_id]) && checkID(tracksIds)) {
            const playlist = await Playlist.addTrackToPlaylist(req.params.playlist_id, tracksIds);
            if (!playlist) return res.status(404).send({ 'error': 'can not add tracks' });
            return res.status(201).send(playlist.snapshot[playlist.snapshot.length - 1]);
        } else res.status(403).send({ error: 'error in Id' });
    })
    //UPDATE CREATE PLAYLIST DETAILS  {name,description => done + {image} not done yet} 
    //PATH PARAMS :playlist_id - BODY PARAMS :name,Description
router.put('/playlists/:playlist_id', [checkAuth, checkContent], async(req, res) => {
        if (!checkID([req.params.playlist_id])) return res.status(403).send({ error: 'error in Id' });
        let authorized = await User.checkAuthorizedPlaylist(req.user._id, req.params.playlist_id);
        if (!authorized) { return res.status(403).send('FORBIDDEN'); }
        let details = req.body;
        const playlist = await Playlist.updatePlaylistDetails(req.params.playlist_id, details);
        if (!playlist) return res.status(404).send({ 'error': 'cannot update playlist' });
        return res.status(200).send(playlist);
    })
    //GET CURRENT USER PLAYLISTS (Created && Followed)
    //QUERY PARAMS : limit,offset
router.get('/me/playlists', [checkAuth], async(req, res) => {

        const playlists = await Playlist.getUserPlaylists(req.user._id, req.query.limit, req.query.offset, true);
        return res.status(200).send(playlists);

    })
    //GET A USER'S PUBLIC PLAYLISTS (Followed&&Created)
    //PATH PARAMS:user_id - QUERY PARAMS : limit,offset
router.get('/users/:user_id/playlists', [checkAuth], async(req, res) => {
        if (!checkID([req.params.user_id])) return res.status(403).send({ error: 'error in Id' });
        const playlists = await Playlist.getUserPlaylists(req.params.user_id, req.query.limit, req.query.offset, false);
        if (!playlists || playlists.length == 0) return res.status(404).send('NOT FOUND');
        res.status(200).send(playlists);

    })
    // TOGGLE COLLABORATIVE 
    //PATH PARAMS :playlist_id
router.put('/playlists/:playlist_id/collaborative', [checkAuth, checkContent], async(req, res) => {
        let user = await User.getUserById(req.user._id);
        if (!user) return res.status(404).send('NOT FOUND');
        if (!checkID([req.params.playlist_id])) return res.status(403).send({ error: 'error in Id' });
        let authorized = await Playlist.checkIfUserHasPlaylist(user, req.params.playlist_id);
        if (!authorized) { return res.status(403).send('FORBIDDEN'); }
        let done = await Playlist.changeCollaboration(user, req.params.playlist_id);
        if (!done) return res.status(404).send('NOT FOUND');
        return res.status(200).send('CHANGED');
    })
    // TOGGLE isPublic 
    //PATH PARAMS :playlist_id
router.put('/playlists/:playlist_id/public', [checkAuth, checkContent], async(req, res) => {
        let user = await User.getUserById(req.user._id);
        if (!user) return res.status(404).send('NOT FOUND');
        if (!checkID([req.params.playlist_id])) return res.status(403).send({ error: 'error in Id' });
        let authorized = await Playlist.checkIfUserHasPlaylist(user, req.params.playlist_id);
        let authorizedFollow = await Playlist.checkFollowPlaylistByUser(user, req.params.playlist_id);
        if (!authorized && !authorizedFollow) { return res.status(403).send('FORBIDDEN'); }
        let done = await Playlist.changePublic(user, req.params.playlist_id);
        if (!done) return res.status(404).send('Cant be PUblic');
        return res.status(200).send('CHANGED');
    })
    // GET TRACKS IN PLAYLIST
    //PATH PARAMS:playlist_id
router.get('/playlists/:playlist_id/tracks', [checkAuth], async(req, res) => {
        let user = await User.getUserById(req.user._id);
        if (!user) return res.status(404).send('NOT FOUND');
        if (!checkID([req.params.playlist_id])) return res.status(403).send({ error: 'error in Id' });
        let tracks = await Playlist.getPlaylistWithTracks(req.params.playlist_id, req.query.snapshot, user);
        if (!tracks) { return res.status(401).send('no tracks'); }
        if (tracks.length == 0) return res.status(404).send('NO Tracks in this playlist yet');
        return res.status(200).send(tracks);
    })
    // DELETE TRACKS FROM PLAYLIST
    //PATH PARAMS : playlist_id
router.delete('/playlists/:playlist_id/tracks', [checkAuth], async(req, res) => {
        let authorized = await User.checkAuthorizedPlaylist(req.user._id, req.params.playlist_id);
        if (!authorized) return res.status(403).send('FORBIDDEN');
        if (!checkID([req.params.playlist_id])) return res.status(403).send({ error: 'error in Id' });
        let tracksIds = [];
        tracksIds = (req.body.track_ids) ? req.body.track_ids.split(',') : [];
        let result = await Playlist.removePlaylistTracks(req.params.playlist_id, tracksIds, req.body.snapshot);
        if (!result) return res.status(404).send('NO Tracks Delelted');
        return res.status(200).send(result);
    })
    // REORDER PLAYLIST
    //PATH PARAMS:playlist_id - BODY PARAMS : start,length,before
router.put('/playlists/:playlist_id/tracks', [checkAuth], async(req, res) => {
    let authorized = await User.checkAuthorizedPlaylist(req.user._id, req.params.playlist_id);
    if (!authorized) { return res.status(403).send('FORBIDDEN'); }
    if (!checkID([req.params.playlist_id])) return res.status(403).send({ error: 'error in Id' });
    let result = await Playlist.reorderPlaylistTracks(req.params.playlist_id, req.body.snapshot_id, req.body.range_start, Number(req.body.range_length), req.body.insert_before);
    if (!result) return res.status(404).send('NO Tracks Reordered');
    return res.status(200).send(result);
})



module.exports = router;