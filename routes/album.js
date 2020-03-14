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
router.get('/saveAlbum',checkAuth,async (req,res)=>{
    
    const albumID = req.album_id;
   
    const album = await Album.saveAlbum(albumID);
    if(!album) res.sendStatus(404).json({
        message:"album has been already saved"
    }); //not found
    else res.sendStatus(200).json({
        message:"album has been save suceesfully"
    })

})
router.get('/albums',checkAuth,async (req,res)=>{
    
    const albumIDs = req.ids;
   
    const album = await Album.getAlbums(albumIDs);
    if(!album) res.sendStatus(404).json({
        message:"no albums found"
    }); //not found
    else res.send(album).sendStatus(200);

})
router.get('/albums/:id/tracks',checkAuth,async (req,res)=>{
    
    const albumID = req.params.id;
   
    const tracks = await Album.getAlbums(albumID);
    if(!tracks) res.sendStatus(404).json({
        message:"no tracks found"
    }); //not found
    else res.send(tracks).sendStatus(200);

})

