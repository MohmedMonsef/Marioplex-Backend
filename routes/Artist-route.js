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
    if(!artist) return res.status(404); //not found
    else return res.status(200).send(artist); 

});

// get Artists
router.get('/me/Artists',[checkAuth],async (req,res)=>{
    console.log("sasa");
    const artistsIDs = req.query.artists_ids.split(',');
    console.log(artistsIDs);
    const artists = await Artist.getArtists(artistsIDs);
    if(!artists) return res.status(404).send({error:"artists with those id's are not found"});
    else return res.status(200).json(artists);
});

// get Albums
router.get('/Artists/:artist_id/Albums',[checkAuth],async (req,res)=>{

    const albums = await Artist.getAlbums(req.params.artist_id,req.query.groups,req.query.country,req.query.limit,req.query.offset);
    if(albums.length==0) return res.status(404).send({error:"albums with those specifications are not found"});
    else return res.status(200).json(albums);
});
//get Tracks
router.get('/Artists/:artist_id/Tracks',[checkAuth],async (req,res)=>{

    const tracks = await Artist.getTracks(req.params.artist_id);
    if(tracks.length==0) return res.status(404).send({error:"tracks are not found"});
    else return res.status(200).json(tracks);
});
// get RelatedArtists
router.get('/Artists/:artist_id/related_artists',[checkAuth],async (req,res)=>{

    const artists = await Artist.getRelatedArtists(req.params.artist_id);
    if(artists.length==0) return res.status(404).send({error:"no artists are found"});
    else return res.status(200).json(artists);
});

// get Top Tracks
router.get('/Artists/:artist_id/toptracks',[checkAuth],async (req,res)=>{

    const tracks = await Artist.getTopTracks(req.params.artist_id,req.query.country);
    if(tracks.length==0) return res.status(404).send({error:"no top tracks in this country are not found"});
    else return res.status(200).json(tracks);
});

router.put('/Artists/:artist_id/Albums',[checkAuth,checkType,checkContent],async (req,res)=>{
    const artistID=req.params.artist_id;
    const artistAlbum = await Artist.addAlbum(artistID,req.body.Name,req.body.Label,req.body.Availablemarkets,req.body.Albumtype,req.body.ReleaseDate,req.body.Genre);
    if(!artistAlbum) return res.status(404); //not found
    else return res.status(200).send(artistAlbum); 

});

router.put('/Artists/:artist_id/Albums/:album_id/tracks',[checkAuth,checkType,checkContent,uploadTrack.single('file')],async (req,res)=>{
// create track its external id=req.file.id
//add rest info to the track
console.log(req.file);
let track=await Track.createTrack(req.file.id,req.body.name,req.body.TrackNum,req.body.availableMarkets,req.params.artist_id,req.params.album_id);
await Album.addTrack(req.params.album_id,track);
await Artist.addTrack(req.params.artist_id,track._id);
return res.status(200).send(track);
});

router.post('/me/ToArtist',[checkAuth],async (req,res)=>{
   let genre=req.body.genre.split(',');
    let isartist=await User.promoteToArtist(req.user._id,req.body.info,req.body.Name,genre);
    if(!isartist){return res.status(403).send("sorry you can't be an Artist");}
    return res.status(200).send("Artist Succeded");
    });
module.exports = router;