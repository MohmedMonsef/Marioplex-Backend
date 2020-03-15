const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');



 const Artist =  {
    
    // get artist by id
    // params : artist-id
    getArtist  : async function(ArtistID){
                    
            const artist = await artistDocument.findById(ArtistID,(err,artist)=>{
                if(err) return 0;
                return artist;
            }).catch((err)=> 0);
            return artist;
    },

    // create album for an artist
    // params : artist-id
    addAlbum  : async function(ArtistID,Album){
        let album=new albumDocument(Album); 
        await album.save();   
        console.log(album);        
        const artist = await artistDocument.findById(ArtistID);
        artist.addAlbums.push({
            albumId:album._id
        });
       await artist.save();
         return album;
},
   // create album for an artist
    // params : artist-id
    addTrack  : async function(ArtistID,trackid){   
        const artist = await artistDocument.findById(ArtistID);
        artist.addTracks.push({
            trackId:trackid
        });
       await artist.save();
         
}
}

module.exports = Artist;


