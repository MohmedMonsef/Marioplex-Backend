const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');


// initialize db 
const connection = require('../db-connection/connection');
const User = require('./user-api');
const Playlist = require('./playlist-api');
const checkMonooseObjectID = require('../validation/mongoose-objectid')
const Browse = {

    //get category by id
    getCategoryById: async function(categoryID) {
        if(!checkMonooseObjectID([categoryID])) return 0;
        let category = await categoryDocument.findById(categoryID, (err, category) => {
            if (err) return 0;
            return category;
        }).catch((err) => 0);
        return category;

    },
    getCategoryPlaylists: async function(categoryID) {
        let category = await this.getCategoryById(categoryID);
        if(!category) return 0;
        let playlists = []
       for(let i=0; i<category.playlist.length;i++) {
           let playlist= await Playlist.getPlaylist(category.playlist[i]);
           if(playlist){
               let playlistInfo={};
               playlistInfo['_id']=playlist._id;
               playlistInfo['name']=playlist.name;
               playlistInfo['images']=playlist.images;
               let owner= await User.getUserById(playlist.ownerId);
               if(owner){
                playlistInfo['ownerId']=owner._id;
                playlistInfo['ownerName']=owner.displayName;
               }
               playlists.push(playlistInfo);
           }
       }
       return playlists;
    },
    
    // get categories
    getCategoryies: async function() {

        let category = await categoryDocument.find({}, (err, category) => {
            if (err) return 0;
            return category;
        }).catch((err) => 0);
        return category;

    }
}
module.exports = Browse;