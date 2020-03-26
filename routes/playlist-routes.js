 const router = require('express').Router();

const Playlist =require('../public-api/playlist-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');
const validatePlaylistInput = require("../validation/playlist");
const {content:checkContent} = require('../middlewares/content');

//get playlist
router.get('/playlist/:playlist_id',checkAuth,async (req,res)=>{

    const playlistId = req.params.playlist_id;
    const playlist = await User.getPlaylist(playlistId,req.query.snapshot,req.user._id);
    if(!playlist) res.status(400).send("Not found !"); //not found
    else res.send(playlist); 
})

// user create playlist
router.post('/users/playlists',checkAuth,async (req,res)=>{
    
    const userID = req.user._id; // get it from desierialize auth
 
    const { errors, isValid } = validatePlaylistInput(req.body);
    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    let details=req.body;
    console.log(details);
    if(details.name==undefined){return res.status(400).json("Invalid Input");}
    // to create playlist &add it to user
    const createPlaylist= await  User.createdPlaylist(userID,details.name,details.Description);
    if(createPlaylist) res.send( createPlaylist);
    else  res.send({error:"can not create"}); // if can not create for unexpected reason

})

router.put('/playlists/:playlist_id/followers',checkAuth,async (req,res)=>{
    const userID = req.user._id; // get it from desierialize auth 
    const playlistID = req.params.playlist_id;

     const updatedUser= await  User.followPlaylist(userID,playlistID,req.body.isPrivate);
     if (updatedUser) res.send({success:" followed this playlist successfully"});
     else res.status(400).send('this playlist cant be followed');
  
})

// user unfollow playlist
router.delete('/playlists/:playlist_id/followers',checkAuth,async (req,res)=>{
    const userID = req.user._id; // get it from desierialize auth
    const playlistID = req.params.playlist_id;
    const updatedUser= await  User.unfollowPlaylist(userID,playlistID);
    if(updatedUser) res.send({success:"unfollowed this playlist successfully"}); // if user already liked the song
    else res.status(400).send({error:"user did not follow this playlist "});

});

router.delete('/me/delete/:playlist_id',checkAuth,async (req,res)=>{
    
    const userID = req.user._id; // get it from desierialize auth
    const playlistId = req.params.playlist_id;
    const updatedUser= await User.deletePlaylist(userID,playlistId);

    if(!updatedUser) res.status(400).send({error:'can not delete !'}); // if user already liked the song
    else res.status(200).send({success:'Delete successfully'});


})
//add track to a playlist
router.post('/playlists/:playlist_id/tracks',checkAuth,async (req,res)=>{
    if(req.body.tracks==undefined){
        return res.status(401).send('Bad Request');
    }
    let tracksids=req.body.tracks.split(',');
    const tracks=await Playlist.addTrackToPlaylist(req.params.playlist_id,tracksids);
    if(!tracks) return res.status(404).send('NOT FOUND');
    return res.status(200).send(tracks);
   
})
//update created playlists details  {name,description => done + {image} not done yet}
router.put('/playlists/:playlist_id',[checkAuth,checkContent],async (req,res)=>{
    let authorized=await User.checkAuthorizedPlaylist(req.user._id,req.params.playlist_id);
    if(!authorized){return res.status(403).send("FORBIDDEN");}
    let details=req.body;
    const playlist=await Playlist.updatePlaylistDetails(req.params.playlist_id,details);
    if(!playlist) return res.status(404).send('NOT FOUND');
    return res.status(200).send(playlist);
})
//get current user playlists (Created && Followed)
router.get('/me/playlists',[checkAuth],async (req,res)=>{

    const playlists=await Playlist.getUserPlaylists(req.user._id,req.query.limit,req.query.offset,true);
    if(playlists.length==0) return res.status(404).send('NOT FOUND');
    return res.status(200).send(playlists);
   
})
//get some user's public playlists (Followed&&Created)
router.get('/users/:user_id/playlists',[checkAuth],async (req,res)=>{

    const playlists=await Playlist.getUserPlaylists(req.params.user_id,req.query.limit,req.query.offset,false);
    if(playlists.length==0) return res.status(404).send('NOT FOUND');
    return res.status(200).send(playlists);
   
})

router.put('/playlists/:playlist_id/collaborative',[checkAuth,checkContent],async (req,res)=>{
    let user=await User.getUserById(req.user._id);
    if(!user) return res.status(404).send("NOT FOUND");

    let authorized=await Playlist.checkIfUserHasPlaylist(user,req.params.playlist_id);
    if(!authorized){return res.status(403).send("FORBIDDEN");}
    let done=await Playlist.changeCollaboration(user,req.params.playlist_id);
    if(!done) return res.status(404).send("NOT FOUND");
    return res.status(200).send("CHANGED");
})

router.put('/playlists/:playlist_id/public',[checkAuth,checkContent],async (req,res)=>{
    let user=await User.getUserById(req.user._id);
    if(!user) return res.status(404).send("NOT FOUND");

    let authorized=await Playlist.checkIfUserHasPlaylist(user,req.params.playlist_id);
    let authorizedFollow=await Playlist.checkFollowPlaylistByUser(user,req.params.playlist_id);
    if(!authorized&&!authorizedFollow){return res.status(403).send("FORBIDDEN");}
    let done=await Playlist.changePublic(user,req.params.playlist_id);
    if(!done) return res.status(404).send("Cant be PUblic");
    return res.status(200).send("CHANGED");
})

router.get('/playlists/:playlist_id/tracks',[checkAuth],async (req,res)=>{

    let tracks=await Playlist.getPlaylistTracks(req.params.playlist_id);
    if(!tracks){return res.status(401).send("no tracks");}
    if(tracks.length==0) return res.status(404).send("NO Tracks in this playlist yet");
    return res.status(200).send(tracks);
})

router.delete('/playlists/:playlist_id/tracks',[checkAuth],async (req,res)=>{
    let authorized=await User.checkAuthorizedPlaylist(req.user._id,req.params.playlist_id);
    if(!authorized){return res.status(403).send("FORBIDDEN");}
    let tracksids=[];
     tracksids=(req.query.tracks)?req.query.tracks.split(','):[];
    let result=await Playlist.removePlaylistTracks(req.params.playlist_id,tracksids,req.query.snapshot);
    if(!result) return res.status(404).send("NO Tracks Delelted");
    return res.status(200).send(result);
})

router.put('/playlists/:playlist_id/tracks',[checkAuth],async (req,res)=>{
    let authorized=await User.checkAuthorizedPlaylist(req.user._id,req.params.playlist_id);
    if(!authorized){return res.status(403).send("FORBIDDEN");}
    let result=await Playlist.reorderPlaylistTracks(req.params.playlist_id,req.query.snapshot,req.query.start,Number(req.query.length),req.query.before);
    if(!result) return res.status(404).send("NO Tracks Reordered");
    return res.status(200).send(result);
})



module.exports = router; 