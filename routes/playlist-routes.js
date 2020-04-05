 const router = require('express').Router();

 const Playlist = require('../public-api/playlist-api');
 const User = require('../public-api/user-api');
 const { auth: checkAuth } = require('../middlewares/is-me');
 const validatePlaylistInput = require("../validation/playlist");
 const { content: checkContent } = require('../middlewares/content');

 //get playlist
 router.get('/playlists/:playlist_id', checkAuth, async(req, res) => {

     const playlistId = req.params.playlist_id;
     const playlist = await User.getPlaylist(playlistId, req.query.snapshot, req.user._id);
     if (!playlist) res.status(400).send("Not found !"); //not found
     else res.send(playlist);
 })

 // user create playlist
 router.post('/users/playlists', checkAuth, async(req, res) => {

         const userID = req.user._id; // get it from desierialize auth

         const { errors, isValid } = validatePlaylistInput(req.body);
         // Check validation
         if (!isValid) {
             return res.status(400).json(errors);
         }
         let details = req.body;
         //console.log(details);
         if (details.name == undefined) { return res.status(400).json("Invalid Input"); }
         // to create playlist &add it to user
         const createPlaylist = await User.createdPlaylist(userID, details.name, details.Description);
         if (createPlaylist) res.send(createPlaylist);
         else res.send({ error: "can not create" }); // if can not create for unexpected reason

     })
     // user follow playlist
 router.put('/playlists/:playlist_id/followers', checkAuth, async(req, res) => {
     const userID = req.user._id; // get it from desierialize auth 
     const playlistID = req.params.playlist_id;
     const isPrivate = req.body.isPrivate || false;

     const updatedUser = await User.followPlaylist(userID, playlistID, isPrivate);
     if (updatedUser) res.status(200).send({ success: " followed this playlist successfully" });
     else res.status(400).send({ "error": 'this playlist cant be followed' });

 })

 // user unfollow playlist
 router.delete('/playlists/:playlist_id/followers', checkAuth, async(req, res) => {
     const userID = req.user._id; // get it from desierialize auth
     const playlistID = req.params.playlist_id;
     const updatedUser = await User.unfollowPlaylist(userID, playlistID);
     if (updatedUser) res.status(200).send({ success: "unfollowed this playlist successfully" }); // if user already liked the song
     else res.status(400).send({ "error": "user did not follow this playlist " });

 });
 // delete playlist 
 router.delete('/me/delete/playlists/:playlist_id', checkAuth, async(req, res) => {

         const userID = req.user._id; // get it from desierialize auth
         const playlistId = req.params.playlist_id;
         const updatedUser = await User.deletePlaylist(userID, playlistId);

         if (!updatedUser) res.status(400).send({ error: 'can not delete !' }); // if user already liked the song
         else res.status(200).send({ success: 'Delete successfully' });


     })
     //add track to a playlist
 router.post('/playlists/:playlist_id/tracks', checkAuth, async(req, res) => {
         if (req.body.tracks == undefined) {
             return res.status(401).send('Bad Request');
         }
         let tracksids = req.body.tracks.split(',');
         const playlist = await Playlist.addTrackToPlaylist(req.params.playlist_id, tracksids);
         if (!playlist) return res.status(404).send({ "error": 'can not add tracks' });
         return res.status(201).send(playlist.snapshot[playlist.snapshot.length]);

     })
     //update created playlists details  {name,description => done + {image} not done yet}
 router.put('/playlists/:playlist_id', [checkAuth, checkContent], async(req, res) => {
         let authorized = await User.checkAuthorizedPlaylist(req.user._id, req.params.playlist_id);
         if (!authorized) { return res.status(403).send("FORBIDDEN"); }
         let details = req.body;
         const playlist = await Playlist.updatePlaylistDetails(req.params.playlist_id, details);
         if (!playlist) return res.status(404).send({ "error": 'cannot update playlist' });
         return res.status(200).send(playlist);
     })
     //get current user playlists (Created && Followed)
 router.get('/me/playlists', [checkAuth], async(req, res) => {

         const playlists = await Playlist.getUserPlaylists(req.user._id, req.query.limit, req.query.offset, true);

         return res.status(200).send(playlists);

     })
     //get some user's public playlists (Followed&&Created)
 router.get('/users/:user_id/playlists', [checkAuth], async(req, res) => {

         const playlists = await Playlist.getUserPlaylists(req.params.user_id, req.query.limit, req.query.offset, false);
         if (playlists.length == 0) return res.status(404).send('NOT FOUND');
         return res.status(200).send(playlists);

     })
     // change playlist callobrative attribute
 router.put('/playlists/:playlist_id/collaborative', [checkAuth, checkContent], async(req, res) => {
         let user = await User.getUserById(req.user._id);
         if (!user) return res.status(404).send("NOT FOUND");

         let authorized = await Playlist.checkIfUserHasPlaylist(user, req.params.playlist_id);
         if (!authorized) { return res.status(403).send("FORBIDDEN"); }
         let done = await Playlist.changeCollaboration(user, req.params.playlist_id);
         if (!done) return res.status(404).send("NOT FOUND");
         return res.status(200).send("CHANGED");
     })
     // toggle playlist isPublic attribute
 router.put('/playlists/:playlist_id/public', [checkAuth, checkContent], async(req, res) => {
         let user = await User.getUserById(req.user._id);
         if (!user) return res.status(404).send("NOT FOUND");

         let authorized = await Playlist.checkIfUserHasPlaylist(user, req.params.playlist_id);
         let authorizedFollow = await Playlist.checkFollowPlaylistByUser(user, req.params.playlist_id);
         if (!authorized && !authorizedFollow) { return res.status(403).send("FORBIDDEN"); }
         let done = await Playlist.changePublic(user, req.params.playlist_id);
         if (!done) return res.status(404).send("Cant be PUblic");
         return res.status(200).send("CHANGED");
     })
     // get tracks in playlist
 router.get('/playlists/:playlist_id/tracks', [checkAuth], async(req, res) => {
         // console.log("tracks");
         let user = await User.getUserById(req.user._id);
         if (!user) return res.status(404).send("NOT FOUND");
         let tracks = await Playlist.getPlaylistWithTracks(req.params.playlist_id, req.query.snapshot, user);
         if (!tracks) { return res.status(401).send("no tracks"); }
         if (tracks.length == 0) return res.status(404).send("NO Tracks in this playlist yet");
         return res.status(200).send(tracks);
     })
     // delete tracks from playlist
 router.delete('/playlists/:playlist_id/tracks', [checkAuth], async(req, res) => {
         let authorized = await User.checkAuthorizedPlaylist(req.user._id, req.params.playlist_id);
         if (!authorized) { return res.status(403).send("FORBIDDEN"); }
         let tracksids = [];
         tracksids = (req.body.track_ids) ? req.body.track_ids.split(',') : [];
         //  console.log(tracksids);
         let result = await Playlist.removePlaylistTracks(req.params.playlist_id, tracksids, req.body.snapshot);
         if (!result) return res.status(404).send("NO Tracks Delelted");
         return res.status(200).send(result);
     })
     // reorder playlist
 router.put('/playlists/:playlist_id/tracks', [checkAuth], async(req, res) => {
     let authorized = await User.checkAuthorizedPlaylist(req.user._id, req.params.playlist_id);
     if (!authorized) { return res.status(403).send("FORBIDDEN"); }
     let result = await Playlist.reorderPlaylistTracks(req.params.playlist_id, req.body.snapshot_id, req.body.range_start, Number(req.body.range_length), req.body.insert_before);
     if (!result) return res.status(404).send("NO Tracks Reordered");
     return res.status(200).send(result);
 })



 module.exports = router;