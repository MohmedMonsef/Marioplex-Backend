const router = require('express').Router();

const Artist =require('../public-api/Artist-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');
const {content:checkContent} = require('../middlewares/content');
const {isArtist:checkType} = require('../middlewares/check-type');

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
    const artistAlbum = await Artist.createAlbum(artistID,Album);
    if(!artistAlbum) res.status(404); //not found
    else res.status(200).send(artistAlbum); 

});


module.exports = router;