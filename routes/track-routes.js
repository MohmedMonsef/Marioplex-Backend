const router = require('express').Router();
const Track =require('../public-api/track-api');
const User = require('../public-api/user-api');
const Album = require('../public-api/album-api');
const Artist = require('../public-api/artist-api');
const {auth:checkAuth} = require('../middlewares/is-me');
const mongoose = require('mongoose')

router.get('/me/track/:track_id',checkAuth,async (req,res)=>{
    const trackID = req.params.track_id;
   
    const track = await Track.getTrack(trackID);
    if(!track) res.sendStatus(404); //not found
    else res.json(track); 

})

// get track with some user info as like
router.get('/track/:track_id',checkAuth,async (req,res)=>{
    
    const trackID = req.params.track_id;
    const user = await User.getUserById(req.user._id);
    if(!user){ res.status(403).json({"error":"user not allowed"}); return ;}
    const fullTrack = await Track.getFullTrack(trackID,user);
    if(!fullTrack){ res.status(404).json({"error":"track not found"}); return;}
    // if all are found return them in new created json object
    res.json(fullTrack); 

})
// get tracks
router.get('/tracks/',checkAuth,async (req,res)=>{
    if (req.body.ids){
        
        const user = await User.getUserById(req.user._id);
        const trackIDs = req.body.ids.split(',');
        const tracks = await Track.getTracks(trackIDs,user);
        if(tracks.length==0) res.status(404).send({error:"tracks with those id's are not found"});
        else res.json(tracks);
    }
else res.status(404).send({error:"tracks id's are required"});
})
// get track audio feature/analysis
router.get('/track/audio-features/:track_id',checkAuth,async (req,res)=>{
    const audioFeature = await Track.getAudioFeaturesTrack(req.params.track_id);
    if(!audioFeature) res.status(404).send({error:"no track with this id"});
    else res.json(audioFeature);
})

// get tracks audio feature/analysis 
router.get('/tracks/audio-features/',checkAuth,async (req,res)=>{
    if(req.body.ids){
    const trackIDs = req.body.ids.split(',');
    const audioFeatures = await Track.getAudioFeaturesTracks(trackIDs);
    if(!audioFeatures) res.status(404).send({error:"no tracks with this id"});
    else res.json(audioFeatures);
    }
    else  res.status(404).send({error:"tracks id's are required"});
})

// user like track
router.put('/me/like/:track_id',checkAuth,async (req,res)=>{
    
    const userID = req.user._id; // get it from desierialize auth 
    const trackID = req.params.track_id;
    const updatedUser= await  User.likeTrack(userID,trackID);
    // TO DO
    // SEND HTTP CODES AND IMPLEMENT ERROR OBJECT
    if(!updatedUser) res.status(404).send({error:"already liked the song"}); // if user already liked the song
    else res.send({success:"liked the song successfully"});

});

// user unlike track
router.delete('/me/unlike/:track_id',checkAuth,async (req,res)=>{
    const userID = req.user._id; // get it from desierialize auth
    const trackID = req.params.track_id;
    const updatedUser= await User.unlikeTrack(userID,trackID);
    // TO DO
    // SEND HTTP CODES AND IMPLEMENT ERROR OBJECT
    if(!updatedUser) res.status(404).send({error:"user didnt liked the song before"}); // if user already liked the song
    else res.send({success:"unliked the song successfully"});

});

// set android route which will just serve webm media file


router.get('/tracks/android/:track_id',checkAuth,async (req,res)=>{
    let type = req.query.type;// high low medium
    // TO DO : check if premium to allow high
    if(type != "review"){
     if(req.user.product == "free" && type == "high" ) type = "medium"
    // set default quality to medium if not specified

    if(type != "high" || type != "medium" || type != "low" ) type = "medium";
    }
    const trackID  = req.params.track_id;
    const track = await Track.getTrack(trackID);
    if(!track){
        res.status(404).json({"error":"no track found with this id"});
        return 0;
    }
    // get file from gridfs
       gfsTracks.files.findOne({"metadata.trackId":mongoose.Types.ObjectId(trackID),"metadata.type":type},function (err, file) {
        if (err) {res.send(500).send("server error while sending track");return 0;}
        // send range response 
        const range = req.headers.range;
        if(range){
        console.log('range')
        var parts = req.headers['range'].replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];
    
        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : file.length -1;
        var chunksize = (end-start)+1;
       // console.log('Range ',start,'-',end);

        
        res.writeHead(206, {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': file.contentType
        });
     gfsTracks.createReadStream({
            _id:file._id,
            range:{
                startPos: start,
                    endPos: end
            }
        }).pipe(res);
        }else{
            res.header('Content-Length', file.length);
            res.header('Content-Type', file.contentType);

            gfsTracks.createReadStream({
                _id: file._id
            }).pipe(res);
        }
      
       
        });
    
    
   
})


module.exports = router; 