 const router = require('express').Router();

const Playlist =require('../public-api/playlist-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');
const validatePlaylistInput = require("../validation/playlist");

//get playlist
router.get('/playlist/:playlist_id',checkAuth,async (req,res)=>{
    
    const playlistId = req.params.playlist_id;
   
    const playlist = await Playlist.getPlaylist(playlistId);
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
    // to create playlist &add it to user
    const createPlaylist= await  User. createdPlaylist(userID,req.body.name);
    if(createPlaylist) res.send( createPlaylist);
    else  res.send({error:"can not create"}); // if can not create for unexpected reason
    

})

router.put('/playlists/:playlist_id/followers',checkAuth,async (req,res)=>{
    
    const userID = req.user._id; // get it from desierialize auth 
    const playlistID = req.params.playlist_id;
    const updatedUser= await  User.followPlaylist(userID,playlistID);
    // TO DO
    // SEND HTTP CODES AND IMPLEMENT ERROR OBJECT
    if(!updatedUser) res.send({error:"already follow this playlist"}); // if user already liked the song
    else res.send({success:" followed this playlist successfully"});

})

// user unlike track
router.delete('/playlists/:playlist_id/followers',checkAuth,async (req,res)=>{
    const userID = req.user._id; // get it from desierialize auth
    const playlistID = req.params.playlist_id;
    const updatedUser= await  User.unfollowPlaylist(userID,playlistID);
    // TO DO
    // SEND HTTP CODES AND IMPLEMENT ERROR OBJECT
    if(!updatedUser) res.send({error:"user didnt follow this playlist"}); // if user already liked the song
    else res.send({success:"unfollowed this playlist successfully"});

});

router.delete('/me/delete/:playlist_id',checkAuth,async (req,res)=>{
    
    const userID = req.user._id; // get it from desierialize auth
    const playlistId = req.params.playlist_id;
    const updatedUser= await User.deletePlaylist(userID,playlistId);
    

    if(!updatedUser) res.send({error:'can not delete !'}); // if user already liked the song
    else res.send({success:'Delete successfully'});

    

})




module.exports = router; 