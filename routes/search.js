const router = require('express').Router();

const search =require('../public-api/search-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');

// get album
router.get('/search',checkAuth,async (req,res)=>{
    
    const name = req.query.name;
    const type = req.query.type;
    
    if(type=="top"){
        const artist = await search.getTopResults(name);
        if(artist=={}) res.sendStatus(404); //not found
        else res.send(artist); 
    }
    else if(type=="track"){
        const artist = await search.getTrack(name);
        if(artist=={})res.sendStatus(404);  //not found
        else res.send(artist);
    }
    else if(type=="album"){
        const albums = await search.getAlbum(name,req.query.groups,req.query.country,req.query.limit,req.query.offset);
        if(albums=={}) res.sendStatus(404); //not found
        else res.send(albums);  

    }
    else if(type=="artist"){
        const artist = await search.getArtistProfile(name);
        if(artist==0) res.send({}) //not found
        else res.send(artist); 
        }
    else if(type=="playlist"){
        const playlists = await search.getPlaylist(name);
        if(playlists=={}) res.sendStatus(404); //not found
        else res.send(playlists);   
        
    }
    else if(type=="profile"){
        const profiles = await search.getUserProfile(name);
        if(profiles.length==0) res.send({}); //not found
        else res.send(profiles);    
    }
})

module.exports = router;