const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');

// initialize db 
const connection=require('../DBconnection/connection');

const Artist =  {
    

    getArtistById : async function(userId){
        const artist = await artistDocument.find({user:userId},(err,user)=>{
            if(err) return 0;
            return artist;
        });
        
        return artist;
    }
    
    


}

module.exports = Artist;
