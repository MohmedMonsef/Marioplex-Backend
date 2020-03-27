
const router = require('express').Router();
const Player =require('../public-api/player-api');
const User = require('../public-api/user-api');
const Track = require('../public-api/track-api')
const {auth:checkAuth} = require('../middlewares/isMe');

// update the player api instance
// just for test route
router.get('/me/updatePlayer',async (req,res)=>{
  const userID = "5e70351bc6367c46a08c255a";
  const playlistID = "5e756a10c8bb822d60284aef";
  const trackID = "5e6e6c8ed9ee6b2f70d3b7d5"
  const p =  await User.updateUserPlayer(userID,true,playlistID,trackID);
  if(!p) return res.status(404).send({error:"wrong"});
  else return res.json({"success":"updated user player"});
})

//get current track playing
router.get('/me/player/currently-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  console.log(user.queue);
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
  console.log(user.queue);
  console.log(user.player);
  const prevPlayingTrack = await Track.getTrack(player.prev_track);
  if(prevPlayingTrack) res.json(prevPlayingTrack);
  else res.status(404).json({error:"track not found"})
})
// create queue fo player
router.post('/createQueue/:playlist_id/:trackId',checkAuth,async (req,res)=>{
    const sourceId =req.params.playlist_id;
    const trackId =req.params.trackId;
    const isPlaylist = req.query.isPlaylist;
    const userID =req.user._id;
    const createQueue= await User.updateUserPlayer(userID,isPlaylist,sourceId,trackId)
    if(!createQueue) res.status(400).send('can not create queue');
    else res.send(' Queue is created successfully');
 
 }) 
// add track to user player queue
 router.post('/player/add-to-queue/:trackId',checkAuth,async (req,res)=>{
  const trackId =req.params.trackId;
  const addToQueue = await User.addToQueue(req.user._id,trackId);
  if( addToQueue == 0) res.status(400).send('can not add queue ! ');
  else res.send('add successfully');

})
// skip to next track 
 router.post('/me/player/next-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  const nextPlayingTrack = await Track.getTrack(player.next_track);
  const skip = await Player.skipNext(user);
  let track=[];
  if(skip==2){
    track.push({track:nextPlayingTrack,fristInSource:true})
    if(nextPlayingTrack) res.json(track);
    else res.status(404).json({error:'track not found'})
  }
  else{
    track.push({track:nextPlayingTrack})
    if(nextPlayingTrack) res.json(track);
    else res.status(404).json({error:'track not found'})
  }
  })
// skip to prev track
router.post('/me/player/prev-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  const prevPlayingTrack = await Track.getTrack(player.prev_track);
  const skip = await Player.skipPrevious(user);
  if(prevPlayingTrack) res.json(prevPlayingTrack);
  else res.status(404).json({error:'track not found'})
})
// get user queue 
router.get('/me/queue',checkAuth,async (req,res)=>{
  const userID = req.user._id;
  const tracks = await User.getQueue(userID);
  if(!tracks) res.status(400).json({error:'couldnt get queue'});
  else res.status(200).json(tracks);
})
// resume player 
router.put('/me/player/play',checkAuth,async (req,res)=>{
  const userID = req.user._id;
  const player = User.resumePlaying(userID);
  if(!player) res.status(404).json({error:"couldn't resume playing"});
  else res.status(204).json({success:"resumed playing"})
})
// pause player 
router.put('/me/player/pause',checkAuth,async (req,res)=>{
  const userID = req.user._id;
  const player = User.pausePlaying(userID);
  if(!player) res.status(404).json({error:"couldn't resume playing"});
  else res.status(204).json({success:"paused playing"})
})
//toggle shuffle
router.put('/me/player/shuffle',checkAuth,async (req,res)=>{
  const userID = req.user._id;
  const state =req.query.state
  const isShuffle =await User.setShuffle(state,userID);
  if(!isShuffle) res.status(400).json({error:'can not shuffle '});
  else res.status(200).json({success:'Do successfully'});
})
 
module.exports = router;