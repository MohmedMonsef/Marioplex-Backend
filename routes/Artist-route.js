const router = require('express').Router();

const Artist =require('../public-api/Artist-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');

// get Artist
router.get('/Artists/:artist_id',checkAuth,async (req,res)=>{
    
    const artistID = req.params.artist_id;
    const artist = await Artist.getArtist(artistID);
    if(!artist) res.status(404); //not found
    else res.status(200).send(artist); 

});




module.exports = router;