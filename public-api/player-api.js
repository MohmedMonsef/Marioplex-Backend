const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
const Playlist = require('./playlist-api')

const Player = {
    // update user player object each time he plays new track
    setPlayerInstance: async function(user,isPlaylist,id,trackID){
        // if the new track the user is playing from a plylist then get track and get it's previus and next from the playlist
        if(isPlaylist){
            // get playlist
            const playlist = await Playlist.getPlaylist(id);
            if(!playlist) return 0; // no playlist was found
            // get next track in playlist by checking for id greater than track id
            const nextTrack = await  playlist.find({_id: {$gt: trackID}}).sort({_id: 1 }).limit(1);
            // get ptevious track in playlist 
            const prevTrack = await  playlist.find({_id: {$lt: trackID}}).sort({_id: 1 }).limit(1);
            // update user player info 
            user.player["next_track"] = nextTrack._id;
            user.player["prev_track"] = prevTrack._id;
            user.player["current_track"] = trackID;
            await user.save();


        }else{
            // the track is from album 
            // TODO implement album
        }
            
    }
}


module.exports = Player;