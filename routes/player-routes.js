const middleTrack = "2";
const router = require('express').Router();
const Player =require('../public-api/player-api');
const User = require('../public-api/user-api');
const Track = require('../public-api/track-api')
const {auth:checkAuth} = require('../middlewares/isMe');

// update the player api instance
router.get('/updatePlayer/:id',async (req,res)=>{
    const user = await User.getUserById("5e6bcfec15da8934bc2114d5")
  const p =  await Player.setPlayerInstance(user,true,"5e713e741103df39508b20cf",req.params.id);
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
    const user = await User.getUserById(req.user._id)
    const isPlaylist = req.query.isPlaylist
    const createQueue= await Player.createQueue(user,isPlaylist,sourceId,trackId);
    if( createQueue == 0) res.status(400).send("can not create queue");
    else res.send(" Queue is created successfully");
 
 }) 


module.exports = router; 

