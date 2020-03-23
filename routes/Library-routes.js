const router = require('express').Router();

const Artist =require('../public-api/Artist-api');
const Library =require('../public-api/Library-api');
const Track =require('../public-api/track-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');
const {content:checkContent} = require('../middlewares/content');
const {isArtist:checkType} = require('../middlewares/check-type');
const {upload:uploadTrack} = require('../middlewares/upload');


router.get('me/albums/contains',checkAuth,async (req,res)=>{

    const userID = req.user._id;
    const albumsIDs = req.query.albums_ids.split(',');
    const checks=Library.checkSavedAlbums(albumsIDs,userID);
    if(!checks) res.status(404); //not found
    else res.status(200).send(checks); 

});





module.exports = router;