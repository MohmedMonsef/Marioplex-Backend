
const router = require('express').Router();
const Player =require('../public-api/player-api');
const User = require('../public-api/user-api');
const Track = require('../public-api/track-api')
const {auth:checkAuth} = require('../middlewares/is-me');

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
  //console.log(user.queue);
  var currentPlayingTrack = await Track.getFullTrack(player.current_track.trackId,user);
  if(currentPlayingTrack){
    currentPlayingTrack["isPlaylist"]=player.current_track.isPlaylist;
    currentPlayingTrack["playlistId"]=player.current_track.playlistId;
    currentPlayingTrack['isPlayable']=true;
     res.send(currentPlayingTrack);
    }
  else res.status(404).json({error:"track not found"})
})

//get next track playing
router.get('/me/player/next-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  var nextPlayingTrack = await Track.getFullTrack(player.next_track.trackId,user);
  if(nextPlayingTrack){
    nextPlayingTrack["isPlaylist"]=player.next_track.isPlaylist;
    nextPlayingTrack["playlistId"]=player.next_track.playlistId;
    nextPlayingTrack['isPlayable']=false;
     res.send(nextPlayingTrack);
    }

  else res.status(404).json({error:"track not found"})
})

//get prev track playing
router.get('/me/player/prev-playing',checkAuth,async (req,res)=>{
  
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  console.log(user.queue);
  console.log(user.player);
  var prevPlayingTrack = await Track.getFullTrack(player.prev_track.trackId,user);
  if(prevPlayingTrack){
    
    prevPlayingTrack["isPlaylist"]=player.prev_track.isPlaylist;
    prevPlayingTrack["playlistId"]=player.prev_track.playlistId;
    prevPlayingTrack['pisPlayable']=false;
     res.send(prevPlayingTrack);
    }
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
 router.post('/player/add-to-queue/:playlistId/:trackId',checkAuth,async (req,res)=>{
  const trackId =req.params.trackId;
  const addToQueue = await User.addToQueue(req.user._id,trackId,req.query.isPlaylist,req.params.playlistId);
  if( addToQueue == 0) res.status(400).send('can not add queue ! ');
  else res.send('add successfully');

})
// skip to next track 
 router.post('/me/player/next-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  console.log(player.next_track.isPlaylist)
  var nextPlayingTrack = await Track.getFullTrack(player.next_track.trackId,user);
  const skip = await Player.skipNext(user)
  if(skip==2){
    if(nextPlayingTrack){
      nextPlayingTrack["isPlaylist"]=player.next_track.isPlaylist;
      nextPlayingTrack["playlistId"]=player.next_track.playlistId;
      nextPlayingTrack["isPlayable"]=true;
      nextPlayingTrack["fristInSource"]=true;
       res.send(nextPlayingTrack);
    
     
    }
    
    else res.status(404).json({error:'track not found'})
  }
  else{
    if(nextPlayingTrack){
    
      nextPlayingTrack["isPlaylist"]=player.next_track.isPlaylist;
      nextPlayingTrack["playlistId"]=player.next_track.playlistId;
      nextPlayingTrack["isPlayable"]=true;
       res.send(nextPlayingTrack);
      }
    else res.status(404).json({error:'track not found'})
  }
  })
// skip to prev track
router.post('/me/player/prev-playing',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const player = user.player;
  var prevPlayingTrack = await Track.getFullTrack(player.prev_track.trackId,user);
  const skip = await Player.skipPrevious(user);
  if(prevPlayingTrack){
    prevPlayingTrack["isPlaylist"]=player.prev_track.isPlaylist;
    prevPlayingTrack["playlistId"]=player.prev_track.playlistId;
    prevPlayingTrack["isPlayable"]=true;
     res.send(prevPlayingTrack);
    }
  else res.status(404).json({error:'track not found'})
})
// get user queue 
router.get('/me/queue',checkAuth,async (req,res)=>{
  const userID = req.user._id;
  const tracks = await User.getQueue(userID);
  if(!tracks) res.status(400).json({error:'couldnt get queue'});
  else res.status(200).json(tracks);
})
//to repeat
router.put('/player/repeat',checkAuth,async (req,res)=>{
  const userID = req.user._id;
  const repeat = User.repreatPlaylist(userID,req.query.state);
  if(!repeat) res.status(400).json({error:"couldn't repeat playlist"});
  else res.status(200).json({success:"is_repeat playlist: "+req.query.state})
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
// get recent played
router.get('/me/player/recently-played',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const playHistory = await Player.getRecentTracks(user,req.query.limit);
  if(!playHistory)  res.status(400).json({error:'can not get playhistory '});
  else res.status(200).json(playHistory);
})
// add to recent played
// add to recent played
router.put('/me/player/recently-played/:source_id/:track_id',checkAuth,async (req,res)=>{
  const user = await User.getUserById(req.user._id);
  const playHistory = await Player.addRecentTrack(user,req.params.track_id,req.query.sourceType,req.params.source_id);
  if(!playHistory)  res.status(400).json({error:'can not add to playhistory '});
  else res.status(203).json({"success":"added successfully"});
})

module.exports = router;