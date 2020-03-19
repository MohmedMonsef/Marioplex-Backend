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
                    if(Album.albumId==AlbumsIDs[i]){
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

   
}

module.exports = Library;


