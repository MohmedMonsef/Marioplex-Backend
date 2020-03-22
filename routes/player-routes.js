
const router = require('express').Router();
const Player =require('../public-api/player-api');
const User = require('../public-api/user-api');
const Track = require('../public-api/track-api')
const {auth:checkAuth} = require('../middlewares/isMe');

// update the player api instance
// just for test route
router.get('/updatePlayer',async (req,res)=>{
  const userID = "5e6bcfec15da8934bc2114d5";
  const playlistID = "5e74d060d5f64531a44df5c0";
  const trackID = "5e1a0651741b255ddda996c2"
  const p =  await User.updateUserPlayer(userID,true,playlistID,trackID);
  if(!p) res.status(404).send({error:"wrong"});
  else res.json({"success":"updated user player"});
})

//get current track playing
router.get('/me/player/currently-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  const currentPlayingTrack = await Track.getTrack(player.current_track);
  if(currentPlayingTrack) res.json(currentPlayingTrack);
  else res.status(404).json({error:"track not found"})
})

//get next track playing
router.get('/me/player/next-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  const nextPlayingTrack = await Track.getTrack(player.next_track);
  if(nextPlayingTrack) res.json(nextPlayingTrack);
  else res.status(404).json({error:"track not found"})
})

//get prev track playing
router.get('/me/player/prev-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  const prevPlayingTrack = await Track.getTrack(player.prev_track);
  if(prevPlayingTrack) res.json(prevPlayingTrack);
  else res.status(404).json({error:"track not found"})
})

router.put('/createQueue/:playlist_id/:trackId',checkAuth,async (req,res)=>{
    const sourceId =req.params.playlist_id;
    const trackId =req.params.trackId;
    const isPlaylist = req.query.isPlaylist;
    const userID =req.user._id;
    const createQueue= await User.updateUserPlayer(userID,isPlaylist,sourceId,trackId)
    if(!createQueue) res.status(400).send("can not create queue");
    else res.send(" Queue is created successfully");
 
 }) 

 router.put('/player/add-to-queue/:trackId',checkAuth,async (req,res)=>{
  const trackId =req.params.trackId;
  const addToQueue = await User.addToQueue(req.user._id,trackId);
  if( addToQueue == 0) res.status(400).send("can not add queue ! ");
  else res.send(" add successfully");

}) 
 router.post('/me/player/next-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  const nextPlayingTrack = await Track.getTrack(player.next_track);
  const skip = await Player.skipNext(user);
  if(nextPlayingTrack) res.json(nextPlayingTrack);
  else res.status(404).json({error:"track not found"})
})

router.post('/me/player/prev-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  const prevPlayingTrack = await Track.getTrack(player.prev_track);
  const skip = await Player.skipPrevious(user);
  if(prevPlayingTrack) res.json(prevPlayingTrack);
  else res.status(404).json({error:"track not found"})
})

module.exports = router;