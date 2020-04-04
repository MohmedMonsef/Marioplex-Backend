const router = require('express').Router();

const search =require('../public-api/search-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');

// get album
router.get('/search',checkAuth,async (req,res)=>{
    
    const name = req.query.name;
    const type = req.query.type.split(',');
    let SearchResult={};
    for(let i=0;i<type.length;i++){
        console.log(type[i]);
    if(type[i]=="top"){
        const artist = await search.getTopResults(name);
        if(artist=={}) SearchResult["top"]=0 //not found
        else SearchResult["top"]=artist 
    }
    else if(type[i]=="track"){
        const artist = await search.getTrack(name);
        if(artist.length==0)SearchResult["track"]=0 //not found
        else SearchResult["track"]=artist 
    }
    else if(type[i]=="album"){
       
        const albums = await search.getAlbum(name,req.query.groups,req.query.country,req.query.limit,req.query.offset);
        if(albums.length==0) SearchResult["album"]=0 //not found
        else SearchResult["album"]=albums  

    }
    else if(type[i]=="artist"){
        const artist = await search.getArtistProfile(name);
        if(artist==0) SearchResult["artist"]=0 //not found
        else SearchResult["artist"]=artist 
        }
    else if(type[i]=="playlist"){
        const playlists = await search.getPlaylist(name);
        if(playlists.length==0) SearchResult["playlist"]=0 //not found
        else SearchResult["playlist"]=playlists   
        
    }
    else if(type[i]=="profile"){
        const profiles = await search.getUserProfile(name);
        if(profiles.length==0) SearchResult["profile"]=0 //not found
        else SearchResult["profile"]=profiles     
    }
    else{
        continue;
    }
}
for(let search in SearchResult){
    if(SearchResult[search]!=0){
        return res.status(200).send(SearchResult);
    }
}
return res.status(404).send("No results found");

})

module.exports = router;