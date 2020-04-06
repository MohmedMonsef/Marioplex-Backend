const router = require('express').Router();
const crypto = require('crypto');
const path = require('path');
const Artist =require('../public-api/artist-api');
const Album =require('../public-api/album-api');
const Track =require('../public-api/track-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/is-me');
const {content:checkContent} = require('../middlewares/content');
const {isArtist:checkType} = require('../middlewares/check-type');
const {upload:uploadTrack} = require('../middlewares/upload-tracks');

// get Artist
router.get('/Artists/:artist_id', checkAuth, async(req, res) => {
    const artistID = req.params.artist_id;
    const artist = await Artist.getArtist(artistID);
    if (!artist) return res.status(404).send(""); //not found
    else return res.status(200).send(artist);

});

// get Artists
router.get('/Artists', [checkAuth], async(req, res) => {
    const artistsIDs = req.query.artists_ids.split(',');
    const artists = await Artist.getArtists(artistsIDs);
    if (artists.length == 0) return res.status(404).send({ error: "artists with those id's are not found" });
    else return res.status(200).json(artists);
});

// get Albums
router.get('/Artists/:artist_id/Albums', [checkAuth], async(req, res) => {

    const albums = await Artist.getAlbums(req.params.artist_id, req.query.groups, req.query.country, req.query.limit, req.query.offset);
    if (albums.length == 0 || albums == 0) return res.status(404).send({ error: "albums with those specifications are not found" });
    else return res.status(200).json(albums);
});
//get Tracks
router.get('/Artists/:artist_id/Tracks', [checkAuth], async(req, res) => {

    const tracks = await Artist.getTracks(req.params.artist_id);
    if (tracks.length == 0 || tracks == 0) return res.status(404).send({ error: "tracks are not found" });
    else return res.status(200).json(tracks);
});
// get RelatedArtists
router.get('/Artists/:artist_id/related_artists', [checkAuth], async(req, res) => {

    const artists = await Artist.getRelatedArtists(req.params.artist_id);
    if (artists.length == 0 || artists == 0) return res.status(404).send({ error: "no artists are found" });
    else return res.status(200).json(artists);
});

// get Top Tracks
router.get('/Artists/:artist_id/top-tracks', [checkAuth], async(req, res) => {

    const tracks = await Artist.getTopTracks(req.params.artist_id, req.query.country);
    if (tracks.length == 0 || tracks == 0) return res.status(404).send({ error: "no top tracks in this country are not found" });
    else return res.status(200).json(tracks);
});
// create album
router.put('/Artists/me/Albums',[checkAuth,checkType,checkContent],async (req,res)=>{
   const artist =await Artist.findMeAsArtist(req.user._id);
    const artistAlbum = await Artist.addAlbum(artist._id,req.body.name,req.body.label,req.body.availablemarkets,req.body.albumtype,req.body.releaseDate,req.body.genre);
    if(!artistAlbum) return res.status(404).send(" "); //not found
    else return res.status(200).send(artistAlbum); 
});

// upload tracks
router.post('/artists/me/albums/:album_id/tracks',checkAuth,checkType,async (req,res)=>{

    // only artist upload songs
    const artist =await Artist.findMeAsArtist(req.user._id);
    if(!artist){  res.status(403).json({"error":"not an artist"});return 0;};
    if (await  Artist.checkArtisthasAlbum(artist._id,req.params.album_id)){
    // encrypt file name and send it to request to multer
   let filename =  crypto.randomBytes(16,async  (err, buf) => {
                        if (err) {
                        return 0;
                        }
                    
                    
                        return filename = buf.toString('hex') + path.extname(req.query.name);
        });
    let availableMarkets = req.query.availableMarkets ? req.query.availableMarkets.split(","):[];
    const track = await Track.createTrack(filename,req.query.name,req.query.trackNumber,availableMarkets,req.user._id,req.params.album_id,req.query.duration);
    await Artist.addTrack(artist._id,track._id);
    req.trackID = track._id;    
    req.filename = filename;
    
   await uploadTrack.fields([{name:"high"},{name:"medium"},{name:"low"},{name:"review"}])(req,res,(err)=>{
      if(err){ 
          res.status(403).json({"error":err.error});
          return 0;
    }else{
        //console.log("ff",req.files);
        res.status(200).json({"success":"uploaded succesfully"});
    }
    });
    

    }else{
      res.status(403).json({"error":"artist doesnt own the album"})
    }
    
 
 
})



router.post('/me/ToArtist', [checkAuth], async(req, res) => {
    if (req.body.genre) {
        let genre = req.body.genre.split(',');
        let isartist = await User.promoteToArtist(req.user._id, req.body.info, req.body.name, genre);
        if (!isartist) { return res.status(403).send("sorry you can't be an Artist"); }
        return res.status(200).send("Artist Succeded");
    } else return res.status(403).send("should give me genre");

});


module.exports = router;