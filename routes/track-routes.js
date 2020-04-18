const router = require('express').Router();
const Track =require('../public-api/track-api');
const User = require('../public-api/user-api');
const jwt=require('jsonwebtoken');
const jwtSecret = require('../config/jwt-key').secret;
const {auth:checkAuth} = require('../middlewares/is-me');

const mongoose = require('mongoose')

router.get('/me/track/:track_id',checkAuth,async (req,res)=>{
    const trackId = req.params.track_id;
   
    const track = await Track.getTrack(trackId);
    if(!track) res.sendStatus(404); //not found
    else res.json(track); 

})

// get track with some user info as like
router.get('/track/:track_id',checkAuth,async (req,res)=>{
    
    const trackId = req.params.track_id;
    const user = await User.getUserById(req.user._id);
    if(!user){ res.status(403).json({"error":"user not allowed"}); return ;}
    const fullTrack = await Track.getFullTrack(trackId,user);
    if(!fullTrack){ res.status(404).json({"error":"track not found"}); return;}
    // if all are found return them in new created json object
    res.json(fullTrack); 

})
// get tracks
router.get('/tracks/',checkAuth,async (req,res)=>{
    if (req.body.ids){
        
        const user = await User.getUserById(req.user._id);
        const trackIds = req.body.ids? req.body.ids.split(','):[];
        const tracks = await Track.getTracks(trackIds,user);
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
    const trackIds = req.body.ids? req.body.ids.split(','):[];
    const audioFeatures = await Track.getAudioFeaturesTracks(trackIds);
    if(!audioFeatures) res.status(404).send({error:"no tracks with this id"});
    else res.json(audioFeatures);
    }
    else  res.status(404).send({error:"tracks id's are required"});
})

// user like track
router.put('/me/like/:track_id',checkAuth,async (req,res)=>{
    
    const userId = req.user._id; // get it from desierialize auth 
    const trackId = req.params.track_id;
    const updatedUser= await  User.likeTrack(userId,trackId);
    if(!updatedUser) res.status(404).send({error:"already liked the song"}); // if user already liked the song
    else res.send({success:"liked the song successfully"});

});

// user unlike track
router.delete('/me/unlike/:track_id',checkAuth,async (req,res)=>{
    const userId = req.user._id; // get it from desierialize auth
    const trackId = req.params.track_id;
    const updatedUser= await User.unlikeTrack(userId,trackId);
    
    if(!updatedUser) res.status(404).send({error:"user didnt liked the song before"}); // if user already liked the song
    else res.send({success:"unliked the song successfully"});

});

// set android route which will just serve webm media file


router.get('/tracks/android/:track_id',checkAuth,async (req,res)=>{
    let type = req.query.type;// high low medium or review
   
    if(type != "review"){
    // if not premium and user asked for high quality then send it as low
     if(req.user.product == "free" && type == "high" ) type = "medium"
    // set default quality to medium if not specified

    if(type != "high" || type != "medium" || type != "low" || type != "review" ) type = "medium";
    }
    const trackId  = req.params.track_id;
    const track = await Track.getTrack(trackId);
    if(!track){
        res.status(404).json({"error":"no track found with this id"});
        return 0;
    }
    // get file from gridfs
       gfsTracks.files.findOne({"metadata.trackId":mongoose.Types.ObjectId(trackId),"metadata.type":type},function (err, file) {
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
            // if doesnt support range then send it sequential using pipe method in nodejs
            res.header('Content-Length', file.length);
            res.header('Content-Type', file.contentType);

            gfsTracks.createReadStream({
                _id: file._id
            }).pipe(res);
        }
      
       
        });
    
    
   
})
// set web player route which will just serve encrypted webm media file
router.get('/tracks/web-player/:track_id',async (req,res)=>{
    let type = req.query.type;// high low medium or review
    // get token as query parameter
    const token=req.query.token;

    if(!token){return res.status(401).send('No Available token');return 0;}

    try{
    const decoded=jwt.verify(token,jwtSecret);
    req.user=decoded;
   
    }
    catch(ex){
    
    return res.status(400).send('Invalid Token');
    }
   
    // if not premium and user asked for high quality then send it as low
     if(req.user.product == "free" && type == "high" ) type = "medium"

    // set default quality to medium if not specified
    if(type != "high" || type != "medium" || type != "low" ) type = "medium";

    const trackId  = req.params.track_id;
    const track = await Track.getTrack(trackId);
    if(!track){
        res.status(404).json({"error":"no track found with this id"});
        return 0;
    }
    // get file from gridfs
       gfsTracks.files.findOne({"metadata.trackId":mongoose.Types.ObjectId(trackId),"metadata.type":type+"_enc"},function (err, file) {
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
            // if doesnt support range then send it sequential using pipe method in nodejs
            res.header('Content-Length', file.length);
            res.header('Content-Type', file.contentType);

            gfsTracks.createReadStream({
                _id: file._id
            }).pipe(res);
        }
      
       
        });
})

// set the route to get the track encryption key to decrypt the track
router.get('/tracks/encryption/:track_id/keys',checkAuth,async (req,res)=>{
    const trackId = req.params.track_id;
    const track = await Track.getTrack(trackId);
    if(!track)res.status(404).send({"error":"not found"});
    else{
        if(!track.key || !track.keyId) res.status(404).send({"error":"not found"});
        else res.status(200).json({"key":track.key,"keyId":track.keyId});
    } 
})

// delete track
router.delete('/tracks/delete/:track_id',checkAuth,async (req,res)=>{
    const userId = req.user._id;
    const trackId = req.params.track_id;
    const deleteTrack = await Track.deleteTrack(userId,trackId);
    if(!deleteTrack) res.status(404).json({"error":"cannot delete track"});
    else res.status(200).json({"success":"deleted track"});
})


module.exports = router; 