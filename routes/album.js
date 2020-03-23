const router = require('express').Router();

const Album =require('../public-api/album-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');

// get album
router.get('/albums/:album_id',checkAuth,async (req,res)=>{
    
    const albumID = req.params.album_id;
   
    const album = await Album.getAlbumById(albumID);
    if(!album) res.sendStatus(404); //not found
    else res.send(album); 

})
router.delete('/me/albums',checkAuth,async (req,res)=>{
    
    const albumID = req.body.ids;
    const userID= req.user._id;
    const user= await User.getUserById(userID);
    if(!user) res.status(403);
    else{
        const album = await Album.unsaveAlbum(user,albumID);
        if(!album) res.status(404).json({
            message:"album hasn't been saved before"

        }); //not found
        else res.status(200).json({
            message:"album has been unsaved suceesfully"
        })
    }
    
})

router.put('/me/Albums',checkAuth,async (req,res)=>{
    
    const albumID = req.body.ids;
    const userID= req.user._id;
    const user= await User.getUserById(userID);
    if(!user) res.status(403);
    else{
        const album = await Album.saveAlbum(user,albumID);
        if(!album) res.status(404).json({
            message:"album has been already saved"
        }); //not found
        else res.status(200).json({
        message:"album has been save suceesfully"
        })
    }
    
})
router.get('/albums',checkAuth,async (req,res)=>{
    
    var albumIDs = req.body.ids;
   
    album = await Album.getAlbums(albumIDs);
    if(!album) res.status(404).json({
        message:"no albums found"
    }); //not found
    else res.status(200).send(album);

})
router.get('/albums/:id/tracks',checkAuth,async (req,res)=>{
    
    const albumID = req.params.id;
   
    const tracks = await Album.getTracksAlbum(albumID);
    if(!tracks) {
        res.status(404).json({
            message:"no tracks found"
        });
        } //not found
    else {
        res.status(200).json({tracks});
    }

})

module.exports=router;
