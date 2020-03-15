const router = require('express').Router();

const Artist =require('../public-api/Artist-api');
const Album =require('../public-api/album-api');
const Track =require('../public-api/track-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');
const {content:checkContent} = require('../middlewares/content');
const {isArtist:checkType} = require('../middlewares/check-type');
const {upload:uploadTrack} = require('../middlewares/upload');

// get Artist
router.get('/Artists/:artist_id',checkAuth,async (req,res)=>{

    const artistID = req.params.artist_id;
    const artist = await Artist.getArtist(artistID);
    if(!artist) res.status(404); //not found
    else res.status(200).send(artist); 

});

router.put('/Artists/:artist_id/Albums',[checkAuth,checkType,checkContent],async (req,res)=>{
    const Album = req.body.Album;
    const artistID=req.params.artist_id;
    const artistAlbum = await Artist.addAlbum(artistID,Album);
    if(!artistAlbum) res.status(404); //not found
    else res.status(200).send(artistAlbum); 

});

router.put('/Artists/:artist_id/Albums/:album_id/tracks',[checkAuth,checkType,uploadTrack.single('file')],async (req,res)=>{
// create track its external id=req.file.id
//add rest info to the track
let track=await Track.createTrack(req.file.id,req.body.name,req.body.TrackNum,req.body.availableMarkets);
await Album.addTrack(req.params.album_id,track);
await Artist.addTrack(req.params.artist_id,track._id);
res.status(200).send("Track saved");
});


module.exports = router;