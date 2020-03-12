const router = require('express').Router();
const TrackClass = require('../public-api/track-api');
const Track = new TrackClass();


// get track
router.get('/track/:track_id',async (req,res)=>{
    
    const trackID = req.params.track_id;
   
    const track = await Track.getTrack(trackID);
    if(!track) res.sendStatus(404); //not found
    else res.send(track); 

})

// user like track
router.put('/me/like/:track_id',(req,res)=>{
    const userID = ""; // get it from desierialize auth 
    const trackID = req.params.track_id;
    const updatedUser=  Track.likeTrack();
    // TO DO
    // SEND HTTP CODES AND IMPLEMENT ERROR OBJECT
    if(!updatedUser) res.send({error:"already liked the song"}); // if user already liked the song
    else res.send({success:"liked the song successfully"});

});

// user unlike track
router.delete('/me/unlike/:track_id',(req,res)=>{
    const userID = ""; // get it from desierialize auth
    const trackID = req.params.track_id;
    const updatedUser= Track.likeTrack();
    // TO DO
    // SEND HTTP CODES AND IMPLEMENT ERROR OBJECT
    if(!updatedUser) res.send({error:"user didnt liked the song before"}); // if user already liked the song
    else res.send({success:"unliked the song successfully"});

});



module.exports = router;