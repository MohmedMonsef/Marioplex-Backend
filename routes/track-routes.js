 const router = require('express').Router();

const Track =require('../public-api/track-api');
const User = require('../public-api/user-api');
const Album = require('../public-api/album-api');
const Artist = require('../public-api/artist-api');
const {auth:checkAuth} = require('../middlewares/isMe');

// get track
router.get('/track/:track_id',checkAuth,async (req,res)=>{
    
    const trackID = req.params.track_id;
   
    const track = await Track.getTrack(trackID);
    if(!track) res.sendStatus(404); //not found
    else res.json(track); 

})

// get track with some user info as like
router.get('/me/track/:track_id',checkAuth,async (req,res)=>{
    
    const trackID = req.params.track_id;
    const user = await User.getUserById(req.user._id);
    const track = await Track.getTrack(trackID);
    const isLiked = Track.checkIfUserLikeTrack(user,trackID)?true:false;
    if(!track) res.sendStatus(404).json({error:"track not found"}); //not found
    // get both album and artist of the track
    const album = await Album.getAlbumById(track.albumId);
    if(!album) res.sendStatus(404).json({error:"album not found"});; //not found
    const artist = await Artist.getArtist(track.artistId);
    if(!artist) res.sendStatus(404).json({error:"artist not found"});; //not found
    // if all are found return them in new created json object
    res.json({track:track,isLiked:isLiked,album:album,artist:artist}); 

})
// get tracks
router.get('/tracks/',checkAuth,async (req,res)=>{
    const trackIDs = req.query.ids.split(',');
    const tracks = await Track.getTracks(trackIDs);
    if(!tracks) res.status(404).send({error:"tracks with those id's are not found"});
    else res.json(tracks);
})
// get track audio feature/analysis
router.get('/track/audio-features/:track_id',checkAuth,async (req,res)=>{
    const audioFeature = await Track.getAudioFeaturesTrack(req.params.track_id);
    if(!audioFeature) res.status(404).send({error:"no track with this id"});
    else res.json(audioFeature);
})

// get tracks audio feature/analysis 
router.get('/tracks/audio-features/',checkAuth,async (req,res)=>{
    const trackIDs = req.query.ids.split(',');
    const audioFeatures = await Track.getAudioFeaturesTracks(trackIDs);
    if(!audioFeatures) res.status(404).send({error:"no tracks with this id"});
    else res.json(audioFeatures);
})

// user like track
router.put('/me/like/:track_id',checkAuth,async (req,res)=>{
    
    const userID = req.user._id; // get it from desierialize auth 
    const trackID = req.params.track_id;
    const updatedUser= await  User.likeTrack(userID,trackID);
    // TO DO
    // SEND HTTP CODES AND IMPLEMENT ERROR OBJECT
    if(!updatedUser) res.send({error:"already liked the song"}); // if user already liked the song
    else res.send({success:"liked the song successfully"});

});

// user unlike track
router.delete('/me/unlike/:track_id',checkAuth,async (req,res)=>{
    const userID = req.user._id; // get it from desierialize auth
    const trackID = req.params.track_id;
    const updatedUser= await User.unlikeTrack(userID,trackID);
    // TO DO
    // SEND HTTP CODES AND IMPLEMENT ERROR OBJECT
    if(!updatedUser) res.send({error:"user didnt liked the song before"}); // if user already liked the song
    else res.send({success:"unliked the song successfully"});

});



module.exports = router; 
