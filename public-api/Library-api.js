const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
const spotify=require('../models/db');
const Album=require('./album-api');
const Track=require('./track-api');

 const Library =  {
    
  
    checkSavedAlbums  : async function(AlbumsIDs,UserID){
             let Checks=[];
             let found=false;
            const user = await userDocument.findById(UserID,(err,user)=>{
                if(err) return 0;
                return user;
            }).catch((err)=> 0);
            for (var i=0;i<AlbumsIDs.length;i++){
                found=false;
                for(let Album in user.saveAlbum){
                    if(user.saveAlbum[Album].albumId==AlbumsIDs[i]){
                        Checks.push(true);
                        found=true;
                    }
                }
                if(!found){
                    Checks.push(false);
                }
            }
            return Checks;
    },
    checkSavedTracks  : async function(TracksIDs,UserID){
        let Checks=[];
        let found=false;
       const user = await userDocument.findById(UserID,(err,user)=>{
           if(err) return 0;
           return user;
       }).catch((err)=> 0);
       for (var i=0;i<TracksIDs.length;i++){
           found=false;
           for(let Track in user.like){
               if(user.like[Track].trackId==TracksIDs[i]){
                   Checks.push(true);
                   found=true;
               }
           }
           if(!found){
               Checks.push(false);
           }
       }
       return Checks;
},
    // get  Albums for User
    getSavedAlbums : async function(UserID,limit,offset){
        let Albums=[];
        let user = await userDocument.findById(UserID);
        if(!user)return 0;
        if(!user.saveAlbum.length){return 0;}
    for(let i=0;i<user.saveAlbum.length;i++){
        let album=await Album.getAlbumById(user.saveAlbum[i].albumId);
       if(album) Albums.push(album);
    }
    let start=0;
    let end=(Albums.length>20)?20:Albums.length;
    if(offset!=undefined){
    if(offset>=0&&offset<=Albums.length){
        start=offset;
    }
}
if(limit!=undefined){
    if((start+limit)>0&&(start+limit)<=Albums.length){
        end=start+limit;
    }
}
Albums.slice(start,end);
    return Albums;
},
// get  Albums for User
getSavedTracks : async function(UserID,limit,offset){
    let Tracks=[];
    let user = await userDocument.findById(UserID);
    if(!user)return 0;
    if(!user.like.length){return 0;}
for(let i=0;i<user.like.length;i++){
    let track=await Track.getTrack(user.like[i].trackId);
   if(track) Tracks.push(track);
}
let start=0;
let end=(Tracks.length>20)?20:Tracks.length;
if(offset!=undefined){
if(offset>=0&&offset<=Tracks.length){
    start=offset;
}
}
if(limit!=undefined){
if((start+limit)>0&&(start+limit)<=Tracks.length){
    end=start+limit;
}
}
Tracks.slice(start,end);
return Tracks;
},
}

module.exports = Library;


